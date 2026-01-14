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
      <el-form-item label="学生姓名">
        <el-input v-model="form.student_name" placeholder="请输入学生姓名" clearable />
      </el-form-item>
      <el-form-item label="答辩小组">
        <el-select v-model="form.group_id" placeholder="请选择答辩小组" clearable>
          <el-option
            v-for="group in defenseGroups"
            :key="group.group_id"
            :label="group.group_name"
            :value="group.group_id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否评分">
        <el-select v-model="form.scored" placeholder="请选择是否评分" clearable>
          <el-option label="已评分" value="1" />
          <el-option label="未评分" value="0" />
        </el-select>
      </el-form-item>
    </template>

    <el-table-column prop="student_name" label="学生姓名" min-width="150" />
    <el-table-column prop="student_id" label="学号" min-width="150" />
    <el-table-column prop="group_name" label="答辩小组" min-width="150" />
    <el-table-column prop="paper_title" label="论文题目" min-width="200" />
    <el-table-column prop="total_score" label="总分">
      <template #default="scope">
        <span v-if="scope.row.total_score">
          {{ scope.row.total_score }}
        </span>
        <span v-else style="color: #999">未评分</span>
      </template>
    </el-table-column>
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
        <el-button type="warning" link @click="handleScore(scope.row)" v-if="!scope.row.scored">评分</el-button>
        <el-button type="primary" link @click="handleEdit(scope.row)" v-if="scope.row.scored">修改评分</el-button>
      </template>
    </el-table-column>
  </PageTable>
  
  <DefenseScoreForm v-model="showForm" :data="formData" :defenseGroups="defenseGroups" @success="handleFormSuccess" />
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import PageTable from '@/components/PageTable/index.vue'
import DefenseScoreForm from './form.vue'
import { ElMessage } from 'element-plus'
import { getDefenseScoreList } from '@/api/defense-score'
import { getDefenseGroupList } from '@/api/defense-group'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const pageTableRef = ref(null)
const loading = ref(false)
const showForm = ref(false)
const formData = ref(null)
const searchParams = reactive({
  student_name: '',
  group_id: '',
  scored: ''
})
// 答辩小组列表
const defenseGroups = ref([])

// 加载答辩小组列表
const loadDefenseGroups = async () => {
  try {
    const res = await getDefenseGroupList({ size: 100 })
    if (res.result) {
      defenseGroups.value = res.result.list || []
    }
  } catch (error) {
    console.error('加载答辩小组列表失败:', error)
    ElMessage.error('加载答辩小组列表失败')
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
    
    const res = await getDefenseScoreList(params)
    if (res.result) {
      pageTableRef.value.tableData = res.result.list || []
      pageTableRef.value.pagination.total = res.result.total || 0
    }
  } catch (error) {
    console.error('加载答辩评分列表失败:', error)
    ElMessage.error('加载答辩评分列表失败')
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

// 查看答辩评分详情
const handleView = (row) => {
  formData.value = { ...row, readonly: true, viewed: true }
  showForm.value = true
}

// 评分
const handleScore = (row) => {
  formData.value = { ...row }
  showForm.value = true
}

// 修改评分
const handleEdit = (row) => {
  formData.value = { ...row }
  showForm.value = true
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
    case 1: return '待评分'
    case 2: return '评分中'
    case 3: return '已完成'
    default: return ''
  }
}

// 初始化数据
onMounted(async () => {
  await loadDefenseGroups()
  await loadData()
})
</script>

<style lang="scss" scoped>
</style>