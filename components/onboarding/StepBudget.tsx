import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, PanResponder } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import Svg, { Circle as SvgCircle, Line, Text as SvgText } from 'react-native-svg';
import * as Haptics from '@/lib/haptics';
import { colors, spacing, fontFamily } from '@/constants/theme';

const BUDGET_LEVELS = [
  { level: 'accessible', label: 'Accessible', amount: 'RM 80–150' },
  { level: 'contemporary', label: 'Contemporary', amount: 'RM 150–300' },
  { level: 'premium', label: 'Premium', amount: 'RM 300–700' },
  { level: 'luxury', label: 'Luxury', amount: 'RM 700+' },
];

const FEEDBACK_PHRASES = ['Understood.', 'Perfect.', 'Noted.', 'Excellent.'];

// Dial geometry — increased CENTER padding for label room
const RADIUS = 110;
const STROKE_WIDTH = 12;
const KNOB_RADIUS = 16;
const CENTER = RADIUS + KNOB_RADIUS + 40;
const SVG_SIZE = CENTER * 2;

// Level angles: 0°=top, 90°=right, 180°=bottom, 270°=left
const LEVEL_ANGLES = [
  -Math.PI / 2,       // 0° (top) — Accessible
  0,                   // 90° (right) — Contemporary
  Math.PI / 2,        // 180° (bottom) — Premium
  Math.PI,            // 270° (left) — Luxury
];

function angleToPoint(angle: number, r: number = RADIUS) {
  return {
    x: CENTER + r * Math.cos(angle),
    y: CENTER + r * Math.sin(angle),
  };
}

function nearestLevel(angle: number): number {
  // Normalize angle to -PI..PI
  let a = angle;
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;

  let minDist = Infinity;
  let nearest = 0;
  LEVEL_ANGLES.forEach((la, i) => {
    let diff = Math.abs(a - la);
    if (diff > Math.PI) diff = Math.PI * 2 - diff;
    if (diff < minDist) {
      minDist = diff;
      nearest = i;
    }
  });
  return nearest;
}

interface StepBudgetProps {
  value: string;
  onChange: (level: string) => void;
  onNext: () => void;
}

export default function StepBudget({ value, onChange, onNext }: StepBudgetProps) {
  const [displayTitle, setDisplayTitle] = useState('');
  const [titleDone, setTitleDone] = useState(false);
  const [displayDescription, setDisplayDescription] = useState('');
  const [descriptionDone, setDescriptionDone] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showContinue, setShowContinue] = useState(false);
  const title = 'Your investment comfort?';
  const descriptionText = 'Rotate to adjust.';
  const selectedIndex = BUDGET_LEVELS.findIndex(b => b.level === value);
  const currentIndex = selectedIndex >= 0 ? selectedIndex : 1;
  const selected = BUDGET_LEVELS[currentIndex];
  const continueTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Typewriter title
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
      if (i <= descriptionText.length) {
        setDisplayDescription(descriptionText.slice(0, i));
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

  // Typed feedback
  useEffect(() => {
    if (!value) return;
    const phrase = FEEDBACK_PHRASES[currentIndex] || 'Noted.';
    let i = 0;
    setFeedback('');
    const interval = setInterval(() => {
      if (i <= phrase.length) {
        setFeedback(phrase.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [value]);

  // Show continue after snap
  useEffect(() => {
    if (continueTimer.current) clearTimeout(continueTimer.current);
    setShowContinue(false);
    continueTimer.current = setTimeout(() => {
      setShowContinue(true);
    }, 1500);
    return () => {
      if (continueTimer.current) clearTimeout(continueTimer.current);
    };
  }, [value]);

  // Knob angle state
  const [knobAngle, setKnobAngle] = useState(LEVEL_ANGLES[currentIndex]);

  // Refs to avoid stale closures in PanResponder
  const valueRef = useRef(value);
  const knobAngleRef = useRef(LEVEL_ANGLES[currentIndex]);

  useEffect(() => { valueRef.current = value; }, [value]);
  useEffect(() => { knobAngleRef.current = knobAngle; }, [knobAngle]);

  // PanResponder for rotation — reads from refs to avoid stale closures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        handleDialTouch(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
      },
      onPanResponderMove: (evt) => {
        handleDialTouch(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
      },
      onPanResponderRelease: () => {
        // Snap to nearest level using ref to avoid stale closure
        const nearest = nearestLevel(knobAngleRef.current);
        const snapAngle = LEVEL_ANGLES[nearest];
        setKnobAngle(snapAngle);
        const newLevel = BUDGET_LEVELS[nearest].level;
        if (newLevel !== valueRef.current) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onChange(newLevel);
        }
      },
    })
  ).current;

  const handleDialTouch = (touchX: number, touchY: number) => {
    const dx = touchX - CENTER;
    const dy = touchY - CENTER;
    const angle = Math.atan2(dy, dx);
    setKnobAngle(angle);

    // Live snap feedback
    const nearest = nearestLevel(angle);
    const newLevel = BUDGET_LEVELS[nearest].level;
    if (newLevel !== valueRef.current) {
      Haptics.selectionAsync();
      onChange(newLevel);
    }
  };

  const knobPos = angleToPoint(knobAngle);

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
        <Animated.View entering={FadeIn.duration(500)} style={styles.contentArea}>
          {/* Dial */}
          <View style={styles.dialWrapper} {...panResponder.panHandlers}>
            <Svg width={SVG_SIZE} height={SVG_SIZE}>
              {/* Ring */}
              <SvgCircle
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                stroke={colors.border}
                strokeWidth={STROKE_WIDTH}
                fill="none"
              />

              {/* Level markers and labels */}
              {BUDGET_LEVELS.map((budget, i) => {
                const dotPos = angleToPoint(LEVEL_ANGLES[i]);
                const labelPos = angleToPoint(LEVEL_ANGLES[i], RADIUS + 28);
                const isActive = currentIndex === i;
                return (
                  <Svg key={budget.level}>
                    <SvgCircle
                      cx={dotPos.x}
                      cy={dotPos.y}
                      r={isActive ? 6 : 4}
                      fill={isActive ? colors.primary : colors.textSecondary}
                    />
                    <SvgText
                      x={labelPos.x}
                      y={labelPos.y}
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      fontSize={11}
                      fontFamily={fontFamily.sansMedium}
                      fill={isActive ? colors.primary : colors.textSecondary}
                      fontWeight={isActive ? '600' : '400'}
                    >
                      {budget.label}
                    </SvgText>
                  </Svg>
                );
              })}

              {/* Knob */}
              <SvgCircle
                cx={knobPos.x}
                cy={knobPos.y}
                r={KNOB_RADIUS}
                fill="#FFFFFF"
                stroke={colors.primary}
                strokeWidth={3}
              />
            </Svg>

            {/* Center display */}
            <View style={styles.centerDisplay}>
              <Text style={styles.amountText}>{selected.amount}</Text>
              <Text style={styles.levelName}>{selected.label}</Text>
            </View>
          </View>

          {feedback.length > 0 && (
            <Text style={styles.feedback}>{feedback}</Text>
          )}

          {showContinue && (
            <Animated.View entering={FadeIn.duration(400)} style={styles.continueRow}>
              <Text style={styles.continueButton} onPress={onNext}>
                Continue
              </Text>
            </Animated.View>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
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
  description: {
    fontFamily: fontFamily.sansRegular,
    fontWeight: '400',
    fontSize: 14,
    color: colors.textSecondary,
  },
  descriptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  contentArea: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
  },
  dialWrapper: {
    width: SVG_SIZE,
    height: SVG_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  centerDisplay: {
    position: 'absolute',
    alignItems: 'center',
  },
  amountText: {
    fontFamily: fontFamily.serifBold,
    fontWeight: '700',
    fontSize: 28,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  levelName: {
    fontFamily: fontFamily.sansMedium,
    fontWeight: '500',
    fontSize: 13,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.xs,
  },
  feedback: {
    fontFamily: fontFamily.serifRegular,
    fontWeight: '400',
    fontSize: 18,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.md,
  },
  continueRow: {
    marginTop: spacing.lg,
  },
  continueButton: {
    fontFamily: fontFamily.sansMedium,
    fontWeight: '500',
    fontSize: 14,
    color: colors.textInverse,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 6,
    overflow: 'hidden',
  },
});
