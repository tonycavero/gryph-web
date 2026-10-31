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
  title: 'Gryph/ — Descargador Multimedia & Convertidor de Documentos a PowerPoint',
  description: 'Descarga videos y audios de redes sociales y convierte documentos PDF o Word en presentaciones PowerPoint con IA e imágenes temáticas.',
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
      <body className="antialiased selection:bg-neutral-900 selection:text-white">
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
