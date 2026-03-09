import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isWithinInterval, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, isAfter, isEqual } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";
import { Helmet } from 'react-helmet';
import { getPageTitle, getMetaDescription, getOGTags, getTwitterTags, getCanonicalURL } from '@/lib/seoHelpers';

import HomeHeader from '@/components/home/HomeHeader';
import EventFilters from '@/components/home/EventFilters';
import EventCard from '@/components/home/EventCard';
import SizeSelectorPopover from '@/components/home/event-card/SizeSelectorPopover';
import HomeEmptyState from '@/components/home/HomeEmptyState';
import { NotesDialog, DeleteConfirmationDialog, HideConfirmationDialog } from '@/components/home/EventDialogs';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useEventData } from '@/hooks/useEventData';
import { useFilteredEvents } from '@/hooks/useFilteredEvents';

const HomePage = ({ events: propEvents, setEvents: propSetEvents, setCurrentView, deleteEvent: propDeleteEvent, onEditEvent, searchQuery, setSearchQuery, isFriendView = false, imageOpacity = 0.3, updateEventPriority: propUpdateEventPriority, showHolidays, setShowHolidays, onViewFriendCalendar }) => {
  const { user } = useAuth();
  const { events: contextEvents, setEvents: contextSetEvents, deleteEvent: contextDeleteEvent, updateEventPriority: contextUpdateEventPriority, removeAttendee } = useEventData(user, setCurrentView);
  
  const events = propEvents || contextEvents;
  const setEvents = propSetEvents || contextSetEvents;
  const deleteEvent = propDeleteEvent || contextDeleteEvent;
  const updateEventPriority = propUpdateEventPriority || contextUpdateEventPriority;

  const [filter, setFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()));
  const [viewingNotesEvent, setViewingNotesEvent] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [hidingEvent, setHidingEvent] = useState(null);
  const [resizingEvent, setResizingEvent] = useState(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, right: 0 });
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const cardRefs = useRef({});
  const { toast } = useToast();
  const initialScrollDone = useRef(false);

  const ogTags = getOGTags('dashboard');
  const twitterTags = getTwitterTags('dashboard');

  useEffect(() => {
    if (events.length > 0 && !initialScrollDone.current && filter === 'all' && !searchQuery) {
      const today = startOfDay(new Date());
      const upcomingEventIndex = events.findIndex(event => {
        const eventDate = startOfDay(parseISO(event.date));
        return isEqual(eventDate, today) || isAfter(eventDate, today);
      });

      if (upcomingEventIndex !== -1) {
        const upcomingEventId = events[upcomingEventIndex].id;
        const cardElement = cardRefs.current[upcomingEventId];
        if (cardElement) {
          setTimeout(() => {
            cardElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
          initialScrollDone.current = true;
        }
      }
    }
  }, [events, filter, searchQuery]);

  const handleResizeClick = (event, cardId) => {
    const cardElement = cardRefs.current[cardId];
    if (cardElement) {
        const rect = cardElement.getBoundingClientRect();
        setPopoverPosition({ top: rect.top + window.scrollY, right: window.innerWidth - rect.right });
        setResizingEvent(event);
    }
  };

  const handlePriorityChange = (eventToUpdate, newPriority) => {
    if (updateEventPriority) {
      updateEventPriority(eventToUpdate.id, newPriority);
    }
  };

  const confirmHideEvent = async () => {
    if (!hidingEvent) return;
    const eventToHide = hidingEvent;
    setHidingEvent(null);

    setEvents(prevEvents => prevEvents.filter(e => e.id !== eventToHide.id));

    const { error } = await supabase.rpc('set_user_event_hidden_status', {
      p_event_id: eventToHide.id,
      p_is_hidden: true,
    });

    if (error) {
      toast({
        title: 'Error Hiding Event',
        description: 'Could not hide the event. Please try again.',
        variant: 'destructive',
      });
      setEvents(prevEvents => [...prevEvents, eventToHide].sort((a, b) => new Date(a.date) - new Date(b.date)));
    } else {
      toast({
        title: 'Event Hidden',
        description: `"${eventToHide.title}" won't be shown in your calendar.`,
      });
    }
  };

  const filteredEvents = useFilteredEvents(events, filter, selectedMonth, tagFilter, searchQuery, showHolidays);

  const confirmDelete = () => {
    if (deletingEvent) {
      deleteEvent(deletingEvent);
      setDeletingEvent(null);
    }
  };

  const handleRemoveAttendee = (eventId, attendeeId) => {
    removeAttendee(eventId, attendeeId);
    setViewingNotesEvent(prev => {
      if (!prev) return null;
      return {
        ...prev,
        attendees: prev.attendees.filter(a => a.id !== attendeeId),
      };
    });
  };

  return (
    <>
      <Helmet>
        <title>{getPageTitle('dashboard')}</title>
        <meta name="description" content={getMetaDescription('dashboard')} />
        <link rel="canonical" href={getCanonicalURL('dashboard')} />
        
        {Object.entries(ogTags).map(([key, value]) => (
          <meta key={key} property={key} content={value} />
        ))}
        
        {Object.entries(twitterTags).map(([key, value]) => (
          <meta key={key} name={key} content={value} />
        ))}
      </Helmet>
      
      <div className="h-full overflow-y-auto">
        {!isFriendView && (
          <motion.div
            className="sticky top-0 z-30"
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            // Task 4: CSS Containment
            style={{ contain: 'layout paint' }}
          >
            <div className="max-w-3xl mx-auto px-4 pt-4 pb-2">
              <HomeHeader
                user={user}
                onFilterToggle={() => setIsFiltersVisible(!isFiltersVisible)}
                isFiltersVisible={isFiltersVisible}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </div>
            <AnimatePresence>
              {isFiltersVisible && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -20 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                  // Task 4: Prevent reflow
                  style={{ willChange: 'height, opacity' }}
                >
                  <div className="max-w-3xl mx-auto px-4 pb-2">
                    <EventFilters
                      filter={filter}
                      setFilter={setFilter}
                      events={events}
                      setSelectedMonth={setSelectedMonth}
                      showHolidays={showHolidays}
                      setShowHolidays={setShowHolidays}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 max-w-3xl mx-auto p-4 pb-24 relative"
          // Task 4: Isolate layout
          style={{ contain: 'layout' }}
        >
          <AnimatePresence>
            {filteredEvents.length > 0 ? (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    ref={el => cardRefs.current[event.id] = el}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative"
                    // Task 4: Reserve space & isolate
                    style={{ minHeight: '160px', contain: 'layout paint' }}
                  >
                    <EventCard
                      event={event}
                      imageOpacity={imageOpacity}
                      isFriendView={isFriendView}
                      onEdit={onEditEvent}
                      onDelete={setDeletingEvent}
                      onShowNotes={setViewingNotesEvent}
                      onResize={(e) => handleResizeClick(e, event.id)}
                      onHide={setHidingEvent}
                      onViewFriendCalendar={onViewFriendCalendar}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <HomeEmptyState isFriendView={isFriendView} onCreateEvent={() => setCurrentView('add-event')} />
            )}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {resizingEvent && (
            <div style={{ position: 'absolute', top: popoverPosition.top, right: popoverPosition.right, zIndex: 50 }}>
              <SizeSelectorPopover
                event={resizingEvent}
                onClose={() => setResizingEvent(null)}
                onPriorityChange={handlePriorityChange}
              />
            </div>
          )}
        </AnimatePresence>

        <NotesDialog 
          event={viewingNotesEvent} 
          onClose={() => setViewingNotesEvent(null)} 
          onRemoveAttendee={handleRemoveAttendee}
        />

        {!isFriendView && (
            <>
              <DeleteConfirmationDialog
                event={deletingEvent}
                onClose={() => setDeletingEvent(null)}
                onConfirm={confirmDelete}
              />
              <HideConfirmationDialog
                event={hidingEvent}
                onClose={() => setHidingEvent(null)}
                onConfirm={confirmHideEvent}
              />
            </>
        )}
      </div>
    </>
  );
};

export default HomePage;