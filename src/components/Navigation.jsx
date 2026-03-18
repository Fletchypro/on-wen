import React from 'react';
import { motion } from 'framer-motion';
import { Home, MessageCircle, Users, Settings, Plus, Bell, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

/* ---------- Desktop: tooltips OK (hover) ---------- */
const DesktopNavItem = ({ icon: Icon, isActive, onClick, notificationCount = 0, label }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <motion.button
        type="button"
        onClick={onClick}
        className="relative flex items-center justify-center h-12 w-12 min-h-[44px] min-w-[44px] rounded-full transition-colors group contain-layout focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        whileHover={{ scale: 1.06, backgroundColor: 'rgba(255,255,255,0.08)' }}
        whileTap={{ scale: 0.95 }}
        style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
      >
        <Icon
          className={cn(
            'h-6 w-6 transition-colors',
            isActive ? 'text-white' : 'text-white/50 group-hover:text-white/85'
          )}
          strokeWidth={2}
        />
        {isActive && (
          <div className="absolute bottom-1 h-1 w-6 rounded-t-full bg-white/85 shadow-[0_0_8px_rgba(255,255,255,0.35)]" />
        )}
        {!!notificationCount && (
          <motion.span
            className="absolute -top-0.5 -right-0.5 flex min-w-[1.125rem] h-[1.125rem] px-0.5 items-center justify-center rounded-full border border-white/20 bg-red-500 text-[9px] font-bold text-white"
            initial={false}
            animate={{ scale: notificationCount ? 1 : 0, opacity: notificationCount ? 1 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            style={{ pointerEvents: 'none', willChange: 'transform' }}
          >
            {notificationCount > 9 ? '9+' : notificationCount}
          </motion.span>
        )}
      </motion.button>
    </TooltipTrigger>
    <TooltipContent side="bottom" className="bg-zinc-800 text-white border border-white/10">
      <p>{label}</p>
    </TooltipContent>
  </Tooltip>
);

/**
 * Mobile bottom bar: NO Tooltip — on iOS/Android the first tap often only opens the tooltip
 * instead of navigating. Use aria-label + visible labels via title only if needed.
 */
const MobileNavButton = ({ icon: Icon, isActive, onClick, notificationCount = 0, label }) => (
  <motion.button
    type="button"
    aria-label={label}
    title={label}
    onClick={onClick}
    className="relative flex flex-1 min-w-0 basis-0 flex-col items-center justify-center h-full pt-1 pb-2 gap-0.5 active:opacity-90"
    whileTap={{ scale: 0.92 }}
    style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
  >
    <span className="relative inline-flex items-center justify-center">
        <Icon
          className={cn(
            'h-6 w-6 transition-colors shrink-0',
            isActive ? 'text-white' : 'text-white/50'
          )}
          strokeWidth={2}
      />
      {!!notificationCount && (
        <span
          className="absolute -top-1 -right-2 flex min-w-[16px] h-4 px-0.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border border-white/20 z-10"
          aria-hidden
        >
          {notificationCount > 9 ? '9+' : notificationCount}
        </span>
      )}
    </span>
    {isActive && (
      <span className="h-0.5 w-5 rounded-full bg-white/90 mt-auto mb-0.5 shadow-[0_0_6px_rgba(255,255,255,0.4)]" />
    )}
    {!isActive && <span className="h-0.5 w-5 rounded-full bg-transparent mt-auto mb-0.5" aria-hidden />}
  </motion.button>
);

const AddEventButton = ({ onClick, isDesktop }) => (
  <motion.button
    type="button"
    aria-label="Add event"
    onClick={onClick}
    className={cn(
      'flex shrink-0 items-center justify-center rounded-full text-white',
      'border border-white/20 shadow-lg',
      'bg-gradient-to-br from-white/22 via-white/10 to-white/5 backdrop-blur-xl',
      'shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]',
      isDesktop ? 'h-14 w-14' : 'h-11 w-11'
    )}
    whileHover={{ scale: isDesktop ? 1.05 : 1.03 }}
    whileTap={{ scale: 0.94 }}
    transition={{ type: 'spring', stiffness: 400, damping: 22 }}
    style={{ willChange: 'transform', WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
  >
    <Plus className={isDesktop ? 'h-7 w-7' : 'h-6 w-6'} strokeWidth={2.5} />
  </motion.button>
);

const MobileNavigation = ({
  currentView,
  setCurrentView,
  friendRequestCount,
  unreadMessageCount,
  eventInvitesCount,
}) => {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'messages', icon: MessageCircle, notificationCount: unreadMessageCount, label: 'Messages' },
    { id: 'add-event', icon: Plus, label: 'Add' },
    {
      id: 'friends',
      icon: Users,
      notificationCount: (friendRequestCount || 0) + (eventInvitesCount || 0),
      label: 'Friends',
    },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (id) =>
    currentView === id || (typeof currentView === 'string' && currentView.startsWith('chat') && id === 'messages');

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[100] pb-[env(safe-area-inset-bottom,0px)] md:hidden"
      style={{
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
      }}
    >
      <div className="mx-auto max-w-lg px-3 pt-2">
        <div
          className="flex h-[4.25rem] items-stretch rounded-2xl nav-glass-bar nav-glass px-1"
          style={{
            transform: 'translateZ(0)',
          }}
        >
          {navItems.map((item) =>
            item.id === 'add-event' ? (
              <div
                key={item.id}
                className="flex w-[3.25rem] shrink-0 items-center justify-center self-center py-1"
              >
                <AddEventButton onClick={() => setCurrentView('add-event')} isDesktop={false} />
              </div>
            ) : (
              <MobileNavButton
                key={item.id}
                icon={item.icon}
                isActive={isActive(item.id)}
                onClick={() => setCurrentView(item.id)}
                notificationCount={item.notificationCount}
                label={item.label}
              />
            )
          )}
        </div>
      </div>
    </nav>
  );
};

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

  const handleActionClick = () => {};

  return (
    <header
      className="hidden md:flex md:justify-center md:fixed md:top-0 md:left-0 md:right-0 md:z-50 md:pt-4 md:px-4"
      style={{
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        contain: 'layout paint',
      }}
    >
      <div
        className="relative w-full max-w-5xl h-16 rounded-2xl nav-glass-bar nav-glass shadow-lg shadow-black/20"
        style={{
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          willChange: 'transform',
          overflow: 'visible',
          contain: 'layout paint',
        }}
      >
        <div className="flex h-full items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3" />

          <div className="flex items-center gap-3">
            {navItems.map((item) => (
              <DesktopNavItem
                key={item.id}
                icon={item.icon}
                isActive={currentView === item.id || (typeof currentView === 'string' && currentView.startsWith('chat') && item.id === 'messages')}
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
                  type="button"
                  onClick={() => handleActionClick('search')}
                  className="h-12 w-12 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center transition-colors contain-layout focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                  whileHover={{ scale: 1.06, backgroundColor: 'rgba(255,255,255,0.08)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Search className="h-5 w-5 text-white/55" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-zinc-800 text-white border border-white/10">
                <p>Search</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  type="button"
                  onClick={() => handleActionClick('notifications')}
                  className="h-12 w-12 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center transition-colors contain-layout focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                  whileHover={{ scale: 1.06, backgroundColor: 'rgba(255,255,255,0.08)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Bell className="h-5 w-5 text-white/55" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-zinc-800 text-white border border-white/10">
                <p>Notifications</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="contain-layout">
                  <AddEventButton onClick={() => setCurrentView('add-event')} isDesktop />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-zinc-800 text-white border border-white/10">
                <p>Add Event</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </header>
  );
};

const Navigation = (props) => (
  <>
    <DesktopTopToolbar {...props} />
    {!props.isChatPage && <MobileNavigation {...props} />}
  </>
);

export default Navigation;
