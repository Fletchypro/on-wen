import React, { useState, useEffect, useMemo } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { useNavigate } from 'react-router-dom';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import EventCard from '@/components/home/EventCard';
    import { BellRing, Frown, Tag, X } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { getTagColor } from '@/lib/utils';
    import { Button } from '@/components/ui/button';
    import {
      AlertDialog,
      AlertDialogAction,
      AlertDialogCancel,
      AlertDialogContent,
      AlertDialogDescription,
      AlertDialogFooter,
      AlertDialogHeader,
      AlertDialogTitle,
    } from "@/components/ui/alert-dialog";
    import { useTheme } from '@/contexts/ThemeContext';

    const SubscribedEventsPage = ({ onViewFriendCalendar, isInDashboardV2, onEventJoined }) => {
        const [subscribedEvents, setSubscribedEvents] = useState([]);
        const [loading, setLoading] = useState(true);
        const [selectedTagId, setSelectedTagId] = useState(null);
        const { user } = useAuth();
        const navigate = useNavigate();
        const { toast } = useToast();
        const [showUnsubscribeConfirm, setShowUnsubscribeConfirm] = useState(null);
        const { theme } = useTheme();

        const fetchSubscribedEvents = async () => {
            if (!user) return;
            setLoading(true);
            const { data, error } = await supabase.rpc('get_subscribed_events', { p_user_id: user.id });

            if (error) {
                console.error('Error fetching subscribed events:', error);
                toast({
                    title: 'Error',
                    description: 'Could not load your subscribed events.',
                    variant: 'destructive',
                });
            } else {
                const formattedEvents = data.map(e => e.event_details);
                const sortedEvents = formattedEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
                setSubscribedEvents(sortedEvents);
            }
            setLoading(false);
        };

        useEffect(() => {
            fetchSubscribedEvents();
        }, [user, toast]);

        const uniqueTags = useMemo(() => {
            const tags = new Map();
            subscribedEvents.forEach(event => {
                (event.tags || []).forEach(tag => {
                    if (!tags.has(tag.id)) {
                        tags.set(tag.id, tag);
                    }
                });
            });
            return Array.from(tags.values());
        }, [subscribedEvents]);

        const filteredEvents = useMemo(() => {
            if (!selectedTagId) {
                return subscribedEvents;
            }
            return subscribedEvents.filter(event => (event.tags || []).some(t => t.id === selectedTagId));
        }, [subscribedEvents, selectedTagId]);

        const handleUnsubscribe = async () => {
            if (!showUnsubscribeConfirm || !user) return;
        
            const { error } = await supabase
                .from('tag_subscriptions')
                .delete()
                .eq('tag_id', showUnsubscribeConfirm.id)
                .eq('subscriber_id', user.id);
        
            if (error) {
                console.error('Error unsubscribing from tag:', error);
                toast({
                    title: 'Error',
                    description: 'Could not unsubscribe from the tag.',
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: 'Unsubscribed!',
                    description: `You have unsubscribed from "${showUnsubscribeConfirm.name}".`,
                });
                setSelectedTagId(null);
                fetchSubscribedEvents();
            }
            setShowUnsubscribeConfirm(null);
        };

        const handleJoinEvent = async (eventId) => {
            if (!user) return;
        
            const { error } = await supabase
              .from('event_attendees')
              .insert({ event_id: eventId, user_id: user.id });
        
            if (error) {
              console.error('Error joining event:', error);
              toast({
                title: 'Error',
                description: 'Could not join the event. Please try again.',
                variant: 'destructive',
              });
            } else {
              toast({
                title: 'Event Joined!',
                description: "The event has been added to your calendar.",
              });
              if (onEventJoined) {
                onEventJoined();
              }
              fetchSubscribedEvents(); // Refetch to update the UI
            }
        };
        
        const renderContent = () => {
            if (loading) {
                return (
                    <div className="text-center text-white/80 py-10 flex flex-col items-center justify-center h-full">
                        <BellRing className="animate-pulse mx-auto h-12 w-12 text-yellow-400" />
                        <p className="mt-4">Loading your subscriptions...</p>
                    </div>
                );
            }

            if (subscribedEvents.length === 0) {
                return (
                    <div className="text-center p-12 flex flex-col items-center justify-center h-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, y: -20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
                        >
                            <div className="relative">
                                <div className="absolute -inset-2 bg-yellow-500 rounded-full blur-xl opacity-50"></div>
                                <Frown size={80} className="text-yellow-300 mb-6 relative" />
                            </div>
                        </motion.div>
                        <motion.h3 
                            className="text-2xl font-bold text-white"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            Nothing to see here... yet!
                        </motion.h3>
                        <motion.p 
                            className="text-foreground/70 mt-3 max-w-sm"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            Events from your tag subscriptions will appear here. Visit a friend's profile to subscribe to their event tags.
                        </motion.p>
                    </div>
                );
            }
            
            return (
                <AnimatePresence>
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2" /* Changed gap-4 to gap-2 */
                        initial="hidden"
                        animate="show"
                        variants={{ show: { transition: { staggerChildren: 0.05 } } }}
                    >
                        {filteredEvents.map((event) => (
                            <motion.div
                                key={event.id}
                                layout
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    show: { opacity: 1, y: 0 },
                                    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
                                }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            >
                                <EventCard 
                                    event={event} 
                                    isTrackedFeed={true} 
                                    hideEventType={true} 
                                    onViewFriendCalendar={onViewFriendCalendar} 
                                    onJoinEvent={handleJoinEvent}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            );
        }

        const ContentWrapper = ({ children }) => {
            if (isInDashboardV2) {
                return (
                    <div className="flex-1 overflow-hidden">
                        <div className="h-full overflow-y-auto pt-44 pb-24 md:pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">{children}</div>
                    </div>
                );
            }
            return (
                <motion.div 
                    className="flex-1 overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 md:p-6 shadow-2xl"
                >
                    <div className="h-full overflow-y-auto">
                        {children}
                    </div>
                </motion.div>
            );
        };

        const selectedTag = useMemo(() => uniqueTags.find(t => t.id === selectedTagId), [uniqueTags, selectedTagId]);

        return (
            <>
                <div 
                    className="h-full flex flex-col text-white relative"
                >
                    <div className="absolute top-0 left-0 right-0 z-40">
                       <div className="relative p-4 glass">
                          <div className="specular"></div>
                          <div className="sweep"></div>
                          <div className="flex items-center gap-3">
                              <BellRing className={`h-6 w-6 ${theme.headerColor}`} />
                              <h1 className={`text-2xl font-bold tracking-tight ${theme.headerColor}`}>
                                  Tracked Events
                              </h1>
                          </div>
                          <div className="mt-4">
                            {uniqueTags.length > 0 && (
                              <motion.div 
                                className="flex flex-wrap items-center gap-2"
                              >
                               <div className="glass-strong p-1 rounded-lg flex gap-1 flex-wrap border border-purple-500/20 shadow-xl shadow-purple-500/10">
  {/* All */}
  <Button
    size="sm"
    variant={!selectedTagId ? 'default' : 'ghost'}
    onClick={() => setSelectedTagId(null)}
    className={`rounded-full px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-0 transition-all ${
      !selectedTagId ? 'bg-purple-600 hover:bg-purple-700' : 'hover:bg-white/10 text-white'
    }`}
  >
    All
  </Button>

  {/* Each tag */}
  {uniqueTags.map(tag => (
    <Button
      key={tag.id}
      size="sm"
      variant={selectedTagId === tag.id ? 'default' : 'ghost'}
      onClick={() => setSelectedTagId(tag.id)}
      className={`rounded-full px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-0 transition-all ${
        selectedTagId === tag.id ? `${getTagColor(tag.name)} hover:opacity-90` : 'hover:bg-white/10 text-white'
      }`}
    >
      <Tag size={14} className="mr-2" /> {tag.name}
    </Button>
  ))}
</div>
                                <AnimatePresence>
                                    {selectedTag && (
                                        <motion.div
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: 'auto' }}
                                            exit={{ opacity: 0, width: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => setShowUnsubscribeConfirm(selectedTag)}
                                                className="rounded-xl bg-red-600/80 hover:bg-red-700/80 text-white"
                                            >
                                                <X size={14} className="mr-1" /> Unsubscribe
                                            </Button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                              </motion.div>
                            )}
                          </div>
                        </div>
                    </div>
                    <ContentWrapper>
                        {renderContent()}
                    </ContentWrapper>
                </div>
                <AlertDialog open={!!showUnsubscribeConfirm} onOpenChange={(isOpen) => !isOpen && setShowUnsubscribeConfirm(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Unsubscribe from "{showUnsubscribeConfirm?.name}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                                You will no longer see new events from this tag. You can always subscribe again later.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleUnsubscribe}>Unsubscribe</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </>
        );
    };

    export default SubscribedEventsPage;