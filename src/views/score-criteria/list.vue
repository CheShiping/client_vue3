<template>
  <div class="criteria-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>评分标准管理</span>
          <el-button type="primary" @click="handleAdd">新增标准</el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="答辩计划">
          <el-select v-model="searchForm.plan_id" placeholder="请选择答辩计划" @change="handleSearch">
            <el-option
              v-for="plan in planList"
              :key="plan.plan_id"
              :label="plan.plan_name"
              :value="plan.plan_id"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <el-alert
        v-if="searchForm.plan_id"
        :title="`当前权重总和：${totalWeight}%（${isWeightValid ? '有效' : '无效，必须为100%'}）`"
        :type="isWeightValid ? 'success' : 'warning'"
        style="margin-bottom: 20px"
      />

      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="criteria_id" label="ID" width="80" />
        <el-table-column prop="criteria_name" label="标准名称" min-width="150" />
        <el-table-column prop="criteria_desc" label="标准描述" min-width="200" />
        <el-table-column prop="weight" label="权重(%)" width="100" />
        <el-table-column prop="full_score" label="满分" width="100" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="答辩计划" prop="plan_id">
          <el-select v-model="form.plan_id" placeholder="请选择答辩计划" :disabled="isEdit">
            <el-option
              v-for="plan in planList"
              :key="plan.plan_id"
              :label="plan.plan_name"
              :value="plan.plan_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="标准名称" prop="criteria_name">
          <el-input v-model="form.criteria_name" placeholder="请输入标准名称" />
        </el-form-item>
        <el-form-item label="标准描述" prop="criteria_desc">
          <el-input
            v-model="form.criteria_desc"
            type="textarea"
            :rows="3"
            placeholder="请输入标准描述"
          />
        </el-form-item>
        <el-form-item label="权重(%)" prop="weight">
          <el-input-number v-model="form.weight" :min="0" :max="100" :precision="2" />
        </el-form-item>
        <el-form-item label="满分" prop="full_score">
          <el-input-number v-model="form.full_score" :min="0" :max="100" :precision="2" />
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
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import axios from 'axios'

const searchForm = reactive({
  plan_id: null as number | null
})

const planList = ref([])
const tableData = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增评分标准')
const formRef = ref<FormInstance>()
const isEdit = ref(false)
const totalWeight = ref(0)
const isWeightValid = ref(false)

const form = reactive({
  criteria_id: null,
  plan_id: null as number | null,
  criteria_name: '',
  criteria_desc: '',
  weight: 0,
  full_score: 100
})

const rules = {
  plan_id: [{ required: true, message: '请选择答辩计划', trigger: 'change' }],
  criteria_name: [{ required: true, message: '请输入标准名称', trigger: 'blur' }],
  weight: [{ required: true, message: '请输入权重', trigger: 'blur' }],
  full_score: [{ required: true, message: '请输入满分', trigger: 'blur' }]
}

const fetchPlanList = async () => {
  try {
    const response = await axios.get('/api/defense/plan/list', {
      params: { page: 1, size: 100 }
    })
    if (response.data.result) {
      planList.value = response.data.result.list
    }
  } catch (error) {
    ElMessage.error('获取答辩计划列表失败')
  }
}

const fetchCriteriaList = async () => {
  if (!searchForm.plan_id) {
    tableData.value = []
    return
  }
  
  try {
    const response = await axios.get('/api/defense/criteria/list', {
      params: { plan_id: searchForm.plan_id }
    })
    
    if (response.data.result) {
      tableData.value = response.data.result.list
      await validateWeight()
    }
  } catch (error) {
    ElMessage.error('获取评分标准列表失败')
  }
}

const validateWeight = async () => {
  if (!searchForm.plan_id) return
  
  try {
    const response = await axios.post('/api/defense/criteria/validate-weight', {
      plan_id: searchForm.plan_id
    })
    
    if (response.data.result) {
      totalWeight.value = response.data.result.total_weight
      isWeightValid.value = response.data.result.is_valid
    }
  } catch (error) {
    console.error('验证权重失败')
  }
}

const handleSearch = () => {
  fetchCriteriaList()
}

const handleAdd = () => {
  if (!searchForm.plan_id) {
    ElMessage.warning('请先选择答辩计划')
    return
  }
  
  isEdit.value = false
  dialogTitle.value = '新增评分标准'
  dialogVisible.value = true
  Object.assign(form, {
    criteria_id: null,
    plan_id: searchForm.plan_id,
    criteria_name: '',
    criteria_desc: '',
    weight: 0,
    full_score: 100
  })
}

const handleEdit = (row: any) => {
  isEdit.value = true
  dialogTitle.value = '编辑评分标准'
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
          response = await axios.put(`/api/defense/criteria/${form.criteria_id}`, form)
        } else {
          response = await axios.post('/api/defense/criteria', form)
        }
        
        if (response.data.result) {
          ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
          dialogVisible.value = false
          fetchCriteriaList()
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
  ElMessageBox.confirm('确定要删除这个评分标准吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await axios.delete(`/api/defense/criteria/${row.criteria_id}`)
      if (response.data.result) {
        ElMessage.success('删除成功')
        fetchCriteriaList()
      } else {
        ElMessage.error(response.data.error?.message || '删除失败')
      }
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

onMounted(() => {
  fetchPlanList()
})
</script>

<style scoped>
.criteria-container {
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
</style>
