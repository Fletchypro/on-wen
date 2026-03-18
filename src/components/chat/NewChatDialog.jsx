import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useFriends } from '@/hooks/useFriends';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getDisplayName, getInitials } from '@/lib/utils';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const NewChatDialog = ({ onConversationCreated }) => {
    const { user } = useAuth();
    const { friends, loading } = useFriends(user?.id);
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();

    const handleSelectFriend = async (friendId) => {
        const { data, error } = await supabase.rpc('create_direct_conversation', { p_user_id_2: friendId });
        if (error) {
            toast({ title: 'Error starting chat', description: error.message, variant: 'destructive' });
        } else {
            onConversationCreated(data);
            setIsOpen(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-sky-300 hover:text-sky-200 hover:bg-sky-400/15">
                    <MessageSquarePlus className="h-6 w-6" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass-strong text-white border-white/20">
                <DialogHeader>
                    <DialogTitle>Start a new chat</DialogTitle>
                </DialogHeader>
                <div className="py-4 max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <p>Loading friends...</p>
                    ) : friends.length > 0 ? (
                        <div className="space-y-2">
                            {friends.map(friend => (
                                <button
                                    key={friend.id}
                                    onClick={() => handleSelectFriend(friend.id)}
                                    className="w-full flex items-center gap-4 p-2 rounded-lg hover:bg-white/10 transition-colors text-left"
                                >
                                    <Avatar>
                                        <AvatarImage src={friend.avatar_url} />
                                        <AvatarFallback>{getInitials(friend)}</AvatarFallback>
                                    </Avatar>
                                    <span>{getDisplayName(friend)}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p>No friends to chat with yet. Add some friends first!</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};