import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useFriends } from '@/contexts/FriendsContext';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getDisplayName, getInitials } from '@/lib/utils';
import { UserPlus, Calendar, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import ImageOptimizer from '@/components/ImageOptimizer';

const AvatarPopoverContent = ({ initialAttendee, allAttendees, onViewFriendCalendar, setIsOpen, onViewUserProfile }) => {
    const { user } = useAuth();
    const { friends, loading: friendsLoading, sendFriendRequest } = useFriends();
    
    const attendeesToShow = useMemo(() => allAttendees.filter(a => a.id !== user.id), [allAttendees, user.id]);

    const [currentIndex, setCurrentIndex] = useState(() => {
        const index = attendeesToShow.findIndex(a => a.id === initialAttendee.id);
        return index >= 0 ? index : 0;
    });

    const [requestSent, setRequestSent] = useState(false);
    const [direction, setDirection] = useState(0);

    const currentAttendee = useMemo(() => attendeesToShow?.[currentIndex], [attendeesToShow, currentIndex]);

    const paginate = useCallback((newDirection) => {
        setDirection(newDirection);
        setCurrentIndex(prevIndex => {
            const newIndex = prevIndex + newDirection;
            if (newIndex < 0) {
                return attendeesToShow.length - 1;
            }
            return newIndex % attendeesToShow.length;
        });
    }, [attendeesToShow.length]);

    useEffect(() => {
        setRequestSent(false);
    }, [currentAttendee]);

    const handleDragEnd = (e, { offset, velocity }) => {
        const swipe = Math.abs(offset.x) * velocity.x;

        if (swipe < -10000) {
            paginate(1);
        } else if (swipe > 10000) {
            paginate(-1);
        }
    };


    if (!currentAttendee) {
        if (setIsOpen) setIsOpen(false);
        return null;
    }

    const isFriend = friends.some(f => f.id === currentAttendee.id);

    const handleAddFriend = async () => {
        try {
            await sendFriendRequest(currentAttendee.id);
            setRequestSent(true);
        } catch (error) {
            console.error('Error sending request', error.message);
        }
    };

    const handleViewCalendar = () => {
        if (isFriend && onViewFriendCalendar) {
            onViewFriendCalendar(currentAttendee);
            if (setIsOpen) setIsOpen(false);
        }
    };

    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? 30 : -30,
            opacity: 0,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 30 : -30,
            opacity: 0,
        }),
    };

    return (
        <PopoverContent className="w-64 p-0 glass-strong border border-white/15 shadow-lg rounded-2xl overflow-hidden">
            <div className="relative h-80 flex items-center justify-center cursor-grab active:cursor-grabbing">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                        key={currentAttendee.id}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={handleDragEnd}
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        className="absolute w-full h-full flex flex-col items-center p-4"
                    >
                        <div className="flex flex-col items-center gap-3 text-center pt-4">
                            <Avatar className="h-20 w-20 border-4 border-background/50 overflow-hidden">
                                {currentAttendee.avatar_url ? (
                                    <ImageOptimizer
                                        src={currentAttendee.avatar_url}
                                        alt={`Avatar of ${getDisplayName(currentAttendee)}`}
                                        width={80}
                                        height={80}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <AvatarFallback className="text-3xl bg-foreground/10">{getInitials(currentAttendee)}</AvatarFallback>
                                )}
                            </Avatar>
                            <div className="font-semibold text-lg text-foreground truncate w-full">{getDisplayName(currentAttendee)}</div>
                        </div>
                        <div className="mt-auto space-y-2 w-full pb-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="w-full">
                                            <Button
                                                variant="outline"
                                                className="w-full bg-white/10 hover:bg-white/20 dark:bg-white/5 dark:hover:bg-white/10 border-white/20 dark:border-white/10 text-foreground"
                                                disabled={!isFriend}
                                                onClick={handleViewCalendar}
                                            >
                                                <Calendar className="mr-2 h-4 w-4" />
                                                View Calendar
                                            </Button>
                                        </div>
                                    </TooltipTrigger>
                                    {!isFriend && (
                                        <TooltipContent>
                                            <p>Add as a friend to view their calendar</p>
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>

                            {!isFriend && (
                                <Button className="w-full bg-primary text-primary-foreground" onClick={handleAddFriend} disabled={requestSent || friendsLoading}>
                                    {requestSent ? (
                                        <>
                                            <Check className="mr-2 h-4 w-4" />
                                            Request Sent
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Add Friend
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
            {attendeesToShow.length > 1 && (
                <>
                    <motion.button
                        whileTap={{ scale: 0.9, opacity: 0.7 }}
                        className="absolute left-2 top-[calc(50%-80px)] h-8 w-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center z-10"
                        onClick={(e) => { e.stopPropagation(); paginate(-1); }}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.9, opacity: 0.7 }}
                        className="absolute right-2 top-[calc(50%-80px)] h-8 w-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center z-10"
                        onClick={(e) => { e.stopPropagation(); paginate(1); }}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </motion.button>
                </>
            )}
        </PopoverContent>
    );
};

const AvatarPopover = ({ attendee, allAttendees, children, onViewFriendCalendar, onViewUserProfile }) => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const attendeesToShow = useMemo(() => {
        if (!allAttendees) return [];
        return allAttendees.filter(a => a.id !== user.id);
    }, [allAttendees, user.id]);

    if (!attendee || attendee.id === user.id || attendeesToShow.length === 0) {
        return children;
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>{children}</PopoverTrigger>
            {isOpen && (
                <AvatarPopoverContent
                    initialAttendee={attendee}
                    allAttendees={attendeesToShow}
                    onViewFriendCalendar={onViewFriendCalendar}
                    setIsOpen={setIsOpen}
                    onViewUserProfile={onViewUserProfile}
                />
            )}
        </Popover>
    );
};

export default AvatarPopover;