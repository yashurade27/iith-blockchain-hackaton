import { Trophy } from 'lucide-react';

export function ContestManager() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-google-grey bg-white p-12 text-center shadow-sm">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-pastel-yellow opacity-40 blur-3xl" />
        
        <div className="relative flex flex-col items-center justify-center space-y-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-pastel-yellow border border-google-grey shadow-[8px_8px_0px_0px_rgba(32,33,36,1)]">
             <Trophy className="h-12 w-12 text-google-grey" />
          </div>
          
          <div className="max-w-md mx-auto">
             <h2 className="text-3xl font-black text-google-grey mb-4">Contest Verification</h2>
             <p className="text-gray-500 font-medium text-lg leading-relaxed">
               This module is scheduled for development in a future update. Once completed, it will automatically reward students based on their Codeforces rankings.
             </p>
          </div>

          <div className="pt-4">
            <span className="px-6 py-2 rounded-full bg-gray-100 text-gray-400 font-bold text-sm uppercase tracking-widest border border-gray-200">
                Coming Soon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
