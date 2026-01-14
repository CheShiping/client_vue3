<template>
  <div class="statistics-dashboard">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>统计分析</span>
        </div>
      </template>
      
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="专业">
          <el-input v-model="queryForm.major" placeholder="请输入专业" clearable />
        </el-form-item>
        <el-form-item label="班级">
          <el-input v-model="queryForm.class_name" placeholder="请输入班级" clearable />
        </el-form-item>
        <el-form-item label="年级">
          <el-input v-model="queryForm.grade" placeholder="请输入年级" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadStatistics">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-row :gutter="20" style="margin-top: 20px">
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>答辩完成情况</template>
            <div v-if="completionStats">
              <p>总人数: {{ completionStats.total }}</p>
              <p>已完成: {{ completionStats.completed }}</p>
              <p>未完成: {{ completionStats.pending }}</p>
              <p>完成率: {{ completionStats.completion_rate }}%</p>
            </div>
            <div v-else>
              <el-empty description="暂无数据" />
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>成绩分布</template>
            <div v-if="scoreDistribution">
              <p>优秀 (90-100): {{ scoreDistribution.excellent }}</p>
              <p>良好 (80-89): {{ scoreDistribution.good }}</p>
              <p>中等 (70-79): {{ scoreDistribution.medium }}</p>
              <p>及格 (60-69): {{ scoreDistribution.pass }}</p>
              <p>不及格 (0-59): {{ scoreDistribution.fail }}</p>
            </div>
            <div v-else>
              <el-empty description="暂无数据" />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getDefenseCompletion, getScoreDistribution } from '@/api/statistics'
import { ElMessage } from 'element-plus'

const queryForm = ref({
  major: '',
  class_name: '',
  grade: ''
})

const completionStats = ref<any>(null)
const scoreDistribution = ref<any>(null)

const loadStatistics = async () => {
  try {
    const [completionRes, distributionRes] = await Promise.all([
      getDefenseCompletion(queryForm.value),
      getScoreDistribution(queryForm.value)
    ])
    
    if (completionRes.code === 200) {
      completionStats.value = completionRes.data
    }
    
    if (distributionRes.code === 200) {
      scoreDistribution.value = distributionRes.data
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
  }
}

const resetQuery = () => {
  queryForm.value = {
    major: '',
    class_name: '',
    grade: ''
  }
  loadStatistics()
}

onMounted(() => {
  loadStatistics()
})
</script>

<style scoped lang="scss">
.statistics-dashboard {
  padding: 20px;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}
</style>
