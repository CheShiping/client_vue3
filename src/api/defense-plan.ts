import request from '@/utils/request'
import { AxiosPromise } from 'axios'

// 答辩计划查询参数
interface DefensePlanListParams {
  page?: number
  size?: number
  plan_name?: string
  defense_type?: string
  start_time?: string
  end_time?: string
  status?: number
}

// 答辩计划信息
interface DefensePlanInfo {
  plan_id: number
  plan_name: string
  plan_desc: string
  defense_type: string
  start_time: string
  end_time: string
  status: number
  create_time: string
  update_time: string
}

/**
 * 获取答辩计划列表
 */
export function getDefensePlanList(params: DefensePlanListParams): AxiosPromise<any> {
  return request({
    url: '/defense/plan/list',
    method: 'get',
    params
  })
}

/**
 * 获取答辩计划详情
 */
export function getDefensePlanDetail(id: number): AxiosPromise<any> {
  return request({
    url: `/defense/plan/${id}`,
    method: 'get'
  })
}

/**
 * 新增答辩计划
 */
export function addDefensePlan(data: Partial<DefensePlanInfo>): AxiosPromise<any> {
  return request({
    url: '/defense/plan',
    method: 'post',
    data
  })
}

/**
 * 更新答辩计划
 */
export function updateDefensePlan(id: number, data: Partial<DefensePlanInfo>): AxiosPromise<any> {
  return request({
    url: `/defense/plan/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除答辩计划
 */
export function deleteDefensePlan(id: number): AxiosPromise<any> {
  return request({
    url: `/defense/plan/${id}`,
    method: 'delete'
  })
}

/**
 * 审核答辩计划
 */
export function auditDefensePlan(id: number, status: number): AxiosPromise<any> {
  return request({
    url: `/defense/plan/audit/${id}`,
    method: 'put',
    data: { status }
  })
}

/**
 * 发布答辩计划
 */
export function publishDefensePlan(id: number): AxiosPromise<any> {
  return request({
    url: `/defense/plan/publish/${id}`,
    method: 'put'
  })
}
