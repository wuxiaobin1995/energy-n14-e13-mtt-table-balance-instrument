<!--
 * @Author      : Mr.bin
 * @Date        : 2023-06-19 15:06:17
 * @LastEditTime: 2023-06-21 16:56:33
 * @Description : 刷新中转页-平衡能力测试专用
-->
<template>
  <div
    class="refresh-special"
    v-loading.fullscreen.lock="fullscreenLoading"
  ></div>
</template>

<script>
export default {
  name: 'refresh-special',

  data() {
    return {
      fullscreenLoading: true, // 加载动画

      /* 路由传参 */
      routerName: JSON.parse(this.$route.query.routerName),
      duration: JSON.parse(
        this.$route.query.duration ? this.$route.query.duration : 800
      ), // 刷新时长

      showName: JSON.parse(this.$route.query.showName),
      nextRouterName: JSON.parse(this.$route.query.nextRouterName)
    }
  },

  created() {
    setTimeout(() => {
      this.$router.push({
        path: this.routerName,
        query: {
          showName: JSON.stringify(this.showName),
          nextRouterName: JSON.stringify(this.nextRouterName)
        }
      })
    }, this.duration)
  }
}
</script>

<style lang="scss" scoped>
.refresh-special {
  width: 100%;
  height: 100%;
}
</style>
