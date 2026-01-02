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
    loading: false
  },
  onLoad(options) {
    const { data, id } = options || {}
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
    wx.showLoading({ title: '报名中...' })
    try {
      await volunteer.signupActivity({ activityId: this.data.activity.id })
      wx.showToast({ title: '报名成功', icon: 'success' })
      this.loadDetail(this.data.activity.id)
    } catch (err) {
      console.error('signup failed', err)
      wx.showToast({ title: err.msg || '报名失败，请稍后再试', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
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
