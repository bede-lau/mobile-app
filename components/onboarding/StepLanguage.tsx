import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from '@/lib/haptics';
import { colors, spacing, fontFamily, shadows } from '@/constants/theme';
import type { Language } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 16;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - spacing.lg * 2 - CARD_GAP) / 2;

const LANGUAGES: { code: Language; flag: string; native: string; english: string }[] = [
  { code: 'en', flag: '🇬🇧', native: 'English', english: 'English' },
  { code: 'ms', flag: '🇲🇾', native: 'Bahasa Melayu', english: 'Malay' },
  { code: 'zh', flag: '🇨🇳', native: '中文', english: 'Chinese' },
  { code: 'th', flag: '🇹🇭', native: 'ไทย', english: 'Thai' },
  { code: 'vi', flag: '🇻🇳', native: 'Tiếng Việt', english: 'Vietnamese' },
  { code: 'id', flag: '🇮🇩', native: 'Bahasa Indonesia', english: 'Indonesian' },
];

interface StepLanguageProps {
  selected: Language;
  onSelect: (lang: Language) => void;
}

export default function StepLanguage({ selected, onSelect }: StepLanguageProps) {
  const [displayTitle, setDisplayTitle] = useState('');
  const title = 'Choose Your Language';

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

  const handleSelect = (lang: Language) => {
    Haptics.selectionAsync();
    onSelect(lang);
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{displayTitle}</Text>
        <Animated.View style={[styles.cursor, cursorStyle]} />
      </View>

      <View style={styles.grid}>
        {LANGUAGES.map((lang, index) => (
          <Animated.View
            key={lang.code}
            entering={FadeInDown.delay(200 + index * 80).duration(400)}
          >
            <Pressable
              style={[
                styles.card,
                selected === lang.code && styles.cardSelected,
              ]}
              onPress={() => handleSelect(lang.code)}
            >
              <Text style={styles.flag}>{lang.flag}</Text>
              <Text style={styles.nativeName}>{lang.native}</Text>
              <Text style={styles.englishName}>{lang.english}</Text>
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
    justifyContent: 'space-between',
  },
  card: {
    width: CARD_WIDTH,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    gap: spacing.xs,
    ...shadows.sm,
  },
  cardSelected: {
    borderColor: colors.gold,
    backgroundColor: colors.backgroundSecondary,
  },
  flag: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  nativeName: {
    fontFamily: fontFamily.serifMedium,
    fontWeight: '500',
    fontSize: 15,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  englishName: {
    fontFamily: fontFamily.sansRegular,
    fontWeight: '400',
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
