import './globals.css';

import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import { Source_Serif_4 } from 'next/font/google';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import Footer from '@/components/layout/footer';
import Navbar from '@/components/layout/navbar';
import { NavigationProvider } from '@/components/providers/navigation-provider';
import { StyleGlideProvider } from '@/components/providers/styleglide-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';

const sourceSerif4 = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-source-serif',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'optional',   // don't swap — use fallback if font not ready on first paint
  preload: true,
  adjustFontFallback: true, // size-adjust the fallback to match Source Serif 4 metrics
});

const siteTitle = 'Kiran Pingle';
const siteDescription =
  'Portfolio of Kiran Pingle, a full-stack developer building thoughtful products from idea to launch.';


export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: {
    default: siteTitle,
    template: `%s | ${siteTitle}`,
  },
  description: siteDescription,
  keywords: [
    'Next.js',
    'React',
    'TypeScript',
    'TailwindCSS',
    'Portfolio',
    'Full-stack Developer',
    'Web Development',
  ],
  authors: [{ name: 'Kiran Pingle' }],
  creator: 'Kiran Pingle',
  publisher: 'Kiran Pingle',
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon/favicon.ico', sizes: '48x48' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon/favicon.ico' },
    ],
    apple: [{ url: '/favicon/apple-touch-icon.png', sizes: '180x180' }],
    shortcut: [{ url: '/favicon/favicon.ico' }],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'http://localhost:3000',
    siteName: siteTitle,
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: siteTitle,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: ['/og-image.jpg'],
    creator: '@kiranpingle',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`flex min-h-screen flex-col antialiased overflow-x-hidden ${GeistSans.variable} ${sourceSerif4.variable}`}
      >
        {/* Global dot grid background */}
        <div className="bg-dot-grid pointer-events-none fixed inset-0 -z-10" aria-hidden="true" />
        {/* Global spinning conic gradient — centered top */}
        <div
          className="bg-conic-spin pointer-events-none fixed -z-10"
          aria-hidden="true"
          style={{
            top: '-40vh',
            left: '50%',
            width: '140vw',
            height: '140vw',
            transform: 'translateX(-50%)',
            animation: 'hero-spin 30s linear infinite',
            filter: 'blur(60px)',
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <NuqsAdapter>
            <TooltipProvider delayDuration={300}>
              <NavigationProvider>
                <StyleGlideProvider />

                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />

                {/* Fixed bottom blur overlay for premium feel */}
                <div
                  className="pointer-events-none fixed right-0 bottom-0 left-0 z-30 h-10 md:h-16"
                  aria-hidden="true"
                >
                  <div className="from-background/50 h-full w-full bg-gradient-to-top to-transparent backdrop-blur-[2px]" />
                </div>
              </NavigationProvider>
            </TooltipProvider>
          </NuqsAdapter>
        </ThemeProvider>
      </body>
    </html>
  );
}
