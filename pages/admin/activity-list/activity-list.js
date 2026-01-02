const { admin } = require('../../../utils/api')

Page({
  data: {
    welcomeName: '',
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
    ],
    activeNav: 'activity'
  },

  onShow() {
    this.setWelcomeName()
    // 每次显示页面时都刷新数据，确保能看到最新修改
    this.setData({ 
      page: 1, 
      hasMore: true,
      loading: false  // 清除loading状态，确保可以刷新
    })
    // 使用setTimeout确保页面完全显示后再刷新
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

  setWelcomeName() {
    const profile = wx.getStorageSync('userProfile') || {}
    const name = profile.userName || profile.name
    this.setData({ welcomeName: name || '管理员' })
  },

  loadActivityList(refresh = false) {
    // 如果是刷新操作，允许即使loading为true也继续执行
    if (this.data.loading && !refresh) return
    const nextPage = refresh ? 1 : this.data.page
    this.setData({ loading: true, refreshing: refresh })
    const params = {
      page: nextPage,
      pageSize: this.data.pageSize,
      ...this.data.searchParams
    }
    admin.getActivityList(params)
      .then(res => {
        const records = (res.records || []).map(item => {
          // 确保时间字段被正确格式化
          const startTimeDisplay = this.formatTime(item.startTime)
          const endTimeDisplay = this.formatTime(item.endTime)
          const deadlineDisplay = this.formatTime(item.signupDeadline)
          
          // 调试日志
          if (item.startTime && !startTimeDisplay) {
            console.warn('时间格式化失败 - startTime:', item.startTime, 'result:', startTimeDisplay)
          }
          
          return {
            ...item,
            startTimeDisplay: startTimeDisplay,
            endTimeDisplay: endTimeDisplay,
            deadlineDisplay: deadlineDisplay
          }
        })
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
      })
      .catch(() => {
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

  onNavChange(e) {
    const { key } = e.currentTarget.dataset
    if (key === 'activity') return
    wx.reLaunch({ url: '/pages/admin/user-list/user-list' })
  },

  editActivity(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/admin/activity-edit/activity-edit?id=${id}`
    })
  },

  formatTime(time) {
    if (!time || time === null || time === undefined || time === '') {
      return '未设置'
    }
    try {
      // 处理字符串时间
      let timeStr = String(time).trim()
      if (!timeStr || timeStr === 'null' || timeStr === 'undefined') {
        return '未设置'
      }
      
      // 如果格式是 "YYYY-MM-DD HH:mm:ss"，直接截取前16位显示
      const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/
      if (dateTimeRegex.test(timeStr)) {
        return timeStr.substring(0, 16) // 返回 "YYYY-MM-DD HH:mm"
      }
      
      // 如果格式是 "YYYY-MM-DD HH:mm"，直接返回
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(timeStr)) {
        return timeStr
      }
      
      // 如果包含T，先替换为空格
      if (timeStr.includes('T')) {
        timeStr = timeStr.replace('T', ' ')
        // 替换后再次检查格式
        if (dateTimeRegex.test(timeStr)) {
          return timeStr.substring(0, 16)
        }
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
      // 如果字符串太短，尝试返回原值
      return timeStr || '未设置'
    } catch (e) {
      console.error('formatTime error:', e, 'time:', time)
      // 如果出错，尝试简单处理
      const timeStr = String(time).replace('T', ' ').trim()
      if (timeStr.length >= 16) {
        return timeStr.substring(0, 16)
      }
      return timeStr || '未设置'
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

