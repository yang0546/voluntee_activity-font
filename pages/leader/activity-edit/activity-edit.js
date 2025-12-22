const { leader } = require('../../../utils/api')

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
      status: 0
    },
    loading: false
  },
  onLoad(options) {
    if (options.id) {
      this.setData({ activityId: options.id })
      this.loadActivity()
    }
  },
  loadActivity() {
    wx.showLoading({ title: '加载中...' })
    leader.getSelfActivities({ page: 1, pageSize: 1000 }).then(res => {
      const activity = res.records.find(item => item.id == this.data.activityId)
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
            status: activity.status
          }
        })
      }
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
    const { form } = this.data
    if (!form.title || !form.description || !form.location) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }
    wx.showLoading({ title: '更新中...' })
    this.setData({ loading: true })
    const submitData = {
      id: this.data.activityId,
      ...form,
      requiredPeople: parseInt(form.requiredPeople),
      startTime: form.startTime.replace('T', ' '),
      endTime: form.endTime.replace('T', ' '),
      signupDeadline: form.signupDeadline.replace('T', ' ')
    }
    leader.updateActivity(submitData).then(() => {
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

