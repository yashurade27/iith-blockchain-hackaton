import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Send } from 'lucide-react';

export function DistributeForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await api.distributeTokens(data);
      toast({
        title: 'Tokens Distributed',
        description: `Successfully distributed ${data.amount} tokens.`,
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
  );
}
