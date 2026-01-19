// i18n configuration and language management
import { reactive, computed } from 'vue';

// Language state management
export const i18nState = reactive({
  currentLanguage: 'zh-cn', // Default to Simplified Chinese
  languages: {
    'zh-cn': { name: '简体中文', code: 'zh-cn' },
    'zh-tw': { name: '繁体中文', code: 'zh-tw' },
    'en': { name: 'English', code: 'en' },
    'ja': { name: '日本語', code: 'ja' },
    'ko': { name: '한국어', code: 'ko' }
  }
});

// Language packs
const languagePacks = {
  'zh-cn': {
    // Header
    'header.connectWallet': '连接钱包',
    'header.home': '首页',
    'header.blog': '博客',
    
    // Footer
    'footer.aboutUs': '了解我们',
    'footer.whitepaper': '白皮书',
    'footer.copyright': '© 2025 OSK Bank Protocol. ALL RIGHTS RESERVED.',
    
    // Hero Section
    'hero.subtitle': '以飞轮引擎 重塑全球资产流',
    'hero.assetsTitle': '您的总资产',
    'hero.friendsBoost': '好友总质押',
    'hero.injectPool': '质押资产',
    'hero.swap': 'OSK闪兑',
    'hero.shareFriend': '分享好友',
    'hero.achievementReward': '成就奖励',
    'hero.totalInvestment': '您的总质押',
    
    // Connect Wallet Modal
    'wallet.connectTitle': '连接钱包',
    'wallet.connectSubtitle': '请选择一个钱包以继续',
    'wallet.connectedTitle': '钱包已连接',
    'wallet.address': '地址',
    'wallet.network': '网络',
    'wallet.disconnect': '断开连接',
    'wallet.noWalletDetected': '未检测到钱包。',
    'wallet.installWallet': '请安装 OKX Wallet 或 TokenPocket 后重试。',
    
    // Language Modal
    'language.switchTitle': '切换语言',
    'language.selectLanguage': '请选择您的语言',
    
    // Inject Pool Modal
    'inject.title': '质押资产',
    'inject.amountLabel': '质押数量：',
    'inject.amountPlaceholder': '输入数量',
    'inject.maxAmount': '当前最大: {amount} {token}',
    'inject.durationLabel': '质押天数：',
    'inject.duration7Days': '7天，复利0.6%',
    'inject.duration15Days': '15天，复利0.8%',
    'inject.duration30Days': '30天，复利1.0%',
    'inject.duration45Days': '45天，复利1.2%',
    'inject.duration7Minutes': '7分钟，复利0.6%',
    'inject.duration15Minutes': '15分钟，复利0.8%',
    'inject.duration30Minutes': '30分钟，复利1.0%',
    'inject.duration45Minutes': '45分钟，复利1.2%',
    'inject.days7': '7天',
    'inject.rate7': '复利0.6%',
    'inject.days15': '15天',
    'inject.rate15': '复利0.8%',
    'inject.days30': '30天',
    'inject.rate30': '复利1.0%',
    'inject.days45': '45天',
    'inject.rate45': '复利1.2%',
    'inject.minutes7': '7分',
    'inject.minutes15': '15分',
    'inject.minutes30': '30分',
    'inject.minutes45': '45分',
    'inject.cancel': '取消',
    'inject.approving': '授权中...',
    'inject.enterAmount': '请输入数量',
    'inject.approveOsk': '请授权OSK',
    'inject.nextStep': '下一步',
    'inject.confirmStake': '确认质押',
    'inject.insufficientBalance': '您的OSK余额不足',
    'inject.maxAmountExceeded': '当前最多可注入 {amount} OSK',
    'inject.approveSuccess': '授权成功！',
    'inject.approveFailed': '授权失败或被拒绝',
    'inject.soldOut': '当前全网质押额度已售罄',

    // Redeem Options Modal
    'redeem.title': '选择赎回方式',
    'redeem.principalOnly': '赎回本金',
    'redeem.principalOnlyDesc': '仅取回本金，放弃所有收益',
    'redeem.forfeitRewards': '注意：将损失所有累计收益',
    'redeem.reinvest': '复投赎回',
    'redeem.reinvestDesc': '投入新资金，连本带利解锁旧资金',
    'redeem.recommended': '推荐',
    'redeem.getBonus': '获得全部收益 (OSP)',
    'redeem.newAmount': '新质押金额',
    'redeem.newDuration': '新质押周期',
    'redeem.minAmount': '最低需投入 {amount}',
    'redeem.minDuration': '最低需质押 {days}',
    'redeem.confirmPrincipal': '确认仅赎回本金',
    'redeem.confirmReinvest': '确认复投并赎回',
    'redeem.dailyLimitReached': '今日赎回额度已达上限',
    'redeem.insufficientStakeLimit': '今日可质押额度不足',
    'redeem.back': '返回',
    'redeem.currentValue': '当前总价值',
    'redeem.lostReward': '预计损失收益',
    'redeem.confirmForfeit': '确定放弃 {amount} 收益获取本金？',
    'redeem.goToReinvest': '去复投',
    
    // Claim Reward Modal
    'claim.title': '成就奖励',
    'claim.loading': '正在查询您的成就奖励...',
    'claim.noReward': '暂无',
    'claim.claiming': '领取中',
    'claim.claim': '领取',
    'claim.close': '关闭',
    'claim.connectWallet': '请先连接并授权您的钱包',
    'claim.levelRewardTitle': 'OSP星辉点数',
    'claim.nodeRewardTitle': '节点激励',
    'claim.dividendRewardTitle': '分红权益',
    
    // Confirm Referrer Modal
    'referrer.title': '请确认推荐人',
    'referrer.addressLabel': '推荐人地址:',
    'referrer.loading': '加载中...',
    'referrer.cancel': '取消',
    'referrer.confirm': '确认推荐人并质押',
    
    // Toast Notifications
    'toast.connectWalletFirst': '请先连接并授权您的钱包',
    'toast.stakeAndBindFirst': '请先质押并绑定推荐人',
    'toast.copied': '已复制到剪贴板',
    'toast.copySuccess': '复制成功！链接已复制到剪贴板',
    'toast.copyFailed': '复制失败，请检查浏览器权限',
    'toast.refreshDataFailed': '刷新数据失败',
    'toast.loadingData': '正在首次加载数据...',
    'toast.poolNotInitialized': '奖金池合约未初始化或钱包未连接',
    'toast.txSent': '交易已发送，等待确认...',
    'toast.claimSuccess': '奖励领取成功！',
    'toast.claimFailed': '奖励领取失败',
    'toast.networkSwitched': '已成功切换到 {networkName}',
    'toast.investmentSubmitted': '投资已提交，请稍后在X Node中查看',
    'toast.fetchDataFailed': '获取质押数据失败',
    'toast.stakingNotInitialized': '质押合约未初始化',
    'toast.invalidOrderId': '无效的订单ID',
    'toast.unstakeSuccess': '赎回成功！',
    'toast.reinvestSuccess': '您已复投成功！',
    'toast.redeemPrincipalSuccess': '您已赎回本金！',
    'toast.unstakeFailed': '赎回失败',
    'toast.calculateFailed': '无法计算预期输出，质押中止',
    'toast.stakeFailed': '质押失败: {reason}',
    'toast.refreshData': '每6秒刷新数据...',
    'toast.stakingRequest': '正在处理质押请求...',
    'toast.insufficientBalance': '错误：您的OSK余额不足 (当前: {balance})',
    'toast.invalidReferrer': '错误：推荐人地址无效或未质押',
    'toast.stakeSuccessRefresh': '您的质押请求已发送成功',
    'toast.stakeFailedRetry': '质押失败，请稍后重试。',
    'toast.fetchReferrerFailed': '错误：无法获取您已绑定的推荐人地址。',
    'toast.stake200Tokens': '需至少质押 3 TOKEN',
    'toast.highStakingVolume': '当前质押量较大，请稍后再试',
    'toast.notYetOpen': '尚未开放',
    
    // Queue Modal
    'queue.applying': '正在申请进入质押队列，请稍等',
    'queue.seconds': '秒',

    // Testimonial Section
    'testimonial.connectFuture': '连接未来',
    'testimonial.yourselfShapesFuture': 'Yourself shapes the future.',
    'testimonial.futureJourneyLine1': '未来轨迹',
    'testimonial.futureJourneyLine2': '',
    'testimonial.genesis': '链启引擎',
    'testimonial.genesisEn': 'Chain Engine',
    'testimonial.genesisDesc': '以 TVL 破亿与 AI 算力收益稳定性为首要验证，完成 PoR 实时透明系统、稳定币锚定协议与核心合约形式化审计，并打开与 TRON 的价值桥，点燃初始资本流动。',
    'testimonial.expansion': '算力跃迁',
    'testimonial.expansionEn': 'Computing Leap',
    'testimonial.expansionDesc': '围绕收益波动压缩与跨链扩展，构建市场中性量化池与算力对冲池，实现首个跨链桥激活。同步部署链上 VaR 风控矩阵，为跨域资本流维持稳态护栏。',
    'testimonial.handover': '跨维融合',
    'testimonial.handoverEn': 'Dimensional Fusion',
    'testimonial.handoverDesc': '成为五大主流 DApp 的抵押核心，输出多链流动性算力。完成 LayerZero/Axelar 通信接入、DAO 交棒治理与 RWA 信贷试点，以“流动性即服务”向新兴公链扩散资本引力场。',
    'testimonial.dissolution': '机构通路',
    'testimonial.dissolutionEn': 'Institutional Access',
    'testimonial.dissolutionDesc': '以合规 SPV 打通传统金融并行宇宙，推动 TVL 向百亿级跃升。完成全球金融牌照咨询与申请，开放机构级 API 通道，让机构资本以 Web3 原生方式无摩擦接入。',
    
    // Countdown Timer
    'countdown.remaining': '剩余：',
    'countdown.expired': '已到期可赎回',
    'countdown.days': '天',
    'countdown.hours': '时',
    'countdown.minutes': '分',
    'countdown.seconds': '秒',
    
    // HowToUse Section
    'howToUse.governFuture': '投资列表',
    'howToUse.controlWealth': '在这里 — 掌控你的财富',
    'howToUse.controlWealthDesc': '捐赠至底池的资金，将依额度每日累积。最高享 1.2% 自动复利，周期不超过 45 天。',
    'howToUse.investmentList': '质押列表',
    'howToUse.redemptionList': '赎回列表',
    'howToUse.loadingStakingData': '正在加载质押数据...',
    'howToUse.connectWalletFirst': '请先连接钱包以查看您的质押订单',
    'howToUse.contractInitFailed': '合约初始化失败，请刷新重试',
    'howToUse.noInvestmentOrders': '您还没有任何进行中的质押订单',
    'howToUse.noRedemptionOrders': '您还没有已赎回的订单',
    'howToUse.principal': '母金：',
    'howToUse.netValue': '净值：',
    'howToUse.redeeming': '赎回中...',
    'howToUse.redeem': '赎回',
    'howToUse.redeemed': '已赎回',
    'howToUse.waitingRedeem': '等待赎回',
    'howToUse.staking': 'STAKING',
    'howToUse.redeemedStatus': 'REDEEMED',
    
    // Share Friend Modal
    'share.title': '分享链接',
    'share.shareLink': '分享链接',
    'share.teamId': '您的邀请人',
    'share.linkLabel': '您的分享链接：',
    'share.hint': '若复制失败请长按链接手动复制分享',
    'share.button': '复制链接',
    'share.contributionTitle': '友情贡献',
    'share.contributionButton': '友情贡献',
    'share.myReferralsLabel': '我邀请的好友：',
    'share.referralsUnit': '位',
    'share.noReferrals': '暂无邀请的好友',
    'share.kpiLabel': '助力',
    'share.assetsLabel': '资产',
    'share.loadingReferrals': '查询中...',
    'share.rewardsFromFriends': '好友当前带来预估收益：',
    'share.rewardsDisclaimer': '此收益以质押时的状态进行预估，仅供参考，实际赎回时收益可能会发生变化',
    
    // Common
    'common.loading': 'Loading...',
    'common.token': 'TOKEN',
    'common.osp': 'OSP',
    'common.osk': 'OSK'
  },
  
  'zh-tw': {
    // Header
    'header.connectWallet': '連接錢包',
    'header.home': '首頁',
    'header.blog': '博客',
    
    // Footer
    'footer.aboutUs': '了解我們',
    'footer.whitepaper': '白皮書',
    'footer.copyright': '© 2025 OSK Bank Protocol. ALL RIGHTS RESERVED.',
    
    // Hero Section
    'hero.subtitle': '以飛輪引擎 重塑全球資產流',
    'hero.assetsTitle': '您的總資產',
    'hero.friendsBoost': '好友總質押',
    'hero.injectPool': '質押資產',
    'hero.swap': 'OSK閃兌',
    'hero.shareFriend': '分享好友',
    'hero.achievementReward': '成就獎勵',
    'hero.totalInvestment': '您的總質押',
    
    // Connect Wallet Modal
    'wallet.connectTitle': '連接錢包',
    'wallet.connectSubtitle': '請選擇一個錢包以繼續',
    'wallet.connectedTitle': '錢包已連接',
    'wallet.address': '地址',
    'wallet.network': '網絡',
    'wallet.disconnect': '斷開連接',
    'wallet.noWalletDetected': '未檢測到錢包。',
    'wallet.installWallet': '請安裝 OKX Wallet 或 TokenPocket 後重試。',
    
    // Language Modal
    'language.switchTitle': '切換語言',
    'language.selectLanguage': '請選擇您的語言',
    
    // Inject Pool Modal
    'inject.title': '質押資產',
    'inject.amountLabel': '質押數量：',
    'inject.amountPlaceholder': '輸入數量',
    'inject.maxAmount': '當前最大: {amount} {token}',
    'inject.durationLabel': '質押天數：',
    'inject.duration7Days': '7天，複利0.6%',
    'inject.duration15Days': '15天，複利0.8%',
    'inject.duration30Days': '30天，複利1.0%',
    'inject.duration45Days': '45天，複利1.2%',
    'inject.duration7Minutes': '7分鐘，複利0.6%',
    'inject.duration15Minutes': '15分鐘，複利0.8%',
    'inject.duration30Minutes': '30分鐘，複利1.0%',
    'inject.duration45Minutes': '45分鐘，複利1.2%',
    'inject.days7': '7天',
    'inject.rate7': '複利0.6%',
    'inject.days15': '15天',
    'inject.rate15': '複利0.8%',
    'inject.days30': '30天',
    'inject.rate30': '複利1.0%',
    'inject.days45': '45天',
    'inject.rate45': '複利1.2%',
    'inject.minutes7': '7分',
    'inject.minutes15': '15分',
    'inject.minutes30': '30分',
    'inject.minutes45': '45分',
    'inject.cancel': '取消',
    'inject.approving': '授權中...',
    'inject.enterAmount': '請輸入數量',
    'inject.approveOsk': '請授權OSK',
    'inject.nextStep': '下一步',
    'inject.confirmStake': '確認質押',
    'inject.insufficientBalance': '您的OSK餘額不足',
    'inject.maxAmountExceeded': '當前最多可注入 {amount} OSK',
    'inject.approveSuccess': '授權成功！',
    'inject.approveFailed': '授權失敗或被拒絕',
    'inject.soldOut': '當前全網質押額度已售罄',
    
    // Claim Reward Modal
    'claim.title': '領取您的成就獎勵',
    'claim.loading': '正在查詢您的成就獎勵...',
    'claim.noReward': '暫無',
    'claim.claiming': '領取中',
    'claim.claim': '領取',
    'claim.close': '關閉',
    'claim.connectWallet': '請先連接並授權您的錢包',
    'claim.levelRewardTitle': 'OSP星輝點數',
    'claim.nodeRewardTitle': 'Node Point',
    'claim.dividendRewardTitle': 'Dividend Point',
    
    // Confirm Referrer Modal
    'referrer.title': '請確認推薦人',
    'referrer.addressLabel': '推薦人地址:',
    'referrer.loading': '加載中...',
    'referrer.cancel': '取消',
    'referrer.confirm': '確認推薦人並質押',
    
    // Testimonial Section
    'testimonial.connectFuture': '連接未來',
    'testimonial.yourselfShapesFuture': 'Yourself shapes the future.',
    'testimonial.futureJourneyLine1': '未來軌跡',
    'testimonial.futureJourneyLine2': '',
    'testimonial.genesis': '鏈啟引擎',
    'testimonial.genesisEn': 'Chain Engine',
    'testimonial.genesisDesc': '以 TVL 破億與 AI 算力收益穩定性為首要驗證，完成 PoR 實時透明系統、穩定幣錨定協議與核心合約形式化審計，並打開與 TRON 的價值橋，點燃初始資本流動。',
    'testimonial.expansion': '算力躍遷',
    'testimonial.expansionEn': 'Computing Leap',
    'testimonial.expansionDesc': '圍繞收益波動壓縮與跨鏈擴展，構建市場中性量化池與算力對沖池，實現首個跨鏈橋激活。同步部署鏈上 VaR 風控矩陣，為跨域資本流維持穩態護欄。',
    'testimonial.handover': '跨維融合',
    'testimonial.handoverEn': 'Dimensional Fusion',
    'testimonial.handoverDesc': '成為五大主流 DApp 的抵押核心，輸出多鏈流動性算力。完成 LayerZero/Axelar 通信接入、DAO 交棒治理與 RWA 信貸試點，以「流動性即服務」向新興公鏈擴散資本引力場。',
    'testimonial.dissolution': '機構通路',
    'testimonial.dissolutionEn': 'Institutional Access',
    'testimonial.dissolutionDesc': '以合規 SPV 打通傳統金融並行宇宙，推動 TVL 向百億級躍升。完成全球金融牌照咨詢與申請，開放機構級 API 通道，讓機構資本以 Web3 原生方式無摩擦接入。',
    
    // Countdown Timer
    'countdown.remaining': '剩餘：',
    'countdown.expired': '已到期可贖回',
    'countdown.days': '天',
    'countdown.hours': '時',
    'countdown.minutes': '分',
    'countdown.seconds': '秒',
    
    // HowToUse Section
    'howToUse.governFuture': '投資列表',
    'howToUse.controlWealth': '在這裡 — 掌控你的財富',
    'howToUse.controlWealthDesc': '捐贈至底池的資金，將依額度每日累積。最高享 1.2% 自動複利，週期不超過 45 天。',
    'howToUse.investmentList': '質押列表',
    'howToUse.redemptionList': '贖回列表',
    'howToUse.loadingStakingData': '正在加載質押數據...',
    'howToUse.connectWalletFirst': '請先連接錢包以查看您的質押訂單',
    'howToUse.contractInitFailed': '合約初始化失敗，請刷新重試',
    'howToUse.noInvestmentOrders': '您還沒有任何進行中的質押訂單',
    'howToUse.noRedemptionOrders': '您還沒有已贖回的訂單',
    'howToUse.principal': '母金：',
    'howToUse.netValue': '淨值：',
    'howToUse.redeeming': '贖回中...',
    'howToUse.redeem': '贖回',
    'howToUse.redeemed': '已贖回',
    'howToUse.waitingRedeem': '等待贖回',
    'howToUse.staking': 'STAKING',
    'howToUse.redeemedStatus': 'REDEEMED',
    
    // Toast Notifications
    'toast.connectWalletFirst': '請先連接並授權您的錢包',
    'toast.stakeAndBindFirst': '請先進行質押並綁定您的推薦好友',
    'toast.copied': '複製成功！鏈接已複製到剪貼板',
    'toast.copySuccess': '複製成功！鏈接已複製到剪貼板',
    'toast.copyFailed': '複製失敗，請檢查瀏覽器權限',
    'toast.refreshDataFailed': '刷新數據失敗',
    'toast.loadingData': '正在首次加載數據...',
    'toast.poolNotInitialized': '獎金池合約未初始化或錢包未連接',
    'toast.txSent': '交易已發送，等待確認...',
    'toast.claimSuccess': '獎勵領取成功！',
    'toast.claimFailed': '領取失敗: {reason}',
    'toast.networkSwitched': '已成功切換到 {networkName}',
    'toast.investmentSubmitted': '投資已提交，請稍後在X Node中查看',
    'toast.fetchDataFailed': '獲取質押數據失敗',
    'toast.stakingNotInitialized': '質押合約未初始化',
    'toast.invalidOrderId': '無效的訂單ID',
    'toast.unstakeSuccess': '贖回成功！',
    'toast.reinvestSuccess': '您已復投成功！',
    'toast.redeemPrincipalSuccess': '您已贖回本金！',
    'toast.unstakeFailed': '贖回失敗',
    'toast.calculateFailed': '無法計算預期輸出，質押中止',
    'toast.stakeFailed': '質押失敗: {reason}',
    'toast.refreshData': '每6秒刷新數據...',
    'toast.stakingRequest': '正在處理質押請求...',
    'toast.insufficientBalance': '錯誤：您的OSK餘額不足 (當前: {balance})',
    'toast.invalidReferrer': '錯誤：推薦人地址無效或未質押',
    'toast.stakeSuccessRefresh': '質押請求已發送成功',
    'toast.stakeFailedRetry': '質押失敗，請稍後重試。',
    'toast.fetchReferrerFailed': '錯誤：無法獲取您已綁定的推薦人地址。',
    'toast.stake200Tokens': '需至少質押 3 TOKEN',
    'toast.highStakingVolume': '當前質押量較大，請稍後再試',
    'toast.notYetOpen': '尚未開放',
    
    // Queue Modal
    'queue.applying': '正在申請進入質押隊列，請稍等',
    'queue.seconds': '秒',

    // Share Friend Modal
    'share.title': '分享鏈接',
    'share.shareLink': '分享鏈接',
    'share.teamId': '您的邀請人',
    'share.linkLabel': '您的分享鏈接：',
    'share.hint': '若複製失敗請長按鏈接手動複製分享',
    'share.button': '複製鏈接',
    'share.contributionTitle': '友情貢獻',
    'share.contributionButton': '友情貢獻',
    'share.myReferralsLabel': '我邀請的好友：',
    'share.referralsUnit': '位',
    'share.noReferrals': '暫無邀請的好友',
    'share.kpiLabel': '助力',
    'share.assetsLabel': '資產',
    'share.loadingReferrals': '查詢中...',
    'share.rewardsFromFriends': '好友當前帶來預估收益：',
    'share.rewardsDisclaimer': '此收益以質押時的狀態進行預估，僅供參考，實際贖回時收益可能會發生變化',
    
    // Common
    'common.loading': 'Loading...',
    'common.token': 'TOKEN',
    'common.osp': 'OSP',
    'common.osk': 'OSK'
  },
  
  'en': {
    // Header
    'header.connectWallet': 'Connect Wallet',
    'header.home': 'Home',
    'header.blog': 'Blog',
    
    // Footer
    'footer.aboutUs': 'About Us',
    'footer.whitepaper': 'Whitepaper',
    'footer.copyright': '© 2025 OSK Bank Protocol. ALL RIGHTS RESERVED.',
    
    // Hero Section
    'hero.subtitle': 'Reshaping Global Asset Flows with Flywheel Engine',
    'hero.assetsTitle': 'Your Total Assets',
    'hero.friendsBoost': 'Friends Total Stake',
    'hero.injectPool': 'Stake Assets',
    'hero.swap': 'OSK Swap',
    'hero.shareFriend': 'Share Friend',
    'hero.achievementReward': 'Achievement Reward',
    'hero.totalInvestment': 'Your Total Stake',
    
    // Connect Wallet Modal
    'wallet.connectTitle': 'Connect Wallet',
    'wallet.connectSubtitle': 'Please select a wallet to continue',
    'wallet.connectedTitle': 'Wallet Connected',
    'wallet.address': 'Address',
    'wallet.network': 'Network',
    'wallet.disconnect': 'Disconnect',
    'wallet.noWalletDetected': 'No wallet detected.',
    'wallet.installWallet': 'Please install OKX Wallet or TokenPocket and try again.',
    
    // Language Modal
    'language.switchTitle': 'Switch Language',
    'language.selectLanguage': 'Please select your language',
    
    // Inject Pool Modal
    'inject.title': 'Stake Assets',
    'inject.amountLabel': 'Investment Amount:',
    'inject.amountPlaceholder': 'Enter amount',
    'inject.maxAmount': 'Current Max: {amount} {token}',
    'inject.durationLabel': 'Investment Days:',
    'inject.duration1Day': '1 day, 0.3% compound',
    'inject.duration15Days': '15 days, 0.6% compound',
    'inject.duration30Days': '30 days, 1.2% compound',
    'inject.duration7Minutes': '7 minutes, 0.6% compound',
    'inject.duration15Minutes': '15 minutes, 0.8% compound',
    'inject.duration30Minutes': '30 minutes, 1.0% compound',
    'inject.duration45Minutes': '45 minutes, 1.2% compound',
    'inject.days7': '7 Days',
    'inject.rate7': 'Compound 0.6%',
    'inject.days15': '15 Days',
    'inject.rate15': 'Compound 0.8%',
    'inject.days30': '30 Days',
    'inject.rate30': 'Compound 1.0%',
    'inject.days45': '45 Days',
    'inject.rate45': 'Compound 1.2%',
    'inject.minutes7': '7 Mins',
    'inject.minutes15': '15 Mins',
    'inject.minutes30': '30 Mins',
    'inject.minutes45': '45 Mins',
    'inject.cancel': 'Cancel',
    'inject.approving': 'Approving...',
    'inject.enterAmount': 'Please enter amount',
    'inject.approveOsk': 'Please approve OSK',
    'inject.nextStep': 'Next Step',
    'inject.confirmStake': 'Confirm Stake',
    'inject.insufficientBalance': 'Insufficient OSK balance',
    'inject.maxAmountExceeded': 'Maximum {amount} OSK can be injected',
    'inject.approveSuccess': 'Approval successful!',
    'inject.approveFailed': 'Approval failed or rejected',
    'inject.soldOut': 'The global staking quota is currently sold out',

    // Redeem Options Modal
    'redeem.title': 'Select Redemption Method',
    'redeem.principalOnly': 'Redeem Principal Only',
    'redeem.principalOnlyDesc': 'Retrieve principal only, forfeit all rewards',
    'redeem.forfeitRewards': 'Note: You will lose all accumulated rewards',
    'redeem.reinvest': 'Reinvest & Redeem',
    'redeem.reinvestDesc': 'Stake new funds to unlock old principal + rewards',
    'redeem.recommended': 'Recommended',
    'redeem.getBonus': 'Get All Rewards (OSP)',
    'redeem.newAmount': 'New Stake Amount',
    'redeem.newDuration': 'New Stake Duration',
    'redeem.minAmount': 'Min Amount: {amount}',
    'redeem.minDuration': 'Min Duration: {days}',
    'redeem.confirmPrincipal': 'Confirm Principal Only',
    'redeem.confirmReinvest': 'Confirm Reinvest & Redeem',
    'redeem.dailyLimitReached': 'Daily redemption limit reached',
    'redeem.insufficientStakeLimit': 'Insufficient daily staking quota',
    'redeem.back': 'Back',
    'redeem.currentValue': 'Current Total Value',
    'redeem.lostReward': 'Estimated Lost Reward',
    'redeem.confirmForfeit': 'Are you sure you want to forfeit {amount} rewards to get principal?',
    'redeem.goToReinvest': 'Go to Reinvest',
    
    // Claim Reward Modal
    'claim.title': 'Claim Your Achievement Rewards',
    'claim.loading': 'Querying your achievement rewards...',
    'claim.noReward': 'None',
    'claim.claiming': 'Claiming',
    'claim.claim': 'Claim',
    'claim.close': 'Close',
    'claim.connectWallet': 'Please connect and authorize your wallet first',
    'claim.levelRewardTitle': 'OSP Glory Point',
    'claim.nodeRewardTitle': 'Node Point',
    'claim.dividendRewardTitle': 'Dividend Point',
    
    // Confirm Referrer Modal
    'referrer.title': 'Please Confirm Referrer',
    'referrer.addressLabel': 'Referrer Address:',
    'referrer.loading': 'Loading...',
    'referrer.cancel': 'Cancel',
    'referrer.confirm': 'Confirm Referrer and Stake',
    
    // Testimonial Section
    'testimonial.connectFuture': 'Connect Future',
    'testimonial.yourselfShapesFuture': 'Yourself shapes the future.',
    'testimonial.futureJourneyLine1': 'Future',
    'testimonial.futureJourneyLine2': 'Trajectory',
    'testimonial.genesis': 'Chain Engine',
    'testimonial.genesisEn': 'Chain Engine',
    'testimonial.genesisDesc': 'Prioritize TVL breaking 100M and AI yield stability. Complete PoR system, stablecoin peg, and core contract audits. Open value bridge with TRON to ignite initial capital flow.',
    'testimonial.expansion': 'Computing Leap',
    'testimonial.expansionEn': 'Computing Leap',
    'testimonial.expansionDesc': 'Focus on yield volatility compression and cross-chain expansion. Build market-neutral quant pools and hedging pools. Activate cross-chain bridges and deploy on-chain VaR risk matrix.',
    'testimonial.handover': 'Dimensional Fusion',
    'testimonial.handoverEn': 'Dimensional Fusion',
    'testimonial.handoverDesc': 'Become the collateral core for major DApps. Complete LayerZero/Axelar integration, DAO governance handover, and RWA credit pilots. Spread capital gravity to new chains via "Liquidity as a Service".',
    'testimonial.dissolution': 'Institutional Access',
    'testimonial.dissolutionEn': 'Institutional Access',
    'testimonial.dissolutionDesc': 'Bridge traditional finance with compliant SPVs, driving TVL to billions. Complete global license applications and open institutional API channels for frictionless Web3-native capital entry.',
    
    // Countdown Timer
    'countdown.remaining': 'Remaining: ',
    'countdown.expired': 'Expired, Redeemable',
    'countdown.days': 'd ',
    'countdown.hours': 'h ',
    'countdown.minutes': 'm ',
    'countdown.seconds': 's',
    
    // HowToUse Section
    'howToUse.governFuture': 'Investment List',
    'howToUse.controlWealth': 'Here — Control Your Wealth',
    'howToUse.controlWealthDesc': 'Funds donated to the pool will accumulate daily based on the amount. Enjoy up to 1.2% automatic compound interest with a cycle not exceeding 45 days.',
    'howToUse.investmentList': 'Staking List',
    'howToUse.redemptionList': 'Redemption List',
    'howToUse.loadingStakingData': 'Loading staking data...',
    'howToUse.connectWalletFirst': 'Please connect your wallet to view your staking orders',
    'howToUse.contractInitFailed': 'Contract initialization failed, please refresh and try again',
    'howToUse.noInvestmentOrders': 'You have no ongoing staking orders',
    'howToUse.noRedemptionOrders': 'You have no redeemed orders',
    'howToUse.principal': 'Principal: ',
    'howToUse.netValue': 'Net Value: ',
    'howToUse.redeeming': 'Redeeming...',
    'howToUse.redeem': 'Redeem',
    'howToUse.redeemed': 'Redeemed',
    'howToUse.waitingRedeem': 'Waiting to Redeem',
    'howToUse.staking': 'STAKING',
    'howToUse.redeemedStatus': 'REDEEMED',
    
    // Toast Notifications
    'toast.connectWalletFirst': 'Please connect and authorize your wallet first',
    'toast.stakeAndBindFirst': 'Please stake and bind your referral friend first',
    'toast.copied': 'Copied to clipboard',
    'toast.copySuccess': 'Copied to clipboard',
    'toast.copyFailed': 'Copy failed, please check browser permissions',
    'toast.refreshDataFailed': 'Failed to refresh data',
    'toast.loadingData': 'Loading data for the first time...',
    'toast.poolNotInitialized': 'Reward pool contract not initialized or wallet not connected',
    'toast.txSent': 'Transaction sent, awaiting confirmation...',
    'toast.claimSuccess': 'Rewards claimed successfully!',
    'toast.claimFailed': 'Claim failed: {reason}',
    'toast.fetchDataFailed': 'Failed to fetch staking data',
    'toast.stakingNotInitialized': 'Staking contract not initialized',
    'toast.invalidOrderId': 'Invalid order ID',
    'toast.unstakeSuccess': 'Unstake successful!',
    'toast.reinvestSuccess': 'Reinvestment successful!',
    'toast.redeemPrincipalSuccess': 'Principal redeemed successfully!',
    'toast.unstakeFailed': 'Unstake failed',
    'toast.calculateFailed': 'Unable to calculate expected output, staking aborted',
    'toast.stakeFailed': 'Staking failed: {reason}',
    'toast.refreshData': 'Refreshing data every 6 seconds...',
    'toast.stakingRequest': 'Processing stake request...',
    'toast.insufficientBalance': 'Error: Insufficient OSK balance (Current: {balance})',
    'toast.invalidReferrer': 'Error: Referrer address is invalid or has not staked',
    'toast.stakeSuccessRefresh': 'Stake request sent successfully',
    'toast.stakeFailedRetry': 'Stake failed, please try again later.',
    'toast.fetchReferrerFailed': 'Error: Could not retrieve your bound referrer address.',
    'toast.stake200Tokens': 'Requires a stake of at least 3 TOKENs',
    'toast.highStakingVolume': 'High staking volume, please try again later',
    'toast.notYetOpen': 'Not yet open',
    
    // Queue Modal
    'queue.applying': 'Applying to enter the staking queue, please wait',
    'queue.seconds': 's',

    // Share Friend Modal
    'share.title': 'Share Link',
    'share.shareLink': 'Share Link',
    'share.teamId': 'Your Inviter',
    'share.linkLabel': 'Your Referral Link:',
    'share.hint': 'If copying fails, please long-press the link to manually copy and share',
    'share.button': 'Copy Link',
    'share.contributionTitle': 'Contribution',
    'share.contributionButton': 'Contribution',
    'share.myReferralsLabel': 'My Referrals:',
    'share.referralsUnit': '', // In English, "3 Referrals" is more natural, the unit is part of the word.
    'share.noReferrals': 'No Referrals Yet',
    'share.kpiLabel': 'Boost',
    'share.assetsLabel': 'Assets',
    'share.loadingReferrals': 'Loading...',
    'share.rewardsFromFriends': 'Current Estimated Rewards from Friend:',
    'share.rewardsDisclaimer': 'This income is estimated based on the state at the time of staking and is for reference only. The actual income may change upon redemption.',
    
    // Common
    'common.loading': 'Loading...',
    'common.token': 'TOKEN',
    'common.osp': 'OSP',
    'common.osk': 'OSK'
  },
  
  'ja': {
    // Header
    'header.connectWallet': 'ウォレット接続',
    'header.home': 'ホーム',
    'header.blog': 'ブログ',
    
    // Footer
    'footer.aboutUs': '私たちについて',
    'footer.whitepaper': 'ホワイトペーパー',
    'footer.copyright': '© 2025 OSK Bank Protocol. ALL RIGHTS RESERVED.',
    
    // Hero Section
    'hero.subtitle': 'フライホイールエンジンで世界の資産フローを再形成',
    'hero.assetsTitle': 'あなたの総資産',
    'hero.friendsBoost': '友人の総ステーク',
    'hero.injectPool': '資産をステーク',
    'hero.swap': 'OSKスワップ',
    'hero.shareFriend': '友人を共有',
    'hero.achievementReward': '実績報酬',
    'hero.totalInvestment': 'あなたの総ステーク',
    
    // Connect Wallet Modal
    'wallet.connectTitle': 'ウォレット接続',
    'wallet.connectSubtitle': '続行するウォレットを選択してください',
    'wallet.connectedTitle': 'ウォレット接続済み',
    'wallet.address': 'アドレス',
    'wallet.network': 'ネットワーク',
    'wallet.disconnect': '切断',
    'wallet.noWalletDetected': 'ウォレットが検出されません。',
    'wallet.installWallet': 'OKX WalletまたはTokenPocketをインストールして再試行してください。',
    
    // Language Modal
    'language.switchTitle': '言語切り替え',
    'language.selectLanguage': '言語を選択してください',
    
    // Inject Pool Modal
    'inject.title': '資産をステーク',
    'inject.amountLabel': '投資金額：',
    'inject.amountPlaceholder': '金額を入力',
    'inject.maxAmount': '現在の最大: {amount} {token}',
    'inject.durationLabel': '投資日数：',
    'inject.duration1Day': '1日、複利0.3%',
    'inject.duration15Days': '15日、複利0.6%',
    'inject.duration30Days': '30日、複利1.2%',
    'inject.duration7Minutes': '7分、複利0.6%',
    'inject.duration15Minutes': '15分、複利0.8%',
    'inject.duration30Minutes': '30分、複利1.0%',
    'inject.duration45Minutes': '45分、複利1.2%',
    'inject.days1': '1日',
    'inject.rate1': '複利0.3%',
    'inject.days15': '15日',
    'inject.rate15': '複利0.6%',
    'inject.days30': '30日',
    'inject.rate30': '複利1.2%',
    'inject.minutes7': '7分',
    'inject.minutes15': '15分',
    'inject.minutes30': '30分',
    'inject.minutes45': '45分',
    'inject.cancel': 'キャンセル',
    'inject.approving': '承認中...',
    'inject.enterAmount': '金額を入力してください',
    'inject.approveOsk': 'OSKを承認してください',
    'inject.nextStep': '次のステップ',
    'inject.confirmStake': 'ステーキング確認',
    'inject.insufficientBalance': 'OSK残高が不足しています',
    'inject.maxAmountExceeded': '最大{amount} OSKまで注入可能',
    'inject.approveSuccess': '承認成功！',
    'inject.approveFailed': '承認失敗または拒否されました',
    
    // Claim Reward Modal
    'claim.title': '実績報酬を受け取る',
    'claim.loading': '実績報酬を照会中...',
    'claim.noReward': 'なし',
    'claim.claiming': '受け取り中',
    'claim.claim': '受け取る',
    'claim.close': '閉じる',
    'claim.connectWallet': 'まずウォレットを接続して承認してください',
    'claim.levelRewardTitle': 'OSP Glory Point',
    'claim.nodeRewardTitle': 'Node Point',
    'claim.dividendRewardTitle': 'Dividend Point',
    
    // Confirm Referrer Modal
    'referrer.title': '紹介者を確認してください',
    'referrer.addressLabel': '紹介者アドレス:',
    'referrer.loading': '読み込み中...',
    'referrer.cancel': 'キャンセル',
    'referrer.confirm': '紹介者を確認してステーキング',
    
    // Testimonial Section
    'testimonial.connectFuture': '未来を接続',
    'testimonial.yourselfShapesFuture': 'Yourself shapes the future.',
    'testimonial.futureJourneyLine1': '未来の軌跡',
    'testimonial.futureJourneyLine2': '',
    'testimonial.genesis': 'チェーンエンジン',
    'testimonial.genesisEn': 'Chain Engine',
    'testimonial.genesisDesc': 'TVL1億ドル突破とAI収益安定性を最優先検証とし、PoRシステム、ステーブルコインペグ、コアコントラクト監査を完了。TRONとの価値ブリッジを開通し、初期資本を点火する。',
    'testimonial.expansion': '計算力飛躍',
    'testimonial.expansionEn': 'Computing Leap',
    'testimonial.expansionDesc': '収益変動圧縮とクロスチェーン拡張を中心に、市場中立的な定量的プールとヘッジプールを構築。クロスチェーンブリッジを活性化し、オンチェーンVaRリスク管理を展開。',
    'testimonial.handover': '次元融合',
    'testimonial.handoverEn': 'Dimensional Fusion',
    'testimonial.handoverDesc': '主要DAppの担保コアとなり、マルチチェーン流動性を出力。LayerZero/Axelar接続、DAOガバナンス移行、RWAクレジットパイロットを完了。「Liquidity as a Service」で資本引力を拡散。',
    'testimonial.dissolution': '機関アクセス',
    'testimonial.dissolutionEn': 'Institutional Access',
    'testimonial.dissolutionDesc': 'コンプライアンスSPVで伝統的金融を接続し、TVLを数百億へ。グローバル金融ライセンス申請と機関グレードAPIを開放し、機関資本のWeb3ネイティブな摩擦なき参入を実現。',
    
    // Countdown Timer
    'countdown.remaining': '残り：',
    'countdown.expired': '期限切れ、償還可能',
    'countdown.days': '日',
    'countdown.hours': '時間',
    'countdown.minutes': '分',
    'countdown.seconds': '秒',
    
    // HowToUse Section
    'howToUse.governFuture': '投資リスト',
    'howToUse.controlWealth': 'ここで — あなたの富をコントロール',
    'howToUse.controlWealthDesc': 'プールに寄付された資金は、金額に応じて毎日蓄積されます。最大1.2%の自動複利を享受し、サイクルは45日を超えません。',
    'howToUse.investmentList': 'ステーキングリスト',
    'howToUse.redemptionList': '償還リスト',
    'howToUse.loadingStakingData': 'ステーキングデータを読み込み中...',
    'howToUse.connectWalletFirst': 'ステーキング注文を表示するには、まずウォレットを接続してください',
    'howToUse.contractInitFailed': 'コントラクトの初期化に失敗しました。ページを更新して再試行してください',
    'howToUse.noInvestmentOrders': '進行中のステーキング注文がありません',
    'howToUse.noRedemptionOrders': '償還済みの注文がありません',
    'howToUse.principal': '元本：',
    'howToUse.netValue': '純資産：',
    'howToUse.redeeming': '償還中...',
    'howToUse.redeem': '償還',
    'howToUse.redeemed': '償還済み',
    'howToUse.waitingRedeem': '償還待ち',
    'howToUse.staking': 'STAKING',
    'howToUse.redeemedStatus': 'REDEEMED',
    
    // Toast Notifications
    'toast.connectWalletFirst': 'まずウォレットを接続して承認してください',
    'toast.stakeAndBindFirst': '最初にリファラーをステークしてバインドしてください',
    'toast.copied': 'クリップボードにコピーされました',
    'toast.copySuccess': 'コピー成功！リンクがクリップボードにコピーされました',
    'toast.copyFailed': 'コピー失敗、ブラウザの権限を確認してください',
    'toast.refreshDataFailed': 'データの更新に失敗しました',
    'toast.loadingData': '初回データ読み込み中...',
    'toast.poolNotInitialized': '報酬プールコントラクトが初期化されていないか、ウォレットが接続されていません',
    'toast.txSent': 'トランザクションが送信されました、確認を待っています...',
    'toast.claimSuccess': '報酬の請求に成功しました！',
    'toast.claimFailed': '報酬の請求に失敗しました',
    'toast.networkSwitched': '{networkName}に正常に切り替わりました',
    'toast.investmentSubmitted': '投資が送信されました、後ほどX Nodeで確認してください',
    'toast.fetchDataFailed': 'ステーキングデータの取得に失敗しました',
    'toast.stakingNotInitialized': 'ステーキングコントラクトが初期化されていません',
    'toast.invalidOrderId': '無効な注文ID',
    'toast.unstakeSuccess': '償還に成功しました！',
    'toast.unstakeFailed': '償還失敗',
    'toast.calculateFailed': '予想出力の計算ができません、ステーキングを中止します',
    'toast.stakeFailed': 'ステーキング失敗: {reason}',
    'toast.refreshData': '6秒ごとにデータを更新中...',
    'toast.stakingRequest': 'ステーキングリクエストを処理中...',
    'toast.insufficientBalance': 'エラー: OSK残高が不足しています (現在: {balance})',
    'toast.invalidReferrer': 'エラー: 紹介者アドレスが無効か、ステーキングされていません',
    'toast.stakeSuccessRefresh': 'ステーキングリクエストが正常に送信されました。',
    'toast.stakeFailedRetry': 'ステーキングに失敗しました。後でもう一度お試しください。',
    'toast.fetchReferrerFailed': 'エラー: 紐付けられた紹介者アドレスを取得できませんでした。',
    'toast.stake200Tokens': '最低でも3 TOKENのステークが必要です',
    'toast.highStakingVolume': '現在ステーキング量が多いため、後でもう一度お試しください',
    'toast.notYetOpen': 'まだ公開されていません',
    
    // Queue Modal
    'queue.applying': 'ステーキングキューへの参加を申請中、お待ちください',
    'queue.seconds': '秒',

    // Share Friend Modal
    'share.title': 'リンクを共有',
    'share.shareLink': 'リンクを共有',
    'share.teamId': 'あなたの招待者',
    'share.linkLabel': 'あなたの紹介リンク：',
    'share.hint': 'コピーに失敗した場合は、リンクを長押しして手動でコピーして共有してください',
    'share.button': 'リンクをコピー',
    'share.contributionTitle': '友情の貢献',
    'share.contributionButton': '友情の貢献',
    'share.myReferralsLabel': '私の紹介：',
    'share.referralsUnit': '名',
    'share.noReferrals': 'まだ紹介がありません',
    'share.kpiLabel': 'ブースト',
    'share.assetsLabel': '資産',
    'share.loadingReferrals': '読み込み中...',
    'share.rewardsFromFriends': '現在の友達からの推定報酬:',
    'share.rewardsDisclaimer': 'この収益はステーキング時の状態で推定されたもので、参考用です。実際の償還時に収益は変動する可能性があります。',
    
    // Common
    'common.loading': 'Loading...',
    'common.token': 'TOKEN',
    'common.osp': 'OSP',
    'common.osk': 'OSK'
  },
  
  'ko': {
    // Header
    'header.connectWallet': '지갑 연결',
    'header.home': '홈',
    'header.blog': '블로그',
    
    // Footer
    'footer.aboutUs': '우리에 대해',
    'footer.whitepaper': '백서',
    'footer.copyright': '© 2025 OSK Bank Protocol. ALL RIGHTS RESERVED.',
    
    // Hero Section
    'hero.subtitle': '플라이휠 엔진으로 글로벌 자산 흐름 재편',
    'hero.assetsTitle': '총 자산',
    'hero.friendsBoost': '친구 총 스테이킹',
    'hero.injectPool': '자산 스테이킹',
    'hero.swap': 'OSK 스왑',
    'hero.shareFriend': '친구 공유',
    'hero.achievementReward': '성취 보상',
    'hero.totalInvestment': '총 스테이킹',
    
    // Connect Wallet Modal
    'wallet.connectTitle': '지갑 연결',
    'wallet.connectSubtitle': '계속하려면 지갑을 선택하세요',
    'wallet.connectedTitle': '지갑 연결됨',
    'wallet.address': '주소',
    'wallet.network': '네트워크',
    'wallet.disconnect': '연결 해제',
    'wallet.noWalletDetected': '지갑이 감지되지 않았습니다.',
    'wallet.installWallet': 'OKX Wallet 또는 TokenPocket을 설치하고 다시 시도하세요.',
    
    // Language Modal
    'language.switchTitle': '언어 전환',
    'language.selectLanguage': '언어를 선택하세요',
    
    // Inject Pool Modal
    'inject.title': '자산 스테이킹',
    'inject.amountLabel': '투자 금액:',
    'inject.amountPlaceholder': '금액 입력',
    'inject.maxAmount': '현재 최대: {amount} {token}',
    'inject.durationLabel': '투자 일수:',
    'inject.duration1Day': '1일, 복리 0.3%',
    'inject.duration15Days': '15일, 복리 0.6%',
    'inject.duration30Days': '30일, 복리 1.2%',
    'inject.duration7Minutes': '7분, 복리 0.6%',
    'inject.duration15Minutes': '15분, 복리 0.8%',
    'inject.duration30Minutes': '30분, 복리 1.0%',
    'inject.duration45Minutes': '45분, 복리 1.2%',
    'inject.days1': '1일',
    'inject.rate1': '복리 0.3%',
    'inject.days15': '15일',
    'inject.rate15': '복리 0.6%',
    'inject.days30': '30일',
    'inject.rate30': '복리 1.2%',
    'inject.minutes7': '7분',
    'inject.minutes15': '15분',
    'inject.minutes30': '30분',
    'inject.minutes45': '45분',
    'inject.cancel': '취소',
    'inject.approving': '승인 중...',
    'inject.enterAmount': '금액을 입력하세요',
    'inject.approveOsk': 'OSK를 승인하세요',
    'inject.nextStep': '다음 단계',
    'inject.confirmStake': '스테이킹 확인',
    'inject.insufficientBalance': 'OSK 잔액이 부족합니다',
    'inject.maxAmountExceeded': '최대 {amount} OSK까지 주입 가능',
    'inject.approveSuccess': '승인 성공!',
    'inject.approveFailed': '승인 실패 또는 거부됨',
    'inject.soldOut': '현재 글로벌 스테이킹 할당량이 모두 판매되었습니다',

    // Claim Reward Modal
    'claim.title': '성취 보상 받기',
    'claim.loading': '성취 보상을 조회 중...',
    'claim.noReward': '없음',
    'claim.claiming': '받는 중',
    'claim.claim': '받기',
    'claim.close': '닫기',
    'claim.connectWallet': '먼저 지갑을 연결하고 승인하세요',
    'claim.levelRewardTitle': 'OSP Glory Point',
    'claim.nodeRewardTitle': 'Node Point',
    'claim.dividendRewardTitle': 'Dividend Point',
    
    // Confirm Referrer Modal
    'referrer.title': '추천인을 확인하세요',
    'referrer.addressLabel': '추천인 주소:',
    'referrer.loading': '로딩 중...',
    'referrer.cancel': '취소',
    'referrer.confirm': '추천인 확인 및 스테이킹',
    
    // Testimonial Section
    'testimonial.connectFuture': '미래 연결',
    'testimonial.yourselfShapesFuture': 'Yourself shapes the future.',
    'testimonial.futureJourneyLine1': '미래',
    'testimonial.futureJourneyLine2': '궤적',
    'testimonial.genesis': '체인 엔진',
    'testimonial.genesisEn': 'Chain Engine',
    'testimonial.genesisDesc': 'TVL 1억 돌파와 AI 수익 안정성을 최우선 검증으로 삼아 PoR 시스템, 스테이블코인 페깅, 핵심 계약 감사를 완료하고 TRON과의 가치 브리지를 개방하여 초기 자본 흐름을 점화합니다.',
    'testimonial.expansion': '컴퓨팅 도약',
    'testimonial.expansionEn': 'Computing Leap',
    'testimonial.expansionDesc': '수익 변동성 압축 및 크로스체인 확장을 중심으로 시장 중립적 양적 풀과 헤지 풀을 구축합니다. 크로스체인 브리지를 활성화하고 온체인 VaR 리스크 관리 매트릭스를 배포합니다.',
    'testimonial.handover': '차원 융합',
    'testimonial.handoverEn': 'Dimensional Fusion',
    'testimonial.handoverDesc': '주요 DApp의 담보 핵심이 되어 멀티체인 유동성을 출력합니다. LayerZero/Axelar 연결, DAO 거버넌스 이양, RWA 신용 파일럿을 완료하여 "Liquidity as a Service"로 자본 인력장을 확산합니다.',
    'testimonial.dissolution': '기관 액세스',
    'testimonial.dissolutionEn': 'Institutional Access',
    'testimonial.dissolutionDesc': '규정 준수 SPV로 전통 금융을 연결하여 TVL을 수백억으로 도약시킵니다. 글로벌 금융 라이선스 신청 및 기관급 API 채널을 개방하여 기관 자본의 Web3 네이티브 진입을 실현합니다.',
    
    // Countdown Timer
    'countdown.remaining': '남은 시간: ',
    'countdown.expired': '만료됨, 상환 가능',
    'countdown.days': '일 ',
    'countdown.hours': '시간 ',
    'countdown.minutes': '분 ',
    'countdown.seconds': '초',
    
    // HowToUse Section
    'howToUse.governFuture': '투자 목록',
    'howToUse.controlWealth': '여기서 — 당신의 부를 통제하세요',
    'howToUse.controlWealthDesc': '풀에 기부된 자금은 금액에 따라 매일 누적됩니다. 최대 1.2% 자동 복리를 누리며, 주기는 45일을 초과하지 않습니다.',
    'howToUse.investmentList': '스테이킹 목록',
    'howToUse.redemptionList': '상환 목록',
    'howToUse.loadingStakingData': '스테이킹 데이터 로딩 중...',
    'howToUse.connectWalletFirst': '스테이킹 주문을 보려면 먼저 지갑을 연결하세요',
    'howToUse.contractInitFailed': '컨트랙트 초기화 실패, 새로고침 후 다시 시도하세요',
    'howToUse.noInvestmentOrders': '진행 중인 스테이킹 주문이 없습니다',
    'howToUse.noRedemptionOrders': '상환된 주문이 없습니다',
    'howToUse.principal': '원금: ',
    'howToUse.netValue': '순자산: ',
    'howToUse.redeeming': '상환 중...',
    'howToUse.redeem': '상환',
    'howToUse.redeemed': '상환됨',
    'howToUse.waitingRedeem': '상환 대기',
    'howToUse.staking': 'STAKING',
    'howToUse.redeemedStatus': 'REDEEMED',
    
    // Toast Notifications
    'toast.connectWalletFirst': '먼저 지갑을 연결하고 승인하세요',
    'toast.stakeAndBindFirst': '먼저 스테이킹하고 추천인을 바인딩하세요',
    'toast.copied': '클립보드에 복사됨',
    'toast.copySuccess': '복사 성공! 클립보드에 복사됨',
    'toast.copyFailed': '복사 실패, 브라우저 권한을 확인하세요',
    'toast.refreshDataFailed': '데이터 새로고침 실패',
    'toast.loadingData': '첫 번째 데이터 로딩 중...',
    'toast.poolNotInitialized': '보상 풀 계약이 초기화되지 않았거나 지갑이 연결되지 않았습니다',
    'toast.txSent': '거래가 전송되었습니다, 확인 대기 중...',
    'toast.claimSuccess': '보상 청구 성공!',
    'toast.claimFailed': '보상 청구 실패',
    'toast.networkSwitched': '{networkName}(으)로 성공적으로 전환되었습니다',
    'toast.investmentSubmitted': '투자가 제출되었습니다. 나중에 X Node에서 확인하십시오',
    'toast.fetchDataFailed': '스테이킹 데이터 가져오기 실패',
    'toast.stakingNotInitialized': '스테이킹 계약이 초기화되지 않았습니다',
    'toast.invalidOrderId': '잘못된 주문 ID',
    'toast.unstakeSuccess': '언스테이킹 성공!',
    'toast.unstakeFailed': '언스테이킹 실패',
    'toast.calculateFailed': '예상 출력을 계산할 수 없습니다, 스테이킹 중단',
    'toast.stakeFailed': '스테이킹 실패: {reason}',
    'toast.refreshData': '6초마다 데이터 새로고침 중...',
    'toast.stakingRequest': '스테이킹 요청 처리 중...',
    'toast.insufficientBalance': '오류: OSK 잔액이 부족합니다 (현재: {balance})',
    'toast.invalidReferrer': '오류: 추천인 주소가 유효하지 않거나 스테이킹되지 않았습니다',
    'toast.stakeSuccessRefresh': '스테이킹 요청이 성공적으로 전송되었습니다.',
    'toast.stakeFailedRetry': '스테이킹에 실패했습니다. 나중에 다시 시도해주세요.',
    'toast.fetchReferrerFailed': '오류: 연결된 추천인 주소를 가져올 수 없습니다.',
    'toast.stake200Tokens': '최소 3 TOKEN의 스테이킹이 필요합니다',
    'toast.highStakingVolume': '현재 스테이킹 양이 많습니다. 잠시 후 다시 시도해 주세요',
    'toast.notYetOpen': '아직 오픈되지 않았습니다',
    
    // Queue Modal
    'queue.applying': '스테이킹 대기열 진입 신청 중, 잠시만 기다려 주세요',
    'queue.seconds': '초',

    // Share Friend Modal
    'share.title': '링크 공유',
    'share.shareLink': '링크 공유',
    'share.teamId': '당신의 초대자',
    'share.linkLabel': '귀하의 추천 링크:',
    'share.hint': '복사에 실패하면 링크를 길게 눌러 수동으로 복사하여 공유하십시오',
    'share.button': '링크 복사',
    'share.contributionTitle': '우정 기여',
    'share.contributionButton': '우정 기여',
    'share.myReferralsLabel': '내 추천:',
    'share.referralsUnit': '명',
    'share.noReferrals': '아직 추천인이 없습니다',
    'share.kpiLabel': '부스트',
    'share.assetsLabel': '자산',
    'share.loadingReferrals': '조회 중...',
    'share.rewardsFromFriends': '현재 친구로부터의 예상 보상:',
    'share.rewardsDisclaimer': '이 수익은 스테이킹 시점의 상태를 기준으로 추정된 것이며 참고용입니다. 실제 상환 시 수익이 변경될 수 있습니다.',
    
    // Common
    'common.loading': 'Loading...',
    'common.token': 'TOKEN',
    'common.osp': 'OSP',
    'common.osk': 'OSK'
  }
};

// Translation function
export function t(key, params = {}) {
  const currentPack = languagePacks[i18nState.currentLanguage];
  if (!currentPack) {
    console.warn(`Language pack not found for: ${i18nState.currentLanguage}`);
    return key;
  }
  
  let translation = currentPack[key];
  if (translation === undefined) {
    console.warn(`Translation key not found: ${key} for language: ${i18nState.currentLanguage}`);
    return key;
  }
  
  // Replace parameters in translation
  Object.keys(params).forEach(param => {
    translation = translation.replace(`{${param}}`, params[param]);
  });
  
  return translation;
}

// Language switching function
export function setLanguage(languageCode) {
  if (i18nState.languages[languageCode]) {
    i18nState.currentLanguage = languageCode;
    localStorage.setItem('osp_language', languageCode);
    console.log(`Language switched to: ${languageCode}`);
    // Refresh the page to ensure all components update properly
    window.location.reload();
  } else {
    console.warn(`Language not supported: ${languageCode}`);
  }
}

// Initialize language from localStorage
export function initializeLanguage() {
  const savedLanguage = localStorage.getItem('osp_language');
  if (savedLanguage && i18nState.languages[savedLanguage]) {
    i18nState.currentLanguage = savedLanguage;
  }
}

// Computed properties
export const currentLanguage = computed(() => i18nState.currentLanguage);
export const availableLanguages = computed(() => [
  i18nState.languages['zh-cn'],
  i18nState.languages['zh-tw'],
  i18nState.languages['en'],
  // i18nState.languages['ko'],
  // i18nState.languages['ja'],
]);
