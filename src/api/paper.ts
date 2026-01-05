import request from '@/utils/request'
import { AxiosPromise } from 'axios'

// 答辩列表查询参数
interface PaperListParams {
  page?: number
  size?: number
  thesis_title?: string
}

// 答辩信息
interface PaperInfo {
  paper_information_id: number
  thesis_title: string
  instructor: number
  paper_type: string
  upload_students: number
  upload_time: string
  paper_attachment: string
  thesis_evaluation: string
  teachers_opinion: string
  paper_comments: string
  create_time: string
  update_time: string
}

/**
 * 获取答辩列表
 */
export function getPaperList(params: PaperListParams): AxiosPromise<any> {
  return request({
    url: '/paper/list',
    method: 'get',
    params
  })
}

/**
 * 获取答辩详情
 */
export function getPaperDetail(id: number): AxiosPromise<any> {
  return request({
    url: `/paper/${id}`,
    method: 'get'
  })
}

/**
 * 新增答辩
 */
export function addPaper(data: Partial<PaperInfo>): AxiosPromise<any> {
  return request({
    url: '/paper',
    method: 'post',
    data
  })
}

/**
 * 更新答辩信息
 */
export function updatePaper(id: number, data: Partial<PaperInfo>): AxiosPromise<any> {
  return request({
    url: `/paper/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除答辩
 */
export function deletePaper(id: number): AxiosPromise<any> {
  return request({
    url: `/paper/${id}`,
    method: 'delete'
  })
}