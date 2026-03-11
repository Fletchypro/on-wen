import React from 'react';
import { motion } from 'framer-motion';
import { Home, MessageCircle, Users, Settings, Plus, Bell, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

/* ---------- Shared: Desktop item ---------- */
const DesktopNavItem = ({ icon: Icon, isActive, onClick, notificationCount = 0, label }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <motion.button
        onClick={onClick}
        // Task 6: Fixed height/width (nav-item-container class from CSS)
        className="relative flex items-center justify-center h-12 w-12 min-h-[44px] min-w-[44px] rounded-full transition-colors group contain-layout focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
        whileHover={{ scale: 1.06, backgroundColor: 'rgba(255,255,255,0.08)' }}
        whileTap={{ scale: 0.95 }}
        style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
      >
        <Icon
          className={cn(
            'h-6 w-6 transition-colors',
            isActive ? 'text-purple-400' : 'text-gray-400 group-hover:text-white'
          )}
          strokeWidth={2}
        />
        {/* Task 6: Reserved space or absolute positioning for indicators to prevent shifts */}
        {isActive && <div className="absolute bottom-0 h-1 w-6 rounded-t-full bg-purple-400" />}
        {!!notificationCount && (
          <motion.span
            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-gray-800 bg-red-500 text-[10px] font-bold text-white"
            initial={false}
            animate={{ scale: notificationCount ? 1 : 0, opacity: notificationCount ? 1 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            style={{ pointerEvents: 'none', willChange: 'transform' }}
          >
            {notificationCount}
          </motion.span>
        )}
      </motion.button>
    </TooltipTrigger>
    <TooltipContent side="bottom" className="bg-gray-800 text-white border-none">
      <p>{label}</p>
    </TooltipContent>
  </Tooltip>
);

/* ---------- Mobile item ---------- */
const MobileNavItem = ({ icon: Icon, isActive, onClick, notificationCount = 0, label }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <motion.button
        onClick={onClick}
        // Task 6: Fixed dimensions
        className="relative flex items-center justify-center h-full w-full min-h-[44px] flex-col transition-colors group contain-layout focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
        whileTap={{ scale: 0.95 }}
      >
        <Icon
          className={cn(
            'h-6 w-6 transition-colors',
            isActive ? 'text-purple-400' : 'text-gray-400 group-hover:text-white'
          )}
          strokeWidth={2}
        />
        {isActive && <div className="absolute bottom-0 h-1 w-6 rounded-t-full bg-purple-400" />}
        {!!notificationCount && (
          <motion.span
            className="absolute flex h-5 w-5 items-center justify-center rounded-full border-2 border-gray-800 bg-red-500 text-xs font-bold text-white -top-1 right-1/2 mr-[-22px]"
            initial={false}
            animate={{ scale: notificationCount ? 1 : 0, opacity: notificationCount ? 1 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            style={{ pointerEvents: 'none', willChange: 'transform' }}
          >
            {notificationCount}
          </motion.span>
        )}
      </motion.button>
    </TooltipTrigger>
    <TooltipContent side="top" className="bg-gray-800 text-white border-none">
      <p>{label}</p>
    </TooltipContent>
  </Tooltip>
);

/* ---------- Add Event (shared) ---------- */
const AddEventButton = ({ onClick, isDesktop }) => (
  <motion.button
    onClick={onClick}
    className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30"
    whileHover={{ scale: 1.1, rotate: isDesktop ? 0 : 90, boxShadow: '0 0 25px rgba(192, 132, 252, 0.7)' }}
    whileTap={{ scale: 0.9 }}
    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
    style={{ willChange: 'transform' }}
  >
    <Plus className="h-7 w-7 md:h-8 md:w-8" strokeWidth={2.5} />
  </motion.button>
);

/* ---------- Mobile bottom navigation ---------- */
const MobileNavigation = ({
  currentView,
  setCurrentView,
  friendRequestCount,
  unreadMessageCount,
  eventInvitesCount,
}) => {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'messages', icon: MessageCircle, notificationCount: unreadMessageCount, label: 'Messages' },
    { id: 'add-event', icon: Plus, label: 'Add Event' },
    { id: 'friends', icon: Users, notificationCount: (friendRequestCount || 0) + (eventInvitesCount || 0), label: 'Friends' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 h-24 px-4 md:hidden ios-safe-bottom"
      style={{
        transform: 'translateZ(0)',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        contain: 'layout paint' // Task 6: Containment
      }}
    >
      <div className="relative mx-auto h-full max-w-md">
        <div
          className="absolute bottom-4 left-0 right-0 h-16 rounded-2xl glass-strong nav-glass"
          style={{
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            willChange: 'transform',
            overflow: 'visible',
            contain: 'layout paint'
          }}
        >
          <div className="group flex h-full items-center justify-around">
            {navItems.map((item) => (
              <div key={item.id} className="flex h-full w-full items-center justify-center contain-layout">
                {item.id === 'add-event' ? (
                  <AddEventButton onClick={() => setCurrentView('add-event')} />
                ) : (
                  <MobileNavItem
                    icon={item.icon}
                    isActive={currentView === item.id || (currentView.startsWith('chat') && item.id === 'messages')}
                    onClick={() => setCurrentView(item.id)}
                    notificationCount={item.notificationCount}
                    label={item.label}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

/* ---------- Desktop top toolbar ---------- */
const DesktopTopToolbar = ({
  currentView,
  setCurrentView,
  friendRequestCount,
  unreadMessageCount,
  eventInvitesCount,
}) => {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'messages', icon: MessageCircle, notificationCount: unreadMessageCount, label: 'Messages' },
    { id: 'friends', icon: Users, notificationCount: (friendRequestCount || 0) + (eventInvitesCount || 0), label: 'Friends' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const handleActionClick = () => { };

  return (
    <header
      className="hidden md:flex md:justify-center md:fixed md:top-0 md:left-0 md:right-0 md:z-50 md:pt-4 md:px-4"
      style={{
        transform: 'translateZ(0)',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        contain: 'layout paint'
      }}
    >
      <div
        className="relative w-full max-w-5xl h-16 rounded-2xl glass-strong nav-glass shadow-card"
        style={{
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          willChange: 'transform',
          overflow: 'visible',
          contain: 'layout paint'
        }}
      >
        <div className="flex h-full items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            {/* Removed the logo and text here */}
          </div>

          <div className="flex items-center gap-3">
            {navItems.map((item) => (
              <DesktopNavItem
                key={item.id}
                icon={item.icon}
                isActive={currentView === item.id || (currentView.startsWith('chat') && item.id === 'messages')}
                onClick={() => setCurrentView(item.id)}
                notificationCount={item.notificationCount}
                label={item.label}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  onClick={() => handleActionClick('search')}
                  className="h-12 w-12 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center transition-colors contain-layout focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                  whileHover={{ scale: 1.06, backgroundColor: 'rgba(255,255,255,0.08)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Search className="h-5 w-5 text-gray-300" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-gray-800 text-white border-none">
                <p>Search</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  onClick={() => handleActionClick('notifications')}
                  className="h-12 w-12 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center transition-colors contain-layout focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                  whileHover={{ scale: 1.06, backgroundColor: 'rgba(255,255,255,0.08)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Bell className="h-5 w-5 text-gray-300" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-gray-800 text-white border-none">
                <p>Notifications</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="contain-layout">
                  <AddEventButton onClick={() => setCurrentView('add-event')} isDesktop={true} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-gray-800 text-white border-none">
                <p>Add Event</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </header>
  );
};

/* ---------- Wrapper ---------- */
const Navigation = (props) => {
  return (
    <>
      <DesktopTopToolbar {...props} />
      {!props.isChatPage && <MobileNavigation {...props} />}
    </>
  );
};

export default Navigation;