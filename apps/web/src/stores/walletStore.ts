import { create } from 'zustand';

interface User {
  id: string;
  walletAddress: string;
  name?: string;
  email?: string;
  role: string;
}

interface WalletStore {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  user: User | null;
  balance: string;
  setAddress: (address: string | null) => void;
  setChainId: (chainId: number | null) => void;
  setIsConnecting: (isConnecting: boolean) => void;
  setError: (error: string | null) => void;
  setUser: (user: User | null) => void;
  setBalance: (balance: string) => void;
  reset: () => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
  address: null,
  chainId: null,
  isConnected: false,
  isConnecting: false,
  error: null,
  user: null,
  balance: '0',
  setAddress: (address) => set({ address, isConnected: !!address }),
  setChainId: (chainId) => set({ chainId }),
  setIsConnecting: (isConnecting) => set({ isConnecting }),
  setError: (error) => set({ error }),
  setUser: (user) => set({ user }),
  setBalance: (balance) => set({ balance }),
  reset: () =>
    set({
      address: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
      error: null,
      user: null,
      balance: '0',
    }),
}));
