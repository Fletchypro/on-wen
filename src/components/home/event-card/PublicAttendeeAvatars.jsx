import React from 'react';
    import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
    import AvatarPopover from '@/components/AvatarPopover';
    import { getInitials } from '@/lib/utils';
    import { useFriends } from '@/hooks/useFriends';
    import { uniqBy } from 'lodash';
    
    const PublicAttendeeAvatars = ({ attendees, creatorId, currentUserId, onViewUserProfile }) => {
      const { friends } = useFriends(currentUserId);
    
      if (!attendees || attendees.length === 0 || !currentUserId) {
        return null;
      }
    
      const friendIds = friends.map(f => f.id);
      const uniqueAttendees = uniqBy(attendees, 'id');
    
      const publicAttendees = uniqueAttendees.filter(
        attendee => attendee.id !== currentUserId && !friendIds.includes(attendee.id) && attendee.id !== creatorId
      );
    
      if (publicAttendees.length === 0) {
        return null;
      }
    
      const visibleAttendees = publicAttendees.slice(0, 3);
    
      return (
        <div className="flex items-center flex-shrink-0 ml-2">
          <div className="flex -space-x-1">
            {visibleAttendees.map((attendee) => (
              <AvatarPopover key={attendee.id} attendee={attendee} allAttendees={publicAttendees} onViewUserProfile={onViewUserProfile}>
                <div
                  className="cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Avatar className="h-4 w-4 border border-background/50 ring-1 ring-green-500">
                    <AvatarImage src={attendee.avatar_url} />
                    <AvatarFallback className="text-[0.4rem] bg-secondary">{getInitials(attendee)}</AvatarFallback>
                  </Avatar>
                </div>
              </AvatarPopover>
            ))}
          </div>
          {publicAttendees.length > 0 && (
            <div className="text-sky-300 text-[0.6rem] font-bold ml-1.5">
              +{publicAttendees.length}
            </div>
          )}
        </div>
      );
    };
    
    export default PublicAttendeeAvatars;