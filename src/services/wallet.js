import { reactive, markRaw } from 'vue';
// ethers is removed
import { APP_ENV } from './environment';
import {
  initializeContracts,
  resetContracts,
  checkIfUserHasReferrer
} from './contracts';
import { showToast } from './notification';
import { t } from '../i18n';

// --- Tron Network Configurations ---
const networks = {
  tronMainnet: {
    chainId: '0x2b6653dc', // Tron Mainnet ChainID (hex) - though Tron uses URLs mostly
    networkName: 'Tron Mainnet',
    fullNode: 'https://api.trongrid.io',
    solidityNode: 'https://api.trongrid.io',
    eventServer: 'https://api.trongrid.io',
    blockExplorer: 'https://tronscan.org'
  },
  tronNile: {
    chainId: '0xcd8690dc', // Nile ChainID
    networkName: 'Tron Nile Testnet',
    fullNode: 'https://nile.trongrid.io',
    solidityNode: 'https://nile.trongrid.io',
    eventServer: 'https://nile.trongrid.io',
    blockExplorer: 'https://nile.tronscan.org'
  }
};
// --- End of Network Configurations ---


// Reactive state for wallet information
export const walletState = reactive({
  isConnected: false,
  isAuthenticated: false,
  address: null,
  network: null, // To store the network name
  chainId: null, // To store the chain ID or Host
  // signer: null, // TronWeb doesn't separate signer like ethers, we use window.tronWeb
  walletType: null, // To store the type of the connected wallet
  isNewUser: null, // null: unknown, true: new, false: old
  contractsInitialized: false,
  hasClaimableRewards: false,
});

// Utility function to format wallet address (Tron addresses are longer)
export const formatAddress = (address) => {
  if (!address || address.length < 11) {
    return 'Invalid Address';
  }
  // Tron addresses start with T, show first 4 and last 4
  return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
};

// Authentication function for Tron
const authenticateWallet = async (address) => {
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
    // Tron signature message must be hex string usually for some wallets, 
    // but tronWeb.trx.signMessage supports string in recent versions. 
    // To be safe and compatible with standard Tron dApps:
    const message = "Welcome to the OSP platform. Please sign this message to verify your wallet.";
    const hexMessage = window.tronWeb.toHex(message);
    
    // Request signature
    const signature = await window.tronWeb.trx.sign(hexMessage);

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
// Tron wallets (like TronLink) often don't support programmatic switching as easily as MetaMask.
// We will check the node and prompt the user.
const checkAndSwitchNetwork = async () => {
  const targetNetwork = APP_ENV === 'PROD' ? networks.tronMainnet : networks.tronNile;
  
  // If fullNode info is missing, we assume it's correct or the wallet handles it.
  // Returning false here would block connection for wallets that don't expose node info.
  if (!window.tronWeb || !window.tronWeb.fullNode || !window.tronWeb.fullNode.host) {
    console.warn("Could not detect Tron network host. Proceeding with connection anyway.");
    return true; 
  }

  const currentHost = window.tronWeb.fullNode.host;
  console.log(`Current Tron Host: ${currentHost}, Target: ${targetNetwork.fullNode}`);

  // Simple check if the host URL contains the target keyword (e.g. 'nile' or 'api')
  // Note: TronLink might return different host strings depending on version.
  const isMatch = currentHost.includes(targetNetwork.fullNode) || 
                  (APP_ENV === 'PROD' && !currentHost.includes('nile') && !currentHost.includes('shasta')) ||
                  (APP_ENV !== 'PROD' && currentHost.includes('nile'));

  if (!isMatch) {
    console.log("Network mismatch detected.");
    
    // Try to request switch for TronLink
    if (window.tronLink && window.tronLink.request) {
        try {
            await window.tronLink.request({
                method: 'tron_requestAccounts',
                params: {
                    websiteIcon: window.location.origin + '/favicon.ico',
                    websiteName: 'OSP Platform',
                },
            });
            // TronLink doesn't have a standard "switch_chain" method widely supported yet like EIP-3326
            // Some versions support it, but it's flaky. 
            // Best approach: Alert the user.
            alert(`Incorrect network! Please open your wallet and switch to ${targetNetwork.networkName}.`);
            return false; 
        } catch (e) {
            console.error("Error requesting wallet access:", e);
        }
    }
    
    alert(`Please switch your wallet network to ${targetNetwork.networkName} (${targetNetwork.fullNode}) to continue.`);
    return false;
  }
  
  return true;
};


// Main function to connect to a wallet
export const connectWallet = async (walletType) => {
  try {
    // --- Step 1: Request Access (Earliest time possible) ---
    // This ensures complete TronWeb injection per TronLink recommendation
    if (window.tronLink && window.tronLink.request) {
        console.log("Requesting accounts early to ensure TronLink injection...");
        const res = await window.tronLink.request({ method: 'tron_requestAccounts' });
        if (res.code === 4001) {
            console.log("User rejected connection");
            return false;
        }
    }

    // --- Step 2: Detect Tron Provider ---
    let tronProvider = null;

    // Wait for a brief moment for injection (sometimes TronLink is slow)
    if (!window.tronWeb) {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (walletType === 'tronlink') {
         if (window.tronLink) {
             tronProvider = window.tronLink;
         }
    } else if (walletType === 'okx') {
        // OKX sometimes provides isolation, but usually overrides global
        if (window.okxwallet && window.okxwallet.tron) {
             // If OKX exposes a specific isolated tron provider (rare/experimental)
             tronProvider = window.okxwallet.tron;
        } else if (window.tronLink && window.tronLink.isOkxWallet) {
             tronProvider = window.tronLink;
        }
    } 
    
    // Fallback to generic detection if specific failed or for other types
    if (!tronProvider) {
         if (window.tronLink) {
             tronProvider = window.tronLink;
         } else if (window.tronWeb) {
             tronProvider = window.tronWeb;
         }
    }

    if (!tronProvider && !window.tronWeb) {
        alert('Tron wallet not detected! Please install TronLink, OKX Wallet, or TokenPocket.');
        return false;
    }

    // Force usage of TronGrid API Key to avoid 429 errors
    if (window.tronWeb) {
        try {
            window.tronWeb.setHeader({ "TRON-PRO-API-KEY": '95bf6fc6-2f62-4821-bf40-b5427d479f2a' });
            console.log("TronGrid API Key set successfully.");
        } catch (e) {
            console.warn("Failed to set TronGrid API Key header:", e);
        }
    }

    // --- Step 3: Check Network ---
    // Ensure window.tronWeb is ready (sometimes it takes a ms after requestAccounts)
    if (!window.tronWeb || !window.tronWeb.defaultAddress.base58) {
        // Wait loop
        let attempts = 0;
        while ((!window.tronWeb || !window.tronWeb.defaultAddress.base58) && attempts < 10) {
            await new Promise(r => setTimeout(r, 200));
            attempts++;
        }
        if (!window.tronWeb || !window.tronWeb.defaultAddress.base58) {
            alert("Could not retrieve Tron address. Please unlock your wallet.");
            return false;
        }
    }

    const networkCorrect = await checkAndSwitchNetwork();
    if (!networkCorrect) {
        return false;
    }

    const address = window.tronWeb.defaultAddress.base58;
    
    if (!address) {
        console.log('No accounts found');
        return false;
    }
    
    // 4. Authenticate wallet
    const isAuthenticated = await authenticateWallet(address);

    if (!isAuthenticated) {
      return false;
    }

    // 5. Update the global state
    walletState.isConnected = true;
    walletState.address = address;
    walletState.chainId = 0; // Tron doesn't use chainId same way, placeholder
    walletState.network = APP_ENV === 'PROD' ? 'Tron Mainnet' : 'Tron Nile';
    walletState.walletType = walletType;

    // Save address to localStorage for auto-reconnect
    localStorage.setItem('osp_walletAddress', address);
    localStorage.setItem('osp_walletType', walletType);

    // --- Initialize Contracts ---
    // Note: contracts.js must be updated to use tronWeb
    await initializeContracts(); 
    // --------------------------

    // FINAL STEP: Setup listeners
    setupWalletListeners();

    // Check referrer
    const hasReferrer = await checkIfUserHasReferrer();
    walletState.isNewUser = !hasReferrer;

    console.log(`Successfully connected to ${walletType} with address:`, walletState.address);

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
  // walletState.signer = null; 
  walletState.walletType = null;
  walletState.isNewUser = null; 
  walletState.hasClaimableRewards = false;
  
  localStorage.removeItem('osp_walletAddress');
  localStorage.removeItem('osp_walletType');
  
  if (address) {
    const authTokenKey = `osp_authToken_${address}`;
    localStorage.removeItem(authTokenKey); 
  }

  // TronLink doesn't have a standardized "removeListener" for message events in the same way
  // But we can stop listening to window messages if we implemented that.
  console.log('Wallet disconnected.');
};

// Function to automatically connect if previously connected
export const autoConnectWallet = async () => {
  // Try to wake up TronLink immediately if we expect a connection
  // This helps ensure TronWeb is injected early per recommendation
  const savedAddress = localStorage.getItem('osp_walletAddress');
  if (savedAddress && window.tronLink && window.tronLink.request) {
      window.tronLink.request({ method: 'tron_requestAccounts' }).catch(e => {
          // Ignore errors here, connectWallet will handle them
          console.debug("Auto-connect wake up request check:", e);
      });
  }

  setTimeout(async () => {
    const savedAddress = localStorage.getItem('osp_walletAddress');
    const savedWalletType = localStorage.getItem('osp_walletType');
    
    // Check global tronWeb
    if (savedAddress && savedWalletType && (window.tronWeb || window.tronLink)) {
          console.log(`Attempting to auto-connect with ${savedWalletType}...`);
          await connectWallet(savedWalletType);
    }
  }, 1000); // Give TronLink more time to inject
};

// --- Wallet Event Listeners ---
// Tron uses window messages for events
export const setupWalletListeners = () => {
    window.addEventListener('message', function (e) {
        if (e.data.message && e.data.message.action == "setAccount") {
            console.log("setAccount event", e.data.message);
            handleAccountsChanged(window.tronWeb.defaultAddress.base58);
        }
        if (e.data.message && e.data.message.action == "setNode") {
            console.log("setNode event", e.data.message);
            window.location.reload(); // Reload on network change is safest
        }
    });
};

const handleAccountsChanged = async (newAddress) => {
    if (!walletState.isConnected) return;
    
    if (newAddress === walletState.address) return;

    // If address is false/null, it means locked or disconnected
    if (!newAddress) {
        disconnectWallet();
        return;
    }

    console.log(`Switched to new address: ${newAddress}`);
    walletState.isAuthenticated = false;
    walletState.contractsInitialized = false;
    localStorage.removeItem(`osp_authToken_${walletState.address}`);
    walletState.address = newAddress;

    const reauthSuccess = await authenticateWallet(newAddress);

    if (reauthSuccess) {
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
  
  // 1. TronLink (Strict Check)
  if (window.tronLink) {
      wallets.push({ id: 'tronlink', name: 'TronLink' });
  }

  // 2. OKX Wallet
  if (window.okxwallet || window.okexchain) {
      wallets.push({ id: 'okx', name: 'OKX Wallet' });
  }

  // 3. TokenPocket
  if (window.tokenpocket) {
      wallets.push({ id: 'tokenpocket', name: 'TokenPocket' });
  }

  // 4. Binance Wallet
  if (window.binancew3w) {
      wallets.push({ id: 'binance', name: 'Binance Wallet' }); 
  }
  
  return wallets;
};
