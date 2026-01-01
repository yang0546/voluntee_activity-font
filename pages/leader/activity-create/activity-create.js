const { leader } = require('../../../utils/api')

Page({
  data: {
    submitting: false,
    form: {
      title: '',
      description: '',
      location: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      deadlineDate: '',
      deadlineTime: '',
      requiredPeople: ''
    }
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  onDateChange(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  onTimeChange(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  submit() {
    if (this.data.submitting) return
    const msg = this.validate()
    if (msg) {
      wx.showToast({ title: msg, icon: 'none' })
      return
    }

    const payload = this.buildPayload()
    this.setData({ submitting: true })
    leader.createActivity(payload).then(() => {
      wx.showToast({ title: '创建成功', icon: 'success' })
      setTimeout(() => {
        wx.reLaunch({ url: '/pages/leader/my-activities/my-activities' })
      }, 400)
    }).catch(err => {
      console.error('createActivity error', err)
      wx.showToast({ title: '创建失败，请稍后重试', icon: 'none' })
    }).finally(() => {
      this.setData({ submitting: false })
    })
  },

  validate() {
    const f = this.data.form
    if (!f.title.trim()) return '请输入活动标题'
    if (!f.description.trim()) return '请输入活动说明'
    if (!f.location.trim()) return '请输入活动地点'
    if (!f.startDate || !f.startTime) return '请选择开始日期/时间'
    if (!f.endDate || !f.endTime) return '请选择结束日期/时间'
    if (!f.deadlineDate || !f.deadlineTime) return '请选择报名截止时间'
    if (!f.requiredPeople || Number(f.requiredPeople) <= 0) return '请输入有效的所需人数'

    const start = new Date(`${f.startDate} ${f.startTime}:00`).getTime()
    const end = new Date(`${f.endDate} ${f.endTime}:00`).getTime()
    const deadline = new Date(`${f.deadlineDate} ${f.deadlineTime}:00`).getTime()
    if (isNaN(start) || isNaN(end) || isNaN(deadline)) return '时间格式错误'
    if (deadline > start) return '报名截止不能晚于开始时间'
    if (end <= start) return '结束时间需晚于开始时间'
    return ''
  },

  buildPayload() {
    const f = this.data.form
    return {
      title: f.title.trim(),
      description: f.description.trim(),
      location: f.location.trim(),
      startTime: `${f.startDate} ${f.startTime}:00`,
      endTime: `${f.endDate} ${f.endTime}:00`,
      signupDeadline: `${f.deadlineDate} ${f.deadlineTime}:00`,
      requiredPeople: Number(f.requiredPeople)
      // leaderId 由后端从 token 获取
    }
  }
})
