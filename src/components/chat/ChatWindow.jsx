import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import ChatHeader from '@/components/chat/ChatHeader';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';

const ChatWindow = ({ conversation, onBack, onMessagesRead, onViewFriendCalendar }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const conversationId = conversation.id;

    const scrollToBottomRef = useRef(null);

    const markMessagesAsRead = useCallback(async () => {
        if (!conversationId || !user) return;
        const { error } = await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('conversation_id', conversationId)
            .eq('is_read', false)
            .neq('sender_id', user.id);
        
        if (!error) {
            onMessagesRead();
        }
    }, [conversationId, user, onMessagesRead]);

    const fetchMessages = useCallback(async () => {
        if (!conversationId) return;
        const { data, error } = await supabase
            .from('messages')
            .select(`*, sender:user_profiles(id, email, first_name, last_name, avatar_url)`)
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (!error) {
            setMessages(data);
            markMessagesAsRead();
        }
    }, [conversationId, markMessagesAsRead]);

    const handleNewMessage = useCallback(async (payload) => {
        if (payload.new.sender_id === user.id) {
            return;
        }
        const { data: senderData, error } = await supabase
            .from('user_profiles')
            .select('id, email, first_name, last_name, avatar_url')
            .eq('id', payload.new.sender_id)
            .single();
        
        if (error) {
            console.error("Error fetching sender profile for new message:", error);
            setMessages(currentMessages => [...currentMessages, { ...payload.new, sender: null }]);
        } else {
            setMessages(currentMessages => [...currentMessages, { ...payload.new, sender: senderData }]);
        }
    }, [user]);

    useEffect(() => {
        fetchMessages();

        const channel = supabase.channel(`chat-${conversationId}`)
            .on(
                'postgres_changes', 
                { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'messages', 
                    filter: `conversation_id=eq.${conversationId}` 
                }, 
                handleNewMessage
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId, fetchMessages, handleNewMessage]);

    useEffect(() => {
        if (scrollToBottomRef.current) {
            scrollToBottomRef.current();
        }
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((newMessage.trim() === '' && !imageFile) || isSending) return;
        
        setIsSending(true);

        let imageUrl = null;
        if (imageFile) {
            const sanitizedFileName = imageFile.name.replace(/[\s\u202F]+/g, '-').replace(/[^\w.-]+/g, '');
            const fileName = `${user.id}/${Date.now()}-${sanitizedFileName}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('chat_images')
                .upload(fileName, imageFile);

            if (uploadError) {
                toast({
                    title: "Upload Failed",
                    description: "Could not upload the image. Please try again.",
                    variant: "destructive"
                });
                setIsSending(false);
                return;
            }

            const { data: { publicUrl } } = supabase.storage.from('chat_images').getPublicUrl(uploadData.path);
            imageUrl = publicUrl;
        }

        const tempId = Date.now();
        const optimisticMessage = {
            id: tempId,
            conversation_id: conversationId,
            sender_id: user.id,
            content: newMessage.trim(),
            image_url: imageUrl,
            created_at: new Date().toISOString(),
            is_read: false,
            sender: {
                id: user.id,
                email: user.email,
                first_name: user.user_metadata.first_name,
                last_name: user.user_metadata.last_name,
                avatar_url: user.user_metadata.avatar_url,
            }
        };

        setMessages(currentMessages => [...currentMessages, optimisticMessage]);
        setNewMessage('');
        setImageFile(null);
        setImagePreview(null);

        const { data, error } = await supabase.from('messages').insert({
            conversation_id: conversationId,
            sender_id: user.id,
            content: newMessage.trim(),
            image_url: imageUrl,
        }).select('*, sender:user_profiles(id, email, first_name, last_name, avatar_url)').single();

        if (error) {
            setMessages(currentMessages => currentMessages.filter(m => m.id !== tempId));
            setNewMessage(optimisticMessage.content);
            if (imageUrl) {
              setImagePreview(imageUrl);
            }
        } else {
             setMessages(currentMessages => 
                currentMessages.map(m => (m.id === tempId ? data : m))
            );
        }

        setIsSending(false);
    };

    return (
        <motion.div
            className="h-full flex flex-col bg-black/20 backdrop-blur-sm md:rounded-2xl border-white/10 shadow-2xl overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
        >
            <ChatHeader 
                conversation={conversation}
                onBack={onBack}
                onViewFriendCalendar={onViewFriendCalendar}
            />

            <MessageList 
                messages={messages}
                currentUserId={user.id}
                scrollToBottomRef={scrollToBottomRef}
            />

            <MessageInput
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                imagePreview={imagePreview}
                setImagePreview={setImagePreview}
                setImageFile={setImageFile}
                isSending={isSending}
                handleSendMessage={handleSendMessage}
            />
        </motion.div>
    );
};

export default ChatWindow;