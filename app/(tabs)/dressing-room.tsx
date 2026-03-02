import { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AvatarViewer from '@/components/AvatarViewer';
import {
  NavigationHeader,
  StoreSelector,
  CategorySelector,
  GarmentGrid,
} from '@/components/DressingRoom';
import { useDressingRoomStore } from '@/store/dressingRoomStore';
import { colors } from '@/constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const AVATAR_HEIGHT = SCREEN_HEIGHT * 0.6; // 60% for avatar

export default function DressingRoomScreen() {
  const { currentView, reset } = useDressingRoomStore();
  const [selectedGarmentIds, setSelectedGarmentIds] = useState<string[]>([]);

  // Reset navigation state when screen unmounts
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  const toggleGarment = useCallback((id: string) => {
    setSelectedGarmentIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }, []);

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
        <AvatarViewer selectedGarmentIds={selectedGarmentIds} />
      </View>

      {/* Selection panel - bottom 40% */}
      <View style={styles.selectionSection}>
        <NavigationHeader />
        {renderContent()}
      </View>
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
  },
  selectionSection: {
    flex: 1,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
