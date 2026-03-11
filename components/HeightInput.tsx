import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, PanResponder, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import Svg, { Path, Line, Text as SvgText, Ellipse, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import * as Haptics from '@/lib/haptics';
import { colors, spacing, fontFamily } from '@/constants/theme';

const MIN_HEIGHT = 150;
const MAX_HEIGHT = 200;
const HEIGHT_RANGE = MAX_HEIGHT - MIN_HEIGHT;

const RULER_HEIGHT = 300;
const RULER_WIDTH = 60;
const KNOB_SIZE = 28;

const SILHOUETTE_WIDTH = 80;
const SILHOUETTE_MAX_HEIGHT = 260;
const SILHOUETTE_MIN_HEIGHT = 180;

interface HeightInputProps {
  value: number;
  onChange: (value: number) => void;
  onNext?: () => void;
  min?: number;
  max?: number;
  gender?: string;
}

function heightToY(height: number): number {
  const t = (height - MIN_HEIGHT) / HEIGHT_RANGE;
  // Inverted: taller = higher on ruler = lower Y value
  return RULER_HEIGHT - t * RULER_HEIGHT;
}

function yToHeight(y: number): number {
  const t = 1 - y / RULER_HEIGHT;
  return Math.round(Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, MIN_HEIGHT + t * HEIGHT_RANGE)));
}

export default function HeightInput({
  value,
  onChange,
  onNext,
  min = 150,
  max = 200,
  gender = 'female',
}: HeightInputProps) {
  const [unit, setUnit] = useState<'cm' | 'ft'>('cm');
  const [displayTitle, setDisplayTitle] = useState('');
  const [titleDone, setTitleDone] = useState(false);
  const [displayDescription, setDisplayDescription] = useState('');
  const [descriptionDone, setDescriptionDone] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const title = 'Your height?';
  const description = 'Adjust to your measurement.';
  const lastHapticVal = useRef(value);

  // Silhouette height animation
  const silhouetteScale = useSharedValue(1);

  useEffect(() => {
    const t = (value - MIN_HEIGHT) / HEIGHT_RANGE;
    const targetHeight = SILHOUETTE_MIN_HEIGHT + t * (SILHOUETTE_MAX_HEIGHT - SILHOUETTE_MIN_HEIGHT);
    const scale = targetHeight / SILHOUETTE_MAX_HEIGHT;
    silhouetteScale.value = withSpring(scale, { damping: 15, stiffness: 150 });
  }, [value]);

  const scaleFactor = value / 170;
  const silhouetteStyle = useAnimatedStyle(() => ({
    transform: [
      { scaleY: silhouetteScale.value },
      { scaleX: 0.96 + (silhouetteScale.value - 1) * 0.25 },
    ],
  }));

  const shadowScale = 0.6 + (scaleFactor - 0.88) * 0.8;

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

  // Ruler PanResponder
  const rulerRef = useRef<View>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        handleRulerTouch(evt.nativeEvent.locationY);
      },
      onPanResponderMove: (evt) => {
        handleRulerTouch(evt.nativeEvent.locationY);
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  const handleRulerTouch = (touchY: number) => {
    // Offset for padding at top
    const y = touchY - 20;
    const newHeight = yToHeight(y);
    if (newHeight !== value) {
      onChange(newHeight);
      if (Math.abs(newHeight - lastHapticVal.current) >= 1) {
        Haptics.selectionAsync();
        lastHapticVal.current = newHeight;
      }
    }
  };

  // Unit conversion
  const totalInches = value / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  const displayValue = unit === 'cm' ? `${value}` : `${feet}'${inches}"`;

  // Ruler ticks
  const ticks = [];
  for (let h = MIN_HEIGHT; h <= MAX_HEIGHT; h++) {
    const y = heightToY(h);
    const isMajor = h % 10 === 0;
    const isMid = h % 5 === 0;
    ticks.push({ h, y, isMajor, isMid });
  }

  // Knob Y position
  const knobY = heightToY(value);

  const isMasculine = gender === 'male' || gender === 'masculine';

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
          {/* Height display */}
          <View style={styles.valueRow}>
            <Text style={styles.valueText}>{displayValue}</Text>
            <Pressable
              style={styles.unitToggle}
              onPress={() => setUnit(unit === 'cm' ? 'ft' : 'cm')}
            >
              <Text style={styles.unitText}>{unit === 'cm' ? 'cm' : 'ft'}</Text>
            </Pressable>
          </View>

          {/* Main content: silhouette + ruler */}
          <View style={styles.contentRow}>
            {/* Silhouette */}
            <View style={styles.silhouetteContainer}>
              <Animated.View style={[styles.silhouetteInner, silhouetteStyle]}>
                <Svg width={SILHOUETTE_WIDTH} height={SILHOUETTE_MAX_HEIGHT} viewBox="0 0 70 220">
                  <Defs>
                    <LinearGradient id="silGrad" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0" stopColor="#C8C3BB" />
                      <Stop offset="1" stopColor="#A8A39B" />
                    </LinearGradient>
                    <LinearGradient id="silGradLight" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0" stopColor="#D5D0C8" />
                      <Stop offset="0.5" stopColor="#C8C3BB" />
                      <Stop offset="1" stopColor="#B8B3AB" />
                    </LinearGradient>
                  </Defs>

                  {isMasculine ? (
                    <>
                      {/* Head */}
                      <Ellipse cx="35" cy="18" rx="10" ry="12" fill="url(#silGrad)" />
                      {/* Neck */}
                      <Rect x="31" y="29" width="8" height="10" fill="url(#silGrad)" rx="2" />
                      {/* Shoulders to chest — wider */}
                      <Path d="M31 39 L16 48 L16 80 L54 80 L54 48 L39 39 Z" fill="url(#silGradLight)" />
                      {/* Waist to hips — straighter */}
                      <Path d="M16 80 L18 130 L52 130 L54 80 Z" fill="url(#silGrad)" />
                      {/* Left arm */}
                      <Path d="M16 48 L8 52 L6 100 L12 100 L16 80 Z" fill="url(#silGradLight)" />
                      {/* Right arm */}
                      <Path d="M54 48 L62 52 L64 100 L58 100 L54 80 Z" fill="url(#silGradLight)" />
                      {/* Left leg */}
                      <Path d="M18 130 L20 195 L30 195 L34 130 Z" fill="url(#silGrad)" />
                      {/* Right leg */}
                      <Path d="M36 130 L40 195 L50 195 L52 130 Z" fill="url(#silGrad)" />
                      {/* Left foot */}
                      <Path d="M18 195 L16 205 L32 205 L30 195 Z" fill="url(#silGradLight)" />
                      {/* Right foot */}
                      <Path d="M40 195 L38 205 L54 205 L52 195 Z" fill="url(#silGradLight)" />
                    </>
                  ) : (
                    <>
                      {/* Head */}
                      <Ellipse cx="35" cy="18" rx="9" ry="12" fill="url(#silGrad)" />
                      {/* Neck */}
                      <Rect x="32" y="29" width="6" height="10" fill="url(#silGrad)" rx="2" />
                      {/* Shoulders to chest — narrower */}
                      <Path d="M32 39 L20 48 L18 75 L52 75 L50 48 L38 39 Z" fill="url(#silGradLight)" />
                      {/* Waist to hips — curved */}
                      <Path d="M18 75 L22 95 L17 130 L53 130 L48 95 L52 75 Z" fill="url(#silGrad)" />
                      {/* Left arm */}
                      <Path d="M20 48 L12 52 L10 100 L16 100 L18 75 Z" fill="url(#silGradLight)" />
                      {/* Right arm */}
                      <Path d="M50 48 L58 52 L60 100 L54 100 L52 75 Z" fill="url(#silGradLight)" />
                      {/* Left leg */}
                      <Path d="M17 130 L20 195 L30 195 L34 130 Z" fill="url(#silGrad)" />
                      {/* Right leg */}
                      <Path d="M36 130 L40 195 L50 195 L53 130 Z" fill="url(#silGrad)" />
                      {/* Left foot */}
                      <Path d="M18 195 L16 205 L32 205 L30 195 Z" fill="url(#silGradLight)" />
                      {/* Right foot */}
                      <Path d="M40 195 L38 205 L54 205 L52 195 Z" fill="url(#silGradLight)" />
                    </>
                  )}
                </Svg>
              </Animated.View>
              {/* Shadow */}
              <Svg width={SILHOUETTE_WIDTH} height={20} style={styles.shadow}>
                <Ellipse
                  cx={SILHOUETTE_WIDTH / 2}
                  cy={10}
                  rx={30 * Math.max(0.5, Math.min(1.2, shadowScale))}
                  ry={6 * Math.max(0.5, Math.min(1.2, shadowScale))}
                  fill={colors.border}
                  opacity={0.4}
                />
              </Svg>
            </View>

            {/* Ruler */}
            <View style={styles.rulerWrapper} ref={rulerRef} {...panResponder.panHandlers}>
              <Svg width={RULER_WIDTH + 40} height={RULER_HEIGHT + 40} viewBox={`0 0 ${RULER_WIDTH + 40} ${RULER_HEIGHT + 40}`}>
                {/* Ruler line */}
                <Line
                  x1={RULER_WIDTH}
                  y1={20}
                  x2={RULER_WIDTH}
                  y2={RULER_HEIGHT + 20}
                  stroke={colors.border}
                  strokeWidth={2}
                />

                {/* Ticks */}
                {ticks.filter((t) => t.isMajor || t.isMid).map((tick) => {
                  const tickLen = tick.isMajor ? 20 : 12;
                  return (
                    <Line
                      key={tick.h}
                      x1={RULER_WIDTH - tickLen}
                      y1={tick.y + 20}
                      x2={RULER_WIDTH}
                      y2={tick.y + 20}
                      stroke={tick.isMajor ? colors.textSecondary : colors.border}
                      strokeWidth={tick.isMajor ? 1.5 : 1}
                    />
                  );
                })}

                {/* Major tick labels */}
                {ticks.filter((t) => t.isMajor).map((tick) => (
                  <SvgText
                    key={`label-${tick.h}`}
                    x={RULER_WIDTH - 26}
                    y={tick.y + 20 + 4}
                    textAnchor="end"
                    fontSize={11}
                    fontFamily={fontFamily.sansRegular}
                    fill={colors.textSecondary}
                  >
                    {tick.h}
                  </SvgText>
                ))}

                {/* Knob */}
                <Rect
                  x={RULER_WIDTH - 8}
                  y={knobY + 20 - KNOB_SIZE / 2}
                  width={16}
                  height={KNOB_SIZE}
                  rx={4}
                  fill="#FFFFFF"
                  stroke={colors.primary}
                  strokeWidth={2.5}
                />
                {/* Knob grip lines */}
                <Line
                  x1={RULER_WIDTH - 3}
                  y1={knobY + 20 - 4}
                  x2={RULER_WIDTH + 3}
                  y2={knobY + 20 - 4}
                  stroke={colors.textSecondary}
                  strokeWidth={1}
                />
                <Line
                  x1={RULER_WIDTH - 3}
                  y1={knobY + 20}
                  x2={RULER_WIDTH + 3}
                  y2={knobY + 20}
                  stroke={colors.textSecondary}
                  strokeWidth={1}
                />
                <Line
                  x1={RULER_WIDTH - 3}
                  y1={knobY + 20 + 4}
                  x2={RULER_WIDTH + 3}
                  y2={knobY + 20 + 4}
                  stroke={colors.textSecondary}
                  strokeWidth={1}
                />
              </Svg>
            </View>
          </View>

          {onNext && (
            <Pressable style={styles.continueButton} onPress={onNext}>
              <Text style={styles.continueText}>Continue</Text>
            </Pressable>
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
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  valueText: {
    fontFamily: fontFamily.sansRegular,
    fontWeight: '300',
    fontSize: 42,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  unitToggle: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unitText: {
    fontFamily: fontFamily.sansMedium,
    fontWeight: '500',
    fontSize: 14,
    color: colors.textSecondary,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.lg,
  },
  silhouetteContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  silhouetteInner: {
    transformOrigin: 'bottom',
  },
  shadow: {
    marginTop: -4,
  },
  rulerWrapper: {
    width: RULER_WIDTH + 40,
    height: RULER_HEIGHT + 40,
  },
  continueButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: 6,
    marginTop: spacing.lg,
    alignSelf: 'center',
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
