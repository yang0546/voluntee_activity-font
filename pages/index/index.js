const app = getApp()

Page({
  data: {},
  onLoad() {
    // 检查登录状态
    const token = wx.getStorageSync('token')
    const role = wx.getStorageSync('role')
    if (token && role !== undefined) {
      // 已登录，根据角色跳转
      this.redirectByRole(role)
    } else {
      // 未登录，跳转到登录页
      wx.reLaunch({
        url: '/pages/login/login'
      })
    }
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
