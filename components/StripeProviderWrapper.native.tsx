// Native implementation - uses real Stripe Provider
import { ReactNode } from 'react';

const STRIPE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
console.log('[DEBUG] StripeProviderWrapper: Key:', STRIPE_KEY ? 'present' : 'MISSING');

interface Props {
  children: ReactNode;
}

export default function StripeProviderWrapper({ children }: Props) {
  console.log('[DEBUG] StripeProviderWrapper: Rendering...');

  // Temporarily disable Stripe to test if it's the issue
  // TODO: Re-enable once basic app loading works
  return <>{children}</>;

  /*
  // Original Stripe implementation - uncomment when ready
  const { StripeProvider } = require('@stripe/stripe-react-native');
  return (
    <StripeProvider publishableKey={STRIPE_KEY!} merchantIdentifier="merchant.com.olvon">
      {children}
    </StripeProvider>
  );
  */
}
