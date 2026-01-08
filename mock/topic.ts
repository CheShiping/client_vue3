import { MockMethod } from 'vite-plugin-mock'

// 存储键名
const STORAGE_KEY = 'defense_topics_management'

// 检查是否在浏览器环境中
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined'

// 从localStorage获取数据或使用默认数据
export function getStoredTopics() {
  if (!isBrowser) return null
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (e) {
    return null
  }
}

// 保存数据到localStorage
export function saveTopicsToStorage(topics: any[]) {
  if (!isBrowser) return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(topics))
  } catch (e) {
    console.error('保存选题数据到localStorage失败:', e)
  }
}

// Mock 选题数据（基于 SQL 数据）
let mockTopics = getStoredTopics() || [
  {
    topic_information_id: 1,
    thesis_title: '基于Vue3和SpringBoot的答辩管理系统',
    instructor: 1,
    question_type: '软件开发',
    selected_students: 1,
    topic_selection_time: '2025-01-15',
    question_status: '开放',
    topic_status: '开放',
    topic_notes: '开发一个现代化的答辩管理系统',
    selected_students_count: 0,
    max_students: 5,
    recommend: 0,
    create_time: '2025-12-14 15:28:12',
    update_time: '2025-01-10 10:00:00'
  },
  {
    topic_information_id: 2,
    thesis_title: '基于深度学习的图像识别技术研究',
    instructor: 2,
    question_type: '应用研究',
    selected_students: 0,
    topic_selection_time: '2025-01-10',
    question_status: '开放',
    topic_status: '开放',
    topic_notes: '研究深度学习在图像识别领域的应用',
    selected_students_count: 0,
    max_students: 3,
    recommend: 1,
    create_time: '2025-12-14 15:28:12',
    update_time: '2025-01-05 14:30:00'
  },
  {
    topic_information_id: 3,
    thesis_title: '企业级微服务架构设计与实践',
    instructor: 1,
    question_type: '工程设计',
    selected_students: 0,
    topic_selection_time: '2025-01-12',
    question_status: '开放',
    topic_status: '已满',
    topic_notes: '探讨微服务架构在企业应用中的最佳实践',
    selected_students_count: 4,
    max_students: 4,
    recommend: 0,
    create_time: '2025-12-14 15:28:12',
    update_time: '2025-01-08 09:15:00'
  },
  {
    topic_information_id: 4,
    thesis_title: '基于区块链的数据安全存储系统',
    instructor: 3,
    question_type: '工程设计',
    selected_students: 0,
    topic_selection_time: '2025-01-08',
    question_status: '开放',
    topic_status: '开放',
    topic_notes: '研究区块链技术在数据安全领域的应用',
    selected_students_count: 0,
    max_students: 2,
    recommend: 1,
    create_time: '2025-12-14 15:28:12',
    update_time: '2025-01-06 11:20:00'
  },
  {
    topic_information_id: 5,
    thesis_title: '人工智能在医疗诊断中的应用',
    instructor: 2,
    question_type: '应用研究',
    selected_students: 0,
    topic_selection_time: '2025-01-05',
    question_status: '开放',
    topic_status: '开放', // 修改为开放状态
    topic_notes: '探讨AI在医疗领域的应用前景',
    selected_students_count: 0,
    max_students: 10,
    recommend: 0,
    create_time: '2025-12-14 15:28:12',
    update_time: '2025-01-07 15:45:00'
  }
]

// 保存初始数据到localStorage
if (!getStoredTopics() && isBrowser) {
  saveTopicsToStorage(mockTopics)
}

export default [
  // 获取选题列表
  {
    url: '/api/topic/list',
    method: 'get',
    response: ({ query }: { query: { page?: string; size?: string; thesis_title?: string } }) => {
      const page = parseInt(query.page || '1')
      const size = parseInt(query.size || '10')
      const thesis_title = query.thesis_title || ''
      
      let filtered = mockTopics.filter(item => {
        if (thesis_title && !item.thesis_title.includes(thesis_title)) return false
        return true
      })
      
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
  
  // 获取选题详情
  {
    url: '/api/topic/:id',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const id = parseInt(url.split('/').pop() || '0')
      const topic = mockTopics.find(t => t.topic_information_id === id)
      
      if (!topic) {
        return {
          error: {
            code: 404,
            message: '选题信息不存在'
          }
        }
      }
      
      return {
        result: topic
      }
    }
  },
  
  // 新增选题
  {
    url: '/api/topic',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const newId = Math.max(...mockTopics.map(t => t.topic_information_id), 0) + 1
      const newTopic = {
        topic_information_id: newId,
        ...body,
        selected_students_count: body.selected_students_count || 0,
        max_students: body.max_students || 5,
        topic_status: '开放', // 新增选题默认为开放状态
        recommend: 0,
        create_time: new Date().toISOString().replace('T', ' ').slice(0, 19),
        update_time: new Date().toISOString().replace('T', ' ').slice(0, 19)
      }
      mockTopics.push(newTopic)
      saveTopicsToStorage(mockTopics) // 保存到localStorage
      
      return {
        result: {
          message: '新增成功',
          data: newTopic
        }
      }
    }
  },
  
  // 更新选题
  {
    url: '/api/topic/:id',
    method: 'put',
    response: ({ url, body }: { url: string; body: any }) => {
      const id = parseInt(url.split('/').pop() || '0')
      const index = mockTopics.findIndex(t => t.topic_information_id === id)
      
      if (index === -1) {
        return {
          error: {
            code: 404,
            message: '选题信息不存在'
          }
        }
      }
      
      // 保留原有的学生选择计数
      const oldCount = mockTopics[index].selected_students_count
      mockTopics[index] = {
        ...mockTopics[index],
        ...body,
        selected_students_count: oldCount, // 保持原有的选择计数
        update_time: new Date().toISOString().replace('T', ' ').slice(0, 19)
      }
      saveTopicsToStorage(mockTopics) // 保存到localStorage
      
      return {
        result: {
          message: '更新成功',
          data: mockTopics[index]
        }
      }
    }
  },
  
  // 删除选题
  {
    url: '/api/topic/:id',
    method: 'delete',
    response: ({ url }: { url: string }) => {
      const id = parseInt(url.split('/').pop() || '0')
      const index = mockTopics.findIndex(t => t.topic_information_id === id)
      
      if (index === -1) {
        return {
          error: {
            code: 404,
            message: '选题信息不存在'
          }
        }
      }
      
      mockTopics.splice(index, 1)
      saveTopicsToStorage(mockTopics) // 保存到localStorage
      
      return {
        result: {
          message: '删除成功'
        }
      }
    }
  },
  
  // 学生选择选题
  {
    url: '/api/topic/select/:topicId',
    method: 'post',
    response: ({ url }: { url: string }) => {
      const topicId = parseInt(url.split('/').pop() || '0')
      const topic = mockTopics.find(t => t.topic_information_id === topicId)
      
      if (!topic) {
        return {
          error: {
            code: 404,
            message: '选题信息不存在'
          }
        }
      }
      
      // 检查是否已达到最大选择人数
      if (topic.selected_students_count >= topic.max_students) {
        return {
          error: {
            code: 400,
            message: '该选题已达到最大选择人数限制'
          }
        }
      }
      
      // 检查学生是否已经选择了这个题目
      // 注意：在真实环境中，我们需要验证当前登录的学生
      // 这里我们简化处理，仅检查topic_status是否为"已选"
      if (topic.topic_status === '已选') {
        return {
          error: {
            code: 400,
            message: '您已经选择了这个题目'
          }
        }
      }
      
      // 更新选题信息
      topic.selected_students_count += 1
      topic.topic_status = topic.selected_students_count >= topic.max_students ? '已满' : '已选'
      topic.update_time = new Date().toISOString().replace('T', ' ').slice(0, 19)
      
      saveTopicsToStorage(mockTopics) // 保存到localStorage
      
      return {
        result: {
          message: '选题成功',
          data: topic
        }
      }
    }
  },
  
  // 学生取消选题
  {
    url: '/api/topic/unselect/:topicId',
    method: 'post',
    response: ({ url }: { url: string }) => {
      const topicId = parseInt(url.split('/').pop() || '0')
      const topic = mockTopics.find(t => t.topic_information_id === topicId)
      
      if (!topic) {
        return {
          error: {
            code: 404,
            message: '选题信息不存在'
          }
        }
      }
      
      // 检查题目是否已被选择
      if (topic.topic_status !== '已选') {
        return {
          error: {
            code: 400,
            message: '您尚未选择这个题目，无法取消'
          }
        }
      }
      
      topic.selected_students_count = Math.max(0, topic.selected_students_count - 1)
      topic.topic_status = '开放' // 取消选择后恢复为开放状态
      topic.update_time = new Date().toISOString().replace('T', ' ').slice(0, 19)
      
      saveTopicsToStorage(mockTopics) // 保存到localStorage
      
      return {
        result: {
          message: '取消选题成功',
          data: topic
        }
      }
    }
  },
  
  // 获取学生已选择的选题
  {
    url: '/api/topic/student/:studentId/selected',
    method: 'get',
    response: ({ url }: { url: string }) => {
      // 从URL中提取学生ID（实际应用中会用这个ID来查找该学生选择的题目）
      // const studentId = parseInt(url.split('/')[4]) || 0;
      
      // 在mock中，我们返回第一个题目作为已选题目，并添加defense_id
      const firstTopic = mockTopics[0];
      
      if (firstTopic) {
        // 为已选题目添加defense_id字段，关联到答辩记录
        const topicWithDefenseId = {
          ...firstTopic,
          topic_status: '已选', // 设置为已选状态
          defense_id: 1 // 关联到第一个答辩记录
        }
        return {
          result: topicWithDefenseId
        }
      } else {
        return {
          result: null
        }
      }
    }
  }
] as MockMethod[]