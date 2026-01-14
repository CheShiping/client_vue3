<template>
  <el-dialog
    v-model="visible"
    :title="formData.student_id ? '编辑学生' : '新增学生'"
    width="600px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      labelWidth="100px"
    >
      <el-form-item label="学号" prop="student_no">
        <el-input v-model="formData.student_no" placeholder="请输入学号" />
      </el-form-item>
      <el-form-item label="姓名" prop="student_name">
        <el-input v-model="formData.student_name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="性别" prop="student_gender">
        <el-select v-model="formData.student_gender" placeholder="请选择性别" style="width: 100%">
          <el-option label="男" value="男" />
          <el-option label="女" value="女" />
        </el-select>
      </el-form-item>
      <el-form-item label="年龄" prop="student_age">
        <el-input-number v-model="formData.student_age" :min="0" :max="100" placeholder="请输入年龄" />
      </el-form-item>
      <el-form-item label="班级" prop="class_name">
        <el-input v-model="formData.class_name" placeholder="请输入班级" />
      </el-form-item>
      <el-form-item label="专业" prop="major_name">
        <el-input v-model="formData.major_name" placeholder="请输入专业" />
      </el-form-item>
      <el-form-item label="年级" prop="grade">
        <el-input v-model="formData.grade" placeholder="请输入年级" />
      </el-form-item>
      <el-form-item label="用户ID" prop="user_id">
        <el-input-number v-model="formData.user_id" :min="1" placeholder="请输入用户ID" />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { addStudent, updateStudent } from '@/api/student'

const props = defineProps({
  modelValue: Boolean,
  data: Object
})

const emit = defineEmits(['update:modelValue', 'success'])

const visible = ref(false)
const formRef = ref(null)
const loading = ref(false)

const formData = reactive({
  student_id: 0,
  student_no: '',
  student_name: '',
  student_gender: '',
  student_age: '',
  class_name: '',
  major_name: '',
  grade: '',
  user_id: 0,
  state: 1
})

const rules = {
  student_no: [
    { required: true, message: '请输入学号', trigger: 'blur' }
  ],
  student_name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  student_gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  student_age: [
    { required: true, message: '请输入年龄', trigger: 'blur' }
  ],
  user_id: [
    { required: true, message: '请输入用户ID', trigger: 'blur' }
  ]
}

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.data) {
    Object.assign(formData, props.data)
  } else if (val) {
    // 重置表单
    Object.assign(formData, {
      student_users_id: 0,
      student_no: '',
      student_name: '',
      student_gender: '',
      student_age: '',
      phone: '',
      email: ''
    })
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        if (formData.student_id) {
          await updateStudent(formData.student_id, formData)
          ElMessage.success('更新成功')
        } else {
          await addStudent(formData)
          ElMessage.success('新增成功')
        }
        emit('success')
        handleClose()
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error('操作失败: ' + (error.response?.data?.error?.message || '服务器错误'))
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

