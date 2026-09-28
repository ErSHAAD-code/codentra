import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';

import { QueryProvider } from '@/components/providers/query-provider';
import { SessionProvider } from '@/components/providers/session-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space', display: 'swap' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const viewport: Viewport = {
  themeColor: '#070810',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // Prevents zoom on input focus for iOS
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Codentra — AI Code Intelligence Platform',
  description:
    'AI-powered code review, security scanning, bug detection, and quality analysis for modern engineering teams. Powered by Claude AI.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  keywords: ['AI code review', 'code security', 'bug detection', 'Claude AI', 'TypeScript', 'automated testing'],
  manifest: '/manifest.json',
  icons: {
    icon: '/lion-icon.svg',
    apple: '/lion-icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Codentra',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'Codentra — AI Code Intelligence Platform',
    description: 'AI-powered code review, security scanning, and quality analysis for modern engineering teams.',
    type: 'website',
    siteName: 'Codentra',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Codentra — AI Code Intelligence Platform',
    description: 'AI-powered code review, security scanning, and quality analysis for modern engineering teams.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Register CSS custom property for border rotation animation */}
        <style>{`@property --angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }`}</style>
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider>
          <SessionProvider>
            <QueryProvider>{children}</QueryProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
