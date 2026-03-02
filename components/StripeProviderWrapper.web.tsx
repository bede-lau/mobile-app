// Web stub - Stripe native SDK not available on web
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function StripeProviderWrapper({ children }: Props) {
  // On web, just render children without the native Stripe provider
  return <>{children}</>;
}
