import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import Svg, { Ellipse, Path, Line, G } from 'react-native-svg';
import { colors, spacing, fontFamily } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOTAL_DURATION = 5000;

const STATUS_MESSAGES = [
  'Preparing your fitting room...',
  'Calibrating your style...',
  'Almost ready...',
];

interface LoadingScreenProps {
  onComplete: () => void;
}

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedLine = Animated.createAnimatedComponent(Line);

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [statusIndex, setStatusIndex] = useState(0);
  const [displayStatus, setDisplayStatus] = useState('');
  const progressWidth = useSharedValue(0);

  // Body part opacities
  const headOpacity = useSharedValue(0);
  const torsoOpacity = useSharedValue(0);
  const armsOpacity = useSharedValue(0);
  const legsOpacity = useSharedValue(0);

  // Scan line
  const scanY = useSharedValue(0);

  // Animate body parts sequentially
  useEffect(() => {
    headOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    torsoOpacity.value = withDelay(900, withTiming(1, { duration: 600 }));
    armsOpacity.value = withDelay(1500, withTiming(1, { duration: 600 }));
    legsOpacity.value = withDelay(1800, withTiming(1, { duration: 600 }));

    // Scan lines loop
    scanY.value = withDelay(500, withRepeat(
      withTiming(200, { duration: 2000, easing: Easing.linear }),
      -1,
      true,
    ));

    // Progress bar
    progressWidth.value = withTiming(100, {
      duration: TOTAL_DURATION,
      easing: Easing.linear,
    });
  }, []);

  // Rotate status messages
  useEffect(() => {
    const messageInterval = TOTAL_DURATION / STATUS_MESSAGES.length;
    const timers: ReturnType<typeof setTimeout>[] = [];

    STATUS_MESSAGES.forEach((_, i) => {
      if (i > 0) {
        timers.push(setTimeout(() => setStatusIndex(i), messageInterval * i));
      }
    });

    // Auto-navigate after total duration
    timers.push(setTimeout(onComplete, TOTAL_DURATION + 500));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // Typewriter for current status message
  useEffect(() => {
    const message = STATUS_MESSAGES[statusIndex];
    let i = 0;
    setDisplayStatus('');
    const interval = setInterval(() => {
      if (i <= message.length) {
        setDisplayStatus(message.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 35);
    return () => clearInterval(interval);
  }, [statusIndex]);

  const headStyle = useAnimatedStyle(() => ({ opacity: headOpacity.value }));
  const torsoStyle = useAnimatedStyle(() => ({ opacity: torsoOpacity.value }));
  const armsStyle = useAnimatedStyle(() => ({ opacity: armsOpacity.value }));
  const legsStyle = useAnimatedStyle(() => ({ opacity: legsOpacity.value }));

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanY.value }],
    opacity: 0.3,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.silhouetteArea}>
        <Svg width={160} height={280} viewBox="0 0 160 280">
          {/* Shadow ellipse */}
          <Ellipse cx={80} cy={270} rx={40} ry={8} fill={colors.border} opacity={0.5} />

          {/* Head */}
          <Animated.View style={headStyle}>
            <Svg width={160} height={280} viewBox="0 0 160 280" style={StyleSheet.absoluteFill}>
              <Ellipse cx={80} cy={35} rx={22} ry={28} fill={colors.primary} opacity={0.15} />
              <Ellipse cx={80} cy={35} rx={22} ry={28} stroke={colors.primary} strokeWidth={2} fill="none" />
            </Svg>
          </Animated.View>

          {/* Torso */}
          <Animated.View style={torsoStyle}>
            <Svg width={160} height={280} viewBox="0 0 160 280" style={StyleSheet.absoluteFill}>
              <Path
                d="M60 65 L55 160 L105 160 L100 65 Z"
                stroke={colors.primary}
                strokeWidth={2}
                fill={colors.primary}
                opacity={0.1}
              />
            </Svg>
          </Animated.View>

          {/* Arms */}
          <Animated.View style={armsStyle}>
            <Svg width={160} height={280} viewBox="0 0 160 280" style={StyleSheet.absoluteFill}>
              <Path
                d="M55 75 L25 140"
                stroke={colors.primary}
                strokeWidth={2}
                strokeLinecap="round"
              />
              <Path
                d="M105 75 L135 140"
                stroke={colors.primary}
                strokeWidth={2}
                strokeLinecap="round"
              />
            </Svg>
          </Animated.View>

          {/* Legs */}
          <Animated.View style={legsStyle}>
            <Svg width={160} height={280} viewBox="0 0 160 280" style={StyleSheet.absoluteFill}>
              <Path
                d="M62 160 L55 255"
                stroke={colors.primary}
                strokeWidth={2}
                strokeLinecap="round"
              />
              <Path
                d="M98 160 L105 255"
                stroke={colors.primary}
                strokeWidth={2}
                strokeLinecap="round"
              />
            </Svg>
          </Animated.View>
        </Svg>

        {/* Scan lines */}
        <Animated.View style={[styles.scanLine, scanLineStyle]} />
        <Animated.View style={[styles.scanLine, scanLineStyle, { marginTop: 40 }]} />
        <Animated.View style={[styles.scanLine, scanLineStyle, { marginTop: 80 }]} />
        <Animated.View style={[styles.scanLine, scanLineStyle, { marginTop: 120 }]} />
      </View>

      {/* Status message */}
      <Text style={styles.statusText}>{displayStatus}</Text>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  silhouetteArea: {
    width: 160,
    height: 280,
    marginBottom: spacing.xxl,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.gold,
    top: 0,
  },
  statusText: {
    fontFamily: fontFamily.serifRegular,
    fontWeight: '400',
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    minHeight: 28,
    marginBottom: spacing.xl,
  },
  progressContainer: {
    width: '100%',
    paddingHorizontal: spacing.xl,
    position: 'absolute',
    bottom: 60,
    left: spacing.xl,
    right: spacing.xl,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    backgroundColor: colors.gold,
    borderRadius: 2,
  },
});
