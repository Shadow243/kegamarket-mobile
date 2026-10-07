import { initPaymentSheet, initStripe, presentPaymentSheet } from '@stripe/stripe-react-native';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

/** Where 3-D Secure and hosted checkouts send the buyer back (Expo Go needs its own URL form). */
function appReturnUrl(path = '') {
  return Constants.appOwnership === 'expo'
    ? Linking.createURL(`/--/${path}`)
    : Linking.createURL(path);
}

/** Native card form; resolves false when the buyer closes the sheet without paying. */
export async function payWithPaymentSheet({
  clientSecret,
  publishableKey,
  billingName,
}: {
  clientSecret: string;
  publishableKey: string;
  billingName?: string;
}): Promise<boolean> {
  await initStripe({ publishableKey, urlScheme: appReturnUrl() });

  const init = await initPaymentSheet({
    merchantDisplayName: 'Kega',
    paymentIntentClientSecret: clientSecret,
    returnURL: appReturnUrl('stripe-redirect'),
    defaultBillingDetails: billingName ? { name: billingName } : undefined,
  });
  if (init.error) throw new Error(init.error.localizedMessage ?? init.error.message);

  const { error } = await presentPaymentSheet();
  if (!error) return true;
  if (error.code === 'Canceled') return false;
  throw new Error(error.localizedMessage ?? error.message);
}

/** PayPal's page in a secure sheet that closes itself once the API bounces back to `kega://payment-return`. */
export async function openHostedCheckout(url: string): Promise<void> {
  await WebBrowser.openAuthSessionAsync(url, 'kega://payment-return', {
    preferEphemeralSession: false,
  });
}
