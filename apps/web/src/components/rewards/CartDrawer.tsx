import { X, Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';
import { formatTokenAmount, cn } from '@/lib/utils';
import { ethers } from 'ethers';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useWalletStore } from '@/stores/walletStore';

export function CartDrawer() {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, clearCart, totalCost } = useCartStore();
  const { user } = useWalletStore();
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: 'Please connect wallet',
        description: 'You need to connect your wallet to redeem rewards.',
        variant: 'destructive',
      });
      return;
    }

    setIsCheckingOut(true);
    let successCount = 0;
    
    try {
      // Process items sequentially to avoid race conditions
      for (const item of items) {
        try {
          toast({
            title: 'Processing Redemption',
            description: `Redeeming ${item.name}...`,
          });

          // The backend now handles the blockchain transaction (burn) 
          // to save the user from gas fees.
          await api.redeemReward(item.id, item.quantity);
          successCount++;
        } catch (error: any) {
          console.error(`Failed to redeem ${item.name}:`, error);
          toast({
            title: `Failed to redeem ${item.name}`,
            description: error.message || 'Unknown error',
            variant: 'destructive',
          });
          break;
        }
      }

      if (successCount === items.length) {
        toast({
          title: 'Purchase Successful',
          description: `Successfully redeemed ${successCount} items!`,
        });
        clearCart();
        toggleCart();
        window.location.reload(); 
      } else if (successCount > 0) {
        toast({
          title: 'Partial Success',
          description: `Redeemed ${successCount} items, but some failed.`,
        });
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (error: any) {
       toast({
        title: 'Checkout Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-sm transition-all" onClick={toggleCart}>
      <div 
        className="h-full w-full max-w-md bg-white shadow-2xl transition-transform duration-300 animate-in slide-in-from-right sm:rounded-l-[2rem]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 p-6">
            <h2 className="text-xl font-bold text-google-grey flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Your Cart
              <span className="rounded-full bg-google-blue/10 px-2 py-0.5 text-xs font-bold text-google-blue">
                {items.length} items
              </span>
            </h2>
            <Button variant="ghost" size="icon" onClick={toggleCart} className="rounded-full hover:bg-gray-100">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="h-20 w-20 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200">
                  <ShoppingBag className="h-9 w-9 text-gray-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-google-grey">Your cart is empty</h3>
                  <p className="text-sm text-gray-500">Add some rewards to get started!</p>
                </div>
                <Button 
                    variant="outline" 
                    onClick={toggleCart}
                    className="mt-4 rounded-xl border-google-grey hover:bg-gray-50"
                >
                  Continue Shopping
                </Button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex gap-4 rounded-xl border border-gray-100 p-3 shadow-sm bg-white">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-50 border border-gray-200">
                     {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                     ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <ShoppingBag className="h-8 w-8 text-gray-300" />
                        </div>
                     )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between py-1">
                    <div className="flex justify-between gap-2">
                      <h3 className="font-bold text-google-grey line-clamp-2 leading-tight">{item.name}</h3>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-end justify-between">
                        <div className="flex items-center gap-3">
                             <button
                                className="h-6 w-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                            >
                                -
                            </button>
                            <span className="w-4 text-center text-sm font-bold">{item.quantity}</span>
                            <button
                                className="h-6 w-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.maxStock}
                            >
                                +
                            </button>
                        </div>
                        <p className="font-bold text-google-blue text-sm">
                            {formatTokenAmount(item.cost * item.quantity)} G
                        </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-100 bg-gray-50 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Total Cost</span>
                <span className="text-xl font-bold text-google-grey">{formatTokenAmount(totalCost())} G-CORE</span>
              </div>
              
              <Button 
                onClick={handleCheckout} 
                disabled={isCheckingOut}
                className="w-full h-12 rounded-xl bg-google-blue hover:bg-google-blue/90 text-white font-bold text-lg shadow-[4px_4px_0px_0px_#4285F4] hover:shadow-[2px_2px_0px_0px_#4285F4] hover:translate-y-[2px] transition-all border-2 border-google-blue"
              >
                {isCheckingOut ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                    </>
                ) : (
                    'Confirm Purchase'
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
