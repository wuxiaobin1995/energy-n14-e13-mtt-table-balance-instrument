/*
 * @Author      : Mr.bin
 * @Date        : 2023-06-16 21:36:42
 * @LastEditTime: 2023-06-21 21:43:32
 * @Description : 路由
 */
import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

// 解决ElementUI导航栏中的vue-router在3.0版本以上重复点菜单报错问题
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

const routes = [
  /*
   * 前面加"/"表示绝对路径，不加"/"表示相对路径
   * 一般嵌套路由中的子路由不需要加"/"，它会在父路由后自动加上"/子路由"
   * 比如父 "/father"，子 "child"，要想访问子路由，跳转链接需要写成 "/father/child"
   */

  {
    path: '/',
    name: 'layout',
    component: () => import('@/layout'),
    redirect: '/home',
    children: [
      // 首页
      {
        path: 'home',
        name: 'home',
        component: () => import('@/views/home'),
        meta: ['首页']
      },
      // 调零
      {
        path: 'set-zero',
        name: 'set-zero',
        component: () => import('@/views/set/set-zero'),
        meta: ['调零']
      },
      // 开发者
      {
        path: 'set-developer',
        name: 'set-developer',
        component: () => import('@/views/set/set-developer'),
        meta: ['开发者']
      },

      // 任务详情页
      {
        path: 'task',
        name: 'task',
        component: () => import('@/views/task'),
        meta: ['任务详情页']
      },

      /* 评估 */
      // 平衡能力测试-具体测量
      {
        path: 'balance-ability-measure',
        name: 'balance-ability-measure',
        component: () => import('@/views/test-mode/balance-ability/measure'),
        meta: ['平衡能力测试-具体测量']
      },
      // 平衡能力测试-动作介绍（共16个）
      {
        path: 'test-show-left-1',
        name: 'test-show-left-1',
        component: () =>
          import('@/views/test-mode/balance-ability/show/left-1'),
        meta: ['一档睁眼直立-左腿']
      },
      {
        path: 'test-show-right-1',
        name: 'test-show-right-1',
        component: () =>
          import('@/views/test-mode/balance-ability/show/right-1'),
        meta: ['一档睁眼直立-右腿']
      },
      {
        path: 'test-show-left-2',
        name: 'test-show-left-2',
        component: () =>
          import('@/views/test-mode/balance-ability/show/left-2'),
        meta: ['一档睁眼屈膝-左腿']
      },
      {
        path: 'test-show-right-2',
        name: 'test-show-right-2',
        component: () =>
          import('@/views/test-mode/balance-ability/show/right-2'),
        meta: ['一档睁眼屈膝-右腿']
      },
      {
        path: 'test-show-left-3',
        name: 'test-show-left-3',
        component: () =>
          import('@/views/test-mode/balance-ability/show/left-3'),
        meta: ['二档睁眼直立-左腿']
      },
      {
        path: 'test-show-right-3',
        name: 'test-show-right-3',
        component: () =>
          import('@/views/test-mode/balance-ability/show/right-3'),
        meta: ['二档睁眼直立-右腿']
      },
      {
        path: 'test-show-left-4',
        name: 'test-show-left-4',
        component: () =>
          import('@/views/test-mode/balance-ability/show/left-4'),
        meta: ['二档睁眼屈膝-左腿']
      },
      {
        path: 'test-show-right-4',
        name: 'test-show-right-4',
        component: () =>
          import('@/views/test-mode/balance-ability/show/right-4'),
        meta: ['二档睁眼屈膝-右腿']
      },
      {
        path: 'test-show-left-5',
        name: 'test-show-left-5',
        component: () =>
          import('@/views/test-mode/balance-ability/show/left-5'),
        meta: ['一档闭眼直立-左腿']
      },
      {
        path: 'test-show-right-5',
        name: 'test-show-right-5',
        component: () =>
          import('@/views/test-mode/balance-ability/show/right-5'),
        meta: ['一档闭眼直立-右腿']
      },
      {
        path: 'test-show-left-6',
        name: 'test-show-left-6',
        component: () =>
          import('@/views/test-mode/balance-ability/show/left-6'),
        meta: ['一档闭眼屈膝-左腿']
      },
      {
        path: 'test-show-right-6',
        name: 'test-show-right-6',
        component: () =>
          import('@/views/test-mode/balance-ability/show/right-6'),
        meta: ['一档闭眼屈膝-右腿']
      },
      {
        path: 'test-show-left-7',
        name: 'test-show-left-7',
        component: () =>
          import('@/views/test-mode/balance-ability/show/left-7'),
        meta: ['二档闭眼直立-左腿']
      },
      {
        path: 'test-show-right-7',
        name: 'test-show-right-7',
        component: () =>
          import('@/views/test-mode/balance-ability/show/right-7'),
        meta: ['二档闭眼直立-右腿']
      },
      {
        path: 'test-show-left-8',
        name: 'test-show-left-8',
        component: () =>
          import('@/views/test-mode/balance-ability/show/left-8'),
        meta: ['二档闭眼屈膝-左腿']
      },
      {
        path: 'test-show-right-8',
        name: 'test-show-right-8',
        component: () =>
          import('@/views/test-mode/balance-ability/show/right-8'),
        meta: ['二档闭眼屈膝-右腿']
      },
      // 静态稳定测试-具体测量
      {
        path: 'static-stability-measure',
        name: 'static-stability-measure',
        component: () => import('@/views/test-mode/static-stability/measure'),
        meta: ['静态稳定测试-具体测量']
      },
      // 动态稳定测试-具体测量
      {
        path: 'dynamic-stability-measure',
        name: 'dynamic-stability-measure',
        component: () => import('@/views/test-mode/dynamic-stability/measure'),
        meta: ['动态稳定测试-具体测量']
      },

      /* 训练 */
      // 静态平衡训练-具体测量
      {
        path: 'static-equilibrium-measure',
        name: 'static-equilibrium-measure',
        component: () =>
          import('@/views/train-mode/static-equilibrium/measure'),
        meta: ['静态平衡训练-具体测量']
      },
      // 动态平衡训练-具体测量
      {
        path: 'dynamic-equilibrium-measure',
        name: 'dynamic-equilibrium-measure',
        component: () =>
          import('@/views/train-mode/dynamic-equilibrium/measure'),
        meta: ['动态平衡训练-具体测量']
      }
    ]
  },

  /* 评估数据统一发送页面 */
  {
    path: '/test-send',
    name: 'test-send',
    component: () => import('@/views/test-mode/test-send'),
    meta: ['评估数据统一发送页面']
  },

  /* 训练数据统一发送页面 */
  {
    path: '/train-send',
    name: 'train-send',
    component: () => import('@/views/train-mode/train-send'),
    meta: ['训练数据统一发送页面']
  },

  {
    path: '/refresh',
    name: 'refresh',
    component: () => import('@/views/refresh')
  },
  {
    path: '/refresh-special',
    name: 'refresh-special',
    component: () => import('@/views/refresh-special'),
    meta: ['刷新中转页-平衡能力测试专用']
  },

  {
    path: '*',
    redirect: '/'
  }
]

const router = new VueRouter({
  routes,
  /* 自定义路由切换时页面如何滚动 */
  scrollBehavior(to, from, savedPosition) {
    return { x: 0, y: 0 } // 回到顶部
  }
})
export default router
