import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import router from '@/router'

// 响应数据接口
interface ApiResponse<T = any> {
  result?: T
  error?: {
    code: number
    message: string
  }
}

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: '/api', // 通过vite代理
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userStore = useUserStore()
    // 如果有token，添加到请求头
    if (userStore.token && config.headers) {
      config.headers['x-auth-token'] = userStore.token
    }
    return config
  },
  (error: AxiosError) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data
    
    // 检查是否有错误
    if (res.error) {
      const errorMsg = res.error.message || '请求失败'
      ElMessage({
        message: errorMsg,
        type: 'error',
        duration: 3000
      })
      
      // 401: 未登录或token过期
      if (res.error.code === 401 || res.error.code === 10000) {
        const userStore = useUserStore()
        userStore.logout()
        router.push('/login')
      }
      
      return Promise.reject(new Error(errorMsg))
    }
    
    // 返回数据（后端格式：{result: {...}} 或 {result: {obj: {...}}}）
    return res
  },
  (error: AxiosError) => {
    console.error('响应错误:', error)
    
    let message = '请求失败'
    if (error.response) {
      switch (error.response.status) {
        case 401:
          message = '未登录或登录已过期'
          const userStore = useUserStore()
          userStore.logout()
          router.push('/login')
          break
        case 403:
          message = '没有权限访问'
          break
        case 404:
          message = '请求的资源不存在'
          break
        case 500:
          message = '服务器错误'
          break
        default:
          message = (error.response.data as any)?.message || `请求失败: ${error.response.status}`
      }
    } else if (error.request) {
      message = '网络连接失败，请检查网络'
    } else {
      message = error.message || '请求失败'
    }
    
    ElMessage({
      message,
      type: 'error',
      duration: 3000
    })
    
    return Promise.reject(error)
  }
)

export default service

