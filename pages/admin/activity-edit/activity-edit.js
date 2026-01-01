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
    leaderList: [], // 负责人列表
    leaderIndex: 0, // 当前选中的负责人索引
    // 时间显示字段（用于picker的value和显示）
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    deadlineDate: '',
    deadlineTime: '',
    form: {
      title: '',
      description: '',
      location: '',
      startTime: '',
      endTime: '',
      signupDeadline: '',
      requiredPeople: '',
      currentPeople: '0',
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
    // 先加载负责人列表，再加载活动信息
    this.loadLeaderList().then(() => {
      this.loadActivity()
    }).catch(() => {
      // 即使负责人列表加载失败，也继续加载活动信息
      this.loadActivity()
    })
  },

  loadLeaderList() {
    return admin.getLeaderList().then(res => {
      const leaderList = res || []
      this.setData({ leaderList })
      return leaderList
    }).catch(err => {
      console.error('加载负责人列表失败:', err)
      wx.showToast({ title: '加载负责人列表失败', icon: 'none' })
      return []
    })
  },

  loadActivity() {
    wx.showLoading({ title: '加载中...' })
    admin.getActivityById(this.data.activityId).then(res => {
      const activity = res
      if (activity) {
        const statusIndex = this.data.statusOptions.findIndex(opt => opt.value === activity.status)
        
        // 根据负责人ID找到对应的索引
        const leaderId = activity.leaderId ? parseInt(activity.leaderId, 10) : null
        let leaderIndex = 0
        if (leaderId && this.data.leaderList.length > 0) {
          const foundIndex = this.data.leaderList.findIndex(leader => leader.id === leaderId)
          leaderIndex = foundIndex >= 0 ? foundIndex : 0
        }
        
        // 格式化时间字段，处理多种时间格式
        const formatTimeForPicker = (timeStr) => {
          if (!timeStr) return ''
          // 如果已经是 ISO 格式（包含T），直接返回
          if (timeStr.includes('T')) {
            return timeStr
          }
          // 如果是标准格式 "YYYY-MM-DD HH:mm:ss" 或 "YYYY-MM-DD HH:mm"，替换空格为T
          if (timeStr.includes(' ')) {
            return timeStr.replace(' ', 'T')
          }
          // 如果只是日期格式 "YYYY-MM-DD"，添加默认时间
          if (/^\d{4}-\d{2}-\d{2}$/.test(timeStr)) {
            return `${timeStr}T00:00`
          }
          return timeStr
        }
        
        // 从时间字符串中提取日期和时间部分
        const extractDateAndTime = (timeStr) => {
          if (!timeStr) return { date: '', time: '' }
          const formatted = formatTimeForPicker(timeStr)
          if (formatted.includes('T')) {
            const parts = formatted.split('T')
            return {
              date: parts[0] || '',
              time: parts[1] ? parts[1].substring(0, 5) : '' // 只取 HH:mm，去掉秒
            }
          }
          return { date: '', time: '' }
        }
        
        const startDateTime = extractDateAndTime(activity.startTime)
        const endDateTime = extractDateAndTime(activity.endTime)
        const deadlineDateTime = extractDateAndTime(activity.signupDeadline)
        
        this.setData({
          statusIndex: statusIndex >= 0 ? statusIndex : 0,
          leaderIndex: leaderIndex,
          // 时间显示字段
          startDate: startDateTime.date,
          startTime: startDateTime.time,
          endDate: endDateTime.date,
          endTime: endDateTime.time,
          deadlineDate: deadlineDateTime.date,
          deadlineTime: deadlineDateTime.time,
          form: {
            title: activity.title || '',
            description: activity.description || '',
            location: activity.location || '',
            startTime: formatTimeForPicker(activity.startTime),
            endTime: formatTimeForPicker(activity.endTime),
            signupDeadline: formatTimeForPicker(activity.signupDeadline),
            requiredPeople: activity.requiredPeople !== undefined && activity.requiredPeople !== null ? activity.requiredPeople.toString() : '',
            currentPeople: activity.currentPeople !== undefined && activity.currentPeople !== null ? activity.currentPeople.toString() : '0',
            leaderId: activity.leaderId ? activity.leaderId.toString() : '',
            status: activity.status !== undefined ? activity.status : 0
          }
        })
      } else {
        wx.showToast({ title: '活动不存在', icon: 'none' })
        setTimeout(() => wx.navigateBack(), 1500)
      }
      wx.hideLoading()
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({ title: '加载失败', icon: 'none' })
      console.error('加载活动详情失败:', err)
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
    // 获取对应的时间字段值
    let timeValue = ''
    if (field === 'startTime') {
      timeValue = this.data.startTime || '00:00'
      this.setData({ startDate: date })
    } else if (field === 'endTime') {
      timeValue = this.data.endTime || '00:00'
      this.setData({ endDate: date })
    } else if (field === 'signupDeadline') {
      timeValue = this.data.deadlineTime || '00:00'
      this.setData({ deadlineDate: date })
    }
    this.setData({
      [`form.${field}`]: `${date}T${timeValue}`
    })
  },

  onTimeChange(e) {
    const { field } = e.currentTarget.dataset
    const time = e.detail.value
    // 获取对应的日期字段值
    let dateValue = ''
    if (field === 'startTime') {
      dateValue = this.data.startDate || new Date().toISOString().split('T')[0]
      this.setData({ startTime: time })
    } else if (field === 'endTime') {
      dateValue = this.data.endDate || new Date().toISOString().split('T')[0]
      this.setData({ endTime: time })
    } else if (field === 'signupDeadline') {
      dateValue = this.data.deadlineDate || new Date().toISOString().split('T')[0]
      this.setData({ deadlineTime: time })
    }
    this.setData({
      [`form.${field}`]: `${dateValue}T${time}`
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

  onLeaderChange(e) {
    const index = parseInt(e.detail.value, 10)
    const leaderList = this.data.leaderList
    if (leaderList && leaderList[index]) {
      const selectedLeader = leaderList[index]
      this.setData({
        leaderIndex: index,
        'form.leaderId': selectedLeader.id.toString()
      })
    }
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
    if (!form.leaderId || form.leaderId === '0' || form.leaderId === '') {
      wx.showToast({ title: '请选择负责人', icon: 'none' })
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
