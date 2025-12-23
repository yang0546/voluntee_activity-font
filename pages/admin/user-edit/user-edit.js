const { admin } = require('../../../utils/api')

Page({
  data: {
    userId: null,
    form: {
      name: '',
      phone: '',
      college: '',
      role: 0
    },
    roleIndex: 0,
    roleOptions: [
      { label: '志愿者', value: 0 },
      { label: '负责人', value: 1 },
      { label: '管理员', value: 2 }
    ],
    loading: false
  },

  onLoad(options) {
    if (!options.id) {
      wx.showToast({ title: '仅支持编辑已有用户', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 800)
      return
    }
    this.setData({ userId: options.id })
    wx.setNavigationBarTitle({ title: '编辑用户' })
    this.loadUser()
  },

  loadUser() {
    wx.showLoading({ title: '加载中...' })
    admin.getUserById(this.data.userId).then(res => {
      const roleIndex = this.data.roleOptions.findIndex(opt => opt.value === res.role)
      this.setData({
        roleIndex: roleIndex >= 0 ? roleIndex : 0,
        form: {
          name: res.name,
          phone: res.phone || '',
          college: res.college || '',
          role: res.role
        }
      })
      wx.hideLoading()
    }).catch(() => {
      wx.hideLoading()
    })
  },

  onInputChange(e) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [`form.${field}`]: e.detail.value
    })
  },

  onRoleChange(e) {
    const index = e.detail.value
    const role = this.data.roleOptions[index].value
    this.setData({
      roleIndex: index,
      'form.role': role
    })
  },

  handleSubmit() {
    const { form, userId, loading } = this.data
    if (loading) return
    if (!userId) {
      wx.showToast({ title: '缺少用户ID', icon: 'none' })
      return
    }
    if (!form.name) {
      wx.showToast({ title: '请填写姓名', icon: 'none' })
      return
    }
    wx.showLoading({ title: '保存中...' })
    this.setData({ loading: true })
    admin.updateUser({ id: userId, ...form }).then(() => {
      wx.hideLoading()
      wx.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => {
        wx.navigateBack()
      }, 1200)
    }).catch(() => {
      wx.hideLoading()
      this.setData({ loading: false })
    })
  }
})
