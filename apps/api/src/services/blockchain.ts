import { ethers } from 'ethers';
import { logger } from '../utils/logger';

const TOKEN_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event TokensMinted(address indexed to, uint256 amount, string reason)',
  'event TokensBurned(address indexed from, uint256 amount, string reason)',
];

const DISTRIBUTOR_ABI = [
  'function distributeTokens(address to, uint256 amount, string activityType, string description)',
  'function batchDistribute(address[] recipients, uint256[] amounts, string[] descriptions)',
  'event TokensDistributed(address indexed to, uint256 amount, string activityType, string description, uint256 timestamp)',
  'event BatchDistributionCompleted(uint256 totalRecipients, uint256 totalAmount, uint256 timestamp)',
];

const MARKETPLACE_ABI = [
  'function redeemTokens(string rewardId, uint256 tokenAmount, uint256 quantity)',
  'event TokensRedeemed(address indexed user, string rewardId, uint256 tokenAmount, uint256 quantity, uint256 timestamp)',
  'event RedemptionVerified(address indexed user, string rewardId, string redemptionId, uint256 timestamp)',
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

    // Create a new contract instance with signer for this transaction
    const marketplaceWithSigner = new ethers.Contract(
      process.env.MARKETPLACE_ADDRESS!,
      MARKETPLACE_ABI,
      wallet
    );

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

// Transaction Monitoring Functions

export interface TransactionEvent {
  hash: string;
  blockNumber: number;
  timestamp: number;
  from: string;
  to: string;
  value: string;
  formattedValue: string;
  type: 'transfer' | 'distribution' | 'redemption';
  metadata?: any;
}

export async function getTransactionHistory(
  address: string,
  fromBlock: number = 0,
  toBlock: 'latest' | number = 'latest'
): Promise<TransactionEvent[]> {
  try {
    const events: TransactionEvent[] = [];

    // Get Transfer events (token transfers)
    const transferFilter = tokenContract.filters.Transfer(null, address);
    const transferEvents = await tokenContract.queryFilter(transferFilter, fromBlock, toBlock);

    for (const event of transferEvents) {
      const eventLog = event as ethers.EventLog;
      const block = await provider.getBlock(event.blockNumber);
      const decimals = await tokenContract.decimals();

      events.push({
        hash: event.transactionHash,
        blockNumber: event.blockNumber,
        timestamp: block?.timestamp || 0,
        from: eventLog.args?.[0] || '',
        to: eventLog.args?.[1] || '',
        value: eventLog.args?.[2]?.toString() || '0',
        formattedValue: ethers.formatUnits(eventLog.args?.[2] || 0, decimals),
        type: 'transfer',
      });
    }

    // Get incoming Transfer events (transfers to address)
    const incomingTransferFilter = tokenContract.filters.Transfer(address);
    const incomingTransferEvents = await tokenContract.queryFilter(incomingTransferFilter, fromBlock, toBlock);

    for (const event of incomingTransferEvents) {
      if (event.transactionHash && !events.find(e => e.hash === event.transactionHash)) {
        const eventLog = event as ethers.EventLog;
        const block = await provider.getBlock(event.blockNumber);
        const decimals = await tokenContract.decimals();

        events.push({
          hash: event.transactionHash,
          blockNumber: event.blockNumber,
          timestamp: block?.timestamp || 0,
          from: eventLog.args?.[0] || '',
          to: eventLog.args?.[1] || '',
          value: eventLog.args?.[2]?.toString() || '0',
          formattedValue: ethers.formatUnits(eventLog.args?.[2] || 0, decimals),
          type: 'transfer',
        });
      }
    }

    // Get distribution events for this address
    const distributionFilter = distributorContract.filters.TokensDistributed(address);
    const distributionEvents = await distributorContract.queryFilter(distributionFilter, fromBlock, toBlock);

    for (const event of distributionEvents) {
      const eventLog = event as ethers.EventLog;
      const block = await provider.getBlock(event.blockNumber);
      const decimals = await tokenContract.decimals();

      events.push({
        hash: event.transactionHash,
        blockNumber: event.blockNumber,
        timestamp: block?.timestamp || 0,
        from: '0x0000000000000000000000000000000000000000', // Minted
        to: eventLog.args?.[0] || '',
        value: eventLog.args?.[1]?.toString() || '0',
        formattedValue: ethers.formatUnits(eventLog.args?.[1] || 0, decimals),
        type: 'distribution',
        metadata: {
          activityType: eventLog.args?.[2] || '',
          description: eventLog.args?.[3] || '',
        },
      });
    }

    // Get redemption events for this address
    const redemptionFilter = marketplaceContract.filters.TokensRedeemed(address);
    const redemptionEvents = await marketplaceContract.queryFilter(redemptionFilter, fromBlock, toBlock);

    for (const event of redemptionEvents) {
      const eventLog = event as ethers.EventLog;
      const block = await provider.getBlock(event.blockNumber);
      const decimals = await tokenContract.decimals();

      events.push({
        hash: event.transactionHash,
        blockNumber: event.blockNumber,
        timestamp: block?.timestamp || 0,
        from: eventLog.args?.[0] || '',
        to: '0x0000000000000000000000000000000000000000', // Burned
        value: eventLog.args?.[2]?.toString() || '0',
        formattedValue: ethers.formatUnits(eventLog.args?.[2] || 0, decimals),
        type: 'redemption',
        metadata: {
          rewardId: eventLog.args?.[1] || '',
          quantity: eventLog.args?.[3]?.toString() || '0',
        },
      });
    }

    // Sort by timestamp descending (newest first)
    return events.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    logger.error(`Failed to get transaction history for ${address}:`, error);
    throw error;
  }
}

export async function monitorTokenTransfers(
  address: string,
  callback: (event: TransactionEvent) => void
): Promise<() => void> {
  try {
    // Listen for incoming transfers
    const incomingFilter = tokenContract.filters.Transfer(null, address);
    const outgoingFilter = tokenContract.filters.Transfer(address);

    const handleTransfer = async (from: string, to: string, value: bigint, event: any) => {
      const block = await provider.getBlock(event.blockNumber);
      const decimals = await tokenContract.decimals();

      const txEvent: TransactionEvent = {
        hash: event.transactionHash,
        blockNumber: event.blockNumber,
        timestamp: block?.timestamp || 0,
        from,
        to,
        value: value.toString(),
        formattedValue: ethers.formatUnits(value, decimals),
        type: 'transfer',
      };

      callback(txEvent);
    };

    tokenContract.on(incomingFilter, handleTransfer);
    tokenContract.on(outgoingFilter, handleTransfer);

    // Return cleanup function
    return () => {
      tokenContract.off(incomingFilter, handleTransfer);
      tokenContract.off(outgoingFilter, handleTransfer);
    };
  } catch (error) {
    logger.error(`Failed to setup transfer monitoring for ${address}:`, error);
    throw error;
  }
}

export async function monitorDistributions(
  callback: (event: TransactionEvent) => void
): Promise<() => void> {
  try {
    const handleDistribution = async (to: string, amount: bigint, activityType: string, description: string, timestamp: number, event: any) => {
      const block = await provider.getBlock(event.blockNumber);
      const decimals = await tokenContract.decimals();

      const txEvent: TransactionEvent = {
        hash: event.transactionHash,
        blockNumber: event.blockNumber,
        timestamp: block?.timestamp || 0,
        from: '0x0000000000000000000000000000000000000000',
        to,
        value: amount.toString(),
        formattedValue: ethers.formatUnits(amount, decimals),
        type: 'distribution',
        metadata: { activityType, description },
      };

      callback(txEvent);
    };

    distributorContract.on('TokensDistributed', handleDistribution);

    return () => {
      distributorContract.off('TokensDistributed', handleDistribution);
    };
  } catch (error) {
    logger.error('Failed to setup distribution monitoring:', error);
    throw error;
  }
}

export async function monitorRedemptions(
  callback: (event: TransactionEvent) => void
): Promise<() => void> {
  try {
    const handleRedemption = async (user: string, rewardId: string, tokenAmount: bigint, quantity: bigint, timestamp: number, event: any) => {
      const block = await provider.getBlock(event.blockNumber);
      const decimals = await tokenContract.decimals();

      const txEvent: TransactionEvent = {
        hash: event.transactionHash,
        blockNumber: event.blockNumber,
        timestamp: block?.timestamp || 0,
        from: user,
        to: '0x0000000000000000000000000000000000000000',
        value: tokenAmount.toString(),
        formattedValue: ethers.formatUnits(tokenAmount, decimals),
        type: 'redemption',
        metadata: { rewardId, quantity: quantity.toString() },
      };

      callback(txEvent);
    };

    marketplaceContract.on('TokensRedeemed', handleRedemption);

    return () => {
      marketplaceContract.off('TokensRedeemed', handleRedemption);
    };
  } catch (error) {
    logger.error('Failed to setup redemption monitoring:', error);
    throw error;
  }
}
