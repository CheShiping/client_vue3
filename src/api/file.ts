import request from '@/utils/request'
import { AxiosPromise } from 'axios'

/**
 * 上传文件
 */
export function uploadFile(data: FormData): AxiosPromise<any> {
  return request({
    url: '/file/upload',  // 移除了/api前缀，因为request工具中已经设置了baseURL
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 获取文件下载链接
 */
export function getFileDownloadUrl(fileId: string) {
  // 返回下载链接，前端可以直接访问该链接下载文件
  return `/api/file/download/${fileId}`
}