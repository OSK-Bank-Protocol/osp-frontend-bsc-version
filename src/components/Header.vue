<template>
    <div class="header-container" id="site-header">
        <div class="header-content">
            <!-- Logo -->
            <div class="logo-wrapper">
                <router-link to="/" class="logo-link">
                    <img src="/asset/images/logo/OSK-BANK-LOGO.png" alt="LOGO">
                </router-link>
            </div>

            <!-- Desktop Navigation -->
            <nav class="desktop-nav" style="display: none;">
                <ul class="nav-list">
                    <li class="nav-item">
                        <router-link to="/" class="nav-link" active-class="active">
                            {{ t('header.home') || 'Home' }}
                        </router-link>
                    </li>
                    <li class="nav-item">
                        <router-link to="/blog" class="nav-link" active-class="active">
                            {{ t('header.blog') || 'Blog' }}
                        </router-link>
                    </li>
                    <li class="nav-item dropdown">
                        <a href="javascript:void(0)" class="nav-link dropdown-trigger">
                            Page
                            <i class="icon icon-arrow-caret-down"></i>
                        </a>
                        <div class="dropdown-menu">
                            <router-link to="/about-us" class="dropdown-link">About Us</router-link>
                            <router-link to="/faq" class="dropdown-link">FAQs</router-link>
                            <router-link to="/pricing" class="dropdown-link">Pricing</router-link>
                            <router-link to="/use-case" class="dropdown-link">Use Case</router-link>
                            <router-link to="/use-case-detail" class="dropdown-link">Use Case Detail</router-link>
                            <router-link to="/404" class="dropdown-link">404</router-link>
                        </div>
                    </li>
                    <li class="nav-item">
                        <router-link to="/contact-us" class="nav-link" active-class="active">
                            Contact Us
                        </router-link>
                    </li>
                </ul>
            </nav>

            <!-- Right Actions -->
            <div class="header-actions">
                <!-- Wallet Connect -->
                <a v-if="!walletState.isConnected" href="#" @click.prevent="openModal" class="connect-btn">
                    <span class="btn-text">{{ t('header.connectWallet') }}</span>
                    <div class="btn-glow"></div>
                </a>
                <a v-else href="#" @click.prevent="openModal" class="connect-btn connected">
                    <span class="status-dot"></span>
                    <span class="address-text">{{ formattedAddress }}</span>
                </a>

                <!-- Language Selector -->
                <button class="action-btn lang-btn" @click="openLanguageModal" title="Change Language">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-globe">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2 12H22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2V2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>

                <!-- Mobile Menu Toggle -->
                <button class="mobile-toggle" data-bs-toggle="offcanvas" data-bs-target="#mobileMenu" aria-controls="mobileMenu" style="display: none;">
                    <i class="icon icon-menu"></i>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { walletState, formatAddress } from '@/services/wallet.js';
import { computed } from 'vue';
import { t } from '@/i18n';

export default {
  name: 'Header',
  setup() {
    const formattedAddress = computed(() => formatAddress(walletState.address));

    return {
      walletState,
      formattedAddress,
      t,
    };
  },
  methods: {
    openModal() {
      this.$emit('open-get-started-modal');
    },
    openLanguageModal() {
      this.$emit('open-language-modal');
    }
  }
}
</script>

<style scoped lang="scss">
.header-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: var(--header-height);
  z-index: 1000;
  background: rgba(26, 26, 26, 0.9); /* Dark Charcoal */
  backdrop-filter: blur(8px);
  border-bottom: 2px solid var(--border-light);
  /* Hand-drawn border effect at bottom */
  border-radius: 0 0 255px 15px / 0 0 5px 3px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0,0,0,0.4);
}

.header-content {
  max-width: var(--container-width);
  margin: 0 auto;
  height: 100%;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo */
.logo-wrapper {
  flex-shrink: 0;
  
  img {
    height: 54px;
    width: auto;
    filter: sepia(0.5) contrast(1.1); /* Slight vintage filter */
  }
}

/* Desktop Navigation */
.desktop-nav {
  display: none;

  @media (min-width: 992px) {
    display: block;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  .nav-list {
    display: flex;
    align-items: center;
    gap: 40px;
  }

  .nav-link {
    font-size: 18px; /* Slightly larger for handwritten font */
    font-weight: 500;
    color: var(--text-secondary);
    position: relative;
    padding: 8px 0;
    transition: color 0.3s ease;
    font-family: var(--font-body);

    &:hover, &.active {
      color: var(--primary-gold);
    }
    
    &.active::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: var(--primary-gold);
      /* Scribble underline effect */
      border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
      transform: rotate(-1deg);
    }
  }
  
  .dropdown {
    position: relative;
    
    .dropdown-trigger {
      display: flex;
      align-items: center;
      gap: 6px;
      
      i {
        font-size: 10px;
        transition: transform 0.3s ease;
      }
    }
    
    &:hover {
      .dropdown-menu {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }
      .dropdown-trigger i {
        transform: rotate(180deg);
      }
    }
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(10px);
    background: #1F1F1F; /* Card background */
    border: 2px solid var(--border-gold);
    border-radius: 2px; /* Less rounded, more like a card */
    /* Chalk border radius */
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    padding: 12px;
    min-width: 200px;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    
    .dropdown-link {
      display: block;
      padding: 10px 16px;
      color: var(--text-secondary);
      font-size: 16px;
      border-radius: 4px;
      transition: all 0.2s ease;
      font-family: var(--font-body);
      
      &:hover {
        background: rgba(238, 207, 161, 0.1);
        color: var(--primary-gold);
        text-decoration: underline;
        text-decoration-style: wavy;
      }
    }
  }
}

/* Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2px solid var(--primary-gold);
  /* Irregular Circle */
  border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
  background: transparent;
  transition: all 0.3s ease;
  
  svg.icon-globe {
    width: 20px;
    height: 20px;
    color: var(--primary-gold);
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  &:hover {
    background: rgba(238, 207, 161, 0.1);
    box-shadow: 0 0 10px rgba(238, 207, 161, 0.2);
    transform: rotate(5deg); /* Slight tilt */
    
    svg.icon-globe {
      transform: rotate(180deg);
    }
  }
}

/* Connect Wallet Button */
.connect-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: transparent;
  border: 2px solid var(--border-light);
  /* Irregular Pill Shape */
  border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
  font-family: var(--font-body);
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--primary-gold);
    color: var(--primary-gold);
    box-shadow: 0 0 15px rgba(238, 207, 161, 0.15);
  }
  
  &.connected {
    background: rgba(238, 207, 161, 0.1);
    border-color: var(--primary-gold);
    color: var(--primary-gold);
    
    &:hover {
        background: rgba(238, 207, 161, 0.2);
    }
  }
  
  .status-dot {
    width: 8px;
    height: 8px;
    background: #6EE7B7; /* Pastel Green Chalk */
    /* Irregular circle */
    border-radius: 60% 40% 50% 70% / 50% 60% 40% 60%;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 0 0 1px rgba(110, 231, 183, 0.1);
  }
}

/* Mobile Menu Toggle */
.mobile-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: var(--text-primary);
  font-size: 24px;
  
  @media (min-width: 992px) {
    display: none;
  }
}
</style>
