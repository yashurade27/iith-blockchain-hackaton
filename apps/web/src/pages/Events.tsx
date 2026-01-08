import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useWalletStore } from '@/stores/walletStore';
import { Calendar, Users, Trophy, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CustomTabs } from '@/components/ui/custom-tabs';
import { Pagination } from '@/components/ui/Pagination';

export default function Events() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useWalletStore();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(6);

  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => api.getEvents().then(res => res.events),
  });

  const joinEventMutation = useMutation({
    mutationFn: (eventId: string) => api.joinEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Joined Event",
        description: "You have explicitly joined the event.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Join Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
      return (
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
      );
  }

  // Filter events based on active tab
  const filteredEvents = events?.filter((event: any) => {
    const isPast = new Date(event.date) < new Date();
    if (activeTab === 'upcoming') return !isPast;
    if (activeTab === 'past') return isPast;
    return true;
  }) || [];

  // Pagination logic
  const totalItems = filteredEvents.length;
  const totalPages = Math.ceil(totalItems / limit);
  const offset = (currentPage - 1) * limit;
  const paginatedEvents = filteredEvents.slice(offset, offset + limit);

  return (
    <div className="space-y-8 py-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-google-grey bg-white px-8 py-12 shadow-sm">
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-pastel-yellow opacity-50 blur-3xl" />
        <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-pastel-green opacity-50 blur-3xl" />
        
        <div className="relative flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pastel-yellow border border-google-grey shadow-[4px_4px_0px_0px_rgba(32,33,36,1)]">
            <Calendar className="h-10 w-10 text-google-grey" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-google-grey md:text-5xl">
              Events
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Discover and participate in upcoming events to earn G-CORE points.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <CustomTabs 
          tabs={[
            { id: 'upcoming', label: 'Upcoming Events', count: events?.filter((e: any) => new Date(e.date) >= new Date()).length },
            { id: 'past', label: 'Past Events', count: events?.filter((e: any) => new Date(e.date) < new Date()).length },
          ]}
          activeTab={activeTab}
          onChange={(id) => {
            setActiveTab(id);
            setCurrentPage(1);
          }}
          className="bg-white border border-gray-200 shadow-sm"
        />
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {paginatedEvents.map((event: any) => {
            const isParticipating = event.participations?.some((p: any) => p.userId === user?.id);
            const isPast = new Date(event.date) < new Date();
            const isFull = (event._count?.participations || 0) >= event.totalSlots;
            const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

            // Custom colors based on index or event properties
            const colors = ['bg-pastel-blue', 'bg-pastel-red', 'bg-pastel-yellow', 'bg-pastel-green'];
            const cardColor = isPast ? 'bg-white' : colors[(events || []).indexOf(event) % colors.length];

            return (
                <div 
                    key={event.id} 
                    className={cn(
                        "group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] border border-google-grey p-8 transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(32,33,36,1)]",
                        cardColor
                    )}
                >
                    {/* Decorative element */}
                    {!isPast && <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/20 opacity-50 blur-2xl" />}
                    
                    <div className="relative">
                        <div className="flex justify-between items-start mb-6">
                             <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white border border-google-grey shadow-sm">
                                <Calendar className="h-7 w-7 text-google-grey" />
                             </div>
                             <Badge className={cn(
                                "border-google-grey px-4 py-1 text-xs font-bold uppercase tracking-wider",
                                isPast ? "bg-gray-100 text-gray-500" : "bg-white text-google-grey shadow-sm"
                             )}>
                                {isPast ? 'Past Event' : 'Join Now'}
                             </Badge>
                        </div>

                        <h3 className="text-2xl font-bold text-google-grey mb-3 line-clamp-1">{event.title}</h3>
                        <p className="text-gray-700 text-sm mb-8 line-clamp-2 leading-relaxed font-medium">
                            {event.description || "No description provided."}
                        </p>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center text-sm font-bold text-google-grey bg-white/40 rounded-full px-4 py-2 border border-google-grey/10">
                                <Clock className="h-4 w-4 mr-2 text-google-blue" />
                                {format(new Date(event.date), "PPP p")}
                            </div>
                            <div className="flex items-center text-sm font-bold text-google-grey bg-white/40 rounded-full px-4 py-2 border border-google-grey/10">
                                <Trophy className="h-4 w-4 mr-2 text-google-yellow" />
                                <span>{event.rewardAmount} G-CORE Rewards</span>
                            </div>
                            <div className="flex items-center text-sm font-bold text-google-grey bg-white/40 rounded-full px-4 py-2 border border-google-grey/10">
                                <Users className="h-4 w-4 mr-2 text-google-green" />
                                <span>{event._count?.participations || 0} / {event.totalSlots} Slots Taken</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative mt-auto pt-6 border-t border-google-grey/10">
                        {isAdmin ? (
                             <Button className="w-full rounded-2xl border-google-grey bg-white text-google-grey shadow-[4px_4px_0px_0px_rgba(32,33,36,1)]" disabled>
                                Admin View Only
                             </Button>
                        ) : isParticipating ? (
                            <Button className="w-full rounded-2xl border-google-grey bg-white text-google-green font-bold shadow-none cursor-default" disabled>
                                Already Registered
                            </Button>
                        ) : isPast ? (
                             <Button className="w-full rounded-2xl border-google-grey bg-white/50 text-gray-500" disabled>Event Ended</Button>
                        ) : isFull ? (
                             <Button className="w-full rounded-2xl border-google-grey bg-white/50 text-google-red" disabled>Full Capacity</Button>
                        ) : (
                            <Button 
                                className="w-full rounded-full border border-google-grey bg-google-grey text-white font-bold transition-all hover:bg-google-grey/90 hover:shadow-[4px_4px_0px_0px_rgba(66,133,244,1)] active:translate-y-0.5 active:shadow-none" 
                                onClick={() => joinEventMutation.mutate(event.id)}
                                disabled={joinEventMutation.isPending || !user}
                            >
                                {joinEventMutation.isPending ? 'Processing...' : 'Register for Event'}
                            </Button>
                        )}
                    </div>
                </div>
            );
        })}
        {(!filteredEvents || filteredEvents.length === 0) && (
            <div className="col-span-full py-16 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                 No {activeTab} events found.
            </div>
        )}
      </div>

       {/* Pagination */}
       {totalPages > 1 && (
            <div className="bg-white rounded-3xl border border-google-grey overflow-hidden shadow-sm">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                limit={limit}
                onLimitChange={(l) => {
                  setLimit(l);
                  setCurrentPage(1);
                }}
                totalItems={totalItems}
              />
            </div>
          )}
    </div>
  );
}
