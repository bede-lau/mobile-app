import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from '@/lib/haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, typography, spacing, radius } from '@/constants/theme';

interface HeightInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export default function HeightInput({
  value,
  onChange,
  min = 140,
  max = 210,
}: HeightInputProps) {
  const { t } = useTranslation();
  const scale = useSharedValue(1);

  const increment = () => {
    if (value < max) {
      Haptics.selectionAsync();
      scale.value = withSpring(1.05, { damping: 10 }, () => {
        scale.value = withSpring(1);
      });
      onChange(value + 1);
    }
  };

  const decrement = () => {
    if (value > min) {
      Haptics.selectionAsync();
      scale.value = withSpring(1.05, { damping: 10 }, () => {
        scale.value = withSpring(1);
      });
      onChange(value - 1);
    }
  };

  const incrementFast = () => {
    if (value + 5 <= max) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(value + 5);
    } else {
      onChange(max);
    }
  };

  const decrementFast = () => {
    if (value - 5 >= min) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(value - 5);
    } else {
      onChange(min);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Convert cm to feet/inches for display
  const totalInches = value / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);

  return (
    <View style={styles.container}>
      {/* Main value display */}
      <Animated.View style={[styles.valueContainer, animatedStyle]}>
        <Text style={styles.valueText}>{value}</Text>
        <Text style={styles.unitText}>cm</Text>
      </Animated.View>

      {/* Imperial conversion */}
      <Text style={styles.conversionText}>
        {feet}'{inches}"
      </Text>

      {/* Controls */}
      <View style={styles.controls}>
        <Pressable
          style={[styles.button, styles.buttonLarge]}
          onPress={decrementFast}
          onLongPress={decrementFast}
          disabled={value <= min}
        >
          <Text style={[styles.buttonText, value <= min && styles.buttonTextDisabled]}>
            -5
          </Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={decrement}
          disabled={value <= min}
        >
          <Text style={[styles.buttonText, value <= min && styles.buttonTextDisabled]}>
            -
          </Text>
        </Pressable>

        <View style={styles.spacer} />

        <Pressable
          style={styles.button}
          onPress={increment}
          disabled={value >= max}
        >
          <Text style={[styles.buttonText, value >= max && styles.buttonTextDisabled]}>
            +
          </Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.buttonLarge]}
          onPress={incrementFast}
          disabled={value >= max}
        >
          <Text style={[styles.buttonText, value >= max && styles.buttonTextDisabled]}>
            +5
          </Text>
        </Pressable>
      </View>

      {/* Range indicator */}
      <View style={styles.rangeContainer}>
        <Text style={styles.rangeText}>{min} cm</Text>
        <View style={styles.rangeLine}>
          <View
            style={[
              styles.rangeIndicator,
              { left: `${((value - min) / (max - min)) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.rangeText}>{max} cm</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: spacing.lg,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  valueText: {
    fontSize: 72,
    fontWeight: '300',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  unitText: {
    ...typography.headingMedium,
    color: colors.textSecondary,
  },
  conversionText: {
    ...typography.bodyLarge,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonLarge: {
    width: 56,
  },
  buttonText: {
    ...typography.headingMedium,
    color: colors.textPrimary,
  },
  buttonTextDisabled: {
    color: colors.textTertiary,
  },
  spacer: {
    width: spacing.xl,
  },
  rangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  rangeText: {
    ...typography.caption,
    color: colors.textTertiary,
    minWidth: 45,
  },
  rangeLine: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    position: 'relative',
  },
  rangeIndicator: {
    position: 'absolute',
    top: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginLeft: -6,
  },
});
