const { admin } = require('../../../utils/api')

Page({
  data: {
    welcomeName: '',
    userList: [],
    page: 1,
    pageSize: 10,
    total: 0,
    loading: false,
    hasMore: true,
    refreshing: false,
    searchParams: {
      name: '',
      college: '',
      role: ''
    },
    roleIndex: 0,
    roleOptions: [
      { label: '全部角色', value: '' },
      { label: '志愿者', value: 0 },
      { label: '负责人', value: 1 },
      { label: '管理员', value: 2 }
    ],
    activeNav: 'user'
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
      this.loadUserList(true)
    }, 100)
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true })
    this.loadUserList(true)
  },

  onPageScroll() {
    // 页面滚动处理
  },

  setWelcomeName() {
    const profile = wx.getStorageSync('userProfile') || {}
    const name = profile.userName || profile.name
    this.setData({ welcomeName: name || '管理员' })
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadUserList(false)
    }
  },

  loadUserList(refresh = false) {
    // 如果是刷新操作，允许即使loading为true也继续执行
    if (this.data.loading && !refresh) return
    const nextPage = refresh ? 1 : this.data.page
    this.setData({ loading: true, refreshing: refresh })
    const params = {
      page: nextPage,
      pageSize: this.data.pageSize,
      ...this.data.searchParams
    }
    admin.getUserList(params).then(res => {
      const records = (res.records || []).map(item => {
        // 确保 role 字段被正确处理
        const role = item.role !== undefined && item.role !== null ? item.role : ''
        const roleText = this.getRoleText(role)
        
        // 处理注册时间字段，兼容 createTime 和 creatTime（后端可能拼写错误）
        const createTimeRaw = item.createTime || item.creatTime || null
        // 直接格式化时间，而不是在模板中调用方法
        const createTimeFormatted = this.formatDate(createTimeRaw)
        
        // 调试日志 - 检查注册时间字段
        console.log('用户数据:', {
          id: item.id,
          name: item.name || item.userName,
          createTimeRaw: createTimeRaw,
          createTimeFormatted: createTimeFormatted,
          itemKeys: Object.keys(item)
        })
        
        return {
          ...item,
          role: role,
          roleText: roleText,
          createTime: createTimeFormatted  // 使用格式化后的时间
        }
      })
      const newList = refresh ? records : [...this.data.userList, ...records]
      const total = res.total || newList.length
      this.setData({
        userList: newList,
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

  onNameInput(e) {
    this.setData({ 'searchParams.name': e.detail.value })
  },

  onCollegeInput(e) {
    this.setData({ 'searchParams.college': e.detail.value })
  },

  onRoleChange(e) {
    const index = e.detail.value
    const role = this.data.roleOptions[index].value
    this.setData({
      roleIndex: index,
      'searchParams.role': role,
      page: 1,
      hasMore: true
    })
    this.loadUserList(true)
  },

  onSearch() {
    this.setData({ page: 1, hasMore: true })
    this.loadUserList(true)
  },

  onResetFilters() {
    this.setData({
      searchParams: { name: '', college: '', role: '' },
      roleIndex: 0,
      page: 1,
      hasMore: true
    })
    this.loadUserList(true)
  },

  onNavChange(e) {
    const { key } = e.currentTarget.dataset
    if (key === 'user') return
    wx.switchTab({ url: '/pages/admin/activity-list/activity-list' })
  },

  editUser(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/admin/user-edit/user-edit?id=${id}`
    })
  },

  formatTime(time) {
    if (!time || time === null || time === undefined || time === '') return '未记录'
    try {
      // 处理字符串时间
      let timeStr = String(time)
      // 如果包含T，先替换
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
      // 如果解析失败，尝试简单格式化字符串
      if (timeStr.length >= 16) {
        return timeStr.substring(0, 16)
      }
      return timeStr || '未记录'
    } catch (e) {
      // 如果出错，尝试简单处理
      const timeStr = String(time).replace('T', ' ')
      return timeStr.length >= 16 ? timeStr.substring(0, 16) : (timeStr || '未记录')
    }
  },

  formatDate(time) {
    // 只返回年月日格式：YYYY-MM-DD
    if (!time || time === null || time === undefined || time === '') {
      return '未记录'
    }
    try {
      // 处理字符串时间
      let timeStr = String(time).trim()
      if (!timeStr || timeStr === 'null' || timeStr === 'undefined') {
        return '未记录'
      }
      
      // 优先处理ISO格式：2025-12-23T12:40:44，直接提取日期部分
      if (timeStr.includes('T')) {
        const datePart = timeStr.split('T')[0]
        // 验证格式是否为 YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
          return datePart
        }
      }
      
      // 处理标准格式：YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss
      if (/^\d{4}-\d{2}-\d{2}/.test(timeStr)) {
        // 直接截取前10位，即 YYYY-MM-DD
        return timeStr.substring(0, 10)
      }
      
      // 尝试解析为Date对象并格式化为 YYYY-MM-DD
      const date = new Date(time)
      if (!isNaN(date.getTime()) && date.getTime() > 0) {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }
      
      // 如果以上都失败，尝试截取前10位
      if (timeStr.length >= 10) {
        return timeStr.substring(0, 10)
      }
      
      return '未记录'
    } catch (e) {
      // 出错时尝试简单处理
      try {
        const timeStr = String(time).trim()
        if (timeStr.includes('T')) {
          const datePart = timeStr.split('T')[0]
          if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
            return datePart
          }
        }
        if (timeStr.length >= 10) {
          return timeStr.substring(0, 10)
        }
      } catch (e2) {
        // 忽略错误
      }
      return '未记录'
    }
  },

  getRoleText(role) {
    // 处理各种可能的 role 值
    if (role === null || role === undefined || role === '' || role === 'null' || role === 'undefined') {
      return '未知'
    }
    // 转换为数字进行比较
    const roleNum = Number(role)
    const map = { 0: '志愿者', 1: '负责人', 2: '管理员' }
    if (map.hasOwnProperty(roleNum)) {
      return map[roleNum]
    }
    // 如果 role 是字符串形式的数字
    if (map.hasOwnProperty(role)) {
      return map[role]
    }
    return '未知'
  }
})
