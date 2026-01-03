import { useEffect, useState } from 'react';
import { useWalletStore } from '@/stores/walletStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { getTokenBalance } from '@/lib/web3';
import { User as UserIcon, Wallet, Shield } from 'lucide-react';

export default function Profile() {
  const { user, address, balance, setBalance, setUser } = useWalletStore();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

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

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!name.trim()) return;
    
    setIsUpdating(true);
    try {
      const response = await api.updateUser({ name });
      setUser(response.user);
      toast({
        title: "Profile updated",
        description: "Your name has been updated successfully.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-xl">Please connect your wallet to view your profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-google-grey bg-white px-8 py-12 shadow-sm">
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-pastel-red opacity-50 blur-3xl" />
        <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-pastel-yellow opacity-50 blur-3xl" />
        
        <div className="relative flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pastel-red border border-google-grey shadow-[4px_4px_0px_0px_rgba(32,33,36,1)]">
            <UserIcon className="h-10 w-10 text-google-grey" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-google-grey md:text-5xl">
              My Profile
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Manage your account and view your stats
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="overflow-hidden rounded-[2rem] border border-google-grey bg-white shadow-sm max-w-3xl mx-auto">
        <div className="border-b border-google-grey bg-gray-50/50 px-8 py-6">
          <h2 className="text-xl font-bold text-google-grey">Account Details</h2>
        </div>
        
        <div className="p-8 space-y-8">
          {/* Display Name */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-google-grey uppercase tracking-wider">
              Display Name
            </label>
            <div className="flex gap-3">
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Enter your name"
                className="max-w-md h-11 rounded-xl border-gray-200 focus:border-google-blue focus:ring-google-blue"
              />
              <Button 
                onClick={handleUpdateProfile} 
                disabled={isUpdating}
                className="h-11 rounded-xl bg-google-blue hover:bg-google-blue/90 text-white font-medium px-6"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              This name will be displayed on the leaderboard and live ticker.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Wallet Address */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-google-grey uppercase tracking-wider">
                <Wallet className="h-4 w-4 text-gray-400" />
                Wallet Address
              </div>
              <div className="font-mono text-sm bg-gray-50 p-3 rounded-xl border border-gray-100 text-gray-600 break-all">
                {address}
              </div>
            </div>

            {/* Token Balance */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-google-grey uppercase tracking-wider">
                <div className="h-4 w-4 rounded-full bg-google-green" />
                Token Balance
              </div>
              <div className="text-3xl font-bold text-google-grey">
                {balance?.formatted || '0'} <span className="text-google-green">G-CORE</span>
              </div>
            </div>

            {/* Role (Admin Only) */}
            {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-google-grey uppercase tracking-wider">
                  <Shield className="h-4 w-4 text-google-red" />
                  Role
                </div>
                <div className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-sm font-bold text-google-red border border-red-100">
                  {user.role}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
