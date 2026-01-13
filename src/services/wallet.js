import { reactive, markRaw } from 'vue';
import { ethers } from 'ethers';
import { APP_ENV } from './environment';
import {
  initializeContracts,
  resetContracts,
  checkIfUserHasReferrer
} from './contracts';
import { showToast } from './notification';
import { t } from '../i18n';

// --- BSC Network Configurations ---
const networks = {
  bscMainnet: {
    chainId: '0x38', // 56
    chainName: 'Binance Smart Chain',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    },
    rpcUrls: ['https://bsc-dataseed.binance.org/'],
    blockExplorerUrls: ['https://bscscan.com']
  },
  bscTestnet: {
    chainId: '0x61', // 97
    chainName: 'BSC Testnet',
    nativeCurrency: {
      name: 'tBNB',
      symbol: 'tBNB',
      decimals: 18
    },
    rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
    blockExplorerUrls: ['https://testnet.bscscan.com']
  }
};
// --- End of Network Configurations ---


// Reactive state for wallet information
export const walletState = reactive({
  isConnected: false,
  isAuthenticated: false,
  address: null,
  network: null, // To store the network name
  chainId: null, // To store the chain ID
  provider: null, // Ethers provider
  signer: null, // Ethers signer
  walletType: null, // To store the type of the connected wallet
  isNewUser: null, // null: unknown, true: new, false: old
  contractsInitialized: false,
  hasClaimableRewards: false,
});

// Utility function to format wallet address
export const formatAddress = (address) => {
  if (!address || address.length < 10) {
    return 'Invalid Address';
  }
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// Authentication function for EVM
const authenticateWallet = async (address, signer) => {
  const authTokenKey = `osp_authToken_${address}`;
  const storedToken = localStorage.getItem(authTokenKey);

  if (storedToken) {
    try {
      const token = JSON.parse(storedToken);
      if (token.signature) {
        console.log("Found valid auth token in storage.");
        walletState.isAuthenticated = true;
        return true;
      }
    } catch (e) {
      console.error("Error parsing auth token, removing it.", e);
      localStorage.removeItem(authTokenKey);
    }
  }

  try {
    const message = "Welcome to the OSP platform. Please sign this message to verify your wallet.";
    
    // Request signature
    const signature = await signer.signMessage(message);

    console.log("Signature successful.");
    const token = { signature };
    localStorage.setItem(authTokenKey, JSON.stringify(token));
    walletState.isAuthenticated = true;
    return true;
  } catch (error) {
    console.error('Failed to sign message:', error);
    walletState.isAuthenticated = false;
    return false;
  }
};

// --- Network Management Function ---
const checkAndSwitchNetwork = async (provider) => {
  const targetNetwork = APP_ENV === 'PROD' ? networks.bscMainnet : networks.bscTestnet;
  
  try {
    const network = await provider.getNetwork();
    const currentChainId = '0x' + network.chainId.toString(16);
    
    if (currentChainId === targetNetwork.chainId) {
      return true;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetNetwork.chainId }],
      });
      return true;
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [targetNetwork],
          });
          return true;
        } catch (addError) {
          console.error("Failed to add network:", addError);
          return false;
        }
      }
      console.error("Failed to switch network:", switchError);
      return false;
    }
  } catch (error) {
    console.error("Error checking network:", error);
    return false;
  }
};


// Main function to connect to a wallet
export const connectWallet = async (walletType) => {
  try {
    let providerObj = null;

    if (walletType === 'okx') {
      if (window.okxwallet) {
        providerObj = window.okxwallet;
      } else {
        alert('OKX Wallet not detected! Please install it.');
        return false;
      }
    } else if (walletType === 'tokenpocket') {
       // TokenPocket injects into window.ethereum usually, or window.tokenpocket
       // Prioritize window.ethereum if it matches TP, else check window.tokenpocket
       if (window.ethereum && window.ethereum.isTokenPocket) {
           providerObj = window.ethereum;
       } else if (window.ethereum) {
           // Fallback to standard ethereum
           providerObj = window.ethereum;
       } else {
           alert('TokenPocket not detected! Please install it.');
           return false;
       }
    } else {
      // Default / Metamask
      if (window.ethereum) {
        providerObj = window.ethereum;
      } else {
        alert('No EVM wallet detected!');
        return false;
      }
    }

    // Use BrowserProvider from ethers v6
    // If v5, use providers.Web3Provider
    // Assuming v6 as it is current
    const browserProvider = new ethers.BrowserProvider(providerObj);
    
    // Request accounts
    const accounts = await providerObj.request({ method: 'eth_requestAccounts' });
    if (!accounts || accounts.length === 0) {
        console.log("No accounts returned");
        return false;
    }
    const address = accounts[0];

    // Check Network
    const networkCorrect = await checkAndSwitchNetwork(browserProvider);
    if (!networkCorrect) {
        return false;
    }

    // Get Signer
    const signer = await browserProvider.getSigner();

    // Authenticate
    const isAuthenticated = await authenticateWallet(address, signer);
    if (!isAuthenticated) {
      return false;
    }

    // Update State
    walletState.isConnected = true;
    walletState.address = address;
    walletState.provider = browserProvider;
    walletState.signer = signer;
    walletState.walletType = walletType;
    walletState.network = APP_ENV === 'PROD' ? 'BSC Mainnet' : 'BSC Testnet';
    
    const network = await browserProvider.getNetwork();
    walletState.chainId = network.chainId;

    // Save to localStorage
    localStorage.setItem('osp_walletAddress', address);
    localStorage.setItem('osp_walletType', walletType);

    // Initialize Contracts
    await initializeContracts();

    // Listeners
    setupWalletListeners(providerObj);

    // Check Referrer
    const hasReferrer = await checkIfUserHasReferrer();
    walletState.isNewUser = !hasReferrer;

    console.log(`Successfully connected to ${walletType} with address:`, address);
    return true;

  } catch (error) {
    console.error('Failed to connect wallet:', error);
    alert(`Connection failed: ${error.message || 'An unexpected error occurred.'}`);
    return false;
  }
};

// Function to disconnect the wallet
export const disconnectWallet = () => {
  resetContracts();

  const address = walletState.address; 

  walletState.isConnected = false;
  walletState.isAuthenticated = false;
  walletState.contractsInitialized = false;
  walletState.address = null;
  walletState.network = null;
  walletState.chainId = null;
  walletState.provider = null;
  walletState.signer = null;
  walletState.walletType = null;
  walletState.isNewUser = null; 
  walletState.hasClaimableRewards = false;
  
  localStorage.removeItem('osp_walletAddress');
  localStorage.removeItem('osp_walletType');
  
  if (address) {
    const authTokenKey = `osp_authToken_${address}`;
    localStorage.removeItem(authTokenKey); 
  }

  console.log('Wallet disconnected.');
};

// Function to automatically connect if previously connected
export const autoConnectWallet = async () => {
    const savedAddress = localStorage.getItem('osp_walletAddress');
    const savedWalletType = localStorage.getItem('osp_walletType');
    
    if (savedAddress && savedWalletType && window.ethereum) {
          console.log(`Attempting to auto-connect with ${savedWalletType}...`);
          // We can't silently connect if not authorized, but eth_accounts might return something
          // However, better to just call connectWallet which handles requestAccounts (will be silent if already auth)
          await connectWallet(savedWalletType);
    }
};

// --- Wallet Event Listeners ---
export const setupWalletListeners = (providerObj) => {
    if (!providerObj || !providerObj.on) return;

    providerObj.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
            handleAccountsChanged(accounts[0]);
        } else {
            disconnectWallet();
        }
    });

    providerObj.on('chainChanged', () => {
        window.location.reload();
    });
};

const handleAccountsChanged = async (newAddress) => {
    if (!walletState.isConnected) return;
    if (newAddress.toLowerCase() === walletState.address.toLowerCase()) return;

    console.log(`Switched to new address: ${newAddress}`);
    // Re-auth logic similar to initial connect
    // For simplicity, we can just reload or re-run auth
    // Let's re-run partial connect
    walletState.address = newAddress;
    walletState.isAuthenticated = false;
    walletState.contractsInitialized = false;
    
    const authTokenKey = `osp_authToken_${walletState.address}`; // old address
    // The key depends on address, so we check new address
    
    const browserProvider = new ethers.BrowserProvider(window.ethereum); // Assume same provider
    const signer = await browserProvider.getSigner();

    const reauthSuccess = await authenticateWallet(newAddress, signer);

    if (reauthSuccess) {
        walletState.signer = signer;
        await initializeContracts();
        const hasReferrer = await checkIfUserHasReferrer();
        walletState.isNewUser = !hasReferrer;
    } else {
        disconnectWallet();
    }
};

// --- Wallet Detection Function ---
export const detectWallets = () => {
  const wallets = [];
  
  if (window.okxwallet) {
      wallets.push({ id: 'okx', name: 'OKX Wallet' });
  }

  // Check for TokenPocket (often just window.ethereum or window.tokenpocket)
  // Or generic injected
  if (window.ethereum) {
      if (window.ethereum.isTokenPocket) {
         wallets.push({ id: 'tokenpocket', name: 'TokenPocket' });
      }
      // Add a generic one or check logic
      if (!wallets.find(w => w.id === 'okx') && !wallets.find(w => w.id === 'tokenpocket')) {
         wallets.push({ id: 'metamask', name: 'MetaMask / Injected' });
      }
      
      // Explicitly allow TP selection if ethereum exists, even if not isTokenPocket flag (user might want to force it)
      if (!wallets.find(w => w.id === 'tokenpocket')) {
         wallets.push({ id: 'tokenpocket', name: 'TokenPocket' });
      }
  }
  
  return wallets;
};
