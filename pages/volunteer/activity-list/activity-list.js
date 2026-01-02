const { volunteer } = require('../../../utils/api')

const STATUS_META = {
  '': { text: '全部', className: 'status-ongoing' },
  0: { text: '未开始', className: 'status-pending' },
  1: { text: '进行中', className: 'status-ongoing' },
  2: { text: '已结束', className: 'status-rejected' },
  3: { text: '已取消', className: 'status-rejected' }
}

Page({
  data: {
    keyword: '',
    statusTabs: [
      { label: '全部', value: '' },
      { label: '未开始', value: 0 },
      { label: '进行中', value: 1 },
      { label: '已结束', value: 2 }
    ],
    activeStatus: '',
    activities: [],
    page: 1,
    pageSize: 10,
    total: 0,
    loading: false,
    hasMore: true
  },
  onLoad() {
    this.loadActivities(true)
  },
  onPullDownRefresh() {
    this.loadActivities(true)
  },
  onReachBottom() {
    if (!this.data.hasMore) return
    if (this.data.activities.length < this.data.total) {
      this.loadActivities()
    }
  },
  handleSearchInput(event) {
    this.setData({ keyword: event.detail.value })
  },
  handleSearchConfirm() {
    this.loadActivities(true)
  },
  changeStatus(event) {
    const value = event.currentTarget.dataset.value
    const normalized = value === '' ? '' : Number(value)
    this.setData({ activeStatus: normalized })
    this.loadActivities(true)
  },
  async loadActivities(reset = false) {
    if (this.data.loading || (!this.data.hasMore && !reset)) return
    const nextPage = reset ? 1 : this.data.page
    this.setData({ loading: true })
    try {
      const res = await volunteer.getActivityList({
        page: nextPage,
        pageSize: this.data.pageSize,
        status: this.data.activeStatus === '' ? '' : this.data.activeStatus,
        title: this.data.keyword || ''
      })
      const records = (res && res.records) || []
      const mapped = records.map(this.normalizeActivity)
      const list = reset ? mapped : this.data.activities.concat(mapped)
      const total = typeof res?.total === 'number' ? res.total : list.length
      const hasMore = typeof res?.total === 'number'
        ? list.length < total
        : records.length === this.data.pageSize
      this.setData({
        activities: list,
        total,
        page: nextPage + 1,
        hasMore
      })
    } catch (err) {
      console.error('load activities failed', err)
      if (reset) {
        const fallback = [
          {
            id: 'sample-1',
            title: '校园迎新志愿服务',
            location: '南校区礼堂',
            startTime: '2024-03-12 08:30:00',
            endTime: '2024-03-12 12:00:00',
            currentPeople: 12,
            requiredPeople: 20,
            status: 0
          }
        ].map(this.normalizeActivity)
        this.setData({
          activities: fallback,
          total: fallback.length,
          page: 2,
          hasMore: false
        })
      }
    } finally {
      this.setData({ loading: false })
      wx.stopPullDownRefresh()
    }
  },
  async handleSignup(event) {
    event.stopPropagation()
    const { id } = event.currentTarget.dataset
    if (!id) return
    wx.showLoading({ title: '报名中...' })
    try {
      await volunteer.signupActivity({ activityId: id })
      wx.showToast({ title: '报名成功', icon: 'success' })
      this.loadActivities(true)
    } catch (err) {
      console.error('signup failed', err)
      wx.showToast({ title: err.msg || '报名失败，请稍后再试', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },
  goDetail(event) {
    const { id, activity } = event.currentTarget.dataset
    let url = '/pages/volunteer/activity-detail/activity-detail'
    const params = []
    if (id) params.push(`id=${id}`)
    if (activity) params.push(`data=${activity}`)
    if (params.length) url += `?${params.join('&')}`
    wx.navigateTo({ url })
  },
  normalizeActivity(item) {
    const meta = STATUS_META[item.status] || STATUS_META['']
    const current = Number(item.currentPeople || 0)
    const required = Number(item.requiredPeople || 0) || 1
    const progress = Math.min(100, Math.round((current / required) * 100))
    const serialized = encodeURIComponent(JSON.stringify(item))
    return {
      ...item,
      statusText: meta.text,
      statusClass: meta.className,
      progress,
      timeRange: formatTimeRange(item.startTime, item.endTime),
      serialized
    }
  }
})

function formatTimeRange(start, end) {
  if (!start || !end) return '时间待定'
  const startShort = start.slice(5, 16).replace(' ', ' ')
  const endShort = end.slice(11, 16)
  return `${startShort} - ${endShort}`
}
