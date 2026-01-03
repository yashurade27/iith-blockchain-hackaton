import { useEffect, useState } from 'react';
import { Wallet, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { useWalletStore, initializeWallet } from '../../stores/walletStore';
import { isMetaMaskInstalled, formatAddress, getTokenBalance } from '../../lib/web3';

export default function WalletConnect() {
  const {
    address,
    isConnected,
    isConnecting,
    error,
    isCorrectNetwork,
    connect,
    disconnect,
    balance,
    setBalance,
  } = useWalletStore();

  const [showError, setShowError] = useState(false);

  // Initialize wallet on mount
  useEffect(() => {
    initializeWallet();
  }, []);

  // Fetch token balance when address changes
  useEffect(() => {
    if (address && isCorrectNetwork) {
      fetchTokenBalance();
    }
  }, [address, isCorrectNetwork]);

  // Show/hide error
  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchTokenBalance = async () => {
    try {
      if (!address) return;
      const balanceData = await getTokenBalance(address);
      setBalance(balanceData);
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  const handleConnect = async () => {
    try {
      await connect();
    } catch (err) {
      console.error('Connection failed:', err);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (err) {
      console.error('Disconnection failed:', err);
    }
  };

  // MetaMask not installed
  if (!isMetaMaskInstalled()) {
    return (
      <Button
        onClick={() => window.open('https://metamask.io', '_blank')}
        variant="outline"
        className="gap-2"
      >
        <Wallet className="h-4 w-4" />
        Install MetaMask
      </Button>
    );
  }

  // Wallet not connected
  if (!isConnected) {
    return (
      <div className="relative">
        <Button
          onClick={handleConnect}
          disabled={isConnecting}
          variant="brand"
          className="gap-2"
        >
          <Wallet className="h-4 w-4" />
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
        {showError && error && (
          <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-500 shadow-lg">
            {error}
          </div>
        )}
      </div>
    );
  }

  // Wallet connected
  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${isCorrectNetwork ? 'border-google-green/30 bg-google-green/10 text-google-green' : 'border-red-200 bg-red-50 text-red-600'}`}>
        <div className={`h-2 w-2 rounded-full ${isCorrectNetwork ? 'bg-google-green' : 'bg-red-500'}`} />
        {formatAddress(address!)}
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDisconnect}
        className="h-8 w-8 rounded-full text-gray-500 hover:bg-red-50 hover:text-red-600"
        title="Disconnect"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
