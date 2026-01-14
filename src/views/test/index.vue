<template>
  <div class="test-container">
    <h1>测试页面</h1>
    <p>这是一个简单的测试页面，用于验证应用基本功能是否正常工作。</p>
    <el-button type="primary" @click="goToLogin">前往登录页</el-button>
    <el-button type="success" @click="testApi">测试API请求</el-button>
    <div class="test-result" v-if="apiResult">
      <h3>API请求结果：</h3>
      <pre>{{ apiResult }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getUserInfo } from '@/api/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const apiResult = ref(null)

const goToLogin = () => {
  router.push('/login')
}

const testApi = async () => {
  try {
    const res = await getUserInfo()
    apiResult.value = JSON.stringify(res, null, 2)
    ElMessage.success('API请求成功')
  } catch (error) {
    apiResult.value = JSON.stringify(error, null, 2)
    ElMessage.error('API请求失败')
  }
}
</script>

<style lang="scss" scoped>
.test-container {
  padding: 20px;
  text-align: center;
  
  h1 {
    color: #333;
    margin-bottom: 20px;
  }
  
  p {
    color: #666;
    margin-bottom: 30px;
  }
  
  .el-button {
    margin: 0 10px;
  }
  
  .test-result {
    margin-top: 30px;
    text-align: left;
    padding: 20px;
    background-color: #f5f7fa;
    border-radius: 8px;
    max-height: 400px;
    overflow-y: auto;
    
    h3 {
      margin-bottom: 10px;
      color: #333;
    }
    
    pre {
      margin: 0;
      font-family: 'Courier New', Courier, monospace;
      font-size: 14px;
    }
  }
}
</style>