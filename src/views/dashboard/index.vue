<template>
  <div class="dashboard">
    <div class="page-header">
      <h1>欢迎回来</h1>
      <p>这里是您的答辩管理系统仪表盘</p>
    </div>
    
    <el-row :gutter="24" style="margin-top: 24px">
      <el-col :span="6" v-for="stat in statistics" :key="stat.title">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" :style="{ backgroundColor: stat.color }">
              <el-icon :size="36">
                <component :is="stat.icon" />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-title">{{ stat.title }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="24" style="margin-top: 24px">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title">最近通知</span>
            </div>
          </template>
          <div class="notice-list">
            <div v-if="recentNotices.length === 0" class="empty-notice">
              <el-empty description="暂无通知" :image-size="80" />
            </div>
            <el-timeline v-else>
              <el-timeline-item 
                v-for="notice in recentNotices" 
                :key="notice.notice_id"
                :timestamp="notice.create_time"
                placement="top"
              >
                <div class="notice-item" @click="viewNotice(notice)">
                  <h4>{{ notice.notice_title }}</h4>
                  <el-tag :type="getTagType(notice.type)" size="small" style="margin-top: 8px">{{ notice.type }}</el-tag>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title">待办事项</span>
            </div>
          </template>
          <div class="todo-list">
            <el-empty description="暂无待办事项" :image-size="100" />
          </div>
        </el-card>
        
        <el-card shadow="hover" style="margin-top: 24px">
          <template #header>
            <div class="card-header">
              <span class="header-title">快速操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button type="success" plain @click="goToDefenseList">
              <el-icon><ChatLineRound /></el-icon>
              答辩安排
            </el-button>
            <el-button type="info" plain @click="goToScoreList">
              <el-icon><Trophy /></el-icon>
              成绩查询
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 公告详情弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="currentNotice.notice_title"
      width="80%"
      top="50px"
      :close-on-click-modal="true"
      :close-on-press-escape="true"
    >
      <div class="notice-header">
        <el-tag :type="getTagType(currentNotice.type)">{{ currentNotice.type }}</el-tag>
        <span class="notice-time">{{ currentNotice.create_time }}</span>
      </div>
      <div class="notice-content" v-html="currentNotice.content"></div>
      <template #footer>
          <el-button @click="dialogVisible = false" type="primary" size="large">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import { Document, User, UserFilled, List, ChatLineRound, Trophy } from '@element-plus/icons-vue'
import { getStudentList } from '@/api/student'
import { getTeacherList } from '@/api/teacher'
import { getPaperList } from '@/api/paper'
import { getDefenseList } from '@/api/defense'
import { getNoticeList, getNoticeDetail } from '@/api/notice'
import { ElMessage } from 'element-plus'

const router = useRouter()

const statistics = ref([
  {
    title: '学生总数',
    value: 0,
    icon: markRaw(User),
    color: 'var(--primary-color)'
  },
  {
    title: '教师总数',
    value: 0,
    icon: markRaw(UserFilled),
    color: 'var(--success-color)'
  },
  {
    title: '论文总数',
    value: 0,
    icon: markRaw(Document),
    color: 'var(--warning-color)'
  },
  {
    title: '待答辩',
    value: 0,
    icon: markRaw(ChatLineRound),
    color: 'var(--danger-color)'
  }
])

const recentNotices = ref([])
const dialogVisible = ref(false)
const currentNotice = ref({
  notice_id: '',
  notice_title: '',
  content: '',
  notice_publisher: '',
  release_time: '',
  examine_state: '',
  recommend: 0,
  create_time: '',
  update_time: ''
})

const loadStatistics = async () => {
  try {
    // 加载统计数据
    const [studentRes, teacherRes, paperRes, defenseRes, noticeRes] = await Promise.all([
      getStudentList({ page: 1, size: 1 }),
      getTeacherList({ page: 1, size: 1 }),
      getPaperList({ page: 1, size: 1 }),
      getDefenseList({ page: 1, size: 1 }),
      getNoticeList({ page: 1, size: 10 })
    ])
    
    if (studentRes.result) {
      statistics.value[0].value = studentRes.result.total || 0
    }
    if (teacherRes.result) {
      statistics.value[1].value = teacherRes.result.total || 0
    }
    if (paperRes.result) {
      statistics.value[2].value = paperRes.result.total || 0
    }
    if (defenseRes.result) {
      statistics.value[3].value = defenseRes.result.total || 0
    }
    if (noticeRes.result) {
      recentNotices.value = noticeRes.result.list || []
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const getTagType = (type) => {
  const typeMap = {
    '公告': 'primary',
    '通知': 'success',
    '介绍': 'info',
    '联系': 'warning'
  }
  return typeMap[type] || 'primary'
}

const viewNotice = async (notice) => {  
  // 否则通过API获取详情
  try {
    const res = await getNoticeDetail(notice.notice_id)
    if (res.result) {
      currentNotice.value = res.result
      dialogVisible.value = true
    } else {
      ElMessage.error('获取公告详情失败')
    }
  } catch (error) {
    console.error('获取公告详情失败:', error)
    ElMessage.error('获取公告详情失败')
  }
}

// 快速操作方法
const goToDefenseList = () => {
  router.push('/defense-plan/list')
}

const goToScoreList = () => {
  router.push('/score/list')
}

onMounted(() => {
  loadStatistics()
})
</script>

<style lang="scss" scoped>
.dashboard {
  .page-header {
    margin-bottom: 8px;
    
    h1 {
      font-size: 32px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 8px;
    }
    
    p {
      font-size: 16px;
      color: var(--text-secondary);
      margin-bottom: 0;
    }
  }
  
  .stat-card {
    border-radius: 16px;
    transition: all 0.3s ease;
    height: 100%;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
    }
    
    .stat-content {
      display: flex;
      align-items: center;
      padding: 16px 0;
      
      .stat-icon {
        width: 80px;
        height: 80px;
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        margin-right: 24px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
      }
      
      .stat-info {
        flex: 1;
        
        .stat-value {
          font-size: 36px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 12px;
          line-height: 1;
        }
        
        .stat-title {
          font-size: 18px;
          color: var(--text-secondary);
          font-weight: 500;
        }
      }
    }
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .header-title {
      font-size: 20px;
      font-weight: 600;
      color: var(--text-primary);
    }
  }
  
  // 通知列表
  .notice-list {
    .empty-notice {
      padding: 40px 0;
    }
    
    :deep(.el-timeline) {
      padding: 0;
      
      .el-timeline-item {
        margin-bottom: 24px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .el-timeline-item__timestamp {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }
        
        .el-timeline-item__node {
          width: 12px;
          height: 12px;
          background-color: var(--primary-color);
        }
      }
    }
    
    .notice-item {
      cursor: pointer;
      padding: 20px;
      background-color: var(--bg-tertiary);
      border-radius: 12px;
      transition: all 0.3s ease;
      
      &:hover {
        background-color: var(--bg-secondary);
        transform: translateY(-2px);
      }
      
      h4 {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 0;
      }
    }
  }
  
  // 待办事项
  .todo-list {
    padding: 40px 0;
  }
  
  // 快速操作
  .quick-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    
    .el-button {
      width: 100%;
      height: 48px;
      font-size: 15px;
      font-weight: 500;
      border-radius: 12px;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-sm);
      }
    }
  }
}

.notice-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
  
  .notice-time {
    margin-left: 16px;
    color: var(--text-secondary);
    font-size: 14px;
  }
}

.notice-content {
  min-height: 300px;
  line-height: 1.8;
  font-size: 16px;
  color: var(--text-regular);
  padding: 0 8px;
}

// 响应式设计
@media (max-width: 1200px) {
  .dashboard {
    .el-row {
      .el-col {
        &:span-16,
        &:span-8 {
          width: 100%;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .dashboard {
    .page-header {
      h1 {
        font-size: 24px;
      }
      
      p {
        font-size: 14px;
      }
    }
    
    .el-row {
      .el-col {
        &:span-6 {
          width: 50%;
        }
      }
    }
  }
}
</style>