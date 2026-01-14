<template>
  <div class="layout-container">
    <!-- 顶部导航栏 -->
    <div class="top-header">
      <div class="header-left">
        <el-icon class="menu-toggle" @click="toggleSidebar">
          <Menu />
        </el-icon>
        <div class="logo">
          <img src="/tubiao.svg" alt="Logo" />
          <span class="logo-text">答辩管理系统</span>
        </div>
      </div>
      
      <!-- 顶部主导航菜单 -->
      <div class="top-nav">
        <el-menu 
          :default-active="activeMenu" 
          mode="horizontal" 
          background-color="transparent" 
          text-color="var(--text-primary)"
          active-text-color="var(--primary-color)"
          :ellipsis="false"
          @select="handleMenuSelect"
        >
          <template v-for="route in topMenuRoutes" :key="route.path">
            <el-menu-item :index="'/' + route.path" v-if="!route.children">
              <el-icon v-if="route.meta?.icon">
                <component :is="iconComponents[route.meta.icon]" />
              </el-icon>
              <span>{{ route.meta?.title }}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </div>
      
      <div class="header-right">
        <el-dropdown @command="handleCommand">
          <div class="user-info">
            <el-avatar :src="userStore.userInfo.avatar" :size="40" />
            <div class="user-details">
              <div class="username">{{ userStore.userInfo.nickname || userStore.userInfo.username }}</div>
              <div class="user-role">{{ getUserRole() }}</div>
            </div>
            <el-icon class="arrow-down"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="info">
                <el-icon><User /></el-icon>
                个人信息
              </el-dropdown-item>
              <el-dropdown-item command="password">
                <el-icon><Lock /></el-icon>
                修改密码
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-container">
      <!-- 左侧可折叠图标栏 -->
      <div class="left-sidebar" :class="{ 'collapsed': isSidebarCollapsed, 'visible': isSidebarVisible }">
        <div class="sidebar-content">
          <el-menu
            :default-active="activeMenu"
            background-color="var(--bg-primary)"
            text-color="var(--text-secondary)"
            active-text-color="var(--primary-color)"
            active-background-color="var(--bg-secondary)"
            :collapse="isSidebarCollapsed"
            :collapse-transition="false"
            @select="handleMenuSelect"
          >
            <template v-for="route in sidebarMenuRoutes" :key="route.path">
              <el-menu-item :index="'/' + route.path" v-if="!route.children">
                <el-icon v-if="route.meta?.icon">
                  <component :is="iconComponents[route.meta.icon]" />
                </el-icon>
                <span>{{ route.meta?.title }}</span>
              </el-menu-item>
            </template>
          </el-menu>
        </div>
      </div>
      
      <!-- 侧边栏遮罩层（仅在移动设备上显示） -->
      <div class="sidebar-overlay" @click="closeSidebar" v-if="isMobileDevice.value && isSidebarVisible"></div>
      
      <!-- 内容区域 -->
      <div class="content-area">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessageBox } from 'element-plus'

import {
  Menu,
  ArrowDown,
  User,
  Lock,
  SwitchButton,
  HomeFilled,
  UserFilled,
  Document,
  Trophy,
  List,
  ChatLineRound,
  Calendar,
  Bell,
  Place,
  Edit,
  TrendCharts
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isSidebarCollapsed = ref(false)
const isSidebarVisible = ref(true) // 控制侧边栏的显示/隐藏状态，用于移动设备

// 检测是否为移动设备
const isMobileDevice = computed(() => {
  if (typeof window !== 'undefined') {
    return window.innerWidth <= 768
  }
  return false
})

// 图标组件映射
const iconComponents = {
  HomeFilled,
  User,
  UserFilled,
  Document,
  Trophy,
  List,
  ChatLineRound,
  Calendar,
  Bell,
  Place,
  Edit,
  TrendCharts
}

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 获取所有可用路由
const getAllRoutes = () => {
  return router.options.routes
    .find(r => r.path === '/')?.children
    ?.filter(r => r.meta?.title && 
               r.path !== 'user/info' && 
               r.path !== 'user/password' &&
               !r.path.includes('/form') // 过滤掉所有表单路径
              ) || []
}

// 根据用户角色过滤路由
const getFilteredRoutes = (allRoutes) => {
  if (userStore.isAdmin) {
    const adminExcludedRoutes = ['student/score']
    return allRoutes.filter(r => !adminExcludedRoutes.includes(r.path))
  } else if (userStore.userInfo.user_group === 'teacher') {
    const teacherRoutes = ['dashboard', 'notice/list', 'score/list', 'defense-plan/list', 'defense-group/list', 'defense-score/list', 'defense-record/list', 'defense-material/list', 'defense-venue/list', 'score-criteria/list', 'defense-record/manage', 'notification/center', 'statistics/dashboard']
    return allRoutes.filter(r => teacherRoutes.includes(r.path))
  } else if (userStore.userInfo.user_group === 'student') {
    const studentRoutes = ['dashboard', 'student/score', 'defense-plan/list', 'defense-group/list', 'defense-score/list', 'defense-record/list', 'defense-material/list', 'notification/center']
    return allRoutes.filter(r => studentRoutes.includes(r.path))
  }
  return []
}

// 顶部导航菜单和左侧边栏菜单使用相同的路由列表
const navigationRoutes = computed(() => {
  const allRoutes = getAllRoutes()
  const filteredRoutes = getFilteredRoutes(allRoutes)
  // 显示所有过滤后的功能模块
  return filteredRoutes
})

// 顶部导航菜单
const topMenuRoutes = computed(() => {
  return navigationRoutes.value
})

// 左侧边栏菜单
const sidebarMenuRoutes = computed(() => {
  return navigationRoutes.value
})

// 切换侧边栏折叠/显示状态
const toggleSidebar = () => {
  // 在移动设备上切换显示/隐藏状态
  if (isMobileDevice.value) {
    isSidebarVisible.value = !isSidebarVisible.value
  } else {
    // 在桌面设备上切换折叠状态
    isSidebarCollapsed.value = !isSidebarCollapsed.value
  }
}

// 点击遮罩层关闭侧边栏
const closeSidebar = () => {
  if (isMobileDevice.value) {
    isSidebarVisible.value = false
  }
}

// 处理菜单选择事件
const handleMenuSelect = (index) => {
  router.push(index)
}

// 获取用户角色
const getUserRole = () => {
  if (userStore.isAdmin) {
    return '管理员'
  } else if (userStore.userInfo.user_group === 'teacher') {
    return '教师'
  } else if (userStore.userInfo.user_group === 'student') {
    return '学生'
  }
  return ''
}

// 处理用户下拉菜单命令
const handleCommand = async (command) => {
  switch (command) {
    case 'info':
      router.push('/user/info')
      break
    case 'password':
      router.push('/user/password')
      break
    case 'logout':
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      userStore.logout()
      router.push('/login')
      break
  }
}
</script>

<style lang="scss" scoped>
.layout-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-secondary);
}

// 顶部导航栏
.top-header {
  height: 80px;
  background-color: var(--bg-primary);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  
  .header-left {
    display: flex;
    align-items: center;
    
    .menu-toggle {
      font-size: 28px;
      cursor: pointer;
      margin-right: 20px;
      color: var(--text-primary);
      transition: color 0.3s ease;
      
      &:hover {
        color: var(--primary-color);
      }
    }
    
    .logo {
      display: flex;
      align-items: center;
      
      img {
        width: 40px;
        height: 40px;
        margin-right: 12px;
      }
      
      .logo-text {
        color: var(--text-primary);
        font-size: 20px;
        font-weight: 600;
      }
    }
  }
  
  // 顶部主导航菜单
  .top-nav {
    flex: 1;
    margin: 0 30px;
    min-width: 0;
    
    :deep(.el-menu) {
      background-color: transparent;
      border-bottom: none;
      height: 80px;
      line-height: 80px;
      overflow: hidden;
      
      .el-menu-item {
        font-size: 15px;
        font-weight: 500;
        color: var(--text-primary);
        height: 80px;
        line-height: 80px;
        padding: 0 20px;
        transition: all 0.3s ease;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        
        &:hover {
          color: var(--primary-color);
          background-color: var(--bg-secondary);
        }
        
        &.is-active {
          color: var(--primary-color);
          background-color: var(--bg-secondary);
          border-bottom: 3px solid var(--primary-color);
        }
      }
    }
  }
  
  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 8px 16px;
      border-radius: 12px;
      transition: background-color 0.3s ease;
      
      &:hover {
        background-color: var(--bg-secondary);
      }
      
      .user-details {
        margin: 0 12px;
        text-align: left;
      }
      
      .username {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
        line-height: 1.2;
      }
      
      .user-role {
        font-size: 12px;
        color: var(--text-secondary);
        line-height: 1.2;
      }
      
      .arrow-down {
        font-size: 16px;
        color: var(--text-secondary);
      }
    }
  }
}

// 主内容区
.main-container {
  display: flex;
  flex: 1;
  margin-top: 72px;
  height: calc(100vh - 72px);
  
  // 左侧可折叠图标栏
  .left-sidebar {
    width: 200px;
    background-color: var(--bg-primary);
    box-shadow: 1px 0 6px rgba(0, 0, 0, 0.05);
    transition: width 0.3s ease;
    overflow-x: hidden;
    position: fixed;
    left: 0;
    top: 72px;
    bottom: 0;
    z-index: 998;
    
    &.collapsed {
      width: 64px;
    }
    
    .sidebar-content {
      padding: 16px 0;
      
      :deep(.el-menu) {
        border-right: none;
        background-color: transparent;
        height: 100%;
        
        .el-menu-item {
          height: 56px;
          line-height: 56px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
          padding: 0 20px;
          transition: all 0.3s ease;
          
          &:hover {
            color: var(--primary-color);
            background-color: var(--bg-secondary);
          }
          
          &.is-active {
            color: var(--primary-color);
            background-color: var(--bg-secondary);
          }
          
          .el-icon {
            font-size: 20px;
            margin-right: 12px;
          }
        }
      }
    }
  }
  
  // 内容区域
  .content-area {
    flex: 1;
    margin-left: 200px;
    margin-top: 80px;
    padding: 24px;
    overflow-y: auto;
    transition: margin-left 0.3s ease;
    
    .left-sidebar.collapsed + & {
      margin-left: 64px;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .top-header {
    padding: 0 16px;
    
    .top-nav {
      display: none;
    }
    
    .header-right {
      .user-info {
        .user-details {
          display: none;
        }
      }
    }
  }
  
  .main-container {
    .left-sidebar {
      position: fixed;
      z-index: 999;
      height: calc(100vh - 64px);
      transition: transform 0.3s ease;
      transform: translateX(-100%);
      
      &.visible {
        transform: translateX(0);
      }
    }
    
    .content-area {
      margin-left: 0;
      padding: 16px;
    }
    
    // 侧边栏展开时的遮罩层
    .sidebar-overlay {
      display: block;
      position: fixed;
      top: 64px;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 998;
    }
  }
}

@media (max-width: 480px) {
  .top-header {
    .logo {
      .logo-text {
        display: none;
      }
    }
  }
  
  .main-container {
    .content-area {
      padding: 12px;
    }
  }
}
</style>