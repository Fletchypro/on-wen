import { useMemo } from 'react';
import { isWithinInterval, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, isBefore } from 'date-fns';

export const useFilteredEvents = (events, filter, selectedMonth, tagFilter, searchQuery) => {
  return useMemo(() => {
    let intermediateEvents = events || [];

    if (tagFilter) {
      intermediateEvents = intermediateEvents.filter(event => event.tag_id === tagFilter);
    } else {
      const now = new Date();
      const today = startOfDay(now);

      if (filter === 'past') {
        intermediateEvents = intermediateEvents.filter(event => {
          const eventEnd = event.end_date ? endOfDay(parseISO(event.end_date)) : startOfDay(parseISO(event.date));
          return isBefore(eventEnd, today);
        }).sort((a, b) => parseISO(b.date) - parseISO(a.date));
      } else if (filter !== 'all') {
        let interval;

        switch (filter) {
          case 'day':
            interval = { start: startOfDay(now), end: endOfDay(now) };
            break;
          case 'week':
            interval = { start: startOfWeek(now), end: endOfWeek(now) };
            break;
          case 'month':
            interval = { start: startOfMonth(selectedMonth), end: endOfMonth(selectedMonth) };
            break;
          default:
            break;
        }

        if (interval) {
          intermediateEvents = intermediateEvents.filter(event => {
            const eventStart = startOfDay(parseISO(event.date));
            const eventEnd = event.end_date ? endOfDay(parseISO(event.end_date)) : eventStart;
            return isWithinInterval(eventStart, interval) || isWithinInterval(eventEnd, interval) || (eventStart < interval.start && eventEnd > interval.end);
          });
        }
      } else {
        intermediateEvents = intermediateEvents.filter(event => {
          const eventEnd = event.end_date ? endOfDay(parseISO(event.end_date)) : startOfDay(parseISO(event.date));
          return !isBefore(eventEnd, today);
        });
      }
    }

    let finalEvents = intermediateEvents.filter(event => event.event_type !== 'holiday');

    if (searchQuery) {
      return finalEvents.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.event_type?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return finalEvents;
  }, [events, filter, selectedMonth, tagFilter, searchQuery]);
};