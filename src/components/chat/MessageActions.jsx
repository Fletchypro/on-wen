import React from 'react';
import { motion } from 'framer-motion';
import { Flag } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export const MessageActions = ({ message }) => {
    const { user } = useAuth();
    const { toast } = useToast();

    const handleReport = async () => {
        if (!user) return;
        
        const { error } = await supabase.rpc('report_content', {
            p_report_type: 'message',
            p_reported_user_id: message.sender_id,
            p_message_id: message.id,
            p_reason: 'Inappropriate content in chat message'
        });

        if (error) {
            toast({
                variant: 'destructive',
                title: 'Error Reporting Message',
                description: error.message,
            });
        } else {
            toast({
                title: 'Message Reported',
                description: 'Thank you for your feedback. We will review this message.',
            });
        }
    };
    
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -right-10 top-1/2 -translate-y-1/2"
        >
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <Flag size={16} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleReport} className="text-red-500">
                        <Flag className="mr-2 h-4 w-4" />
                        Report Message
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </motion.div>
    );
};