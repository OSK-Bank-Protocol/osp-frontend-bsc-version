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

        <!-- Not Connected View -->
        <div v-if="!walletState.isConnected">
          <div class="title_holder">
            <h3>{{ t('wallet.connectTitle') }}</h3>
            <p class="connect-text">{{ t('wallet.connectSubtitle') }}</p>
          </div>
          <div class="wallet-list" v-if="availableWallets.length > 0">
            <ul>
              <li v-for="wallet in availableWallets" :key="wallet.id">
                <a href="#" @click.prevent="handleConnect(wallet.id)">
                  <div class="wallet-info">
                      <img :src="getWalletIcon(wallet.id)" :alt="wallet.name" class="wallet-icon" :class="`${wallet.id}-icon`">
                      <span>{{ wallet.name }}</span>
                  </div>
                  <i class="icon icon-arrow-right"></i>
                </a>
              </li>
            </ul>
          </div>
          <div v-else class="no-wallet-view">
            <p>{{ t('wallet.noWalletDetected') }}</p>
            <p>{{ t('wallet.installWallet') }}</p>
          </div>
        </div>

        <!-- Connected View -->
        <div v-else class="connected-view">
           <div class="title_holder">
            <h3>{{ t('wallet.connectedTitle') }}</h3>
          </div>
          <div class="info-group">
              <div class="info-item">
                <h4 class="info-title">{{ t('wallet.address') }}</h4>
                <p class="info-content">{{ formattedAddress }}</p>
              </div>
              <div class="info-item">
                <h4 class="info-title">{{ t('wallet.network') }}</h4>
                <p class="info-content">{{ uppercaseNetwork }}</p>
              </div>
          </div>
          <a href="#" @click.prevent="handleDisconnect" class="disconnect-btn">
              {{ t('wallet.disconnect') }}
          </a>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import { walletState, connectWallet, disconnectWallet, detectWallets } from '@/services/wallet.js';
import { t } from '@/i18n';

export default {
  name: 'ConnectWalletModal',
  setup(props, { emit }) {
    const availableWallets = ref([]);

    const getWalletIcon = (walletId) => {
        const icons = {
            metamask: '/asset/images/wallet/MetaMask-icon-fox-with-margins.svg',
            tokenpocket: '/asset/images/wallet/tp-logo.png',
            okx: '/asset/images/wallet/okx-logo.png',
            binance: '/asset/images/wallet/binance-logo.png',
        };
        return icons[walletId] || '/asset/images/wallet/default-icon.png';
    };

    const close = () => {
      emit('close');
    };

    const handleConnect = async (walletType) => {
      const success = await connectWallet(walletType);
      if (success) {
        close();
      }
    };

    const handleDisconnect = () => {
      disconnectWallet();
      close();
    };
    
    onMounted(() => {
      availableWallets.value = detectWallets();
    });

    return {
      walletState,
      availableWallets,
      getWalletIcon,
      handleConnect,
      handleDisconnect,
      close,
      t,
    };
  },
  computed: {
    formattedAddress() {
      if (!this.walletState.address) return '';
      return `${this.walletState.address.substring(0, 6)}...${this.walletState.address.substring(this.walletState.address.length - 4)}`;
    },
    uppercaseNetwork() {
      return this.walletState.network ? this.walletState.network.toUpperCase() : '';
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

/* Remove old tech corners styling */
.tech-corner {
    display: none;
}

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
    margin-bottom: 8px;
    color: #fff;
    font-weight: 400;
    letter-spacing: 1px;
    text-shadow: 2px 2px 0px rgba(0,0,0,0.5);
  }

  .connect-text {
    color: var(--text-secondary);
    font-size: 1rem;
    font-family: var(--font-body);
  }
}

.wallet-list {
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    width: 100%;
  }

  li {
    margin-bottom: 12px;
    
    &:last-child {
        margin-bottom: 0;
    }
  }

  a {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: transparent;
    border: 2px solid var(--border-light);
    /* Irregular Border for items */
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    text-decoration: none;
    color: #fff;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    font-family: var(--font-body);

    &:hover {
      border-color: var(--primary-gold);
      background: rgba(212, 175, 55, 0.08);
      transform: rotate(-1deg) scale(1.02);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

      .icon-arrow-right {
          color: var(--primary-gold);
          transform: translateX(4px);
      }
    }
  }
}

.wallet-info {
    display: flex;
    align-items: center;
    
    span {
        font-weight: 600;
        letter-spacing: 0.5px;
        font-size: 1.1rem;
    }
}

.wallet-icon {
  width: 32px;
  height: 32px;
  margin-right: 16px;
  border-radius: 8px;
  object-fit: contain;
  /* Add filter to make icons blend better if needed, or keep original colors */
  
  &.okx-icon, &.metamask-icon {
      background-color: #fff;
      padding: 2px;
      border-radius: 50%; /* Round icons look better */
  }
  
  &.binance-icon {
      background-color: #FCD535;
      padding: 4px;
      border-radius: 50%;
  }
}

.icon-arrow-right {
  font-size: 16px;
  color: var(--text-secondary);
  transition: all 0.3s ease;
}

/* Connected View */
.connected-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.info-group {
    width: 100%;
    background: transparent;
    /* Hand drawn box */
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    padding: 24px;
    margin-bottom: 24px;
    border: 2px solid var(--border-light);
    position: relative;
    
    &::after {
        content: '';
        position: absolute;
        top: 5px; left: 5px; right: 5px; bottom: 5px;
        border: 1px dashed var(--text-muted);
        border-radius: inherit;
        opacity: 0.2;
        pointer-events: none;
    }
}

.info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px dashed var(--border-light);
    
    &:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
    }
}

.info-title {
    font-size: 1rem;
    color: var(--text-secondary);
    font-weight: 400;
    font-family: var(--font-body);
}

.info-content {
    font-size: 1rem;
    color: var(--primary-gold);
    font-family: var(--font-mono);
    background: rgba(212, 175, 55, 0.1);
    padding: 4px 12px;
    /* Irregular small tag */
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    border: 1px solid rgba(212, 175, 55, 0.2);
}

.disconnect-btn {
    width: 100%;
    padding: 14px;
    /* Hand drawn pill */
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    background: transparent;
    color: #FF3B30;
    font-weight: 600;
    text-align: center;
    transition: all 0.3s ease;
    border: 2px solid rgba(255, 59, 48, 0.3);
    font-family: var(--font-body);
    font-size: 1.1rem;
    
    &:hover {
        background: rgba(255, 59, 48, 0.1);
        border-color: #FF3B30;
        transform: rotate(1deg);
        box-shadow: 0 0 15px rgba(255, 59, 48, 0.2);
    }
}

.no-wallet-view {
    text-align: center;
    padding: 20px;
    color: var(--text-secondary);
    font-family: var(--font-body);
    
    p {
        margin-bottom: 8px;
    }
}
</style>
