import { View, Text, FlatList, Pressable, Image, ImageBackground, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDressingRoomStore } from '@/store/dressingRoomStore';
import { useStores } from '@/hooks/useStores';
import { colors, typography, spacing, radius, shadows, fontFamily } from '@/constants/theme';
import type { Store } from '@/types';

interface StoreCardProps {
  store: Store | null;
  onPress: () => void;
}

function StoreCard({ store, onPress }: StoreCardProps) {
  const { t } = useTranslation();

  // Favourites card
  if (store === null) {
    return (
      <Pressable style={[styles.card, styles.favouritesCard]} onPress={onPress}>
        <Heart size={32} color={colors.textInverse} fill={colors.textInverse} />
        <Text style={styles.favouritesText}>{t('dressingRoom.favourites')}</Text>
      </Pressable>
    );
  }

  const coverImage = store.banner_url || store.logo_url;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {coverImage ? (
        <ImageBackground
          source={{ uri: coverImage }}
          style={styles.cardImage}
          imageStyle={styles.cardImageInner}
        >
          <View style={styles.cardGradient}>
            <View style={styles.cardBottom}>
              {store.logo_url && (
                <Image source={{ uri: store.logo_url }} style={styles.storeAvatar} />
              )}
              <View style={styles.cardInfo}>
                <Text style={styles.storeName} numberOfLines={1}>{store.name}</Text>
                {store.description && (
                  <Text style={styles.storeDescription} numberOfLines={1}>
                    {store.description}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </ImageBackground>
      ) : (
        <View style={[styles.cardImage, styles.cardPlaceholder]}>
          <View style={styles.cardBottom}>
            <Text style={styles.storeName} numberOfLines={1}>{store.name}</Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

export default function StoreSelector() {
  const { t } = useTranslation();
  const { selectStore } = useDressingRoomStore();
  const { stores, loading, error, refresh } = useStores();

  if (loading && stores.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryText}>{t('common.retry')}</Text>
        </Pressable>
      </View>
    );
  }

  const dataWithFavourites: (Store | null)[] = [null, ...stores];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t('dressingRoom.selectStore')}</Text>
      <FlatList
        horizontal
        data={dataWithFavourites}
        keyExtractor={(item) => item?.id ?? 'favourites'}
        renderItem={({ item }) => (
          <StoreCard store={item} onPress={() => selectStore(item)} />
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const CARD_WIDTH = 140;
const CARD_HEIGHT = 170;

const styles = StyleSheet.create({
  container: {},
  sectionTitle: {
    ...typography.labelLarge,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md + spacing.sm + 8,   // 32px — shifts grid down 16px total
    paddingBottom: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
  },
  favouritesCard: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  favouritesText: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 14,
    color: colors.textInverse,
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImageInner: {
    borderRadius: 12,
  },
  cardPlaceholder: {
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'flex-end',
    padding: spacing.sm,
  },
  cardGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  storeAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  cardInfo: {
    flex: 1,
  },
  storeName: {
    fontFamily: fontFamily.sansBold,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  storeDescription: {
    fontFamily: fontFamily.sansRegular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
    fontWeight: '400',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    ...typography.bodyMedium,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
  },
  retryText: {
    ...typography.labelMedium,
    color: colors.textInverse,
  },
});
