import request from '@/utils/request'
import { AxiosPromise } from 'axios'

// 答辩列表查询参数
interface DefenseListParams {
  page?: number
  size?: number
  thesis_title?: string
}

// 答辩信息
interface DefenseInfo {
  defense_information_id: number
  thesis_title: string
  paper_type: string
  defense_student: number
  defense_time: string
  venue_of_defense: string
  defense_notice: string
  defense_status: string
  defense_results: string
  create_time: string
  update_time: string
  // 新增字段：答辩文件信息
  defense_file?: {
    file_id: number
    file_name: string
    file_path: string
    file_size: number
    upload_time: string
  }
}

/**
 * 获取答辩列表
 */
export function getDefenseList(params: DefenseListParams): AxiosPromise<any> {
  return request({
    url: '/defense/list',
    method: 'get',
    params
  })
}

/**
 * 获取答辩详情
 */
export function getDefenseDetail(id: number): AxiosPromise<any> {
  return request({
    url: `/defense/${id}`,
    method: 'get'
  })
}

/**
 * 新增答辩
 */
export function addDefense(data: Partial<DefenseInfo>): AxiosPromise<any> {
  return request({
    url: '/defense',
    method: 'post',
    data
  })
}

/**
 * 更新答辩信息
 */
export function updateDefense(id: number, data: Partial<DefenseInfo>): AxiosPromise<any> {
  return request({
    url: `/defense/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除答辩
 */
export function deleteDefense(id: number): AxiosPromise<any> {
  return request({
    url: `/defense/${id}`,
    method: 'delete'
  })
}

/**
 * 上传答辩文件
 * @param defenseId 答辩ID
 * @param file 文件对象
 */
export function uploadDefenseFile(defenseId: number, file: File): AxiosPromise<any> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('defense_id', defenseId.toString())
  
  return request({
    url: '/defense/file/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 下载答辩文件
 * @param fileId 文件ID
 */
export function downloadDefenseFile(fileId: number): AxiosPromise<Blob> {
  return request({
    url: `/defense/file/download/${fileId}`,
    method: 'get',
    responseType: 'blob'
  })
}

/**
 * 获取答辩文件信息
 * @param defenseId 答辩ID
 */
export function getDefenseFileInfo(defenseId: number): AxiosPromise<any> {
  return request({
    url: `/defense/file/info/${defenseId}`,
    method: 'get'
  })
}

