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
        
        <div class="login-footer">
          <el-link type="primary" @click="$router.push('/forgot')">
            忘记密码？
          </el-link>
        </div>
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
          const redirect = route.query.redirect || '/dashboard' // 默认跳转到仪表盘而不是根路径
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
}

.login-box {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
  
  .logo-img {
    width: 60px;
    height: 60px;
    margin-bottom: 15px;
  }
  
  h2 {
    font-size: 24px;
    color: #303133;
    margin-bottom: 10px;
  }
  
  p {
    font-size: 14px;
    color: #909399;
  }
}

.login-form {
  .login-button {
    width: 100%;
    margin-top: 10px;
  }
}

.login-footer {
  text-align: right;
  margin-top: 10px;
}
</style>

