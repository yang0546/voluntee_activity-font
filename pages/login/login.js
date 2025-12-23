const app = getApp()
const { login } = require('../../utils/api')

Page({
  data: {},
  onLoad() {
    const token = wx.getStorageSync('token')
    const role = wx.getStorageSync('role')
    if (token && role !== undefined && role !== null) {
      this.redirectByRole(role)
    }
  },
  handleLogin() {
    wx.showLoading({ title: '登录中...' })
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (userRes) => {
        const { nickName, avatarUrl } = userRes.userInfo || {}
        wx.login({
          success: (loginRes) => {
            if (!loginRes.code) {
              wx.hideLoading()
              wx.showToast({ title: '微信登录失败', icon: 'none' })
              return
            }
            login({
              code: loginRes.code,
              name: nickName,
              avatarUrl: avatarUrl
            }).then(data => {
              wx.hideLoading()
              // 后端新增 userName，用于首页欢迎语；兼容老字段 name
              const displayName = data.userName || data.name || nickName
              const normalizedProfile = { ...data, name: displayName, userName: displayName }
              app.globalData.profile = normalizedProfile
              app.globalData.userInfo = userRes.userInfo
              wx.setStorageSync('token', data.token || '')
              wx.setStorageSync('role', data.role)
              wx.setStorageSync('userProfile', normalizedProfile)
              this.redirectByRole(data.role)
            }).catch(err => {
              wx.hideLoading()
              console.error('登录失败', err)
              wx.showToast({ title: '登录失败，请稍后重试', icon: 'none' })
            })
          },
          fail: () => {
            wx.hideLoading()
            wx.showToast({ title: '获取登录凭证失败', icon: 'none' })
          }
        })
      },
      fail: (err) => {
        wx.hideLoading()
        if (err.errMsg && err.errMsg.includes('deny')) {
          wx.showToast({ title: '需要授权后才能登录', icon: 'none' })
        } else {
          wx.showToast({ title: '获取用户信息失败', icon: 'none' })
        }
      }
    })
  },
  redirectByRole(role) {
    let url = ''
    if (role === 0) {
      url = '/pages/volunteer/activity-list/activity-list'
    } else if (role === 1) {
      url = '/pages/leader/activity-list/activity-list'
    } else if (role === 2) {
      url = '/pages/admin/home/home'
    }
    if (url) {
      // 管理员入口使用 tabBar，需要 switchTab；其他保持 reLaunch
      if (role === 2) {
        wx.switchTab({ url })
      } else {
        wx.reLaunch({ url })
      }
    }
  }
})
