<!--
 * @Author      : Mr.bin
 * @Date        : 2023-06-21 21:04:31
 * @LastEditTime: 2023-07-03 11:41:20
 * @Description : 静态平衡训练-具体测量
-->
<template>
  <div class="static-equilibrium-measure">
    <!-- 语音播放 -->
    <audio ref="audio" controls="controls" hidden :src="audioSrc" />

    <div class="wrapper">
      <div class="main">
        <div class="left">
          <div class="title">静态平衡训练</div>
          <div class="text">
            请双腿平稳站立在平台中心上，保持指定的动作，并维持重心在绿圈范围内。
          </div>
        </div>

        <div class="content">
          <div class="chart">
            <div id="chart" :style="{ width: '100%', height: '100%' }"></div>
          </div>
        </div>

        <div class="right">
          <div class="trainPosture">训练姿势：{{ trainPosture }}</div>
          <div class="coefficient">晃动系数：{{ coefficient }}</div>
          <div class="num">训练组数：{{ nowNum }} /{{ num }}</div>
          <div class="count-down">
            <el-image class="img" :src="timeBgSrc" fit="scale-down"></el-image>
            <div class="text">倒计时</div>
            <div class="value">{{ nowTrainTime }}</div>
          </div>
        </div>
      </div>

      <div class="btn">
        <el-button
          class="item"
          type="primary"
          @click="handleStart"
          :disabled="isStart"
          >开始训练</el-button
        >
        <el-button class="item" type="info" @click="handleRefresh"
          >刷新页面</el-button
        >
        <el-button class="item" type="danger" round @click="handleExit"
          >退出订单</el-button
        >
      </div>

      <el-dialog
        title="休息倒计时"
        :visible.sync="dialogVisible"
        width="16%"
        top="32vh"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :show-close="false"
        :center="true"
      >
        <div class="dialog-value">
          {{ nowRestTime }}
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
/* 路径模块 */
import path from 'path'

/* 串口通信库 */
import SerialPort from 'serialport'
import Readline from '@serialport/parser-readline'

/* 计算圆的相关参数 */
import { setCircle } from '@/utils/setCircle.js'

export default {
  name: 'static-equilibrium-measure',

  data() {
    return {
      /* 语音相关 */
      audioOpen: this.$store.state.voiceSwitch,
      audioSrc: path.join(__static, `narrate/mandarin/Train/静态平衡训练.mp3`),

      timeBgSrc: require('@/assets/img/Train/Static_Equilibrium/Measure/倒计时背景.png'), // 倒计时背景

      /* 串口相关变量 */
      usbPort: null,
      parser: null,
      scmBaudRate: 115200, // 默认波特率115200

      /* 图形相关变量 */
      myChart: null,
      option: {},

      /* 控制相关 */
      isStart: false, // 是否开始训练
      isRest: false, // 是否处于休息状态
      dialogVisible: false, // 休息倒计时弹窗

      /* 其他 */
      side: this.$store.state.settings[0].side, // 患侧
      trainPosture: this.$store.state.settings[0].trainPostureStatic, // 训练姿势
      coefficient: this.$store.state.settings[0].coefficient, // 晃动系数
      num: this.$store.state.settings[0].num, // 组数
      nowNum: 0, // 实时组数
      trainTimeClock: null, // 训练计时器
      trainTime: this.$store.state.settings[0].trainTime, // 倒计时（训练时长）
      nowTrainTime: this.$store.state.settings[0].trainTime, // 实时训练倒计时
      restTimeClock: null, // 休息计时器
      restTime: this.$store.state.settings[0].restTime, // 休息时长
      nowRestTime: this.$store.state.settings[0].restTime, // 实时休息倒计时

      maxAction: parseInt(window.localStorage.getItem('maxAction')),

      dx: 0, // 相对x轴位移
      dy: 0, // 相对y轴位移

      showTrajectoryArray: [], // 每一组展示的轨迹数组
      trajectoryArray: [] // 完整的轨迹数组
    }
  },

  created() {
    this.initSerialPort()
  },
  mounted() {
    if (this.audioOpen === true) {
      setTimeout(() => {
        this.$refs.audio.currentTime = 0
        this.$refs.audio.play()
      }, 500)
    }

    this.initChart()
  },
  beforeDestroy() {
    // 清除训练计时器
    if (this.trainTimeClock) {
      clearInterval(this.trainTimeClock)
    }
    // 清除休息计时器
    if (this.restTimeClock) {
      clearInterval(this.restTimeClock)
    }
    // 关闭串口
    if (this.usbPort) {
      if (this.usbPort.isOpen) {
        this.usbPort.close()
      }
    }
  },

  methods: {
    /**
     * @description: 退出订单
     */
    handleExit() {
      this.$confirm(
        '订单进行中，此操作会退出该订单，之前的数据将会丢失，是否退出？',
        '警告',
        {
          type: 'warning',
          showClose: true,
          closeOnClickModal: true,
          closeOnPressEscape: true,
          center: true,
          confirmButtonText: '退 出',
          cancelButtonText: '否'
        }
      )
        .then(() => {
          this.$router.push({
            path: '/home'
          })
        })
        .catch(() => {})
    },

    /**
     * @description: 初始化串口对象
     */
    initSerialPort() {
      SerialPort.list()
        .then(ports => {
          /* 遍历设备的USB串口，目标设备需安装驱动 */
          let comPath = ''
          for (const port of ports) {
            if (/^USB/.test(port.pnpId)) {
              comPath = port.path
              break
            }
          }

          /* 验证USB有没有连接到电脑，但不能验证有无数据发送给上位机 */
          if (comPath) {
            /**
             * @description: 创建串口实例
             * @param {String} comPath 串行端口的系统路径。例如：在Mac、Linux上的/dev/tty.XXX或Windows上的COM1
             * @param {Object} 配置项
             */
            this.usbPort = new SerialPort(comPath, {
              baudRate: this.scmBaudRate,
              autoOpen: false // 是否自动开启串口
            })
            /* 调用 this.usbPort.open() 成功时触发（开启串口成功） */
            this.usbPort.on('open', () => {
              this.isStart = true
              this.trainTimeClock = setInterval(() => {
                this.nowTrainTime -= 1
                if (this.nowTrainTime <= 0) {
                  this.nowTrainTime = 0
                }
              }, 1000)
            })
            /* 调用 this.usbPort.open() 失败时触发（开启串口失败） */
            this.usbPort.on('error', () => {
              this.$alert(
                `请重新连接USB线，然后点击"刷新页面"按钮，重新训练！`,
                '串口开启失败',
                {
                  type: 'error',
                  showClose: false,
                  center: true,
                  confirmButtonText: '刷新页面',
                  callback: () => {
                    this.handleRefresh()
                  }
                }
              )
            })

            this.parser = this.usbPort.pipe(new Readline({ delimiter: '\n' }))
            this.parser.on('data', data => {
              const dataArray = data.split(',')
              const x = parseInt(dataArray[0])
              const y = parseInt(dataArray[1])

              this.dx = parseInt(x - this.$store.state.zeroStandard.xStandard)
              this.dy = parseInt(this.$store.state.zeroStandard.yStandard - y)

              if (!isNaN(this.dx) && !isNaN(this.dy)) {
                // 休息时间到
                if (this.isRest === false) {
                  this.showTrajectoryArray.push([this.dx, this.dy])
                  this.trajectoryArray.push([this.dx, this.dy])

                  // 渲染图形
                  this.option.series[0].data = this.showTrajectoryArray
                  this.myChart.setOption(this.option)
                }

                // 完成一组
                if (
                  this.showTrajectoryArray.length ===
                  parseInt(this.trainTime * 10)
                ) {
                  this.showTrajectoryArray = []

                  this.nowNum += 1

                  if (this.trainTimeClock) {
                    clearInterval(this.trainTimeClock)
                  }

                  if (this.nowNum === this.num) {
                    // 完成训练
                    this.finishData()
                  } else {
                    this.nowRestTime = this.restTime
                    this.dialogVisible = true
                    this.isRest = true
                    this.restTimeClock = setInterval(() => {
                      this.nowRestTime -= 1
                      if (this.nowRestTime === 0) {
                        this.dialogVisible = false
                        if (this.restTimeClock) {
                          clearInterval(this.restTimeClock)
                        }

                        this.isRest = false
                        this.nowTrainTime = this.trainTime
                        this.trainTimeClock = setInterval(() => {
                          this.nowTrainTime -= 1
                          if (this.nowTrainTime <= 0) {
                            this.nowTrainTime = 0
                          }
                        }, 1000)
                      }
                    }, 1000)
                  }
                }
              }
            })
          } else {
            this.$getLogger('没有检测到USB连接')
            this.$alert(
              `请重新连接USB线，然后点击"刷新页面"按钮！`,
              '没有检测到USB连接',
              {
                type: 'error',
                showClose: false,
                center: true,
                confirmButtonText: '刷新页面',
                callback: () => {
                  this.handleRefresh()
                }
              }
            )
          }
        })
        .catch(err => {
          this.$getLogger(err)
          this.$alert(
            `${err}。请重新连接USB线，然后点击"刷新页面"按钮！`,
            '初始化SerialPort.list失败',
            {
              type: 'error',
              showClose: false,
              center: true,
              confirmButtonText: '刷新页面',
              callback: () => {
                this.handleRefresh()
              }
            }
          )
        })
    },

    /**
     * @description: 初始化echarts图形
     */
    initChart() {
      /* 相关计算 */
      const boundary = this.maxAction + parseInt(this.maxAction * 0.2) // 方形
      const oneR = parseFloat((this.maxAction * 0.15).toFixed(1)) // 绿色圆半径
      const twoR = parseFloat((this.maxAction * 0.3).toFixed(1)) // 黄色圆半径
      const threeR = this.maxAction // 红色圆半径
      const oneRound = setCircle(0, 0, oneR) // 绿色圆数组
      const twoRound = setCircle(0, 0, twoR) // 黄色圆数组
      const threeRound = setCircle(0, 0, threeR) // 红色圆数组

      this.myChart = this.$echarts.init(
        document.getElementById('chart'),
        'light',
        {
          renderer: 'canvas'
        }
      )
      this.option = {
        xAxis: {
          type: 'value',
          min: -boundary,
          max: boundary,
          axisLabel: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          min: -boundary,
          max: boundary,
          axisLabel: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: false
          }
        },
        series: [
          // 移动轨迹
          {
            type: 'line',
            name: '移动轨迹',
            data: [],
            color: 'black',
            smooth: false,
            showSymbol: false
          },
          // 边界
          {
            type: 'line',
            name: '边界',
            data: [
              [-boundary, boundary],
              [boundary, boundary],
              [boundary, -boundary],
              [-boundary, -boundary],
              [-boundary, boundary]
            ],
            color: 'rgba(0, 0, 0, 1)',
            lineStyle: {
              width: 2
            },
            smooth: false,
            showSymbol: false
          },
          // 绿色圆
          {
            type: 'line',
            name: '绿色圆',
            data: oneRound,
            color: 'rgba(0, 255, 0, 0.7)',
            lineStyle: {
              width: 4
            },
            smooth: true,
            showSymbol: false
          },
          // 黄色圆
          {
            type: 'line',
            name: '黄色圆',
            data: twoRound,
            color: 'rgba(255, 255, 0, 0.7)',
            lineStyle: {
              width: 4
            },
            smooth: true,
            showSymbol: false
          },
          // 红色圆
          {
            type: 'line',
            name: '红色圆',
            data: threeRound,
            color: 'rgba(255, 0, 0, 0.7)',
            lineStyle: {
              width: 4
            },
            smooth: true,
            showSymbol: false
          }
        ],
        animation: false
      }
      this.myChart.setOption(this.option)
    },

    /**
     * @description: 开始按钮
     */
    handleStart() {
      if (this.usbPort) {
        if (!this.usbPort.isOpen) {
          this.usbPort.open()
        }
      }
    },

    /**
     * @description: 完成该项目
     */
    finishData() {
      // 关闭串口
      if (this.usbPort) {
        if (this.usbPort.isOpen) {
          this.usbPort.close()
        }
      }

      // 清除训练计时器
      if (this.trainTimeClock) {
        clearInterval(this.trainTimeClock)
      }

      // 清除休息计时器
      if (this.restTimeClock) {
        clearInterval(this.restTimeClock)
      }

      /* 删除 Vuex 参数配置数组的第一个元素 */
      let settings = JSON.parse(JSON.stringify(this.$store.state.settings))
      settings.shift()
      this.$store.dispatch('setSettings', settings).then(() => {
        // 完成该次训练时的岁数
        const currentAge = this.$moment().diff(
          this.$store.state.currentUserInfo.birthday,
          'years'
        )
        /* 数据 */
        // 计算颜色占比
        const greenArray = []
        const yellowArray = []
        const redArray = []
        const greenRound = parseFloat((this.maxAction * 0.15).toFixed(1)) // 绿圈的位置
        const yellowRound = parseFloat((this.maxAction * 0.3).toFixed(1)) // 黄圈的位置
        let l = 0
        for (let i = 0; i < this.trajectoryArray.length; i++) {
          const itemArrray = this.trajectoryArray[i]
          l = Math.sqrt(Math.pow(itemArrray[0], 2) + Math.pow(itemArrray[1], 2))
          if (l <= greenRound) {
            greenArray.push(1)
          } else if (l > greenRound && l <= yellowRound) {
            yellowArray.push(1)
          } else {
            redArray.push(1)
          }
        }
        const greenRate = parseFloat(
          ((greenArray.length / this.trajectoryArray.length) * 100).toFixed(1)
        )
        const yellowRate = parseFloat(
          ((yellowArray.length / this.trajectoryArray.length) * 100).toFixed(1)
        )
        const redRate = parseFloat(
          ((redArray.length / this.trajectoryArray.length) * 100).toFixed(1)
        )
        // 计算背景图
        const boundary = this.maxAction + parseInt(this.maxAction * 0.2) // 方形
        const oneR = parseFloat((this.maxAction * 0.15).toFixed(1)) // 绿色圆半径
        const twoR = parseFloat((this.maxAction * 0.3).toFixed(1)) // 黄色圆半径
        const threeR = this.maxAction // 红色圆半径
        const oneRound = setCircle(0, 0, oneR) // 绿色圆数组
        const twoRound = setCircle(0, 0, twoR) // 黄色圆数组
        const threeRound = setCircle(0, 0, threeR) // 红色圆数组

        const obj = {
          pattern: '静态平衡训练',
          side: this.side, // 患侧
          currentAge: currentAge, // 完成该次训练时的岁数
          trainPosture: this.trainPosture, // 训练姿势
          coefficient: this.coefficient, // 晃动系数
          num: this.num, // 训练组数
          trainTime: this.trainTime, // 训练时长
          restTime: this.restTime, // 休息时长
          trajectoryArray: this.trajectoryArray, // 完整的轨迹数组
          greenRate: greenRate, // 绿色占比
          yellowRate: yellowRate, // 黄色占比
          redRate: redRate, // 红色占比
          boundary: boundary, // 方形
          oneRound: oneRound, // 绿色圆数组
          twoRound: twoRound, // 黄色圆数组
          threeRound: threeRound // 红色圆数组
        }

        /* 暂存至 sessionStorage */
        let resultArray = JSON.parse(
          window.sessionStorage.getItem('resultArray')
        )
        resultArray.push(obj)
        window.sessionStorage.setItem(
          'resultArray',
          JSON.stringify(resultArray)
        )

        if (this.$store.state.settings.length) {
          this.$alert(`请点击“下一项”按钮`, '完成', {
            type: 'success',
            showClose: false,
            center: true,
            confirmButtonText: '下一项',
            callback: () => {
              this.handleFinish()
            }
          })
        } else {
          this.$alert(`请点击“完成订单”按钮`, '完成', {
            type: 'success',
            showClose: false,
            center: true,
            confirmButtonText: '完成订单',
            callback: () => {
              this.handleFinish()
            }
          })
        }
      })
    },

    /**
     * @description: 完成订单或者下一项
     */
    handleFinish() {
      if (this.$store.state.settings.length) {
        // 下一项
        let route = ''
        switch (this.$store.state.settings[0].pattern) {
          case '静态平衡训练':
            route = 'static-equilibrium-measure'
            break
          case '动态平衡训练':
            route = 'dynamic-equilibrium-measure'
            break
          default:
            break
        }

        this.$router.push({
          path: '/' + route
        })
      } else {
        // 完成订单
        this.$router.push({
          path: '/train-send'
        })
      }
    },

    /**
     * @description: 刷新页面按钮
     */
    handleRefresh() {
      this.$router.push({
        path: '/refresh',
        query: {
          routerName: JSON.stringify('/static-equilibrium-measure'),
          duration: JSON.stringify(300)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.static-equilibrium-measure {
  width: 100%;
  height: 100%;
  @include flex(row, center, center);

  .wrapper {
    width: 86%;
    height: 90%;
    border-radius: 34px;
    background-color: #ffffff;
    box-shadow: 0 0 10px #929292;
    padding: 26px 40px;
    @include flex(column, stretch, stretch);

    .main {
      flex: 1;
      @include flex(row, space-around, stretch);

      .left {
        width: 30%;
        .title {
          font-weight: 700;
          font-size: 50px;
          color: green;
        }
        .text {
          font-size: 24px;
          margin-top: 20px;
          line-height: 2em;
        }
      }

      .content {
        flex: 1;
        @include flex(row, center, center);
        .chart {
          width: 530px;
          height: 550px;
        }
      }

      .right {
        width: 30%;
        @include flex(column, stretch, stretch);

        .trainPosture {
          margin-top: 30px;
          font-size: 24px;
          margin-bottom: 50px;
        }

        .coefficient {
          font-size: 24px;
          margin-bottom: 50px;
        }

        .num {
          font-size: 24px;
          margin-bottom: 50px;
        }

        .count-down {
          position: relative;
          @include flex(column, center, center);
          transform: scale(0.9);
          .img {
            transform: scale(1.2);
          }
          .text {
            position: absolute;
            top: 6%;
            left: 50%;
            transform: translateX(-50%);
            color: #ffffff;
            font-size: 20px;
          }
          .value {
            position: absolute;
            color: #ffffff;
            font-size: 94px;
          }
        }
      }
    }

    .btn {
      @include flex(row, space-around, center);
      .item {
        font-size: 28px;
        width: 250px;
      }
    }

    .dialog-value {
      @include flex(row, center, center);
      height: 130px;
      font-size: 60px;
      color: #ffffff;
      border-radius: 9px;
      background: linear-gradient(
        180deg,
        #2d809e 0%,
        #2d809e 0%,
        #2aa06d 100%,
        #2aa06d 100%
      );
      box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.3);
    }
  }
}
</style>
