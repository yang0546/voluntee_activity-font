const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

// 格式化时间字符串（ISO格式或带T的时间字符串）
const formatTimeString = (timeStr) => {
  if (!timeStr) return ''
  try {
    // 如果是ISO格式字符串，转换为Date对象
    if (typeof timeStr === 'string') {
      // 处理带T的时间字符串，如 "2024-01-01T12:00:00"
      const time = timeStr.replace('T', ' ')
      // 尝试解析为Date对象
      const date = new Date(timeStr)
      if (!isNaN(date.getTime())) {
        // 如果成功解析，使用formatTime格式化
        return formatTime(date)
      }
      // 如果解析失败，直接返回处理后的字符串（去掉T）
      return time
    }
    // 如果是Date对象
    if (timeStr instanceof Date) {
      return formatTime(timeStr)
    }
    return String(timeStr)
  } catch (e) {
    // 如果出错，尝试简单替换T
    return String(timeStr).replace('T', ' ')
  }
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

module.exports = {
  formatTime,
  formatTimeString
}
