import AudienceExpandCards from '@kiran/playground/audience-expand-cards';
import DepthCarousel from '@kiran/playground/depth-carousel';
import DotWordmark from '@kiran/playground/dot-wordmark';
import FollowAccordion from '@kiran/playground/follow-accordion';
import StageSlider from '@kiran/playground/stage-slider';
import TagPile from '@kiran/playground/tag-pile';
import TunnelGallery from '@kiran/playground/tunnel-gallery';
import type { Metadata } from 'next';

import {
  PLAYGROUND_AUDIENCES,
  PLAYGROUND_CAROUSEL_EXTRAS,
  PLAYGROUND_CAROUSEL_SLUGS,
  PLAYGROUND_PROCESS,
  PLAYGROUND_TAGS,
  PLAYGROUND_TUNNEL_ITEMS,
} from '@/lib/playground';
import { getProjectsBySlugs } from '@/lib/projects';

export const metadata: Metadata = {
  title: 'Playground',
  description:
    'Interface experiments by Kiran Pingle: small ideas built to see how they feel.',
};

export default async function PlaygroundPage() {
  const projects = await getProjectsBySlugs(PLAYGROUND_CAROUSEL_SLUGS);
  const carouselItems = [
    ...projects.map((project) => ({
      title: project.name,
      description: project.description,
      image: project.image,
      href: project.href.startsWith('/')
        ? project.href
        : `/projects/${project.slug}`,
      newTab: project.openInNewTab,
    })),
    ...PLAYGROUND_CAROUSEL_EXTRAS,
  ];

  return (
    <section className="hero-padding">
      <div className="container flex flex-col gap-5">
        <h1 className="text-3xl md:text-4xl">Playground</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Small experiments I build to see how an idea feels before it goes
          anywhere near a product
        </p>
      </div>

      <article className="bigger-container section-padding space-y-5">
        <AudienceExpandCards
          label="Choose your website audience"
          items={PLAYGROUND_AUDIENCES}
        />
        <div className="space-y-2">
          <h2 className="text-2xl leading-snug">Expand image cards</h2>
          <p className="text-muted-foreground leading-relaxed">
            Choose an audience and let the right path open up.
          </p>
        </div>
      </article>

      <article className="bigger-container section-padding space-y-5">
        <TunnelGallery
          label="A 3D tunnel of interface screens that you can travel through."
          items={PLAYGROUND_TUNNEL_ITEMS}
        />
        <div className="space-y-2">
          <h2 className="text-2xl leading-snug">Tunnel gallery</h2>
          <p className="text-muted-foreground leading-relaxed">
            An endless tunnel of screens built with three.js. Scroll over it to
            fly in, or drag, and the pictures recycle so the trip never ends.
          </p>
        </div>
      </article>

      <article className="bigger-container section-padding space-y-5">
        <div className="bg-card flex aspect-video items-center rounded-3xl border p-4 md:p-8">
          <DotWordmark word="KIRAN" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl leading-snug">Dot wordmark</h2>
          <p className="text-muted-foreground leading-relaxed">
            My name set in halftone dots. Move across it and the dots spring out
            of the way, swirl around the cursor, then find their way home.
          </p>
        </div>
      </article>

      <article className="bigger-container section-padding space-y-5">
        <div className="bg-card overflow-hidden rounded-3xl border p-6 md:p-10">
          <DepthCarousel
            label="Selected work, one card at a time"
            items={carouselItems}
          />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl leading-snug">Depth carousel</h2>
          <p className="text-muted-foreground leading-relaxed">
            Cards lined up into the distance. Each one steps forward in turn, or
            use the arrows, the dashes, the arrow keys or a drag.
          </p>
        </div>
      </article>

      <article className="bigger-container section-padding space-y-5">
        <TagPile tags={PLAYGROUND_TAGS} className="aspect-video min-h-80" />
        <div className="space-y-2">
          <h2 className="text-2xl leading-snug">Tag pile</h2>
          <p className="text-muted-foreground leading-relaxed">
            The things I work on, dropped into a heap with real gravity. Grab a
            tag and throw it, or tap the floor to make the pile jump.
          </p>
        </div>
      </article>

      <article className="bigger-container section-padding space-y-5">
        <div className="bg-card rounded-3xl border p-4 md:p-10">
          <FollowAccordion items={PLAYGROUND_PROCESS} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl leading-snug">Follow accordion</h2>
          <p className="text-muted-foreground leading-relaxed">
            How I work, one step at a time. Open a step and the picture slides
            over to sit beside it, changing as it goes. On a phone it moves
            inside the step instead.
          </p>
        </div>
      </article>

      <article className="bigger-container section-padding space-y-5">
        <StageSlider
          label="Selected work over a full picture, one card at a time"
          slides={carouselItems.slice(0, projects.length)}
          className="h-144"
        />
        <div className="space-y-2">
          <h2 className="text-2xl leading-snug">Stage slider</h2>
          <p className="text-muted-foreground leading-relaxed">
            Cards in four different layouts glide along over a full picture, and
            the picture behind changes with every step. Use the arrows, the
            arrow keys or a swipe.
          </p>
        </div>
      </article>
    </section>
  );
}
