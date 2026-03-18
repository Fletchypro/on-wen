import React from 'react';
import { motion } from 'framer-motion';
import { Search, UserPlus, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserListItem } from './UserListItem';
import { Badge } from '@/components/ui/badge';

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

const EmptyState = ({ isInitial }) => (
  <div className="text-center p-12 flex flex-col items-center justify-center h-full bg-black/20 rounded-2xl border border-white/10 shadow-lg backdrop-blur-sm">
    <motion.div
      initial={{ scale: 0.5, opacity: 0, y: -20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
    >
      <div className="relative">
        <div className="absolute -inset-2 bg-blue-500 rounded-full blur-xl opacity-50"></div>
        <Search size={80} className="text-blue-300 mb-6 relative" />
      </div>
    </motion.div>
    <motion.h3 
      className="text-2xl font-bold text-white"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      {isInitial ? "Find New Friends" : "No Users Found"}
    </motion.h3>
    <motion.p 
      className="text-foreground/70 mt-3 max-w-sm"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      {isInitial 
        ? "Use the search bar above to find people by their name, username, or email."
        : "Try a different search term to find your friends."
      }
    </motion.p>
  </div>
);

const SearchUsers = ({ query, onSearchChange, results, onSendRequest, loading }) => {
  const renderAction = (user) => {
    switch (user.friendship_status) {
      case 'friends':
        return <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30"><CheckCircle size={14} className="mr-2" /> Friends</Badge>;
      case 'pending_sent':
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30"><Clock size={14} className="mr-2" /> Request Sent</Badge>;
      case 'pending_received':
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30"><Clock size={14} className="mr-2" /> Request Received</Badge>;
      default:
        return (
          <Button onClick={() => onSendRequest(user.id)} size="sm" className="bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 text-white font-semibold shadow-lg hover:shadow-sky-500/35 transition-all duration-300 transform hover:-translate-y-0.5">
            <UserPlus size={16} className="mr-2" /> Add Friend
          </Button>
        );
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="relative z-30">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/50" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name, username, or email..."
          className="w-full pl-12 pr-4 py-3 rounded-full bg-black/20 border-2 border-white/10 focus:border-sky-400 focus:ring-sky-500 text-foreground placeholder:text-foreground/50 transition-all duration-300"
        />
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="text-center text-foreground/60 pt-4 col-span-full">Searching for users...</p>
        ) : results && results.length > 0 ? (
          <motion.div 
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {results.map((u) => (
              <motion.div
                key={u.id}
                variants={itemVariants}
              >
                <UserListItem user={u} actionComponent={renderAction(u)} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyState isInitial={!query} />
        )}
      </div>
    </div>
  );
};

export default SearchUsers;