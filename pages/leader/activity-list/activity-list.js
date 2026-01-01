const { leader } = require('../../../utils/api')

Page({
  data: {
    welcomeName: '',
    tabs: [
      { key: 'all', label: '全部活动' },
      { key: 'self', label: '我的活动' }
    ],
    activeTab: 'all',
    all: {
      list: [],
      page: 1,
      pageSize: 10,
      total: 0,
      loading: false,
      hasMore: true
    },
    self: {
      list: [],
      page: 1,
      pageSize: 10,
      total: 0,
      loading: false,
      hasMore: true
    },
    statusIndex: 0,
    statusOptions: [
      { label: '全部状态', value: '' },
      { label: '未开始', value: 0 },
      { label: '进行中', value: 1 },
      { label: '已结束', value: 2 },
      { label: '已取消', value: 3 }
    ],
    searchParams: {
      title: '',
      status: ''
    },
    refreshing: false
  },

  onLoad() {
    this.setWelcomeName()
    this.loadAllActivities(true)
  },

  onShow() {
    // 每次显示页面时刷新当前标签页数据
    this.refreshActiveTab()
  },

  onPullDownRefresh() {
    this.setData({ refreshing: true })
    this.refreshActiveTab()
  },

  onReachBottom() {
    this.loadActiveTabMore()
  },

  setWelcomeName() {
    const profile = wx.getStorageSync('userProfile') || {}
    const name = profile.userName || profile.name
    this.setData({ welcomeName: name || '负责人' })
  },

  onTabChange(e) {
    const key = e.currentTarget.dataset.key
    if (key === this.data.activeTab) return
    this.setData({ activeTab: key })
    const tabState = this.data[key]
    if (!tabState.list.length) {
      this.refreshActiveTab()
    }
  },

  refreshActiveTab() {
    const { activeTab } = this.data
    if (activeTab === 'all') {
      this.setData({ all: { ...this.data.all, page: 1, hasMore: true } })
      this.loadAllActivities(true)
    } else if (activeTab === 'self') {
      this.setData({ self: { ...this.data.self, page: 1, hasMore: true } })
      this.loadSelfActivities(true)
    }
  },

  loadActiveTabMore() {
    const { activeTab } = this.data
    if (activeTab === 'all') {
      if (this.data.all.hasMore && !this.data.all.loading) {
        this.loadAllActivities(false)
      }
    } else if (activeTab === 'self') {
      if (this.data.self.hasMore && !this.data.self.loading) {
        this.loadSelfActivities(false)
      }
    }
  },

  loadAllActivities(refresh = false) {
    const tabState = this.data.all
    if (tabState.loading && !refresh) return
    const nextPage = refresh ? 1 : tabState.page
    this.setData({ 
      'all.loading': true, 
      refreshing: refresh 
    })
    const params = {
      page: nextPage,
      pageSize: tabState.pageSize,
      ...this.data.searchParams
    }
    leader.getActivityList(params).then(res => {
      const records = (res.records || []).map(item => ({
        ...item,
        startTimeDisplay: this.formatTime(item.startTime),
        endTimeDisplay: this.formatTime(item.endTime),
        deadlineDisplay: this.formatTime(item.signupDeadline)
      }))
      const newList = refresh ? records : [...tabState.list, ...records]
      const total = res.total || newList.length
      this.setData({
        'all.list': newList,
        'all.total': total,
        'all.page': refresh ? 2 : tabState.page + 1,
        'all.hasMore': newList.length < total,
        'all.loading': false,
        refreshing: false
      })
      if (refresh) wx.stopPullDownRefresh()
    }).catch(() => {
      this.setData({ 
        'all.loading': false, 
        refreshing: false 
      })
      if (refresh) wx.stopPullDownRefresh()
    })
  },

  loadSelfActivities(refresh = false) {
    const tabState = this.data.self
    if (tabState.loading && !refresh) return
    const nextPage = refresh ? 1 : tabState.page
    this.setData({ 
      'self.loading': true, 
      refreshing: refresh 
    })
    const params = {
      page: nextPage,
      pageSize: tabState.pageSize,
      ...this.data.searchParams
    }
    leader.getSelfActivities(params).then(res => {
      const records = (res.records || []).map(item => ({
        ...item,
        startTimeDisplay: this.formatTime(item.startTime),
        endTimeDisplay: this.formatTime(item.endTime),
        deadlineDisplay: this.formatTime(item.signupDeadline)
      }))
      const newList = refresh ? records : [...tabState.list, ...records]
      const total = res.total || newList.length
      this.setData({
        'self.list': newList,
        'self.total': total,
        'self.page': refresh ? 2 : tabState.page + 1,
        'self.hasMore': newList.length < total,
        'self.loading': false,
        refreshing: false
      })
      if (refresh) wx.stopPullDownRefresh()
    }).catch(() => {
      this.setData({ 
        'self.loading': false, 
        refreshing: false 
      })
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
      'all.page': 1,
      'all.hasMore': true,
      'self.page': 1,
      'self.hasMore': true
    })
    this.refreshActiveTab()
  },

  onSearch() {
    this.setData({
      'all.page': 1,
      'all.hasMore': true,
      'self.page': 1,
      'self.hasMore': true
    })
    this.refreshActiveTab()
  },

  onResetFilters() {
    this.setData({
      searchParams: { title: '', status: '' },
      statusIndex: 0,
      'all.page': 1,
      'all.hasMore': true,
      'self.page': 1,
      'self.hasMore': true
    })
    this.refreshActiveTab()
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
