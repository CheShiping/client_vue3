<template>
  <div class="venue-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>答辩场地管理</span>
          <el-button type="primary" @click="handleAdd">新增场地</el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="场地名称">
          <el-input v-model="searchForm.venue_name" placeholder="请输入场地名称" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="venue_id" label="ID" width="80" />
        <el-table-column prop="venue_name" label="场地名称" min-width="150" />
        <el-table-column prop="venue_address" label="场地地址" min-width="200" />
        <el-table-column prop="capacity" label="容纳人数" width="100" />
        <el-table-column prop="equipment" label="设备情况" min-width="200" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '可用' : '不可用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="场地名称" prop="venue_name">
          <el-input v-model="form.venue_name" placeholder="请输入场地名称" />
        </el-form-item>
        <el-form-item label="场地地址" prop="venue_address">
          <el-input v-model="form.venue_address" placeholder="请输入场地地址" />
        </el-form-item>
        <el-form-item label="容纳人数" prop="capacity">
          <el-input-number v-model="form.capacity" :min="1" :max="1000" />
        </el-form-item>
        <el-form-item label="设备情况" prop="equipment">
          <el-input
            v-model="form.equipment"
            type="textarea"
            :rows="3"
            placeholder="请输入设备情况"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">可用</el-radio>
            <el-radio :label="0">不可用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import axios from 'axios'

const searchForm = reactive({
  venue_name: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const tableData = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增场地')
const formRef = ref<FormInstance>()
const isEdit = ref(false)

const form = reactive({
  venue_id: null,
  venue_name: '',
  venue_address: '',
  capacity: 50,
  equipment: '',
  status: 1
})

const rules = {
  venue_name: [{ required: true, message: '请输入场地名称', trigger: 'blur' }],
  capacity: [{ required: true, message: '请输入容纳人数', trigger: 'blur' }]
}

const fetchVenueList = async () => {
  try {
    const response = await axios.get('/api/defense/venue/list', {
      params: {
        page: pagination.page,
        size: pagination.size,
        venue_name: searchForm.venue_name || undefined
      }
    })
    
    if (response.data.result) {
      tableData.value = response.data.result.list
      pagination.total = response.data.result.total
    }
  } catch (error) {
    ElMessage.error('获取场地列表失败')
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchVenueList()
}

const handleReset = () => {
  searchForm.venue_name = ''
  handleSearch()
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增场地'
  dialogVisible.value = true
  Object.assign(form, {
    venue_id: null,
    venue_name: '',
    venue_address: '',
    capacity: 50,
    equipment: '',
    status: 1
  })
}

const handleEdit = (row: any) => {
  isEdit.value = true
  dialogTitle.value = '编辑场地'
  dialogVisible.value = true
  Object.assign(form, row)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        let response
        if (isEdit.value) {
          response = await axios.put(`/api/defense/venue/${form.venue_id}`, form)
        } else {
          response = await axios.post('/api/defense/venue', form)
        }
        
        if (response.data.result) {
          ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
          dialogVisible.value = false
          fetchVenueList()
        } else {
          ElMessage.error(response.data.error?.message || '操作失败')
        }
      } catch (error) {
        ElMessage.error('操作失败')
      }
    }
  })
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除这个场地吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await axios.delete(`/api/defense/venue/${row.venue_id}`)
      if (response.data.result) {
        ElMessage.success('删除成功')
        fetchVenueList()
      } else {
        ElMessage.error(response.data.error?.message || '删除失败')
      }
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

onMounted(() => {
  fetchVenueList()
})
</script>

<style scoped>
.venue-container {
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
</style>
