import { useCallback } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  withSpring,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import { colors, fontFamily, spacing } from '@/constants/theme';

interface ProgressBarProps {
  label: string;
  value: number; // 0–100
  onValueChange: (value: number) => void;
  trackColor?: string;
  fillColor?: string;
  height?: number;
  showPercentage?: boolean;
  animated?: boolean;
}

export default function ProgressBar({
  label,
  value,
  onValueChange,
  trackColor = colors.backgroundSecondary,
  fillColor = colors.gold,
  height = 8,
  showPercentage = true,
  animated = true,
}: ProgressBarProps) {
  const trackWidth = useSharedValue(0);
  const clampedValue = Math.min(100, Math.max(0, value));

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      trackWidth.value = e.nativeEvent.layout.width;
    },
    [trackWidth],
  );

  const updateValue = useCallback(
    (v: number) => {
      onValueChange(Math.round(v));
    },
    [onValueChange],
  );

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (trackWidth.value === 0) return;
      const pct = Math.min(100, Math.max(0, (e.x / trackWidth.value) * 100));
      runOnJS(updateValue)(pct);
    })
    .hitSlop({ top: 16, bottom: 16 });

  const tapGesture = Gesture.Tap().onEnd((e) => {
    if (trackWidth.value === 0) return;
    const pct = Math.min(100, Math.max(0, (e.x / trackWidth.value) * 100));
    runOnJS(updateValue)(pct);
  });

  const composed = Gesture.Race(panGesture, tapGesture);

  const fillStyle = useAnimatedStyle(() => {
    const width = animated
      ? withSpring((clampedValue / 100) * trackWidth.value, {
          damping: 20,
          stiffness: 150,
        })
      : (clampedValue / 100) * trackWidth.value;
    return { width };
  });

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {showPercentage && (
          <Text style={styles.percentage}>{clampedValue}%</Text>
        )}
      </View>
      <GestureDetector gesture={composed}>
        <View
          style={[styles.track, { height, backgroundColor: trackColor }]}
          onLayout={onLayout}
        >
          <Animated.View
            style={[
              styles.fill,
              { height, backgroundColor: fillColor },
              fillStyle,
            ]}
          />
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    fontFamily: fontFamily.sansMedium,
    fontWeight: '500',
    fontSize: 14,
    color: colors.textPrimary,
  },
  percentage: {
    fontFamily: fontFamily.sansMedium,
    fontWeight: '500',
    fontSize: 14,
    color: colors.textSecondary,
  },
  track: {
    borderRadius: 9999,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 9999,
  },
});
