import { useState } from 'react';
import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWalletStore } from '@/stores/walletStore';
import { truncateAddress, formatTokenAmount } from '@/lib/utils';
import { getProvider, switchToCorrectNetwork, CHAIN_ID } from '@/lib/web3';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function WalletConnect() {
  const { toast } = useToast();
  const { address, isConnected, isConnecting, balance, setAddress, setChainId, setIsConnecting, setUser, setBalance } = useWalletStore();
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      if (typeof window.ethereum === 'undefined') {
        throw new Error('Please install MetaMask to use this app');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const account = accounts[0];
      
      // Get chain ID
      const provider = await getProvider();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      // Check if on correct network
      if (chainId !== CHAIN_ID) {
        await switchToCorrectNetwork();
      }

      // Connect to backend
      const { user, token } = await api.connectWallet(account);
      api.setToken(token);

      setAddress(account);
      setChainId(chainId);
      setUser(user);

      // Get balance
      try {
        const balanceData = await api.getUserBalance(account);
        setBalance(balanceData.formatted);
      } catch (err) {
        console.error('Failed to fetch balance:', err);
        setBalance('0');
      }

      toast({
        title: 'Wallet Connected',
        description: `Connected to ${truncateAddress(account)}`,
      });

      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setError(err.message);
      toast({
        title: 'Connection Failed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      window.location.reload();
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const disconnectWallet = () => {
    setAddress(null);
    setChainId(null);
    setUser(null);
    setBalance('0');
    api.clearToken();
    
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-sm font-medium">{formatTokenAmount(balance)} GDG</div>
          <div className="text-xs text-muted-foreground">{truncateAddress(address)}</div>
        </div>
        <Button variant="outline" onClick={disconnectWallet}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={connectWallet} disabled={isConnecting}>
      <Wallet className="mr-2 h-4 w-4" />
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
}
