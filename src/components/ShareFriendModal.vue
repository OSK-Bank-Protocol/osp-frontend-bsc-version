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
          <h3>{{ t('share.shareLink') }}</h3>
          <div class="cyber-line"></div>
        </div>
        
        <div class="share-card-container">
            <div class="digital-card">
                <div class="card-bg-grid"></div>
                <div class="card-header">
                    <span class="card-label">ACCESS LINK</span>
                    <div class="status-indicator">
                        <span class="dot"></span>
                        <span class="status-text">ACTIVE</span>
                    </div>
                </div>
                
                <div class="link-display-area">
                    <div class="scan-line"></div>
                    <textarea :value="referralLink" readonly class="code-text" @focus="$event.target.select()"></textarea>
                </div>
                
                <!-- Card Decor -->
                <!-- <div class="decor-line top"></div>
                <div class="decor-line bottom"></div> -->
            </div>

            <button @click.prevent="copyLink" class="action-btn primary-btn">
                <span class="btn-content">
                    <i class="icon icon-copy"></i>
                    {{ t('share.button') }}
                </span>
            </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { t } from '@/i18n';
import { showToast } from '@/services/notification';

export default {
  name: 'ShareFriendModal',
  props: {
    referralLink: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    const close = () => {
      emit('close');
    };

    const copyLink = () => {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = props.referralLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast(t('toast.copySuccess'));
      } catch (err) {
        console.error('无法复制链接: ', err);
        showToast(t('toast.copyFailed'));
      }
    };

    return {
      close,
      copyLink,
      t,
    };
  },
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
  z-index: 1050;
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

.title_holder {
  text-align: center;
  margin-bottom: 24px;

  h3 {
    font-family: var(--font-heading);
    font-size: 1.8rem;
    margin-bottom: 16px;
    color: #fff;
    font-weight: 400;
    letter-spacing: 1px;
    text-shadow: 2px 2px 0px rgba(0,0,0,0.5);
  }
  
  /* Chalk Underline */
  .cyber-line {
      width: 80px;
      height: 2px;
      background: var(--primary-gold);
      margin: 0 auto;
      border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
      transform: rotate(-1deg);
      box-shadow: none;
      
      &::before, &::after {
          display: none;
      }
  }
}

.share-card-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.digital-card {
    background: transparent;
    border: 2px solid var(--border-light);
    /* Hand-drawn Box */
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    padding: 20px 0 0 0;
    position: relative;
    overflow: hidden;
    
    /* Vintage grid effect */
    .card-bg-grid {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: 
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
        background-size: 20px 20px;
        pointer-events: none;
        z-index: 0;
    }
    
    .decor-line { display: none; }
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    position: relative;
    z-index: 1;
    padding: 0 20px;
    
    .card-label {
        font-family: var(--font-mono);
        font-size: 0.8rem;
        color: var(--text-secondary);
        letter-spacing: 1px;
        font-weight: 600;
    }
    
    .status-indicator {
        display: flex;
        align-items: center;
        gap: 6px;
        background: transparent;
        padding: 2px 8px;
        /* Irregular Tag */
        border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
        border: 1px solid var(--primary-gold);
        
        .dot {
            width: 6px;
            height: 6px;
            background: var(--primary-gold);
            border-radius: 50%;
            animation: pulse 2s infinite;
        }
        
        .status-text {
            font-size: 0.7rem;
            color: var(--primary-gold);
            font-weight: 700;
            font-family: var(--font-mono);
        }
    }
}

@keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
}

.link-display-area {
    position: relative;
    background: rgba(0, 0, 0, 0.4);
    border-top: 2px solid var(--border-light);
    /* Hand drawn border top */
    border-radius: 0; 
    padding: 4px;
    margin-bottom: 0;
    z-index: 1;
    overflow: hidden;
    
    &:hover {
        background: rgba(212, 175, 55, 0.05);
    }
    
    .scan-line { display: none; }
}

.code-text {
    width: 100%;
    height: 90px;
    background: transparent;
    border: none;
    color: #fff;
    font-family: var(--font-mono);
    font-size: 0.9rem;
    line-height: 1.5;
    padding: 16px 20px;
    resize: none;
    
    &:focus {
        outline: none;
    }
    
    &::selection {
        background: rgba(212, 175, 55, 0.3);
        color: #fff;
    }
}

.card-footer {
    text-align: center;
    position: relative;
    z-index: 1;
    
    .hint-text {
        font-size: 0.75rem;
        color: var(--text-muted);
        font-family: var(--font-body);
    }
}

.action-btn {
    width: 100%;
    padding: 14px;
    /* Hand drawn pill */
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    font-family: var(--font-body);
    
    &.primary-btn {
        background: transparent;
        border: 2px solid var(--primary-gold);
        color: var(--primary-gold);
        font-weight: 700;
        font-size: 1rem;
        letter-spacing: 0.5px;
        
        &:hover {
            background: rgba(212, 175, 55, 0.1);
            box-shadow: 0 0 20px rgba(212, 175, 55, 0.2);
            transform: rotate(1deg);
        }
        
        &:active {
            transform: translateY(0);
        }
    }
    
    .btn-content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        position: relative;
        z-index: 2;
    }
}
</style>
