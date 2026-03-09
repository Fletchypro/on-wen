import React from 'react';
    import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
    import AvatarPopover from '@/components/AvatarPopover';
    import { getInitials, getDisplayName } from '@/lib/utils';
    import { uniqBy } from 'lodash';
    import { useFriends } from '@/contexts/FriendsContext';
    import { useAuth } from '@/contexts/SupabaseAuthContext';

    const getStatusRingColor = (status) => {
        switch (status) {
          case 'accepted':
            return 'ring-green-500';
          case 'pending':
            return 'ring-yellow-500';
          case 'declined':
            return 'ring-red-500';
          default:
            return 'ring-transparent';
        }
    };

    const AttendeeAvatars = ({ attendees, creatorId, onViewFriendCalendar, onViewUserProfile }) => {
      const { user } = useAuth();
      const { friends, loading: friendsLoading } = useFriends();

      if (!attendees || attendees.length === 0 || friendsLoading || !user) {
        return null;
      }

      const friendIds = friends.map(f => f.id);
      const uniqueAttendees = uniqBy(attendees, 'id');

      const friendAttendees = uniqueAttendees.filter(attendee => 
        friendIds.includes(attendee.id) && attendee.id !== user.id
      );

      if (friendAttendees.length === 0) {
        return null;
      }

      const sortedAttendees = friendAttendees.sort((a, b) => {
        if (a.status === 'accepted' && b.status !== 'accepted') return -1;
        if (a.status !== 'accepted' && b.status === 'accepted') return 1;
        return 0;
      });

      const visibleAttendees = sortedAttendees.slice(0, 5);
      const hiddenCount = sortedAttendees.length - visibleAttendees.length;

      return (
        <div className="flex items-center">
          <div className="flex -space-x-2">
            {visibleAttendees.map((attendee) => (
              <AvatarPopover key={attendee.id} attendee={attendee} allAttendees={sortedAttendees} onViewFriendCalendar={onViewFriendCalendar} onViewUserProfile={onViewUserProfile}>
                <div
                  className="cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Avatar className={`h-6 w-6 border-2 border-background/50 ring-2 ${getStatusRingColor(attendee.status)}`} title={`${getDisplayName(attendee)} (${attendee.status || '...'})`}>
                    <AvatarImage src={attendee.avatar_url} />
                    <AvatarFallback className="text-xs bg-secondary">{getInitials(attendee)}</AvatarFallback>
                  </Avatar>
                </div>
              </AvatarPopover>
            ))}
          </div>
          {hiddenCount > 0 && (
            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-foreground/20 text-white/80 text-xs font-bold border-2 border-background/50 ml-1">
              +{hiddenCount}
            </div>
          )}
        </div>
      );
    };

    export default AttendeeAvatars;