<template>
  <el-dialog
    v-model="visible"
    :title="formData.teacher_users_id ? '编辑教师' : '新增教师'"
    width="600px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      labelWidth="100px"
    >
      <el-form-item label="工号" prop="teacher_no">
        <el-input v-model="formData.teacher_no" placeholder="请输入工号" />
      </el-form-item>
      <el-form-item label="姓名" prop="teachers_name">
        <el-input v-model="formData.teachers_name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="性别" prop="gender_of_teachers">
        <el-select v-model="formData.gender_of_teachers" placeholder="请选择性别" style="width: 100%">
          <el-option label="男" value="男" />
          <el-option label="女" value="女" />
        </el-select>
      </el-form-item>
      <el-form-item label="年龄" prop="age_of_teachers">
        <el-input v-model="formData.age_of_teachers" placeholder="请输入年龄" />
      </el-form-item>
      <el-form-item label="院系" prop="department">
        <el-input v-model="formData.department" placeholder="请输入院系" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" placeholder="请输入邮箱" />
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
import { addTeacher, updateTeacher } from '@/api/teacher'

const props = defineProps({
  modelValue: Boolean,
  data: Object
})

const emit = defineEmits(['update:modelValue', 'success'])

const visible = ref(false)
const formRef = ref(null)
const loading = ref(false)

const formData = reactive({
  teacher_users_id: 0,
  teacher_no: '',
  teachers_name: '',
  gender_of_teachers: '',
  age_of_teachers: '',
  department: '',
  phone: '',
  email: ''
})

const rules = {
  teacher_no: [
    { required: true, message: '请输入工号', trigger: 'blur' }
  ],
  teachers_name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  gender_of_teachers: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  age_of_teachers: [
    { required: true, message: '请输入年龄', trigger: 'blur' }
  ],
  department: [
    { required: true, message: '请输入院系', trigger: 'blur' }
  ]
}

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.data) {
    Object.assign(formData, props.data)
  } else if (val) {
    Object.assign(formData, {
      teacher_users_id: 0,
      teacher_no: '',
      teachers_name: '',
      gender_of_teachers: '',
      age_of_teachers: '',
      department: '',
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
        if (formData.teacher_users_id) {
          await updateTeacher(formData.teacher_users_id, formData)
          ElMessage.success('更新成功')
        } else {
          await addTeacher(formData)
          ElMessage.success('新增成功')
        }
        emit('success')
        handleClose()
      } catch (error) {
        console.error('操作失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

