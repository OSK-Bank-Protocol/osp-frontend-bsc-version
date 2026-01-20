<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content cool-modal">
      <!-- Tech corners -->
      <!-- <div class="tech-corner top-left"></div> -->
      <!-- <div class="tech-corner top-right"></div> -->
      <!-- <div class="tech-corner bottom-left"></div> -->
      <!-- <div class="tech-corner bottom-right"></div> -->

      <div class="modal-body">
        <button @click="close" class="close-button">
            <i class="icon icon-close"></i>
        </button>

        <div class="title_holder">
          <h3>{{ t('redeem.title') }}</h3>
          <div class="cyber-line"></div>
        </div>

        <!-- Mode Selection -->
        <div v-if="mode === 'select'" class="selection-container">
            <!-- Option 1: Reinvest (Recommended) - Moved to top -->
            <div class="option-card highlight" @click="handleReinvestSelect">
                <div class="option-badge">{{ t('redeem.recommended') }}</div>
                <div class="option-header">
                    <span class="option-title">{{ t('redeem.reinvest') }}</span>
                </div>
                <div class="option-desc">{{ t('redeem.reinvestDesc') }}</div>
                <div class="bonus-text">{{ t('redeem.getBonus') }}</div>

                <div class="info-row">
                    <span class="label">{{ t('redeem.currentValue') }}:</span>
                    <span class="value gold">{{ totalValueDisplay }}</span>
                </div>
            </div>

            <!-- Option 2: Principal Only - Moved to bottom -->
            <div class="option-card" @click="handlePrincipalOnly" :class="{ 'disabled': isPrincipalLimitReached }">
                <div class="option-header">
                    <span class="option-title">{{ t('redeem.principalOnly') }}</span>
                </div>
                <div class="option-desc">{{ t('redeem.principalOnlyDesc') }}</div>
                <div class="warning-text">{{ t('redeem.forfeitRewards') }}</div>
                
                <div class="info-row">
                    <span class="label">{{ t('redeem.lostReward') }}:</span>
                    <span class="value red">{{ lostRewardDisplay }}</span>
                </div>

                <div v-if="isPrincipalLimitReached" class="limit-warning">
                    {{ t('redeem.dailyLimitReached') }}
                </div>
            </div>
        </div>

        <!-- Confirm Principal View (Replaces options) -->
        <div v-else-if="mode === 'confirmPrincipal'" class="confirm-view">
             <div class="confirm-header-top">
                <button class="back-link-top" @click="mode = 'select'">
                    <i class="icon icon-arrow-left"></i> {{ t('redeem.back') }}
                </button>
             </div>

             <div class="confirm-icon-wrapper">
                 <i class="icon-warning"></i>
             </div>
             
             <div class="confirm-text-container">
                <p>{{ t('redeem.confirmForfeitLine1') }}</p>
                <p class="highlight-loss">{{ lostRewardDisplay }} {{ t('redeem.rewards') }}</p>
                <p>{{ t('redeem.confirmForfeitLine2') }}</p>
             </div>
             
             <div class="button-group-row">
                 <button class="action-btn secondary-btn small-btn" @click="doRedeemPrincipal">
                     {{ t('redeem.confirmRedeem') }}
                 </button>
                 <button class="action-btn primary-btn large-btn" @click="switchToReinvest">
                     {{ t('redeem.goToReinvest') }}
                 </button>
             </div>
        </div>

        <!-- Reinvest Form -->
        <div v-else-if="mode === 'reinvest'" class="reinvest-form">
            <div class="form-header">
                <button class="back-btn" @click="mode = 'select'">
                    <i class="icon-arrow-left"></i> {{ t('redeem.back') }}
                </button>
            </div>

            <!-- Amount Input -->
            <div class="form-group">
                <label class="form-label">{{ t('redeem.newAmount') }} ({{ t('redeem.minAmount', { amount: minReinvestAmount }) }})</label>
                <div class="amount-input-group">
                    <div class="input-wrapper tech-border">
                        <input 
                            type="text" 
                            inputmode="decimal"
                            v-model="newAmount"
                            @input="handleAmountInput"
                            class="form-input"
                            :class="{ 'input-error': isInputTooLow }"
                        >
                        <span class="currency-label">{{ t('common.osk') }}</span>
                    </div>
                    <div class="balance-info">
                        <span class="balance-text" :class="{ 'text-error': isBalanceExceeded }">
                            {{ t('inject.maxAmount', { amount: formattedBalance, token: t('common.osk') }) }}
                        </span>
                        <button @click.prevent="fillMax" class="balance-btn">MAX</button>
                    </div>
                </div>
            </div>

            <!-- Duration Selection -->
            <div class="form-group">
                <label class="form-label">{{ t('redeem.newDuration') }}</label>
                <div class="duration-button-group">
                    <button 
                        v-for="option in validDurationOptions" 
                        :key="option.value"
                        @click="selectedDuration = option.value"
                        :class="['duration-btn', { 'active': selectedDuration === option.value }]"
                        type="button"
                    >
                        <span class="duration-days">{{ option.days }}</span>
                        <span class="duration-rate">{{ option.rate }}</span>
                        <i v-if="selectedDuration === option.value" class="icon icon-check active-icon"></i>
                    </button>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="button-group">
                <button @click="handleReinvestAction" class="action-btn confirm-btn" :disabled="reinvestButtonState.disabled">
                    {{ reinvestButtonState.text }}
                </button>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { walletState } from '../services/wallet';
import {
  getOskDecimals,
  formatUnits,
  getMaxUnstakeAmount,
  getEffectiveMaxStakeAmount,
  unstakePrincipalOnly,
  unstakeWithBonus,
  getOskAllowance,
  approveOsk,
  getOskBalance
} from '../services/contracts';
import { APP_ENV } from '../services/environment';
import { showToast } from '../services/notification';
import { t } from '@/i18n';
import { ethers } from 'ethers';

export default {
  name: 'RedeemModal',
  props: {
    stakeId: { type: String, required: true },
    principal: { type: String, required: true }, // Formatted string
    stakeIndex: { type: Number, required: true },
    totalValue: { type: String, required: true }, // Formatted string
  },
  setup() {
    return { t, walletState };
  },
  data() {
    return {
      mode: 'select', // select | reinvest
      maxUnstakeAmount: null, // Initialize as null to prevent premature warning
      maxStakeAmount: '0',
      newAmount: '',
      selectedDuration: null,
      oskAllowance: '0',
      oskBalance: '0',
      isApproving: false,
      isLoading: true, // Start as loading
    };
  },
  computed: {
    minReinvestAmount() {
        return this.principal;
    },
    lostRewardDisplay() {
        try {
            const p = parseFloat(this.principal);
            const t = parseFloat(this.totalValue);
            const lost = t - p;
            return lost > 0 ? lost.toFixed(4) + ' OSP' : '0.0000 OSP';
        } catch (e) {
            return '0.0000 OSP';
        }
    },
    totalValueDisplay() {
        try {
            return parseFloat(this.totalValue).toFixed(4) + ' OSP';
        } catch (e) {
            return this.totalValue;
        }
    },
    isPrincipalLimitReached() {
        if (this.maxUnstakeAmount === null) return false;
        try {
            const limit = parseFloat(this.maxUnstakeAmount);
            const principal = parseFloat(this.principal);
            return limit < principal;
        } catch (e) {
            return false;
        }
    },
    // Computed property for the actual max stake limit (min of balance and global limit)
    actualMaxStake() {
      try {
        const decimals = getOskDecimals();
        const balanceBn = ethers.parseUnits(this.oskBalance || '0', decimals);
        const maxLimitBn = ethers.parseUnits(this.maxStakeAmount || '0', decimals);
        
        return balanceBn < maxLimitBn ? balanceBn : maxLimitBn;
      } catch (e) {
        return 0n;
      }
    },
    formattedMaxStake() {
        const decimals = getOskDecimals();
        const valBn = this.actualMaxStake;
        const valStr = formatUnits(valBn, decimals);
        
        // Truncate to 4 decimals
        const parts = valStr.split('.');
        if (parts.length === 2 && parts[1].length > 4) {
            return parts[0] + '.' + parts[1].substring(0, 4);
        }
        return parseFloat(valStr).toFixed(4); // Ensure 4 decimals format if less
    },
    formattedBalance() {
        return this.formattedMaxStake; // Display the actual max limit, not just balance
    },
    durationOptions() {
      const isDev = APP_ENV === 'test' || APP_ENV === 'dev';
      if (isDev) {
        return [
          { value: 0, days: this.t('inject.minutes7'), rate: this.t('inject.rate7') },
          { value: 1, days: this.t('inject.minutes15'), rate: this.t('inject.rate15') },
          { value: 2, days: this.t('inject.minutes30'), rate: this.t('inject.rate30') },
          { value: 3, days: this.t('inject.minutes45'), rate: this.t('inject.rate45') }
        ];
      }
      return [
        { value: 0, days: this.t('inject.days7'), rate: this.t('inject.rate7') },
        { value: 1, days: this.t('inject.days15'), rate: this.t('inject.rate15') },
        { value: 2, days: this.t('inject.days30'), rate: this.t('inject.rate30') },
        { value: 3, days: this.t('inject.days45'), rate: this.t('inject.rate45') }
      ];
    },
    validDurationOptions() {
        // Must be >= this.stakeIndex
        return this.durationOptions.filter(opt => opt.value >= this.stakeIndex);
    },
    isAmountInvalid() {
        if (!this.newAmount) return false;
        try {
            const decimals = getOskDecimals();
            const amountBn = ethers.parseUnits(this.newAmount, decimals);
            const minBn = ethers.parseUnits(this.principal, decimals);
            const maxBn = ethers.parseUnits(this.maxStakeAmount, decimals);
            const balanceBn = ethers.parseUnits(this.oskBalance, decimals);
            
            return amountBn < minBn || amountBn > maxBn || amountBn > balanceBn;
        } catch (e) {
            return true;
        }
    },
    isInputTooLow() {
        if (!this.newAmount) return false;
        try {
            const decimals = getOskDecimals();
            const amountBn = ethers.parseUnits(this.newAmount, decimals);
            const minBn = ethers.parseUnits(this.principal, decimals);
            return amountBn < minBn;
        } catch (e) {
            return false;
        }
    },
    isBalanceExceeded() {
        if (!this.newAmount) return false;
        try {
            const decimals = getOskDecimals();
            const amountBn = ethers.parseUnits(this.newAmount, decimals);
            const maxBn = ethers.parseUnits(this.maxStakeAmount, decimals);
            const balanceBn = ethers.parseUnits(this.oskBalance, decimals);
            // Check if amount exceeds either wallet balance or max stake limit
            return amountBn > maxBn || amountBn > balanceBn;
        } catch (e) {
            return false;
        }
    },
    reinvestButtonState() {
        if (!this.newAmount || this.selectedDuration === null) {
            return { text: this.t('redeem.confirmReinvest'), disabled: true };
        }
        
        if (this.isInputTooLow) {
             return { text: this.t('redeem.minAmount', { amount: this.minReinvestAmount }), disabled: true };
        }

        try {
            const decimals = getOskDecimals();
            const amountBn = ethers.parseUnits(this.newAmount, decimals);
            const balanceBn = ethers.parseUnits(this.oskBalance || '0', decimals);
            const maxBn = ethers.parseUnits(this.maxStakeAmount || '0', decimals);

            if (amountBn > balanceBn) {
                 return { text: this.t('inject.insufficientBalance'), disabled: true };
            }

            if (amountBn > maxBn) {
                 return { text: this.t('inject.maxAmountExceeded', { amount: this.formattedMaxStake }), disabled: true };
            }
        } catch (e) {
            // Fallback
        }

        if (this.isAmountInvalid) {
             // Fallback for other invalid cases
             return { text: this.t('inject.enterAmount'), disabled: true };
        }

        if (this.isApproving) {
            return { text: this.t('inject.approving'), disabled: true };
        }
        
        try {
            const decimals = getOskDecimals();
            const amountBn = ethers.parseUnits(this.newAmount, decimals);
            const allowanceBn = ethers.parseUnits(this.oskAllowance, decimals);
            
            if (allowanceBn < amountBn) {
                 return { text: this.t('inject.approveOsk'), action: 'approve', disabled: false };
            }
            return { text: this.t('redeem.confirmReinvest'), action: 'stake', disabled: false };
        } catch (e) {
            return { text: 'Error', disabled: true };
        }
    }
  },
  async mounted() {
    this.isLoading = true;
    await Promise.all([
        this.fetchLimits(),
        this.fetchUserData()
    ]);
    
    // Pre-fill new amount with principal
    this.newAmount = this.principal;
    // Pre-select current duration or lowest valid
    if (this.validDurationOptions.length > 0) {
        // Try to keep same duration index if possible
        const exists = this.validDurationOptions.find(o => o.value === this.stakeIndex);
        this.selectedDuration = exists ? this.stakeIndex : this.validDurationOptions[0].value;
    }
    
    this.isLoading = false;
  },
  methods: {
    async fetchLimits() {
        this.maxUnstakeAmount = await getMaxUnstakeAmount(true);
        this.maxStakeAmount = await getEffectiveMaxStakeAmount(true);
    },
    async fetchUserData() {
        this.oskBalance = await getOskBalance();
        this.oskAllowance = await getOskAllowance();
    },
    async handlePrincipalOnly() {
        if (this.isPrincipalLimitReached) {
            showToast(this.t('redeem.dailyLimitReached'));
            return;
        }
        this.mode = 'confirmPrincipal';
    },
    async doRedeemPrincipal() {
         const success = await unstakePrincipalOnly(this.stakeId);
         if (success) {
             this.$emit('success');
             this.close();
         }
    },
    switchToReinvest() {
        this.mode = 'reinvest';
    },
    handleReinvestSelect() {
        this.mode = 'reinvest';
    },
    handleAmountInput(event) {
      let value = event.target.value;
      value = value.replace(/[^0-9.]/g, '');
      const parts = value.split('.');
      if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
      }
      if (parts.length === 2 && parts[1].length > 4) {
        value = parts[0] + '.' + parts[1].substring(0, 4);
      }
      this.newAmount = value;
      if (value !== event.target.value) {
          event.target.value = value;
      }
    },
    fillMax() {
        try {
            const decimals = getOskDecimals();
            // Calculate min(balance, maxStakeLimit)
            const balanceBn = ethers.parseUnits(this.oskBalance || '0', decimals);
            const maxLimitBn = ethers.parseUnits(this.maxStakeAmount || '0', decimals);
            
            let maxBn = balanceBn;
            if (maxLimitBn < balanceBn) {
                maxBn = maxLimitBn;
            }
            
            // Format back to string and truncate to 4 decimals
            const maxStr = formatUnits(maxBn, decimals);
            const parts = maxStr.split('.');
            let val = maxStr;
            if (parts.length === 2 && parts[1].length > 4) {
                val = parts[0] + '.' + parts[1].substring(0, 4);
            }
            
            this.newAmount = val;
        } catch (e) {
            console.error("Fill max error", e);
        }
    },
    async handleReinvestAction() {
        const state = this.reinvestButtonState;
        if (state.disabled) return;
        
        if (state.action === 'approve') {
            this.isApproving = true;
            const success = await approveOsk();
            if (success) {
                await this.fetchUserData(); // Refresh allowance
                showToast(this.t('inject.approveSuccess'));
            } else {
                showToast(this.t('inject.approveFailed'));
            }
            this.isApproving = false;
        } else if (state.action === 'stake') {
             const success = await unstakeWithBonus(this.stakeId, this.newAmount, this.selectedDuration);
             if (success) {
                 this.$emit('success');
                 this.close();
             }
        }
    },
    close() {
      this.$emit('close');
    }
  }
};
</script>

<style scoped lang="scss">
.confirm-header-top {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    margin-bottom: 10px;
}

.back-link-top {
    background: transparent;
    border: 1px solid var(--border-light);
    /* Irregular Box matching other elements */
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    transition: all 0.3s ease;
    
    &:hover {
        color: #fff;
        border-color: #fff;
        transform: translateX(-2px) rotate(-1deg);
    }
    
    i {
        font-size: 0.8rem;
    }
}

.confirm-text-container {
    margin-bottom: 30px;
    font-size: 1.1rem;
    line-height: 1.6;
    
    p {
        margin: 4px 0;
    }
    
    .highlight-loss {
        color: #FF3B30;
        font-weight: 700;
        font-size: 1.2rem;
    }
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100vh;
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
  max-width: 480px;
  padding: 24px;
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

.title_holder {
  text-align: center;
  margin-bottom: 20px;
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
      width: 80px;
      height: 2px;
      background: var(--primary-gold);
      margin: 0 auto;
      /* Scribble effect */
      border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
      transform: rotate(-1deg);
      box-shadow: none;
  }
}

.close-button {
  position: absolute;
  top: 20px; right: 20px;
  background: transparent; border: none;
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

.selection-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.option-card {
    position: relative;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-light);
    /* Irregular Box */
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover:not(.disabled) {
        border-color: var(--primary-gold);
        background: rgba(212, 175, 55, 0.05);
        transform: translateY(-2px) rotate(0.5deg);
    }
    
    &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    &.highlight {
        border-color: rgba(212, 175, 55, 0.5);
        background: rgba(212, 175, 55, 0.08);
        transform: rotate(-0.5deg);
        
        &:hover {
            background: rgba(212, 175, 55, 0.12);
            transform: translateY(-2px) rotate(-1deg);
        }
    }
}

.option-badge {
    position: absolute;
    top: -10px; right: 10px;
    background: var(--primary-gold);
    color: #000;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 4px 12px;
    /* Hand drawn pill badge */
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.option-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #fff;
    display: block;
    margin-bottom: 8px;
}

.option-desc {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-bottom: 12px;
}

.warning-text {
    color: #FF3B30;
    font-size: 0.85rem;
    margin-bottom: 12px;
}

.bonus-text {
    color: var(--primary-gold);
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 12px;
}

.info-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    margin-top: 8px;
    
    .label { color: var(--text-muted); }
    .value { color: #fff; font-weight: 600; }
    .value.red { color: #FF3B30; }
    .value.gold { color: var(--primary-gold); }
}

.limit-warning {
    margin-top: 10px;
    color: #FF3B30;
    font-size: 0.8rem;
    background: rgba(255, 59, 48, 0.1);
    padding: 8px;
    border-radius: 4px;
    text-align: center;
}

.reinvest-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-header {
    display: flex;
    align-items: center;
}

.back-btn {
    background: transparent;
    border: 2px solid var(--border-light);
    /* Hand drawn pill */
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    padding: 8px 16px;
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    font-weight: 600;
    
    &:hover { 
        color: #fff;
        border-color: #fff;
        transform: rotate(-1deg);
    }
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 20px;
}

.form-label {
    color: var(--text-secondary);
    font-size: 0.95rem;
    font-family: var(--font-body);
}

.input-wrapper {
    display: flex;
    align-items: center;
    border: 2px solid var(--border-light);
    /* Hand drawn box */
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    background: transparent;
    padding: 0 16px;
    transition: all 0.3s ease;
    
    &.input-error { border-color: #FF3B30; }
    
    &:focus-within {
        border-color: var(--primary-gold);
        background: rgba(212, 175, 55, 0.05);
        transform: rotate(-0.5deg);
    }
}

.form-input {
    flex: 1;
    background: transparent;
    border: none;
    padding: 12px 0;
    color: #fff;
    font-size: 1.2rem;
    font-family: var(--font-mono);
    outline: none;
}

.currency-label {
    color: var(--text-secondary);
    font-weight: 600;
    font-family: var(--font-mono);
}

.balance-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.85rem;
    color: var(--text-muted);
    font-family: var(--font-body);
    margin-top: 6px;
}

.balance-text.text-error {
    color: #FF3B30;
}

.balance-btn {
    color: var(--primary-gold);
    cursor: pointer;
    font-weight: 600;
    padding: 2px 8px;
    background: transparent;
    /* Irregular Border */
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    border: 1px solid rgba(212, 175, 55, 0.4);
    transition: all 0.3s ease;
    font-family: var(--font-mono);
    
    &:hover {
        background: rgba(212, 175, 55, 0.1);
        border-color: var(--primary-gold);
    }
}

.duration-button-group {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

.duration-btn {
    position: relative;
    background: transparent;
    border: 2px solid var(--border-light);
    /* Irregular Box */
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    padding: 16px 8px;
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    
    &:hover { 
        border-color: var(--primary-gold); 
        background: rgba(212, 175, 55, 0.05); 
        transform: translateY(-2px) rotate(1deg);
    }
    
    &.active {
        background: rgba(212, 175, 55, 0.1);
        border-color: var(--primary-gold);
        color: #fff;
        box-shadow: 0 0 15px rgba(212, 175, 55, 0.1);
        transform: rotate(-1deg);
        
        .duration-days { color: var(--primary-gold); font-weight: 700; }
        .duration-rate { opacity: 1; font-weight: 600; }
    }
    
    .active-icon {
        position: absolute;
        top: 6px; right: 6px;
        color: var(--primary-gold);
        font-size: 12px;
    }
}

.duration-days { font-size: 1.1rem; font-weight: 500; font-family: var(--font-body); }
.duration-rate { font-size: 0.75rem; opacity: 0.8; font-family: var(--font-mono); }

.action-btn {
    width: 100%;
    padding: 14px;
    /* Hand drawn pill */
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    font-weight: 600;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: var(--font-body);
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    
    &.confirm-btn {
        background: transparent; /* Outline style preferred for chalk */
        border: 2px solid var(--primary-gold);
        color: var(--primary-gold);
        
        &:hover:not(:disabled) {
            background: rgba(212, 175, 55, 0.1);
            box-shadow: 0 0 20px rgba(212, 175, 55, 0.2);
            transform: rotate(1deg);
        }
        
        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            border-color: rgba(255, 255, 255, 0.2);
            color: rgba(255, 255, 255, 0.5);
        }
    }

    &.primary-btn {
        background: var(--primary-gold);
        color: #000;
        border: none;
        
        &:hover {
             transform: scale(1.02);
             box-shadow: 0 0 15px rgba(212, 175, 55, 0.4);
        }
    }
    
    &.secondary-btn {
        background: transparent;
        border: 1px solid var(--text-muted);
        color: var(--text-muted);
        font-size: 0.9rem;
        
        &:hover {
            border-color: #fff;
            color: #fff;
        }
    }
}

.confirm-view {
    text-align: center;
    padding: 20px 0;
    
    .confirm-icon-wrapper {
        font-size: 3rem;
        color: var(--primary-gold);
        margin-bottom: 20px;
        opacity: 0.8;
    }
    
    .confirm-text {
        font-size: 1.1rem;
        margin-bottom: 30px;
        line-height: 1.5;
        padding: 0 10px;
    }
    
    .button-group-row {
        display: flex;
        gap: 15px;
        justify-content: center;
        align-items: center;
        margin-bottom: 20px;
        
        .small-btn {
            flex: 1;
            white-space: nowrap;
            padding: 14px 10px;
        }
        
        .large-btn {
            flex: 1.2;
            font-size: 1.1rem;
            padding: 14px;
            white-space: nowrap;
        }
    }
    
    .back-link {
        background: none;
        border: none;
        color: var(--text-muted);
        text-decoration: underline;
        cursor: pointer;
        font-size: 0.9rem;
        
        &:hover {
            color: #fff;
        }
    }
}
</style>

