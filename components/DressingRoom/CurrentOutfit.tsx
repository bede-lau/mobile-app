import { View, Text, FlatList, Pressable, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, radius, shadows, fontFamily } from '@/constants/theme';
import type { Garment } from '@/types';

interface CurrentOutfitProps {
  garments: Garment[];
}

export default function CurrentOutfit({ garments }: CurrentOutfitProps) {
  const router = useRouter();

  if (garments.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Currently Wearing</Text>
      <FlatList
        horizontal
        data={garments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/garment/${item.id}`)}
          >
            {item.thumbnail_url ? (
              <Image source={{ uri: item.thumbnail_url }} style={styles.thumbnail} />
            ) : (
              <View style={[styles.thumbnail, styles.placeholderThumb]} />
            )}
            <View style={styles.info}>
              <Text style={styles.brand} numberOfLines={1}>
                {item.store_id}
              </Text>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.price}>
                RM {(item.sale_price_myr ?? item.price_myr).toFixed(2)}
              </Text>
            </View>
          </Pressable>
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    ...shadows.sm,
  },
  title: {
    ...typography.labelLarge,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  listContent: {
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 8,
    overflow: 'hidden',
    width: 200,
  },
  thumbnail: {
    width: 64,
    height: 64,
    backgroundColor: colors.backgroundSecondary,
  },
  placeholderThumb: {
    backgroundColor: colors.border,
  },
  info: {
    flex: 1,
    padding: spacing.sm,
    justifyContent: 'center',
  },
  brand: {
    fontFamily: fontFamily.sansMedium,
    fontWeight: '500',
    fontSize: 11,
    color: colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    fontFamily: fontFamily.sansMedium,
    fontWeight: '500',
    fontSize: 13,
    color: colors.textPrimary,
    marginTop: 2,
  },
  price: {
    fontFamily: fontFamily.sansRegular,
    fontWeight: '400',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
