const { admin } = require('../../../utils/api')

Page({
  data: {
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
    navTabs: [
      { key: 'user', label: '用户管理', page: '/pages/admin/user-list/user-list' },
      { key: 'activity', label: '活动管理', page: '/pages/admin/activity-list/activity-list' }
    ],
    activeNav: 'user'
  },

  onLoad() {
    this.loadUserList(true)
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true })
    this.loadUserList(true)
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadUserList(false)
    }
  },

  loadUserList(refresh = false) {
    if (this.data.loading) return
    const nextPage = refresh ? 1 : this.data.page
    this.setData({ loading: true, refreshing: refresh })
    const params = {
      page: nextPage,
      pageSize: this.data.pageSize,
      ...this.data.searchParams
    }
    admin.getUserList(params).then(res => {
      const records = res.records || []
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
    const { key, page } = e.currentTarget.dataset
    if (key === this.data.activeNav) return
    wx.redirectTo({ url: page })
  },

  editUser(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/admin/user-edit/user-edit?id=${id}`
    })
  },

  formatTime(time) {
    if (!time) return ''
    return time.replace('T', ' ')
  },

  getRoleText(role) {
    const map = { 0: '志愿者', 1: '负责人', 2: '管理员' }
    return map[role] || '未知'
  }
})
