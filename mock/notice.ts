import { MockMethod } from 'vite-plugin-mock'

// 存储键名
const STORAGE_KEY = 'thesis_management_notices'

// 检查是否在浏览器环境中
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined'

// 从localStorage获取数据或使用默认数据
function getStoredNotices() {
  if (!isBrowser) return null
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (e) {
    return null
  }
}

// 保存数据到localStorage
function saveNoticesToStorage(notices: any[]) {
  if (!isBrowser) return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notices))
  } catch (e) {
    console.error('保存公告数据到localStorage失败:', e)
  }
}

// Mock 公告数据（基于 SQL 数据）
let mockNotices = getStoredNotices() || [
  {
    notice_id: 1,
    notice_title: '毕业答辩工作安排通知',
    notice_content: '各位同学，2026届毕业答辩工作将于7月14日至7月30日进行，请相关同学及时关注答辩安排，按时参加答辩。',
    notice_publisher: '教务处',
    release_time: '2025-12-10',
    examine_state: '已通过',
    recommend: 0,
    create_time: '2025-12-10 09:00:00',
    update_time: '2025-12-10 09:00:00'
  },
  {
    notice_id: 2,
    notice_title: '关于答辩材料提交截止时间的通知',
    notice_content: '请各位参与答辩的同学于7月12日前提交答辩PPT和相关材料至指定邮箱，逾期将影响答辩安排。',
    notice_publisher: '学院办公室',
    release_time: '2025-12-08',
    examine_state: '已通过',
    recommend: 0,
    create_time: '2025-12-08 14:30:00',
    update_time: '2025-12-08 14:30:00'
  },
  {
    notice_id: 3,
    notice_title: '答辩地点变更通知',
    notice_content: '原定于软件大楼1203教室的答辩因故调整至软件大楼1208教室进行，请相关同学注意。',
    notice_publisher: '系主任办公室',
    release_time: '2025-12-12',
    examine_state: '已通过',
    recommend: 0,
    create_time: '2025-12-12 11:15:00',
    update_time: '2025-12-12 11:15:00'
  },
  {
    notice_id: 4,
    notice_title: '答辩注意事项提醒',
    notice_content: '答辩当天请着正装出席，提前30分钟到达答辩地点签到。答辩过程中请关闭手机或将手机调至静音状态。',
    notice_publisher: '学生工作处',
    release_time: '2025-12-13',
    examine_state: '已通过',
    recommend: 0,
    create_time: '2025-12-13 16:45:00',
    update_time: '2025-12-13 16:45:00'
  },
  {
    notice_id: 5,
    notice_title: '优秀论文评选工作启动',
    notice_content: '今年将继续开展优秀毕业论文评选工作，有意参评的同学请在答辩结束后一周内提交申请材料。',
    notice_publisher: '科研处',
    release_time: '2025-12-05',
    examine_state: '已通过',
    recommend: 0,
    create_time: '2025-12-05 10:20:00',
    update_time: '2025-12-05 10:20:00'
  },
  {
    notice_id: 6,
    notice_title: '答辩结果公示',
    notice_content: '7月14日场次的答辩结果已出，请相关同学登录系统查看。如有异议，请在3个工作日内提出申诉。',
    notice_publisher: '教学督导组',
    release_time: '2025-12-14',
    examine_state: '已通过',
    recommend: 0,
    create_time: '2025-12-14 18:30:00',
    update_time: '2025-12-14 18:30:00'
  },
  {
    notice_id: 7,
    notice_title: '暑期实验室开放安排',
    notice_content: '为方便同学们修改论文和准备二次答辩，软件大楼701实验室将在暑期每周一、三、五上午8:00-12:00开放。',
    notice_publisher: '实验中心',
    release_time: '2025-12-15',
    examine_state: '已通过',
    recommend: 0,
    create_time: '2025-12-15 09:45:00',
    update_time: '2025-12-15 09:45:00'
  }
]

// 保存初始数据到localStorage
if (!getStoredNotices() && isBrowser) {
  saveNoticesToStorage(mockNotices)
}

export default [
  // 获取公告列表
  {
    url: '/api/notice/list',
    method: 'get',
    response: ({ query }: { query: { page?: string; size?: string; notice_title?: string } }) => {
      const page = parseInt(query.page || '1')
      const size = parseInt(query.size || '10')
      const notice_title = query.notice_title || ''
      
      let filtered = mockNotices.filter(item => {
        if (notice_title && !item.notice_title.includes(notice_title)) return false
        return true
      })
      
      // 按发布时间倒序排列
      filtered.sort((a, b) => 
        new Date(b.release_time).getTime() - new Date(a.release_time).getTime()
      )
      
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
  
  // 获取公告详情
  {
    url: '/api/notice/:id',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const id = parseInt(url.split('/').pop() || '0')
      const notice = mockNotices.find(n => n.notice_id === id)
      
      if (!notice) {
        return {
          error: {
            code: 404,
            message: '公告不存在'
          }
        }
      }
      
      return {
        result: notice
      }
    }
  },
  
  // 新增公告
  {
    url: '/api/notice',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const newId = Math.max(...mockNotices.map(n => n.notice_id)) + 1
      const newNotice = {
        notice_id: newId,
        ...body,
        examine_state: '已通过',
        recommend: 0,
        create_time: new Date().toISOString().replace('T', ' ').slice(0, 19),
        update_time: new Date().toISOString().replace('T', ' ').slice(0, 19)
      }
      mockNotices.push(newNotice)
      saveNoticesToStorage(mockNotices) // 保存到localStorage
      
      return {
        result: {
          message: '新增成功',
          data: newNotice
        }
      }
    }
  },
  
  // 更新公告
  {
    url: '/api/notice/:id',
    method: 'put',
    response: ({ url, body }: { url: string; body: any }) => {
      const id = parseInt(url.split('/').pop() || '0')
      const index = mockNotices.findIndex(n => n.notice_id === id)
      
      if (index === -1) {
        return {
          error: {
            code: 404,
            message: '公告不存在'
          }
        }
      }

      saveNoticesToStorage(mockNotices) // 保存到localStorage
      
      return {
        result: {
          message: '更新成功',
          data: mockNotices[index]
        }
      }
    }
  },
  
  // 删除公告
  {
    url: '/api/notice/:id',
    method: 'delete',
    response: ({ url }: { url: string }) => {
      const id = parseInt(url.split('/').pop() || '0')
      const index = mockNotices.findIndex(n => n.notice_id === id)
      
      if (index === -1) {
        return {
          error: {
            code: 404,
            message: '公告不存在'
          }
        }
      }
      
      mockNotices.splice(index, 1)
      saveNoticesToStorage(mockNotices) // 保存到localStorage
      
      return {
        result: {
          message: '删除成功'
        }
      }
    }
  }
] as MockMethod[]