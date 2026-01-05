<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>个人信息</span>
      </div>
    </template>
    
    <el-form :model="userForm" label-width="100px" style="max-width: 600px">
      <el-form-item label="用户名">
        <el-input v-model="userForm.username" disabled />
      </el-form-item>
      <el-form-item label="昵称">
        <el-input v-model="userForm.nickname" />
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="userForm.phone" />
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input v-model="userForm.email" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSave">保存</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { getUserInfo, updateUserInfo } from '@/api/user'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()

const userForm = reactive({
  username: '',
  nickname: '',
  phone: '',
  email: ''
})

const originalForm = ref({})
const loading = ref(false)

onMounted(async () => {
  await loadUserInfo()
})

const loadUserInfo = async () => {
  try {
    const res = await getUserInfo()
    if (res.result) {
      Object.assign(userForm, res.result)
      originalForm.value = { ...res.result }
      // 同步更新 store 中的用户信息
      userStore.setUserInfo(res.result)
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

const handleSave = async () => {
  loading.value = true
  try {
    const res = await updateUserInfo({
      nickname: userForm.nickname,
      phone: userForm.phone,
      email: userForm.email
    })
    if (res.result) {
      ElMessage.success('保存成功')
      originalForm.value = { ...userForm }
      // 同步更新 store
      userStore.setUserInfo({
        nickname: userForm.nickname,
        phone: userForm.phone,
        email: userForm.email
      })
    } else {
      ElMessage.error(res.error?.message || '保存失败')
    }
  } catch (error) {
    console.error('更新用户信息失败:', error)
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  Object.assign(userForm, originalForm.value)
}
</script>

<style lang="scss" scoped>
.card-header {
  font-weight: bold;
}
</style>

