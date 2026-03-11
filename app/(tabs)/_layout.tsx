import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Compass, Shirt, ShoppingBag, User } from 'lucide-react-native';
import { colors, typography, spacing, layout } from '@/constants/theme';

type TabIconProps = {
  name: 'feed' | 'dressing-room' | 'cart' | 'profile';
  focused: boolean;
};

function TabIcon({ name, focused }: TabIconProps) {
  const size = 22;
  const color = focused ? colors.tabActive : colors.tabInactive;
  const strokeWidth = focused ? 2 : 1.5;

  const icons = {
    feed: <Compass size={size} color={color} strokeWidth={strokeWidth} />,
    'dressing-room': <Shirt size={size} color={color} strokeWidth={strokeWidth} />,
    cart: <ShoppingBag size={size} color={color} strokeWidth={strokeWidth} />,
    profile: <User size={size} color={color} strokeWidth={strokeWidth} />,
  };

  return (
    <View style={styles.iconContainer}>
      {icons[name]}
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
        lazy: true,
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
        name="cart"
        options={{
          title: t('cart.title'),
          tabBarIcon: ({ focused }) => <TabIcon name="cart" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile.title'),
          tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} />,
        }}
      />
      {/* Hide scanner from tab bar — accessible via Profile > Rescan */}
      <Tabs.Screen
        name="scanner"
        options={{
          href: null,
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
    backgroundColor: colors.surface,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
