const { leader } = require('../../../utils/api')

Page({
  data: {
    activityId: null,
    taskList: [],
    loading: true,
    showAssignModal: false,
    assignForm: {
      userId: '',
      content: '',
      startTime: '',
      endTime: ''
    },
    userList: []
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
    leader.getTaskList(this.data.activityId).then(res => {
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
  showAssign() {
    // 这里应该加载已通过审核的用户列表，暂时显示弹窗
    this.setData({ showAssignModal: true })
  },
  hideAssign() {
    this.setData({ showAssignModal: false })
  },
  onAssignInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [`assignForm.${field}`]: e.detail.value
    })
  },
  onAssignDateChange(e) {
    const { field } = e.currentTarget.dataset
    const date = e.detail.value
    const currentTime = this.data.assignForm[field] || ''
    const time = currentTime.includes('T') ? currentTime.split('T')[1] : ''
    this.setData({
      [`assignForm.${field}`]: time ? `${date}T${time}` : `${date}T00:00`
    })
  },
  onAssignTimeChange(e) {
    const { field } = e.currentTarget.dataset
    const time = e.detail.value
    const currentDate = this.data.assignForm[field] || ''
    const date = currentDate.includes('T') ? currentDate.split('T')[0] : new Date().toISOString().split('T')[0]
    this.setData({
      [`assignForm.${field}`]: `${date}T${time}`
    })
  },
  submitAssign() {
    const { assignForm } = this.data
    if (!assignForm.userId || !assignForm.content || !assignForm.startTime || !assignForm.endTime) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }
    wx.showLoading({ title: '分配中...' })
    const submitData = {
      activityId: this.data.activityId,
      ...assignForm,
      userId: parseInt(assignForm.userId),
      startTime: assignForm.startTime.replace('T', ' '),
      endTime: assignForm.endTime.replace('T', ' ')
    }
    leader.taskAssign(submitData).then(() => {
      wx.hideLoading()
      wx.showToast({ title: '分配成功', icon: 'success' })
      this.setData({ showAssignModal: false, assignForm: { userId: '', content: '', startTime: '', endTime: '' } })
      this.loadTaskList()
    }).catch(err => {
      wx.hideLoading()
    })
  },
  stopPropagation() {
    // 阻止事件冒泡
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
    const map = { 0: '未开始', 1: '进行中', 2: '已完成' }
    return map[status] || '未知'
  },
  getStatusClass(status) {
    const map = { 0: 'status-pending', 1: 'status-active', 2: 'status-done' }
    return map[status] || ''
  }
})

