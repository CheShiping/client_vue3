<template>
  <el-dialog
    v-model="visible"
    :title="getDialogTitle"
    width="800px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
      :disabled="mode === 'view'"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="答辩题目" prop="thesis_title">
            <el-input v-model="formData.thesis_title" placeholder="请输入答辩题目" :disabled="isTeacherEditing" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="题目类型" prop="question_type">
            <el-select v-model="formData.question_type" placeholder="请选择题目类型" style="width: 100%" :disabled="isTeacherEditing">
              <el-option label="理论研究" value="理论研究" />
              <el-option label="应用研究" value="应用研究" />
              <el-option label="工程设计" value="工程设计" />
              <el-option label="软件开发" value="软件开发" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="答辩学生" prop="defense_student">
            <el-select v-model="formData.defense_student" placeholder="请选择答辩学生" style="width: 100%" :disabled="isTeacherEditing">
              <el-option 
                v-for="student in studentList" 
                :key="student.student_users_id" 
                :label="student.student_name" 
                :value="student.student_users_id" 
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="发布时间" prop="release_time">
            <el-date-picker
              v-model="formData.release_time"
              type="date"
              placeholder="请选择发布时间"
              style="width: 100%"
              value-format="YYYY-MM-DD"
              :disabled="isTeacherEditing"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item label="评奖评优" prop="award_and_excellence_evaluation">
        <el-select v-model="formData.award_and_excellence_evaluation" placeholder="请选择评奖评优等级" style="width: 100%" :disabled="mode === 'view'">
          <el-option label="优秀" value="优秀" />
          <el-option label="良好" value="良好" />
          <el-option label="中等" value="中等" />
          <el-option label="及格" value="及格" />
          <el-option label="不及格" value="不及格" />
        </el-select>
      </el-form-item>
      
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="报告分" prop="report_score">
            <el-input-number
              v-model="formData.report_score"
              :min="0"
              :max="50"
              placeholder="请输入报告分"
              :disabled="mode === 'view'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="答辩分" prop="reply_score">
            <el-input-number
              v-model="formData.reply_score"
              :min="0"
              :max="50"
              placeholder="请输入答辩分"
              :disabled="mode === 'view'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="总分" prop="total_score">
            <el-input-number
              v-model="formData.total_score"
              :min="0"
              :max="100"
              placeholder="请输入总分"
              :disabled="mode === 'view'"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="答辩评语" prop="defense_comments">
        <el-input
          v-model="formData.defense_comments"
          type="textarea"
          :rows="3"
          placeholder="请输入答辩评语"
          :disabled="mode === 'view'"
        />
      </el-form-item>

      <el-form-item label="成绩详情" prop="score_details">
        <el-input
          v-model="formData.score_details"
          type="textarea"
          :rows="3"
          placeholder="请输入成绩详情"
          :disabled="mode === 'view'"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="handleClose" v-if="mode !== 'view'">取消</el-button>
      <el-button @click="handleClose" v-else>关闭</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit" v-if="mode !== 'view'">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { addScore, updateScore } from '@/api/score'
import { getStudentList } from '@/api/student'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  modelValue: Boolean,
  data: Object,
  mode: {
    type: String,
    default: 'add' // add, edit, view
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const userStore = useUserStore()

const visible = ref(false)
const formRef = ref(null)
const loading = ref(false)
const studentList = ref([])

const formData = reactive({
  score_information_id: 0,
  thesis_title: '',
  question_type: '',
  defense_student: null,
  release_time: '',
  award_and_excellence_evaluation: '',
  score_details: '',
  // 新增教师打分相关字段
  report_score: 0,
  reply_score: 0,
  total_score: 0,
  defense_comments: ''
})

// 判断是否为教师编辑模式
const isTeacherEditing = computed(() => {
  return userStore.userInfo.user_group === 'teacher' && props.mode === 'edit'
})

const getDialogTitle = computed(() => {
  switch (props.mode) {
    case 'view':
      return '查看成绩'
    case 'edit':
      return '编辑成绩'
    default:
      return '新增成绩'
  }
})

const rules = {
  thesis_title: [
    { required: true, message: '请输入答辩题目', trigger: 'blur' }
  ],
  question_type: [
    { required: true, message: '请选择题目类型', trigger: 'change' }
  ],
  defense_student: [
    { required: true, message: '请选择答辩学生', trigger: 'change' }
  ],
  release_time: [
    { required: true, message: '请选择发布时间', trigger: 'change' }
  ],
  award_and_excellence_evaluation: [
    { required: true, message: '请选择评奖评优等级', trigger: 'change' }
  ]
}

// 获取学生列表
const loadStudentList = async () => {
  try {
    const res = await getStudentList({ page: 1, size: 1000 })
    if (res.result && res.result.list) {
      studentList.value = res.result.list
    }
  } catch (error) {
    console.error('获取学生列表失败:', error)
    ElMessage.error('获取学生列表失败')
  }
}

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.data) {
    Object.assign(formData, props.data)
  } else if (val) {
    // 重置表单
    resetForm()
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 组件挂载时加载学生列表
onMounted(() => {
  loadStudentList()
})

const resetForm = () => {
  Object.assign(formData, {
    score_information_id: 0,
    thesis_title: '',
    question_type: '',
    defense_student: null,
    release_time: '',
    award_and_excellence_evaluation: '',
    score_details: '',
    report_score: 0,
    reply_score: 0,
    total_score: 0,
    defense_comments: ''
  })
}

const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 如果是教师编辑模式，自动计算总分
        if (userStore.userInfo.user_group === 'teacher' && props.mode === 'edit') {
          formData.total_score = formData.report_score + formData.reply_score
        }
        
        if (formData.score_information_id) {
          await updateScore(formData.score_information_id, formData)
          ElMessage.success('更新成功')
        } else {
          await addScore(formData)
          ElMessage.success('新增成功')
        }
        emit('success')
        handleClose()
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error('操作失败')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>