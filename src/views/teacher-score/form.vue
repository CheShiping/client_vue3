<template>
  <div class="teacher-score-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>答辩评分</span>
          <el-button @click="$router.back()">返回</el-button>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="学生姓名">{{ studentInfo.student_name }}</el-descriptions-item>
        <el-descriptions-item label="学号">{{ studentInfo.student_no }}</el-descriptions-item>
        <el-descriptions-item label="答辩题目" :span="2">{{ studentInfo.thesis_title }}</el-descriptions-item>
        <el-descriptions-item label="答辩小组">{{ studentInfo.group_name }}</el-descriptions-item>
        <el-descriptions-item label="答辩时间">{{ studentInfo.defense_time }}</el-descriptions-item>
      </el-descriptions>

      <el-divider />

      <el-form :model="form" ref="formRef" label-width="150px" style="margin-top: 20px">
        <div v-for="criteria in criteriaList" :key="criteria.criteria_id" class="score-item">
          <el-card shadow="hover">
            <template #header>
              <div class="criteria-header">
                <span class="criteria-name">{{ criteria.criteria_name }}</span>
                <el-tag>权重: {{ criteria.weight }}%</el-tag>
                <el-tag type="info">满分: {{ criteria.full_score }}</el-tag>
              </div>
            </template>
            
            <el-form-item
              v-if="criteria.criteria_desc"
              label="评分说明"
              label-width="100px"
            >
              <div class="criteria-desc">{{ criteria.criteria_desc }}</div>
            </el-form-item>
            
            <el-form-item
              :label="`${criteria.criteria_name}得分`"
              :prop="`scores.${criteria.criteria_id}.score`"
              :rules="[
                { required: true, message: '请输入分数', trigger: 'blur' },
                { type: 'number', max: criteria.full_score, message: `分数不能超过${criteria.full_score}`, trigger: 'blur' }
              ]"
              label-width="100px"
            >
              <el-input-number
                v-model="form.scores[criteria.criteria_id].score"
                :min="0"
                :max="criteria.full_score"
                :precision="2"
                :step="0.5"
              />
            </el-form-item>
            
            <el-form-item
              label="评语"
              :prop="`scores.${criteria.criteria_id}.comment`"
              label-width="100px"
            >
              <el-input
                v-model="form.scores[criteria.criteria_id].comment"
                type="textarea"
                :rows="3"
                placeholder="请输入评语（选填）"
              />
            </el-form-item>
          </el-card>
        </div>

        <el-form-item style="margin-top: 30px">
          <el-button type="primary" @click="handleSubmit" :loading="submitting">提交评分</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()
const submitting = ref(false)

const studentInfo = reactive({
  student_name: '',
  student_no: '',
  thesis_title: '',
  group_name: '',
  defense_time: ''
})

const criteriaList = ref([])
const form = reactive({
  gs_id: route.query.gs_id,
  teacher_id: null as number | null,
  scores: {} as Record<number, { score: number; comment: string }>
})

const fetchStudentInfo = async () => {
  try {
    // 这里应该调用API获取学生信息
    // 暂时使用模拟数据
    Object.assign(studentInfo, {
      student_name: '张三',
      student_no: 'S20220001',
      thesis_title: '基于Vue3的答辩管理系统设计与实现',
      group_name: '第一答辩小组',
      defense_time: '2025-05-15 09:00'
    })
  } catch (error) {
    ElMessage.error('获取学生信息失败')
  }
}

const fetchCriteriaList = async () => {
  try {
    const plan_id = route.query.plan_id
    const response = await axios.get('/api/defense/criteria/list', {
      params: { plan_id }
    })
    
    if (response.data.result) {
      criteriaList.value = response.data.result.list
      
      // 初始化评分表单
      criteriaList.value.forEach((criteria: any) => {
        form.scores[criteria.criteria_id] = {
          score: 0,
          comment: ''
        }
      })
      
      // 如果是编辑，加载已有评分
      await loadExistingScores()
    }
  } catch (error) {
    ElMessage.error('获取评分标准失败')
  }
}

const loadExistingScores = async () => {
  try {
    const response = await axios.get(`/api/defense/score/${form.gs_id}`)
    
    if (response.data.result && response.data.result.scores) {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      const teacherScores = response.data.result.scores.filter(
        (s: any) => s.teacher_id === userInfo.teacher_id
      )
      
      teacherScores.forEach((score: any) => {
        if (form.scores[score.criteria_id]) {
          form.scores[score.criteria_id].score = parseFloat(score.score)
          form.scores[score.criteria_id].comment = score.comment || ''
        }
      })
    }
  } catch (error) {
    console.error('加载已有评分失败')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
        
        // 转换评分数据格式
        const scores = Object.entries(form.scores).map(([criteria_id, data]) => ({
          criteria_id: parseInt(criteria_id),
          score: data.score,
          comment: data.comment
        }))
        
        const response = await axios.post('/api/defense/score', {
          gs_id: form.gs_id,
          teacher_id: userInfo.teacher_id,
          scores
        })
        
        if (response.data.result) {
          ElMessage.success('评分提交成功')
          router.back()
        } else {
          ElMessage.error(response.data.error?.message || '提交失败')
        }
      } catch (error) {
        ElMessage.error('提交失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

onMounted(() => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  form.teacher_id = userInfo.teacher_id
  
  fetchStudentInfo()
  fetchCriteriaList()
})
</script>

<style scoped>
.teacher-score-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.score-item {
  margin-bottom: 20px;
}

.criteria-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.criteria-name {
  font-weight: bold;
  font-size: 16px;
}

.criteria-desc {
  color: #606266;
  line-height: 1.6;
}
</style>
