import * as WebBrowser from 'expo-web-browser';

import i18n from '@/i18n';
import { SITE_URL } from '@/lib/config';

/** Opens a kegamarket.com page in the in-app browser, in the app's language (fr has no prefix). */
export function openSitePage(path: string) {
  const prefix = i18n.language === 'fr' ? '' : `/${i18n.language}`;
  return WebBrowser.openBrowserAsync(`${SITE_URL}${prefix}${path}`);
}
