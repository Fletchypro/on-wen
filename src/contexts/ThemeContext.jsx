import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const ThemeContext = createContext();

export const themes = [
    {
        name: 'Default',
        id: 'default',
        gradient: 'from-slate-900 via-purple-900 to-indigo-900',
        headerColor: 'text-pink-400',
    },
    {
        name: 'Twilight',
        id: 'twilight',
        gradient: 'from-gray-800 via-gray-900 to-black',
        headerColor: 'text-purple-300',
    },
    {
        name: 'Sunrise',
        id: 'sunrise',
        gradient: 'from-yellow-600 via-red-500 to-pink-500',
        headerColor: 'text-white',
    },
    {
        name: 'Ocean',
        id: 'ocean',
        gradient: 'from-blue-700 via-teal-500 to-green-500',
        headerColor: 'text-cyan-200',
    },
    {
        name: 'Crimson',
        id: 'crimson',
        gradient: 'from-red-800 via-rose-900 to-black',
        headerColor: 'text-red-300',
    },
    {
        name: 'Forest',
        id: 'forest',
        gradient: 'from-green-900 via-emerald-800 to-stone-900',
        headerColor: 'text-lime-300',
    },
    {
        name: 'Sunset',
        id: 'sunset',
        gradient: 'from-orange-600 via-purple-700 to-indigo-800',
        headerColor: 'text-yellow-200',
    },
    {
        name: 'Nebula',
        id: 'nebula',
        gradient: 'from-indigo-900 via-fuchsia-800 to-slate-900',
        headerColor: 'text-pink-300',
    },
    {
        name: 'Mint',
        id: 'mint',
        gradient: 'from-emerald-500 via-cyan-600 to-teal-700',
        headerColor: 'text-white',
    },
    {
        name: 'Amethyst',
        id: 'amethyst',
        gradient: 'from-violet-500 to-fuchsia-500',
        headerColor: 'text-white',
    },
    {
        name: 'Coral Reef',
        id: 'coral-reef',
        gradient: 'from-orange-400 via-pink-500 to-blue-500',
        headerColor: 'text-yellow-200',
    },
    {
        name: 'Midnight City',
        id: 'midnight-city',
        gradient: 'from-blue-900 via-indigo-900 to-gray-900',
        headerColor: 'text-cyan-300',
    },
    {
        name: 'Golden Hour',
        id: 'golden-hour',
        gradient: 'from-yellow-400 via-orange-500 to-red-600',
        headerColor: 'text-white',
    },
    {
        name: 'Emerald Isle',
        id: 'emerald-isle',
        gradient: 'from-emerald-600 via-green-700 to-teal-800',
        headerColor: 'text-lime-200',
    },
    {
        name: 'Ruby Glow',
        id: 'ruby-glow',
        gradient: 'from-red-600 to-pink-600',
        headerColor: 'text-red-200',
    },
    {
        name: 'Sapphire',
        id: 'sapphire',
        gradient: 'from-blue-800 to-indigo-900',
        headerColor: 'text-blue-200',
    },
    {
        name: 'Lavender Fields',
        id: 'lavender-fields',
        gradient: 'from-purple-400 via-pink-400 to-indigo-400',
        headerColor: 'text-white',
    },
    {
        name: 'Cosmic Dust',
        id: 'cosmic-dust',
        gradient: 'from-purple-900 via-black to-indigo-900',
        headerColor: 'text-purple-300',
    },
    {
        name: 'Arctic Dawn',
        id: 'arctic-dawn',
        gradient: 'from-sky-400 to-cyan-200',
        headerColor: 'text-blue-800',
    },
    {
        name: 'Volcano',
        id: 'volcano',
        gradient: 'from-gray-800 via-red-700 to-orange-600',
        headerColor: 'text-yellow-300',
    },
];

const applyThemeToDOM = (themeKey) => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-vd-theme', themeKey || 'default');
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
};

export const ThemeProvider = ({ children }) => {
    const { user, profile, setProfile, loading: authLoading } = useAuth();
    const [activeTheme, setActiveTheme] = useState(themes[0]);

    useEffect(() => {
        if (authLoading) return;

        let themeId;
        if (user && profile?.app_settings?.theme) {
            themeId = profile.app_settings.theme;
        } else if (!user) {
            themeId = localStorage.getItem('wen-theme') || 'default';
        } else {
            themeId = 'default';
        }
        
        const currentTheme = themes.find(t => t.id === themeId) || themes[0];
        setActiveTheme(currentTheme);
        applyThemeToDOM(currentTheme.id);

    }, [user, profile, authLoading]);

    const setTheme = useCallback(async (themeId) => {
        const newTheme = themes.find(t => t.id === themeId) || themes[0];
        setActiveTheme(newTheme);
        applyThemeToDOM(newTheme.id);

        if (user && profile) {
            const newAppSettings = {
                ...(profile.app_settings || {}),
                theme: themeId,
            };

            const { data, error } = await supabase
                .from('user_profiles')
                .update({ app_settings: newAppSettings })
                .eq('id', user.id)
                .select()
                .single();

            if (error) {
                console.error('Error saving theme:', error);
            } else if (data) {
                setProfile(data);
            }
        } else {
             localStorage.setItem('wen-theme', themeId);
        }
    }, [user, profile, setProfile]);
    
    const value = useMemo(() => ({
        theme: activeTheme,
        setTheme,
        themes,
    }), [activeTheme, setTheme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};