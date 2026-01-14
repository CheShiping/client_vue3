<template>
  <div class="test-dashboard">
    <div class="page-header">
      <h1>测试页面 - 仪表盘</h1>
      <p>这是一个简单的测试页面，用于验证路由和组件是否能正常渲染。</p>
    </div>
    
    <div class="test-content">
      <div class="test-card">
        <h2>测试卡片</h2>
        <p>如果您看到这个页面，说明路由和组件渲染基本正常。</p>
        <p>用户信息：</p>
        <ul>
          <li>用户名：{{ userStore.userInfo.username }}</li>
          <li>用户组：{{ userStore.userInfo.user_group }}</li>
          <li>是否管理员：{{ userStore.isAdmin ? '是' : '否' }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

console.log('测试仪表盘组件已加载')
console.log('用户信息:', userStore.userInfo)
console.log('是否管理员:', userStore.isAdmin)
</script>

<style lang="scss" scoped>
.test-dashboard {
  .page-header {
    margin-bottom: 24px;
    
    h1 {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 8px;
    }
    
    p {
      font-size: 16px;
      color: var(--text-secondary);
    }
  }
  
  .test-content {
    .test-card {
      background-color: var(--bg-primary);
      border-radius: 16px;
      padding: 24px;
      box-shadow: var(--shadow-sm);
      
      h2 {
        font-size: 20px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 16px;
      }
      
      p {
        font-size: 16px;
        color: var(--text-secondary);
        margin-bottom: 16px;
      }
      
      ul {
        list-style: disc;
        padding-left: 24px;
        
        li {
          font-size: 16px;
          color: var(--text-primary);
          margin-bottom: 8px;
        }
      }
    }
  }
}
</style>