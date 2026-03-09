import { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

/**
 * This hook stores BOTH:
 *  - dark/light in app_settings.mode
 *  - color theme key in app_settings.colorTheme
 * For guests (no user), it falls back to localStorage.
 *
 * Usage stays the same: useThemeManager(user, loading)
 * Returns: { darkMode, setDarkMode, colorTheme, setColorTheme }
 */

const LS_KEYS = ['visualdays-theme','visualdays-mode','vd-mode','vd-colorTheme'];

const clearThemeLocalStorage = () => {
  try { LS_KEYS.forEach(k => localStorage.removeItem(k)); } catch {}
};

const applyModeToDOM = (mode /* 'dark' | 'light' */) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('dark','light');
  root.classList.add(mode);
};

const applyColorThemeToDOM = (themeKey /* string */) => {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-vd-theme', themeKey || 'default');
};

export function useThemeManager(user, loading) {
  const [darkMode, setDarkModeState] = useState(true);
  const [colorTheme, setColorThemeState] = useState('default');

  // Clear LS bleed as soon as we have a user session
  useEffect(() => {
    if (!loading && user?.id) clearThemeLocalStorage();
  }, [user?.id, loading]);

  // Initial load (DB for logged-in; LS for guests)
  useEffect(() => {
    if (loading) return;

    (async () => {
      if (user?.id) {
        const { data } = await supabase
          .from('user_profiles')
          .select('app_settings')
          .eq('id', user.id)
          .single();

        const app = data?.app_settings || {};
        const mode = app.mode === 'light' ? 'light' : 'dark';
        const theme = app.colorTheme || 'default';

        setDarkModeState(mode === 'dark');
        setColorThemeState(theme);
        applyModeToDOM(mode);
        applyColorThemeToDOM(theme);
      } else {
        const mode = localStorage.getItem('vd-mode') || 'dark';
        const theme =
          localStorage.getItem('vd-colorTheme') ||
          localStorage.getItem('visualdays-theme') || // legacy key
          'default';

        setDarkModeState(mode === 'dark');
        setColorThemeState(theme);
        applyModeToDOM(mode);
        applyColorThemeToDOM(theme);
      }
    })();
  }, [user?.id, loading]);

  // Persist helper (merge into app_settings for THIS user)
  const persistAppSettings = async (patch) => {
    if (!user?.id) {
      // Guest fallback
      if ('mode' in patch)       localStorage.setItem('vd-mode', patch.mode);
      if ('colorTheme' in patch) localStorage.setItem('vd-colorTheme', patch.colorTheme);
      return;
    }
    const { data: current } = await supabase
      .from('user_profiles')
      .select('app_settings')
      .eq('id', user.id)
      .single();

    const merged = { ...(current?.app_settings || {}), ...patch };

    await supabase
      .from('user_profiles')
      .update({ app_settings: merged })
      .eq('id', user.id); // IMPORTANT: scope to this user only
  };

  // Public setters
  const setDarkMode = (isDark) => {
    const mode = isDark ? 'dark' : 'light';
    setDarkModeState(isDark);
    applyModeToDOM(mode);
    persistAppSettings({ mode });
  };

  const setColorTheme = (themeKey) => {
    setColorThemeState(themeKey || 'default');
    applyColorThemeToDOM(themeKey || 'default');
    persistAppSettings({ colorTheme: themeKey || 'default' });
  };

  return { darkMode, setDarkMode, colorTheme, setColorTheme };
}