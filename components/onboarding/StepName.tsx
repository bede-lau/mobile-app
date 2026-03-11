import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import { colors, typography, spacing, fontFamily } from '@/constants/theme';

interface StepNameProps {
  value: string;
  onChange: (name: string) => void;
  onNext: () => void;
}

export default function StepName({ value, onChange, onNext }: StepNameProps) {
  const [displayTitle, setDisplayTitle] = useState('');
  const [titleDone, setTitleDone] = useState(false);
  const [displayDescription, setDisplayDescription] = useState('');
  const [descriptionDone, setDescriptionDone] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const title = "Let's start with your name.";
  const description = 'We want to get to know you personally.';
  const isValid = value.trim().length >= 2;

  // Typewriter title animation
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= title.length) {
        setDisplayTitle(title.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
        setTitleDone(true);
      }
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Typewriter description — starts after title finishes
  useEffect(() => {
    if (!titleDone) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i <= description.length) {
        setDisplayDescription(description.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
        setDescriptionDone(true);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [titleDone]);

  // Content reveal after description finishes
  useEffect(() => {
    if (!descriptionDone) return;
    const timer = setTimeout(() => setContentReady(true), 300);
    return () => clearTimeout(timer);
  }, [descriptionDone]);

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

  // Underline animation
  const underlineWidth = useSharedValue(0);
  useEffect(() => {
    underlineWidth.value = withTiming(value.length > 0 ? 100 : 0, { duration: 300 });
  }, [value]);
  const underlineStyle = useAnimatedStyle(() => ({
    width: `${underlineWidth.value}%`,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{displayTitle}</Text>
        {!titleDone && <Animated.View style={[styles.cursor, cursorStyle]} />}
      </View>

      {titleDone && (
        <View style={styles.descriptionRow}>
          <Text style={styles.description}>{displayDescription}</Text>
          {!descriptionDone && <Animated.View style={[styles.cursorSmall, cursorStyle]} />}
        </View>
      )}

      {contentReady && (
        <Animated.View entering={FadeIn.duration(500)}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChange}
              placeholder="Your name"
              placeholderTextColor={colors.textSecondary}
              autoFocus
              onSubmitEditing={() => isValid && onNext()}
              returnKeyType="done"
            />
            <View style={styles.underlineTrack}>
              <Animated.View style={[styles.underlineFill, underlineStyle]} />
            </View>
          </View>

          {value.length > 0 && !isValid && (
            <Text style={styles.hint}>Press Enter to continue</Text>
          )}
        </Animated.View>
      )}

      {isValid && (
        <Animated.View entering={FadeInDown.duration(400)} style={styles.continueRow}>
          <Pressable style={styles.continueButton} onPress={onNext}>
            <Text style={styles.continueText}>Continue</Text>
          </Pressable>
          <View style={styles.checkCircle}>
            <Check size={16} color={colors.surface} />
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
  },
  description: {
    fontFamily: fontFamily.sansRegular,
    fontWeight: '400',
    fontSize: 14,
    color: colors.textSecondary,
  },
  descriptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
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
  cursorSmall: {
    width: 2,
    height: 16,
    backgroundColor: colors.gold,
    marginLeft: 2,
  },
  inputWrapper: {
    marginBottom: spacing.lg,
  },
  input: {
    fontFamily: fontFamily.serifRegular,
    fontWeight: '400',
    fontSize: 28,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
    letterSpacing: -0.5,
  },
  underlineTrack: {
    height: 2,
    backgroundColor: colors.border,
    borderRadius: 1,
  },
  underlineFill: {
    height: 2,
    backgroundColor: colors.gold,
    borderRadius: 1,
  },
  hint: {
    fontFamily: fontFamily.sansRegular,
    fontWeight: '400',
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  continueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    position: 'absolute',
    bottom: spacing.lg,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  continueText: {
    fontFamily: fontFamily.sansMedium,
    fontWeight: '500',
    fontSize: 14,
    color: colors.textInverse,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
