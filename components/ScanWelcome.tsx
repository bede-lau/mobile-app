import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Camera, Info } from 'lucide-react-native';
import { colors, spacing, fontFamily } from '@/constants/theme';

interface ScanWelcomeProps {
  onStartScan: () => void;
}

const RING_SIZE = 200;
const RING_BORDER = 3;

const GUIDANCE_ITEMS = [
  'Stand in a well-lit area',
  'Wear fitted clothing for accuracy',
  'Rotate slowly 360° during scan',
];

export default function ScanWelcome({ onStartScan }: ScanWelcomeProps) {
  return (
    <View style={styles.container}>
      {/* Center camera icon with circular ring */}
      <View style={styles.ringOuter}>
        {/* Gold arc — simulated with a bordered View + masking via background */}
        <View style={styles.ringGold} />
        {/* Track ring underneath */}
        <View style={styles.ringTrack} />
        {/* Center content */}
        <View style={styles.iconCenter}>
          <Camera size={40} color={colors.gold} />
          <Text style={styles.readyText}>Ready</Text>
        </View>
      </View>

      {/* Guidance section */}
      <View style={styles.guidance}>
        <Text style={styles.guidanceTitle}>Guidances</Text>
        {GUIDANCE_ITEMS.map((item, index) => (
          <View key={index} style={styles.guidanceRow}>
            <Info size={16} color={colors.textSecondary} />
            <Text style={styles.guidanceText}>{item}</Text>
          </View>
        ))}
      </View>

      {/* Start Scan button */}
      <Pressable style={styles.button} onPress={onStartScan}>
        <Camera size={16} color={colors.textInverse} />
        <Text style={styles.buttonText}>Start Scan</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  ringOuter: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  ringTrack: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: RING_BORDER,
    borderColor: colors.backgroundSecondary,
  },
  ringGold: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: RING_BORDER,
    borderColor: colors.gold,
    borderBottomColor: 'transparent',
    transform: [{ rotate: '45deg' }],
  },
  iconCenter: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  readyText: {
    fontFamily: fontFamily.sansMedium,
    fontWeight: '500',
    fontSize: 16,
    color: colors.textSecondary,
  },
  guidance: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  guidanceTitle: {
    fontFamily: fontFamily.sansSemiBold,
    fontWeight: '600',
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  guidanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  guidanceText: {
    fontFamily: fontFamily.sansRegular,
    fontWeight: '400',
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    width: '100%',
    minHeight: 48,
  },
  buttonText: {
    fontFamily: fontFamily.sansSemiBold,
    fontWeight: '600',
    fontSize: 14,
    color: colors.textInverse,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
