import { useState } from 'react';
import { useWalletStore } from '@/stores/walletStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Shield } from 'lucide-react';

export default function Admin() {
  const { user } = useWalletStore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return (
      <div className="text-center py-20">
        <p className="text-xl">Access Denied</p>
        <p className="text-muted-foreground">You need admin privileges to access this page</p>
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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-4xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage token distribution and rewards</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribute Tokens</CardTitle>
          <CardDescription>Award tokens to users for their activities</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDistribute} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Wallet Address</label>
              <input
                type="text"
                name="walletAddress"
                required
                className="w-full px-3 py-2 border rounded-md"
                placeholder="0x..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Amount</label>
              <input
                type="number"
                name="amount"
                required
                min="1"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Activity Type</label>
              <select
                name="activityType"
                required
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="CONTEST_PARTICIPATION">Contest Participation</option>
                <option value="EVENT_ATTENDANCE">Event Attendance</option>
                <option value="WORKSHOP_COMPLETION">Workshop Completion</option>
                <option value="CONTENT_CREATION">Content Creation</option>
                <option value="VOLUNTEERING">Volunteering</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                name="description"
                required
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                placeholder="Reason for token distribution"
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Distributing...' : 'Distribute Tokens'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
