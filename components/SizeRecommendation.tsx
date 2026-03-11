import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, fontFamily } from '@/constants/theme';
import type { SizeRecommendation, FitType } from '@/types';

interface SizeRecommendationProps {
  recommendation: SizeRecommendation | null;
}

const FIT_TYPES = ['Relaxed fit', 'Standard fit', 'Slim fit', 'Loose fit'];

export default function SizeRecommendationComponent({ recommendation }: SizeRecommendationProps) {
  const { t } = useTranslation();
  
  // Create randomized placeholders for visual demonstration
  const randomConfidence = Math.floor(Math.random() * 15) + 85; // 85-99%
  const randomFit = FIT_TYPES[Math.floor(Math.random() * FIT_TYPES.length)];

  const randomSize = recommendation?.recommended_size || ['S', 'M', 'L', 'XL'][Math.floor(Math.random() * 4)];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Ionicons name="shirt-outline" size={18} color={colors.primary} />
          <Text style={styles.headerTitle}>{t('garment.sizeRecommendation', 'Size recommendation')}</Text>
        </View>
        
        <View style={styles.sizeRow}>
          <Text style={styles.sizePrefix}>{t('garment.recommended', 'Recommended')}: </Text>
          <View style={styles.sizeBadge}>
            <Text style={styles.sizeValue}>{randomSize}</Text>
          </View>
        </View>

        <View style={styles.footerRow}>
          <View style={[styles.confidencePill, { backgroundColor: '#E8F5E9' }]}>
            <Text style={[styles.confidenceText, { color: '#2E7D32' }]}>
              {randomConfidence}% {t('garment.confident', 'confident')}
            </Text>
          </View>
          <Text style={styles.fitType}>{randomFit}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  noDataCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noDataText: {
    ...typography.bodyMedium,
    color: colors.textTertiary,
    flex: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  headerTitle: {
    ...typography.labelLarge,
    color: colors.primary,
  },
  sizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sizePrefix: {
    ...typography.displaySmall,
    fontFamily: fontFamily.sansBold,
    color: colors.textPrimary,
  },
  sizeBadge: {
    backgroundColor: '#F3F0EC',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(26,26,26,0.05)',
  },
  sizeValue: {
    ...typography.displaySmall,
    fontFamily: fontFamily.sansBold,
    color: colors.primary,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  confidencePill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  confidenceText: {
    ...typography.labelMedium,
    fontFamily: fontFamily.sansBold,
  },
  fitType: {
    ...typography.bodyMedium,
    fontFamily: fontFamily.sansMedium,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
});

