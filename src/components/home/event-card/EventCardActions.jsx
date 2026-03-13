import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Maximize, Plus, Check } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const EventCardActions = ({ event, isCreator, isPublicFeed, onJoinEvent, onRequestToJoin, onResize, isExternal, onAddToCalendar }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [joinState, setJoinState] = useState('idle');

  const isAttendee = event.attendees?.some(a => a.id === user?.id && a.status === 'accepted');

  const handleJoin = async (e) => {
    e.stopPropagation();
    if (!onJoinEvent) {
       toast({
        title: "🚧 Feature not ready!",
        description: "Joining events from here is coming soon! 🚀",
      });
      return;
    }
    setJoinState('loading');
    try {
      await onJoinEvent(event.id);
      setJoinState('joined');
      toast({
        title: "Joined!",
        description: `You've successfully joined "${event.title}".`,
      });
    } catch (error) {
      setJoinState('idle');
      toast({
        title: "Uh oh!",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRequest = async (e) => {
    e.stopPropagation();
    if (!onRequestToJoin) {
      toast({
        title: "🚧 Feature not ready!",
        description: "Requesting to join is coming soon! 🚀",
      });
      return;
    }
    setJoinState('loading');
    try {
      await onRequestToJoin(event.id);
      setJoinState('requested');
      toast({
        title: "Request Sent!",
        description: `Your request to join "${event.title}" has been sent.`,
      });
    } catch (error) {
      setJoinState('idle');
      toast({
        title: "Uh oh!",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddToCalendar = async (e) => {
    e.stopPropagation();
    if (!onAddToCalendar) return;
    setJoinState('loading');
    try {
      await onAddToCalendar();
      setJoinState('joined');
      toast({ title: 'Added!', description: `"${event.title}" is on your calendar.` });
    } catch (err) {
      setJoinState('idle');
      toast({ title: 'Could not add event', description: err?.message || 'Try again.', variant: 'destructive' });
    }
  };

  const renderJoinButton = () => {
    if (isExternal && onAddToCalendar) {
      return (
        <Button
          onClick={handleAddToCalendar}
          disabled={joinState === 'loading' || joinState === 'joined'}
          className="absolute top-2 right-2 h-7 px-2 text-xs rounded-lg bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20"
        >
          {joinState === 'joined' ? <><Check size={14} className="mr-1" /> Added</> : <><Plus size={14} className="mr-1" /> Add to calendar</>}
        </Button>
      );
    }
    if (isPublicFeed && !isCreator && !isAttendee) {
      const viewerRequestStatus = event.viewer_join_request_status;

      let buttonContent;
      let buttonAction = () => {};
      let isDisabled = false;

      if (joinState === 'joined' || viewerRequestStatus === 'accepted') {
        buttonContent = <><Check size={14} className="mr-1" /> Joined</>;
        isDisabled = true;
      } else if (joinState === 'requested' || viewerRequestStatus === 'pending') {
        buttonContent = 'Requested';
        isDisabled = true;
      } else {
        if (event.visibility === 2) { // Public event
          buttonContent = <><Plus size={14} className="mr-1" /> Join</>;
          buttonAction = handleJoin;
        } else { // Friends-only event
          buttonContent = <><Plus size={14} className="mr-1" /> Request</>;
          buttonAction = handleRequest;
        }
      }

      return (
        <Button
          onClick={buttonAction}
          disabled={isDisabled || joinState === 'loading'}
          className="absolute top-2 right-2 h-7 px-2 text-xs rounded-lg bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20"
        >
          {buttonContent}
        </Button>
      );
    }
    return null;
  };

  return (
    <>
      {!isPublicFeed && onResize && (
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onResize(event);
          }}
          className="absolute top-2 right-2 h-7 w-7 rounded-lg bg-black/50 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          whileTap={{ scale: 0.9 }}
          aria-label="Resize event card"
        >
          <Maximize size={12} />
        </motion.button>
      )}
      {renderJoinButton()}
    </>
  );
};

export default EventCardActions;