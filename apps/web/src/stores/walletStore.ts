import { create } from 'zustand';
import { getConnectedAccount, getCurrentNetwork, CHAIN_ID, setupMetaMaskListeners } from '../lib/web3';
import { api } from '../lib/api';

export interface User {
  id: string;
  walletAddress: string;
  name?: string;
  email?: string;
  role: string;
}

export interface WalletStore {
  // State
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  user: User | null;
  balance: { balance: string; formatted: string } | null;
  isCorrectNetwork: boolean;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  setAddress: (address: string | null) => void;
  setChainId: (chainId: number | null) => void;
  setIsConnecting: (isConnecting: boolean) => void;
  setError: (error: string | null) => void;
  setUser: (user: User | null) => void;
  setBalance: (balance: { balance: string; formatted: string } | null) => void;
  setIsCorrectNetwork: (isCorrect: boolean) => void;
  checkNetwork: () => Promise<void>;
  reset: () => void;

  // Listeners setup
  setupListeners: () => () => void;
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  // Initial state
  address: null,
  chainId: null,
  isConnected: false,
  isConnecting: false,
  error: null,
  user: null,
  balance: null,
  isCorrectNetwork: false,

  // Connect wallet
  connect: async () => {
    try {
      set({ isConnecting: true, error: null });
      
      const { connectWallet } = await import('../lib/web3');
      const address = await connectWallet();
      
      // Authenticate with backend
      try {
        const authData = await api.connectWallet(address);
        api.setToken(authData.token);
        set({ user: authData.user });
      } catch (authError) {
        console.error('Backend authentication failed:', authError);
        // We still allow wallet connection even if backend auth fails, 
        // but user won't have profile/admin access
      }

      set({
        address,
        isConnected: true,
        isConnecting: false,
        error: null,
      });

      // Check network
      await get().checkNetwork();

    } catch (error: any) {
      console.error('Connect error:', error);
      set({
        error: error.message || 'Failed to connect wallet',
        isConnecting: false,
      });
      throw error;
    }
  },

  // Disconnect wallet
  disconnect: async () => {
    try {
      set({ isConnecting: true });
      const { disconnectWallet } = await import('../lib/web3');
      await disconnectWallet();
      
      // Clear backend auth
      api.clearToken();
      
      get().reset();
      set({ isConnecting: false });
    } catch (error: any) {
      console.error('Disconnect error:', error);
      set({
        error: error.message || 'Failed to disconnect wallet',
        isConnecting: false,
      });
    }
  },

  // Check if on correct network
  checkNetwork: async () => {
    try {
      const { isCorrectNetwork } = await import('../lib/web3');
      const correct = await isCorrectNetwork();
      set({ isCorrectNetwork: correct });
      
      if (!correct) {
        set({ error: 'Please switch to Sepolia network' });
      }
    } catch (error) {
      console.error('Error checking network:', error);
      set({ isCorrectNetwork: false });
    }
  },

  // Set address
  setAddress: (address) => {
    set({ 
      address, 
      isConnected: !!address,
      error: null,
    });
  },

  // Set chain ID
  setChainId: (chainId) => {
    set({ chainId });
    if (chainId !== CHAIN_ID) {
      set({ isCorrectNetwork: false, error: 'Please switch to Sepolia network' });
    } else {
      set({ isCorrectNetwork: true, error: null });
    }
  },

  // Set connecting state
  setIsConnecting: (isConnecting) => set({ isConnecting }),

  // Set error
  setError: (error) => set({ error }),

  // Set user data
  setUser: (user) => set({ user }),

  // Set balance
  setBalance: (balance) => set({ balance }),

  // Set correct network flag
  setIsCorrectNetwork: (isCorrect) => set({ isCorrectNetwork: isCorrect }),

  // Setup event listeners
  setupListeners: () => {
    try {
      const handleAccountChange = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected
          get().disconnect();
        } else {
          const newAddress = accounts[0].toLowerCase();
          set({ address: newAddress });
          // Re-authenticate with new address
          api.connectWallet(newAddress).then(authData => {
            api.setToken(authData.token);
            set({ user: authData.user });
          }).catch(console.error);
        }
      };

      const handleChainChange = (chainId: string) => {
        const chainIdNum = parseInt(chainId, 16);
        set({ chainId: chainIdNum });
        get().checkNetwork();
      };

      return setupMetaMaskListeners(handleAccountChange, handleChainChange);
    } catch (error) {
      console.error('Error setting up listeners:', error);
      return () => {};
    }
  },

  // Reset state
  reset: () => {
    set({
      address: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
      error: null,
      user: null,
      balance: null,
      isCorrectNetwork: false,
    });
  },
}));

// Auto-connect on mount (check if already connected)
export const initializeWallet = async () => {
  try {
    const store = useWalletStore.getState();
    const account = await getConnectedAccount();
    
    if (account) {
      store.setAddress(account);
      
      // Authenticate with backend on initialization
      try {
        const authData = await api.connectWallet(account);
        api.setToken(authData.token);
        store.setUser(authData.user);
      } catch (authError) {
        console.error('Backend authentication failed during init:', authError);
      }

      const network = await getCurrentNetwork();
      if (network) {
        store.setChainId(network.chainId);
      }
    }

    // Setup listeners
    store.setupListeners();
  } catch (error) {
    console.error('Error initializing wallet:', error);
  }
};
