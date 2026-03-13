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
    const [bootCounts, setBootCounts] = useState({});
    const [isBanned, setIsBanned] = useState(false);

    const conversationId = conversation.id;
    const eventId = conversation.event_id || conversation.event_details?.id;

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

    const fetchBootCounts = useCallback(async () => {
        if (!eventId) return;
        const { data, error } = await supabase.rpc('get_event_chat_boot_counts', { p_event_id: eventId });
        if (!error && Array.isArray(data)) {
            const map = {};
            data.forEach(({ target_user_id, vote_count }) => { map[target_user_id] = vote_count; });
            setBootCounts(map);
        }
    }, [eventId]);

    const checkBanned = useCallback(async () => {
        if (!eventId || !user?.id) return false;
        const { data, error } = await supabase.rpc('is_user_banned_from_event_chat', { p_event_id: eventId, p_user_id: user.id });
        if (!error && data === true) {
            setIsBanned(true);
            return true;
        }
        return false;
    }, [eventId, user?.id]);

    useEffect(() => {
        fetchMessages();
        if (eventId) {
            fetchBootCounts();
            checkBanned();
        }

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
    }, [conversationId, fetchMessages, handleNewMessage, eventId, fetchBootCounts, checkBanned]);

    useEffect(() => {
        if (scrollToBottomRef.current) {
            scrollToBottomRef.current();
        }
    }, [messages]);

    const handleVoteToBoot = useCallback(async (targetUserId) => {
        if (!eventId || !user?.id || targetUserId === user.id) return;
        const { data, error } = await supabase.rpc('vote_to_boot_event_chat', { p_event_id: eventId, p_target_user_id: targetUserId });
        if (error) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
            return;
        }
        if (data?.ok) {
            fetchBootCounts();
            const count = data.vote_count ?? 0;
            if (data.banned) {
                toast({ title: 'User removed', description: 'They can no longer send messages in this chat.' });
            } else {
                toast({ title: 'Vote recorded', description: `${count}/5 votes to remove. At 5 they’ll be locked from the chat.` });
            }
        } else {
            toast({ title: 'Couldn’t vote', description: data?.error === 'cannot_vote_self' ? "You can't vote to remove yourself." : 'Try again.', variant: 'destructive' });
        }
    }, [eventId, user?.id, fetchBootCounts, toast]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((newMessage.trim() === '' && !imageFile) || isSending) return;
        if (eventId && isBanned) {
            toast({ title: "Can't send", description: "You've been removed from this chat.", variant: "destructive" });
            return;
        }
        if (eventId) {
            const banned = await checkBanned();
            if (banned) {
                toast({ title: "Can't send", description: "You've been removed from this chat.", variant: "destructive" });
                return;
            }
        }

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
                eventId={eventId}
                bootCounts={bootCounts}
                onVoteToBoot={handleVoteToBoot}
            />

            {!isBanned && (
                <MessageInput
                    newMessage={newMessage}
                    setNewMessage={setNewMessage}
                    imagePreview={imagePreview}
                    setImagePreview={setImagePreview}
                    setImageFile={setImageFile}
                    isSending={isSending}
                    handleSendMessage={handleSendMessage}
                />
            )}
            {isBanned && (
                <div className="p-4 text-center text-sm text-foreground/60 border-t border-white/10">
                    You’ve been removed from this chat and can’t send messages.
                </div>
            )}
        </motion.div>
    );
};

export default ChatWindow;