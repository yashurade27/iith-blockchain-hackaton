import { useEffect, useState } from 'react';
import { useWalletStore } from '@/stores/walletStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { getTokenBalance } from '@/lib/web3';
import { User as UserIcon, Wallet, Shield, History, Package, Clock, ArrowUpRight, ArrowDownLeft, Copy, ExternalLink, Hash } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Pagination } from '@/components/ui/Pagination';

export default function Profile() {
  const { user, address, balance, setBalance, setUser } = useWalletStore();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);

  // Fetch detailed user data for profile info
  const { data: userDetails } = useQuery({
    queryKey: ['user', address],
    queryFn: async () => {
      if (!address) return null;
      const response = await api.getUser(address);
      return response.user;
    },
    enabled: !!address,
  });

  // Fetch transactions with pagination
  const { data: txData, isLoading: isTxLoading } = useQuery({
    queryKey: ['transactions', address, page, limit],
    queryFn: async () => {
      if (!user) return null;
      const response = await api.getTransactions({ page, limit });
      return response;
    },
    enabled: !!user,
  });

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

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Transaction hash copied to clipboard",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-xl">Please connect your wallet to view your profile</p>
      </div>
    );
  }

  const totalPages = Math.ceil((txData?.total || 0) / limit);

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

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Account Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Account Details Card */}
          <div className="overflow-hidden rounded-[2rem] border border-google-grey bg-white shadow-sm">
            <div className="border-b border-google-grey bg-gray-50/50 px-8 py-6">
              <h2 className="text-xl font-bold text-google-grey">Account Details</h2>
            </div>
            
            <div className="p-8 space-y-8">
              {/* Display Name - Read Only */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-google-grey uppercase tracking-wider">
                  Display Name
                </label>
                <div className="flex gap-3">
                  <Input 
                    value={name} 
                    disabled
                    className="max-w-md h-11 rounded-xl border-gray-200 bg-gray-50 text-gray-500"
                  />
                </div>
                {user.status && (
                    <div className="mt-2">
                        <span className={cn(
                            "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border",
                            user.status === 'APPROVED' ? "bg-green-100 text-green-800 border-green-200" : 
                            user.status === 'REJECTED' ? "bg-red-100 text-red-800 border-red-200" :
                            "bg-yellow-100 text-yellow-800 border-yellow-200"
                        )}>
                            Status: {user.status}
                        </span>
                    </div>
                )}
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                {/* Details */}
                {(user as any).details && (
                    <div className="col-span-2 grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Roll No</p>
                            <p className="font-medium">{(user as any).details.rollNo || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Year / Branch</p>
                            <p className="font-medium">{(user as any).details.year || '-'} / {(user as any).details.branch || '-'}</p>
                        </div>
                         <div className="col-span-2">
                            <p className="text-xs text-gray-500 uppercase">Codeforces</p>
                            <p className="font-medium">{(user as any).details.codeforcesHandle || 'Not linked'}</p>
                        </div>
                    </div>
                )}
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

          {/* Recent Activity / Transactions */}
          <div className="overflow-hidden rounded-[2rem] border border-google-grey bg-white shadow-sm">
            <div className="border-b border-google-grey bg-gray-50/50 px-8 py-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-google-grey flex items-center gap-2">
                <History className="h-5 w-5 text-google-blue" />
                Recent Activity
              </h2>
            </div>
            
            <div className="p-0">
              {isTxLoading ? (
                <div className="p-8 text-center text-gray-500">Loading activity...</div>
              ) : txData?.transactions?.length > 0 ? (
                <>
                  <div className="divide-y divide-gray-100">
                    {txData.transactions.map((tx: any) => (
                      <div key={tx.id} className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center border",
                            tx.type === 'EARN' 
                              ? "bg-green-50 border-green-200 text-green-600" 
                              : "bg-blue-50 border-blue-200 text-blue-600"
                          )}>
                            {tx.type === 'EARN' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{tx.description}</p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDateTime(tx.createdAt)}
                              </p>
                              {tx.txHash && (
                                <div className="flex items-center gap-1.5 p-1 px-2 rounded-lg bg-gray-100 border border-gray-200">
                                  <span className="text-[10px] font-mono text-gray-500 truncate max-w-[120px]">
                                    {tx.txHash.slice(0, 10)}...{tx.txHash.slice(-8)}
                                  </span>
                                  <button 
                                    onClick={() => copyToClipboard(tx.txHash)}
                                    className="text-gray-400 hover:text-google-blue transition-colors"
                                    title="Copy TX Hash"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </button>
                                  <a 
                                    href={`https://sepolia.etherscan.io/tx/${tx.txHash}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-google-blue transition-colors"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={cn(
                            "font-bold",
                            tx.type === 'EARN' ? "text-google-green" : "text-google-blue"
                          )}>
                            {tx.type === 'EARN' ? '+' : '-'}{tx.amount} G-CORE
                          </p>
                          <p className="text-xs text-gray-400 font-mono">
                            {tx.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="border-t border-gray-100 bg-gray-50/30">
                      <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        limit={limit}
                        onLimitChange={(l) => {
                          setLimit(l);
                          setPage(1);
                        }}
                        totalItems={txData.total}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="p-12 text-center">
                  <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
                    <History className="h-8 w-8 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Backpack / Rewards */}
        <div className="space-y-8">
          <div className="overflow-hidden rounded-[2rem] border border-google-grey bg-white shadow-sm h-full">
            <div className="border-b border-google-grey bg-gray-50/50 px-8 py-6">
              <h2 className="text-xl font-bold text-google-grey flex items-center gap-2">
                <Package className="h-5 w-5 text-google-yellow" />
                My Backpack
              </h2>
            </div>
            
            <div className="p-0">
              {isTxLoading ? (
                <div className="p-8 text-center text-gray-500">Loading items...</div>
              ) : userDetails?.redemptions?.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {userDetails.redemptions.map((redemption: any) => (
                    <div key={redemption.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                          {redemption.reward?.imageUrl ? (
                            <img src={redemption.reward.imageUrl} alt={redemption.reward.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-white">
                              <Package className="h-6 w-6 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-gray-900 line-clamp-1">{redemption.reward?.name || 'Reward Item'}</p>
                          <p className="text-xs text-gray-500 mb-2">
                            Redeemed on {formatDate(redemption.createdAt)}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
                              redemption.status === 'COMPLETED' 
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-yellow-50 text-yellow-700 border-yellow-200"
                            )}>
                              {redemption.status}
                            </span>
                            {redemption.txHash && (
                              <button 
                                onClick={() => copyToClipboard(redemption.txHash)}
                                className="text-gray-400 hover:text-google-blue p-1 rounded-md hover:bg-gray-100 transition-all"
                                title="Copy Transaction Hash"
                              >
                                <Hash className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
                    <Package className="h-8 w-8 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium">Your backpack is empty</p>
                  <p className="text-xs text-gray-400 mt-1">Redeem rewards to see them here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
