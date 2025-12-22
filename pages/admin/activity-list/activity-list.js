const { admin } = require('../../../utils/api')

Page({
  data: {
    activityList: [],
    page: 1,
    pageSize: 10,
    total: 0,
    loading: false,
    hasMore: true,
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
    if (this.data.loading) return
    this.setData({ loading: true })
    const params = {
      page: refresh ? 1 : this.data.page,
      pageSize: this.data.pageSize,
      ...this.data.searchParams
    }
    admin.getActivityList(params).then(res => {
      const newList = refresh ? res.records : [...this.data.activityList, ...res.records]
      this.setData({
        activityList: newList,
        total: res.total,
        page: refresh ? 2 : this.data.page + 1,
        hasMore: newList.length < res.total,
        loading: false
      })
      if (refresh) {
        wx.stopPullDownRefresh()
      }
    }).catch(err => {
      this.setData({ loading: false })
      if (refresh) {
        wx.stopPullDownRefresh()
      }
    })
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
    this.setData({ page: 1, hasMore: true })
    this.loadActivityList(true)
  },
  editActivity(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/admin/activity-edit/activity-edit?id=${id}`
    })
  },
  formatTime(time) {
    if (!time) return ''
    return time.replace('T', ' ')
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

