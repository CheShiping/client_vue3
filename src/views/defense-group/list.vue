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
      <el-form-item label="小组名称">
        <el-input v-model="form.group_name" placeholder="请输入小组名称" clearable />
      </el-form-item>
      <el-form-item label="答辩计划">
        <el-select v-model="form.plan_id" placeholder="请选择答辩计划" clearable>
          <el-option
            v-for="plan in defensePlans"
            :key="plan.plan_id"
            :label="plan.plan_name"
            :value="plan.plan_id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="form.status" placeholder="请选择状态" clearable>
          <el-option label="待开始" value="1" />
          <el-option label="进行中" value="2" />
          <el-option label="已结束" value="3" />
        </el-select>
      </el-form-item>
    </template>

    <template #toolbar>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增分组
      </el-button>
    </template>

    <el-table-column prop="group_name" label="小组名称" min-width="200" />
    <el-table-column label="答辩计划" min-width="200">
      <template #default="scope">
        {{ scope.row.plan_name || scope.row.plan?.plan_name || getPlanName(scope.row.plan_id) }}
      </template>
    </el-table-column>
    <el-table-column prop="venue_name" label="答辩地点" min-width="200" />
    <el-table-column prop="defense_time" label="答辩时间" />
    <el-table-column prop="group_leader_name" label="组长" />
    <el-table-column prop="status" label="状态">
      <template #default="scope">
        <el-tag :type="getStatusType(scope.row.status)">
          {{ getStatusName(scope.row.status) }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="200" fixed="right">
      <template #default="scope">
        <el-button type="primary" link @click="handleView(scope.row)">查看</el-button>
        <el-button type="primary" link @click="handleEdit(scope.row)">修改</el-button>
        <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
        <el-button type="info" link @click="handleMembers(scope.row)">成员管理</el-button>
        <el-button type="success" link @click="handleStudents(scope.row)">学生管理</el-button>
      </template>
    </el-table-column>
  </PageTable>
  
  <DefenseGroupForm v-model="showForm" :data="formData" :defensePlans="defensePlans" @success="handleFormSuccess" />
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import PageTable from '@/components/PageTable/index.vue'
import DefenseGroupForm from './form.vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDefenseGroupList, deleteDefenseGroup } from '@/api/defense-group'
import { getDefensePlanList } from '@/api/defense-plan'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const pageTableRef = ref(null)
const loading = ref(false)
const showForm = ref(false)
const formData = ref(null)
const searchParams = reactive({
  group_name: '',
  plan_id: '',
  status: ''
})
// 答辩计划列表
const defensePlans = ref([])
const getPlanName = (planId) => {
  const plan = defensePlans.value.find(p => p.plan_id === planId)
  return plan ? plan.plan_name : ''
}

// 加载答辩计划列表
const loadDefensePlans = async () => {
  try {
    const res = await getDefensePlanList({ size: 100 })
    if (res.result) {
      defensePlans.value = res.result.list || []
      console.log('答辩计划列表:', defensePlans.value)
    }
  } catch (error) {
    console.error('加载答辩计划列表失败:', error)
    ElMessage.error('加载答辩计划列表失败')
  }
}

// 加载数据
const loadData = async () => {
  if (!pageTableRef.value) return
  
  loading.value = true
  try {
    const params = {
      page: pageTableRef.value.pagination.page,
      size: pageTableRef.value.pagination.size,
      ...searchParams
    }
    
    const res = await getDefenseGroupList(params)
    if (res.result) {
      pageTableRef.value.tableData = res.result.list || []
      pageTableRef.value.pagination.total = res.result.total || 0
    }
  } catch (error) {
    console.error('加载答辩分组列表失败:', error)
    ElMessage.error('加载答辩分组列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索功能
const handleSearch = (form) => {
  Object.assign(searchParams, form)
  if (pageTableRef.value) {
    pageTableRef.value.pagination.page = 1
  }
  loadData()
}

// 重置功能
const handleReset = () => {
  Object.keys(searchParams).forEach(key => {
    searchParams[key] = ''
  })
  if (pageTableRef.value) {
    pageTableRef.value.pagination.page = 1
  }
  loadData()
}

// 分页变化
const handlePageChange = (page) => {
  if (pageTableRef.value) {
    pageTableRef.value.pagination.page = page
  }
  loadData()
}

// 每页条数变化
const handleSizeChange = (size) => {
  if (pageTableRef.value) {
    pageTableRef.value.pagination.size = size
  }
  loadData()
}

// 新增答辩分组
const handleAdd = () => {
  formData.value = null
  showForm.value = true
}

// 查看答辩分组详情
const handleView = (row) => {
  formData.value = { ...row, readonly: true }
  showForm.value = true
}

// 修改答辩分组
const handleEdit = (row) => {
  formData.value = { ...row }
  showForm.value = true
}

// 删除答辩分组
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该答辩分组吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteDefenseGroup(row.group_id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除答辩分组失败:', error)
      ElMessage.error('删除答辩分组失败')
    }
  }
}

// 成员管理
const handleMembers = (row) => {
  ElMessage.info('成员管理功能开发中')
}

// 学生管理
const handleStudents = (row) => {
  ElMessage.info('学生管理功能开发中')
}

// 表单提交成功
const handleFormSuccess = () => {
  showForm.value = false
  loadData()
}

// 获取状态类型
const getStatusType = (status) => {
  switch (status) {
    case 1: return 'warning'
    case 2: return 'info'
    case 3: return 'success'
    default: return ''
  }
}

// 获取状态名称
const getStatusName = (status) => {
  switch (status) {
    case 1: return '待开始'
    case 2: return '进行中'
    case 3: return '已结束'
    default: return ''
  }
}

// 初始化数据
onMounted(async () => {
  await loadDefensePlans()
  await loadData()
})
</script>

<style lang="scss" scoped>
</style>
