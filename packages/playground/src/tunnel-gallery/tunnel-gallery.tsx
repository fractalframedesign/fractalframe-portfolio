'use client';

import { Maximize, Minimize } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import { cn } from '../lib/utils';
import { Button } from '../ui/button';
import type { TunnelItem } from './tunnel-scene';

const TunnelScene = dynamic(() => import('./tunnel-scene'), { ssr: false });

const noSubscription = () => () => {};
const subscribeToFullScreen = (onChange: () => void) => {
  document.addEventListener('fullscreenchange', onChange);
  return () => document.removeEventListener('fullscreenchange', onChange);
};

/**
 * An endless 3D tunnel of pictures. Scroll over it or drag to fly through it;
 * items with a link open on click. Give it a height with `className`.
 */
export default function TunnelGallery({
  items,
  label,
  className,
}: {
  items: TunnelItem[];
  /** What the gallery shows, for screen readers */
  label: string;
  className?: string;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const still = useReducedMotion() ?? false;
  const [onScreen, setOnScreen] = useState(false);
  const [hovered, setHovered] = useState<TunnelItem | null>(null);
  const [surprise, setSurprise] = useState(0);
  const id = useId();
  // Phones like the iPhone cannot show one part of a page full screen, so the
  // button only appears where it works
  const canFullScreen = useSyncExternalStore(
    noSubscription,
    () => document.fullscreenEnabled,
    () => false,
  );
  const fullScreen = useSyncExternalStore(
    subscribeToFullScreen,
    () => document.fullscreenElement?.getAttribute('data-tunnel') === id,
    () => false,
  );
  const linked = items.filter((item) => item.href);

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) =>
      setOnScreen(entry.isIntersecting),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const toggleFullScreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void frame.current?.requestFullscreen();
  };

  const open = (item: TunnelItem) => {
    if (!item.href) return;
    if (item.newTab) window.open(item.href, '_blank', 'noopener,noreferrer');
    else router.push(item.href);
  };

  if (items.length === 0) return null;

  return (
    <div
      ref={frame}
      data-tunnel={id}
      className={cn(
        // Always a dark room, in the light theme too, so the pictures glow
        'dark bg-background text-foreground relative overflow-hidden rounded-3xl border select-none aspect-video',
        // Edge to edge while full screen
        '[&:fullscreen]:rounded-none [&:fullscreen]:border-0',
        className,
      )}
    >
      <TunnelScene
        items={items}
        still={still}
        paused={!onScreen}
        onHover={setHovered}
        onOpen={open}
        surprise={surprise}
      />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center">
        {hovered ? (
          <p aria-hidden="true" className="font-serif text-xl">
            {hovered.title}
          </p>
        ) : (
          <button
            type="button"
            onClick={() => setSurprise((count) => count + 1)}
            className="focus-visible:ring-ring pointer-events-auto cursor-pointer rounded-md px-2 font-serif text-xl outline-none focus-visible:ring-2"
          >
            Click for surprise!
          </button>
        )}
      </div>

      {canFullScreen && (
        <Button
          variant="secondary"
          size="icon"
          tooltip={fullScreen ? 'Exit full screen' : 'Full screen'}
          tooltipSide="left"
          aria-label={fullScreen ? 'Exit full screen' : 'Full screen'}
          onClick={toggleFullScreen}
          className="absolute end-4 top-4 rounded-full"
        >
          {fullScreen ? (
            <Minimize aria-hidden="true" />
          ) : (
            <Maximize aria-hidden="true" />
          )}
        </Button>
      )}

      {/* The same content as a plain list, for screen readers and keyboards */}
      <div className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:start-4 focus-within:top-4">
        <p>{label}</p>
        {linked.length > 0 && (
          <ul className="bg-background flex flex-col gap-1 rounded-lg border p-2">
            {linked.map((item) => (
              <li key={`${item.href}-${item.title}`}>
                <Link
                  href={item.href ?? ''}
                  {...(item.newTab && {
                    target: '_blank',
                    rel: 'noopener noreferrer',
                  })}
                  className="focus-visible:ring-ring block rounded-md px-2 py-1 outline-none focus-visible:ring-2"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
