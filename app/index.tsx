import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from '@/store/userStore';
import { useAuth } from '@/hooks/useAuth';
import { colors, typography } from '@/constants/theme';

const SEEN_KEY = '@olvon:seenGetStarted';

export default function Index() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();
  const { user } = useUserStore();
  const [hasSeenGetStarted, setHasSeenGetStarted] = useState<boolean | null>(null);

  // Check AsyncStorage first — this must complete before any routing
  useEffect(() => {
    AsyncStorage.getItem(SEEN_KEY).then((value) => {
      setHasSeenGetStarted(value === 'true');
    });
  }, []);

  // Route only after both auth state AND first-visit check are resolved
  useEffect(() => {
    if (isLoading || hasSeenGetStarted === null) return;

    if (!isAuthenticated) {
      if (!hasSeenGetStarted) {
        router.replace('/get-started');
      } else {
        router.replace('/(auth)/login');
      }
    } else if (user && !user.onboarding_completed) {
      router.replace('/(auth)/onboarding');
    } else if (user) {
      router.replace('/(tabs)/feed');
    }
  }, [isLoading, isAuthenticated, user, router, hasSeenGetStarted]);

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>OLVON</Text>
      <ActivityIndicator color={colors.primary} style={styles.loader} />
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
  brand: {
    ...typography.displayLarge,
    color: colors.primary,
    letterSpacing: -2,
  },
  loader: {
    marginTop: 24,
  },
});
