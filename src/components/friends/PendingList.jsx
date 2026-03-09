import React from 'react';
import { motion } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { X, Send } from 'lucide-react';
import { UserListItem } from './UserListItem';
import { getDisplayName } from '@/lib/utils';

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
        <div className="absolute -inset-2 bg-yellow-500 rounded-full blur-xl opacity-50"></div>
        <Send size={80} className="text-yellow-300 mb-6 relative" />
      </div>
    </motion.div>
    <motion.h3 
      className="text-2xl font-bold text-white"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      No Pending Requests
    </motion.h3>
    <motion.p 
      className="text-foreground/70 mt-3 max-w-sm"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      You haven't sent any friend requests that are still waiting for a response.
    </motion.p>
  </div>
);

const PendingList = ({ requests, onCancelRequest }) => {
  if (requests.length === 0) {
    return <EmptyState />;
  }

  const renderAction = (req) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <X size={16} className="mr-1" /> Cancel
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Friend Request?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel the friend request to {getDisplayName(req.user2)}?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep Request</AlertDialogCancel>
          <AlertDialogAction onClick={() => onCancelRequest(req.id)} className="bg-red-600 hover:bg-red-700">Yes, Cancel It</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
          <UserListItem user={req.user2} actionComponent={renderAction(req)} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default PendingList;