const { leader } = require('../../../utils/api')

Page({
  data: {
    signupList: [],
    page: 1,
    pageSize: 10,
    total: 0,
    loading: false,
    hasMore: true,
    refreshing: false,
    statusIndex: 0,
    statusOptions: [
      { label: '全部', value: '' },
      { label: '待审核', value: 0 },
      { label: '已通过', value: 1 },
      { label: '已拒绝', value: 2 }
    ],
    searchParams: {
      activityId: '',
      status: ''
    }
  },

  onLoad() {
    this.loadSignupList(true)
  },

  onShow() {
    this.setData({
      page: 1,
      hasMore: true,
      loading: false
    })
    setTimeout(() => {
      this.loadSignupList(true)
    }, 100)
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
    if (this.data.loading && !refresh) return
    const nextPage = refresh ? 1 : this.data.page
    this.setData({ loading: true, refreshing: refresh })
    const params = {
      page: nextPage,
      pageSize: this.data.pageSize,
      ...this.data.searchParams
    }
    leader.getSignupRecords(params).then(res => {
      const records = (res.records || []).map(item => ({
        ...item,
        signupTimeDisplay: this.formatDate(item.signupTime || item.createTime),
        rejectReason: item.auditReason || '未填写原因',
        statusText: this.getStatusText(item.status),
        statusClass: this.getStatusClass(item.status)
      }))
      const newList = refresh ? records : [...this.data.signupList, ...records]
      const total = res.total || newList.length
      this.setData({
        signupList: newList,
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

  auditSignup(e) {
    const { id, status } = e.currentTarget.dataset
    if (status === 1) {
      wx.showModal({
        title: '确认通过',
        content: '确定要通过该报名申请吗？',
        success: (res) => {
          if (res.confirm) {
            this.submitAudit(id, status, '审核通过')
          }
        }
      })
    } else {
      wx.showModal({
        title: '填写拒绝原因',
        editable: true,
        placeholderText: '请输入拒绝原因',
        success: (res) => {
          if (res.confirm) {
            const reason = (res.content || '').trim() || '审核拒绝'
            this.submitAudit(id, status, reason)
          }
        }
      })
    }
  },

  submitAudit(signupId, status, auditReason = '') {
    wx.showLoading({ title: '处理中...' })
    leader.auditSignup({
      signupId: signupId,
      status: status,
      auditReason: auditReason || (status === 1 ? '审核通过' : '审核拒绝')
    }).then(() => {
      wx.hideLoading()
      wx.showToast({ title: '审核成功', icon: 'success' })
      this.setData({ page: 1, hasMore: true })
      this.loadSignupList(true)
    }).catch(() => {
      wx.hideLoading()
      wx.showToast({ title: '审核失败', icon: 'none' })
    })
  },

  formatDate(time) {
    if (time === null || time === undefined || time === '') return '未设置'
    try {
      let timeStr = String(time).trim()
      if (!timeStr || timeStr === 'null' || timeStr === 'undefined') {
        return '未设置'
      }
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(timeStr)) {
        return timeStr.substring(0, 10)
      }
      if (timeStr.includes('T')) {
        timeStr = timeStr.replace('T', ' ')
      }
      const date = new Date(time)
      if (!isNaN(date.getTime()) && date.getTime() > 0) {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }
      if (timeStr.length >= 10) {
        return timeStr.substring(0, 10)
      }
      return timeStr || '未设置'
    } catch (e) {
      const timeStr = String(time).replace('T', ' ').trim()
      return timeStr.length >= 10 ? timeStr.substring(0, 10) : (timeStr || '未设置')
    }
  },

  getStatusText(status) {
    const map = { 0: '待审核', 1: '已通过', 2: '已拒绝' }
    return map[status] || '未知'
  },

  getStatusClass(status) {
    const map = { 0: 'status-pending', 1: 'status-approved', 2: 'status-rejected' }
    return map[status] || ''
  }
})
