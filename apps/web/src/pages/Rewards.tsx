import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatTokenAmount } from '@/lib/utils';
import { Gift, Loader2, ShoppingBag, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ethers } from 'ethers';

const CATEGORIES = ['All', 'Swag', 'Electronics', 'Books', 'Digital', 'Other'];

const THEMES = [
  {
    name: 'blue',
    hex: '#4285F4',
    lightBg: 'bg-blue-50',
    borderColor: 'border-google-blue',
    textColor: 'text-google-blue',
    hoverShadow: 'hover:shadow-[8px_8px_0px_0px_#4285F4]',
    buttonHover: 'hover:bg-google-blue',
    buttonShadow: 'hover:shadow-[4px_4px_0px_0px_#4285F4]'
  },
  {
    name: 'red',
    hex: '#EA4335',
    lightBg: 'bg-red-50',
    borderColor: 'border-google-red',
    textColor: 'text-google-red',
    hoverShadow: 'hover:shadow-[8px_8px_0px_0px_#EA4335]',
    buttonHover: 'hover:bg-google-red',
    buttonShadow: 'hover:shadow-[4px_4px_0px_0px_#EA4335]'
  },
  {
    name: 'yellow',
    hex: '#FBBC04',
    lightBg: 'bg-yellow-50',
    borderColor: 'border-google-yellow',
    textColor: 'text-google-yellow',
    hoverShadow: 'hover:shadow-[8px_8px_0px_0px_#FBBC04]',
    buttonHover: 'hover:bg-google-yellow',
    buttonShadow: 'hover:shadow-[4px_4px_0px_0px_#FBBC04]'
  },
  {
    name: 'green',
    hex: '#34A853',
    lightBg: 'bg-green-50',
    borderColor: 'border-google-green',
    textColor: 'text-google-green',
    hoverShadow: 'hover:shadow-[8px_8px_0px_0px_#34A853]',
    buttonHover: 'hover:bg-google-green',
    buttonShadow: 'hover:shadow-[4px_4px_0px_0px_#34A853]'
  }
];

const DUMMY_REWARDS = [
  {
    id: '1',
    name: 'Google Developer Hoodie',
    description: 'Premium cotton blend hoodie with embroidered Google Developer logo. Perfect for coding sessions.',
    cost: '500000000000000000000', // 500 G-CORE
    stock: 15,
    category: 'Swag',
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '2',
    name: 'Mechanical Keyboard',
    description: 'Wireless mechanical keyboard with custom G-CORE keycaps and RGB lighting.',
    cost: '1200000000000000000000', // 1200 G-CORE
    stock: 5,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '3',
    name: 'Google Cloud Credits $50',
    description: 'Get $50 worth of Google Cloud Platform credits for your next project.',
    cost: '200000000000000000000', // 200 G-CORE
    stock: 50,
    category: 'Digital',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '4',
    name: 'Android Plushie',
    description: 'Adorable Android mascot plushie. A must-have for every Android developer.',
    cost: '150000000000000000000', // 150 G-CORE
    stock: 0,
    category: 'Swag',
    imageUrl: 'https://images.unsplash.com/photo-1601057298562-4d649d295727?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '5',
    name: 'Tech Backpack',
    description: 'Water-resistant laptop backpack with multiple compartments for all your gadgets.',
    cost: '800000000000000000000', // 800 G-CORE
    stock: 8,
    category: 'Swag',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '6',
    name: 'Clean Code Book',
    description: 'Classic guide to software craftsmanship. Essential reading for every developer.',
    cost: '300000000000000000000', // 300 G-CORE
    stock: 12,
    category: 'Books',
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
  },
];

export default function Rewards() {
  const { toast } = useToast();
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const limit = 6;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['rewards', page, category, search],
    queryFn: async () => {
      // For now, return dummy data mixed with API structure
      // In a real scenario, we would just call api.getRewards
      // const res = await api.getRewards({ ... });
      
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      let filtered = [...DUMMY_REWARDS];
      
      if (category !== 'All') {
        filtered = filtered.filter(r => r.category === category);
      }
      
      if (search) {
        const lowerSearch = search.toLowerCase();
        filtered = filtered.filter(r => 
          r.name.toLowerCase().includes(lowerSearch) || 
          r.description.toLowerCase().includes(lowerSearch)
        );
      }

      const start = (page - 1) * limit;
      const paginated = filtered.slice(start, start + limit);

      return {
        rewards: paginated,
        pagination: {
          total: filtered.length,
          page,
          limit,
          totalPages: Math.ceil(filtered.length / limit)
        }
      };
    },
  });

  const handleRedeem = async (rewardId: string, name: string) => {
    try {
      setRedeeming(rewardId);
      // Mock redemption for dummy data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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

  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <div className="space-y-8 py-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-google-grey bg-white px-8 py-12 shadow-sm">
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-pastel-green opacity-50 blur-3xl" />
        <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-pastel-blue opacity-50 blur-3xl" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pastel-green border border-google-grey shadow-[4px_4px_0px_0px_rgba(32,33,36,1)]">
              <Gift className="h-10 w-10 text-google-grey" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-google-grey md:text-5xl">
                Rewards Store
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Exchange your G-CORE tokens for exclusive swag
              </p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col gap-4 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input 
                placeholder="Search rewards..." 
                className="pl-10 h-11 rounded-xl border-google-grey bg-white focus:ring-google-blue transition-all w-full md:w-64"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setPage(1);
                  }}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap border",
                    category === cat
                      ? "bg-google-blue text-white border-google-blue shadow-md"
                      : "bg-white text-google-grey border-google-grey hover:bg-gray-50"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-google-blue border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {data?.rewards.map((reward, index) => {
              const theme = THEMES[index % THEMES.length];
              return (
                <div 
                  key={reward.id}
                  className={cn(
                    "group flex flex-col overflow-hidden rounded-[2rem] border-2 bg-white shadow-sm transition-all hover:-translate-y-1",
                    theme.borderColor,
                    theme.hoverShadow
                  )}
                >
                  {/* Image Container */}
                  <div className={cn("relative h-64 w-full overflow-hidden border-b-2 bg-gray-50", theme.borderColor)}>
                    {reward.imageUrl ? (
                      <img
                        src={reward.imageUrl}
                        alt={reward.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className={cn("flex h-full w-full items-center justify-center", theme.lightBg)}>
                        <ShoppingBag className={cn("h-20 w-20 opacity-40", theme.textColor)} />
                      </div>
                    )}
                    <div className={cn(
                      "absolute right-4 top-4 rounded-full border-2 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-sm",
                      theme.borderColor,
                      theme.textColor
                    )}>
                      {reward.category}
                    </div>
                    {reward.stock <= 5 && reward.stock > 0 && (
                      <div className="absolute left-4 top-4 rounded-full border-2 border-google-red bg-google-red px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm animate-pulse">
                        Low Stock
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-6 flex-1 space-y-2">
                      <h3 className={cn("text-xl font-bold transition-colors", theme.textColor)}>
                        {reward.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {reward.description}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-end justify-between border-t-2 border-gray-100 pt-4">
                        <div>
                          <p className="text-xs font-bold uppercase text-gray-400 mb-1">Cost</p>
                          <p className={cn("text-2xl font-bold", theme.textColor)}>
                            {formatTokenAmount(ethers.formatEther(reward.cost))} <span className="text-sm text-gray-500 font-medium">G-CORE</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold uppercase text-gray-400 mb-1">Stock</p>
                          <p className={cn(
                            "font-bold",
                            reward.stock > 0 ? "text-google-green" : "text-google-red"
                          )}>
                            {reward.stock > 0 ? `${reward.stock} available` : 'Sold Out'}
                          </p>
                        </div>
                      </div>

                      <Button
                        className={cn(
                          "w-full rounded-xl h-12 font-bold text-base transition-all border-2 bg-white",
                          reward.stock > 0 
                            ? cn(theme.borderColor, theme.textColor, theme.buttonHover, "hover:text-white", theme.buttonShadow)
                            : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                        )}
                        onClick={() => handleRedeem(reward.id, reward.name)}
                        disabled={reward.stock === 0 || redeeming === reward.id}
                      >
                        {redeeming === reward.id ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processing...
                          </>
                        ) : reward.stock === 0 ? (
                          'Out of Stock'
                        ) : (
                          'Redeem Now'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {data?.rewards.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-20 w-20 rounded-full bg-gray-50 flex items-center justify-center mb-4 border border-google-grey">
                <Search className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-google-grey">No rewards found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
              <Button 
                variant="link" 
                onClick={() => {
                  setSearch('');
                  setCategory('All');
                }}
                className="mt-4 text-google-blue"
              >
                Clear all filters
              </Button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-full h-10 w-10 border-google-grey"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-bold text-google-grey">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-full h-10 w-10 border-google-grey"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
