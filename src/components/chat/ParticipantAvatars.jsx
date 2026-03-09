import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getDisplayName, getInitials } from '@/lib/utils';

const ParticipantAvatars = ({ participants, currentUserId, onViewFriendCalendar }) => {
    if (!participants || participants.length <= 1) {
        return null;
    }

    const otherParticipants = participants.filter(p => p.id !== currentUserId);
    const visibleParticipants = otherParticipants.slice(0, 4);
    const hiddenCount = otherParticipants.length - visibleParticipants.length;

    return (
        <div className="flex items-center pl-2">
            <div className="flex -space-x-2">
                {visibleParticipants.map((participant) => (
                    <TooltipProvider key={participant.id}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onViewFriendCalendar(participant); }}>
                                    <Avatar className="h-8 w-8 border-2 border-background/50" title={getDisplayName(participant)}>
                                        <AvatarImage src={participant.avatar_url} />
                                        <AvatarFallback className="text-xs bg-secondary">{getInitials(participant)}</AvatarFallback>
                                    </Avatar>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{getDisplayName(participant)}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ))}
            </div>
            {hiddenCount > 0 && (
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-foreground/30 text-white/80 text-xs font-bold border-2 border-background/50 ml-1">
                    +{hiddenCount}
                </div>
            )}
        </div>
    );
};

export default ParticipantAvatars;