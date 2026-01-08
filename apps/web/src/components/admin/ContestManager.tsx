import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Search, CheckCircle, AlertCircle } from 'lucide-react';

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
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-google-grey bg-white p-8 transition-all shadow-sm">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-pastel-yellow opacity-40 blur-3xl" />
        
        <div className="relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-pastel-yellow border border-google-grey shadow-[4px_4px_0px_0px_rgba(32,33,36,1)]">
               <Trophy className="h-8 w-8 text-google-grey" />
            </div>
            <div>
               <h2 className="text-2xl font-black text-google-grey">Codeforces Verification</h2>
               <p className="text-sm text-gray-500 font-medium">Auto-reward participants from a specific contest.</p>
            </div>
          </div>

          <form onSubmit={handleVerify} className="flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1 space-y-2 w-full">
              <Label htmlFor="contestId" className="font-bold text-google-grey ml-1">Contest ID</Label>
              <Input 
                id="contestId" 
                placeholder="e.g. 1234" 
                value={contestId}
                onChange={(e) => setContestId(e.target.value)}
                required
                className="h-14 rounded-2xl border-2 border-gray-100 focus:border-google-blue bg-white font-mono px-6"
              />
            </div>
            <div className="w-full md:w-48 space-y-2">
              <Label htmlFor="amount" className="font-bold text-google-grey ml-1">Reward Points</Label>
              <Input 
                id="amount" 
                type="number" 
                value={rewardAmount}
                onChange={(e) => setRewardAmount(Number(e.target.value))}
                required
                className="h-14 rounded-2xl border-2 border-gray-100 focus:border-google-blue bg-white font-bold px-6"
              />
            </div>
            <Button 
                type="submit" 
                disabled={checkContestMutation.isPending}
                className="h-14 w-full md:w-40 bg-google-blue hover:bg-blue-700 text-white font-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(32,33,36,1)] hover:shadow-none hover:translate-y-0.5 transition-all"
            >
                {checkContestMutation.isPending ? 'Verifying...' : (
                    <div className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        <span>Verify</span>
                    </div>
                )}
            </Button>
          </form>
        </div>
      </div>

      {results && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between px-4">
             <h3 className="text-xl font-black text-google-grey">Verification Results</h3>
             <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{results.length} Matches Found</div>
          </div>
          
          <div className="overflow-hidden rounded-[2rem] border border-google-grey bg-white shadow-[8px_8px_0px_0px_rgba(251,188,4,0.1)]">
             <div className="grid grid-cols-12 gap-4 border-b border-google-grey bg-gray-50/50 p-6 text-[10px] font-black uppercase tracking-tighter text-gray-500">
                <div className="col-span-4">Student</div>
                <div className="col-span-4">Codeforces Handle</div>
                <div className="col-span-2">Rank</div>
                <div className="col-span-2">Status</div>
             </div>
             <div className="divide-y divide-gray-100">
                {results.length > 0 ? results.map((result: any, i) => (
                    <div key={i} className="grid grid-cols-12 gap-4 p-6 items-center text-sm transition-colors hover:bg-gray-50/50">
                        <div className="col-span-4 font-bold text-google-grey">{result.userName}</div>
                        <div className="col-span-4 text-google-blue font-mono font-medium">{result.handle}</div>
                        <div className="col-span-2 font-black text-gray-400">#{result.rank || '-'}</div>
                        <div className="col-span-2 flex items-center gap-2">
                            {result.processed ? (
                                <span className="inline-flex items-center rounded-full bg-pastel-green px-3 py-1 text-[10px] font-black uppercase text-google-grey border border-google-green/20">
                                    <CheckCircle className="mr-1 h-3 w-3" /> Rewarded
                                </span>
                            ) : (
                                <span className="inline-flex items-center rounded-full bg-pastel-red px-3 py-1 text-[10px] font-black uppercase text-google-grey border border-google-red/20">
                                    <AlertCircle className="mr-1 h-3 w-3" /> Skipped
                                </span>
                            )}
                        </div>
                    </div>
                )) : (
                    <div className="p-20 text-center text-gray-400">
                        <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
                            <Search className="h-8 w-8 opacity-20" />
                        </div>
                        <p className="font-bold">No matching participants found in this contest.</p>
                        <p className="text-xs">Ensure students have updated their CF handles in profiles.</p>
                    </div>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
