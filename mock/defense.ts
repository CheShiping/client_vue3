import { MockMethod } from 'vite-plugin-mock'

// 存储键名
const STORAGE_KEY = 'defense_management_defenses'

// 检查是否在浏览器环境中
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined'

// 从localStorage获取数据或使用默认数据
function getStoredDefenses() {
  if (!isBrowser) return null
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (e) {
    return null
  }
}

// 保存数据到localStorage
function saveDefensesToStorage(defenses: any[]) {
  if (!isBrowser) return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defenses))
  } catch (e) {
    console.error('保存答辩数据到localStorage失败:', e)
  }
}

// 答辩地点列表
const defenseVenues = ['软件大楼1204', '软件大楼1203', '软件大楼1208', '软件大楼708', '软件大楼701', '软件大楼705']

// Mock 答辩数据（基于 SQL 数据）
let mockDefenses = getStoredDefenses() || [
  {
    defense_information_id: 1,
    thesis_title: '基于深度学习的图像识别技术研究',
    paper_type: '学术论文',
    defense_student: 1,
    defense_time: '2023-07-14',
    venue_of_defense: defenseVenues[0],
    defense_notice: '请提前30分钟到场签到，携带身份证和学生证',
    defense_status: '已安排',
    defense_results: '待答辩',
    recommend: 0,
    create_time: '2023-07-14 15:28:12',
    update_time: '2023-07-14 15:28:12'
  },
  {
    defense_information_id: 2,
    thesis_title: '大数据平台下的用户行为分析系统设计',
    paper_type: '技术报告',
    defense_student: 2,
    defense_time: '2023-07-15',
    venue_of_defense: defenseVenues[1],
    defense_notice: '准备PPT演示，限时15分钟',
    defense_status: '已安排',
    defense_results: '待答辩',
    recommend: 0,
    create_time: '2023-07-14 15:28:12',
    update_time: '2023-07-14 15:28:12'
  },
  {
    defense_information_id: 3,
    thesis_title: '移动应用中的用户体验优化策略',
    paper_type: '研究论文',
    defense_student: 3,
    defense_time: '2023-07-16',
    venue_of_defense: defenseVenues[2],
    defense_notice: '准备答辩材料，专家将进行提问',
    defense_status: '已安排',
    defense_results: '待答辩',
    recommend: 0,
    create_time: '2023-07-14 15:28:12',
    update_time: '2023-07-14 15:28:12'
  },
  {
    defense_information_id: 4,
    thesis_title: '区块链技术在供应链管理中的应用',
    paper_type: '学术论文',
    defense_student: 4,
    defense_time: '2023-07-17',
    venue_of_defense: defenseVenues[3],
    defense_notice: '请携带论文纸质版5份',
    defense_status: '已安排',
    defense_results: '待答辩',
    recommend: 0,
    create_time: '2023-07-14 15:28:12',
    update_time: '2023-07-14 15:28:12'
  },
  {
    defense_information_id: 5,
    thesis_title: '云计算环境下的数据安全保护机制',
    paper_type: '研究论文',
    defense_student: 5,
    defense_time: '2023-07-18',
    venue_of_defense: defenseVenues[4],
    defense_notice: '准备相关证明材料和实验数据',
    defense_status: '已安排',
    defense_results: '待答辩',
    recommend: 0,
    create_time: '2023-07-14 15:28:12',
    update_time: '2023-07-14 15:28:12'
  },
  {
    defense_information_id: 6,
    thesis_title: '物联网系统中的边缘计算优化方案',
    paper_type: '技术报告',
    defense_student: 6,
    defense_time: '2023-07-19',
    venue_of_defense: defenseVenues[5],
    defense_notice: '准备原型系统演示',
    defense_status: '已安排',
    defense_results: '待答辩',
    recommend: 0,
    create_time: '2023-07-14 15:28:12',
    update_time: '2023-07-14 15:28:12'
  },
  {
    defense_information_id: 7,
    thesis_title: '人工智能在医疗诊断中的应用探索',
    paper_type: '学术论文',
    defense_student: 7,
    defense_time: '2023-07-20',
    venue_of_defense: defenseVenues[0],
    defense_notice: '准备详细的技术文档',
    defense_status: '已安排',
    defense_results: '待答辩',
    recommend: 0,
    create_time: '2023-07-14 15:28:12',
    update_time: '2023-07-14 15:28:12'
  },
  {
    defense_information_id: 8,
    thesis_title: 'Web应用性能优化关键技术研究',
    paper_type: '研究论文',
    defense_student: 8,
    defense_time: '2023-07-21',
    venue_of_defense: defenseVenues[1],
    defense_notice: '准备性能测试报告',
    defense_status: '已安排',
    defense_results: '待答辩',
    recommend: 0,
    create_time: '2023-07-14 15:28:12',
    update_time: '2023-07-14 15:28:12'
  },
  {
    defense_information_id: 9,
    thesis_title: '基于机器学习的金融风险预测模型',
    paper_type: '学术论文',
    defense_student: 9,
    defense_time: '2023-07-22',
    venue_of_defense: defenseVenues[2],
    defense_notice: '准备数据集和算法说明',
    defense_status: '已安排',
    defense_results: '待答辩',
    recommend: 0,
    create_time: '2023-07-15 11:30:00',
    update_time: '2023-07-15 11:30:00'
  },
  {
    defense_information_id: 10,
    thesis_title: '虚拟现实技术在教育领域的创新应用',
    paper_type: '技术报告',
    defense_student: 10,
    defense_time: '2023-07-23',
    venue_of_defense: defenseVenues[3],
    defense_notice: '准备演示视频和交互原型',
    defense_status: '已安排',
    defense_results: '待答辩',
    recommend: 0,
    create_time: '2023-07-15 11:30:00',
    update_time: '2023-07-15 11:30:00'
  }
]

// 保存初始数据到localStorage
if (!getStoredDefenses() && isBrowser) {
  saveDefensesToStorage(mockDefenses)
}

// 答辩文件存储
let mockDefenseFiles: any[] = [
  // 添加初始模拟文件数据
  {
    file_id: 1,
    file_name: '基于深度学习的图像识别技术研究.pdf',
    file_path: '/uploads/defense/基于深度学习的图像识别技术研究.pdf',
    file_size: 1024 * 1024, // 1MB
    upload_time: '2023-07-14 15:28:12',
    defense_id: 1
  },
  {
    file_id: 2,
    file_name: '大数据平台下的用户行为分析系统设计.pdf',
    file_path: '/uploads/defense/大数据平台下的用户行为分析系统设计.pdf',
    file_size: 1536 * 1024, // 1.5MB
    upload_time: '2023-07-15 11:30:00',
    defense_id: 2
  },
  {
    file_id: 3,
    file_name: '移动应用中的用户体验优化策略.pdf',
    file_path: '/uploads/defense/移动应用中的用户体验优化策略.pdf',
    file_size: 2048 * 1024, // 2MB
    upload_time: '2023-07-16 09:15:00',
    defense_id: 3
  },
  {
    file_id: 4,
    file_name: '区块链技术在供应链管理中的应用.pdf',
    file_path: '/uploads/defense/区块链技术在供应链管理中的应用.pdf',
    file_size: 2560 * 1024, // 2.5MB
    upload_time: '2023-07-17 14:20:00',
    defense_id: 4
  },
  {
    file_id: 5,
    file_name: '云计算环境下的数据安全保护机制.pdf',
    file_path: '/uploads/defense/云计算环境下的数据安全保护机制.pdf',
    file_size: 3072 * 1024, // 3MB
    upload_time: '2023-07-18 10:10:00',
    defense_id: 5
  },
  {
    file_id: 6,
    file_name: '物联网系统中的边缘计算优化方案.pdf',
    file_path: '/uploads/defense/物联网系统中的边缘计算优化方案.pdf',
    file_size: 1892 * 1024, // ~1.8MB
    upload_time: '2023-07-19 16:45:00',
    defense_id: 6
  },
  {
    file_id: 7,
    file_name: '人工智能在医疗诊断中的应用探索.pdf',
    file_path: '/uploads/defense/人工智能在医疗诊断中的应用探索.pdf',
    file_size: 3584 * 1024, // 3.5MB
    upload_time: '2023-07-20 09:30:00',
    defense_id: 7
  },
  {
    file_id: 8,
    file_name: 'Web应用性能优化关键技术研究.pdf',
    file_path: '/uploads/defense/Web应用性能优化关键技术研究.pdf',
    file_size: 2256 * 1024, // ~2.2MB
    upload_time: '2023-07-21 13:15:00',
    defense_id: 8
  }
]
let nextFileId = mockDefenseFiles.length > 0 ? Math.max(...mockDefenseFiles.map(f => f.file_id)) + 1 : 1

// 从localStorage加载文件数据
if (isBrowser) {
  const storedFiles = localStorage.getItem('defense_management_files')
  if (storedFiles) {
    try {
      mockDefenseFiles = JSON.parse(storedFiles)
      if (mockDefenseFiles.length > 0) {
        nextFileId = Math.max(...mockDefenseFiles.map(f => f.file_id)) + 1
      }
    } catch (e) {
      mockDefenseFiles = []
    }
  }
}

// 保存文件数据到localStorage
function saveFilesToStorage() {
  if (!isBrowser) return
  try {
    localStorage.setItem('defense_management_files', JSON.stringify(mockDefenseFiles))
  } catch (e) {
    console.error('保存答辩文件数据失败:', e)
  }
}

export default [
  // 获取答辩列表
  {
    url: '/api/defense/list',
    method: 'get',
    response: ({ query }: { query: { page?: string; size?: string; thesis_title?: string } }) => {
      const page = parseInt(query.page || '1')
      const size = parseInt(query.size || '10')
      const thesis_title = query.thesis_title || ''
      
      let filtered = mockDefenses.filter(item => {
        if (thesis_title && !item.thesis_title.includes(thesis_title)) return false
        return true
      })
      
      // 添加答辩文件信息
      const defensesWithFiles = filtered.map(defense => {
        const file = mockDefenseFiles.find(f => f.defense_id === defense.defense_information_id)
        return {
          ...defense,
          defense_file: file || undefined
        }
      })
      
      const start = (page - 1) * size
      const end = start + size
      const data = defensesWithFiles.slice(start, end)
      
      return {
        result: {
          list: data,
          total: defensesWithFiles.length,
          page,
          size
        }
      }
    }
  },
  
  // 获取答辩详情
  {
    url: '/api/defense/:id',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const id = parseInt(url.split('/').pop() || '0')
      const defense = mockDefenses.find(d => d.defense_information_id === id)
      
      if (!defense) {
        return {
          error: {
            code: 404,
            message: '答辩信息不存在'
          }
        }
      }
      
      // 添加答辩文件信息
      const file = mockDefenseFiles.find(f => f.defense_id === defense.defense_information_id)
      const defenseWithFile = {
        ...defense,
        defense_file: file || undefined
      }
      
      return {
        result: defenseWithFile
      }
    }
  },
  
  // 新增答辩
  {
    url: '/api/defense',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const newId = Math.max(...mockDefenses.map(d => d.defense_information_id)) + 1
      const newDefense = {
        defense_information_id: newId,
        ...body,
        recommend: 0,
        create_time: new Date().toISOString().replace('T', ' ').slice(0, 19),
        update_time: new Date().toISOString().replace('T', ' ').slice(0, 19)
      }
      mockDefenses.push(newDefense)
      saveDefensesToStorage(mockDefenses) // 保存到localStorage
      
      return {
        result: {
          message: '新增成功',
          data: newDefense
        }
      }
    }
  },
  
  // 更新答辩
  {
    url: '/api/defense/:id',
    method: 'put',
    response: ({ url, body }: { url: string; body: any }) => {
      const id = parseInt(url.split('/').pop() || '0')
      const index = mockDefenses.findIndex(d => d.defense_information_id === id)
      
      if (index === -1) {
        return {
          error: {
            code: 404,
            message: '答辩信息不存在'
          }
        }
      }
      
      mockDefenses[index] = {
        ...mockDefenses[index],
        ...body,
        update_time: new Date().toISOString().replace('T', ' ').slice(0, 19)
      }
      saveDefensesToStorage(mockDefenses) // 保存到localStorage
      
      return {
        result: {
          message: '更新成功',
          data: mockDefenses[index]
        }
      }
    }
  },
  
  // 删除答辩
  {
    url: '/api/defense/:id',
    method: 'delete',
    response: ({ url }: { url: string }) => {
      const id = parseInt(url.split('/').pop() || '0')
      const index = mockDefenses.findIndex(d => d.defense_information_id === id)
      
      if (index === -1) {
        return {
          error: {
            code: 404,
            message: '答辩信息不存在'
          }
        }
      }
      
      mockDefenses.splice(index, 1)
      saveDefensesToStorage(mockDefenses) // 保存到localStorage
      
      // 删除关联的答辩文件
      mockDefenseFiles = mockDefenseFiles.filter(f => f.defense_id !== id)
      saveFilesToStorage()
      
      return {
        result: {
          message: '删除成功'
        }
      }
    }
  },
  
  // 上传答辩文件
  {
    url: '/api/defense/file/upload',
    method: 'post',
    response: ({ body }: { body: any }) => {
      // 在实际应用中，body 应该包含 file 和 defense_id
      // 这里我们模拟文件上传成功
      const defenseId = body.defense_id || 1
      const fileName = body.file?.name || `答辩文件_${defenseId}_${Date.now()}.pdf`
      
      // 检查是否已存在相同 defense_id 的文件
      const existingIndex = mockDefenseFiles.findIndex(f => f.defense_id === defenseId)
      const fileData = {
        file_id: existingIndex >= 0 ? mockDefenseFiles[existingIndex].file_id : nextFileId++,
        file_name: fileName,
        file_path: `/uploads/defense/${fileName}`,
        file_size: body.file?.size || 1024 * 1024, // 模拟1MB大小
        upload_time: new Date().toISOString().replace('T', ' ').slice(0, 19),
        defense_id: defenseId
      }
      
      if (existingIndex >= 0) {
        // 更新已有文件
        mockDefenseFiles[existingIndex] = fileData
      } else {
        // 新增文件
        mockDefenseFiles.push(fileData)
      }
      
      saveFilesToStorage()
      
      return {
        result: fileData
      }
    }
  },
  
  // 下载答辩文件
  {
    url: '/api/defense/file/download/:id',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const fileId = parseInt(url.split('/').pop() || '0')
      const file = mockDefenseFiles.find(f => f.file_id === fileId)
      
      if (!file) {
        return {
          error: {
            code: 404,
            message: '文件不存在'
          }
        }
      }
      
      // 模拟文件内容（实际应用中应该返回真实文件内容）
      const mockFileContent = `这是 ${file.file_name} 的模拟文件内容\n答辩文件ID: ${file.file_id}\n上传时间: ${file.upload_time}`
      
      // 返回字符串内容，前端会处理为Blob
      return mockFileContent
    }
  },
  
  // 获取答辩文件信息
  {
    url: '/api/defense/file/info/:defense_id',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const defenseId = parseInt(url.split('/').pop() || '0')
      const file = mockDefenseFiles.find(f => f.defense_id === defenseId)
      
      return {
        result: file || null
      }
    }
  }
] as MockMethod[]