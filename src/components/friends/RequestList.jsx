import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, X, Eye } from 'lucide-react';
import { UserListItem } from './UserListItem';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { getDisplayName } from '@/lib/utils';
import { useFriends } from '@/contexts/FriendsContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const EmptyState = () => (
  <div className="text-center p-12 flex flex-col items-center justify-center h-full bg-black/20 rounded-2xl border border-white/10 shadow-lg backdrop-blur-sm">
    <motion.div
      initial={{ scale: 0.5, opacity: 0, y: -20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
    >
      <div className="relative">
        <div className="absolute -inset-2 bg-green-500 rounded-full blur-xl opacity-50"></div>
        <Eye size={80} className="text-green-300 mb-6 relative" />
      </div>
    </motion.div>
    <motion.h3 
      className="text-2xl font-bold text-white"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      All Caught Up!
    </motion.h3>
    <motion.p 
      className="text-foreground/70 mt-3 max-w-sm"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      You have no new friend requests waiting for you. Your social slate is clean!
    </motion.p>
  </div>
);

const RequestList = ({ requests, onHandleRequest, onViewProfile }) => {
  const { toast } = useToast();
  const { refetch } = useFriends();

  const handleBlock = async (user) => {
    const { error } = await supabase.rpc('block_user', { p_blocked_id: user.id });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'User Blocked', description: `You have blocked and declined the request from ${getDisplayName(user)}.` });
      refetch();
    }
  };
  
  const renderAction = (req) => (
    <div className="flex gap-2">
      <Button onClick={() => onHandleRequest(req.id, 'accepted')} size="icon" className="bg-green-600 hover:bg-green-700">
        <Check size={16} />
      </Button>
      <Button onClick={() => onHandleRequest(req.id, 'declined')} size="icon" variant="destructive">
        <X size={16} />
      </Button>
      <Button onClick={() => onViewProfile(req.user1)} size="icon" variant="outline" className="bg-transparent hover:bg-white/10 border-white/20">
        <Eye size={16} />
      </Button>
    </div>
  );

  return (
    <motion.div 
      className="space-y-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {requests.map((req) => (
        <motion.div
          key={req.id}
          variants={itemVariants}
        >
          <UserListItem user={req.user1} actionComponent={renderAction(req)} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default RequestList;