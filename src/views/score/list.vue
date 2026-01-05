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
      <el-form-item label="答辩题目">
        <el-input v-model="form.thesis_title" placeholder="请输入答辩题目" clearable />
      </el-form-item>
    </template>

    <template #toolbar>
      <el-button type="primary" @click="handleAdd" v-if="userStore.isAdmin">
        <el-icon><Plus /></el-icon>
        新增成绩
      </el-button>
    </template>

    <el-table-column prop="thesis_title" label="答辩题目" show-overflow-tooltip />
    <el-table-column prop="question_type" label="题目类型" width="120" />
    <el-table-column prop="award_and_excellence_evaluation" label="评奖评优" width="120" />
    <el-table-column prop="release_time" label="发布时间" width="120" />
    <el-table-column prop="create_time" label="录入时间" width="180" />
    <el-table-column label="操作" width="200" fixed="right">
      <template #default="{ row }">
        <el-button type="primary" link @click="handleView(row)">查看</el-button>
        <el-button type="primary" link @click="handleEdit(row)" v-if="userStore.isAdmin || userStore.userInfo.user_group === 'teacher'">编辑</el-button>
        <el-button type="danger" link @click="handleDelete(row)" v-if="userStore.isAdmin">删除</el-button>
      </template>
    </el-table-column>
  </PageTable>
  
  <ScoreForm v-model="showForm" :data="formData" :mode="formMode" @success="handleFormSuccess" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PageTable from '@/components/PageTable/index.vue'
import ScoreForm from './form.vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getScoreList, deleteScore } from '@/api/score'
import { getStudentByUserId } from '@/api/student'  // 新增导入
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const pageTableRef = ref(null)
const loading = ref(false)
const showForm = ref(false)
const formData = ref(null)
const formMode = ref('add')
const searchParams = ref({
  thesis_title: ''
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
        params.defense_student = currentStudentId
      }
    }
    
    const res = await getScoreList(params)
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
    thesis_title: ''
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
  // 检查用户权限：管理员、教师或资料属于当前用户的学生
  if (userStore.isAdmin || 
      userStore.userInfo.user_group === 'teacher') {
    formData.value = { ...row }
    formMode.value = 'edit'
    showForm.value = true
  } else if (userStore.userInfo.user_group === 'student') {
    // 学生用户需要检查成绩是否属于自己
    const currentStudentId = await getCurrentStudentId();
    if (currentStudentId && row.defense_student === currentStudentId) {
      formData.value = { ...row }
      formMode.value = 'edit'
      showForm.value = true
    } else {
      ElMessage.warning('您没有权限编辑此成绩')
    }
  }
}

const handleFormSuccess = () => {
  loadData()
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这个成绩信息吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteScore(row.score_information_id)
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