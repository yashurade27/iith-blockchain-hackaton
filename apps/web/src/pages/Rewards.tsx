import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { formatTokenAmount } from '@/lib/utils';
import { Gift, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function Rewards() {
  const { toast } = useToast();
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['rewards'],
    queryFn: () => api.getRewards({ isActive: 'true' }),
  });

  const handleRedeem = async (rewardId: string, name: string) => {
    try {
      setRedeeming(rewardId);
      await api.redeemReward(rewardId, 1);
      
      toast({
        title: 'Redemption Successful',
        description: `Successfully redeemed ${name}!`,
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: 'Redemption Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setRedeeming(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Gift className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-4xl font-bold">Rewards Marketplace</h1>
          <p className="text-muted-foreground">Redeem your tokens for exclusive rewards</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading rewards...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data?.rewards.map((reward) => (
            <Card key={reward.id}>
              <CardHeader>
                {reward.imageUrl && (
                  <img
                    src={reward.imageUrl}
                    alt={reward.name}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                )}
                <CardTitle>{reward.name}</CardTitle>
                <CardDescription>{reward.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-bold">{formatTokenAmount(reward.cost)} GDG</div>
                    <div className="text-sm text-muted-foreground">
                      {reward.stock} in stock
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">{reward.category}</div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleRedeem(reward.id, reward.name)}
                  disabled={reward.stock === 0 || redeeming === reward.id}
                >
                  {redeeming === reward.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redeeming...
                    </>
                  ) : reward.stock === 0 ? (
                    'Out of Stock'
                  ) : (
                    'Redeem'
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
