import request from '@/utils/request'
import { AxiosPromise } from 'axios'

// 通知列表查询参数
interface NoticeListParams {
  page?: number
  size?: number
  title?: string
}

// 通知信息
interface NoticeInfo {
  notice_id: number
  title: string
  type: string
  content: string
  create_time: string
  update_time: string
}

/**
 * 获取通知列表
 */
export function getNoticeList(params: NoticeListParams): AxiosPromise<any> {
  return request({
    url: '/notice/list',
    method: 'get',
    params
  })
}

/**
 * 获取通知详情
 */
export function getNoticeDetail(id: number): AxiosPromise<any> {
  return request({
    url: `/notice/${id}`,
    method: 'get'
  })
}

/**
 * 新增通知
 */
export function addNotice(data: Partial<NoticeInfo>): AxiosPromise<any> {
  return request({
    url: '/notice',
    method: 'post',
    data
  })
}

/**
 * 更新通知信息
 */
export function updateNotice(id: number, data: Partial<NoticeInfo>): AxiosPromise<any> {
  return request({
    url: `/notice/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除通知
 */
export function deleteNotice(id: number): AxiosPromise<any> {
  return request({
    url: `/notice/${id}`,
    method: 'delete'
  })
}