const { admin } = require('../../../utils/api')

Page({
  data: {
    userList: [],
    page: 1,
    pageSize: 10,
    total: 0,
    loading: false,
    hasMore: true,
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
    ]
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
    this.setData({ loading: true })
    const params = {
      page: refresh ? 1 : this.data.page,
      pageSize: this.data.pageSize,
      ...this.data.searchParams
    }
    admin.getUserList(params).then(res => {
      const newList = refresh ? res.records : [...this.data.userList, ...res.records]
      this.setData({
        userList: newList,
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
  onNameInput(e) {
    this.setData({
      'searchParams.name': e.detail.value
    })
  },
  onCollegeInput(e) {
    this.setData({
      'searchParams.college': e.detail.value
    })
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

