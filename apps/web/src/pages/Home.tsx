import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useWalletStore } from '@/stores/walletStore';
import { formatTokenAmount } from '@/lib/utils';
import { ArrowRight, Trophy, Gift, Code2, Terminal, ShoppingBag } from 'lucide-react';

export default function Home() {
  const { isConnected, balance } = useWalletStore();
  const heroBalance = formatTokenAmount(balance?.formatted || '0');

  const stats = [
    { label: 'Active Developers', value: '500+', color: 'bg-pastel-blue', icon: Code2 },
    { label: 'G-CORE Distributed', value: '125k+', color: 'bg-pastel-red', icon: Gift },
    { label: 'Rewards Claimed', value: '85+', color: 'bg-pastel-green', icon: ShoppingBag },
    { label: 'Events Hosted', value: '24+', color: 'bg-pastel-yellow', icon: Terminal },
  ];

  const features = [
    {
      title: 'Earn G-CORE',
      description: 'Participate in coding contests, workshops, and hackathons to earn G-CORE tokens directly to your wallet.',
      color: 'bg-pastel-red',
      link: '/leaderboard',
      cta: 'Start Earning'
    },
    {
      title: 'Climb the Ranks',
      description: 'Top contributors are showcased on our live leaderboard. Show off your skills and community impact.',
      color: 'bg-pastel-blue',
      link: '/leaderboard',
      cta: 'View Leaderboard'
    },
    {
      title: 'Redeem Swag',
      description: 'Exchange your hard-earned G-CORE tokens for exclusive GDG merchandise, hoodies, and developer goodies.',
      color: 'bg-pastel-green',
      link: '/rewards',
      cta: 'Visit Store'
    },
  ];

  const tags = ['Blockchain', 'Web3', 'Community', 'Rewards', 'Open Source', 'Learning'];

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[3rem] border border-google-grey bg-white px-6 py-16 text-center shadow-sm md:px-12 md:py-24">
        {/* Decorative background elements */}
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-pastel-blue opacity-50 blur-3xl" />
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-pastel-yellow opacity-50 blur-3xl" />

        <div className="relative mx-auto max-w-4xl space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-google-grey bg-white px-4 py-1.5 text-sm font-medium shadow-sm">
            <span className="h-2 w-2 rounded-full bg-google-green animate-pulse" />
            G-CORE: GDG Community Of Rewarded Engineers
          </div>
          
          <h1 className="text-5xl font-bold tracking-tight text-google-grey md:text-7xl">
            <span className="text-google-blue">G-CORE</span>
          </h1>
          
          <div className="space-y-4">
            <p className="text-xl font-semibold text-google-grey">
              Powered by GDG PCCOER
            </p>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 md:text-xl">
              Official reward token of GDG PCCOER. Earn tokens for your contributions and redeem them for real-world swag.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {isConnected ? (
              <div className="flex items-center gap-4 rounded-full border border-google-grey bg-pastel-yellow px-8 py-3 text-lg font-bold text-google-grey shadow-[4px_4px_0px_0px_rgba(32,33,36,1)] transition-transform hover:-translate-y-0.5">
                Balance: {heroBalance} G-CORE
              </div>
            ) : (
              <Button size="lg" className="h-14 rounded-full px-8 text-lg shadow-[4px_4px_0px_0px_rgba(32,33,36,1)] transition-all hover:translate-y-0.5 hover:shadow-none" asChild>
                <Link to="/leaderboard">
                  Connect Wallet
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            )}
            <Button variant="outline" size="lg" className="h-14 rounded-full px-8 text-lg" asChild>
              <Link to="/rewards">
                Browse Rewards
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`flex flex-col items-center justify-center rounded-[2rem] border border-google-grey p-6 ${stat.color} transition-transform hover:-translate-y-1`}
            >
              <div className="mb-3 rounded-full bg-white/50 p-3">
                <stat.icon className="h-6 w-6 text-google-grey" />
              </div>
              <span className="text-3xl font-bold text-google-grey">{stat.value}</span>
              <span className="mt-1 text-sm font-medium text-gray-700">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-12 space-y-4 text-center md:text-left">
          <h2 className="text-3xl font-bold text-google-grey md:text-4xl">How G-CORE Works</h2>
          <div className="flex flex-wrap justify-center gap-3 md:justify-start">
            {tags.map((tag, i) => {
              const colors = [
                'bg-pastel-blue',
                'bg-pastel-red',
                'bg-pastel-yellow',
                'bg-pastel-green',
              ];
              return (
                <span
                  key={tag}
                  className={`rounded-full border border-google-grey px-4 py-1.5 text-sm font-medium text-google-grey ${colors[i % colors.length]}`}
                >
                  {tag}
                </span>
              );
            })}
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] border border-google-grey bg-white p-8 transition-all hover:shadow-lg"
            >
              <div className={`absolute -right-12 -top-12 h-40 w-40 rounded-full ${feature.color} opacity-50 blur-2xl transition-all group-hover:opacity-80`} />
              
              <div className="relative space-y-4">
                <h3 className="text-2xl font-bold text-google-grey">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>

              <div className="relative mt-8">
                <Button variant="outline" className="w-full justify-between rounded-full border-google-grey group-hover:bg-google-grey group-hover:text-white" asChild>
                  <Link to={feature.link}>
                    {feature.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
