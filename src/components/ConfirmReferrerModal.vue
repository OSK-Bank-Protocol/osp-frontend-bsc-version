<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content cool-modal">
      <!-- Tech corners -->
      <div class="tech-corner top-left"></div>
      <div class="tech-corner top-right"></div>
      <div class="tech-corner bottom-left"></div>
      <div class="tech-corner bottom-right"></div>

      <div class="modal-body-custom">
        <button @click="$emit('close')" class="close-button">
            <i class="icon icon-close"></i>
        </button>

        <div class="title_holder">
          <h3>{{ t('referrer.title') }}</h3>
        </div>
        
        <div class="form-group">
          <label class="form-label">{{ t('referrer.addressLabel') }}</label>
          <div class="address-box">
            <span v-if="isLoading">{{ t('referrer.loading') }}</span>
            <div v-else class="address-display">
               <span class="normal">0x</span>
               <span class="highlight">{{ addressHead }}</span>
               <span class="normal">{{ addressBody }}</span>
               <span class="highlight">{{ addressTail }}</span>
            </div>
          </div>
          <p class="warning-text">⚠️ {{ t('referrer.checkAddress') }}</p>
        </div>

        <div class="button-group">
          <button class="btn-ip btn-cancel" @click="$emit('close')">{{ t('referrer.cancel') }}</button>
          <button class="btn-ip btn-confirm" @click="handleConfirm" :disabled="isLoading || !pendingReferrer || countdown > 0">
            {{ countdown > 0 ? `${t('referrer.confirm')} (${countdown}s)` : t('referrer.confirm') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getRootReferrer
} from '../services/contracts';
import { t } from '@/i18n';

export default {
  name: 'ConfirmReferrerModal',
  emits: ['close', 'confirm'],
  setup() {
    return {
      t,
    };
  },
  data() {
    return {
      pendingReferrer: null,
      isLoading: true,
      countdown: 10,
      timer: null,
    };
  },
  computed: {
    addressHead() {
        if (!this.pendingReferrer) return '';
        // 0x + 4 chars. We want the 4 chars AFTER 0x.
        // Assuming address starts with 0x...
        return this.pendingReferrer.slice(2, 6);
    },
    addressBody() {
        if (!this.pendingReferrer) return '';
        return this.pendingReferrer.slice(6, -4);
    },
    addressTail() {
        if (!this.pendingReferrer) return '';
        return this.pendingReferrer.slice(-4);
    }
  },
  methods: {
    async fetchReferrer() {
      this.isLoading = true;
      // 1. Check URL for ?ref= parameter first
      const urlParams = new URLSearchParams(window.location.search);
      const refFromUrl = urlParams.get('ref');

      if (refFromUrl && refFromUrl.startsWith('0x') && refFromUrl.length >= 42) {
        console.log(`[确认推荐人弹窗] 成功从URL中解析到推荐人地址: ${refFromUrl}`);
        this.pendingReferrer = refFromUrl;
      } else {
        // 2. If no valid ref in URL, get the root referrer from the contract
        console.log("[确认推荐人弹窗] URL中无推荐人, 开始从合约获取根推荐人...");
        this.pendingReferrer = await getRootReferrer();
        console.log(`[确认推荐人弹窗] 成功从合约获取到根推荐人地址: ${this.pendingReferrer}`);
      }
      this.isLoading = false;
      this.startCountdown();
    },
    startCountdown() {
        this.countdown = 10;
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
            if (this.countdown > 0) {
                this.countdown--;
            } else {
                clearInterval(this.timer);
            }
        }, 1000);
    },
    handleConfirm() {
      if (this.countdown > 0) return;
      // Pass the determined referrer address back to the parent
      if (this.pendingReferrer) {
        console.log(`[确认推荐人弹窗] 用户已确认推荐人地址: ${this.pendingReferrer}, 进入最终质押流程`);
        this.$emit('confirm', this.pendingReferrer);
      }
    }
  },
  mounted() {
    this.fetchReferrer();
  },
  beforeUnmount() {
      if (this.timer) clearInterval(this.timer);
  }
};
</script>

<style scoped lang="scss">
/* ... existing styles ... */
.address-display {
    /* display: flex;  Removed to avoid fragmented look */
    text-align: center;
    word-break: break-all;
    font-family: var(--font-mono);
    
    .highlight {
        color: var(--primary-gold);
        font-weight: 800;
        /* font-size: 1.1em; Kept same size for continuity */
    }
    
    .normal {
        color: var(--text-muted);
    }
}

.warning-text {
    color: var(--primary-gold);
    font-size: 0.9rem;
    text-align: center;
    margin-top: 12px;
    font-family: var(--font-body);
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% { opacity: 0.8; }
    50% { opacity: 1; }
    100% { opacity: 0.8; }
}

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
  z-index: 1050;
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 380px;
  padding: 32px;
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

.modal-body-custom { 
  width: 100%; 
  position: relative;
  z-index: 1;
}

.title_holder {
  text-align: center;
  margin-bottom: 32px;

  h3 {
    font-family: var(--font-heading);
    font-size: 1.8rem;
    margin-bottom: 8px;
    color: #fff;
    font-weight: 400;
    letter-spacing: 1px;
    text-shadow: 2px 2px 0px rgba(0,0,0,0.5);
  }
}

.form-group {
  margin: 20px 0 30px 0;
}

.form-label {
  display: block;
  text-align: left;
  color: var(--text-secondary);
  margin-bottom: 12px;
  font-size: 1rem;
  font-family: var(--font-body);
}

/* This is the referrer address display, styled like an input */
.address-box {
  width: 100%;
  padding: 16px 20px;
  background: transparent;
  border: 2px solid var(--border-light);
  /* Hand-drawn Box */
  border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
  color: #fff;
  font-size: 1rem;
  font-family: var(--font-mono);
  text-align: center;
  word-wrap: break-word;
  transition: all 0.3s ease;
  
  &:hover {
      border-color: var(--primary-gold);
      background: rgba(212, 175, 55, 0.05);
      transform: rotate(-0.5deg);
  }
}

.button-group {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-top: 30px;
}

.btn-ip {
    flex: 1;
    text-align: center;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 12px 14px; /* Reduced padding */
    /* Hand drawn pill */
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    transition: all 0.3s ease;
    font-size: 0.95rem; /* Slightly smaller font to fit one line */
    font-weight: 600;
    cursor: pointer;
    font-family: var(--font-body);
    white-space: nowrap; /* Force single line */
}

.btn-cancel {
    background: transparent;
    border: 2px solid var(--border-light);
    color: var(--text-secondary);
    
    &:hover {
        border-color: #fff;
        color: #fff;
        transform: rotate(-1deg);
    }
}

.btn-confirm {
    background: transparent;
    border: 2px solid var(--primary-gold);
    color: var(--primary-gold);
    
    &:hover:not(:disabled) {
        background: rgba(212, 175, 55, 0.1);
        box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
        transform: rotate(1deg);
    }
    
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        border-color: rgba(255, 255, 255, 0.2);
        color: rgba(255, 255, 255, 0.5);
    }
}
</style>
