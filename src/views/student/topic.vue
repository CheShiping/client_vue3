<template>
  <div class="student-topic-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>我的答辩题目</span>
        </div>
      </template>
      
      <div v-if="selectedTopic">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="答辩题目">{{ selectedTopic.thesis_title }}</el-descriptions-item>
          <el-descriptions-item label="题目类型">{{ selectedTopic.question_type }}</el-descriptions-item>
          <el-descriptions-item label="指导教师">{{ getTeacherName(selectedTopic.instructor) }}</el-descriptions-item>
          <el-descriptions-item label="答辩题目状态">
            <el-tag 
              :type="selectedTopic.topic_status === '已满' ? 'danger' : 
                      selectedTopic.topic_status === '已选' ? 'success' : 
                      selectedTopic.topic_status === '开放' ? 'primary' : 'info'">
              {{ selectedTopic.topic_status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="答辩题目选择时间">{{ selectedTopic.topic_selection_time }}</el-descriptions-item>
          <el-descriptions-item label="答辩时间">{{ selectedTopic.defense_time || '未安排' }}</el-descriptions-item>
          <el-descriptions-item label="答辩地点">{{ selectedTopic.venue_of_defense || '未安排' }}</el-descriptions-item>
          <el-descriptions-item label="答辩状态">{{ selectedTopic.defense_status || '未安排' }}</el-descriptions-item>
          <el-descriptions-item label="答辩题目备注">{{ selectedTopic.topic_notes }}</el-descriptions-item>
        </el-descriptions>
        
        <!-- 新增：答辩文件上传区域 -->
        <div style="margin-top: 20px;">
          <el-divider>答辩文件</el-divider>
          <div v-if="defenseFile">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="文件名">{{ defenseFile.file_name }}</el-descriptions-item>
              <el-descriptions-item label="文件大小">{{ formatFileSize(defenseFile.file_size) }}</el-descriptions-item>
              <el-descriptions-item label="上传时间">{{ defenseFile.upload_time }}</el-descriptions-item>
              <el-descriptions-item>
                <el-button type="primary" link @click="handleDownloadFile">下载文件</el-button>
                <el-button type="warning" link @click="showUploadFile = true">重新上传</el-button>
              </el-descriptions-item>
            </el-descriptions>
          </div>
          <div v-else>
            <el-upload
              ref="uploadRef"
              class="upload-demo"
              :auto-upload="false"
              :before-upload="handleBeforeUpload"
              accept=".pdf,.doc,.docx,.zip,.rar"
              :on-change="handleFileChange"
            >
              <el-button type="primary">选择答辩文件</el-button>
              <template #tip>
                <div class="el-upload__tip">
                  支持上传 PDF、Word 文档、压缩文件，单个文件不超过 50MB
                </div>
              </template>
            </el-upload>
            <el-button type="success" style="margin-top: 10px;" @click="handleUpload" :disabled="!selectedFile">
              确认上传
            </el-button>
          </div>
        </div>
        
        <div style="margin-top: 20px; text-align: center;">
          <el-button type="warning" @click="handleUnselect" :loading="isSelecting">取消选择答辩题目</el-button>
        </div>
      </div>
      <div v-else>
        <el-empty description="您尚未选择任何答辩题目" />
        <div style="text-align: center;">
          <el-button type="primary" @click="goToTopicList">前往选择答辩题目</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getTopicList, getStudentSelectedTopic, unselectTopic } from '@/api/topic'
import { getTeacherList } from '@/api/teacher'
import { getStudentByUserId } from '@/api/student'
import { uploadDefenseFile, downloadDefenseFile, getDefenseFileInfo } from '@/api/defense'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const selectedTopic = ref(null)
const teacherList = ref([])
const isSelecting = ref(false)
const currentStudentId = ref(null)

// 答辩文件相关
const defenseFile = ref(null)
const uploadRef = ref(null)
const showUploadFile = ref(false)
const defenseId = ref(null)
const selectedFile = ref(null)
const uploadLoading = ref(false)

// 获取教师列表
const loadTeacherList = async () => {
  try {
    const res = await getTeacherList({ page: 1, size: 1000 })
    if (res.result && res.result.list) {
      teacherList.value = res.result.list
    }
  } catch (error) {
    console.error('获取教师列表失败:', error)
  }
}

// 获取当前学生ID
const loadCurrentStudentId = async () => {
  try {
    const res = await getStudentByUserId(userStore.userInfo.user_id)
    if (res && res.result && res.result.student_users_id) {
      currentStudentId.value = res.result.student_users_id
      return res.result.student_users_id
    }
    return null
  } catch (error) {
    console.error('获取学生信息失败:', error)
    return null
  }
}

// 获取教师姓名
const getTeacherName = (teacherId) => {
  const teacher = teacherList.value.find(t => t.teacher_users_id === teacherId)
  return teacher ? teacher.teachers_name : '未知教师'
}

// 加载学生已选择的题目
const loadSelectedTopic = async () => {
  try {
    // 先获取当前学生ID
    const studentId = await loadCurrentStudentId()
    if (!studentId) {
      console.error('无法获取当前学生ID')
      return
    }
    
    // 使用新的API获取学生已选择的题目
    const res = await getStudentSelectedTopic(studentId)
    if (res && res.result) {
      selectedTopic.value = res.result
    }
  } catch (error) {
    console.error('获取已选题目失败:', error)
    ElMessage.error('获取已选答辩题目失败')
  }
}

// 取消选择题目
const handleUnselect = async () => {
  try {
    await ElMessageBox.confirm('确定要取消选择这个答辩题目吗？取消后您可以选择其他答辩题目。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    isSelecting.value = true;
    
    if (selectedTopic.value) {
      const res = await unselectTopic(selectedTopic.value.topic_information_id);
      if (res.result) {
        ElMessage.success('取消选择答辩题目成功');
        selectedTopic.value = null; // 清空已选答辩题目
      } else {
        ElMessage.error(res.error?.message || '取消选择答辩题目失败');
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消选择失败:', error)
      ElMessage.error(error?.response?.data?.error?.message || '取消选择失败')
    }
  } finally {
    isSelecting.value = false;
  }
}

// 跳转到选题列表
const goToTopicList = () => {
  router.push('/topic/list')
}

// 加载答辩文件信息
const loadDefenseFileInfo = async () => {
  try {
    if (selectedTopic.value && selectedTopic.value.defense_id) {
      defenseId.value = selectedTopic.value.defense_id
      const res = await getDefenseFileInfo(selectedTopic.value.defense_id)
      if (res.result) {
        defenseFile.value = res.result
      }
    }
  } catch (error) {
    console.error('获取答辩文件信息失败:', error)
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

// 文件选择处理
const handleFileChange = (file) => {
  selectedFile.value = file.raw
  return false // 阻止自动上传
}

// 文件上传前检查
const handleBeforeUpload = (file) => {
  const isLt50M = file.size / 1024 / 1024 < 50
  if (!isLt50M) {
    ElMessage.error('上传文件大小不能超过 50MB!')
    return false
  }
  return true
}

// 执行文件上传
const handleUpload = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }
  
  if (!defenseId.value) {
    ElMessage.error('获取答辩ID失败，请刷新页面重试')
    return
  }
  
  try {
    uploadLoading.value = true
    const response = await uploadDefenseFile(defenseId.value, selectedFile.value)
    if (response.result) {
      defenseFile.value = response.result
      selectedFile.value = null
      ElMessage.success('文件上传成功')
    }
  } catch (error) {
    console.error('文件上传失败:', error)
    ElMessage.error('文件上传失败，请重试')
  } finally {
    uploadLoading.value = false
  }
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
      link.download = defenseFile.value.file_name
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

onMounted(async () => {
  await loadTeacherList()
  await loadSelectedTopic()
  await loadDefenseFileInfo()
})
</script>

<style scoped>
.student-topic-container {
  padding: 20px;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}
</style>