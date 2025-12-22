const app = getApp()
const { login } = require('../../utils/api')

Page({
  data: {},
  onLoad() {
    // 检查是否已登录
    const token = wx.getStorageSync('token')
    const role = wx.getStorageSync('role')
    if (token && role !== undefined && role !== null) {
      this.redirectByRole(role)
    }
  },
  handleLogin() {
    wx.showLoading({ title: '登录中...' })
    // 先获取用户信息
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (userRes) => {
        const { nickName, avatarUrl } = userRes.userInfo || {}
        // 获取用户信息成功后，获取登录code
        wx.login({
          success: (loginRes) => {
            if (!loginRes.code) {
              wx.hideLoading()
              wx.showToast({ title: '微信登录失败', icon: 'none' })
              return
            }
            // 调用后端登录接口
            login({
              code: loginRes.code,
              name: nickName,
              avatarUrl: avatarUrl
            }).then(data => {
              wx.hideLoading()
              app.globalData.profile = data
              app.globalData.userInfo = userRes.userInfo
              wx.setStorageSync('token', data.token || '')
              wx.setStorageSync('role', data.role)
              wx.setStorageSync('userProfile', data)
              this.redirectByRole(data.role)
            }).catch(err => {
              wx.hideLoading()
              console.error('登录失败', err)
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
          wx.showToast({ title: '需要授权才能登录', icon: 'none' })
        } else {
          wx.showToast({ title: '获取用户信息失败', icon: 'none' })
        }
      }
    })
  },
  redirectByRole(role) {
    // 0-志愿者 1-负责人 2-管理员
    let url = ''
    if (role === 0) {
      url = '/pages/volunteer/activity-list/activity-list'
    } else if (role === 1) {
      url = '/pages/leader/activity-list/activity-list'
    } else if (role === 2) {
      url = '/pages/admin/user-list/user-list'
    }
    if (url) {
      wx.reLaunch({ url })
    }
  }
})

