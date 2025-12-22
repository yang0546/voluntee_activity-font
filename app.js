// app.js
const { request } = require('./utils/request')

App({
  onLaunch() {
    // 可以在此预留自动登录或版本检查逻辑
  },
  globalData: {
    userInfo: null, // 微信个人信息
    profile: null   // 后端返回的用户信息（含id、role、token等）
  },
  // 调用后台登录接口
  loginWithWeChat() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (!res.code) {
            wx.showToast({ title: '微信登录失败', icon: 'none' })
            reject(res)
            return
          }
          // 获取头像昵称后再调后端登录
          wx.getUserProfile({
            desc: '用于完善用户资料',
            success: (userRes) => {
              const { nickName, avatarUrl } = userRes.userInfo || {}
              request({
                url: '/common/login',
                method: 'POST',
                data: {
                  code: res.code,
                  name: nickName,
                  avatarUrl
                }
              }).then(data => {
                // data: {id, openid, token, role}
                this.globalData.userInfo = userRes.userInfo
                this.globalData.profile = data
                wx.setStorageSync('token', data.token || '')
                wx.setStorageSync('role', data.role)
                wx.setStorageSync('userProfile', data)
                resolve(data)
              }).catch(err => {
                reject(err)
              })
            },
            fail: (err) => {
              wx.showToast({ title: '需要授权头像昵称', icon: 'none' })
              reject(err)
            }
          })
        },
        fail: (err) => {
          wx.showToast({ title: 'wx.login 调用失败', icon: 'none' })
          reject(err)
        }
      })
    })
  }
})

