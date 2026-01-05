<template>
  <el-dialog
    v-model="visible"
    :title="getDialogTitle"
    width="800px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
      :disabled="mode === 'view'"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="资料名称" prop="defense_material_name">
            <el-input v-model="formData.defense_material_name" placeholder="请输入资料名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="资料类型" prop="material_type">
            <el-select v-model="formData.material_type" placeholder="请选择资料类型" style="width: 100%">
              <el-option label="答辩PPT" value="答辩PPT" />
              <el-option label="材料终稿" value="论文终稿" />
              <el-option label="开题报告" value="开题报告" />
              <el-option label="中期报告" value="中期报告" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="关联答辩" prop="defense_id">
            <el-select v-model="formData.defense_id" placeholder="请选择关联答辩" style="width: 100%">
              <el-option 
                v-for="defense in defenseList" 
                :key="defense.defense_information_id" 
                :label="defense.thesis_title" 
                :value="defense.defense_information_id" 
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="关联学生" prop="student_id">
            <el-select 
              v-model="formData.student_id" 
              placeholder="请选择关联学生" 
              style="width: 100%" 
              :disabled="userStore.userInfo.user_group !== 'teacher' && userStore.userInfo.user_group !== 'admin' || mode === 'edit'">
              <el-option 
                v-for="student in studentList" 
                :key="student.student_users_id" 
                :label="student.student_name" 
                :value="student.student_users_id" 
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item label="选择文件" prop="selected_file" v-if="mode !== 'view'">
        <el-upload
          ref="uploadRef"
          :file-list="fileList"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          :auto-upload="false"
          :limit="1"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar,.txt,.xls,.xlsx"
        >
          <el-button size="small" type="primary">选取文件</el-button>
          <template #tip>
            <div class="el-upload__tip">只能上传指定类型的文件，且不超过50MB</div>
          </template>
        </el-upload>
      </el-form-item>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="上传时间" prop="upload_time">
            <el-date-picker
              v-model="formData.upload_time"
              type="date"
              placeholder="请选择上传时间"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="文件大小(MB)" prop="file_size">
            <el-input v-model="formData.file_size" placeholder="文件大小将自动计算" :disabled="true" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item label="资料描述" prop="material_description">
        <el-input
          v-model="formData.material_description"
          type="textarea"
          :rows="3"
          placeholder="请输入资料描述"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="handleClose" v-if="mode !== 'view'">取消</el-button>
      <el-button @click="handleClose" v-else>关闭</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit" v-if="mode !== 'view'">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { addPaper, updatePaper, getPaperDetail } from '@/api/defense-material'
import { getStudentList, getStudentByUserId } from '@/api/student'
import { getDefenseList } from '@/api/defense'
import { useUserStore } from '@/stores/user'
import { uploadFile } from '@/api/file' // 导入文件上传API

const props = defineProps({
  modelValue: Boolean,
  data: Object,
  mode: {
    type: String,
    default: 'add' // add, edit, view
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const visible = ref(false)
const formRef = ref(null)
const uploadRef = ref(null)
const loading = ref(false)
const studentList = ref([])
const defenseList = ref([])
const fileList = ref([])  // 文件列表

const userStore = useUserStore()  // 添加用户存储

const formData = reactive({
  paper_information_id: 0,
  defense_material_name: '',  // 新的字段
  material_type: '',          // 新的字段
  defense_id: null,           // 关联答辩
  student_id: null,           // 关联学生
  upload_time: '',
  file_size: '',              // 文件大小
  file_path: '',              // 文件路径
  material_description: '',   // 资料描述
  upload_user_id: null,       // 添加上传用户ID字段
  // 保留原来的字段以确保兼容性
  thesis_title: '',
  instructor: null,
  paper_type: '',
  upload_students: null,
  thesis_evaluation: '',
  teachers_opinion: '',
  paper_comments: '',
  topic_id: null
})

const getDialogTitle = computed(() => {
  switch (props.mode) {
    case 'view':
      return '查看答辩资料'
    case 'edit':
      return '编辑答辩资料'
    default:
      return '上传答辩资料'
  }
})

const rules = {
  defense_material_name: [
    { required: true, message: '请输入资料名称', trigger: 'blur' }
  ],
  material_type: [
    { required: true, message: '请选择资料类型', trigger: 'change' }
  ],
  defense_id: [
    { required: true, message: '请选择关联答辩', trigger: 'change' }
  ],
  student_id: [
    { required: true, message: '请选择关联学生', trigger: 'change' }
  ],
  upload_time: [
    { required: true, message: '请选择上传时间', trigger: 'change' }
  ]
}

// 获取学生列表
const loadStudentList = async () => {
  try {
    const res = await getStudentList({ page: 1, size: 1000 })
    if (res.result && res.result.list) {
      studentList.value = res.result.list
    }
  } catch (error) {
    console.error('获取学生列表失败:', error)
    ElMessage.error('获取学生列表失败')
  }
}

// 获取答辩列表
const loadDefenseList = async () => {
  try {
    const res = await getDefenseList({ page: 1, size: 1000 })
    if (res.result && res.result.list) {
      defenseList.value = res.result.list
    }
  } catch (error) {
    console.error('获取答辩列表失败:', error)
    ElMessage.error('获取答辩列表失败')
  }
}

// 处理文件选择变化
const handleFileChange = (file, fileList) => {
  if (fileList.length > 1) {
    // 只保留最后一个上传的文件
    fileList.value = [fileList[fileList.length - 1]]
  } else {
    fileList.value = fileList
  }
  
  // 自动设置文件名和文件大小
  if (file && file.raw) {
    const rawFile = file.raw
    formData.defense_material_name = rawFile.name
    // 计算文件大小（MB）
    const sizeInMB = (rawFile.size / (1024 * 1024)).toFixed(2)
    formData.file_size = sizeInMB
  }
}

// 处理文件移除
const handleFileRemove = () => {
  fileList.value = []
  formData.file_size = ''
}

// 上传文件到服务器
const uploadFileToServer = async (file) => {
  const formData = new FormData();
  formData.append('file', file.raw);
  formData.append('fileName', file.name);
  formData.append('fileSize', file.size);
  formData.append('originalName', file.name);

  try {
    const response = await uploadFile(formData);
    return response.result;
  } catch (error) {
    console.error('文件上传失败:', error);
    throw error;
  }
}

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.data) {
    if (props.mode === 'view' && props.data.paper_information_id) {
      // 查看模式下获取最新数据
      loadPaperDetail(props.data.paper_information_id)
    } else {
      Object.assign(formData, props.data)
      // 如果是学生用户且是编辑模式，确保student_id是自己的ID
      if (userStore.userInfo.user_group === 'student' && props.mode === 'edit') {
        formData.student_id = userStore.userInfo.user_id
        formData.upload_students = userStore.userInfo.user_id
      }
    }
  } else if (val) {
    // 重置表单
    resetForm()
    fileList.value = []  // 重置文件列表
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const loadPaperDetail = async (id) => {
  try {
    const res = await getPaperDetail(id)
    if (res.result) {
      Object.assign(formData, res.result)
    }
  } catch (error) {
    console.error('获取答辩资料详情失败:', error)
    ElMessage.error('获取答辩资料详情失败')
  }
}

// 组件挂载时加载数据
onMounted(() => {
  // 如果是学生用户，需要获取其学生ID
  if (userStore.userInfo.user_group === 'student') {
    // 通过API获取学生ID
    getStudentByUserId(userStore.userInfo.user_id).then(response => {
      if (response && response.result && response.result.student_users_id) {
        const studentId = response.result.student_users_id;
        formData.student_id = studentId
        formData.upload_students = studentId
      }
    }).catch(error => {
      console.error('获取学生信息失败:', error)
    });
    
    // 学生也需要答辩列表来选择关联的答辩
    loadDefenseList()
  } else {
    // 教师或管理员需要加载完整的学生列表和答辩列表
    loadStudentList()
    loadDefenseList()
  }
})

const resetForm = () => {
  Object.assign(formData, {
    paper_information_id: 0,
    defense_material_name: '',
    material_type: '',
    defense_id: null,
    student_id: userStore.userInfo.user_group === 'student' ? userStore.userInfo.user_id : null, // 学生默认为自己的ID
    upload_time: '',
    file_size: '',
    file_path: '',
    material_description: '',
    upload_user_id: userStore.userInfo.user_group === 'student' ? userStore.userInfo.user_id : null, // 设置上传用户ID
    // 保留原来的字段以确保兼容性
    thesis_title: '',
    instructor: null,
    paper_type: '',
    upload_students: null,
    thesis_evaluation: '',
    teachers_opinion: '',
    paper_comments: '',
    topic_id: null
  })
  fileList.value = []
}

const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
  fileList.value = []
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        let uploadResult = null;
        
        // 如果是新增模式且有文件需要上传
        if (props.mode === 'add' && fileList.value.length > 0 && fileList.value[0].raw) {
          // 上传文件到服务器
          uploadResult = await uploadFileToServer(fileList.value[0])
        }
        
        // 准备提交数据
        const submitData = {
          ...formData,
          thesis_title: formData.defense_material_name,
          paper_type: formData.material_type,
          // 根据用户角色正确设置上传学生ID
          upload_students: userStore.userInfo.user_group === 'student' 
            ? userStore.currentStudentId  // 使用存储的学生ID
            : formData.student_id,
          // 使用上传接口返回的文件路径
          file_path: uploadResult ? uploadResult.filePath : formData.file_path,
          // 保存文件ID以便后续下载
          file_id: uploadResult ? uploadResult.fileId : formData.file_id
        }
        
        if (props.mode === 'add') {
          await addPaper(submitData)
          ElMessage.success('上传成功')
        } else {
          if (formData.paper_information_id) {
            // 编辑时也确保学生用户信息正确
            if (userStore.userInfo.user_group === 'student') {
              submitData.upload_students = userStore.currentStudentId  // 使用存储的学生ID
            }
            await updatePaper(formData.paper_information_id, submitData)
            ElMessage.success('更新成功')
          }
        }
        
        emit('success')
        handleClose()
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error('操作失败: ' + error.message)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>