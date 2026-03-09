import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export const useFriendEvents = (friendId) => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchEvents = useCallback(async () => {
        if (!friendId || !user) {
            setEvents([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase
                .rpc('get_friend_events_with_attendees', {
                    p_friend_id: friendId,
                    p_viewer_id: user.id
                });

            if (error) throw error;
            
            const fetchedEvents = data.map(item => item.event_details);
            setEvents(fetchedEvents);

        } catch (error) {
            console.error("Error fetching friend's events:", error);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    }, [friendId, user]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    return { events, loading, refetch: fetchEvents };
};