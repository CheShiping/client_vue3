<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar">
      <div class="logo">
        <img v-if="!isCollapse" src="/tubiao.jpeg" alt="Logo" />
        <span v-if="!isCollapse" class="logo-text">答辩管理系统</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        background-color="#CC7700"
        text-color="#ffffff"
        active-text-color="#FFA500"
        active-background-color="#FFA500"
      >
        <template v-for="route in menuRoutes" :key="route.path">
          <el-menu-item :index="'/' + route.path" @click="handleMenuClick('/' + route.path)" v-if="!route.children">
            <el-icon v-if="route.meta?.icon">
              <component :is="route.meta.icon" />
            </el-icon>
            <span>{{ route.meta?.title }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container>
      <!-- 顶部导航栏 -->
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-icon" @click="toggleCollapse">
            <component :is="isCollapse ? 'Expand' : 'Fold'" />
          </el-icon>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :src="userStore.userInfo.avatar" :size="32" />
              <span class="username">{{ userStore.userInfo.nickname || userStore.userInfo.username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
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
      </el-header>

      <!-- 内容区域 -->
      <el-main class="main-content">
        <router-view />
        <!-- AI助手浮动图标 -->
        <div class="ai-assistant-icon" @click="showChat = true">
          <img src="/chengzhier.gif" alt="AI Assistant" />
        </div>
        <!-- AI聊天对话框 -->
        <ChatDialog v-model:open="showChat" />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessageBox } from 'element-plus'
import ChatDialog from '@/views/chat/index.vue' // 导入聊天对话框组件
import {
  Fold,
  Expand,
  ArrowDown,
  User,
  Lock,
  SwitchButton
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isCollapse = ref(false)
const showChat = ref(false) // 控制聊天对话框显示状态

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 菜单路由（过滤掉不需要显示在菜单的路由，并根据用户角色过滤）
const menuRoutes = computed(() => {
  const allRoutes = router.options.routes
    .find(r => r.path === '/')?.children
    ?.filter(r => r.meta?.title && r.path !== 'user/info' && r.path !== 'user/password') || []

  // 确保 allRoutes 不为空
  if (!allRoutes.length) {
    console.warn('No routes found in menuRoutes')
    return []
  }

  // 根据用户角色过滤菜单
  if (userStore.isAdmin) {
    const adminExcludedRoutes = ['student/paper', 'student/score']
    return allRoutes.filter(r => !adminExcludedRoutes.includes(r.path))
  } else if (userStore.userInfo.user_group === 'teacher') {
    const teacherRoutes = ['dashboard', 'notice/list', 'topic/list', 'defense/list', 'score/list', 'notice/center']
    return allRoutes.filter(r => teacherRoutes.includes(r.path))
  } else if (userStore.userInfo.user_group === 'student') {
    const studentRoutes = ['dashboard', 'topic/list', 'student/paper', 'student/score', 'notice/center']
    return allRoutes.filter(r => studentRoutes.includes(r.path))
  }
  return []
})

// 切换侧边栏折叠状态
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 处理菜单点击
const handleMenuClick = (path) => {
  router.push(path)
}

// 处理用户下拉菜单命令
const handleCommand = async (command) => {
  switch (command) {
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
  
  .sidebar {
        background-color: #CC7700;
        transition: width 0.3s ease;
        overflow-x: hidden;
        
        .logo {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 60px;
          background-color: #CC7700;
      
      img {
        width: 32px;
        height: 32px;
        margin-right: 8px;
      }
      
      .logo-text {
        color: #ffffff;
        font-size: 18px;
        font-weight: bold;
        white-space: nowrap;
      }
    }
    
    :deep(.el-menu) {
      border-right: none;
      height: calc(100vh - 60px);
    }
  }
  
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
    background-color: #fff;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    
    .header-left {
      display: flex;
      align-items: center;
      
      .collapse-icon {
        font-size: 20px;
        cursor: pointer;
        margin-right: 20px;
      }
    }
    
    .header-right {
      .user-info {
        display: flex;
        align-items: center;
        cursor: pointer;
        
        .username {
          margin: 0 8px;
          font-size: 14px;
        }
      }
    }
  }
  
  .main-content {
    background-color: #f0f2f5;
    padding: 20px;
    position: relative; // 为浮动元素提供定位上下文
    
    .ai-assistant-icon {
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      cursor: pointer;
      z-index: 9997;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: all 0.3s ease;
      
      &:hover {
        transform: scale(1.1);
      }
      
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
    }
  }
}
</style>