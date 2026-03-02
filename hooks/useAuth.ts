import { useCallback } from 'react';
import { Platform } from 'react-native';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';

// Required for proper OAuth redirect handling on native
WebBrowser.maybeCompleteAuthSession();

const REFRESH_TOKEN_KEY = 'olvon-refresh-token';

// Helper to safely use SecureStore (not available on web)
const secureStorage = {
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  deleteItem: async (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

/**
 * useAuth Hook
 *
 * Provides authentication actions only. Session state management and profile
 * fetching are handled by AuthProvider (single source of truth).
 *
 * This hook does NOT:
 * - Subscribe to onAuthStateChange (AuthProvider does this)
 * - Fetch or create user profiles (database trigger + AuthProvider handle this)
 * - Track session state locally (AuthProvider handles routing based on user state)
 */
export function useAuth() {
  const { user, session, clearUser, setLoading, isLoading } = useUserStore();

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // AuthProvider handles profile fetch and setLoading(false) via onAuthStateChange
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, [setLoading]);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;
      // Profile is created by database trigger (handle_new_user)
      // AuthProvider handles profile fetch and setLoading(false) via onAuthStateChange
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, [setLoading]);

  const signInWithGoogle = useCallback(async () => {
    // Generate the redirect URL based on platform
    const redirectUrl = Platform.OS === 'web'
      ? window.location.origin
      : makeRedirectUri({ scheme: 'olvon', path: 'auth/callback' });

    console.log('[useAuth] OAuth redirect URL:', redirectUrl);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: Platform.OS !== 'web',
      },
    });
    if (error) throw error;

    // On native, use WebBrowser for proper OAuth flow with redirect handling
    if (Platform.OS !== 'web' && data?.url) {
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl,
        { showInRecents: true }
      );

      // Handle the result from the auth session
      if (result.type === 'success' && result.url) {
        // Parse tokens from the callback URL
        const url = result.url;
        const hashIndex = url.indexOf('#');
        if (hashIndex !== -1) {
          const hashParams = new URLSearchParams(url.substring(hashIndex + 1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken && refreshToken) {
            console.log('[useAuth] Setting session from OAuth tokens');
            const { data, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (sessionError) throw sessionError;
            console.log('[useAuth] Session set successfully, user:', data.user?.id);
            // Store refresh token securely
            await secureStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
            // AuthProvider handles profile fetch via onAuthStateChange
            // The SIGNED_IN event should fire automatically
          }
        }
      } else if (result.type === 'cancel') {
        // User cancelled the auth flow - this is not an error
        return;
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    console.log('[useAuth] Signing out');
    await supabase.auth.signOut();
    clearUser();
    await secureStorage.deleteItem(REFRESH_TOKEN_KEY);
  }, [clearUser]);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }, []);

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!session || !!user,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
  };
}
