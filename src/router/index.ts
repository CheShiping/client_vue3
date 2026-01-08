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
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: {
          title: '首页',
          icon: 'HomeFilled',
          requiresAuth: true
        }
      },
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
      // 学生个人答辩管理
      {
        path: 'student/paper',
        name: 'StudentDefense',
        component: () => import('@/views/student/paper.vue'),
        meta: {
          title: '我的答辩',
          icon: 'Document',
          requiresAuth: true,
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
      // 论文信息管理
      {
        path: 'paper/list',
        name: 'PaperList',
        component: () => import('@/views/paper/list.vue'),
        meta: {
          title: '答辩材料',
          icon: 'Document',
          requiresAuth: true
        }
      },
      // 选题信息管理
      {
        path: 'topic/list',
        name: 'TopicList',
        component: () => import('@/views/topic/list.vue'),
        meta: {
          title: '选题管理',
          icon: 'List',
          requiresAuth: true
        }
      },
      // 答辩信息管理
      {
        path: 'defense/list',
        name: 'DefenseList',
        component: () => import('@/views/defense/list.vue'),
        meta: {
          title: '答辩管理',
          icon: 'ChatLineRound',
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
    await userStore.fetchUserInfo()
  }
  
  // 权限验证
  if (userStore.isAdmin) {
    // 管理员可以访问所有页面
    next()
  } else if (userStore.userInfo.user_group === 'teacher') {
    // 教师可以访问的页面
    const teacherAllowedPaths = [
      '/dashboard',
      '/topic/list',
      '/topic/form',
      '/paper/list',
      '/paper/form',
      '/defense/list',
      '/defense/form',
      '/score/list',
      '/score/form',
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
      '/topic/list',
      '/student/topic',
      '/paper/list',
      '/student/score',
      '/student/list',
      '/student/form',
      '/student/paper',
      '/student/detail',
      '/notice/list',
      '/notice/view',
      '/notice/center',
      '/chat'
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
  }
})

// 导出路由实例
export default router