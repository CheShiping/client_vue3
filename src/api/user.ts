import request from '@/utils/request'
import { AxiosPromise } from 'axios'

// 登录请求参数
interface LoginParams {
  username: string
  password: string
}

// 修改密码请求参数
interface ChangePasswordParams {
  oldPassword: string
  newPassword: string
}

// 忘记密码请求参数
interface ForgotPasswordParams {
  username: string
  email: string
}

// 注册请求参数
interface RegisterParams {
  username: string
  password: string
  nickname: string
  phone: string
  email: string
  user_group: string
}

/**
 * 用户登录
 */
export function login(data: LoginParams): AxiosPromise<any> {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

/**
 * 用户登出
 */
export function logout(): AxiosPromise<any> {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}

/**
 * 获取用户信息
 */
export function getUserInfo(): AxiosPromise<any> {
  return request({
    url: '/user/info',
    method: 'get'
  })
}

/**
 * 修改密码
 */
export function changePassword(data: ChangePasswordParams): AxiosPromise<any> {
  return request({
    url: '/user/password',
    method: 'post',
    data
  })
}

/**
 * 忘记密码
 */
export function forgotPassword(data: ForgotPasswordParams): AxiosPromise<any> {
  return request({
    url: '/user/forgot',
    method: 'post',
    data
  })
}

/**
 * 用户注册
 */
export function register(data: RegisterParams): AxiosPromise<any> {
  return request({
    url: '/user/register',
    method: 'post',
    data
  })
}

/**
 * 更新用户信息
 */
export function updateUserInfo(data: Partial<{ nickname: string; phone: string; email: string }>): AxiosPromise<any> {
  return request({
    url: '/user/info',
    method: 'put',
    data
  })
}