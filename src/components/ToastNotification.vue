<template>
  <transition name="toast-fade">
    <div v-if="notification.visible" class="toast-notification">
      <i class="icon-CheckCircle" v-if="isSuccess"></i>
      <i class="icon-warning" v-else></i>
      <span class="message">{{ notification.message }}</span>
    </div>
  </transition>
</template>

<script>
import { notificationState } from '../services/notification';
import { computed } from 'vue';

export default {
  name: 'ToastNotification',
  setup() {
    // Simple heuristic to determine icon: if message contains "error", "fail", or "不足" (insufficient), treat as warning
    // Otherwise treat as success/info
    const isSuccess = computed(() => {
      const msg = notificationState.message.toLowerCase();
      return !msg.includes('error') && !msg.includes('fail') && !msg.includes('不足') && !msg.includes('失败');
    });

    return {
      notification: notificationState,
      isSuccess
    };
  }
};
</script>

<style scoped lang="scss">
.toast-notification {
  position: fixed;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 16px 32px;
  /* Hand-drawn pill/box */
  border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
  background: rgba(20, 20, 20, 0.95);
  color: #fff;
  font-size: 1rem;
  font-weight: 500;
  z-index: 9999;
  border: 2px solid var(--primary-gold);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 280px;
  justify-content: center;
  white-space: nowrap;
  
  /* Remove old glow pseudo */
  &::before { display: none; }

  i {
      font-size: 1.2rem;
      color: var(--primary-gold);
  }
  
  .message {
      font-family: var(--font-heading);
      letter-spacing: 1px;
      text-shadow: 1px 1px 0 rgba(0,0,0,0.5);
  }
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px) rotate(-2deg) scale(0.9);
}
</style>
