import request from '@/utils/request'
import { AxiosPromise } from 'axios'

// 教师列表查询参数
interface TeacherListParams {
  page?: number
  size?: number
  name?: string
  teacher_no?: string
}

// 教师信息
interface TeacherInfo {
  teacher_users_id: number
  teachers_name: string
  gender_of_teachers: string
  age_of_teachers: string
  examine_state: string
  user_id: number
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

