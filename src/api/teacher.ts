import request from '@/utils/request'
import { AxiosPromise } from 'axios'

// 教师列表查询参数
interface TeacherListParams {
  page?: number
  size?: number
  teacher_name?: string
  teacher_no?: string
  department_name?: string
  professional_title?: string
  state?: number
}

// 教师信息
interface TeacherInfo {
  teacher_id: number
  user_id: number
  teacher_name: string
  teacher_no: string
  teacher_gender: string
  teacher_age: string
  department_name: string
  professional_title: string
  phone: string
  email: string
  state: number
  create_time: string
  update_time: string
}

/**
 * 获取教师列表
 */
export function getTeacherList(params: TeacherListParams): AxiosPromise<any> {
  return request({
    url: '/teacher/list',
    method: 'get',
    params
  })
}

/**
 * 获取教师详情
 */
export function getTeacherDetail(id: number): AxiosPromise<any> {
  return request({
    url: `/teacher/${id}`,
    method: 'get'
  })
}

/**
 * 新增教师
 */
export function addTeacher(data: Partial<TeacherInfo>): AxiosPromise<any> {
  return request({
    url: '/teacher',
    method: 'post',
    data
  })
}

/**
 * 更新教师信息
 */
export function updateTeacher(id: number, data: Partial<TeacherInfo>): AxiosPromise<any> {
  return request({
    url: `/teacher/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除教师
 */
export function deleteTeacher(id: number): AxiosPromise<any> {
  return request({
    url: `/teacher/${id}`,
    method: 'delete'
  })
}

/**
 * 导入教师信息
 */
export function importTeachers(file: File): AxiosPromise<any> {
  const formData = new FormData()
  formData.append('file', file)
  
  return request({
    url: '/teacher/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 导出教师信息
 */
export function exportTeachers(params?: TeacherListParams): AxiosPromise<Blob> {
  return request({
    url: '/teacher/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

