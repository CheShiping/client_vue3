<script lang="ts" setup>
import { ref } from 'vue';
import { ElButton, ElSpace } from 'element-plus';
import { CircleClose, Refresh } from '@element-plus/icons-vue';

const props = defineProps<{
  messages: {
    id?: string;
    content: string;
    role: 'user' | 'assistant';
    status?: 'sending' | 'success' | 'error';
  }[];
  onClose: () => void;
  onClearMessages: () => void;
}>();

const emit = defineEmits<{
  (e: 'clear-messages'): void;
}>();

const modalTitleRef = ref<HTMLDivElement | null>(null);

defineExpose({
  modalTitleRef
});
</script>

<template>
  <div 
    ref="modalTitleRef"
    class="chat-header"
  >
    <div class="header-title">
      ✨ 橙汁儿AI助理
    </div>
    <ElSpace :size="0">
      <ElButton
        type="text"
        :icon="Refresh"
        class="header-button"
        @click="$emit('clear-messages')"
      />
      <ElButton
        type="text"
        :icon="CircleClose"
        class="header-button"
        @click="onClose"
      />
    </ElSpace>
  </div>
</template>

<style scoped lang="scss">
.chat-header {
  height: 52px;
  box-sizing: border-box;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px 0 16px;
  cursor: move; // 显示可以拖拽
}

.header-title {
  font-weight: 600;
  font-size: 15px;
}

.header-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}
</style>