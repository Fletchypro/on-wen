import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useDebounce } from '@/hooks/useDebounce';

export const useUserSearch = (searchQuery) => {
  const { user } = useAuth();
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const fetchUsers = useCallback(async (term) => {
    if (!term || !user) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('search_users_with_friendship_status', {
          p_search_term: term,
          p_current_user_id: user.id
        });

      if (error) {
        throw error;
      }
      
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUsers(debouncedSearchQuery);
  }, [debouncedSearchQuery, fetchUsers]);

  const addFriend = async (friendId) => {
    const { error } = await supabase.from('friendships').insert({
      user_id_1: user.id,
      user_id_2: friendId,
      status: 'pending',
    });
    if (error) {
      console.error('Error sending friend request:', error);
      return false;
    }
    // Update local state to reflect the change
    setSearchResults(prevResults =>
      prevResults.map(u =>
        u.id === friendId ? { ...u, friendship_status: 'pending_sent' } : u
      )
    );
    return true;
  };

  return { searchResults, loading, addFriend, setSearchResults };
};