import { Noto_Sans, Rubik } from 'next/font/google';

/** Rakuten Mobile foundation type: Rubik for display and numbers, Noto Sans for text */
const rubik = Rubik({
  subsets: ['latin'],
  weight: ['300', '500', '700'],
  variable: '--font-link-display',
  display: 'swap',
});

const notoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-link-text',
  display: 'swap',
});

/** Put on every element that carries data-project="rakuten-link" */
export const linkFonts = `${rubik.variable} ${notoSans.variable}`;
