<template>
  <div class="student-score-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>我的成绩</span>
        </div>
      </template>
      
      <el-table
        :data="tableData"
        v-loading="loading"
        style="width: 100%"
        stripe
      >
        <el-table-column prop="thesis_title" label="答辩题目" show-overflow-tooltip />
        <el-table-column prop="question_type" label="答辩类型" width="120" />
        <el-table-column prop="total_score" label="总分" width="80" sortable>
          <template #default="{ row }">
            <span :class="getScoreClass(row.total_score)">{{ row.total_score }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="report_score" label="报告分" width="80" sortable />
        <el-table-column prop="reply_score" label="答辩分" width="80" sortable />
        <el-table-column prop="award_and_excellence_evaluation" label="评奖评优" width="120">
          <template #default="{ row }">
            <el-tag :type="getTagType(row.award_and_excellence_evaluation)">
              {{ row.award_and_excellence_evaluation }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="release_time" label="发布时间" width="120" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 成绩详情弹窗 -->
    <el-dialog
      v-model="showDetail"
      title="成绩详情"
      width="800px"
      @close="handleDetailClose"
    >
      <el-form
        :model="detailData"
        label-width="120px"
        disabled
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="答辩题目">
              <el-input v-model="detailData.thesis_title" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="答辩类型">
              <el-input v-model="detailData.question_type" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="总分">
              <el-input v-model="detailData.total_score" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="报告分">
              <el-input v-model="detailData.report_score" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="答辩分">
              <el-input v-model="detailData.reply_score" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="评奖评优">
              <el-input v-model="detailData.award_and_excellence_evaluation" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发布时间">
              <el-input v-model="detailData.release_time" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="成绩详情">
          <el-input
            v-model="detailData.score_details"
            type="textarea"
            :rows="5"
            placeholder="暂无成绩详情"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showDetail = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getScoreList } from '@/api/score'
import { getStudentByUserId } from '@/api/student'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const tableData = ref([])
const loading = ref(false)
const showDetail = ref(false)

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const detailData = ref({
  thesis_title: '',
  question_type: '',
  release_time: '',
  award_and_excellence_evaluation: '',
  score_details: '',
  total_score: 0,
  report_score: 0,
  reply_score: 0
})

// 获取当前用户对应的学生ID
const getCurrentStudentId = async () => {
  try {
    const response = await getStudentByUserId(userStore.userInfo.user_id);
    if (response && response.result && response.result.student_users_id) {
      return response.result.student_users_id;
    }
    return null;
  } catch (error) {
    console.error('获取学生信息失败:', error);
    return null;
  }
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 获取当前登录学生ID
    const currentStudentId = await getCurrentStudentId();
    if (!currentStudentId) {
      ElMessage.error('无法获取学生信息');
      return;
    }
    
    const params = {
      page: pagination.page,
      size: pagination.size,
      defense_student: currentStudentId  // 只获取当前学生自己的成绩
    }
    
    const res = await getScoreList(params)
    if (res.result) {
      tableData.value = res.result.list || []
      pagination.total = res.result.total || 0
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleSizeChange = (val) => {
  pagination.size = val
  pagination.page = 1
  loadData()
}

const handleCurrentChange = (val) => {
  pagination.page = val
  loadData()
}

const getTagType = (evaluation) => {
  const typeMap = {
    '优秀': 'success',
    '良好': 'primary',
    '中等': 'warning',
    '及格': 'info',
    '不及格': 'danger'
  }
  return typeMap[evaluation] || 'info'
}

const getScoreClass = (score) => {
  if (score >= 90) return 'score-excellent'
  if (score >= 80) return 'score-good'
  if (score >= 70) return 'score-average'
  if (score >= 60) return 'score-pass'
  return 'score-fail'
}

const handleView = (row) => {
  // 验证当前用户是否有权限查看此条记录
  if (row.defense_student !== userStore.currentStudentId && 
      userStore.userInfo.user_group !== 'teacher' && 
      !userStore.isAdmin) {
    ElMessage.error('您没有权限查看此记录');
    return;
  }
  
  Object.assign(detailData.value, row)
  showDetail.value = true
}

const handleDetailClose = () => {
  detailData.value = {
    thesis_title: '',
    question_type: '',
    release_time: '',
    award_and_excellence_evaluation: '',
    score_details: '',
    total_score: 0,
    report_score: 0,
    reply_score: 0
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.student-score-list {
  padding: 20px;
  
  .card-header {
    font-weight: bold;
    font-size: 16px;
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
}
.score-excellent {
  color: #67C23A;
  font-weight: bold;
}
.score-good {
  color: #409EFF;
  font-weight: bold;
}
.score-average {
  color: #E6A23C;
}
.score-pass {
  color: #909399;
}
.score-fail {
  color: #F56C6C;
}
</style>