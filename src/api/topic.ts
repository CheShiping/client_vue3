import request from '@/utils/request'
import { AxiosPromise } from 'axios'

// 选题列表查询参数
interface TopicListParams {
  page?: number
  size?: number
  thesis_title?: string
}

// 选题信息
interface TopicInfo {
  topic_information_id: number
  thesis_title: string
  instructor: number
  question_type: string
  selected_students: number
  topic_selection_time: string
  question_status: string
  topic_status: string
  topic_notes: string
  create_time: string
  update_time: string
  // 新增字段
  selected_students_count?: number;
  max_students?: number;
  defense_time?: string;
  venue_of_defense?: string;
  defense_status?: string;
  defense_results?: string;
  defense_id?: number; // 答辩ID
}

/**
 * 获取选题列表
 */
export function getTopicList(params: TopicListParams): AxiosPromise<any> {
  return request({
    url: '/topic/list',
    method: 'get',
    params
  })
}

/**
 * 获取选题详情
 */
export function getTopicDetail(id: number): AxiosPromise<any> {
  return request({
    url: `/topic/${id}`,
    method: 'get'
  })
}

/**
 * 新增选题
 */
export function addTopic(data: Partial<TopicInfo>): AxiosPromise<any> {
  return request({
    url: '/topic',
    method: 'post',
    data
  })
}

/**
 * 更新选题信息
 */
export function updateTopic(id: number, data: Partial<TopicInfo>): AxiosPromise<any> {
  return request({
    url: `/topic/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除选题
 */
export function deleteTopic(id: number): AxiosPromise<any> {
  return request({
    url: `/topic/${id}`,
    method: 'delete'
  })
}

/**
 * 学生选择选题
 */
export function selectTopic(topicId: number): AxiosPromise<any> {
  return request({
    url: `/topic/select/${topicId}`,
    method: 'post'
  })
}

/**
 * 学生取消选题
 */
export function unselectTopic(topicId: number): AxiosPromise<any> {
  return request({
    url: `/topic/unselect/${topicId}`,
    method: 'post'
  })
}

/**
 * 获取学生已选择的选题
 */
export function getStudentSelectedTopic(studentId: number): AxiosPromise<any> {
  return request({
    url: `/topic/student/${studentId}/selected`,
    method: 'get'
  })
}