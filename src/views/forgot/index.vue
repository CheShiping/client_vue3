<template>
  <div class="forgot-container">
    <div class="forgot-box">
      <div class="forgot-header">
        <h2>忘记密码</h2>
        <p>请输入您的用户名和邮箱来重置密码</p>
      </div>
      
      <el-form
        ref="forgotFormRef"
        :model="forgotForm"
        :rules="forgotRules"
        class="forgot-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="forgotForm.username"
            placeholder="请输入用户名"
            size="large"
            prefix-icon="User"
            clearable
          />
        </el-form-item>
        
        <el-form-item prop="email">
          <el-input
            v-model="forgotForm.email"
            placeholder="请输入邮箱"
            size="large"
            prefix-icon="Message"
            clearable
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleSubmit"
            class="submit-button"
          >
            提交
          </el-button>
        </el-form-item>
        
        <div class="forgot-footer">
          <el-link type="primary" @click="$router.push('/login')">
            返回登录
          </el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { forgotPassword } from '@/api/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const forgotFormRef = ref(null)
const loading = ref(false)

const forgotForm = reactive({
  username: '',
  email: ''
})

const forgotRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!forgotFormRef.value) return
  
  await forgotFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await forgotPassword(forgotForm)
        if (res.result) {
          ElMessage.success('重置密码邮件已发送，请查收')
          setTimeout(() => {
            router.push('/login')
          }, 2000)
        } else {
          ElMessage.error(res.error?.message || '提交失败')
        }
      } catch (error) {
        console.error('提交错误:', error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.forgot-container {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.forgot-box {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.forgot-header {
  text-align: center;
  margin-bottom: 30px;
  
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

.forgot-form {
  .submit-button {
    width: 100%;
    margin-top: 10px;
  }
}

.forgot-footer {
  text-align: right;
  margin-top: 10px;
}
</style>

