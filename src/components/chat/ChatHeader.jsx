import React, { useState } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getDisplayName, getInitials } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import ParticipantAvatars from '@/components/chat/ParticipantAvatars';

const ChatHeader = ({ conversation, onBack, onViewFriendCalendar }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);

    const isGroupChat = conversation.type === 'group';
    const otherUser = !isGroupChat ? conversation.participants.find(p => p.id !== user.id) : null;
    const chatName = isGroupChat ? conversation.event_details?.title || 'Group Chat' : getDisplayName(otherUser);
    const chatAvatar = isGroupChat ? null : otherUser?.avatar_url;
    const eventImage = isGroupChat ? conversation.event_details?.image : null;
    const imagePosition = isGroupChat ? conversation.event_details?.image_position || 'center' : 'center';

    const handleDeleteConversation = async () => {
        if (isDeleting) return;
        setIsDeleting(true);

        const { error } = await supabase.rpc('delete_conversation_for_user', {
            p_conversation_id: conversation.id
        });

        if (error) {
            toast({
                title: "Error",
                description: "Could not delete conversation. Please try again.",
                variant: "destructive",
            });
            setIsDeleting(false);
        } else {
            toast({
                title: "Success",
                description: "Conversation has been removed from your view.",
            });
            onBack();
        }
    };

    const headerStyle = eventImage ? {
        backgroundImage: `url(${eventImage})`,
        backgroundSize: 'cover',
        backgroundPosition: imagePosition,
    } : {};

    return (
        <header 
            className="relative pt-12 p-4 md:p-4 border-b border-white/10 bg-transparent flex-shrink-0"
        >
            <div 
                className="absolute inset-0"
                style={headerStyle}
            >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0"></div>
            </div>
            <div className="relative flex items-center z-10">
                <Button onClick={onBack} variant="ghost" size="icon" className="mr-2 text-white/80 hover:text-white hover:bg-white/10">
                    <ArrowLeft size={20} />
                </Button>
                
                {!isGroupChat && (
                    <Avatar className="h-10 w-10 mr-3 border-2 border-white/20">
                        <AvatarImage src={chatAvatar} />
                        <AvatarFallback>{getInitials(otherUser)}</AvatarFallback>
                    </Avatar>
                )}

                <div className="flex-grow min-w-0">
                    <h2 className="font-semibold text-lg truncate text-white">{chatName}</h2>
                    {isGroupChat && conversation.participants && (
                        <ParticipantAvatars 
                          participants={conversation.participants} 
                          currentUserId={user.id}
                          onViewFriendCalendar={onViewFriendCalendar}
                        />
                    )}
                </div>

                {!isGroupChat && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-500 hover:bg-red-500/10">
                                <Trash2 size={20} />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Conversation?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently remove the chat from your view. The other person’s chat will remain intact.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteConversation} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
        </header>
    );
};

export default ChatHeader;