import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '@/constants/theme';
import type { SizeRecommendation, FitType } from '@/types';

interface SizeRecommendationProps {
  recommendation: SizeRecommendation | null;
}

const FIT_ICONS: Record<FitType, string> = {
  tight: 'contract-outline',
  fitted: 'body-outline',
  regular: 'checkmark-circle-outline',
  relaxed: 'expand-outline',
  oversized: 'resize-outline',
};

export default function SizeRecommendationComponent({
  recommendation,
}: SizeRecommendationProps) {
  const { t } = useTranslation();

  if (!recommendation) {
    return (
      <View style={styles.container}>
        <View style={styles.noDataCard}>
          <Ionicons name="body-outline" size={24} color={colors.textTertiary} />
          <Text style={styles.noDataText}>{t('garment.scanForRecommendation')}</Text>
        </View>
      </View>
    );
  }

  const confidenceColor =
    recommendation.confidence >= 80
      ? colors.success
      : recommendation.confidence >= 60
      ? colors.warning
      : colors.error;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t('garment.sizeRecommendation')}</Text>

      {/* Main recommendation card */}
      <View style={styles.card}>
        <View style={styles.mainRow}>
          <View style={styles.sizeBox}>
            <Text style={styles.sizeLabel}>{t('garment.recommendedSize')}</Text>
            <Text style={styles.sizeValue}>{recommendation.recommended_size}</Text>
          </View>

          <View style={styles.fitInfo}>
            <View style={styles.fitRow}>
              <Ionicons
                name={FIT_ICONS[recommendation.fit_type] as any}
                size={20}
                color={colors.textSecondary}
              />
              <Text style={styles.fitType}>
                {t(`garment.fitTypes.${recommendation.fit_type}`)}
              </Text>
            </View>

            <View style={styles.confidenceRow}>
              <View style={styles.confidenceBar}>
                <View
                  style={[
                    styles.confidenceFill,
                    {
                      width: `${recommendation.confidence}%`,
                      backgroundColor: confidenceColor,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.confidenceText, { color: confidenceColor }]}>
                {recommendation.confidence}%
              </Text>
            </View>
          </View>
        </View>

        {/* Alternatives */}
        {recommendation.alternatives.length > 0 && (
          <View style={styles.alternatives}>
            <Text style={styles.altLabel}>{t('garment.alternatives')}</Text>
            <View style={styles.altRow}>
              {recommendation.alternatives.map((alt) => (
                <View key={alt.size} style={styles.altChip}>
                  <Text style={styles.altSize}>{alt.size}</Text>
                  {alt.note && <Text style={styles.altNote}>{alt.note}</Text>}
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Measurement comparison */}
      {recommendation.measurement_comparison.length > 0 && (
        <View style={styles.measurementSection}>
          <Text style={styles.measurementTitle}>{t('garment.measurementComparison')}</Text>
          {recommendation.measurement_comparison.map((m) => (
            <View key={m.measurement} style={styles.measurementRow}>
              <Text style={styles.measurementLabel}>
                {t(`garment.measurements.${m.measurement}`)}
              </Text>
              <View style={styles.measurementValues}>
                <Text style={styles.measurementValue}>
                  {m.user_cm.toFixed(1)} cm
                </Text>
                <Ionicons
                  name={m.difference_cm > 0 ? 'arrow-forward' : 'arrow-back'}
                  size={14}
                  color={colors.textTertiary}
                />
                <Text style={styles.measurementValue}>
                  {m.garment_cm.toFixed(1)} cm
                </Text>
                <Text
                  style={[
                    styles.measurementDiff,
                    { color: m.difference_cm > 0 ? colors.success : colors.warning },
                  ]}
                >
                  ({m.difference_cm > 0 ? '+' : ''}
                  {m.difference_cm.toFixed(1)})
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.labelLarge,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  noDataCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: radius.sm,
  },
  noDataText: {
    ...typography.bodyMedium,
    color: colors.textTertiary,
    flex: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mainRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  sizeBox: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  sizeLabel: {
    ...typography.caption,
    color: colors.textInverse,
    opacity: 0.8,
  },
  sizeValue: {
    ...typography.displayMedium,
    color: colors.textInverse,
    marginTop: spacing.xs,
  },
  fitInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.sm,
  },
  fitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  fitType: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  confidenceBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 3,
  },
  confidenceText: {
    ...typography.labelMedium,
    minWidth: 40,
  },
  alternatives: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
  },
  altLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  altRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  altChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.xs,
  },
  altSize: {
    ...typography.labelMedium,
    color: colors.textPrimary,
  },
  altNote: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  measurementSection: {
    marginTop: spacing.md,
  },
  measurementTitle: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  measurementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  measurementLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  measurementValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  measurementValue: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  measurementDiff: {
    ...typography.caption,
  },
});
