import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useDressingRoomStore } from '@/store/dressingRoomStore';
import { colors, typography, spacing, hitSlop } from '@/constants/theme';

export default function NavigationHeader() {
  const { t } = useTranslation();
  const { currentView, selectedStore, selectedCategory, goBack } = useDressingRoomStore();

  // No header on stores view
  if (currentView === 'stores') {
    return null;
  }

  // Build breadcrumb text
  let breadcrumb = '';
  if (selectedStore === null) {
    breadcrumb = t('dressingRoom.favourites');
  } else {
    breadcrumb = selectedStore.name;
    if (selectedCategory) {
      breadcrumb += ` > ${t(`dressingRoom.categories.${selectedCategory}`)}`;
    }
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={goBack} hitSlop={hitSlop}>
        <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        <Text style={styles.backText}>{t('common.back')}</Text>
      </Pressable>
      <Text style={styles.breadcrumb} numberOfLines={1}>
        {breadcrumb}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  backText: {
    ...typography.labelMedium,
    color: colors.textPrimary,
  },
  breadcrumb: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
});
