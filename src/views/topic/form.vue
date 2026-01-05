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
            <el-input v-model="formData.thesis_title" placeholder="请输入答辩题目" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="题目类型" prop="question_type">
            <el-select v-model="formData.question_type" placeholder="请选择题目类型" style="width: 100%">
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
          <el-form-item label="指导教师" prop="instructor">
            <el-select v-model="formData.instructor" placeholder="请选择指导教师" style="width: 100%" :disabled="mode !== 'add'">
              <el-option 
                v-for="teacher in teacherList" 
                :key="teacher.teacher_users_id" 
                :label="teacher.teachers_name" 
                :value="teacher.teacher_users_id" 
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="最大可选人数" prop="max_students">
            <el-input-number 
              v-model="formData.max_students" 
              :min="1" 
              :max="10" 
              placeholder="请输入最大可选人数" 
              style="width: 100%" 
              :disabled="mode !== 'add'"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="答辩题目选择时间" prop="topic_selection_time">
            <el-date-picker
              v-model="formData.topic_selection_time"
              type="date"
              placeholder="请选择答辩题目选择时间"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="题目状态" prop="question_status">
            <el-select v-model="formData.question_status" placeholder="请选择题目状态" style="width: 100%">
              <el-option label="开放" value="开放" />
              <el-option label="关闭" value="关闭" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <!-- 添加答辩相关信息 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="答辩时间" prop="defense_time">
            <el-date-picker
              v-model="formData.defense_time"
              type="date"
              placeholder="请选择答辩时间"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="答辩地点" prop="venue_of_defense">
            <el-select v-model="formData.venue_of_defense" placeholder="请选择答辩地点" style="width: 100%">
              <el-option label="软件大楼1204" value="软件大楼1204" />
              <el-option label="软件大楼1203" value="软件大楼1203" />
              <el-option label="软件大楼1208" value="软件大楼1208" />
              <el-option label="软件大楼708" value="软件大楼708" />
              <el-option label="软件大楼701" value="软件大楼701" />
              <el-option label="软件大楼705" value="软件大楼705" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="答辩状态" prop="defense_status">
            <el-select v-model="formData.defense_status" placeholder="请选择答辩状态" style="width: 100%">
              <el-option label="待安排" value="待安排" />
              <el-option label="已安排" value="已安排" />
              <el-option label="已完成" value="已完成" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="答辩结果" prop="defense_results">
            <el-input v-model="formData.defense_results" placeholder="请输入答辩结果" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item label="答辩题目状态" prop="topic_status">
        <el-select v-model="formData.topic_status" placeholder="请选择答辩题目状态" style="width: 100%">
          <el-option label="待选" value="待选" />
          <el-option label="开放" value="开放" />
          <el-option label="已满" value="已满" />
          <el-option label="已选" value="已选" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="答辩题目备注" prop="topic_notes">
        <el-input
          v-model="formData.topic_notes"
          type="textarea"
          :rows="3"
          placeholder="请输入答辩题目备注"
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
import { addTopic, updateTopic } from '@/api/topic'
import { getStudentList } from '@/api/student'
import { getTeacherList } from '@/api/teacher'

const props = defineProps({
  modelValue: Boolean,
  data: Object,
  mode: {
    type: String,
    default: 'add' // add, edit, view
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const visible = ref(false)
const formRef = ref(null)
const loading = ref(false)
const studentList = ref([])
const teacherList = ref([])

const formData = reactive({
  topic_information_id: 0,
  thesis_title: '',
  instructor: null,
  question_type: '',
  selected_students: null,
  topic_selection_time: '',
  question_status: '开放',
  topic_status: '开放', // 修改默认值为"开放"，表示可以被选择
  topic_notes: '',
  max_students: 5, // 默认最大可选人数为5
  // 添加答辩相关信息字段
  defense_time: '',
  venue_of_defense: '',
  defense_status: '待安排',
  defense_results: '',
  selected_students_count: 0 // 已选人数，新增时默认为0
})

const getDialogTitle = computed(() => {
  switch (props.mode) {
    case 'view':
      return '查看答辩题目'
    case 'edit':
      return '编辑答辩题目'
    default:
      return '发布答辩题目'
  }
})

const rules = {
  thesis_title: [
    { required: true, message: '请输入答辩题目', trigger: 'blur' }
  ],
  question_type: [
    { required: true, message: '请选择题目类型', trigger: 'change' }
  ],
  instructor: [
    { required: true, message: '请选择指导教师', trigger: 'change' }
  ],
  max_students: [
    { required: true, message: '请输入最大可选人数', trigger: 'blur' },
    { type: 'number', min: 1, max: 10, message: '最大可选人数必须在1-10之间', trigger: 'blur' }
  ],
  topic_selection_time: [
    { required: true, message: '请选择答辩题目选择时间', trigger: 'change' }
  ],
  question_status: [
    { required: true, message: '请选择题目状态', trigger: 'change' }
  ],
  topic_status: [
    { required: true, message: '请选择答辩题目状态', trigger: 'change' }
  ],
  // 添加答辩相关字段的验证规则
  defense_time: [
    { required: false, message: '请选择答辩时间', trigger: 'change' }
  ],
  venue_of_defense: [
    { required: false, message: '请选择答辩地点', trigger: 'change' }
  ],
  defense_status: [
    { required: false, message: '请选择答辩状态', trigger: 'change' }
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

// 获取教师列表
const loadTeacherList = async () => {
  try {
    const res = await getTeacherList({ page: 1, size: 1000 })
    if (res.result && res.result.list) {
      teacherList.value = res.result.list
    }
  } catch (error) {
    console.error('获取教师列表失败:', error)
    ElMessage.error('获取教师列表失败')
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

// 组件挂载时加载教师和学生列表
onMounted(async () => {
  await loadTeacherList();
  await loadStudentList();
})

const resetForm = () => {
  Object.assign(formData, {
    topic_information_id: 0,
    thesis_title: '',
    instructor: null,
    question_type: '',
    selected_students: null,
    topic_selection_time: '',
    question_status: '开放',
    topic_status: '开放',
    topic_notes: '',
    max_students: 5,
    // 重置答辩相关信息字段
    defense_time: '',
    venue_of_defense: '',
    defense_status: '待安排',
    defense_results: '',
    selected_students_count: 0
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
        if (formData.topic_information_id) {
          await updateTopic(formData.topic_information_id, formData)
          ElMessage.success('更新成功')
        } else {
          await addTopic(formData)
          ElMessage.success('发布成功')
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