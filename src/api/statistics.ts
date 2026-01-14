import request from '@/utils/request'

/**
 * 获取答辩完成情况统计
 */
export function getDefenseCompletion(params?: Record<string, any>) {
  return request({
    url: '/statistics/defense-completion',
    method: 'get',
    params
  })
}

/**
 * 获取成绩分布统计
 */
export function getScoreDistribution(params?: Record<string, any>) {
  return request({
    url: '/statistics/score-distribution',
    method: 'get',
    params
  })
}

/**
 * 获取学生答辩状态统计
 */
export function getStudentStatusStatistics(params?: Record<string, any>) {
  return request({
    url: '/statistics/student-status',
    method: 'get',
    params
  })
}

/**
 * 获取教师评分统计
 */
export function getTeacherScoreStatistics(params?: Record<string, any>) {
  return request({
    url: '/statistics/teacher-score',
    method: 'get',
    params
  })
}