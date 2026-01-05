<template>
  <div class="notice-view">
    <el-card>
      <template #header>
        <div class="notice-header">
          <h2>{{ notice.title }}</h2>
          <div class="notice-meta">
            <el-tag :type="getTagType(notice.type)">{{ notice.type }}</el-tag>
            <span class="notice-time">{{ notice.create_time }}</span>
          </div>
        </div>
      </template>
      
      <div class="notice-content" v-html="notice.content"></div>
      
      <div class="notice-actions">
        <el-button @click="goBack">返回</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getNoticeDetail } from '@/api/notice'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const notice = ref({
  title: '',
  type: '',
  content: '',
  create_time: ''
})

const getTagType = (type) => {
  const typeMap = {
    '公告': 'primary',
    '通知': 'success',
    '介绍': 'info',
    '联系': 'warning'
  }
  return typeMap[type] || 'primary'
}

const goBack = () => {
  // 如果是从通知公告中心来的，返回到中心页面；否则返回到上一页
  if (router.options.history.state.back && router.options.history.state.back.includes('notice/center')) {
    router.push('/notice/center')
  } else {
    router.back()
  }
}

const loadNotice = async (id) => {
  try {
    const res = await getNoticeDetail(id)
    if (res.result) {
      notice.value = res.result
    } else {
      ElMessage.error('获取公告详情失败')
      router.back()
    }
  } catch (error) {
    console.error('获取公告详情失败:', error)
    ElMessage.error('获取公告详情失败')
    router.back()
  }
}

onMounted(() => {
  const noticeId = route.params.id
  if (noticeId) {
    loadNotice(noticeId)
  } else {
    ElMessage.error('参数错误')
    router.back()
  }
})
</script>

<style lang="scss" scoped>
.notice-view {
  max-width: 800px;
  margin: 0 auto;
  
  .notice-header {
    h2 {
      margin: 0 0 15px 0;
      font-size: 24px;
      color: #303133;
    }
    
    .notice-meta {
      display: flex;
      align-items: center;
      gap: 15px;
      
      .notice-time {
        color: #909399;
        font-size: 14px;
      }
    }
  }
  
  .notice-content {
    min-height: 300px;
    line-height: 1.8;
    font-size: 16px;
    
    :deep(h1), :deep(h2), :deep(h3) {
      margin: 20px 0 15px 0;
    }
    
    :deep(p) {
      margin: 15px 0;
    }
    
    :deep(ul), :deep(ol) {
      padding-left: 25px;
    }
    
    :deep(img) {
      max-width: 100%;
      height: auto;
    }
  }
  
  .notice-actions {
    margin-top: 30px;
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid #eee;
  }
}
</style>