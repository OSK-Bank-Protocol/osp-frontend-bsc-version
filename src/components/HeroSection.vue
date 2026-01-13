<template>
    <section class="hero-section">
        <div class="container">
            <!-- Main Content -->
            <div class="hero-content wow fadeInUp">
                <h1 class="hero-title-group">
                    <div class="title-spotlight"></div>
                    <span class="hero-title-line" data-text="OSK BANK">OSK BANK</span>
                    <span class="hero-title-line" data-text="PROTOCOL">PROTOCOL</span>
                </h1>
                <p class="hero-subtitle">
                    {{ t('hero.subtitle') }}
                </p>
                
                <!-- Inject Pool Button Moved Here -->
                <div class="hero-action-wrapper">
                    <button @click.prevent="handleInjectPoolClick" class="action-btn primary-btn hero-main-btn osk-btn">
                        <i class="icon-plus"></i>
                        <span>{{ t('hero.injectPool') }}</span>
                        <div class="btn-shine"></div>
                    </button>

                    <button @click.prevent="handleSwapClick" class="action-btn primary-btn hero-main-btn osk-btn">
                        <i class="icon-plus"></i>
                        <span>{{ t('hero.swap') }}</span>
                        <div class="btn-shine"></div>
                    </button>
                </div>
            </div>

            <!-- Dashboard Card -->
            <div class="dashboard-card wow fadeInUp" data-wow-delay="0.2s">
                <div class="card-glow"></div>
                
                <div class="card-content">
                    <div class="dashboard-grid">
                        <!-- Left Column: Personal Wealth -->
                        <div class="stat-group personal-wealth">
                            <div class="stat-primary">
                                <h3 class="stat-label">{{ t('hero.assetsTitle') }}</h3>
                                <div class="stat-value large">
                                    <span v-if="isLoading" class="loading-text">{{ t('common.loading') }}</span>
                                    <span v-else>
                                        <AnimatedNumber :value="stakedBalance" :decimals="6" />
                                        <span class="unit">{{ t('common.token') }}</span>
                                    </span>
                                </div>
                            </div>
                            
                            <div class="stat-secondary">
                                <span class="label">{{ t('hero.totalInvestment') }}</span>
                                <div class="value">
                                    <span v-if="isLoading">{{ t('common.loading') }}</span>
                                    <span v-else>
                                        <AnimatedNumber :value="totalInvestmentValue" :decimals="2" />
                                        <span class="unit">{{ t('common.token') }}</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Right Column: Social Rank -->
                        <div class="stat-group social-rank">
                            <div class="stat-primary">
                                <h3 class="stat-label">{{ t('hero.friendsBoost') }}</h3>
                                <div class="stat-value large">
                                    <span v-if="isLoading" class="loading-text">{{ t('common.loading') }}</span>
                                    <span v-else>
                                        <AnimatedNumber :value="friendsBoost" :decimals="6" />
                                        <span class="unit">{{ t('common.token') }}</span>
                                    </span>
                                </div>
                            </div>

                            <div class="level-display" v-if="userLevel">
                                <div class="level-icon" :class="`level-${userLevel.toLowerCase()}`">
                                    <span class="level-prefix">LEVEL</span>
                                    <span class="level-text">{{ userLevel }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Actions Row -->
                    <div class="actions-toolbar">
                        <button @click.prevent="shareFriendLink" class="action-btn compact-btn">
                            <i class="icon-ArrowUpRight"></i>
                            <span>{{ t('hero.shareFriend') }}</span>
                        </button>

                        <button @click.prevent="openFriendsContribution" class="action-btn compact-btn">
                            <i class="icon-User"></i>
                            <span>{{ t('share.contributionButton') }}</span>
                        </button>

                        <div class="reward-btn-wrapper">
                            <button @click.prevent="handleClaimLevelReward" class="action-btn compact-btn outline">
                                <i class="icon-star"></i>
                                <span>{{ t('hero.achievementReward') }}</span>
                            </button>
                            <div v-if="walletState.hasClaimableRewards" class="red-dot-indicator"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import {
  ref,
  computed,
  watch,
  onUnmounted
} from 'vue';
import {
  walletState
} from '../services/wallet';
import {
  getUserStakedBalance,
  getFriendsBoost,
  checkIfUserHasReferrer,
  getReferrer,
  getTeamKpiBigNumber,
  S1_THRESHOLD,
  S2_THRESHOLD,
  S3_THRESHOLD,
  S4_THRESHOLD,
  S5_THRESHOLD,
  S6_THRESHOLD,
  S7_THRESHOLD,
  getUserPrincipalBalance,
  formatUnits
} from '../services/contracts';
import {
  showToast
} from '../services/notification';
import AnimatedNumber from './AnimatedNumber.vue';
import { t } from '@/i18n';

const emits = defineEmits(['open-inject-modal', 'open-claim-reward-modal', 'open-share-friend-modal', 'open-friends-contribution-modal']);

const stakedBalance = ref(0);
const friendsBoost = ref(0);
const userLevel = ref('');
const totalInvestmentValue = ref(0);
let fetchInterval = null; 

const isInitialFetch = ref(true);

const isAuthenticated = computed(() => walletState.isAuthenticated);
const isLoading = computed(() => isAuthenticated.value && isInitialFetch.value);


const fetchHeroData = async () => {
  if (!isAuthenticated.value || !walletState.contractsInitialized) {
    console.log('[HeroSection] 跳过数据获取 - 未认证或合约未初始化');
    return;
  }

  if (isInitialFetch.value) {
    console.log("[HeroSection] 正在首次加载数据...");
  }

  try {
    const [newStakedBalance, kpi, principalBalance] = await Promise.all([
      getUserStakedBalance(),
      getTeamKpiBigNumber(),
      getUserPrincipalBalance()
    ]);
    
    stakedBalance.value = parseFloat(newStakedBalance) || 0;
    // 使用 formatUnits 替代 ethers.formatUnits
    friendsBoost.value = parseFloat(formatUnits(kpi, 18)) || 0;
    totalInvestmentValue.value = parseFloat(principalBalance) || 0;
    
    if (kpi >= S7_THRESHOLD) {
      userLevel.value = 'S7';
    } else if (kpi >= S6_THRESHOLD) {
      userLevel.value = 'S6';
    } else if (kpi >= S5_THRESHOLD) {
      userLevel.value = 'S5';
    } else if (kpi >= S4_THRESHOLD) {
      userLevel.value = 'S4';
    } else if (kpi >= S3_THRESHOLD) {
      userLevel.value = 'S3';
    } else if (kpi >= S2_THRESHOLD) {
      userLevel.value = 'S2';
    } else if (kpi >= S1_THRESHOLD) {
      userLevel.value = 'S1';
    } else {
      userLevel.value = '';
    }
  } catch (error) {
    console.error("刷新数据失败:", error);
  } finally {
    if (isInitialFetch.value) {
      isInitialFetch.value = false;
    }
  }
};

const resetData = () => {
  stakedBalance.value = 0;
  friendsBoost.value = 0;
  userLevel.value = '';
  totalInvestmentValue.value = 0;
  isInitialFetch.value = true;
};

const startFetching = () => {
  stopFetching();
  fetchHeroData();
  // Increased interval from 6s to 20s to reduce load and avoid 429 errors
  fetchInterval = setInterval(fetchHeroData, 20000);
};

const stopFetching = () => {
  if (fetchInterval) {
    clearInterval(fetchInterval);
    fetchInterval = null;
  }
};

const handleInjectPoolClick = () => {
  if (!isAuthenticated.value) {
    showToast(t('toast.connectWalletFirst'));
    return;
  }
  emits('open-inject-modal');
};

const handleSwapClick = () => {
  const url = 'https://www.pgglobal.io/swap';
  // Try to open in new tab (popup)
  const newWindow = window.open(url, '_blank');
  
  // If popup blocked or failed (common in in-app browsers/wallets), redirect
  if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
    window.location.href = url;
  }
};

const shareFriendLink = async () => {
  if (!isAuthenticated.value) {
    showToast(t('toast.connectWalletFirst'));
    return;
  }
  
  // Check if user has no referrer or has the specific "unbound" referrer address (same check as Friends Contribution)
  const referrerAddress = await getReferrer();
  const invalidReferrerAddress = 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb';
  
  if (!referrerAddress || 
      referrerAddress === invalidReferrerAddress || 
      referrerAddress.startsWith('0x000')) {
      showToast(t('toast.stakeAndBindFirst'));
      return;
  }

  const referralLink = `${window.location.origin}?ref=${walletState.address}`;
  emits('open-share-friend-modal', { referralLink });
};

const openFriendsContribution = async () => {
    if (!isAuthenticated.value) {
        showToast(t('toast.connectWalletFirst'));
        return;
    }
    const referrerAddress = await getReferrer();
    
    // Check if user has no referrer or has the specific "unbound" referrer address
    const invalidReferrerAddress = 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb';
    
    if (!referrerAddress || 
        referrerAddress === invalidReferrerAddress || 
        referrerAddress.startsWith('0x000')) {
        showToast(t('toast.stakeAndBindFirst'));
        return;
    }
    
    emits('open-friends-contribution-modal', { referrerAddress });
};

const handleClaimLevelReward = () => {
  if (!isAuthenticated.value) {
    showToast(t('toast.connectWalletFirst'));
    return;
  }
  emits('open-claim-reward-modal');
};

watch(() => [isAuthenticated.value, walletState.contractsInitialized], ([isAuth, contractsReady]) => {
  console.log(`[HeroSection] 状态变化 - isAuth: ${isAuth}, contractsReady: ${contractsReady}`);
  if (isAuth && contractsReady) {
    startFetching();
  } else {
    stopFetching();
    if (!isAuth) {
      resetData();
    }
  }
}, { immediate: true });


onUnmounted(() => {
  stopFetching();
});
</script>

<style scoped lang="scss">
.osk-btn {
    min-width: 90% !important;
}

.hero-section {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: calc(var(--header-height) + 80px);
    padding-bottom: 60px;
    z-index: 1;
    overflow: hidden; /* Ensure effects don't overflow */
    
    /* Vintage Grid Background */
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: 
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
        background-size: 50px 50px;
        z-index: -1;
        pointer-events: none;
    }
}

.hero-content {
    text-align: center;
    margin-bottom: 30px; /* Reduced from 80px */
    position: relative;
}

.hero-title-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    position: relative; /* Ensure spotlight is positioned relative to this */
}

.title-spotlight {
    position: absolute;
    top: 60%;
    left: 50%;
    width: 600px;
    height: 600px;
    background: radial-gradient(closest-side, rgba(212, 175, 55, 0.4), transparent);
    filter: blur(40px);
    transform: translate(-50%, -50%);
    z-index: -1;
    pointer-events: none;
    animation: searchlight-sweep 12s infinite ease-in-out;
}

@keyframes searchlight-sweep {
    0% { transform: translate(-80%, -60%) scale(0.9); opacity: 0.6; }
    25% { transform: translate(-20%, -20%) scale(1.1); opacity: 0.9; }
    50% { transform: translate(-60%, -40%) scale(1); opacity: 0.7; }
    75% { transform: translate(-30%, -50%) scale(1.2); opacity: 0.9; }
    100% { transform: translate(-80%, -60%) scale(0.9); opacity: 0.6; }
}

.hero-title-line {
    font-family: var(--font-heading);
    font-size: 6rem;
    font-weight: 400;
    /* Hide the base text so only the animated pseudo-element shows */
    color: rgba(255, 255, 255, 0.1); 
    text-transform: uppercase;
    letter-spacing: 2px;
    position: relative;
    line-height: 1.1;
    display: block;
    
    /* Chalk Dust Filter - adds subtle roughness */
    filter: contrast(1.5) brightness(1.2);

    /* The Animated Text Layer */
    &::before {
        content: attr(data-text);
        position: absolute;
        top: 0;
        left: 0;
        width: 0;
        height: 100%;
        overflow: hidden;
        white-space: nowrap;
        
        /* Cursor styling */
        border-right: 3px solid rgba(255, 255, 255, 0.8); 
        
        /* Advanced Chalk Texture via color and shadows */
        color: var(--primary-gold);
        
        /* 
           Layered shadows to simulate chalk density and dust:
           1. Sharp white/gold inner glow
           2. Soft gold bloom
           3. Hard dark drop shadow for depth on the board
        */
        text-shadow: 
            0 0 1px rgba(238, 207, 161, 0.9), 
            0 0 8px rgba(212, 175, 55, 0.4),
            4px 4px 2px rgba(0, 0, 0, 0.9);
            
        /* Improve font rendering for this effect */
        -webkit-font-smoothing: antialiased;
        opacity: 0.95;
    }

    /* Protocol Line styles */
    &:nth-child(2) {
        color: rgba(255, 255, 255, 0.05);
        
        &::before {
            color: #F4F4F4; /* White Chalk */
            text-shadow: 
                0 0 1px rgba(255, 255, 255, 0.9), 
                0 0 10px rgba(255, 255, 255, 0.3),
                4px 4px 2px rgba(0, 0, 0, 0.9);
            border-right-color: rgba(255, 255, 255, 0.8);
        }
    }

    /* Cycle 1 (OSKBANK): 0-45% */
    /* Cycle 2 (PROTOCOL): 50-95% */

    /* Line 1: OSKBANK (7 characters) */
    &:nth-child(2)::before {
        animation: typeLine1 12s steps(7, end) infinite;
    }

    /* Line 2: PROTOCOL (8 characters) */
    &:nth-child(3)::before {
        animation: typeLine2 12s steps(8, end) infinite;
    }
    
    @media (max-width: 768px) {
        font-size: 3.5rem;
        letter-spacing: 1px;
    }
}

/* 
   Cycle 1 (OSKBANK):
   0-10%: Type in (1.2s)
   10-12%: Hide cursor
   12-88%: Stay
   88-90%: Show cursor & change color for erase
   90-95%: Fast Erase (0.6s) - Half the time of typing
   95-100%: Wait
*/
@keyframes typeLine1 {
    0% { width: 0; border-right-color: var(--primary-gold); color: var(--primary-gold); }
    10% { width: 100%; border-right-color: var(--primary-gold); }
    12% { width: 100%; border-right-color: transparent; } /* Hide cursor */
    88% { width: 100%; border-right-color: transparent; color: var(--primary-gold); }
    90% { width: 100%; border-right-color: var(--primary-gold); color: rgba(238, 207, 161, 0.4); text-shadow: none; } /* Fade color before erase */
    95% { width: 0; border-right-color: var(--primary-gold); color: rgba(238, 207, 161, 0.4); text-shadow: none; }
    96% { width: 0; border-right-color: transparent; }
    100% { width: 0; border-right-color: transparent; color: var(--primary-gold); }
}

/* 
   Cycle 2 (PROTOCOL):
   20-30%: Type in (1.2s)
   30-32%: Hide cursor
   32-83%: Stay
   83-85%: Show cursor & change color for erase
   85-90%: Fast Erase (0.6s)
   90-100%: Wait
*/
@keyframes typeLine2 {
    0% { width: 0; border-right-color: transparent; color: var(--text-primary); }
    18% { width: 0; border-right-color: transparent; }
    20% { width: 0; border-right-color: var(--text-primary); } /* Show cursor */
    30% { width: 100%; border-right-color: var(--text-primary); }
    32% { width: 100%; border-right-color: transparent; } /* Hide cursor */
    83% { width: 100%; border-right-color: transparent; color: var(--text-primary); }
    85% { width: 100%; border-right-color: var(--text-primary); color: rgba(244, 244, 244, 0.4); text-shadow: none; } /* Fade color */
    90% { width: 0; border-right-color: var(--text-primary); color: rgba(244, 244, 244, 0.4); text-shadow: none; }
    92% { width: 0; border-right-color: transparent; }
    100% { width: 0; border-right-color: transparent; color: var(--text-primary); }
}

.hero-subtitle {
    font-family: var(--font-body);
    font-size: 1.5rem;
    color: var(--text-secondary);
    max-width: 600px;
    margin: 0 auto 40px;
    line-height: 1.6;
    transform: rotate(-1deg);
}

/* Main Action Button - Hand-drawn Circle */
.hero-action-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    justify-content: center;
    margin-top: 100px !important;
}

.hero-main-btn {
    padding: 16px 40px;
    min-width: 220px;
    /* Hand-drawn Capsule */
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    background: transparent;
    border: 3px solid var(--primary-gold);
    color: var(--primary-gold);
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    position: relative;
    transition: all 0.3s ease;
    box-shadow: 0 0 20px rgba(0,0,0,0.5);
    
    &:hover {
        transform: scale(1.05) rotate(1deg);
        background: rgba(212, 175, 55, 0.1);
        box-shadow: 0 0 30px rgba(212, 175, 55, 0.2);
    }
    
    i {
        font-size: 1.4rem;
    }
    
    span {
        display: inline-block;
        font-family: var(--font-heading);
        font-weight: 400;
        letter-spacing: 1px;
    }
    
    .btn-shine {
        display: none; 
    }
}

/* Dashboard Card - Scientific Box */
.dashboard-card {
    position: relative;
    background: rgba(20, 20, 20, 0.6);
    backdrop-filter: blur(10px);
    border: 2px solid var(--border-light);
    /* Hand-drawn Box */
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    padding: 30px 40px;
    max-width: 900px;
    margin: 0 auto;
    overflow: hidden;
    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    margin-top: 40px;
    
    /* Corner marks */
    &::after {
        content: '';
        position: absolute;
        top: 10px; left: 10px; right: 10px; bottom: 10px;
        border: 1px dashed var(--text-muted);
        border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
        pointer-events: none;
        opacity: 0.3;
    }
    
    .card-glow {
        display: none; /* Remove digital glow */
    }
    
    @media (max-width: 768px) {
        padding: 20px;
    }
}

.card-content {
    position: relative;
    z-index: 2;
}

/* Dashboard Grid Layout */
.dashboard-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 20px;
    align-items: center;
    
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 24px;
    }
}

.stat-group {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    &.personal-wealth {
        text-align: left;
        border-right: 2px solid rgba(255, 255, 255, 0.1);
        padding-right: 24px;
        
        @media (max-width: 768px) {
            text-align: center;
            border-right: none;
            border-bottom: 2px solid rgba(255, 255, 255, 0.1);
            padding-right: 0;
            padding-bottom: 20px;
        }
    }
    
    &.social-rank {
        text-align: right;
        padding-left: 12px;
        
        @media (max-width: 768px) {
            text-align: center;
            padding-left: 0;
        }
    }
}

.stat-primary {
    .stat-label {
        font-family: var(--font-body), "KaiTi", "STKaiti", "楷体", serif;
        font-size: 1rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 4px;
    }
    
    .stat-value.large {
        font-family: var(--font-heading);
        font-size: 2.2rem; /* Reduced from 2.8rem */
        font-weight: 400;
        color: var(--text-primary);
        display: flex;
        align-items: baseline;
        gap: 6px;
        line-height: 1.1;
        text-shadow: 2px 2px 0px rgba(0,0,0,0.5);
        
        @media (max-width: 768px) {
            justify-content: center;
            font-size: 2rem; /* Reduced mobile size */
        }
        
        .unit {
            font-size: 0.9rem; /* Reduced unit size */
            color: var(--primary-gold);
            font-family: var(--font-mono);
        }
    }
}

.stat-secondary {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-top: 4px;
    font-family: var(--font-body);
    
    @media (max-width: 768px) {
        justify-content: center;
    }
    
    .value {
        color: #fff;
        font-family: var(--font-mono);
        display: flex;
        gap: 4px;
        
        .unit {
            color: var(--text-muted);
            font-size: 0.75rem;
        }
    }
}

/* Level Icon - Stamp Style */
.level-display {
    position: absolute;
    bottom: -15px;
    right: -10px;
    margin-top: 0;
    z-index: 10;
    pointer-events: none; /* Let clicks pass through to underlying elements if any */
    
    @media (max-width: 768px) {
        position: relative;
        bottom: 20px;
        right: -62px;
        margin-top: 0px;
        justify-content: center;
        display: flex;
    }
}

.level-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 134px;
    height: 64px;
    /* Square Stamp */
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.2); /* Slight dark tint behind stamp */
    border: 3px double currentColor; /* Double line for stamp look */
    transition: all 0.3s ease;
    transform: rotate(-11deg);
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    
    /* Stamp Ink Texture Filter */
    backdrop-filter: blur(1px);
    
    .level-prefix {
        font-size: 0.6rem;
        margin-right: 0;
        opacity: 0.9;
        font-weight: 700;
        font-family: var(--font-mono);
        text-transform: uppercase;
        letter-spacing: 1px;
        border-bottom: 1px solid currentColor;
        padding-bottom: 2px;
        margin-bottom: 2px;
        width: 80%;
        text-align: center;
    }

    .level-text {
        font-weight: 900;
        font-size: 1.6rem;
        font-family: var(--font-heading);
        line-height: 1;
    }
    
    /* Color Variants - Stamp Ink Colors */
    &.level-s1, &.level-s2, &.level-s3, &.level-s4 { border-color: #60A5FA; color: #60A5FA; } /* Blue-400 */
    &.level-s5 { border-color: #93C5FD; color: #93C5FD; }
    &.level-s6 { border-color: #BAE6FD; color: #BAE6FD; }
    &.level-s7 { border-color: #E5E4E2; color: #E5E4E2; }
}

.loading-text {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    color: var(--text-muted);
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0% { opacity: 0.5; }
    50% { opacity: 1; }
    100% { opacity: 0.5; }
}

/* Actions Toolbar - Keep Layout */
.actions-toolbar {
    display: flex;
    justify-content: center;
    gap: 8px;
    flex-wrap: nowrap;
    margin-top: 20px;
    padding-top: 24px;
    border-top: 1px dashed rgba(255, 255, 255, 0.1);
    width: 100%;
    
    @media (max-width: 768px) {
        flex-wrap: wrap;
        gap: 8px;
    }
}

.action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    /* Hand drawn pill */
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    font-size: 0.9rem;
    font-weight: 600;
    transition: all 0.3s ease;
    position: relative;
    overflow: visible; /* Allow irregular border to show fully */
    white-space: nowrap;
    flex: 1;
    justify-content: center;
    min-width: fit-content;
    font-family: var(--font-body);
    
    i {
        font-size: 1.1em;
    }
    
    /* Primary Style Overrides not needed as hero-main-btn is handled separately above */
    
    &.compact-btn {
        background: transparent;
        color: var(--text-secondary);
        border: 2px solid rgba(255, 255, 255, 0.1);
        
        &:hover {
            border-color: var(--primary-gold);
            color: var(--primary-gold);
            transform: rotate(1deg);
        }
        
        &.outline {
            border-style: dashed;
            border-color: var(--primary-gold-dim);
            color: var(--primary-gold);
            
            &:hover {
                border-style: solid;
                border-color: var(--primary-gold);
            }
        }
    }
}

.reward-btn-wrapper {
    position: relative;
    flex: 1;
    display: flex;
}

.reward-btn-wrapper .action-btn {
    width: 100%;
}

.red-dot-indicator {
    position: absolute;
    top: -3px;
    right: -3px;
    width: 10px;
    height: 10px;
    background: #FF6B6B; /* Softer pastel red for chalk look */
    /* Irregular circle */
    border-radius: 60% 40% 50% 70% / 50% 60% 40% 60%;
    border: 1px solid var(--bg-main);
    z-index: 10;
    box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.2);
    /* Removed bounce animation */
}

@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
}
</style>
