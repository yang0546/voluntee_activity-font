const { leader } = require('../../../utils/api')

Page({
  data: {
    activityId: null,
    loading: true,
    detail: null,
    taskList: []
  },

  onLoad(options) {
    const { id } = options || {}
    if (!id) {
      wx.showToast({ title: '缺少活动ID', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 800)
      return
    }
    this.setData({ activityId: id })
    this.loadDetail(id)
  },

  onPullDownRefresh() {
    if (this.data.activityId) {
      this.loadDetail(this.data.activityId, true)
    } else {
      wx.stopPullDownRefresh()
    }
  },

  loadDetail(id, fromPullDown = false) {
    this.setData({ loading: true })
    Promise.all([
      leader.getActivityById(id),
      leader.getTaskList(id)
    ]).then(([detailRes, taskRes]) => {
      const data = (detailRes && detailRes.data) || detailRes || {}
      const parsed = this.parseActivity(data)
      const tasks = this.parseTasks((taskRes && taskRes.data) || taskRes || [])
      this.setData({ detail: parsed, taskList: tasks, loading: false })
    }).catch(() => {
      this.setData({ loading: false })
      wx.showToast({ title: '获取活动详情失败', icon: 'none' })
    }).finally(() => {
      if (fromPullDown) wx.stopPullDownRefresh()
    })
  },

  parseActivity(activity) {
    const statusMap = {
      0: { text: '未开始', cls: 'status-0' },
      1: { text: '进行中', cls: 'status-1' },
      2: { text: '已结束', cls: 'status-2' },
      3: { text: '已取消', cls: 'status-3' }
    }
    const statusInfo = statusMap[activity.status] || { text: '未知', cls: 'status-2' }
    return {
      ...activity,
      startTimeDisplay: this.formatDateTime(activity.startTime),
      endTimeDisplay: this.formatDateTime(activity.endTime),
      signupDeadlineDisplay: this.formatDateTime(activity.signupDeadline),
      statusText: statusInfo.text,
      statusClass: statusInfo.cls
    }
  },

  parseTasks(list) {
    if (!Array.isArray(list)) return []
    return list.map(item => ({
      ...item,
      startTimeDisplay: this.formatDateTime(item.startTime),
      endTimeDisplay: this.formatDateTime(item.endTime),
      statusText: this.getTaskStatusText(item.status)
    }))
  },

  getTaskStatusText(status) {
    const map = { 0: '未开始', 1: '进行中', 2: '已完成' }
    return map[status] || '未开始'
  },

  formatDateTime(time) {
    if (!time && time !== 0) return '未设置'
    try {
      let str = String(time).replace('T', ' ').trim()
      if (!str || str === 'null' || str === 'undefined') return '未设置'
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(str)) {
        return str.substring(0, 16)
      }
      const date = new Date(str)
      if (!isNaN(date.getTime()) && date.getTime() > 0) {
        const y = date.getFullYear()
        const m = String(date.getMonth() + 1).padStart(2, '0')
        const d = String(date.getDate()).padStart(2, '0')
        const h = String(date.getHours()).padStart(2, '0')
        const mi = String(date.getMinutes()).padStart(2, '0')
        return `${y}-${m}-${d} ${h}:${mi}`
      }
      return str.length >= 16 ? str.substring(0, 16) : str
    } catch (e) {
      return '未设置'
    }
  },

  goEdit() {
    if (!this.data.activityId) return
    wx.navigateTo({
      url: `/pages/leader/activity-edit/activity-edit?id=${this.data.activityId}`
    })
  },

  goTaskCreate() {
    if (!this.data.activityId) return
    wx.navigateTo({
      url: `/pages/leader/task-list/task-list?activityId=${this.data.activityId}`
    })
  }
})
