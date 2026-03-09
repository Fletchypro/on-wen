import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useFriendRequests = (user) => {
  const { toast } = useToast();
  const [friendRequestCount, setFriendRequestCount] = useState(0);

  const fetchFriendRequestCount = useCallback(async () => {
    if (!user) return 0;
    try {
      const { count, error } = await supabase
        .from('friendships')
        .select('*', { count: 'exact', head: true })
        .eq('user_id_2', user.id)
        .eq('status', 'pending');
      
      if (error) throw error;
      
      setFriendRequestCount(count || 0);
      return count;
    } catch (error) {
      console.error('Error fetching friend request count:', error.message);
      return 0;
    }
  }, [user]);

  const sendFriendRequest = useCallback(async (receiverId) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('friendships').insert({
        user_id_1: user.id,
        user_id_2: receiverId,
        status: 'pending'
      });
      if (error) throw error;
      toast({ title: 'Success', description: 'Friend request sent!' });
      fetchFriendRequestCount();
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  }, [user, toast, fetchFriendRequestCount]);

  const handleFriendRequest = useCallback(async (requestId, status) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: status })
        .eq('id', requestId);
      if (error) throw error;
      toast({ title: 'Success', description: `Request ${status === 'accepted' ? 'accepted' : 'declined'}.` });
      fetchFriendRequestCount();
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  }, [toast, fetchFriendRequestCount]);

  const cancelFriendRequest = useCallback(async (requestId) => {
    try {
      const { error } = await supabase.from('friendships').delete().eq('id', requestId);
      if (error) throw error;
      toast({ title: 'Success', description: 'Request cancelled.' });
      fetchFriendRequestCount();
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  }, [toast, fetchFriendRequestCount]);

  // Initial fetch
  useEffect(() => {
    if (user) {
        fetchFriendRequestCount();
    }
  }, [user, fetchFriendRequestCount]);

  return { friendRequestCount, fetchFriendRequestCount, sendFriendRequest, handleFriendRequest, cancelFriendRequest };
};

export const startConversation = async (userId1, userId2) => {
    try {
        const { data, error } = await supabase.rpc('create_direct_conversation', {
            p_user_id_2: userId2
        });

        if (error) {
            throw new Error(error.message);
        }
        return data;
    } catch (error) {
        console.error('Error starting conversation:', error);
        throw error;
    }
};