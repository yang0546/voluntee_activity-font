const { volunteer } = require('../../../utils/api')

Page({
  data: {
    list: []
  },
  onShow() {
    this.loadData()
  },
  onPullDownRefresh() {
    this.loadData()
  },
  async loadData() {
    try {
      const res = await volunteer.getSignupRecords({ page: 1, pageSize: 100, status: 1 })
      const records = (res && res.records) || []
      const approved = records
        .filter(item => item.status === 1)
        .map(mapApprovedRecord)
      this.setData({ list: approved })
    } catch (err) {
      console.error('load my activities failed', err)
      this.setData({ list: [] })
      wx.showToast({ title: '加载失败，请稍后再试', icon: 'none' })
    } finally {
      wx.stopPullDownRefresh()
    }
  },
  goDetail(event) {
    const { id } = event.currentTarget.dataset
    if (!id) return
    wx.navigateTo({
      url: `/pages/volunteer/activity-detail/activity-detail?id=${id}&from=my-activities`
    })
  }
})

function mapApprovedRecord(item) {
  const format = (v) => (v ? v.replace('T', ' ').slice(5, 16) : '')
  return {
    ...item,
    activityTitle: item.activityTitle || item.title || '志愿活动',
    startTimeText: format(item.startTime),
    signupDeadlineText: format(item.signupDeadline),
    signupTimeText: format(item.signupTime)
  }
}
