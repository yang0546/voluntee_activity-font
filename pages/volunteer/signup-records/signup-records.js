const { volunteer } = require('../../../utils/api')

Page({
  data: {
    signupList: [],
    page: 1,
    pageSize: 10,
    total: 0,
    loading: false,
    hasMore: true,
    activityId: null,
    statusIndex: 0,
    statusOptions: [
      { label: '全部状态', value: '' },
      { label: '待审核', value: 0 },
      { label: '审核通过', value: 1 },
      { label: '审核拒绝', value: 2 }
    ],
    searchParams: {
      status: ''
    }
  },
  onLoad(options) {
    if (options && options.activityId) {
      this.setData({ activityId: options.activityId })
    }
    this.loadSignupList(true)
  },
  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true })
    this.loadSignupList(true)
  },
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadSignupList(false)
    }
  },
  loadSignupList(refresh = false) {
    if (this.data.loading) return
    this.setData({ loading: true })
    const params = {
      page: refresh ? 1 : this.data.page,
      pageSize: this.data.pageSize,
      activityId: this.data.activityId,
      ...this.data.searchParams
    }
    volunteer.getSignupRecords(params).then(res => {
      const records = (res.records || []).map(item => ({
        ...item,
        signupTimeDisplay: this.formatTime(item.signupTime),
        auditTimeDisplay: this.formatTime(item.auditTime),
        startTimeDisplay: this.formatTime(item.startTime)
      }))
      const newList = refresh ? records : [...this.data.signupList, ...records]
      this.setData({
        signupList: newList,
        total: res.total,
        page: refresh ? 2 : this.data.page + 1,
        hasMore: newList.length < res.total,
        loading: false
      })
      if (refresh) {
        wx.stopPullDownRefresh()
      }
    }).catch(() => {
      this.setData({ loading: false })
      if (refresh) {
        wx.stopPullDownRefresh()
      }
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
    this.loadSignupList(true)
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
    const map = { 0: '待审核', 1: '审核通过', 2: '审核拒绝' }
    return map[status] || '未知'
  },
  getStatusClass(status) {
    const map = { 0: 'status-pending', 1: 'status-approved', 2: 'status-rejected' }
    return map[status] || ''
  }
})

