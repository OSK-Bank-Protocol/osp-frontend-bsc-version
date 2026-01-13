import { walletState } from './wallet';
import { APP_ENV, ENABLE_SINGLE_PURCHASE_LIMIT, SINGLE_PURCHASE_LIMIT } from './environment';
import { toRaw } from 'vue';
import { showToast } from '../services/notification';
import { t } from '../i18n';

// --- Helper to get OSK decimals based on environment ---
// TRC20 OSK uses 18 decimals
export const getOskDecimals = () => {
  return 18;
};

// --- Helper for BigNumber/Units (Replacement for ethers.formatUnits/parseUnits) ---
// TronWeb injects BigNumber attached to window.tronWeb usually, or we can use the one from package if needed.
// We assume window.tronWeb is available when these are called.

// --- Cache System ---
const callCache = new Map();
const CACHE_TTL = 60000; // 60 seconds (increased from 30s)
const SHORT_CACHE_TTL = 15000; // 15 seconds (increased from 5s) for user-specific data

const cachedCall = async (key, fetcher, ttl = CACHE_TTL, forceRefresh = false) => {
  const now = Date.now();
  if (!forceRefresh && callCache.has(key)) {
    const { timestamp, value, promise } = callCache.get(key);
    // If there is an active promise, return it to dedup simultaneous calls
    if (promise) return promise;
    // If valid cache exists
    if (now - timestamp < ttl) {
      return value;
    }
  }

  // Create a promise for this fetch
  const promise = fetcher().then(result => {
    callCache.set(key, { timestamp: Date.now(), value: result, promise: null });
    return result;
  }).catch(err => {
    callCache.delete(key);
    throw err;
  });

  // Store promise to dedup
  callCache.set(key, { timestamp: now, value: null, promise });
  return promise;
};

// --- Batch/Concurrency Helper ---
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const batchPromises = async (items, batchSize, fn) => {
    const results = [];
    for (let i = 0; i < items.length; i += batchSize) {
        const chunk = items.slice(i, i + batchSize);
        // Execute chunk in parallel
        const chunkResults = await Promise.all(chunk.map(fn));
        results.push(...chunkResults);
        // Add a small delay between batches to avoid rate limiting (429)
        if (i + batchSize < items.length) {
            await sleep(500); // 500ms delay
        }
    }
    return results;
};

export const formatUnits = (value, decimals) => {
    if (!value) return "0";
    if (!window.tronWeb) return String(value);
    const BigNumber = window.tronWeb.BigNumber;
    const bn = new BigNumber(value.toString());
    return bn.div(new BigNumber(10).pow(decimals)).toFixed(decimals).replace(/\.?0+$/, "");
};

export const parseUnits = (value, decimals) => {
    if (!value) return "0";
    if (!window.tronWeb) return "0";
    const BigNumber = window.tronWeb.BigNumber;
    const bn = new BigNumber(value.toString());
    return bn.times(new BigNumber(10).pow(decimals)).toFixed(0);
};

// --- Import ABIs ---
// Note: Tron ABIs are technically same JSON structure usually
import referralAbi from '../abis/referral.json';
import stakingAbiTest from '../abis/staking_test.json';
import stakingAbiMain from '../abis/staking_main.json';
import ospAbi from '../abis/osp.json';
import s5poolAbi from '../abis/s5pool.json';
import s6poolAbi from '../abis/s6pool.json';
import s7poolAbi from '../abis/s7pool.json';
import nodePoolAbi from '../abis/node_pool.json';
import nodeDividendPoolAbi from '../abis/node_dividend_pool.json';
import routerAbi from '../abis/router.json';
// import stakingHelperAbi from '../abis/staking_helper.json';
// import dynamicConfigAbi from '../abis/dynamicConfig.json';

// Select staking ABI based on environment
const stakingAbi = APP_ENV === 'PROD' ? stakingAbiMain : stakingAbiTest;

// --- Contract Addresses ---
// TODO: REPLACE ALL ADDRESSES WITH TRON BASE58 ADDRESSES (Start with T...)
const contractAddresses = {
  referral: {
    production: 'TUL1RP4emDS1zWb1eEKdKwqF8JiiXX8S27', 
    development: 'TFZfGwdpH85qEybpD1wVGAiuexkjooNN5t',
  },
  staking: {
    production: 'TSddkCjXMVbuXCCAPawxcn1orFvRXKLxc9', 
    development: 'TP6NMd3dYaEMrVWw7W9ErkgMHZpraxbE2N',
  },
  osp: {
    production: 'TGZV43Vt2hyrxvHiZj6LQ7gGRXS46yFqte', 
    development: 'TXuiVNDo1amHwE2zDhi6oDLMRGY1xPmSGx',
  },
  osk: {
    production: 'TDk91SWz2GvwfZwMTGX21d4ngUUH8YZZAv', 
    development: 'TCGMQinLjQLkHhp5kYoTWREWktn5jGwyvY',
  },
  router: {
    production: 'TXF1xDbVGdxFGbovmmmXvBGu8ZiE3Lq4mR',
    development: 'TMn1qrmYUMSTXo9babrJLzepKZoPC7M6Sy', 
  },
  s5pool: {
    production: 'TSYkEarx8JThvzdWCe1Aicv8Hnu33uP916', 
    development: 'TGMZLChPhZeVm4XWq57cp8RXqe3aEMGGkw',
  },
  s6pool: {
    production: 'TKPBQP2yYHq4RNWzkaahCHKiQMqHEoJVhA', 
    development: 'TTN22vwDhADj3jFJpus8w1XKd5adqc9gUL',
  },
  s7pool: {
    production: 'TJL8CRazdKziGkitM8jq7a6fVZG1QQd21y', 
    development: 'TUb8JVvdgvMSrhcXqNGnjxLj8bYTkoAiPA',
  },
  lp: {
    production: 'TSQXeoXD6QwHUNbLj9sLQ7P8Wy59oabuf8',
    development: 'TF4oBwfJFTchpJnCkCv21pxJbFVYwn8JXw',
  },
  nodePool: {
    production: 'TQEr2M7enb2zEMDS9SQrRAkGhf9nwKsFMJ',
    development: 'TGewtMAwuV1rej7e8QJE427CZNFMzpRKGn',
  },
  nodeDividendPool: {
    production: 'TQJdBf6reVqQS867HRdVRCPQdEaQgGoSMF',
    development: 'TVn1MBRBVpGz4v9W5Ykw522KZqgmyKZ9PP',
  },
  // stakingHelper: {
  //   production: 'TTQrpEko4Nppf6sAfDrKq29wNYXGFQKvEU', 
  //   development: 'TN5Yzxk9nZkv62Jjk9THJ7zBqa6rTDm2eE',
  // },
  // dynamicConfig: {
  //   production: 'TFwe2SavtFzHhkmcXYpq1sFFU1Nm8Mev8S',
  //   development: 'TQhbRrap82Ci8Cp3Hcw1xC1gUA3uQxZNQ9',
  // }
};

// --- Contract Instances ---
let referralContract;
let stakingContract;
let ospContract;
let oskContract;
let routerContract;
let s5poolContract;
let s6poolContract;
let s7poolContract;
let nodePoolContract;
let nodeDividendPoolContract;
// let stakingHelperContract;
// let dynamicConfigContract;

export { referralContract, stakingContract, ospContract, oskContract, s5poolContract, s6poolContract, s7poolContract, nodePoolContract, nodeDividendPoolContract };

// --- KPI Thresholds ---
// Note: These need to be checked if they are OSP or OSK values and adjusted for precision
// Assuming these are value thresholds in 18 decimals (if OSP) or 6 (if OSK)
// If contracts are unchanged, logic remains, but bigints need care.
const THRESHOLDS = {
  production: {
    S1: 30n * (10n ** 18n),      
    S2: 300n * (10n ** 18n),     
    S3: 1000n * (10n ** 18n),    
    S4: 5000n * (10n ** 18n),    
    S5: 10000n * (10n ** 18n),   
    S6: 30000n * (10n ** 18n),   
    S7: 50000n * (10n ** 18n),   
  },
  development: {
    S1: 30n * (10n ** 18n),      
    S2: 60n * (10n ** 18n),     
    S3: 90n * (10n ** 18n),    
    S4: 120n * (10n ** 18n),    
    S5: 150n * (10n ** 18n),   
    S6: 180n * (10n ** 18n),   
    S7: 210n * (10n ** 18n),     
  }
};

const env = APP_ENV === 'PROD' ? 'production' : 'development';

export const S1_THRESHOLD = THRESHOLDS[env].S1;
export const S2_THRESHOLD = THRESHOLDS[env].S2;
export const S3_THRESHOLD = THRESHOLDS[env].S3;
export const S4_THRESHOLD = THRESHOLDS[env].S4;
export const S5_THRESHOLD = THRESHOLDS[env].S5;
export const S6_THRESHOLD = THRESHOLDS[env].S6;
export const S7_THRESHOLD = THRESHOLDS[env].S7;


/**
 * Initializes all contract instances using window.tronWeb
 */
export const initializeContracts = async () => {
  if (!window.tronWeb || !window.tronWeb.defaultAddress.base58) {
    console.warn("Cannot initialize contracts without TronWeb.");
    return;
  }

  // Ensure API Key is set for contract interactions
  try {
      window.tronWeb.setHeader({ "TRON-PRO-API-KEY": '95bf6fc6-2f62-4821-bf40-b5427d479f2a' });
  } catch (e) {
      console.warn("Failed to set TronGrid API Key header in contracts:", e);
  }

  const env = APP_ENV === 'PROD' ? 'production' : 'development';
  console.log(`Initializing contracts for ${env} environment (Tron).`);

  const initSafe = async (address, name, abi = null) => {
      try {
          // Check if address looks like a Tron address (starts with T)
          // If it starts with 0x, tronWeb will throw.
          if (!address.startsWith('T')) {
              console.warn(`Skipping ${name} contract: Invalid Tron Address ${address}`);
              return null;
          }
          if (abi) {
            // Fix for router.json which might be wrapped in { entrys: [] } or similar structure
            let finalAbi = abi;
            if (!Array.isArray(abi) && abi.entrys) {
                finalAbi = abi.entrys;
            } else if (!Array.isArray(abi) && abi.abi) {
                 finalAbi = abi.abi;
            }
            return window.tronWeb.contract(finalAbi, address);
          }
          return await window.tronWeb.contract().at(address);
      } catch (e) {
          console.error(`Failed to load ${name} contract:`, e);
          return null;
      }
  };

  referralContract = await initSafe(contractAddresses.referral[env], 'referral', referralAbi);
  stakingContract = await initSafe(contractAddresses.staking[env], 'staking', stakingAbi);
  ospContract = await initSafe(contractAddresses.osp[env], 'osp', ospAbi);
  
  // OSK might be a standard TRC20 without explicit ABI file sometimes, but if we treat it as token, we should have ABI.
  // Assuming 'ospAbi' or similar TRC20 ABI can be used for OSK if it's just a token, 
  // OR we can use window.tronWeb.contract().at(address) if it's verified. 
  // Safest is to use a standard TRC20 ABI if available, or try without if we trust verification.
  // For now, let's try to use ospAbi (standard TRC20 functions) for OSK if no specific oskAbi exists.
  // Actually, wait, do we have oskAbi? No. We use ospAbi for OSK (Token) usually ok?
  // Let's use ospAbi for OSK as well since it likely follows ERC20/TRC20 standard.
  oskContract = await initSafe(contractAddresses.osk[env], 'osk', ospAbi);
  
  // For Router, we need an ABI. Usually SunSwap Router ABI. 
  // If we don't have router.json, we might fail if not verified.
  // Assuming we don't have router ABI imported yet?
  // We need to import it or rely on .at().
  // Let's check imports. No routerAbi imported. 
  // We should try .at() for router if no ABI, or add ABI.
  // Given user restriction "no web load", we risk failure if no ABI.
  // But let's try to maintain .at() for router if we lack ABI.
  routerContract = await initSafe(contractAddresses.router[env], 'router', routerAbi); 
  
  s5poolContract = await initSafe(contractAddresses.s5pool[env], 's5pool', s5poolAbi);
  s6poolContract = await initSafe(contractAddresses.s6pool[env], 's6pool', s6poolAbi);
  s7poolContract = await initSafe(contractAddresses.s7pool[env], 's7pool', s7poolAbi);
  nodePoolContract = await initSafe(contractAddresses.nodePool[env], 'nodePool', nodePoolAbi);
  nodeDividendPoolContract = await initSafe(contractAddresses.nodeDividendPool[env], 'nodeDividendPool', nodeDividendPoolAbi);
  // stakingHelperContract = await initSafe(contractAddresses.stakingHelper[env], 'stakingHelper', stakingHelperAbi);
  // dynamicConfigContract = await initSafe(contractAddresses.dynamicConfig[env], 'dynamicConfig', dynamicConfigAbi);

  walletState.contractsInitialized = true;
  console.log("[合约] 初始化流程结束 (部分可能因地址错误跳过)");
};

export const resetContracts = () => {
  referralContract = null;
  stakingContract = null;
  ospContract = null;
  oskContract = null;
  routerContract = null;
  s5poolContract = null;
  s6poolContract = null;
  s7poolContract = null;
  nodePoolContract = null;
  nodeDividendPoolContract = null;
  // stakingHelperContract = null;
  // dynamicConfigContract = null;
  console.log("Contract instances have been reset.");
};

export const getTeamKpiBigNumber = async () => {
    if (!stakingContract || !walletState.address) return 0n;
    // Note: BigInt cannot be directly JSON stringified for cache if we used simple cache
    // But our cache stores raw promises/values in memory, so BigInt is fine.
    return cachedCall(`teamKpi_${walletState.address}`, async () => {
        try {
            const kpi = await stakingContract.getTeamKpi(walletState.address).call();
            return BigInt(kpi.toString());
        } catch (error) {
            console.error("Error fetching team KPI:", error);
            return 0n;
        }
    }, SHORT_CACHE_TTL);
};

export const getUserStakedBalance = async () => {
  if (!stakingContract || !walletState.address) return "0";
  return cachedCall(`userStakedBalance_${walletState.address}`, async () => {
      try {
        // .call() for view functions
        const totalValue = await stakingContract.balanceOf(walletState.address).call();
        return formatUnits(totalValue, 18); 
      } catch (error) {
        console.error("Error fetching staked balance:", error);
        return "0";
      }
  }, SHORT_CACHE_TTL);
};

export const getUserStakedBalanceByAddress = async (address) => {
  if (!stakingContract) return "0";
  try {
    const totalValue = await stakingContract.balanceOf(address).call();
    return formatUnits(totalValue, 18);
  } catch (error) {
    return "0";
  }
};

export const getFriendsBoost = async () => {
  if (!stakingContract || !walletState.address) return "0";
  try {
    const kpi = await stakingContract.getTeamKpi(walletState.address).call();
    return formatUnits(kpi, 18);
  } catch (error) {
    return "0";
  }
};

export const getTeamKpiByAddress = async (address) => {
  if (!stakingContract) return "0";
  try {
    const kpi = await stakingContract.getTeamKpi(address).call();
    return formatUnits(kpi, 18);
  } catch (error) {
    return "0";
  }
};

const getPendingRewards = async (poolContract) => {
    if (!poolContract || !walletState.address) return "0";
    try {
        const env = APP_ENV === 'PROD' ? 'production' : 'development';
        const ospAddress = contractAddresses.osp[env];
        const rewards = await poolContract.getTokenRewards(walletState.address, ospAddress).call();
        return formatUnits(rewards, 18);
    } catch (error) {
        return "0";
    }
};

export const getS5PendingRewards = async () => cachedCall(`s5Rewards_${walletState.address}`, () => getPendingRewards(s5poolContract), SHORT_CACHE_TTL);
export const getS6PendingRewards = async () => cachedCall(`s6Rewards_${walletState.address}`, () => getPendingRewards(s6poolContract), SHORT_CACHE_TTL);
export const getS7PendingRewards = async () => cachedCall(`s7Rewards_${walletState.address}`, () => getPendingRewards(s7poolContract), SHORT_CACHE_TTL);

export const getNodePointRewards = async () => {
    if (!nodePoolContract || !walletState.address) return "0";
    return cachedCall(`nodePointRewards_${walletState.address}`, async () => {
        try {
            const rewards = await nodePoolContract.getTokenRewards(walletState.address).call();
            return formatUnits(rewards, 18);
        } catch (error) {
            return "0";
        }
    }, SHORT_CACHE_TTL);
};

const claimRewards = async (poolContract) => {
    if (!poolContract || !walletState.address) {
        showToast(t('toast.poolNotInitialized'));
        return false;
    }
    try {
        const env = APP_ENV === 'PROD' ? 'production' : 'development';
        const ospAddress = contractAddresses.osp[env];

        // Trigger transaction
        const txId = await poolContract.harvest(ospAddress).send();
        showToast(t('toast.txSent'));
        console.log("Claim tx sent:", txId);
        // Tron doesn't have simple .wait(), usually we just return success on send 
        // or poll the transaction. For UI responsiveness, we assume sent = pending success.
        return true;
    } catch (error) {
        console.error("Claim error:", error);
        showToast(t('toast.claimFailed'));
        return false;
    }
};

export const claimS5Rewards = async () => claimRewards(s5poolContract);
export const claimS6Rewards = async () => claimRewards(s6poolContract);
export const claimS7Rewards = async () => claimRewards(s7poolContract);

export const claimNodePointRewards = async () => {
    if (!nodePoolContract || !walletState.address) return false;
    try {
        const isPreacher = await checkIsPreacher();
        if (!isPreacher) {
             showToast(t('toast.stake200Tokens'));
             return false;
        }
        await nodePoolContract.harvest().send();
        showToast(t('toast.txSent'));
        return true;
    } catch (error) {
        showToast(t('toast.claimFailed'));
        return false;
    }
};

export const getDividendPointRewards = async () => {
    if (!nodeDividendPoolContract || !walletState.address) return "0";
    return cachedCall(`dividendPointRewards_${walletState.address}`, async () => {
        try {
            const env = APP_ENV === 'PROD' ? 'production' : 'development';
            const oskAddress = contractAddresses.osk[env];
            const rewards = await nodeDividendPoolContract.getTokenRewards(walletState.address, oskAddress).call();
            return formatUnits(rewards, getOskDecimals()); // OSK
        } catch (error) {
            return "0";
        }
    }, SHORT_CACHE_TTL);
};

export const claimDividendPointRewards = async () => {
    if (!nodeDividendPoolContract || !walletState.address) return false;
    try {
        const env = APP_ENV === 'PROD' ? 'production' : 'development';
        const oskAddress = contractAddresses.osk[env];
        const isPreacher = await checkIsPreacher();
        if (!isPreacher) {
             showToast(t('toast.stake200Tokens'));
             return false;
        }
        await nodeDividendPoolContract.harvest(oskAddress).send();
        showToast(t('toast.txSent'));
        return true;
    } catch (error) {
        showToast(t('toast.claimFailed'));
        return false;
    }
};

export const checkIsPreacher = async () => {
    if (!stakingContract || !walletState.address) return false;
    return cachedCall(`isPreacher_${walletState.address}`, async () => {
        try {
            return await stakingContract.isPreacher(walletState.address).call();
        } catch (error) {
            return false;
        }
    }, CACHE_TTL); // Status unlikely to change often, 30s cache is fine or even longer
};

export const getUserPrincipalBalance = async () => {
  if (!stakingContract || !walletState.address) return "0";
  return cachedCall(`userPrincipal_${walletState.address}`, async () => {
      try {
        const principal = await stakingContract.balances(walletState.address).call();
        return formatUnits(principal, 18);
      } catch (error) {
        return "0";
      }
  }, SHORT_CACHE_TTL);
};

export const checkAllClaimableRewards = async () => {
    if (!walletState.isAuthenticated || !walletState.contractsInitialized) {
        walletState.hasClaimableRewards = false;
        return false;
    }
    try {
        const [s5, s6, s7] = await Promise.all([
            getS5PendingRewards(),
            getS6PendingRewards(),
            getS7PendingRewards(),
        ]);
        const hasRewards = parseFloat(s5) > 0 || parseFloat(s6) > 0 || parseFloat(s7) > 0;
        walletState.hasClaimableRewards = hasRewards;
        return hasRewards;
    } catch (error) {
        walletState.hasClaimableRewards = false;
        return false;
    }
};

export const getUserStakingData = async () => {
  if (!stakingContract || !walletState.address) return [];

  try {
    const count = await stakingContract.stakeCount(walletState.address).call();
    const stakeCount = Number(count);

    if (stakeCount === 0) return [];

    const indices = [];
    for (let i = stakeCount - 1; i >= 0; i--) {
      indices.push(i);
    }

    // Process in batches of 2 to avoid rate limiting (was 5)
    const fetchRecord = async (index) => {
         try {
             const [record, reward] = await Promise.all([
                 stakingContract.userStakeRecord(walletState.address, index).call(),
                 stakingContract.rewardOfSlot(walletState.address, index).call()
             ]);
             return { record, reward, index };
         } catch (e) {
             console.error(`Error fetching stake ${index}`, e);
             return null; 
         }
    };

    const results = await batchPromises(indices, 2, fetchRecord);
    
    // Filter out failed fetches
    const validResults = results.filter(r => r !== null);
    
    const isDev = APP_ENV === 'test' || APP_ENV === 'dev';
    const stakeDurations = isDev 
      ? [420, 900, 1800, 2700] // 7 mins, 15 mins, 30 mins, 45 mins (in seconds)
      : [604800, 1296000, 2592000, 3888000]; // 7 days, 15 days, 30 days, 45 days

    const formattedData = validResults.map((item) => {
      const record = item.record;
      const originalIndex = item.index;
      const totalValueRaw = item.reward;
      
      // TronWeb returns objects usually with BigNumber properties or hex strings depending on setup
      // Assuming typical TronWeb contract response:
      // record is { amount: BigNumber, stakeTime: BigNumber, ... }

      const amountBn = window.tronWeb.BigNumber(record.amount);
      const stakeTimeBn = window.tronWeb.BigNumber(record.stakeTime);
      const stakeIndexVal = Number(record.stakeIndex);
      const totalValueBn = window.tronWeb.BigNumber(totalValueRaw);
      const finalRewardBn = window.tronWeb.BigNumber(record.finalReward);

      let interestBn;
      if (record.status) { // Redeemed (boolean true)
        interestBn = finalRewardBn.gt(0) ? finalRewardBn.minus(amountBn) : window.tronWeb.BigNumber(0);
      } else {
        interestBn = totalValueBn.gt(amountBn) ? totalValueBn.minus(amountBn) : window.tronWeb.BigNumber(0);
      }

      const stakeTimeInSeconds = stakeTimeBn.toNumber();
      const stakeDurationInSeconds = stakeDurations[stakeIndexVal] || 0;
      const expiryTimestamp = (stakeTimeInSeconds + stakeDurationInSeconds) * 1000;

      let displayStatus = 'waiting';
      if (record.status) {
        displayStatus = 'redeemed';
      } else if (expiryTimestamp <= Date.now()) {
        displayStatus = 'redeemable';
      }

      const decimals = getOskDecimals();

      return {
        principal: formatUnits(amountBn, decimals),
        interest: formatUnits(interestBn, decimals),
        stakeDate: new Date(stakeTimeInSeconds * 1000).toLocaleString('zh-CN', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
          hour12: false
        }).replace(/\//g, '-'),
        expiryTimestamp: expiryTimestamp,
        displayStatus: displayStatus,
        originalIndex: originalIndex,
      };
    });

    return formattedData;

  } catch (error) {
    console.error("Error fetching staking data:", error);
    return [];
  }
};

export const unstake = async (id) => {
  if (!stakingContract) return false;
  try {
    // TronWeb contract calls
    await stakingContract.unstake(id).send();
    showToast(t('toast.unstakeSuccess'));
    return true;
  } catch (error) {
    console.error("Unstake error:", error);
    showToast(t('toast.unstakeFailed'));
    return false;
  }
};

export const checkIfUserHasReferrer = async () => {
  if (!referralContract || !walletState.address) return false;
  try {
    const hasReferrer = await referralContract.isBindReferral(walletState.address).call();
    return hasReferrer;
  } catch (error) {
    return false;
  }
};

export const getOskBalance = async () => {
  if (!oskContract || !walletState.address) return "0";
  return cachedCall(`oskBalance_${walletState.address}`, async () => {
      try {
        const balance = await oskContract.balanceOf(walletState.address).call();
        return formatUnits(balance, getOskDecimals());
      } catch (error) {
        return "0";
      }
  }, SHORT_CACHE_TTL);
};

export const getPoolOskReserves = async () => {
  if (!oskContract) return "0";
  return cachedCall('poolOskReserves', async () => {
    try {
        const env = APP_ENV === 'PROD' ? 'production' : 'development';
        const lpAddress = contractAddresses.lp[env];
        const reserves = await oskContract.balanceOf(lpAddress).call();
        return formatUnits(reserves, getOskDecimals());
    } catch (error) {
        return "0";
    }
  });
};

const getExpectedOSPAmount = async (oskAmountIn) => {
  if (!routerContract) return window.tronWeb ? new window.tronWeb.BigNumber(0) : 0n;
  const env = APP_ENV === 'PROD' ? 'production' : 'development';
  const oskAddress = contractAddresses.osk[env];
  const ospAddress = contractAddresses.osp[env];

  try {
    // TronWeb call response is usually an array for multi-return
    const routerAddress = routerContract.address;
    const path = [oskAddress, ospAddress];
    console.log(`[Router Debug] Contract Address: ${routerAddress}`);
    console.log(`[Router Debug] Method: getAmountsOut`);
    console.log(`[Router Debug] Params - amountIn: ${oskAmountIn}, path: ${JSON.stringify(path)}`);
    
    let amountsOut;
    try {
        amountsOut = await routerContract.getAmountsOut(oskAmountIn, [oskAddress, ospAddress]).call();
        // DEBUG: Capture raw router output
        walletState.lastRouterRawOutput = amountsOut;
    } catch (e) {
        console.warn("[Router Debug] Call failed", e);
        walletState.lastRouterRawOutput = "Call Failed: " + e.message;
        throw e;
    }
    console.log(`[Router Debug] amountsOut result:`, amountsOut);
    
    // amountsOut[1] is the output
    // It might be a BigNumber or hex object
    // Handle different return types (array vs object vs hex)
    let outAmount;
    // Log detailed structure to debug
    // console.log("Amounts structure:", amountsOut);

    if (amountsOut && amountsOut.amounts && Array.isArray(amountsOut.amounts)) {
        // Priority: Check named key 'amounts' first (common in some TronWeb contract wrappers)
        outAmount = amountsOut.amounts[1];
    } else if (Array.isArray(amountsOut)) {
        // Standard array return
        outAmount = amountsOut[1];
    } else if (amountsOut && typeof amountsOut === 'object') {
        // Sometimes it's an object with numeric keys {0: ..., 1: ...} but not an Array instance
        if (amountsOut[1]) {
             outAmount = amountsOut[1];
        } else {
             // Fallback: try to convert the whole thing if it's a single value (unlikely)
             console.warn("[Router Debug] Object returned but key 1 missing, checking key 0 or raw");
             outAmount = amountsOut[0] || amountsOut; 
        }
    } else {
         // Fallback
         console.warn("[Router Debug] Unexpected return format");
         outAmount = 0;
    }

    console.log(`[Router Debug] Extracted outAmount:`, outAmount ? outAmount.toString() : "null");
    // Ensure we convert to string first to avoid BigNumber constructor issues with complex objects
    return window.tronWeb.BigNumber(outAmount.toString());
  } catch (error) {
    console.error("[Router Debug] getAmountsOut error:", error);
    return window.tronWeb ? new window.tronWeb.BigNumber(0) : 0n;
  }
};

export const getOskAllowance = async () => {
  const env = APP_ENV === 'PROD' ? 'production' : 'development';
  const stakingAddress = contractAddresses.staking[env];
  if (!oskContract || !walletState.address || !stakingAddress) return "0";
  return cachedCall(`oskAllowance_${walletState.address}`, async () => {
      try {
        const allowance = await oskContract.allowance(walletState.address, stakingAddress).call();
        return formatUnits(allowance, getOskDecimals());
      } catch (error) {
        return "0";
      }
  }, SHORT_CACHE_TTL);
};

export const approveOsk = async () => {
  const env = APP_ENV === 'PROD' ? 'production' : 'development';
  const stakingAddress = contractAddresses.staking[env];
  if (!oskContract || !stakingAddress) return false;
  try {
    // MaxUint256 in hex
    const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    await oskContract.approve(stakingAddress, MAX_UINT256).send();
    return true;
  } catch (error) {
    console.error("Approve error:", error);
    return false;
  }
};

export const getReferrer = async () => {
  if (!referralContract || !walletState.address) return null;
  try {
    const referrer = await referralContract.getReferral(walletState.address).call();
    if (referrer && window.tronWeb && window.tronWeb.address) {
        return window.tronWeb.address.fromHex(referrer);
    }
    return referrer;
  } catch (error) {
    return null;
  }
};

export const getRootReferrer = async () => {
  if (!referralContract) return null;
  try {
    const root = await referralContract.getRootAddress().call();
    if (root && window.tronWeb && window.tronWeb.address) {
        return window.tronWeb.address.fromHex(root);
    }
    return root;
  } catch (error) {
    return null;
  }
};

export const isReferrerValid = async (referrerAddress) => {
  if (!referralContract) return false;
  try {
    return await referralContract.isBindReferral(referrerAddress).call();
  } catch (error) {
    return false;
  }
};

export const stakeWithInviter = async (amount, stakeIndex, parentAddress) => {
  if (!stakingContract) {
    showToast(t('toast.stakingNotInitialized'));
    return { success: false, error: t('toast.stakingNotInitialized') };
  }
  try {
    const decimals = getOskDecimals();
    // parseUnits now returns a string (integer)
    const amountStr = parseUnits(amount, decimals);
    const amountInWei = window.tronWeb.BigNumber(amountStr);

    // Slippage calc
    const expectedOSP = await getExpectedOSPAmount(amountInWei.div(2).toFixed(0));

    // If router fails, proceed? Or fail? Ethers version failed.
    // Let's assume 0n means fail, BUT for compatibility with OKX/TP wallets which might fail the view call,
    // we should allow proceeding with minOut = 0 (no slippage protection) instead of blocking the user.
    let amountOutMin = "0";
    
    if (expectedOSP.eq(0) || expectedOSP.isNaN()) {
         console.warn("Router calc failed (0 or NaN). Proceeding with minOut = 0 (No Slippage Protection) for compatibility.");
         // Do not return error, just accept 0
         amountOutMin = "0";
    } else {
         amountOutMin = expectedOSP.times(0.9).toFixed(0); // 10% slippage
    }

    const params = {
        amount: amountInWei.toFixed(0),
        minOut: amountOutMin.toString(),
        index: Number(stakeIndex),
        parent: parentAddress
    };

    console.log("Staking Final Params:", params);

    // DEBUG: Show debug info via AlertModal for verification
    walletState.debugInfo = {
        title: "Debug: Slippage & Params",
        message: `[Router Expected OSP]: ${expectedOSP.toString()}\n[Calculated minOut (10% Slippage)]: ${amountOutMin}\n\n[Contract Params]:\n${JSON.stringify(params, null, 2)}`
    };

    if (params.amount === "NaN" || params.minOut === "NaN") {
        console.error("Critical: Staking parameters contain NaN");
        showToast(t('toast.stakeFailed'));
        return { success: false, error: t('toast.stakeFailed') };
    }

    await stakingContract.stakeWithInviter(
      params.amount,
      params.minOut,
      params.index,
      params.parent
    ).send();
    
    showToast(t('toast.txSent'));
    return { success: true };
  } catch (error) {
    console.error("Stake error:", error);
    // showToast(t('toast.stakeFailed'));
    
    // Extract raw error information
    let errorMessage = t('toast.stakeFailed');
    let rawError = '';
    
    if (error) {
      if (typeof error === 'string') {
          errorMessage = error;
          rawError = error;
      } else if (error.message) {
          errorMessage = error.message;
          // Try to get more details if available
          if (error.error || error.data) {
             rawError = JSON.stringify(error, Object.getOwnPropertyNames(error));
          } else {
             rawError = error.message;
          }
      } else {
          errorMessage = JSON.stringify(error);
          rawError = errorMessage;
      }
    }

    // Check for user cancellation
    if (errorMessage && (
        errorMessage.includes("Confirmation declined by user") || 
        errorMessage.includes("User rejected") ||
        errorMessage.includes("cancelled by user")
    )) {
        return { success: false, cancelled: true };
    }
    
    return { success: false, error: errorMessage, rawError: rawError };
  }
};

// Helper to get storage value from Tron RPC
export const getStorageAt = async (contractAddress, slotHex) => {
    let baseUrl;
    let useApiKey = false;

    // Prioritize wallet-provided RPC
    if (window.tronWeb && window.tronWeb.fullNode && window.tronWeb.fullNode.host) {
        baseUrl = window.tronWeb.fullNode.host;
    } else {
        // Fallback to default TronGrid
        baseUrl = (APP_ENV !== 'PROD') ? 'https://nile.trongrid.io' : 'https://api.trongrid.io';
        useApiKey = true;
    }

    // specific fix: if the wallet provided host is actually trongrid, we should probably still use the API key
    // to avoid rate limiting or access issues, while respecting the rule to not send keys to private nodes.
    if (baseUrl.includes('trongrid.io')) {
        useApiKey = true;
    }
    
    // Convert Tron address to hex (41...) then to Eth address (0x...)
    // Some wallets might not have window.tronWeb.address.toHex ready immediately, use try-catch
    let ethAddress;
    try {
        const addressHex = window.tronWeb.address.toHex(contractAddress);
        ethAddress = '0x' + addressHex.substring(2);
    } catch (e) {
        console.warn("[getStorageAt] Address conversion failed", e);
        return null;
    }
    
    // Ensure slot is 0x prefixed
    const ethSlot = slotHex.startsWith('0x') ? slotHex : '0x' + slotHex;
    const jsonRpcUrl = `${baseUrl}/jsonrpc`;
    
    const payloadRpc = {
        jsonrpc: "2.0",
        method: "eth_getStorageAt",
        params: [ethAddress, ethSlot, "latest"],
        id: 1
    };
    
    const headers = { "Content-Type": "application/json" };
    
    // Only add API Key if using default TronGrid
    if (useApiKey) {
        headers["TRON-PRO-API-KEY"] = '95bf6fc6-2f62-4821-bf40-b5427d479f2a';
    }

    try {
        const response = await fetch(jsonRpcUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payloadRpc)
        });
        
        if (!response.ok) return null;
        
        const json = await response.json();
        if (json.error) return null;
        
        return json.result;
    } catch (e) {
        console.warn("[getStorageAt] fetch error", e);
        return null;
    }
};

export const getEffectiveMaxStakeAmount = async (forceRefresh = false) => {
    // Only use contract max stake amount
    const contractMaxStr = await getMaxStakeAmount(forceRefresh);
    
    // Apply Single Purchase Limit if enabled in environment (local config only)
    let effective = parseFloat(contractMaxStr);
    let winningLimit = "合约硬顶限制";

    if (ENABLE_SINGLE_PURCHASE_LIMIT) {
        let limitVal = SINGLE_PURCHASE_LIMIT;
        
        if (limitVal < effective) {
            effective = limitVal;
            winningLimit = `单笔购买限制 (${limitVal})`;
        }
    }
    
    console.log(`[最大额度调试] 最终生效限额: ${effective}, 限制来源: ${winningLimit}`);
    
    return effective.toString();
};

export const getMaxStakeAmount = async (forceRefresh = false) => {
  if (!stakingContract) return "0";
  return cachedCall('maxStakeAmount', async () => {
    try {
        const maxStake = await stakingContract.maxStakeAmount().call();
        const formatted = formatUnits(maxStake, getOskDecimals());
        console.log(`[合约参数] maxStakeAmount (合约硬顶): ${formatted}`);
        return formatted;
    } catch (error) {
        return "0";
    }
  }, CACHE_TTL, forceRefresh);
};

export const rewardOfSlot = async (id) => {
    if (!stakingContract) return 0n;
    try {
        const res = await stakingContract.rewardOfSlot(walletState.address, id).call();
        return BigInt(res.toString());
    } catch (error) {
        return 0n;
    }
};
