const { volunteer } = require('../../../utils/api')

const TASK_STATUS = {
  0: { text: '未开始', className: 'status-pending' },
  1: { text: '进行中', className: 'status-ongoing' },
  2: { text: '已完成', className: 'status-approved' }
}

Page({
  data: {
    activityId: '',
    tasks: []
  },
  onLoad(options) {
    const activityId = options?.activityId
    if (activityId) {
      this.setData({ activityId })
      this.loadTasks(activityId)
    }
  },
  onPullDownRefresh() {
    if (this.data.activityId) {
      this.loadTasks(this.data.activityId)
    } else {
      wx.stopPullDownRefresh()
    }
  },
  async loadTasks(activityId) {
    if (!activityId) return
    try {
      const res = await volunteer.getTaskList(activityId)
      const tasks = (res || []).map(item => {
        const meta = TASK_STATUS[item.status] || TASK_STATUS[0]
        return {
          ...item,
          statusText: meta.text,
          statusClass: meta.className,
          timeRange: formatTimeRange(item.startTime, item.endTime)
        }
      })
      this.setData({ tasks })
    } catch (err) {
      console.error('load tasks failed', err)
      this.setData({
        tasks: [
          {
            taskId: 'sample-1',
            content: '活动现场签到',
            userName: '我',
            statusText: '未开始',
            statusClass: 'status-pending',
            timeRange: '09:00 - 10:00'
          }
        ]
      })
    } finally {
      wx.stopPullDownRefresh()
    }
  }
})

function formatTimeRange(start, end) {
  if (!start || !end) return '时间待定'
  const startShort = start.slice(11, 16)
  const endShort = end.slice(11, 16)
  return `${startShort} - ${endShort}`
}
