import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { startOfMonth } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import HomeHeader from '@/components/home/HomeHeader';
import EventFilters from '@/components/home/EventFilters';
import EventCard from '@/components/home/EventCard';
import HomeEmptyState from '@/components/home/HomeEmptyState';
import EventDetailDialog from '@/components/EventDetailDialog';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useEventTags } from '@/hooks/useEventTags';
import { useFilteredEvents } from '@/hooks/useFilteredEvents';
import { useEventCardInteractions } from '@/hooks/useEventCardInteractions';
import SizeSelectorPopover from '@/components/home/event-card/SizeSelectorPopover';

const DashboardContent = ({ events, setEvents, deleteEvent, onEditEvent, imageOpacity = 0.3, onViewFriendCalendar, setCurrentView, eventInvitesCount, isInDashboardV2 }) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [filter, setFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()));
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [resizingEvent, setResizingEvent] = useState(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, right: 0 });
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const cardRefs = useRef({});

  const { tags: userTags } = useEventTags();

  const filteredEvents = useFilteredEvents(events, filter, selectedMonth, tagFilter, '');

  const { handleResizeClick, handlePriorityChange } = useEventCardInteractions(
    setEvents,
    () => {}, // setHidingEvent not needed here
    setResizingEvent,
    cardRefs,
    setPopoverPosition
  );

  const handleCardClick = (event) => {
    setSelectedEvent(event);
  };

  const renderContent = () => {
    if (filteredEvents && filteredEvents.length > 0) {
      return (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05,
              },
            },
          }}
          initial="hidden"
          animate="show"
          // Task 4: Isolate layout for list
          style={{ contain: 'layout' }}
        >
          {filteredEvents.map((event) => (
            <motion.div
              key={event.id}
              ref={el => cardRefs.current[event.id] = el}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
              // Task 4: Reserve space for each item to prevent reflow
              style={{ minHeight: '160px', contain: 'layout paint' }}
            >
              <EventCard
                event={event}
                imageOpacity={imageOpacity}
                onClick={() => handleCardClick(event)}
                onResize={handleResizeClick}
              />
            </motion.div>
          ))}
        </motion.div>
      );
    }
    return <HomeEmptyState onCreateEvent={() => navigate('/add-event')} />;
  };

  const ContentWrapper = ({ children }) => {
    if (isInDashboardV2) {
      return (
        <div className="flex-1 overflow-hidden">
          <Helmet>
            <title>My Events - Wen</title>
            <meta name="description" content="Manage your personal calendar, discover events, and connect with friends in Wen." />
          </Helmet>
          <div className="h-full overflow-y-auto overflow-x-hidden pb-24 md:pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="mb-4 relative z-10">
              <HomeHeader
                onFilterToggle={() => setIsFiltersVisible(!isFiltersVisible)}
                isFiltersVisible={isFiltersVisible}
                onViewFriendCalendar={onViewFriendCalendar}
                onViewUserProfile={(profile) => navigate(`/profile/${profile.id}`, { state: { profile } })}
                eventInvitesCount={eventInvitesCount}
                profile={profile}
              />
              <AnimatePresence>
                {isFiltersVisible && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -20 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden px-4"
                    style={{ willChange: 'height, opacity' }} // Task 5: optimize animation
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
            {children}
          </div>
        </div>
      );
    }
    return (
      <motion.div 
        className="flex-1 overflow-hidden bg-black/20 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/10 shadow-2xl"
        style={{ contain: 'layout paint' }} // Task 4: Contain wrapper
      >
        <div className="h-full overflow-y-auto pr-2">
          {children}
        </div>
      </motion.div>
    );
  };

  return (
    <div 
      className="h-full flex flex-col text-white relative"
    >
      <ContentWrapper>
        {renderContent()}
      </ContentWrapper>

      
      <EventDetailDialog
        event={selectedEvent}
        setEvents={setEvents}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onEdit={onEditEvent}
        onDelete={deleteEvent}
        onViewFriendCalendar={onViewFriendCalendar}
        onViewUserProfile={(profile) => navigate(`/profile/${profile.id}`, { state: { profile } })}
        onPriorityChange={handlePriorityChange}
      />
      
       <AnimatePresence>
        {resizingEvent && (
          <div style={{ position: 'fixed', top: popoverPosition.top, right: popoverPosition.right, zIndex: 100 }}>
            <SizeSelectorPopover
              event={resizingEvent}
              onClose={() => setResizingEvent(null)}
              onPriorityChange={handlePriorityChange}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardContent;