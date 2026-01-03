const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = `${API_URL}/api`;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async connectWallet(walletAddress: string) {
    return this.request<{ user: any; token: string }>('/auth/connect', {
      method: 'POST',
      body: JSON.stringify({ walletAddress }),
    });
  }

  async getMe() {
    return this.request<{ user: any }>('/auth/me');
  }

  // Users
  async getUserBalance(address: string) {
    return this.request<{ balance: string; formatted: string }>(`/users/${address}/balance`);
  }

  async getUser(address: string) {
    return this.request<{ user: any }>(`/users/${address}`);
  }

  // Leaderboard
  async getLeaderboard(params?: {
    timeframe?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{
      entries: any[];
      total: number;
      page: number;
      limit: number;
    }>(`/leaderboard?${query}`);
  }

  // Rewards
  async getRewards(params?: { category?: string; isActive?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ rewards: any[] }>(`/rewards?${query}`);
  }

  async redeemReward(rewardId: string, quantity: number) {
    return this.request<{ redemption: any; txHash: string }>('/rewards/redeem', {
      method: 'POST',
      body: JSON.stringify({ rewardId, quantity }),
    });
  }

  // Transactions
  async getTransactions(params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{
      transactions: any[];
      total: number;
      page: number;
      limit: number;
    }>(`/transactions?${query}`);
  }

  // Admin
  async distributeTokens(data: {
    walletAddress: string;
    amount: number;
    activityType: string;
    description: string;
    metadata?: any;
  }) {
    return this.request<{ activity: any; transaction: any; txHash: string }>(
      '/admin/distribute',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async getRedemptions(params?: { status?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{
      redemptions: any[];
      total: number;
      page: number;
      limit: number;
    }>(`/admin/redemptions?${query}`);
  }

  async updateRedemption(id: string, status: string) {
    return this.request<{ redemption: any }>(`/admin/redemptions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }
}

export const api = new ApiClient();
