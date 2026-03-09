import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import ChatWindow from '@/components/chat/ChatWindow';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const ChatPage = ({ onMessagesRead, onViewFriendCalendar }) => {
    const { state } = useLocation();
    const { conversationId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [conversation, setConversation] = useState(state?.conversation);
    const [loading, setLoading] = useState(!state?.conversation);

    const fetchConversationDetails = useCallback(async () => {
        if (!user || !conversationId) return;

        setLoading(true);
        const { data, error } = await supabase
            .rpc('get_all_user_conversations');

        if (error) {
            console.error("Error fetching conversation details:", error);
            navigate('/messages', { replace: true });
            return;
        }

        const foundConversation = data.find(c => c.id === conversationId);

        if (foundConversation) {
            setConversation(foundConversation);
        } else {
            console.warn("Conversation not found, redirecting.");
            navigate('/messages', { replace: true });
        }
        setLoading(false);
    }, [conversationId, user, navigate]);

    useEffect(() => {
        if (!conversation) {
            fetchConversationDetails();
        }
    }, [conversation, fetchConversationDetails]);

    const handleBack = () => {
        navigate('/messages');
    };

    if (loading || !conversation) {
        return <div className="flex items-center justify-center h-full text-white">Loading conversation...</div>;
    }
    
    return (
        <div className="flex flex-col h-full w-full">
            <ChatWindow
                conversation={conversation}
                onBack={handleBack}
                onMessagesRead={onMessagesRead}
                onViewFriendCalendar={onViewFriendCalendar}
            />
        </div>
    );
};

export default ChatPage;