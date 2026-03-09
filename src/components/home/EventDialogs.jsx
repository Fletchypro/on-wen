import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { getDisplayName } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Plane, Hotel, Car, Send } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useFriends } from '@/contexts/FriendsContext';
import { MultiSelect } from '@/components/ui/multi-select';

export const DeleteConfirmationDialog = ({ event, onClose, onConfirm }) => {
    const { user } = useAuth();
    if (!event) return null;

    const isCreator = user?.id === event.user_id;
    const titleText = isCreator ? 'Delete Event?' : 'Leave Event?';
    const descriptionText = isCreator 
        ? `This action cannot be undone. This will permanently delete your event "${event.title}" and remove all related data.`
        : `Are you sure you want to leave the event "${event.title}"? You will need a new invite to rejoin.`;
    const buttonText = isCreator ? 'Delete Event' : 'Leave Event';

    return (
      <AlertDialog open={!!event} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <AlertDialogContent className="p-0 border-none bg-transparent shadow-none max-w-lg">
          <div className="relative rounded-2xl overflow-hidden text-white glass-strong">
            <div className="specular" />
            <div className="sweep" />
            <motion.div
              className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_0,_#ef4444_0%,_transparent_40%)]"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <div className="relative p-8">
              <AlertDialogHeader className="text-left mb-6">
                <AlertDialogTitle className="text-3xl font-bold tracking-tight text-red-400">{titleText}</AlertDialogTitle>
                <AlertDialogDescription className="text-white/70 mt-1">
                  {descriptionText}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button onClick={onClose} variant="outline" className="w-full sm:w-auto bg-transparent hover:bg-white/10 border-white/20 text-white font-semibold">Cancel</Button>
                <Button onClick={onConfirm} className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-800 text-white font-semibold hover:from-red-700 hover:to-red-900 transition-all">
                  {buttonText}
                </Button>
              </AlertDialogFooter>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    );
};

export const RemoveAttendeeConfirmationDialog = ({ attendee, onClose, onConfirm }) => {
  if (!attendee) return null;

  return (
    <AlertDialog open={!!attendee} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent className="p-0 border-none bg-transparent shadow-none max-w-lg">
        <div className="relative rounded-2xl overflow-hidden text-white glass-strong">
          <div className="specular" />
          <div className="sweep" />
          <motion.div
            className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_0,_#ef4444_0%,_transparent_40%)]"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <div className="relative p-8">
            <AlertDialogHeader className="text-left mb-6">
              <AlertDialogTitle className="text-3xl font-bold tracking-tight text-red-400">Remove Attendee?</AlertDialogTitle>
              <AlertDialogDescription className="text-white/70 mt-1">
                Are you sure you want to remove <span className="font-semibold text-white">{getDisplayName(attendee)}</span> from this event? They will be removed from the attendee list and the group chat.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button onClick={onClose} variant="outline" className="w-full sm:w-auto bg-transparent hover:bg-white/10 border-white/20 text-white font-semibold">Cancel</Button>
              <Button onClick={onConfirm} className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-800 text-white font-semibold hover:from-red-700 hover:to-red-900 transition-all">
                Yes, Remove
              </Button>
            </AlertDialogFooter>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const InviteFriendsDialog = ({ event, isOpen, onClose, onInvitesSent }) => {
    const { user } = useAuth();
    const { friends } = useFriends();
    const { toast } = useToast();
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [isSending, setIsSending] = useState(false);

    if (!event) return null;

    const alreadyInvitedIds = new Set(event.attendees.map(a => a.id));
    const friendOptions = friends
        .filter(friend => !alreadyInvitedIds.has(friend.id))
        .map(friend => ({
            value: friend.id,
            label: getDisplayName(friend),
        }));

    const handleSendInvites = async () => {
        if (selectedFriends.length === 0) {
            toast({
                title: "No friends selected",
                description: "Please select at least one friend to invite.",
                variant: "destructive",
            });
            return;
        }

        setIsSending(true);
        const inviteeIds = selectedFriends.map(f => f.value);

        const { error } = await supabase.rpc('add_invitees_to_event', {
            p_event_id: event.id,
            p_invitee_ids: inviteeIds,
        });

        setIsSending(false);

        if (error) {
            console.error("Error sending invites:", error);
            toast({
                title: "Error",
                description: "Could not send invites. Please try again.",
                variant: "destructive",
            });
        } else {
            toast({
                title: "Invites Sent!",
                description: `Successfully sent invites to ${selectedFriends.length} friend(s).`,
            });
            onInvitesSent(inviteeIds);
            setSelectedFriends([]);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-lg">
                <div className="relative rounded-2xl overflow-hidden text-white glass-strong">
                    <div className="specular" />
                    <div className="sweep" />
                    <motion.div
                        className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_0,_#3b82f6_0%,_transparent_40%)]"
                        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="relative p-8">
                        <DialogHeader className="text-left mb-6">
                            <DialogTitle className="text-3xl font-bold tracking-tight text-blue-300">Invite Friends</DialogTitle>
                            <DialogDescription className="text-white/70 mt-1">
                                Select friends to invite to "<span className="font-semibold text-white">{event.title}</span>".
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                            <MultiSelect
                                options={friendOptions}
                                selected={selectedFriends}
                                onChange={setSelectedFriends}
                                placeholder="Select friends to invite..."
                                className="w-full"
                            />
                            {friendOptions.length === 0 && (
                                <p className="text-center text-sm text-white/60 italic py-4">
                                    All your friends are already invited!
                                </p>
                            )}
                        </div>

                        <DialogFooter className="mt-8">
                            <Button onClick={onClose} variant="outline" className="w-full sm:w-auto bg-transparent hover:bg-white/10 border-white/20 text-white font-semibold">Cancel</Button>
                            <Button onClick={handleSendInvites} disabled={isSending || selectedFriends.length === 0} className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold hover:from-blue-600 hover:to-blue-800 transition-all">
                                <Send className="w-4 h-4 mr-2" />
                                {isSending ? 'Sending...' : `Send Invite(s)`}
                            </Button>
                        </DialogFooter>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};