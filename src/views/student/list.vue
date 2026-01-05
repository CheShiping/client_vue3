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
      <el-form-item label="姓名">
        <el-input v-model="form.student_name" placeholder="请输入姓名" clearable />
      </el-form-item>
      <el-form-item label="学号">
        <el-input v-model="form.student_no" placeholder="请输入学号" clearable />
      </el-form-item>
    </template>

    <template #toolbar>
      <el-button type="primary" @click="handleAdd" v-if="userStore.isAdmin">
        <el-icon><Plus /></el-icon>
        新增学生
      </el-button>
    </template>

    <el-table-column prop="student_no" label="学号" width="120" />
    <el-table-column prop="student_name" label="姓名" width="120" />
    <el-table-column prop="student_gender" label="性别" width="80" />
    <el-table-column prop="student_age" label="年龄" width="80" />
    <el-table-column prop="phone" label="手机号" width="120" />
    <el-table-column prop="email" label="邮箱" />
    <el-table-column label="操作" width="200" fixed="right">
      <template #default="{ row }">
        <el-button type="primary" link @click="handleView(row)">查看</el-button>
        <el-button type="primary" link @click="handleEdit(row)" v-if="userStore.isAdmin">编辑</el-button>
        <el-button type="danger" link @click="handleDelete(row)" v-if="userStore.isAdmin">删除</el-button>
      </template>
    </el-table-column>
  </PageTable>
  
  <StudentForm v-model="showForm" :data="formData" @success="handleFormSuccess" />
  <StudentDetail v-model="showDetail" :data="detailData" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PageTable from '@/components/PageTable/index.vue'
import StudentForm from './form.vue'
import StudentDetail from './detail.vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getStudentList, deleteStudent } from '@/api/student'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const pageTableRef = ref(null)
const loading = ref(false)
const showForm = ref(false)
const showDetail = ref(false)
const formData = ref(null)
const detailData = ref(null)
const searchParams = ref({
  student_name: '',
  student_no: ''
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
    
    const res = await getStudentList(params)
    if (res.result) {
      pageTableRef.value.tableData = res.result.list || []
      pageTableRef.value.pagination.total = res.result.total || 0
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
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
    student_name: '',
    student_no: ''
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

const handleAdd = () => {
  formData.value = null
  showForm.value = true
}

const handleView = (row) => {
  detailData.value = { ...row }
  showDetail.value = true
}

const handleEdit = (row) => {
  formData.value = { ...row }
  showForm.value = true
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
    
    await deleteStudent(row.student_users_id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

onMounted(() => {
  loadData()
})
</script>