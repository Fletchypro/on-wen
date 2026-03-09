import { useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { startOfDay, parseISO } from 'date-fns';

export const useEventData = (user, profile, events, setEvents, navigateTo) => {
  const { toast } = useToast();

  const addEvent = useCallback(async (eventData, inviteeIds, tagId) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('create_event_with_invites', {
        event_data: eventData,
        invitee_ids: inviteeIds,
        p_tag_id: tagId
      });

      if (error) throw error;

      const { data: newEventData, error: fetchError } = await supabase
        .rpc('get_user_events_with_attendees', { p_user_id: user.id });

      if (fetchError) throw fetchError;

      const formatted = (newEventData || [])
        .map(item => ({ ...(item?.event_details || {}), is_hidden_from_others: item?.is_hidden_from_others }))
        .filter(e => e.id)
        .sort((a, b) => {
          const aTime = a.date ? startOfDay(parseISO(a.date)).getTime() : Infinity;
          const bTime = b.date ? startOfDay(parseISO(b.date)).getTime() : Infinity;
          if (aTime !== bTime) return aTime - bTime;
          if (a.time && b.time) return String(a.time).localeCompare(String(b.time));
          return a.time ? -1 : (b.time ? 1 : 0);
        });

      setEvents(formatted);
      toast({
        title: 'Event Created! 🎉',
        description: `"${eventData.title}" has been added to your calendar.`,
      });
      navigateTo('dashboard');
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: 'Error Creating Event',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [user, setEvents, toast, navigateTo]);

  const updateEvent = useCallback(async (eventData, inviteeIds) => {
    if (!user) return;
    
    const isCreator = eventData.user_id === user.id;

    try {
      const { error } = await supabase.rpc('update_event_with_invites', {
        p_event_id: eventData.id,
        event_data: eventData,
        invitee_ids: inviteeIds,
      });

      if (error) throw error;

      setEvents(prevEvents => {
        return prevEvents.map(e => {
          if (e.id === eventData.id) {
            if (isCreator) {
              return { ...e, ...eventData };
            } else {
              // For attendees, only update their personalized settings
              return {
                ...e,
                priority: eventData.priority,
                image: eventData.image,
                image_position: eventData.image_position,
              };
            }
          }
          return e;
        });
      });

      toast({
        title: 'Event Updated! ✨',
        description: `"${eventData.title}" has been successfully updated.`,
      });
      navigateTo('dashboard');
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: 'Error Updating Event',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [user, setEvents, toast, navigateTo]);

  const deleteEvent = useCallback(async (eventToDelete) => {
    if (!user) return;

    const isCreator = eventToDelete.user_id === user.id;

    try {
      if (isCreator) {
        const { error } = await supabase.rpc('delete_event_and_conversation', { p_event_id: eventToDelete.id });
        if (error) throw error;
      } else {
        const { error } = await supabase.rpc('leave_event', { p_event_id: eventToDelete.id, p_user_id: user.id });
        if (error) throw error;
      }

      setEvents(prevEvents => prevEvents.filter(e => e.id !== eventToDelete.id));
      toast({
        title: isCreator ? 'Event Deleted' : 'Left Event',
        description: isCreator ? `"${eventToDelete.title}" has been removed.` : `You have left "${eventToDelete.title}".`,
      });
    } catch (error) {
      console.error('Error deleting/leaving event:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [user, setEvents, toast]);

  const deleteAllEvents = useCallback(async () => {
    if (!user) return;

    try {
      const userEvents = events.filter(event => event.user_id === user.id);
      for (const event of userEvents) {
        const { error } = await supabase.rpc('delete_event_and_conversation', { p_event_id: event.id });
        if (error) {
          console.error(`Error deleting event ${event.id}:`, error);
          throw new Error(`Failed to delete event: ${event.title}.`);
        }
      }

      setEvents(prev => prev.filter(e => e.user_id !== user.id));
      toast({
        title: 'All Your Events Deleted',
        description: 'All events you created have been removed.',
      });
    } catch (error) {
      console.error('Error deleting all events:', error);
      toast({
        title: 'Error Deleting Events',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [user, events, setEvents, toast]);

  return { addEvent, updateEvent, deleteEvent, deleteAllEvents };
};