import { useState, useCallback, useEffect, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AvatarViewer from '@/components/AvatarViewer';
import {
  NavigationHeader,
  StoreSelector,
  CategorySelector,
  GarmentGrid,
} from '@/components/DressingRoom';
import CurrentOutfit from '@/components/DressingRoom/CurrentOutfit';
import { useDressingRoomStore } from '@/store/dressingRoomStore';
import { colors, spacing } from '@/constants/theme';
import type { Garment } from '@/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const AVATAR_HEIGHT = SCREEN_HEIGHT * 0.58;

export default function DressingRoomScreen() {
  const { currentView, reset } = useDressingRoomStore();
  const [selectedGarments, setSelectedGarments] = useState<Garment[]>([]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  const toggleGarment = useCallback((garment: Garment) => {
    setSelectedGarments((prev) =>
      prev.some((g) => g.id === garment.id)
        ? prev.filter((g) => g.id !== garment.id)
        : [...prev, garment]
    );
  }, []);

  const deselectGarment = useCallback((id: string) => {
    setSelectedGarments((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const selectedGarmentIds = useMemo(
    () => selectedGarments.map((g) => g.id),
    [selectedGarments]
  );

  const renderContent = () => {
    switch (currentView) {
      case 'stores':
        return <StoreSelector />;
      case 'categories':
        return <CategorySelector />;
      case 'garments':
        return (
          <GarmentGrid
            selectedGarmentIds={selectedGarmentIds}
            onToggleGarment={toggleGarment}
          />
        );
      default:
        return <StoreSelector />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Avatar viewer - top 60% */}
      <View style={styles.avatarSection}>
        <AvatarViewer selectedGarments={selectedGarments} onDeselect={deselectGarment} />
      </View>

      {/* Selection panel - scrollable */}
      <ScrollView
        style={styles.selectionSection}
        contentContainerStyle={styles.selectionContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <NavigationHeader />
        {renderContent()}
        <CurrentOutfit garments={selectedGarments} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  avatarSection: {
    height: AVATAR_HEIGHT,
    margin: spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  selectionSection: {
    flex: 1,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  selectionContent: {
    paddingBottom: spacing.xxl,
  },
});
