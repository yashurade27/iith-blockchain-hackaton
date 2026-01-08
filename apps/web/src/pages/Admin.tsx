import { useState, useEffect } from 'react';
import { useWalletStore } from '@/stores/walletStore';
import { Shield, AlertCircle, LayoutDashboard, Gift, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DistributeForm } from '@/components/admin/DistributeForm';
import { ProductManager } from '@/components/admin/ProductManager';
import { OrderManager } from '@/components/admin/OrderManager';

type AdminTab = 'distribute' | 'products' | 'orders';

export default function Admin() {
  const { user, address } = useWalletStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('distribute');

  useEffect(() => {
    console.log('Admin Page - User:', user);
  }, [user]);

  if (!user) {
     return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="h-20 w-20 rounded-full bg-gray-50 flex items-center justify-center border border-google-grey">
          <Shield className="h-10 w-10 text-gray-400" />
        </div>
        <div>
          <p className="text-xl font-bold text-google-grey">Access Denied</p>
          <p className="text-gray-500">User not authenticated. Please connect wallet.</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center border border-red-200">
          <AlertCircle className="h-10 w-10 text-google-red" />
        </div>
        <div>
          <p className="text-xl font-bold text-google-grey">Access Denied</p>
          <p className="text-gray-500">You need admin privileges to access this page</p>
          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 inline-block text-left">
            <p className="text-xs text-gray-500 font-mono">Role: {user.role}</p>
            <p className="text-xs text-gray-500 font-mono">ID: {user.id}</p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'distribute', label: 'Distribute Tokens', icon: LayoutDashboard },
    { id: 'products', label: 'Manage Products', icon: Gift },
    { id: 'orders', label: 'Orders & Redemptions', icon: Package },
  ];

  return (
    <div className="space-y-8 py-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-google-grey bg-white px-8 py-12 shadow-sm">
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-pastel-blue opacity-50 blur-3xl" />
        <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-pastel-red opacity-50 blur-3xl" />
        
        <div className="relative flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pastel-blue border border-google-grey shadow-[4px_4px_0px_0px_rgba(32,33,36,1)]">
            <Shield className="h-10 w-10 text-google-grey" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-google-grey md:text-5xl">
              Admin Panel
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Manage distributions, products, and orders.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
        {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as AdminTab)}
                    className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all border-2",
                        activeTab === tab.id
                            ? "bg-google-grey text-white border-google-grey shadow-md"
                            : "bg-white text-gray-500 border-transparent hover:bg-gray-50"
                    )}
                >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                </button>
            )
        })}
      </div>

      {/* Content Section */}
      <div className="min-h-[500px]">
        {activeTab === 'distribute' && <DistributeForm />}
        {activeTab === 'products' && <ProductManager />}
        {activeTab === 'orders' && <OrderManager />}
      </div>
    </div>
  );
}
