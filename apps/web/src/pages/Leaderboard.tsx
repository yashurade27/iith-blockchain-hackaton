import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatTokenAmount, truncateAddress } from '@/lib/utils';
import { Trophy, Activity, Medal, Crown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function Leaderboard() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: leaderboardData, isLoading: isLeaderboardLoading } = useQuery({
    queryKey: ['leaderboard', page],
    queryFn: () => api.getLeaderboard({ page, limit }),
  });

  const { data: txData } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => api.getPublicTransactions(20),
    refetchInterval: 5000,
  });

  // Filter for EARN transactions (distributions)
  const realDistributions = txData?.transactions?.filter((tx: any) => tx.type === 'EARN') || [];

  // Duplicate for seamless scrolling
  const tickerItems = [...realDistributions, ...realDistributions];

  const totalPages = leaderboardData?.pagination ? Math.ceil(leaderboardData.pagination.total / limit) : 1;

  return (
    <div className="space-y-8 py-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-google-grey bg-white px-8 py-12 shadow-sm">
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-pastel-yellow opacity-50 blur-3xl" />
        <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-pastel-blue opacity-50 blur-3xl" />
        
        <div className="relative flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pastel-yellow border border-google-grey shadow-[4px_4px_0px_0px_rgba(32,33,36,1)]">
            <Trophy className="h-10 w-10 text-google-grey" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-google-grey md:text-5xl">
              Leaderboard
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Top contributors and community champions
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Leaderboard Table */}
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-[2rem] border border-google-grey bg-white shadow-sm">
              <div className="border-b border-google-grey bg-gray-50/50 px-8 py-6">
                <h2 className="text-xl font-bold text-google-grey">Global Rankings</h2>
              </div>
              
              <div className="p-0">
                {isLeaderboardLoading ? (
                  <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-google-blue border-t-transparent" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100 text-left text-sm font-semibold text-gray-500">
                          <th className="px-8 py-4">Rank</th>
                          <th className="px-8 py-4">User</th>
                          <th className="px-8 py-4 text-right">Balance</th>
                          <th className="px-8 py-4 text-right">Activities</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {leaderboardData?.leaderboard?.map((entry: any) => {
                          let rankIcon = null;
                          if (entry.rank === 1) rankIcon = <Crown className="h-5 w-5 text-google-yellow fill-google-yellow" />;
                          else if (entry.rank === 2) rankIcon = <Medal className="h-5 w-5 text-gray-400 fill-gray-400" />;
                          else if (entry.rank === 3) rankIcon = <Medal className="h-5 w-5 text-amber-700 fill-amber-700" />;

                          return (
                            <tr 
                              key={entry.id} 
                              className={cn(
                                "group transition-colors hover:bg-gray-50/50",
                                entry.rank <= 3 ? "bg-yellow-50/10" : ""
                              )}
                            >
                              <td className="px-8 py-4">
                                <div className="flex items-center gap-2 font-bold text-google-grey">
                                  <span className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-full text-sm",
                                    entry.rank <= 3 ? "bg-white shadow-sm border border-gray-100" : "text-gray-500"
                                  )}>
                                    {entry.rank}
                                  </span>
                                  {rankIcon}
                                </div>
                              </td>
                              <td className="px-8 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-pastel-blue/30 p-2">
                                    <div className="h-full w-full rounded-full bg-google-blue/20" />
                                  </div>
                                  <div className="font-medium text-google-grey">
                                    {entry.name || truncateAddress(entry.walletAddress)}
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-4 text-right">
                                <span className="inline-flex items-center rounded-full bg-pastel-green/30 px-3 py-1 text-sm font-bold text-google-green">
                                  {formatTokenAmount(entry.balance)} G-CORE
                                </span>
                              </td>
                              <td className="px-8 py-4 text-right font-medium text-gray-600">
                                {entry.activityCount}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between rounded-2xl border border-google-grey bg-white px-6 py-4">
              <div className="text-sm text-gray-500">
                Page <span className="font-bold text-google-grey">{page}</span> of <span className="font-bold text-google-grey">{totalPages}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || isLeaderboardLoading}
                  className="h-9 w-9 p-0 rounded-full"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || isLeaderboardLoading}
                  className="h-9 w-9 p-0 rounded-full"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Ticker Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 overflow-hidden rounded-[2rem] border border-google-grey bg-white shadow-[8px_8px_0px_0px_#FBBC04]">
            <div className="border-b border-gray-100 bg-gray-50/80 px-6 py-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute -inset-1 animate-ping rounded-full bg-google-green opacity-75" />
                  <div className="relative h-3 w-3 rounded-full bg-google-green" />
                </div>
                <h2 className="text-xl font-bold text-google-grey">Live Distributions</h2>
              </div>
            </div>

            <div className="relative h-[600px] overflow-hidden bg-white p-6">
              {/* Gradient Masks */}
              <div className="absolute left-0 top-0 z-10 h-12 w-full bg-gradient-to-b from-white to-transparent" />
              <div className="absolute bottom-0 left-0 z-10 h-12 w-full bg-gradient-to-t from-white to-transparent" />

              {/* Scrolling Content */}
              <div className="animate-scroll-y space-y-4">
                {tickerItems.length > 0 ? (
                  tickerItems.map((tx: any, i: number) => (
                    <div 
                      key={`${tx.id}-${i}`}
                      className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md hover:border-google-blue/30"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pastel-blue/30 text-google-blue">
                          <Activity className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium text-google-grey">
                            <span className="font-bold text-google-blue">
                              {tx.user?.name || truncateAddress(tx.user?.walletAddress || 'Unknown')}
                            </span>
                            {' '}received{' '}
                            <span className="font-bold text-google-green">
                              {formatTokenAmount(tx.amount)} G-CORE
                            </span>
                          </p>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {tx.description}
                          </p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                            {new Date(tx.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-10">
                    No recent activity
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scroll-y {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .animate-scroll-y {
          animation: scroll-y 40s linear infinite;
        }
        .animate-scroll-y:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
