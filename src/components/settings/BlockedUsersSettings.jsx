import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getDisplayName, getInitials } from '@/lib/utils';
import { UserX, ShieldOff, Loader2 } from 'lucide-react';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

const BlockedUsersSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBlockedUsers = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_blocked_users', { p_user_id: user.id });
      if (error) throw error;
      setBlockedUsers(data || []);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error fetching blocked users',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchBlockedUsers();
  }, [fetchBlockedUsers]);

  const handleUnblockUser = async (blockedUserId) => {
    const { error } = await supabase.rpc('unblock_user', { p_blocked_id: blockedUserId });
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error unblocking user',
        description: error.message,
      });
    } else {
      toast({
        title: 'User Unblocked',
        description: 'You can now interact with this user again.',
      });
      fetchBlockedUsers();
    }
  };

  return (
    <motion.div 
      variants={itemVariants}
      className="space-y-4"
    >
      <h2 className="text-xl font-semibold text-foreground/80 flex items-center gap-2"><UserX size={22}/> Blocked Users</h2>
      <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg space-y-3">
        {loading ? (
          <div className="flex justify-center items-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : blockedUsers.length > 0 ? (
          <ul className="space-y-2">
            {blockedUsers.map((blockedUser) => (
              <li key={blockedUser.id} className="flex items-center justify-between p-2 bg-black/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-red-500/50">
                    <AvatarImage src={blockedUser.avatar_url} alt={getDisplayName(blockedUser)} />
                    <AvatarFallback>{getInitials(blockedUser)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{getDisplayName(blockedUser)}</p>
                    <p className="text-sm text-foreground/60">@{blockedUser.username}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleUnblockUser(blockedUser.id)}
                  className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                >
                  <ShieldOff className="mr-2 h-4 w-4" />
                  Unblock
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-foreground/70 p-4">You haven't blocked any users.</p>
        )}
      </div>
    </motion.div>
  );
};

export default BlockedUsersSettings;