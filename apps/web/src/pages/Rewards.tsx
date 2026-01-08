import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatTokenAmount } from '@/lib/utils';
import { Gift, ShoppingBag, Search, Plus, PackageX } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { useCartStore } from '@/stores/cartStore';
import { Pagination } from '@/components/ui/Pagination';
import { Badge } from '@/components/ui/badge';

const CATEGORIES = ['All', 'Swag', 'Electronics', 'Books', 'Digital', 'Other'];

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
      cost: reward.cost,
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
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {data?.rewards.map((reward: any, idx: number) => {
               const colors = ['bg-pastel-blue', 'bg-pastel-red', 'bg-pastel-yellow', 'bg-pastel-green'];
               const accentColor = colors[idx % colors.length];
               return (
                <div 
                    key={reward.id} 
                    className={cn(
                        "group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] border border-google-grey p-8 transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(32,33,36,1)]",
                        accentColor
                    )}
                >
                    <div className="relative">
                        <div className="flex justify-between items-start mb-6">
                             <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white border border-google-grey shadow-sm overflow-hidden">
                                {reward.imageUrl ? (
                                    <img src={reward.imageUrl} alt={reward.name} className="h-full w-full object-cover" />
                                ) : (
                                    <Gift className="h-8 w-8 text-google-grey opacity-20" />
                                )}
                             </div>
                             <div className="flex flex-col gap-2 items-end">
                                <Badge className="bg-white text-google-grey border-google-grey px-3 py-1 font-bold text-[10px] uppercase tracking-wider shadow-sm">
                                    {reward.category}
                                </Badge>
                                {reward.stock <= 5 && reward.stock > 0 && (
                                    <Badge className="bg-google-red text-white border-google-red px-2 py-0.5 font-bold text-[8px] uppercase tracking-wider animate-pulse">
                                        Low Stock
                                    </Badge>
                                )}
                             </div>
                        </div>

                        <h3 className="text-2xl font-bold text-google-grey mb-2 line-clamp-1">{reward.name}</h3>
                        <p className="text-gray-700 text-sm mb-8 line-clamp-2 leading-relaxed font-medium opacity-80 italic">
                            {reward.description || "No description provided."}
                        </p>

                        <div className="space-y-3 mb-8">
                            <div className="flex items-center justify-between text-sm font-bold text-google-grey bg-white/50 rounded-full px-5 py-2.5 border border-google-grey/10">
                                <div className="flex items-center">
                                    <ShoppingBag className="h-4 w-4 mr-2 text-google-blue" />
                                    <span>Cost</span>
                                </div>
                                <span className="text-lg text-google-blue">{formatTokenAmount(reward.cost)} G-CORE</span>
                            </div>
                            <div className="flex items-center justify-between text-sm font-bold text-google-grey bg-white/50 rounded-full px-5 py-2.5 border border-google-grey/10">
                                <div className="flex items-center">
                                    <PackageX className="h-4 w-4 mr-2 text-google-red" />
                                    <span>Availability</span>
                                </div>
                                <span className={cn(reward.stock > 0 ? "text-google-green" : "text-google-red")}>
                                    {reward.stock > 0 ? `${reward.stock} Left` : 'Sold Out'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="relative mt-auto pt-6 border-t border-google-grey/10">
                        <Button 
                            className={cn(
                                "w-full rounded-2xl h-14 font-black text-lg transition-all border-2",
                                reward.stock > 0 
                                    ? "bg-google-grey text-white border-google-grey hover:bg-google-grey font-black shadow-[4px_4px_0px_0px_rgba(66,133,244,1)] active:translate-y-1 active:shadow-none"
                                    : "bg-white text-gray-400 border-gray-200 cursor-not-allowed shadow-none"
                            )}
                            onClick={() => handleAddToCart(reward)}
                            disabled={reward.stock === 0}
                        >
                            {reward.stock === 0 ? 'Out of Stock' : (
                                <div className="flex items-center justify-center gap-2">
                                    <Plus className="h-6 w-6" />
                                    <span>Add to Cart</span>
                                </div>
                            )}
                        </Button>
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
