import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog';
import ChatWindow from '@/components/chat/ChatWindow';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const ChatPopup = ({ conversation, onClose, onViewFriendCalendar }) => {
  const { user } = useAuth();
  const { fetchUnreadCount } = useUnreadMessages(user);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (conversation) {
      setIsOpen(true);
    }
  }, [conversation]);

  const handleClose = () => {
    setIsOpen(false);
    // Delay to allow animation to finish before calling parent's onClose
    setTimeout(() => {
        onClose();
    }, 300);
  };

  const backdropVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 }
  };

  const dialogVariants = {
    visible: { y: 0, opacity: 1 },
    hidden: { y: "100%", opacity: 0 }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <AnimatePresence>
        {isOpen && (
          <>
            <DialogOverlay as={motion.div} variants={backdropVariants} initial="hidden" animate="visible" exit="hidden" />
            <DialogContent 
              as={motion.div}
              className="p-0 border-none bg-transparent shadow-none max-w-md w-full h-[80vh] max-h-[700px] flex flex-col fixed bottom-0 left-1/2 -translate-x-1/2 rounded-t-2xl sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl"
              variants={dialogVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              {conversation && (
                <div className="glass-strong rounded-2xl border border-white/15 flex-grow flex flex-col overflow-hidden h-full">
                  <ChatWindow
                    conversation={conversation}
                    onBack={handleClose}
                    onMessagesRead={fetchUnreadCount}
                    onViewFriendCalendar={onViewFriendCalendar}
                  />
                </div>
              )}
            </DialogContent>
          </>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default ChatPopup;