import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api } from '@/lib/api';
import { formatTokenAmount, truncateAddress } from '@/lib/utils';
import { Trophy } from 'lucide-react';

export default function Leaderboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => api.getLeaderboard({ limit: 50 }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-4xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">Top contributors and token holders</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Tokens</TableHead>
                  <TableHead className="text-right">Activities</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.entries.map((entry) => (
                  <TableRow key={entry.user.id}>
                    <TableCell className="font-medium">#{entry.rank}</TableCell>
                    <TableCell>
                      {entry.user.name || truncateAddress(entry.user.walletAddress)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatTokenAmount(entry.totalTokens)} GDG
                    </TableCell>
                    <TableCell className="text-right">{entry.totalActivities}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
