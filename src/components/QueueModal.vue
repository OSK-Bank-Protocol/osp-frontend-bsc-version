<template>
  <div class="modal-overlay">
    <div class="modal-content cool-modal">
      <!-- Tech corners -->
      <div class="tech-corner top-left"></div>
      <div class="tech-corner top-right"></div>
      <div class="tech-corner bottom-left"></div>
      <div class="tech-corner bottom-right"></div>

      <div class="modal-body-custom">
        <div class="queue-content">
          <div class="loading-spinner"></div>
          <p class="queue-text">{{ t('queue.applying') }}</p>
          <div class="countdown-display">
            <span class="number">{{ countdown }}</span>
            <span class="unit">{{ t('queue.seconds') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { t } from '@/i18n';

export default {
  name: 'QueueModal',
  props: {
    countdown: {
      type: Number,
      required: true,
      default: 0
    }
  },
  setup() {
    return {
      t,
    };
  }
};
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000; /* Higher than other modals */
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 360px;
  padding: 40px 32px;
  background: rgba(20, 20, 20, 0.95);
  border: 2px solid var(--border-light);
  /* Hand-drawn Box */
  border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  overflow: visible;
  
  /* Scientific Corner Marks */
  &::after {
      content: '';
      position: absolute;
      top: 10px; left: 10px; right: 10px; bottom: 10px;
      border: 1px dashed var(--text-muted);
      border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
      pointer-events: none;
      opacity: 0.3;
  }
}

/* Remove old tech corners */
.tech-corner { display: none; }

.modal-body-custom {
  width: 100%;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.queue-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.queue-text {
  color: #fff;
  font-size: 1.1rem;
  font-family: var(--font-body);
  line-height: 1.5;
}

.countdown-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 5px;
  
  .number {
    font-size: 3rem;
    font-weight: 700;
    color: var(--primary-gold);
    font-family: var(--font-mono);
    text-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
  }
  
  .unit {
    font-size: 1rem;
    color: var(--text-secondary);
  }
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(212, 175, 55, 0.3);
  border-radius: 50%;
  border-top-color: var(--primary-gold);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

