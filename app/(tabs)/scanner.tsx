import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAvatarStore } from '@/store/avatarStore';
import CameraScanner from '@/components/CameraScanner';
import Button from '@/components/ui/Button';
import { colors, typography, spacing } from '@/constants/theme';

export default function ScannerScreen() {
  const { t } = useTranslation();
  const { avatarUrl, scanStatus, resetScan } = useAvatarStore();

  // If avatar exists and not currently scanning, show rescan option
  if (avatarUrl && scanStatus !== 'capturing') {
    return (
      <View style={styles.existingContainer}>
        <Text style={styles.title}>{t('scanner.completed')}</Text>
        <Text style={styles.subtitle}>
          {t('scanner.noAvatarSubtitle')}
        </Text>
        <Button
          title={t('scanner.rescan')}
          onPress={resetScan}
          variant="secondary"
        />
      </View>
    );
  }

  return <CameraScanner />;
}

const styles = StyleSheet.create({
  existingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  title: {
    ...typography.headingLarge,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
