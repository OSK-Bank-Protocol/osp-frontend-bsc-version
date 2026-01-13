<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content cool-modal">
      <!-- Tech corners -->
      <div class="tech-corner top-left"></div>
      <div class="tech-corner top-right"></div>
      <div class="tech-corner bottom-left"></div>
      <div class="tech-corner bottom-right"></div>

      <div class="modal-body">
        <button @click="close" class="close-button">
            <i class="icon icon-close"></i>
        </button>

        <div class="title_holder">
          <h3>{{ title }}</h3>
          <div class="cyber-line"></div>
        </div>

        <div class="message-content">
          <p>{{ message }}</p>
        </div>

        <!-- Action Buttons -->
        <div class="button-group">
          <button @click.prevent="close" class="action-btn confirm-btn">
            {{ t('common.confirm') || 'OK' }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { t } from '@/i18n';

export default {
  name: 'AlertModal',
  props: {
    title: {
      type: String,
      default: 'Notice'
    },
    message: {
      type: String,
      default: ''
    }
  },
  setup() {
    return {
      t,
    };
  },
  methods: {
    close() {
      this.$emit('close');
    }
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
  z-index: 1060; // Higher than other modals
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 400px;
  padding: 32px;
  background: rgba(20, 20, 20, 0.95);
  border: 2px solid var(--border-light);
  /* Hand-drawn Box */
  border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  overflow: visible;
  
  /* Scientific Diagram Corner Marks */
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

.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;

  &:hover {
    color: var(--primary-gold);
    transform: scale(1.1) rotate(90deg);
  }
}

.title_holder {
  text-align: center;
  margin-bottom: 24px;

  h3 {
    font-family: var(--font-heading);
    font-size: 1.8rem;
    margin-bottom: 12px;
    color: #fff;
    font-weight: 400;
    letter-spacing: 1px;
    text-shadow: 2px 2px 0px rgba(0,0,0,0.5);
  }
  
  /* Chalk Underline */
  .cyber-line {
      width: 60px;
      height: 2px;
      background: var(--primary-gold);
      margin: 0 auto;
      /* Scribble effect */
      border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
      transform: rotate(-1deg);
      box-shadow: none;
  }
}

.message-content {
  text-align: center;
  color: var(--text-primary);
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 32px;
  font-family: var(--font-body);
  word-break: break-word;
  max-height: 60vh;
  overflow-y: auto;
  padding: 0 10px; /* Add some padding for scrollbar aesthetics */
}

.button-group {
  display: flex;
  justify-content: center;
}

.action-btn {
    padding: 12px 32px;
    /* Hand drawn pill */
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    font-weight: 600;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-body);
    
    &.confirm-btn {
        background: transparent; /* Outline style preferred for chalk */
        border: 2px solid var(--primary-gold);
        color: var(--primary-gold);
        
        &:hover {
            background: rgba(212, 175, 55, 0.1);
            box-shadow: 0 0 20px rgba(212, 175, 55, 0.2);
            transform: rotate(1deg);
        }
    }
}
</style>

