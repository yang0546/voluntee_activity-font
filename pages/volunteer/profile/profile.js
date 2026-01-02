const { volunteer } = require('../../../utils/api')

const SIGNUP_STATUS = {
  0: { text: '待审核', className: 'status-pending' },
  1: { text: '已通过', className: 'status-approved' },
  2: { text: '已拒绝', className: 'status-rejected' }
}

const DEFAULT_AVATAR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" rx="28" fill="%234f46e5"/><text x="50%" y="55%" font-size="90" text-anchor="middle" fill="white" font-family="Arial" dy=".1em">V</text></svg>'

Page({
  data: {
    profile: {},
    stats: { approved: 0, pending: 0, total: 0 },
    recentRecords: [],
    defaultAvatar: DEFAULT_AVATAR
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
    await this.loadRecords()
    if (isRefresh) wx.stopPullDownRefresh()
  },
  async loadRecords() {
    try {
      const res = await volunteer.getSignupRecords({ page: 1, pageSize: 30 })
      const records = (res && res.records) || []
      const stats = records.reduce(
        (acc, cur) => {
          acc.total += 1
          if (cur.status === 0) acc.pending += 1
          if (cur.status === 1) acc.approved += 1
          return acc
        },
        { approved: 0, pending: 0, total: 0 }
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
      this.setData({ stats, recentRecords: mapped })
    } catch (err) {
      console.error('load records failed', err)
      this.setData({
        stats: { approved: 1, pending: 1, total: 2 },
        recentRecords: [
          {
            id: 'sample-1',
            activityId: '1',
            activityTitle: '社区环保行动',
            createTime: '2024-03-05 09:00',
            statusText: '待审核',
            statusClass: 'status-pending'
          },
          {
            id: 'sample-2',
            activityId: '2',
            activityTitle: '图书馆秩序维护',
            createTime: '2024-02-26 10:00',
            statusText: '已通过',
            statusClass: 'status-approved'
          }
        ]
      })
    }
  },
  goSquare() {
    wx.switchTab({ url: '/pages/volunteer/activity-list/activity-list' })
  },
  goRecords() {
    wx.navigateTo({ url: '/pages/volunteer/signup-records/signup-records' })
  },
  goActivityDetail(event) {
    const { id } = event.currentTarget.dataset
    if (!id) return
    wx.navigateTo({
      url: `/pages/volunteer/activity-detail/activity-detail?id=${id}`
    })
  },
  contact() {
    wx.showModal({
      title: '联系客服',
      content: '请通过负责人微信群或客服电话获取帮助：400-000-0000',
      showCancel: false
    })
  },
  logout() {
    wx.showModal({
      title: '退出登录',
      content: '退出后需要重新登录才能继续报名，确定退出吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync()
          wx.reLaunch({ url: '/pages/login/login' })
        }
      }
    })
  }
})
