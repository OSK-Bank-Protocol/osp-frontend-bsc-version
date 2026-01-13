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
          <h3>{{ t('inject.title') }}</h3>
          <div class="cyber-line"></div>
        </div>

        <!-- Amount Input Group -->
        <div class="form-group">
          <label class="form-label">{{ t('inject.amountLabel') }}</label>
          <div class="amount-input-group">
            <div class="input-wrapper tech-border">
              <input 
                type="text" 
                inputmode="decimal"
                :value="amount"
                @input="handleAmountInput"
                :placeholder="t('inject.amountPlaceholder')" 
                class="form-input"
                :class="{ 'input-error': isAmountInvalid }"
              >
              <span class="currency-label">{{ t('common.osk') }}</span>
              <div class="corner-mark tl"></div>
              <div class="corner-mark tr"></div>
              <div class="corner-mark bl"></div>
              <div class="corner-mark br"></div>
            </div>
            <div class="balance-info">
              <span class="balance-text">{{ t('inject.maxAmount', { amount: formattedOskBalance, token: t('common.osk') }) }}</span>
              <button @click.prevent="fillMax" class="balance-btn">MAX</button>
            </div>
          </div>
        </div>

        <!-- Duration Button Group -->
        <div class="form-group">
          <label class="form-label">{{ t('inject.durationLabel') }}</label>
          <div class="duration-button-group">
            <button 
              v-for="option in durationOptions" 
              :key="option.value"
              @click="selectedDuration = option.value"
              :class="['duration-btn', { 'active': selectedDuration === option.value }]"
              type="button"
            >
              <div class="card-bg-glow"></div>
              <span class="duration-days">{{ option.days }}</span>
              <span class="duration-rate">{{ option.rate }}</span>
              <i v-if="selectedDuration === option.value" class="icon icon-check active-icon"></i>
              
              <div class="corner-mark tl"></div>
              <div class="corner-mark tr"></div>
              <div class="corner-mark bl"></div>
              <div class="corner-mark br"></div>
            </button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="button-group">
          <button @click.prevent="close" class="action-btn cancel-btn">
            {{ t('inject.cancel') }}
          </button>
          <button @click.prevent="handleMainAction" class="action-btn confirm-btn" :disabled="mainButtonState.disabled">
            {{ mainButtonState.text }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import {
  walletState
} from '../services/wallet';
import {
  getOskBalance,
  getOskAllowance,
  approveOsk,
  getEffectiveMaxStakeAmount,
  getUserStakedBalance,
  getPoolOskReserves,
  getOskDecimals
} from '../services/contracts';
import {
  ENABLE_TEMPORARY_STAKE_LIMIT,
  TEMPORARY_STAKE_LIMIT,
  ENABLE_SINGLE_PURCHASE_LIMIT,
  SINGLE_PURCHASE_LIMIT,
  APP_ENV
} from '../services/environment';
import {
  showToast
} from '../services/notification';
import { t } from '@/i18n';
import { ethers } from 'ethers';


export default {
  name: 'InjectPoolModal',
  setup() {
    return {
      t,
    };
  },
  data() {
    return {
      amount: '',
      selectedDuration: 3, // Default to 45 days (index 3)
      oskBalance: '0',
      oskAllowance: '0',
      userStakedBalance: '0', // User's current staked balance
      poolOskReserves: '0', // Global pool reserves
      isApproving: false,
      isLoading: true, // Start with loading true to fetch allowance
      walletState: walletState,
      maxStakeAmount: '0',
    };
  },
  computed: {
    durationOptions() {
      const isDev = APP_ENV === 'test' || APP_ENV === 'dev';
      if (isDev) {
        return [
          {
            value: 0,
            days: this.t('inject.minutes7'),
            rate: this.t('inject.rate7')
          },
          {
            value: 1,
            days: this.t('inject.minutes15'),
            rate: this.t('inject.rate15')
          },
          {
            value: 2,
            days: this.t('inject.minutes30'),
            rate: this.t('inject.rate30')
          },
          {
            value: 3,
            days: this.t('inject.minutes45'),
            rate: this.t('inject.rate45')
          }
        ];
      }
      return [
        {
          value: 0,
          days: this.t('inject.days7'),
          rate: this.t('inject.rate7')
        },
        {
          value: 1,
          days: this.t('inject.days15'),
          rate: this.t('inject.rate15')
        },
        {
          value: 2,
          days: this.t('inject.days30'),
          rate: this.t('inject.rate30')
        },
        {
          value: 3,
          days: this.t('inject.days45'),
          rate: this.t('inject.rate45')
        }
      ];
    },
    walletAddress() {
      return this.walletState.address;
    },
    // Calculate the effective maximum stake amount based on temporary limit settings
    effectiveMaxStakeAmount() {
      const maxAllowedByContract = parseFloat(this.maxStakeAmount);
      let effectiveAmount = maxAllowedByContract;
      let limitSource = 'Global/Contract Limit';

      // Apply temporary user-specific stake limit if enabled
      if (ENABLE_TEMPORARY_STAKE_LIMIT) {
        const userStaked = parseFloat(this.userStakedBalance);
        const remainingQuota = Math.max(0, TEMPORARY_STAKE_LIMIT - userStaked);
        if (remainingQuota < effectiveAmount) {
          effectiveAmount = remainingQuota;
          limitSource = `Temporary Quota (Limit: ${TEMPORARY_STAKE_LIMIT}, Used: ${userStaked})`;
        }
      }

      // Note: ENABLE_SINGLE_PURCHASE_LIMIT is already handled in getEffectiveMaxStakeAmount within contracts.js
      
      console.log(`[注入弹窗限额] 全局=${maxAllowedByContract}, 用户有效=${effectiveAmount} (${limitSource})`);
      return effectiveAmount;
    },
    isAmountInvalid() {
      if (!this.amount) return false;
      try {
          const decimals = getOskDecimals();
          const amountBn = ethers.parseUnits(this.amount, decimals);
          const maxAllowedBn = ethers.parseUnits(this.effectiveMaxStakeAmount, decimals);
          return amountBn > maxAllowedBn;
      } catch (e) {
          return false;
      }
    },
    mainButtonState() {
      // Logic using BigInt for precision
      try {
        if (!this.amount || parseFloat(this.amount) <= 0) {
           return { text: this.t('inject.enterAmount'), action: 'idle', disabled: true };
        }

        const decimals = getOskDecimals();
        const amountBn = ethers.parseUnits(this.amount, decimals);
        const allowanceBn = ethers.parseUnits(this.oskAllowance || '0', decimals);

        if (this.isApproving) {
            return { text: this.t('inject.approving'), action: 'approving', disabled: true };
        }
        
        // Compare BigInts
        if (allowanceBn < amountBn) {
            return { text: this.t('inject.approveOsk'), action: 'approve', disabled: false };
        }

        if (this.walletState.isNewUser) {
            return { text: this.t('inject.nextStep'), action: 'next_step', disabled: false };
        } else {
            return { text: this.t('inject.confirmStake'), action: 'stake', disabled: false };
        }
      } catch (e) {
        console.error("Input parse error", e);
        return { text: this.t('inject.enterAmount'), action: 'idle', disabled: true };
      }
    },
    formattedOskBalance() {
      const displayValue = this.effectiveMaxStakeAmount;

      if (isNaN(displayValue)) {
           return '0.00';
      }
      
      // Truncate to 4 decimal places for display
      let valStr = displayValue.toString();
      const parts = valStr.split('.');
      if (parts.length === 2 && parts[1].length > 4) {
        valStr = parts[0] + '.' + parts[1].substring(0, 4);
      } else if (parts.length === 1 || (parts.length === 2 && parts[1].length < 2)) {
         // If integer or less than 2 decimals, keep standard formatting logic (e.g. min 2 decimals)
         // But user asked for truncation specifically. Let's stick to truncation logic but ensure it looks nice?
         // User said "truncate 4 places".
         // If we just want to show up to 4 places max, we can use toLocaleString with maxFractionDigits: 4
         // But standard toLocaleString rounds. To trunc:
         // We already did string truncation above.
      }
      
      // Actually, if we want to mimic the input behavior:
      // If it has more than 4, cut it.
      // If it has less, usually we might want to show at least 2 for currency?
      // Let's rely on the string manipulation for strict 4-place truncation.
      
      // But we probably still want comma separators for thousands?
      // The previous code used toLocaleString.
      
      // Hybrid approach: Truncate numeric value first, then format?
      // No, format then truncate is hard.
      
      // Let's use a regex helper or floor logic.
      const factor = Math.pow(10, 4);
      const truncated = Math.floor(displayValue * factor) / factor;
      
      const formatted = truncated.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
        useGrouping: true // Comma separators
      });
      
      return formatted;
    }
  },
  watch: {
    walletAddress(newAddress) {
      if (newAddress) {
        this.fetchInitialData();
      } else {
        this.resetBalance();
        this.oskAllowance = '0';
        this.maxStakeAmount = '0';
        this.userStakedBalance = '0';
      }
    }
  },
  methods: {
    async fetchInitialData() {
      if (!this.walletState.address) return;
      this.isLoading = true;
      await Promise.all([
        this.fetchOskBalance(),
        this.fetchOskAllowance(),
        this.fetchMaxStakeAmount(),
        this.fetchUserStakedBalance()
      ]);
      
      const allowanceNum = parseFloat(this.oskAllowance);
      const isApproved = allowanceNum > 0;
      console.log(`[注入弹窗数据] 余额=${this.oskBalance}, 授权=${this.oskAllowance}, 合约限额=${this.maxStakeAmount}, 已质押=${this.userStakedBalance}`);

      this.isLoading = false;
    },
    async fetchOskBalance() {
      const rawBalance = await getOskBalance();
      this.oskBalance = rawBalance;
    },
    async fetchOskAllowance() {
      this.oskAllowance = await getOskAllowance();
    },
    async fetchMaxStakeAmount() {
      // Force refresh for modal open to ensure up-to-date quota
      this.maxStakeAmount = await getEffectiveMaxStakeAmount(true);
    },
    async fetchUserStakedBalance() {
      this.userStakedBalance = await getUserStakedBalance();
    },
    async fetchPoolOskReserves() {
      this.poolOskReserves = await getPoolOskReserves();
    },
    resetBalance() {
      this.oskBalance = '0';
    },
    close() {
      this.$emit('close');
    },
    handleAmountInput(event) {
      let value = event.target.value;
      // 1. Remove non-numeric chars except dot
      value = value.replace(/[^0-9.]/g, '');
      
      // 2. Prevent multiple dots
      const parts = value.split('.');
      if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
      }

      // 3. Truncate to 4 decimal places
      if (parts.length === 2 && parts[1].length > 4) {
        value = parts[0] + '.' + parts[1].substring(0, 4);
      }
      
      this.amount = value;
      // Force update input value if it was truncated
      if (value !== event.target.value) {
          event.target.value = value;
      }
    },
    fillMax() {
      // Get the effective max amount as a number
      let maxAmount = this.effectiveMaxStakeAmount;
      
      // Convert to string and truncate to 4 decimal places without rounding
      let maxAmountStr = maxAmount.toString();
      const parts = maxAmountStr.split('.');
      if (parts.length === 2 && parts[1].length > 4) {
        maxAmountStr = parts[0] + '.' + parts[1].substring(0, 4);
      }
      
      this.amount = maxAmountStr;
    },
    async handleMainAction() {
      if (this.mainButtonState.disabled) {
        return;
      }
      
      // --- Validation Logic (BigInt) ---
      try {
          const decimals = getOskDecimals();
          const inputAmountBn = ethers.parseUnits(this.amount, decimals);
          const userBalanceBn = ethers.parseUnits(this.oskBalance || '0', decimals);
          const maxAllowedBn = ethers.parseUnits(this.effectiveMaxStakeAmount, decimals);

          if (inputAmountBn > userBalanceBn) {
              showToast(this.t('inject.insufficientBalance'));
              return;
          }
          if (inputAmountBn > maxAllowedBn) {
              // Show formatted max amount error
              let maxStr = this.effectiveMaxStakeAmount;
              // Simple string truncation for display if needed
              const parts = maxStr.split('.');
              if (parts.length === 2 && parts[1].length > 4) {
                 maxStr = parts[0] + '.' + parts[1].substring(0, 4);
              }
              showToast(this.t('inject.maxAmountExceeded', { amount: maxStr }));
              return;
          }
      } catch (e) {
          console.error("Validation error", e);
          showToast("Invalid amount format");
          return;
      }
      // --- End Validation Logic ---
      
      console.log(`[注入资产弹窗] 主操作按钮被点击, 当前状态: '${this.mainButtonState.action}'`);

      const action = this.mainButtonState.action;

      switch (action) {
        case 'approve':
          console.log("[注入资产弹窗] 执行操作: 请求OSK授权");
          this.isApproving = true;
          const success = await approveOsk();
          if (success) {
            showToast(this.t('toast.txSent'));
            
            // Poll for allowance update
            let attempts = 0;
            const maxAttempts = 20; // 20 * 3s = 60s max
            const pollInterval = setInterval(async () => {
                attempts++;
                await this.fetchOskAllowance();
                
                // Check allowance using BigInt
                try {
                    const decimals = getOskDecimals();
                    const currentAllowanceBn = ethers.parseUnits(this.oskAllowance || '0', decimals);
                    const requiredAmountBn = ethers.parseUnits(this.amount, decimals);
                    
                    if (currentAllowanceBn >= requiredAmountBn) {
                        clearInterval(pollInterval);
                        this.isApproving = false;
                        showToast(this.t('inject.approveSuccess'));
                    } else if (attempts >= maxAttempts) {
                        clearInterval(pollInterval);
                        this.isApproving = false;
                    }
                } catch (e) {
                     clearInterval(pollInterval);
                     this.isApproving = false;
                }
            }, 3000);
            
            return; 
          } else {
            showToast(this.t('inject.approveFailed'));
            this.isApproving = false;
          }
          break;
        case 'next_step':
          console.log("[注入资产弹窗] 执行操作: 进入下一步 -> 确认推荐人");
          this.$emit('confirm', {
            amount: this.amount,
            duration: this.selectedDuration
          });
          break;
        case 'stake':
          console.log("[注入资产弹窗] 执行操作: 直接进入质押流程");
          this.$emit('confirm', {
            amount: this.amount,
            duration: this.selectedDuration
          });
          break;
      }
    },
  },
  mounted() {
    if (this.walletAddress) {
      this.fetchInitialData();
    } else {
      this.isLoading = false;
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
  max-width: 420px;
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
      
      &::before, &::after {
          display: none; /* Remove cyber dots */
      }
  }
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  color: var(--text-secondary);
  margin-bottom: 12px;
  font-size: 1rem;
  font-family: var(--font-body);
}

.amount-input-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: transparent;
  border: 2px solid var(--border-light);
  /* Hand drawn box */
  border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
  transition: all 0.3s ease;
  
  /* Remove old corner marks */
  .corner-mark { display: none; }
  
  &:focus-within {
      border-color: var(--primary-gold);
      background: rgba(212, 175, 55, 0.05);
      transform: rotate(-0.5deg);
  }
}

.form-input {
  width: 100%;
  padding: 16px 20px;
  padding-right: 60px;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  font-family: var(--font-mono);
  transition: all 0.3s ease;
  
  &:focus {
      outline: none;
  }
  
  &.input-error {
      color: #FF3B30;
  }
}

.currency-label {
    position: absolute;
    right: 20px;
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
}

.balance-text {
    font-weight: 700;
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
  padding: 16px 8px;
  background: transparent;
  border: 2px solid var(--border-light);
  /* Irregular Box */
  border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  overflow: hidden;

  /* Remove corner marks */
  .corner-mark { display: none; }

  .card-bg-glow {
      display: none; /* Remove digital glow */
  }
  
  .active-icon {
      position: absolute;
      top: 6px;
      right: 6px;
      font-size: 12px;
      color: var(--primary-gold);
  }

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
    
    .duration-days {
        color: var(--primary-gold);
        font-weight: 700;
    }
    
    .duration-rate {
        opacity: 1;
        font-weight: 600;
    }
  }
}

.duration-days {
  font-size: 1.1rem;
  font-weight: 500;
  font-family: var(--font-body);
}

.duration-rate {
  font-size: 0.75rem;
  opacity: 0.8;
  font-family: var(--font-mono);
}

.button-group {
  display: flex;
  gap: 16px;
  margin-top: 32px;
}

.action-btn {
    flex: 1;
    padding: 14px;
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
    
    &.cancel-btn {
        background: transparent;
        border: 2px solid var(--border-light);
        color: var(--text-secondary);
        
        &:hover {
            border-color: #fff;
            color: #fff;
            transform: rotate(-1deg);
        }
    }
    
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
}
</style>
