import { useCallback, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import TypewriterText from '@/components/ui/TypewriterText';
import Button from '@/components/ui/Button';
import { colors, typography, spacing } from '@/constants/theme';

const TYPING_LINES = [
  'Discover your style.',
  'Try before you buy.',
  'Your wardrobe, reimagined.',
];

const SEEN_KEY = '@olvon:seenGetStarted';

export default function GetStartedScreen() {
  const router = useRouter();
  const [showBrand, setShowBrand] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const handleTypingComplete = useCallback(() => {
    // After typing finishes, delay 1.2s then show brand
    setTimeout(() => {
      setShowBrand(true);
      // Then show button after brand fades in
      setTimeout(() => {
        setShowButton(true);
      }, 600);
    }, 1200);
  }, []);

  const handleGetStarted = useCallback(async () => {
    await AsyncStorage.setItem(SEEN_KEY, 'true');
    router.replace('/(auth)/login');
  }, [router]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TypewriterText
          lines={TYPING_LINES}
          typingSpeed={45}
          pauseBetweenLines={600}
          onComplete={handleTypingComplete}
        />

        {showBrand && (
          <Animated.Text
            entering={FadeIn.duration(800)}
            style={styles.brand}
          >
            OLVON
          </Animated.Text>
        )}
      </View>

      {showButton && (
        <Animated.View
          entering={FadeInDown.duration(600).delay(200)}
          style={styles.buttonContainer}
        >
          <Button
            title="GET STARTED"
            onPress={handleGetStarted}
            variant="outline"
            fullWidth
            style={styles.button}
            textStyle={styles.buttonText}
          />
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
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  brand: {
    ...typography.displayLarge,
    color: colors.primary,
    letterSpacing: 4,
    marginTop: spacing.xxl,
  },
  buttonContainer: {
    paddingBottom: spacing.xxl,
  },
  button: {
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: 'rgba(26, 26, 26, 0.25)',
    minHeight: 56,
  },
  buttonText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
