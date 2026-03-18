import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { themes, THEME_STORAGE_KEY } from '@/contexts/themePresets';

const ThemeContext = createContext();

export { themes };

const applyThemeToDOM = (themeObj) => {
  if (typeof document === 'undefined') return;
  const t = themeObj || themes[0];
  document.documentElement.setAttribute('data-vd-theme', t.id);
  document.documentElement.classList.add('dark');
  document.documentElement.classList.remove('light');
  document.documentElement.style.setProperty('--theme-atmosphere', t.atmosphere || '56 189 248');
};

/** Server theme when set; otherwise device (survives failed DB save); else System */
const resolveThemeId = (profile) => {
  const fromProfile =
    profile?.app_settings && typeof profile.app_settings.theme === 'string'
      ? profile.app_settings.theme
      : null;
  if (fromProfile) return fromProfile;
  try {
    const ls = localStorage.getItem(THEME_STORAGE_KEY);
    if (ls) return ls;
  } catch (_) { /* private mode */ }
  return 'default';
};

export const ThemeProvider = ({ children }) => {
  const { user, profile, setProfile, loading: authLoading } = useAuth();
  const [activeTheme, setActiveTheme] = useState(themes[0]);

  // Sync from server (if set) or localStorage — never force "default" for logged-in users without DB theme
  useEffect(() => {
    if (authLoading) return;
    const themeId = resolveThemeId(profile);
    const t = themes.find((x) => x.id === themeId) || themes[0];
    setActiveTheme(t);
    applyThemeToDOM(t);
  }, [authLoading, user?.id, profile?.app_settings?.theme]);

  const setTheme = useCallback(async (themeId) => {
    const newTheme = themes.find((t) => t.id === themeId) || themes[0];
    setActiveTheme(newTheme);
    applyThemeToDOM(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme.id);
    } catch (_) { /* ignore */ }

    if (user?.id && profile) {
      const newAppSettings = {
        ...(profile.app_settings && typeof profile.app_settings === 'object' ? profile.app_settings : {}),
        theme: newTheme.id,
      };
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ app_settings: newAppSettings })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Theme save failed (choice still applies on this device):', error);
      } else if (data) {
        setProfile(data);
      }
    }
  }, [user?.id, profile, setProfile]);

  const value = useMemo(
    () => ({
      theme: activeTheme,
      setTheme,
      themes,
    }),
    [activeTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
