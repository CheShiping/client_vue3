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
      <el-form-item label="小组名称" prop="group_name">
        <el-input
          v-model="form.group_name"
          placeholder="请输入小组名称"
          :disabled="readonly"
        />
      </el-form-item>
      <el-form-item label="答辩计划" prop="plan_id">
        <el-select
          v-model="form.plan_id"
          placeholder="请选择答辩计划"
          :disabled="readonly"
        >
          <el-option
            v-for="plan in defensePlans"
            :key="plan.plan_id"
            :label="plan.plan_name"
            :value="plan.plan_id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="答辩地点" prop="venue_id">
        <el-select
          v-model="form.venue_id"
          placeholder="请选择答辩地点"
          :disabled="readonly"
        >
          <el-option
            v-for="venue in defenseVenues"
            :key="venue.venue_id"
            :label="venue.venue_name"
            :value="venue.venue_id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="答辩时间" prop="defense_time">
        <el-date-picker
          v-model="form.defense_time"
          type="datetime"
          placeholder="请选择答辩时间"
          style="width: 100%"
          :disabled="readonly"
        />
      </el-form-item>
      <el-form-item label="组长" prop="group_leader">
        <el-select
          v-model="form.group_leader"
          placeholder="请选择组长"
          :disabled="readonly"
        >
          <el-option
            v-for="teacher in teachers"
            :key="teacher.teacher_id"
            :label="teacher.teacher_name"
            :value="teacher.teacher_id"
          />
        </el-select>
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
import { addDefenseGroup, updateDefenseGroup } from '@/api/defense-group'
import { getTeacherList } from '@/api/teacher'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: null
  },
  defensePlans: {
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
  group_id: 0,
  plan_id: 0,
  group_name: '',
  group_leader: 0,
  venue_id: 0,
  defense_time: '',
  status: 1
})
// 提交状态
const submitting = ref(false)
// 只读状态
const readonly = ref(false)
// 教师列表
const teachers = ref([])
// 答辩地点列表
const defenseVenues = ref([
  { venue_id: 1, venue_name: '学术楼101' },
  { venue_id: 2, venue_name: '学术楼102' },
  { venue_id: 3, venue_name: '学术楼201' },
  { venue_id: 4, venue_name: '学术楼202' },
  { venue_id: 5, venue_name: '学术楼301' }
])

// 对话框标题
const dialogTitle = computed(() => {
  return props.data?.group_id ? '编辑答辩分组' : '新增答辩分组'
})

// 表单规则
const rules = {
  group_name: [
    { required: true, message: '请输入小组名称', trigger: 'blur' }
  ],
  plan_id: [
    { required: true, message: '请选择答辩计划', trigger: 'change' }
  ],
  venue_id: [
    { required: true, message: '请选择答辩地点', trigger: 'change' }
  ],
  defense_time: [
    { required: true, message: '请选择答辩时间', trigger: 'change' }
  ],
  group_leader: [
    { required: true, message: '请选择组长', trigger: 'change' }
  ]
}

// 加载教师列表
const loadTeachers = async () => {
  try {
    const res = await getTeacherList({ size: 100 })
    if (res.result) {
      teachers.value = res.result.list || []
    }
  } catch (error) {
    console.error('加载教师列表失败:', error)
    ElMessage.error('加载教师列表失败')
  }
}

// 初始化表单数据
const initForm = () => {
  // 重置表单
  Object.assign(form, {
    group_id: 0,
    plan_id: 0,
    group_name: '',
    group_leader: 0,
    venue_id: 0,
    defense_time: '',
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
        // 根据是否有ID判断是新增还是修改
        if (form.group_id) {
          await updateDefenseGroup(form.group_id, form)
          ElMessage.success('修改成功')
        } else {
          await addDefenseGroup(form)
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
    default: return ''
  }
}

// 获取状态名称
const getStatusName = (status) => {
  switch (status) {
    case 1: return '待开始'
    case 2: return '进行中'
    case 3: return '已结束'
    default: return ''
  }
}

// 初始化数据
onMounted(async () => {
  await loadTeachers()
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