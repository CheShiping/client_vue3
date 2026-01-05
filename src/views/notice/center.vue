<template>
  <div class="notice-center">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>通知公告中心</span>
        </div>
      </template>
      
      <el-table 
        :data="tableData" 
        v-loading="loading"
        style="width: 100%"
        @row-click="handleRowClick"
        highlight-current-row
      >
        <el-table-column prop="title" label="标题">
          <template #default="{ row }">
            <span class="notice-title">{{ row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTagType(row.type)">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="发布时间" width="180" />
      </el-table>
      
      <div class="pagination" v-if="pagination.total > 0">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getNoticeList } from '@/api/notice'
import { ElMessage } from 'element-plus'

const router = useRouter()

const loading = ref(false)
const tableData = ref([])
const pagination = ref({
  page: 1,
  size: 10,
  total: 0
})

const getTagType = (type) => {
  const typeMap = {
    '公告': 'primary',
    '通知': 'success',
    '介绍': 'info',
    '联系': 'warning'
  }
  return typeMap[type] || 'primary'
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      size: pagination.value.size
    }
    
    const res = await getNoticeList(params)
    if (res.result) {
      tableData.value = res.result.list || []
      pagination.value.total = res.result.total || 0
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page) => {
  pagination.value.page = page
  loadData()
}

const handleSizeChange = (size) => {
  pagination.value.size = size
  pagination.value.page = 1
  loadData()
}

const handleRowClick = (row) => {
  router.push(`/notice/view/${row.notice_id}`)
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.notice-center {
  .card-header {
    font-weight: bold;
    font-size: 18px;
  }
  
  .notice-title {
    cursor: pointer;
    color: #409eff;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>