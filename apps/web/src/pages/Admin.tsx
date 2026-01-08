import { useState, useEffect } from 'react';
import { CustomTabs } from '@/components/ui/custom-tabs';
import { useWalletStore } from '@/stores/walletStore';
import { Shield, AlertCircle } from 'lucide-react';
import { ProductManager } from '@/components/admin/ProductManager';
import { OrderManager } from '@/components/admin/OrderManager';
import { UserManager } from '@/components/admin/UserManager';
import { EventManager } from '@/components/admin/EventManager';
import { ContestManager } from '@/components/admin/ContestManager';

type AdminTab = 'products' | 'orders' | 'users' | 'events' | 'contests';

export default function Admin() {
  const { user } = useWalletStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('products');

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
              Manage events, users, products, and orders.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto pb-4 no-scrollbar">
        <CustomTabs 
            tabs={[
                { id: 'products', label: 'Manage Products' },
                { id: 'orders', label: 'Orders & Redemptions' },
                { id: 'users', label: 'Users' },
                { id: 'events', label: 'Events' },
                { id: 'contests', label: 'Contests' },
            ]}
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id as AdminTab)}
            className="bg-white border border-gray-200 shadow-sm"
        />
      </div>

      {/* Content Section */}
      <div className="min-h-[500px]">
        {activeTab === 'products' && <ProductManager />}
        {activeTab === 'orders' && <OrderManager />}
        {activeTab === 'users' && <UserManager />}
        {activeTab === 'events' && <EventManager />}
        {activeTab === 'contests' && <ContestManager />}
      </div>
    </div>
  );
}
