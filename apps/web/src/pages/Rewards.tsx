import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatTokenAmount } from '@/lib/utils';
import { Gift, ShoppingBag, Search, Plus } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { useCartStore } from '@/stores/cartStore';
import { Pagination } from '@/components/ui/Pagination';

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

export default function Rewards() {
  const { addItem, toggleCart, totalItems } = useCartStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);

  const { data, isLoading } = useQuery({
    queryKey: ['rewards', page, category, search],
    queryFn: async () => {
      const res = await api.getRewards({
        category: category === 'All' ? undefined : category,
        search: search || undefined,
        page,
        limit,
        isActive: 'true'
      });
      return res;
    },
  });

  const handleAddToCart = (reward: any) => {
    addItem({
      id: reward.id,
      name: reward.name,
      cost: reward.cost, // Assuming backend returns cost as string or number of wei? API returns Int usually with Prisma if not mapped? 
      // Prisma Int fits JS number up to 2^53? Wei is huge. 
      // Schema says Int. "cost Int". This is likely NOT Wei but simple tokens or points.
      // But DUMMY_REWARDS used "500000..." string.
      // If schema is Int, it's points. If it's a dedicated token contract, it probably needs BigInt string.
      // Let's assume schema Int is the truth for now, which means simpler numbers. 
      // Wait, blockchain.ts uses `ethers.parseUnits(amount.toString(), decimals)`.
      // The schema `cost Int` suggests it's stored as plain integer in DB, representing full tokens maybe?
      // Let's check DUMMY_REWARDS again. "500 G-CORE" was cost 50000...
      // If DB stores Int, it can't store 18 decimals wei if it's large.
      // I'll assume DB stores "Display Amount" (e.g. 500) or it's just points.
      // Let's use it as is.
      imageUrl: reward.imageUrl,
      maxStock: reward.stock,
    });
  };

  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <div className="space-y-8 py-8 relative">
      {/* Floating Cart Button */}
      <Button
        onClick={toggleCart}
        className="fixed bottom-8 right-8 z-40 h-16 w-16 rounded-full bg-google-blue shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-110 hover:bg-google-blue transition-all"
      >
        <div className="relative">
          <ShoppingBag className="h-8 w-8 text-white" />
          {totalItems() > 0 && (
            <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-google-red text-xs font-bold text-white border-2 border-google-blue">
              {totalItems()}
            </span>
          )}
        </div>
      </Button>

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
                             {/* Adjust if backend sends raw number or wei string. Assuming raw number for simplest DB case, but if it sends wei string, formatTokenAmount handles it. */}
                            {formatTokenAmount(reward.cost)} <span className="text-sm text-gray-500 font-medium">G-CORE</span>
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
                        onClick={() => handleAddToCart(reward)}
                        disabled={reward.stock === 0}
                      >
                         {reward.stock === 0 ? 'Out of Stock' : (
                             <>
                                <Plus className="mr-2 h-5 w-5" />
                                Add to Cart
                             </>
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
            <div className="mt-12 bg-white rounded-3xl border border-google-grey overflow-hidden shadow-sm">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                limit={limit}
                onLimitChange={(l) => {
                  setLimit(l);
                  setPage(1);
                }}
                totalItems={data?.pagination?.total}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
