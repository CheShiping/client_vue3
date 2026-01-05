import { MockMethod } from 'vite-plugin-mock'

// 存储键名
const STORAGE_KEY = 'thesis_management_teachers'

// 检查是否在浏览器环境中
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined'

// 从localStorage获取数据或使用默认数据
function getStoredTeachers() {
  if (!isBrowser) return null
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (e) {
    return null
  }
}

// 保存数据到localStorage
function saveTeachersToStorage(teachers: any[]) {
  if (!isBrowser) return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teachers))
  } catch (e) {
    console.error('保存教师数据到localStorage失败:', e)
  }
}

// Mock 教师数据（基于 SQL 数据）
let mockTeachers = getStoredTeachers() || [
  {
    teacher_users_id: 1,
    teachers_name: '张老师',
    teacher_gender: '男',
    teacher_age: '35',
    examine_state: '已通过',
    recommend: 0,
    user_id: 1,
    create_time: '2023-07-14 15:28:12',
    update_time: '2023-07-14 15:28:12',
    employee_no: 'T001',
    professional_title: '教授',
    phone: '13900139001',
    email: 'teacher1@example.com'
  },
  {
    teacher_users_id: 2,
    teachers_name: '李老师',
    teacher_gender: '女',
    teacher_age: '32',
    examine_state: '已通过',
    recommend: 0,
    user_id: 2,
    create_time: '2023-07-14 15:28:12',
    update_time: '2023-07-14 15:28:12',
    employee_no: 'T002',
    professional_title: '副教授',
    phone: '13900139002',
    email: 'teacher2@example.com'
  },
  {
    teacher_users_id: 3,
    teachers_name: '王老师',
    teacher_gender: '男',
    teacher_age: '40',
    examine_state: '已通过',
    recommend: 0,
    user_id: 8,
    create_time: '2023-07-15 11:00:00',
    update_time: '2023-07-15 11:00:00',
    employee_no: 'T003',
    professional_title: '讲师',
    phone: '13900139003',
    email: 'teacher3@example.com'
  },
  {
    teacher_users_id: 4,
    teachers_name: '赵老师',
    teacher_gender: '女',
    teacher_age: '38',
    examine_state: '已通过',
    recommend: 0,
    user_id: 9,
    create_time: '2023-07-15 11:00:00',
    update_time: '2023-07-15 11:00:00',
    employee_no: 'T004',
    professional_title: '副教授',
    phone: '13900139004',
    email: 'teacher4@example.com'
  },
  {
    teacher_users_id: 5,
    teachers_name: '孙老师',
    teacher_gender: '男',
    teacher_age: '45',
    examine_state: '已通过',
    recommend: 0,
    user_id: 10,
    create_time: '2023-07-15 11:00:00',
    update_time: '2023-07-15 11:00:00',
    employee_no: 'T005',
    professional_title: '教授',
    phone: '13900139005',
    email: 'teacher5@example.com'
  }
]

// 保存初始数据到localStorage
if (!getStoredTeachers() && isBrowser) {
  saveTeachersToStorage(mockTeachers)
}

export default [
  // 获取教师列表
  {
    url: '/api/teacher/list',
    method: 'get',
    response: ({ query }: { query: { page?: string; size?: string; teachers_name?: string; employee_no?: string } }) => {
      const page = parseInt(query.page || '1')
      const size = parseInt(query.size || '10')
      const teachers_name = query.teachers_name || ''
      const employee_no = query.employee_no || ''
      
      // 过滤数据
      let filtered = mockTeachers.filter(item => {
        if (teachers_name && !item.teachers_name.includes(teachers_name)) return false
        if (employee_no && !item.employee_no.includes(employee_no)) return false
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
  
  // 获取教师详情
  {
    url: '/api/teacher/:id',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const id = parseInt(url.split('/').pop() || '0')
      const teacher = mockTeachers.find(t => t.teacher_users_id === id)
      
      if (!teacher) {
        return {
          error: {
            code: 404,
            message: '教师不存在'
          }
        }
      }
      
      return {
        result: teacher
      }
    }
  },
  
  // 新增教师
  {
    url: '/api/teacher',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const newId = Math.max(...mockTeachers.map(t => t.teacher_users_id)) + 1
      const newTeacher = {
        teacher_users_id: newId,
        ...body,
        examine_state: '已通过',
        recommend: 0,
        create_time: new Date().toISOString().replace('T', ' ').slice(0, 19),
        update_time: new Date().toISOString().replace('T', ' ').slice(0, 19)
      }
      mockTeachers.push(newTeacher)
      saveTeachersToStorage(mockTeachers) // 保存到localStorage
      
      return {
        result: {
          message: '新增成功',
          data: newTeacher
        }
      }
    }
  },
  
  // 更新教师
  {
    url: '/api/teacher/:id',
    method: 'put',
    response: ({ url, body }: { url: string; body: any }) => {
      const id = parseInt(url.split('/').pop() || '0')
      const index = mockTeachers.findIndex(t => t.teacher_users_id === id)
      
      if (index === -1) {
        return {
          error: {
            code: 404,
            message: '教师不存在'
          }
        }
      }
      
      mockTeachers[index] = {
        ...mockTeachers[index],
        ...body,
        update_time: new Date().toISOString().replace('T', ' ').slice(0, 19)
      }
      saveTeachersToStorage(mockTeachers) // 保存到localStorage
      
      return {
        result: {
          message: '更新成功',
          data: mockTeachers[index]
        }
      }
    }
  },
  
  // 删除教师
  {
    url: '/api/teacher/:id',
    method: 'delete',
    response: ({ url }: { url: string }) => {
      const id = parseInt(url.split('/').pop() || '0')
      const index = mockTeachers.findIndex(t => t.teacher_users_id === id)
      
      if (index === -1) {
        return {
          error: {
            code: 404,
            message: '教师不存在'
          }
        }
      }
      
      mockTeachers.splice(index, 1)
      saveTeachersToStorage(mockTeachers) // 保存到localStorage
      
      return {
        result: {
          message: '删除成功'
        }
      }
    }
  }
] as MockMethod[]