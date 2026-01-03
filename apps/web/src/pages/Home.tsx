import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWalletStore } from '@/stores/walletStore';
import { formatTokenAmount } from '@/lib/utils';
import { Coins, Trophy, TrendingUp } from 'lucide-react';

export default function Home() {
  const { isConnected, balance, user } = useWalletStore();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to GDG Token Rewards</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Earn tokens for participating in contests, events, and workshops
        </p>
        <p className="text-lg">Connect your wallet to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name || 'Anonymous'}!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Token Balance</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTokenAmount(balance?.formatted || '0')} GDG</div>
            <p className="text-xs text-muted-foreground">Available to redeem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leaderboard Rank</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#--</div>
            <p className="text-xs text-muted-foreground">Global ranking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>What would you like to do?</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <a href="/leaderboard" className="flex-1 p-6 border rounded-lg hover:bg-accent transition-colors">
            <Trophy className="h-8 w-8 mb-2 text-primary" />
            <h3 className="font-semibold mb-1">View Leaderboard</h3>
            <p className="text-sm text-muted-foreground">See top contributors</p>
          </a>
          <a href="/rewards" className="flex-1 p-6 border rounded-lg hover:bg-accent transition-colors">
            <Coins className="h-8 w-8 mb-2 text-primary" />
            <h3 className="font-semibold mb-1">Redeem Rewards</h3>
            <p className="text-sm text-muted-foreground">Browse marketplace</p>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
