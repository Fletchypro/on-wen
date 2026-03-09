import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from "@/components/ui/use-toast";

    const FriendsContext = createContext();

    export const useFriends = () => useContext(FriendsContext);

    export const FriendsProvider = ({ children }) => {
      const { user, profile } = useAuth();
      const { toast } = useToast();
      const [friends, setFriends] = useState([]);
      const [friendships, setFriendships] = useState([]);
      const [loading, setLoading] = useState(true);

      const fetchFriendships = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
          const { data, error } = await supabase
            .rpc('get_user_friendships', { p_user_id: user.id });

          if (error) throw error;
          
          setFriendships(data || []);
          const acceptedFriends = data
            .filter(f => f.status === 'accepted')
            .map(f => f.friend_profile);
          setFriends(acceptedFriends);

        } catch (error) {
          console.error("Error fetching friendships:", error.message);
        } finally {
          setLoading(false);
        }
      }, [user]);

      useEffect(() => {
        fetchFriendships();
      }, [fetchFriendships]);

      const handleFriendshipUpdate = (payload) => {
        if (payload.new) {
          if (payload.new.user_id_1 === user.id || payload.new.user_id_2 === user.id) {
             fetchFriendships();
          }
        }
        if (payload.old && payload.old.id) {
          const isRelevant = friendships.some(f => f.id === payload.old.id);
          if (isRelevant) {
            fetchFriendships();
          }
        }
      };

      useEffect(() => {
        if (!user) return;

        const channel = supabase
          .channel('public:friendships')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, handleFriendshipUpdate)
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }, [user, friendships, fetchFriendships]);

      const sendFriendRequest = async (recipientId) => {
        if (!user) throw new Error("User not logged in.");
        
        const existingFriendship = friendships.find(f => f.friend_profile.id === recipientId);
        if (existingFriendship) {
            toast({
                title: "Friendship Exists",
                description: `You already have a friendship status with this user.`,
                variant: "destructive",
            });
            return;
        }

        const { data, error } = await supabase
          .from('friendships')
          .insert({
            user_id_1: user.id,
            user_id_2: recipientId,
            status: 'pending'
          });

        if (error) {
          console.error("Error sending friend request:", error.message);
          throw error;
        }

        toast({
          title: "Request Sent!",
          description: "Your friend request has been sent.",
        });
        
        return data;
      };

      const respondToFriendRequest = async (friendshipId, newStatus) => {
        const { data, error } = await supabase
          .from('friendships')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', friendshipId);

        if (error) {
          console.error("Error responding to friend request:", error.message);
          throw error;
        }
        
        toast({
          title: `Request ${newStatus === 'accepted' ? 'Accepted' : 'Declined'}`,
          description: `You are now friends!`,
        });

        return data;
      };
      
      const removeFriend = async (friendId) => {
        const { error } = await supabase.rpc('remove_friend', { p_friend_id: friendId });
        if (error) {
          console.error('Error removing friend:', error);
          toast({
            title: "Error",
            description: "Could not remove friend. Please try again.",
            variant: "destructive",
          });
          throw error;
        }
        toast({
          title: "Friend Removed",
          description: "The user has been removed from your friends list.",
        });
        fetchFriendships();
      };
      

      const value = {
        friends,
        friendships,
        loading,
        sendFriendRequest,
        respondToFriendRequest,
        removeFriend,
        refetch: fetchFriendships,
      };

      return (
        <FriendsContext.Provider value={value}>
          {children}
        </FriendsContext.Provider>
      );
    };