<!--
 * @Author      : Mr.bin
 * @Date        : 2023-06-21 15:38:11
 * @LastEditTime: 2023-06-21 17:40:30
 * @Description : 平衡能力测试-具体测量
-->
<template>
  <div class="balance-ability-measure">
    <div class="wrapper">
      <div class="left">
        <div class="title">平衡能力测试</div>
        <div class="type">
          <span class="type__item-1">{{ type1 }}</span>
          <span class="type__item-2">{{ type2 }}</span>
        </div>
        <div class="text">
          <span class="leg">{{ leg }}</span
          >{{ text }}
        </div>
      </div>

      <div class="main">
        <div class="chart">
          <div id="chart" :style="{ width: '100%', height: '100%' }"></div>
        </div>
      </div>

      <div class="right">
        <div class="count-down">
          <el-image class="img" :src="timeBgSrc" fit="scale-down"></el-image>
          <div class="text">倒计时</div>
          <div class="value">{{ nowTime }}</div>
        </div>
        <div class="result">
          <div class="text">得分</div>
          <el-radio-group v-model="score">
            <el-radio class="value" border :label="0">0分</el-radio>
            <el-radio class="value" border :label="1">1分</el-radio>
          </el-radio-group>
        </div>
        <div class="btn">
          <el-button
            class="item"
            type="success"
            @click="handleStart"
            :disabled="isStart"
            >开始测量</el-button
          >
          <el-button class="item" type="info" plain @click="handleRefresh"
            >刷新页面</el-button
          >
          <el-button class="item" type="danger" @click="handleExit"
            >退出订单</el-button
          >
        </div>
      </div>
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
  name: 'balance-ability-measure',

  data() {
    return {
      /* 路由传参 */
      showName: JSON.parse(this.$route.query.showName),
      nextRouterName: JSON.parse(this.$route.query.nextRouterName),

      timeBgSrc: require('@/assets/img/Test/Balance_Ability/Measure/倒计时背景.png'), // 倒计时背景

      /* 串口相关变量 */
      usbPort: null,
      parser: null,
      scmBaudRate: 115200, // 默认波特率115200

      /* 图形相关变量 */
      myChart: null,
      option: {},

      /* 控制类 */
      isStart: false, // 是否开始
      isFinish: false, // 是否完成整个测试

      /* 其他 */
      type1: '',
      type2: '',
      balanceAbilityResultItem: '',
      leg: '',
      text: '',

      side: this.$store.state.settings[0].side, // 患侧

      maxAction: parseInt(window.localStorage.getItem('maxAction')),

      timeClock: null, // 计时器
      time: 10, // 倒计时，默认10s
      nowTime: 10, // 实时倒计时

      dx: 0, // 相对x轴位移
      dy: 0, // 相对y轴位移
      trajectoryArray: [], // 轨迹数组

      score: 0 // 得分，0或1
    }
  },

  created() {
    this.initSerialPort()
  },
  mounted() {
    this.initChart()
  },
  beforeDestroy() {
    // 清除计时器
    if (this.timeClock) {
      clearInterval(this.timeClock)
    }
    // 关闭串口
    if (this.usbPort) {
      if (this.usbPort.isOpen) {
        this.usbPort.close()
      }
    }
  },

  watch: {
    showName: {
      handler(newValue, oldValue) {
        switch (newValue) {
          case 'test-show-left-1':
            this.type1 = '一档睁眼直立'
            this.type2 = '(晃动系数: 1档)'
            this.balanceAbilityResultItem = 'l1'
            this.leg = '左腿'
            this.text =
              '平稳站立在训练台中心上，睁眼，双手叉腰至髂脊，保持平衡10秒。'
            break
          case 'test-show-right-1':
            this.type1 = '一档睁眼直立'
            this.type2 = '(晃动系数: 1档)'
            this.balanceAbilityResultItem = 'r1'
            this.leg = '右腿'
            this.text =
              '平稳站立在训练台中心上，睁眼，双手叉腰至髂脊，保持平衡10秒。'
            break
          case 'test-show-left-2':
            this.type1 = '一档睁眼屈膝'
            this.type2 = '(晃动系数: 1档)'
            this.balanceAbilityResultItem = 'l2'
            this.leg = '左腿'
            this.text =
              '平稳站立在训练台中心上，膝关节屈曲30°，睁眼，双手叉腰至髂脊，保持平衡10秒。'
            break
          case 'test-show-right-2':
            this.type1 = '一档睁眼屈膝'
            this.type2 = '(晃动系数: 1档)'
            this.balanceAbilityResultItem = 'r2'
            this.leg = '右腿'
            this.text =
              '平稳站立在训练台中心上，膝关节屈曲30°，睁眼，双手叉腰至髂脊，保持平衡10秒。'
            break
          case 'test-show-left-3':
            this.type1 = '二档睁眼直立'
            this.type2 = '(晃动系数: 2档)'
            this.balanceAbilityResultItem = 'l3'
            this.leg = '左腿'
            this.text =
              '平稳站立在训练台中心上，睁眼，双手叉腰至髂脊，保持平衡10秒。'
            break
          case 'test-show-right-3':
            this.type1 = '二档睁眼直立'
            this.type2 = '(晃动系数: 2档)'
            this.balanceAbilityResultItem = 'r3'
            this.leg = '右腿'
            this.text =
              '平稳站立在训练台中心上，睁眼，双手叉腰至髂脊，保持平衡10秒。'
            break
          case 'test-show-left-4':
            this.type1 = '二档睁眼屈膝'
            this.type2 = '(晃动系数: 2档)'
            this.balanceAbilityResultItem = 'l4'
            this.leg = '左腿'
            this.text =
              '平稳站立在训练台中心上，膝关节屈曲30°，睁眼，双手叉腰至髂脊，保持平衡10秒。'
            break
          case 'test-show-right-4':
            this.type1 = '二档睁眼屈膝'
            this.type2 = '(晃动系数: 2档)'
            this.balanceAbilityResultItem = 'r4'
            this.leg = '右腿'
            this.text =
              '平稳站立在训练台中心上，膝关节屈曲30°，睁眼，双手叉腰至髂脊，保持平衡10秒。'
            break
          case 'test-show-left-5':
            this.type1 = '一档闭眼直立'
            this.type2 = '(晃动系数: 1档)'
            this.balanceAbilityResultItem = 'l5'
            this.leg = '左腿'
            this.text =
              '平稳站立在训练台中心上，闭眼，双手叉腰至髂脊，保持平衡10秒。'
            break
          case 'test-show-right-5':
            this.type1 = '一档闭眼直立'
            this.type2 = '(晃动系数: 1档)'
            this.balanceAbilityResultItem = 'r5'
            this.leg = '右腿'
            this.text =
              '平稳站立在训练台中心上，闭眼，双手叉腰至髂脊，保持平衡10秒。'
            break
          case 'test-show-left-6':
            this.type1 = '一档闭眼屈膝'
            this.type2 = '(晃动系数: 1档)'
            this.balanceAbilityResultItem = 'l6'
            this.leg = '左腿'
            this.text =
              '平稳站立在训练台中心上，膝关节屈曲30°，闭眼，双手叉腰至髂脊，保持平衡10秒。'
            break
          case 'test-show-right-6':
            this.type1 = '一档闭眼屈膝'
            this.type2 = '(晃动系数: 1档)'
            this.balanceAbilityResultItem = 'r6'
            this.leg = '右腿'
            this.text =
              '平稳站立在训练台中心上，膝关节屈曲30°，闭眼，双手叉腰至髂脊，保持平衡10秒。'
            break
          case 'test-show-left-7':
            this.type1 = '二档闭眼直立'
            this.type2 = '(晃动系数: 2档)'
            this.balanceAbilityResultItem = 'l7'
            this.leg = '左腿'
            this.text =
              '平稳站立在训练台中心上，闭眼，双手叉腰至髂脊，保持平衡10秒。'
            break
          case 'test-show-right-7':
            this.type1 = '二档闭眼直立'
            this.type2 = '(晃动系数: 2档)'
            this.balanceAbilityResultItem = 'r7'
            this.leg = '右腿'
            this.text =
              '平稳站立在训练台中心上，闭眼，双手叉腰至髂脊，保持平衡10秒。'
            break
          case 'test-show-left-8':
            this.type1 = '二档闭眼屈膝'
            this.type2 = '(晃动系数: 2档)'
            this.balanceAbilityResultItem = 'l8'
            this.leg = '左腿'
            this.text =
              '平稳站立在训练台中心上，膝关节屈曲30°，闭眼，双手叉腰至髂脊，保持平衡10秒。'
            break
          case 'test-show-right-8':
            this.type1 = '二档闭眼屈膝'
            this.type2 = '(晃动系数: 2档)'
            this.balanceAbilityResultItem = 'r8'
            this.leg = '右腿'
            this.text =
              '平稳站立在训练台中心上，膝关节屈曲30°，闭眼，双手叉腰至髂脊，保持平衡10秒。'

            this.isFinish = true // 最后一项，完成
            break
          default:
            this.$alert(
              `请点击"退出订单"按钮，然后重新测试！`,
              '没有找到匹配的测试项目',
              {
                type: 'error',
                showClose: false,
                center: true,
                confirmButtonText: '退出订单',
                callback: () => {
                  this.handleExit()
                }
              }
            )
            break
        }
      },
      deep: true, // 开启深度监听
      immediate: true // 开启初次触发
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
              this.timeClock = setInterval(() => {
                this.nowTime -= 1
                if (this.nowTime <= 0) {
                  this.nowTime = 0
                }
              }, 1000)
            })
            /* 调用 this.usbPort.open() 失败时触发（开启串口失败） */
            this.usbPort.on('error', () => {
              this.$alert(
                `请重新连接USB线，然后点击"刷新页面"按钮，重新测试！`,
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
                this.trajectoryArray.push([this.dx, this.dy])

                // 渲染图形
                this.option.series[0].data = this.trajectoryArray
                this.myChart.setOption(this.option)

                // 完成本项测试
                if (this.trajectoryArray.length === 100) {
                  this.finishData()
                }
              }
            })
          } else {
            this.$getLogger('没有检测到USB连接')
            this.$alert(
              `请重新连接USB线，然后点击"刷新页面"按钮，重新测试！`,
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
            `${err}。请重新连接USB线，然后点击"刷新页面"按钮，重新测试！`,
            `初始化SerialPort.list失败`,
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
     * @description: 完成该动作
     */
    finishData() {
      if (this.usbPort) {
        if (this.usbPort.isOpen) {
          this.usbPort.close()
        }
      }

      if (this.timeClock) {
        clearInterval(this.timeClock)
      }

      /* 计算得分，超出绿圈就0分 */
      const r = parseFloat((this.maxAction * 0.15).toFixed(1)) // 绿圈
      let l = 0
      for (let i = 0; i < this.trajectoryArray.length; i++) {
        const itemArrray = this.trajectoryArray[i]
        l = Math.sqrt(Math.pow(itemArrray[0], 2) + Math.pow(itemArrray[1], 2))
        if (l > r) {
          this.score = 0
          break
        } else {
          this.score = 1
        }
      }

      const newBalanceAbilityResult = JSON.parse(
        JSON.stringify(this.$store.state.balanceAbilityResult)
      )
      if (this.score === 1) {
        newBalanceAbilityResult[this.balanceAbilityResultItem] = 1
      } else {
        newBalanceAbilityResult[this.balanceAbilityResultItem] = 0
      }
      this.$store.dispatch(
        'changeBalanceAbilityResult',
        newBalanceAbilityResult
      )

      /* 是否完成整个测试 */
      if (this.isFinish === true) {
        /* 删除 Vuex 参数配置数组的第一个元素 */
        let settings = JSON.parse(JSON.stringify(this.$store.state.settings))
        settings.shift()
        this.$store.dispatch('setSettings', settings).then(() => {
          // 完成该次测试时的岁数
          const currentAge = this.$moment().diff(
            this.$store.state.currentUserInfo.birthday,
            'years'
          )
          // 计算总得分
          const balanceAbilityResult = JSON.parse(
            JSON.stringify(this.$store.state.balanceAbilityResult)
          )
          const score =
            balanceAbilityResult.l1 +
            balanceAbilityResult.r1 +
            balanceAbilityResult.l2 +
            balanceAbilityResult.r2 +
            balanceAbilityResult.l3 +
            balanceAbilityResult.r3 +
            balanceAbilityResult.l4 +
            balanceAbilityResult.r4 +
            balanceAbilityResult.l5 +
            balanceAbilityResult.r5 +
            balanceAbilityResult.l6 +
            balanceAbilityResult.r6 +
            balanceAbilityResult.l7 +
            balanceAbilityResult.r7 +
            balanceAbilityResult.l8 +
            balanceAbilityResult.r8
          // 计算平衡能力（差、一般、优）
          let ability = ''
          if (currentAge <= 29) {
            if (score >= 0 && score <= 7) {
              ability = '差'
            } else if (score >= 8 && score <= 12) {
              ability = '一般'
            } else {
              ability = '优'
            }
          } else if (currentAge >= 30 && currentAge <= 39) {
            if (score >= 0 && score <= 6) {
              ability = '差'
            } else if (score >= 7 && score <= 11) {
              ability = '一般'
            } else {
              ability = '优'
            }
          } else if (currentAge >= 40 && currentAge <= 49) {
            if (score >= 0 && score <= 5) {
              ability = '差'
            } else if (score >= 6 && score <= 10) {
              ability = '一般'
            } else {
              ability = '优'
            }
          } else if (currentAge >= 50 && currentAge <= 54) {
            if (score >= 0 && score <= 4) {
              ability = '差'
            } else if (score >= 5 && score <= 8) {
              ability = '一般'
            } else {
              ability = '优'
            }
          } else if (currentAge >= 54 && currentAge <= 59) {
            if (score >= 0 && score <= 3) {
              ability = '差'
            } else if (score >= 4 && score <= 7) {
              ability = '一般'
            } else {
              ability = '优'
            }
          } else if (currentAge >= 60) {
            if (score >= 0 && score <= 2) {
              ability = '差'
            } else if (score >= 3 && score <= 6) {
              ability = '一般'
            } else {
              ability = '优'
            }
          }

          /* 数据 */
          const obj = {
            pattern: '平衡能力测试',
            side: this.side, // 患侧
            currentAge: currentAge, // 完成该次测试时的岁数
            balanceAbilityResult: balanceAbilityResult, // 得分结果
            score: score, // 总得分
            ability: ability // 平衡能力
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
      } else {
        // 下一个动作
        this.$alert(`请点击“下一动作”按钮`, '完成', {
          type: 'success',
          showClose: false,
          center: true,
          confirmButtonText: '下一动作',
          callback: () => {
            this.$router.push({
              path: this.nextRouterName
            })
          }
        })
      }
    },

    /**
     * @description: 完成订单或者下一项
     */
    handleFinish() {
      if (this.$store.state.settings.length) {
        // 下一项
        let route = ''
        switch (this.$store.state.settings[0].pattern) {
          case '平衡能力测试':
            route = 'test-show-left-1'
            break
          case '静态稳定测试':
            route = 'static-stability-measure'
            break
          case '动态稳定测试':
            route = 'dynamic-stability-measure'
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
          path: '/test-send'
        })
      }
    },

    /**
     * @description: 刷新页面
     */
    handleRefresh() {
      this.$router.push({
        path: '/refresh-special',
        query: {
          routerName: JSON.stringify('/balance-ability-measure'),
          duration: JSON.stringify(300),
          showName: JSON.stringify(this.showName),
          nextRouterName: JSON.stringify(this.nextRouterName)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.balance-ability-measure {
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
    @include flex(row, space-between, stretch);

    .left {
      width: 30%;
      .title {
        font-weight: 700;
        font-size: 40px;
      }
      .type {
        margin-top: 40px;
        .type__item-1 {
          font-size: 26px;
          font-weight: 700;
        }
        .type__item-2 {
          font-size: 20px;
          color: orange;
          margin-left: 10px;
        }
      }
      .text {
        margin-top: 30px;
        font-size: 20px;
        .leg {
          color: green;
          font-weight: 700;
          line-height: 2em;
        }
      }
    }

    .main {
      flex: 1;
      @include flex(row, center, center);
      .chart {
        width: 580px;
        height: 600px;
      }
    }

    .right {
      width: 30%;
      @include flex(column, space-between, center);

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

      .result {
        @include flex(column, center, center);
        .text {
          font-size: 30px;
        }
        .value {
          margin-top: 20px;
        }
      }

      .btn {
        @include flex(column, center, center);
        .item {
          font-size: 24px;
          width: 220px;
          margin: 10px 0;
        }
      }
    }
  }
}
</style>
