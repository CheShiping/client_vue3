import { MockMethod } from 'vite-plugin-mock'

// 模拟存储文件信息的对象
let mockFiles: Record<string, any> = {}

// 从localStorage加载已保存的文件信息 - 仅在浏览器环境中使用
const loadFilesFromStorage = () => {
  // 检查是否在浏览器环境中
  if (typeof window !== 'undefined' && window.localStorage) {
    const stored = localStorage.getItem('mockFiles')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        Object.assign(mockFiles, parsed)
      } catch (e) {
        console.error('Failed to load mock files from storage', e)
      }
    }
  } else {
    // 如果不在浏览器环境中，从内存中加载（模拟存储）
    console.log('Running in server environment, using in-memory storage')
  }
}

// 保存文件数据到localStorage - 仅在浏览器环境中使用
const saveFilesToStorage = (files: Record<string, any>) => {
  // 检查是否在浏览器环境中
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('mockFiles', JSON.stringify(files))
  } else {
    // 如果不在浏览器环境中，仅保存到内存中
    console.log('Running in server environment, saving to memory only')
  }
}

// 初始化时加载存储的文件
loadFilesFromStorage()

export default [
  // 模拟文件上传
  {
    url: '/api/file/upload',
    method: 'post',
    response: ({ body }: { body: any }) => {
      // 在实际实现中，这将处理文件上传
      // 由于是mock，我们只是模拟上传过程
      const { fileName, fileSize, originalName } = body

      const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const filePath = `/api/file/download/${fileId}`

      // 在mock环境中存储文件信息
      mockFiles[fileId] = {
        id: fileId,
        name: originalName,
        size: fileSize,
        path: filePath,
        uploadTime: new Date().toISOString()
      }

      saveFilesToStorage(mockFiles)

      return {
        result: {
          fileId,
          filePath,
          message: '文件上传成功'
        }
      }
    }
  },

  // 模拟文件下载
  {
    url: '/api/file/download/:fileId',
    method: 'get',
    response: ({ url }: { url: string }) => {
      // 从URL中提取文件ID
      const parts = url.split('/')
      const fileId = parts[parts.length - 1] // /api/file/download/:fileId
      
      if (mockFiles[fileId]) {
        // 返回文件信息
        return {
          result: mockFiles[fileId]
        }
      } else {
        return {
          error: {
            code: 404,
            message: '文件不存在'
          }
        }
      }
    }
  }
] as MockMethod[]