# 通用组件

## PageTable

通用表格组件，包含搜索、工具栏、表格和分页功能。

### 使用示例

```vue
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
      <el-form-item label="姓名">
        <el-input v-model="form.name" placeholder="请输入姓名" />
      </el-form-item>
    </template>

    <template #toolbar>
      <el-button type="primary">新增</el-button>
    </template>

    <el-table-column prop="name" label="姓名" />
    <el-table-column label="操作">
      <template #default="{ row }">
        <el-button type="primary" link>编辑</el-button>
      </template>
    </el-table-column>
  </PageTable>
</template>

<script setup>
import { ref } from 'vue'
import PageTable from '@/components/PageTable/index.vue'

const pageTableRef = ref(null)
const loading = ref(false)

const handleSearch = (form) => {
  // 处理搜索
}

const handleReset = () => {
  // 处理重置
}

const handlePageChange = (page) => {
  // 处理页码变化
}

const handleSizeChange = (size) => {
  // 处理每页条数变化
}
</script>
```

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| loading | 加载状态 | Boolean | false |
| showSearch | 是否显示搜索栏 | Boolean | true |
| showToolbar | 是否显示工具栏 | Boolean | true |
| showPagination | 是否显示分页 | Boolean | true |

### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| search | 搜索事件 | form: 搜索表单数据 |
| reset | 重置事件 | - |
| page-change | 页码变化 | page: 页码 |
| size-change | 每页条数变化 | size: 每页条数 |

### Slots

| 插槽名 | 说明 |
|--------|------|
| search | 搜索表单内容，参数：form |
| toolbar | 工具栏内容 |
| default | 表格列定义 |

