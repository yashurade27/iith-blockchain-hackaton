import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, Clock, PackageCheck, Copy } from 'lucide-react';
import { formatTokenAmount, cn } from '@/lib/utils';
import { ethers } from 'ethers';

export function OrderManager() {
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const res = await api.getRedemptions({ limit: 50 });
      return res;
    }
  });

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await api.updateRedemption(id, newStatus);
      toast({ title: 'Order updated successfully' });
      refetch();
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard' });
  };

  const statusColors: any = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    APPROVED: 'bg-blue-100 text-blue-800 border-blue-200',
    FULFILLED: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-google-grey">Orders & Redemptions</h2>

      <div className="bg-white rounded-[2rem] border border-google-grey overflow-hidden shadow-sm">
        {isLoading ? (
             <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-google-blue"/></div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-bold text-google-grey text-sm uppercase tracking-wider">Order ID</th>
                <th className="p-4 font-bold text-google-grey text-sm uppercase tracking-wider">User</th>
                <th className="p-4 font-bold text-google-grey text-sm uppercase tracking-wider">Reward</th>
                <th className="p-4 font-bold text-google-grey text-sm uppercase tracking-wider">Status</th>
                <th className="p-4 font-bold text-google-grey text-sm uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.redemptions.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-mono text-xs text-gray-500">
                    <div className="flex items-center gap-2" title={order.id}>
                      {order.id.slice(0, 8)}...
                      <button onClick={() => copyToClipboard(order.id)}>
                        <Copy className="h-3 w-3 hover:text-google-blue" />
                      </button>
                    </div>
                    <div className="mt-1 text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-sm text-gray-900">{order.user.name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500 font-mono" title={order.user.walletAddress}>
                      {order.user.walletAddress.slice(0, 6)}...{order.user.walletAddress.slice(-4)}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-google-grey">{order.reward.name}</div>
                    <div className="text-xs text-gray-500">Qty: x{order.quantity}</div>
                  </td>
                  <td className="p-4">
                    <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold border", statusColors[order.status] || statusColors.PENDING)}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {order.status === 'PENDING' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleUpdateStatus(order.id, 'FULFILLED')}
                        disabled={updatingId === order.id}
                        className="rounded-lg bg-google-green hover:bg-google-green/90 text-white font-bold text-xs"
                      >
                         {updatingId === order.id ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Mark Done'}
                      </Button>
                    )}
                    {order.status === 'FULFILLED' && (
                        <span className="text-xs font-bold text-green-600 flex items-center justify-end gap-1">
                            <CheckCircle className="h-4 w-4" /> Delivered
                        </span>
                    )}
                  </td>
                </tr>
              ))}
               {(!data?.redemptions || data.redemptions.length === 0) && (
                <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">No orders found.</td>
                </tr>
            )}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
}
