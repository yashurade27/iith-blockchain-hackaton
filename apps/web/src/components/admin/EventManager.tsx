import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { CustomTabs } from '@/components/ui/custom-tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Plus, Calendar, Trophy, Users, Edit, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export function EditEventDialog({ event, onUpdated }: { event: any, onUpdated: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description || '',
    date: format(new Date(event.date), "yyyy-MM-dd'T'HH:mm"),
    rewardAmount: event.rewardAmount,
    totalSlots: event.totalSlots
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.updateEvent(event.id, data),
    onSuccess: () => {
      onUpdated();
      setIsOpen(false);
      toast({ title: "Event Updated" });
    },
    onError: (e: any) => toast({ title: "Update Failed", description: e.message, variant: "destructive" })
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-gray-100">
          <Edit className="h-4 w-4 text-gray-500" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Event</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate({ ...formData, date: new Date(formData.date).toISOString() }); }} className="space-y-4 py-4">
            <div className="space-y-2">
                <Label>Title</Label>
                <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            </div>
            <div className="space-y-2">
                <Label>Description</Label>
                <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="datetime-local" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
                </div>
                <div className="space-y-2">
                    <Label>Reward</Label>
                    <Input type="number" value={formData.rewardAmount} onChange={e => setFormData({...formData, rewardAmount: parseInt(e.target.value)})} required />
                </div>
            </div>
            <div className="space-y-2">
                <Label>Total Slots</Label>
                <Input type="number" value={formData.totalSlots} onChange={e => setFormData({...formData, totalSlots: parseInt(e.target.value)})} required />
            </div>
            <DialogFooter>
                <Button type="submit" disabled={updateMutation.isPending}>Save Changes</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ManageParticipantsDialog({ event, onRewardDistributed }: { event: any, onRewardDistributed: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const { data: participations, isLoading } = useQuery({
    queryKey: ['admin', 'events', event.id, 'participants'],
    queryFn: () => api.getEventParticipants(event.id).then(res => res.participations),
    enabled: isOpen,
  });

  const distributeMutation = useMutation({
    mutationFn: (userIds: string[]) => api.distributeEventRewards(event.id, userIds),
    onSuccess: (data: any) => {
        const successCount = data.results?.filter((r: any) => r.status === 'SUCCESS').length || 0;
        toast({
            title: "Rewards Distributed",
            description: `Successfully distributed rewards to ${successCount} participants.`,
        });
        setIsOpen(false);
        onRewardDistributed();
    },
    onError: (error: any) => {
        toast({
            title: "Distribution Failed",
            description: error.message,
            variant: "destructive"
        });
    }
  });

  useEffect(() => {
    if (participations) {
        const initialSelections: Record<string, boolean> = {};
        participations.forEach((p: any) => {
            // Initially every user is selected only if they are not already approved
            if (p.status !== 'APPROVED') {
                initialSelections[p.userId] = true;
            } else {
                initialSelections[p.userId] = false;
            }
        });
        setSelectedUsers(initialSelections);
    }
  }, [participations]);

  const handleToggleUser = (userId: string) => {
    setSelectedUsers(prev => ({
        ...prev,
        [userId]: !prev[userId]
    }));
  };

  const handleDistribute = () => {
    const userIds = Object.keys(selectedUsers).filter(id => selectedUsers[id]);
    if (userIds.length === 0) {
        toast({ title: "No users selected", variant: "destructive" });
        return;
    }
    distributeMutation.mutate(userIds);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
            <Button className="w-full mt-4 rounded-xl border border-google-grey bg-white text-google-grey font-bold shadow-[4px_4px_0px_0px_rgba(32,33,36,1)] hover:translate-y-0.5 hover:shadow-none transition-all">
                <Users className="mr-2 h-4 w-4" /> Manage & Reward
            </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-[2rem] border-2 border-google-grey">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Participants: {event.title}</DialogTitle>
                <p className="text-sm text-gray-500 font-medium">
                    Unmark participants who were absent. Selected users will receive {event.rewardAmount} points.
                </p>
            </DialogHeader>
            
            {isLoading ? (
                <div className="py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-google-blue mx-auto"></div>
                </div>
            ) : (
                <div className="space-y-6 mt-4">
                    <div className="border-2 border-google-grey rounded-2xl divide-y-2 divide-google-grey overflow-hidden bg-white">
                        {participations?.map((p: any) => (
                            <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="relative flex items-center">
                                        <input 
                                            type="checkbox" 
                                            id={`user-${p.userId}`}
                                            checked={selectedUsers[p.userId] || false}
                                            onChange={() => handleToggleUser(p.userId)}
                                            disabled={p.status === 'APPROVED'}
                                            className="h-6 w-6 rounded-md border-2 border-google-grey text-google-blue focus:ring-google-blue disabled:opacity-30 appearance-none bg-white checked:bg-google-blue mr-2 cursor-pointer transition-colors"
                                        />
                                        {selectedUsers[p.userId] && <CheckCircle2 className="absolute h-4 w-4 text-white left-1 pointer-events-none" />}
                                    </div>
                                    <label htmlFor={`user-${p.userId}`} className="cursor-pointer">
                                        <p className="font-bold text-google-grey">{p.user.name || 'Anonymous User'}</p>
                                        <p className="text-xs text-gray-400 font-mono italic">{p.user.walletAddress}</p>
                                    </label>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <Badge className={cn(
                                        "px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter border-2 border-google-grey",
                                        p.status === 'APPROVED' ? "bg-pastel-green text-google-grey" : "bg-pastel-yellow text-google-grey"
                                    )}>
                                        {p.status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                        {(!participations || participations.length === 0) && (
                            <div className="p-16 text-center text-gray-400">
                                <Users className="h-16 w-16 mx-auto opacity-20 mb-4" />
                                <p className="font-bold">No participants yet</p>
                            </div>
                        )}
                    </div>
                    
                    <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full pt-6 border-t border-gray-100">
                        <div className="text-sm font-black text-google-grey bg-pastel-blue/30 px-4 py-2 rounded-full border border-google-blue/20">
                            {Object.values(selectedUsers).filter(Boolean).length} Selected for rewards
                        </div>
                        <div className="flex gap-3">
                           <Button variant="ghost" onClick={() => setIsOpen(false)} className="font-bold">Cancel</Button>
                           <Button 
                                onClick={handleDistribute} 
                                disabled={distributeMutation.isPending || Object.values(selectedUsers).filter(Boolean).length === 0}
                                className="bg-google-grey text-white font-black rounded-xl px-8 shadow-[4px_4px_0px_0px_#4285F4] active:shadow-none active:translate-y-1 transition-all"
                            >
                                {distributeMutation.isPending ? "Processing..." : `Distribute Rewards`}
                            </Button>
                        </div>
                    </DialogFooter>
                </div>
            )}
        </DialogContent>
    </Dialog>
  );
}

export function EventManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'current' | 'past'>('current');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    rewardAmount: 100,
    totalSlots: 50
  });

  const { data: events, isLoading } = useQuery({
    queryKey: ['admin', 'events'],
    queryFn: () => api.getAdminEvents().then(res => res.events),
  });

  const createEventMutation = useMutation({
    mutationFn: (data: any) => api.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      setIsCreateOpen(false);
      setNewEvent({ title: '', description: '', date: '', rewardAmount: 100, totalSlots: 50 });
      toast({ title: "Event Created" });
    },
    onError: (error: any) => toast({ title: "Failed", description: error.message, variant: "destructive" })
  });

  const filteredEvents = events?.filter((e: any) => {
    const isPast = new Date(e.date) < new Date();
    return activeTab === 'current' ? !isPast : isPast;
  }) || [];

  if (isLoading) return <div className="p-12 text-center font-bold text-gray-400">Loading events...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
            <h2 className="text-3xl font-black text-google-grey tracking-tight">Events Laboratory</h2>
            <p className="text-gray-500 font-medium">Create and manage community gatherings</p>
        </div>
        
        <div className="flex gap-4">
            <CustomTabs
                tabs={[
                    { id: 'current', label: 'Current' },
                    { id: 'past', label: 'Past' },
                ]}
                activeTab={activeTab}
                onChange={(id) => setActiveTab(id as 'current' | 'past')}
                className="bg-gray-100 border border-gray-200"
            />
            
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
                <Button className="bg-google-blue hover:bg-blue-700 text-white font-black px-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(32,33,36,1)] hover:shadow-none hover:translate-y-0.5 transition-all">
                <Plus className="mr-2 h-5 w-5" /> Schedule Event
                </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] border-2 border-google-grey">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black">New Experiment</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); createEventMutation.mutate({ ...newEvent, date: new Date(newEvent.date).toISOString() }); }} className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label className="font-bold">Event Title</Label>
                    <Input 
                        className="rounded-xl border-2 border-gray-100 focus:border-google-blue h-12"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                        placeholder="e.g. Flutter Workshop"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label className="font-bold">Description</Label>
                    <Input 
                        className="rounded-xl border-2 border-gray-100 h-12"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                        placeholder="What's happening?"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <Label className="font-bold">Date & Time</Label>
                    <Input 
                        type="datetime-local"
                        className="rounded-xl border-2 border-gray-100 h-12"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                        required
                    />
                    </div>
                    <div className="space-y-2">
                    <Label className="font-bold">G-CORE Reward</Label>
                    <Input 
                        type="number"
                        className="rounded-xl border-2 border-gray-100 h-12"
                        value={newEvent.rewardAmount}
                        onChange={(e) => setNewEvent({...newEvent, rewardAmount: parseInt(e.target.value)})}
                        required
                    />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="font-bold">Maximum Slots</Label>
                    <Input 
                    type="number"
                    className="rounded-xl border-2 border-gray-100 h-12"
                    value={newEvent.totalSlots}
                    onChange={(e) => setNewEvent({...newEvent, totalSlots: parseInt(e.target.value)})}
                    required
                    />
                </div>
                <DialogFooter className="pt-4">
                    <Button type="submit" disabled={createEventMutation.isPending} className="w-full h-12 font-black text-lg bg-google-grey text-white rounded-2xl shadow-[4px_4px_0px_0px_#FBBC04]">
                    {createEventMutation.isPending ? 'Propagating...' : 'Launch Event'}
                    </Button>
                </DialogFooter>
                </form>
            </DialogContent>
            </Dialog>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents?.map((event: any, idx: number) => {
            const colors = ['bg-pastel-blue', 'bg-pastel-red', 'bg-pastel-yellow', 'bg-pastel-green'];
            const cardColor = activeTab === 'past' ? 'bg-white' : colors[idx % colors.length];

            return (
                <div 
                    key={event.id} 
                    className={cn(
                        "group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] border border-google-grey p-8 transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(32,33,36,1)]",
                        cardColor
                    )}
                >
                    <div className="relative">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white border border-google-grey shadow-sm">
                                <Calendar className="h-7 w-7 text-google-grey" />
                            </div>
                            <div className="flex gap-2">
                                <EditEventDialog event={event} onUpdated={() => queryClient.invalidateQueries({ queryKey: ['admin', 'events'] })} />
                                <Badge className="bg-white text-google-grey border-google-grey font-black shadow-sm">
                                    {activeTab === 'current' ? 'Live' : 'Archived'}
                                </Badge>
                            </div>
                        </div>
                        
                        <h3 className="text-2xl font-black text-google-grey mb-2 line-clamp-1">{event.title}</h3>
                        <p className="text-gray-700 text-sm mb-6 line-clamp-2 font-medium leading-relaxed italic opacity-80">
                            {event.description || 'No description provided.'}
                        </p>
                        
                        <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm font-bold text-google-grey bg-white/40 rounded-full px-4 py-2 border border-google-grey/5">
                            <Clock className="h-4 w-4 text-google-blue" />
                            <span>{format(new Date(event.date), "PPP p")}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-google-grey bg-white/40 rounded-full px-4 py-2 border border-google-grey/5">
                            <Trophy className="h-4 w-4 text-google-yellow" />
                            <span>{event.rewardAmount} G-CORE per Head</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-google-grey bg-white/40 rounded-full px-4 py-2 border border-google-grey/5">
                            <Users className="h-4 w-4 text-google-green" />
                            <span>{event._count?.participations || 0} / {event.totalSlots} Registered</span>
                        </div>
                        </div>
                    </div>
                    
                    <ManageParticipantsDialog 
                        event={event} 
                        onRewardDistributed={() => queryClient.invalidateQueries({ queryKey: ['admin', 'events'] })} 
                    />
                </div>
            )
        })}
        {filteredEvents.length === 0 && (
            <div className="col-span-full py-24 text-center rounded-[3rem] border-2 border-dashed border-gray-200 bg-gray-50/50">
                <div className="max-w-xs mx-auto space-y-4">
                    <div className="h-20 w-20 bg-white rounded-full border border-gray-200 flex items-center justify-center mx-auto opacity-50">
                        <Calendar className="h-10 w-10 text-gray-400" />
                    </div>
                    <div>
                        <p className="text-xl font-black text-gray-400">Empty Laboratory</p>
                        <p className="text-sm text-gray-400 font-medium">No {activeTab} events found in the database.</p>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}

