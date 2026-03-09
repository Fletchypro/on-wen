import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { startOfDay, parseISO } from 'date-fns';
import { onLCP, onCLS, onFCP, onTTFB } from 'web-vitals';

import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useEventData } from '@/hooks/useEventData';
import { useFriendRequests } from '@/hooks/useFriendRequests';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { useEventInvites } from '@/hooks/useEventInvites';
import PageTransition from '@/components/PageTransition';
import { useTheme } from '@/contexts/ThemeContext';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { cn } from '@/lib/utils';
import CompleteProfileModal from '@/components/CompleteProfileModal';
import { Loader2 } from 'lucide-react';
import PerformanceDashboard from '@/components/PerformanceDashboard';

// Lazy loaded critical components for route-based code splitting
const DashboardV2Page = lazy(() => import('@/components/DashboardV2Page'));
const LandingPage = lazy(() => import('@/components/LandingPage'));
const SignInPage = lazy(() => import('@/components/SignInPage'));
const SignUpPage = lazy(() => import('@/components/SignUpPage'));

// Lazy loaded feature components
const AddEvent = lazy(() => import('@/components/AddEvent'));
const EditEvent = lazy(() => import('@/components/EditEvent'));
const SettingsPage = lazy(() => import('@/components/SettingsPage'));
const FriendsPage = lazy(() => import('@/components/FriendsPage'));
const ChatPage = lazy(() => import('@/components/ChatPage'));
const MessagesPage = lazy(() => import('@/components/MessagesPage'));
const FriendCalendarPage = lazy(() => import('@/components/FriendCalendarPage'));
const UserProfilePage = lazy(() => import('@/components/UserProfilePage'));
const ResetPasswordPage = lazy(() => import('@/components/ResetPasswordPage'));
const VerifyOtpPage = lazy(() => import('@/components/VerifyOtpPage'));
const SupportPage = lazy(() => import('@/pages/SupportPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'));
const TermsOfServicePage = lazy(() => import('@/pages/TermsOfServicePage'));
const LegalPage = lazy(() => import('@/pages/LegalPage'));
const CommunityGuidelinesPage = lazy(() => import('@/pages/CommunityGuidelinesPage'));
const SecurityPage = lazy(() => import('@/pages/SecurityPage'));
const DeleteAccountPage = lazy(() => import('@/pages/DeleteAccountPage'));
const FeedbackPage = lazy(() => import('@/pages/FeedbackPage'));

// Lazy load FriendsProvider to remove it from critical path
const FriendsProvider = lazy(() => import('@/contexts/FriendsContext').then(module => ({ default: module.FriendsProvider })));

const APP_ICON_URL = 'https://horizons-cdn.hostinger.com/acb8a4e4-bfc7-419c-8d89-b4b0d3ddb388/d0404469f31c90a062889e665be85d0b.png';

const LoadingFallback = () => (
    <div className="h-full w-full flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
    </div>
);

const ProtectedRoute = ({ children }) => {
  const { session, user, loading, isConfirmed } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="h-10 w-10 animate-spin text-purple-400" aria-hidden />
      </div>
    );
  }

  if (!session || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isConfirmed()) {
      const state = {};
      if (user.email) state.email = user.email;
      if (user.phone) state.phone = user.phone;
      state.type = user.email ? 'signup' : 'sms';
      return <Navigate to="/verify" state={{ from: location, ...state }} replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
    const { session, user, loading, isConfirmed } = useAuth();
    const location = useLocation();
    
    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
                <Loader2 className="h-10 w-10 animate-spin text-purple-400" aria-hidden />
            </div>
        );
    }
    
    if (session && user && isConfirmed()) {
        const from = location.state?.from?.pathname || '/dashboard';
        return <Navigate to={from} replace />;
    }

    return children;
};

// Task 5: Defer initialization of heavy hooks
const AppContent = () => {
  const { user, profile, loading: authLoading, setProfile, justSignedUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [notificationPreferences, setNotificationPreferences] = useState({
    eventReminders: true,
    upcomingEvents: true,
    featureUpdates: false,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false);
  const [isDataHooksReady, setIsDataHooksReady] = useState(false);

  // Defer heavy hooks until after mount
  useEffect(() => {
    // Task 5: Use requestIdleCallback if available, fallback to timeout
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => setIsDataHooksReady(true));
    } else {
      setTimeout(() => setIsDataHooksReady(true), 200);
    }
  }, []);

  const { imageOpacity, setImageOpacity } = useAppSettings();

  // These hooks are now conditionally effective or lightweight initially
  const { deleteAllEvents, deleteEvent, addEvent, updateEvent } = useEventData(user, profile, events, setEvents, (view) => navigate(`/${view}`));
  const { friendRequestCount, fetchFriendRequestCount } = useFriendRequests(user);
  const { unreadMessageCount, fetchUnreadCount } = useUnreadMessages(user);
  const { invites, refetchInvites } = useEventInvites();

  const fetchInitialEvents = useCallback(async (userId) => {
    if (!userId) return;
    setEventsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_user_events_with_attendees', { p_user_id: userId });
      if (error) throw error;
  
      const formatted = (data || [])
        .map(item => ({ ...(item?.event_details || {}), is_hidden_from_others: item?.is_hidden_from_others }))
        .filter(e => e.id)
        .sort((a, b) => {
          const aTime = a.date ? startOfDay(parseISO(a.date)).getTime() : Infinity;
          const bTime = b.date ? startOfDay(parseISO(b.date)).getTime() : Infinity;
          if (aTime !== bTime) return aTime - bTime;
          if (a.time && b.time) return String(a.time).localeCompare(String(b.time));
          return a.time ? -1 : (b.time ? 1 : 0);
        });
  
      setEvents(formatted);
    } catch (error) {
      console.error('Error fetching initial events:', error);
    } finally {
      setEventsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && profile && isDataHooksReady) {
      fetchInitialEvents(user.id);
      const isProfileComplete = profile.first_name && profile.username && profile.birthday;
      if (justSignedUp && !isProfileComplete) {
        setShowCompleteProfileModal(true);
      }
    }
  }, [user, profile, fetchInitialEvents, justSignedUp, isDataHooksReady]);

  useEffect(() => {
    if (user && isDataHooksReady) {
      refetchInvites();
    }
  }, [user, refetchInvites, isDataHooksReady]);

  const handleEditClick = (event) => {
    navigate('/edit-event', { state: { eventToEdit: event } });
  };

  const handleDeleteClick = (event) => {
    setShowDeleteConfirm(event);
  };

  const handleConfirmDelete = async () => {
    if (showDeleteConfirm) {
      await deleteEvent(showDeleteConfirm);
      setShowDeleteConfirm(null);
    }
  };

  const handleSelectConversation = (conversation) => {
    navigate(`/chat/${conversation.id}`, { state: { conversation } });
  };

  const handleViewFriendCalendar = (friend) => {
    navigate('/friend-calendar', { state: { friend } });
  };

  const handleViewUserProfile = (profile) => {
    navigate(`/profile/${profile.id}`, { state: { profile } });
  };

  if (authLoading || (user && (!profile || eventsLoading))) {
    return (
        <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${theme.gradient}`}>
        </div>
    );
  }
  
  const isChatPage = location.pathname.startsWith('/chat/');
  const isSettingsPage = location.pathname === '/settings';

  return (
    <div className="flex flex-col h-full min-h-0">
      {user && (
        <Navigation
          currentView={location.pathname.substring(1)}
          setCurrentView={(view) => navigate(`/${view}`)}
          friendRequestCount={friendRequestCount}
          unreadMessageCount={unreadMessageCount}
          eventInvitesCount={invites.filter(i => i.status === 'pending').length}
          isChatPage={isChatPage}
        />
      )}
      <main className={cn(
        "flex-1 flex flex-col overflow-hidden",
        user && "pb-24 md:pb-0",
        isChatPage && "pb-0",
        isSettingsPage && "overflow-y-auto",
        user && "md:pt-28"
      )}>

        <Suspense fallback={<LoadingFallback />}>
            <Routes>
            <Route path="dashboard" element={<PageTransition><DashboardV2Page events={events} setEvents={setEvents} deleteEvent={handleDeleteClick} onEditEvent={handleEditClick} imageOpacity={imageOpacity} onViewFriendCalendar={handleViewFriendCalendar} onViewUserProfile={handleViewUserProfile} setCurrentView={(view) => navigate(`/${view}`)} /></PageTransition>} />
            <Route path="add-event" element={<PageTransition><AddEvent addEvent={addEvent} /></PageTransition>} />
            <Route path="edit-event" element={<PageTransition><EditEvent updateEvent={updateEvent} /></PageTransition>} />
            <Route path="friends" element={<PageTransition><FriendsPage onRequestsHandled={fetchFriendRequestCount} onSelectConversation={handleSelectConversation} onViewFriendCalendar={handleViewFriendCalendar} onViewUserProfile={handleViewUserProfile} /></PageTransition>} />
            <Route path="messages" element={<PageTransition><MessagesPage onViewFriendCalendar={handleViewFriendCalendar} /></PageTransition>} />
            <Route path="settings" element={<PageTransition><SettingsPage deleteAllEvents={deleteAllEvents} imageOpacity={imageOpacity} setImageOpacity={setImageOpacity} notificationPreferences={notificationPreferences} setNotificationPreferences={setNotificationPreferences} /></PageTransition>} />
            <Route path="friend-calendar" element={<PageTransition><FriendCalendarPage onEditEvent={handleEditClick} deleteEvent={deleteEvent} onViewFriendCalendar={handleViewFriendCalendar} imageOpacity={imageOpacity} /></PageTransition>} />
            <Route path="profile/:userId" element={<PageTransition><UserProfilePage onEditEvent={handleEditClick} deleteEvent={deleteEvent} onViewFriendCalendar={handleViewFriendCalendar} imageOpacity={imageOpacity} /></PageTransition>} />
            </Routes>
        </Suspense>

      </main>
      <AlertDialog open={!!showDeleteConfirm} onOpenChange={(isOpen) => !isOpen && setShowDeleteConfirm(null)}>
        <AlertDialogContent className="p-0 border-none bg-transparent shadow-none max-w-lg">
            <div className="relative rounded-2xl overflow-hidden text-white glass-strong">
                <motion.div 
                    className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_0,_#7c3aed_0%,_transparent_40%)]"
                    animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                <div className="relative p-8">
                    <AlertDialogHeader className="text-left mb-6">
                        <AlertDialogTitle className="text-3xl font-bold tracking-tight text-red-400">Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-white/70 mt-1">
                            This action cannot be undone. This will permanently delete the event "{showDeleteConfirm?.title}" and remove all related data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button onClick={() => setShowDeleteConfirm(null)} variant="outline" className="w-full sm:w-auto bg-transparent hover:bg-white/10 border-white/20 text-white font-semibold">Cancel</Button>
                        <Button onClick={handleConfirmDelete} className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-800 text-white font-semibold hover:from-red-700 hover:to-red-900 transition-all">
                            Delete Event
                        </Button>
                    </AlertDialogFooter>
                </div>
            </div>
        </AlertDialogContent>
      </AlertDialog>
      {profile && <CompleteProfileModal isOpen={showCompleteProfileModal} setIsOpen={setShowCompleteProfileModal} profile={profile} setProfile={setProfile} />}
    </div>
  );
}

const AuthLayout = ({ children }) => {
    return (
        <div className="fixed inset-0 w-full h-full overflow-y-auto bg-background">
            <img alt="Abstract background with swirling colors" className="fixed inset-0 h-full w-full object-cover -z-10" src="https://images.unsplash.com/photo-1685825552564-a419152cbf46" loading="lazy" />
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xl -z-10"></div>
            <div className="min-h-full flex flex-col justify-center items-center p-4 py-16 md:p-8 md:py-24">
                <div className="w-full max-w-md">
                    {children}
                </div>
            </div>
        </div>
    );
};


function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  
  // Task 9: Performance Monitoring
  useEffect(() => {
    if (import.meta.env.DEV) {
      onLCP((metric) => console.log('[Web Vitals] LCP:', metric));
      onCLS((metric) => console.log('[Web Vitals] CLS:', metric));
      onFCP((metric) => console.log('[Web Vitals] FCP:', metric));
      onTTFB((metric) => console.log('[Web Vitals] TTFB:', metric));
    }
  }, []);
  
  const handleMessagesRead = useCallback(async () => {
    if (!user) return;
    const { error } = await supabase.rpc('count_unread_messages_for_user', { p_user_id: user.id });
    if (error) console.error('Error refetching unread count:', error);
  }, [user]);

  return (
   <>
    <div className={`h-[100dvh] w-full relative flex flex-col overflow-hidden bg-gradient-to-br transition-all duration-500 text-foreground ${theme.gradient}`}>
      {/* Task 6: Defer Helmet until needed, or use lighter wrapper if possible. For now, key meta tags are in index.html */}
      <Helmet defer={false}>
        <title>Wen</title>
        <meta name="description" content="A visually-rich smart calendar that lets you attach images to events and resize them based on importance." />
        <link rel="icon" type="image/png" href={APP_ICON_URL} />
        <link rel="apple-touch-icon" href={APP_ICON_URL} />
        <meta property="og:image" content={APP_ICON_URL} />
      </Helmet>
      
      <AnimatePresence mode="wait">
        <Suspense fallback={<LoadingFallback />}>
            <Routes location={location} key={location.pathname}>
            <Route path="/login" element={<PublicRoute><AuthLayout><SignInPage /></AuthLayout></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><AuthLayout><SignUpPage /></AuthLayout></PublicRoute>} />
            <Route path="/reset-password" element={<PublicRoute><AuthLayout><ResetPasswordPage /></AuthLayout></PublicRoute>} />
            <Route path="/verify" element={<AuthLayout><VerifyOtpPage /></AuthLayout>} />
            
            <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
            
            <Route path="/support" element={<PageTransition><SupportPage /></PageTransition>} />
            <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
            <Route path="/privacy" element={<PageTransition><PrivacyPage /></PageTransition>} />
            <Route path="/terms-of-service" element={<PageTransition><TermsOfServicePage /></PageTransition>} />
            <Route path="/legal" element={<PageTransition><LegalPage /></PageTransition>} />
            <Route path="/community-guidelines" element={<PageTransition><CommunityGuidelinesPage /></PageTransition>} />
            <Route path="/security" element={<PageTransition><SecurityPage /></PageTransition>} />
            <Route path="/delete-my-account" element={<PageTransition><DeleteAccountPage /></PageTransition>} />
            <Route path="/feedback" element={<PageTransition><FeedbackPage /></PageTransition>} />
            
            <Route path="/chat/:conversationId" element={
                <ProtectedRoute>
                <div className="h-full w-full">
                    <ChatPage onMessagesRead={handleMessagesRead} onViewFriendCalendar={(friend) => navigate('/friend-calendar', { state: { friend } })} />
                </div>
                </ProtectedRoute>
            } />

            <Route path="/*" element={
                <ProtectedRoute>
                    <Suspense fallback={<LoadingFallback />}>
                        <FriendsProvider>
                            <AppContent />
                        </FriendsProvider>
                    </Suspense>
                </ProtectedRoute>
            } />
            </Routes>
        </Suspense>
      </AnimatePresence>
      
      {/* Task 9: Performance Dashboard in Dev Mode */}
      {import.meta.env.DEV && <PerformanceDashboard />}
    </div>
   </>
  );
}

export default App;