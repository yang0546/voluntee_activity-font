const { volunteer } = require('../../../../utils/api')

Page({
  data: {
    form: {
      name: '',
      phone: '',
      college: ''
    },
    loading: false
  },

  onLoad() {
    const profile = wx.getStorageSync('userProfile') || {}
    this.setData({
      form: {
        name: profile.name || '',
        phone: profile.phone || '',
        college: profile.college || ''
      }
    })
  },

  onInputChange(e) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [`form.${field}`]: e.detail.value
    })
  },

  async handleSubmit() {
    const { form, loading } = this.data
    if (loading) return

    const payload = {}
    if (form.name && form.name.trim()) payload.name = form.name.trim()
    if (form.phone && form.phone.trim()) payload.phone = form.phone.trim()
    if (form.college && form.college.trim()) payload.college = form.college.trim()

    if (!Object.keys(payload).length) {
      wx.showToast({ title: '请填写要修改的信息', icon: 'none' })
      return
    }

    if (payload.phone && !/^(1\d{10})$/.test(payload.phone)) {
      wx.showToast({ title: '手机号格式不正确', icon: 'none' })
      return
    }

    wx.showLoading({ title: '提交中...' })
    this.setData({ loading: true })
    try {
      await volunteer.updateInfo(payload)
      const profile = wx.getStorageSync('userProfile') || {}
      const updatedProfile = { ...profile, ...payload }
      wx.setStorageSync('userProfile', updatedProfile)
      const app = getApp()
      app.globalData = app.globalData || {}
      app.globalData.profile = updatedProfile

      wx.hideLoading()
      wx.showToast({ title: '修改成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 800)
    } catch (err) {
      wx.hideLoading()
      this.setData({ loading: false })
    }
  }
})
