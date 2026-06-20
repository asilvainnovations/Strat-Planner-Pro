import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  organization: string | null;
  job_title: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  notification_preferences: Record<string, boolean> | null;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false,
    isAdmin: false,
  });

  const checkAdmin = useCallback(async (email: string): Promise<boolean> => {
    try {
      const { data } = await supabase
        .from('admins')
        .select('email')
        .eq('email', email.toLowerCase())
        .maybeSingle();
      return !!data;
    } catch {
      return false;
    }
  }, []);

  const fetchProfile = useCallback(async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!data) {
        const { data: newProfile } = await supabase
          .from('user_profiles')
          .insert({
            id: userId,
            email,
            full_name: null,
            organization: null,
            job_title: null,
            phone: null,
            avatar_url: null,
            notification_preferences: {
              welcome_email: true,
              kpi_alerts: true,
              weekly_digest: true,
              stale_plan_reminders: true,
            },
          })
          .select()
          .maybeSingle();
        return newProfile as UserProfile;
      }

      if (error) throw error;
      return data as UserProfile;
    } catch (error) {
      console.error('Error fetching/creating profile:', error);
      return null;
    }
  }, []);

  const logVisit = useCallback(async (userId: string | null, email: string | null) => {
    try {
      const ua = navigator.userAgent;
      let device = 'Desktop';
      if (/mobile/i.test(ua)) device = 'Mobile';
      else if (/tablet|ipad/i.test(ua)) device = 'Tablet';
      await supabase.from('visit_logs').insert({
        user_id: userId,
        email,
        page: window.location.pathname,
        device,
        location: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown',
      });
    } catch {
      // best-effort logging
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await fetchProfile(session.user.id, session.user.email!);
          const isAdmin = await checkAdmin(session.user.email!);
          setAuthState({
            user: session.user,
            session,
            profile,
            isLoading: false,
            isAuthenticated: true,
            isAdmin,
          });
          logVisit(session.user.id, session.user.email!);
        } else {
          setAuthState({
            user: null, session: null, profile: null,
            isLoading: false, isAuthenticated: false, isAdmin: false,
          });
          logVisit(null, null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id, session.user.email!);
          const isAdmin = await checkAdmin(session.user.email!);
          setAuthState({
            user: session.user, session, profile,
            isLoading: false, isAuthenticated: true, isAdmin,
          });
        } else {
          setAuthState({
            user: null, session: null, profile: null,
            isLoading: false, isAuthenticated: false, isAdmin: false,
          });
        }
      }
    );

    return () => { subscription.unsubscribe(); };
  }, [fetchProfile, checkAdmin, logVisit]);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  /** Magic-link / OTP sign-in via email */
  const signInWithMagicLink = async (email: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!authState.user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', authState.user.id)
      .select()
      .maybeSingle();
    if (error) throw error;
    setAuthState((prev) => ({ ...prev, profile: data as UserProfile }));
    return data;
  };

  const refreshProfile = async () => {
    if (!authState.user) return;
    const profile = await fetchProfile(authState.user.id, authState.user.email!);
    setAuthState((prev) => ({ ...prev, profile }));
  };

  return {
    ...authState,
    signUp, signIn, signInWithMagicLink, signOut,
    resetPassword, updatePassword, updateProfile, refreshProfile,
  };
};
