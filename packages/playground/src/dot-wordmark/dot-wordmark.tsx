'use client';

import { useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';

import { cn } from '../lib/utils';

type Dot = {
  /** Where the dot belongs */
  homeX: number;
  homeY: number;
  /** How far it has been knocked away from home, and how fast it is moving */
  offsetX: number;
  offsetY: number;
  speedX: number;
  speedY: number;
  radius: number;
};

/** How finely each grid cell is checked against the letter shapes */
const SAMPLES = 4;
/** Cells covered less than this by a letter get no dot */
const MIN_COVER = 0.1;
const FIELD = {
  /** Reach of the cursor, in pixels */
  radius: 110,
  push: 2.6,
  swirl: 1.7,
  /** Pull back home, and how quickly movement dies down */
  spring: 0.055,
  damping: 0.86,
  /** A dot is never knocked further than this from home */
  limit: 70,
};
const AT_REST = 0.02;

/** Lays the word out as a grid of dots: bigger dots where the letters are solid */
const buildDots = (
  word: string,
  width: number,
  height: number,
  pitch: number,
  maxRadius: number,
  fontFamily: string,
) => {
  const columns = Math.floor(width / pitch);
  const rows = Math.floor(height / pitch);
  if (columns < 2 || rows < 2) return [];

  // Draw the word small, a few samples per dot, and read back how full each cell is
  const sheet = document.createElement('canvas');
  sheet.width = columns * SAMPLES;
  sheet.height = rows * SAMPLES;
  const context = sheet.getContext('2d', { willReadFrequently: true });
  if (!context) return [];

  const font = (size: number) => `800 ${size}px ${fontFamily}`;
  context.font = font(100);
  const measured = context.measureText(word);
  const inkHeight =
    measured.actualBoundingBoxAscent + measured.actualBoundingBoxDescent;
  // As big as fits, leaving a little room for dots to move at the edges
  const size =
    100 *
    Math.min(
      (sheet.width * 0.94) / measured.width,
      (sheet.height * 0.82) / inkHeight,
    );
  context.font = font(size);
  context.textAlign = 'center';
  context.textBaseline = 'alphabetic';
  const sized = context.measureText(word);
  const baseline =
    sheet.height / 2 +
    (sized.actualBoundingBoxAscent - sized.actualBoundingBoxDescent) / 2;
  context.fillText(word, sheet.width / 2, baseline);

  const { data } = context.getImageData(0, 0, sheet.width, sheet.height);
  const offsetX = (width - columns * pitch) / 2;
  const offsetY = (height - rows * pitch) / 2;
  const dots: Dot[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      let cover = 0;
      for (let y = 0; y < SAMPLES; y += 1) {
        for (let x = 0; x < SAMPLES; x += 1) {
          const index =
            ((row * SAMPLES + y) * sheet.width + column * SAMPLES + x) * 4 + 3;
          cover += data[index];
        }
      }
      cover /= SAMPLES * SAMPLES * 255;
      if (cover < MIN_COVER) continue;

      dots.push({
        homeX: offsetX + (column + 0.5) * pitch,
        homeY: offsetY + (row + 0.5) * pitch,
        offsetX: 0,
        offsetY: 0,
        speedX: 0,
        speedY: 0,
        // Halftone: the dot's area follows how much of the cell the letter fills
        radius: maxRadius * Math.sqrt(cover),
      });
    }
  }
  return dots;
};

/**
 * A word set in halftone dots. The dots spring out of the cursor's way and are
 * stirred into a swirl around it, then settle back. Size it with `className`.
 */
export default function DotWordmark({
  word,
  dotSize = 6,
  gap = 2,
  className,
}: {
  word: string;
  /** Largest dot, in pixels */
  dotSize?: number;
  /** Space between dots, in pixels */
  gap?: number;
  className?: string;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const still = useReducedMotion() ?? false;

  useEffect(() => {
    const element = frame.current;
    const surface = canvas.current;
    const context = surface?.getContext('2d');
    if (!element || !surface || !context) return;

    let dots: Dot[] = [];
    let width = 0;
    let height = 0;
    let request = 0;
    let visible = true;
    let cancelled = false;
    const pointer = { x: 0, y: 0, inside: false };

    const draw = () => {
      // The dots take the text colour of wherever the wordmark is placed
      context.fillStyle = getComputedStyle(element).color;
      context.clearRect(0, 0, width, height);
      context.beginPath();
      for (const dot of dots) {
        const x = dot.homeX + dot.offsetX;
        const y = dot.homeY + dot.offsetY;
        context.moveTo(x + dot.radius, y);
        context.arc(x, y, dot.radius, 0, Math.PI * 2);
      }
      context.fill();
    };

    const step = () => {
      request = 0;
      let moving = false;

      for (const dot of dots) {
        let forceX = -dot.offsetX * FIELD.spring;
        let forceY = -dot.offsetY * FIELD.spring;

        if (pointer.inside) {
          const awayX = dot.homeX + dot.offsetX - pointer.x;
          const awayY = dot.homeY + dot.offsetY - pointer.y;
          const distance = Math.hypot(awayX, awayY) || 1;
          if (distance < FIELD.radius) {
            const strength = (1 - distance / FIELD.radius) ** 2;
            const unitX = awayX / distance;
            const unitY = awayY / distance;
            // Straight out of the way, plus a sideways shove that makes the swirl
            forceX += (unitX * FIELD.push - unitY * FIELD.swirl) * strength;
            forceY += (unitY * FIELD.push + unitX * FIELD.swirl) * strength;
          }
        }

        dot.speedX = (dot.speedX + forceX) * FIELD.damping;
        dot.speedY = (dot.speedY + forceY) * FIELD.damping;
        dot.offsetX += dot.speedX;
        dot.offsetY += dot.speedY;

        const strayed = Math.hypot(dot.offsetX, dot.offsetY);
        if (strayed > FIELD.limit) {
          dot.offsetX *= FIELD.limit / strayed;
          dot.offsetY *= FIELD.limit / strayed;
        }
        if (
          strayed > AT_REST ||
          Math.abs(dot.speedX) + Math.abs(dot.speedY) > AT_REST
        ) {
          moving = true;
        }
      }

      draw();
      // Stop drawing once everything has settled, to save battery
      if ((moving || pointer.inside) && visible) wake();
    };

    const wake = () => {
      if (!request && !still && !cancelled) {
        request = requestAnimationFrame(step);
      }
    };

    const build = () => {
      const box = element.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      width = box.width;
      height = box.height;
      surface.width = Math.round(width * scale);
      surface.height = Math.round(height * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0);

      dots = buildDots(
        word,
        width,
        height,
        dotSize + gap,
        dotSize / 2,
        getComputedStyle(element).fontFamily,
      );

      if (!still) {
        // First appearance: the dots fly in from a loose cloud and settle
        for (const dot of dots) {
          const angle = Math.random() * Math.PI * 2;
          const far = FIELD.limit * (0.4 + Math.random() * 0.6);
          dot.offsetX = Math.cos(angle) * far;
          dot.offsetY = Math.sin(angle) * far;
        }
      }
      draw();
      wake();
    };

    const onMove = (event: PointerEvent) => {
      const box = element.getBoundingClientRect();
      pointer.x = event.clientX - box.left;
      pointer.y = event.clientY - box.top;
      pointer.inside = true;
      wake();
    };
    const onLeave = () => {
      pointer.inside = false;
    };

    const resized = new ResizeObserver(build);
    const seen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
    });
    // The theme can change the text colour without anything else changing
    const themed = new MutationObserver(draw);

    // Wait for the site font, or the letters would be measured in the wrong one
    void document.fonts.ready.then(() => {
      if (cancelled) return;
      build();
      resized.observe(element);
      seen.observe(element);
      themed.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });
    });

    element.addEventListener('pointermove', onMove);
    element.addEventListener('pointerleave', onLeave);
    element.addEventListener('pointercancel', onLeave);

    return () => {
      cancelled = true;
      cancelAnimationFrame(request);
      resized.disconnect();
      seen.disconnect();
      themed.disconnect();
      element.removeEventListener('pointermove', onMove);
      element.removeEventListener('pointerleave', onLeave);
      element.removeEventListener('pointercancel', onLeave);
    };
  }, [word, dotSize, gap, still]);

  return (
    <div
      ref={frame}
      role="img"
      aria-label={word}
      className={cn('relative aspect-3/1 w-full touch-pan-y', className)}
    >
      <canvas ref={canvas} aria-hidden="true" className="size-full" />
    </div>
  );
}
