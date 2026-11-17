import './showcase.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import DrawingInspector from '@/components/drawing/drawing-inspector';
import { THEMES } from '@/components/drawing/drawing-theme';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';

export const metadata: Metadata = {
  title: {
    default: 'Showcase',
    template: '%s | Showcase',
  },
  description:
    'Interactive UI component showcases with live previews, documentation and case studies.',
};

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function ShowcaseRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Extensions like Grammarly add attributes to body before React loads */}
      <body
        suppressHydrationWarning
        className={`${inter.variable} min-h-screen antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          themes={THEMES}
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
          <DrawingInspector />
        </ThemeProvider>
      </body>
    </html>
  );
}
