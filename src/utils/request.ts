import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig, AxiosError } from 'axios'
import { useUserStore } from '@/stores/user'
import router from '@/router'
import { ElMessage } from 'element-plus'

// 响应数据接口
interface ApiResponse<T = any> {
  result?: T
  error?: {
    code: number
    message: string
  }
}

// 创建请求取消控制器映射
const cancelTokens = new Map<string, AbortController>()

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: '/api', // 通过vite代理
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 生成请求的唯一键
const generateRequestKey = (config: InternalAxiosRequestConfig) => {
  const { url, method, params, data } = config
  const requestData = typeof data === 'string' ? data : JSON.stringify(data)
  return `${method?.toUpperCase()}-${url}-${JSON.stringify(params)}-${requestData}`
}

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 生成请求键
    const requestKey = generateRequestKey(config)
    
    // 如果已经有相同的请求在进行中，取消之前的请求
    if (cancelTokens.has(requestKey)) {
      const controller = cancelTokens.get(requestKey)
      controller?.abort()
      cancelTokens.delete(requestKey)
    }
    
    // 创建新的请求取消控制器
    const controller = new AbortController()
    config.signal = controller.signal
    
    // 保存请求键和控制器
    cancelTokens.set(requestKey, controller)
    
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
  (response: AxiosResponse) => {
    // 生成请求键
    const requestKey = generateRequestKey(response.config)
    // 请求完成，清除请求取消控制器
    cancelTokens.delete(requestKey)
    
    const res = response.data as ApiResponse
    
    // 检查是否有错误
    if (res.error) {
      const errorMsg = res.error.message || '请求失败'
      ElMessage({
        message: errorMsg,
        type: 'error',
        duration: 3000
      })
      
      // 401: 未登录或token过期
      if (res.error.code === 401) {
        const userStore = useUserStore()
        userStore.logout()
        router.push('/login')
      }
      
      return Promise.reject(new Error(errorMsg))
    }
    
    // 返回响应数据，而不是整个响应对象
    return response.data
  },
  (error: AxiosError) => {
    // 生成请求键
    if (error.config) {
      const requestKey = generateRequestKey(error.config)
      // 请求完成，清除请求取消控制器
      cancelTokens.delete(requestKey)
    }
    
    console.error('响应错误:', error)
    
    let message = '请求失败'
    // 处理请求取消错误，不显示错误消息
    if (error.name === 'CanceledError') {
      return Promise.reject(new Error('请求已取消'))
    }
    
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

