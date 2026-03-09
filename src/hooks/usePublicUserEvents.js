import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const usePublicUserEvents = (userId) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEvents = useCallback(async () => {
    if (!userId) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          creator:user_profiles (id, first_name, last_name, avatar_url),
          attendees:event_attendees (
            user_profiles (id, first_name, last_name, avatar_url)
          )
        `)
        .eq('user_id', userId)
        .eq('visibility', 2) // Public events only
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) {
        throw error;
      }

      const formattedEvents = data.map(event => ({
        ...event,
        attendees: event.attendees.map(a => a.user_profiles)
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching public user events:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch public events for this user.',
      });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, loading, refetch: fetchEvents };
};