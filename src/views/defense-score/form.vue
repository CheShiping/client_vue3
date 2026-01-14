<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="800px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="150px"
      label-position="right"
    >
      <el-form-item label="学生姓名" prop="student_name">
        <el-input
          v-model="form.student_name"
          placeholder="请输入学生姓名"
          disabled
        />
      </el-form-item>
      <el-form-item label="学号" prop="student_id">
        <el-input
          v-model="form.student_id"
          placeholder="请输入学号"
          disabled
        />
      </el-form-item>
      <el-form-item label="答辩小组" prop="group_id">
        <el-select
          v-model="form.group_id"
          placeholder="请选择答辩小组"
          disabled
        >
          <el-option
            v-for="group in defenseGroups"
            :key="group.group_id"
            :label="group.group_name"
            :value="group.group_id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="论文题目" prop="paper_title">
        <el-input
          v-model="form.paper_title"
          placeholder="请输入论文题目"
          disabled
        />
      </el-form-item>
      
      <el-divider>评分标准</el-divider>
      
      <el-form-item label="论文质量" prop="paper_quality">
        <el-rate
          v-model="form.paper_quality"
          show-score
          :max="100"
          score-template="{value}分"
          :disabled="readonly"
        />
        <div class="score-desc">占比：30%</div>
      </el-form-item>
      
      <el-form-item label="答辩表现" prop="defense_performance">
        <el-rate
          v-model="form.defense_performance"
          show-score
          :max="100"
          score-template="{value}分"
          :disabled="readonly"
        />
        <div class="score-desc">占比：40%</div>
      </el-form-item>
      
      <el-form-item label="回答问题" prop="answer_quality">
        <el-rate
          v-model="form.answer_quality"
          show-score
          :max="100"
          score-template="{value}分"
          :disabled="readonly"
        />
        <div class="score-desc">占比：20%</div>
      </el-form-item>
      
      <el-form-item label="创新能力" prop="innovation_ability">
        <el-rate
          v-model="form.innovation_ability"
          show-score
          :max="100"
          score-template="{value}分"
          :disabled="readonly"
        />
        <div class="score-desc">占比：10%</div>
      </el-form-item>
      
      <el-form-item label="总分" prop="total_score">
        <el-input
          v-model="form.total_score"
          placeholder="总分"
          disabled
        />
      </el-form-item>
      
      <el-form-item label="评分意见" prop="comment">
        <el-input
          v-model="form.comment"
          type="textarea"
          rows="4"
          placeholder="请输入评分意见"
          :disabled="readonly"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit" v-if="!readonly">提交</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { addDefenseScore, updateDefenseScore } from '@/api/defense-score'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: null
  },
  defenseGroups: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

// 表单引用
const formRef = ref(null)
// 对话框可见性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
// 表单数据
const form = reactive({
  score_id: 0,
  student_id: 0,
  student_name: '',
  student_no: '',
  group_id: 0,
  paper_id: 0,
  paper_title: '',
  paper_quality: 0,
  defense_performance: 0,
  answer_quality: 0,
  innovation_ability: 0,
  total_score: 0,
  comment: ''
})
// 提交状态
const submitting = ref(false)
// 只读状态
const readonly = ref(false)

// 对话框标题
const dialogTitle = computed(() => {
  if (props.data?.viewed) {
    return '查看答辩评分'
  }
  return props.data?.score_id ? '修改答辩评分' : '答辩评分'
})

// 表单规则
const rules = {
  paper_quality: [
    { required: true, message: '请为论文质量评分', trigger: 'change' }
  ],
  defense_performance: [
    { required: true, message: '请为答辩表现评分', trigger: 'change' }
  ],
  answer_quality: [
    { required: true, message: '请为回答问题评分', trigger: 'change' }
  ],
  innovation_ability: [
    { required: true, message: '请为创新能力评分', trigger: 'change' }
  ]
}

// 计算总分
const calculateTotalScore = () => {
  const paperQualityScore = form.paper_quality * 0.3
  const defensePerformanceScore = form.defense_performance * 0.4
  const answerQualityScore = form.answer_quality * 0.2
  const innovationAbilityScore = form.innovation_ability * 0.1
  
  form.total_score = Math.round((paperQualityScore + defensePerformanceScore + answerQualityScore + innovationAbilityScore) * 10) / 10
}

// 监听评分变化，自动计算总分
watch(() => [form.paper_quality, form.defense_performance, form.answer_quality, form.innovation_ability], () => {
  calculateTotalScore()
}, { deep: true })

// 初始化表单数据
const initForm = () => {
  // 重置表单
  Object.assign(form, {
    score_id: 0,
    student_id: 0,
    student_name: '',
    student_no: '',
    group_id: 0,
    paper_id: 0,
    paper_title: '',
    paper_quality: 0,
    defense_performance: 0,
    answer_quality: 0,
    innovation_ability: 0,
    total_score: 0,
    comment: ''
  })
  
  // 如果有数据，填充表单
  if (props.data) {
    Object.assign(form, props.data)
    // 检查是否为只读模式
    readonly.value = !!props.data.readonly || !!props.data.viewed
  } else {
    readonly.value = false
  }
}

// 表单提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        // 根据是否有ID判断是新增还是修改
        if (form.score_id) {
          await updateDefenseScore(form.score_id, form)
          ElMessage.success('修改评分成功')
        } else {
          await addDefenseScore(form)
          ElMessage.success('评分成功')
        }
        
        // 关闭对话框
        dialogVisible.value = false
        // 触发成功事件
        emit('success')
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error('操作失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 初始化数据
onMounted(() => {
  initForm()
})

// 监听props.data变化，重新初始化表单
watch(() => props.data, () => {
  if (dialogVisible.value) {
    initForm()
  }
}, { deep: true })

// 监听modelValue变化，重新初始化表单
watch(() => dialogVisible.value, (newValue) => {
  if (newValue) {
    initForm()
  }
})
</script>

<style lang="scss" scoped>
.dialog-footer {
  text-align: right;
}

.score-desc {
  margin-top: 8px;
  color: #606266;
  font-size: 12px;
}

.el-divider {
  margin: 20px 0;
}
</style>