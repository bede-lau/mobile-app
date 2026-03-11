const fs = require('fs');
const path = require('path');
const base = 'c:\\Users\\bedel\\OneDrive\\Desktop\\Olvon\\mobile-app';
const files = [
  'lib/stripe.ts',
  'hooks/useStripePayment.native.ts',
  'hooks/useStripePayment.web.ts',
  'components/StripeProviderWrapper.web.tsx',
  'components/StripeProviderWrapper.native.tsx',
  'backend/supabase/functions/create-payment-intent',
  'rm_stripe.js'
];

files.forEach(f => {
  try {
    const fullPath = path.join(base, f);
    fs.rmSync(fullPath, { recursive: true, force: true });
    console.log('Deleted ' + fullPath);
  } catch(e) {
    console.error(e.message);
  }
});
