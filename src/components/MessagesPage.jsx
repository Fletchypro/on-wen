import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import ConversationList from '@/components/chat/ConversationList';
import ChatPopup from '@/components/chat/ChatPopup';

const MessagesPage = ({ onViewFriendCalendar }) => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(null);

  const handleSelectConversation = (conversation) => {
    if (!user) return;
    setSelectedConversation(conversation);
  };

  const handleClosePopup = () => {
    setSelectedConversation(null);
  };

  return (
    <>
      <ConversationList
        onSelectConversation={handleSelectConversation}
        onViewFriendCalendar={onViewFriendCalendar}
      />
      <AnimatePresence>
        {selectedConversation && (
          <ChatPopup
            conversation={selectedConversation}
            onClose={handleClosePopup}
            onViewFriendCalendar={onViewFriendCalendar}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default MessagesPage;