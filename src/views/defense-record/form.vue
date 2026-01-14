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
      <el-form-item label="答辩日期" prop="defense_date">
        <el-date-picker
          v-model="form.defense_date"
          type="date"
          placeholder="请选择答辩日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 100%"
          :disabled="readonly"
        />
      </el-form-item>
      <el-form-item label="答辩时间" prop="defense_time">
        <el-time-picker
          v-model="form.defense_time"
          type="time"
          placeholder="请选择答辩时间"
          format="HH:mm"
          value-format="HH:mm"
          style="width: 100%"
          :disabled="readonly"
        />
      </el-form-item>
      <el-form-item label="答辩地点" prop="venue_name">
        <el-input
          v-model="form.venue_name"
          placeholder="请输入答辩地点"
          :disabled="readonly"
        />
      </el-form-item>
      <el-form-item label="答辩记录" prop="record_content">
        <el-input
          v-model="form.record_content"
          type="textarea"
          rows="6"
          placeholder="请输入答辩记录"
          :disabled="readonly"
        />
      </el-form-item>
      <el-form-item label="答辩结论" prop="defense_result">
        <el-select
          v-model="form.defense_result"
          placeholder="请选择答辩结论"
          :disabled="readonly"
        >
          <el-option label="通过" value="pass" />
          <el-option label="未通过" value="fail" />
          <el-option label="缓答辩" value="delay" />
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="form.remark"
          type="textarea"
          rows="3"
          placeholder="请输入备注"
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
import { updateDefenseRecord } from '@/api/defense-record'

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
  record_id: 0,
  student_id: 0,
  student_name: '',
  student_id: '',
  group_id: 0,
  paper_id: 0,
  paper_title: '',
  defense_date: '',
  defense_time: '',
  venue_name: '',
  record_content: '',
  defense_result: 'pass',
  remark: ''
})
// 提交状态
const submitting = ref(false)
// 只读状态
const readonly = ref(false)

// 对话框标题
const dialogTitle = computed(() => {
  return props.data?.readonly ? '查看答辩记录' : '编辑答辩记录'
})

// 表单规则
const rules = {
  defense_date: [
    { required: true, message: '请选择答辩日期', trigger: 'change' }
  ],
  defense_time: [
    { required: true, message: '请选择答辩时间', trigger: 'change' }
  ],
  venue_name: [
    { required: true, message: '请输入答辩地点', trigger: 'blur' }
  ],
  record_content: [
    { required: true, message: '请输入答辩记录', trigger: 'blur' }
  ],
  defense_result: [
    { required: true, message: '请选择答辩结论', trigger: 'change' }
  ]
}

// 初始化表单数据
const initForm = () => {
  // 重置表单
  Object.assign(form, {
    record_id: 0,
    student_id: 0,
    student_name: '',
    student_id: '',
    group_id: 0,
    paper_id: 0,
    paper_title: '',
    defense_date: '',
    defense_time: '',
    venue_name: '',
    record_content: '',
    defense_result: 'pass',
    remark: ''
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
        // 修改答辩记录
        await updateDefenseRecord(form.record_id, form)
        ElMessage.success('编辑成功')
        
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
</style>