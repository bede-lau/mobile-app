import { useEffect, useRef, useState, useCallback } from 'react';
import { Text, View, StyleSheet, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors, fontFamily } from '@/constants/theme';

interface TypewriterTextProps {
  lines: string[];
  typingSpeed?: number;
  pauseBetweenLines?: number;
  cursorBlinkMs?: number;
  textStyle?: TextStyle;
  onComplete?: () => void;
}

export default function TypewriterText({
  lines,
  typingSpeed = 45,
  pauseBetweenLines = 600,
  cursorBlinkMs = 530,
  textStyle,
  onComplete,
}: TypewriterTextProps) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cursor blink animation
  const cursorOpacity = useSharedValue(1);

  useEffect(() => {
    cursorOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: cursorBlinkMs }),
        withTiming(1, { duration: cursorBlinkMs }),
      ),
      -1,
      false,
    );
  }, [cursorBlinkMs, cursorOpacity]);

  const cursorStyle = useAnimatedStyle(() => ({
    opacity: cursorOpacity.value,
  }));

  // Typing logic
  useEffect(() => {
    if (isComplete) return;

    if (currentLineIndex >= lines.length) {
      setIsComplete(true);
      onComplete?.();
      return;
    }

    const currentLine = lines[currentLineIndex];

    if (currentCharIndex <= currentLine.length) {
      timerRef.current = setTimeout(() => {
        setDisplayedLines((prev) => {
          const updated = [...prev];
          updated[currentLineIndex] = currentLine.slice(0, currentCharIndex);
          return updated;
        });

        if (currentCharIndex < currentLine.length) {
          setCurrentCharIndex((c) => c + 1);
        } else {
          // Line finished — pause then move to next
          timerRef.current = setTimeout(() => {
            setCurrentLineIndex((l) => l + 1);
            setCurrentCharIndex(0);
          }, pauseBetweenLines);
        }
      }, typingSpeed);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentLineIndex, currentCharIndex, lines, isComplete, typingSpeed, pauseBetweenLines, onComplete]);

  return (
    <View style={styles.container}>
      {displayedLines.map((line, index) => (
        <View key={index} style={styles.lineRow}>
          <Text style={[styles.text, textStyle]}>{line}</Text>
          {index === currentLineIndex && !isComplete && (
            <Animated.View style={[styles.cursor, cursorStyle]} />
          )}
        </View>
      ))}
      {/* Show cursor on current line being typed if it hasn't started yet */}
      {currentLineIndex < lines.length &&
        displayedLines.length <= currentLineIndex && (
          <View style={styles.lineRow}>
            <Animated.View style={[styles.cursor, cursorStyle]} />
          </View>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  text: {
    fontFamily: fontFamily.serifSemiBold,
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 32,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  cursor: {
    width: 2,
    height: 26,
    backgroundColor: colors.gold,
    marginLeft: 2,
  },
});
