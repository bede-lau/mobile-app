import { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { UserPlus } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { colors, typography, spacing } from '@/constants/theme';

export default function SignupScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signUp, signIn, signInWithGoogle } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Try to sign in with the given credentials.
   * Returns true if successful, false otherwise.
   * Shows appropriate alerts on failure.
   */
  const attemptSignIn = useCallback(async (emailAddr: string, pwd: string): Promise<boolean> => {
    try {
      await signIn(emailAddr, pwd);
      // AuthProvider will redirect based on onboarding_completed status
      return true;
    } catch (signInError: any) {
      const signInMsg = (signInError.message || '').toLowerCase();
      if (signInMsg.includes('not confirmed') || signInMsg.includes('email_not_confirmed')) {
        Alert.alert(
          'Email Not Confirmed',
          'Your account exists but your email has not been confirmed yet. Please check your inbox (including spam) for the confirmation link from Supabase, then try logging in.',
        );
      } else if (signInMsg.includes('invalid') || signInMsg.includes('credentials')) {
        Alert.alert(
          t('common.error'),
          'Incorrect password for this email. Please try again or use a different email.',
        );
      } else {
        Alert.alert(t('common.error'), signInError.message);
      }
      return false;
    }
  }, [signIn, t]);

  const handleSignup = useCallback(async () => {
    if (!fullName || !email || !password || !confirmPassword) return;
    if (password !== confirmPassword) {
      Alert.alert(t('common.error'), 'Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const result = await signUp(email, password, fullName);

      switch (result.status) {
        case 'session_created':
          // Fresh signup succeeded with a session — go to onboarding
          router.replace('/(auth)/onboarding');
          break;

        case 'user_already_exists':
          // Email already in auth.users — try signing in with the same password
          console.log('[Signup] User already exists, attempting sign in...');
          await attemptSignIn(email, password);
          break;

        case 'email_confirmation_needed':
          // Signup succeeded but email confirmation is required
          // Try signing in anyway (in case auto-confirm is on or was previously confirmed)
          console.log('[Signup] Email confirmation needed, trying sign in...');
          const signedIn = await attemptSignIn(email, password);
          if (!signedIn) {
            Alert.alert(
              'Check Your Email',
              'We\'ve sent a confirmation link to your email. Please click the link to activate your account, then come back and log in.',
            );
          }
          break;
      }
    } catch (error: any) {
      const msg = (error.message || '').toLowerCase();

      if (msg.includes('rate limit') || msg.includes('email rate limit')) {
        // Rate limited — try to sign in since the account likely exists
        console.log('[Signup] Rate limited, attempting sign in...');
        await attemptSignIn(email, password);
      } else {
        Alert.alert(t('common.error'), error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [fullName, email, password, confirmPassword, signUp, attemptSignIn, router, t]);

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
          <View style={styles.brandRow}>
            <Image
              source={require('@/assets/images/olvon-logo.png')}
              style={styles.brandLogo}
              resizeMode="contain"
            />
            <Text style={styles.brand}>OLVON</Text>
          </View>
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
            leftIcon={<UserPlus size={18} color={colors.textInverse} />}
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
            leftIcon={
              <Image
                source={require('@/assets/images/google-logo.png')}
                style={styles.googleIcon}
                resizeMode="contain"
              />
            }
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
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  brandLogo: {
    width: 24,
    height: 24,
  },
  brand: {
    ...typography.smallCaps,
    fontSize: 13,
    letterSpacing: 4,
    color: colors.textSecondary,
  },
  googleIcon: {
    width: 18,
    height: 18,
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
