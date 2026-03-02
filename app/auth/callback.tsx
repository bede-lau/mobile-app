import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { colors } from '@/constants/theme';

// Dismiss the web browser if it's still open
WebBrowser.maybeCompleteAuthSession();

/**
 * OAuth Callback Screen
 *
 * This is a passive loading screen. All auth handling is done by:
 * 1. signInWithGoogle() in useAuth.ts - extracts tokens from WebBrowser result
 * 2. AuthProvider.tsx - listens to auth state changes, fetches profile, handles routing
 *
 * This screen just shows a loading indicator while AuthProvider does the work.
 * 15-second fallback timeout as safety net if something goes wrong.
 */
export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    console.log('[AuthCallback] Mounted, waiting for AuthProvider to handle routing');

    // Fallback timeout - if still here after 15 seconds, go to login
    const timeoutId = setTimeout(() => {
      console.log('[AuthCallback] Timeout reached, falling back to login');
      router.replace('/(auth)/login');
    }, 15000);

    return () => clearTimeout(timeoutId);
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
