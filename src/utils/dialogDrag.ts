import { ref, computed, watch, watchEffect } from 'vue';
import type { Ref } from 'vue';
import { useDraggable } from '@vueuse/core';

/**
 * 模态框拖拽功能组合式函数
 * @param modalTitleRef 模态框标题栏的引用
 * @returns 包含拖拽相关状态和样式的对象
 */
export function useDialogDrag(modalTitleRef: Ref<HTMLElement | null>) {
  // 使用 useDraggable 创建拖拽相关响应式数据
  const { x, y, isDragging } = useDraggable(modalTitleRef);

  // 定义拖拽相关的响应式变量
  const startX = ref(0);
  const startY = ref(0);
  const startedDrag = ref(false);
  const preTransformX = ref(0);
  const preTransformY = ref(0);
  const dragRect = ref({ left: 0, right: 0, top: 0, bottom: 0 });
  const transformX = ref(0);
  const transformY = ref(0);

  // 监听坐标变化，初始化拖拽参数
  watch([x, y], () => {
    if (!startedDrag.value) {
      startX.value = x.value;
      startY.value = y.value;
      const bodyRect = document.body.getBoundingClientRect();
      const titleRect = modalTitleRef.value?.getBoundingClientRect();
      if (titleRect) {
        dragRect.value.right = bodyRect.width - titleRect.width;
        dragRect.value.bottom = bodyRect.height - titleRect.height;
      }
      preTransformX.value = transformX.value;
      preTransformY.value = transformY.value;
    }
    startedDrag.value = true;
  });

  // 监听拖拽状态变化
  watch(isDragging, (dragging) => {
    if (!dragging) startedDrag.value = false;
  });

  // 计算变换位置
  watchEffect(() => {
    if (startedDrag.value) {
      transformX.value =
        preTransformX.value +
        Math.min(Math.max(dragRect.value.left, x.value), dragRect.value.right) -
        startX.value;
      transformY.value =
        preTransformY.value +
        Math.min(Math.max(dragRect.value.top, y.value), dragRect.value.bottom) -
        startY.value;
    }
  });

  // 返回变换样式
  const transformStyle = computed(() => ({
    transform: `translate(${transformX.value}px, ${transformY.value}px)`,
  }));

  return {
    transformStyle
  };
}