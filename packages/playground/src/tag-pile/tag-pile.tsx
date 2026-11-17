'use client';

import Matter from 'matter-js';
import { useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

import { cn } from '../lib/utils';

/** Colour pairs from the site tokens, given out to the tags in turn */
const TAG_STYLES = [
  'bg-foreground text-background',
  'bg-chart-1 text-primary-foreground',
  'bg-background text-foreground border',
  'bg-success text-primary-foreground',
  'bg-destructive text-destructive-foreground',
  'bg-chart-4 text-foreground',
];

const WALL = 200;
/** How long to wait between tags as they drop in, in milliseconds */
const DROP_EVERY = 90;
/** A tap on the floor kicks tags within this many pixels of it */
const KICK = { reach: 260, strength: 0.055 };
const STEP_MS = 1000 / 60;

type Grab = { constraint: Matter.Constraint; pointerId: number };

/**
 * Word tags that drop into a pile under real gravity. Grab one and throw it, or
 * tap the empty floor to bounce the tags nearby. Size it with `className`.
 */
export default function TagPile({
  tags,
  hint = 'Grab a tag, throw it around, tap the floor.',
  className,
}: {
  tags: readonly string[];
  hint?: string;
  className?: string;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const tagElements = useRef<Array<HTMLLIElement | null>>([]);
  const still = useReducedMotion() ?? false;
  const [grabbing, setGrabbing] = useState(false);

  useEffect(() => {
    const element = frame.current;
    if (!element) return;

    const engine = Matter.Engine.create({ gravity: { x: 0, y: 1.1 } });
    const world = engine.world;
    let width = 0;
    let height = 0;
    let walls: Matter.Body[] = [];
    let bodies: Array<Matter.Body | null> = [];
    let request = 0;
    let last = 0;
    let started = false;
    let visible = false;
    let cancelled = false;
    let grab: Grab | null = null;
    const timers: number[] = [];

    const draw = () => {
      bodies.forEach((body, index) => {
        const tag = tagElements.current[index];
        if (!tag || !body) return;
        const { x, y } = body.position;
        tag.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${body.angle}rad)`;
      });
    };

    const tick = (now: number) => {
      request = 0;
      // Fixed steps keep the physics the same on fast and slow screens
      const elapsed = Math.min(now - (last || now), 100);
      last = now;
      let steps = Math.max(1, Math.round(elapsed / STEP_MS));
      while (steps > 0) {
        Matter.Engine.update(engine, STEP_MS);
        steps -= 1;
      }
      draw();
      if (visible && !cancelled) request = requestAnimationFrame(tick);
    };

    const run = () => {
      if (!request && visible && !cancelled) {
        last = 0;
        request = requestAnimationFrame(tick);
      }
    };

    const buildWalls = () => {
      const box = element.getBoundingClientRect();
      width = box.width;
      height = box.height;
      if (walls.length) Matter.Composite.remove(world, walls);
      const options = { isStatic: true, friction: 0.6 };
      walls = [
        // Floor, then the two sides, tall enough that a hard throw comes back down
        Matter.Bodies.rectangle(
          width / 2,
          height + WALL / 2,
          width * 3,
          WALL,
          options,
        ),
        Matter.Bodies.rectangle(
          -WALL / 2,
          height / 2 - height,
          WALL,
          height * 4,
          options,
        ),
        Matter.Bodies.rectangle(
          width + WALL / 2,
          height / 2 - height,
          WALL,
          height * 4,
          options,
        ),
      ];
      Matter.Composite.add(world, walls);
      // Anything left outside after a resize is put back inside
      for (const body of bodies) {
        if (!body) continue;
        Matter.Body.setPosition(body, {
          x: Math.min(Math.max(body.position.x, 40), width - 40),
          y: Math.min(body.position.y, height - 30),
        });
      }
    };

    const addTag = (index: number, settled: boolean) => {
      const tag = tagElements.current[index];
      if (!tag) return;
      const tagWidth = tag.offsetWidth;
      const tagHeight = tag.offsetHeight;
      const x = tagWidth / 2 + Math.random() * Math.max(1, width - tagWidth);
      const y = settled
        ? height - tagHeight / 2 - Math.random() * height * 0.4
        : -tagHeight - Math.random() * 120;
      // A pill: a rectangle with fully rounded ends
      const body = Matter.Bodies.rectangle(x, y, tagWidth, tagHeight, {
        chamfer: { radius: tagHeight / 2 - 0.5 },
        restitution: 0.35,
        friction: 0.5,
        frictionAir: 0.012,
        density: 0.0016,
        angle: (Math.random() - 0.5) * 1.2,
      });
      bodies[index] = body;
      Matter.Composite.add(world, body);
      tag.style.visibility = 'visible';
    };

    const start = () => {
      if (started) return;
      started = true;
      if (still) {
        // No falling: settle the pile out of sight, then show it at rest
        tags.forEach((_, index) => addTag(index, true));
        for (let i = 0; i < 360; i += 1) Matter.Engine.update(engine, STEP_MS);
        draw();
      } else {
        tags.forEach((_, index) => {
          timers.push(
            window.setTimeout(() => addTag(index, false), index * DROP_EVERY),
          );
        });
      }
      run();
    };

    const local = (event: PointerEvent) => {
      const box = element.getBoundingClientRect();
      return { x: event.clientX - box.left, y: event.clientY - box.top };
    };

    const onPointerDown = (event: PointerEvent) => {
      if (grab || !started) return;
      const point = local(event);
      const index = tagElements.current.findIndex(
        (tag) => tag !== null && tag.contains(event.target as Node),
      );
      const body = index === -1 ? null : bodies[index];

      if (body) {
        // Hold the tag at the exact spot that was grabbed, so it swings naturally
        const offset = Matter.Vector.rotate(
          Matter.Vector.sub(point, body.position),
          -body.angle,
        );
        const constraint = Matter.Constraint.create({
          pointA: point,
          bodyB: body,
          pointB: offset,
          stiffness: 0.2,
          damping: 0.1,
          length: 0,
        });
        Matter.Composite.add(world, constraint);
        grab = { constraint, pointerId: event.pointerId };
        element.setPointerCapture(event.pointerId);
        setGrabbing(true);
        event.preventDefault();
        return;
      }

      // Tapping the empty floor sends the tags near it up into the air
      for (const other of bodies) {
        if (!other) continue;
        const distance = Matter.Vector.magnitude(
          Matter.Vector.sub(other.position, point),
        );
        if (distance > KICK.reach) continue;
        const strength =
          (1 - distance / KICK.reach) * KICK.strength * other.mass;
        const side = Math.sign(other.position.x - point.x) || 1;
        Matter.Body.applyForce(other, other.position, {
          x: side * strength * 0.35,
          y: -strength,
        });
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!grab || event.pointerId !== grab.pointerId) return;
      grab.constraint.pointA = local(event);
    };

    const release = (event: PointerEvent) => {
      if (!grab || event.pointerId !== grab.pointerId) return;
      Matter.Composite.remove(world, grab.constraint);
      grab = null;
      setGrabbing(false);
    };

    const resized = new ResizeObserver(() => {
      buildWalls();
      draw();
    });
    const seen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        start();
        run();
      }
    });

    // Measure the tags in the site font, not a fallback
    void document.fonts.ready.then(() => {
      if (cancelled) return;
      buildWalls();
      resized.observe(element);
      seen.observe(element);
    });

    element.addEventListener('pointerdown', onPointerDown);
    element.addEventListener('pointermove', onPointerMove);
    element.addEventListener('pointerup', release);
    element.addEventListener('pointercancel', release);

    return () => {
      cancelled = true;
      cancelAnimationFrame(request);
      timers.forEach((timer) => window.clearTimeout(timer));
      resized.disconnect();
      seen.disconnect();
      element.removeEventListener('pointerdown', onPointerDown);
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerup', release);
      element.removeEventListener('pointercancel', release);
      Matter.Engine.clear(engine);
      bodies = [];
    };
  }, [tags, still]);

  return (
    <div
      ref={frame}
      className={cn(
        'from-card to-muted relative touch-pan-y overflow-hidden rounded-3xl border bg-linear-to-b select-none',
        grabbing ? 'cursor-grabbing' : 'cursor-pointer',
        className,
      )}
    >
      <p className="text-muted-foreground pointer-events-none absolute inset-x-0 top-6 px-4 text-center text-sm">
        {hint}
      </p>
      <ul aria-label="Tags">
        {tags.map((tag, index) => (
          <li
            key={tag}
            ref={(item) => {
              tagElements.current[index] = item;
            }}
            // Hidden until it is dropped into the pile
            style={{ visibility: 'hidden' }}
            className={cn(
              'absolute top-0 left-0 cursor-grab rounded-full px-6 py-3 text-lg leading-none whitespace-nowrap shadow-md will-change-transform md:text-2xl',
              TAG_STYLES[index % TAG_STYLES.length],
            )}
          >
            {tag}
          </li>
        ))}
      </ul>
    </div>
  );
}
