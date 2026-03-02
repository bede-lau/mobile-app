import { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import i18n from '@/lib/i18n';
import { useUserStore } from '@/store/userStore';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import LanguagePicker from '@/components/ui/LanguagePicker';
import HeightInput from '@/components/HeightInput';
import { colors, typography, spacing } from '@/constants/theme';
import type { Language } from '@/types';

const STYLE_OPTIONS = [
  'casual', 'formal', 'streetwear', 'minimalist', 'traditional',
  'sporty', 'vintage', 'bohemian', 'preppy', 'elegant',
] as const;

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, setOnboardingData } = useUserStore();

  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState<Language>('en');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [height, setHeight] = useState(165);
  const [saving, setSaving] = useState(false);

  const handleLanguageSelect = useCallback((lang: Language) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  }, []);

  const toggleStyle = useCallback((style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  }, []);

  const handleComplete = useCallback(async () => {
    setSaving(true);
    const data = {
      language,
      style_preferences: selectedStyles,
      height_cm: height,
    };
    setOnboardingData(data);

    // Persist to Supabase
    if (user?.id) {
      await supabase.from('users').update({
        preferred_language: language,
        style_preferences: selectedStyles,
        height_cm: height,
        onboarding_completed: true,
      }).eq('id', user.id);
    }

    setSaving(false);
    router.replace('/(tabs)/feed');
  }, [language, selectedStyles, height, user, setOnboardingData, router]);

  const canProceed = () => {
    if (step === 1) return selectedStyles.length > 0;
    return true;
  };

  return (
    <View style={styles.container}>
      {/* Progress dots */}
      <View style={styles.progress}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[styles.dot, i === step && styles.dotActive, i < step && styles.dotCompleted]}
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {step === 0 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{t('onboarding.chooseLanguage')}</Text>
            <LanguagePicker selected={language} onSelect={handleLanguageSelect} />
          </View>
        )}

        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{t('onboarding.stylePreferences')}</Text>
            <Text style={styles.stepSubtitle}>{t('onboarding.styleSubtitle')}</Text>
            <View style={styles.styleGrid}>
              {STYLE_OPTIONS.map((style) => {
                const isSelected = selectedStyles.includes(style);
                return (
                  <Pressable
                    key={style}
                    style={[styles.styleChip, isSelected && styles.styleChipSelected]}
                    onPress={() => toggleStyle(style)}
                  >
                    <Text style={[styles.styleChipText, isSelected && styles.styleChipTextSelected]}>
                      {t(`onboarding.styles.${style}`)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{t('onboarding.heightInput')}</Text>
            <Text style={styles.stepSubtitle}>{t('onboarding.heightSubtitle')}</Text>
            <HeightInput value={height} onChange={setHeight} />
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{t('onboarding.ready')}</Text>
            <Text style={styles.stepSubtitle}>{t('onboarding.readySubtitle')}</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom navigation */}
      <View style={styles.bottomBar}>
        {step > 0 && (
          <Button
            title={t('common.back')}
            onPress={() => setStep((s) => s - 1)}
            variant="ghost"
          />
        )}
        <View style={{ flex: 1 }} />
        {step < 3 ? (
          <Button
            title={t('common.next')}
            onPress={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
          />
        ) : (
          <Button
            title={t('onboarding.getStarted')}
            onPress={handleComplete}
            loading={saving}
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
  progress: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  dotCompleted: {
    backgroundColor: colors.primaryMuted,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
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
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  styleChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  styleChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  styleChipText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  styleChipTextSelected: {
    color: colors.textInverse,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
