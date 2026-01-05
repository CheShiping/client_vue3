const TOKEN_KEY = 'token'
const TOKEN_EXPIRE = 120 // 120分钟

interface TokenData {
  value: string
  expire: number
}

/**
 * 获取token
 */
export function getToken(): string | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return null
    
    const tokenData: TokenData = JSON.parse(token)
    const now = Date.now()
    
    // 检查是否过期
    if (tokenData.expire && now > tokenData.expire) {
      removeToken()
      return null
    }
    
    // 检查 token 值是否存在
    if (!tokenData.value) {
      removeToken()
      return null
    }
    
    return tokenData.value
  } catch (error) {
    // 如果解析失败，清除无效的 token
    console.error('Token 解析失败:', error)
    removeToken()
    return null
  }
}

/**
 * 设置token
 */
export function setToken(tokenValue: string, expireMinutes: number = TOKEN_EXPIRE): void {
  const expire = Date.now() + expireMinutes * 60 * 1000
  const tokenData: TokenData = {
    value: tokenValue,
    expire: expire
  }
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokenData))
}

/**
 * 移除token
 */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

