Component({
  properties: {
    current: {
      type: String,
      value: 'home'
    }
  },
  data: {
    tabs: [
      { key: 'home', label: '首页', path: '/pages/admin/home/home' },
      { key: 'activity', label: '活动广场', path: '/pages/admin/activity-list/activity-list' },
      { key: 'user', label: '用户管理', path: '/pages/admin/user-list/user-list' }
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
