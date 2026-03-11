import { useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Shirt } from 'lucide-react-native';
import { useAvatarStore } from '@/store/avatarStore';
import Avatar3DViewer from './Avatar3DViewer';
import { colors, typography, spacing, radius, shadows } from '@/constants/theme';
import type { Garment } from '@/types';

interface AvatarViewerProps {
  selectedGarments?: Garment[];
  onDeselect?: (id: string) => void;
}

function SelectedGarmentsStrip({
  garments,
  onDeselect,
}: {
  garments: Garment[];
  onDeselect?: (id: string) => void;
}) {
  if (!garments.length) return null;
  return (
    <View style={styles.chipStrip}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {garments.map((g) => (
          <Pressable key={g.id} style={styles.chip} onPress={() => onDeselect?.(g.id)}>
            {g.thumbnail_url ? (
              <Image source={{ uri: g.thumbnail_url }} style={styles.chipImage} />
            ) : (
              <View style={[styles.chipImage, styles.chipPlaceholder]}>
                <Shirt size={14} color={colors.textTertiary} />
              </View>
            )}
            <View style={styles.chipX}>
              <Text style={styles.chipXText}>×</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

export default function AvatarViewer({ selectedGarments = [], onDeselect }: AvatarViewerProps) {
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
        <SelectedGarmentsStrip garments={selectedGarments} onDeselect={onDeselect} />
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
        <SelectedGarmentsStrip garments={selectedGarments} onDeselect={onDeselect} />
      </View>
    );
  }

  // Fallback to 2D avatar image
  return (
    <View style={styles.container}>
      <Image source={{ uri: avatarUrl }} style={styles.avatarImage} resizeMode="contain" />

      {/* 2D Preview badge */}
      <View style={styles.previewBadge}>
        <Text style={styles.previewText}>2D Preview</Text>
      </View>

      <SelectedGarmentsStrip garments={selectedGarments} onDeselect={onDeselect} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  chipStrip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingVertical: spacing.xs,
  },
  chipRow: {
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
    alignItems: 'flex-end',
  },
  chip: {
    width: 40,
    height: 48,
    borderRadius: radius.xs,
    overflow: 'hidden',
    ...shadows.sm,
  },
  chipImage: {
    width: 40,
    height: 36,
    backgroundColor: colors.backgroundSecondary,
  },
  chipPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipX: {
    height: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipXText: {
    color: colors.textInverse,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
  },
});
