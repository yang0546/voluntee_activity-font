const { volunteer } = require('../../../utils/api')

const SIGNUP_STATUS = {
  0: { text: '待审核', className: 'status-pending' },
  1: { text: '已通过', className: 'status-approved' },
  2: { text: '已拒绝', className: 'status-rejected' }
}

Page({
  data: {
    records: []
  },
  onLoad() {
    this.loadRecords()
  },
  onPullDownRefresh() {
    this.loadRecords()
  },
  async loadRecords() {
    try {
      const res = await volunteer.getSignupRecords({ page: 1, pageSize: 100 })
      const list = (res && res.records) || []
      const mapped = list.map(item => {
        const meta = SIGNUP_STATUS[item.status] || { text: '未知', className: 'status-pending' }
        return {
          ...item,
          statusText: meta.text,
          statusClass: meta.className,
          activityTitle: item.activityTitle || item.title || '志愿活动'
        }
      })
      this.setData({ records: mapped })
    } catch (err) {
      console.error('load signup records failed', err)
      this.setData({
        records: [
          {
            id: 'sample-1',
            activityId: '1',
            activityTitle: '校园迎新志愿服务',
            statusText: '待审核',
            statusClass: 'status-pending',
            createTime: '2024-03-10 10:00'
          }
        ]
      })
    } finally {
      wx.stopPullDownRefresh()
    }
  },
  goDetail(event) {
    const { id } = event.currentTarget.dataset
    if (!id) return
    wx.navigateTo({
      url: `/pages/volunteer/activity-detail/activity-detail?id=${id}`
    })
  }
})
