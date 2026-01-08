import { useState, useEffect } from 'react';
import { Bell, Check, ShoppingBag, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useWalletStore } from '@/stores/walletStore';

export function NotificationsDropdown() {
  const { user } = useWalletStore();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'redemptions'>('all');

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await api.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.isRead;
    if (activeTab === 'redemptions') return n.type === 'REDEMPTION';
    return true;
  });

  if (!user) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative rounded-full hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-google-red text-[10px] font-bold text-white border-2 border-white">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 z-50 w-[380px] sm:w-[420px] rounded-[1.5rem] border border-gray-200 bg-white shadow-2xl animate-in fade-in slide-in-from-top-2 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 bg-white/50 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-google-grey tracking-tight">Notifications</h3>
                  <p className="text-xs text-gray-500">You have {unreadCount} unread messages</p>
                </div>
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleMarkAllRead}
                    className="text-xs font-semibold text-google-blue hover:text-google-blue/80 hover:bg-google-blue/5"
                  >
                    Mark all read
                  </Button>
                )}
              </div>

              {/* Tabs */}
              <div className="flex gap-1 p-1 bg-gray-50 rounded-xl">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'unread', label: 'Unread' },
                  { id: 'redemptions', label: 'Redemptions' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all",
                      activeTab === tab.id 
                        ? "bg-white text-google-blue shadow-sm" 
                        : "text-gray-500 hover:text-google-grey"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="max-h-[450px] overflow-y-auto no-scrollbar pb-2">
              {filteredNotifications.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center px-6">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Bell className="h-8 w-8 text-gray-300" />
                  </div>
                  <h4 className="text-sm font-bold text-google-grey">No notifications found</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {activeTab === 'unread' ? "You've read everything! Well done." : 
                     activeTab === 'redemptions' ? "Your redemption history will appear here." :
                     "Check back later for new updates and alerts."}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50 px-2 pt-2">
                  {filteredNotifications.map((n) => (
                    <div 
                      key={n.id}
                      className={cn(
                        "p-4 rounded-2xl transition-all text-left bg-white hover:bg-gray-50 group relative mb-1",
                        !n.isRead && "bg-blue-50/40"
                      )}
                    >
                      <div className="flex gap-4">
                        <div className={cn(
                          "mt-0.5 h-10 w-10 shrink-0 flex items-center justify-center rounded-2xl shadow-sm",
                          n.type === 'REDEMPTION' ? "bg-amber-100 text-amber-600" : 
                          n.type === 'SUCCESS' ? "bg-emerald-100 text-emerald-600" : 
                          n.type === 'WARNING' ? "bg-orange-100 text-orange-600" :
                          n.type === 'ERROR' ? "bg-rose-100 text-rose-600" :
                          "bg-blue-100 text-blue-600"
                        )}>
                          {n.type === 'REDEMPTION' ? <ShoppingBag className="h-5 w-5" /> : 
                           n.type === 'SUCCESS' ? <CheckCircle2 className="h-5 w-5" /> : 
                           n.type === 'WARNING' ? <AlertCircle className="h-5 w-5" /> :
                           n.type === 'ERROR' ? <AlertCircle className="h-5 w-5" /> :
                           <Info className="h-5 w-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <p className={cn(
                              "text-sm font-bold leading-tight truncate",
                              n.isRead ? "text-google-grey" : "text-google-blue"
                            )}>
                              {n.title}
                            </p>
                            {!n.isRead && (
                              <span className="h-2 w-2 rounded-full bg-google-blue shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-3">
                            {n.message}
                          </p>
                          <div className="flex items-center gap-3 mt-3">
                            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                              {new Date(n.createdAt).toLocaleDateString()} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                        
                        {!n.isRead && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleMarkAsRead(n.id); }}
                            className="opacity-0 group-hover:opacity-100 absolute top-4 right-4 p-1.5 rounded-xl bg-white border border-gray-100 text-google-blue shadow-sm transition-all hover:bg-google-blue hover:text-white"
                            title="Mark as read"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-50/50 border-t border-gray-100 text-center">
              <button 
                className="text-xs font-bold text-gray-500 hover:text-google-blue transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Close Panel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
