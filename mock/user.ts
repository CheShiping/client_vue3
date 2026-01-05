import { MockMethod } from 'vite-plugin-mock'

// 存储键名
const STORAGE_KEY = 'thesis_management_users'

// 检查是否在浏览器环境中
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined'

// 从localStorage获取数据或使用默认数据
function getStoredUsers() {
  if (!isBrowser) return null
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (e) {
    return null
  }
}

// 保存数据到localStorage
function saveUsersToStorage(users: any[]) {
  if (!isBrowser) return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
  } catch (e) {
    console.error('保存用户数据到localStorage失败:', e)
  }
}

// Mock 用户数据
let mockUsers = getStoredUsers() || [
  {
    user_id: 1,
    username: 'admin',
    password: '123456', // 实际项目中密码应该是加密的
    nickname: '管理员',
    avatar: '/img/avatar.png',
    phone: '13800138000',
    email: 'admin@example.com',
    user_group: 'admin',
    user_admin: '1',
    state: 1
  },
  {
    user_id: 2,
    username: 'teacher1',
    password: '123456',
    nickname: '张老师',
    avatar: '/img/avatar.png',
    phone: '13800138001',
    email: 'teacher1@example.com',
    user_group: 'teacher',
    user_admin: '0',
    state: 1
  },
  {
    user_id: 3,
    username: 'zhangsan',
    password: '123456',
    nickname: '张三',
    avatar: '/img/avatar.png',
    phone: '13800138002',
    email: 'zhangsan@example.com',
    user_group: 'student',
    user_admin: '0',
    state: 1
  },
  {
    user_id: 4,
    username: 'lisi',
    password: '123456',
    nickname: '李四',
    avatar: '/img/avatar.png',
    phone: '13800138003',
    email: 'lisi@example.com',
    user_group: 'student',
    user_admin: '0',
    state: 1
  },
  {
    user_id: 5,
    username: 'wangwu',
    password: '123456',
    nickname: '王五',
    avatar: '/img/avatar.png',
    phone: '13800138004',
    email: 'wangwu@example.com',
    user_group: 'student',
    user_admin: '0',
    state: 1
  },
  {
    user_id: 6,
    username: 'zhaoliu',
    password: '123456',
    nickname: '赵六',
    avatar: '/img/avatar.png',
    phone: '13800138005',
    email: 'zhaoliu@example.com',
    user_group: 'student',
    user_admin: '0',
    state: 1
  },
  {
    user_id: 7,
    username: 'sunqi',
    password: '123456',
    nickname: '孙七',
    avatar: '/img/avatar.png',
    phone: '13800138006',
    email: 'sunqi@example.com',
    user_group: 'student',
    user_admin: '0',
    state: 1
  },
  {
    user_id: 8,
    username: 'zhouba',
    password: '123456',
    nickname: '周八',
    avatar: '/img/avatar.png',
    phone: '13800138007',
    email: 'zhouba@example.com',
    user_group: 'student',
    user_admin: '0',
    state: 1
  },
  {
    user_id: 9,
    username: 'wujiu',
    password: '123456',
    nickname: '吴九',
    avatar: '/img/avatar.png',
    phone: '13800138008',
    email: 'wujiu@example.com',
    user_group: 'student',
    user_admin: '0',
    state: 1
  },
  {
    user_id: 10,
    username: 'zhengshi',
    password: '123456',
    nickname: '郑十',
    avatar: '/img/avatar.png',
    phone: '13800138009',
    email: 'zhengshi@example.com',
    user_group: 'student',
    user_admin: '0',
    state: 1
  },
  {
    user_id: 11,
    username: 'teacher1',
    password: '123456',
    nickname: '张老师',
    avatar: '/img/avatar.png',
    phone: '13800138010',
    email: 'teacher1@example.com',
    user_group: 'teacher',
    user_admin: '0',
    state: 1
  },
  {
    user_id: 12,
    username: 'teacher2',
    password: '123456',
    nickname: '李老师',
    avatar: '/img/avatar.png',
    phone: '13800138011',
    email: 'teacher2@example.com',
    user_group: 'teacher',
    user_admin: '0',
    state: 1
  },
  {
    user_id: 13,
    username: 'admin',
    password: '123456',
    nickname: '管理员',
    avatar: '/img/avatar.png',
    phone: '13800138012',
    email: 'admin@example.com',
    user_group: 'admin',
    user_admin: '1',
    state: 1
  }
]

// 保存初始数据到localStorage
if (!getStoredUsers() && isBrowser) {
  saveUsersToStorage(mockUsers)
}

// 生成 token
function generateToken(username: string): string {
  return 'mock_token_' + username + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

export default [
  // 用户登录
  {
    url: '/api/user/login',
    method: 'post',
    response: ({ body }: { body: { username: string; password: string } }) => {
      const { username, password } = body
      
      // 查找用户
      const user = mockUsers.find(
        u => u.username === username && u.password === password
      )
      
      if (!user) {
        return {
          error: {
            code: 10001,
            message: '用户名或密码错误'
          }
        }
      }
      
      // 生成 token
      const token = generateToken(username)
      
      return {
        result: {
          obj: {
            ...user,
            token: token
          }
        }
      }
    }
  },
  
  // 用户登出
  {
    url: '/api/user/logout',
    method: 'post',
    response: () => {
      return {
        result: {
          message: '登出成功'
        }
      }
    }
  },
  
  // 获取用户信息
  {
    url: '/api/user/info',
    method: 'get',
    response: ({ headers }: { headers: { 'x-auth-token'?: string } }) => {
      const token = headers['x-auth-token']
      
      if (!token || !token.startsWith('mock_token_')) {
        return {
          error: {
            code: 401,
            message: '未登录或登录已过期'
          }
        }
      }
      
      // 根据 token 返回用户信息（简化处理，实际应该解析 token）
      // 这里根据 token 内容判断返回哪个用户的信息
      let user
      if (token.includes('admin')) {
        user = mockUsers[0] // admin
      } else if (token.includes('teacher')) {
        user = mockUsers[1] // teacher
      } else if (token.includes('student')) {
        user = mockUsers[2] // student
      } else {
        user = mockUsers[0] // 默认返回 admin
      }
      
      return {
        result: {
          user_id: user.user_id,
          username: user.username,
          nickname: user.nickname,
          avatar: user.avatar,
          phone: user.phone,
          email: user.email,
          user_group: user.user_group,
          user_admin: user.user_admin,
          state: user.state
        }
      }
    }
  },
  
  // 修改密码
  {
    url: '/api/user/password',
    method: 'post',
    response: ({ body, headers }: { 
      body: { oldPassword: string; newPassword: string }
      headers: { 'x-auth-token'?: string }
    }) => {
      const token = headers['x-auth-token']
      
      if (!token || !token.startsWith('mock_token_')) {
        return {
          error: {
            code: 401,
            message: '未登录或登录已过期'
          }
        }
      }
      
      const { oldPassword, newPassword } = body
      
      // 根据token找到对应的用户
      let userIndex = -1
      if (token.includes('admin')) {
        userIndex = mockUsers.findIndex(u => u.user_id === 1)
      } else if (token.includes('teacher')) {
        userIndex = mockUsers.findIndex(u => u.user_id === 2)
      } else if (token.includes('student')) {
        userIndex = mockUsers.findIndex(u => u.user_id === 3)
      }
      
      if (userIndex === -1) {
        userIndex = 0 // 默认使用第一个用户
      }
      
      const user = mockUsers[userIndex]
      
      // 验证旧密码
      if (user.password !== oldPassword) {
        return {
          error: {
            code: 10002,
            message: '原密码错误'
          }
        }
      }
      
      // 验证新密码
      if (!newPassword || newPassword.length < 6) {
        return {
          error: {
            code: 10003,
            message: '新密码长度不能少于6位'
          }
        }
      }
      
      // 更新密码并保存到localStorage
      user.password = newPassword
      saveUsersToStorage(mockUsers)
      
      return {
        result: {
          message: '密码修改成功'
        }
      }
    }
  },
  
  // 忘记密码
  {
    url: '/api/user/forgot',
    method: 'post',
    response: ({ body }: { body: { username: string; email: string } }) => {
      const { username, email } = body
      
      // 查找用户
      const user = mockUsers.find(
        u => u.username === username && u.email === email
      )
      
      if (!user) {
        return {
          error: {
            code: 10004,
            message: '用户名或邮箱不匹配'
          }
        }
      }
      
      return {
        result: {
          message: '密码重置链接已发送到您的邮箱，请查收'
        }
      }
    }
  },
  
  // 更新用户信息
  {
    url: '/api/user/info',
    method: 'put',
    response: ({ body, headers }: { 
      body: { nickname?: string; phone?: string; email?: string }
      headers: { 'x-auth-token'?: string }
    }) => {
      const token = headers['x-auth-token']
      
      if (!token || !token.startsWith('mock_token_')) {
        return {
          error: {
            code: 401,
            message: '未登录或登录已过期'
          }
        }
      }
      
      // 根据token找到对应的用户
      let userIndex = -1
      if (token.includes('admin')) {
        userIndex = mockUsers.findIndex(u => u.user_id === 1)
      } else if (token.includes('teacher')) {
        userIndex = mockUsers.findIndex(u => u.user_id === 2)
      } else if (token.includes('student')) {
        userIndex = mockUsers.findIndex(u => u.user_id === 3)
      }
      
      if (userIndex === -1) {
        userIndex = 0 // 默认使用第一个用户
      }
      
      const user = mockUsers[userIndex]
      
      // 更新用户信息
      if (body.nickname) user.nickname = body.nickname
      if (body.phone) user.phone = body.phone
      if (body.email) user.email = body.email
      
      // 保存到localStorage
      saveUsersToStorage(mockUsers)
      
      return {
        result: {
          message: '更新成功',
          user_id: user.user_id,
          username: user.username,
          nickname: user.nickname,
          avatar: user.avatar,
          phone: user.phone,
          email: user.email,
          user_group: user.user_group,
          user_admin: user.user_admin,
          state: user.state
        }
      }
    }
  },
  
  // 检查后端服务状态（用于 check-backend）
  {
    url: '/api/user/state',
    method: 'get',
    response: () => {
      return {
        result: {
          status: 'ok',
          message: 'Mock 服务运行正常'
        }
      }
    }
  }
] as MockMethod[]

