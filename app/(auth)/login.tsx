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
import { Mail } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { colors, typography, spacing } from '@/constants/theme';

export default function LoginScreen() {
  console.log('[LoginScreen] Rendering');
  const { t } = useTranslation();
  const router = useRouter();
  const { signIn, signInWithGoogle, resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      await signIn(email, password);
      // Navigation handled by AuthProvider via onAuthStateChange
    } catch (error: any) {
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('not confirmed') || msg.includes('email_not_confirmed')) {
        Alert.alert(
          'Email Not Confirmed',
          'Your email has not been confirmed yet. Please check your inbox (including spam) for the confirmation link from Supabase.',
        );
      } else if (msg.includes('invalid') || msg.includes('credentials')) {
        Alert.alert(t('common.error'), 'Invalid email or password. Please try again.');
      } else {
        Alert.alert(t('common.error'), error.message);
      }
      setLoading(false);
    }
  }, [email, password, signIn, t]);

  const handleForgotPassword = useCallback(async () => {
    if (!email) {
      Alert.alert(t('common.error'), 'Please enter your email address first.');
      return;
    }
    try {
      await resetPassword(email);
      Alert.alert('Password Reset', 'Check your email for the password reset link.');
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message);
    }
  }, [email, resetPassword, t]);

  const handleGoogleLogin = useCallback(async () => {
    try {
      await signInWithGoogle();
      // Navigation is handled by AuthProvider after session is established
    } catch (error: any) {
      // Only show error if it's not a user cancellation
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
          <Text style={styles.title}>{t('auth.welcome')}</Text>
        </View>

        <View style={styles.form}>
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
            autoComplete="password"
          />

          <Pressable onPress={handleForgotPassword} style={styles.forgotButton}>
            <Text style={styles.forgotText}>{t('auth.forgotPassword')}</Text>
          </Pressable>

          <Button
            title={t('auth.login')}
            onPress={handleLogin}
            loading={loading}
            fullWidth
            leftIcon={<Mail size={18} color={colors.textInverse} />}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('auth.orContinueWith')}</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title={t('auth.google')}
            onPress={handleGoogleLogin}
            variant="outline"
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
          <Text style={styles.footerText}>{t('auth.noAccount')}</Text>
          <Pressable onPress={() => router.push('/(auth)/signup')}>
            <Text style={styles.footerLink}>{t('auth.signup')}</Text>
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
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: spacing.md,
  },
  forgotText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
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
