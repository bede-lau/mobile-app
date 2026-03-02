import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useStripe, isStripeAvailable } from '@/hooks/useStripePayment';
import { useCartStore } from '@/store/cartStore';
import { useUserStore } from '@/store/userStore';
import { createPaymentIntent } from '@/lib/stripe';
import { createOrder } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { colors, typography, spacing, radius } from '@/constants/theme';
import { formatMYR } from '@/constants/sizeCharts';
import type { ShippingAddress } from '@/types';

export default function CheckoutScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useUserStore();

  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState<ShippingAddress>({
    full_name: user?.full_name || '',
    phone: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Malaysia',
  });

  const updateAddress = useCallback((field: keyof ShippingAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handlePayment = useCallback(async () => {
    if (!user?.id || items.length === 0) return;

    setLoading(true);
    try {
      const total = getTotal();

      // Create payment intent
      const { clientSecret, paymentIntentId } = await createPaymentIntent(total, user.id);

      // Initialize Stripe payment sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Olvon',
      });

      if (initError) {
        Alert.alert(t('common.error'), initError.message);
        setLoading(false);
        return;
      }

      // Present payment sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code !== 'Canceled') {
          Alert.alert(t('checkout.failed'), presentError.message);
        }
        setLoading(false);
        return;
      }

      // Payment succeeded — create order
      // Group items by store
      const storeIds = [...new Set(items.map((i) => i.store_id))];
      for (const storeId of storeIds) {
        const storeItems = items.filter((i) => i.store_id === storeId);
        const storeTotal = storeItems.reduce(
          (sum, item) => sum + item.unit_price_myr * item.quantity,
          0
        );
        await createOrder({
          userId: user.id,
          storeId,
          items: storeItems,
          totalMyr: storeTotal,
          shippingAddress: address,
          stripePaymentIntentId: paymentIntentId,
        });
      }

      clearCart();
      Alert.alert(t('checkout.success'), t('checkout.successSubtitle'), [
        { text: t('common.done'), onPress: () => router.replace('/(tabs)/feed') },
      ]);
    } catch (error: any) {
      Alert.alert(t('checkout.failed'), error.message);
    } finally {
      setLoading(false);
    }
  }, [user, items, address, getTotal, initPaymentSheet, presentPaymentSheet, clearCart, router, t]);

  const total = getTotal();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{t('checkout.title')}</Text>

        {!isStripeAvailable && (
          <View style={styles.webWarning}>
            <Text style={styles.webWarningText}>
              {t('checkout.webNotSupported', 'Payment is only available on the mobile app. Please download our iOS or Android app to complete your purchase.')}
            </Text>
          </View>
        )}

        {/* Order summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('checkout.orderSummary')}</Text>
          {items.map((item) => (
            <View key={`${item.garment_id}-${item.size}`} style={styles.orderItem}>
              <View style={styles.orderItemInfo}>
                <Text style={styles.orderItemName}>{item.name}</Text>
                <Text style={styles.orderItemDetail}>
                  Size: {item.size} x{item.quantity}
                </Text>
              </View>
              <Text style={styles.orderItemPrice}>
                {formatMYR(item.unit_price_myr * item.quantity)}
              </Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t('cart.total')}</Text>
            <Text style={styles.totalValue}>{formatMYR(total)}</Text>
          </View>
        </View>

        {/* Shipping address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('checkout.shipping')}</Text>
          <Input
            label={t('checkout.fullName')}
            value={address.full_name}
            onChangeText={(v) => updateAddress('full_name', v)}
          />
          <Input
            label={t('checkout.phone')}
            value={address.phone}
            onChangeText={(v) => updateAddress('phone', v)}
            keyboardType="phone-pad"
          />
          <Input
            label={t('checkout.addressLine1')}
            value={address.address_line_1}
            onChangeText={(v) => updateAddress('address_line_1', v)}
          />
          <Input
            label={t('checkout.addressLine2')}
            value={address.address_line_2}
            onChangeText={(v) => updateAddress('address_line_2', v)}
          />
          <Input
            label={t('checkout.city')}
            value={address.city}
            onChangeText={(v) => updateAddress('city', v)}
          />
          <Input
            label={t('checkout.state')}
            value={address.state}
            onChangeText={(v) => updateAddress('state', v)}
          />
          <Input
            label={t('checkout.postalCode')}
            value={address.postal_code}
            onChangeText={(v) => updateAddress('postal_code', v)}
            keyboardType="number-pad"
          />
        </View>
      </ScrollView>

      {/* Pay button */}
      <View style={styles.bottomBar}>
        <Button
          title={`${t('checkout.payNow')} — ${formatMYR(total)}`}
          onPress={handlePayment}
          loading={loading}
          fullWidth
          disabled={!address.full_name || !address.phone || !address.address_line_1}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  title: {
    ...typography.displaySmall,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.labelLarge,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  orderItemDetail: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  orderItemPrice: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    ...typography.headingSmall,
    color: colors.textPrimary,
  },
  totalValue: {
    ...typography.headingSmall,
    color: colors.textPrimary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  webWarning: {
    backgroundColor: colors.accent,
    padding: spacing.md,
    borderRadius: radius.sm,
    marginBottom: spacing.lg,
  },
  webWarningText: {
    ...typography.bodyMedium,
    color: colors.background,
    textAlign: 'center',
  },
});
