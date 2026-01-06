<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>修改密码</span>
      </div>
    </template>
    
    <el-form
      ref="passwordFormRef"
      :model="passwordForm"
      :rules="passwordRules"
      label-width="100px"
      style="max-width: 600px"
    >
      <el-form-item label="原密码" prop="oldPassword">
        <el-input
          v-model="passwordForm.oldPassword"
          type="password"
          show-password
          placeholder="请输入原密码"
        />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="passwordForm.newPassword"
          type="password"
          show-password
          placeholder="请输入新密码"
        />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="passwordForm.confirmPassword"
          type="password"
          show-password
          placeholder="请再次输入新密码"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          提交
        </el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { changePassword } from '@/api/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const passwordFormRef = ref(null)
const loading = ref(false)

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await changePassword({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        })
        if (res.result) {
          ElMessage.success('密码修改成功，请重新登录')
          setTimeout(() => {
            router.push('/login')
          }, 2000)
        } else {
          ElMessage.error(res.error?.message || '密码修改失败')
        }
      } catch (error) {
        console.error('修改密码错误:', error)
      } finally {
        loading.value = false
      }
    }
  })
}

const handleReset = () => {
  passwordFormRef.value?.resetFields()
}
</script>

<style lang="scss" scoped>
.card-header {
  font-weight: bold;
}
</style>

