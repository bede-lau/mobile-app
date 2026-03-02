import { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { colors, typography, spacing } from '@/constants/theme';

export default function SignupScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signUp, signInWithGoogle } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = useCallback(async () => {
    if (!fullName || !email || !password || !confirmPassword) return;
    if (password !== confirmPassword) {
      Alert.alert(t('common.error'), 'Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, fullName);
      router.replace('/(auth)/onboarding');
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message);
    } finally {
      setLoading(false);
    }
  }, [fullName, email, password, confirmPassword, signUp, router, t]);

  const handleGoogleSignup = useCallback(async () => {
    try {
      await signInWithGoogle();
      // Navigation is handled by AuthProvider after session is established
    } catch (error: any) {
      if (error?.message && !error.message.includes('cancel')) {
        Alert.alert(t('common.error'), error.message);
      }
    }
  }, [signInWithGoogle, t]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.brand}>OLVON</Text>
          <Text style={styles.title}>{t('auth.createAccount')}</Text>
        </View>

        <View style={styles.form}>
          <Input
            label={t('auth.fullName')}
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            autoComplete="name"
          />
          <Input
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Input
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
          />
          <Input
            label={t('auth.confirmPassword')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoComplete="new-password"
          />

          <Text style={styles.terms}>{t('auth.termsAgree')}</Text>

          <Button
            title={t('auth.signup')}
            onPress={handleSignup}
            loading={loading}
            fullWidth
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('auth.orContinueWith')}</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title={t('auth.google')}
            onPress={handleGoogleSignup}
            variant="secondary"
            fullWidth
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.haveAccount')}</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.footerLink}>{t('auth.login')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    marginBottom: spacing.xxl,
  },
  brand: {
    ...typography.smallCaps,
    fontSize: 13,
    letterSpacing: 4,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.displayMedium,
    color: colors.textPrimary,
  },
  form: {
    gap: spacing.xs,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.caption,
    color: colors.textTertiary,
    marginHorizontal: spacing.md,
  },
  terms: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xxl,
    gap: spacing.xs,
  },
  footerText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  footerLink: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: '600',
  },
});
