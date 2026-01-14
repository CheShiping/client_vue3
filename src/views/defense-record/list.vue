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
      <el-form-item label="答辩日期">
        <el-date-picker
          v-model="form.defense_date"
          type="date"
          placeholder="请选择答辩日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          clearable
        />
      </el-form-item>
    </template>

    <el-table-column prop="student_name" label="学生姓名" min-width="150" />
    <el-table-column prop="student_id" label="学号" min-width="150" />
    <el-table-column prop="group_name" label="答辩小组" min-width="150" />
    <el-table-column prop="paper_title" label="论文题目" min-width="200" />
    <el-table-column prop="defense_date" label="答辩日期" min-width="150" />
    <el-table-column prop="defense_time" label="答辩时间" min-width="150" />
    <el-table-column prop="venue_name" label="答辩地点" min-width="150" />
    <el-table-column label="操作" width="200" fixed="right">
      <template #default="scope">
        <el-button type="primary" link @click="handleView(scope.row)">查看</el-button>
        <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
        <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
      </template>
    </el-table-column>
  </PageTable>
  
  <DefenseRecordForm v-model="showForm" :data="formData" :defenseGroups="defenseGroups" @success="handleFormSuccess" />
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import PageTable from '@/components/PageTable/index.vue'
import DefenseRecordForm from './form.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDefenseRecordList, deleteDefenseRecord } from '@/api/defense-record'
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
  defense_date: ''
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
    
    const res = await getDefenseRecordList(params)
    if (res.result) {
      pageTableRef.value.tableData = res.result.list || []
      pageTableRef.value.pagination.total = res.result.total || 0
    }
  } catch (error) {
    console.error('加载答辩记录列表失败:', error)
    ElMessage.error('加载答辩记录列表失败')
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

// 查看答辩记录详情
const handleView = (row) => {
  formData.value = { ...row, readonly: true }
  showForm.value = true
}

// 修改答辩记录
const handleEdit = (row) => {
  formData.value = { ...row }
  showForm.value = true
}

// 删除答辩记录
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该答辩记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteDefenseRecord(row.record_id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除答辩记录失败:', error)
      ElMessage.error('删除答辩记录失败')
    }
  }
}

// 表单提交成功
const handleFormSuccess = () => {
  showForm.value = false
  loadData()
}

// 初始化数据
onMounted(async () => {
  await loadDefenseGroups()
  await loadData()
})
</script>

<style lang="scss" scoped>
</style>