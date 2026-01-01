const { leader } = require('../../../utils/api')

Page({
  data: {
    activityList: [],
    page: 1,
    pageSize: 10,
    total: 0,
    loading: false,
    hasMore: true,
    refreshing: false,
    searchParams: {
      title: '',
      status: ''
    },
    statusIndex: 0,
    statusOptions: [
      { label: '全部状态', value: '' },
      { label: '未开始', value: 0 },
      { label: '进行中', value: 1 },
      { label: '已结束', value: 2 },
      { label: '已取消', value: 3 }
    ]
  },

  onLoad() {
    this.loadActivityList(true)
  },

  onShow() {
    // 每次显示时刷新数据
    this.setData({ 
      page: 1, 
      hasMore: true,
      loading: false
    })
    setTimeout(() => {
      this.loadActivityList(true)
    }, 100)
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true })
    this.loadActivityList(true)
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadActivityList(false)
    }
  },

  loadActivityList(refresh = false) {
    if (this.data.loading && !refresh) return
    const nextPage = refresh ? 1 : this.data.page
    this.setData({ loading: true, refreshing: refresh })
    const params = {
      page: nextPage,
      pageSize: this.data.pageSize,
      ...this.data.searchParams
    }
    leader.getSelfActivities(params).then(res => {
      const records = (res.records || []).map(item => ({
        ...item,
        startTimeDisplay: this.formatTime(item.startTime),
        endTimeDisplay: this.formatTime(item.endTime),
        deadlineDisplay: this.formatTime(item.signupDeadline)
      }))
      const newList = refresh ? records : [...this.data.activityList, ...records]
      const total = res.total || newList.length
      this.setData({
        activityList: newList,
        total,
        page: refresh ? 2 : this.data.page + 1,
        hasMore: newList.length < total,
        loading: false,
        refreshing: false
      })
      if (refresh) wx.stopPullDownRefresh()
    }).catch(() => {
      this.setData({ loading: false, refreshing: false })
      if (refresh) wx.stopPullDownRefresh()
    })
  },

  onSearchInput(e) {
    this.setData({ 'searchParams.title': e.detail.value })
  },

  onStatusChange(e) {
    const index = e.detail.value
    const status = this.data.statusOptions[index].value
    this.setData({
      statusIndex: index,
      'searchParams.status': status,
      page: 1,
      hasMore: true
    })
    this.loadActivityList(true)
  },

  onSearch() {
    this.setData({ page: 1, hasMore: true })
    this.loadActivityList(true)
  },

  onResetFilters() {
    this.setData({
      searchParams: { title: '', status: '' },
      statusIndex: 0,
      page: 1,
      hasMore: true
    })
    this.loadActivityList(true)
  },

  viewActivity(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/leader/activity-detail/activity-detail?id=${id}`
    })
  },

  createActivity() {
    wx.navigateTo({
      url: '/pages/leader/activity-create/activity-create'
    })
  },

  editActivity(e) {
    const id = e.currentTarget.dataset.id
    if (!id) return
    wx.navigateTo({
      url: `/pages/leader/activity-edit/activity-edit?id=${id}`
    })
  },

  createTask(e) {
    const id = e.currentTarget.dataset.id
    if (!id) return
    wx.navigateTo({
      url: `/pages/leader/task-list/task-list?activityId=${id}`
    })
  },

  formatTime(time) {
    if (!time || time === null || time === undefined || time === '') return '未设置'
    try {
      let timeStr = String(time).trim()
      if (!timeStr || timeStr === 'null' || timeStr === 'undefined') {
        return '未设置'
      }
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(timeStr)) {
        return timeStr.substring(0, 16)
      }
      if (timeStr.includes('T')) {
        timeStr = timeStr.replace('T', ' ')
      }
      const date = new Date(time)
      if (!isNaN(date.getTime()) && date.getTime() > 0) {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hour = String(date.getHours()).padStart(2, '0')
        const minute = String(date.getMinutes()).padStart(2, '0')
        return `${year}-${month}-${day} ${hour}:${minute}`
      }
      if (timeStr.length >= 16) {
        return timeStr.substring(0, 16)
      }
      return timeStr || '未设置'
    } catch (e) {
      const timeStr = String(time).replace('T', ' ').trim()
      return timeStr.length >= 16 ? timeStr.substring(0, 16) : (timeStr || '未设置')
    }
  },

  getStatusText(status) {
    const map = { 0: '未开始', 1: '进行中', 2: '已结束', 3: '已取消' }
    return map[status] || '未知'
  },

  getStatusClass(status) {
    const map = { 0: 'status-pending', 1: 'status-active', 2: 'status-ended', 3: 'status-cancelled' }
    return map[status] || ''
  }
})

