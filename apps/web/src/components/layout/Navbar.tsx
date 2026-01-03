import { Link, useLocation } from 'react-router-dom';
import { Wallet, Trophy, Gift, User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WalletConnect from '@/components/wallet/WalletConnect';
import { useWalletStore } from '@/stores/walletStore';

export default function Navbar() {
  const location = useLocation();
  const { user } = useWalletStore();

  const navItems = [
    { path: '/', label: 'Home', icon: Wallet },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { path: '/rewards', label: 'Rewards', icon: Gift },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
    navItems.push({ path: '/admin', label: 'Admin', icon: Shield });
  }

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">GDG Rewards</span>
          </Link>
          <div className="flex gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Button
                key={path}
                asChild
                variant={location.pathname === path ? 'default' : 'ghost'}
                size="sm"
              >
                <Link to={path} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
        <WalletConnect />
      </div>
    </nav>
  );
}
