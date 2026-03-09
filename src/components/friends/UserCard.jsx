import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getDisplayName, getInitials } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const UserCard = ({ user, actionButtons, onUnfriend, showEmail = false }) => (
  <div
    className="relative p-6 bg-black/20 backdrop-blur-lg rounded-2xl flex flex-col items-center text-center border border-white/10 gap-4 shadow-lg hover:shadow-purple-500/20 transition-all duration-300 h-full group"
  >
    {onUnfriend && (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onUnfriend();
            }}
            size="icon"
            variant="ghost"
            className="text-red-400/70 hover:bg-red-500/20 hover:text-red-300 rounded-full absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 size={18} />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="bg-destructive text-destructive-foreground">
          <p>Remove Friend</p>
        </TooltipContent>
      </Tooltip>
    )}
    <Avatar className="w-24 h-24 border-4 border-purple-400/50 shadow-lg transition-transform duration-300 group-hover:scale-105">
      <AvatarImage src={user.avatar_url} alt={getDisplayName(user)} />
      <AvatarFallback className="bg-secondary text-foreground/70 text-3xl">{getInitials(user)}</AvatarFallback>
    </Avatar>
    <div className="flex-grow min-w-0 mt-2">
      <p className="font-bold text-lg text-foreground truncate">{getDisplayName(user)}</p>
      {showEmail && <p className="text-sm text-foreground/60 truncate">{user.email}</p>}
    </div>
    <div className="flex items-center justify-center gap-2 flex-shrink-0 mt-4 w-full">
      {actionButtons}
    </div>
  </div>
);

export default UserCard;