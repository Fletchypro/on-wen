import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export const useAppSettings = () => {
    const { user } = useAuth();

    // Default settings
    const defaultSettings = {
        notifications: {
            eventReminders: true,
            friendRequests: true,
            eventUpdates: true,
            newMessages: true
        },
        imageOpacity: 0.3,
        showHolidays: true,
    };

    const getInitialState = (key, defaultValue) => {
        try {
            const storedValue = localStorage.getItem(key);
            if (storedValue) {
                return JSON.parse(storedValue);
            }
        } catch (error) {
            console.error(`Error reading ${key} from localStorage`, error);
        }
        return defaultValue;
    };

    const [notificationPreferences, setNotificationPreferences] = useState(
        () => getInitialState('notificationPreferences', defaultSettings.notifications)
    );
    const [imageOpacity, setImageOpacity] = useState(
        () => getInitialState('imageOpacity', defaultSettings.imageOpacity)
    );
    const [showHolidays, setShowHolidays] = useState(
        () => getInitialState('showHolidays', defaultSettings.showHolidays)
    );

    useEffect(() => {
        try {
            localStorage.setItem('notificationPreferences', JSON.stringify(notificationPreferences));
        } catch (error) {
            console.error('Error saving notification preferences to localStorage', error);
        }
    }, [notificationPreferences]);

    useEffect(() => {
        try {
            localStorage.setItem('imageOpacity', JSON.stringify(imageOpacity));
        } catch (error) {
            console.error('Error saving image opacity to localStorage', error);
        }
    }, [imageOpacity]);
    
    useEffect(() => {
        try {
            localStorage.setItem('showHolidays', JSON.stringify(showHolidays));
        } catch (error) {
            console.error('Error saving showHolidays to localStorage', error);
        }
    }, [showHolidays]);

    const handleSetShowHolidays = useCallback((value) => {
        const newValue = typeof value === 'function' ? value(showHolidays) : value;
        setShowHolidays(newValue);
    }, [showHolidays]);


    const resetAllSettings = useCallback(() => {
        setNotificationPreferences(defaultSettings.notifications);
        setImageOpacity(defaultSettings.imageOpacity);
        setShowHolidays(defaultSettings.showHolidays);

        localStorage.removeItem('notificationPreferences');
        localStorage.removeItem('imageOpacity');
        localStorage.removeItem('showHolidays');
    }, []);

    // Effect to reset settings if user logs out
    useEffect(() => {
        if (!user) {
            // Optional: Decide if settings should reset on logout.
            // resetAllSettings();
        }
    }, [user, resetAllSettings]);


    return {
        notificationPreferences,
        setNotificationPreferences,
        imageOpacity,
        setImageOpacity,
        showHolidays,
        setShowHolidays: handleSetShowHolidays,
        resetAllSettings,
    };
};