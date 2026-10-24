'use client';

import { SmartHomeDashboard } from './SmartHomeDashboard';

export function LaptopPreview() {
  return (
    <section className="py-4 md:py-8">
      <div
        tabIndex={0}
        role="group"
        aria-label="Smart home dashboard laptop preview"
        className="group relative mx-auto aspect-[1.55] w-full max-w-5xl outline-none perspective-[1400px] focus-visible:ring-2 focus-visible:ring-accent-1 focus-visible:ring-offset-4 focus-visible:ring-offset-canvas"
      >
        <div className="absolute inset-0 transform-3d transform-[rotateX(48deg)]">
          <div className="absolute inset-x-[7%] bottom-[3%] h-[38%] [clip-path:polygon(10%_0,90%_0,100%_100%,0_100%)] rounded-b-4xl border border-surface-border bg-linear-to-b from-ink/55 via-ink/80 to-ink shadow-[0_28px_35px_-18px_rgba(0,0,0,0.8)]">
            <div
              aria-hidden="true"
              className="absolute inset-x-[17%] top-[9%] grid h-[48%] grid-cols-13 gap-0.75 rounded-lg bg-ink p-2 shadow-inner"
            >
              {Array.from({ length: 52 }, (_, keyIndex) => (
                <span
                  key={keyIndex}
                  className="rounded-sm border border-surface-border bg-surface"
                />
              ))}
            </div>
            <div className="absolute top-[10%] right-[8%] h-[45%] w-[5%] rounded-sm bg-surface-border" />
            <div className="absolute top-[10%] left-[8%] h-[45%] w-[5%] rounded-sm bg-surface-border" />
            <div className="absolute bottom-[12%] left-1/2 h-[24%] w-[30%] -translate-x-1/2 rounded-lg border border-surface-border bg-surface shadow-inner" />
          </div>

          <div className="absolute inset-x-[12%] bottom-[32%] z-10 aspect-16/10 origin-bottom rounded-t-2xl border border-surface-border bg-ink p-[1.4%] shadow-[0_16px_30px_-16px_rgba(0,0,0,0.9)] transition-transform duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)] backface-hidden transform-[rotateX(0deg)] group-hover:transform-[rotateX(-100deg)] group-focus-visible:transform-[rotateX(-100deg)] [@media(hover:none)]:transform-[rotateX(-100deg)] max-sm:transform-[rotateX(-100deg)]">
            <div className="relative size-full overflow-hidden rounded-t-[0.7rem] bg-canvas">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-10 bg-linear-to-br from-white/10 via-transparent to-black/10"
              />
              <div
                aria-hidden="true"
                inert
                className="pointer-events-none absolute inset-0 overflow-hidden opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100 max-sm:opacity-100"
              >
                <div className="w-275 origin-top-left scale-[0.22] brightness-125 sm:scale-[0.4] md:scale-[0.46] lg:scale-[0.65] xl:scale-[0.68]">
                  <SmartHomeDashboard />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}