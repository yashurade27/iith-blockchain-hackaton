// User types
export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum TransactionType {
  EARN = 'EARN',
  REDEEM = 'REDEEM',
  TRANSFER = 'TRANSFER',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum ActivityType {
  CONTEST_PARTICIPATION = 'CONTEST_PARTICIPATION',
  EVENT_ATTENDANCE = 'EVENT_ATTENDANCE',
  WORKSHOP_COMPLETION = 'WORKSHOP_COMPLETION',
  CONTENT_CREATION = 'CONTENT_CREATION',
  VOLUNTEERING = 'VOLUNTEERING',
}

export enum RedemptionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  FULFILLED = 'FULFILLED',
  CANCELLED = 'CANCELLED',
}

export interface User {
  id: string;
  walletAddress: string;
  email?: string;
  name?: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  description: string;
  txHash?: string;
  status: TransactionStatus;
  createdAt: Date;
  user?: User;
}

export interface Activity {
  id: string;
  userId: string;
  type: ActivityType;
  points: number;
  metadata?: Record<string, any>;
  verifiedAt?: Date;
  createdAt: Date;
  user?: User;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  stock: number;
  imageUrl?: string;
  category: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Redemption {
  id: string;
  userId: string;
  rewardId: string;
  quantity: number;
  status: RedemptionStatus;
  txHash?: string;
  createdAt: Date;
  user?: User;
  reward?: Reward;
}

// API Request/Response types
export interface ConnectWalletRequest {
  walletAddress: string;
  signature?: string;
}

export interface ConnectWalletResponse {
  user: User;
  token: string;
}

export interface LeaderboardQuery {
  timeframe?: 'all' | 'month' | 'week';
  category?: ActivityType | 'all';
  page?: number;
  limit?: number;
}

export interface LeaderboardEntry {
  rank: number;
  user: Pick<User, 'id' | 'walletAddress' | 'name'>;
  totalTokens: number;
  totalActivities: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total: number;
  page: number;
  limit: number;
}

export interface RedeemRequest {
  rewardId: string;
  quantity: number;
}

export interface DistributeTokensRequest {
  walletAddress: string;
  amount: number;
  activityType: ActivityType;
  description: string;
  metadata?: Record<string, any>;
}

export interface BatchDistributeRequest {
  distributions: Array<{
    walletAddress: string;
    amount: number;
    description: string;
  }>;
}

export interface VerifyActivityRequest {
  userId: string;
  activityId: string;
}

export interface UpdateRedemptionRequest {
  status: RedemptionStatus;
}

// Blockchain types
export interface TokenBalance {
  balance: string;
  formatted: string;
}

export interface TransactionReceipt {
  hash: string;
  blockNumber: number;
  status: number;
  gasUsed: string;
}

// Wallet types
export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

// API Error type
export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}
