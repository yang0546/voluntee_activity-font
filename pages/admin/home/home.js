Page({
  data: {
    welcomeName: '',
    banners: [
      {
        id: 1,
        img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1000&q=80',
        title: '高效协作',
        desc: '一站式管理用户与活动'
      },
      {
        id: 2,
        img: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1000&q=80',
        title: '安全可靠',
        desc: '数据实时同步与校验'
      },
      {
        id: 3,
        img: 'https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&w=1000&q=80',
        title: '快速入口',
        desc: '活动广场 / 用户管理'
      }
    ]
  },

  onShow() {
    this.setWelcomeName()
  },

  setWelcomeName() {
    const profile = wx.getStorageSync('userProfile') || {}
    const name = profile.userName || profile.name
    this.setData({ welcomeName: name || '管理员' })
  },

  goActivity() {
    wx.reLaunch({ url: '/pages/admin/activity-list/activity-list' })
  },

  goUser() {
    wx.reLaunch({ url: '/pages/admin/user-list/user-list' })
  }
})
