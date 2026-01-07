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
      <el-button type="primary" @click="handleAdd" v-if="userStore.isAdmin || userStore.userInfo.user_group === 'teacher'">
        <el-icon><Plus /></el-icon>
        发布答辩题目
      </el-button>
    </template>

    <el-table-column prop="thesis_title" label="答辩题目" show-overflow-tooltip />
    <el-table-column prop="question_type" label="题目类型" width="120" />
    <el-table-column prop="topic_selection_time" label="发布时间" width="120" />
    <el-table-column prop="topic_status" label="答辩题目状态" width="120" align="center">
      <template #default="{ row }">
        <el-tag 
          :type="row.topic_status === '已满' ? 'danger' : 
                  row.topic_status === '已选' ? 'success' : 
                  row.topic_status === '开放' ? 'primary' : 'info'">
          {{ row.topic_status }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="selected_students_count" label="已选人数" width="100">
      <template #default="{ row }">
        {{ row.selected_students_count }} / {{ row.max_students }}
      </template>
    </el-table-column>
    <el-table-column label="操作" width="220" fixed="right">
      <template #default="{ row }">
        <el-button type="primary" link @click="handleView(row)">查看</el-button>
        <el-button type="primary" link @click="handleEdit(row)" v-if="userStore.isAdmin || userStore.userInfo.user_group === 'teacher'">编辑</el-button>
        <el-button 
          type="success" 
          link 
          @click="handleSelect(row)" 
          v-if="userStore.userInfo.user_group === 'student' && row.topic_status !== '已满' && row.topic_status !== '已选'"
          :disabled="isSelecting"
        >
          选择答辩题目
        </el-button>
        <el-button 
          type="warning" 
          link 
          @click="handleUnselect(row)" 
          v-if="userStore.userInfo.user_group === 'student' && row.topic_status === '已选'"
          :disabled="isSelecting"
        >
          取消选择答辩题目
        </el-button>
        <el-button type="danger" link @click="handleDelete(row)" v-if="userStore.isAdmin">删除</el-button>
      </template>
    </el-table-column>
  </PageTable>
  
  <TopicForm v-model="showForm" :data="formData" :mode="formMode" @success="handleFormSuccess" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getStoredTopics, saveTopicsToStorage } from '@mock/topic'
import PageTable from '@/components/PageTable/index.vue'
import TopicForm from './form.vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTopicList, deleteTopic, selectTopic, unselectTopic } from '@/api/topic'
import { getStudentByUserId } from '@/api/student'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 移除直接读取localStorage的代码，统一使用API调用

const pageTableRef = ref(null)
const loading = ref(false)
const showForm = ref(false)
const formData = ref(null)
const formMode = ref('add')
const searchParams = ref({
  thesis_title: ''
})
const isSelecting = ref(false)

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
    
    // 如果是学生，可能需要过滤数据（例如只显示未选的或已选的题目）
    if (userStore.userInfo.user_group === 'student') {
      // 获取当前学生ID
      const currentStudentId = await getCurrentStudentId();
      if (currentStudentId) {
        userStore.currentStudentId = currentStudentId;
        // 对于主题列表，我们通常不需要按学生过滤，因为所有学生都能看到开放的题目
        // 但我们可以添加额外的参数来显示题目选择状态
        params.current_student_id = currentStudentId;
      }
    }
    
    // 统一调用API获取数据
    const res = await getTopicList(params)
    if (res.result) {
      let listData = res.result.list || [];
      
      // 在学生视角中，如果某个选题的已选人数达到上限但状态不是"已满"，则将其状态更新为"已满"
      if (userStore.userInfo.user_group === 'student') {
        listData = listData.map(item => {
          if (item.max_students && item.selected_students_count >= item.max_students && item.topic_status !== '已选') {
            return { ...item, topic_status: '已满' }
          }
          return item;
        });
      }
      
      pageTableRef.value.tableData = listData
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

const handleAdd = () => {
  formData.value = null
  formMode.value = 'add'
  showForm.value = true
}

const handleView = (row) => {
  formData.value = { ...row }
  formMode.value = 'view'
  showForm.value = true
}

const handleEdit = (row) => {
  formData.value = { ...row }
  formMode.value = 'edit'
  showForm.value = true
}

const handleSelect = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要选择 "${row.thesis_title}" 这个答辩题目吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    isSelecting.value = true;
    
    // 调用选择选题的API
    const res = await selectTopic(row.topic_information_id);
    if (res.result) {
      ElMessage.success('选择答辩题目成功');
      loadData(); // 重新加载数据以更新状态
    } else {
      ElMessage.error(res.error?.message || '选择答辩题目失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('选择失败:', error)
      ElMessage.error(error?.response?.data?.error?.message || '选择失败')
    }
  } finally {
    isSelecting.value = false;
  }
}

const handleUnselect = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要取消选择 "${row.thesis_title}" 这个答辩题目吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    isSelecting.value = true;

    // 调用取消选择选题的API
    const res = await unselectTopic(row.topic_information_id);
    if (res.result) {
      ElMessage.success('取消选择答辩题目成功');
      loadData(); // 重新加载数据以更新状态
    } else {
      ElMessage.error(res.error?.message || '取消选择答辩题目失败');
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

const handleFormSuccess = () => {
  loadData()
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这个答辩题目吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    
    await deleteTopic(row.topic_information_id)
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