/**
 * 本地存储服务，用于持久化保存数据修改
 */

// 存储键名常量
const STORAGE_KEYS = {
  STUDENTS: 'thesis_management_students',
  TEACHERS: 'thesis_management_teachers',
  DEFENSES: 'thesis_management_defenses',
  PAPERS: 'thesis_management_papers',
  SCORES: 'thesis_management_scores',
  TOPICS: 'thesis_management_topics'
}

// 默认数据
const DEFAULT_DATA = {
  students: [],
  teachers: [],
  defenses: [],
  papers: [],
  scores: [],
  topics: []
}

/**
 * 从localStorage获取数据
 * @param key 存储键名
 * @returns 数据对象
 */
export function getDataFromStorage(key: string): any[] {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error(`获取${key}数据失败:`, error)
    return []
  }
}

/**
 * 将数据保存到localStorage
 * @param key 存储键名
 * @param data 要保存的数据
 */
export function saveDataToStorage(key: string, data: any[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`保存${key}数据失败:`, error)
  }
}

/**
 * 初始化数据存储
 * @param mockData 初始Mock数据
 * @param storageKey 存储键名
 * @returns 初始化后的数据
 */
export function initializeStorage(mockData: any[], storageKey: string): any[] {
  const storedData = getDataFromStorage(storageKey)
  
  // 如果localStorage中没有数据，则使用Mock数据初始化
  if (storedData.length === 0) {
    saveDataToStorage(storageKey, mockData)
    return mockData
  }
  
  return storedData
}

/**
 * 添加新数据项
 * @param newItem 新数据项
 * @param storageKey 存储键名
 * @returns 添加后的完整数据数组
 */
export function addItemToStorage(newItem: any, storageKey: string): any[] {
  const currentData = getDataFromStorage(storageKey)
  currentData.push(newItem)
  saveDataToStorage(storageKey, currentData)
  return currentData
}

/**
 * 更新数据项
 * @param id 数据项ID
 * @param updatedItem 更新后的数据项
 * @param storageKey 存储键名
 * @param idField ID字段名
 * @returns 更新后的完整数据数组
 */
export function updateItemInStorage(id: number, updatedItem: any, storageKey: string, idField: string = 'id'): any[] {
  const currentData = getDataFromStorage(storageKey)
  const index = currentData.findIndex((item: any) => item[idField] === id)
  
  if (index !== -1) {
    currentData[index] = { ...currentData[index], ...updatedItem }
    saveDataToStorage(storageKey, currentData)
  }
  
  return currentData
}

/**
 * 删除数据项
 * @param id 数据项ID
 * @param storageKey 存储键名
 * @param idField ID字段名
 * @returns 删除后的完整数据数组
 */
export function deleteItemFromStorage(id: number, storageKey: string, idField: string = 'id'): any[] {
  const currentData = getDataFromStorage(storageKey)
  const index = currentData.findIndex((item: any) => item[idField] === id)
  
  if (index !== -1) {
    currentData.splice(index, 1)
    saveDataToStorage(storageKey, currentData)
  }
  
  return currentData
}

/**
 * 获取所有存储键名
 */
export function getStorageKeys() {
  return STORAGE_KEYS
}