import { useState } from 'react';
import { useUiStore } from '@/stores/uiStore';
import { useWalletStore } from '@/stores/walletStore';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';

export default function RegistrationModal() {
  const { showRegistrationModal, registrationWalletAddress, setShowRegistrationModal } = useUiStore();
  const { setUser } = useWalletStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    collegeEmail: '',
    rollNo: '',
    year: 'FE',
    branch: 'COMPUTER',
    codeforcesHandle: ''
  });

  if (!showRegistrationModal) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { token, user } = await api.register({
        walletAddress: registrationWalletAddress,
        ...formData
      });

      api.setToken(token);
      setUser(user);
      setShowRegistrationModal(false);
      toast({
        title: "Registration successful!",
        description: "Your account is pending admin approval.",
        variant: "default" // success
      });
    } catch (err: any) {
       toast({
        title: "Registration failed",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Complete Registration</h2>
          <button 
            onClick={() => setShowRegistrationModal(false)}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
            <Input 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
            />
          </div>
          
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">College Email</label>
            <Input 
                type="email"
                value={formData.collegeEmail} 
                onChange={e => setFormData({...formData, collegeEmail: e.target.value})}
                required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Roll No</label>
                <Input 
                    value={formData.rollNo} 
                    onChange={e => setFormData({...formData, rollNo: e.target.value})}
                    required
                />
             </div>
             <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Year</label>
                <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.year}
                    onChange={e => setFormData({...formData, year: e.target.value})}
                >
                    <option value="FE">FE</option>
                    <option value="SE">SE</option>
                    <option value="TE">TE</option>
                    <option value="BE">BE</option>
                </select>
             </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Branch</label>
            <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.branch}
                onChange={e => setFormData({...formData, branch: e.target.value})}
            >
                <option value="COMPUTER">Computer</option>
                <option value="IT">IT</option>
                <option value="CIVIL">Civil</option>
                <option value="MECHANICAL">Mechanical</option>
                <option value="ENTC">E&TC</option>
            </select>
          </div>

          <div>
             <label className="mb-1 block text-sm font-medium text-gray-700">Codeforces Handle (Optional)</label>
             <Input 
                value={formData.codeforcesHandle} 
                onChange={e => setFormData({...formData, codeforcesHandle: e.target.value})}
            />
          </div>

          <div className="pt-4">
             <Button 
                type="submit" 
                className="w-full bg-google-blue hover:bg-blue-600"
                disabled={loading}
            >
                {loading ? 'Registering...' : 'Submit for Approval'}
             </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
