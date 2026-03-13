import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import FriendsEventFeed from '@/components/FriendsEventFeed';
import SubscribedEventsPage from '@/components/SubscribedEventsPage';
import DashboardContent from '@/components/DashboardContent';
import { useEventData } from '@/hooks/useEventData';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Helmet } from 'react-helmet';
import { getPageTitle, getMetaDescription, getOGTags, getTwitterTags, getCanonicalURL } from '@/lib/seoHelpers';

const DashboardV2Page = ({
  events, setEvents, addEvent, deleteEvent, onEditEvent, searchQuery, setSearchQuery, imageOpacity,
  onViewUserProfile, onViewFriendCalendar, setCurrentView, eventInvitesCount
}) => {
  const scrollContainerRef = useRef(null);
  const mainPanelRef = useRef(null);
  const [discoverTab, setDiscoverTab] = useState('friends');
  const { user, profile } = useAuth();
  const { fetchEvents } = useEventData(user, profile, events, setEvents);

  const ogTags = getOGTags('dashboard');
  const twitterTags = getTwitterTags('dashboard');

  useEffect(() => {
    if (mainPanelRef.current && scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.offsetWidth;
      mainPanelRef.current.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
      const scrollLeftPosition = mainPanelRef.current.offsetLeft - (containerWidth / 2) + (mainPanelRef.current.offsetWidth / 2);
      scrollContainerRef.current.scrollLeft = scrollLeftPosition;
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: 'easeInOut'
      },
    },
  };

  const Panel = ({ children, className, panelRef }) => (
    <div ref={panelRef} className={`flex-shrink-0 w-full min-w-0 snap-center h-full px-4 py-4 sm:px-5 md:px-6 md:py-6 ${className ?? ''}`}>
      <div className="h-full flex flex-col">
        {children}
      </div>
    </div>
  );

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
      
      <motion.div
        className="flex flex-col h-full overflow-hidden w-full md:max-w-5xl md:mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div ref={scrollContainerRef} className="flex-grow flex overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] md:rounded-2xl">
          <Panel className="w-full">
            <FriendsEventFeed 
              onViewUserProfile={onViewUserProfile} 
              isInDashboardV2={true} 
              activeTab={discoverTab}
              onTabChange={setDiscoverTab}
              fetchCalendarEvents={fetchEvents}
              addEvent={addEvent}
            />
          </Panel>

          <Panel panelRef={mainPanelRef} className="w-full">
            <DashboardContent
              events={events}
              setEvents={setEvents}
              deleteEvent={deleteEvent}
              onEditEvent={onEditEvent}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              imageOpacity={imageOpacity}
              onViewFriendCalendar={onViewFriendCalendar}
              setCurrentView={setCurrentView}
              eventInvitesCount={eventInvitesCount}
              isInDashboardV2={true}
            />
          </Panel>

          <Panel className="w-full">
            <SubscribedEventsPage onViewFriendCalendar={onViewFriendCalendar} isInDashboardV2={true} />
          </Panel>
        </div>
      </motion.div>
    </>
  );
};

export default DashboardV2Page;