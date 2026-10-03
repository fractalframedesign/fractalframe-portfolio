'use client';

import Link from 'next/link';

import { CONTACT_EMAIL } from '@/lib/constants';

const Footer = () => {
  return (
    <footer className="border-border/60 mt-12 border-t pt-8 pb-6 md:pt-12 md:pb-8">
      <div className="@container flex w-full flex-col items-center gap-14 px-4 sm:px-5">
        <Link href={`mailto:${CONTACT_EMAIL}`} className="link-underline text-lg">
          {CONTACT_EMAIL}
        </Link>
        <p
          aria-hidden="true"
          className="font-display font-weight-display bg-linear-to-b from-foreground/20 via-foreground/10 to-foreground/0 w-full overflow-hidden bg-clip-text text-center text-[clamp(2rem,16cqw,16rem)] leading-[0.8] whitespace-nowrap text-transparent"
        >
          kiran pingle
        </p>
      </div>
    </footer>
  );
};

export default Footer;
