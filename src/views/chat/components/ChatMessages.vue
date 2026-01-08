<script lang="ts" setup>
import { ElScrollbar, ElButton, ElAvatar, ElCard, ElSkeleton, ElSkeletonItem } from 'element-plus';
import {
  Refresh,
  DocumentCopy,
  CircleClose, Position
} from '@element-plus/icons-vue';

defineProps<{
  messages: {
    id?: string;
    content: string;
    role: 'user' | 'assistant';
    status?: 'sending' | 'success' | 'error';
  }[];
  isLoading: boolean;
}>();

const emit = defineEmits<{
  (e: 'retry', messageId: string): void;
  (e: 'copy', content: string): void;
  (e: 'like', messageId: string): void;
  (e: 'dislike', messageId: string): void;
  (e: 'question-click', question: string): void;
}>();

const MOCK_QUESTIONS = [
  '你好，你能帮我做什么？',
  '请介绍一下你自己',
  '如何使用这个系统？'
];

const AGENT_PLACEHOLDER = 'AI助手正在思考中...';

// 定义头像URL
const USER_AVATAR = 'https://avatars.githubusercontent.com/u/12345678'; // 用户头像占位符
const AI_AVATAR = 'https://avatars.githubusercontent.com/u/98765432'; // AI助手头像占位符
</script>

<template>
  <ElScrollbar class="chat-list">
    <div v-if="messages && messages.length > 0 && !(messages.length === 1 && messages[0]?.id === 'welcome')" class="chat-messages-container">
      <div
        v-for="message in messages"
        :key="message.id"
        :class="['message-item', message.role]"
      >
        <ElCard
          :class="['message-card', { 'user-message': message.role === 'user', 'assistant-message': message.role === 'assistant' }]"
          :style="{ maxWidth: 'calc(100% - 20px)' }"
        >
          <template #header v-if="message.role === 'assistant'">
            <div class="message-header">
              <ElAvatar :src="AI_AVATAR" size="small" />
              <span class="message-role">AI助手</span>
            </div>
          </template>

          <template #header v-if="message.role === 'user'">
            <div class="message-header">
              <ElAvatar :src="USER_AVATAR" size="small" />
              <span class="message-role">我</span>
            </div>
          </template>

          <div class="message-content" v-if="message.content">
            <div v-html="message.content" class="content-text"></div>

            <div v-if="message.role === 'assistant'" class="message-actions">
              <ElButton
                type="text"
                :icon="Refresh"
                size="small"
                @click="emit('retry', message.id!)"
              />
              <ElButton
                type="text"
                :icon="DocumentCopy"
                size="small"
                @click="emit('copy', message.content)"
              />
              <ElButton
                type="text"
                :icon="Position"
                size="small"
                @click="emit('like', message.id!)"
              />
              <ElButton
                type="text"
                :icon="CircleClose"
                size="small"
                @click="emit('dislike', message.id!)"
              />
            </div>
          </div>

          <div class="message-content" v-else-if="message.role === 'assistant' && !message.content">
            <div class="content-text placeholder-text">{{ AGENT_PLACEHOLDER }}</div>
          </div>

          <div class="message-content" v-else-if="message.status === 'sending'">
            <ElSkeleton :rows="2" animated>
              <template #template>
                <ElSkeletonItem variant="p" style="width: 80%" />
                <ElSkeletonItem variant="p" style="width: 70%" />
              </template>
            </ElSkeleton>
          </div>
        </ElCard>
      </div>
    </div>

    <div v-else class="welcome-container">
      <ElCard class="welcome-card">
        <h3 class="welcome-title">👋 你好，我是橙汁儿AI助理</h3>
        <p class="welcome-description">基于先进的人工智能技术，我可以回答问题、创作文字，如写故事、写公文、写邮件、写剧本、逻辑推理、编程等，还能表达观点，玩游戏等。</p>
      </ElCard>

      <div class="quick-prompts">
        <ElButton
          v-for="question in MOCK_QUESTIONS"
          :key="question"
          type="primary"
          plain
          size="small"
          @click="$emit('question-click', question)"
        >
          {{ question }}
        </ElButton>
      </div>
    </div>
  </ElScrollbar>
</template>

<style scoped lang="scss">
.chat-list {
  flex: 1;
  height: 100%;

  :deep(.el-scrollbar__wrap) {
    padding: 16px;
  }
  :deep(.el-scrollbar_view) {
    height:  calc(100% - 60px);
  }

  .chat-messages-container {
    overflow-y: auto
  }
}

.message-item {
  margin-bottom: 16px;

  &.user {
    display: flex;
    justify-content: flex-end;

    .message-card {
      border: 1px solid #409eff;

      :deep(.el-card__header) {
        background-color: #ecf5ff;
      }
    }
  }

  &.assistant {
    display: flex;
    justify-content: flex-start;

    .message-card {
      border: 1px solid #ebeef5;

      :deep(.el-card__header) {
        background-color: #f5f7fa;
      }
    }
  }
}

.message-card {
  border-radius: 8px;

  :deep(.el-card__header) {
    padding: 8px 12px;
    border-bottom: 1px solid #ebeef5;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  :deep(.el-card__body) {
    padding: 12px;
  }
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.message-role {
  font-weight: 500;
  font-size: 14px;
}

.message-content {
  .content-text {
    margin-bottom: 8px;
    line-height: 1.6;
  }

  .placeholder-text {
    color: #909399;
    font-style: italic;
  }

  .message-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-start;
  }
}

.welcome-container {
  .welcome-card {
    margin-bottom: 16px;
    border-radius: 8px;

    :deep(.el-card__body) {
      padding: 16px;
    }
  }

  .welcome-title {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
  }

  .welcome-description {
    margin: 0;
    color: #606266;
    line-height: 1.5;
  }
}

.quick-prompts {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .el-button {
    margin: 0;
    justify-content: flex-start;
    text-align: left;
  }
}
</style>