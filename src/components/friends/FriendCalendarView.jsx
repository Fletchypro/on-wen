import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HomePage from '@/components/home/HomePage';
import { getDisplayName } from '@/lib/utils';

const FriendCalendarView = ({ friend, onBack, events, loading, logoUrl }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 flex items-center justify-between bg-card/50 backdrop-blur-sm">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button onClick={onBack} variant="ghost" className="flex items-center gap-2 text-foreground/80 hover:text-foreground">
            <ArrowLeft size={20} />
            <span className="font-semibold">Back</span>
          </Button>
        </motion.div>
        <h2 className="text-xl font-bold text-foreground">{getDisplayName(friend)}'s Calendar</h2>
        <div className="w-24"></div> {/* Spacer to balance the header */}
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? <p className="text-center p-8">Loading events...</p> :
          <HomePage
            events={events}
            searchQuery=""
            logoUrl={logoUrl}
            setCurrentView={() => { }}
            onEditEvent={() => { }}
            deleteEvent={() => { }}
            isFriendView={true}
          />
        }
      </div>
    </div>
  );
};

export default FriendCalendarView;