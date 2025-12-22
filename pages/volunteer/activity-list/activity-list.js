const { volunteer } = require('../../../utils/api')

Page({
  data: {
    tabs: [
      { key: 'market', label: '活动广场' },
      { key: 'applied', label: '已报名' },
      { key: 'approved', label: '已报名成功' }
    ],
    activeTab: 'market',
    market: {
      list: [],
      page: 1,
      pageSize: 10,
      total: 0,
      loading: false,
      hasMore: true
    },
    applied: {
      list: [],
      page: 1,
      pageSize: 10,
      total: 0,
      loading: false,
      hasMore: true
    },
    approved: {
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
    this.loadMarketActivities(true)
  },
  onPullDownRefresh() {
    this.setData({ refreshing: true })
    this.refreshActiveTab()
  },
  onReachBottom() {
    this.loadActiveTabMore()
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
    if (activeTab === 'market') {
      this.setData({ market: { ...this.data.market, page: 1, hasMore: true } })
      this.loadMarketActivities(true)
    } else if (activeTab === 'applied') {
      this.setData({ applied: { ...this.data.applied, page: 1, hasMore: true } })
      this.loadSignupRecords('applied', '', true)
    } else if (activeTab === 'approved') {
      this.setData({ approved: { ...this.data.approved, page: 1, hasMore: true } })
      this.loadSignupRecords('approved', 1, true)
    }
  },
  loadActiveTabMore() {
    const { activeTab } = this.data
    if (activeTab === 'market') {
      if (this.data.market.hasMore && !this.data.market.loading) {
        this.loadMarketActivities(false)
      }
    } else if (activeTab === 'applied') {
      if (this.data.applied.hasMore && !this.data.applied.loading) {
        this.loadSignupRecords('applied', '', false)
      }
    } else if (activeTab === 'approved') {
      if (this.data.approved.hasMore && !this.data.approved.loading) {
        this.loadSignupRecords('approved', 1, false)
      }
    }
  },
  loadMarketActivities(refresh = false) {
    if (this.data.market.loading) return
    this.setData({ market: { ...this.data.market, loading: true } })
    const params = {
      page: refresh ? 1 : this.data.market.page,
      pageSize: this.data.market.pageSize,
      ...this.data.searchParams
    }
    volunteer.getActivityList(params).then(res => {
      const formattedRecords = (res.records || []).map(item => this.decorateActivity(item))
      const newList = refresh ? formattedRecords : [...this.data.market.list, ...formattedRecords]
      this.setData({
        market: {
          ...this.data.market,
          list: newList,
          total: res.total,
          page: refresh ? 2 : this.data.market.page + 1,
          hasMore: newList.length < res.total,
          loading: false
        },
        refreshing: false
      })
      wx.stopPullDownRefresh()
    }).catch(() => {
      this.setData({
        market: { ...this.data.market, loading: false },
        refreshing: false
      })
      wx.stopPullDownRefresh()
    })
  },
  loadSignupRecords(key, status, refresh = false) {
    const state = this.data[key]
    if (state.loading) return
    this.setData({ [key]: { ...state, loading: true } })
    const params = {
      page: refresh ? 1 : state.page,
      pageSize: state.pageSize
    }
    if (status !== '' && status !== undefined && status !== null) {
      params.status = status
    }
    volunteer.getSignupRecords(params).then(res => {
      const formattedRecords = (res.records || []).map(item => ({
        ...item,
        signupTimeDisplay: this.formatTime(item.signupTime || ''),
        auditTimeDisplay: this.formatTime(item.auditTime || ''),
        statusText: this.getSignupStatusText(item.status),
        statusClass: this.getSignupStatusClass(item.status),
        auditReason: item.auditReason || ''
      }))
      const newList = refresh ? formattedRecords : [...state.list, ...formattedRecords]
      this.setData({
        [key]: {
          ...state,
          list: newList,
          total: res.total,
          page: refresh ? 2 : state.page + 1,
          hasMore: newList.length < res.total,
          loading: false
        },
        refreshing: false
      })
      wx.stopPullDownRefresh()
    }).catch(() => {
      this.setData({
        [key]: { ...state, loading: false },
        refreshing: false
      })
      wx.stopPullDownRefresh()
    })
  },
  decorateActivity(item) {
    const isSignupClosed = this.isDeadlinePassed(item.signupDeadline)
    return {
      ...item,
      startTimeDisplay: this.formatTime(item.startTime),
      deadlineDisplay: this.formatTime(item.signupDeadline),
      isSignupClosed
    }
  },
  onSearchInput(e) {
    this.setData({
      'searchParams.title': e.detail.value
    })
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
    this.setData({
      market: { ...this.data.market, page: 1, hasMore: true }
    })
    this.loadMarketActivities(true)
  },
  viewActivityDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/volunteer/activity-detail/activity-detail?id=${id}`
    })
  },
  onSignup(e) {
    const rawId = e.currentTarget.dataset.id
    const activityId = Number(rawId) || rawId
    const activity = this.data.market.list.find(item => item.id === activityId || item.id === rawId)
    if (activity && activity.isSignupClosed) {
      wx.showToast({ title: '报名已截止', icon: 'none' })
      return
    }
    wx.showLoading({ title: '报名中...', mask: true })
    volunteer.signupActivity({ activityId }).then(() => {
      wx.hideLoading()
      wx.showToast({ title: '报名成功', icon: 'success' })
      this.setData({ page: 1, hasMore: true })
      this.loadActivityList(true)
    }).catch((err) => {
      wx.hideLoading()
      const message = (err && err.msg) || '报名失败'
      wx.showToast({ title: message, icon: 'none' })
    })
  },
  formatTime(time) {
    if (!time) return ''
    return time.replace('T', ' ')
  },
  isDeadlinePassed(time) {
    if (!time) return false
    const date = new Date(time.replace(' ', 'T'))
    if (Number.isNaN(date.getTime())) return false
    return Date.now() > date.getTime()
  },
  getStatusText(status) {
    const map = { 0: '未开始', 1: '进行中', 2: '已结束', 3: '已取消' }
    return map[status] || '未知'
  },
  getStatusClass(status) {
    const map = { 0: 'status-pending', 1: 'status-active', 2: 'status-ended', 3: 'status-cancelled' }
    return map[status] || ''
  },
  getSignupStatusText(status) {
    const map = { 0: '待审核', 1: '审核通过', 2: '审核拒绝' }
    return map[status] || '未知'
  },
  getSignupStatusClass(status) {
    const map = { 0: 'audit-pending', 1: 'audit-approved', 2: 'audit-rejected' }
    return map[status] || ''
  }
})
