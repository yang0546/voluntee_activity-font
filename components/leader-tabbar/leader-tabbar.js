Component({
  properties: {
    current: {
      type: String,
      value: 'home'
    }
  },
  data: {
    tabs: [
      { key: 'home', label: '首页', path: '/pages/leader/home/home' },
      { key: 'activities', label: '我负责的活动', path: '/pages/leader/my-activities/my-activities' },
      { key: 'audit', label: '我的审核', path: '/pages/leader/signup-audit/signup-audit' }
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
