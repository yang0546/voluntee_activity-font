const { volunteer } = require('../../../utils/api')

Page({
  data: {
    activityId: null,
    activity: null,
    loading: true,
    canSignup: false,
    signupStatus: null // 0-待审核 1-审核通过 2-审核拒绝
  },
  onLoad(options) {
    if (options.id) {
      this.setData({ activityId: options.id })
      this.loadActivityDetail()
      this.checkSignupStatus()
    }
  },
  loadActivityDetail() {
    wx.showLoading({ title: '加载中...' })
    volunteer.getActivityList({ page: 1, pageSize: 1000 }).then(res => {
      const activity = res.records.find(item => item.id == this.data.activityId)
      if (activity) {
        const now = new Date()
        const deadline = new Date(activity.signupDeadline.replace(/-/g, '/'))
        const canSignup = activity.status === 0 && now < deadline && activity.currentPeople < activity.requiredPeople
        this.setData({
          activity,
          canSignup,
          loading: false
        })
      } else {
        wx.showToast({ title: '活动不存在', icon: 'none' })
        setTimeout(() => wx.navigateBack(), 1500)
      }
      wx.hideLoading()
    }).catch(err => {
      wx.hideLoading()
      this.setData({ loading: false })
    })
  },
  checkSignupStatus() {
    // 这里应该调用接口查询报名状态，暂时用本地逻辑判断
    // 实际应该调用类似 /volunteer/activity/signupStatus?activityId=xxx
  },
  handleSignup() {
    if (!this.data.canSignup) {
      wx.showToast({ title: '当前无法报名', icon: 'none' })
      return
    }
    wx.showModal({
      title: '确认报名',
      content: '确定要报名参加此活动吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '报名中...' })
          volunteer.signupActivity({ activityId: this.data.activityId }).then(() => {
            wx.hideLoading()
            wx.showToast({ title: '报名成功，等待审核', icon: 'success' })
            this.setData({ canSignup: false, signupStatus: 0 })
          }).catch(err => {
            wx.hideLoading()
          })
        }
      }
    })
  },
  viewTasks() {
    wx.navigateTo({
      url: `/pages/volunteer/task-list/task-list?activityId=${this.data.activityId}`
    })
  },
  formatTime(time) {
    if (!time) return ''
    return time.replace('T', ' ')
  },
  getStatusText(status) {
    const map = { 0: '未开始', 1: '进行中', 2: '已结束', 3: '已取消' }
    return map[status] || '未知'
  }
})

