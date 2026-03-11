import { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import i18n from '@/lib/i18n';
import { useUserStore } from '@/store/userStore';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import HeightInput from '@/components/HeightInput';
import WelcomeScreen from '@/components/onboarding/WelcomeScreen';
import StepLanguage from '@/components/onboarding/StepLanguage';
import StepName from '@/components/onboarding/StepName';
import StepGender from '@/components/onboarding/StepGender';
import StepAge from '@/components/onboarding/StepAge';
import StepBudget from '@/components/onboarding/StepBudget';
import LoadingScreen from '@/components/onboarding/LoadingScreen';
import ScanWelcome from '@/components/ScanWelcome';
import { colors, typography, spacing, fontFamily, shadows } from '@/constants/theme';
import type { Language } from '@/types';

const TOTAL_STEPS = 8;

const STYLE_OPTIONS = [
  'casual', 'formal', 'streetwear', 'minimalist', 'traditional',
  'sporty', 'vintage', 'bohemian', 'preppy', 'elegant',
] as const;

// Steps that don't need full-height card (content should be vertically centered)
const COMPACT_STEPS = [0, 1, 3, 4];

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, setOnboardingData } = useUserStore();

  const [showWelcome, setShowWelcome] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [step, setStep] = useState(0);

  // Step 0: Language
  const [language, setLanguage] = useState<Language>('en');
  // Step 1: Name
  const [name, setName] = useState('');
  // Step 2: Gender
  const [gender, setGender] = useState('');
  // Step 3: Age
  const [age, setAge] = useState(0);
  // Step 4: Height
  const [height, setHeight] = useState(165);
  // Step 5: Scan (camera deferred)
  // Step 6: Style preferences
  const [styleValues, setStyleValues] = useState<Record<string, number>>(
    Object.fromEntries(STYLE_OPTIONS.map((s) => [s, 0]))
  );
  // Step 7: Budget
  const [budgetLevel, setBudgetLevel] = useState('contemporary');

  const [saving, setSaving] = useState(false);

  const handleLanguageSelect = useCallback((lang: string) => {
    setLanguage(lang as Language);
    i18n.changeLanguage(lang);
  }, []);

  const handleStyleValueChange = useCallback((style: string, value: number) => {
    setStyleValues((prev) => ({ ...prev, [style]: value }));
  }, []);

  const nextStep = useCallback(() => {
    if (step === TOTAL_STEPS - 1) {
      // Last step (budget) → go to loading screen
      setShowLoading(true);
      return;
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }, [step]);

  const prevStep = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const handleComplete = useCallback(async () => {
    setSaving(true);
    const selectedStyles = Object.entries(styleValues)
      .filter(([_, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([k]) => k);

    const data = {
      language,
      style_preferences: selectedStyles,
      height_cm: height,
    };
    setOnboardingData(data);

    if (user?.id) {
      await supabase.from('users').upsert({
        id: user.id,
        email: user.email || '',
        preferred_language: language,
        full_name: name,
        style_preferences: selectedStyles,
        height_cm: height,
        onboarding_completed: true,
      }, { onConflict: 'id' });
    }

    setSaving(false);
    router.replace('/(tabs)/feed');
  }, [language, name, styleValues, height, user, setOnboardingData, router]);

  const canProceed = () => {
    switch (step) {
      case 1: return name.trim().length >= 2;
      case 2: return gender.length > 0;
      case 3: return age >= 13 && age <= 120;
      default: return true;
    }
  };

  // Welcome screen
  if (showWelcome) {
    return <WelcomeScreen onGetStarted={() => setShowWelcome(false)} />;
  }

  // Loading screen (after budget step)
  if (showLoading) {
    return <LoadingScreen onComplete={handleComplete} />;
  }

  const renderStepContent = () => {
    switch (step) {
      case 0: // Language
        return <StepLanguage selected={language} onSelect={handleLanguageSelect} />;

      case 1: // Name
        return <StepName value={name} onChange={setName} onNext={nextStep} />;

      case 2: // Gender
        return <StepGender value={gender} onChange={setGender} onNext={nextStep} />;

      case 3: // Age
        return <StepAge value={age} onChange={setAge} onNext={nextStep} />;

      case 4: // Height
        return (
          <HeightInput value={height} onChange={setHeight} onNext={nextStep} gender={gender} />
        );

      case 5: // Scan Body
        return (
          <View style={{ flex: 1 }}>
            <ScanWelcome onStartScan={nextStep} />
            <Pressable
              style={styles.skipScanLink}
              onPress={nextStep}
            >
              <Text style={styles.skipScanLinkText}>Skip for now →</Text>
            </Pressable>
          </View>
        );

      case 6: // Style Preferences
        return (
          <ScrollView style={styles.styleScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.stepTitle}>{t('onboarding.stylePreferences')}</Text>
            <Text style={styles.stepSubtitle}>{t('onboarding.styleSubtitle')}</Text>
            {STYLE_OPTIONS.map((style) => (
              <ProgressBar
                key={style}
                label={t(`onboarding.styles.${style}`)}
                value={styleValues[style]}
                onValueChange={(v) => handleStyleValueChange(style, v)}
              />
            ))}
            <Button
              title="Enter"
              onPress={nextStep}
              fullWidth
              style={styles.enterButton}
            />
          </ScrollView>
        );

      case 7: // Budget
        return (
          <StepBudget
            value={budgetLevel}
            onChange={setBudgetLevel}
            onNext={nextStep}
          />
        );

      default:
        return null;
    }
  };

  const isCompactStep = COMPACT_STEPS.includes(step);

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${((step + 1) / TOTAL_STEPS) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressLabel}>
          {step + 1} / {TOTAL_STEPS}
        </Text>
      </View>

      {/* Card content */}
      <View style={styles.card}>
        <ScrollView
          contentContainerStyle={[
            styles.cardContent,
            isCompactStep && styles.cardContentCentered,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderStepContent()}
        </ScrollView>
      </View>

      {/* Bottom navigation */}
      <View style={styles.bottomBar}>
        {step > 0 && (
          <Button
            title={t('common.back')}
            onPress={prevStep}
            variant="ghost"
          />
        )}
        <View style={{ flex: 1 }} />
        {/* Only language step (0) uses the generic next button */}
        {step === 0 && (
          <Button
            title={t('common.next')}
            onPress={nextStep}
            disabled={!canProceed()}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
  },

  // Progress
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    backgroundColor: colors.gold,
    borderRadius: 2,
  },
  progressLabel: {
    fontFamily: fontFamily.sansMedium,
    fontWeight: '500',
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Card
  card: {
    flex: 1,
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 16,
    ...shadows.md,
    overflow: 'hidden',
  },
  cardContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  cardContentCentered: {
    justifyContent: 'center',
    flexGrow: 1,
  },

  // Step content
  stepContent: {
    flex: 1,
    alignItems: 'center',
  },
  stepTitle: {
    ...typography.displaySmall,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  stepSubtitle: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },

  // Style step
  styleScroll: {
    flex: 1,
  },
  enterButton: {
    marginTop: spacing.lg,
  },

  // Scan step
  skipScanLink: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  skipScanLinkText: {
    fontFamily: fontFamily.sansMedium,
    fontWeight: '500',
    fontSize: 14,
    color: colors.textSecondary,
  },

  // Bottom bar
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
    marginBottom: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
