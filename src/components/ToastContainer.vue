<script lang="ts" setup>
import { useCustomModal } from '@/composables/useCustomModal.ts';

const { toasts, removeToast } = useCustomModal();
</script>

<template>
  <div class="toast-container">
    <TransitionGroup name="toast" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast', `toast-${toast.type}`, { 'toast-show': toast.show }]"
        @click="removeToast(toast.id)"
      >
        <div class="toast-content">
          <div class="toast-icon">
            <span v-if="toast.type === 'success'">✓</span>
            <span v-else-if="toast.type === 'error'">✕</span>
            <span v-else-if="toast.type === 'warning'">⚠</span>
            <span v-else>ℹ</span>
          </div>
          <div class="toast-message">{{ toast.message }}</div>
          <button class="toast-close" @click.stop="removeToast(toast.id)">×</button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  min-width: 300px;
  max-width: 400px;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.3s ease;
  transform: translateX(100px);
  opacity: 0;
}

.toast-show {
  transform: translateX(0);
  opacity: 1;
}

.toast-success {
  background-color: #d4edda;
  border-left: 4px solid #28a745;
  color: #155724;
}

.toast-error {
  background-color: #f8d7da;
  border-left: 4px solid #dc3545;
  color: #721c24;
}

.toast-warning {
  background-color: #fff3cd;
  border-left: 4px solid #ffc107;
  color: #856404;
}

.toast-info {
  background-color: #d1ecf1;
  border-left: 4px solid #17a2b8;
  color: #0c5460;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toast-icon {
  font-size: 18px;
  font-weight: bold;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  font-size: 14px;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: inherit;
  opacity: 0.5;
  transition: opacity 0.2s;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-close:hover {
  opacity: 1;
}

/* 다크 모드 지원 */
:root.dark .toast-success {
  background-color: #2d5a3d;
  color: #9fdf9f;
}

:root.dark .toast-error {
  background-color: #5a2d2d;
  color: #ff9999;
}

:root.dark .toast-warning {
  background-color: #5a5a2d;
  color: #ffff99;
}

:root.dark .toast-info {
  background-color: #2d4a5a;
  color: #99ccff;
}

/* 애니메이션 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100px);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100px);
  opacity: 0;
}
</style>