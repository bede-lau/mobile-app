// Web stub - Stripe native SDK not available on web
// For production web checkout, consider using @stripe/stripe-js instead

type PaymentSheetError = {
  code: string;
  message: string;
};

type InitPaymentSheetResult = {
  error?: PaymentSheetError;
};

type PresentPaymentSheetResult = {
  error?: PaymentSheetError;
};

type InitPaymentSheetParams = {
  paymentIntentClientSecret: string;
  merchantDisplayName: string;
};

interface StripeHook {
  initPaymentSheet: (params: InitPaymentSheetParams) => Promise<InitPaymentSheetResult>;
  presentPaymentSheet: () => Promise<PresentPaymentSheetResult>;
}

export function useStripe(): StripeHook {
  return {
    initPaymentSheet: async () => ({
      error: {
        code: 'WebNotSupported',
        message: 'Stripe checkout is only available on mobile. Please use the iOS or Android app to complete your purchase.',
      },
    }),
    presentPaymentSheet: async () => ({
      error: {
        code: 'WebNotSupported',
        message: 'Stripe checkout is only available on mobile.',
      },
    }),
  };
}

export const isStripeAvailable = false;
