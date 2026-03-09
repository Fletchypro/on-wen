import { useContext, useCallback } from 'react';
    import { useFriends as useFriendsContextHook } from '@/contexts/FriendsContext'; // Renamed import
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from '@/components/ui/use-toast';

    export const useFriends = () => {
      const context = useFriendsContextHook(); // Use the renamed hook
      const { toast } = useToast();

      if (context === undefined) {
        throw new Error('useFriends must be used within a FriendsProvider');
      }

      const sendFriendRequest = useCallback(async (receiverId) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({ title: 'Error', description: 'You must be logged in to send friend requests.', variant: 'destructive' });
          return;
        }

        const { data: existingFriendship, error: checkError } = await supabase
          .from('friendships')
          .select('id, status')
          .or(`and(user_id_1.eq.${user.id},user_id_2.eq.${receiverId}),and(user_id_1.eq.${receiverId},user_id_2.eq.${user.id})`)
          .maybeSingle();

        if (checkError) {
          toast({ title: 'Error', description: `Failed to check friendship status: ${checkError.message}`, variant: "destructive" });
          throw new Error(checkError.message);
        }

        if (existingFriendship) {
          toast({ title: 'Request status', description: "You already have a friendship or pending request with this user." });
          return;
        }

        const { error } = await supabase.from('friendships').insert({
          user_id_1: user.id,
          user_id_2: receiverId,
          status: 'pending'
        });

        if (error) {
          toast({ title: 'Error', description: error.message, variant: 'destructive' });
          throw new Error(error.message);
        } else {
          toast({ title: 'Success', description: 'Friend request sent!' });
          context.refetch();
        }
      }, [toast, context]);

      return { ...context, sendFriendRequest };
    };