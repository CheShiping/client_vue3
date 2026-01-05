import request from '@/utils/request'
import { AxiosPromise } from 'axios'

// 成绩列表查询参数
interface ScoreListParams {
  page?: number
  size?: number
  thesis_title?: string
}

// 成绩信息
interface ScoreInfo {
  score_information_id: number
  thesis_title: string
  question_type: string
  defense_student: number
  release_time: string
  award_and_excellence_evaluation: string
  score_details: string
  create_time: string
  update_time: string
}

/**
 * 获取成绩列表
 */
export function getScoreList(params: ScoreListParams): AxiosPromise<any> {
  return request({
    url: '/score/list',
    method: 'get',
    params
  })
}

/**
 * 获取成绩详情
 */
export function getScoreDetail(id: number): AxiosPromise<any> {
  return request({
    url: `/score/${id}`,
    method: 'get'
  })
}

/**
 * 新增成绩
 */
export function addScore(data: Partial<ScoreInfo>): AxiosPromise<any> {
  return request({
    url: '/score',
    method: 'post',
    data
  })
}

/**
 * 更新成绩信息
 */
export function updateScore(id: number, data: Partial<ScoreInfo>): AxiosPromise<any> {
  return request({
    url: `/score/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除成绩
 */
export function deleteScore(id: number): AxiosPromise<any> {
  return request({
    url: `/score/${id}`,
    method: 'delete'
  })
}

