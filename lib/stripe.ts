import { supabase } from './supabase';

interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export async function createPaymentIntent(
  amountMyr: number,
  userId: string
): Promise<PaymentIntentResponse> {
  const { data, error } = await supabase.functions.invoke('create-payment-intent', {
    body: {
      amount: Math.round(amountMyr * 100), // Stripe expects cents
      currency: 'myr',
      user_id: userId,
    },
  });

  if (error) throw new Error(error.message || 'Failed to create payment intent');
  return data as PaymentIntentResponse;
}
