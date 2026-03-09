import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export const useUnreadMessages = (user) => {
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadMessageCount(0);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('get_all_user_conversations');
      
      if (error) {
        if (error.message.includes('Failed to fetch')) return;
        throw error;
      }

      if (data) {
        const totalUnread = data.reduce((sum, convo) => sum + convo.unread_count, 0);
        setUnreadMessageCount(totalUnread);
      }
    } catch(error) {
      console.error('Error fetching unread message count:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();

      const channel = supabase
        .channel(`public:messages:unread:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
          },
          (payload) => {
            fetchUnreadCount();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchUnreadCount]);

  return { unreadMessageCount, fetchUnreadCount };
};