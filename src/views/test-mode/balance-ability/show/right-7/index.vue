<!--
 * @Author      : Mr.bin
 * @Date        : 2022-12-24 17:52:56
 * @LastEditTime: 2023-02-09 14:29:30
 * @Description : 二档闭眼直立-右腿
-->
<template>
  <div class="test-show">
    <!-- 语音播放 -->
    <audio ref="audio" controls="controls" hidden :src="audioSrc" />

    <div class="wrapper">
      <div class="left">
        <div class="title">平衡能力测试</div>
        <div class="type">
          <span class="type__item-1">二档闭眼直立</span>
          <span class="type__item-2">(晃动系数: 2档)</span>
        </div>
        <div class="text">
          <span class="leg">右腿</span
          >平稳站立在训练台中心上，闭眼，双手叉腰至髂脊，保持平衡10秒。
        </div>
      </div>

      <div class="main">
        <div class="chart">
          <div id="chart" :style="{ width: '100%', height: '100%' }"></div>
        </div>
      </div>

      <div class="right">
        <div class="action">
          <div class="text">参考动作</div>
          <el-image class="img" :src="actionImg" fit="scale-down"></el-image>
        </div>
        <div class="btn">
          <el-button class="item" type="success" round @click="handleStart"
            >开 始</el-button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* 路径模块 */
import path from 'path'

/* 计算圆的相关参数 */
import { setCircle } from '@/utils/setCircle.js'

export default {
  name: 'test-show-right-7',

  data() {
    return {
      actionImg: require('@/assets/img/Test/Balance_Ability/Show/r7.png'),

      /* 语音相关 */
      audioOpen: this.$store.state.voiceSwitch,
      audioSrc: path.join(__static, `narrate/mandarin/r7.mp3`),

      /* 图形相关变量 */
      myChart: null,
      option: {}
    }
  },

  mounted() {
    this.initChart()

    if (this.audioOpen === true) {
      setTimeout(() => {
        this.$refs.audio.currentTime = 0
        this.$refs.audio.play()
      }, 500)
    }
  },

  methods: {
    /**
     * @description: 初始化echarts图形
     */
    initChart() {
      /* 相关计算 */
      const maxAction = parseInt(window.localStorage.getItem('maxAction'))

      const boundary = maxAction + parseInt(maxAction * 0.2) // 方形
      const oneR = parseFloat((maxAction * 0.15).toFixed(1)) // 绿色圆半径
      const twoR = parseFloat((maxAction * 0.3).toFixed(1)) // 黄色圆半径
      const threeR = maxAction // 红色圆半径
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
            color: 'black',
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
            color: 'green',
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
            color: 'yellow',
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
            color: 'red',
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
     * @description: 开始测试
     */
    handleStart() {
      this.$router.push({
        path: '/balance-ability-measure',
        query: {
          showName: JSON.stringify('test-show-right-7'),
          nextRouterName: JSON.stringify('/test-show-left-8')
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.test-show {
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
      @include flex(column, center, center);
      .action {
        @include flex(column, center, center);
        margin-bottom: 90px;
        .text {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 10px;
        }
        .img {
          box-shadow: 0 0 8px #ee9919;
          border-radius: 26px;
          width: 90%;
        }
      }
      .btn {
        @include flex(row, space-around, center);
        .item {
          font-size: 28px;
          width: 250px;
        }
      }
    }
  }
}
</style>
