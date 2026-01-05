<template>
  <PageTable
    ref="pageTableRef"
    :loading="loading"
    @search="handleSearch"
    @reset="handleReset"
    @page-change="handlePageChange"
    @size-change="handleSizeChange"
  >
    <template #search="{ form }">
      <el-form-item label="资料名称">
        <el-input v-model="form.defense_material_name" placeholder="请输入资料名称" clearable />
      </el-form-item>
    </template>

    <template #toolbar>
      <el-button type="primary" @click="handleAdd" v-if="userStore.isAdmin || userStore.userInfo.user_group === 'teacher' || userStore.userInfo.user_group === 'student'">
        <el-icon><Plus /></el-icon>
        上传答辩资料
      </el-button>
    </template>

    <el-table-column prop="defense_material_name" label="资料名称" show-overflow-tooltip />
    <el-table-column prop="material_type" label="资料类型" width="120" />
    <el-table-column prop="upload_time" label="上传时间" width="120" />
    <el-table-column prop="file_size" label="文件大小" width="100" />
    <el-table-column prop="upload_user" label="上传者" width="120" v-if="userStore.isAdmin || userStore.userInfo.user_group === 'teacher'"/>
    <el-table-column label="操作" width="220" fixed="right">
      <template #default="{ row }">
        <el-button type="primary" link @click="handleView(row)">查看</el-button>
        <el-button type="primary" link @click="handleEdit(row)" v-if="hasEditPermission(row)">编辑</el-button>
        <el-button type="success" link @click="handleDownload(row)">下载</el-button>
        <el-button type="danger" link @click="handleDelete(row)" v-if="hasEditPermission(row)">删除</el-button>
      </template>
    </el-table-column>
  </PageTable>
  
  <DefenseMaterialForm v-model="showForm" :data="formData" :mode="formMode" @success="handleFormSuccess" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PageTable from '@/components/PageTable/index.vue'
import DefenseMaterialForm from './form.vue'  // 重命名导入组件
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPaperList, deletePaper } from '@/api/defense-material'
import { getStudentByUserId } from '@/api/student'  // 新增导入
import { getFileDownloadUrl } from '@/api/file'  // 更新导入，使用正确的函数名
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const pageTableRef = ref(null)
const loading = ref(false)
const showForm = ref(false)
const formData = ref(null)
const formMode = ref('add')
const searchParams = ref({
  defense_material_name: ''
})

// 加载数据
const loadData = async () => {
  if (!pageTableRef.value) return
  
  loading.value = true
  try {
    const params = {
      page: pageTableRef.value.pagination.page,
      size: pageTableRef.value.pagination.size,
      ...searchParams.value
    }
    
    // 如果是学生，根据学生ID过滤数据
    if (userStore.userInfo.user_group === 'student') {
      const currentStudentId = await getCurrentStudentId();
      if (currentStudentId) {
        params.upload_students = currentStudentId
        // 保存当前学生ID到userStore
        userStore.currentStudentId = currentStudentId;
      }
    }
    
    const res = await getPaperList(params)
    if (res.result) {
      pageTableRef.value.tableData = res.result.list || []
      pageTableRef.value.pagination.total = res.result.total || 0
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 检查是否有编辑和删除权限
const hasEditPermission = (row) => {
  // 管理员和教师始终有权限
  if (userStore.isAdmin || userStore.userInfo.user_group === 'teacher') {
    return true;
  }
  
  // 学生只能编辑自己的资料
  if (userStore.userInfo.user_group === 'student') {
    // 比较当前用户的学生ID和资料的上传学生ID
    return row.upload_students === userStore.currentStudentId;
  }
  
  return false;
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

const handleSearch = (form) => {
  searchParams.value = { ...form }
  if (pageTableRef.value) {
    pageTableRef.value.pagination.page = 1
  }
  loadData()
}

const handleReset = () => {
  searchParams.value = {
    defense_material_name: ''
  }
  if (pageTableRef.value) {
    pageTableRef.value.searchForm = {}
    pageTableRef.value.pagination.page = 1
  }
  loadData()
}

const handlePageChange = (page) => {
  if (pageTableRef.value) {
    pageTableRef.value.pagination.page = page
  }
  loadData()
}

const handleSizeChange = (size) => {
  if (pageTableRef.value) {
    pageTableRef.value.pagination.size = size
    pageTableRef.value.pagination.page = 1
  }
  loadData()
}

const handleAdd = async () => {
  // 如果是学生用户，需要先获取学生ID
  if (userStore.userInfo.user_group === 'student') {
    const currentStudentId = await getCurrentStudentId();
    if (currentStudentId) {
      userStore.currentStudentId = currentStudentId;
    }
  }
  
  formData.value = null
  formMode.value = 'add'
  showForm.value = true
}

const handleView = (row) => {
  formData.value = { ...row }
  formMode.value = 'view'
  showForm.value = true
}

const handleEdit = async (row) => {
  if (hasEditPermission(row)) {
    formData.value = { ...row }
    formMode.value = 'edit'
    showForm.value = true
  } else {
    ElMessage.warning('您没有权限编辑此资料')
  }
}

const handleDownload = async (row) => {
  console.log('开始下载文件:', row)
  try {
    if (row.file_id) {
      console.log('file_id存在，准备下载:', row.file_id)
      // 使用新的文件下载API，生成下载链接
      const downloadUrl = getFileDownloadUrl(row.file_id)
      
      // 创建一个临时链接来触发下载
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = row.defense_material_name || 'download'
      link.target = '_blank'  // 在新标签页中打开
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      ElMessage.success('文件下载链接已打开')
    } else {
      ElMessage.warning('文件ID不存在');
    }
  } catch (error) {
    console.error('文件下载失败:', error)
    ElMessage.error('文件下载失败，请重试')
  }
}

const handleFormSuccess = () => {
  loadData()
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    if (!hasEditPermission(row)) {
      ElMessage.error('您没有权限删除此资料');
      return;
    }
    
    await deletePaper(row.paper_information_id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadData()
})
</script>