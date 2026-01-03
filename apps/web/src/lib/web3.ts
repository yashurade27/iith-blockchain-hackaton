import { ethers } from 'ethers';

export const CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID || '11155111');
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
export const DISTRIBUTOR_ADDRESS = import.meta.env.VITE_DISTRIBUTOR_ADDRESS;
export const MARKETPLACE_ADDRESS = import.meta.env.VITE_MARKETPLACE_ADDRESS;

export const TOKEN_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
];

export const MARKETPLACE_ABI = [
  'function redeemTokens(string rewardId, uint256 tokenAmount, uint256 quantity)',
  'event TokensRedeemed(address indexed user, string rewardId, uint256 tokenAmount, uint256 quantity, uint256 timestamp)',
];

export async function getProvider() {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask not installed');
  }
  return new ethers.BrowserProvider(window.ethereum);
}

export async function getSigner() {
  const provider = await getProvider();
  return provider.getSigner();
}

export async function getTokenContract() {
  const provider = await getProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, TOKEN_ABI, provider);
}

export async function getMarketplaceContract() {
  const signer = await getSigner();
  return new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);
}

export async function switchToCorrectNetwork() {
  if (typeof window.ethereum === 'undefined') return;

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
    });
  } catch (error: any) {
    if (error.code === 4902) {
      // Network not added, add it
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: `0x${CHAIN_ID.toString(16)}`,
            chainName: 'Sepolia Testnet',
            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://sepolia.infura.io/v3/'],
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
          },
        ],
      });
    }
  }
}
