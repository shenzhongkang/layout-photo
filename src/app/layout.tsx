import type { Metadata } from 'next';
import './globals.css';
import '@mantine/core/styles.css';
import {
  ColorSchemeScript,
  DirectionProvider,
  MantineColorScheme,
  mantineHtmlProps,
  MantineProvider,
} from '@mantine/core';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale } from 'next-intl/server';
import { getUserColorScheme } from './api/locale';

export const metadata: Metadata = {
  title: 'Layout Photo',
  description: 'Aka Kutter',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const colorScheme = await getUserColorScheme();

  return (
    <html lang={locale} {...mantineHtmlProps} dir='ltr'>
      <head>
        <link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
        <link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
        <link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
        <link rel='manifest' href='/site.webmanifest' />
        <ColorSchemeScript />
      </head>
      <body className={`antialiased`}>
        <NextIntlClientProvider locale={locale}>
          <DirectionProvider>
            <MantineProvider
              theme={{
                primaryColor: 'indigo',
              }}
              defaultColorScheme={colorScheme as MantineColorScheme}
            >
              {children}
            </MantineProvider>
          </DirectionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
