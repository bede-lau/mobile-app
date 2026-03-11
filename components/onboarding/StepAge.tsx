import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import Svg, { Path, Circle, Text as SvgText, Line } from 'react-native-svg';
import * as Haptics from '@/lib/haptics';
import { colors, spacing, fontFamily } from '@/constants/theme';

const RADIUS = 120;
const STROKE_WIDTH = 8;
const KNOB_RADIUS = 14;
const CENTER_X = RADIUS + KNOB_RADIUS + 10;
const CENTER_Y = RADIUS + KNOB_RADIUS + 10;
const SVG_SIZE = (RADIUS + KNOB_RADIUS + 10) * 2;

const MIN_AGE = 16;
const MAX_AGE = 60;
const AGE_RANGE = MAX_AGE - MIN_AGE;

// Arc from 180° (left) to 360° (right) — bottom semicircle
const START_ANGLE = Math.PI; // 180°
const END_ANGLE = Math.PI * 2; // 360°
const ANGLE_RANGE = END_ANGLE - START_ANGLE;

const MAJOR_TICKS = [16, 25, 35, 45, 60];

function polarToCartesian(angle: number): { x: number; y: number } {
  return {
    x: CENTER_X + RADIUS * Math.cos(angle),
    y: CENTER_Y + RADIUS * Math.sin(angle),
  };
}

function ageToAngle(age: number): number {
  const t = (age - MIN_AGE) / AGE_RANGE;
  return START_ANGLE + t * ANGLE_RANGE;
}

function angleToAge(angle: number): number {
  let a = angle;
  // Normalize to START_ANGLE..END_ANGLE
  if (a < START_ANGLE) a = START_ANGLE;
  if (a > END_ANGLE) a = END_ANGLE;
  const t = (a - START_ANGLE) / ANGLE_RANGE;
  return Math.round(MIN_AGE + t * AGE_RANGE);
}

function describeArc(startAngle: number, endAngle: number, r: number): string {
  const start = polarToCartesian(startAngle);
  const end = polarToCartesian(endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

interface StepAgeProps {
  value: number;
  onChange: (age: number) => void;
  onNext: () => void;
}

export default function StepAge({ value, onChange, onNext }: StepAgeProps) {
  const [displayTitle, setDisplayTitle] = useState('');
  const [titleDone, setTitleDone] = useState(false);
  const [displayDescription, setDisplayDescription] = useState('');
  const [descriptionDone, setDescriptionDone] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const title = 'Your age?';
  const description = 'Adjust to your current stage.';
  const lastHapticAge = useRef(value);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDragging = useRef(false);

  const currentAge = value >= MIN_AGE ? value : 25; // Default to 25 if not set

  // Initialize age if not set
  useEffect(() => {
    if (value < MIN_AGE) {
      onChange(25);
    }
  }, []);

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

  // Show continue after idle
  const resetIdleTimer = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    setShowContinue(false);
    idleTimer.current = setTimeout(() => {
      setShowContinue(true);
    }, 800);
  }, []);

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  // SVG layout ref for coordinate conversion
  const svgRef = useRef<View>(null);
  const svgLayout = useRef({ x: 0, y: 0 });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        isDragging.current = true;
        handleTouch(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
      },
      onPanResponderMove: (evt) => {
        handleTouch(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
      },
      onPanResponderRelease: () => {
        isDragging.current = false;
        resetIdleTimer();
      },
    })
  ).current;

  const handleTouch = (touchX: number, touchY: number) => {
    const dx = touchX - CENTER_X;
    const dy = touchY - CENTER_Y;
    let angle = Math.atan2(dy, dx);

    // Normalize to 0..2PI
    if (angle < 0) angle += Math.PI * 2;

    // Clamp to semicircle (180°-360°)
    if (angle < Math.PI * 0.8) angle = Math.PI * 2; // near right side → snap to max
    if (angle > Math.PI * 0.8 && angle < Math.PI) angle = Math.PI; // near left → snap to min

    const newAge = angleToAge(angle);
    if (newAge !== currentAge) {
      onChange(newAge);
      if (Math.abs(newAge - lastHapticAge.current) >= 1) {
        Haptics.selectionAsync();
        lastHapticAge.current = newAge;
      }
    }
  };

  // Arc paths
  const bgArc = describeArc(START_ANGLE, END_ANGLE, RADIUS);
  const activeAngle = ageToAngle(currentAge);
  const activeArc = currentAge > MIN_AGE
    ? describeArc(START_ANGLE, activeAngle, RADIUS)
    : '';

  // Knob position
  const knobPos = polarToCartesian(activeAngle);

  // Tick marks
  const ticks = [];
  for (let age = MIN_AGE; age <= MAX_AGE; age++) {
    const angle = ageToAngle(age);
    const isMajor = MAJOR_TICKS.includes(age);
    const innerR = isMajor ? RADIUS - 16 : RADIUS - 10;
    const outerR = RADIUS;
    const inner = {
      x: CENTER_X + innerR * Math.cos(angle),
      y: CENTER_Y + innerR * Math.sin(angle),
    };
    const outer = {
      x: CENTER_X + outerR * Math.cos(angle),
      y: CENTER_Y + outerR * Math.sin(angle),
    };
    ticks.push({ age, isMajor, inner, outer, angle });
  }

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
          {/* Center display */}
          <View style={styles.ageDisplay}>
            <Text style={styles.ageNumber}>{currentAge}</Text>
            <Text style={styles.ageLabel}>years</Text>
          </View>

          {/* SVG Dial */}
          <View
            ref={svgRef}
            style={styles.dialContainer}
            {...panResponder.panHandlers}
          >
            <Svg width={SVG_SIZE} height={SVG_SIZE / 2 + KNOB_RADIUS + 20}>
              {/* Background arc */}
              <Path
                d={bgArc}
                stroke={colors.border}
                strokeWidth={STROKE_WIDTH}
                fill="none"
                strokeLinecap="round"
              />

              {/* Tick marks */}
              {ticks.filter((_, i) => i % (ticks.length > 30 ? 2 : 1) === 0).map((tick) => (
                <Line
                  key={tick.age}
                  x1={tick.inner.x}
                  y1={tick.inner.y}
                  x2={tick.outer.x}
                  y2={tick.outer.y}
                  stroke={tick.isMajor ? colors.textSecondary : colors.border}
                  strokeWidth={tick.isMajor ? 2 : 1}
                />
              ))}

              {/* Major tick labels */}
              {ticks.filter((t) => t.isMajor).map((tick) => {
                const labelR = RADIUS + 22;
                const lx = CENTER_X + labelR * Math.cos(tick.angle);
                const ly = CENTER_Y + labelR * Math.sin(tick.angle);
                return (
                  <SvgText
                    key={`label-${tick.age}`}
                    x={lx}
                    y={ly}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fontSize={11}
                    fontFamily={fontFamily.sansRegular}
                    fill={colors.textSecondary}
                  >
                    {tick.age}
                  </SvgText>
                );
              })}

              {/* Active arc */}
              {activeArc ? (
                <Path
                  d={activeArc}
                  stroke={colors.primary}
                  strokeWidth={STROKE_WIDTH}
                  fill="none"
                  strokeLinecap="round"
                />
              ) : null}

              {/* Knob */}
              <Circle
                cx={knobPos.x}
                cy={knobPos.y}
                r={KNOB_RADIUS}
                fill="#FFFFFF"
                stroke={colors.primary}
                strokeWidth={3}
              />
            </Svg>
          </View>

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
    marginBottom: spacing.xl,
  },
  contentArea: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
  },
  ageDisplay: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  ageNumber: {
    fontFamily: fontFamily.serifBold,
    fontWeight: '700',
    fontSize: 48,
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  ageLabel: {
    fontFamily: fontFamily.sansRegular,
    fontWeight: '400',
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: -4,
  },
  dialContainer: {
    alignItems: 'center',
    marginTop: spacing.sm,
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
