<script lang="ts" setup>
import { ref, watch } from 'vue';
import { ElInput, ElButton } from 'element-plus';
import { Search } from '@element-plus/icons-vue';

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

const senderRef = ref<InstanceType<typeof ElInput> | null>(null);

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
      <ElInput
        ref="senderRef"
        v-model="localValue"
        type="textarea"
        :autosize="{ minRows: 2, maxRows: 4 }"
        :placeholder="isLoading ? 'AI正在思考中...' : '请输入您的问题...'"
        :disabled="isLoading"
        @input="(v: string) => emit('update:modelValue', v)"
        @keydown="handleKeydown"
      />
      
      <div class="input-actions">
        <ElButton 
          v-if="isLoading" 
          type="danger" 
          plain 
          @click="onStopGenerate"
        >
          停止生成
        </ElButton>
        <ElButton 
          v-else
          type="primary" 
          :icon="Search"
          :disabled="!modelValue.trim() || isLoading"
          @click="$emit('submit')"
        >
          发送
        </ElButton>
      </div>
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
</style>