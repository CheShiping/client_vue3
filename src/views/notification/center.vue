<template>
  <div class="notification-center">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>通知中心</span>
          <el-button type="primary" size="small" @click="markAllAsRead">全部标记为已读</el-button>
        </div>
      </template>
      
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="类型">
          <el-select v-model="queryForm.type" placeholder="请选择类型" clearable>
            <el-option label="系统通知" value="system" />
            <el-option label="答辩通知" value="defense" />
            <el-option label="成绩通知" value="score" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.is_read" placeholder="请选择状态" clearable>
            <el-option label="未读" :value="0" />
            <el-option label="已读" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadNotifications">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-table :data="notifications" style="width: 100%; margin-top: 20px">
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="type" label="类型">
          <template #default="{ row }">
            <el-tag v-if="row.type === 'system'" type="info">系统通知</el-tag>
            <el-tag v-else-if="row.type === 'defense'" type="warning">答辩通知</el-tag>
            <el-tag v-else-if="row.type === 'score'" type="success">成绩通知</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容" show-overflow-tooltip />
        <el-table-column prop="is_read" label="状态">
          <template #default="{ row }">
            <el-tag v-if="row.is_read === 0" type="danger">未读</el-tag>
            <el-tag v-else type="success">已读</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="时间" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button v-if="row.is_read === 0" type="primary" size="small" @click="markAsRead(row.id)">
              标记已读
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadNotifications"
        @current-change="loadNotifications"
        style="margin-top: 20px; justify-content: center"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/api/notification'
import { ElMessage } from 'element-plus'

const queryForm = ref({
  type: '',
  is_read: undefined as number | undefined
})

const notifications = ref<any[]>([])
const pagination = ref({
  page: 1,
  size: 10,
  total: 0
})

const loadNotifications = async () => {
  try {
    const res = await getNotifications({
      ...queryForm.value,
      page: pagination.value.page,
      size: pagination.value.size
    })
    
    if (res.code === 200) {
      notifications.value = res.data.list
      pagination.value.total = res.data.total
    }
  } catch (error) {
    console.error('加载通知失败:', error)
    ElMessage.error('加载通知失败')
  }
}

const markAsRead = async (id: number) => {
  try {
    const res = await markNotificationAsRead(id)
    if (res.code === 200) {
      ElMessage.success('标记成功')
      loadNotifications()
    }
  } catch (error) {
    console.error('标记失败:', error)
    ElMessage.error('标记失败')
  }
}

const markAllAsRead = async () => {
  try {
    const res = await markAllNotificationsAsRead()
    if (res.code === 200) {
      ElMessage.success('全部标记成功')
      loadNotifications()
    }
  } catch (error) {
    console.error('标记失败:', error)
    ElMessage.error('标记失败')
  }
}

const resetQuery = () => {
  queryForm.value = {
    type: '',
    is_read: undefined
  }
  pagination.value.page = 1
  loadNotifications()
}

onMounted(() => {
  loadNotifications()
})
</script>

<style scoped lang="scss">
.notification-center {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
