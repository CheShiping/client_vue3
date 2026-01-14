import request from '@/utils/request'
import { AxiosPromise } from 'axios'

// 答辩小组查询参数
interface DefenseGroupListParams {
  page?: number
  size?: number
  group_name?: string
  plan_id?: number
  defense_time?: string
  status?: number
}

// 答辩小组信息
interface DefenseGroupInfo {
  group_id: number
  plan_id: number
  group_name: string
  group_leader: number
  venue_id: number
  defense_time: string
  status: number
  create_time: string
  update_time: string
}

// 答辩小组成员信息
interface DefenseGroupMember {
  gt_id?: number
  group_id: number
  teacher_id: number
  role: string
  create_time?: string
  update_time?: string
}

// 小组学生信息
interface GroupStudent {
  gs_id?: number
  group_id: number
  student_id: number
  thesis_title: string
  order_num: number
  status: number
  create_time?: string
  update_time?: string
}

/**
 * 获取答辩小组列表
 */
export function getDefenseGroupList(params: DefenseGroupListParams): AxiosPromise<any> {
  return request({
    url: '/defense/group/list',
    method: 'get',
    params
  })
}

/**
 * 获取答辩小组详情
 */
export function getDefenseGroupDetail(id: number): AxiosPromise<any> {
  return request({
    url: `/defense/group/${id}`,
    method: 'get'
  })
}

/**
 * 新增答辩小组
 */
export function addDefenseGroup(data: Partial<DefenseGroupInfo>): AxiosPromise<any> {
  return request({
    url: '/defense/group',
    method: 'post',
    data
  })
}

/**
 * 更新答辩小组
 */
export function updateDefenseGroup(id: number, data: Partial<DefenseGroupInfo>): AxiosPromise<any> {
  return request({
    url: `/defense/group/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除答辩小组
 */
export function deleteDefenseGroup(id: number): AxiosPromise<any> {
  return request({
    url: `/defense/group/${id}`,
    method: 'delete'
  })
}

/**
 * 获取答辩小组成员列表
 */
export function getDefenseGroupMembers(groupId: number): AxiosPromise<any> {
  return request({
    url: `/defense/group/members/${groupId}`,
    method: 'get'
  })
}

/**
 * 添加答辩小组成员
 */
export function addDefenseGroupMember(data: DefenseGroupMember): AxiosPromise<any> {
  return request({
    url: '/defense/group/member',
    method: 'post',
    data
  })
}

/**
 * 批量添加答辩小组成员
 */
export function batchAddDefenseGroupMembers(data: { group_id: number; members: Array<{ teacher_id: number; role: string }> }): AxiosPromise<any> {
  return request({
    url: '/defense/group/members/batch',
    method: 'post',
    data
  })
}

/**
 * 删除答辩小组成员
 */
export function deleteDefenseGroupMember(id: number): AxiosPromise<any> {
  return request({
    url: `/defense/group/member/${id}`,
    method: 'delete'
  })
}

/**
 * 获取小组学生列表
 */
export function getGroupStudents(groupId: number): AxiosPromise<any> {
  return request({
    url: `/defense/group/students/${groupId}`,
    method: 'get'
  })
}

/**
 * 添加小组学生
 */
export function addGroupStudent(data: GroupStudent): AxiosPromise<any> {
  return request({
    url: '/defense/group/student',
    method: 'post',
    data
  })
}

/**
 * 批量添加小组学生
 */
export function batchAddGroupStudents(data: { group_id: number; students: Array<{ student_id: number; thesis_title: string; order_num: number }> }): AxiosPromise<any> {
  return request({
    url: '/defense/group/students/batch',
    method: 'post',
    data
  })
}

/**
 * 删除小组学生
 */
export function deleteGroupStudent(id: number): AxiosPromise<any> {
  return request({
    url: `/defense/group/student/${id}`,
    method: 'delete'
  })
}

/**
 * 更新小组学生答辩顺序
 */
export function updateGroupStudentOrder(data: { gs_id: number; order_num: number }): AxiosPromise<any> {
  return request({
    url: '/defense/group/student/order',
    method: 'put',
    data
  })
}
