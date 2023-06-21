/*
 * @Author      : Mr.bin
 * @Date        : 2023-06-16 21:36:42
 * @LastEditTime: 2023-06-21 14:11:42
 * @Description : Vuex
 */
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    /* x，y调零基准值 */
    zeroStandard: {
      xStandard: null,
      yStandard: null
    },

    /* 订单号 */
    orderId: '',

    /* 当前登录的用户及其信息 */
    currentUserInfo: {
      userId: '', // 用户id
      userName: '', // 姓名
      sex: '', // 性别（男、女）
      height: '', // 身高
      weight: '', // 体重
      birthday: '', // 出生日期
      admission: '', // 住院号
      stage: '' // MTT分期类型
    },

    /* 参数配置数组 */
    settings: [],

    /* 下一个设备的名称（用于结束后提示下一个设备，增加用户体验） */
    nextDevice: '',

    /* 语音开关 */
    voiceSwitch: true,

    /* 平衡能力测试的最终结果 */
    balanceAbilityResult: {
      l1: null, // 一档睁眼直立，左腿（动作1）
      r1: null, // 一档睁眼直立，右腿（动作1）
      l2: null, // 一档睁眼屈膝，左腿（动作2）
      r2: null, // 一档睁眼屈膝，右腿（动作2）
      l3: null, // 二档睁眼直立，左腿（动作3）
      r3: null, // 二档睁眼直立，右腿（动作3）
      l4: null, // 二档睁眼屈膝，左腿（动作4）
      r4: null, // 二档睁眼屈膝，右腿（动作4）
      l5: null, // 一档闭眼直立，左腿（动作5）
      r5: null, // 一档闭眼直立，右腿（动作5）
      l6: null, // 一档闭眼屈膝，左腿（动作6）
      r6: null, // 一档闭眼屈膝，右腿（动作6）
      l7: null, // 二档闭眼直立，左腿（动作7）
      r7: null, // 二档闭眼直立，右腿（动作7）
      l8: null, // 二档闭眼屈膝，左腿（动作8）
      r8: null // 二档闭眼屈膝，右腿（动作8）
    }
  },

  mutations: {
    /* x，y调零基准值 */
    SET_ZEROSTANDARD(state, zeroStandard) {
      state.zeroStandard = zeroStandard
    },

    /* 订单号 */
    SET_ORDERID(state, orderId) {
      state.orderId = orderId
    },

    /* 当前登录的用户及其信息 */
    CHANGE_CURRENTUSERINFO(state, currentUserInfo) {
      state.currentUserInfo = currentUserInfo
    },

    /* 参数配置数组 */
    SET_SETTINGS(state, settings) {
      state.settings = settings
    },

    /* 下一个设备的名称（用于结束后提示下一个设备，增加用户体验） */
    SET_NEXTDEVICE(state, nextDevice) {
      state.nextDevice = nextDevice
    },

    /* 语音开关 */
    SET_VOICESWITCH(state, voiceSwitch) {
      state.voiceSwitch = voiceSwitch
    },

    /* 平衡能力测试的最终结果 */
    CHANGE_BALANCEABILITYRESULT(state, balanceAbilityResult) {
      state.balanceAbilityResult = balanceAbilityResult
    }
  },

  actions: {
    /* x，y调零基准值 */
    setZeroStandard({ commit }, zeroStandard) {
      return new Promise((resolve, reject) => {
        commit('SET_ZEROSTANDARD', zeroStandard)
        resolve()
      })
    },

    /* 订单号 */
    setOrderId({ commit }, orderId) {
      return new Promise((resolve, reject) => {
        commit('SET_ORDERID', orderId)
        resolve()
      })
    },

    /* 当前登录的用户及其信息 */
    changeCurrentUserInfo({ commit }, currentUserInfo) {
      return new Promise((resolve, reject) => {
        commit('CHANGE_CURRENTUSERINFO', currentUserInfo)
        resolve()
      })
    },

    /* 参数配置数组 */
    setSettings({ commit }, settings) {
      return new Promise((resolve, reject) => {
        commit('SET_SETTINGS', settings)
        resolve()
      })
    },

    /* 下一个设备的名称（用于结束后提示下一个设备，增加用户体验） */
    setNextDevice({ commit }, nextDevice) {
      return new Promise((resolve, reject) => {
        commit('SET_NEXTDEVICE', nextDevice)
        resolve()
      })
    },

    /* 语音开关 */
    setVoiceSwitch({ commit }, voiceSwitch) {
      return new Promise((resolve, reject) => {
        commit('SET_VOICESWITCH', voiceSwitch)
        resolve()
      })
    },

    /* 平衡能力测试的最终结果 */
    changeBalanceAbilityResult({ commit }, balanceAbilityResult) {
      return new Promise((resolve, reject) => {
        commit('CHANGE_BALANCEABILITYRESULT', balanceAbilityResult)
        resolve()
      })
    }
  }
})
