import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true); // global loading: only for bootstrap/auth state

  const handleSession = useCallback((newSession) => {
    setSession(newSession);
    setUser(newSession?.user ?? null);
    setLoading(false);
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error && error.message !== 'Session from session_id claim in JWT does not exist') {
      toast({
        variant: 'destructive',
        title: 'Sign out Failed',
        description: error.message || 'Something went wrong',
      });
    }
    setUser(null);
    setSession(null);
    return { error };
  }, [toast]);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error && (error.message?.includes('Invalid Refresh Token') || error.message?.includes('token not found') || error?.code === 401)) {
          await signOut();
        } else {
          handleSession(session ?? null);
        }
      } catch (e) {
        console.error('Error in getSession:', e);
        await signOut();
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      handleSession(session ?? null);
      if (session?.user) {
        try { localStorage.removeItem('pendingEmail'); } catch {}
      }
    });

    return () => subscription.unsubscribe();
  }, [handleSession, signOut]);

  // Do NOT set global loading here — let pages use local loading
  const signUp = useCallback(async (email, password, options) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        ...options,
        // ensure link clicks land on /verify
        emailRedirectTo: `${window.location.origin}/verify?email=${encodeURIComponent(email)}`,
      },
    });

    if (error) {
      if (!error.message?.toLowerCase().includes('weak password')) {
        toast({
          variant: 'destructive',
          title: 'Sign up Failed',
          description: error.message || 'Something went wrong',
        });
      }
    } else {
      try { localStorage.setItem('pendingEmail', email); } catch {}
    }
    return { data, error };
  }, [toast]);

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Sign in Failed',
        description: error.message || 'Something went wrong',
      });
    }
    return { error };
  }, [toast]);

  const verifyOtp = useCallback(async (email, token) => {
    return await supabase.auth.verifyOtp({ email, token, type: 'signup' });
  }, []);

  const resendSignupCode = useCallback(async (email) => {
    // If your supabase-js supports options.emailRedirectTo here, keep it; else remove options.
    return await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/verify?email=${encodeURIComponent(email)}` },
    });
  }, []);

  const resetPasswordForEmail = useCallback(async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Password Reset Failed',
        description: error.message,
      });
    }
    return { data, error };
  }, [toast]);

  const updateUserPassword = useCallback(async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Password Update Failed',
        description: error.message,
      });
    }
    return { data, error };
  }, [toast]);

  const value = useMemo(() => ({
    user,
    session,
    loading,                 // global auth bootstrap flag
    signUp,
    signIn,
    signOut,
    verifyOtp,
    resendSignupCode,
    resetPasswordForEmail,
    updateUserPassword,
  }), [user, session, loading, signUp, signIn, signOut, verifyOtp, resendSignupCode, resetPasswordForEmail, updateUserPassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};