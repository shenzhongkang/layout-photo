import type { Metadata } from 'next';
import './globals.css';
import '@mantine/core/styles.css';
import { ColorSchemeScript, mantineHtmlProps, MantineProvider } from '@mantine/core';

export const metadata: Metadata = {
  title: 'Layout Photo',
  description: 'Aka Kutter',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' {...mantineHtmlProps}>
      <head>
        <link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
        <link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
        <link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
        <link rel='manifest' href='/site.webmanifest' />
        <ColorSchemeScript />
      </head>
      <body className={`antialiased`}>
        <MantineProvider
          theme={{
            primaryColor: 'indigo',
          }}
        >
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
