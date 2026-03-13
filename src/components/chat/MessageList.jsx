import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getDisplayName, getInitials } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { MessageActions } from './MessageActions';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { UserMinus } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const MessageList = ({ messages, currentUserId, scrollToBottomRef, eventId, bootCounts = {}, onVoteToBoot }) => {
    const messagesEndRef = useRef(null);
    const { theme } = useTheme();
    const { user } = useAuth();
    const [hoveredMessageId, setHoveredMessageId] = useState(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (scrollToBottomRef) {
            scrollToBottomRef.current = scrollToBottom;
        }
    }, [scrollToBottomRef]);

    return (
        <main className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
                {messages.map((msg, index) => (
                    <motion.div
                        key={msg.id || index}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        layout
                        className={`relative group flex items-end gap-2 ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                        onMouseEnter={() => setHoveredMessageId(msg.id)}
                        onMouseLeave={() => setHoveredMessageId(null)}
                    >
                        {msg.sender_id !== currentUserId && (
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={msg.sender?.avatar_url} />
                                <AvatarFallback>{getInitials(msg.sender)}</AvatarFallback>
                            </Avatar>
                        )}
                        <div className={`max-w-xs md:max-w-md p-1 rounded-2xl shadow-md ${msg.sender_id === currentUserId ? 'bg-purple-600 text-white rounded-br-none' : 'bg-foreground/10 text-foreground rounded-bl-none'}`}>
                            <div className="p-2">
                            {msg.sender_id !== currentUserId && (
                                <p className={`text-xs font-bold ${theme.headerColor} mb-1 px-1`}>{getDisplayName(msg.sender)}</p>
                            )}
                            {msg.image_url && (
                                <img src={msg.image_url} alt="Sent image" className="rounded-lg max-w-full mb-2 cursor-pointer" onClick={() => window.open(msg.image_url, '_blank')} />
                            )}
                            {msg.content && <p className="text-sm break-words px-1">{msg.content}</p>}
                            <p className="text-xs opacity-60 mt-1 text-right px-1">{format(new Date(msg.created_at), 'MMM d, p')}</p>
                            </div>
                        </div>

                        {hoveredMessageId === msg.id && msg.sender_id !== user.id && (
                          <div className="absolute -right-10 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                            {eventId && onVoteToBoot && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-full text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                                      onClick={() => onVoteToBoot(msg.sender_id)}
                                    >
                                      <UserMinus size={16} />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Vote to remove from chat ({(bootCounts[msg.sender_id] ?? 0)}/5)</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            <MessageActions message={msg} />
                          </div>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
        </main>
    );
};

export default MessageList;