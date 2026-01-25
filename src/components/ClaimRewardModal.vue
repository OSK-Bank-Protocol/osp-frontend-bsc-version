<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content cool-modal">
      <!-- Tech corners -->
      <div class="tech-corner top-left"></div>
      <div class="tech-corner top-right"></div>
      <div class="tech-corner bottom-left"></div>
      <div class="tech-corner bottom-right"></div>

      <div class="modal-body">
        <button @click="$emit('close')" class="close-button">
            <i class="icon icon-close"></i>
        </button>

        <div class="title_holder">
          <h3 class="modal-title">{{ t('claim.title') }}</h3>
        </div>

        <!-- Authenticated View -->
        <div v-if="walletState.isAuthenticated" class="reward-container">
            <!-- Loading State -->
            <div v-if="isLoading" class="loading-state">
                <div class="spinner"></div>
                <p>{{ t('claim.loading') }}</p>
            </div>

            <div v-else class="rewards-list">
                <!-- Level Rewards (Glory Point) -->
                <div class="reward-card level-reward-card">
                    <div class="card-header">
                        <span class="card-title">
                            {{ t('claim.levelRewardTitle') }}
                        </span>
                    </div>
                    
                    <div class="level-list">
                        <div v-for="level in levels" 
                             :key="level.id"
                             class="level-row" 
                             :class="{ 'unlocked': level.kpiMet, 'has-reward': parseFloat(level.rewards) > 0 }">
                            <div class="row-bg-effect"></div>
                            <div class="col-info">
                                <span class="level-tag">{{ level.tag }}</span>
                                <div class="status-indicator">
                                    <i class="icon icon-check" v-if="level.kpiMet"></i>
                                    <svg v-else class="lock-icon" viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                </div>
                            </div>
                            <div class="col-value mono">{{ formatReward(level.rewards) }}</div>
                            <div class="col-action">
                                <button 
                                    @click="claim(level.id)" 
                                    :disabled="isRewardZero(level.rewards) || isClaiming[level.id]" 
                                    class="mini-claim-btn"
                                    :class="{ 'processing': isClaiming[level.id] }"
                                >
                                    {{ isClaiming[level.id] ? t('claim.claiming') : t('claim.claim') }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Node Rewards (Node Point) -->
                <!-- <div v-if="showNodePointSection" class="reward-card">
                    <div class="card-header">
                        <span class="card-title">{{ t('claim.nodeRewardTitle') }}</span>
                        <span class="card-value">{{ truncatedNodeRewards }} <small>{{ t('common.osp') }}</small></span>
                    </div>
                    <button 
                        @click="claimNodeReward" 
                        class="action-btn primary-btn full-width is-disabled"
                    >
                        {{ isClaimingNodeReward ? t('claim.claiming') : t('claim.claim') }}
                    </button>
                </div> -->

                <!-- Dividend Rewards (Dividend Point) -->
                <!-- <div v-if="showDividendPointSection" class="reward-card">
                    <div class="card-header">
                        <span class="card-title">{{ t('claim.dividendRewardTitle') }}</span>
                        <span class="card-value">{{ truncatedDividendRewards }} <small>{{ t('common.osk') }}</small></span>
                    </div>
                    <button 
                        @click="claimDividendReward" 
                        :disabled="isRewardZero(dividend_rewards) || isClaimingDividendReward" 
                        class="action-btn primary-btn full-width"
                    >
                        {{ isClaimingDividendReward ? t('claim.claiming') : t('claim.claim') }}
                    </button>
                </div> -->
            </div>
        </div>

        <!-- Unauthenticated View -->
        <div v-else class="unauth-view">
            <i class="icon-wallet"></i>
            <p>{{ t('claim.connectWallet') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
    ref,
    watch,
    computed
} from 'vue';
import {
    walletState
} from '../services/wallet';
import {
    getTeamKpiBigNumber,
    getS5PendingRewards,
    getS6PendingRewards,
    getS7PendingRewards,
    claimS5Rewards,
    claimS6Rewards,
    claimS7Rewards,
    getNodePointRewards,
    claimNodePointRewards,
    checkIsPreacher,
    getDividendPointRewards,
    claimDividendPointRewards,
    S5_THRESHOLD,
    S6_THRESHOLD,
    S7_THRESHOLD
} from '../services/contracts';
import { t } from '@/i18n';
import { showToast } from '../services/notification';
import { ethers } from 'ethers';

const emit = defineEmits(['close']);
const isLoading = ref(true);
const s5_kpiMet = ref(false);
const s6_kpiMet = ref(false);
const s7_kpiMet = ref(false);
const s5_rewards = ref('0');
const s6_rewards = ref('0');
const s7_rewards = ref('0');
const node_rewards = ref('0');
const dividend_rewards = ref('0');
const showNodePointSection = ref(false);
const showDividendPointSection = ref(false);
const isPreacher = ref(false);
const isClaiming = ref({
    5: false,
    6: false,
    7: false
});
const isClaimingNodeReward = ref(false);
const isClaimingDividendReward = ref(false);

const truncatedNodeRewards = computed(() => {
    const num = parseFloat(node_rewards.value);
    if (isNaN(num)) return '0.0000';
    const truncated = Math.floor(num * 10000) / 10000;
    return truncated.toFixed(4);
});

const truncatedDividendRewards = computed(() => {
    const num = parseFloat(dividend_rewards.value);
    if (isNaN(num)) return '0.0000';
    const truncated = Math.floor(num * 10000) / 10000;
    return truncated.toFixed(4);
});

import { getOskDecimals } from '../services/contracts';

const isRewardZero = (val) => {
    try {
        if (!val) return true;
        // Use BigInt check: parse string to BigInt
        // Assuming val is like "123.456", formatUnits output.
        // To check strict > 0, we can just check if parseFloat > 0, 
        // OR better: check if it contains any non-zero digit.
        // But the safest given formatUnits output is indeed parsing it back or just float.
        // Given formatUnits returns standard decimal string:
        return parseFloat(val) <= 0;
    } catch (e) {
        return true;
    }
};

const levels = computed(() => [
    { id: 5, tag: 'S5', kpiMet: s5_kpiMet.value, rewards: s5_rewards.value },
    { id: 6, tag: 'S6', kpiMet: s6_kpiMet.value, rewards: s6_rewards.value },
    { id: 7, tag: 'S7', kpiMet: s7_kpiMet.value, rewards: s7_rewards.value },
]);

const formatReward = (val) => {
    const num = parseFloat(val);
    if (num > 0) return num.toFixed(2);
    return '--';
};

const fetchRewardData = async () => {
    if (!walletState.isAuthenticated || !walletState.contractsInitialized) return;

    isLoading.value = true;
    try {
        /*
        const [kpi, s5Rewards, s6Rewards, s7Rewards, nodeRewards, preacherStatus, dividendRewards] = await Promise.all([
            getTeamKpiBigNumber(),
            getS5PendingRewards(),
            getS6PendingRewards(),
            getS7PendingRewards(),
            getNodePointRewards(),
            checkIsPreacher(),
            getDividendPointRewards()
        ]);
        */
       
        // Modified to exclude node and dividend rewards
        const [kpi, s5Rewards, s6Rewards, s7Rewards, preacherStatus] = await Promise.all([
            getTeamKpiBigNumber(),
            getS5PendingRewards(),
            getS6PendingRewards(),
            getS7PendingRewards(),
            // getNodePointRewards(),
            checkIsPreacher(),
            // getDividendPointRewards()
        ]);

        const kpiMetS7 = kpi >= S7_THRESHOLD;
        const kpiMetS6 = kpi >= S6_THRESHOLD;
        const kpiMetS5 = kpi >= S5_THRESHOLD;

        s7_kpiMet.value = kpiMetS7;
        s6_kpiMet.value = kpiMetS6 && !kpiMetS7;
        s5_kpiMet.value = kpiMetS5 && !kpiMetS6;

        s5_rewards.value = s5Rewards;
        s6_rewards.value = s6Rewards;
        s7_rewards.value = s7Rewards;
        // node_rewards.value = nodeRewards;
        // dividend_rewards.value = dividendRewards;
        isPreacher.value = preacherStatus;

        // Use string comparison or regex for show flags to avoid float precision issues
        // Check if string has any non-zero digit
        // showNodePointSection.value = /[1-9]/.test(nodeRewards);
        // showDividendPointSection.value = /[1-9]/.test(dividendRewards);

    } catch (error) {
        console.error("Failed to fetch reward data:", error);
    } finally {
        isLoading.value = false;
    }
};

const claim = async (level) => {
    if (isClaiming.value[level]) return;
    isClaiming.value[level] = true;

    let success = false;
    try {
        switch (level) {
            case 5: success = await claimS5Rewards(); break;
            case 6: success = await claimS6Rewards(); break;
            case 7: success = await claimS7Rewards(); break;
        }

        if (success) {
            // Force refresh cache after successful claim
            // Since we implemented simple cache, we might need a way to invalidate.
            // But currently our cache doesn't have explicit invalidate export.
            // Actually, waiting 5 seconds is acceptable, or we can improve cache system later.
            // For now, let's just re-fetch.
            // Ideally, we should invalidate the specific cache key.
            // However, given the 'checkAllClaimableRewards' might have cached it, 
            // the user might see old data for 5 seconds.
            // Let's assume the user will see '0' after 5 seconds automatically or if they reopen.
            // But immediate update is better.
            
            // To properly support "refresh now", we would need to bypass cache or invalidate it.
            // Since we didn't export invalidate, let's just wait a bit or re-fetch and hope cache expires
            // or modify cachedCall to accept 'force' param?
            // The current cachedCall doesn't support force refresh easily without code change.
            // But for UI responsiveness, we can optimistically update local state to 0.
            
            if (level === 5) s5_rewards.value = "0";
            if (level === 6) s6_rewards.value = "0";
            if (level === 7) s7_rewards.value = "0";
            
            // Still try to fetch to get real data eventually
            setTimeout(() => fetchRewardData(), 5000); 
        }
    } catch (error) {
        console.error(`Error claiming S${level}:`, error);
    } finally {
        isClaiming.value[level] = false;
    }
};

const claimNodeReward = async () => {
    // Temporary disable Node Reward
    /*
    showToast(t('toast.notYetOpen'));
    return;
    */

    /* Original logic commented out for temporary disable
    if (!isPreacher.value) {
        showToast(t('toast.stake200Tokens'));
        return;
    }

    if (isClaimingNodeReward.value || parseFloat(node_rewards.value) <= 0) return;
    isClaimingNodeReward.value = true;

    try {
        const success = await claimNodePointRewards();
        if (success) {
            showToast(t('toast.claimSuccess'));
            // Optimistic update
            node_rewards.value = "0";
            setTimeout(() => emit('close'), 1500);
        }
    } catch (error) {
        console.error('Error claiming Node Point:', error);
    } finally {
        isClaimingNodeReward.value = false;
    }
    */
};

const claimDividendReward = async () => {
    /*
    if (!isPreacher.value) {
        showToast(t('toast.stake200Tokens'));
        return;
    }

    if (isClaimingDividendReward.value || parseFloat(dividend_rewards.value) <= 0) return;
    isClaimingDividendReward.value = true;

    try {
        const success = await claimDividendPointRewards();
        if (success) {
            emit('close');
        }
    } catch (error) {
        console.error('Error claiming Dividend Point:', error);
    } finally {
        isClaimingDividendReward.value = false;
    }
    */
};

watch(() => walletState.isAuthenticated, (isAuth) => {
    if (isAuth && walletState.contractsInitialized) {
        fetchRewardData();
    } else {
        isLoading.value = true;
        s5_kpiMet.value = false;
        s6_kpiMet.value = false;
        s7_kpiMet.value = false;
        s5_rewards.value = '0';
        s6_rewards.value = '0';
        s7_rewards.value = '0';
        node_rewards.value = '0';
        dividend_rewards.value = '0';
        showNodePointSection.value = false;
        showDividendPointSection.value = false;
        isPreacher.value = false;
    }
}, {
    immediate: true
});
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
    background: rgba(20, 20, 20, 0.95);
    border: 2px solid var(--border-light);
    /* Hand-drawn Box */
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    overflow: visible;
    padding: 24px;
    
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
  margin-bottom: 20px;

  .modal-title {
    font-family: var(--font-heading);
    font-size: 1.8rem;
    margin: 0;
    color: #fff;
    font-weight: 400;
    letter-spacing: 1px;
    text-shadow: 2px 2px 0px rgba(0,0,0,0.5);
  }
}

/* Loading State */
.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 150px;
    color: var(--text-muted);
    font-family: var(--font-body);

    .spinner {
        width: 30px;
        height: 30px;
        border: 3px solid rgba(212, 175, 55, 0.3);
        border-top-color: var(--primary-gold);
        /* Irregular circle spinner */
        border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 16px;
    }
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Level List */
.level-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.level-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    /* Hand drawn strip */
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    background: transparent;
    border: 2px solid var(--border-light);
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(255, 255, 255, 0.02);
        transform: rotate(-0.5deg);
    }
    
    &.unlocked {
        border-color: var(--primary-gold-dim);
        
        .level-tag {
            color: var(--primary-gold);
            border-color: var(--primary-gold);
            background: rgba(212, 175, 55, 0.1);
        }
        
        .icon-check {
            color: var(--primary-gold);
        }
    }

    &.has-reward {
        border-color: var(--primary-gold);
        background: rgba(212, 175, 55, 0.05);
        
        .col-value {
            color: #fff;
            text-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
        }
    }
}

.col-info {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 60px;
}

.col-value {
    flex: 1;
    text-align: center;
    font-family: var(--font-mono);
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-muted);
    z-index: 1;
}

.col-action {
    min-width: 80px;
    display: flex;
    justify-content: flex-end;
    z-index: 1;
}

.level-tag {
    font-size: 0.8rem;
    font-weight: 700;
    padding: 2px 8px;
    /* Small irregular tag */
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    background: transparent;
    border: 1px solid var(--border-light);
    color: var(--text-muted);
    transition: all 0.3s ease;
    font-family: var(--font-heading);
}

.status-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
}

.lock-icon {
    color: rgba(255, 255, 255, 0.1);
}

.icon-check {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.1);
}

.mini-claim-btn {
    width: auto;
    min-width: 70px;
    padding: 6px 12px;
    font-size: 0.75rem;
    /* Small irregular pill */
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    background: transparent;
    border: 1px solid var(--border-light);
    color: var(--text-muted);
    cursor: not-allowed;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.5px;
    font-family: var(--font-body);

    &:not(:disabled) {
        background: var(--primary-gold);
        border-color: var(--primary-gold);
        color: #000;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        cursor: pointer;
        
        &:hover {
            transform: translateY(-1px) rotate(1deg);
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
        
        &:active {
            transform: translateY(0);
        }
    }
    
    &.processing {
        opacity: 0.8;
        cursor: wait;
    }
}

/* Reward Card for Node/Dividend */
.reward-card {
    background: transparent;
    // border: 2px solid var(--border-light);
    /* Hand drawn box */
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    padding: 6px 20px;
    margin-top: 10px; /* Reduced from 16px */
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    
    &:hover {
        border-color: var(--primary-gold-dim);
        background: rgba(255, 255, 255, 0.02);
    }
    
    .card-header {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 0px;
        margin-bottom: 0px; /* Reduced from 12px */
        
        .card-title {
            font-family: var(--font-body);
            font-size: 0.9rem;
            color: var(--text-secondary);
            width: 100%;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .card-value {
            font-family: var(--font-heading);
            font-size: 1.8rem;
            color: #fff;
            font-weight: 400;
            text-shadow: 2px 2px 0px rgba(0,0,0,0.5);
            
            small {
                font-size: 0.8rem;
                color: var(--primary-gold);
                margin-left: 6px;
                font-weight: 600;
                font-family: var(--font-mono);
            }
        }
    }
}

.action-btn {
    width: 100%;
    padding: 12px;
    /* Hand drawn pill */
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    font-weight: 600;
    font-size: 1rem;
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: var(--font-body);
    
    &.primary-btn {
        background: transparent;
        border-color: var(--primary-gold);
        color: var(--primary-gold);
        
        &:hover:not(:disabled) {
            background: rgba(212, 175, 55, 0.1);
            box-shadow: 0 0 15px rgba(212, 175, 55, 0.2);
            transform: rotate(1deg);
        }
        
        &:disabled,
        &.is-disabled {
            border-color: rgba(255, 255, 255, 0.1);
            color: var(--text-muted);
            cursor: not-allowed;
        }
    }
}

/* Unauth View */
.unauth-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 150px;
    color: var(--text-muted);
    gap: 16px;
    font-family: var(--font-body);
    
    i {
        font-size: 2rem;
        color: var(--primary-gold);
        opacity: 0.5;
    }
}
</style>


