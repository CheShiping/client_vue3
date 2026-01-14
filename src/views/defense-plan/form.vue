<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="600px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      label-position="right"
    >
      <el-form-item label="计划名称" prop="plan_name">
        <el-input
          v-model="form.plan_name"
          placeholder="请输入计划名称"
          :disabled="readonly"
        />
      </el-form-item>
      <el-form-item label="答辩类型" prop="defense_type">
        <el-select
          v-model="form.defense_type"
          placeholder="请选择答辩类型"
          :disabled="readonly"
        >
          <el-option label="专科答辩" value="master" />
          <el-option label="本科答辩" value="bachelor" />
        </el-select>
      </el-form-item>
      <el-form-item label="开始时间" prop="start_time">
        <el-date-picker
          v-model="form.start_time"
          type="datetime"
          placeholder="请选择开始时间"
          style="width: 100%"
          :disabled="readonly"
        />
      </el-form-item>
      <el-form-item label="结束时间" prop="end_time">
        <el-date-picker
          v-model="form.end_time"
          type="datetime"
          placeholder="请选择结束时间"
          style="width: 100%"
          :disabled="readonly"
        />
      </el-form-item>
      <el-form-item label="计划描述" prop="plan_desc">
        <el-input
          v-model="form.plan_desc"
          type="textarea"
          :rows="4"
          placeholder="请输入计划描述"
          :disabled="readonly"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status" v-if="readonly">
        <el-tag :type="getStatusType(form.status)">
          {{ getStatusName(form.status) }}
        </el-tag>
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
import { addDefensePlan, updateDefensePlan } from '@/api/defense-plan'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: null
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
  plan_id: 0,
  plan_name: '',
  plan_desc: '',
  defense_type: 'bachelor',
  start_time: '',
  end_time: '',
  status: 1
})
// 提交状态
const submitting = ref(false)
// 只读状态
const readonly = ref(false)

// 对话框标题
const dialogTitle = computed(() => {
  return props.data?.plan_id ? '编辑答辩计划' : '新增答辩计划'
})

// 表单规则
const rules = {
  plan_name: [
    { required: true, message: '请输入计划名称', trigger: 'blur' }
  ],
  defense_type: [
    { required: true, message: '请选择答辩类型', trigger: 'change' }
  ],
  start_time: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  end_time: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ],
  plan_desc: [
    { required: true, message: '请输入计划描述', trigger: 'blur' }
  ]
}

// 初始化表单数据
const initForm = () => {
  // 重置表单
  Object.assign(form, {
    plan_id: 0,
    plan_name: '',
    plan_desc: '',
    defense_type: 'bachelor',
    start_time: '',
    end_time: '',
    status: 1
  })
  
  // 如果有数据，填充表单
  if (props.data) {
    Object.assign(form, props.data)
    // 检查是否为只读模式
    readonly.value = !!props.data.readonly
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
        // 检查时间范围
        if (new Date(form.end_time) <= new Date(form.start_time)) {
          ElMessage.error('结束时间必须大于开始时间')
          return
        }
        
        // 根据是否有ID判断是新增还是修改
        if (form.plan_id) {
          await updateDefensePlan(form.plan_id, form)
          ElMessage.success('修改成功')
        } else {
          await addDefensePlan(form)
          ElMessage.success('新增成功')
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

// 获取状态类型
const getStatusType = (status) => {
  switch (status) {
    case 1: return 'warning'
    case 2: return 'info'
    case 3: return 'success'
    case 4: return 'danger'
    default: return 'info'
  }
}

// 获取状态名称
const getStatusName = (status) => {
  switch (status) {
    case 1: return '待审核'
    case 2: return '已审核'
    case 3: return '已发布'
    case 4: return '已结束'
    default: return ''
  }
}

// 监听对话框可见性变化
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
</style>