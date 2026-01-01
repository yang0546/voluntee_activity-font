const { leader } = require('../../../utils/api')

Page({
  data: {
    activityId: null,
    submitting: false,
    userOptions: [],
    userIndex: 0,
    form: {
      userId: '',
      content: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: ''
    }
  },

  onLoad(options) {
    const { activityId } = options || {}
    if (!activityId) {
      wx.showToast({ title: '缺少活动ID', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 800)
      return
    }
    this.setData({ activityId })
    this.loadUsers(activityId)
  },

  loadUsers(activityId) {
    console.log('task-list loadUsers -> activityId:', activityId)
    leader.getUserList(activityId).then(res => {
      // 后端返回示例：[{id:4,name:'张三'},{id:13,name:'Kilig'}]
      const rawList = (res && res.data) || res || []
      const list = Array.isArray(rawList) ? rawList : []
      const normalized = list.map((item, idx) => {
        if (typeof item === 'string') {
          return { id: idx + 1, name: item }
        }
        return {
          id: item.id || item.userId || idx + 1,
          name: item.name || item.userName || `用户${item.id || item.userId || idx + 1}`
        }
      })
      this.setData({
        userOptions: normalized,
        userIndex: 0,
        'form.userId': normalized[0] ? normalized[0].id : ''
      })
      if (!normalized.length) {
        wx.showToast({ title: '暂无可分配志愿者', icon: 'none' })
      }
    }).catch(() => {
      wx.showToast({ title: '获取用户列表失败', icon: 'none' })
    })
  },

  onUserChange(e) {
    const idx = Number(e.detail.value)
    const user = this.data.userOptions[idx]
    this.setData({
      userIndex: idx,
      'form.userId': user ? user.id : ''
    })
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
    leader.taskAssign(payload).then(() => {
      wx.showToast({ title: '创建成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 500)
    }).catch(err => {
      console.error('taskAssign error', err)
      wx.showToast({ title: '创建失败，请稍后重试', icon: 'none' })
    }).finally(() => {
      this.setData({ submitting: false })
    })
  },

  validate() {
    const f = this.data.form
    if (!f.userId) return '请选择志愿者'
    if (!f.content.trim()) return '请输入任务内容'
    if (!f.startDate || !f.startTime) return '请选择开始时间'
    if (!f.endDate || !f.endTime) return '请选择结束时间'
    const start = new Date(`${f.startDate} ${f.startTime}:00`).getTime()
    const end = new Date(`${f.endDate} ${f.endTime}:00`).getTime()
    if (isNaN(start) || isNaN(end)) return '时间格式错误'
    if (end <= start) return '结束时间需晚于开始时间'
    return ''
  },

  buildPayload() {
    const f = this.data.form
    return {
      activityId: Number(this.data.activityId),
      userId: Number(f.userId),
      content: f.content.trim(),
      startTime: `${f.startDate} ${f.startTime}:00`,
      endTime: `${f.endDate} ${f.endTime}:00`
    }
  }
})
