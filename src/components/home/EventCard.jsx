import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import AttendeeAvatars from '@/components/home/event-card/AttendeeAvatars';
import PublicAttendeeAvatars from '@/components/home/event-card/PublicAttendeeAvatars';
import { getCardSizeClass, getPriorityColor } from '@/lib/eventCardUtils';
import { cn } from '@/lib/utils';
import { MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import EventCardActions from '@/components/home/event-card/EventCardActions';
import ImageOptimizer from '@/components/ImageOptimizer';

const EventCard = ({
  event,
  imageOpacity,
  onClick,
  onViewFriendCalendar,
  onViewUserProfile,
  isPublicFeed,
  onJoinEvent,
  onRequestToJoin,
  onResize,
  isExternal,
  onAddToCalendar,
}) => {
  const { user } = useAuth();
  
  // We remove manual image loading state logic because ImageOptimizer handles it
  
  const showImage = !!event.image;

  const formatDateRange = () => {
    const { date, end_date } = event;
    if (!date) return null;

    const startDate = utcToZonedTime(parseISO(`${date}T00:00:00`), 'UTC');
    const isTodayEvent = isToday(startDate);
    const isTomorrowEvent = isTomorrow(isToday(startDate) ? new Date() : startDate);
    let displayDate;

    if (isTodayEvent) {
      const endDate = end_date ? utcToZonedTime(parseISO(`${end_date}T00:00:00`), 'UTC') : null;
      if (endDate && !isToday(endDate)) {
        displayDate = `Today - ${format(endDate, 'MMM d')}`;
      } else {
        displayDate = 'Today';
      }
    } else if (isTomorrowEvent) {
      const endDate = end_date ? utcToZonedTime(parseISO(`${end_date}T00:00:00`), 'UTC') : null;
      if (endDate && !isTomorrow(endDate)) {
        displayDate = `Tomorrow - ${format(endDate, 'MMM d')}`;
      } else {
        displayDate = 'Tomorrow';
      }
    } else if (end_date && end_date !== date) {
      const endDate = utcToZonedTime(parseISO(`${end_date}T00:00:00`), 'UTC');
      if (startDate.getMonth() === endDate.getMonth()) {
        displayDate = `${format(startDate, 'MMM d')} - ${format(endDate, 'd')}`;
      } else {
        displayDate = `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`;
      }
    } else {
      displayDate = format(startDate, 'E, MMM d');
    }

    return { displayDate, isTodayEvent, isTomorrowEvent };
  };

  const dateInfo = formatDateRange();
  const isSpecialDate = dateInfo?.isTodayEvent || dateInfo?.isTomorrowEvent;
  const isCreator = user && event.user_id === user.id;

  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 400, damping: 40 }}
      // Task 4: CSS Containment & Fixed Min-Height
      className={cn("relative overflow-hidden rounded-2xl shadow-card group cursor-pointer bg-white/10 backdrop-blur-xl border border-white/50", getCardSizeClass(event.priority), "min-h-[160px] contain-layout")}
      style={{
          contain: 'layout paint', // Explicit containment
          willChange: 'transform, opacity' // Task 5: Optimized will-change
      }}
      whileTap={{ scale: 0.98 }}
    >
      {showImage ? (
        <div onClick={onClick} className="absolute inset-0">
          <ImageOptimizer
            src={event.image}
            alt={`Event: ${event.title}`}
            width={400}
            height={300}
            className="w-full h-full object-cover transition-all duration-300"
            style={{ objectPosition: event.image_position || '50% 50%' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
            fallbackVariant={isExternal ? 'event' : undefined}
          />
        </div>
      ) : (
        <div onClick={onClick} className={`w-full h-full bg-gradient-to-r ${getPriorityColor(event.priority)}`} />
      )}

      <div
        onClick={onClick}
        className="absolute inset-0 flex flex-col p-4 transition-colors duration-300"
        style={{ backgroundColor: `rgba(0, 0, 0, ${imageOpacity})` }}
      >
        <div className="absolute top-1 left-3 flex flex-col gap-1.5 items-start">
          {dateInfo && (
            <div className={cn(
              "flex items-center gap-1 text-[10px] font-medium",
              isSpecialDate ? "text-green-400" : "text-white/90"
            )}>
              <div className={cn(
                "h-2 w-2 rounded-full",
                isSpecialDate ? "bg-green-400" : "bg-white"
              )} />
              <span className="drop-shadow-sm">{dateInfo.displayDate}</span>
            </div>
          )}
          <AttendeeAvatars
            attendees={event.attendees}
            creatorId={event.user_id}
            onViewFriendCalendar={onViewFriendCalendar}
            onViewUserProfile={onViewUserProfile}
            isPublicFeed={isPublicFeed}
          />
        </div>
      </div>

      <EventCardActions
        event={event}
        isCreator={isCreator}
        isPublicFeed={isPublicFeed}
        onJoinEvent={onJoinEvent}
        onRequestToJoin={onRequestToJoin}
        onResize={onResize}
        isExternal={isExternal}
        onAddToCalendar={onAddToCalendar}
      />

      <div className="absolute bottom-0 left-0 right-0" onClick={onClick}>
        <div className={`w-full h-px ${isSpecialDate ? 'bg-green-400' : 'bg-white/20'}`} />
        <div className="py-1 px-3 bg-black/70 backdrop-blur-sm flex justify-between items-center gap-2">
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <h3 className="font-bold text-white text-[10px] uppercase tracking-wider truncate flex-shrink-0">
              {event.title}
            </h3>
            {event.location && (
              <div className="flex items-center gap-1.5 text-white/90 min-w-0">
                <MapPin className="h-3 w-3 text-sky-300 flex-shrink-0" />
                <span className="font-semibold uppercase text-[10px] truncate">{event.location}</span>
              </div>
            )}
          </div>
          <div className="flex-shrink-0">
            <PublicAttendeeAvatars
              attendees={event.attendees}
              creatorId={event.user_id}
              currentUserId={user?.id}
              onViewUserProfile={onViewUserProfile}
            />
          </div>
        </div>
      </div>

    </motion.div>
  );
};

export default EventCard;