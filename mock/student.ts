import { MockMethod } from 'vite-plugin-mock'

// 存储键名
const STORAGE_KEY = 'thesis_management_students'

// 检查是否在浏览器环境中
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined'

// 从localStorage获取数据或使用默认数据
function getStoredStudents() {
  if (!isBrowser) return null
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (e) {
    return null
  }
}

// 保存数据到localStorage
function saveStudentsToStorage(students: any[]) {
  if (!isBrowser) return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students))
  } catch (e) {
    console.error('保存学生数据到localStorage失败:', e)
  }
}

// Mock 学生数据（基于 SQL 数据）
let mockStudents = getStoredStudents() || [
  {
    student_users_id: 1,
    student_name: '张三',
    student_gender: '男',
    student_age: '20',
    examine_state: '已通过',
    recommend: 0,
    user_id: 3,
    create_time: '2023-07-14 15:28:12',
    update_time: '2023-07-14 15:28:12',
    student_no: '2021001',
    class_name: '计算机科学1班',
    phone: '13800138002',
    email: 'zhangsan@example.com'
  },
  {
    student_users_id: 2,
    student_name: '李四',
    student_gender: '女',
    student_age: '21',
    examine_state: '已通过',
    recommend: 0,
    user_id: 4,
    create_time: '2023-07-14 15:28:12',
    update_time: '2023-07-14 15:28:12',
    student_no: '2021002',
    class_name: '计算机科学1班',
    phone: '13800138003',
    email: 'lisi@example.com'
  },
  {
    student_users_id: 3,
    student_name: '王五',
    student_gender: '男',
    student_age: '20',
    examine_state: '已通过',
    recommend: 0,
    user_id: 5,
    create_time: '2023-07-14 15:28:12',
    update_time: '2023-07-14 15:28:12',
    student_no: '2021003',
    class_name: '计算机科学1班',
    phone: '13800138004',
    email: 'wangwu@example.com'
  },
  {
    student_users_id: 4,
    student_name: '赵六',
    student_gender: '女',
    student_age: '22',
    examine_state: '已通过',
    recommend: 0,
    user_id: 6,
    create_time: '2023-07-14 15:28:12',
    update_time: '2023-07-14 15:28:12',
    student_no: '2021004',
    class_name: '计算机科学2班',
    phone: '13800138005',
    email: 'zhaoliu@example.com'
  },
  {
    student_users_id: 5,
    student_name: '孙七',
    student_gender: '男',
    student_age: '21',
    examine_state: '已通过',
    recommend: 0,
    user_id: 7,
    create_time: '2023-07-14 15:28:12',
    update_time: '2023-07-14 15:28:12',
    student_no: '2021005',
    class_name: '计算机科学2班',
    phone: '13800138006',
    email: 'sunqi@example.com'
  },
  {
    student_users_id: 6,
    student_name: '周八',
    student_gender: '女',
    student_age: '20',
    examine_state: '已通过',
    recommend: 0,
    user_id: 8,
    create_time: '2023-07-14 15:28:12',
    update_time: '2023-07-14 15:28:12',
    student_no: '2021006',
    class_name: '计算机科学2班',
    phone: '13800138007',
    email: 'zhouba@example.com'
  },
  {
    student_users_id: 7,
    student_name: '吴九',
    student_gender: '男',
    student_age: '22',
    examine_state: '已通过',
    recommend: 0,
    user_id: 9,
    create_time: '2023-07-14 15:28:12',
    update_time: '2023-07-14 15:28:12',
    student_no: '2021007',
    class_name: '软件工程1班',
    phone: '13800138008',
    email: 'wujiu@example.com'
  },
  {
    student_users_id: 8,
    student_name: '郑十',
    student_gender: '女',
    student_age: '21',
    examine_state: '已通过',
    recommend: 0,
    user_id: 10,
    create_time: '2023-07-14 15:28:12',
    update_time: '2023-07-14 15:28:12',
    student_no: '2021008',
    class_name: '软件工程1班',
    phone: '13800138009',
    email: 'zhengshi@example.com'
  }
]

// 保存初始数据到localStorage
if (!getStoredStudents() && isBrowser) {
  saveStudentsToStorage(mockStudents)
}

// 为了调试，我们强制重置localStorage中的数据

export default [
  // 获取学生列表
  {
    url: '/api/student/list',
    method: 'get',
    response: ({ query }: { query: { page?: string; size?: string; student_name?: string; student_no?: string } }) => {
      const page = parseInt(query.page || '1')
      const size = parseInt(query.size || '10')
      const student_name = query.student_name || ''
      const student_no = query.student_no || ''
      
      // 过滤数据
      let filtered = mockStudents.filter(item => {
        if (student_name && !item.student_name.includes(student_name)) return false
        if (student_no && !item.student_no.includes(student_no)) return false
        return true
      })
      
      // 分页
      const start = (page - 1) * size
      const end = start + size
      const data = filtered.slice(start, end)
      
      return {
        result: {
          list: data,
          total: filtered.length,
          page,
          size
        }
      }
    }
  },
  
  // 根据用户ID获取学生信息
  {
    url: '/api/student/user/:userId',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const userId = parseInt(url.split('/').pop() || '0')
      const student = mockStudents.find(s => s.user_id === userId)
      
      if (!student) {
        return {
          error: {
            code: 404,
            message: '学生不存在'
          }
        }
      }
      
      return {
        result: student
      }
    }
  },
  
  // 获取学生详情
  {
    url: '/api/student/:id',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const id = parseInt(url.split('/').pop() || '0')
      const student = mockStudents.find(s => s.student_users_id === id)
      
      if (!student) {
        return {
          error: {
            code: 404,
            message: '学生不存在'
          }
        }
      }
      
      return {
        result: student
      }
    }
  },
  
  // 新增学生
  {
    url: '/api/student',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const newId = Math.max(...mockStudents.map(s => s.student_users_id)) + 1
      const newStudent = {
        student_users_id: newId,
        ...body,
        examine_state: '已通过',
        recommend: 0,
        create_time: new Date().toISOString().replace('T', ' ').slice(0, 19),
        update_time: new Date().toISOString().replace('T', ' ').slice(0, 19)
      }
      mockStudents.push(newStudent)
      saveStudentsToStorage(mockStudents) // 保存到localStorage
      
      return {
        result: {
          message: '新增成功',
          data: newStudent
        }
      }
    }
  },
  
  // 更新学生
  {
    url: '/api/student/:id',
    method: 'put',
    response: ({ url, body }: { url: string; body: any }) => {
      const id = parseInt(url.split('/').pop() || '0')
      const index = mockStudents.findIndex(s => s.student_users_id === id)
      
      if (index === -1) {
        return {
          error: {
            code: 404,
            message: '学生不存在'
          }
        }
      }
      
      mockStudents[index] = {
        ...mockStudents[index],
        ...body,
        update_time: new Date().toISOString().replace('T', ' ').slice(0, 19)
      }
      saveStudentsToStorage(mockStudents) // 保存到localStorage
      
      return {
        result: {
          message: '更新成功',
          data: mockStudents[index]
        }
      }
    }
  },
  
  // 删除学生
  {
    url: '/api/student/:id',
    method: 'delete',
    response: ({ url }: { url: string }) => {
      const id = parseInt(url.split('/').pop() || '0')
      const index = mockStudents.findIndex(s => s.student_users_id === id)
      
      if (index === -1) {
        return {
          error: {
            code: 404,
            message: '学生不存在'
          }
        }
      }
      
      mockStudents.splice(index, 1)
      saveStudentsToStorage(mockStudents) // 保存到localStorage
      
      return {
        result: {
          message: '删除成功'
        }
      }
    }
  },
  
  // 根据用户ID获取学生信息
  {
    url: '/api/student/user/:userId',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const userId = parseInt(url.split('/').pop() || '0')
      const student = mockStudents.find(s => s.user_id === userId)
      
      if (!student) {
        return {
          error: {
            code: 404,
            message: '学生不存在'
          }
        }
      }
      
      return {
        result: student
      }
    }
  }
] as MockMethod[]