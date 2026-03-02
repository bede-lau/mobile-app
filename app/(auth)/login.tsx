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

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth();

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
      Alert.alert(t('common.error'), error.message);
      setLoading(false);
    }
  }, [email, password, signIn, t]);

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
          <Text style={styles.brand}>OLVON</Text>
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

          <Pressable onPress={() => {}} style={styles.forgotButton}>
            <Text style={styles.forgotText}>{t('auth.forgotPassword')}</Text>
          </Pressable>

          <Button
            title={t('auth.login')}
            onPress={handleLogin}
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
            onPress={handleGoogleLogin}
            variant="secondary"
            fullWidth
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
