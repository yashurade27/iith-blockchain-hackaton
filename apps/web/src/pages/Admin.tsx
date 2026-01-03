import { useState, useEffect } from 'react';
import { useWalletStore } from '@/stores/walletStore';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Shield, Send, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function Admin() {
  const { user, address } = useWalletStore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log('Admin Page - User:', user);
    console.log('Admin Page - Address:', address);
  }, [user, address]);

  if (!user) {
     return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="h-20 w-20 rounded-full bg-gray-50 flex items-center justify-center border border-google-grey">
          <Shield className="h-10 w-10 text-gray-400" />
        </div>
        <div>
          <p className="text-xl font-bold text-google-grey">Access Denied</p>
          <p className="text-gray-500">User not authenticated. Please connect wallet.</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center border border-red-200">
          <AlertCircle className="h-10 w-10 text-google-red" />
        </div>
        <div>
          <p className="text-xl font-bold text-google-grey">Access Denied</p>
          <p className="text-gray-500">You need admin privileges to access this page</p>
          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 inline-block text-left">
            <p className="text-xs text-gray-500 font-mono">Role: {user.role}</p>
            <p className="text-xs text-gray-500 font-mono">ID: {user.id}</p>
          </div>
        </div>
      </div>
    );
  }

  const handleDistribute = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      walletAddress: formData.get('walletAddress') as string,
      amount: parseInt(formData.get('amount') as string),
      activityType: formData.get('activityType') as string,
      description: formData.get('description') as string,
    };

    try {
      const result = await api.distributeTokens(data);
      toast({
        title: 'Tokens Distributed',
        description: `Successfully distributed ${data.amount} tokens. TX: ${result.txHash}`,
      });
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast({
        title: 'Distribution Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 py-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-google-grey bg-white px-8 py-12 shadow-sm">
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-pastel-blue opacity-50 blur-3xl" />
        <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-pastel-red opacity-50 blur-3xl" />
        
        <div className="relative flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pastel-blue border border-google-grey shadow-[4px_4px_0px_0px_rgba(32,33,36,1)]">
            <Shield className="h-10 w-10 text-google-grey" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-google-grey md:text-5xl">
              Admin Panel
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Manage token distribution and rewards
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="overflow-hidden rounded-[2rem] border border-google-grey bg-white shadow-sm max-w-3xl mx-auto">
        <div className="border-b border-google-grey bg-gray-50/50 px-8 py-6">
          <h2 className="text-xl font-bold text-google-grey flex items-center gap-2">
            <Send className="h-5 w-5 text-google-blue" />
            Distribute Tokens
          </h2>
          <p className="text-sm text-gray-500 mt-1">Award tokens to users for their activities</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleDistribute} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-google-grey uppercase tracking-wider">
                Wallet Address
              </label>
              <Input
                type="text"
                name="walletAddress"
                required
                className="h-11 rounded-xl border-gray-200 focus:border-google-blue focus:ring-google-blue font-mono"
                placeholder="0x..."
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-google-grey uppercase tracking-wider">
                  Amount
                </label>
                <Input
                  type="number"
                  name="amount"
                  required
                  min="1"
                  className="h-11 rounded-xl border-gray-200 focus:border-google-blue focus:ring-google-blue"
                  placeholder="100"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-google-grey uppercase tracking-wider">
                  Activity Type
                </label>
                <div className="relative">
                  <select
                    name="activityType"
                    required
                    className="w-full h-11 px-3 py-2 rounded-xl border border-gray-200 focus:border-google-blue focus:ring-google-blue bg-white appearance-none"
                  >
                    <option value="CONTEST_PARTICIPATION">Contest Participation</option>
                    <option value="EVENT_ATTENDANCE">Event Attendance</option>
                    <option value="WORKSHOP_COMPLETION">Workshop Completion</option>
                    <option value="CONTENT_CREATION">Content Creation</option>
                    <option value="VOLUNTEERING">Volunteering</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-google-grey uppercase tracking-wider">
                Description
              </label>
              <textarea
                name="description"
                required
                className="w-full min-h-[100px] px-3 py-2 rounded-xl border border-gray-200 focus:border-google-blue focus:ring-google-blue resize-y"
                placeholder="Reason for token distribution"
              />
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-google-blue hover:bg-google-blue/90 text-white font-bold text-lg shadow-[4px_4px_0px_0px_#4285F4] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#4285F4] transition-all border-2 border-google-blue"
            >
              {isSubmitting ? 'Distributing...' : 'Distribute Tokens'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
