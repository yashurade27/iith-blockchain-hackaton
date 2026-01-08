import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function ContestManager() {
  const { toast } = useToast();
  const [contestId, setContestId] = useState('');
  const [rewardAmount, setRewardAmount] = useState(50);
  const [results, setResults] = useState<any[] | null>(null);

  const checkContestMutation = useMutation({
    mutationFn: (data: { contestId: number; rewardAmount: number }) => 
      api.checkContestParticipation(data.contestId, data.rewardAmount),
    onSuccess: (data) => {
      setResults(data.results);
      toast({
        title: "Verification Complete",
        description: `Processed results for Contest #${data.contestId}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive"
      });
      setResults(null);
    }
  });

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contestId) return;
    checkContestMutation.mutate({
      contestId: parseInt(contestId),
      rewardAmount: Number(rewardAmount)
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-100 bg-blue-50/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
               <Trophy className="h-6 w-6" />
            </div>
            <div>
               <CardTitle className="text-xl">Codeforces Contest Verification</CardTitle>
               <CardDescription>Automatically reward students who participated in a specific contest.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="contestId">Contest ID</Label>
              <Input 
                id="contestId" 
                placeholder="e.g. 1234" 
                value={contestId}
                onChange={(e) => setContestId(e.target.value)}
                required
              />
            </div>
            <div className="w-40 space-y-2">
              <Label htmlFor="amount">Reward Points</Label>
              <Input 
                id="amount" 
                type="number" 
                value={rewardAmount}
                onChange={(e) => setRewardAmount(Number(e.target.value))}
                required
              />
            </div>
            <Button 
                type="submit" 
                disabled={checkContestMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 w-32"
            >
                {checkContestMutation.isPending ? 'Checking...' : 'Verify'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {results && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Verification Results</h3>
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
             <div className="grid grid-cols-12 gap-4 border-b border-gray-100 bg-gray-50/50 p-4 text-xs font-medium uppercase text-gray-500">
                <div className="col-span-4">Student</div>
                <div className="col-span-4">Codeforces Handle</div>
                <div className="col-span-2">Rank</div>
                <div className="col-span-2">Status</div>
             </div>
             <div className="divide-y divide-gray-100">
                {results.length > 0 ? results.map((result: any, i) => (
                    <div key={i} className="grid grid-cols-12 gap-4 p-4 items-center text-sm">
                        <div className="col-span-4 font-medium text-gray-900">{result.userName}</div>
                        <div className="col-span-4 text-gray-500 font-mono">{result.handle}</div>
                        <div className="col-span-2 text-gray-500">#{result.rank || '-'}</div>
                        <div className="col-span-2 flex items-center gap-2">
                            {result.processed ? (
                                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                    <CheckCircle className="mr-1 h-3 w-3" /> Rewarded
                                </span>
                            ) : (
                                <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                                    <AlertCircle className="mr-1 h-3 w-3" /> Skipped
                                </span>
                            )}
                        </div>
                    </div>
                )) : (
                    <div className="p-8 text-center text-gray-500">
                        No matching participants found in this contest.
                    </div>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
