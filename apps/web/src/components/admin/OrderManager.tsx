import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, Copy, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Pagination } from '@/components/ui/Pagination';
import { CustomTabs } from '@/components/ui/custom-tabs';

export function OrderManager() {
  const { toast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState('current');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['admin-orders', page, limit, activeSubTab],
    queryFn: async () => {
      // Note: The API might need enhancement if we want to fetch multiple statuses like PENDING + APPROVED
      // For now, let's keep it simple or assume the API might support multi-status if we update it.
      // But let's check what the API expects.
      const res = await api.getRedemptions({ 
          status: activeSubTab === 'current' ? 'PENDING' : 'DELIVERED',
          page, 
          limit 
      });
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

  const copyToClipboard = (text: string, label: string = 'Copied to clipboard') => {
    navigator.clipboard.writeText(text);
    toast({ title: label });
  };

  const statusColors: any = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    APPROVED: 'bg-blue-100 text-blue-800 border-blue-200',
    FULFILLED: 'bg-green-100 text-green-800 border-green-200',
    DELIVERED: 'bg-google-blue/10 text-google-blue border-google-blue/20',
    CANCELLED: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
            <h2 className="text-2xl font-bold text-google-grey">Orders & Redemptions</h2>
            <CustomTabs 
                tabs={[
                    { id: 'current', label: 'Pending Redemptions' },
                    { id: 'past', label: 'Past Orders' },
                ]}
                activeTab={activeSubTab}
                onChange={(id) => { setActiveSubTab(id); setPage(1); }}
                className="bg-white border border-gray-200 mt-2"
            />
        </div>
        <div className="text-sm font-medium text-gray-500">
          Showing {data?.redemptions.length || 0} of {data?.total || 0} orders
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-google-grey overflow-hidden shadow-sm">
        {isLoading ? (
             <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-google-blue"/></div>
        ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-4 font-bold text-google-grey text-sm uppercase tracking-wider">Order ID</th>
                  <th className="p-4 font-bold text-google-grey text-sm uppercase tracking-wider">User</th>
                  <th className="p-4 font-bold text-google-grey text-sm uppercase tracking-wider">Reward</th>
                  <th className="p-4 font-bold text-google-grey text-sm uppercase tracking-wider">Tx Hash</th>
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
                        <button onClick={() => copyToClipboard(order.id, 'Order ID copied')}>
                          <Copy className="h-3 w-3 hover:text-google-blue" />
                        </button>
                      </div>
                      <div className="mt-1 text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-sm text-gray-900">{order.user.name || 'Unknown'}</div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                        <span title={order.user.walletAddress}>
                          {order.user.walletAddress.slice(0, 6)}...{order.user.walletAddress.slice(-4)}
                        </span>
                        <button onClick={() => copyToClipboard(order.user.walletAddress, 'Address copied')}>
                          <Copy className="h-3 w-3 hover:text-google-blue" />
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-google-grey">{order.reward.name}</div>
                      <div className="text-xs text-gray-500">Qty: x{order.quantity}</div>
                    </td>
                    <td className="p-4">
                      {order.txHash ? (
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 px-2 rounded-lg bg-gray-50 border border-gray-200 flex items-center gap-2">
                            <span className="text-[10px] font-mono text-gray-500" title={order.txHash}>
                              {order.txHash.slice(0, 6)}...{order.txHash.slice(-4)}
                            </span>
                            <button 
                              onClick={() => copyToClipboard(order.txHash, 'Tx Hash copied')}
                              className="text-gray-400 hover:text-google-blue p-0.5"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                            <a 
                              href={`https://sepolia.etherscan.io/tx/${order.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-google-blue p-0.5"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No hash</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold border", statusColors[order.status] || statusColors.PENDING)}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {(order.status === 'PENDING' || order.status === 'APPROVED' || order.status === 'FULFILLED') && (
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                            disabled={updatingId === order.id}
                            className="rounded-lg bg-google-blue hover:bg-google-blue/90 text-white font-bold text-xs"
                          >
                            {updatingId === order.id ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Mark Delivered'}
                          </Button>
                        </div>
                      )}
                      {order.status === 'DELIVERED' && (
                          <span className="text-xs font-bold text-google-blue flex items-center justify-end gap-1">
                              <CheckCircle className="h-4 w-4" /> Delivered & Live
                          </span>
                      )}
                      {order.status === 'CANCELLED' && (
                          <span className="text-xs font-bold text-gray-400">Cancelled</span>
                      )}
                    </td>
                  </tr>
                ))}
                {(!data?.redemptions || data.redemptions.length === 0) && (
                  <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">No orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-100 bg-gray-50/50">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                limit={limit}
                onLimitChange={(l) => {
                  setLimit(l);
                  setPage(1);
                }}
                totalItems={data?.total}
              />
            </div>
          )}
        </>
        )}
      </div>
    </div>
  );
}
