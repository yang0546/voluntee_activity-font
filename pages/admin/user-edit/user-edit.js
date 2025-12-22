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
    if (options.id) {
      this.setData({ userId: options.id })
      this.loadUser()
    }
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
    }).catch(err => {
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
    const { form } = this.data
    if (!form.name) {
      wx.showToast({ title: '请填写姓名', icon: 'none' })
      return
    }
    wx.showLoading({ title: '更新中...' })
    this.setData({ loading: true })
    admin.updateUser({
      id: this.data.userId,
      ...form
    }).then(() => {
      wx.hideLoading()
      wx.showToast({ title: '更新成功', icon: 'success' })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }).catch(err => {
      wx.hideLoading()
      this.setData({ loading: false })
    })
  }
})

