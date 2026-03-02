import { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAvatarStore } from '@/store/avatarStore';
import Avatar3DViewer from './Avatar3DViewer';
import { colors, typography, spacing, radius } from '@/constants/theme';

interface AvatarViewerProps {
  selectedGarmentIds?: string[];
}

export default function AvatarViewer({ selectedGarmentIds = [] }: AvatarViewerProps) {
  const { t } = useTranslation();
  const { avatarUrl, glbUrl, scanStatus } = useAvatarStore();
  const [use3D, setUse3D] = useState(true);

  // No avatar yet - show placeholder
  if (!avatarUrl || scanStatus !== 'completed') {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
          <Ionicons name="body-outline" size={64} color={colors.textTertiary} />
          <Text style={styles.placeholderTitle}>{t('dressingRoom.noAvatar')}</Text>
          <Text style={styles.placeholderSubtitle}>
            {t('dressingRoom.scanToCreate')}
          </Text>
        </View>
      </View>
    );
  }

  // Try 3D rendering if GLB URL is available and 3D mode is enabled
  if (glbUrl && use3D) {
    return (
      <View style={styles.container}>
        <Avatar3DViewer
          glbUrl={glbUrl}
          onLoadError={() => setUse3D(false)}
        />

        {/* Selected garments indicator */}
        {selectedGarmentIds.length > 0 && (
          <View style={styles.garmentIndicator}>
            <Ionicons name="shirt-outline" size={16} color={colors.textInverse} />
            <Text style={styles.garmentCount}>{selectedGarmentIds.length}</Text>
          </View>
        )}
      </View>
    );
  }

  // Fallback to 2D avatar image
  return (
    <View style={styles.container}>
      <Image source={{ uri: avatarUrl }} style={styles.avatarImage} resizeMode="contain" />

      {/* Selected garments indicator */}
      {selectedGarmentIds.length > 0 && (
        <View style={styles.garmentIndicator}>
          <Ionicons name="shirt-outline" size={16} color={colors.textInverse} />
          <Text style={styles.garmentCount}>{selectedGarmentIds.length}</Text>
        </View>
      )}

      {/* 2D Preview badge */}
      <View style={styles.previewBadge}>
        <Text style={styles.previewText}>2D Preview</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  placeholderTitle: {
    ...typography.headingMedium,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  placeholderSubtitle: {
    ...typography.bodyMedium,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  avatarImage: {
    width: '80%',
    height: '90%',
  },
  garmentIndicator: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  garmentCount: {
    ...typography.labelMedium,
    color: colors.textInverse,
  },
  previewBadge: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.xs,
  },
  previewText: {
    ...typography.caption,
    color: colors.textInverse,
  },
});
