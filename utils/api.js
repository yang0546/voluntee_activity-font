const { request } = require('./request')

// 登录接口
const login = (data) => request({ url: '/common/login', method: 'POST', data })

// 管理员接口
const admin = {
  // 分页查询用户列表
  getUserList: (params) => request({ url: '/admin/user/list', method: 'GET', data: params }),
  // 更新用户信息
  updateUser: (data) => request({ url: '/admin/user/update', method: 'PUT', data }),
  // 根据ID查询用户信息
  getUserById: (id) => request({ url: `/admin/user/${id}`, method: 'GET' }),
  // 获取所有活动信息
  getActivityList: (params) => request({ url: '/admin/activity/list', method: 'GET', data: params }),
  // 更新活动信息
  updateActivity: (data) => request({ url: '/admin/activity/update', method: 'PUT', data })
}

// 负责人接口
const leader = {
  // 创建活动
  createActivity: (data) => request({ url: '/leader/activity/create', method: 'POST', data }),
  // 获取所有活动信息
  getActivityList: (params) => request({ url: '/leader/activity/list', method: 'GET', data: params }),
  // 获取自己负责的活动
  getSelfActivities: (params) => request({ url: '/leader/activity/self', method: 'GET', data: params }),
  // 更新活动
  updateActivity: (data) => request({ url: '/leader/activity/update', method: 'PUT', data }),
  // 删除活动
  deleteActivity: (id) => request({ url: `/leader/activity/delete?id=${id}`, method: 'DELETE' }),
  // 获取报名记录
  getSignupRecords: (params) => request({ url: '/leader/activity/signupRecords', method: 'GET', data: params }),
  // 审核活动报名
  auditSignup: (data) => request({ url: '/leader/activity/audit', method: 'PUT', data }),
  // 任务分配
  taskAssign: (data) => request({ url: '/leader/activity/taskAssign', method: 'POST', data }),
  // 获取任务列表
  getTaskList: (activityId) => request({ url: `/leader/activity/taskList?activityId=${activityId}`, method: 'GET' })
}

// 志愿者接口
const volunteer = {
  // 报名志愿活动
  signupActivity: (data) => request({ url: '/volunteer/activity/signup', method: 'POST', data }),
  // 获取活动任务列表
  getTaskList: (activityId) => request({ url: `/volunteer/activity/taskList?activityId=${activityId}`, method: 'GET' }),
  // 更新任务状态
  updateTaskStatus: (data) => request({ url: '/volunteer/task/status', method: 'PUT', data }),
  // 获取所有活动信息
  getActivityList: (params) => request({ url: '/volunteer/activity/list', method: 'GET', data: params }),
  // 获取报名记录列表
  getSignupRecords: (params) => request({ url: '/volunteer/activity/signupRecords', method: 'GET', data: params })
}

module.exports = {
  login,
  admin,
  leader,
  volunteer
}

