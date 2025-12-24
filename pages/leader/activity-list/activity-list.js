const { leader } = require('../../../utils/api')

Page({
  data: {
    activityList: [],
    page: 1,
    pageSize: 10,
    total: 0,
    loading: false,
    hasMore: true,
    statusIndex: 0,
    statusOptions: [
      { label: '全部状态', value: '' },
      { label: '未开始', value: 0 },
      { label: '进行中', value: 1 },
      { label: '已结束', value: 2 },
      { label: '已取消', value: 3 }
    ],
    searchParams: {
      title: ''
    },
    showSelfOnly: false
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
    const api = this.data.showSelfOnly ? leader.getSelfActivities : leader.getActivityList
    api(params).then(res => {
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
  toggleSelfOnly() {
    this.setData({
      showSelfOnly: !this.data.showSelfOnly,
      page: 1,
      hasMore: true
    })
    this.loadActivityList(true)
  },
  onSearchInput(e) {
    this.setData({
      'searchParams.title': e.detail.value
    })
  },
  onSearch() {
    this.setData({ page: 1, hasMore: true })
    this.loadActivityList(true)
  },
  createActivity() {
    wx.navigateTo({
      url: '/pages/leader/activity-create/activity-create'
    })
  },
  viewActivityDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/leader/activity-detail/activity-detail?id=${id}`
    })
  },
  viewSignupList(e) {
    const id = e.currentTarget.dataset.id
    const storedProfile = wx.getStorageSync('userProfile') || {}
    const leaderId = storedProfile.id || wx.getStorageSync('userId')
    const ownerId = e.currentTarget.dataset.leaderid || e.currentTarget.dataset.ownerid
    const canCheck = ownerId && leaderId
    if (canCheck && Number(ownerId) !== Number(leaderId)) {
      wx.showToast({
        title: '您不是该活动的负责人，无权限查看该活动报名记录',
        icon: 'none',
        duration: 2000
      })
      return
    }
    wx.navigateTo({
      url: `/pages/leader/signup-list/signup-list?activityId=${id}`
    })
  },
  formatTime(time) {
    if (!time || time === null || time === undefined || time === '') return '未设置'
    try {
      // 处理字符串时间
      let timeStr = String(time).trim()
      if (!timeStr) return '未设置'
      
      // 如果格式是 "YYYY-MM-DD HH:mm:ss"，直接截取前16位显示
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(timeStr)) {
        return timeStr.substring(0, 16) // 返回 "YYYY-MM-DD HH:mm"
      }
      
      // 如果包含T，先替换为空格
      if (timeStr.includes('T')) {
        timeStr = timeStr.replace('T', ' ')
      }
      
      // 尝试解析为Date对象
      const date = new Date(time)
      if (!isNaN(date.getTime()) && date.getTime() > 0) {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hour = String(date.getHours()).padStart(2, '0')
        const minute = String(date.getMinutes()).padStart(2, '0')
        return `${year}-${month}-${day} ${hour}:${minute}`
      }
      
      // 如果解析失败，尝试简单格式化字符串（截取前16位）
      if (timeStr.length >= 16) {
        return timeStr.substring(0, 16)
      }
      return timeStr || '未设置'
    } catch (e) {
      // 如果出错，尝试简单处理
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

