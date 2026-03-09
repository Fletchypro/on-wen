import React from 'react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { CalendarPlus, UserX } from 'lucide-react';
    import { useAuth } from '@/contexts/SupabaseAuthContext';

    const HomeEmptyState = ({ isFriendView = false, friendName, onCreateEvent }) => {
      const { user } = useAuth();

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center py-20 px-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl"
        >
          {isFriendView ? (
            <>
              <UserX size={60} className="text-white/30 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-2">No Public Events</h2>
              <p className="text-white/60 max-w-md mx-auto">
                {friendName ? `${friendName} hasn't shared any public events yet.` : "This user hasn't shared any public events yet."}
              </p>
            </>
          ) : (
            <>
              <CalendarPlus size={60} className="text-white/30 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-2">Your Calendar is Clear!</h2>
              <p className="text-white/60 max-w-md mx-auto mb-8">
                Time to fill your days with something amazing. Add your first event to get started.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={onCreateEvent}
                  size="lg" 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg"
                >
                  Create Your First Event
                </Button>
              </motion.div>
            </>
          )}
        </motion.div>
      );
    };

    export default HomeEmptyState;