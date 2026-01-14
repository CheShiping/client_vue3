<template>
  <div class="defense-record-manage">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>答辩记录管理</span>
          <el-button type="primary" @click="showDialog()">新增记录</el-button>
        </div>
      </template>
      
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="学生姓名">
          <el-input v-model="queryForm.student_name" placeholder="请输入学生姓名" clearable />
        </el-form-item>
        <el-form-item label="答辩组">
          <el-input v-model="queryForm.group_name" placeholder="请输入答辩组名称" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadRecords">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-table :data="records" style="width: 100%; margin-top: 20px">
        <el-table-column prop="student_name" label="学生姓名" />
        <el-table-column prop="group_name" label="答辩组" />
        <el-table-column prop="venue_name" label="答辩场地" />
        <el-table-column prop="start_time" label="开始时间" />
        <el-table-column prop="end_time" label="结束时间" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'pending'" type="warning">待答辩</el-tag>
            <el-tag v-else-if="row.status === 'in_progress'" type="primary">进行中</el-tag>
            <el-tag v-else-if="row.status === 'completed'" type="success">已完成</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="showDialog(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="deleteRecord(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadRecords"
        @current-change="loadRecords"
        style="margin-top: 20px; justify-content: center"
      />
    </el-card>
    
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑记录' : '新增记录'" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="学生ID">
          <el-input v-model="form.student_id" type="number" />
        </el-form-item>
        <el-form-item label="答辩组ID">
          <el-input v-model="form.group_id" type="number" />
        </el-form-item>
        <el-form-item label="场地ID">
          <el-input v-model="form.venue_id" type="number" />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker v-model="form.start_time" type="datetime" placeholder="选择开始时间" />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker v-model="form.end_time" type="datetime" placeholder="选择结束时间" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status">
            <el-option label="待答辩" value="pending" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.notes" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRecord">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { saveDefenseRecord } from '@/api/defense-record'
import { ElMessage, ElMessageBox } from 'element-plus'

const queryForm = ref({
  student_name: '',
  group_name: ''
})

const records = ref<any[]>([])
const pagination = ref({
  page: 1,
  size: 10,
  total: 0
})

const dialogVisible = ref(false)
const form = ref({
  id: null as number | null,
  student_id: '',
  group_id: '',
  venue_id: '',
  start_time: '',
  end_time: '',
  status: 'pending',
  notes: ''
})

const loadRecords = async () => {
  // TODO: 实现加载记录的API调用
  records.value = []
  pagination.value.total = 0
}

const showDialog = (record?: any) => {
  if (record) {
    form.value = { ...record }
  } else {
    form.value = {
      id: null,
      student_id: '',
      group_id: '',
      venue_id: '',
      start_time: '',
      end_time: '',
      status: 'pending',
      notes: ''
    }
  }
  dialogVisible.value = true
}

const saveRecord = async () => {
  try {
    const res = await saveDefenseRecord(form.value)
    if (res.code === 200) {
      ElMessage.success('保存成功')
      dialogVisible.value = false
      loadRecords()
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  }
}

const deleteRecord = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    // TODO: 实现删除API调用
    ElMessage.success('删除成功')
    loadRecords()
  } catch (error) {
    // 用户取消删除
  }
}

const resetQuery = () => {
  queryForm.value = {
    student_name: '',
    group_name: ''
  }
  pagination.value.page = 1
  loadRecords()
}

onMounted(() => {
  loadRecords()
})
</script>

<style scoped lang="scss">
.defense-record-manage {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
