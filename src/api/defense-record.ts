import request from '@/utils/request'
import { AxiosPromise } from 'axios'

// 答辩记录查询参数
interface DefenseRecordListParams {
  page?: number
  size?: number
  group_id?: number
  student_name?: string
  student_no?: string
}

// 答辩记录信息
interface DefenseRecordInfo {
  record_id: number
  gs_id: number
  record_content: string
  record_files: string
  create_time: string
  update_time: string
}

/**
 * 获取答辩记录列表
 */
export function getDefenseRecordList(params: DefenseRecordListParams): AxiosPromise<any> {
  return request({
    url: '/defense/record/list',
    method: 'get',
    params
  })
}

/**
 * 获取答辩记录详情
 */
export function getDefenseRecordDetail(id: number): AxiosPromise<any> {
  return request({
    url: `/defense/record/${id}`,
    method: 'get'
  })
}

/**
 * 获取学生答辩记录
 */
export function getStudentDefenseRecord(gsId: number): AxiosPromise<any> {
  return request({
    url: `/defense/record/student/${gsId}`,
    method: 'get'
  })
}

/**
 * 新增答辩记录
 */
export function addDefenseRecord(data: Partial<DefenseRecordInfo>): AxiosPromise<any> {
  return request({
    url: '/defense/record',
    method: 'post',
    data
  })
}

/**
 * 更新答辩记录
 */
export function updateDefenseRecord(id: number, data: Partial<DefenseRecordInfo>): AxiosPromise<any> {
  return request({
    url: `/defense/record/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除答辩记录
 */
export function deleteDefenseRecord(id: number): AxiosPromise<any> {
  return request({
    url: `/defense/record/${id}`,
    method: 'delete'
  })
}

/**
 * 上传答辩记录文件
 */
export function uploadDefenseRecordFile(recordId: number, file: File): AxiosPromise<any> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('record_id', recordId.toString())
  
  return request({
    url: '/defense/record/file/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 下载答辩记录文件
 */
export function downloadDefenseRecordFile(fileId: number): AxiosPromise<Blob> {
  return request({
    url: `/defense/record/file/download/${fileId}`,
    method: 'get',
    responseType: 'blob'
  })
}

/**
 * 保存答辩记录（新增或更新）
 */
export function saveDefenseRecord(data: any): AxiosPromise<any> {
  if (data.id) {
    return updateDefenseRecord(data.id, data)
  } else {
    return addDefenseRecord(data)
  }
}
