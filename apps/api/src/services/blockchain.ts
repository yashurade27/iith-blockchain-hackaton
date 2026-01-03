import { ethers } from 'ethers';
import { logger } from '../utils/logger';

const TOKEN_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function transfer(address to, uint256 amount) returns (bool)',
];

const DISTRIBUTOR_ABI = [
  'function distributeTokens(address to, uint256 amount, string activityType, string description)',
  'function batchDistribute(address[] recipients, uint256[] amounts, string[] descriptions)',
];

const MARKETPLACE_ABI = [
  'function redeemTokens(string rewardId, uint256 tokenAmount, uint256 quantity)',
];

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

const tokenContract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS!,
  TOKEN_ABI,
  provider
);

const distributorContract = new ethers.Contract(
  process.env.DISTRIBUTOR_ADDRESS!,
  DISTRIBUTOR_ABI,
  wallet
);

const marketplaceContract = new ethers.Contract(
  process.env.MARKETPLACE_ADDRESS!,
  MARKETPLACE_ABI,
  provider
);

export async function getTokenBalance(address: string): Promise<{ balance: string; formatted: string }> {
  try {
    const balance = await tokenContract.balanceOf(address);
    const decimals = await tokenContract.decimals();
    const formatted = ethers.formatUnits(balance, decimals);
    
    return {
      balance: balance.toString(),
      formatted,
    };
  } catch (error) {
    logger.error(`Failed to get token balance for ${address}:`, error);
    throw error;
  }
}

export async function distributeTokens(
  address: string,
  amount: number,
  activityType: string,
  description: string
): Promise<string> {
  try {
    const decimals = await tokenContract.decimals();
    const tokenAmount = ethers.parseUnits(amount.toString(), decimals);

    const tx = await distributorContract.distributeTokens(
      address,
      tokenAmount,
      activityType,
      description
    );

    logger.info(`Distribution transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    logger.info(`Distribution confirmed in block ${receipt.blockNumber}`);

    return tx.hash;
  } catch (error) {
    logger.error('Failed to distribute tokens:', error);
    throw error;
  }
}

export async function batchDistributeTokens(
  recipients: string[],
  amounts: number[],
  descriptions: string[]
): Promise<string> {
  try {
    const decimals = await tokenContract.decimals();
    const tokenAmounts = amounts.map((amount) => ethers.parseUnits(amount.toString(), decimals));

    const tx = await distributorContract.batchDistribute(recipients, tokenAmounts, descriptions);

    logger.info(`Batch distribution transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    logger.info(`Batch distribution confirmed in block ${receipt.blockNumber}`);

    return tx.hash;
  } catch (error) {
    logger.error('Failed to batch distribute tokens:', error);
    throw error;
  }
}

export async function redeemTokens(
  userAddress: string,
  rewardId: string,
  tokenAmount: number,
  quantity: number
): Promise<string> {
  try {
    const decimals = await tokenContract.decimals();
    const amount = ethers.parseUnits(tokenAmount.toString(), decimals);

    // User needs to call this from frontend, so we return the transaction data
    // For now, we'll simulate it by having the backend call it
    const userWallet = wallet; // In production, this should be signed by user
    const marketplaceWithSigner = marketplaceContract.connect(userWallet);

    const tx = await marketplaceWithSigner.redeemTokens(rewardId, amount, quantity);

    logger.info(`Redemption transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    logger.info(`Redemption confirmed in block ${receipt.blockNumber}`);

    return tx.hash;
  } catch (error) {
    logger.error('Failed to redeem tokens:', error);
    throw error;
  }
}
