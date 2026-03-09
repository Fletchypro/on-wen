import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import EventCard from '@/components/home/EventCard';
import { Rss, Frown, Users, MapPin, Tv2, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usCities } from '@/data/index.js';
import { Badge } from '@/components/ui/badge';
import CreatableSelect from '@/components/ui/creatable-select';
import { useTheme } from '@/contexts/ThemeContext';

const cityOptions = usCities.map((city) => ({
  value: city.name,
  label: `${city.name}, ${city.state}`,
}));

const FriendsEventFeed = ({ onViewUserProfile, fetchCalendarEvents, activeTab, onTabChange }) => {
  const [feedEvents, setFeedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState(null);
  const [currentActiveTab, setCurrentActiveTab] = useState(activeTab || 'friends');

  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();

  useEffect(() => {
    if (onTabChange) {
      onTabChange(currentActiveTab);
    }
  }, [currentActiveTab, onTabChange]);

  const fetchFeed = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      let data, error;
      if (currentActiveTab === 'friends') {
        ({ data, error } = await supabase.rpc('get_friends_event_feed'));
      } else if (currentActiveTab === 'nearby') {
        if (selectedCity) {
          ({ data, error } = await supabase.rpc('get_public_events_by_city', { p_city_name: selectedCity }));
        } else {
          ({ data, error } = await supabase.rpc('get_public_events_by_city', { p_city_name: null }));
        }
      } else if (currentActiveTab === 'streaming') {
        ({ data, error } = await supabase.rpc('get_public_events_by_type', { p_event_type: 'Movie/Show' }));
      }

      if (error) throw error;
      setFeedEvents(data || []);
    } catch (error) {
      console.error('Error fetching event feed:', error);
      toast({
        title: 'Error',
        description: 'Could not load the event feed. Please try again later.',
        variant: 'destructive',
      });
      setFeedEvents([]);
    } finally {
      setLoading(false);
    }
  }, [user, toast, currentActiveTab, selectedCity]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);
  
  const handleJoinEvent = async (eventId) => {
    if (!user) return;
    const { error } = await supabase.from('event_attendees').insert({ event_id: eventId, user_id: user.id });
    if (error) {
      console.error('Error joining event:', error);
      toast({ title: 'Error', description: 'Could not join event.', variant: 'destructive' });
    } else {
      toast({ title: 'Event Joined!', description: 'Added to your calendar.' });
      fetchFeed();
      if (fetchCalendarEvents) fetchCalendarEvents();
    }
  };

  const handleRequestToJoin = async (eventId) => {
    if (!user) return;
    const { error } = await supabase
      .from('event_join_requests')
      .insert({ event_id: eventId, requester_id: user.id, status: 'pending' })
      .select();

    if (error) {
      toast({
        title: 'Error',
        description: error.code === '23505' ? 'Request already sent.' : 'Could not send request.',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Request Sent!', description: 'Your request has been sent.' });
      fetchFeed();
    }
  };

  const getCityLabel = (cityValue) => {
      if (!cityValue) return '';
      const city = cityOptions.find(c => c.value.toLowerCase() === cityValue.toLowerCase());
      return city ? city.label : cityValue;
  }
  
  const renderContent = () => {
    if (loading)
      return (
        <div className="text-center text-white/80 py-10 flex flex-col items-center justify-center h-full">
          <Rss className="animate-pulse mx-auto h-12 w-12 text-blue-400" />
          <p className="mt-4">Loading events...</p>
        </div>
      );

    if (feedEvents.length > 0)
      return (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2" /* Changed gap-4 to gap-2 */
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.05 } },
          }}
          initial="hidden"
          animate="show"
        >
          {feedEvents.map((event) => (
            <motion.div key={event.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
              <EventCard
                event={event}
                isFriendFeed={currentActiveTab === 'friends'}
                isPublicFeed={currentActiveTab === 'nearby' || currentActiveTab === 'streaming'}
                isStreamingFeed={currentActiveTab === 'streaming'}
                hideEventType={currentActiveTab !== 'friends'}
                onViewFriendCalendar={(friend) => navigate('/friend-calendar', { state: { friend } })}
                onViewUserProfile={onViewUserProfile}
                onJoinEvent={handleJoinEvent}
                onRequestToJoin={handleRequestToJoin}
              />
            </motion.div>
          ))}
        </motion.div>
      );

    return (
      <div className="text-center p-12 flex flex-col items-center justify-center h-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg">
        <Frown size={80} className="text-blue-300 mb-6" />
        <h3 className="2xl font-bold text-white">It's quiet here...</h3>
        <p className="text-foreground/70 mt-3 max-w-sm">
          {currentActiveTab === 'friends'
            ? 'No events from your friends right now.'
            : currentActiveTab === 'nearby' && selectedCity
            ? `No public events found in ${getCityLabel(selectedCity) || selectedCity}.`
            : currentActiveTab === 'nearby' && !selectedCity
            ? 'No public events found. Try searching for a city!'
            : 'No public events found.'}
        </p>
      </div>
    );
  };

  const ContentWrapper = ({ children }) => (
    <div className="flex-1 overflow-hidden">
      <div className="h-full overflow-y-auto pb-24 md:pb-6 [&::-webkit-scrollbar]:hidden">
        <div className="relative p-4 glass z-10 mb-4"> {/* Added mb-4 for spacing */}
          <h1 className={cn("text-2xl font-bold tracking-tight mb-4", theme.headerColor)}>Discover Events</h1>
          <div className="relative">
            <div className="glass-strong w-full max-w-[700px] p-1 rounded-full overflow-hidden flex gap-1 mb-4 mx-auto">
              {[
                { id: 'friends', icon: <Users className="h-4 w-4 shrink-0" />, label: 'Friends' },
                { id: 'nearby', icon: <MapPin className="h-4 w-4 shrink-0" />, label: 'Nearby' },
                { id: 'streaming', icon: <Tv2 className="h-4 w-4 shrink-0" />, label: 'Stream' },
              ].map((tab) => (
                <Button
                  key={tab.id}
                  onClick={() => {
                    setCurrentActiveTab(tab.id);
                    setSelectedCity(null);
                  }}
                  variant="ghost"
                  className={cn(
                    'flex-1 h-12 rounded-full gap-2 inline-flex items-center justify-center focus-visible:ring-0 px-2 sm:px-4',
                    currentActiveTab === tab.id
                      ? 'bg-white/12 text-white ring-1 ring-inset ring-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  )}
                >
                  {tab.icon}
                  <span className="whitespace-nowrap">{tab.label}</span>
                </Button>
              ))}
            </div>

            <AnimatePresence>
              {currentActiveTab === 'nearby' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-2 relative"
                >
                  {selectedCity ? (
                    <div className="mt-2">
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-2 text-lg py-1 px-3 bg-white/10 border-white/20 text-white"
                      >
                        <span>{getCityLabel(selectedCity) || selectedCity}</span>
                        <button
                          onClick={() => setSelectedCity(null)}
                          className="rounded-full hover:bg-white/20 transition-colors p-0.5"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </Badge>
                    </div>
                  ) : (
                    <CreatableSelect
                      options={cityOptions}
                      onChange={(selectedOption) => {
                        setSelectedCity(selectedOption ? selectedOption.value : null);
                      }}
                      placeholder="Search or type a city..."
                      value={selectedCity}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        {children}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col text-white relative">
      <ContentWrapper>{renderContent()}</ContentWrapper>
    </div>
  );
};

export default FriendsEventFeed;