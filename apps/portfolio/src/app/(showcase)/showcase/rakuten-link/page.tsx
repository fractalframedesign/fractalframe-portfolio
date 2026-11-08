import type { Metadata } from 'next';

import { LinkDesktopApp } from '@/components/project-demos/rakuten-link/LinkDesktopApp';
import { LinkMobileApp } from '@/components/project-demos/rakuten-link/LinkMobileApp';

export const metadata: Metadata = {
  title: 'Rakuten Link',
};

export default function Page() {
  return (
    <div className="space-y-16">
      <p className="text-muted-foreground max-w-2xl text-sm">
        An interactive recreation of the shipped Rakuten Link app. Contacts,
        numbers and messages are made up, and calls and messages are simulated
        in your browser.
      </p>

      <section className="space-y-6">
        <h2 className="text-foreground text-2xl">On a phone</h2>
        <div className="bg-canvas rounded-3xl p-6 md:p-10">
          <LinkMobileApp />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-foreground text-2xl">On desktop</h2>
        <div className="bg-canvas rounded-3xl p-4 md:p-10">
          <LinkDesktopApp />
        </div>
      </section>
    </div>
  );
}
