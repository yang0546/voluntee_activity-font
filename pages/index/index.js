Page({
  data: {},
  onLoad() {
    const token = wx.getStorageSync('token')
    const role = wx.getStorageSync('role')
    if (token && role !== undefined) {
      this.redirectByRole(role)
    } else {
      wx.reLaunch({ url: '/pages/login/login' })
    }
  },
  redirectByRole(role) {
    let url = ''
    if (role === 0) {
      url = '/pages/volunteer/activity-list/activity-list'
    } else if (role === 1) {
      url = '/pages/leader/home/home'
    } else if (role === 2) {
      url = '/pages/admin/home/home'
    }
    if (url) {
      wx.reLaunch({ url })
    }
  }
})
