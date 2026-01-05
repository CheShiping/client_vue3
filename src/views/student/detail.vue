<template>
  <el-dialog
    v-model="visible"
    title="学生详情"
    width="600px"
    @close="handleClose"
  >
    <el-form
      :model="studentData"
      label-width="100px"
      disabled
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="学号">
            <el-input v-model="studentData.student_no" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="姓名">
            <el-input v-model="studentData.student_name" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="性别">
            <el-input v-model="studentData.student_gender" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="年龄">
            <el-input v-model="studentData.student_age" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item label="手机号">
        <el-input v-model="studentData.phone" />
      </el-form-item>
      
      <el-form-item label="邮箱">
        <el-input v-model="studentData.email" />
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
const studentData = ref({})

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.data) {
    studentData.value = { ...props.data }
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const handleClose = () => {
  visible.value = false
}
</script>