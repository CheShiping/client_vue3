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
      <el-form-item label="计划名称">
        <el-input v-model="form.plan_name" placeholder="请输入计划名称" clearable />
      </el-form-item>
      <el-form-item label="答辩类型">
        <el-select v-model="form.defense_type" placeholder="请选择答辩类型" clearable>
          <el-option label="硕士答辩" value="master" />
          <el-option label="本科答辩" value="bachelor" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="form.status" placeholder="请选择状态" clearable>
          <el-option label="待审核" value="1" />
          <el-option label="已审核" value="2" />
          <el-option label="已发布" value="3" />
          <el-option label="已结束" value="4" />
        </el-select>
      </el-form-item>
    </template>

    <template #toolbar>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增计划
      </el-button>
    </template>

    <el-table-column prop="plan_name" label="计划名称" min-width="200" />
    <el-table-column prop="defense_type" label="答辩类型">
      <template #default="scope">
        {{ scope.row.defense_type === 'master' ? '硕士答辩' : '本科答辩' }}
      </template>
    </el-table-column>
    <el-table-column prop="start_time" label="开始时间" />
    <el-table-column prop="end_time" label="结束时间" />
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
        <el-button v-if="scope.row.status === 2" type="success" link @click="handlePublish(scope.row)">发布</el-button>
      </template>
    </el-table-column>
  </PageTable>
  
  <DefensePlanForm v-model="showForm" :data="formData" @success="handleFormSuccess" />
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import PageTable from '@/components/PageTable/index.vue'
import DefensePlanForm from './form.vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDefensePlanList, deleteDefensePlan, publishDefensePlan } from '@/api/defense-plan'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const pageTableRef = ref(null)
const loading = ref(false)
const showForm = ref(false)
const formData = ref(null)
const searchParams = reactive({
  plan_name: '',
  defense_type: '',
  status: ''
})

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
    
    const res = await getDefensePlanList(params)
    if (res.result) {
      pageTableRef.value.tableData = res.result.list || []
      pageTableRef.value.pagination.total = res.result.total || 0
    }
  } catch (error) {
    console.error('加载答辩计划列表失败:', error)
    ElMessage.error('加载答辩计划列表失败')
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

// 新增答辩计划
const handleAdd = () => {
  formData.value = null
  showForm.value = true
}

// 查看答辩计划详情
const handleView = (row) => {
  formData.value = { ...row, readonly: true }
  showForm.value = true
}

// 修改答辩计划
const handleEdit = (row) => {
  formData.value = { ...row }
  showForm.value = true
}

// 删除答辩计划
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该答辩计划吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteDefensePlan(row.plan_id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除答辩计划失败:', error)
      ElMessage.error('删除答辩计划失败')
    }
  }
}

// 发布答辩计划
const handlePublish = async (row) => {
  try {
    await publishDefensePlan(row.plan_id)
    ElMessage.success('发布成功')
    loadData()
  } catch (error) {
    console.error('发布答辩计划失败:', error)
    ElMessage.error('发布答辩计划失败')
  }
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
    case 4: return 'danger'
    default: return 'info'
  }
}

// 获取状态名称
const getStatusName = (status) => {
  switch (status) {
    case 1: return '待审核'
    case 2: return '已审核'
    case 3: return '已发布'
    case 4: return '已结束'
    default: return ''
  }
}

// 初始化数据
onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
</style>