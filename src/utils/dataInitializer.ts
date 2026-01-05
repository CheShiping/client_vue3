/**
 * 数据初始化工具
 * 在应用启动时从localStorage加载数据到内存中
 */

import { getDataFromStorage, getStorageKeys } from './localstorage'

// 存储键名映射
const storageKeys = getStorageKeys()

/**
 * 初始化所有数据
 */
export function initializeAllData(): void {
  try {
    // 从localStorage加载数据到全局变量
    const storedStudents = getDataFromStorage(storageKeys.STUDENTS)
    const storedTeachers = getDataFromStorage(storageKeys.TEACHERS)
    const storedDefenses = getDataFromStorage(storageKeys.DEFENSES)
    const storedPapers = getDataFromStorage(storageKeys.PAPERS)
    const storedScores = getDataFromStorage(storageKeys.SCORES)
    const storedTopics = getDataFromStorage(storageKeys.TOPICS)
    
    // 输出日志
    console.log('数据初始化完成:', {
      students: storedStudents.length,
      teachers: storedTeachers.length,
      defenses: storedDefenses.length,
      papers: storedPapers.length,
      scores: storedScores.length,
      topics: storedTopics.length
    })
  } catch (error) {
    console.error('数据初始化失败:', error)
  }
}

/**
 * 获取初始化状态
 */
export function isDataInitialized(): boolean {
  try {
    const storedStudents = getDataFromStorage(storageKeys.STUDENTS)
    return storedStudents.length > 0
  } catch (error) {
    return false
  }
}