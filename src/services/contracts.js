import { walletState } from './wallet';
import { APP_ENV, ENABLE_SINGLE_PURCHASE_LIMIT, SINGLE_PURCHASE_LIMIT } from './environment';
import { toRaw } from 'vue';
import { showToast } from '../services/notification';
import { t } from '../i18n';
import { ethers } from 'ethers';

// --- Helper to get OSK decimals based on environment ---
// BSC OSK likely uses 18 decimals
export const getOskDecimals = () => {
  return 18;
};

// --- Cache System ---
const callCache = new Map();
const CACHE_TTL = 60000; // 60 seconds
const SHORT_CACHE_TTL = 15000; // 15 seconds

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
        // Add a small delay between batches to avoid rate limiting
        if (i + batchSize < items.length) {
            await sleep(500); 
        }
    }
    return results;
};

export const formatUnits = (value, decimals) => {
    if (!value) return "0";
    try {
        return ethers.formatUnits(value, decimals);
    } catch (e) {
        console.warn("formatUnits error", e);
        return "0";
    }
};

export const parseUnits = (value, decimals) => {
    if (!value) return "0";
    try {
        return ethers.parseUnits(value.toString(), decimals).toString();
    } catch (e) {
        console.warn("parseUnits error", e);
        return "0";
    }
};

// --- Import ABIs ---
import referralAbi from '../abis/referral.json';
import stakingAbiTest from '../abis/staking_test.json';
import stakingAbiMain from '../abis/staking_main.json';
import ospAbi from '../abis/osp.json';
import oskAbi from '../abis/osk.json';
import s5poolAbi from '../abis/s5pool.json';
import s6poolAbi from '../abis/s6pool.json';
import s7poolAbi from '../abis/s7pool.json';
import nodePoolAbi from '../abis/node_pool.json';
import nodeDividendPoolAbi from '../abis/node_dividend_pool.json';
import routerAbi from '../abis/router.json';

// Select staking ABI based on environment
const stakingAbi = APP_ENV === 'PROD' ? stakingAbiMain : stakingAbiTest;

// --- Contract Addresses ---
// TODO: Update these to BSC addresses
const contractAddresses = {
  referral: {
    production: '0x0000000000000000000000000000000000000000', 
    development: '0x0D2B539D053370fA0e87fE16B159a1275523Cfad',
  },
  staking: {
    production: '0x0000000000000000000000000000000000000000', 
    development: '0x08D53d6c0514AE7735F693D9fcF8AD9d49453749',
  },
  osp: {
    production: '0x0000000000000000000000000000000000000000', 
    development: '0xfcc3229a8cbad0f92408282e221DeF1D7a37974a',
  },
  osk: {
    production: '0xD98492fdc4b1853051dc251638ddA05FD2Ea0788', 
    development: '0x598ebe75B49c9bd79230673d38FF7F581DCD1AeE',
  },
  router: {
    production: '0x10ED43C718714eb63d5aA57B78B54704E256024E', // PancakeSwap Router?
    development: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1', 
  },
  s5pool: {
    production: '0x0000000000000000000000000000000000000000', 
    development: '0x09c046ba1957D3b9276E57892b599704EAEd2c7A',
  },
  s6pool: {
    production: '0x0000000000000000000000000000000000000000', 
    development: '0xF02622F050b60a3Ff8b54Bc89e3E9F5453A79835',
  },
  s7pool: {
    production: '0x0000000000000000000000000000000000000000', 
    development: '0x5D765523Ab881DC413151e8e333F015060DB8B88',
  },
  // s8pool no need in frontend
  lp: {
    production: '0x0000000000000000000000000000000000000000',
    development: '0xA8C18E845F4034eD68a9eabe604a2F4cdde6410A',
  },
  nodePool: {
    production: '0x0000000000000000000000000000000000000000',
    development: '0x64230522C489CA93C959d7473602cE7a88eFd8c3',
  },
  nodeDividendPool: {
    production: '0x0000000000000000000000000000000000000000',
    development: '0xAA391B130E911180ee8293525d81F3Fd35C20853',
  },
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

export { referralContract, stakingContract, ospContract, oskContract, s5poolContract, s6poolContract, s7poolContract, nodePoolContract, nodeDividendPoolContract };

// --- KPI Thresholds ---
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
 * Initializes all contract instances using Ethers
 */
export const initializeContracts = async () => {
  if (!walletState.isConnected || !walletState.signer) {
    console.warn("Cannot initialize contracts without connection/signer.");
    return;
  }

  const env = APP_ENV === 'PROD' ? 'production' : 'development';
  console.log(`Initializing contracts for ${env} environment (BSC).`);

  const initSafe = (address, name, abi) => {
      try {
          if (!address || address === '0x0000000000000000000000000000000000000000') {
              console.warn(`Skipping ${name} contract: Address not set`);
              return null;
          }
          // Handle ABI structure if needed (for router.json sometimes having nested 'abi' prop)
          let finalAbi = abi;
          if (!Array.isArray(abi) && abi.abi) {
             finalAbi = abi.abi;
          }
          return new ethers.Contract(address, finalAbi, walletState.signer);
      } catch (e) {
          console.error(`Failed to load ${name} contract:`, e);
          return null;
      }
  };

  referralContract = initSafe(contractAddresses.referral[env], 'referral', referralAbi);
  stakingContract = initSafe(contractAddresses.staking[env], 'staking', stakingAbi);
  ospContract = initSafe(contractAddresses.osp[env], 'osp', ospAbi);
  oskContract = initSafe(contractAddresses.osk[env], 'osk', oskAbi);
  routerContract = initSafe(contractAddresses.router[env], 'router', routerAbi); 
  s5poolContract = initSafe(contractAddresses.s5pool[env], 's5pool', s5poolAbi);
  s6poolContract = initSafe(contractAddresses.s6pool[env], 's6pool', s6poolAbi);
  s7poolContract = initSafe(contractAddresses.s7pool[env], 's7pool', s7poolAbi);
  nodePoolContract = initSafe(contractAddresses.nodePool[env], 'nodePool', nodePoolAbi);
  nodeDividendPoolContract = initSafe(contractAddresses.nodeDividendPool[env], 'nodeDividendPool', nodeDividendPoolAbi);

  walletState.contractsInitialized = true;
  console.log("[合约] 初始化流程结束");
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
  console.log("Contract instances have been reset.");
};

export const getTeamKpiBigNumber = async () => {
    if (!stakingContract || !walletState.address) return 0n;
    return cachedCall(`teamKpi_${walletState.address}`, async () => {
        try {
            const kpi = await stakingContract.getTeamKpi(walletState.address);
            return BigInt(kpi.toString());
        } catch (error) {
            console.error("Error fetching team KPI:", error);
            return 0n;
        }
    }, SHORT_CACHE_TTL);
};

export const getSelfStake = async () => {
  if (!stakingContract || !walletState.address) return 0n;
  return cachedCall(`selfStake_${walletState.address}`, async () => {
    try {
        const selfStake = await stakingContract.getSelfStake(walletState.address);
        return BigInt(selfStake.toString());
    } catch (error) {
        console.error("Error fetching self stake:", error);
        return 0n;
    }
  }, SHORT_CACHE_TTL);
};

export const getUserLevel = async () => {
    if (!stakingContract || !walletState.address) return 0;
    // Cache level to avoid frequent RPC calls if called multiple times
    return cachedCall(`userLevel_${walletState.address}`, async () => {
        try {
            const [kpi, selfStake] = await Promise.all([
                getTeamKpiBigNumber(),
                getSelfStake()
            ]);
            console.log(`[UserLevel Debug] Checking level for ${walletState.address}: KPI=${kpi}, SelfStake=${selfStake}`);
            const level = await stakingContract.getLevel(kpi, selfStake);
            console.log(`[UserLevel Debug] Result: Level ${level}`);
            return Number(level);
        } catch (error) {
            console.error("Error fetching user level:", error);
            return 0;
        }
    }, SHORT_CACHE_TTL);
};

export const getUserStakedBalance = async () => {
  if (!stakingContract || !walletState.address) return "0";
  return cachedCall(`userStakedBalance_${walletState.address}`, async () => {
      try {
        const totalValue = await stakingContract.balanceOf(walletState.address);
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
    const totalValue = await stakingContract.balanceOf(address);
    return formatUnits(totalValue, 18);
  } catch (error) {
    return "0";
  }
};

export const getFriendsBoost = async () => {
  if (!stakingContract || !walletState.address) return "0";
  try {
    const kpi = await stakingContract.getTeamKpi(walletState.address);
    return formatUnits(kpi, 18);
  } catch (error) {
    return "0";
  }
};

export const getTeamKpiByAddress = async (address) => {
  if (!stakingContract) return "0";
  try {
    const kpi = await stakingContract.getTeamKpi(address);
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
        const rewards = await poolContract.getTokenRewards(walletState.address, ospAddress);
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
            const rewards = await nodePoolContract.getTokenRewards(walletState.address);
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
        const tx = await poolContract.harvest(ospAddress);
        showToast(t('toast.txSent'));
        await tx.wait();
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
        const tx = await nodePoolContract.harvest();
        showToast(t('toast.txSent'));
        await tx.wait();
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
            const rewards = await nodeDividendPoolContract.getTokenRewards(walletState.address, oskAddress);
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
        const tx = await nodeDividendPoolContract.harvest(oskAddress);
        showToast(t('toast.txSent'));
        await tx.wait();
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
            return await stakingContract.isPreacher(walletState.address);
        } catch (error) {
            return false;
        }
    }, CACHE_TTL);
};

export const getUserPrincipalBalance = async () => {
  if (!stakingContract || !walletState.address) return "0";
  return cachedCall(`userPrincipal_${walletState.address}`, async () => {
      try {
        const principal = await stakingContract.balances(walletState.address);
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
    const count = await stakingContract.stakeCount(walletState.address);
    const stakeCount = Number(count);

    if (stakeCount === 0) return [];

    const indices = [];
    for (let i = stakeCount - 1; i >= 0; i--) {
      indices.push(i);
    }

    const fetchRecord = async (index) => {
         try {
             // Parallel fetch
             const [record, reward] = await Promise.all([
                 stakingContract.userStakeRecord(walletState.address, index),
                 stakingContract.rewardOfSlot(walletState.address, index)
             ]);
             return { record, reward, index };
         } catch (e) {
             console.error(`Error fetching stake ${index}`, e);
             return null; 
         }
    };

    const results = await batchPromises(indices, 2, fetchRecord);
    
    const validResults = results.filter(r => r !== null);
    
    const isDev = APP_ENV === 'test' || APP_ENV === 'dev';
    const stakeDurations = isDev 
      ? [420, 900, 1800, 2700] 
      : [604800, 1296000, 2592000, 3888000];

    const formattedData = validResults.map((item) => {
      // Ethers returns Result objects or arrays for structs
      // We need to access by property name if ABI has them, or index
      const record = item.record;
      const originalIndex = item.index;
      const totalValueRaw = item.reward;
      
      // Accessing struct properties (Ethers v5/v6 support .name if ABI has names)
      // Fallback to array indices if names missing
      const amount = record.amount || record[0];
      const stakeTime = record.stakeTime || record[1];
      const stakeIndex = record.stakeIndex || record[2]; // or whatever index
      const finalReward = record.finalReward || record.finalReward || record[4]; // Adjust based on ABI
      const status = record.status; // boolean

      // Convert to BigInt for calculations
      const amountBn = BigInt(amount.toString());
      const totalValueBn = BigInt(totalValueRaw.toString());
      const finalRewardBn = BigInt(finalReward.toString());

      let interestBn;
      if (status) { // Redeemed
        interestBn = finalRewardBn > 0n ? finalRewardBn - amountBn : 0n;
      } else {
        interestBn = totalValueBn > amountBn ? totalValueBn - amountBn : 0n;
      }

      const stakeTimeInSeconds = Number(stakeTime);
      const stakeIndexVal = Number(stakeIndex);
      const stakeDurationInSeconds = stakeDurations[stakeIndexVal] || 0;
      const expiryTimestamp = (stakeTimeInSeconds + stakeDurationInSeconds) * 1000;

      let displayStatus = 'waiting';
      if (status) {
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
    const tx = await stakingContract.unstake(id);
    showToast(t('toast.txSent'));
    await tx.wait();
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
    const hasReferrer = await referralContract.isBindReferral(walletState.address);
    return hasReferrer;
  } catch (error) {
    return false;
  }
};

export const getOskBalance = async () => {
  if (!oskContract || !walletState.address) return "0";
  return cachedCall(`oskBalance_${walletState.address}`, async () => {
      try {
        const balance = await oskContract.balanceOf(walletState.address);
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
        const reserves = await oskContract.balanceOf(lpAddress);
        return formatUnits(reserves, getOskDecimals());
    } catch (error) {
        return "0";
    }
  });
};

const getExpectedOSPAmount = async (oskAmountIn) => {
  if (!routerContract) return 0n;
  const env = APP_ENV === 'PROD' ? 'production' : 'development';
  const oskAddress = contractAddresses.osk[env];
  const ospAddress = contractAddresses.osp[env];

  try {
    // router.getAmountsOut(amountIn, [path])
    // returns BigInt[]: [amountIn, amountOut]
    const amountsOut = await routerContract.getAmountsOut(oskAmountIn, [oskAddress, ospAddress]);
    return amountsOut[1]; // Return the output amount
  } catch (error) {
    console.error("[Router Debug] getAmountsOut error:", error);
    return 0n;
  }
};

export const getOskAllowance = async () => {
  const env = APP_ENV === 'PROD' ? 'production' : 'development';
  const stakingAddress = contractAddresses.staking[env];
  if (!oskContract || !walletState.address || !stakingAddress) return "0";
  return cachedCall(`oskAllowance_${walletState.address}`, async () => {
      try {
        const allowance = await oskContract.allowance(walletState.address, stakingAddress);
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
    const tx = await oskContract.approve(stakingAddress, ethers.MaxUint256);
    await tx.wait();
    return true;
  } catch (error) {
    console.error("Approve error:", error);
    return false;
  }
};

export const getReferrer = async () => {
  if (!referralContract || !walletState.address) return null;
  try {
    const referrer = await referralContract.getReferral(walletState.address);
    if (referrer === ethers.ZeroAddress) return null;
    return referrer;
  } catch (error) {
    return null;
  }
};

export const getRootReferrer = async () => {
  if (!referralContract) return null;
  try {
    const root = await referralContract.getRootAddress();
    if (root === ethers.ZeroAddress) return null;
    return root;
  } catch (error) {
    return null;
  }
};

export const isReferrerValid = async (referrerAddress) => {
  if (!referralContract) return false;
  try {
    return await referralContract.isBindReferral(referrerAddress);
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
    const amountStr = parseUnits(amount, decimals); // string
    const amountInWei = BigInt(amountStr);

    // Slippage calc
    const expectedOSP = await getExpectedOSPAmount(amountInWei / 2n);

    let amountOutMin = 0n;
    if (expectedOSP > 0n) {
         amountOutMin = (expectedOSP * 90n) / 100n; // 10% slippage
    }

    const params = {
        amount: amountInWei,
        minOut: amountOutMin,
        index: Number(stakeIndex),
        parent: parentAddress
    };

    console.log("Staking Final Params:", params);

    const tx = await stakingContract.stakeWithInviter(
      params.amount,
      params.minOut,
      params.index,
      params.parent
    );
    showToast(t('toast.txSent'));
    await tx.wait();
    return { success: true };

  } catch (error) {
    console.error("Stake error:", error);
    let errorMessage = t('toast.stakeFailed');
    if (error && (error.code === 4001 || (error.message && error.message.includes("rejected")))) {
        return { success: false, cancelled: true };
    }
    if (error && error.reason) {
        errorMessage = error.reason;
    }
    return { success: false, error: errorMessage, rawError: error };
  }
};

export const getStorageAt = async (contractAddress, slotHex) => {
    try {
        if (!walletState.provider) return null;
        return await walletState.provider.getStorage(contractAddress, slotHex);
    } catch (e) {
        console.warn("[getStorageAt] error", e);
        return null;
    }
};

export const getEffectiveMaxStakeAmount = async (forceRefresh = false) => {
    // Only use contract max stake amount
    const contractMaxStr = await getMaxStakeAmount(forceRefresh);
    const decimals = getOskDecimals();
    
    // Convert contract max to BigInt for precise comparison
    let effectiveBn;
    try {
        effectiveBn = ethers.parseUnits(contractMaxStr, decimals);
    } catch (e) {
        console.warn("Error parsing max stake amount, defaulting to 0", e);
        return "0";
    }

    let winningLimit = "合约硬顶限制";
    let finalLimit = effectiveBn;

    if (ENABLE_SINGLE_PURCHASE_LIMIT) {
        try {
            // Convert limit to string first to handle decimals safely, then to BigInt
            const limitValStr = SINGLE_PURCHASE_LIMIT.toString();
            const limitBn = ethers.parseUnits(limitValStr, decimals);
            
            if (limitBn < effectiveBn) {
                finalLimit = limitBn;
                winningLimit = `单笔购买限制 (${limitValStr})`;
            }
        } catch (e) {
            console.error("Error processing single purchase limit:", e);
        }
    }
    
    const finalFormatted = formatUnits(finalLimit, decimals);
    
    console.log(`[最大质押额度]
      - 合约硬顶: ${contractMaxStr}
      - 单笔限制: ${ENABLE_SINGLE_PURCHASE_LIMIT ? SINGLE_PURCHASE_LIMIT : '未开启'}
      - 最终生效: ${finalFormatted} (${winningLimit})`);
    
    return finalFormatted;
};

export const getMaxStakeAmount = async (forceRefresh = false) => {
  if (!stakingContract) return "0";
  return cachedCall('maxStakeAmount', async () => {
    try {
        const maxStake = await stakingContract.maxStakeAmount();
        return formatUnits(maxStake, getOskDecimals());
    } catch (error) {
        return "0";
    }
  }, CACHE_TTL, forceRefresh);
};

export const rewardOfSlot = async (id) => {
    if (!stakingContract) return 0n;
    try {
        const res = await stakingContract.rewardOfSlot(walletState.address, id);
        return BigInt(res.toString());
    } catch (error) {
        return 0n;
    }
};

export const getMaxUnstakeAmount = async (forceRefresh = false) => {
  if (!stakingContract) return "0";
  return cachedCall('maxUnstakeAmount', async () => {
    try {
        const maxUnstake = await stakingContract.maxUnstakeAmount();
        return formatUnits(maxUnstake, getOskDecimals());
    } catch (error) {
        return "0";
    }
  }, CACHE_TTL, forceRefresh);
};

export const unstakePrincipalOnly = async (index) => {
  if (!stakingContract) return false;
  try {
    const tx = await stakingContract.unstakePrincipalOnly(index);
    showToast(t('toast.txSent'));
    await tx.wait();
    showToast(t('toast.redeemPrincipalSuccess'));
    return true;
  } catch (error) {
    console.error("Unstake Principal Only error:", error);
    let errorMsg = t('toast.unstakeFailed');
    if (error && error.reason) errorMsg = error.reason;
    showToast(errorMsg);
    return false;
  }
};

export const unstakeWithBonus = async (index, newAmount, newStakeIndex) => {
    if (!stakingContract) return false;
    try {
        const decimals = getOskDecimals();
        const amountStr = parseUnits(newAmount, decimals);
        const amountInWei = BigInt(amountStr);
        
        // Slippage calc
        const expectedOSP = await getExpectedOSPAmount(amountInWei / 2n);
        let amountOutMin = 0n;
        if (expectedOSP > 0n) {
             amountOutMin = (expectedOSP * 90n) / 100n; // 10% slippage
        }
        
        console.log(`[Reinvest Debug] unstakeWithBonus params:`, {
            index: index,
            amountInWei: amountInWei.toString(),
            amountDisplay: newAmount,
            amountOutMin: amountOutMin.toString(),
            newStakeIndex: newStakeIndex
        });

        const tx = await stakingContract.unstakeWithBonus(
            index,
            amountInWei,
            amountOutMin,
            newStakeIndex
        );
        
        showToast(t('toast.txSent'));
        await tx.wait();
        showToast(t('toast.reinvestSuccess'));
        return true;
    } catch (error) {
        console.error("Unstake With Bonus error:", error);
        let errorMsg = t('toast.unstakeFailed');
        if (error && error.reason) errorMsg = error.reason;
        showToast(errorMsg);
        return false;
    }
};
