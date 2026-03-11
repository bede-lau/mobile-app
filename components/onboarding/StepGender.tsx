import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors, typography, spacing, fontFamily } from '@/constants/theme';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

interface StepGenderProps {
  value: string;
  onChange: (gender: string) => void;
  onNext: () => void;
}

export default function StepGender({ value, onChange, onNext }: StepGenderProps) {
  const [displayTitle, setDisplayTitle] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const title = 'How do you identify?';

  // Typewriter title
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= title.length) {
        setDisplayTitle(title.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Cursor blink
  const cursorOpacity = useSharedValue(1);
  useEffect(() => {
    cursorOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 530 }),
        withTiming(1, { duration: 530 }),
      ),
      -1,
    );
  }, []);
  const cursorStyle = useAnimatedStyle(() => ({ opacity: cursorOpacity.value }));

  // Typed confirmation
  useEffect(() => {
    if (!value) return;
    const text = 'Noted.';
    let i = 0;
    setConfirmText('');
    const interval = setInterval(() => {
      if (i <= text.length) {
        setConfirmText(text.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
        // Auto-advance after confirmation
        setTimeout(onNext, 800);
      }
    }, 60);
    return () => clearInterval(interval);
  }, [value]);

  const handleSelect = (gender: string) => {
    onChange(gender);
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{displayTitle}</Text>
        <Animated.View style={[styles.cursor, cursorStyle]} />
      </View>

      <View style={styles.options}>
        {GENDER_OPTIONS.map((option, index) => (
          <Animated.View
            key={option.value}
            entering={FadeInDown.delay(300 + index * 100).duration(400)}
          >
            <Pressable
              style={[
                styles.option,
                value === option.value && styles.optionSelected,
              ]}
              onPress={() => handleSelect(option.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  value === option.value && styles.optionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          </Animated.View>
        ))}
      </View>

      {confirmText.length > 0 && (
        <Text style={styles.confirm}>{confirmText}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.xl,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    fontFamily: fontFamily.serifSemiBold,
    fontWeight: '600',
    fontSize: 22,
    color: colors.textPrimary,
    lineHeight: 30,
  },
  cursor: {
    width: 2,
    height: 24,
    backgroundColor: colors.gold,
    marginLeft: 2,
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    borderColor: colors.gold,
    backgroundColor: colors.goldLight,
  },
  optionText: {
    fontFamily: fontFamily.sansMedium,
    fontWeight: '500',
    fontSize: 16,
    color: colors.textPrimary,
  },
  optionTextSelected: {
    color: colors.primary,
  },
  confirm: {
    fontFamily: fontFamily.serifRegular,
    fontWeight: '400',
    fontSize: 18,
    color: colors.textSecondary,
    marginTop: spacing.xl,
    fontStyle: 'italic',
  },
});
