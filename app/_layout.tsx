import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import StripeProviderWrapper from '@/components/StripeProviderWrapper';
import AuthProvider from '@/components/AuthProvider';
import '@/lib/i18n';

console.log('[DEBUG] _layout.tsx loading...');

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  console.log('[DEBUG] RootLayout rendering...');

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular: require('@/assets/fonts/PlayfairDisplay-Regular.ttf'),
    PlayfairDisplay_500Medium: require('@/assets/fonts/PlayfairDisplay-Medium.ttf'),
    PlayfairDisplay_600SemiBold: require('@/assets/fonts/PlayfairDisplay-SemiBold.ttf'),
    PlayfairDisplay_700Bold: require('@/assets/fonts/PlayfairDisplay-Bold.ttf'),
    DMSans_400Regular: require('@/assets/fonts/DMSans-Regular.ttf'),
    DMSans_500Medium: require('@/assets/fonts/DMSans-Medium.ttf'),
    DMSans_600SemiBold: require('@/assets/fonts/DMSans-SemiBold.ttf'),
    DMSans_700Bold: require('@/assets/fonts/DMSans-Bold.ttf'),
  });

  useEffect(() => {
    console.log('[DEBUG] fontsLoaded:', fontsLoaded);
    if (fontsLoaded) {
      console.log('[DEBUG] Hiding splash screen...');
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    console.log('[DEBUG] Fonts not loaded yet, returning null');
    return null;
  }

  console.log('[DEBUG] Fonts loaded, rendering app...');

  return (
    <StripeProviderWrapper>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="garment/[id]" options={{ presentation: 'card' }} />
          <Stack.Screen name="store/[id]" options={{ presentation: 'card' }} />
          <Stack.Screen name="cart/index" options={{ presentation: 'modal' }} />
          <Stack.Screen name="checkout/index" options={{ presentation: 'modal' }} />
          <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </StripeProviderWrapper>
  );
}
