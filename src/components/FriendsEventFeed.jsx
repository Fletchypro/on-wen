import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import EventCard from '@/components/home/EventCard';
import ExternalEventDetailDialog from '@/components/ExternalEventDetailDialog';
import { Rss, Frown, Users, MapPin, Tv2, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usCities } from '@/data/index.js';
import { Badge } from '@/components/ui/badge';
import CreatableSelect from '@/components/ui/creatable-select';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocationCity } from '@/hooks/useLocationCity';
import { useExternalEvents } from '@/hooks/useExternalEvents';

const cityOptions = usCities.map((city) => ({
  value: city.name,
  label: `${city.name}, ${city.state}`,
}));

const FriendsEventFeed = ({ onViewUserProfile, fetchCalendarEvents, activeTab, onTabChange, addEvent }) => {
  const [feedEvents, setFeedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState(null);
  const [currentActiveTab, setCurrentActiveTab] = useState(activeTab || 'friends');

  const {
    city: locationCity,
    loading: locationLoading,
    error: locationError,
    fetchCity: fetchLocationCity,
    tryOnce: tryLocationOnce,
  } = useLocationCity();

  const { events: externalEvents, loading: externalLoading, error: externalError } = useExternalEvents(
    currentActiveTab === 'nearby' ? selectedCity : null
  );

  const [externalEventsFromDb, setExternalEventsFromDb] = useState([]);
  const [selectedExternalEvent, setSelectedExternalEvent] = useState(null);

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

  // Load persisted external events so everyone can see them (even if Edge Function fails)
  useEffect(() => {
    if (currentActiveTab !== 'nearby' || !selectedCity) {
      setExternalEventsFromDb([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.rpc('get_external_events_by_city', {
        p_city_name: selectedCity,
      });
      if (cancelled) return;
      if (error) {
        if (import.meta.env.DEV) console.warn('[get_external_events_by_city]', error.message);
        setExternalEventsFromDb([]);
        return;
      }
      const list = Array.isArray(data) ? data : [];
      setExternalEventsFromDb(list);
    })();
    return () => { cancelled = true; };
  }, [currentActiveTab, selectedCity]);

  const userClearedLocationRef = useRef(false);

  // Auto-set city from device location when user is on Nearby tab (events by location)
  useEffect(() => {
    if (currentActiveTab !== 'nearby') {
      userClearedLocationRef.current = false;
      return;
    }
    tryLocationOnce();
  }, [currentActiveTab, tryLocationOnce]);
  // Sync auto-detected location into selected city; prefer matching usCities so backend gets consistent name
  useEffect(() => {
    if (currentActiveTab !== 'nearby' || !locationCity || selectedCity || userClearedLocationRef.current) return;
    const cityPart = locationCity.includes(',') ? locationCity.split(',')[0].trim() : locationCity;
    const match = cityOptions.find(
      (c) => c.value.toLowerCase() === cityPart.toLowerCase() || c.label.toLowerCase().startsWith(cityPart.toLowerCase() + ',')
    );
    setSelectedCity(match ? match.value : locationCity);
  }, [currentActiveTab, locationCity, selectedCity]);

  // Realtime: refetch feed when new events are created or updated so public events appear automatically
  const fetchFeedRef = useRef(fetchFeed);
  fetchFeedRef.current = fetchFeed;
  const debounceRef = useRef(null);
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('discover-feed:events')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
        },
        () => {
          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(() => {
            fetchFeedRef.current();
            debounceRef.current = null;
          }, 800);
        }
      )
      .subscribe();
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      supabase.removeChannel(channel);
    };
  }, [user]);

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

  const handleAddExternalToCalendar = useCallback(
    async (externalEvent) => {
      if (!addEvent || !externalEvent?.isExternal) return;
      const startDate = externalEvent.date || new Date().toISOString().slice(0, 10);
      const eventData = {
        title: externalEvent.title,
        date: startDate,
        end_date: startDate,
        time: externalEvent.time || null,
        location: externalEvent.location || null,
        address: externalEvent.address || null,
        notes: externalEvent.external_url ? `From ${externalEvent.source}: ${externalEvent.external_url}` : null,
        priority: 1,
        title_size: 16,
        title_color: '#FFFFFF',
        image: externalEvent.image || null,
        image_position: '50% 50%',
        event_type: 'personal',
        visibility: 1,
        show_on_feed: false,
        attendees: [],
        tag_id: null,
      };
      try {
        await addEvent(eventData, [], null);
        if (fetchCalendarEvents) fetchCalendarEvents();
        if (fetchFeed) fetchFeed();
      } catch (err) {
        console.error('Add external to calendar failed:', err);
      }
    },
    [addEvent, fetchCalendarEvents, fetchFeed]
  );

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
  };

  const mergedNearbyEvents = useMemo(() => {
    if (currentActiveTab !== 'nearby') return feedEvents;
    const fromApi = externalEvents || [];
    const fromDb = externalEventsFromDb || [];
    const seen = new Set(fromApi.map((e) => e.id));
    const fromDbOnly = fromDb.filter((e) => e.id && !seen.has(e.id));
    const combined = [...(feedEvents || []), ...fromApi, ...fromDbOnly];
    return combined.sort((a, b) => {
      const dA = a.date ? new Date(a.date + (a.time ? `T${a.time}` : '')).getTime() : 0;
      const dB = b.date ? new Date(b.date + (b.time ? `T${b.time}` : '')).getTime() : 0;
      return dA - dB;
    });
  }, [currentActiveTab, feedEvents, externalEvents, externalEventsFromDb]);
  
  const renderContent = () => {
    const eventsToShow = currentActiveTab === 'nearby' ? mergedNearbyEvents : feedEvents;
    const isLoading = loading || (currentActiveTab === 'nearby' && selectedCity && externalLoading && externalEvents.length === 0 && feedEvents.length === 0);
    if (isLoading && eventsToShow.length === 0)
      return (
        <div className="text-center text-white/80 py-10 flex flex-col items-center justify-center h-full">
          <Rss className="animate-pulse mx-auto h-12 w-12 text-blue-400" />
          <p className="mt-4">Loading events...</p>
        </div>
      );

    if (eventsToShow.length > 0)
      return (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.05 } },
          }}
          initial="hidden"
          animate="show"
        >
          {eventsToShow.map((event) => (
            <motion.div key={event.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
              <EventCard
                event={event}
                isFriendFeed={currentActiveTab === 'friends'}
                isPublicFeed={currentActiveTab === 'nearby' || currentActiveTab === 'streaming'}
                isStreamingFeed={currentActiveTab === 'streaming'}
                hideEventType={currentActiveTab !== 'friends'}
                onViewFriendCalendar={(friend) => navigate('/friend-calendar', { state: { friend } })}
                onViewUserProfile={onViewUserProfile}
                onJoinEvent={event.isExternal ? undefined : handleJoinEvent}
                onRequestToJoin={event.isExternal ? undefined : handleRequestToJoin}
                isExternal={event.isExternal}
                onAddToCalendar={event.isExternal ? () => handleAddExternalToCalendar(event) : undefined}
                onClick={event.isExternal ? () => setSelectedExternalEvent(event) : undefined}
              />
            </motion.div>
          ))}
        </motion.div>
      );

    const hasExternal = (externalEvents?.length || 0) + (externalEventsFromDb?.length || 0) > 0;
    const nearbyEmpty = currentActiveTab === 'nearby' && selectedCity && !externalLoading && !hasExternal;
    return (
      <div className="text-center p-12 flex flex-col items-center justify-center h-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg">
        <Frown size={80} className="text-blue-300 mb-6" />
        <h3 className="2xl font-bold text-white">It's quiet here...</h3>
        <p className="text-foreground/70 mt-3 max-w-sm">
          {currentActiveTab === 'friends'
            ? 'No events from your friends right now.'
            : currentActiveTab === 'nearby' && selectedCity
            ? nearbyEmpty
              ? externalError
                ? `No events in ${getCityLabel(selectedCity) || selectedCity}. (External events: ${externalError}. Use the same Supabase project that has fetch-external-events deployed.)`
                : `No events found in ${getCityLabel(selectedCity) || selectedCity}.`
              : `No public events found in ${getCityLabel(selectedCity) || selectedCity}.`
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
                  {locationLoading && !selectedCity ? (
                    <p className="text-sm text-white/70 mt-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4 animate-pulse" />
                      Getting your location…
                    </p>
                  ) : selectedCity ? (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-2 text-lg py-1 px-3 bg-white/10 border-white/20 text-white"
                      >
                        <span>{getCityLabel(selectedCity) || selectedCity}</span>
                        <button
                          onClick={() => {
                            userClearedLocationRef.current = true;
                            setSelectedCity(null);
                          }}
                          className="rounded-full hover:bg-white/20 transition-colors p-0.5"
                          aria-label="Clear city"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-white/70 hover:text-white text-sm"
                        onClick={() => {
                          userClearedLocationRef.current = false;
                          setSelectedCity(null);
                          fetchLocationCity();
                        }}
                      >
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        Use my location
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-2 space-y-2">
                      <div className="flex gap-2 flex-wrap items-center">
                        <CreatableSelect
                          options={cityOptions}
                          onChange={(selectedOption) => {
                            setSelectedCity(selectedOption ? selectedOption.value : null);
                          }}
                          placeholder="Search or type a city..."
                          value={selectedCity}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="shrink-0 bg-white/10 border-white/20 text-white hover:bg-white/20"
                          onClick={() => {
                            userClearedLocationRef.current = false;
                            fetchLocationCity();
                          }}
                          disabled={locationLoading}
                        >
                          <MapPin className="h-4 w-4 mr-1.5" />
                          Use my location
                        </Button>
                      </div>
                      {locationError && (
                        <p className="text-xs text-amber-400/90">
                          {locationError}. Pick a city above or allow location to try again.
                        </p>
                      )}
                    </div>
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
      <ExternalEventDetailDialog
        event={selectedExternalEvent}
        isOpen={!!selectedExternalEvent}
        onClose={() => setSelectedExternalEvent(null)}
        onAddToCalendar={handleAddExternalToCalendar}
      />
    </div>
  );
};

export default FriendsEventFeed;