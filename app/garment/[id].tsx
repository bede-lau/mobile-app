import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as Haptics from '@/lib/haptics';
import { fetchGarment } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { useSizeRecommendation } from '@/hooks/useSizeRecommendation';
import SizeRecommendationComponent from '@/components/SizeRecommendation';
import Button from '@/components/ui/Button';
import { colors, typography, spacing, radius, shadows } from '@/constants/theme';
import { formatMYR } from '@/constants/sizeCharts';
import type { Garment, GarmentSize } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function GarmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const { addItem } = useCartStore();

  const [garment, setGarment] = useState<Garment | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<GarmentSize | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);

  const recommendation = useSizeRecommendation(garment);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const result = await fetchGarment(id);
      if (result.data) {
        setGarment(result.data);
        // Auto-select recommended size
        if (recommendation?.recommended_size) {
          setSelectedSize(recommendation.recommended_size);
        }
      }
      setLoading(false);
    })();
  }, [id]);

  // Update selected size when recommendation loads
  useEffect(() => {
    if (recommendation && !selectedSize) {
      setSelectedSize(recommendation.recommended_size);
    }
  }, [recommendation, selectedSize]);

  const handleAddToCart = useCallback(() => {
    if (!garment || !selectedSize) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addItem({
      garment_id: garment.id,
      store_id: garment.store_id,
      name: garment.name,
      thumbnail_url: garment.thumbnail_url,
      size: selectedSize,
      quantity: 1,
      unit_price_myr: garment.sale_price_myr ?? garment.price_myr,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }, [garment, selectedSize, addItem]);

  if (loading || !garment) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        <Image
          source={{ uri: garment.thumbnail_url || undefined }}
          style={styles.heroImage}
          resizeMode="cover"
        />

        {/* Back button */}
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </Pressable>

        {/* Content */}
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.push(`/store/${garment.store_id}`)}>
              <Text style={styles.storeName}>
                {t('garment.fromStore', { store: garment.store_id })}
              </Text>
            </Pressable>
            <Text style={styles.name}>{garment.name}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>
                {formatMYR(garment.sale_price_myr ?? garment.price_myr)}
              </Text>
              {garment.sale_price_myr != null && (
                <Text style={styles.originalPrice}>{formatMYR(garment.price_myr)}</Text>
              )}
            </View>
          </View>

          {/* Size selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('garment.selectSize')}</Text>
            <View style={styles.sizeRow}>
              {(garment.sizes_available as GarmentSize[]).map((size) => {
                const isSelected = size === selectedSize;
                const isRecommended = size === recommendation?.recommended_size;
                return (
                  <Pressable
                    key={size}
                    style={[
                      styles.sizePill,
                      isSelected && styles.sizePillSelected,
                      isRecommended && !isSelected && styles.sizePillRecommended,
                    ]}
                    onPress={() => setSelectedSize(size)}
                  >
                    <Text
                      style={[
                        styles.sizeText,
                        isSelected && styles.sizeTextSelected,
                      ]}
                    >
                      {size}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Size recommendation */}
          <SizeRecommendationComponent recommendation={recommendation} />

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('garment.description')}</Text>
            <Text style={styles.bodyText}>{garment.description}</Text>
          </View>

          {/* Fabric details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('garment.fabric')}</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('garment.composition')}</Text>
              <Text style={styles.detailValue}>{garment.fabric_composition}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('garment.care')}</Text>
              <Text style={styles.detailValue}>{garment.care_instructions}</Text>
            </View>
          </View>

          {/* Style tags */}
          {garment.style_tags.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('garment.styleNotes')}</Text>
              <View style={styles.tagsRow}>
                {garment.style_tags.map((tag) => (
                  <View key={tag} style={styles.tagChip}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Bottom spacer for fixed button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed bottom CTA */}
      <View style={styles.bottomBar}>
        <Button
          title={addedToCart ? t('garment.addedToCart') : t('garment.addToCart')}
          onPress={handleAddToCart}
          disabled={!selectedSize || addedToCart}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 1.2,
    backgroundColor: colors.backgroundSecondary,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  backText: {
    fontSize: 20,
    color: colors.primary,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  storeName: {
    ...typography.smallCaps,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  name: {
    ...typography.displaySmall,
    color: colors.textPrimary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  price: {
    ...typography.headingMedium,
    color: colors.textPrimary,
  },
  originalPrice: {
    ...typography.bodyLarge,
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.labelLarge,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  sizeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sizePill: {
    minWidth: 48,
    height: 48,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  sizePillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sizePillRecommended: {
    borderColor: colors.secondary,
    borderWidth: 2,
  },
  sizeText: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sizeTextSelected: {
    color: colors.textInverse,
  },
  bodyText: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
    lineHeight: 26,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  detailLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'right',
    marginLeft: spacing.md,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tagChip: {
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.xs,
  },
  tagText: {
    ...typography.labelSmall,
    color: colors.textSecondary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
