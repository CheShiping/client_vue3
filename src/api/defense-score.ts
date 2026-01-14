import request from '@/utils/request'
import { AxiosPromise } from 'axios'

// 评分标准查询参数
interface ScoreCriteriaListParams {
  page?: number
  size?: number
  plan_id?: number
  criteria_name?: string
}

// 评分标准信息
interface ScoreCriteriaInfo {
  criteria_id: number
  plan_id: number
  criteria_name: string
  criteria_desc: string
  weight: number
  full_score: number
  create_time: string
  update_time: string
}

// 答辩评分查询参数
interface DefenseScoreListParams {
  page?: number
  size?: number
  group_id?: number
  student_name?: string
  student_no?: string
}

// 答辩评分信息
interface DefenseScoreInfo {
  score_id: number
  gs_id: number
  teacher_id: number
  criteria_id: number
  score: number
  comment: string
  create_time: string
  update_time: string
}


/**
 * 获取评分标准列表
 */
export function getScoreCriteriaList(params: ScoreCriteriaListParams): AxiosPromise<any> {
  return request({
    url: '/defense/score/criteria/list',
    method: 'get',
    params
  })
}

/**
 * 获取评分标准详情
 */
export function getScoreCriteriaDetail(id: number): AxiosPromise<any> {
  return request({
    url: `/defense/score/criteria/${id}`,
    method: 'get'
  })
}

/**
 * 新增评分标准
 */
export function addScoreCriteria(data: Partial<ScoreCriteriaInfo>): AxiosPromise<any> {
  return request({
    url: '/defense/score/criteria',
    method: 'post',
    data
  })
}

/**
 * 更新评分标准
 */
export function updateScoreCriteria(id: number, data: Partial<ScoreCriteriaInfo>): AxiosPromise<any> {
  return request({
    url: `/defense/score/criteria/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除评分标准
 */
export function deleteScoreCriteria(id: number): AxiosPromise<any> {
  return request({
    url: `/defense/score/criteria/${id}`,
    method: 'delete'
  })
}

/**
 * 获取答辩评分列表
 */
export function getDefenseScoreList(params: DefenseScoreListParams): AxiosPromise<any> {
  return request({
    url: '/defense/score/list',
    method: 'get',
    params
  })
}

/**
 * 获取答辩评分详情
 */
export function getDefenseScoreDetail(id: number): AxiosPromise<any> {
  return request({
    url: `/defense/score/${id}`,
    method: 'get'
  })
}

/**
 * 获取学生答辩成绩
 */
export function getStudentDefenseScores(gsId: number): AxiosPromise<any> {
  return request({
    url: `/defense/score/student/${gsId}`,
    method: 'get'
  })
}

/**
 * 新增答辩评分
 */
export function addDefenseScore(data: Partial<DefenseScoreInfo>): AxiosPromise<any> {
  return request({
    url: '/defense/score',
    method: 'post',
    data
  })
}

/**
 * 批量新增答辩评分
 */
export function batchAddDefenseScores(data: Array<Partial<DefenseScoreInfo>>): AxiosPromise<any> {
  return request({
    url: '/defense/score/batch',
    method: 'post',
    data
  })
}

/**
 * 更新答辩评分
 */
export function updateDefenseScore(id: number, data: Partial<DefenseScoreInfo>): AxiosPromise<any> {
  return request({
    url: `/defense/score/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除答辩评分
 */
export function deleteDefenseScore(id: number): AxiosPromise<any> {
  return request({
    url: `/defense/score/${id}`,
    method: 'delete'
  })
}

/**
 * 审核答辩成绩
 */
export function auditDefenseScore(totalScoreId: number, status: number): AxiosPromise<any> {
  return request({
    url: `/defense/score/audit/${totalScoreId}`,
    method: 'put',
    data: { status }
  })
}

/**
 * 获取答辩总分列表
 */
export function getDefenseTotalScoreList(params: DefenseScoreListParams): AxiosPromise<any> {
  return request({
    url: '/defense/score/total/list',
    method: 'get',
    params
  })
}

/**
 * 获取学生答辩总分
 */
export function getStudentDefenseTotalScore(gsId: number): AxiosPromise<any> {
  return request({
    url: `/defense/score/total/student/${gsId}`,
    method: 'get'
  })
}

/**
 * 计算学生答辩总分
 */
export function calculateDefenseTotalScore(gsId: number): AxiosPromise<any> {
  return request({
    url: `/defense/score/total/calculate/${gsId}`,
    method: 'post'
  })
}

/**
 * 批量计算学生答辩总分
 */
export function batchCalculateDefenseTotalScores(groupId: number): AxiosPromise<any> {
  return request({
    url: `/defense/score/total/calculate/batch/${groupId}`,
    method: 'post'
  })
}
