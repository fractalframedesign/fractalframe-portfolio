'use client';

import { CSSProperties, useState } from 'react';

interface LabTokens {
  hue: number;
  radius: number;
  space: number;
}

const SLIDERS: Array<{
  key: keyof LabTokens;
  label: string;
  min: number;
  max: number;
  format: (v: number) => string;
}> = [
  { key: 'hue', label: 'Accent hue', min: 0, max: 360, format: (v) => `${v}°` },
  { key: 'radius', label: 'Corner radius', min: 0, max: 26, format: (v) => `${v}px` },
  { key: 'space', label: 'Spacing unit', min: 5, max: 13, format: (v) => `${v}px` },
];

export function UiTokenLabDemo() {
  const [tokens, setTokens] = useState<LabTokens>({
    hue: 254,
    radius: 12,
    space: 8,
  });
  const [toggled, setToggled] = useState(true);

  const labStyle = {
    '--lab-h': tokens.hue,
    '--lab-r': `${tokens.radius}px`,
    '--lab-s': `${tokens.space}px`,
  } as CSSProperties;

  const accentGradient = `linear-gradient(135deg, hsl(${tokens.hue}, 80%, 58%), hsl(${(tokens.hue + 46) % 360}, 80%, 62%))`;

  return (
    <div className="not-prose bigger-container">
      <figure className="bg-card my-8 overflow-hidden rounded-2xl border shadow-xs">
        <div className="border-b px-4 py-2.5">
          <span className="text-muted-foreground font-mono text-[10.5px] tracking-[0.12em] uppercase">
            Token lab · Three tokens, every component
          </span>
        </div>
        <div className="bg-muted/60 flex justify-center px-6 py-10" style={labStyle}>
          <div
            className="w-full max-w-100 border transition-all duration-200"
            style={{
              background: `hsl(${tokens.hue}, 28%, 12%)`,
              borderColor: `hsl(${tokens.hue}, 40%, 26%)`,
              borderRadius: 'var(--lab-r)',
              padding: `calc(var(--lab-s) * 2.5)`,
            }}
          >
            <div
              className="font-mono text-[15px] font-semibold"
              style={{ color: `hsl(${tokens.hue}, 40%, 92%)` }}
            >
              Project Aurora
            </div>
            <div
              className="text-xs"
              style={{
                color: `hsl(${tokens.hue}, 20%, 60%)`,
                marginBottom: `calc(var(--lab-s) * 1.5)`,
              }}
            >
              One rule, every component
            </div>
            <input
              type="text"
              placeholder="Search components…"
              className="w-full border text-[13px] outline-none transition-all duration-200"
              style={{
                background: `hsl(${tokens.hue}, 30%, 9%)`,
                borderColor: `hsl(${tokens.hue}, 35%, 24%)`,
                borderRadius: `calc(var(--lab-r) * 0.6)`,
                padding: `calc(var(--lab-s) * 1.25) calc(var(--lab-s) * 1.5)`,
                color: `hsl(${tokens.hue}, 30%, 88%)`,
                marginBottom: `calc(var(--lab-s) * 1.5)`,
              }}
            />
            <div className="flex flex-wrap items-center" style={{ gap: `calc(var(--lab-s) * 1.25)` }}>
              <button
                type="button"
                className="cursor-pointer font-mono text-[13px] font-medium text-white transition-all duration-200 hover:brightness-110"
                style={{
                  background: accentGradient,
                  borderRadius: `calc(var(--lab-r) * 0.6)`,
                  padding: `calc(var(--lab-s) * 1.1) calc(var(--lab-s) * 2)`,
                }}
              >
                Ship it
              </button>
              <button
                type="button"
                className="cursor-pointer border bg-transparent font-mono text-[13px] font-medium transition-all duration-200"
                style={{
                  borderColor: `hsl(${tokens.hue}, 40%, 32%)`,
                  color: `hsl(${tokens.hue}, 35%, 80%)`,
                  borderRadius: `calc(var(--lab-r) * 0.6)`,
                  padding: `calc(var(--lab-s) * 1.1) calc(var(--lab-s) * 2)`,
                }}
              >
                Preview
              </button>
              <button
                type="button"
                role="switch"
                aria-checked={toggled}
                aria-label="Demo toggle"
                onClick={() => setToggled((t) => !t)}
                className="relative ml-auto h-6 w-10.5 shrink-0 cursor-pointer transition-colors duration-200"
                style={{
                  background: toggled ? accentGradient : `hsl(${tokens.hue}, 35%, 24%)`,
                  borderRadius: `calc(var(--lab-r) * 1.5)`,
                }}
              >
                <span
                  className="absolute top-[3px] size-4.5 bg-white transition-all duration-200"
                  style={{
                    left: toggled ? 21 : 3,
                    borderRadius: `calc(var(--lab-r) * 1.2)`,
                  }}
                />
              </button>
            </div>
            <div
              className="border-0 transition-all duration-200"
              style={{
                background: `hsl(${tokens.hue}, 30%, 16%)`,
                borderRadius: `calc(var(--lab-r) * 0.7)`,
                padding: `calc(var(--lab-s) * 1.75)`,
                marginTop: `calc(var(--lab-s) * 2)`,
              }}
            >
              <div
                className="font-mono text-[13px] font-semibold"
                style={{ color: `hsl(${tokens.hue}, 40%, 92%)` }}
              >
                Nested card
              </div>
              <div
                className="text-[11px]"
                style={{
                  color: `hsl(${tokens.hue}, 20%, 60%)`,
                  marginBottom: `calc(var(--lab-s) * 1.5)`,
                }}
              >
                Same rule, ×0.7 scale — that&apos;s the recursion
              </div>
              <div className="flex flex-wrap items-center" style={{ gap: `calc(var(--lab-s) * 1.25)` }}>
                <button
                  type="button"
                  className="cursor-pointer font-mono text-xs font-medium text-white transition-all duration-200 hover:brightness-110"
                  style={{
                    background: accentGradient,
                    borderRadius: `calc(var(--lab-r) * 0.6)`,
                    padding: `calc(var(--lab-s) * 0.8) calc(var(--lab-s) * 1.5)`,
                  }}
                >
                  Confirm
                </button>
                <span
                  className="font-mono text-[11px] transition-all duration-200"
                  style={{
                    color: `hsl(${tokens.hue}, 60%, 78%)`,
                    background: `hsl(${tokens.hue}, 50%, 24%)`,
                    borderRadius: `calc(var(--lab-r) * 1.2)`,
                    padding: `calc(var(--lab-s) * 0.5) calc(var(--lab-s) * 1.25)`,
                  }}
                >
                  self-similar ✓
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-x-7 gap-y-5 border-t px-6 py-5 sm:grid-cols-3">
          {SLIDERS.map(({ key, label, min, max, format }) => (
            <div key={key}>
              <label
                htmlFor={`lab-${key}`}
                className="text-muted-foreground mb-2 flex justify-between font-mono text-[11px] tracking-[0.12em] uppercase"
              >
                {label}
                <output className="text-foreground">{format(tokens[key])}</output>
              </label>
              <input
                id={`lab-${key}`}
                type="range"
                min={min}
                max={max}
                value={tokens[key]}
                onChange={(e) =>
                  setTokens((t) => ({ ...t, [key]: Number(e.target.value) }))
                }
                className="accent-primary w-full"
              />
            </div>
          ))}
          <p className="text-muted-foreground col-span-full text-[13px] italic">
            Three tokens. Zero components styled individually. The nested card derives
            everything at ×0.7 — one rule, applied recursively.
          </p>
        </div>
      </figure>
    </div>
  );
}
