<template>
  <el-dialog
    v-model="visible"
    title="教师详情"
    width="600px"
    @close="handleClose"
  >
    <el-form
      :model="teacherData"
      label-width="100px"
      disabled
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="工号">
            <el-input v-model="teacherData.teacher_no" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="姓名">
            <el-input v-model="teacherData.teachers_name" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="性别">
            <el-input v-model="teacherData.gender_of_teachers" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="年龄">
            <el-input v-model="teacherData.age_of_teachers" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item label="院系">
        <el-input v-model="teacherData.department" />
      </el-form-item>
      
      <el-form-item label="手机号">
        <el-input v-model="teacherData.phone" />
      </el-form-item>
      
      <el-form-item label="邮箱">
        <el-input v-model="teacherData.email" />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  data: Object
})

const emit = defineEmits(['update:modelValue'])

const visible = ref(false)
const teacherData = ref({})

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.data) {
    teacherData.value = { ...props.data }
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const handleClose = () => {
  visible.value = false
}
</script>