import React, { useState, useEffect, useMemo } from 'react';
    import { useLocation, useNavigate } from 'react-router-dom';
    import { motion, AnimatePresence } from 'framer-motion';
    import { useFriendEvents } from '@/hooks/useFriendEvents';
    import FriendCalendarHeader from '@/components/friends/FriendCalendarHeader';
    import { getDisplayName } from '@/lib/utils';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { useToast } from '@/components/ui/use-toast';
    import {
      AlertDialog,
      AlertDialogContent,
      AlertDialogDescription,
      AlertDialogFooter,
      AlertDialogHeader,
      AlertDialogTitle,
    } from "@/components/ui/alert-dialog";
    import { Button } from '@/components/ui/button';
    import PageTransition from '@/components/PageTransition';
    import HomeEmptyState from '@/components/home/HomeEmptyState';
    import EventCard from '@/components/home/EventCard';
    import { startOfMonth } from 'date-fns';
    import { MotionGlass } from '@/components/MotionGlass';
    import { useFilteredEvents } from '@/hooks/useFilteredEvents';
    import { ArrowLeft } from 'lucide-react';
    import { useFriends } from '@/hooks/useFriends';

    const FriendCalendarPage = ({ onEditEvent, deleteEvent, onViewFriendCalendar, imageOpacity }) => {
        const location = useLocation();
        const navigate = useNavigate();
        const { friend } = location.state || {};
        const { user } = useAuth();
        const { toast } = useToast();
        const { events, loading } = useFriendEvents(friend?.id);
        const [tags, setTags] = useState([]);
        const [subscriptions, setSubscriptions] = useState([]);
        const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
        const [selectedTag, setSelectedTag] = useState(null);
        const [filter, setFilter] = useState('all');
        const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()));
        const [searchQuery, setSearchQuery] = useState('');
        const { friendships, removeFriend } = useFriends();

        const friendship = useMemo(() => {
            return friendships.find(f => f.friend_profile.id === friend?.id);
        }, [friendships, friend]);

        useEffect(() => {
            if (!friend?.id) return;

            const fetchTagsAndSubs = async () => {
                const { data: tagsData, error: tagsError } = await supabase
                    .from('event_tags')
                    .select('*')
                    .eq('user_id', friend.id);
                
                if (tagsError) console.error("Error fetching tags", tagsError);
                else setTags(tagsData);

                const { data: subsData, error: subsError } = await supabase
                    .from('tag_subscriptions')
                    .select('tag_id')
                    .eq('subscriber_id', user.id);

                if (subsError) console.error("Error fetching subscriptions", subsError);
                else setSubscriptions(subsData.map(s => s.tag_id));
            };

            fetchTagsAndSubs();
        }, [friend?.id, user?.id]);

        const handleSubscriptionClick = (tag) => {
            setSelectedTag(tag);
            setShowConfirmationDialog(true);
        };
        
        const confirmSubscription = async () => {
            if (!selectedTag) return;

            const { id: tagId } = selectedTag;
            const isSubscribed = subscriptions.includes(tagId);

            if (isSubscribed) {
                const { error } = await supabase
                    .from('tag_subscriptions')
                    .delete()
                    .match({ tag_id: tagId, subscriber_id: user.id });
                if (error) {
                    toast({ title: "Error", description: "Could not unsubscribe.", variant: "destructive" });
                } else {
                    toast({ title: "Unsubscribed", description: "You will no longer receive invites for this tag." });
                    setSubscriptions(prev => prev.filter(id => id !== tagId));
                }
            } else {
                const { error } = await supabase
                    .from('tag_subscriptions')
                    .insert({ tag_id: tagId, subscriber_id: user.id });
                if (error) {
                    toast({ title: "Error", description: "Could not subscribe.", variant: "destructive" });
                } else {
                    toast({ title: "Subscribed!", description: "You'll now be invited to events with this tag." });
                    setSubscriptions(prev => [...prev, tagId]);
                }
            }
            setShowConfirmationDialog(false);
            setSelectedTag(null);
        };

        const handleSendMessage = async () => {
            if (!friend?.id) return;
            try {
                const { data, error } = await supabase.rpc('create_direct_conversation', { p_user_id_2: friend.id });
                if (error) throw error;
                if (data) {
                    navigate(`/chat/${data.id}`, { state: { conversation: data } });
                }
            } catch (error) {
                toast({
                    title: 'Error',
                    description: `Could not start conversation: ${error.message}`,
                    variant: 'destructive',
                });
            }
        };

        const handleRemoveFriend = async () => {
            if (!friend?.id) return;
            try {
                await removeFriend(friend.id);
                toast({
                    title: 'Friend Removed',
                    description: `You are no longer friends with ${getDisplayName(friend)}.`,
                });
                navigate('/friends');
            } catch (error) {
                toast({
                    title: 'Error',
                    description: `Could not remove friend: ${error.message}`,
                    variant: 'destructive',
                });
            }
        };
        
        const filteredEvents = useFilteredEvents(events, filter, selectedMonth, null, searchQuery);

        if (!friend) {
            return (
                <div className="h-full flex items-center justify-center">
                    <p>No friend selected.</p>
                </div>
            );
        }
        
        const isSubscribedToSelectedTag = selectedTag ? subscriptions.includes(selectedTag.id) : false;

        return (
            <AnimatePresence mode="wait">
                <PageTransition>
                    <div className="h-full flex flex-col">
                        <motion.div
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="flex-shrink-0 pt-2 pb-4"
                        >
                            <div className="max-w-3xl mx-auto px-4 relative">
                                <div className="absolute top-2 left-4 z-10">
                                    <Button
                                        onClick={() => navigate(-1)}
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 rounded-full bg-black/20 text-white hover:bg-black/40 backdrop-blur-sm"
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                    </Button>
                                </div>
                                <FriendCalendarHeader
                                    friendProfile={friend}
                                    friendship={friendship}
                                    friendTags={{tags, subscriptions}}
                                    onSubscriptionClick={handleSubscriptionClick}
                                    onSendMessage={handleSendMessage}
                                    onRemoveFriend={handleRemoveFriend}
                               />
                            </div>
                        </motion.div>
                        
                        <div className="flex-grow overflow-y-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4 max-w-3xl mx-auto p-4 pb-24 relative"
                            >
                                <AnimatePresence>
                                    {loading ? (
                                         <div className="flex-1 flex items-center justify-center">
                                            <p className="text-white/70">Loading calendar...</p>
                                        </div>
                                    ) : filteredEvents && filteredEvents.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {filteredEvents.map((event, index) => (
                                        <MotionGlass
                                            key={event.id}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 30, delay: index * 0.05 }}
                                            className="relative"
                                        >
                                            <EventCard
                                                event={event}
                                                imageOpacity={imageOpacity}
                                                isFriendView={true}
                                                onEdit={onEditEvent}
                                                onDelete={deleteEvent}
                                                onViewFriendCalendar={onViewFriendCalendar}
                                            />
                                        </MotionGlass>
                                        ))}
                                    </div>
                                    ) : (
                                    <HomeEmptyState isFriendView={true} friendName={getDisplayName(friend)} />
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </div>

                        <AlertDialog open={showConfirmationDialog} onOpenChange={setShowConfirmationDialog}>
                        <AlertDialogContent className="p-0 border-none bg-transparent shadow-none max-w-lg">
                            <div className="relative rounded-2xl overflow-hidden text-white glass-strong">
                                <div className="specular" />
                                <div className="sweep" />
                                <motion.div 
                                    className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_0,_#7c3aed_0%,_transparent_40%)]"
                                    animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                />
                                <div className="relative p-8">
                                    <AlertDialogHeader className="text-left mb-6">
                                        <AlertDialogTitle className="text-3xl font-bold tracking-tight">Confirm Subscription</AlertDialogTitle>
                                        <AlertDialogDescription className="text-white/70 mt-1">
                                            {selectedTag && (
                                                isSubscribedToSelectedTag
                                                ? `Are you sure you want to unsubscribe from the "${selectedTag.name}" tag? You will no longer be invited to events with this tag.`
                                                : `Do you want to subscribe to the "${selectedTag.name}" tag? You will be automatically invited to all future public events with this tag.`
                                            )}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <Button onClick={() => setShowConfirmationDialog(false)} variant="outline" className="w-full sm:w-auto bg-transparent hover:bg-white/10 border-white/20 text-white font-semibold">Cancel</Button>
                                        <Button onClick={confirmSubscription} className="w-full sm:w-auto bg-gradient-to-r from-slate-600 to-slate-800 text-white font-semibold hover:from-slate-700 hover:to-slate-900 transition-all">
                                            {isSubscribedToSelectedTag ? "Unsubscribe" : "Subscribe"}
                                        </Button>
                                    </AlertDialogFooter>
                                </div>
                            </div>
                        </AlertDialogContent>
                    </AlertDialog>
                    </div>
                </PageTransition>
            </AnimatePresence>
        );
    };

    export default FriendCalendarPage;