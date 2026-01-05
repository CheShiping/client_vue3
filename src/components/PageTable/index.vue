<template>
  <div class="page-table">
    <el-card>
      <!-- 搜索栏 -->
      <el-form
        :model="searchForm"
        :inline="true"
        class="search-form"
        v-if="showSearch"
      >
        <slot name="search" :form="searchForm"></slot>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 操作栏 -->
      <div class="toolbar" v-if="showToolbar">
        <slot name="toolbar"></slot>
      </div>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
      >
        <slot></slot>
      </el-table>

      <!-- 分页 -->
      <div class="pagination" v-if="showPagination">
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
import { ref, reactive, defineProps, defineEmits } from 'vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  showSearch: {
    type: Boolean,
    default: true
  },
  showToolbar: {
    type: Boolean,
    default: true
  },
  showPagination: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['search', 'reset', 'page-change', 'size-change'])

const searchForm = ref({})
const tableData = ref([])
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const handleSearch = () => {
  emit('search', searchForm.value)
}

const handleReset = () => {
  searchForm.value = {}
  emit('reset')
}

const handlePageChange = (page) => {
  pagination.page = page
  emit('page-change', page)
}

const handleSizeChange = (size) => {
  pagination.size = size
  pagination.page = 1
  emit('size-change', size)
}

// 暴露方法供父组件调用
defineExpose({
  searchForm,
  tableData,
  pagination,
  handleSearch,
  handleReset
})
</script>

<style lang="scss" scoped>
.page-table {
  .search-form {
    margin-bottom: 20px;
  }

  .toolbar {
    margin-bottom: 20px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>

