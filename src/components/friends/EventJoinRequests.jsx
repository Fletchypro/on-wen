import React from 'react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Check, X, Calendar, User, Inbox } from 'lucide-react';
    import { getDisplayName } from '@/lib/utils';
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
      <div className="text-center p-12 flex flex-col items-center justify-center h-full bg-black/20 rounded-2xl border border-white/10 shadow-lg backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
        >
          <div className="relative">
            <div className="absolute -inset-2 bg-blue-500 rounded-full blur-xl opacity-50"></div>
            <Inbox size={80} className="text-blue-300 mb-6 relative" />
          </div>
        </motion.div>
        <motion.h3 
          className="text-2xl font-bold text-white"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          No join requests
        </motion.h3>
        <motion.p 
          className="text-foreground/70 mt-3 max-w-sm"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          When someone requests to join one of your events, you'll see it here.
        </motion.p>
      </div>
    );

    const EventJoinRequests = ({ requests, handleRequest, loading }) => {
      if (loading) {
        return <p className="text-center text-foreground/60 p-6">Loading join requests...</p>;
      }

      if (requests.length === 0) {
        return <EmptyState />;
      }

      return (
        <motion.div 
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {requests.map((request) => (
            <motion.div
              key={request.id}
              variants={itemVariants}
              className="bg-black/20 backdrop-blur-sm p-4 rounded-xl border border-white/10 overflow-hidden shadow-lg"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar>
                      <AvatarImage src={request.requester.avatar_url} alt={getDisplayName(request.requester)} />
                      <AvatarFallback>{getDisplayName(request.requester).charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-white">{getDisplayName(request.requester)}</p>
                      <p className="text-sm text-foreground/70">wants to join your event</p>
                    </div>
                  </div>
                  <div className="pl-12">
                    <p className="font-bold text-md text-white flex items-center gap-2"><Calendar size={14} /> {request.event.title}</p>
                  </div>
                </div>
                <div className="flex sm:flex-col gap-2 justify-end items-center flex-shrink-0">
                  <Button onClick={() => handleRequest(request.id, 'accepted')} size="sm" className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                    <Check size={16} className="mr-1" /> Accept
                  </Button>
                  <Button onClick={() => handleRequest(request.id, 'declined')} size="sm" variant="destructive" className="w-full sm:w-auto">
                    <X size={16} className="mr-1" /> Decline
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      );
    };

    export default EventJoinRequests;