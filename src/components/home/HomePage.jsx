import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { startOfMonth } from 'date-fns';
import { useNavigate } from 'react-router-dom';

import HomeHeader from '@/components/home/HomeHeader';
import EventFilters from '@/components/home/EventFilters';
import EventCard from '@/components/home/EventCard';
import SizeSelectorPopover from '@/components/home/event-card/SizeSelectorPopover';
import HomeEmptyState from '@/components/home/HomeEmptyState';
import { NotesDialog, DeleteConfirmationDialog, HideConfirmationDialog, TicketPurchaseDialog } from '@/components/home/EventDialogs';
import ChatPopup from '@/components/chat/ChatPopup';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useEventTags } from '@/hooks/useEventTags';
import { useFilteredEvents } from '@/hooks/useFilteredEvents';
import { useEventCardInteractions } from '@/hooks/useEventCardInteractions';
import { useEventData } from '@/hooks/useEventData';

const HomePage = ({ events: propEvents, setEvents: propSetEvents, deleteEvent, onEditEvent, imageOpacity = 0.3, onViewFriendCalendar, setCurrentView, eventInvitesCount }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { events: contextEvents, setEvents: contextSetEvents, removeAttendee: contextRemoveAttendee } = useEventData(user, setCurrentView);

  const events = propEvents || contextEvents;
  const setEvents = propSetEvents || contextSetEvents;
  const removeAttendee = contextRemoveAttendee;

  const [filter, setFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()));
  const [viewingNotesEvent, setViewingNotesEvent] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [hidingEvent, setHidingEvent] = useState(null);
  const [resizingEvent, setResizingEvent] = useState(null);
  const [ticketingEvent, setTicketingEvent] = useState(null);
  const [chattingEvent, setChattingEvent] = useState(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, right: 0 });
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const cardRefs = useRef({});

  const { tags: userTags } = useEventTags();

  const dragControls = useDragControls();

  const {
    handleResizeClick,
    handlePriorityChange,
    handleToggleHide,
    confirmHideEvent,
    handleUpdateAttendee
  } = useEventCardInteractions(setEvents, setHidingEvent, setResizingEvent, cardRefs, setPopoverPosition);

  const filteredEvents = useFilteredEvents(events, filter, selectedMonth, tagFilter, '');

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

  const handleDragEnd = (event, info) => {
    const swipeThreshold = 100;
    if (info.offset.x > swipeThreshold) {
      navigate('/friends-feed');
    } else if (info.offset.x < -swipeThreshold) {
      navigate('/subscribed-events');
    }
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="max-w-3xl mx-auto px-4 pt-16 pb-2 w-full z-20">
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex-shrink-0"
        >
          <HomeHeader
            user={user}
            onFilterToggle={() => setIsFiltersVisible(!isFiltersVisible)}
            isFiltersVisible={isFiltersVisible}
            onViewFriendCalendar={onViewFriendCalendar}
            eventInvitesCount={eventInvitesCount}
          />
        </motion.div>
        <AnimatePresence>
          {isFiltersVisible && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="pt-2">
                <EventFilters
                  filter={filter}
                  setFilter={setFilter}
                  events={events}
                  setSelectedMonth={setSelectedMonth}
                  tags={userTags}
                  tagFilter={tagFilter}
                  setTagFilter={setTagFilter}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        drag="x"
        dragControls={dragControls}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        className="flex-grow overflow-y-auto"
        style={{
          maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 max-w-3xl mx-auto p-4 pb-24 relative"
        >
          <AnimatePresence>
            {filteredEvents && filteredEvents.length > 0 ? (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    ref={el => cardRefs.current[event.id] = el}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30, delay: index * 0.05 }}
                    className="relative"
                  >
                    <EventCard
                      event={event}
                      imageOpacity={imageOpacity}
                      onEdit={onEditEvent}
                      onDelete={setDeletingEvent}
                      onShowNotes={setViewingNotesEvent}
                      onResize={(e) => handleResizeClick(event, event.id)}
                      onToggleHide={() => handleToggleHide(event)}
                      onViewFriendCalendar={onViewFriendCalendar}
                      onShowTicketPopup={setTicketingEvent}
                      onShowChat={setChattingEvent}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <HomeEmptyState onCreateEvent={() => setCurrentView('add-event')} />
            )}
          </AnimatePresence>
           <div className="text-center mt-8">
            
          </div>
        </motion.div>
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

      <NotesDialog event={viewingNotesEvent} onClose={() => setViewingNotesEvent(null)} onUpdateAttendee={handleUpdateAttendee} onViewFriendCalendar={onViewFriendCalendar} onRemoveAttendee={handleRemoveAttendee} />
      <TicketPurchaseDialog event={ticketingEvent} onClose={() => setTicketingEvent(null)} />
      <ChatPopup event={chattingEvent} onClose={() => setChattingEvent(null)} onViewFriendCalendar={onViewFriendCalendar} />

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
    </div>
  );
};

export default HomePage;