import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Check, X, User as UserIcon, Clock, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export function UserManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'approved'>('pending');

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin', 'users', activeSubTab],
    queryFn: () => api.getUsers(activeSubTab.toUpperCase()).then(res => res.users),
  });

  const approveMutation = useMutation({
    mutationFn: ({ userId, action }: { userId: string; action: 'APPROVE' | 'REJECT' }) => 
      api.approveUser(userId, action),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({
        title: `User ${variables.action === 'APPROVE' ? 'Approved' : 'Rejected'}`,
        description: `Successfully processed user request.`,
        variant: variables.action === 'APPROVE' ? "default" : "destructive"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const subTabs = [
    { id: 'pending', label: 'Pending Approvals', icon: Clock },
    { id: 'approved', label: 'Approved Users', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
        {subTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
              activeSubTab === tab.id 
                ? "bg-white text-google-grey shadow-sm" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm transition-all">
        <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">
            {activeSubTab === 'pending' ? 'Pending Approvals' : 'Approved Users'} 
            ({users?.length || 0})
          </h2>
        </div>
        
        <div className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-gray-500">Loading users...</div>
          ) : users && users.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {users.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-6 hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-full",
                        activeSubTab === 'pending' ? "bg-blue-50 text-blue-500" : "bg-green-50 text-green-500"
                    )}>
                      <UserIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{user.name || 'Unnamed User'}</h3>
                      <p className="text-sm text-gray-500 font-mono text-[10px]">{user.walletAddress}</p>
                      <p className="text-sm text-gray-500">{user.collegeEmail}</p>
                      {user.rollNo && (
                        <div className="mt-1 flex gap-2 text-xs text-gray-400">
                            <span className="bg-gray-100 px-2 py-0.5 rounded">{user.rollNo}</span>
                            <span className="bg-gray-100 px-2 py-0.5 rounded">{user.year} - {user.branch}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {activeSubTab === 'pending' && (
                    <div className="flex gap-2">
                        <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            onClick={() => approveMutation.mutate({ userId: user.id, action: 'REJECT' })}
                            disabled={approveMutation.isPending}
                        >
                            <X className="mr-1 h-4 w-4" /> Reject
                        </Button>
                        <Button 
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => approveMutation.mutate({ userId: user.id, action: 'APPROVE' })}
                            disabled={approveMutation.isPending}
                        >
                            <Check className="mr-1 h-4 w-4" /> Approve
                        </Button>
                    </div>
                  )}

                  {activeSubTab === 'approved' && (
                      <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100 flex items-center gap-1">
                             <ShieldCheck className="h-3 w-3" /> Approved
                          </span>
                      </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              No {activeSubTab} users found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
