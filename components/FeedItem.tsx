import { useCallback, useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  Image,
  AppState,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, typography, spacing, radius, shadows, fontFamily } from '@/constants/theme';
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
  const [videoError, setVideoError] = useState(false);
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');

  // Track app state to avoid creating video players when activity is unavailable
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      setAppActive(state === 'active');
    });
    return () => sub.remove();
  }, []);

  // Only create the player when the app is active and we have a valid URL
  const player = useVideoPlayer(
    appActive && item.video_url ? item.video_url : null,
    (p) => {
      p.loop = true;
      p.muted = false;
    }
  );

  // Listen for video errors via status changes
  useEffect(() => {
    if (!player) return;
    const subscription = player.addListener('statusChange', (payload) => {
      if (payload.error) {
        console.warn('[FeedItem] Video error:', payload.error.message);
        setVideoError(true);
      }
      if (payload.status === 'error') {
        setVideoError(true);
      }
    });
    return () => subscription.remove();
  }, [player]);

  useEffect(() => {
    if (!player) return;
    try {
      if (isActive && !videoError && appActive) {
        player.play();
      } else {
        player.pause();
      }
    } catch (e) {
      console.warn('[FeedItem] Player control error:', e);
      setVideoError(true);
    }
  }, [isActive, player, videoError, appActive]);

  const handleLike = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

  return (
    <View style={styles.container}>
      {/* Video background */}
      <Pressable style={styles.videoContainer} onPress={handleDoubleTap}>
        {item.video_url && !videoError && player ? (
          <VideoView
            player={player}
            style={styles.video}
            contentFit="cover"
            nativeControls={false}
          />
        ) : (
          <Image
            source={{ uri: item.thumbnail_url }}
            style={styles.video}
            resizeMode="cover"
          />
        )}
      </Pressable>

      {/* Overlay gradient */}
      <View style={styles.gradient} />

      {/* Right side actions — vertically centered */}
      <View style={styles.actions}>
        {/* Like button in frosted glass circle */}
        <Pressable style={styles.actionButton} onPress={handleLike}>
          <Animated.View style={[styles.frostedCircle, likeAnimatedStyle]}>
            <Heart size={24} color={isLiked ? '#F87171' : colors.textInverse} fill={isLiked ? '#F87171' : 'transparent'} strokeWidth={1.5} />
          </Animated.View>
        </Pressable>
      </View>

      {/* Bottom info */}
      <View style={styles.bottomInfo}>
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
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.4,
    backgroundColor: 'transparent',
    // Simulated gradient with layered views would be better
    // For now using semi-transparent overlay
  },
  actions: {
    position: 'absolute',
    right: spacing.md,
    top: SCREEN_HEIGHT / 2 - 22,
    alignItems: 'center',
    gap: spacing.lg,
  },
  actionButton: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  frostedCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 100,
    left: spacing.md,
    right: 80,
  },
  garmentStrip: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  garmentThumb: {
    width: 64,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  garmentImage: {
    width: 64,
    height: 64,
    backgroundColor: colors.backgroundSecondary,
  },
  garmentPrice: {
    ...typography.caption,
    fontFamily: fontFamily.sansBold,
    fontSize: 9, // Slightly smaller text
    color: colors.textPrimary,
    textAlign: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: 4, // Creating gap between it and borders
  },
});
