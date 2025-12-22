const { volunteer } = require('../../../utils/api')

Page({
  data: {
    activityId: null,
    taskList: [],
    loading: true
  },
  onLoad(options) {
    if (options.activityId) {
      this.setData({ activityId: options.activityId })
      this.loadTaskList()
    }
  },
  onPullDownRefresh() {
    this.loadTaskList()
  },
  loadTaskList() {
    wx.showLoading({ title: '加载中...' })
    volunteer.getTaskList(this.data.activityId).then(res => {
      this.setData({
        taskList: res || [],
        loading: false
      })
      wx.hideLoading()
      wx.stopPullDownRefresh()
    }).catch(err => {
      wx.hideLoading()
      this.setData({ loading: false })
      wx.stopPullDownRefresh()
    })
  },
  updateTaskStatus(e) {
    const { taskid, status } = e.currentTarget.dataset
    const statusMap = { 0: '未开始', 1: '进行中', 2: '已完成' }
    wx.showModal({
      title: '更新任务状态',
      content: `确定要将任务状态更新为"${statusMap[status]}"吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '更新中...' })
          volunteer.updateTaskStatus({ taskId: taskid, status }).then(() => {
            wx.hideLoading()
            wx.showToast({ title: '更新成功', icon: 'success' })
            this.loadTaskList()
          }).catch(err => {
            wx.hideLoading()
          })
        }
      }
    })
  },
  formatTime(time) {
    if (!time) return ''
    return time.replace('T', ' ')
  },
  getStatusText(status) {
    const map = { 0: '未开始', 1: '进行中', 2: '已完成' }
    return map[status] || '未知'
  },
  getStatusClass(status) {
    const map = { 0: 'status-pending', 1: 'status-active', 2: 'status-done' }
    return map[status] || ''
  }
})

