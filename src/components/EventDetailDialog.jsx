import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation, useDragControls } from 'framer-motion';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { Calendar, Clock, MapPin, Edit, Trash2, Users, X, MoreVertical, UserPlus, Eye, EyeOff, ChevronDown, Minimize, StretchHorizontal, Maximize, MessageCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogOverlay, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getDisplayName, getInitials, cn } from '@/lib/utils';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { DeleteConfirmationDialog, RemoveAttendeeConfirmationDialog, InviteFriendsDialog } from '@/components/home/EventDialogs';
import { useToast } from '@/components/ui/use-toast';
import SizeSelectorPopover from '@/components/home/event-card/SizeSelectorPopover';
import ChatPopup from '@/components/chat/ChatPopup';
import { useTheme } from '@/contexts/ThemeContext'; // Import useTheme

const EventDetailDialog = ({
    event,
    isOpen,
    onClose,
    onEdit,
    onDelete,
    setEvents,
    onViewFriendCalendar,
    onViewUserProfile,
    onPriorityChange
}) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const controls = useAnimation();
    const dragControls = useDragControls();
    const { theme } = useTheme(); // Use theme context

    const [isEventHiddenForUser, setIsEventHiddenForUser] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [attendeeToRemove, setAttendeeToRemove] = useState(null);
    const [isInviteFriendsOpen, setIsInviteFriendsOpen] = useState(false);
    const [localEvent, setLocalEvent] = useState(event);
    const [isAttendeesExpanded, setIsAttendeesExpanded] = useState(false);
    const [showSizeSelector, setShowSizeSelector] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [eventConversation, setEventConversation] = useState(null);

    useEffect(() => {
        setLocalEvent(event);
        setIsAttendeesExpanded(false);
        setShowSizeSelector(false);
        setShowChat(false);
        setEventConversation(null);
    }, [event]);

    useEffect(() => {
        if (isOpen) {
            controls.start("visible");
        }
    }, [isOpen, controls]);

    const handleClose = async () => {
        await controls.start("hidden");
        onClose();
    };

    const handleDragEnd = (event, info) => {
        if (info.offset.y > 150) {
            handleClose();
        }
    };

    const fetchUserEventSettings = useCallback(async () => {
        if (!user || !localEvent) return;
        const { data, error } = await supabase
            .from('user_event_settings')
            .select('is_hidden')
            .eq('user_id', user.id)
            .eq('event_id', localEvent.id)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') {
            console.error("Error fetching user event settings:", error);
        } else if (data) {
            setIsEventHiddenForUser(data.is_hidden);
        } else {
             setIsEventHiddenForUser(false);
        }
    }, [user, localEvent]);

    const fetchEventConversation = useCallback(async () => {
        if (!localEvent?.id) return;
        const { data, error } = await supabase
          .from('conversations')
          .select(`*, event_details:events(*), participants:conversation_participants(user_profiles(*))`)
          .eq('event_id', localEvent.id)
          .single();

        if (error && error.code !== 'PGRST116') {
            toast({ title: "Error loading chat", description: error.message, variant: "destructive" });
        } else if(data) {
            const transformedData = {
                ...data,
                participants: data.participants.map(p => p.user_profiles)
            };
            setEventConversation(transformedData);
        }
    }, [localEvent, toast]);


    useEffect(() => {
        if (isOpen) {
            fetchUserEventSettings();
            fetchEventConversation();
        }
    }, [isOpen, fetchUserEventSettings, fetchEventConversation]);
    
    const handleHideToggle = async (isHidden) => {
        if (!user || !localEvent) return;
    
        setIsEventHiddenForUser(isHidden);
    
        const { error } = await supabase.rpc('set_user_event_hidden_status', {
            p_event_id: localEvent.id,
            p_is_hidden: isHidden
        });
    
        if (error) {
            setIsEventHiddenForUser(!isHidden);
            toast({
                title: "Error",
                description: "Could not update your setting. Please try again.",
                variant: "destructive"
            });
            console.error("Error toggling event hidden status:", error);
        } else {
            toast({
                title: "Setting Updated",
                description: `Event is now ${isHidden ? 'hidden' : 'visible'} on your calendar.`,
            });
            setEvents(prevEvents => prevEvents.map(e => 
                e.id === localEvent.id ? { ...e, is_hidden_from_others: isHidden } : e
            ));
        }
    };

    const handleRemoveAttendee = async () => {
        if (!attendeeToRemove) return;
        
        const { error } = await supabase.rpc('remove_attendee_from_event', {
          p_event_id: localEvent.id,
          p_user_id_to_remove: attendeeToRemove.id
        });
    
        if (error) {
          console.error("Error removing attendee:", error);
          toast({
            title: "Error",
            description: "Could not remove attendee. Please try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Attendee Removed",
            description: `${getDisplayName(attendeeToRemove)} has been removed from the event.`,
          });
          setLocalEvent(prev => ({
            ...prev,
            attendees: prev.attendees.filter(a => a.id !== attendeeToRemove.id)
          }));
        }
        setAttendeeToRemove(null);
      };

      const handleInvitesSent = (invitedIds) => {
        supabase.from('user_profiles').select('*').in('id', invitedIds)
          .then(({ data: newInvitees, error }) => {
            if (error) {
              console.error("Could not fetch new invitee profiles:", error);
              return;
            }
      
            const pendingAttendees = newInvitees.map(invitee => ({
              ...invitee,
              status: 'pending'
            }));
      
            setLocalEvent(prev => ({
              ...prev,
              attendees: [...prev.attendees, ...pendingAttendees]
            }));
          });
      };
      
    const handleLocalPriorityChange = (eventToUpdate, newPriority) => {
        onPriorityChange(eventToUpdate, newPriority);
        setLocalEvent(prev => ({ ...prev, priority: newPriority }));
        setShowSizeSelector(false);
    };

    if (!localEvent) return null;

    const isCreator = user?.id === localEvent.user_id;
    const isAttendee = localEvent.attendees?.some(a => a.id === user?.id && a.status === 'accepted');

    const sortedAttendees = localEvent.attendees?.slice().sort((a, b) => {
        if (a.id === localEvent.user_id) return -1;
        if (b.id === localEvent.user_id) return 1;
        if (a.status === 'accepted' && b.status !== 'accepted') return -1;
        if (b.status === 'accepted' && a.status !== 'accepted') return 1;
        return getDisplayName(a).localeCompare(getDisplayName(b));
    }) || [];

    const visibleAttendees = isAttendeesExpanded ? sortedAttendees : sortedAttendees.slice(0, 4);
    const hiddenCount = sortedAttendees.length - visibleAttendees.length;

    const renderAttendee = (attendee) => (
        <motion.div 
            key={attendee.id} 
            className="flex items-center justify-between group"
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
        >
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 cursor-pointer" onClick={() => onViewUserProfile(attendee)}>
                    <AvatarImage src={attendee.avatar_url} />
                    <AvatarFallback>{getInitials(attendee)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="font-semibold text-sm cursor-pointer" onClick={() => onViewUserProfile(attendee)}>{getDisplayName(attendee)}</span>
                     {attendee.status === 'pending' && <span className="text-xs text-yellow-400 italic">Invited</span>}
                </div>
            </div>

            {isCreator && attendee.id !== user.id && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                                className="text-red-500 focus:text-red-400 focus:bg-red-500/10"
                                onClick={() => setAttendeeToRemove(attendee)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </motion.div>
    );
    
    const { date, end_date, time } = localEvent;
    let formattedDate = 'Date not set';
    if (date) {
        const startDate = utcToZonedTime(parseISO(`${date}T00:00:00`), 'UTC');
        const endDate = end_date ? utcToZonedTime(parseISO(`${end_date}T00:00:00`), 'UTC') : null;
        if (isToday(startDate)) formattedDate = `Today`;
        else if (isTomorrow(startDate)) formattedDate = `Tomorrow`;
        else formattedDate = format(startDate, 'E, MMM d, yyyy');
        
        if (endDate && endDate.getTime() !== startDate.getTime()) {
            formattedDate += ` - ${format(endDate, 'E, MMM d, yyyy')}`;
        }
    }

    const formattedTime = time ? format(parseISO(`1970-01-01T${time}`), 'h:mm a') : 'Time not set';

    const renderSizeIcon = (priority) => {
      switch (priority) {
        case 0: return <X className="w-4 h-4" />;
        case 1: return <Minimize className="w-4 h-4" />;
        case 2: return <StretchHorizontal className="w-4 h-4" />;
        case 3: return <Maximize className="w-4 h-4" />;
        default: return <StretchHorizontal className="w-4 h-4" />;
      }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
                <AnimatePresence>
                    {isOpen && (
                        <>
                            <DialogOverlay as={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
                            <DialogContent
                                as={motion.div}
                                drag="y"
                                dragControls={dragControls}
                                dragListener={false}
                                dragConstraints={{ top: 0, bottom: 0 }}
                                dragElastic={{ top: 0, bottom: 0.5 }}
                                onDragEnd={handleDragEnd}
                                variants={{
                                    hidden: { y: "100%", opacity: 0 },
                                    visible: { y: 0, opacity: 1 },
                                }}
                                initial="hidden"
                                animate={controls}
                                exit="hidden"
                                transition={{ type: "spring", damping: 40, stiffness: 400 }}
                                className="fixed bottom-0 left-0 right-0 max-w-4xl w-full mx-auto grid-cols-1 md:grid-cols-3 gap-0 p-0 !rounded-t-2xl overflow-hidden glass-strong border-t border-white/20 mt-16"
                                style={{ y: "100%" }}
                            >
                                <div
                                    onPointerDown={(e) => dragControls.start(e)}
                                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-8 flex justify-center items-start pt-2 cursor-grab active:cursor-grabbing"
                                >
                                    <div className="w-12 h-1.5 bg-white/30 rounded-full" />
                                </div>
                                <div className="md:col-span-1 h-40 relative overflow-hidden">
                                    {localEvent.image ? (
                                        <img src={localEvent.image} alt={localEvent.title} className="w-full h-full object-cover" style={{ objectPosition: localEvent.image_position || '50% 50%' }} />
                                    ) : (
                                        <div className={`w-full h-full bg-gradient-to-br from-gray-700 via-gray-900 to-black`} />
                                    )}
                                    <div className="absolute inset-0 bg-black/40" />
                                </div>
                                
                                <div className="md:col-span-2 p-6 md:p-8 flex flex-col max-h-[70vh] overflow-y-auto text-white relative">
                                    <div className="specular" />
                                    <div className="sweep" />
                                    <motion.div 
                                        className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_0,_#7c3aed_0%,_transparent_40%)]"
                                        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    />
                                    <div className="relative z-10">
                                        <DialogHeader className="mb-4">
                                            <DialogTitle className="text-xl font-bold tracking-tighter mb-1">{localEvent.title}</DialogTitle>
                                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-foreground/80">
                                                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-purple-400" /> <span>{formattedDate}</span></div>
                                                <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-purple-400" /> <span>{formattedTime}</span></div>
                                            </div>
                                        </DialogHeader>

                                        {localEvent.location && (
                                            <div className="flex items-center gap-2 text-sm mb-4"><MapPin className="w-4 h-4 text-purple-400" /> <span>{localEvent.location}</span></div>
                                        )}
                                        
                                        {localEvent.notes && <p className="text-foreground/90 mb-8 whitespace-pre-wrap">{localEvent.notes}</p>}

                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                                <Users className="w-5 h-5 text-purple-400" />
                                                Attendees ({sortedAttendees.length})
                                            </h3>
                                            {(isCreator || isAttendee) && (
                                                <Button size="sm" variant="ghost" onClick={() => setIsInviteFriendsOpen(true)} className="flex items-center gap-2 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300">
                                                    <UserPlus className="w-4 h-4" />
                                                    Invite
                                                </Button>
                                            )}
                                        </div>
                                        <div className="space-y-4 mb-4">
                                            <AnimatePresence>
                                                {visibleAttendees.length > 0 ? visibleAttendees.map(renderAttendee) : (
                                                    <p className="text-sm text-foreground/60 italic">Just the organizer for now.</p>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                        {sortedAttendees.length > 4 && (
                                            <div className="mb-8">
                                                <Button
                                                    variant="link"
                                                    className="p-0 h-auto text-purple-400 hover:text-purple-300 flex items-center gap-1"
                                                    onClick={() => setIsAttendeesExpanded(!isAttendeesExpanded)}
                                                >
                                                    {isAttendeesExpanded ? 'Show less' : `See all ${hiddenCount} more`}
                                                    <motion.div animate={{ rotate: isAttendeesExpanded ? 180 : 0 }}>
                                                        <ChevronDown className="w-4 h-4" />
                                                    </motion.div>
                                                </Button>
                                            </div>
                                        )}

                                        <div className="mt-auto pt-6 border-t border-white/10 flex flex-wrap gap-2 justify-between items-center">
                                            <div className="flex gap-2">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                className={cn(
                                                                    "flex items-center gap-2 bg-transparent border-white/20 hover:bg-white/10 font-semibold transition-colors",
                                                                    isEventHiddenForUser ? "text-red-400 border-red-500/30 hover:bg-red-500/10" : "text-green-400 border-green-500/30 hover:bg-green-500/10"
                                                                )}
                                                                onClick={() => handleHideToggle(!isEventHiddenForUser)}
                                                            >
                                                                {isEventHiddenForUser ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                                {isEventHiddenForUser ? "Hidden" : "Visible"}
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{isEventHiddenForUser ? "Click to make this event visible on your calendar" : "Click to hide this event from your calendar"}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                                <Popover open={showSizeSelector} onOpenChange={setShowSizeSelector}>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <PopoverTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        className="flex items-center gap-2 bg-transparent border-white/20 hover:bg-white/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/10 font-semibold transition-colors"
                                                                    >
                                                                        {renderSizeIcon(localEvent.priority)}
                                                                        Size
                                                                    </Button>
                                                                </PopoverTrigger>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Adjust event card size/priority</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                    <PopoverContent className="w-auto p-0 border-none bg-transparent shadow-none" side="top" align="center">
                                                        <SizeSelectorPopover
                                                            event={localEvent}
                                                            onClose={() => setShowSizeSelector(false)}
                                                            onPriorityChange={handleLocalPriorityChange}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                {isAttendee && eventConversation && (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    className="flex items-center gap-2 bg-transparent border-white/20 hover:bg-white/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/10 font-semibold transition-colors"
                                                                    onClick={() => setShowChat(true)}
                                                                >
                                                                    <MessageCircle className="w-4 h-4" />
                                                                    
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Open group chat</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )}
                                            </div>

                                            <div className="flex gap-2">
                                                {isCreator && (
                                                    <Button size="icon" variant="ghost" onClick={() => {onClose(); onEdit(localEvent);}} className="hover:bg-white/10">
                                                        <Edit className="w-5 h-5" />
                                                    </Button>
                                                )}
                                                {(isCreator || (isAttendee && !isCreator)) && (
                                                    <Button size="icon" variant="ghost" onClick={() => setShowDeleteConfirm(true)} className="text-red-500 hover:bg-red-500/10 hover:text-red-400">
                                                        <Trash2 className="w-5 h-5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </DialogContent>
                        </>
                    )}
                </AnimatePresence>
            </Dialog>

            {showChat && eventConversation && (
              <ChatPopup 
                conversation={eventConversation}
                onClose={() => setShowChat(false)}
                onViewFriendCalendar={onViewFriendCalendar}
              />
            )}

            <DeleteConfirmationDialog 
                event={showDeleteConfirm ? localEvent : null}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={() => {
                    onDelete(localEvent);
                    setShowDeleteConfirm(false);
                    onClose();
                }}
            />

            <RemoveAttendeeConfirmationDialog
                attendee={attendeeToRemove}
                onClose={() => setAttendeeToRemove(null)}
                onConfirm={handleRemoveAttendee}
            />

            <InviteFriendsDialog
                event={localEvent}
                isOpen={isInviteFriendsOpen}
                onClose={() => setIsInviteFriendsOpen(false)}
                onInvitesSent={handleInvitesSent}
            />
        </>
    );
};

export default EventDetailDialog;