import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Heart, Check, ChevronRight, ShoppingCart, Zap } from 'lucide-react-native';
import * as Haptics from '@/lib/haptics';
import { fetchGarment } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { useSizeRecommendation } from '@/hooks/useSizeRecommendation';
import SizeRecommendationComponent from '@/components/SizeRecommendation';
import Button from '@/components/ui/Button';
import { colors, typography, spacing, radius, shadows, fontFamily } from '@/constants/theme';
import { formatMYR } from '@/constants/sizeCharts';
import type { Garment, GarmentSize } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MOCK_COLORS = [
  { id: 'ivory', name: 'Ivory', hex: '#FDFBF7' },
  { id: 'sand', name: 'Sand', hex: '#D7CDBB' },
  { id: 'black', name: 'Black', hex: '#1C1C1C' },
];

export default function GarmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const { addItem } = useCartStore();

  const [garment, setGarment] = useState<Garment | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<GarmentSize | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>(MOCK_COLORS[0].id);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const recommendation = useSizeRecommendation(garment);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const result = await fetchGarment(id);
      if (result.data) {
        setGarment(result.data);
        if (recommendation?.recommended_size) {
          setSelectedSize(recommendation.recommended_size);
        }
      }
      setLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    if (recommendation && !selectedSize) {
      setSelectedSize(recommendation.recommended_size);
    } else if (garment && !selectedSize && garment.sizes_available.length > 0) {
      setSelectedSize(garment.sizes_available[0]);
    }
  }, [recommendation, selectedSize, garment]);

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

  const handleBuyNow = useCallback(() => {
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
    router.push('/cart');
  }, [garment, selectedSize, addItem, router]);

  const toggleLike = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLiked((prev) => !prev);
  }, []);

  if (loading || !garment) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  const storeName = garment.store_id.replace('store-', 'Store ');

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero image with overlay buttons */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: garment.thumbnail_url || undefined }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.textPrimary} />
          </Pressable>

          <Pressable style={styles.likeButton} onPress={toggleLike}>
            <Heart 
              size={24} 
              color={isLiked ? '#F87171' : colors.textPrimary} 
              fill={isLiked ? '#F87171' : 'transparent'} 
              strokeWidth={1.5} 
            />
          </Pressable>
        </View>

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View style={styles.brandInfo}>
                <View style={styles.brandTagContainer}>
                  <Text style={styles.brandName} numberOfLines={1}>{storeName.toUpperCase()}</Text>
                </View>
                <Text style={styles.garmentName}>{garment.name}</Text>
              </View>
              
              <Pressable onPress={() => router.push(`/store/${garment.store_id}`)} style={styles.storeAvatarButton}>
                <Image
                  source={{ uri: `https://picsum.photos/seed/${garment.store_id.replace('store-', '')}/200` }}
                  style={styles.storeLogoCircle}
                />
              </Pressable>
            </View>
            
            <View style={styles.priceRow}>
              <Text style={styles.price}>
                {formatMYR(garment.sale_price_myr ?? garment.price_myr)}
              </Text>
              {garment.sale_price_myr != null && (
                <Text style={styles.originalPrice}>{formatMYR(garment.price_myr)}</Text>
              )}
            </View>

            <Text style={styles.description}>{garment.description}</Text>
          </View>

          {/* Size recommendation */}
          <SizeRecommendationComponent recommendation={recommendation} />

          {/* Size selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('garment.size', 'SIZE')}</Text>
            <View style={styles.sizeRow}>
              {(garment.sizes_available as GarmentSize[]).map((size) => {
                const isSelected = size === selectedSize;
                return (
                  <Pressable
                    key={size}
                    style={[
                      styles.sizePill,
                      isSelected && styles.sizePillSelected,
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

          {/* Color selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('garment.color', 'COLOR')}</Text>
            <View style={styles.colorRow}>
              {MOCK_COLORS.map((color) => {
                const isSelected = color.id === selectedColor;
                return (
                  <View key={color.id} style={styles.colorWrapper}>
                    <Pressable
                      style={[
                        styles.colorCircleWrapper,
                        isSelected && styles.colorCircleWrapperSelected,
                      ]}
                      onPress={() => setSelectedColor(color.id)}
                    >
                      <View style={[styles.colorCircle, { backgroundColor: color.hex }]}>
                        {isSelected && (
                          <Check size={16} color={color.id === 'ivory' ? '#000' : '#FFF'} strokeWidth={3} />
                        )}
                      </View>
                    </Pressable>
                    <Text style={[styles.colorLabel, isSelected && styles.colorLabelSelected]}>
                      {color.name}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('garment.details', 'DETAILS')}</Text>
            
            <View style={styles.detailList}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('garment.fabric', 'Fabric')}</Text>
                <Text style={styles.detailValue}>{garment.fabric_composition}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('garment.care', 'Care')}</Text>
                <Text style={styles.detailValue}>{garment.care_instructions}</Text>
              </View>

              {garment.style_tags.length > 0 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t('garment.styleNotes', 'Style Notes')}</Text>
                  <Text style={styles.detailValue}>{garment.style_tags.join(', ')}</Text>
                </View>
              )}
            </View>
          </View>

        </View>

        {/* Bottom spacer for fixed button */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Fixed bottom CTA */}
      <View style={styles.bottomBar}>
        <View style={styles.actionRow}>
          <Pressable 
            style={[styles.actionButton, styles.addToCartButton]} 
            onPress={handleAddToCart}
            disabled={!selectedSize || addedToCart}
          >
            <View style={styles.buttonContent}>
              <ShoppingCart size={18} color={colors.primary} style={styles.buttonIcon} />
              <Text style={styles.addToCartText}>
                {addedToCart ? `${t('garment.added', 'Added')}` : t('garment.addToCart', 'Add to Cart')}
              </Text>
            </View>
          </Pressable>
          <Pressable 
            style={[styles.actionButton, styles.buyNowButton, (!selectedSize) && styles.disabledButton]} 
            onPress={handleBuyNow}
            disabled={!selectedSize}
          >
            <View style={styles.buttonContent}>
              <Zap size={18} color={colors.textInverse} style={styles.buttonIcon} />
              <Text style={styles.buyNowText}>{t('garment.buyNow', 'Buy Now')}</Text>
            </View>
          </Pressable>
        </View>
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
  heroContainer: {
    position: 'relative',
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 1.2,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundSecondary,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  likeButton: {
    position: 'absolute',
    top: 50,
    right: spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  brandInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  brandTagContainer: {
    alignSelf: 'flex-start',
    marginBottom: spacing.sm, // Reduced distance to garment title
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    // Aesthetic backlight / glow
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(26,26,26,0.05)',
  },
  brandName: {
    ...typography.labelLarge,
    fontFamily: fontFamily.sansBold,
    color: colors.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  storeAvatarButton: {
    marginTop: 4,
  },
  storeLogoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  garmentName: {
    ...typography.displaySmall,
    fontFamily: fontFamily.serifBold,
    lineHeight: 34,
    color: colors.textPrimary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  price: {
    ...typography.headingLarge,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  originalPrice: {
    ...typography.bodyLarge,
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  description: {
    ...typography.bodyLarge,
    fontFamily: fontFamily.sansRegular,
    color: colors.textSecondary,
    lineHeight: 26,
    letterSpacing: 0.2,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.smallCaps,
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    letterSpacing: 1.5,
  },
  sizeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  sizePill: {
    width: 54,
    height: 54,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizePillSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  sizeText: {
    ...typography.bodyLarge,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sizeTextSelected: {
    color: colors.textInverse,
  },
  colorRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  colorWrapper: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  colorCircleWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorCircleWrapperSelected: {
    borderColor: colors.primary,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  colorLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  colorLabelSelected: {
    color: colors.textPrimary,
  },
  detailList: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    ...typography.bodyMedium,
    fontFamily: fontFamily.sansMedium,
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.bodyMedium,
    fontFamily: fontFamily.sansRegular,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'right',
    marginLeft: spacing.xl,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: 40,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonIconRight: {
    marginLeft: 8,
  },
  actionButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  addToCartText: {
    ...typography.labelLarge,
    color: colors.primary,
  },
  buyNowButton: {
    backgroundColor: colors.primary,
  },
  buyNowText: {
    ...typography.labelLarge,
    fontFamily: fontFamily.sansMedium,
    color: colors.textInverse,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

