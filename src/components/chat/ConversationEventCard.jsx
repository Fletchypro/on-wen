import React from 'react';
import { format, parseISO } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getInitials, getDisplayName } from '@/lib/utils';
import { Users } from 'lucide-react';

const ConversationEventCard = ({ conversation, onViewFriendCalendar }) => {
  const { event_details, unread_count } = conversation;

  const formatDateRange = (start, end) => {
    const startDate = parseISO(start);
    if (!end) {
      return format(startDate, "MMM d");
    }
    const endDate = parseISO(end);
    if (format(startDate, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd')) {
      return format(startDate, "MMM d");
    }
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`;
  };

  const AttendeeAvatars = ({ attendees, creatorId }) => {
    if (!attendees || attendees.length <= 1) {
      return null;
    }

    const creator = attendees.find(a => a.id === creatorId);
    const otherAttendees = attendees.filter(a => a.id !== creatorId);
    const sortedAttendees = [creator, ...otherAttendees].filter(Boolean);
    const visibleAttendees = sortedAttendees.slice(0, 3);
    const hiddenCount = sortedAttendees.length - visibleAttendees.length;

    return (
      <div className="flex items-center">
        <div className="flex -space-x-2">
          {visibleAttendees.map((attendee) => (
            <div key={attendee.id} className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onViewFriendCalendar(attendee); }}>
              <Avatar className="h-6 w-6 border-2 border-black/30" title={getDisplayName(attendee)}>
                <AvatarImage src={attendee.avatar_url} />
                <AvatarFallback className="text-xs bg-secondary">{getInitials(attendee)}</AvatarFallback>
              </Avatar>
            </div>
          ))}
        </div>
        {hiddenCount > 0 && (
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-black/50 text-white/80 text-xs font-bold border-2 border-black/30 ml-1">
            +{hiddenCount}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-20 relative rounded-lg overflow-hidden border border-white/10 shadow-lg group text-white">
      {event_details.image ? (
        <img 
          src={event_details.image} 
          alt={event_details.title} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          style={{ objectPosition: event_details.image_position || 'center' }}
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
          <Users size={32} className="text-white/60" />
        </div>
      )}
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/0 transition-colors duration-300"></div>

      <div className="relative h-full p-3 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="min-w-0">
            <p className="font-bold truncate drop-shadow-md text-base">{event_details.title}</p>
          </div>
          {unread_count > 0 && (
            <div className="flex-shrink-0 ml-2">
              <Badge variant="destructive" className="h-6 w-6 flex items-center justify-center rounded-full p-0 shadow-lg">
                {unread_count}
              </Badge>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-end">
            <p className="text-xs text-white/80 truncate drop-shadow-sm">
              {formatDateRange(event_details.date, event_details.end_date)}
            </p>
            <AttendeeAvatars attendees={event_details.attendees} creatorId={event_details.user_id} />
        </div>
      </div>
    </div>
  );
};

export default ConversationEventCard;