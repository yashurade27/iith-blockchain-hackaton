import { ethers } from 'ethers';

// Network configuration
export const CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID || '11155111');
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
export const DISTRIBUTOR_ADDRESS = import.meta.env.VITE_DISTRIBUTOR_ADDRESS;
export const MARKETPLACE_ADDRESS = import.meta.env.VITE_MARKETPLACE_ADDRESS;

export const SEPOLIA_NETWORK = {
  chainId: 0xaa36a7, // 11155111 in hex
  chainIdDecimal: 11155111,
  name: 'Sepolia',
  rpcUrl: 'https://sepolia.infura.io/v3/0fc7a30cace3428c87b5418f8667db4f',
};

// Contract ABIs
export const TOKEN_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
];

export const DISTRIBUTOR_ABI = [
  'function distributeTokens(address to, uint256 amount, string activityType, string description)',
  'event TokensDistributed(address indexed to, uint256 amount, string activityType, string description, uint256 timestamp)',
];

export const MARKETPLACE_ABI = [
  'function redeemTokens(string rewardId, uint256 tokenAmount, uint256 quantity)',
  'event TokensRedeemed(address indexed user, string rewardId, uint256 tokenAmount, uint256 quantity, uint256 timestamp)',
];

/**
 * Check if MetaMask is installed and available
 */
export const isMetaMaskInstalled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return typeof (window as any).ethereum !== 'undefined';
};

/**
 * Get ethers provider instance
 */
export async function getProvider(): Promise<ethers.BrowserProvider> {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
  }
  return new ethers.BrowserProvider((window as any).ethereum);
}

/**
 * Get signer instance (requires user to be connected)
 */
export async function getSigner(): Promise<ethers.Signer> {
  const provider = await getProvider();
  return provider.getSigner();
}

/**
 * Get the currently connected account
 */
export async function getConnectedAccount(): Promise<string | null> {
  try {
    const signer = await getSigner();
    const address = await signer.getAddress();
    return address.toLowerCase();
  } catch (error) {
    console.error('Error getting connected account:', error);
    return null;
  }
}

/**
 * Request wallet connection from user
 */
export async function connectWallet(): Promise<string> {
  try {
    if (!isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }

    // Request account access
    const accounts = await (window as any).ethereum.request({
      method: 'eth_requestAccounts',
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts returned from MetaMask');
    }

    const account = accounts[0].toLowerCase();

    // Switch to Sepolia network
    await switchToCorrectNetwork();

    return account;
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
}

/**
 * Disconnect wallet (clears state, doesn't actually disconnect from MetaMask)
 */
export async function disconnectWallet(): Promise<void> {
  // MetaMask doesn't provide a disconnect method
  // The actual disconnect is handled in the Zustand store
  console.log('Wallet disconnected from application');
}

/**
 * Switch to Sepolia network
 */
export async function switchToCorrectNetwork(): Promise<void> {
  if (!isMetaMaskInstalled()) return;

  try {
    const chainIdHex = `0x${CHAIN_ID.toString(16)}`;

    // Try to switch to the chain
    await (window as any).ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    });
  } catch (error: any) {
    // Error code 4902 means the chain hasn't been added to MetaMask yet
    if (error.code === 4902) {
      try {
        const chainIdHex = `0x${CHAIN_ID.toString(16)}`;
        await (window as any).ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: chainIdHex,
              chainName: 'Sepolia Testnet',
              nativeCurrency: {
                name: 'Sepolia ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: [SEPOLIA_NETWORK.rpcUrl],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            },
          ],
        });
      } catch (addError) {
        console.error('Error adding Sepolia network:', addError);
        throw addError;
      }
    } else {
      console.error('Error switching to Sepolia:', error);
      throw error;
    }
  }
}

/**
 * Get the current network from MetaMask
 */
export async function getCurrentNetwork(): Promise<{ chainId: number; name: string } | null> {
  try {
    const provider = await getProvider();
    const network = await provider.getNetwork();
    return {
      chainId: Number(network.chainId),
      name: network.name,
    };
  } catch (error) {
    console.error('Error getting current network:', error);
    return null;
  }
}

/**
 * Check if connected to correct network (Sepolia)
 */
export async function isCorrectNetwork(): Promise<boolean> {
  try {
    const network = await getCurrentNetwork();
    return network?.chainId === CHAIN_ID;
  } catch (error) {
    console.error('Error checking network:', error);
    return false;
  }
}

/**
 * Get token balance for an address
 */
export async function getTokenBalance(address: string): Promise<{ balance: string; formatted: string }> {
  try {
    const provider = await getProvider();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, TOKEN_ABI, provider);
    const balance = await contract.balanceOf(address);
    const decimals = await contract.decimals();
    const formatted = ethers.formatUnits(balance, decimals);

    return {
      balance: balance.toString(),
      formatted: parseFloat(formatted).toFixed(2),
    };
  } catch (error) {
    console.error('Error getting token balance:', error);
    throw error;
  }
}

/**
 * Get token contract instance (read-only)
 */
export async function getTokenContract() {
  const provider = await getProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, TOKEN_ABI, provider);
}

/**
 * Get token contract instance with signer (for transactions)
 */
export async function getTokenContractWithSigner() {
  const signer = await getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, TOKEN_ABI, signer);
}

/**
 * Get distributor contract instance
 */
export async function getDistributorContract() {
  const signer = await getSigner();
  return new ethers.Contract(DISTRIBUTOR_ADDRESS, DISTRIBUTOR_ABI, signer);
}

/**
 * Get marketplace contract instance
 */
export async function getMarketplaceContract() {
  const signer = await getSigner();
  return new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);
}

/**
 * Format address for display (e.g., 0x1234...5678)
 */
export const formatAddress = (address: string, chars: number = 4): string => {
  if (!address) return '';
  return `${address.substring(0, chars + 2)}...${address.substring(42 - chars)}`;
};

/**
 * Validate Ethereum address
 */
export const isValidAddress = (address: string): boolean => {
  return ethers.isAddress(address);
};

/**
 * Setup listeners for MetaMask events
 */
export function setupMetaMaskListeners(
  onAccountChange: (accounts: string[]) => void,
  onChainChange: (chainId: string) => void
): () => void {
  if (!isMetaMaskInstalled()) {
    return () => {};
  }

  const ethereum = (window as any).ethereum;

  // Listen for account changes
  const accountHandler = (accounts: string[]) => {
    onAccountChange(accounts.map(a => a.toLowerCase()));
  };

  // Listen for chain changes
  const chainHandler = (chainId: string) => {
    onChainChange(chainId);
  };

  ethereum.on('accountsChanged', accountHandler);
  ethereum.on('chainChanged', chainHandler);

  // Return cleanup function
  return () => {
    ethereum.removeListener('accountsChanged', accountHandler);
    ethereum.removeListener('chainChanged', chainHandler);
  };
}
