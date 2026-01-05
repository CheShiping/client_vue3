import { MockMethod } from 'vite-plugin-mock'

// 存储键名
const STORAGE_KEY = 'defense_management_scores'

// 检查是否在浏览器环境中
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined'

// 从localStorage获取数据或使用默认数据
function getStoredScores() {
  if (!isBrowser) return null
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (e) {
    return null
  }
}

// 保存数据到localStorage
function saveScoresToStorage(scores: any[]) {
  if (!isBrowser) return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores))
  } catch (e) {
    console.error('保存成绩数据到localStorage失败:', e)
  }
}

// Mock 答辩成绩数据（基于 SQL 数据）
let mockScores = getStoredScores() || [
  {
    score_information_id: 1,
    thesis_title: '基于深度学习的图像识别技术研究',
    question_type: '学术答辩',
    defense_student: 1,
    release_time: '2023-07-25',
    award_and_excellence_evaluation: '优秀',
    score_details: '答辩表现突出，回答问题准确，研究内容充实，具有创新性。答辩委员会一致同意评为优秀等级。',
    total_score: 92,
    report_score: 30,
    reply_score: 62,
    recommend: 1,
    create_time: '2023-07-25 15:28:12',
    update_time: '2023-07-25 15:28:12'
  },
  {
    score_information_id: 2,
    thesis_title: '大数据平台下的用户行为分析系统设计',
    question_type: '技术答辩',
    defense_student: 2,
    release_time: '2023-07-26',
    award_and_excellence_evaluation: '良好',
    score_details: '系统设计合理，实现方法可行，答辩过程中能够清晰阐述设计思路，回答问题基本准确。',
    total_score: 85,
    report_score: 28,
    reply_score: 57,
    recommend: 0,
    create_time: '2023-07-26 15:28:12',
    update_time: '2023-07-26 15:28:12'
  },
  {
    score_information_id: 3,
    thesis_title: '移动应用中的用户体验优化策略',
    question_type: '研究答辩',
    defense_student: 3,
    release_time: '2023-07-27',
    award_and_excellence_evaluation: '良好',
    score_details: '研究方法科学，结论可靠，答辩准备充分，但对部分问题的回答不够深入。',
    total_score: 83,
    report_score: 27,
    reply_score: 56,
    recommend: 0,
    create_time: '2023-07-27 15:28:12',
    update_time: '2023-07-27 15:28:12'
  },
  {
    score_information_id: 4,
    thesis_title: '区块链技术在供应链管理中的应用',
    question_type: '学术答辩',
    defense_student: 4,
    release_time: '2023-07-28',
    award_and_excellence_evaluation: '优秀',
    score_details: '研究视角独特，技术方案创新，答辩表现优秀，回答问题准确且思路清晰。',
    total_score: 90,
    report_score: 29,
    reply_score: 61,
    recommend: 1,
    create_time: '2023-07-28 15:28:12',
    update_time: '2023-07-28 15:28:12'
  },
  {
    score_information_id: 5,
    thesis_title: '云计算环境下的数据安全保护机制',
    question_type: '研究答辩',
    defense_student: 5,
    release_time: '2023-07-29',
    award_and_excellence_evaluation: '良好',
    score_details: '研究内容具有实际意义，方法可行，答辩准备充分，但部分技术细节解释不够清晰。',
    total_score: 84,
    report_score: 28,
    reply_score: 56,
    recommend: 0,
    create_time: '2023-07-29 15:28:12',
    update_time: '2023-07-29 15:28:12'
  },
  {
    score_information_id: 6,
    thesis_title: '物联网系统中的边缘计算优化方案',
    question_type: '技术答辩',
    defense_student: 6,
    release_time: '2023-07-30',
    award_and_excellence_evaluation: '中等',
    score_details: '方案设计基本合理，但创新性不足，答辩过程中对部分技术问题回答不够准确。',
    total_score: 76,
    report_score: 25,
    reply_score: 51,
    recommend: 0,
    create_time: '2023-07-30 15:28:12',
    update_time: '2023-07-30 15:28:12'
  },
  {
    score_information_id: 7,
    thesis_title: '人工智能在医疗诊断中的应用探索',
    question_type: '学术答辩',
    defense_student: 7,
    release_time: '2023-07-31',
    award_and_excellence_evaluation: '优秀',
    score_details: '研究内容前沿，方法创新，成果突出，答辩表现优异，回答问题准确且有深度。',
    total_score: 94,
    report_score: 31,
    reply_score: 63,
    recommend: 1,
    create_time: '2023-07-31 15:28:12',
    update_time: '2023-07-31 15:28:12'
  },
  {
    score_information_id: 8,
    thesis_title: 'Web应用性能优化关键技术研究',
    question_type: '研究答辩',
    defense_student: 8,
    release_time: '2023-08-01',
    award_and_excellence_evaluation: '良好',
    score_details: '研究内容实用，方法可行，答辩准备充分，实验数据详实，但对优化效果的分析不够深入。',
    total_score: 86,
    report_score: 28,
    reply_score: 58,
    recommend: 0,
    create_time: '2023-08-01 15:28:12',
    update_time: '2023-08-01 15:28:12'
  }
]

// 保存初始数据到localStorage
if (!getStoredScores() && isBrowser) {
  saveScoresToStorage(mockScores)
}

export default [
  // 获取成绩列表
  {
    url: '/api/score/list',
    method: 'get',
    response: ({ query }: { query: { page?: string; size?: string; thesis_title?: string } }) => {
      const page = parseInt(query.page || '1')
      const size = parseInt(query.size || '10')
      const thesis_title = query.thesis_title || ''
      
      let filtered = mockScores.filter(item => {
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
  
  // 获取成绩详情
  {
    url: '/api/score/:id',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const id = parseInt(url.split('/').pop() || '0')
      const score = mockScores.find(s => s.score_information_id === id)
      
      if (!score) {
        return {
          error: {
            code: 404,
            message: '成绩信息不存在'
          }
        }
      }
      
      return {
        result: score
      }
    }
  },
  
  // 新增成绩
  {
    url: '/api/score',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const newId = Math.max(...mockScores.map(s => s.score_information_id)) + 1
      const newScore = {
        score_information_id: newId,
        ...body,
        recommend: 0,
        create_time: new Date().toISOString().replace('T', ' ').slice(0, 19),
        update_time: new Date().toISOString().replace('T', ' ').slice(0, 19)
      }
      mockScores.push(newScore)
      saveScoresToStorage(mockScores) // 保存到localStorage
      
      return {
        result: {
          message: '新增成功',
          data: newScore
        }
      }
    }
  },
  
  // 更新成绩
  {
    url: '/api/score/:id',
    method: 'put',
    response: ({ url, body }: { url: string; body: any }) => {
      const id = parseInt(url.split('/').pop() || '0')
      const index = mockScores.findIndex(s => s.score_information_id === id)
      
      if (index === -1) {
        return {
          error: {
            code: 404,
            message: '成绩信息不存在'
          }
        }
      }
      
      mockScores[index] = {
        ...mockScores[index],
        ...body,
        update_time: new Date().toISOString().replace('T', ' ').slice(0, 19)
      }
      saveScoresToStorage(mockScores) // 保存到localStorage
      
      return {
        result: {
          message: '更新成功',
          data: mockScores[index]
        }
      }
    }
  },
  
  // 删除成绩
  {
    url: '/api/score/:id',
    method: 'delete',
    response: ({ url }: { url: string }) => {
      const id = parseInt(url.split('/').pop() || '0')
      const index = mockScores.findIndex(s => s.score_information_id === id)
      
      if (index === -1) {
        return {
          error: {
            code: 404,
            message: '成绩信息不存在'
          }
        }
      }
      
      mockScores.splice(index, 1)
      saveScoresToStorage(mockScores) // 保存到localStorage
      
      return {
        result: {
          message: '删除成功'
        }
      }
    }
  }
] as MockMethod[]