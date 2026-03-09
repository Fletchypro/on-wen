import { useRef } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useEventCardInteractions = (setEvents) => {
  const { toast } = useToast();
  const priorityUpdateQueue = useRef({});
  const priorityUpdateTimer = useRef(null);

  const processPriorityUpdateQueue = async () => {
    const updates = { ...priorityUpdateQueue.current };
    priorityUpdateQueue.current = {};

    for (const eventId in updates) {
      const newPriority = updates[eventId];
      const { error } = await supabase.rpc('upsert_user_event_priority', {
        p_event_id: eventId,
        p_priority: newPriority,
      });

      if (error) {
        console.error("Error updating size", `Could not save size for an event. Please try again.`);
      }
    }
  };

  const handlePriorityChange = (eventToUpdate, newPriority) => {
    setEvents(prevEvents =>
      prevEvents.map(e =>
        e.id === eventToUpdate.id ? { ...e, priority: newPriority } : e
      )
    );

    priorityUpdateQueue.current[eventToUpdate.id] = newPriority;

    if (priorityUpdateTimer.current) {
      clearTimeout(priorityUpdateTimer.current);
    }
    priorityUpdateTimer.current = setTimeout(processPriorityUpdateQueue, 1000);
  };

  const handleToggleHide = async (eventToToggle) => {
    const newHiddenStatus = !eventToToggle.is_hidden_from_others;

    setEvents(prevEvents => prevEvents.map(e =>
      e.id === eventToToggle.id
        ? { ...e, is_hidden_from_others: newHiddenStatus }
        : e
    ));

    const { error } = await supabase.rpc('set_user_event_hidden_status', {
      p_event_id: eventToToggle.id,
      p_is_hidden: newHiddenStatus,
    });

    if (error) {
      toast({
        title: 'Error Hiding Event',
        description: `Could not update visibility for "${eventToToggle.title}". Please try again.`,
        variant: 'destructive',
      });
      setEvents(prevEvents => prevEvents.map(e =>
        e.id === eventToToggle.id
          ? { ...e, is_hidden_from_others: !newHiddenStatus }
          : e
      ));
    } else {
      toast({
        title: 'Visibility Updated',
        description: `"${eventToToggle.title}" is now ${newHiddenStatus ? 'hidden from' : 'visible to'} others.`,
      });
    }
  };

  return {
    handlePriorityChange,
    handleToggleHide,
  };
};