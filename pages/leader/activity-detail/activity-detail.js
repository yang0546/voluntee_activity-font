const { leader } = require('../../../utils/api')

Page({
  data: {
    activityId: null,
    activity: null,
    loading: true
  },
  onLoad(options) {
    if (options.id) {
      this.setData({ activityId: options.id })
      this.loadActivityDetail()
    }
  },
  loadActivityDetail() {
    wx.showLoading({ title: '加载中...' })
    leader.getSelfActivities({ page: 1, pageSize: 1000 }).then(res => {
      const activity = res.records.find(item => item.id == this.data.activityId)
      if (activity) {
        this.setData({
          activity,
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
  editActivity() {
    wx.navigateTo({
      url: `/pages/leader/activity-edit/activity-edit?id=${this.data.activityId}`
    })
  },
  deleteActivity() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除此活动吗？删除后不可恢复！',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' })
          leader.deleteActivity(this.data.activityId).then(() => {
            wx.hideLoading()
            wx.showToast({ title: '删除成功', icon: 'success' })
            setTimeout(() => wx.navigateBack(), 1500)
          }).catch(err => {
            wx.hideLoading()
          })
        }
      }
    })
  },
  viewSignups() {
    wx.navigateTo({
      url: `/pages/leader/signup-list/signup-list?activityId=${this.data.activityId}`
    })
  },
  viewTasks() {
    wx.navigateTo({
      url: `/pages/leader/task-list/task-list?activityId=${this.data.activityId}`
    })
  },
  formatTime(time) {
    if (!time) return ''
    try {
      const date = new Date(time)
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hour = String(date.getHours()).padStart(2, '0')
        const minute = String(date.getMinutes()).padStart(2, '0')
        return `${year}-${month}-${day} ${hour}:${minute}`
      }
      return String(time).replace('T', ' ').substring(0, 16)
    } catch (e) {
      return String(time).replace('T', ' ').substring(0, 16)
    }
  },
  getStatusText(status) {
    const map = { 0: '未开始', 1: '进行中', 2: '已结束', 3: '已取消' }
    return map[status] || '未知'
  }
})

