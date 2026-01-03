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

    const json = await response.json();
    return json.data || json;
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

  async updateUser(data: { name: string }) {
    return this.request<{ user: any }>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Leaderboard
  async getLeaderboard(params?: {
    timeframe?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const offset = (page - 1) * limit;
    
    const queryParams = {
      ...params,
      offset: offset.toString(),
      limit: limit.toString(),
    };
    
    // Remove page from query params as backend expects offset
    delete (queryParams as any).page;

    const query = new URLSearchParams(queryParams as any).toString();
    return this.request<{
      leaderboard: any[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        offset: number;
      };
    }>(`/leaderboard?${query}`);
  }

  // Rewards
  async getRewards(params?: { 
    category?: string; 
    isActive?: string; 
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ 
      rewards: any[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>(`/rewards?${query}`);
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

  async getPublicTransactions(limit: number = 20) {
    return this.request<{ transactions: any[] }>(`/transactions/public?limit=${limit}`);
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

  async batchDistributeTokens(distributions: Array<{
    walletAddress: string;
    amount: number;
    activityType: string;
    description: string;
  }>) {
    return this.request<{
      totalRequests: number;
      successCount: number;
      failureCount: number;
      results: any[];
    }>('/admin/batch-distribute', {
      method: 'POST',
      body: JSON.stringify(distributions),
    });
  }

  async verifyActivity(data: {
    userId: string;
    activityType: string;
    points: number;
    metadata?: { eventId?: string; description?: string };
  }) {
    return this.request<{
      activity: {
        id: string;
        userId: string;
        type: string;
        points: number;
        verifiedAt: string;
      };
    }>('/admin/verify-activity', {
      method: 'POST',
      body: JSON.stringify(data),
    });
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
