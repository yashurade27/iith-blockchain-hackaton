import { create } from 'zustand';

interface UiStore {
  showRegistrationModal: boolean;
  registrationWalletAddress: string | null;
  setShowRegistrationModal: (show: boolean, walletAddress?: string) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  showRegistrationModal: false,
  registrationWalletAddress: null,
  setShowRegistrationModal: (show, walletAddress) => 
    set({ showRegistrationModal: show, registrationWalletAddress: walletAddress || null }),
}));

