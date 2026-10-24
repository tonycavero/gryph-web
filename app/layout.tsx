import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import CookieConsent from '@/components/CookieConsent';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Gryph/ — Caza tus videos y audios favoritos al instante',
  description: 'Descarga videos y audios de YouTube, Facebook, Pinterest, TikTok e Instagram en MP4 y MP3 de alta fidelidad.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={plusJakartaSans.className}>
      <head>
        {/* Adsterra Social Bar (Global Flotante) */}
        <script
          type="text/javascript"
          data-cfasync="false"
          src="https://bellnewyork.org/14/6ec0a437098881e6170791ba9755c920"
          async
        />
      </head>
      <body className="antialiased selection:bg-neutral-900 selection:text-white">
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
