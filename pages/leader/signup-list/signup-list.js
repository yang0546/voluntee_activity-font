const { leader } = require('../../../utils/api')

Page({
  data: {
    activityId: null,
    signupList: [],
    page: 1,
    pageSize: 10,
    total: 0,
    loading: false,
    hasMore: true,
    statusIndex: 0,
    statusOptions: [
      { label: '全部状态', value: '' },
      { label: '待审核', value: 0 },
      { label: '审核通过', value: 1 },
      { label: '审核拒绝', value: 2 }
    ],
    searchParams: {
      status: ''
    },
    showRejectModal: false,
    rejectReason: '',
    currentSignupId: null
  },
  onLoad(options) {
    if (options.activityId) {
      this.setData({ activityId: options.activityId })
      this.loadSignupList(true)
    } else {
      this.loadSignupList(true)
    }
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
    leader.getSignupRecords(params).then(res => {
      const newList = refresh ? res.records : [...this.data.signupList, ...res.records]
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
    }).catch(err => {
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
  auditSignup(e) {
    const signupid = Number(e.currentTarget.dataset.signupid)
    const status = Number(e.currentTarget.dataset.status)
    if (status === 2) {
      this.setData({
        showRejectModal: true,
        rejectReason: '',
        currentSignupId: signupid
      })
      return
    }
    const statusText = '通过'
    wx.showModal({
      title: `审核${statusText}`,
      content: `确定要${statusText}此报名申请吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '审核中...' })
          leader.auditSignup({
            signupId: signupid,
            status: status,
            auditReason: ''
          }).then(() => {
            wx.hideLoading()
            wx.showToast({ title: `审核${statusText}成功`, icon: 'success' })
            this.loadSignupList(true)
          }).catch(err => {
            wx.hideLoading()
          })
        }
      }
    })
  },
  onRejectReasonInput(e) {
    this.setData({ rejectReason: e.detail.value })
  },
  confirmReject() {
    if (!this.data.rejectReason.trim()) {
      wx.showToast({ title: '请填写拒绝原因', icon: 'none' })
      return
    }
    wx.showLoading({ title: '审核中...' })
    leader.auditSignup({
      signupId: Number(this.data.currentSignupId),
      status: 2,
      auditReason: this.data.rejectReason.trim()
    }).then(() => {
      wx.hideLoading()
      wx.showToast({ title: '审核拒绝成功', icon: 'success' })
      this.setData({ showRejectModal: false, rejectReason: '', currentSignupId: null })
      this.loadSignupList(true)
    }).catch(() => {
      wx.hideLoading()
    })
  },
  cancelReject() {
    this.setData({ showRejectModal: false, rejectReason: '', currentSignupId: null })
  },
  formatTime(time) {
    if (!time) return ''
    return time.replace('T', ' ')
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

