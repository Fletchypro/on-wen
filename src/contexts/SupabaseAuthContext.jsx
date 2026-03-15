import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [justSignedUp, setJustSignedUp] = useState(false);

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) return null;
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
      return null;
    }
  }, []);

  const handleSession = useCallback(async (currentSession) => {
    setSession(currentSession);
    const currentUser = currentSession?.user ?? null;
    setUser(currentUser);

    if (currentUser) {
      await fetchProfile(currentUser.id);
    } else {
      setProfile(null);
    }
    setLoading(false);
  }, [fetchProfile]);

  const isConfirmed = useCallback(() => {
    if (!user) return false;
    return user.email_confirmed_at || user.phone_confirmed_at;
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (!cancelled) await handleSession(initialSession);
      } catch (err) {
        console.error('Auth init error:', err);
        if (!cancelled) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    getInitialSession();

    // If Supabase doesn't respond in 3s, show the app anyway (e.g. offline / wrong URL)
    const timeout = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 3000);
    const cleanupTimeout = () => clearTimeout(timeout);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!newSession) {
          await handleSession(null);
          return;
        }
        if (event === 'SIGNED_IN') {
          if (newSession.user.created_at === newSession.user.last_sign_in_at) {
            setJustSignedUp(true);
          }
          await handleSession(newSession);
        } else if (event === 'SIGNED_OUT') {
          await handleSession(null);
        } else if (event === 'USER_UPDATED') {
          setUser(newSession.user);
          await fetchProfile(newSession.user.id);
        } else if (event === 'TOKEN_REFRESHED') {
          setSession(newSession);
        }
      }
    );
    return () => {
      cancelled = true;
      cleanupTimeout();
      subscription.unsubscribe();
    };
  }, [handleSession]);

  const signUp = useCallback(async (email, password, options) => {
    return await supabase.auth.signUp({ email, password, options });
  }, []);

  const signUpWithPhone = useCallback(async (phone, password, options) => {
    return await supabase.auth.signUp({ phone, password, options });
  }, []);
  
  const resendSignupCode = useCallback(async (email) => {
    return await supabase.auth.resend({ type: 'signup', email });
  }, []);

  const signIn = useCallback(async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password });
  }, []);
  
  const signInWithPhoneAndPassword = useCallback(async (phone, password) => {
    return await supabase.auth.signInWithPassword({ phone, password });
  }, []);

  const signInWithPhone = useCallback(async (phone) => {
    return await supabase.auth.signInWithOtp({ phone });
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const verifyOtp = useCallback(async ({ email, phone, token, type }) => {
    const payload = {
        token,
        type: type === 'email' ? 'signup' : type
    };
    if (email) payload.email = email;
    if (phone) payload.phone = phone;

    return await supabase.auth.verifyOtp(payload);
  }, []);

  const resetPasswordForEmail = useCallback(async (email) => {
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : '';
    if (import.meta.env.DEV) {
      console.log('[Auth] Sending password recovery for', email?.replace?.(/.(?=.@)/g, '*'), 'redirectTo', redirectTo);
    }
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (import.meta.env.DEV && (error || data)) {
      console.log('[Auth] resetPasswordForEmail result', error ? { error: error.message } : { ok: true });
    }
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Password reset failed',
        description: error.message,
      });
    }
    return { data, error };
  }, [toast]);

  const reauthenticate = useCallback(async () => {
    const { data, error } = await supabase.auth.reauthenticate();
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Verification code could not be sent',
        description: error.message,
      });
    }
    return { data, error };
  }, [toast]);

  const updateUserPassword = useCallback(async (newPassword, nonce = null) => {
    const attrs = { password: newPassword };
    if (nonce) attrs.nonce = nonce;
    const { data, error } = await supabase.auth.updateUser(attrs);
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Password update failed',
        description: error.message,
      });
      return { data, error };
    }
    // Sync session after password change so it persists (Supabase client bug workaround)
    await supabase.auth.refreshSession();
    return { data, error };
  }, [toast]);

  const value = useMemo(() => ({
    user,
    session,
    profile,
    loading,
    justSignedUp,
    setProfile,
    signUp,
    signUpWithPhone,
    resendSignupCode,
    signIn,
    signInWithPhoneAndPassword,
    signInWithPhone,
    signOut,
    verifyOtp,
    isConfirmed,
    resetPasswordForEmail,
    reauthenticate,
    updateUserPassword,
  }), [user, session, profile, loading, justSignedUp, setProfile, signUp, signUpWithPhone, resendSignupCode, signIn, signInWithPhoneAndPassword, signInWithPhone, signOut, verifyOtp, isConfirmed, resetPasswordForEmail, reauthenticate, updateUserPassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};