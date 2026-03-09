import { useState, useEffect } from 'react';
    import { supabase } from '@/lib/customSupabaseClient';

    export const useFriendCount = (userId) => {
      const [friendCount, setFriendCount] = useState(0);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        if (!userId) {
          setLoading(false);
          return;
        }

        const fetchFriendCount = async () => {
          setLoading(true);
          const { data, error } = await supabase.rpc('count_user_friends', {
            p_user_id: userId
          });

          if (error) {
            console.error('Error fetching friend count:', error);
            setFriendCount(0);
          } else {
            setFriendCount(data);
          }
          setLoading(false);
        };

        fetchFriendCount();

      }, [userId]);

      return { friendCount, loading };
    };