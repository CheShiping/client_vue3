import { MockMethod } from 'vite-plugin-mock'

// 存储键名
const STORAGE_KEY = 'defense_materials_management'

// 检查是否在浏览器环境中
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined'

// 从localStorage获取数据或使用默认数据
function getStoredPapers() {
  if (!isBrowser) return null
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (e) {
    return null
  }
}

// 保存数据到localStorage
function savePapersToStorage(papers: any[]) {
  if (!isBrowser) return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(papers))
  } catch (e) {
    console.error('保存论文数据到localStorage失败:', e)
  }
}

// Mock 答辩材料数据（基于 SQL 数据）
let mockPapers = getStoredPapers() || [
  {
    paper_information_id: 1,
    thesis_title: '基于深度学习的图像识别技术研究',
    instructor: 1,
    paper_type: '学术论文',
    upload_students: 1,
    upload_time: '2023-07-14',
    paper_attachment: '/uploads/papers/paper1.pdf',
    thesis_evaluation: '优秀',
    teachers_opinion: '研究内容充实，方法创新，成果显著',
    paper_comments: '论文结构完整，逻辑清晰，论述充分',
    recommend: 1,
    create_time: '2023-07-14 15:28:12',
    update_time: '2023-07-14 15:28:12'
  },
  {
    paper_information_id: 2,
    thesis_title: '大数据平台下的用户行为分析系统设计',
    instructor: 2,
    paper_type: '技术报告',
    upload_students: 2,
    upload_time: '2023-07-15',
    paper_attachment: '/uploads/papers/paper2.pdf',
    thesis_evaluation: '良好',
    teachers_opinion: '系统设计合理，实现方法可行',
    paper_comments: '报告内容全面，技术路线清晰',
    recommend: 0,
    create_time: '2023-07-14 15:28:12',
    update_time: '2023-07-14 15:28:12'
  },
  {
    paper_information_id: 3,
    thesis_title: '移动应用中的用户体验优化策略',
    instructor: 1,
    paper_type: '研究论文',
    upload_students: 3,
    upload_time: '2023-07-16',
    paper_attachment: '/uploads/papers/paper3.pdf',
    thesis_evaluation: '良好',
    teachers_opinion: '研究方法科学，结论可靠',
    paper_comments: '论文选题新颖，具有一定实用价值',
    recommend: 0,
    create_time: '2023-07-14 15:28:12',
    update_time: '2023-07-14 15:28:12'
  },
  {
    paper_information_id: 4,
    thesis_title: '区块链技术在供应链管理中的应用',
    instructor: 2,
    paper_type: '学术论文',
    upload_students: 4,
    upload_time: '2023-07-17',
    paper_attachment: '/uploads/papers/paper4.pdf',
    thesis_evaluation: '优秀',
    teachers_opinion: '研究视角独特，技术方案创新',
    paper_comments: '论文结构严谨，论证充分',
    recommend: 1,
    create_time: '2023-07-14 15:28:12',
    update_time: '2023-07-14 15:28:12'
  },
  {
    paper_information_id: 5,
    thesis_title: '云计算环境下的数据安全保护机制',
    instructor: 3,
    paper_type: '研究论文',
    upload_students: 5,
    upload_time: '2023-07-18',
    paper_attachment: '/uploads/papers/paper5.pdf',
    thesis_evaluation: '良好',
    teachers_opinion: '研究内容具有实际意义，方法可行',
    paper_comments: '论文逻辑清晰，表述准确',
    recommend: 0,
    create_time: '2023-07-14 15:28:12',
    update_time: '2023-07-14 15:28:12'
  },
  {
    paper_information_id: 6,
    thesis_title: '物联网系统中的边缘计算优化方案',
    instructor: 1,
    paper_type: '技术报告',
    upload_students: 6,
    upload_time: '2023-07-19',
    paper_attachment: '/uploads/papers/paper6.pdf',
    thesis_evaluation: '中等',
    teachers_opinion: '方案设计基本合理，但创新性不足',
    paper_comments: '报告内容基本完整，但分析深度不够',
    recommend: 0,
    create_time: '2023-07-14 15:28:12',
    update_time: '2023-07-14 15:28:12'
  },
  {
    paper_information_id: 7,
    thesis_title: '人工智能在医疗诊断中的应用探索',
    instructor: 2,
    paper_type: '学术论文',
    upload_students: 3,
    upload_time: '2023-07-20',
    paper_attachment: '/uploads/papers/paper7.pdf',
    thesis_evaluation: '优秀',
    teachers_opinion: '研究内容前沿，方法创新，成果突出',
    paper_comments: '论文质量高，具有很高的学术价值',
    recommend: 1,
    create_time: '2023-07-14 15:28:12',
    update_time: '2023-07-14 15:28:12'
  },
  {
    paper_information_id: 8,
    thesis_title: 'Web应用性能优化关键技术研究',
    instructor: 3,
    paper_type: '研究论文',
    upload_students: 3,
    upload_time: '2023-07-21',
    paper_attachment: '/uploads/papers/paper8.pdf',
    thesis_evaluation: '良好',
    teachers_opinion: '研究内容实用，方法可行',
    paper_comments: '论文结构合理，实验数据充分',
    recommend: 0,
    create_time: '2023-07-14 15:28:12',
    update_time: '2023-07-14 15:28:12'
  }
]

// 保存初始数据到localStorage
if (!getStoredPapers() && isBrowser) {
  savePapersToStorage(mockPapers)
}

export default [
  // 获取答辩材料列表
  {
    url: '/api/paper/list',
    method: 'get',
    response: ({ query }: { query: { page?: string; size?: string; thesis_title?: string; upload_students?: string } }) => {
      const page = parseInt(query.page || '1')
      const size = parseInt(query.size || '10')
      const thesis_title = query.thesis_title || ''
      const upload_students = query.upload_students ? parseInt(query.upload_students) : null
      
      let filtered = mockPapers.filter((item: any) => {
        if (thesis_title && !item.thesis_title.includes(thesis_title)) return false
        // 如果指定了upload_students参数，则只返回该学生上传的资料
        if (upload_students !== null && item.upload_students !== upload_students) return false
        return true
      })
      
      // 添加file_id和defense_material_name字段
      const dataWithFileInfo = filtered.map((item: any) => ({
        ...item,
        file_id: item.paper_information_id, // 使用paper_information_id作为file_id
        defense_material_name: item.thesis_title // 不要自动添加扩展名，保持原始文件名
      }))
      
      const start = (page - 1) * size
      const end = start + size
      const data = dataWithFileInfo.slice(start, end)
      
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
  
  // 获取答辩材料详情
  {
    url: '/api/paper/:id',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const id = parseInt(url.split('/').pop() || '0')
      const paper = mockPapers.find((p: any) => p.paper_information_id === id)
      
      if (!paper) {
        return {
          error: {
            code: 404,
            message: '答辩材料信息不存在'
          }
        }
      }
      
      // 添加file_id和defense_material_name字段
      const paperWithFileInfo = {
        ...paper,
        file_id: paper.paper_information_id,
        defense_material_name: paper.thesis_title // 不要自动添加扩展名，保持原始文件名
      }
      
      return {
        result: paperWithFileInfo
      }
    }
  },
  
  // 新增答辩材料
  {
    url: '/api/paper',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const newId = Math.max(...mockPapers.map((p: any) => p.paper_information_id)) + 1
      const newPaper = {
        paper_information_id: newId,
        ...body,
        recommend: 0,
        create_time: new Date().toISOString().replace('T', ' ').slice(0, 19),
        update_time: new Date().toISOString().replace('T', ' ').slice(0, 19)
      }
      mockPapers.push(newPaper)
      savePapersToStorage(mockPapers) // 保存到localStorage
      
      // 添加file_id和defense_material_name字段
      const newPaperWithFileInfo = {
        ...newPaper,
        file_id: newPaper.paper_information_id,
        defense_material_name: newPaper.thesis_title + '.pdf'
      }
      
      return {
        result: {
          message: '新增成功',
          data: newPaperWithFileInfo
        }
      }
    }
  },
  
  // 更新答辩材料
  {
    url: '/api/paper/:id',
    method: 'put',
    response: ({ url, body }: { url: string; body: any }) => {
      const id = parseInt(url.split('/').pop() || '0')
      const index = mockPapers.findIndex((p: any) => p.paper_information_id === id)
      
      if (index === -1) {
        return {
          error: {
            code: 404,
            message: '答辩材料信息不存在'
          }
        }
      }
      
      mockPapers[index] = {
        ...mockPapers[index],
        ...body,
        update_time: new Date().toISOString().replace('T', ' ').slice(0, 19)
      }
      savePapersToStorage(mockPapers) // 保存到localStorage
      
      // 添加file_id和defense_material_name字段
      const updatedPaperWithFileInfo = {
        ...mockPapers[index],
        file_id: mockPapers[index].paper_information_id,
        defense_material_name: mockPapers[index].thesis_title + '.pdf'
      }
      
      return {
        result: {
          message: '更新成功',
          data: updatedPaperWithFileInfo
        }
      }
    }
  },
  
  // 删除答辩材料
  {
    url: '/api/paper/:id',
    method: 'delete',
    response: ({ url }: { url: string }) => {
      const id = parseInt(url.split('/').pop() || '0')
      const index = mockPapers.findIndex((p: any) => p.paper_information_id === id)
      
      if (index === -1) {
        return {
          error: {
            code: 404,
            message: '答辩材料信息不存在'
          }
        }
      }
      
      mockPapers.splice(index, 1)
      savePapersToStorage(mockPapers) // 保存到localStorage
      
      return {
        result: {
          message: '删除成功'
        }
      }
    }
  },
  // 重置答辩材料数据到初始状态
  {
    url: '/api/paper/reset',
    method: 'post',
    response: () => {
      // 恢复为初始数据
      mockPapers = [
        {
          paper_information_id: 1,
          thesis_title: '基于深度学习的图像识别技术研究',
          instructor: 1,
          paper_type: '学术论文',
          upload_students: 1,
          upload_time: '2023-07-14',
          paper_attachment: '/uploads/papers/paper1.pdf',
          thesis_evaluation: '优秀',
          teachers_opinion: '研究内容充实，方法创新，成果显著',
          paper_comments: '论文结构完整，逻辑清晰，论述充分',
          recommend: 1,
          create_time: '2023-07-14 15:28:12',
          update_time: '2023-07-14 15:28:12'
        },
        {
          paper_information_id: 2,
          thesis_title: '大数据平台下的用户行为分析系统设计',
          instructor: 2,
          paper_type: '技术报告',
          upload_students: 2,
          upload_time: '2023-07-15',
          paper_attachment: '/uploads/papers/paper2.pdf',
          thesis_evaluation: '良好',
          teachers_opinion: '系统设计合理，实现方法可行',
          paper_comments: '报告内容全面，技术路线清晰',
          recommend: 0,
          create_time: '2023-07-14 15:28:12',
          update_time: '2023-07-14 15:28:12'
        },
        {
          paper_information_id: 3,
          thesis_title: '移动应用中的用户体验优化策略',
          instructor: 1,
          paper_type: '研究论文',
          upload_students: 3,
          upload_time: '2023-07-16',
          paper_attachment: '/uploads/papers/paper3.pdf',
          thesis_evaluation: '良好',
          teachers_opinion: '研究方法科学，结论可靠',
          paper_comments: '论文选题新颖，具有一定实用价值',
          recommend: 0,
          create_time: '2023-07-14 15:28:12',
          update_time: '2023-07-14 15:28:12'
        },
        {
          paper_information_id: 4,
          thesis_title: '区块链技术在供应链管理中的应用',
          instructor: 2,
          paper_type: '学术论文',
          upload_students: 4,
          upload_time: '2023-07-17',
          paper_attachment: '/uploads/papers/paper4.pdf',
          thesis_evaluation: '优秀',
          teachers_opinion: '研究视角独特，技术方案创新',
          paper_comments: '论文结构严谨，论证充分',
          recommend: 1,
          create_time: '2023-07-14 15:28:12',
          update_time: '2023-07-14 15:28:12'
        },
        {
          paper_information_id: 5,
          thesis_title: '云计算环境下的数据安全保护机制',
          instructor: 3,
          paper_type: '研究论文',
          upload_students: 5,
          upload_time: '2023-07-18',
          paper_attachment: '/uploads/papers/paper5.pdf',
          thesis_evaluation: '良好',
          teachers_opinion: '研究内容具有实际意义，方法可行',
          paper_comments: '论文逻辑清晰，表述准确',
          recommend: 0,
          create_time: '2023-07-14 15:28:12',
          update_time: '2023-07-14 15:28:12'
        },
        {
          paper_information_id: 6,
          thesis_title: '物联网系统中的边缘计算优化方案',
          instructor: 1,
          paper_type: '技术报告',
          upload_students: 6,
          upload_time: '2023-07-19',
          paper_attachment: '/uploads/papers/paper6.pdf',
          thesis_evaluation: '中等',
          teachers_opinion: '方案设计基本合理，但创新性不足',
          paper_comments: '报告内容基本完整，但分析深度不够',
          recommend: 0,
          create_time: '2023-07-14 15:28:12',
          update_time: '2023-07-14 15:28:12'
        },
        {
          paper_information_id: 7,
          thesis_title: '人工智能在医疗诊断中的应用探索',
          instructor: 2,
          paper_type: '学术论文',
          upload_students: 7,
          upload_time: '2023-07-20',
          paper_attachment: '/uploads/papers/paper7.pdf',
          thesis_evaluation: '优秀',
          teachers_opinion: '研究内容前沿，方法创新，成果突出',
          paper_comments: '论文质量高，具有很高的学术价值',
          recommend: 1,
          create_time: '2023-07-14 15:28:12',
          update_time: '2023-07-14 15:28:12'
        },
        {
          paper_information_id: 8,
          thesis_title: 'Web应用性能优化关键技术研究',
          instructor: 3,
          paper_type: '研究论文',
          upload_students: 8,
          upload_time: '2023-07-21',
          paper_attachment: '/uploads/papers/paper8.pdf',
          thesis_evaluation: '良好',
          teachers_opinion: '研究内容实用，方法可行',
          paper_comments: '论文结构合理，实验数据充分',
          recommend: 0,
          create_time: '2023-07-14 15:28:12',
          update_time: '2023-07-14 15:28:12'
        }
      ]

      // 同步到 localStorage
      savePapersToStorage(mockPapers)

      return {
        result: {
          message: '数据已重置为初始状态'
        }
      }
    }
  }
] as MockMethod[]