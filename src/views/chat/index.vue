<script lang="ts" setup>
import { ref, nextTick, computed, watch } from 'vue';
import { bot } from '@/ai/bot'; // 导入Bot实例
import ChatHeader from './components/ChatHeader.vue';
import ChatMessages from './components/ChatMessages.vue';
import ChatInput from './components/ChatInput.vue';
import { useDialogDrag } from '@/utils/dialogDrag'; // 导入拖拽功能
import { ElDialog } from 'element-plus';

// 使用 props 和 emit 控制显隐
const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'update:messages', messages: ChatMessage[]): void;
}>();

// 定义对话消息类型
interface ChatMessage {
  id?: string;
  content: string;
  role: 'user' | 'assistant';
  status?: 'sending' | 'success' | 'error';
}

// refs
const chatHeaderRef = ref<InstanceType<typeof ChatHeader> | null>(null);
const chatMessagesRef = ref<InstanceType<typeof ChatMessages> | null>(null);

// ==================== State ====================
const inputValue = ref('');
// 将消息状态改为响应式，以便在对话框打开时重置
const messages = ref<ChatMessage[]>([]);
const isLoading = ref(false);
const abortController = ref<AbortController | null>(null);

// 使用拖拽功能
const modalTitleRef = computed(() => chatHeaderRef.value?.modalTitleRef || null);
const { transformStyle } = useDialogDrag(modalTitleRef);

// 监听 open 属性变化，当对话框打开时重置消息
watch(() => props.open, (newOpen) => {
  if (newOpen) {
    // 对话框打开时，如果还没有任何消息，则显示欢迎消息
    if (messages.value.length === 0) {
      messages.value = [
        {
          id: 'welcome',
          content: '你好！我是橙汁儿AI助理，有什么我可以帮你的吗？',
          role: 'assistant',
          status: 'success'
        }
      ];
    }
    // 重置其他状态
    inputValue.value = '';
    isLoading.value = false;
    if (abortController.value) {
      abortController.value.abort();
      abortController.value = null;
    }
  } else {
    // 对话框关闭时，不重置消息，保持对话历史
  }
}, { immediate: true });

// ==================== Event ====================
const handleUserSubmit = async (value: string) => {
  if (!value.trim() || isLoading.value) return;

  // 添加用户消息
  const userMessage: ChatMessage = {
    id: Date.now().toString(),
    content: value,
    role: 'user',
    status: 'success'
  };

  messages.value.push(userMessage);

  // 添加 AI 回复占位符
  const aiMessageId = (Date.now() + 1).toString();
  const aiMessage: ChatMessage = {
    id: aiMessageId,
    content: '',
    role: 'assistant',
    status: 'sending'
  };

  messages.value.push(aiMessage);
  isLoading.value = true;

  try {
    // 创建新的 AbortController 用于可能的请求中断
    abortController.value = new AbortController();

    // 用流式聊天函数
    const stream = await bot.askStreaming(value, { signal: abortController.value.signal });

    // 逐块处理流式响应
    for await (const chunk of stream) {
      // 检查是否已中断
      if (abortController.value?.signal.aborted) {
        break;
      }

      // 更新 AI 消息内容
      const lastMessage = messages.value[messages.value.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        lastMessage.content += chunk.content;
        lastMessage.status = 'success';
      }

      // 滚动到底部
      nextTick(() => {
        // 使用暴露的scrollbarRef
        if (chatMessagesRef.value?.scrollbarRef) {
          const scrollbar = chatMessagesRef.value.scrollbarRef;
          // 获取滚动容器的滚动高度并滚动到底部
          const scrollHeight = scrollbar.wrapRef?.scrollHeight;
          const clientHeight = scrollbar.wrapRef?.clientHeight;
          
          if (scrollHeight && clientHeight) {
            scrollbar.setScrollTop(scrollHeight - clientHeight);
          }
        }
      });
    }
  } catch (error: unknown) {
    // 处理错误或中断情况
    const lastMessage = messages.value[messages.value.length - 1];
    if (lastMessage) {
      if ((error as Error).name === 'AbortError' || (error as Error).message === 'Request aborted') {
        // 请求被中断时，保留已生成的内容，仅更新状态
        if (lastMessage.role === 'assistant') {
          // 只有当消息内容为空时才显示"请求已被取消"
          if (!lastMessage.content) {
            lastMessage.content = '请求已被取消';
          }
          lastMessage.status = 'error';
        }
      } else {
        if (lastMessage.role === 'assistant') {
          lastMessage.content = '请求失败，请重试！';
          lastMessage.status = 'error';
        }
      }
    }
  } finally {
    isLoading.value = false;
  }
};

const handleClose = () => {
  // 如果正在加载，只中断请求但不改变消息状态
  if (isLoading.value && abortController.value) {
    abortController.value.abort();
  }
  emit('update:open', false);
};

// 新增函数：停止生成
const handleStopGenerate = () => {
  if (isLoading.value && abortController.value) {
    // 记录中断操作
    console.log('Stopping generation...');
    abortController.value.abort();
    // 立即设置加载状态为 false
    isLoading.value = false;
    // 强制刷新UI
    nextTick(() => {});
  }
};

const handleClearMessages = () => {
  messages.value = [{
    id: 'welcome',
    content: '你好！我是橙汁儿AI助理，有什么我可以帮你的吗？',
    role: 'assistant',
    status: 'success'
  }];
};

const handleRetry = (messageId: string) => {
  // TODO: 实现重试功能
  console.log('Retry message:', messageId);
};

const handleCopy = (content: string) => {
  // TODO: 实现复制功能
  console.log('Copy content:', content);
};

const handleLike = (messageId: string) => {
  // TODO: 实现点赞功能
  console.log('Like message:', messageId);
};

const handleDislike = (messageId: string) => {
  // TODO: 实现点赞功能
  console.log('Dislike message:', messageId);
};

const handleQuestionClick = (question: string) => {
  handleUserSubmit(question);
};

const handleQuickQuestion = (question: string) => {
  handleUserSubmit(question);
};
</script>

<template>
  <!-- 使用 Element Plus Dialog 实现对话框 -->
  <el-dialog
    v-model="props.open"
    :show-close="false"
    :width="520"
    :modal="false"
    :align-center="true"
    draggable
    class="ai-assistant-modal"
    :style="transformStyle"
    :z-index="9998"
  @closed="handleClose"
  >
    <div class="chat-wrapper">
      <!-- 对话区 - header -->
      <ChatHeader
        ref="chatHeaderRef"
        :messages="messages"
        @close="handleClose"
        @clear-messages="handleClearMessages"
      />

      <!-- 对话区 - 消息列表 -->
      <ChatMessages
        ref="chatMessagesRef"
        :messages="messages"
        :is-loading="isLoading"
        @retry="handleRetry"
        @copy="handleCopy"
        @like="handleLike"
        @dislike="handleDislike"
        @question-click="handleQuestionClick"
      />

      <!-- 对话区 - 输入框 -->
      <ChatInput
        v-model="inputValue"
        :is-loading="isLoading"
        @submit="(value) => {
          handleUserSubmit(value);
          inputValue = '';
        }"
        @stop-generate="handleStopGenerate"
        @quick-question="handleQuickQuestion"
      />
    </div>
</el-dialog>
</template>

<style scoped lang="scss">
.chat-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 600px;
  // 调整Element Plus对话框的默认样式
  :deep(.el-dialog__header) {
    padding: 0;
  }
  :deep(.el-dialog__body) {
    padding: 0;
    height: 548px; // 600px - 52px header
    display: flex;
    flex-direction: column;
  }
}

:deep(.el-overlay-dialog) {
  pointer-events: none;
  .el-dialog {
    pointer-events: auto;
  }
}
</style>
