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
          <h3>{{ t('language.switchTitle') }}</h3>
          <div class="cyber-line"></div>
        </div>
        
        <div class="language-grid">
          <button 
            v-for="language in languages" 
            :key="language.code"
            class="lang-card"
            :class="{ active: currentLang === language.code }"
            @click="selectLanguage(language.code)"
          >
            <div class="card-bg-glow"></div>
            <span class="lang-name">{{ language.name }}</span>
            <div class="corner-mark tl"></div>
            <div class="corner-mark tr"></div>
            <div class="corner-mark bl"></div>
            <div class="corner-mark br"></div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { availableLanguages, setLanguage, currentLanguage, t } from '@/i18n';

export default {
  name: 'LanguageModal',
  setup(props, { emit }) {
    const close = () => {
      emit('close');
    };

    const selectLanguage = (languageCode) => {
      setLanguage(languageCode);
      close();
    };

    return {
      languages: availableLanguages,
      currentLang: computed(() => currentLanguage.value),
      close,
      selectLanguage,
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
  margin-bottom: 32px;

  h3 {
    font-family: var(--font-heading);
    font-size: 2rem;
    margin-bottom: 16px;
    color: #fff;
    font-weight: 400;
    letter-spacing: 1px;
    text-shadow: 2px 2px 0px rgba(0,0,0,0.5);
  }
  
  .cyber-line {
      width: 60px;
      height: 2px;
      background: var(--primary-gold);
      margin: 0 auto;
      /* Scribble */
      border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
      transform: rotate(-1deg);
      
      &::before, &::after {
          display: none;
      }
  }
}

.language-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
}

.lang-card {
    position: relative;
    background: transparent;
    border: 2px solid var(--border-light);
    /* Hand drawn card */
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    padding: 20px;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60px;
    
    /* Remove old corner marks */
    .corner-mark { display: none; }
    
    .lang-name {
        color: var(--text-secondary);
        font-size: 1.1rem;
        font-weight: 500;
        z-index: 2;
        transition: all 0.3s ease;
        font-family: var(--font-body);
    }
    
    .card-bg-glow {
        display: none; /* Remove digital glow */
    }

    &:hover {
        border-color: var(--primary-gold);
        background: rgba(212, 175, 55, 0.05);
        transform: translateY(-2px) rotate(1deg);
        
        .lang-name {
            color: #fff;
        }
    }
    
    &.active {
        border-color: var(--primary-gold);
        background: rgba(212, 175, 55, 0.1);
        box-shadow: 0 0 15px rgba(212, 175, 55, 0.1);
        transform: rotate(-1deg);
        
        .lang-name {
            color: var(--primary-gold);
            font-weight: 700;
        }
    }
}
</style>
