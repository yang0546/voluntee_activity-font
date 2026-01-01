const { leader } = require('../../../utils/api')

Page({
  data: {
    activityId: null,
    loading: true,
    submitting: false,
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
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      deadlineDate: '',
      deadlineTime: '',
      requiredPeople: '',
      status: 0
    }
  },

  onLoad(options) {
    const { id } = options || {}
    if (!id) {
      wx.showToast({ title: '缺少活动ID', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 800)
      return
    }
    this.setData({ activityId: id })
    this.loadDetail(id)
  },

  loadDetail(id) {
    leader.getActivityById(id).then(res => {
      const data = (res && res.data) || res || {}
      const parsed = this.parseActivity(data)
      this.setData({
        form: parsed.form,
        statusIndex: parsed.statusIndex,
        loading: false
      })
    }).catch(() => {
      this.setData({ loading: false })
      wx.showToast({ title: '获取活动详情失败', icon: 'none' })
    })
  },

  parseActivity(activity) {
    const {
      title = '',
      description = '',
      location = '',
      startTime = '',
      endTime = '',
      signupDeadline = '',
      requiredPeople = '',
      status = 0
    } = activity || {}

    const [startDate, startTimeStr] = this.splitDateTime(startTime)
    const [endDate, endTimeStr] = this.splitDateTime(endTime)
    const [deadlineDate, deadlineTime] = this.splitDateTime(signupDeadline)
    const statusIndex = this.statusOptionsFind(status)

    return {
      form: {
        title,
        description,
        location,
        startDate,
        startTime: startTimeStr,
        endDate,
        endTime: endTimeStr,
        deadlineDate,
        deadlineTime,
        requiredPeople: requiredPeople || '',
        status: typeof status === 'number' ? status : 0
      },
      statusIndex
    }
  },

  statusOptionsFind(status) {
    const idx = this.data.statusOptions.findIndex(item => item.value === status)
    return idx >= 0 ? idx : 0
  },

  splitDateTime(datetimeStr) {
    if (!datetimeStr) return ['', '']
    if (datetimeStr.includes(' ')) {
      const [date, time] = datetimeStr.split(' ')
      return [date || '', (time || '').substring(0, 5)]
    }
    if (datetimeStr.includes('T')) {
      const [date, time] = datetimeStr.split('T')
      return [date || '', (time || '').substring(0, 5)]
    }
    return [datetimeStr, '']
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

  onStatusChange(e) {
    const index = Number(e.detail.value)
    const status = this.data.statusOptions[index].value
    this.setData({
      statusIndex: index,
      'form.status': status
    })
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
    leader.updateActivity(payload).then(() => {
      wx.showToast({ title: '更新成功', icon: 'success' })
      setTimeout(() => {
        wx.navigateBack()
      }, 400)
    }).catch(err => {
      console.error('updateActivity error', err)
      wx.showToast({ title: '更新失败，请稍后重试', icon: 'none' })
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
      id: Number(this.data.activityId),
      title: f.title.trim(),
      description: f.description.trim(),
      location: f.location.trim(),
      startTime: `${f.startDate} ${f.startTime}:00`,
      endTime: `${f.endDate} ${f.endTime}:00`,
      signupDeadline: `${f.deadlineDate} ${f.deadlineTime}:00`,
      requiredPeople: Number(f.requiredPeople),
      status: f.status
    }
  }
})
