<script setup>
import { ref, reactive, watch, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { addDefense, updateDefense, getDefenseFileInfo, downloadDefenseFile } from '@/api/defense'
import { getStudentList } from '@/api/student'
import { getTopicList } from '@/api/topic'
import { getPaperList } from '@/api/defense-material'
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
const topicList = ref([])
const paperList = ref([])

// 答辩文件信息
const defenseFile = ref(null)

const formData = reactive({
  defense_information_id: 0,
  thesis_title: '',
  paper_type: '',
  defense_student: null,
  defense_time: '',
  venue_of_defense: '',
  defense_notice: '',
  defense_status: '待安排',
  defense_results: '',
  // 关联答辩题目和答辩材料信息
  topic_id: null,
  paper_id: null
})

const getDialogTitle = computed(() => {
  switch (props.mode) {
    case 'view':
      return '查看答辩'
    case 'edit':
      return '编辑答辩'
    default:
      return '新增答辩'
  }
})

const rules = {
  thesis_title: [
    { required: true, message: '请输入答辩题目', trigger: 'blur' }
  ],
  paper_type: [
      { required: true, message: '请选择材料类型', trigger: 'change' }
    ],
  defense_student: [
    { required: true, message: '请选择答辩学生', trigger: 'change' }
  ],
  defense_time: [
    { required: true, message: '请选择答辩时间', trigger: 'change' }
  ],
  venue_of_defense: [
    { required: true, message: '请选择答辩地点', trigger: 'change' }
  ],
  defense_status: [
    { required: true, message: '请选择答辩状态', trigger: 'change' }
  ],
  topic_id: [
      { required: false, message: '请选择关联答辩题目', trigger: 'change' }
    ],
  paper_id: [
      { required: false, message: '请选择关联答辩材料', trigger: 'change' }
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

// 获取答辩题目列表
const loadTopicList = async () => {
  try {
    const res = await getTopicList({ page: 1, size: 1000 })
    if (res.result && res.result.list) {
      topicList.value = res.result.list
    }
  } catch (error) {
    console.error('获取答辩题目列表失败:', error)
    ElMessage.error('获取答辩题目列表失败')
  }
}

// 获取答辩材料列表
const loadPaperList = async () => {
  try {
    const res = await getPaperList({ page: 1, size: 1000 })
    if (res.result && res.result.list) {
      paperList.value = res.result.list
    }
  } catch (error) {
    console.error('获取答辩材料列表失败:', error)
    ElMessage.error('获取答辩材料列表失败')
  }
}

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.data) {
    Object.assign(formData, props.data)
    // 加载答辩文件信息
    setTimeout(() => {
      loadDefenseFileInfo()
    }, 0)
  } else if (val) {
    // 重置表单
    resetForm()
    defenseFile.value = null
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 加载答辩文件信息
const loadDefenseFileInfo = async () => {
  try {
    if (formData.defense_information_id) {
      const res = await getDefenseFileInfo(formData.defense_information_id)
      if (res.result) {
        defenseFile.value = res.result
      } else {
        defenseFile.value = null
      }
    } else {
      defenseFile.value = null
    }
  } catch (error) {
    console.error('获取答辩文件信息失败:', error)
    defenseFile.value = null
  }
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 下载文件
const handleDownloadFile = async () => {
  try {
    if (defenseFile.value && defenseFile.value.file_id) {
      const response = await downloadDefenseFile(defenseFile.value.file_id)
      const blob = new Blob([response.data], { type: response.headers['content-type'] })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      // 检查文件名是否已包含扩展名，避免重复添加
      const hasExtension = /\.[^.]+$/.test(defenseFile.value.file_name)
      const fileName = hasExtension ? defenseFile.value.file_name : defenseFile.value.file_name
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      ElMessage.success('文件下载成功')
    }
  } catch (error) {
    console.error('文件下载失败:', error)
    ElMessage.error('文件下载失败，请重试')
  }
}

// 组件挂载时加载数据列表
onMounted(() => {
  loadStudentList()
  loadTopicList()
  loadPaperList()
})

const resetForm = () => {
  Object.assign(formData, {
    defense_information_id: 0,
    thesis_title: '',
    paper_type: '',
    defense_student: null,
    defense_time: '',
    venue_of_defense: '',
    defense_notice: '',
    defense_status: '待安排',
    defense_results: '',
    topic_id: null,
    paper_id: null
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
        // 根据答辩题目和答辩材料信息自动填充部分内容
        if (formData.topic_id) {
          const selectedTopic = topicList.value.find(topic => topic.topic_information_id === formData.topic_id);
          if (selectedTopic) {
            formData.thesis_title = selectedTopic.thesis_title;
          }
        }
        
        if (formData.paper_id) {
          const selectedPaper = paperList.value.find(paper => paper.paper_information_id === formData.paper_id);
          if (selectedPaper) {
            formData.paper_type = selectedPaper.paper_type;
          }
        }
        
        if (formData.defense_information_id) {
          await updateDefense(formData.defense_information_id, formData)
          ElMessage.success('更新成功')
        } else {
          await addDefense(formData)
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
          <el-form-item label="材料类型" prop="paper_type">
            <el-select v-model="formData.paper_type" placeholder="请选择材料类型" style="width: 100%">
              <el-option label="学术材料" value="学术论文" />
              <el-option label="技术报告" value="技术报告" />
              <el-option label="研究材料" value="研究论文" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="答辩学生" prop="defense_student">
            <el-select v-model="formData.defense_student" placeholder="请选择答辩学生" style="width: 100%">
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
          <el-form-item label="关联答辩题目" prop="topic_id">
            <el-select v-model="formData.topic_id" placeholder="请选择关联答辩题目" style="width: 100%">
              <el-option 
                v-for="topic in topicList" 
                :key="topic.topic_information_id" 
                :label="topic.thesis_title" 
                :value="topic.topic_information_id" 
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="关联答辩材料" prop="paper_id">
            <el-select v-model="formData.paper_id" placeholder="请选择关联答辩材料" style="width: 100%">
              <el-option 
                v-for="paper in paperList" 
                :key="paper.paper_information_id" 
                :label="paper.thesis_title" 
                :value="paper.paper_information_id" 
              />
            </el-select>
          </el-form-item>
        </el-col>
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
      </el-row>
      
      <el-row :gutter="20">
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
        <el-col :span="12">
          <el-form-item label="答辩状态" prop="defense_status">
            <el-select v-model="formData.defense_status" placeholder="请选择答辩状态" style="width: 100%">
              <el-option label="待安排" value="待安排" />
              <el-option label="已安排" value="已安排" />
              <el-option label="已完成" value="已完成" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item label="答辩结果" prop="defense_results">
        <el-input v-model="formData.defense_results" placeholder="请输入答辩结果" />
      </el-form-item>
      
      <el-form-item label="答辩须知" prop="defense_notice">
        <el-input
          v-model="formData.defense_notice"
          type="textarea"
          :rows="3"
          placeholder="请输入答辩须知"
        />
      </el-form-item>
      
      <!-- 答辩文件信息 -->
      <el-divider>答辩文件</el-divider>
      <div v-if="defenseFile" style="padding: 10px; border: 1px solid #ebeef5; border-radius: 4px;">
        <el-descriptions :column="2" size="small">
          <el-descriptions-item label="文件名">{{ defenseFile.file_name }}</el-descriptions-item>
          <el-descriptions-item label="文件大小">{{ formatFileSize(defenseFile.file_size) }}</el-descriptions-item>
          <el-descriptions-item label="上传时间">{{ defenseFile.upload_time }}</el-descriptions-item>
          <el-descriptions-item>
            <el-button type="primary" link @click="handleDownloadFile">下载文件</el-button>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <div v-else style="padding: 10px; color: #909399;">
        学生尚未上传答辩文件
      </div>
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

