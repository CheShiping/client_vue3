import request from '@/utils/request'
import { AxiosPromise } from 'axios'

// 答辩材料列表查询参数
interface PaperListParams {
  page?: number
  size?: number
  thesis_title?: string
  upload_students?: number  // 学生ID参数
}

// 答辩材料信息
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
  // 添加用于显示的信息
  upload_user_id?: number
  upload_user?: string
  defense_material_name?: string
  material_type?: string
  file_size?: string
  file_path?: string
  material_description?: string
  defense_id?: number
  student_id?: number
  // 文件ID，用于下载
  file_id?: number
}

/**
 * 获取答辩材料列表
 */
export function getPaperList(params: PaperListParams): AxiosPromise<any> {
  return request({
    url: '/paper/list',
    method: 'get',
    params
  })
}

/**
 * 获取答辩材料详情
 */
export function getPaperDetail(id: number): AxiosPromise<any> {
  return request({
    url: `/paper/${id}`,
    method: 'get'
  })
}

/**
 * 新增答辩材料
 */
export function addPaper(data: Partial<PaperInfo>): AxiosPromise<any> {
  return request({
    url: '/paper',
    method: 'post',
    data
  })
}

/**
 * 更新答辩材料信息
 */
export function updatePaper(id: number, data: Partial<PaperInfo>): AxiosPromise<any> {
  return request({
    url: `/paper/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除答辩材料
 */
export function deletePaper(id: number): AxiosPromise<any> {
  return request({
    url: `/paper/${id}`,
    method: 'delete'
  })
}