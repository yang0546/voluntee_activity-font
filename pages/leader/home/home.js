const { leader } = require('../../../utils/api')

Page({
  data: {
    welcomeName: '',
    stats: {
      totalActivities: 0,
      pendingAudits: 0,
      activeActivities: 0
    },
    loading: true
  },

  onLoad() {
    this.setWelcomeName()
    this.loadStats()
  },

  onShow() {
    // 每次显示时刷新统计数据
    this.loadStats()
  },

  onPullDownRefresh() {
    this.loadStats().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  setWelcomeName() {
    const profile = wx.getStorageSync('userProfile') || {}
    const name = profile.userName || profile.name
    this.setData({ welcomeName: name || '负责人' })
  },

  loadStats() {
    this.setData({ loading: true })
    // 获取自己负责的活动统计
    return leader.getSelfActivities({ page: 1, pageSize: 1000 }).then(res => {
      const activities = res.records || []
      const totalActivities = activities.length
      const activeActivities = activities.filter(a => a.status === 1).length
      
      // 获取待审核的报名记录
      return leader.getSignupRecords({ page: 1, pageSize: 1000, status: 0 }).then(signupRes => {
        const pendingAudits = signupRes.total || 0
        
        this.setData({
          stats: {
            totalActivities,
            pendingAudits,
            activeActivities
          },
          loading: false
        })
      }).catch(() => {
        this.setData({
          stats: {
            totalActivities,
            pendingAudits: 0,
            activeActivities
          },
          loading: false
        })
      })
    }).catch(() => {
      this.setData({ loading: false })
    })
  },

  navigateToActivities() {
    wx.reLaunch({
      url: '/pages/leader/my-activities/my-activities'
    })
  },

  navigateToAudit() {
    wx.reLaunch({
      url: '/pages/leader/signup-audit/signup-audit'
    })
  },

  createActivity() {
    wx.navigateTo({
      url: '/pages/leader/activity-create/activity-create'
    })
  }
})

