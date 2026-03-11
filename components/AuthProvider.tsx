import { useEffect, useRef, useCallback, ReactNode } from 'react';
import { Platform } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';
import type { Session } from '@supabase/supabase-js';
import type { User } from '@/types';

interface AuthProviderProps {
  children: ReactNode;
}

// Timeout for profile fetch (3 seconds)
const PROFILE_FETCH_TIMEOUT_MS = 3000;

/**
 * AuthProvider - Single Source of Truth for Auth State
 */
export default function AuthProvider({ children }: AuthProviderProps) {
  console.log('[AuthProvider] Component rendering');

  const router = useRouter();
  const segments = useSegments();
  const { user, setUser, clearUser, setLoading, setSession, session } = useUserStore();

  const abortControllerRef = useRef<AbortController | null>(null);
  const profileFetchInProgressRef = useRef(false);

  /**
   * Fetch with timeout wrapper
   */
  const fetchWithTimeout = useCallback(async <T,>(
    fetchFn: () => Promise<T>,
    timeoutMs: number,
    label: string
  ): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`${label} timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      fetchFn()
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((err) => {
          clearTimeout(timeoutId);
          reject(err);
        });
    });
  }, []);

  /**
   * Create fallback user from session data
   */
  const createFallbackUser = useCallback((authUser: any): User => {
    return {
      id: authUser.id,
      email: authUser.email || '',
      full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || '',
      avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null,
      height_cm: null,
      onboarding_completed: false,
      preferred_language: 'en',
      style_preferences: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }, []);

  /**
   * Fetch user profile
   */
  const fetchUserProfile = useCallback(async (userId: string): Promise<User | null> => {
    console.log('[AuthProvider] fetchUserProfile called for:', userId);

    try {
      const result = await fetchWithTimeout(
        async () => {
          const response = await supabase.from('users').select('*').eq('id', userId).single();
          return response;
        },
        PROFILE_FETCH_TIMEOUT_MS,
        'Profile fetch'
      );

      const { data, error } = result as { data: any; error: any };

      console.log('[AuthProvider] Profile fetch result:', {
        hasData: !!data,
        errorCode: error?.code,
        errorMessage: error?.message,
      });

      if (data && !error) {
        return data as User;
      }

      return null;
    } catch (err: any) {
      console.error('[AuthProvider] Profile fetch error:', err.message);
      return null;
    }
  }, [fetchWithTimeout]);

  // Handle OAuth callback tokens from URL hash (web only)
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          }).then(({ error }) => {
            if (!error) {
              window.history.replaceState(null, '', window.location.pathname);
            }
          });
        }
      }
    }
  }, []);

  // Auth state listener - NO dependencies to ensure it runs once on mount
  useEffect(() => {
    console.log('[AuthProvider] Setting up auth listener (useEffect running)');

    let mounted = true;

    const handleAuthChange = async (event: string, newSession: Session | null) => {
      console.log('[AuthProvider] handleAuthChange:', event, newSession ? 'has session' : 'no session');

      if (!mounted) {
        console.log('[AuthProvider] Component unmounted, skipping');
        return;
      }

      // Update session state
      setSession(newSession);

      if (!newSession?.user) {
        console.log('[AuthProvider] No session user, clearing');
        clearUser();
        setLoading(false);
        return;
      }

      // Prevent concurrent fetches
      if (profileFetchInProgressRef.current) {
        console.log('[AuthProvider] Profile fetch already in progress, skipping');
        return;
      }

      profileFetchInProgressRef.current = true;

      try {
        // Small delay for session propagation
        await new Promise(resolve => setTimeout(resolve, 300));

        const profile = await fetchUserProfile(newSession.user.id);

        if (!mounted) return;

        if (profile) {
          console.log('[AuthProvider] Setting user from profile');
          setUser(profile);
        } else {
          console.log('[AuthProvider] Using fallback user from session');
          setUser(createFallbackUser(newSession.user));
        }
      } finally {
        profileFetchInProgressRef.current = false;
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[AuthProvider] onAuthStateChange fired:', event);
        handleAuthChange(event, session);
      }
    );

    // Also check current session immediately
    console.log('[AuthProvider] Checking initial session...');
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('[AuthProvider] Initial session:', currentSession ? 'exists' : 'null');
      if (currentSession && mounted) {
        handleAuthChange('INITIAL_CHECK', currentSession);
      } else if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      console.log('[AuthProvider] Cleaning up auth listener');
      mounted = false;
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - run only on mount

  // Handle protected routes
  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inAuthCallback = segments[0] === 'auth';
    const inOnboarding = segments[1] === 'onboarding';
    const isLoggedIn = !!session || !!user;

    console.log('[AuthProvider] Route check:', {
      user: user?.id ? 'exists' : 'null',
      session: session ? 'exists' : 'null',
      isLoggedIn,
      segments: segments.join('/'),
    });

    // If we have session but no user yet, try to load the user
    if (session && !user && !profileFetchInProgressRef.current) {
      console.log('[AuthProvider] Have session but no user, triggering profile fetch');
      profileFetchInProgressRef.current = true;

      fetchUserProfile(session.user.id).then((profile) => {
        profileFetchInProgressRef.current = false;
        if (profile) {
          console.log('[AuthProvider] Late profile fetch succeeded');
          setUser(profile);
        } else {
          console.log('[AuthProvider] Late profile fetch failed, using fallback');
          setUser(createFallbackUser(session.user));
        }
        setLoading(false);
      });
      return; // Don't navigate until user is set
    }

    // Redirect logic
    if (isLoggedIn && user && inAuthGroup && !inOnboarding) {
      if (!user.onboarding_completed) {
        console.log('[AuthProvider] Redirecting to onboarding');
        router.replace('/(auth)/onboarding');
      } else {
        console.log('[AuthProvider] Redirecting to feed');
        router.replace('/(tabs)/feed');
      }
    } else if (isLoggedIn && user && inOnboarding && user.onboarding_completed) {
      console.log('[AuthProvider] Onboarding complete, redirecting to feed');
      router.replace('/(tabs)/feed');
    } else if (isLoggedIn && user && inAuthCallback) {
      console.log('[AuthProvider] User on callback, redirecting');
      if (!user.onboarding_completed) {
        router.replace('/(auth)/onboarding');
      } else {
        router.replace('/(tabs)/feed');
      }
    }
  }, [user, session, segments, router, fetchUserProfile, createFallbackUser, setUser, setLoading]);

  return <>{children}</>;
}
