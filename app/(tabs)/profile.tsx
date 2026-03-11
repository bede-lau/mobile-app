import { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import {
  Camera,
  ChevronRight,
  User as UserIcon,
  Bell,
  Shield,
  Globe,
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useUserStore } from '@/store/userStore';
import { useAvatarStore } from '@/store/avatarStore';
import { colors, typography, spacing, radius, shadows, fontFamily } from '@/constants/theme';

// Style DNA data — derived from user style_preferences
const STYLE_DNA_LABELS = ['Minimal', 'Classic', 'Modern', 'Street', 'Elegant', 'Experimental'];

function getStyleDNA(preferences: string[]): { label: string; value: number }[] {
  const mapping: Record<string, string[]> = {
    Minimal: ['minimalist'],
    Classic: ['formal', 'preppy'],
    Modern: ['streetwear', 'sporty'],
    Street: ['streetwear', 'bohemian'],
    Elegant: ['elegant', 'formal'],
    Experimental: ['vintage', 'bohemian'],
  };

  return STYLE_DNA_LABELS.map((label) => {
    const keys = mapping[label] || [];
    const matched = keys.filter((k) => preferences.includes(k)).length;
    const value = keys.length > 0 ? Math.round((matched / keys.length) * 100) : 0;
    return { label, value: value > 0 ? value : Math.floor(Math.random() * 30 + 10) };
  });
}

function getStyleLabel(preferences: string[]): string {
  if (!preferences || preferences.length === 0) return 'Undiscovered';
  const labels: string[] = [];
  if (preferences.includes('elegant')) labels.push('Elegant');
  if (preferences.includes('minimalist')) labels.push('Minimalist');
  if (preferences.includes('formal')) labels.push('Classic');
  if (preferences.includes('streetwear')) labels.push('Modern');
  if (preferences.includes('vintage')) labels.push('Vintage');
  if (labels.length === 0) labels.push(preferences[0].charAt(0).toUpperCase() + preferences[0].slice(1));
  return labels.slice(0, 2).join(' ');
}

function AnimatedBar({ value, delay }: { value: number; delay: number }) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(delay, withTiming(value, { duration: 800 }));
  }, [value, delay]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={styles.barTrack}>
      <Animated.View style={[styles.barFill, barStyle]} />
    </View>
  );
}

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signOut } = useAuth();
  const { user } = useUserStore();
  const { measurements } = useAvatarStore();

  const stylePrefs = user?.style_preferences || [];
  const styleDNA = getStyleDNA(stylePrefs);
  const styleLabel = getStyleLabel(stylePrefs);

  const handleLogout = useCallback(async () => {
    Alert.alert(t('auth.logout'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('auth.logout'),
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }, [signOut, router, t]);

  const handleRescan = useCallback(() => {
    router.push('/(tabs)/scanner');
  }, [router]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>
                {user?.full_name?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.yourProfile}>Your Profile</Text>
            <Text style={styles.userName}>{user?.full_name || '—'}</Text>
            <View style={styles.styleLabelChip}>
              <Text style={styles.styleLabelText}>{styleLabel}</Text>
            </View>
          </View>
        </View>

        {/* Styled DNA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What style are you?</Text>
          <View style={styles.dnaContainer}>
            {styleDNA.map((item, index) => (
              <View key={item.label} style={styles.dnaRow}>
                <Text style={styles.dnaLabel}>{item.label}</Text>
                <View style={styles.dnaBarWrapper}>
                  <AnimatedBar value={item.value} delay={index * 150} />
                </View>
                <Text style={styles.dnaValue}>{item.value}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Measurements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Measurements</Text>
          <View style={styles.measureGrid}>
            <View style={styles.measureCard}>
              <Text style={styles.measureValue}>
                {user?.height_cm ? `${user.height_cm}` : '—'}
              </Text>
              <Text style={styles.measureUnit}>cm</Text>
              <Text style={styles.measureLabel}>Height</Text>
            </View>
            <View style={styles.measureCard}>
              <Text style={styles.measureValue}>
                {measurements?.waist_cm ? 'Regular' : '—'}
              </Text>
              <Text style={styles.measureLabel}>Fit</Text>
            </View>
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.prefCard}>
            <View style={styles.prefRow}>
              <Text style={styles.prefLabel}>Budget Range</Text>
              <Text style={styles.prefValue}>RM 150 – 700</Text>
            </View>
            <View style={styles.prefDivider} />
            <View style={styles.prefRow}>
              <Text style={styles.prefLabel}>Color Palette</Text>
              <View style={styles.colorSwatches}>
                {['#1A1A1A', '#D4A373', '#5A8A6A', '#FAF8F4', '#B82D38'].map((c) => (
                  <View key={c} style={[styles.swatch, { backgroundColor: c }]} />
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Rescan — prominent gold CTA */}
        <Pressable style={styles.rescanCard} onPress={handleRescan}>
          <Camera size={24} color={colors.textInverse} />
          <View style={styles.rescanText}>
            <Text style={styles.rescanTitle}>Rescan Body</Text>
            <Text style={styles.rescanSubtitle}>Update your measurements</Text>
          </View>
          <ChevronRight size={20} color={colors.textInverse} />
        </Pressable>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsCard}>
            {[
              { icon: UserIcon, label: t('profile.account') || 'Account' },
              { icon: Bell, label: 'Notifications' },
              { icon: Shield, label: 'Privacy' },
              { icon: Globe, label: t('profile.language') || 'Language', value: user?.preferred_language?.toUpperCase() },
            ].map((item, index) => (
              <Pressable key={item.label} style={[styles.settingRow, index > 0 && styles.settingBorder]}>
                <item.icon size={18} color={colors.textSecondary} />
                <Text style={styles.settingLabel}>{item.label}</Text>
                {item.value && <Text style={styles.settingValue}>{item.value}</Text>}
                <ChevronRight size={16} color={colors.textTertiary} />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Logout */}
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>{t('auth.logout')}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxl,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  yourProfile: {
    ...typography.displaySmall,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  userName: {
    fontFamily: fontFamily.sansMedium,
    fontWeight: '500',
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  avatarPlaceholder: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    ...typography.headingMedium,
    color: colors.textInverse,
  },
  styleLabelChip: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.xs,
    alignSelf: 'flex-start',
  },
  styleLabelText: {
    fontFamily: fontFamily.sansSemiBold,
    fontWeight: '600',
    fontSize: 11,
    color: colors.textInverse,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Sections
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fontFamily.sansSemiBold,
    fontWeight: '600',
    fontSize: 14,
    color: colors.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },

  // Styled DNA
  dnaContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    ...shadows.sm,
  },
  dnaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dnaLabel: {
    fontFamily: fontFamily.sansMedium,
    fontWeight: '500',
    fontSize: 13,
    color: colors.textPrimary,
    width: 90,
  },
  dnaBarWrapper: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  barTrack: {
    height: 6,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  dnaValue: {
    fontFamily: fontFamily.sansMedium,
    fontWeight: '500',
    fontSize: 12,
    color: colors.textSecondary,
    width: 36,
    textAlign: 'right',
  },

  // Measurements
  measureGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  measureCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  measureValue: {
    fontFamily: fontFamily.serifBold,
    fontWeight: '700',
    fontSize: 22,
    color: colors.primary,
  },
  measureUnit: {
    fontFamily: fontFamily.sansRegular,
    fontWeight: '400',
    fontSize: 12,
    color: colors.textSecondary,
  },
  measureLabel: {
    fontFamily: fontFamily.sansMedium,
    fontWeight: '500',
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Preferences
  prefCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    ...shadows.sm,
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  prefDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  prefLabel: {
    fontFamily: fontFamily.sansMedium,
    fontWeight: '500',
    fontSize: 14,
    color: colors.textPrimary,
  },
  prefValue: {
    fontFamily: fontFamily.sansRegular,
    fontWeight: '400',
    fontSize: 14,
    color: colors.textSecondary,
  },
  colorSwatches: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  swatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Rescan
  rescanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.md,
  },
  rescanText: {
    flex: 1,
  },
  rescanTitle: {
    fontFamily: fontFamily.sansSemiBold,
    fontWeight: '600',
    fontSize: 16,
    color: colors.textInverse,
  },
  rescanSubtitle: {
    fontFamily: fontFamily.sansRegular,
    fontWeight: '400',
    fontSize: 13,
    color: 'rgba(250,248,244,0.7)',
    marginTop: 2,
  },

  // Settings
  settingsCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    ...shadows.sm,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  settingBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  settingLabel: {
    flex: 1,
    fontFamily: fontFamily.sansRegular,
    fontWeight: '400',
    fontSize: 15,
    color: colors.textPrimary,
  },
  settingValue: {
    fontFamily: fontFamily.sansRegular,
    fontWeight: '400',
    fontSize: 13,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },

  // Logout
  logoutButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.md,
  },
  logoutText: {
    fontFamily: fontFamily.sansSemiBold,
    fontWeight: '600',
    fontSize: 15,
    color: colors.error,
  },
});
