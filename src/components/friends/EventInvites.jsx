import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, X, Calendar, Clock, User, Mailbox } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { getDisplayName } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const EmptyState = () => (
  <div className="text-center p-12 flex flex-col items-center justify-center h-full glass-light rounded-2xl border border-white/10 shadow-lg">
    <motion.div
      initial={{ scale: 0.5, opacity: 0, y: -20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
    >
      <div className="relative">
        <div className="absolute -inset-2 bg-sky-400 rounded-full blur-xl opacity-50"></div>
        <Mailbox size={80} className="text-sky-200 mb-6 relative" />
      </div>
    </motion.div>
    <motion.h3 
      className="text-2xl font-bold text-white"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      No new invites!
    </motion.h3>
    <motion.p 
      className="text-foreground/70 mt-3 max-w-sm"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      🎉 You’ll see them here when someone includes you in an event. Time to kick back and relax!
    </motion.p>
  </div>
);

const EventInvites = ({ invites, handleInvite, loading }) => {
  const pendingInvites = invites.filter(i => i.status === 'pending');

  if (loading) {
    return <p className="text-center text-foreground/60 p-6">Loading event invites...</p>;
  }

  if (pendingInvites.length === 0) {
    return <EmptyState />;
  }

  return (
    <motion.div 
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {pendingInvites.map((invite) => (
        <motion.div
          key={invite.id}
          variants={itemVariants}
          className="glass-light p-4 rounded-xl border border-white/10 overflow-hidden shadow-lg"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-32 h-32 sm:h-auto flex-shrink-0 rounded-md overflow-hidden">
              {invite.event.image ? (
                <img src={invite.event.image} alt={invite.event.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center">
                  <Calendar size={40} className="text-white/50" />
                </div>
              )}
            </div>
            <div className="flex-grow">
              <h3 className="font-bold text-lg text-white">{invite.event.title}</h3>
              <div className="text-sm text-foreground/70 space-y-1 mt-1">
                <p className="flex items-center gap-2"><User size={14} /> Invited by: {getDisplayName(invite.event.owner)}</p>
                <p className="flex items-center gap-2"><Calendar size={14} /> {format(parseISO(invite.event.date), 'EEEE, MMMM do')}</p>
                {invite.event.time && <p className="flex items-center gap-2"><Clock size={14} /> {format(parseISO(`1970-01-01T${invite.event.time}Z`), 'h:mm a')}</p>}
              </div>
            </div>
            <div className="flex sm:flex-col gap-2 justify-end items-center flex-shrink-0">
              <Button onClick={() => handleInvite(invite.id, 'accepted')} size="sm" className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                <Check size={16} className="mr-1" /> Accept
              </Button>
              <Button onClick={() => handleInvite(invite.id, 'declined')} size="sm" variant="destructive" className="w-full sm:w-auto">
                <X size={16} className="mr-1" /> Decline
              </Button>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default EventInvites;