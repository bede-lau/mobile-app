import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, layout } from '@/constants/theme';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  // Simple text-based icons (replace with proper icon library later)
  const icons: Record<string, string> = {
    feed: 'F',
    'dressing-room': 'D',
    scanner: 'S',
    profile: 'P',
  };

  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.iconText, focused && styles.iconTextActive]}>
        {icons[name] ?? '?'}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBar,
          height: layout.tabBarHeight + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: t('feed.title'),
          tabBarIcon: ({ focused }) => <TabIcon name="feed" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="dressing-room"
        options={{
          title: t('dressingRoom.title'),
          tabBarIcon: ({ focused }) => <TabIcon name="dressing-room" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: t('scanner.title'),
          tabBarIcon: ({ focused }) => <TabIcon name="scanner" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile.title'),
          tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: layout.tabBarHeight,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabLabel: {
    ...typography.labelSmall,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.tabInactive,
  },
  iconTextActive: {
    color: colors.tabActive,
  },
});
