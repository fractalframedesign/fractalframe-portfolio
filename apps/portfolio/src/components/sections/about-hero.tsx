import Image from 'next/image';

import { Card } from '@/components/ui/card';

const AboutHero = () => {
  return (
    <section className="hero-padding pb-12.5 md:pb-15 lg:pb-18.75">
      <div className="container">
        <h1 className="text-3xl md:text-4xl">About me</h1>
      </div>

      <div className="bigger-container hero-padding">
        <Card className="relative aspect-video overflow-hidden p-0">
          <Image
            src="/images/home/avatar.webp"
            alt="Person working on laptop"
            fill
            className="object-cover"
            priority
          />
        </Card>
      </div>

      <div className="container space-y-10">
        <h2 className="text-2xl">Story</h2>

        <div className="text-muted-foreground space-y-8 text-lg">
          <p>
            I&apos;ve been writing code for several years now, working across
            both frontend and backend. My focus is on creating products that
            balance clean design, solid architecture, and great user experience.
          </p>

          <p>
            I care about clarity, simplicity, and craftsmanship — not just in
            code, but in how things feel to use. I like tools that are
            lightweight and flexible, and I believe that the best products are
            the ones that stay out of the user&apos;s way.
          </p>

          <p>
            Hey — I&apos;m Kiran Pingle, a full-stack developer who loves
            turning ideas into real, working products. I enjoy the craft of
            building — the small details that make software feel thoughtful,
            fast, and alive.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
