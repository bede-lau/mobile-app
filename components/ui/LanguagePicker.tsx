import { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius, shadows, MIN_TOUCH_TARGET } from '@/constants/theme';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
];

interface LanguagePickerProps {
  selected?: string;
  onSelect?: (languageCode: string) => void;
}

export default function LanguagePicker({ selected, onSelect }: LanguagePickerProps) {
  const { i18n } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  const activeLanguage = selected || i18n.language;
  const currentLanguage = LANGUAGES.find((l) => l.code === activeLanguage) || LANGUAGES[0];

  const handleSelect = useCallback(
    (language: Language) => {
      i18n.changeLanguage(language.code);
      onSelect?.(language.code);
      setIsVisible(false);
    },
    [i18n, onSelect]
  );

  const renderItem = useCallback(
    ({ item }: { item: Language }) => {
      const isSelected = item.code === activeLanguage;
      return (
        <Pressable
          style={[styles.option, isSelected && styles.optionSelected]}
          onPress={() => handleSelect(item)}
        >
          <View style={styles.optionContent}>
            <Text style={[styles.optionName, isSelected && styles.optionNameSelected]}>
              {item.nativeName}
            </Text>
            <Text style={styles.optionSubtitle}>{item.name}</Text>
          </View>
          {isSelected && (
            <Ionicons name="checkmark" size={20} color={colors.primary} />
          )}
        </Pressable>
      );
    },
    [activeLanguage, handleSelect]
  );

  return (
    <>
      <Pressable
        style={styles.trigger}
        onPress={() => setIsVisible(true)}
      >
        <View style={styles.triggerContent}>
          <Text style={styles.triggerLabel}>Language</Text>
          <Text style={styles.triggerValue}>{currentLanguage.nativeName}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      </Pressable>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setIsVisible(false)}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <Pressable
                onPress={() => setIsVisible(false)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>
            <FlatList
              data={LANGUAGES}
              renderItem={renderItem}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    minHeight: MIN_TOUCH_TARGET,
  },
  triggerContent: {
    flex: 1,
  },
  triggerLabel: {
    ...typography.labelMedium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  triggerValue: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    width: '100%',
    maxWidth: 320,
    maxHeight: '70%',
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.headingSmall,
    color: colors.textPrimary,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    minHeight: MIN_TOUCH_TARGET,
  },
  optionSelected: {
    backgroundColor: colors.backgroundSecondary,
  },
  optionContent: {
    flex: 1,
  },
  optionName: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
  },
  optionNameSelected: {
    fontWeight: '600',
  },
  optionSubtitle: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
});
