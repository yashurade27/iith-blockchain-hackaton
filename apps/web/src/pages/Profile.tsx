import { useEffect } from 'react';
import { useWalletStore } from '@/stores/walletStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getTokenBalance } from '@/lib/web3';

export default function Profile() {
  const { user, address, balance, setBalance } = useWalletStore();

  useEffect(() => {
    const fetchBalance = async () => {
      if (address) {
        try {
          const balanceData = await getTokenBalance(address);
          setBalance(balanceData);
        } catch (error) {
          console.error('Failed to fetch balance:', error);
        }
      }
    };

    fetchBalance();
    // Poll for balance updates every 10 seconds
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [address, setBalance]);

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-xl">Please connect your wallet to view your profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your profile details and statistics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground">Wallet Address</div>
            <div className="font-mono">{address}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Role</div>
            <div>{user.role}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Token Balance</div>
            <div className="text-2xl font-bold">{balance?.formatted || '0'} GDG</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
