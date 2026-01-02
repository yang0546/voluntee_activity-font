const { volunteer } = require('../../../utils/api')

const SIGNUP_STATUS = {
  0: { text: '待审核', className: 'status-pending' },
  1: { text: '已通过', className: 'status-approved' },
  2: { text: '已拒绝', className: 'status-rejected' }
}

const ACTIVITY_STATUS = {
  0: { text: '未开始', className: 'status-pending' },
  1: { text: '进行中', className: 'status-ongoing' },
  2: { text: '已结束', className: 'status-rejected' },
  3: { text: '已取消', className: 'status-rejected' }
}

Page({
  data: {
    profile: {},
    signupSummary: {
      total: 0,
      pending: 0,
      approved: 0
    },
    mySignups: [],
    highlightActivities: [],
    pendingTaskCount: 0
  },
  onShow() {
    this.initPage()
  },
  onPullDownRefresh() {
    this.initPage(true)
  },
  async initPage(isRefresh = false) {
    const profile = wx.getStorageSync('userProfile') || {}
    this.setData({ profile })
    wx.showNavigationBarLoading()
    await Promise.all([
      this.fetchSignupRecords(),
      this.fetchHighlightActivities(),
      this.fetchPendingTasks()
    ])
    wx.hideNavigationBarLoading()
    if (isRefresh) {
      wx.stopPullDownRefresh()
    }
  },
  async fetchSignupRecords() {
    try {
      const res = await volunteer.getSignupRecords({ page: 1, pageSize: 20 })
      const records = (res && res.records) || []
      const summary = records.reduce(
        (acc, cur) => {
          acc.total += 1
          if (cur.status === 0) acc.pending += 1
          if (cur.status === 1) acc.approved += 1
          return acc
        },
        { total: 0, pending: 0, approved: 0 }
      )
      const mapped = records.slice(0, 5).map(item => {
        const meta = SIGNUP_STATUS[item.status] || { text: '未知', className: 'status-pending' }
        return {
          id: item.id,
          activityId: item.activityId,
          activityTitle: item.activityTitle || item.title || '志愿活动',
          createTime: item.createTime,
          statusText: meta.text,
          statusClass: meta.className
        }
      })
      this.setData({
        signupSummary: summary,
        mySignups: mapped
      })
    } catch (err) {
      console.error('load signup records failed', err)
      this.setData({
        signupSummary: { total: 2, pending: 1, approved: 1 },
        mySignups: [
          {
            id: 'mock-1',
            activityId: '1',
            activityTitle: '社区环保行动',
            createTime: '2024-03-10 09:00',
            statusText: '待审核',
            statusClass: 'status-pending'
          },
          {
            id: 'mock-2',
            activityId: '2',
            activityTitle: '图书馆秩序维护',
            createTime: '2024-03-05 14:00',
            statusText: '已通过',
            statusClass: 'status-approved'
          }
        ]
      })
    }
  },
  async fetchPendingTasks() {
    try {
      const res = await volunteer.getSignupRecords({ page: 1, pageSize: 100, status: 1 })
      const records = (res && res.records) || []
      const activityIds = [...new Set(records.map(item => item.activityId).filter(Boolean))]
      if (!activityIds.length) {
        this.setData({ pendingTaskCount: 0 })
        return
      }
      let pending = 0
      for (const id of activityIds) {
        try {
          const tasks = await volunteer.getTaskList(id)
          pending += (tasks || []).filter(t => t.status === 0 || t.status === 1).length
        } catch (err) {
          console.warn('load tasks for activity failed', id, err)
        }
      }
      this.setData({ pendingTaskCount: pending })
    } catch (err) {
      console.error('fetchPendingTasks failed', err)
      this.setData({ pendingTaskCount: 0 })
    }
  },
  async fetchHighlightActivities() {
    try {
      const res = await volunteer.getActivityList({ page: 1, pageSize: 5, status: 1 })
      const records = (res && res.records) || []
      const mapped = records.map(this.normalizeActivity)
      this.setData({ highlightActivities: mapped })
    } catch (err) {
      console.error('load activities failed', err)
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
        },
        {
          id: 'sample-2',
          title: '城市马拉松补给站',
          location: '滨江公园',
          startTime: '2024-03-20 07:00:00',
          endTime: '2024-03-20 12:00:00',
          currentPeople: 30,
          requiredPeople: 40,
          status: 1
        }
      ].map(this.normalizeActivity)
      this.setData({ highlightActivities: fallback })
    }
  },
  normalizeActivity(item) {
    const meta = ACTIVITY_STATUS[item.status] || { text: '待开始', className: 'status-pending' }
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
  },
  goSquare() {
    wx.switchTab({ url: '/pages/volunteer/activity-list/activity-list' })
  },
  goProfile() {
    wx.switchTab({ url: '/pages/volunteer/profile/profile' })
  },
  goMyActivities() {
    wx.navigateTo({ url: '/pages/volunteer/my-activities/my-activities' })
  },
  goRecords() {
    wx.navigateTo({ url: '/pages/volunteer/signup-records/signup-records' })
  },
  goActivityDetail(event) {
    const { id, activity } = event.currentTarget.dataset
    let url = `/pages/volunteer/activity-detail/activity-detail`
    const params = []
    if (id) params.push(`id=${id}`)
    if (activity) params.push(`data=${activity}`)
    if (params.length) {
      url += `?${params.join('&')}`
    }
    wx.navigateTo({ url })
  }
})

function formatTimeRange(startTime, endTime) {
  if (!startTime || !endTime) return '时间待定'
  const start = startTime.slice(5, 16).replace(' ', ' ')
  const end = endTime.slice(11, 16)
  return `${start} - ${end}`
}
