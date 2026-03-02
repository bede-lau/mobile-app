import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import { useAuth } from '@/hooks/useAuth';
import { colors, typography } from '@/constants/theme';

export default function Index() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();
  const { user } = useUserStore();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    } else if (user && !user.onboarding_completed) {
      router.replace('/(auth)/onboarding');
    } else {
      router.replace('/(tabs)/feed');
    }
  }, [isLoading, isAuthenticated, user, router]);

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
