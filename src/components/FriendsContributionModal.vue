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

        <div class="header-section">
          <h3>{{ t('share.contributionTitle') }}</h3>
          <div class="cyber-line"></div>
        </div>

        <div class="dashboard-content">
          <!-- Top Stats Grid -->
          <div class="stats-grid">
            <!-- Inviter Card -->
            <div class="stat-card inviter" v-if="teamId">
              <div class="card-label">{{ t('share.teamId') }}</div>
              <div class="card-value mono">{{ teamId }}</div>
            </div>
          </div>

          <!-- Referrals Slider Section -->
          <div class="referrals-panel">
            <div class="panel-header">
              <span class="panel-title">{{ t('share.myReferralsLabel') }}</span>
              <span class="badge mono">{{ formattedReferralCount }}</span>
            </div>
            
            <div class="panel-body">
              <!-- Loading State -->
              <div v-if="isLoadingReferrals" class="state-view loading">
                <div class="loading-spinner"></div>
                <p>{{ t('share.loadingReferrals') }}</p>
              </div>
              
              <!-- Content State -->
              <div v-else class="referral-slider-container">
                <div v-if="referralCount > 0" class="slider-wrapper">
                  
                  <!-- User Info Display (No extra frame) -->
                  <div class="referral-display-clean">
                    <div class="user-row-centered">
                      <span class="address mono">{{ currentReferralAddress }}</span>
                    </div>
                    
                    <div class="metrics-grid-clean">
                      <div class="metric-item">
                        <span class="m-label">{{ t('share.assetsLabel') }}</span>
                        <span class="m-value mono">{{ formattedBalance }}</span>
                      </div>
                      <div class="metric-separator"></div>
                      <div class="metric-item">
                        <span class="m-label">{{ t('share.kpiLabel') }}</span>
                        <span class="m-value mono highlight">{{ formattedKpi }}</span>
                      </div>
                    </div>
                  </div>

                </div>
                
                <!-- Bottom Controls: Arrows + Pagination -->
                <div v-if="referralCount > 0" class="bottom-controls">
                  <button @click.prevent="showPrevious" class="nav-btn prev" :disabled="currentIndex === 0">
                    <!-- Hand-drawn left arrow using SVG -->
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>

                  <div class="pagination-info">
                    <span class="page-info mono">{{ currentIndex + 1 }} / {{ referralCount }}</span>
                    <div class="progress-bar-mini">
                        <div class="progress-fill" :style="{ width: `${((currentIndex + 1) / referralCount) * 100}%` }"></div>
                    </div>
                  </div>

                  <button @click.prevent="showNext" class="nav-btn next" :disabled="currentIndex >= referralCount - 1">
                    <!-- Hand-drawn right arrow using SVG -->
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>

                <div v-else class="state-view empty">
                  <p>{{ t('share.noReferrals') }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, onUnmounted, computed, ref, watch } from 'vue';
import { t } from '@/i18n';
import { walletState } from '@/services/wallet';
import { 
    referralContract, 
    getTeamKpiByAddress, 
    getUserStakedBalanceByAddress, 
    formatUnits,
    getStorageAt
} from '@/services/contracts';
import { ethers } from 'ethers';

export default {
  name: 'FriendsContributionModal',
  props: {
    referrerAddress: {
      type: String,
      default: '',
    },
  },
  setup(props, { emit }) {
    const referralCount = ref(0);
    const referrals = ref([]); 
    const currentIndex = ref(0);
    const currentReferralKpiRaw = ref(null);
    const currentReferralBalanceRaw = ref(null);
    const isLoadingReferrals = ref(true);
    const estimatedRewards = ref('0');
    
    // Tron Storage Slot Logic (BigInt in v6/native)
    const arrayStartSlot = ref(null);

    const close = () => {
      emit('close');
    };

    const teamId = computed(() => {
      if (!props.referrerAddress || props.referrerAddress.length < 10) {
        return '';
      }
      const prefix = props.referrerAddress.slice(0, 6);
      const suffix = props.referrerAddress.slice(-4);
      return `${prefix}...${suffix}`;
    });

    const formattedEstimatedRewards = computed(() => {
      if (estimatedRewards.value === null) return '--';
      try {
        const rewardsInWei = estimatedRewards.value.split('.')[0];
        const rewardsInEth = formatUnits(rewardsInWei, 18);
        return parseFloat(rewardsInEth).toFixed(2);
      } catch (e) {
        console.error("Error formatting estimated rewards:", e);
        return '0.00';
      }
    });

    const formattedKpi = computed(() => {
      if (currentReferralKpiRaw.value === null) return '--';
      return parseFloat(currentReferralKpiRaw.value).toFixed(2);
    });

    const formattedBalance = computed(() => {
      if (currentReferralBalanceRaw.value === null) return '--';
      return parseFloat(currentReferralBalanceRaw.value).toFixed(2);
    });

    const formattedReferralCount = computed(() => {
      const unit = t('share.referralsUnit');
      return unit ? `${referralCount.value} ${unit}` : `${referralCount.value}`;
    });

    const currentReferralAddress = computed(() => {
      if (referrals.value.length === 0 || !referrals.value[currentIndex.value]) return t('common.loading') || '...';
      const address = referrals.value[currentIndex.value];
      const prefix = address.slice(0, 6);
      const suffix = address.slice(-4);
      return `${prefix}...${suffix}`;
    });

    const showNext = () => {
      if (currentIndex.value < referralCount.value - 1) {
        currentIndex.value++;
      }
    };

    const showPrevious = () => {
      if (currentIndex.value > 0) {
        currentIndex.value--;
      }
    };
    
    const fetchReferralData = async () => {
      isLoadingReferrals.value = true;
      const userAddress = walletState.address;
      if (!userAddress || !referralContract) {
        isLoadingReferrals.value = false;
        return;
      }

      try {
          // 1. Get Count
          const countBN = await referralContract.getReferralCount(userAddress).call();
          const count = Number(countBN.toString());
          referralCount.value = count;
          
          if (count === 0) {
              referrals.value = [];
              isLoadingReferrals.value = false;
              return;
          }

          // Initialize array with nulls
          referrals.value = new Array(count).fill(null);

          // 2. Calculate Start Slot for _children
          // mapping(address => address[]) private _children; slot 4
          const CHILDREN_SLOT = 4;
          
          // Ethers v6 Syntax
          const coder = ethers.AbiCoder.defaultAbiCoder();
          const slotEncoded = coder.encode(["uint256"], [CHILDREN_SLOT]);
          
          // Referrer Address to Hex/Eth format
          // window.tronWeb is expected to be available
          if (!window.tronWeb) throw new Error("TronWeb not found");
          
          const referrerHex = window.tronWeb.address.toHex(userAddress);
          const referrerEthAddress = '0x' + referrerHex.substring(2);
          
          const keyEncoded = coder.encode(["address"], [referrerEthAddress]);
          
          const lengthSlot = ethers.keccak256(ethers.concat([keyEncoded, slotEncoded]));
          
          // The array data starts at keccak256(lengthSlot)
          const arrayStartSlotHash = ethers.keccak256(lengthSlot);
          arrayStartSlot.value = BigInt(arrayStartSlotHash);
          
          isLoadingReferrals.value = false;
          
          // Fetch first item immediately
          await fetchDataForCurrentReferral();

      } catch (error) {
          console.error("Error fetching referral basics:", error);
          isLoadingReferrals.value = false;
      }
    };

    const fetchDataForCurrentReferral = async () => {
      if (referralCount.value === 0) return;
      
      const idx = currentIndex.value;
      
      // Reset displays while loading
      currentReferralKpiRaw.value = null;
      currentReferralBalanceRaw.value = null;
      
      try {
        // 1. Check if we have address
        let address = referrals.value[idx];
        
        if (!address) {
            // Fetch address from storage
            if (arrayStartSlot.value === null) return;
            
            // Calculate element slot: start + index
            // Using Native BigInt for v6 compatibility
            const elementSlotBN = arrayStartSlot.value + BigInt(idx);
            
            // Convert to hex string (without 0x prefix for getStorageAt helper if it handles it, 
            // but our helper expects hex string, possibly 0x prefixed. Let's provide 0x)
            let elementSlot = elementSlotBN.toString(16);
            if (elementSlot.length % 2 !== 0) elementSlot = '0' + elementSlot; // padding
            elementSlot = '0x' + elementSlot;

            const contractAddress = referralContract.address;
            const val = await getStorageAt(contractAddress, elementSlot);
            
            if (val) {
                const cleanVal = val.startsWith('0x') ? val.substring(2) : val;
                // Last 20 bytes (40 chars) is address
                if (cleanVal.length >= 40) {
                     const addressHex = '41' + cleanVal.substring(cleanVal.length - 40);
                     address = window.tronWeb.address.fromHex(addressHex);
                     referrals.value[idx] = address;
                }
            }
        }
        
        if (address) {
            // 2. Fetch Stats
            const [kpi, balance] = await Promise.all([
              getTeamKpiByAddress(address),
              getUserStakedBalanceByAddress(address)
            ]);
            currentReferralKpiRaw.value = kpi;
            currentReferralBalanceRaw.value = balance;
        }

      } catch (error) {
        console.error("Failed to fetch referral data:", error);
      }
    };

    watch(currentIndex, fetchDataForCurrentReferral);

    onMounted(async () => {
      document.body.style.overflow = 'hidden';
      // Wait for wallet state if needed
      if (walletState.isAuthenticated) {
           await fetchReferralData();
      } else {
           // Poll briefly or rely on wallet state change elsewhere (though modal usually opens after auth)
           setTimeout(fetchReferralData, 1000); 
      }
    });

    onUnmounted(() => {
      document.body.style.overflow = '';
    });

    return {
      close,
      teamId,
      t,
      referralCount,
      currentIndex,
      currentReferralAddress,
      formattedKpi,
      formattedBalance,
      isLoadingReferrals,
      showNext,
      showPrevious,
      formattedReferralCount,
      formattedEstimatedRewards,
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
  backdrop-filter: blur(12px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 420px;
  padding: 0;
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

.modal-body {
  padding: 32px;
  position: relative;
  z-index: 2;
}

/* Remove old tech corners if they exist in HTML structure */
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

.header-section {
  text-align: center;
  margin-bottom: 28px;

  h3 {
    font-family: var(--font-heading);
    font-size: 1.8rem;
    margin-bottom: 12px;
    color: #fff;
    font-weight: 400;
    letter-spacing: 1px;
    text-shadow: 2px 2px 0px rgba(0,0,0,0.5);
  }
}

.cyber-line {
  height: 2px;
  width: 60px;
  margin: 0 auto;
  background: var(--primary-gold);
  /* Chalk effect */
  box-shadow: 0 0 5px var(--primary-gold); 
  position: relative;
  border-radius: 2px;
  
  &::before, &::after {
    display: none; /* Remove tech dots */
  }
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.stat-card {
  background: transparent;
  border: 1px solid var(--border-light);
  /* Hand drawn box */
  border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
  padding: 16px;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease;

  &:hover {
    transform: rotate(-0.5deg);
    border-color: var(--primary-gold-dim);
    background: rgba(255, 255, 255, 0.02);
  }

  &.inviter {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .card-label {
      color: var(--text-secondary);
      font-size: 0.9rem;
      font-family: var(--font-body);
    }
    
    .card-value {
      color: #fff;
      font-size: 1rem;
      letter-spacing: 0.5px;
      font-family: var(--font-mono);
    }
  }

  &.rewards {
    background: rgba(212, 175, 55, 0.05);
    border-color: var(--primary-gold-dim);
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
      
      .label {
        font-size: 0.9rem;
        color: var(--primary-gold);
        opacity: 0.9;
        font-family: var(--font-body);
      }
    }

    .value-group {
      display: flex;
      align-items: baseline;
      gap: 6px;
      
      .value {
        font-size: 1.8rem;
        font-weight: 400; /* Chalk bold */
        color: #fff;
        text-shadow: 2px 2px 0px rgba(0,0,0,0.3);
        font-family: var(--font-heading);
      }
      
      .unit {
        font-size: 0.9rem;
        color: var(--text-secondary);
        font-weight: 600;
        font-family: var(--font-mono);
      }
    }
  }
}

.info-tooltip {
  position: relative;
  cursor: help;
  
  .icon-info {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    /* Irregular circle */
    border-radius: 50% 40% 60% 50% / 40% 50% 60% 50%;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    transition: all 0.2s;
    font-family: var(--font-body);
  }

  &:hover .icon-info {
    border-color: var(--primary-gold);
    color: var(--primary-gold);
    transform: rotate(10deg);
  }

  .tooltip-text {
    visibility: hidden;
    position: absolute;
    bottom: -72px;
    right: 53px;
    background: rgba(20, 20, 20, 0.95);
    border: 1px solid var(--border-light);
    color: #fff;
    padding: 12px;
    /* Hand drawn box tooltip */
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    font-size: 0.8rem;
    width: 200px;
    margin-bottom: 8px;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
    z-index: 100;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    font-family: var(--font-body);
  }

  &:hover .tooltip-text {
    visibility: visible;
    opacity: 1;
  }
}

.referrals-panel {
  background: transparent;
  border: 1px solid var(--border-light);
  /* Hand drawn box */
  border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
  overflow: hidden;
  margin-top: 8px;
}

.panel-header {
  background: rgba(255, 255, 255, 0.02);
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px dashed var(--border-light);

  .panel-title {
    font-size: 0.95rem;
    color: #fff;
    font-weight: 600;
    font-family: var(--font-body);
  }

  .badge {
    background: transparent;
    color: var(--primary-gold);
    padding: 2px 10px; /* Slightly wider */
    /* Irregular badge */
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    font-size: 0.9rem; /* Increased size */
    border: 1px solid var(--primary-gold-dim);
    font-family: var(--font-heading); /* Changed font to heading for better style */
    font-weight: 500;
  }
}

.panel-body {
  padding: 20px;
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.state-view {
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9rem;
  font-family: var(--font-body);
  
  &.loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--primary-gold);
  /* Irregular circle spinner */
  border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.referral-slider-container {
  width: 100%;
}

.slider-wrapper {
  margin-bottom: 12px;
}

.referral-display-clean {
  padding: 0;
}

.user-row-centered {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
  
  .address {
    color: #fff;
    font-size: 1.1rem;
    font-weight: 500;
    font-family: var(--font-mono);
    border-bottom: 1px dashed var(--border-light); /* Underline effect */
    padding-bottom: 2px;
  }
}

.metrics-grid-clean {
  display: grid;
  grid-template-columns: 1fr 1px 1fr;
  align-items: center;
  gap: 0;
  background: transparent;
  border-radius: 0;
  padding: 8px 0;
  border: none;
}

.metric-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  
  .m-label {
    font-size: 0.75rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-family: var(--font-body);
  }
  
  .m-value {
    font-size: 1rem;
    color: #fff;
    font-weight: 500;
    font-family: var(--font-mono);
    
    &.highlight {
      color: var(--primary-gold);
    }
  }
}

.metric-separator {
  width: 1px;
  height: 24px;
  background: var(--border-light);
  margin: 0 auto;
}

/* Bottom Controls */
.bottom-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  margin-top: 10px;
}

.nav-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Irregular Circle Button */
  border-radius: 50% 45% 40% 50% / 50% 40% 50% 45%;
  border: 1px solid var(--border-light);
  background: transparent;
  color: var(--primary-gold);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    color: var(--primary-gold);
    background: rgba(212, 175, 55, 0.1);
    border-color: var(--primary-gold);
    transform: rotate(-5deg) scale(1.1);
  }
  
  &:disabled {
    opacity: 0.2;
    cursor: not-allowed;
    border-color: var(--border-light);
  }
}

.pagination-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  
  .page-info {
    font-size: 0.85rem;
    color: var(--text-muted);
    font-family: var(--font-mono);
  }
  
  .progress-bar-mini {
    width: 60px;
    height: 2px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
    
    .progress-fill {
      height: 100%;
      background: var(--primary-gold);
      transition: width 0.3s ease;
      box-shadow: 0 0 5px var(--primary-gold);
    }
  }
}
</style>