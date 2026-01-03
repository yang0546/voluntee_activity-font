const { request } = require('./request')

// Login APIs
const login = (data) => request({ url: '/common/login', method: 'POST', data })

// Admin APIs
const admin = {
  getUserList: (params) => request({ url: '/admin/user/list', method: 'GET', data: params }),
  updateUser: (data) => request({ url: '/admin/user/update', method: 'PUT', data }),
  getUserById: (id) => request({ url: `/admin/user/${id}`, method: 'GET' }),
  getLeaderList: () => request({ url: '/admin/user/leaderList', method: 'GET' }),
  getActivityList: (params) => request({ url: '/admin/activity/list', method: 'GET', data: params }),
  getActivityById: (id) => request({ url: `/admin/activity/${id}`, method: 'GET' }),
  updateActivity: (data) => request({ url: '/admin/activity/update', method: 'PUT', data })
}

// Leader APIs
const leader = {
  createActivity: (data) => request({ url: '/leader/activity/create', method: 'POST', data }),
  getActivityList: (params) => request({ url: '/leader/activity/list', method: 'GET', data: params }),
  getActivityById: (id) => request({ url: `/leader/activity/${id}`, method: 'GET' }),
  getSelfActivities: (params) => request({ url: '/leader/activity/self', method: 'GET', data: params }),
  updateActivity: (data) => request({ url: '/leader/activity/update', method: 'PUT', data }),
  deleteActivity: (id) => request({ url: `/leader/activity/delete?id=${id}`, method: 'DELETE' }),
  getSignupRecords: (params) => request({ url: '/leader/activity/signupRecords', method: 'GET', data: params }),
  auditSignup: (data) => request({ url: '/leader/activity/audit', method: 'PUT', data }),
  taskAssign: (data) => request({ url: '/leader/activity/taskAssign', method: 'POST', data }),
  getTaskList: (activityId) => request({ url: `/leader/activity/taskList?activityId=${activityId}`, method: 'GET' }),
  getUserList: (activityId) => request({ url: `/leader/activity/userList?activityId=${activityId}`, method: 'GET' })
}

// Volunteer APIs
const volunteer = {
  signupActivity: (data) => request({ url: '/volunteer/activity/signup', method: 'POST', data }),
  getActivityById: (id) => request({ url: `/volunteer/activity/${id}`, method: 'GET' }),
  getTaskList: (activityId) => request({ url: `/volunteer/activity/taskList?activityId=${activityId}`, method: 'GET' }),
  updateTaskStatus: (data) => request({ url: '/volunteer/task/status', method: 'PUT', data }),
  getActivityList: (params) => request({ url: '/volunteer/activity/list', method: 'GET', data: params }),
  getSignupRecords: (params) => request({ url: '/volunteer/activity/signupRecords', method: 'GET', data: params }),
  updateInfo: (data) => request({ url: '/volunteer/user/updateInfo', method: 'PUT', data }),
  getApprovedActivities: () =>
    request({ url: '/volunteer/activity/signupRecords', method: 'GET', data: { status: 1, page: 1, pageSize: 100 } })
}

module.exports = {
  login,
  admin,
  leader,
  volunteer
}
