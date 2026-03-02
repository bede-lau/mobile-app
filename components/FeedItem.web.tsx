// Web version - uses Image instead of Video, no Haptics
import { useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, typography, spacing, radius, shadows } from '@/constants/theme';
import type { OutfitFeedItem } from '@/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FeedItemProps {
  item: OutfitFeedItem;
  isActive: boolean;
  isLiked: boolean;
  onLike: (id: string) => void;
}

export default function FeedItem({ item, isActive, isLiked, onLike }: FeedItemProps) {
  const router = useRouter();
  const likeScale = useSharedValue(1);

  const handleLike = useCallback(() => {
    likeScale.value = withSpring(1.3, { damping: 4 }, () => {
      likeScale.value = withSpring(1);
    });
    onLike(item.id);
  }, [item.id, onLike, likeScale]);

  const handleDoubleTap = useCallback(() => {
    if (!isLiked) {
      handleLike();
    }
  }, [isLiked, handleLike]);

  const likeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));

  const navigateToGarment = useCallback(
    (garmentId: string) => {
      router.push(`/garment/${garmentId}`);
    },
    [router]
  );

  const navigateToStore = useCallback(() => {
    router.push(`/store/${item.store_id}`);
  }, [router, item.store_id]);

  return (
    <View style={styles.container}>
      {/* Image background (web fallback for video) */}
      <Pressable style={styles.videoContainer} onPress={handleDoubleTap}>
        <Image
          source={{ uri: item.thumbnail_url || item.video_url }}
          style={styles.video}
          resizeMode="cover"
        />
        {/* Play icon overlay to indicate this would be a video */}
        {item.video_url && (
          <View style={styles.playOverlay}>
            <Ionicons name="play-circle-outline" size={64} color="rgba(255,255,255,0.8)" />
          </View>
        )}
      </Pressable>

      {/* Overlay gradient */}
      <View style={styles.gradient} />

      {/* Right side actions */}
      <View style={styles.actions}>
        {/* Like button */}
        <Pressable style={styles.actionButton} onPress={handleLike}>
          <Animated.View style={likeAnimatedStyle}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={32}
              color={isLiked ? colors.accent : colors.textInverse}
            />
          </Animated.View>
          <Text style={styles.actionCount}>{item.likes_count}</Text>
        </Pressable>

        {/* Store button */}
        <Pressable style={styles.actionButton} onPress={navigateToStore}>
          {item.store.logo_url ? (
            <Image source={{ uri: item.store.logo_url }} style={styles.storeLogo} />
          ) : (
            <View style={styles.storeLogoPlaceholder}>
              <Ionicons name="storefront-outline" size={24} color={colors.textInverse} />
            </View>
          )}
        </Pressable>
      </View>

      {/* Bottom info */}
      <View style={styles.bottomInfo}>
        {/* Store name */}
        <Pressable onPress={navigateToStore}>
          <Text style={styles.storeName}>{item.store.name}</Text>
        </Pressable>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Garment thumbnails */}
        {item.garments.length > 0 && (
          <View style={styles.garmentStrip}>
            {item.garments.slice(0, 4).map((garment) => (
              <Pressable
                key={garment.id}
                style={styles.garmentThumb}
                onPress={() => navigateToGarment(garment.id)}
              >
                <Image
                  source={{ uri: garment.thumbnail_url }}
                  style={styles.garmentImage}
                />
                <Text style={styles.garmentPrice}>RM {garment.price_myr}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Tags */}
        {item.style_tags.length > 0 && (
          <View style={styles.tags}>
            {item.style_tags.slice(0, 3).map((tag) => (
              <Text key={tag} style={styles.tag}>
                #{tag}
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: colors.primary,
  },
  videoContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.4,
    backgroundColor: 'transparent',
  },
  actions: {
    position: 'absolute',
    right: spacing.md,
    bottom: 140,
    alignItems: 'center',
    gap: spacing.lg,
  },
  actionButton: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionCount: {
    ...typography.labelSmall,
    color: colors.textInverse,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  storeLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.textInverse,
  },
  storeLogoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.textInverse,
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 100,
    left: spacing.md,
    right: 80,
  },
  storeName: {
    ...typography.labelMedium,
    color: colors.textInverse,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  title: {
    ...typography.headingMedium,
    color: colors.textInverse,
    marginTop: spacing.xs,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  garmentStrip: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  garmentThumb: {
    width: 64,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    overflow: 'hidden',
    ...shadows.sm,
  },
  garmentImage: {
    width: 64,
    height: 64,
    backgroundColor: colors.backgroundSecondary,
  },
  garmentPrice: {
    ...typography.caption,
    color: colors.textPrimary,
    textAlign: 'center',
    paddingVertical: spacing.xs,
  },
  tags: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  tag: {
    ...typography.caption,
    color: colors.textInverse,
    opacity: 0.8,
  },
});
