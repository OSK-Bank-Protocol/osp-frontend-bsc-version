<template>
    <section class="section-how-to">
        <div class="container">
            <!-- Header -->
            <div class="section-header wow fadeInUp">
                <h2 class="section-title">{{ t('howToUse.governFuture') }}</h2>
            </div>

            <!-- Content -->
            <div class="content-wrapper">
                <div class="glass-panel wow fadeInUp" data-wow-delay="0.2s">
                    <!-- Title Area -->
                    <div class="panel-header">
                        <p class="panel-desc">{{ t('howToUse.controlWealthDesc') }}</p>
                    </div>

                    <!-- Tab Switcher -->
                    <div class="tab-switcher">
                        <button 
                            class="tab-btn" 
                            :class="{ active: activeTab === 'investment' }"
                            @click="toggleTab('investment')"
                        >
                            {{ t('howToUse.investmentList') }}
                        </button>
                        <button 
                            class="tab-btn" 
                            :class="{ active: activeTab === 'redemption' }"
                            @click="toggleTab('redemption')"
                        >
                            {{ t('howToUse.redemptionList') }}
                        </button>
                    </div>

                    <!-- List Content -->
                    <div class="list-container">
                        <!-- Loading State -->
                        <div v-if="isLoading" class="state-box">
                            <div class="loader"></div>
                            <p>{{ t('howToUse.loadingStakingData') }}</p>
                        </div>

                        <!-- Empty States -->
                        <div v-else-if="!walletState.isAuthenticated" class="state-box">
                            <i class="icon-wallet state-icon"></i>
                            <p>{{ t('howToUse.connectWalletFirst') }}</p>
                        </div>
                        <div v-else-if="!walletState.contractsInitialized" class="state-box">
                            <i class="icon-warning state-icon"></i>
                            <p>{{ t('howToUse.contractInitFailed') }}</p>
                        </div>
                        <div v-else-if="stakingItems.length === 0" class="state-box">
                            <i class="icon-box-open state-icon"></i>
                            <p>{{ activeTab === 'investment' ? t('howToUse.noInvestmentOrders') : t('howToUse.noRedemptionOrders') }}</p>
                        </div>

                        <!-- Data List -->
                        <div v-else class="data-grid">
                            <div v-for="item in stakingItems" :key="item.id" class="data-card">
                                <div class="card-header">
                                    <span class="order-id">
                                        {{ String(item.id + 1).padStart(4, '0') }} | {{ getDurationLabel(item.stakeIndex) }}
                                    </span>
                                    <span class="order-date">{{ item.stakeDate }}</span>
                                </div>
                                
                                <div class="card-body">
                                    <div class="info-row">
                                        <span class="label">{{ t('howToUse.principal') }}</span>
                                        <span class="value highlight">{{ parseFloat(item.principal).toFixed(4) }}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="label">{{ t('howToUse.netValue') }}</span>
                                        <span class="value gold">
                                            {{ parseFloat(item.totalValue).toFixed(4) }}
                                        </span>
                                    </div>
                                </div>

                                <div class="card-footer">
                                    <CountdownTimer v-if="activeTab === 'investment'" :target-timestamp="item.expiryTimestamp" />
                                    
                                    <button v-if="item.displayStatus === 'redeemable'" 
                                            class="action-btn redeem-btn" 
                                            :disabled="unstackingStates[item.id]"
                                            @click.prevent="handleUnstake(item)">
                                        {{ unstackingStates[item.id] ? t('howToUse.redeeming') : t('howToUse.redeem') }}
                                    </button>
                                    <button v-else-if="item.displayStatus === 'redeemed'" class="action-btn disabled-btn" disabled>
                                        {{ t('howToUse.redeemed') }}
                                    </button>
                                    <button v-else class="action-btn disabled-btn" disabled>
                                        {{ t('howToUse.waitingRedeem') }}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Pagination -->
                        <div v-if="totalPages > 1" class="pagination">
                            <button @click="prevPage" :disabled="currentPage === 1" class="page-btn">
                                <!-- Hand-drawn left arrow using SVG -->
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>
                            <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
                            <button @click="nextPage" :disabled="currentPage === totalPages" class="page-btn">
                                <!-- Hand-drawn right arrow using SVG -->
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <RedeemModal 
            v-if="showRedeemModal && selectedRedeemItem"
            :stake-id="String(selectedRedeemItem.id)"
            :principal="selectedRedeemItem.principal"
            :stake-index="selectedRedeemItem.stakeIndex"
            :total-value="selectedRedeemItem.totalValue"
            @close="showRedeemModal = false"
            @success="onRedeemSuccess"
        />
    </section>
</template>

<script setup>
import {
  ref,
  computed,
  watch,
  onUnmounted,
  reactive
} from 'vue';
import {
  walletState
} from '../services/wallet';
import {
  unstake,
  getOskDecimals,
  stakingContract,
  rewardOfSlot,
  formatUnits
} from '../services/contracts';
import { APP_ENV } from '../services/environment';
import CountdownTimer from './CountdownTimer.vue';
import RedeemModal from './RedeemModal.vue';
import { t } from '@/i18n';
import { ethers } from 'ethers';

const stakingItems = ref([]);
const totalItems = ref(0);
const isLoading = ref(true);
const activeTab = ref('investment');
const currentPage = ref(1);
const itemsPerPage = ref(4); // Reduced for compact view
const pollingInterval = ref(null);
const unstackingStates = reactive({});

const showRedeemModal = ref(false);
const selectedRedeemItem = ref(null);

const fetchStakingData = async () => {
    if (!walletState.isAuthenticated || !walletState.contractsInitialized || !stakingContract) {
        stakingItems.value = [];
        totalItems.value = 0;
        isLoading.value = false;
        return;
    }

    try {
        const status = activeTab.value === 'investment' ? 0 : 1;
        const offset = (currentPage.value - 1) * itemsPerPage.value;

        // Ethers.js call returns a promise directly
        const res = await stakingContract.getUserRecords(
            walletState.address,
            offset,
            itemsPerPage.value,
            status
        );

        // TronWeb result handling
        // Named returns should be available as properties
        const pageRecords = res.records || res[0] || [];
        const total = res.total || res[1] || 0;

        totalItems.value = Number(total);
        const decimals = getOskDecimals();
        const isDev = APP_ENV === 'test' || APP_ENV === 'dev';
        const stakeDurations = isDev 
            ? [604800, 1296000, 2592000, 3888000, 5184000] // Dev uses Days: 7, 15, 30, 45, 60 days
            : [604800, 1296000, 2592000, 3888000, 5184000]; // Prod: 7, 15, 30, 45, 60 days

        console.log(`[HowToUse Debug] isDev=${isDev}, Durations=${stakeDurations}`);

        let liveRewards = [];
        if (status === 0 && pageRecords.length > 0) {
            const rewardPromises = pageRecords.map(record => rewardOfSlot(Number(record.id)));
            liveRewards = await Promise.all(rewardPromises);
        }

        stakingItems.value = pageRecords.map((record, index) => {
            const id = Number(record.id);
            let interestBn = 0n;
            
            // Convert everything to BigInt explicitly to avoid type mixing errors
            const amountBn = BigInt(record.amount.toString());
            
            if (status === 0) {
                const totalValue = liveRewards[index] ? BigInt(liveRewards[index].toString()) : 0n;
                interestBn = totalValue > amountBn ? totalValue - amountBn : 0n;
            } else {
                const finalRewardBn = BigInt(record.finalReward.toString());
                interestBn = finalRewardBn > 0n ? finalRewardBn - amountBn : 0n;
            }

            const totalValueBn = amountBn + interestBn;

            const stakeTimeInSeconds = Number(record.stakeTime);
            const stakeIndexVal = Number(record.stakeIndex);
            const stakeDurationInSeconds = stakeDurations[stakeIndexVal] || 0;
            const expiryTimestamp = (stakeTimeInSeconds + stakeDurationInSeconds) * 1000;

            console.log(`[HowToUse Item] Index=${stakeIndexVal}, Time=${stakeTimeInSeconds}, Duration=${stakeDurationInSeconds}, Expiry=${expiryTimestamp}, Now=${Date.now()}`);

            let displayStatus = 'waiting';
            if (record.status === true) {
                displayStatus = 'redeemed';
            } else if (expiryTimestamp <= Date.now()) {
                displayStatus = 'redeemable';
            }

            return {
                principal: formatUnits(amountBn, decimals),
                interest: formatUnits(interestBn, decimals),
                totalValue: formatUnits(totalValueBn, decimals), // Pre-calculated total
                stakeDate: new Date(stakeTimeInSeconds * 1000).toLocaleString('zh-CN', {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit', second: '2-digit',
                    hour12: false
                }).replace(/\//g, '-'),
                expiryTimestamp: expiryTimestamp,
                displayStatus: displayStatus,
                id: id,
                stakeIndex: Number(record.stakeIndex),
            };
        });

    } catch (error) {
        console.error("Error fetching data:", error);
        stakingItems.value = [];
        totalItems.value = 0;
    } finally {
        isLoading.value = false;
    }
};

const handleUnstake = (item) => {
    selectedRedeemItem.value = item;
    showRedeemModal.value = true;
};

const onRedeemSuccess = () => {
    fetchStakingData();
};

const startPolling = () => {
  stopPolling();
  // Increased interval from 15s to 30s as staking status doesn't change that fast
  pollingInterval.value = setInterval(fetchStakingData, 30000);
};

const stopPolling = () => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
    pollingInterval.value = null;
  }
};

watch(() => [walletState.isAuthenticated, walletState.address, walletState.contractsInitialized], ([isAuth, address, contractsReady]) => {
  if (isAuth && contractsReady) {
    if (stakingItems.value.length === 0 && totalItems.value === 0) {
      isLoading.value = true;
    }
    fetchStakingData();
    startPolling();
  } else {
    stopPolling();
    stakingItems.value = [];
    totalItems.value = 0;
    isLoading.value = false;
    activeTab.value = 'investment';
    currentPage.value = 1;
  }
}, { immediate: true });

onUnmounted(() => {
  stopPolling();
});

const toggleTab = (tab) => {
    if (activeTab.value === tab) return;
    activeTab.value = tab;
    currentPage.value = 1;
    isLoading.value = true;
    fetchStakingData();
};

const totalPages = computed(() => {
    if (totalItems.value === 0) return 1;
    return Math.ceil(totalItems.value / itemsPerPage.value);
});

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchStakingData();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchStakingData();
  }
};

const getDurationLabel = (index) => {
    // Always use Days keys
    const keys = ['inject.days7', 'inject.days15', 'inject.days30', 'inject.days45', 'inject.days60'];
    
    // Check if translation exists, otherwise fall back to hardcoded string to avoid empty display
    const key = keys[index] || keys[0];
    const translation = t(key);
    
    // If translation returns the key itself (meaning missing translation), return a fallback
    if (translation === key) {
        const days = [7, 15, 30, 45, 60];
        return `${days[index] || 7} Days`;
    }
    
    return translation;
};
</script>

<style scoped lang="scss">
.section-how-to {
    padding: 60px 0;
    min-height: 600px;
}

.section-header {
    text-align: center;
    margin-bottom: 30px;
}

.section-title {
    font-family: var(--font-heading);
    font-size: 2.5rem;
    color: var(--primary-gold);
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 8px;
    text-shadow: 2px 2px 0px rgba(0,0,0,0.5);
}

.section-subtitle {
    color: var(--text-secondary);
    font-family: var(--font-body);
    font-size: 1.1rem;
}

.glass-panel {
    background: transparent;
    border: none;
    padding: 0 20px;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
}

.panel-header {
    text-align: center;
    margin-bottom: 20px;
}

.panel-title {
    font-family: var(--font-heading);
    font-size: 2rem;
    color: #fff;
    margin-bottom: 12px;
}

.panel-desc {
    color: var(--text-muted);
    font-family: var(--font-body);
}

/* Tabs */
.tab-switcher {
    display: inline-flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 30px;
    background: transparent;
    padding: 0;
    
    position: relative;
    left: 50%;
    transform: translateX(-50%);
    
    flex-wrap: wrap;
}

.tab-btn {
    padding: 10px 15px;
    /* Hand drawn pill */
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    border: 1px solid var(--border-light);
    background: transparent;
    color: var(--text-secondary);
    font-weight: 600;
    font-size: 1rem;
    font-family: var(--font-body);
    white-space: nowrap;
    transition: all 0.3s ease;
    cursor: pointer;
    
    &.active {
        background: var(--primary-gold);
        color: #000;
        border-color: var(--primary-gold);
        box-shadow: 0 0 10px rgba(212, 175, 55, 0.2);
        transform: rotate(-1deg);
    }
    
    &:hover:not(.active) {
        color: var(--primary-gold);
        border-color: var(--primary-gold);
        transform: rotate(1deg);
    }
}

/* State Boxes (Loading/Empty) */
.state-box {
    text-align: center;
    padding: 60px 0;
    color: var(--text-muted);
    font-family: var(--font-body);
    
    .state-icon {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
        display: block;
        color: var(--primary-gold);
    }
    
    .loader {
        width: 40px;
        height: 40px;
        border: 3px solid rgba(255, 255, 255, 0.1);
        border-top-color: var(--primary-gold);
        /* Irregular circle */
        border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 16px;
    }
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Data Grid */
.data-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px; /* Reduced gap from 20px */
    margin-bottom: 20px;
    justify-content: center;
}

.data-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--border-light);
    /* Hand drawn box */
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    padding: 16px; /* Reduced from 20px */
    transition: all 0.3s ease;
    position: relative;
    
    &:hover {
        background: rgba(212, 175, 55, 0.02);
        border-color: var(--primary-gold-dim);
        transform: rotate(-0.5deg) translateY(-2px);
    }
}

.card-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px; /* Reduced from 12px */
    padding-bottom: 8px; /* Reduced from 10px */
    border-bottom: 1px dashed var(--border-light);
    font-size: 0.9rem;
    
    .order-id {
        color: var(--primary-gold);
        font-weight: 600;
        font-family: var(--font-mono);
        letter-spacing: 0.5px;
    }
    
    .order-date {
        color: var(--text-muted);
        font-family: var(--font-mono);
        font-size: 0.8rem;
    }
}

.info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px; /* Reduced from 8px */
    font-size: 0.9rem;
    align-items: center;
    
    .label {
        color: var(--text-secondary);
        font-family: var(--font-body);
    }
    
    .value {
        color: #fff;
        font-family: var(--font-mono);
        font-weight: 500;
        
        &.gold {
            color: var(--primary-gold);
            font-weight: 700;
        }
    }
}

.card-footer {
    margin-top: 10px; /* Reduced from 16px */
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
}

.action-btn {
    padding: 8px 16px;
    /* Hand drawn pill */
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    font-size: 0.8rem;
    font-weight: 600;
    transition: all 0.3s ease;
    flex: 1;
    text-align: center;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    font-family: var(--font-body);
    border: 1px solid transparent;
    text-transform: uppercase;
    letter-spacing: 0.5px;

    &:only-child {
        margin-left: auto;
        margin-right: auto;
        width: 100%; /* Changed to 100% for better look */
        flex: 1;
    }
    
    &.redeem-btn {
        background: transparent;
        border-color: var(--primary-gold);
        color: var(--primary-gold);
        
        &:hover:not(:disabled) {
            background: var(--primary-gold);
            color: #000;
            box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
            transform: rotate(-1deg);
        }

        &:disabled {
             border-color: var(--text-muted);
             color: var(--text-muted);
             cursor: not-allowed;
             opacity: 0.5;
        }
    }
    
    &.disabled-btn {
        background: transparent;
        border: 1px dashed var(--border-light);
        color: var(--text-muted);
        cursor: not-allowed;
        opacity: 0.6;
    }
}

/* Pagination */
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    margin-top: 30px; /* Reduced from 40px */
}

.page-btn {
    width: 36px;
    height: 36px;
    /* Irregular Circle */
    border-radius: 50% 45% 40% 50% / 50% 40% 50% 45%;
    border: 1px solid var(--border-light);
    background: transparent;
    color: var(--primary-gold);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    cursor: pointer;
    
    svg {
        width: 18px;
        height: 18px;
    }
    
    &:hover:not(:disabled) {
        background: rgba(212, 175, 55, 0.1);
        border-color: var(--primary-gold);
        transform: rotate(-5deg) scale(1.1);
        color: var(--primary-gold);
    }
    
    &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
        border-color: var(--border-light);
    }
}

.page-info {
    color: var(--text-secondary);
    font-size: 0.9rem;
    font-family: var(--font-mono);
}
</style>
