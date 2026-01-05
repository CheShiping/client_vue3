<template>
  <div class="student-defense-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>我的答辩材料</span>
        </div>
      </template>
      
      <el-table
        :data="tableData"
        v-loading="loading"
        style="width: 100%"
        stripe
      >
        <el-table-column prop="thesis_title" label="答辩题目" show-overflow-tooltip />
        <el-table-column prop="paper_type" label="材料类型" width="120" />
        <el-table-column prop="upload_time" label="上传时间" width="120" />
        <el-table-column prop="thesis_evaluation" label="评优等级" width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="primary" link @click="handleDownload(row)">下载</el-button>
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
    
    <!-- 答辩详情/编辑弹窗 -->
    <el-dialog
      v-model="showForm"
      :title="formMode === 'view' ? '查看答辩材料' : '编辑答辩材料'"
      width="800px"
      @close="handleFormClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formMode === 'view' ? {} : rules"
        label-width="120px"
        :disabled="formMode === 'view'"
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
                <el-option label="综述材料" value="综述论文" />
                <el-option label="研究材料" value="研究论文" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="指导教师">
              <el-select v-model="formData.instructor" placeholder="请选择指导教师" style="width: 100%" disabled>
                <el-option 
                  v-for="teacher in teachers" 
                  :key="teacher.teacher_users_id" 
                  :label="teacher.teachers_name" 
                  :value="teacher.teacher_users_id" 
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上传时间" prop="upload_time">
              <el-date-picker
                v-model="formData.upload_time"
                type="date"
                placeholder="请选择上传时间"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="评优等级" prop="thesis_evaluation">
              <el-select v-model="formData.thesis_evaluation" placeholder="请选择评优等级" style="width: 100%">
                <el-option label="优秀" value="优秀" />
                <el-option label="良好" value="良好" />
                <el-option label="中等" value="中等" />
                <el-option label="及格" value="及格" />
                <el-option label="不及格" value="不及格" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="指导教师意见">
          <el-input
            v-model="formData.teachers_opinion"
            type="textarea"
            :rows="3"
            placeholder="暂无指导教师意见"
            readonly
          />
        </el-form-item>
        
        <el-form-item label="材料评语">
          <el-input
            v-model="formData.paper_comments"
            type="textarea"
            :rows="3"
            placeholder="暂无材料评语"
            readonly
          />
        </el-form-item>
        
        <el-form-item label="答辩材料附件" prop="paper_attachment">
          <div class="file-upload-container">
            <el-input 
              v-model="formData.paper_attachment" 
              placeholder="请选择附件文件"
              :readonly="true"
            >
              <template #append>
                <el-upload
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleFileChange"
                  :before-upload="beforeFileUpload"
                  accept=".pdf,.doc,.docx,.zip,.rar"
                  action=""
                >
                  <el-button :disabled="formMode === 'view'">选择文件</el-button>
                </el-upload>
              </template>
            </el-input>
            
            <!-- 显示已选择的文件 -->
            <div v-if="selectedFile" class="selected-file-info">
              <span class="file-name">{{ selectedFile.name }}</span>
              <span class="file-size">({{ formatFileSize(selectedFile.size) }})</span>
              <el-button 
                v-if="formMode !== 'view'" 
                type="danger" 
                link 
                @click="clearSelectedFile"
              >
                清除
              </el-button>
            </div>
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showForm = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleSubmit" 
          :loading="submitLoading"
          v-if="formMode !== 'view'"
        >
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPaperList, updatePaper, getPaperDetail, addPaper } from '@/api/defense-material'
import { getTeacherList } from '@/api/teacher'
import { getStudentByUserId } from '@/api/student'
import { downloadDefenseFile } from '@/api/defense'
import { uploadFile } from '@/api/file'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const tableData = ref([])
const loading = ref(false)
const submitLoading = ref(false)
const showForm = ref(false)
const formRef = ref(null)
const formMode = ref('view') // view 或 edit

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const formData = reactive({
  paper_information_id: 0,
  thesis_title: '',
  instructor: null,
  paper_type: '',
  upload_students: null,
  upload_time: '',
  paper_attachment: '',
  thesis_evaluation: '',
  teachers_opinion: '',
  paper_comments: ''
})

// 添加文件相关响应式变量
const selectedFile = ref(null)

const teachers = ref([])

const rules = {
  thesis_title: [
    { required: true, message: '请输入答辩题目', trigger: 'blur' }
  ],
  paper_type: [
    { required: true, message: '请选择材料类型', trigger: 'change' }
  ],
  upload_time: [
    { required: true, message: '请选择上传时间', trigger: 'change' }
  ]
}

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
    // 获取教师列表
    const teacherRes = await getTeacherList({ page: 1, size: 100 })
    if (teacherRes.result) {
      teachers.value = teacherRes.result.list || []
    }
    
    // 获取当前登录学生ID
    const currentStudentId = await getCurrentStudentId();
    if (!currentStudentId) {
      ElMessage.error('无法获取学生信息');
      return;
    }
    
    // 设置当前学生ID到userStore
    userStore.currentStudentId = currentStudentId;
    
    // 获取答辩列表
    const params = {
      page: pagination.page,
      size: pagination.size,
      upload_students: currentStudentId  // 只获取当前学生自己的数据
    }
    
    const res = await getPaperList(params)
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

const handleView = async (row) => {
  // 验证当前用户是否有权限查看此条记录
  const currentStudentId = await getCurrentStudentId();
  if (row.upload_students !== currentStudentId) {
    ElMessage.error('您没有权限查看此记录');
    return;
  }
  
  try {
    const res = await getPaperDetail(row.paper_information_id)
    if (res.result) {
      Object.assign(formData, res.result)
      formMode.value = 'view'
      showForm.value = true
    }
  } catch (error) {
    console.error('获取答辩详情失败:', error)
    ElMessage.error('获取答辩详情失败')
  }
}

const handleEdit = async (row) => {
  // 验证当前用户是否有权限编辑此条记录
  const currentStudentId = await getCurrentStudentId();
  if (row.upload_students !== currentStudentId) {
    ElMessage.error('您没有权限编辑此记录');
    return;
  }
  
  try {
    const res = await getPaperDetail(row.paper_information_id)
    if (res.result) {
      Object.assign(formData, res.result)
      formMode.value = 'edit'
      showForm.value = true
    }
  } catch (error) {
    console.error('获取答辩详情失败:', error)
    ElMessage.error('获取答辩详情失败')
  }
}

const handleDownload = async (row) => {
  console.log('学生端下载文件:', row)
  // 验证当前用户是否有权限下载此文件
  // 学生只能下载自己的文件，教师和管理员可以下载所有文件
  if (userStore.userInfo.user_group === 'student') {
    // 确保currentStudentId已设置
    const currentStudentId = await getCurrentStudentId();
    console.log('当前学生ID:', currentStudentId, '文件所属学生ID:', row.upload_students)
    if (row.upload_students !== currentStudentId) {
      ElMessage.error('您没有权限下载此文件');
      return;
    }
    // 更新userStore中的currentStudentId以保持同步
    userStore.currentStudentId = currentStudentId;
  }
  
  try {
    if (row.file_id) {
      console.log('file_id存在，准备下载:', row.file_id)
      const response = await downloadDefenseFile(row.file_id);
      console.log('下载响应:', response)
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = row.thesis_title + '.pdf' || 'download.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      ElMessage.success('文件下载成功');
    } else {
      ElMessage.warning('文件ID不存在');
    }
  } catch (error) {
    console.error('下载失败:', error);
    ElMessage.error('下载失败: ' + error.message);
  }
}

// 格式化文件大小
const formatFileSize = (size) => {
  if (size === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(size) / Math.log(k))
  return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 处理文件选择
const handleFileChange = (file) => {
  if (!beforeFileUpload(file.raw)) {
    return
  }
  
  selectedFile.value = file.raw
  formData.paper_attachment = file.name
}

// 上传前验证
const beforeFileUpload = (rawFile) => {
  // 验证文件类型
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip', 'application/x-rar-compressed']
  if (!allowedTypes.includes(rawFile.type)) {
    ElMessage.error('只能上传 PDF, DOC, DOCX, ZIP, RAR 格式的文件!')
    return false
  }
  
  // 验证文件大小 (限制为50MB)
  const maxSize = 50 * 1024 * 1024
  if (rawFile.size > maxSize) {
    ElMessage.error('文件大小不能超过 50MB!')
    return false
  }
  
  return true
}

// 清除已选择的文件
const clearSelectedFile = () => {
  selectedFile.value = null
  formData.paper_attachment = ''
}

// 上传文件到服务器
const uploadSelectedFile = async () => {
  if (!selectedFile.value) {
    return null
  }

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    
    const response = await uploadFile(formData)
    if (response && response.result && response.result.fileId) {
      return response.result.fileId
    } else {
      console.error('上传响应格式错误:', response)
      ElMessage.error('文件上传失败')
      return null
    }
  } catch (error) {
    console.error('文件上传失败:', error)
    ElMessage.error('文件上传失败: ' + error.message)
    return null
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      // 确保提交的是当前学生的ID
      const currentStudentId = await getCurrentStudentId();
      if (!currentStudentId) {
        ElMessage.error('无法获取学生信息');
        return;
      }
      
      // 限制学生只能编辑自己的数据
      if (userStore.userInfo.user_group === 'student') {
        formData.upload_students = currentStudentId;
      }
      
      submitLoading.value = true
      try {
        let filePath = formData.paper_attachment
        
        // 如果有新选择的文件，则上传
        if (selectedFile.value) {
          const fileId = await uploadSelectedFile()
          if (!fileId) {
            ElMessage.error('文件上传失败，无法保存')
            return
          }
          // 假设返回的fileId需要存储到某个字段中，具体根据后端API调整
          // 这里可能需要更新formData中的某个字段
        }
        
        // 如果是编辑模式
        if (formMode.value === 'edit') {
          await updatePaper(formData.paper_information_id, {
            ...formData,
            paper_attachment: filePath
          })
          ElMessage.success('更新成功')
        } else {
          // 学生不能新增，只能编辑
          ElMessage.warning('学生用户不能新增答辩材料，只能编辑现有记录');
          return;
        }
        
        // 重新加载数据
        await loadData()
        showForm.value = false
      // 清空文件选择状态
      selectedFile.value = null
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error('操作失败: ' + error.message)
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const handleFormClose = () => {
  formRef.value?.resetFields()
  selectedFile.value = null
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.student-defense-list {
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
  
  .file-upload-container {
    .selected-file-info {
      margin-top: 10px;
      padding: 8px;
      background-color: #f5f7fa;
      border-radius: 4px;
      display: flex;
      align-items: center;
      
      .file-name {
        margin-right: 8px;
        color: #606266;
      }
      
      .file-size {
        color: #909399;
        margin-right: 8px;
      }
    }
  }
}
</style>