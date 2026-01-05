<template>
  <div class="loading-page">
    <el-result icon="info" title="页面跳转中" :sub-title="`正在前往 ${targetPath} 页面...`">
      <template #icon>
        <div class="loading-spinner">
          <el-icon :size="40" color="#409eff">
            <Loading />
          </el-icon>
        </div>
      </template>
      <template #extra>
        <el-button type="primary" @click="goToTarget" size="small">
          立即跳转
        </el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Loading } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const targetPath = ref('首页')

onMounted(() => {
  // 获取目标路径
  if (route.query.target && route.query.target !== '/') {
    targetPath.value = route.query.target
  } else {
    targetPath.value = '首页'
  }
  
  // 2秒后自动跳转到目标页面
  setTimeout(() => {
    goToTarget()
  }, 2000)
})

const goToTarget = () => {
  if (route.query.target) {
    router.push(route.query.target)
  } else {
    router.push('/')
  }
}
</script>

<style lang="scss" scoped>
.loading-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.loading-spinner {
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>