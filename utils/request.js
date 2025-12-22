const BASE_URL = 'http://localhost:8080'

// 统一请求封装
function request(options) {
  const token = wx.getStorageSync('token') || ''
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': options.header && options.header['Content-Type'] ? options.header['Content-Type'] : 'application/json',
        'token': token,
        ...(options.header || {})
      },
      success(res) {
        const data = res.data || {}
        if (data.code === 1) {
          resolve(data.data)
        } else {
          wx.showToast({
            title: data.msg || '请求失败',
            icon: 'none'
          })
          reject(data)
        }
      },
      fail(err) {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

module.exports = {
  request,
  BASE_URL
}


