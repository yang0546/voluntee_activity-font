# 志愿者活动管理系统 API 接口文档

## 基础信息

- **服务端口**: 8080
- **基础路径**: http://localhost:8080
- **统一返回格式**: `Result<T>`
  - `code`: 1-成功，0-失败
  - `msg`: 错误信息
  - `data`: 返回数据

---

## 一、登录接口

### 1.1 用户登录

**接口地址**: `POST /common/login`

**接口描述**: 微信用户登录，返回 JWT 令牌

**请求参数**:

| 参数名    | 类型   | 必填 | 说明          |
| --------- | ------ | ---- | ------------- |
| code      | String | 是   | 微信登录 code |
| name      | String | 是   | 用户姓名      |
| avatarUrl | String | 是   | 用户头像 URL  |

**请求示例**:

```json
{
  "code": "wx_code_123456",
  "name": "张三",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

**返回参数**:

| 参数名 | 类型    | 说明                             |
| ------ | ------- | -------------------------------- |
| id     | Long    | 用户 ID                          |
| openid | String  | 微信 openid                      |
| token  | String  | JWT 令牌                         |
| role   | Integer | 角色：0-志愿者 1-负责人 2-管理员 |

**返回示例**:

```json
{
  "code": 1,
  "msg": null,
  "data": {
    "id": 1,
    "openid": "openid_123456",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "role": 0
  }
}
```

---

## 二、管理员接口

### 2.1 分页查询用户列表

**接口地址**: `GET /admin/user/list`

**接口描述**: 管理员分页查询用户列表

**请求参数** (Query 参数):

| 参数名   | 类型    | 必填 | 说明                             |
| -------- | ------- | ---- | -------------------------------- |
| page     | Integer | 否   | 当前页码，默认 1                 |
| pageSize | Integer | 否   | 每页条数，默认 10                |
| name     | String  | 否   | 姓名（模糊查询）                 |
| college  | String  | 否   | 学院（模糊查询）                 |
| role     | Integer | 否   | 角色：0-志愿者 1-负责人 2-管理员 |

**请求示例**:

```
GET /admin/user/list?page=1&pageSize=10&name=张&role=0
```

**返回参数**:

| 参数名  | 类型       | 说明     |
| ------- | ---------- | -------- |
| total   | Long       | 总记录数 |
| records | List<User> | 用户列表 |

**User 对象字段**:

| 字段名     | 类型          | 说明                             |
| ---------- | ------------- | -------------------------------- |
| id         | Long          | 用户 ID                          |
| openid     | String        | 微信 openid                      |
| avatarUrl  | String        | 用户头像                         |
| name       | String        | 用户姓名                         |
| role       | Integer       | 角色：0-志愿者 1-负责人 2-管理员 |
| phone      | String        | 手机号                           |
| college    | String        | 学院                             |
| createTime | LocalDateTime | 创建时间                         |
| updateTime | LocalDateTime | 更新时间                         |

**返回示例**:

```json
{
  "code": 1,
  "msg": null,
  "data": {
    "total": 100,
    "records": [
      {
        "id": 1,
        "openid": "openid_123456",
        "avatarUrl": "https://example.com/avatar.jpg",
        "name": "张三",
        "role": 0,
        "phone": "13800138000",
        "college": "计算机学院",
        "createTime": "2024-01-01 10:00:00",
        "updateTime": "2024-01-01 10:00:00"
      }
    ]
  }
}
```

### 2.2 更新用户信息

**接口地址**: `PUT /admin/user/update`

**接口描述**: 管理员更新用户信息

**请求参数** (Body):

| 参数名  | 类型    | 必填 | 说明                             |
| ------- | ------- | ---- | -------------------------------- |
| id      | Long    | 是   | 用户 ID                          |
| name    | String  | 否   | 用户姓名                         |
| phone   | String  | 否   | 手机号                           |
| college | String  | 否   | 学院                             |
| role    | Integer | 否   | 角色：0-志愿者 1-负责人 2-管理员 |

**请求示例**:

```json
{
  "id": 1,
  "name": "张三",
  "phone": "13800138000",
  "college": "计算机学院",
  "role": 1
}
```

**返回示例**:

```json
{
  "code": 1,
  "msg": null,
  "data": null
}
```

### 2.3 根据 ID 查询用户信息

**接口地址**: `GET /admin/user/{id}`

**接口描述**: 根据用户 ID 查询用户详细信息

**路径参数**:

| 参数名 | 类型 | 必填 | 说明    |
| ------ | ---- | ---- | ------- |
| id     | Long | 是   | 用户 ID |

**请求示例**:

```
GET /admin/user/1
```

**返回示例**:

```json
{
  "code": 1,
  "msg": null,
  "data": {
    "id": 1,
    "openid": "openid_123456",
    "avatarUrl": "https://example.com/avatar.jpg",
    "name": "张三",
    "role": 0,
    "phone": "13800138000",
    "college": "计算机学院",
    "createTime": "2024-01-01 10:00:00",
    "updateTime": "2024-01-01 10:00:00"
  }
}
```

### 2.4 管理员获取所有活动信息

**接口地址**: `GET /admin/activity/list`

**接口描述**: 管理员分页查询所有活动信息

**请求参数** (Query 参数):

| 参数名    | 类型          | 必填 | 说明                                          |
| --------- | ------------- | ---- | --------------------------------------------- |
| page      | Integer       | 否   | 当前页码                                      |
| pageSize  | Integer       | 否   | 每页条数                                      |
| title     | String        | 否   | 活动标题（模糊查询）                          |
| leaderId  | Long          | 否   | 负责人 ID                                     |
| startTime | LocalDateTime | 否   | 活动开始时间（格式：yyyy-MM-dd HH:mm:ss）     |
| endTime   | LocalDateTime | 否   | 活动结束时间（格式：yyyy-MM-dd HH:mm:ss）     |
| status    | Integer       | 否   | 活动状态：0-未开始 1-进行中 2-已结束 3-已取消 |

**请求示例**:

```
GET /admin/activity/list?page=1&pageSize=10&status=1
```

**返回参数**:

| 参数名  | 类型             | 说明     |
| ------- | ---------------- | -------- |
| total   | Long             | 总记录数 |
| records | List<ActivityVO> | 活动列表 |

**ActivityVO 对象字段**:

| 字段名         | 类型          | 说明                                          |
| -------------- | ------------- | --------------------------------------------- |
| id             | Long          | 活动 ID                                       |
| title          | String        | 活动标题                                      |
| description    | String        | 活动说明                                      |
| location       | String        | 活动地点                                      |
| startTime      | LocalDateTime | 活动开始时间                                  |
| endTime        | LocalDateTime | 活动结束时间                                  |
| signupDeadline | LocalDateTime | 报名截止时间                                  |
| currentPeople  | Integer       | 当前已成功人数                                |
| requiredPeople | Integer       | 所需志愿者人数                                |
| leaderId       | Long          | 活动负责人 ID                                 |
| leaderName     | String        | 活动负责人姓名                                |
| status         | Integer       | 活动状态：0-未开始 1-进行中 2-已结束 3-已取消 |
| createTime     | LocalDateTime | 创建时间                                      |
| updateTime     | LocalDateTime | 更新时间                                      |

**返回示例**:

```json
{
  "code": 1,
  "msg": null,
  "data": {
    "total": 50,
    "records": [
      {
        "id": 1,
        "title": "环保志愿活动",
        "description": "清理公园垃圾",
        "location": "中央公园",
        "startTime": "2024-02-01 09:00:00",
        "endTime": "2024-02-01 17:00:00",
        "signupDeadline": "2024-01-30 23:59:59",
        "currentPeople": 10,
        "requiredPeople": 20,
        "leaderId": 2,
        "leaderName": "李四",
        "status": 1,
        "createTime": "2024-01-01 10:00:00",
        "updateTime": "2024-01-01 10:00:00"
      }
    ]
  }
}
```

### 2.5 管理员更新活动信息

**接口地址**: `PUT /admin/activity/update`

**接口描述**: 管理员更新活动信息

**请求参数** (Body):

| 参数名         | 类型          | 必填 | 说明                                          |
| -------------- | ------------- | ---- | --------------------------------------------- |
| id             | Long          | 是   | 活动 ID                                       |
| title          | String        | 否   | 活动标题                                      |
| description    | String        | 否   | 活动说明                                      |
| location       | String        | 否   | 活动地点                                      |
| startTime      | LocalDateTime | 否   | 活动开始时间                                  |
| endTime        | LocalDateTime | 否   | 活动结束时间                                  |
| signupDeadline | LocalDateTime | 否   | 报名截止时间                                  |
| currentPeople  | Integer       | 否   | 当前已成功人数                                |
| requiredPeople | Integer       | 否   | 所需志愿者人数                                |
| leaderId       | Long          | 否   | 活动负责人 ID                                 |
| status         | Integer       | 否   | 活动状态：0-未开始 1-进行中 2-已结束 3-已取消 |

**请求示例**:

```json
{
  "id": 1,
  "title": "环保志愿活动",
  "description": "清理公园垃圾",
  "location": "中央公园",
  "startTime": "2024-02-01 09:00:00",
  "endTime": "2024-02-01 17:00:00",
  "signupDeadline": "2024-01-30 23:59:59",
  "currentPeople": 10,
  "requiredPeople": 20,
  "leaderId": 2,
  "status": 1
}
```

**返回示例**:

```json
{
  "code": 1,
  "msg": null,
  "data": null
}
```

---

## 三、活动负责人接口

### 3.1 负责人创建活动

**接口地址**: `POST /leader/activity/create`

**接口描述**: 活动负责人创建新的志愿活动

**请求参数** (Body):

| 参数名         | 类型          | 必填 | 说明                                      |
| -------------- | ------------- | ---- | ----------------------------------------- |
| title          | String        | 是   | 活动标题                                  |
| description    | String        | 是   | 活动说明                                  |
| location       | String        | 是   | 活动地点                                  |
| startTime      | LocalDateTime | 是   | 活动开始时间（格式：yyyy-MM-dd HH:mm:ss） |
| endTime        | LocalDateTime | 是   | 活动结束时间（格式：yyyy-MM-dd HH:mm:ss） |
| signupDeadline | LocalDateTime | 是   | 报名截止时间（格式：yyyy-MM-dd HH:mm:ss） |
| requiredPeople | Integer       | 是   | 所需志愿者人数                            |
| leaderId       | Long          | 是   | 活动负责人 ID（从 JWT token 中获取）      |

**请求示例**:

```json
{
  "title": "环保志愿活动",
  "description": "清理公园垃圾",
  "location": "中央公园",
  "startTime": "2024-02-01 09:00:00",
  "endTime": "2024-02-01 17:00:00",
  "signupDeadline": "2024-01-30 23:59:59",
  "requiredPeople": 20,
  "leaderId": 2
}
```

**返回示例**:

```json
{
  "code": 1,
  "msg": null,
  "data": null
}
```

### 3.2 负责人获取所有活动信息

**接口地址**: `GET /leader/activity/list`

**接口描述**: 活动负责人分页查询所有活动信息

**请求参数** (Query 参数): 同 2.4 管理员获取所有活动信息

**返回示例**: 同 2.4 管理员获取所有活动信息

### 3.3 负责人获取自己负责的活动信息

**接口地址**: `GET /leader/activity/self`

**接口描述**: 活动负责人分页查询自己负责的活动信息

**请求参数** (Query 参数): 同 2.4 管理员获取所有活动信息（leaderId 会自动从 JWT token 中获取）

**返回示例**: 同 2.4 管理员获取所有活动信息

### 3.4 负责人更新活动

**接口地址**: `PUT /leader/activity/update`

**接口描述**: 活动负责人更新自己负责的活动信息

**请求参数** (Body): 同 2.5 管理员更新活动信息

**返回示例**: 同 2.5 管理员更新活动信息

### 3.5 负责人删除活动

**接口地址**: `DELETE /leader/activity/delete`

**接口描述**: 活动负责人删除自己负责的活动

**请求参数** (Query 参数):

| 参数名 | 类型 | 必填 | 说明    |
| ------ | ---- | ---- | ------- |
| id     | Long | 是   | 活动 ID |

**请求示例**:

```
DELETE /leader/activity/delete?id=1
```

**返回示例**:

```json
{
  "code": 1,
  "msg": null,
  "data": null
}
```

### 3.6 负责人获取报名记录

**接口地址**: `GET /leader/activity/signupRecords`

**接口描述**: 负责人获取自己有权限审核的报名记录

**请求参数** (Query 参数):

| 参数名     | 类型    | 必填 | 说明                                     |
| ---------- | ------- | ---- | ---------------------------------------- |
| page       | Integer | 否   | 当前页码                                 |
| pageSize   | Integer | 否   | 每页条数                                 |
| leaderId   | Long    | 否   | 负责人 ID（从 JWT token 中获取）         |
| activityId | Long    | 否   | 活动 ID                                  |
| status     | Integer | 否   | 审核状态：0-待审核 1-审核通过 2-审核拒绝 |

**请求示例**:

```
GET /leader/activity/signupRecords?page=1&pageSize=10&activityId=1&status=0
```

**返回参数**:

| 参数名  | 类型           | 说明         |
| ------- | -------------- | ------------ |
| total   | Long           | 总记录数     |
| records | List<SignupVO> | 报名记录列表 |

**SignupVO 对象字段**:

| 字段名      | 类型          | 说明                           |
| ----------- | ------------- | ------------------------------ |
| signupId    | Long          | 报名 ID                        |
| userId      | Long          | 志愿者 ID                      |
| userName    | String        | 志愿者姓名                     |
| status      | Integer       | 0-待审核 1-审核通过 2-审核拒绝 |
| signupTime  | LocalDateTime | 报名时间                       |
| title       | String        | 活动标题                       |
| description | String        | 活动说明                       |
| auditTime   | LocalDateTime | 审核时间                       |
| auditReason | String        | 审核说明                       |

**返回示例**:

```json
{
  "code": 1,
  "msg": null,
  "data": {
    "total": 20,
    "records": [
      {
        "signupId": 1,
        "userId": 3,
        "userName": "王五",
        "status": 0,
        "signupTime": "2024-01-25 10:00:00",
        "title": "环保志愿活动",
        "description": "清理公园垃圾",
        "auditTime": null,
        "auditReason": null
      }
    ]
  }
}
```

### 3.7 负责人审核活动报名

**接口地址**: `PUT /leader/activity/audit`

**接口描述**: 负责人审核活动报名申请

**请求参数** (Body):

| 参数名      | 类型    | 必填 | 说明                       |
| ----------- | ------- | ---- | -------------------------- |
| signupId    | Long    | 是   | 报名 ID                    |
| status      | Integer | 是   | 审核结果：1-通过 2-拒绝    |
| auditReason | String  | 否   | 审核说明（拒绝时建议填写） |

**请求示例**:

```json
{
  "signupId": 1,
  "status": 1,
  "auditReason": "审核通过"
}
```

**返回示例**:

```json
{
  "code": 1,
  "msg": null,
  "data": null
}
```

### 3.8 负责人任务分配

**接口地址**: `POST /leader/activity/taskAssign`

**接口描述**: 负责人为志愿者分配任务

**请求参数** (Body):

| 参数名     | 类型          | 必填 | 说明                                      |
| ---------- | ------------- | ---- | ----------------------------------------- |
| activityId | Long          | 是   | 活动 ID                                   |
| userId     | Long          | 是   | 志愿者用户 ID                             |
| content    | String        | 是   | 任务内容                                  |
| startTime  | LocalDateTime | 是   | 任务开始时间（格式：yyyy-MM-dd HH:mm:ss） |
| endTime    | LocalDateTime | 是   | 任务结束时间（格式：yyyy-MM-dd HH:mm:ss） |

**请求示例**:

```json
{
  "activityId": 1,
  "userId": 3,
  "content": "负责清理公园东侧区域的垃圾",
  "startTime": "2024-02-01 09:00:00",
  "endTime": "2024-02-01 12:00:00"
}
```

**返回示例**:

```json
{
  "code": 1,
  "msg": null,
  "data": null
}
```

### 3.9 负责人获取任务列表

**接口地址**: `GET /leader/activity/taskList`

**接口描述**: 负责人获取自己负责的活动任务列表

**请求参数** (Query 参数):

| 参数名     | 类型 | 必填 | 说明    |
| ---------- | ---- | ---- | ------- |
| activityId | Long | 是   | 活动 ID |

**请求示例**:

```
GET /leader/activity/taskList?activityId=1
```

**返回参数**: List<TaskVO>

**TaskVO 对象字段**:

| 字段名    | 类型          | 说明                                 |
| --------- | ------------- | ------------------------------------ |
| taskId    | Long          | 任务 ID                              |
| userId    | Long          | 志愿者 ID                            |
| userName  | String        | 志愿者姓名                           |
| content   | String        | 任务内容                             |
| status    | Integer       | 任务状态：0-未开始 1-进行中 2-已完成 |
| startTime | LocalDateTime | 任务开始时间                         |
| endTime   | LocalDateTime | 任务结束时间                         |

**返回示例**:

```json
{
  "code": 1,
  "msg": null,
  "data": [
    {
      "taskId": 1,
      "userId": 3,
      "userName": "王五",
      "content": "负责清理公园东侧区域的垃圾",
      "status": 1,
      "startTime": "2024-02-01 09:00:00",
      "endTime": "2024-02-01 12:00:00"
    }
  ]
}
```

---

## 四、志愿者接口

### 4.1 志愿者报名志愿活动

**接口地址**: `POST /volunteer/activity/signup`

**接口描述**: 志愿者报名参加志愿活动

**请求参数** (Body):

| 参数名     | 类型 | 必填 | 说明    |
| ---------- | ---- | ---- | ------- |
| activityId | Long | 是   | 活动 ID |

**请求示例**:

```json
{
  "activityId": 1
}
```

**返回示例**:

```json
{
  "code": 1,
  "msg": null,
  "data": null
}
```

### 4.2 志愿者获取活动任务列表

**接口地址**: `GET /volunteer/activity/taskList`

**接口描述**: 志愿者获取自己参与的活动对应的任务列表

**请求参数** (Query 参数):

| 参数名     | 类型 | 必填 | 说明    |
| ---------- | ---- | ---- | ------- |
| activityId | Long | 是   | 活动 ID |

**请求示例**:

```
GET /volunteer/activity/taskList?activityId=1
```

**返回参数**: List<TaskVO>

**返回示例**:

```json
{
  "code": 1,
  "msg": null,
  "data": [
    {
      "taskId": 1,
      "content": "负责清理公园东侧区域的垃圾",
      "status": 1,
      "startTime": "2024-02-01 09:00:00",
      "endTime": "2024-02-01 12:00:00"
    }
  ]
}
```

### 4.3 志愿者更新任务状态

**接口地址**: `PUT /volunteer/task/status`

**接口描述**: 志愿者更新自己任务的状态

**请求参数** (Body):

| 参数名 | 类型    | 必填 | 说明                                 |
| ------ | ------- | ---- | ------------------------------------ |
| taskId | Long    | 是   | 任务 ID                              |
| status | Integer | 是   | 任务状态：0-未开始 1-进行中 2-已完成 |

**请求示例**:

```json
{
  "taskId": 1,
  "status": 2
}
```

**返回示例**:

```json
{
  "code": 1,
  "msg": null,
  "data": null
}
```

### 4.4 志愿者获取所有活动信息

**接口地址**: `GET /volunteer/activity/list`

**接口描述**: 志愿者分页查询所有可报名的活动信息

**请求参数** (Query 参数): 同 2.4 管理员获取所有活动信息

**返回示例**: 同 2.4 管理员获取所有活动信息

### 4.5 志愿者获取报名记录（通过 status 查询已经报名成功的活动）

**接口地址**: `GET /leader/activity/signupRecords`

**接口描述**: 负责人获取自己有权限审核的报名记录

**请求参数** (Query 参数):

| 参数名     | 类型    | 必填 | 说明                                     |
| ---------- | ------- | ---- | ---------------------------------------- |
| page       | Integer | 否   | 当前页码                                 |
| pageSize   | Integer | 否   | 每页条数                                 |
| userId     | Long    | 否   | 负责人 ID（从 JWT token 中获取）         |
| activityId | Long    | 否   | 活动 ID                                  |
| status     | Integer | 否   | 审核状态：0-待审核 1-审核通过 2-审核拒绝 |

**请求示例**:

```
GET /volunteer/activity/signupRecords?page=1&pageSize=10&activityId=1&status=0
```

**返回参数**:

| 参数名  | 类型           | 说明         |
| ------- | -------------- | ------------ |
| total   | Long           | 总记录数     |
| records | List<SignupVO> | 报名记录列表 |

**SignupVO 对象字段**:

| 字段名      | 类型          | 说明                           |
| ----------- | ------------- | ------------------------------ |
| signupId    | Long          | 报名 ID                        |
| userId      | Long          | 用户 ID                        |
| userName    | String        | 志愿者姓名                     |
| status      | Integer       | 0-待审核 1-审核通过 2-审核拒绝 |
| signupTime  | LocalDateTime | 报名时间                       |
| title       | String        | 活动标题                       |
| description | String        | 活动说明                       |
| auditTime   | LocalDateTime | 审核时间                       |
| auditReason | String        | 审核说明                       |

**返回示例**:

```json
{
  "code": 1,
  "msg": null,
  "data": {
    "total": 20,
    "records": [
      {
        "signupId": 1,
        "userId": 3,
        "userName": "王五",
        "status": 0,
        "signupTime": "2024-01-25 10:00:00",
        "title": "环保志愿活动",
        "description": "清理公园垃圾",
        "auditTime": null,
        "auditReason": null
      }
    ]
  }
}
```

---

## 五、状态码说明

### 活动状态 (Activity Status)

- `0`: 未开始
- `1`: 进行中
- `2`: 已结束
- `3`: 已取消

### 报名审核状态 (Signup Status)

- `0`: 待审核
- `1`: 审核通过
- `2`: 审核拒绝

### 任务状态 (Task Status)

- `0`: 未开始
- `1`: 进行中
- `2`: 已完成

### 用户角色 (User Role)

- `0`: 志愿者
- `1`: 负责人
- `2`: 管理员

---

## 六、认证说明

除登录接口外，其他接口均需要在请求头中携带 JWT 令牌：

```
Authorization: Bearer {token}
```

或使用配置的 token 名称（默认：token）：

```
token: {token}
```

JWT 令牌中包含以下信息：

- `userId`: 用户 ID
- `role`: 用户角色

---

## 七、错误码说明

统一返回格式中的 `code` 字段：

- `1`: 请求成功
- `0`: 请求失败（具体错误信息在 `msg` 字段中）

常见错误信息：

- 用户未找到
- 活动未找到
- 权限不足
- 登录失败
- 报名记录已存在
- 活动状态异常
- 报名记录状态异常

---

## 八、时间格式说明

所有时间字段统一使用格式：`yyyy-MM-dd HH:mm:ss`

例如：`2024-01-01 10:00:00`

---

## 九、分页说明

所有分页查询接口的返回格式：

```json
{
  "code": 1,
  "msg": null,
  "data": {
    "total": 100,        // 总记录数
    "records": [...]     // 当前页数据列表
  }
}
```

分页参数：

- `page`: 当前页码（从 1 开始）
- `pageSize`: 每页条数
