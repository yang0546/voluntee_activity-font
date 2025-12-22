const { leader } = require('../../../utils/api')
const app = getApp()

Page({
  data: {
    form: {
      title: '',
      description: '',
      location: '',
      startTime: '',
      endTime: '',
      signupDeadline: '',
      requiredPeople: ''
    },
    loading: false
  },
  onLoad() {
    // 设置默认时间
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    this.setData({
      'form.startTime': this.formatDate(tomorrow),
      'form.endTime': this.formatDate(tomorrow),
      'form.signupDeadline': this.formatDate(now)
    })
  },
  onInputChange(e) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [`form.${field}`]: e.detail.value
    })
  },
  onDateChange(e) {
    const { field } = e.currentTarget.dataset
    const date = e.detail.value
    const currentTime = this.data.form[field] || ''
    const time = currentTime.includes('T') ? currentTime.split('T')[1] : ''
    this.setData({
      [`form.${field}`]: time ? `${date}T${time}` : `${date}T00:00`
    })
  },
  onTimeChange(e) {
    const { field } = e.currentTarget.dataset
    const time = e.detail.value
    const currentDate = this.data.form[field] || ''
    const date = currentDate.includes('T') ? currentDate.split('T')[0] : new Date().toISOString().split('T')[0]
    this.setData({
      [`form.${field}`]: `${date}T${time}`
    })
  },
  handleSubmit() {
    const { form } = this.data
    // 验证必填项
    if (!form.title || !form.description || !form.location || !form.startTime || !form.endTime || !form.signupDeadline || !form.requiredPeople) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }
    if (parseInt(form.requiredPeople) <= 0) {
      wx.showToast({ title: '人数必须大于0', icon: 'none' })
      return
    }
    const profile = app.globalData.profile || wx.getStorageSync('userProfile')
    if (!profile || !profile.id) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    wx.showLoading({ title: '创建中...' })
    this.setData({ loading: true })
    const submitData = {
      ...form,
      requiredPeople: parseInt(form.requiredPeople),
      leaderId: profile.id,
      startTime: form.startTime.replace('T', ' '),
      endTime: form.endTime.replace('T', ' '),
      signupDeadline: form.signupDeadline.replace('T', ' ')
    }
    leader.createActivity(submitData).then(() => {
      wx.hideLoading()
      wx.showToast({ title: '创建成功', icon: 'success' })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }).catch(err => {
      wx.hideLoading()
      this.setData({ loading: false })
    })
  },
  formatDate(date) {
    if (typeof date === 'string') return date
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hour}:${minute}`
  }
})

