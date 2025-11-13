import { useEffect, useMemo, useState, useCallback } from 'react';
import supabase, { getSupabaseClient } from '../lib/supabaseClient';

/**
 * React hook providing basic Supabase auth helpers and user session state.
 * Exposes:
 * - user: the current user object (or null)
 * - loading: boolean while determining initial session
 * - signInWithEmail(email, password)
 * - signUpWithEmail(email, password, options?) - options.emailRedirectTo should be provided by caller as needed
 * - signOut()
 */

// PUBLIC_INTERFACE
export function useSupabaseAuth() {
  /** Subscribe to Supabase auth state changes and expose helpers. */
  const client = useMemo(() => getSupabaseClient(), []);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session and subscribe to changes
  useEffect(() => {
    let active = true;

    async function init() {
      try {
        const {
          data: { session },
          error,
        } = await client.auth.getSession();
        if (error) {
          // eslint-disable-next-line no-console
          console.error('[Supabase] getSession error:', error);
        }
        if (active) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[Supabase] init session error:', e);
        if (active) setLoading(false);
      }
    }
    init();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      active = false;
      subscription?.unsubscribe?.();
    };
  }, [client]);

  const signInWithEmail = useCallback(async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }, []);

  const signUpWithEmail = useCallback(async (email, password, options = {}) => {
    try {
      // Caller can pass emailRedirectTo; if not provided, we avoid guessing SITE_URL
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (err) {
      return { error: err };
    }
  }, []);

  return { user, loading, signInWithEmail, signUpWithEmail, signOut };
}

export default useSupabaseAuth;
