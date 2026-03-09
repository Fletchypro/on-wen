import React, { useState, useEffect } from 'react';
    import { useLocation } from 'react-router-dom';
    import { motion, AnimatePresence } from 'framer-motion';
    import { usePublicUserEvents } from '@/hooks/usePublicUserEvents';
    import FriendCalendarHeader from '@/components/friends/FriendCalendarHeader';
    import { getDisplayName } from '@/lib/utils';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { useToast } from '@/components/ui/use-toast';
    import PageTransition from '@/components/PageTransition';
    import HomeEmptyState from '@/components/home/HomeEmptyState';
    import EventCard from '@/components/home/EventCard';
    import { MotionGlass } from '@/components/MotionGlass';

    const UserProfilePage = ({ onBack, onEditEvent, deleteEvent, onViewFriendCalendar, imageOpacity }) => {
        const location = useLocation();
        const { profile: userProfile } = location.state || {};
        const { user } = useAuth();
        const { toast } = useToast();
        const { events, loading } = usePublicUserEvents(userProfile?.id);
        const [tags, setTags] = useState([]);
        const [subscriptions, setSubscriptions] = useState([]);
        const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
        const [selectedTag, setSelectedTag] = useState(null);

        useEffect(() => {
            if (!userProfile?.id) return;

            const fetchTagsAndSubs = async () => {
                const { data: tagsData, error: tagsError } = await supabase
                    .from('event_tags')
                    .select('*')
                    .eq('user_id', userProfile.id);
                
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
        }, [userProfile?.id, user?.id]);

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
        
        if (!userProfile) {
            return (
                <div className="h-full flex items-center justify-center">
                    <p>No user profile selected.</p>
                </div>
            );
        }
        
        return (
            <AnimatePresence mode="wait">
                <PageTransition>
                    <div className="h-full flex flex-col overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, y: -100 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="flex-shrink-0"
                        >
                            <div className="max-w-3xl mx-auto px-4 pt-4 pb-2">
                               <FriendCalendarHeader
                                    friendProfile={userProfile}
                                    friendTags={{tags, subscriptions}}
                                    onSubscriptionClick={handleSubscriptionClick}
                                    isPublicProfile={true}
                               />
                            </div>
                        </motion.div>
                        
                        <div className="flex-grow">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4 max-w-3xl mx-auto p-4 pb-24 relative"
                            >
                                <AnimatePresence>
                                    {loading ? (
                                         <div className="flex-1 flex items-center justify-center">
                                            <p className="text-white/70">Loading events...</p>
                                        </div>
                                    ) : events && events.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {events.map((event, index) => (
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
                                    <HomeEmptyState isFriendView={true} friendName={getDisplayName(userProfile)} />
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </div>
                    </div>
                </PageTransition>
            </AnimatePresence>
        );
    };

    export default UserProfilePage;