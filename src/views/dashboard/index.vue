```vue
<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6" v-for="stat in statistics" :key="stat.title">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" :style="{ backgroundColor: stat.color }">
              <el-icon :size="30">
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

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近通知</span>
            </div>
          </template>
          <el-table :data="recentNotices" style="width: 100%" :show-header="false">
            <el-table-column prop="notice_title" label="标题">
              <template #default="scope">
                <el-link type="primary" @click="viewNotice(scope.row)">{{ scope.row.notice_title }}</el-link>
              </template>
            </el-table-column>
            <el-table-column prop="create_time" label="发布时间" width="180" />
          </el-table>
        </el-card>
        
        <!-- 公告详情弹窗 -->
        <el-dialog
          v-model="dialogVisible"
          :title="currentNotice.notice_title"
          width="60%"
          top="50px"
        >
          <div class="notice-detail">
            <div class="notice-meta" style="margin-bottom: 20px;">
              <el-tag :type="getTagType(currentNotice.type)" style="margin-right: 15px;">{{ currentNotice.type }}</el-tag>
              <span class="notice-time">{{ currentNotice.create_time }}</span>
            </div>
            <div class="notice-content" v-html="currentNotice.notice_content"></div>
          </div>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="dialogVisible = false">关闭</el-button>
            </span>
          </template>
        </el-dialog>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>待办事项</span>
            </div>
          </template>
          <el-empty description="暂无待办事项" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Document, User, List, ChatLineRound } from '@element-plus/icons-vue'
import { getStudentList } from '@/api/student'
import { getTeacherList } from '@/api/teacher'
import { getPaperList } from '@/api/paper'
import { getDefenseList } from '@/api/defense'
import { getNoticeList, getNoticeDetail } from '@/api/notice'
import { ElMessage } from 'element-plus'

const statistics = ref([
  {
    title: '学生总数',
    value: 0,
    icon: 'User',
    color: '#409EFF'
  },
  {
    title: '教师总数',
    value: 0,
    icon: 'UserFilled',
    color: '#67C23A'
  },
  {
    title: '论文总数',
    value: 0,
    icon: 'Document',
    color: '#E6A23C'
  },
  {
    title: '待答辩',
    value: 0,
    icon: 'ChatLineRound',
    color: '#F56C6C'
  }
])

const recentNotices = ref([])
const dialogVisible = ref(false)
const currentNotice = ref({
  notice_id: '',
  notice_title: '',
  notice_content: '',
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
      getNoticeList({ page: 1, size: 5 })
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
  // 如果通知对象中已经有完整内容，则直接显示
  if (notice.content) {
    currentNotice.value = notice
    dialogVisible.value = true
    return
  }
  
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

onMounted(() => {
  loadStatistics()
})
</script>

<style lang="scss" scoped>
.dashboard {
  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;
      
      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        margin-right: 15px;
      }
      
      .stat-info {
        flex: 1;
        
        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 5px;
        }
        
        .stat-title {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }
  
  .card-header {
    font-weight: bold;
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
</style>