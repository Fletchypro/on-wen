import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';

export const useEventInvites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  const refetchInvites = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
        // Fetch invites including the event details
        const { data, error } = await supabase
            .from('event_invites')
            .select(`
                *,
                event:events (*)
            `)
            .eq('invitee_id', user.id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        setInvites(data || []);
    } catch (error) {
        console.error('Error fetching invites:', error);
        // Avoid showing toast on every background fetch error to prevent spamming
    } finally {
        setLoading(false);
    }
  }, [user]);

  const handleInvite = useCallback(async (inviteId, status) => {
    if (!user) return;
    try {
        if (status === 'accepted') {
            const { error } = await supabase.rpc('accept_event_invite', { 
                p_invite_id: inviteId, 
                p_user_id: user.id 
            });
            if (error) throw error;
            toast({ title: 'Success', description: 'Event invite accepted!' });
        } else {
            // For declined, we update the status
            const { error } = await supabase
                .from('event_invites')
                .update({ status: 'declined' })
                .eq('id', inviteId);
            if (error) throw error;
            toast({ title: 'Success', description: 'Event invite declined.' });
        }
        // Refresh list
        refetchInvites();
    } catch (error) {
        console.error('Error handling invite:', error);
        toast({ title: 'Error', description: 'Could not process invite.', variant: 'destructive' });
    }
  }, [user, toast, refetchInvites]);

  return { invites, loading, refetchInvites, handleInvite };
};