import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import WalletConnect from '@/components/wallet/WalletConnect';
import { useWalletStore } from '@/stores/walletStore';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const location = useLocation();
  const { user } = useWalletStore();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          // if scroll down hide the navbar
          setIsVisible(false);
        } else {
          // if scroll up show the navbar
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    window.addEventListener('scroll', controlNavbar);

    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, [lastScrollY]);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/leaderboard', label: 'Leaderboard' },
    { path: '/rewards', label: 'Rewards' },
    { path: '/profile', label: 'Profile' },
  ];

  if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
    navItems.push({ path: '/admin', label: 'Admin' });
  }

  return (
    <nav
      className={cn(
        'sticky top-4 z-50 mx-auto max-w-5xl px-4 transition-transform duration-300',
        !isVisible && '-translate-y-[200%]'
      )}
    >
      <div className="flex items-center justify-between rounded-full border border-google-grey bg-white px-2 py-2 shadow-sm">
        <Link to="/" className="ml-4 flex items-center gap-2">
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-google-blue leading-none">G-CORE</span>
            <span className="text-[0.65rem] font-bold tracking-wider text-google-grey uppercase">GDG PCCOER Rewards</span>
          </div>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map(({ path, label }) => (
            <Button
              key={path}
              asChild
              variant={location.pathname === path ? 'secondary' : 'ghost'}
              size="sm"
              className="text-sm font-medium"
            >
              <Link to={path}>{label}</Link>
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <WalletConnect />
        </div>
      </div>
    </nav>
  );
}
