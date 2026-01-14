import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { getUserInfo } from '@/api/user' // 导入获取用户信息的API

// 存储键名常量
const USER_INFO_KEY = 'thesis_management_user_info'

// 用户信息接口
interface UserInfo {
  user_id: number
  username: string
  nickname: string
  avatar: string
  phone: string
  email: string
  user_group: string
  user_admin: string
  state: number
  create_time: string
  update_time: string
}

// 从localStorage获取用户信息
function getUserInfoFromStorage(): UserInfo | null {
  if (typeof window === 'undefined') return null // 服务端渲染兼容
  
  try {
    const data = localStorage.getItem(USER_INFO_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return null
  }
}

// 将用户信息保存到localStorage
function saveUserInfoToStorage(userInfo: UserInfo): void {
  if (typeof window === 'undefined') return // 服务端渲染兼容
  
  try {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
  } catch (error) {
    console.error('保存用户信息失败:', error)
  }
}

// 清除用户信息存储
function clearUserInfoStorage(): void {
  if (typeof window === 'undefined') return // 服务端渲染兼容
  
  try {
    localStorage.removeItem(USER_INFO_KEY)
  } catch (error) {
    console.error('清除用户信息失败:', error)
  }
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>(getToken() || '')
  
  // 从localStorage获取用户信息，如果不存在则使用默认值
  const storedUserInfo = getUserInfoFromStorage()
  const userInfo = ref<UserInfo>(storedUserInfo || {
    user_id: 0,
    username: '',
    nickname: '',
    avatar: '/img/avatar.png',
    phone: '',
    email: '',
    user_group: 'student', // 默认用户组为学生
    user_admin: '0',
    state: 1,
    create_time: '',
    update_time: ''
  })
  
  // 添加当前学生ID状态
  const currentStudentId = ref<number | null>(null)

  // 添加获取用户信息的加载状态
  const fetchingUserInfo = ref<boolean>(false)

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => userInfo.value.user_admin === '1' || userInfo.value.user_group === 'admin')
  const isTeacher = computed(() => userInfo.value.user_group === 'teacher')

  // 方法
  function setTokenValue(newToken: string): void {
    token.value = newToken
    if (newToken) {
      setToken(newToken)
    } else {
      removeToken()
    }
  }

  function setUserInfo(info: Partial<UserInfo>): void {
    userInfo.value = { ...userInfo.value, ...info }
    // 同时保存到localStorage
    saveUserInfoToStorage(userInfo.value)
  }

  // 添加获取用户信息的方法
  async function fetchUserInfo(): Promise<void> {
    // 如果正在请求中，直接返回
    if (fetchingUserInfo.value) {
      return
    }
    
    // 设置请求状态
    fetchingUserInfo.value = true
    
    try {
      if (token.value) {
        const response = await getUserInfo()
        console.log('获取用户信息响应:', response)
        
        // 检查响应是否包含必要的用户信息字段
        if (response && response.result && response.result.obj) {
          // 使用响应中的obj字段作为用户信息
          setUserInfo(response.result.obj)
        } else {
          console.warn('获取的用户信息格式不正确:', response)
          // 使用默认用户信息，避免系统崩溃
          setUserInfo({...userInfo.value})
        }
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 如果获取用户信息失败，可能token已失效，清除本地token
      logout()
      throw error // 抛出错误，使调用方可以捕获
    } finally {
      // 请求完成，重置状态
      fetchingUserInfo.value = false
    }
  }

  function logout(): void {
    token.value = ''
    userInfo.value = {
      user_id: 0,
      username: '',
      nickname: '',
      avatar: '/img/avatar.png',
      phone: '',
      email: '',
      user_group: '',
      user_admin: '',
      state: 0,
      create_time: '',
      update_time: ''
    }
    removeToken()
    clearUserInfoStorage()
  }

  return {
    token,
    userInfo,
    currentStudentId,
    isLoggedIn,
    isAdmin,
    isTeacher,
    setTokenValue,
    setUserInfo,
    fetchUserInfo, // 添加此方法到返回对象
    logout
  }
})