<template>
  <PageTable
    ref="pageTableRef"
    :loading="loading"
    @search="handleSearch"
    @reset="handleReset"
    @page-change="handlePageChange"
    @size-change="handleSizeChange"
  >
    <template #toolbar>
      <el-button type="primary" @click="handleAdd" v-if="userStore.isAdmin || userStore.isTeacher">
        <el-icon><Plus /></el-icon>
        发布通知
      </el-button>
    </template>

    <template #search="{ form }">
      <el-form-item label="标题">
        <el-input v-model="form.notice_title" placeholder="请输入标题" clearable />
      </el-form-item>
    </template>

    <el-table-column prop="notice_title" label="标题" />
    <el-table-column prop="notice_publisher" label="发布人" width="120" />
    <el-table-column prop="release_time" label="发布时间" width="120" />
    <el-table-column prop="create_time" label="创建时间" width="180" />
    <el-table-column label="操作" width="200" fixed="right">
      <template #default="{ row }">
        <el-button type="primary" link @click="handleView(row)">查看</el-button>
        <el-button type="primary" link @click="handleEdit(row)" v-if="userStore.isAdmin || userStore.isTeacher">编辑</el-button>
        <el-button type="danger" link @click="handleDelete(row)" v-if="userStore.isAdmin || userStore.isTeacher">删除</el-button>
      </template>
    </el-table-column>
  </PageTable>
  
  <NoticeForm v-model="showForm" :data="formData" @success="handleFormSuccess" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PageTable from '@/components/PageTable/index.vue'
import NoticeForm from './form.vue'
import { Plus } from '@element-plus/icons-vue'
import { getNoticeList, deleteNotice } from '@/api/notice'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const router = useRouter()

const pageTableRef = ref(null)
const loading = ref(false)
const showForm = ref(false)
const formData = ref(null)
const searchParams = ref({
  notice_title: ''
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
    
    const res = await getNoticeList(params)
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

const handleSearch = (form) => {
  searchParams.value = { ...form }
  if (pageTableRef.value) {
    pageTableRef.value.pagination.page = 1
  }
  loadData()
}

const handleReset = () => {
  searchParams.value = {
    notice_title: ''
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
  formData.value = { ...row }
  showForm.value = true
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
    await ElMessageBox.confirm('确定要删除这个通知吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteNotice(row.notice_id)
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