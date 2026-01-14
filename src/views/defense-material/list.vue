<template>
  <div class="defense-material-container" v-if="studentInfoLoaded">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>答辩材料管理</span>
          <el-button type="primary" @click="handleUpload">上传材料</el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="材料类型">
          <el-select v-model="searchForm.material_type" placeholder="请选择" clearable>
            <el-option label="答辩PPT" value="ppt" />
            <el-option label="论文终稿" value="thesis" />
            <el-option label="开题报告" value="proposal" />
            <el-option label="中期报告" value="midterm" />
            <el-option label="外文翻译" value="translation" />
            <el-option label="其他材料" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="material_id" label="ID" width="80" />
        <el-table-column prop="material_name" label="文件名" min-width="200" />
        <el-table-column prop="material_type" label="材料类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ getMaterialTypeName(row.material_type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="file_size" label="文件大小(MB)" width="120" />
        <el-table-column prop="upload_time" label="上传时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleDownload(row)">下载</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSearch"
        @current-change="handleSearch"
      />
    </el-card>

    <el-dialog v-model="uploadDialogVisible" title="上传答辩材料" width="500px">
      <el-form :model="uploadForm" :rules="uploadRules" ref="uploadFormRef" label-width="100px">
        <el-form-item label="材料类型" prop="material_type">
          <el-select v-model="uploadForm.material_type" placeholder="请选择材料类型">
            <el-option label="答辩PPT" value="ppt" />
            <el-option label="论文终稿" value="thesis" />
            <el-option label="开题报告" value="proposal" />
            <el-option label="中期报告" value="midterm" />
            <el-option label="外文翻译" value="translation" />
            <el-option label="其他材料" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="选择文件" prop="file">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            :on-change="handleFileChange"
            :file-list="fileList"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持格式：PDF、DOC、DOCX、PPT、PPTX、ZIP、RAR，文件大小不超过50MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitUpload" :loading="uploading">确定上传</el-button>
      </template>
    </el-dialog>
  </div>
  <div v-else class="loading-container">
    <el-empty description="正在加载学生信息..." />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { useUserStore } from '@/stores/user'
import axios from 'axios'
import { getStudentByUserId } from '@/api/student'

const userStore = useUserStore()

const searchForm = reactive({
  material_type: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const tableData = ref([])
const uploadDialogVisible = ref(false)
const uploading = ref(false)
const uploadFormRef = ref<FormInstance>()
const fileList = ref([])

const uploadForm = reactive({
  material_type: '',
  file: null as File | null
})

const studentInfo = ref()
const studentInfoLoaded = ref(false) // 新增标志位表示学生信息是否已加载

const uploadRules = {
  material_type: [{ required: true, message: '请选择材料类型', trigger: 'change' }],
  file: [{ required: true, message: '请选择文件', trigger: 'change' }]
}

const getMaterialTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    ppt: '答辩PPT',
    thesis: '论文终稿',
    proposal: '开题报告',
    midterm: '中期报告',
    translation: '外文翻译',
    other: '其他材料'
  }
  return typeMap[type] || type
}

const fetchMaterialList = async () => {
  try {
    // 通过标志位确保数据已经加载完成
    if (!studentInfoLoaded.value) {
      console.error('学生信息尚未加载完成');
      ElMessage.error('学生信息尚未加载完成，请稍后再试');
      return;
    }

    // 现在可以安全访问studentInfo.value.result.student_id
    const studentId = studentInfo.value.result.student_id
    
    console.log('获取材料列表，student_id:', studentId)
    
    if (!studentId) {
      ElMessage.warning('当前用户不是学生，无法查看材料列表')
      return
    }
    
    const response = await axios.get('/api/defense/material/list', {
      params: {
        student_id: studentId,
        page: pagination.page,
        size: pagination.size,
        material_type: searchForm.material_type || undefined
      }
    })
    
    if (response.data.result) {
      tableData.value = response.data.result.list
      pagination.total = response.data.result.total
    }
  } catch (error) {
    console.error('获取材料列表失败:', error)
    ElMessage.error('获取材料列表失败')
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchMaterialList()
}

const handleReset = () => {
  searchForm.material_type = ''
  handleSearch()
}

const handleUpload = () => {
  uploadDialogVisible.value = true
  uploadForm.material_type = ''
  uploadForm.file = null
  fileList.value = []
}

const handleFileChange = (file: any) => {
  uploadForm.file = file.raw
}

const getStudent = async (userId: any) => {
  try {
    const data = await getStudentByUserId(userId)
    studentInfo.value = data;
    console.log("答辩材料中获取的根据登录用户学生信息：", data)
    
    // 设置学生信息已加载完成标志
    studentInfoLoaded.value = true;
    
    // 在数据加载完成后获取材料列表
    await fetchMaterialList()
  } catch (error) {
    console.error("获取学生信息失败:", error)
    ElMessage.error("获取学生信息失败")
  }
}

onMounted(() => {
  getStudent(userStore.userInfo.user_id)
})

const handleSubmitUpload = async () => {
  if (!uploadFormRef.value) return
  
  await uploadFormRef.value.validate(async (valid) => {
    if (valid && uploadForm.file) {
      uploading.value = true
      try {
        // 确保学生信息已加载
        if (!studentInfoLoaded.value) {
          ElMessage.error('学生信息尚未加载完成，请稍后再试')
          uploading.value = false
          return
        }

        const studentId = studentInfo.value.result.student_id;
        
        if (!studentId) {
          ElMessage.error('请先登录学生账号')
          uploading.value = false
          return
        }
        
        console.log('准备上传，student_id:', studentId)
        
        const formData = new FormData()
        formData.append('file', uploadForm.file)
        formData.append('student_id', String(studentId))
        formData.append('material_type', uploadForm.material_type)
        
        console.log('FormData 内容:', {
          file: uploadForm.file.name,
          student_id: studentId,
          material_type: uploadForm.material_type
        })
        
        const response = await axios.post('/api/defense/material/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        
        console.log('上传响应:', response.data)
        
        if (response.data.result) {
          ElMessage.success('上传成功')
          uploadDialogVisible.value = false
          fetchMaterialList()
        } else {
          ElMessage.error(response.data.error?.message || '上传失败')
        }
      } catch (error: any) {
        console.error('上传错误:', error)
        ElMessage.error(error.response?.data?.error?.message || '上传失败')
      } finally {
        uploading.value = false
      }
    }
  })
}

const handleDownload = async (row: any) => {
  try {
    const response = await axios.get(`/api/defense/material/download/${row.material_id}`, {
      responseType: 'blob'
    })
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', row.material_name)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除这个材料吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await axios.delete(`/api/defense/material/${row.material_id}`)
      if (response.data.result) {
        ElMessage.success('删除成功')
        fetchMaterialList()
      } else {
        ElMessage.error(response.data.error?.message || '删除失败')
      }
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}
</script>

<style scoped>
.defense-material-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

.el-pagination {
  margin-top: 20px;
  justify-content: flex-end;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}
</style>