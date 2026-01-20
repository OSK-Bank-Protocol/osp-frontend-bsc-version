<template>
  <div>
    <span class="br-line"></span>
    <HeroSection @open-inject-modal="openInjectModal" @open-claim-reward-modal="openClaimRewardModal" @open-share-friend-modal="openShareFriendModal" @open-friends-contribution-modal="openFriendsContributionModal" />
    <!-- <FeatureSection /> -->
    <HowToUseSection />
    <!-- <BenefitSection /> -->
    <!-- <PricingSection /> -->
    <!-- <CTASection /> -->
    <TestimonialSection />
    <!-- <FAQSection /> -->
    

    <transition name="modal">
      <InjectPoolModal 
        v-if="isInjectModalVisible" 
        @close="closeInjectModal"
        @confirm="handleInjectionConfirm"
      />
    </transition>

    <transition name="modal">
      <ConfirmReferrerModal
        v-if="isConfirmReferrerModalVisible"
        @close="closeConfirmReferrerModal"
        @confirm="handleReferrerConfirm"
      />
    </transition>

    <transition name="modal">
        <ClaimRewardModal v-if="isClaimRewardModalVisible" @close="closeClaimRewardModal" />
    </transition>
    
    <transition name="modal">
      <ShareFriendModal 
        v-if="isShareFriendModalVisible" 
        :referral-link="referralLinkForModal"
        @close="closeShareFriendModal"
      />
    </transition>

    <transition name="modal">
      <FriendsContributionModal 
        v-if="isFriendsContributionModalVisible" 
        :referrer-address="referrerAddressForModal"
        @close="closeFriendsContributionModal"
      />
    </transition>

    <transition name="modal">
      <AlertModal 
        v-if="isAlertModalVisible" 
        :title="alertTitle"
        :message="alertMessage"
        @close="closeAlertModal"
      />
    </transition>

    <transition name="modal">
      <QueueModal 
        v-if="isQueueModalVisible" 
        :countdown="queueCountdown"
      />
    </transition>
  </div>
</template>

<script>
import HeroSection from '../components/HeroSection.vue';
// import FeatureSection from '../components/FeatureSection.vue';
import BenefitSection from '../components/BenefitSection.vue';
import HowToUseSection from '../components/HowToUseSection.vue';
import FeatureSection from '../components/FeatureSection.vue';
import TestimonialSection from '../components/TestimonialSection.vue';
import PricingSection from '../components/PricingSection.vue';
import FAQSection from '../components/FAQSection.vue';
// import CTASection from '../components/CTASection.vue';
import InjectPoolModal from '../components/InjectPoolModal.vue';
import ConfirmReferrerModal from '../components/ConfirmReferrerModal.vue';
import ClaimRewardModal from '../components/ClaimRewardModal.vue'; 
import ShareFriendModal from '../components/ShareFriendModal.vue';
import FriendsContributionModal from '../components/FriendsContributionModal.vue';
import AlertModal from '../components/AlertModal.vue';
import QueueModal from '../components/QueueModal.vue';
import {
  walletState
} from '../services/wallet';
import {
  APP_ENV,
  ENABLE_STAKING_QUEUE
} from '../services/environment';
import {
  stakeWithInviter,
  getReferrer,
  isReferrerValid,
  getMaxStakeAmount,
  getOskBalance,
  checkAllClaimableRewards,
  getEffectiveMaxStakeAmount,
  getUserPrincipalBalance,
  getOskDecimals
} from '../services/contracts';
import {
  showToast
} from '../services/notification';
import {
    onMounted,
    watch
} from 'vue';
import { t } from '@/i18n';
import { ethers } from 'ethers';


export default {
  name: 'HomeView',
  components: {
    HeroSection,
    // FeatureSection,
    BenefitSection,
    HowToUseSection,
    // PricingSection,
    TestimonialSection,
    FAQSection,
    InjectPoolModal,
    ConfirmReferrerModal,
    // CTASection,
    ClaimRewardModal,
    ShareFriendModal,
    FriendsContributionModal,
    AlertModal,
    QueueModal,
  },
  data() {
    return {
      isInjectModalVisible: false,
      isConfirmReferrerModalVisible: false,
      isClaimRewardModalVisible: false, 
      isShareFriendModalVisible: false,
      isFriendsContributionModalVisible: false,
      isAlertModalVisible: false,
      isQueueModalVisible: false,
      queueCountdown: 0,
      alertTitle: '',
      alertMessage: '',
      referralLinkForModal: '',
      referrerAddressForModal: '',
      injectionData: null, // To store data from the first modal
      isStaking: false, // To lock UI during transaction
      walletState: walletState,
    };
  },
  methods: {
    openInjectModal() {
      this.isInjectModalVisible = true;
    },
    closeInjectModal() {
      this.isInjectModalVisible = false;
    },
    openShareFriendModal(data) {
      this.referralLinkForModal = data.referralLink;
      this.referrerAddressForModal = data.referrerAddress || '';
      this.isShareFriendModalVisible = true;
    },
    closeShareFriendModal() {
      this.isShareFriendModalVisible = false;
    },
    openFriendsContributionModal(data) {
      this.referrerAddressForModal = data.referrerAddress || '';
      this.isFriendsContributionModalVisible = true;
    },
    closeFriendsContributionModal() {
      this.isFriendsContributionModalVisible = false;
    },
    closeAlertModal() {
      this.isAlertModalVisible = false;
    },
    openClaimRewardModal() {
      this.isClaimRewardModalVisible = true;
    },
    closeClaimRewardModal() {
      this.isClaimRewardModalVisible = false;
      // When the modal is closed, re-check for rewards to update the red dot
      checkAllClaimableRewards();
    },
    async handleInjectionConfirm(data) {
      console.log('Injection data received:', data);
      this.injectionData = data;
      this.isInjectModalVisible = false;

      // Decide the next step based on user status
      if (this.walletState.isNewUser) {
        this.isConfirmReferrerModalVisible = true;
      } else {
        // Old user flow: directly proceed to stake
        await this.executeStakeForOldUser();
      }
    },
    closeConfirmReferrerModal() {
      this.isConfirmReferrerModalVisible = false;
    },
    async handleReferrerConfirm(pendingReferrer) {
      console.log('Referrer confirmed by user:', pendingReferrer);
      this.isConfirmReferrerModalVisible = false;
      // New user flow: proceed to stake with validation
      await this.executeStakeForNewUser(pendingReferrer);
    },

    // --- Staking Execution Logic ---

    async runStakingQueue(checkAmount, onSuccess) {
      // 1. Initial Check
      console.log(`[排队系统] 初始额度检查: 正在获取当前最大允许额度...`);
      const maxAllowedStr = await getEffectiveMaxStakeAmount(true);
      
      const decimals = getOskDecimals();
      const checkAmountBn = ethers.parseUnits(checkAmount.toString(), decimals);
      const maxAllowedBn = ethers.parseUnits(maxAllowedStr, decimals);
      
      if (checkAmountBn > maxAllowedBn) {
         console.log(`[排队系统] 初始检查失败: 用户输入 ${checkAmount} > 当前允许最大值 ${maxAllowedStr}`);
         showToast(t('toast.highStakingVolume'));
         this.isStaking = false;
         return;
      }
      console.log(`[排队系统] 初始检查通过: 用户输入 ${checkAmount} <= 当前允许最大值 ${maxAllowedStr}`);

      if (!ENABLE_STAKING_QUEUE) {
        await onSuccess();
        return;
      }

      // 2. Start Queue
      this.isQueueModalVisible = true;

      // New Countdown Formula: T = Rand(0, 15) + Clamp(osp.balances(user) x 1, 0, 35)
      // 1. Get User Principal Balance
      let userPrincipal = 0;
      try {
          // Keep using float for time calculation as it's not financial critical and simpler for math
          const principalStr = await getUserPrincipalBalance();
          userPrincipal = parseFloat(principalStr);
      } catch (e) {
          console.warn("Failed to get user principal for countdown calculation, defaulting to 0", e);
      }

      // 2. Calculate Base Random Time: Rand(0, 15)
      // Math.random() is [0, 1), so * 16 then floor gives 0-15 integers.
      const baseRandomTime = Math.floor(Math.random() * 16);

      // 3. Calculate Penalty Time based on Principal: Clamp(userPrincipal * 1, 0, 35)
      // Clamp means limit the value between min and max.
      // If user has 0 OSK: penalty = 0
      // If user has 10 OSK: penalty = 10
      // If user has 25 OSK: penalty = 25
      // If user has >= 35 OSK: penalty = 35 (Cap)
      const penaltyTime = Math.min(Math.max(userPrincipal * 1, 0), 35);

      // 4. Total Time
      const totalTime = Math.floor(baseRandomTime + penaltyTime);

      console.log(`[排队系统] 倒计时计算详情:`);
      console.log(`  用户本金: ${userPrincipal}`);
      console.log(`  基础随机 (0-15s): ${baseRandomTime}s`);
      console.log(`  本金惩罚 (Max 35s): ${penaltyTime}s`);
      console.log(`  最终倒计时: ${totalTime}s`);

      this.queueCountdown = totalTime;
      
      const timer = setInterval(async () => {
        this.queueCountdown--;
        if (this.queueCountdown <= 0) {
            clearInterval(timer);
            
            // 3. Post-Queue Check
            console.log("[排队系统] 倒计时结束，正在进行二次额度检查...");
            const maxAllowedStrFinal = await getEffectiveMaxStakeAmount(true);
            const maxAllowedFinalBn = ethers.parseUnits(maxAllowedStrFinal, decimals);
            
            if (checkAmountBn > maxAllowedFinalBn) {
                console.log(`[排队系统] 二次检查失败: 用户输入 ${checkAmount} > 当前允许最大值 ${maxAllowedStrFinal}`);
                this.isQueueModalVisible = false;
                showToast(t('toast.highStakingVolume'));
                this.isStaking = false;
            } else {
                console.log(`[排队系统] 二次检查通过: 用户输入 ${checkAmount} <= 当前允许最大值 ${maxAllowedStrFinal}`);
                this.isQueueModalVisible = false;
                // Add a small delay for UI transition
                setTimeout(async () => {
                   await onSuccess();
                }, 300);
            }
        }
      }, 1000);
    },

    async executeStakeForNewUser(parentAddress) {
      if (this.isStaking) return;
      this.isStaking = true;
      console.log(`[指挥官] 开始为新用户执行质押流程...`);
      showToast(t("toast.stakingRequest"));

      // Final real-time balance check
      const realTimeBalance = await getOskBalance();
      const amountToStake = this.injectionData.amount;
      
      const decimals = getOskDecimals();
      const balanceBn = ethers.parseUnits(realTimeBalance, decimals);
      const stakeAmountBn = ethers.parseUnits(amountToStake.toString(), decimals);

      if (balanceBn < stakeAmountBn) {
        // Display simplified balance for toast
        const displayBal = parseFloat(realTimeBalance).toFixed(4);
        showToast(t('toast.insufficientBalance', { balance: displayBal }));
        this.isStaking = false;
        return;
      }

      // Final on-chain validation for the parent address
      console.log(`[指挥官] 对新用户的推荐人地址进行最终链上校验: ${parentAddress}`);
      const isParentValid = await isReferrerValid(parentAddress);
      if (!isParentValid) {
        console.error(`[指挥官] 推荐人地址校验失败: ${parentAddress}`);
        showToast(t("toast.invalidReferrer"));
        this.isStaking = false;
        return;
      }
      console.log(`[指挥官] 推荐人地址校验成功`);

      const { amount, duration } = this.injectionData;

      await this.runStakingQueue(amount, async () => {
          console.log(`[指挥官] 即将调用 stakeWithInviter, 参数为:`, { amount, stakeIndex: duration, parentAddress });
          const result = await stakeWithInviter(amount, duration, parentAddress);

          if (result.success) {
            console.log("[指挥官] 质押交易成功");
            showToast(t("toast.stakeSuccessRefresh"));
            setTimeout(() => window.location.reload(), 2000);
          } else {
            if (result.cancelled) {
                 console.log("[指挥官] 用户取消交易");
                 this.isStaking = false;
                 return;
            }
            console.error("[指挥官] 质押交易失败");
            showToast(result.error || t("toast.stakeFailed"));
          }
          this.isStaking = false;
      });
    },

    async executeStakeForOldUser() {
      if (this.isStaking) return;
      this.isStaking = true;
      console.log("[指挥官] 开始为老用户执行质押流程...");
      // showToast("正在获取推荐人信息并质押...");

      // Final real-time balance check
      const realTimeBalance = await getOskBalance();
      const amountToStake = this.injectionData.amount;
      
      const decimals = getOskDecimals();
      const balanceBn = ethers.parseUnits(realTimeBalance, decimals);
      const stakeAmountBn = ethers.parseUnits(amountToStake.toString(), decimals);

      if (balanceBn < stakeAmountBn) {
        const displayBal = parseFloat(realTimeBalance).toFixed(4);
        showToast(t('toast.insufficientBalance', { balance: displayBal }));
        this.isStaking = false;
        return;
      }

      console.log("[指挥官] 开始从合约获取已绑定的推荐人地址...");
      const parentAddress = await getReferrer();
      if (!parentAddress || parentAddress.startsWith('0x000')) {
        console.error("[指挥官] 获取老用户的推荐人地址失败");
        showToast(t("toast.fetchReferrerFailed"));
        this.isStaking = false;
        return;
      }
      console.log(`[指挥官] 成功获取到老用户的推荐人地址: ${parentAddress}`);
      
      const { amount, duration } = this.injectionData;

      await this.runStakingQueue(amount, async () => {
          console.log(`[指挥官] 即将调用 stakeWithInviter, 参数为:`, { amount, stakeIndex: duration, parentAddress });
          const result = await stakeWithInviter(amount, duration, parentAddress);
          
          if (result.success) {
            console.log("[指挥官] 质押交易成功");
            showToast(t("toast.stakeSuccessRefresh"));
            setTimeout(() => window.location.reload(), 2000);
          } else {
            if (result.cancelled) {
                 console.log("[指挥官] 用户取消交易");
                 this.isStaking = false;
                 return;
            }
            console.error("[指挥官] 质押交易失败");
            showToast(result.error || t("toast.stakeFailed"));
          }
          this.isStaking = false;
      });
    }
  },
  mounted() {
    // autoConnectWallet(); // This line is removed as per the new_code, as autoConnectWallet is no longer imported.
  },
  setup() {
    // Watch for authentication changes to update the red dot indicator
    watch(() => [walletState.isAuthenticated, walletState.contractsInitialized], ([isAuth, contractsReady]) => {
      if (isAuth && contractsReady) {
        checkAllClaimableRewards();
      }
    });

    // This is needed for the template to access walletState
    return {
      walletState,
      t, // Expose t function to the template
    };
  }
};
</script>
