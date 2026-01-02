const { volunteer } = require('../../../utils/api')

const STATUS_META = {
  0: { text: '未开始', className: 'status-pending' },
  1: { text: '进行中', className: 'status-ongoing' },
  2: { text: '已结束', className: 'status-rejected' },
  3: { text: '已取消', className: 'status-rejected' }
}

Page({
  data: {
    activity: null,
    loading: false,
    signing: false,
    showTasks: false,
    showSignupButton: true,
    tasksLoading: false,
    tasks: [],
    updatingTaskId: ''
  },
  onLoad(options) {
    const { data, id, from } = options || {}
    const source = from || ''
    const fromMyActivities = source === 'my-activities'
    const fromRecords = source === 'signup-records'
    const hideSignup = fromMyActivities || fromRecords
    this.setData({
      showTasks: fromMyActivities,
      showSignupButton: !hideSignup
    })
    if (data) {
      try {
        const parsed = JSON.parse(decodeURIComponent(data))
        this.setData({ activity: this.normalizeActivity(parsed) })
      } catch (err) {
        console.warn('parse passed activity failed', err)
      }
    }
    if (id) {
      this.loadDetail(id)
    }
  },
  async loadDetail(id) {
    this.setData({ loading: true })
    try {
      const detail = await volunteer.getActivityById(id)
      if (detail) {
        this.setData({ activity: this.normalizeActivity(detail) })
        if (this.data.showTasks) {
          this.loadTasks(detail.id)
        }
      }
    } catch (err) {
      console.error('load activity detail failed', err)
      this.setData({
        activity: this.normalizeActivity({
          id,
          title: '志愿活动',
          description: '暂无活动介绍',
          currentPeople: 0,
          requiredPeople: 10,
          status: 0
        })
      })
    } finally {
      this.setData({ loading: false })
    }
  },
  async handleSignup() {
    if (!this.data.activity || !this.data.activity.id) return
    if (this.data.signing) return
    this.setData({ signing: true })
    wx.showLoading({ title: '报名中...', mask: true })
    try {
      await volunteer.signupActivity({ activityId: this.data.activity.id })
      wx.showToast({ title: '报名成功', icon: 'success' })
      this.loadDetail(this.data.activity.id)
    } catch (err) {
      console.error('signup failed', err)
      wx.showToast({ title: err.msg || '报名失败，请稍后再试', icon: 'none' })
    } finally {
      wx.hideLoading()
      this.setData({ signing: false })
    }
  },
  async loadTasks(activityId) {
    if (!activityId) return
    this.setData({ tasksLoading: true })
    try {
      const res = await volunteer.getTaskList(activityId)
      const list = (res || []).map(mapTask)
      this.setData({ tasks: list })
    } catch (err) {
      console.error('load tasks failed', err)
      this.setData({ tasks: [] })
    } finally {
      this.setData({ tasksLoading: false })
    }
  },
  async updateTaskStatus(event) {
    const { id, status } = event.currentTarget.dataset
    if (!id || status === undefined) return
    if (status === 2 || this.data.updatingTaskId) return
    const nextStatus = status === 0 ? 1 : 2
    const nextLabel = nextStatus === 1 ? '进行中' : '已完成'
    wx.showModal({
      title: '确认更新任务',
      content: `请根据实际完成情况推进任务，随意点击后果自负。是否将任务状态更新为“${nextLabel}”？`,
      confirmText: '确认',
      cancelText: '取消',
      success: async (res) => {
        if (!res.confirm) return
        this.setData({ updatingTaskId: id })
        wx.showLoading({ title: '更新中...', mask: true })
        try {
          await volunteer.updateTaskStatus({ taskId: id, status: nextStatus })
          wx.showToast({ title: '已更新', icon: 'success' })
          const tasks = this.data.tasks.map(t => {
            if (String(t.taskId) !== String(id)) return t
            return mapTask({ ...t, status: nextStatus })
          })
          this.setData({ tasks })
        } catch (err) {
          console.error('update task failed', err)
          wx.showToast({ title: err.msg || '更新失败', icon: 'none' })
        } finally {
          wx.hideLoading()
          this.setData({ updatingTaskId: '' })
        }
      }
    })
  },
  normalizeActivity(item) {
    const meta = STATUS_META[item.status] || STATUS_META[0]
    const current = Number(item.currentPeople || 0)
    const required = Number(item.requiredPeople || 0) || 1
    const progress = Math.min(100, Math.round((current / required) * 100))
    return {
      ...item,
      statusText: meta.text,
      statusClass: meta.className,
      progress,
      timeRange: formatTimeRange(item.startTime, item.endTime)
    }
  }
})

function formatTimeRange(start, end) {
  if (!start || !end) return '时间待定'
  const startShort = start.slice(5, 16).replace(' ', ' ')
  const endShort = end.slice(11, 16)
  return `${startShort} - ${endShort}`
}

function mapTask(item) {
  const STATUS_MAP = {
    0: { text: '未开始', className: 'status-pending' },
    1: { text: '进行中', className: 'status-ongoing' },
    2: { text: '已完成', className: 'status-approved' }
  }
  const meta = STATUS_MAP[item.status] || STATUS_MAP[0]
  return {
    ...item,
    taskId: item.taskId || item.id,
    statusText: meta.text,
    statusClass: meta.className,
    timeRange: formatTaskTime(item.startTime, item.endTime)
  }
}

function formatTaskTime(start, end) {
  if (!start || !end) return '时间待定'
  const startShort = start.slice(11, 16)
  const endShort = end.slice(11, 16)
  return `${startShort} - ${endShort}`
}
