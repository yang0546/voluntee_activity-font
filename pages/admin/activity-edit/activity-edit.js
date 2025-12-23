const { admin } = require('../../../utils/api')

Page({
  data: {
    activityId: null,
    statusIndex: 0,
    statusOptions: [
      { label: '未开始', value: 0 },
      { label: '进行中', value: 1 },
      { label: '已结束', value: 2 },
      { label: '已取消', value: 3 }
    ],
    form: {
      title: '',
      description: '',
      location: '',
      startTime: '',
      endTime: '',
      signupDeadline: '',
      requiredPeople: '',
      currentPeople: '',
      leaderId: '',
      status: 0
    },
    loading: false
  },

  onLoad(options) {
    if (!options.id) {
      wx.showToast({ title: '仅支持编辑已有活动', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 800)
      return
    }
    this.setData({ activityId: options.id })
    wx.setNavigationBarTitle({ title: '编辑活动' })
    this.loadActivity()
  },

  loadActivity() {
    wx.showLoading({ title: '加载中...' })
    admin.getActivityList({ page: 1, pageSize: 1000 }).then(res => {
      const records = res.records || []
      const activity = records.find(item => item.id == this.data.activityId)
      if (activity) {
        const statusIndex = this.data.statusOptions.findIndex(opt => opt.value === activity.status)
        this.setData({
          statusIndex: statusIndex >= 0 ? statusIndex : 0,
          form: {
            title: activity.title,
            description: activity.description,
            location: activity.location,
            startTime: activity.startTime.replace(' ', 'T'),
            endTime: activity.endTime.replace(' ', 'T'),
            signupDeadline: activity.signupDeadline.replace(' ', 'T'),
            requiredPeople: activity.requiredPeople.toString(),
            currentPeople: activity.currentPeople.toString(),
            leaderId: activity.leaderId.toString(),
            status: activity.status
          }
        })
      }
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

  onStatusChange(e) {
    const index = e.detail.value
    const status = this.data.statusOptions[index].value
    this.setData({
      statusIndex: index,
      'form.status': status
    })
  },

  handleSubmit() {
    const { form, activityId, loading } = this.data
    if (loading) return
    if (!activityId) {
      wx.showToast({ title: '缺少活动ID', icon: 'none' })
      return
    }
    if (!form.title || !form.description || !form.location) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }
    wx.showLoading({ title: '保存中...' })
    this.setData({ loading: true })
    const submitData = {
      ...form,
      requiredPeople: parseInt(form.requiredPeople || '0', 10),
      currentPeople: parseInt(form.currentPeople || '0', 10),
      leaderId: parseInt(form.leaderId || '0', 10)
    }
    if (submitData.startTime) submitData.startTime = submitData.startTime.replace('T', ' ')
    if (submitData.endTime) submitData.endTime = submitData.endTime.replace('T', ' ')
    if (submitData.signupDeadline) submitData.signupDeadline = submitData.signupDeadline.replace('T', ' ')
    submitData.id = activityId
    admin.updateActivity(submitData).then(() => {
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
