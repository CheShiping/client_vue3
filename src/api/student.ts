import request from '@/utils/request'
import { AxiosPromise } from 'axios'

// 学生信息接口
interface StudentInfo {
  student_id: number
  user_id: number
  student_name: string
  student_no: string
  student_gender: string
  student_age: string
  class_name: string
  major_name: string
  grade: string
  phone: string
  email: string
  state: number
  create_time: string
  update_time: string
}

// 学生列表查询参数
interface StudentListParams {
  page?: number
  size?: number
  student_name?: string
  student_no?: string
  class_name?: string
  major_name?: string
  grade?: string
  state?: number
}

/**
 * 获取学生列表
 */
export function getStudentList(params: StudentListParams): AxiosPromise<any> {
  return request({
    url: '/student/list',
    method: 'get',
    params
  })
}

/**
 * 获取学生详情
 */
export function getStudentDetail(id: number): AxiosPromise<any> {
  return request({
    url: `/student/${id}`,
    method: 'get'
  })
}

/**
 * 根据用户ID获取学生信息
 */
export function getStudentByUserId(userId: number): AxiosPromise<any> {
  return request({
    url: '/student/user/' + userId,
    method: 'get'
  })
}

/**
 * 新增学生信息
 */
export function addStudent(data: StudentInfo): AxiosPromise<any> {
  return request({
    url: '/student',
    method: 'post',
    data
  })
}

/**
 * 更新学生信息
 */
export function updateStudent(id: number, data: Partial<StudentInfo>): AxiosPromise<any> {
  return request({
    url: `/student/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除学生信息
 */
export function deleteStudent(id: number): AxiosPromise<any> {
  return request({
    url: `/student/${id}`,
    method: 'delete'
  })
}

/**
 * 导入学生信息
 */
export function importStudents(file: File): AxiosPromise<any> {
  const formData = new FormData()
  formData.append('file', file)
  
  return request({
    url: '/student/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 导出学生信息
 */
export function exportStudents(params?: StudentListParams): AxiosPromise<Blob> {
  return request({
    url: '/student/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}