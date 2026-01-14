<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <img src="/tubiao.svg" alt="Logo" class="logo-img" />
        <h2>答辩管理系统</h2>
        <p>欢迎登录</p>
      </div>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            prefix-icon="User"
            clearable
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleLogin"
            class="login-button"
          >
            登录
          </el-button>
        </el-form-item>
        
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { login } from '@/api/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await login(loginForm)
        console.log('登录响应:', res)
        
        // 后端返回格式：{result: {obj: {user信息, token}}}
        if (res.result && res.result.obj) {
          const userData = res.result.obj
          // 保存token和用户信息
          userStore.setTokenValue(userData.token)
          userStore.setUserInfo({
            user_id: userData.user_id,
            username: userData.username,
            nickname: userData.nickname || userData.username,
            avatar: userData.avatar || '/img/avatar.png',
            phone: userData.phone || '',
            email: userData.email || '',
            user_group: userData.user_group || '',
            user_admin: userData.user_admin || '0',
            state: userData.state || 0
          })
          
          ElMessage.success('登录成功')
          
          // 跳转到重定向页面或首页
          const redirect = route.query.redirect || '/dashboard' // 登录成功后跳转到dashboard
          router.push(redirect)
        } else if (res.error) {
          ElMessage.error(res.error.message || '登录失败')
        } else {
          ElMessage.error('登录失败，请检查用户名和密码')
        }
      } catch (error) {
        console.error('登录错误:', error)
        // 错误已在拦截器中处理，这里不需要再显示
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url('../../../public/banner2.jpg');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(22, 93, 255, 0.1) 0%, rgba(255, 255, 255, 0.5) 100%);
    z-index: 1;
  }
}

.login-box {
  width: 440px;
  padding: 56px;
  background: var(--bg-primary);
  border-radius: 20px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(12px);
  position: relative;
  z-index: 2;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 48px;
  
  .logo-img {
    width: 80px;
    height: 80px;
    margin-bottom: 24px;
    border-radius: 20px;
    padding: 12px;
    background: rgba(22, 93, 255, 0.1);
  }
  
  h2 {
    font-size: 32px;
    color: var(--text-primary);
    margin-bottom: 16px;
    font-weight: 700;
    line-height: 1.2;
  }
  
  p {
    font-size: 18px;
    color: var(--text-secondary);
    font-weight: 400;
  }
}

.login-form {
  .login-button {
    width: 100%;
    margin-top: 32px;
    height: 52px;
    font-size: 18px;
    font-weight: 600;
    background-color: var(--primary-color);
    border-color: var(--primary-color);
    border-radius: 12px;
    transition: all 0.3s ease;
    
    &:hover {
      background-color: var(--primary-light);
      border-color: var(--primary-light);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(22, 93, 255, 0.3);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
  
  :deep(.el-input) {
    margin-bottom: 28px;
    
    .el-input__wrapper {
      border-radius: 12px;
      transition: all 0.3s ease;
      height: 52px;
      padding: 0 20px;
      
      &:hover {
        box-shadow: 0 4px 16px rgba(22, 93, 255, 0.12);
      }
      
      &.is-focus {
        box-shadow: 0 0 0 3px rgba(22, 93, 255, 0.2);
        border-color: var(--primary-color);
      }
      
      .el-input__inner {
        font-size: 16px;
        height: 52px;
        line-height: 52px;
        color: var(--text-primary);
      }
      
      .el-input__prefix {
        color: var(--text-secondary);
      }
    }
  }
  
  :deep(.el-form-item__error) {
    color: var(--danger-color);
    font-size: 14px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .login-box {
    width: 90%;
    max-width: 380px;
    padding: 40px 32px;
    margin: 0 20px;
  }
  
  .login-header {
    margin-bottom: 32px;
    
    .logo-img {
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }
    
    h2 {
      font-size: 24px;
    }
    
    p {
      font-size: 16px;
    }
  }
  
  .login-form {
    .login-button {
      height: 48px;
      font-size: 16px;
    }
    
    :deep(.el-input) {
      .el-input__wrapper {
        height: 48px;
        
        .el-input__inner {
          height: 48px;
          line-height: 48px;
        }
      }
    }
  }
}
</style>

