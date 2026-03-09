import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Calendar, Users, Trash2, UserX } from 'lucide-react';
import { UserListItem } from './UserListItem';
import { getDisplayName } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
        <div className="absolute -inset-2 bg-blue-500 rounded-full blur-xl opacity-50"></div>
        <Users size={80} className="text-blue-300 mb-6 relative" />
      </div>
    </motion.div>
    <motion.h3 
      className="text-2xl font-bold text-white"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      Your friend list is empty
    </motion.h3>
    <motion.p 
      className="text-foreground/70 mt-3 max-w-sm"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      Use the 'Find Friends' tab to connect with people and build your circle!
    </motion.p>
  </div>
);

const FriendList = ({ friends, onUnfriend, onStartChat, onSelectFriend }) => {
  const [friendToRemove, setFriendToRemove] = useState(null);

  if (friends.length === 0) {
    return <EmptyState />;
  }

  const handleUnfriendConfirm = () => {
    if (friendToRemove) {
      onUnfriend(friendToRemove.id);
      setFriendToRemove(null);
    }
  };

  const actions = [
    { icon: Calendar, label: 'View Calendar', color: 'text-sky-400', onClick: onSelectFriend },
    { icon: MessageSquare, label: 'Start Chat', color: 'text-teal-400', onClick: onStartChat },
    { icon: UserX, label: 'Remove Friend', color: 'text-red-400', onClick: (friend) => setFriendToRemove(friend) }
  ];

  return (
    <>
      <motion.div 
        className="space-y-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {friends.map((friend) => (
          <motion.div
            key={friend.id}
            variants={itemVariants}
          >
            <UserListItem user={friend} actions={actions} />
          </motion.div>
        ))}
      </motion.div>

      <AlertDialog open={!!friendToRemove} onOpenChange={() => setFriendToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to remove {friendToRemove ? getDisplayName(friendToRemove) : 'this friend'}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove them from your friends list and delete your entire chat history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnfriendConfirm} className="bg-red-600 hover:bg-red-700">
              <Trash2 className="mr-2 h-4 w-4" />
              Remove Friend
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FriendList;