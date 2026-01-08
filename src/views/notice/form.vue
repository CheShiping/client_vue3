<template>
  <el-dialog
    v-model="visible"
    :title="formData.notice_id ? '编辑通知' : '发布通知'"
    width="800px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="标题" prop="notice_title">
        <el-input v-model="formData.notice_title" placeholder="请输入标题" />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择类型" style="width: 100%">
          <el-option label="公告" value="公告" />
          <el-option label="通知" value="通知" />
          <el-option label="介绍" value="介绍" />
          <el-option label="联系" value="联系" />
        </el-select>
      </el-form-item>
      <el-form-item label="内容" prop="content">
        <el-input
          v-model="formData.content"
          type="textarea"
          :rows="10"
          placeholder="请输入内容（支持HTML）"
        />
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
import { addNotice, updateNotice } from '@/api/notice'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  modelValue: Boolean,
  data: Object
})

const emit = defineEmits(['update:modelValue', 'success'])

const userStore = useUserStore()

const visible = ref(false)
const formRef = ref(null)
const loading = ref(false)

const formData = reactive({
  notice_id: 0,
  notice_title: '',
  type: '公告',
  content: ''
})

const rules = {
  notice_title: [
    { required: true, message: '请输入标题', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择类型', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' }
  ]
}

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.data) {
    Object.assign(formData, props.data)
  } else if (val) {
    Object.assign(formData, {
      notice_id: 0,
      notice_title: '',
      type: '公告',
      content: ''
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
        if (formData.notice_id) {
          await updateNotice(formData.notice_id, formData)
          ElMessage.success('更新成功')
        } else {
          // 添加发布者信息和发布时间
          const now = new Date()
          const noticeData = {
            ...formData,
            notice_publisher: userStore.userInfo.nickname || userStore.userInfo.username,
            release_time: now.toISOString().slice(0, 19).replace('T', ' ')
          }
          await addNotice(noticeData)
          ElMessage.success('发布成功')
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

