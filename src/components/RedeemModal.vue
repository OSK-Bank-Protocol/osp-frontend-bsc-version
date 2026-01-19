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
          <h3>{{ t('redeem.title') }}</h3>
          <div class="cyber-line"></div>
        </div>

        <!-- Mode Selection -->
        <div v-if="mode === 'select'" class="selection-container">
            <!-- Option 1: Principal Only -->
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
            
            <!-- Option 2: Reinvest -->
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
                            :class="{ 'input-error': isAmountInvalid }"
                        >
                        <span class="currency-label">{{ t('common.osk') }}</span>
                    </div>
                    <div class="balance-info">
                        <span class="balance-text">{{ t('inject.maxAmount', { amount: formattedBalance, token: t('common.osk') }) }}</span>
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
      maxUnstakeAmount: '0',
      maxStakeAmount: '0',
      newAmount: '',
      selectedDuration: null,
      oskAllowance: '0',
      oskBalance: '0',
      isApproving: false,
      isLoading: false,
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
        try {
            const limit = parseFloat(this.maxUnstakeAmount);
            const principal = parseFloat(this.principal);
            return limit < principal;
        } catch (e) {
            return false;
        }
    },
    formattedBalance() {
        return parseFloat(this.oskBalance).toFixed(4);
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
    reinvestButtonState() {
        if (!this.newAmount || this.selectedDuration === null) {
            return { text: this.t('redeem.confirmReinvest'), disabled: true };
        }
        if (this.isAmountInvalid) {
             return { text: this.t('inject.insufficientBalance'), disabled: true }; // Simplified error text
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
        
        if (confirm(this.t('redeem.forfeitRewards') + '?')) {
             const success = await unstakePrincipalOnly(this.stakeId);
             if (success) {
                 this.$emit('success');
                 this.close();
             }
        }
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
  padding: 32px;
  background: rgba(20, 20, 20, 0.95);
  border: 2px solid var(--border-light);
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

.title_holder {
  text-align: center;
  margin-bottom: 24px;
  h3 {
    font-size: 1.5rem;
    color: #fff;
    margin-bottom: 12px;
  }
  .cyber-line {
      width: 60px; height: 2px;
      background: var(--primary-gold);
      margin: 0 auto;
  }
}

.close-button {
  position: absolute;
  top: 20px; right: 20px;
  background: transparent; border: none;
  color: var(--text-secondary);
  font-size: 20px;
  cursor: pointer;
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
    border-radius: 12px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover:not(.disabled) {
        border-color: var(--primary-gold);
        background: rgba(212, 175, 55, 0.05);
        transform: translateY(-2px);
    }
    
    &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    &.highlight {
        border-color: rgba(212, 175, 55, 0.5);
        background: rgba(212, 175, 55, 0.08);
        
        &:hover {
            background: rgba(212, 175, 55, 0.12);
        }
    }
}

.option-badge {
    position: absolute;
    top: 0; right: 0;
    background: var(--primary-gold);
    color: #000;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 0 12px 0 12px;
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
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.9rem;
    
    &:hover { color: #fff; }
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.form-label {
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.input-wrapper {
    display: flex;
    align-items: center;
    border: 1px solid var(--border-light);
    border-radius: 8px;
    background: rgba(0,0,0,0.2);
    padding: 0 16px;
    
    &.input-error { border-color: #FF3B30; }
    
    &:focus-within {
        border-color: var(--primary-gold);
    }
}

.form-input {
    flex: 1;
    background: transparent;
    border: none;
    padding: 14px 0;
    color: #fff;
    font-size: 1.1rem;
    outline: none;
}

.currency-label {
    color: var(--text-secondary);
    font-weight: 600;
}

.balance-info {
    text-align: right;
    font-size: 0.8rem;
    color: var(--text-muted);
}

.duration-button-group {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}

.duration-btn {
    position: relative;
    background: transparent;
    border: 1px solid var(--border-light);
    border-radius: 8px;
    padding: 12px;
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    
    &:hover { border-color: var(--primary-gold); background: rgba(212,175,55,0.05); }
    
    &.active {
        border-color: var(--primary-gold);
        background: rgba(212,175,55,0.1);
        color: #fff;
        
        .duration-days { color: var(--primary-gold); }
    }
    
    .active-icon {
        position: absolute;
        top: 6px; right: 6px;
        color: var(--primary-gold);
        font-size: 10px;
    }
}

.duration-days { font-weight: 600; }
.duration-rate { font-size: 0.75rem; opacity: 0.8; }

.action-btn {
    width: 100%;
    padding: 16px;
    background: var(--primary-gold);
    border: none;
    border-radius: 8px;
    color: #000;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
    }
    
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: #333;
        color: #666;
    }
}
</style>

