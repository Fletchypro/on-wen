import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import FriendsEventFeed from '@/components/FriendsEventFeed';
import SubscribedEventsPage from '@/components/SubscribedEventsPage';
import DashboardContent from '@/components/DashboardContent';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Helmet } from 'react-helmet';
import { getPageTitle, getMetaDescription, getOGTags, getTwitterTags, getCanonicalURL } from '@/lib/seoHelpers';

const DashboardV2Page = ({
  events, setEvents, addEvent, deleteEvent, onEditEvent, searchQuery, setSearchQuery, imageOpacity,
  onViewUserProfile, onViewFriendCalendar, setCurrentView, eventInvitesCount, refetchCalendar
}) => {
  const scrollContainerRef = useRef(null);
  const mainPanelRef = useRef(null);
  const [discoverTab, setDiscoverTab] = useState('friends');
  const { user, profile } = useAuth();

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

  // Refetch calendar when user swipes to the calendar panel so added events (e.g. from Nearby) show up
  useEffect(() => {
    const root = scrollContainerRef.current;
    const el = mainPanelRef.current;
    if (!root || !el || typeof refetchCalendar !== 'function') return;
    // Use scroll container as root so we only fire when the panel is visible inside the horizontal scroll
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) refetchCalendar();
      },
      { root, rootMargin: '0px', threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [refetchCalendar]);

  // Backup: refetch on scroll when calendar panel comes into view (handles swipe without relying on IO root)
  const lastFetchedForPanelRef = useRef(-1);
  useEffect(() => {
    const container = scrollContainerRef.current;
    const panelEl = mainPanelRef.current;
    if (!container || !panelEl || typeof refetchCalendar !== 'function') return;
    const onScroll = () => {
      const scrollLeft = container.scrollLeft;
      const panelWidth = panelEl.offsetWidth;
      const panelIndex = Math.round(scrollLeft / panelWidth);
      if (panelIndex === 1 && lastFetchedForPanelRef.current !== 1) {
        lastFetchedForPanelRef.current = 1;
        refetchCalendar();
      } else if (panelIndex !== 1) {
        lastFetchedForPanelRef.current = panelIndex;
      }
    };
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [refetchCalendar]);

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
              fetchCalendarEvents={refetchCalendar}
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