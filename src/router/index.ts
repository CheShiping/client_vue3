import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

// 为window对象扩展自定义属性的类型
declare global {
  interface Window {
    lastUserInfoErrorTime: number;
  }
}

// 定义路由类型
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },

  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    meta: {
      requiresAuth: true
    },
    children: [
      {        path: 'dashboard',        name: 'Dashboard',        component: () => import('@/views/dashboard/index.vue'),        meta: {          title: '首页',          icon: 'HomeFilled',          requiresAuth: true        }      },
      {
        path: 'user/info',
        name: 'UserInfo',
        component: () => import('@/views/user/info.vue'),
        meta: {
          title: '个人信息',
          requiresAuth: true
        }
      },
      {
        path: 'user/password',
        name: 'UserPassword',
        component: () => import('@/views/user/password.vue'),
        meta: {
          title: '修改密码',
          requiresAuth: true
        }
      },
      // 学生管理
      {
        path: 'student/list',
        name: 'StudentList',
        component: () => import('@/views/student/list.vue'),
        meta: {
          title: '学生管理',
          icon: 'User',
          requiresAuth: true
        }
      },

      // 学生成绩查看
      {
        path: 'student/score',
        name: 'StudentScore',
        component: () => import('@/views/student/score.vue'),
        meta: {
          title: '我的成绩',
          icon: 'Trophy',
          requiresAuth: true
        }
      },
      // 教师管理
      {
        path: 'teacher/list',
        name: 'TeacherList',
        component: () => import('@/views/teacher/list.vue'),
        meta: {
          title: '教师管理',
          icon: 'UserFilled',
          requiresAuth: true
        }
      },



      // 成绩信息管理
      {
        path: 'score/list',
        name: 'ScoreList',
        component: () => import('@/views/score/list.vue'),
        meta: {
          title: '成绩管理',
          icon: 'Trophy',
          requiresAuth: true
        }
      },
      // 答辩计划管理
      {
        path: 'defense-plan/list',
        name: 'DefensePlanList',
        component: () => import('@/views/defense-plan/list.vue'),
        meta: {
          title: '答辩计划',
          icon: 'Calendar',
          requiresAuth: true
        }
      },
      {
        path: 'defense-plan/form',
        name: 'DefensePlanForm',
        component: () => import('@/views/defense-plan/form.vue'),
        meta: {
          title: '答辩计划表单',
          requiresAuth: true,
          showInMenu: false
        }
      },
      // 答辩分组管理
      {
        path: 'defense-group/list',
        name: 'DefenseGroupList',
        component: () => import('@/views/defense-group/list.vue'),
        meta: {
          title: '答辩分组',
          icon: 'UserFilled',
          requiresAuth: true
        }
      },
      {
        path: 'defense-group/form',
        name: 'DefenseGroupForm',
        component: () => import('@/views/defense-group/form.vue'),
        meta: {
          title: '答辩分组表单',
          requiresAuth: true,
          showInMenu: false
        }
      },
      // 答辩评分管理
      {
        path: 'defense-score/list',
        name: 'DefenseScoreList',
        component: () => import('@/views/defense-score/list.vue'),
        meta: {
          title: '答辩评分',
          icon: 'Trophy',
          requiresAuth: true
        }
      },
      // 答辩记录管理
      {
        path: 'defense-record/list',
        name: 'DefenseRecordList',
        component: () => import('@/views/defense-record/list.vue'),
        meta: {
          title: '答辩记录',
          icon: 'Document',
          requiresAuth: true
        }
      },
      // 通知公告管理
      {
        path: 'notice/list',
        name: 'NoticeList',
        component: () => import('@/views/notice/list.vue'),
        meta: {
          title: '通知公告',
          icon: 'Bell',
          requiresAuth: true
        }
      },
      // 答辩材料管理
      {
        path: 'defense-material/list',
        name: 'DefenseMaterialList',
        component: () => import('@/views/defense-material/list.vue'),
        meta: {
          title: '答辩材料',
          icon: 'Document',
          requiresAuth: true
        }
      },
      // 答辩场地管理
      {
        path: 'defense-venue/list',
        name: 'DefenseVenueList',
        component: () => import('@/views/defense-venue/list.vue'),
        meta: {
          title: '答辩场地',
          icon: 'Place',
          requiresAuth: true
        }
      },
      // 评分标准管理
      {
        path: 'score-criteria/list',
        name: 'ScoreCriteriaList',
        component: () => import('@/views/score-criteria/list.vue'),
        meta: {
          title: '评分标准',
          icon: 'Edit',
          requiresAuth: true
        }
      },
      // 教师评分
      {
        path: 'teacher-score/form',
        name: 'TeacherScoreForm',
        component: () => import('@/views/teacher-score/form.vue'),
        meta: {
          title: '教师评分',
          requiresAuth: true,
          showInMenu: false
        }
      },
      // 答辩记录管理
      {
        path: 'defense-record/manage',
        name: 'DefenseRecordManage',
        component: () => import('@/views/defense-record/manage.vue'),
        meta: {
          title: '答辩记录管理',
          icon: 'Document',
          requiresAuth: true
        }
      },
      // 通知中心
      {
        path: 'notification/center',
        name: 'NotificationCenter',
        component: () => import('@/views/notification/center.vue'),
        meta: {
          title: '通知中心',
          icon: 'Bell',
          requiresAuth: true
        }
      },
      // 统计分析
      {
        path: 'statistics/dashboard',
        name: 'StatisticsDashboard',
        component: () => import('@/views/statistics/dashboard.vue'),
        meta: {
          title: '统计分析',
          icon: 'TrendCharts',
          requiresAuth: true
        }
      }
    ]
  },
  // 未匹配到的路径重定向到首页
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 答辩管理系统`
  }
  
  // 白名单：不需要登录的页面
  const whiteList = ['/login', '/forgot']
  
  // 如果访问的是白名单页面，直接放行
  if (whiteList.includes(to.path)) {
    // 如果已登录，访问登录页则跳转到首页
    if (to.path === '/login' && userStore.isLoggedIn) {
      next('/dashboard') // 直接跳转到仪表盘而不是根路径
      return
    }
    next()
    return
  }
  
  // 如果路由明确标记为不需要登录，直接放行
  if (to.meta.requiresAuth === false) {
    next()
    return
  }
  
  // 如果没有token，直接跳转到登录页
  if (!userStore.token) {
    ElMessage.warning('请先登录')
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
    return
  }
  
  // 如果用户信息为空，尝试获取用户信息
  if (!userStore.userInfo.username && userStore.token) {
    console.log('Fetching user info...')
    try {
      await userStore.fetchUserInfo()
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 获取用户信息失败，可能token已失效，清除本地token并跳转到登录页
      userStore.logout()
      ElMessage.error('登录信息已失效，请重新登录')
      next('/login')
      return
    }
  }
  
  // 如果仍然没有用户名（即获取用户信息失败），跳转到登录页
  if (!userStore.token || (!userStore.userInfo.username && !whiteList.includes(to.path))) {
    next('/login')
    return
  }
  
  // 权限验证
  if (userStore.isAdmin) {
    // 管理员可以访问所有页面
    next()
  } else if (userStore.isTeacher) {
    // 教师可以访问的页面
    const teacherAllowedPaths = [
      '/dashboard',
      '/score/list',
      '/score/form',
      '/defense-plan/list',
      '/defense-plan/form',
      '/defense-group/list',
      '/defense-group/form',
      '/defense-score/list',
      '/defense-record/list',
      '/teacher/list',
      '/teacher/form',
      '/teacher/detail',
      '/notice/list',
      '/notice/form',
      '/notice/view',
      '/notice/center',
      '/chat',
      '/user/info',
      '/user/password',
      '/defense-material/list',
      '/defense-venue/list',
      '/score-criteria/list',
      '/teacher-score/form',
      '/defense-record/manage',
      '/notification/center',
      '/statistics/dashboard',
    ]
    
    // 检查完整路径是否在允许列表中
    const fullPath = to.path
    // 处理带参数的路由
    const matchedPath = teacherAllowedPaths.find(path => {
      if (path.includes(':id')) {
        const regex = new RegExp(path.replace(':id', '\\d+'))
        return regex.test(fullPath)
      }
      return path === fullPath
    })
    
    if (matchedPath) {
      next()
    } else {
      ElMessage.warning('您没有权限访问该页面')
      if (from.path && from.path !== to.path && teacherAllowedPaths.includes(from.path)) {
        next(from.path)
      } else {
        next('/dashboard')
      }
    }
  } else if (userStore.userInfo.user_group === 'student') {
    // 学生可以访问的页面
    const studentAllowedPaths = [
      '/dashboard',
      '/student/score',
      '/student/detail',
      '/defense-plan/list',
      '/defense-group/list',
      '/defense-score/list',
      '/defense-record/list',
      '/notice/list',
      '/notice/view',
      '/notice/center',
      '/chat',
      '/user/info',
      '/user/password',
      '/defense-material/list',
      '/notification/center'
    ]
    
    // 检查完整路径是否在允许列表中
    const fullPath = to.path
    // 处理带参数的路由
    const matchedPath = studentAllowedPaths.find(path => {
      if (path.includes(':id')) {
        const regex = new RegExp(path.replace(':id', '\\d+'))
        return regex.test(fullPath)
      }
      return path === fullPath
    })
    
    if (matchedPath) {
      next()
    } else {
      ElMessage.warning('您没有权限访问该页面')
      if (from.path && from.path !== to.path && studentAllowedPaths.includes(from.path)) {
        next(from.path)
      } else {
        next('/dashboard')
      }
    }
  } else {
    // 如果用户信息尚未加载完成或用户组未知，暂时放行，让页面自己处理
    // 或者跳转到登录页重新登录
    next('/login')
    return
  }
})

// 导出路由实例
export default router