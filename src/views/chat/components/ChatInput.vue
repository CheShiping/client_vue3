<script lang="ts" setup>
import { ref, watch } from 'vue';
import { ElInput, ElButton, ElMessage } from 'element-plus';
import { Search, Loading, Position } from '@element-plus/icons-vue';
import { EditorSender} from 'vue-element-plus-x';

const props = defineProps<{
  modelValue: string;
  isLoading: boolean;
  onStopGenerate: () => void;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'submit'): void;
  (e: 'quick-question', question: string): void;
}>();

// const senderRef = ref<InstanceType<typeof ElInput> | null>(null);

// 使用本地ref来处理输入值，并与props同步
const localValue = ref(props.modelValue);

// 监听props.modelValue的变化，更新本地值
watch(() => props.modelValue, (newValue) => {
  localValue.value = newValue;
});

// 处理回车键提交
const handleKeydown = (event: Event | KeyboardEvent) => {
  if (event instanceof KeyboardEvent && event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    emit('submit');
  }
};

const senderRef = ref();
const loading = ref(false);

function handleSubmit() {
  // 获取当前输入框的内容
  const senderValue = senderRef.value.getCurrentValue();
  console.log('senderValue', senderValue);
  if (!senderValue.text) {
    ElMessage.warning('请输入内容');
    return;
  }
  
  // 更新loading状态
  loading.value = true;
  
  // 发送提交事件
  emit('submit');
}

function handleCancel() {
  // 调用父组件的停止生成函数
  props.onStopGenerate();
  
  // 取消加载状态
  loading.value = false;
}

// 重置输入框内容
function resetInput() {
  if (senderRef.value && typeof senderRef.value.setValue === 'function') {
    senderRef.value.setValue(''); // 清空输入框内容
  }
  loading.value = false;
}

// 监听加载状态变化，当加载完成时重置输入框
watch(() => props.isLoading, (isLoading) => {
  if (!isLoading && loading.value) {
    // 当isLoading变为false且之前loading为true时，说明请求已完成
    resetInput();
  }
});
</script>

<template>
  <div class="chat-send">
    <div class="send-action">
      <ElButton @click="$emit('quick-question', '你好，你能帮我做什么？')">
        功能介绍
      </ElButton>
      <ElButton @click="$emit('quick-question', '请介绍一下你自己')">
        自我介绍
      </ElButton>
    </div>
    
    <div class="input-container">
      <EditorSender 
        ref="senderRef"
        v-model="localValue"
        :placeholder="isLoading ? 'AI正在思考中...' : '请输入您的问题...'"
        :disabled="isLoading"
        @input="(v: string) => emit('update:modelValue', v)"
        @keydown="handleKeydown"
      >
        <!-- 自定义操作列表 -->
        <template #action-list>
          <div class="action-list-self-wrap">

<el-button
            v-if="isLoading"
            type="primary"
            plain
            circle
            @click="handleCancel"
          >
            <el-icon class="is-loaidng">
              <Loading />
            </el-icon>
          </el-button>

          <el-button              v-else

              @click="handleSubmit" plain circle >
            <el-icon><Position /></el-icon>
          </el-button>
            <div class="action-list-self-wrap">

        </div>
          </div>
        </template>
      </EditorSender>
    </div>
  </div>
</template>

<style scoped lang="scss">
.chat-send {
  padding: 12px;
  border-top: 1px solid #ebeef5;
}

.send-action {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 8px;
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  .el-textarea {
    :deep(.el-textarea__inner) {
      min-height: 80px !important;
      max-height: 120px !important;
    }
  }
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  
  .el-button {
    min-width: 80px;
  }
}

.action-list-self-wrap {
  display: flex;
  align-items: center;
  & > span {
    width: 120px;
    font-weight: 600;
    color: var(--el-color-primary);
  }
}

.is-loading, .is-loaidng {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>