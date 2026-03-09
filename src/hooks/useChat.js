import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';

export const useChat = (initialConversationId) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  const currentConversationIdRef = useRef(initialConversationId);
  useEffect(() => {
    currentConversationIdRef.current = initialConversationId;
  }, [initialConversationId]);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error: rpcError } = await supabase.rpc('get_all_user_conversations');
      if (rpcError) throw rpcError;
      setConversations(data || []);
      const totalUnread = data.reduce((acc, c) => acc + c.unread_count, 0);
      setUnreadMessageCount(totalUnread);
    } catch (e) {
      console.error("Failed to fetch conversations:", e);
      setError(e.message);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch your conversations.' });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const fetchMessages = useCallback(async (conversationId) => {
    if (!conversationId || !user) {
      setMessages([]);
      return;
    }
    try {
      const { data, error: messagesError } = await supabase
        .from('messages')
        .select(`*, sender:user_profiles(id, email, first_name, last_name, avatar_url)`)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;
      setMessages(data);
    } catch (e) {
      console.error(`Failed to fetch messages for conversation ${conversationId}:`, e);
      setError(e.message);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch messages.' });
    }
  }, [user, toast]);

  const markAsRead = useCallback(async (conversationId) => {
    if (!conversationId || !user) return;
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id);
    } catch (e) {
      console.error(`Failed to mark messages as read for conversation ${conversationId}:`, e);
    }
  }, [user]);

  const selectConversation = useCallback((conversation) => {
    if (conversation) {
      setCurrentConversation(conversation);
      fetchMessages(conversation.id);
      markAsRead(conversation.id);
      const updatedConversations = conversations.map(c => 
        c.id === conversation.id ? { ...c, unread_count: 0 } : c
      );
      setConversations(updatedConversations);
    } else {
      setCurrentConversation(null);
      setMessages([]);
    }
  }, [conversations, fetchMessages, markAsRead]);

  const uploadImageToStorage = useCallback(async (file) => {
    if (!file || !user) return null;
  
    const sanitizedFileName = file.name.replace(/[\s\u202F]+/g, '-').replace(/[^\w.-]+/g, '');
    const fileName = `${user.id}/${Date.now()}-${sanitizedFileName}`;
  
    try {
      const { error } = await supabase.storage
        .from('chat_images')
        .upload(fileName, file);
  
      if (error) {
        throw error;
      }
  
      const { data: { publicUrl } } = supabase.storage
        .from('chat_images')
        .getPublicUrl(fileName);
      
      return publicUrl;
    } catch (uploadError) {
      console.error('Image Upload Failed', uploadError);
      toast({
        variant: "destructive",
        title: "Image Upload Failed",
        description: uploadError.message || "Could not upload the image. Please try again."
      });
      return null;
    }
  }, [user, toast]);

  const sendMessage = useCallback(async (content, imageFile = null) => {
    if (!currentConversation || !user || (!content.trim() && !imageFile)) return;

    let imageUrl = null;
    if (imageFile) {
        imageUrl = await uploadImageToStorage(imageFile);
        if (!imageUrl) return; // Stop if upload failed
    }

    try {
      const { error: insertError } = await supabase.from('messages').insert({
        conversation_id: currentConversation.id,
        sender_id: user.id,
        content: content || '',
        image_url: imageUrl,
      });

      if (insertError) throw insertError;

    } catch (e) {
      console.error("Failed to send message:", e);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not send message.' });
    }
  }, [currentConversation, user, toast, uploadImageToStorage]);
  
  const createConversation = useCallback(async (userId2) => {
    if (!user) return null;
    try {
      const { data, error: rpcError } = await supabase.rpc('create_direct_conversation', {
        p_user_id_2: userId2,
      });
      if (rpcError) throw rpcError;
      
      const newConversation = data;
      
      // Check if conversation already exists client-side
      const existingConv = conversations.find(c => c.id === newConversation.id);
      if (!existingConv) {
          setConversations(prev => [newConversation, ...prev]);
      }
      
      selectConversation(newConversation);
      return newConversation;

    } catch (e) {
        console.error("Failed to create conversation:", e);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not start a new chat.' });
        return null;
    }
  }, [user, toast, conversations, selectConversation]);


  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    const handleNewMessage = (payload) => {
      const newMessage = payload.new;
      const { conversation_id, sender_id } = newMessage;

      // Update messages if it belongs to the current conversation
      if (conversation_id === currentConversationIdRef.current) {
        setMessages(prev => {
          if (prev.some(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
        markAsRead(conversation_id);
      }
      
      setConversations(prev => {
        let conversationFound = false;
        const updated = prev.map(c => {
          if (c.id === conversation_id) {
            conversationFound = true;
            return {
              ...c,
              last_message_content: newMessage.content,
              last_message_sender_id: sender_id,
              last_message_timestamp: newMessage.created_at,
              updated_at: newMessage.created_at,
              unread_count: conversation_id === currentConversationIdRef.current || sender_id === user.id ? 0 : (c.unread_count || 0) + 1
            };
          }
          return c;
        });

        // If conversation not found, it means it's a new one. Refetch all.
        if (!conversationFound) {
            fetchConversations();
            return prev;
        }
        
        return updated.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      });
    };

    const channel = supabase.channel('public:messages-realtime-channel');
    
    channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => handleNewMessage({ ...payload, new: { ...payload.new, sender: { id: payload.new.sender_id } } })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        () => fetchConversations()
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchConversations, markAsRead]);

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    error,
    selectConversation,
    sendMessage,
    createConversation,
    unreadMessageCount,
    refetchConversations: fetchConversations
  };
};