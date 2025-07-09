'use server';
import { defaultLocale, Locale } from '@/i18n/config';
import { cookies } from 'next/headers';

const COOKIE_NAME_LOCALE = 'NEXT_LOCALE';
const COOKIE_NAME_COLOR_SCHEME = 'NEXT_COLOR_SCHEME';

export async function getUserLocale() {
  return (await cookies()).get(COOKIE_NAME_LOCALE)?.value || defaultLocale;
}

export async function setUserLocale(locale: Locale) {
  (await cookies()).set(COOKIE_NAME_LOCALE, locale);
}

export async function getUserColorScheme() {
  return (await cookies()).get(COOKIE_NAME_COLOR_SCHEME)?.value || 'light';
}

export async function setUserColorScheme(colorScheme: 'light' | 'dark' | 'auto') {
  (await cookies()).set(COOKIE_NAME_COLOR_SCHEME, colorScheme);
}
