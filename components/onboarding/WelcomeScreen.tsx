import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { colors, spacing, fontFamily } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const LINES = [
  'Get inspired.',
  'Dress confidently.',
  'Buy what actually fits you.',
  'With Olvon.',
];

const CHAR_INTERVAL = 70;
const CHAR_VARIANCE = 30;
const PAUSE_BETWEEN_LINES = 1000;

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export default function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  const [displayLines, setDisplayLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState('');
  const [typingDone, setTypingDone] = useState(false);
  const lineIndex = useRef(0);
  const charIndex = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Typewriter effect
  useEffect(() => {
    const typeNextChar = () => {
      const li = lineIndex.current;
      const ci = charIndex.current;

      if (li >= LINES.length) {
        setTypingDone(true);
        return;
      }

      const line = LINES[li];

      if (ci <= line.length) {
        setCurrentLine(line.slice(0, ci));
        charIndex.current++;
        const variance = Math.random() * CHAR_VARIANCE * 2 - CHAR_VARIANCE;
        timerRef.current = setTimeout(typeNextChar, CHAR_INTERVAL + variance);
      } else {
        // Line complete — commit it and pause before next
        setDisplayLines((prev) => [...prev, line]);
        setCurrentLine('');
        lineIndex.current++;
        charIndex.current = 0;

        if (lineIndex.current < LINES.length) {
          timerRef.current = setTimeout(typeNextChar, PAUSE_BETWEEN_LINES);
        } else {
          setTypingDone(true);
        }
      }
    };

    timerRef.current = setTimeout(typeNextChar, 600);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.brandLabel}>OLVON</Text>

      <View style={styles.textArea}>
        {displayLines.map((line, i) => (
          <Text key={i} style={styles.line}>{line}</Text>
        ))}
        {!typingDone && (
          <View style={styles.currentLineRow}>
            <Text style={styles.line}>{currentLine}</Text>
            <Animated.View style={[styles.cursor, cursorStyle]} />
          </View>
        )}
      </View>

      {typingDone && (
        <Animated.View entering={FadeIn.duration(600)} style={styles.buttonWrapper}>
          <Animated.View style={styles.getStartedButton}>
            <Text style={styles.getStartedText} onPress={onGetStarted}>
              Get Started
            </Text>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  brandLabel: {
    position: 'absolute',
    top: 72,
    left: spacing.xl,
    fontFamily: fontFamily.sansMedium,
    fontWeight: '500',
    fontSize: 12,
    letterSpacing: 4,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  textArea: {
    minHeight: 200,
  },
  currentLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  line: {
    fontFamily: fontFamily.serifRegular,
    fontWeight: '400',
    fontSize: 32,
    lineHeight: 48,
    color: colors.textPrimary,
    letterSpacing: -0.8,
  },
  cursor: {
    width: 2,
    height: 32,
    backgroundColor: colors.gold,
    marginLeft: 2,
  },
  buttonWrapper: {
    position: 'absolute',
    bottom: 140,
    left: spacing.xl,
    right: spacing.xl,
  },
  getStartedButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  getStartedText: {
    fontFamily: fontFamily.sansMedium,
    fontWeight: '500',
    fontSize: 14,
    color: colors.textInverse,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
