import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, CalendarCheck } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import AttendeeAvatars from '@/components/home/event-card/AttendeeAvatars';
import { getPriorityColor } from '@/lib/eventCardUtils';

const NearbyEventCard = ({ event, onJoinEvent }) => {
    const { theme } = useTheme();

    const getMapLink = (address, location) => {
        const query = address || location || '';
        const encodedQuery = encodeURIComponent(query);
        return `https://maps.apple.com/?q=${encodedQuery}`;
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative rounded-2xl overflow-hidden shadow-lg group bg-white/10 backdrop-blur-xl border border-white/20"
        >
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getPriorityColor(event.priority)}`} />

            <div className="p-4 flex flex-col h-full">
                <div className="flex-grow">
                    <h3 className="font-bold text-lg text-white truncate">{event.title}</h3>
                    <div className="flex items-center text-sm text-white/70 mt-1">
                        <MapPin size={14} className="mr-2 flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                    </div>

                    <p className="text-xs text-white/50 mt-2">
                        Created by {event.creator.first_name} {event.creator.last_name}
                    </p>
                </div>

                <div className="flex items-end justify-between mt-4">
                    <AttendeeAvatars attendees={event.attendees} maxAvatars={3} size="sm" />
                    <Button
                        onClick={(e) => { e.stopPropagation(); onJoinEvent(event.id); }}
                        className={`h-8 px-3 bg-gradient-to-r ${theme.gradient} text-white font-bold shadow-md hover:opacity-90 transition-opacity`}
                    >
                        <CalendarCheck className="mr-2 h-4 w-4" />
                        I'm Going
                    </Button>
                </div>
                 <a 
                    href={getMapLink(event.address, event.location)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0"
                    aria-label={`View map for ${event.title}`}
                />
            </div>
        </motion.div>
    );
};

export default NearbyEventCard;