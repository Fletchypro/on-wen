import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import NearbyEventCard from '@/components/home/NearbyEventCard';

const PublicEventsFeed = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [city, setCity] = useState('');

    useEffect(() => {
        const fetchCityAndEvents = async () => {
            try {
                // This is a mock location fetch. In a real app, you'd use navigator.geolocation
                // and a reverse geocoding service.
                const mockCity = "New York"; 
                setCity(mockCity);

                const { data, error } = await supabase.rpc('get_public_events_by_city', { p_city_name: mockCity });
                
                if (error) throw error;
                setEvents(data);
            } catch (error) {
                console.error('Error fetching public events:', error);
                toast({
                    title: "Error",
                    description: "Could not fetch events near you.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchCityAndEvents();
    }, []);

    const handleJoinEvent = async (eventId) => {
        if (!user) {
            toast({ title: "Authentication required", description: "You must be logged in to join an event.", variant: "destructive" });
            return;
        }

        try {
            const { error } = await supabase
                .from('event_attendees')
                .insert({ event_id: eventId, user_id: user.id });

            if (error) throw error;
            
            toast({ title: "Success!", description: "You have joined the event." });
            // Optimistically update UI
            setEvents(prevEvents => prevEvents.map(e => {
                if (e.id === eventId) {
                    // This is a simplified update. A real app might need to add the full user profile.
                    return { ...e, attendees: [...(e.attendees || []), { id: user.id }] };
                }
                return e;
            }));

        } catch (error) {
            console.error('Error joining event:', error);
            if (error.code === '23505') { // unique constraint violation
                toast({ title: "Already Joined", description: "You are already an attendee of this event.", variant: "default" });
            } else {
                toast({ title: "Error", description: "Could not join the event. Please try again.", variant: "destructive" });
            }
        }
    };
    
    if (loading) {
        return (
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-white mb-4">Events Near You</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-36 rounded-2xl bg-white/10 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-2xl font-bold tracking-tight text-white mb-4">
                Events Near <span className="text-sky-300">{city || "You"}</span>
            </h2>
            {events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {events.map((event) => (
                           <NearbyEventCard key={event.id} event={event} onJoinEvent={handleJoinEvent} />
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="text-center py-10 px-4 rounded-2xl bg-white/5">
                    <p className="text-white/70">No public events found near you right now.</p>
                    <p className="text-white/50 text-sm mt-2">Why not create one and get something started?</p>
                </div>
            )}
        </div>
    );
};

export default PublicEventsFeed;