<template>
  <el-dialog
    v-model="visible"
    :title="formData.teacher_id ? '编辑教师' : '新增教师'"
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
      <el-form-item label="姓名" prop="teacher_name">
        <el-input v-model="formData.teacher_name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="性别" prop="teacher_gender">
        <el-select v-model="formData.teacher_gender" placeholder="请选择性别" style="width: 100%">
          <el-option label="男" value="男" />
          <el-option label="女" value="女" />
        </el-select>
      </el-form-item>
      <el-form-item label="年龄" prop="teacher_age">
        <el-input-number v-model="formData.teacher_age" :min="0" :max="100" placeholder="请输入年龄" />
      </el-form-item>
      <el-form-item label="院系" prop="department_name">
        <el-input v-model="formData.department_name" placeholder="请输入院系" />
      </el-form-item>
      <el-form-item label="职称" prop="professional_title">
        <el-input v-model="formData.professional_title" placeholder="请输入职称" />
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
  teacher_id: 0,
  teacher_no: '',
  teacher_name: '',
  teacher_gender: '',
  teacher_age: '',
  department_name: '',
  professional_title: '',
  user_id: 0,
  state: 1
})

const rules = {
  teacher_no: [
    { required: true, message: '请输入工号', trigger: 'blur' }
  ],
  teacher_name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  teacher_gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  teacher_age: [
    { required: true, message: '请输入年龄', trigger: 'blur' }
  ],
  department_name: [
    { required: true, message: '请输入院系', trigger: 'blur' }
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
    Object.assign(formData, {
      teacher_id: 0,
      teacher_no: '',
      teacher_name: '',
      teacher_gender: '',
      teacher_age: '',
      department_name: '',
      professional_title: '',
      user_id: 0,
      state: 1
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
        if (formData.teacher_id) {
          await updateTeacher(formData.teacher_id, formData)
          ElMessage.success('更新成功')
        } else {
          await addTeacher(formData)
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

