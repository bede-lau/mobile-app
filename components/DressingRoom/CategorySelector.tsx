import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useDressingRoomStore } from '@/store/dressingRoomStore';
import { colors, typography, spacing, radius, shadows } from '@/constants/theme';
import { getCategoryCounts } from '@/lib/mockData';
import { isMockMode } from '@/lib/config';
import type { GarmentCategory } from '@/types';

const CATEGORIES: GarmentCategory[] = [
  'tops',
  'bottoms',
  'dresses',
  'outerwear',
  'activewear',
  'traditional',
  'accessories',
];

const CATEGORY_ICONS: Record<GarmentCategory, keyof typeof Ionicons.glyphMap> = {
  tops: 'shirt-outline',
  bottoms: 'albums-outline',
  dresses: 'woman-outline',
  outerwear: 'cloudy-outline',
  activewear: 'fitness-outline',
  traditional: 'flower-outline',
  accessories: 'glasses-outline',
};

interface CategoryCardProps {
  category: GarmentCategory;
  count: number;
  onPress: () => void;
}

function CategoryCard({ category, count, onPress }: CategoryCardProps) {
  const { t } = useTranslation();
  const isEmpty = count === 0;

  return (
    <Pressable
      style={[styles.card, isEmpty && styles.cardEmpty]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, isEmpty && styles.iconContainerEmpty]}>
        <Ionicons
          name={CATEGORY_ICONS[category]}
          size={24}
          color={isEmpty ? colors.textTertiary : colors.textPrimary}
        />
      </View>
      <Text style={[styles.categoryName, isEmpty && styles.textEmpty]} numberOfLines={1}>
        {t(`dressingRoom.categories.${category}`)}
      </Text>
      <View style={[styles.countBadge, isEmpty && styles.countBadgeEmpty]}>
        <Text style={[styles.countText, isEmpty && styles.textEmpty]}>
          {isEmpty ? t('dressingRoom.noStock') : count}
        </Text>
      </View>
    </Pressable>
  );
}

export default function CategorySelector() {
  const { t } = useTranslation();
  const { selectedStore, selectCategory } = useDressingRoomStore();

  // Get category counts for the selected store
  const categoryCounts = selectedStore && isMockMode()
    ? getCategoryCounts(selectedStore.id)
    : CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: 0 }), {} as Record<GarmentCategory, number>);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t('dressingRoom.selectCategory')}</Text>
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <CategoryCard
            category={item}
            count={categoryCounts[item]}
            onPress={() => selectCategory(item)}
          />
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  sectionTitle: {
    ...typography.labelLarge,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  card: {
    width: 100,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.sm,
    alignItems: 'center',
    ...shadows.sm,
  },
  cardEmpty: {
    backgroundColor: colors.backgroundSecondary,
    opacity: 0.8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconContainerEmpty: {
    backgroundColor: colors.borderLight,
  },
  categoryName: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  textEmpty: {
    color: colors.textTertiary,
  },
  countBadge: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  countBadgeEmpty: {
    backgroundColor: colors.border,
  },
  countText: {
    ...typography.caption,
    color: colors.textInverse,
    fontWeight: '600',
  },
});
