import { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
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
  const [loadingBalance, setLoadingBalance] = useState(false);

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
      setLoadingBalance(true);
      if (!address) return;

      const balanceData = await getTokenBalance(address);
      setBalance(balanceData);
    } catch (err) {
      console.error('Error fetching balance:', err);
    } finally {
      setLoadingBalance(false);
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
        className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
      >
        <Wallet className="mr-2 h-4 w-4" />
        Install MetaMask
      </Button>
    );
  }

  // Wallet not connected
  if (!isConnected) {
    return (
      <div className="flex flex-col gap-2">
        <Button
          onClick={handleConnect}
          disabled={isConnecting}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        >
          <Wallet className="mr-2 h-4 w-4" />
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
        {showError && error && (
          <div className="text-xs text-red-500 bg-red-50 p-2 rounded border border-red-200">
            {error}
          </div>
        )}
      </div>
    );
  }

  // Wallet connected
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isCorrectNetwork ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm font-mono text-gray-700">
              {formatAddress(address!)}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {isCorrectNetwork ? (
              <span className="text-green-600">✓ Sepolia Network</span>
            ) : (
              <span className="text-red-600">✗ Wrong Network</span>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDisconnect}
          disabled={isConnecting}
          className="text-gray-600 hover:text-gray-900"
        >
          Disconnect
        </Button>
      </div>

      {isCorrectNetwork && balance && (
        <div className="bg-blue-50 p-2 rounded border border-blue-200">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">G-CORE Balance:</span>
            <span className="text-sm font-semibold text-blue-900">
              {loadingBalance ? 'Loading...' : balance.formatted}
            </span>
          </div>
        </div>
      )}

      {!isCorrectNetwork && (
        <div className="bg-yellow-50 p-2 rounded border border-yellow-200">
          <p className="text-xs text-yellow-800">
            Please switch to Sepolia network in MetaMask
          </p>
        </div>
      )}

      {showError && error && (
        <div className="text-xs text-red-500 bg-red-50 p-2 rounded border border-red-200">
          {error}
        </div>
      )}
    </div>
  );
}
