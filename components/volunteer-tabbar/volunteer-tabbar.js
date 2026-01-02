Component({
  properties: {
    current: {
      type: String,
      value: 'home'
    }
  },
  data: {
    tabs: [
      { key: 'home', label: '首页', path: '/pages/volunteer/home/home' },
      { key: 'activities', label: '活动广场', path: '/pages/volunteer/activity-list/activity-list' },
      { key: 'profile', label: '个人中心', path: '/pages/volunteer/profile/profile' }
    ]
  },
  methods: {
    onTap(e) {
      const { key } = e.currentTarget.dataset
      const target = this.data.tabs.find(item => item.key === key)
      if (!target || key === this.data.current) return
      wx.reLaunch({ url: target.path })
    }
  }
})
