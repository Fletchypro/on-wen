import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare } from 'lucide-react';
import { NewChatDialog } from '@/components/chat/NewChatDialog';
import { getDisplayName, getInitials } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import ConversationEventCard from '@/components/chat/ConversationEventCard';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.07
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

const ConversationList = ({ onSelectConversation, onViewFriendCalendar }) => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchConversations = useCallback(async () => {
        if (!user) return;
        setLoading(true);

        const { data, error } = await supabase.rpc('get_all_user_conversations');

        if (error) {
            console.error("Error fetching conversations", error.message);
            setLoading(false);
            return;
        }

        const filteredData = data.filter(convo => {
            // Only show individual DMs and private group chats. Hide ALL event-linked (public) chats.
            // RPC may return event_id and/or event_details for event conversations.
            if (convo.event_id) return false;
            if (convo.type === 'group' && convo.event_details) return false;
            return true;
        });

        const sortedConversations = filteredData.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        setConversations(sortedConversations);
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchConversations();
        const conversationsChannel = supabase
            .channel('public:conversations:list-v2')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, fetchConversations)
            .subscribe();

        const messagesChannel = supabase
            .channel('public:messages:list-v2')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchConversations)
            .subscribe();
        
        const participantsChannel = supabase
            .channel('public:conversation_participants-v2')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'conversation_participants' }, fetchConversations)
            .subscribe();

        return () => {
            supabase.removeChannel(conversationsChannel);
            supabase.removeChannel(messagesChannel);
            supabase.removeChannel(participantsChannel);
        }
    }, [fetchConversations]);

    const renderConversation = (convo) => {
        if (convo.type === 'group' && convo.event_details) {
            return (
                <motion.div
                    key={convo.id}
                    variants={itemVariants}
                    onClick={() => onSelectConversation(convo)}
                    className="w-full cursor-pointer relative"
                    whileHover={{ scale: 1.03, zIndex: 10 }}
                    whileTap={{ scale: 0.98 }}
                    layout
                >
                    <ConversationEventCard conversation={convo} onViewFriendCalendar={onViewFriendCalendar} />
                </motion.div>
            );
        }

        const otherParticipants = convo.participants.filter(p => p.id !== user.id);
        const otherUser = otherParticipants[0];
        const lastMessage = convo.last_message_content;
        const messagePreview = lastMessage 
            ? `${convo.last_message_sender_id === user.id ? 'You: ' : ''}${lastMessage}`
            : 'No messages yet';

        return (
            <motion.button
                key={convo.id}
                variants={itemVariants}
                onClick={() => onSelectConversation(convo)}
                className="w-full p-3 bg-card/60 backdrop-blur-sm rounded-lg flex items-center gap-4 text-left border border-white/10"
                whileHover={{ scale: 1.03, zIndex: 10 }}
                whileTap={{ scale: 0.98 }}
                layout
            >
                <Avatar className="h-12 w-12">
                    <AvatarImage src={otherUser?.avatar_url} />
                    <AvatarFallback>{getInitials(otherUser)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{getDisplayName(otherUser)}</p>
                    <p className="text-sm text-foreground/60 truncate">{messagePreview}</p>
                </div>
                {convo.unread_count > 0 && (
                    <div>
                        <Badge variant="destructive" className="h-6 w-6 flex items-center justify-center rounded-full p-0 shadow-lg">
                            {convo.unread_count}
                        </Badge>
                    </div>
                )}
            </motion.button>
        );
    };

    return (
        <motion.div 
          className="p-4 md:p-6 pb-24 md:pb-6 space-y-6 max-w-5xl mx-auto h-full flex flex-col text-white"
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div className="flex-shrink-0" variants={itemVariants}>
            <div className="mb-2 mt-10 flex justify-between items-center">
              <h1 className={`text-4xl md:text-6xl font-bold tracking-tighter ${theme.headerColor}`}>
                Messages
              </h1>
              <NewChatDialog onConversationCreated={onSelectConversation} />
            </div>
          </motion.div>

          <motion.div 
            className="flex-1 overflow-hidden bg-black/20 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/10 shadow-2xl"
            variants={itemVariants}
          >
              <div className="h-full overflow-y-auto">
                  <AnimatePresence>
                      <motion.div 
                          className="space-y-4"
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                      >
                          {loading ? (
                              <p className="text-center text-foreground/70">Loading chats...</p>
                          ) : conversations.length > 0 ? (
                              conversations.map(renderConversation)
                          ) : (
                              <motion.div 
                                  className="text-center py-12 space-y-4"
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.2 }}
                              >
                                  <div className="w-24 h-24 mx-auto bg-foreground/10 rounded-full flex items-center justify-center">
                                      <MessageSquare size={40} className="text-foreground/60" />
                                  </div>
                                  <h3 className="text-xl font-semibold text-foreground">No conversations yet</h3>
                                  <p className="text-foreground/70">Start a chat from your friends list or create an event to start a group chat!</p>
                              </motion.div>
                          )}
                      </motion.div>
                  </AnimatePresence>
              </div>
          </motion.div>
        </motion.div>
    );
};

export default ConversationList;