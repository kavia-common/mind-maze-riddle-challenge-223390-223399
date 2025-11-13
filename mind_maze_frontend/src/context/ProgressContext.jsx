import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getSupabaseClient } from '../lib/supabaseClient';
import { getOrCreateDeviceId, loadProgress as svcLoad, upsertProgress as svcUpsert } from '../lib/progressService';

/**
 PUBLIC_INTERFACE
 useProgress: React hook to access gameplay progress and persistence helpers.
 Exposes:
  - progress: { score, level, lives }
  - setProgress(partial): merge and persist
  - resetProgress()
  - loading: boolean while initializing
  - error: last error (if any)
  - identifiers: { user_id, anon_id }
  - save(): force save current progress
*/

const ProgressContext = createContext(null);

function useAuthUserId() {
  const client = useMemo(() => getSupabaseClient(), []);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const { data, error } = await client.auth.getUser();
        if (error) {
          // eslint-disable-next-line no-console
          console.warn('[Progress] auth.getUser error', { code: error.code, message: error.message });
        }
        if (mounted) setUserId(data?.user?.id ?? null);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[Progress] auth.getUser unexpected error', e?.message || e);
        if (mounted) setUserId(null);
      }
    }
    init();

    const { data: sub } = client.auth.onAuthStateChange((_evt, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, [client]);

  return userId;
}

export function ProgressProvider({ children }) {
  const user_id = useAuthUserId();
  const anon_id = useMemo(() => (user_id ? null : getOrCreateDeviceId()), [user_id]);

  const [progress, setProgressState] = useState({ score: 0, level: 1, lives: 3 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial progress when identifiers resolved
  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data, error: err } = await svcLoad({ user_id: user_id || undefined, anon_id: anon_id || undefined });
        if (err) throw err;
        if (data && active) {
          setProgressState({
            score: Number(data.score) || 0,
            level: Number(data.level) || 1,
            lives: Number(data.lives) || 3,
          });
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[Progress] load failure', e?.message || e);
        if (active) setError(e);
      } finally {
        if (active) setLoading(false);
      }
    }

    // Only load after auth state known (user_id may be null meaning anon)
    // We wait until user_id computed (can be null), then compute anon_id
    if (user_id !== undefined) {
      load();
    }
    return () => {
      active = false;
    };
  }, [user_id, anon_id]);

  const persist = useCallback(
    async (next) => {
      try {
        const payload = {
          user_id: user_id || undefined,
          anon_id: user_id ? undefined : anon_id,
          score: next.score,
          level: next.level,
          lives: next.lives,
        };
        const { error: err } = await svcUpsert(payload);
        if (err) throw err;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[Progress] persist error', e?.message || e);
        setError(e);
      }
    },
    [user_id, anon_id]
  );

  // PUBLIC_INTERFACE
  const setProgress = useCallback(
    (partial) => {
      setProgressState((prev) => {
        const next = { ...prev, ...(typeof partial === 'function' ? partial(prev) : partial) };
        // fire and forget persist
        persist(next);
        return next;
      });
    },
    [persist]
  );

  // PUBLIC_INTERFACE
  const resetProgress = useCallback(() => {
    const init = { score: 0, level: 1, lives: 3 };
    setProgressState(init);
    persist(init);
  }, [persist]);

  // PUBLIC_INTERFACE
  const save = useCallback(() => persist(progress), [persist, progress]);

  const ctxValue = useMemo(
    () => ({
      progress,
      setProgress,
      resetProgress,
      loading,
      error,
      identifiers: { user_id, anon_id },
      save,
    }),
    [progress, setProgress, resetProgress, loading, error, user_id, anon_id, save]
  );

  return <ProgressContext.Provider value={ctxValue}>{children}</ProgressContext.Provider>;
}

// PUBLIC_INTERFACE
export function useProgress() {
  /** Accessor hook for ProgressContext */
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return ctx;
}

export default ProgressProvider;
