'use client';

import { useId } from 'react';

import { type Measure, round } from '@/components/drawing/measure';

const SPEC_W = 240;
const SPEC_MIN_W = 132;
const SPEC_GAP = 28;
const SPEC_H = 130;

/** Shortest CSS-style form: 24 · 12 16 · 12 16 8 16 */
function sides({ t, r, b, l }: Measure['padding']) {
  const v = [t, r, b, l].map(round);
  if (v.every((n) => n === v[0])) return `${v[0]}`;
  if (v[0] === v[2] && v[1] === v[3]) return `${v[0]} ${v[1]}`;
  return v.join(' ');
}

function specRows(m: Measure): Array<[string, string]> {
  const rows: Array<[string, string]> = [
    ['Element', m.tag],
    ['Size', `${round(m.box.w)} × ${round(m.box.h)}`],
  ];
  if (m.radius > 0) rows.push(['Rounded', String(round(m.radius))]);
  const p = m.padding;
  if (p.t + p.r + p.b + p.l > 0) rows.push(['Padding', sides(p)]);
  if (m.gap) {
    rows.push([
      'Gap',
      m.gap.row === m.gap.column || !m.gap.row || !m.gap.column
        ? String(round(m.gap.row || m.gap.column))
        : `${round(m.gap.row)} row · ${round(m.gap.column)} col`,
    ]);
  }
  if (m.font) rows.push(['Font', m.font]);
  return rows;
}

function specPosition(
  box: Measure['box'],
  bounds: { w: number; h: number },
): React.CSSProperties {
  const top = Math.min(Math.max(box.y, 8), Math.max(8, bounds.h - SPEC_H));
  // Beside the selection on whichever side has more room; the card wraps to fit
  const right = bounds.w - (box.x + box.w) - SPEC_GAP - 8;
  const left = box.x - SPEC_GAP - 8;
  if (Math.max(right, left) >= SPEC_MIN_W) {
    return right >= left
      ? { left: box.x + box.w + SPEC_GAP, top, maxWidth: right }
      : { right: bounds.w - box.x + SPEC_GAP, top, maxWidth: left };
  }
  const x = Math.min(Math.max(box.x, 8), Math.max(8, bounds.w - SPEC_W));
  return box.y + box.h + 24 + SPEC_H < bounds.h
    ? { left: x, top: box.y + box.h + 24 }
    : { left: x, top: Math.max(8, box.y - SPEC_H - 24) };
}

type DimProps = {
  from: { x: number; y: number };
  to: { x: number; y: number };
  label: string;
  marker: string;
};

/** Dimension line with arrows, label centred on the line with a paper knockout */
// craftsman-ignore WARN-TS001: one props object, destructured
function Dim({ from, to, label, marker }: DimProps) {
  const vertical = from.x === to.x;
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  return (
    <g>
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        className="stroke-foreground"
        strokeWidth={0.75}
        markerStart={`url(#${marker})`}
        markerEnd={`url(#${marker})`}
      />
      <text
        x={vertical ? mx - 4 : mx}
        y={vertical ? my + 3.5 : my - 4}
        textAnchor={vertical ? 'end' : 'middle'}
        className="fill-foreground stroke-background font-mono text-[10px]"
        strokeWidth={3}
        paintOrder="stroke"
      >
        {label}
      </text>
    </g>
  );
}

/**
 * Draws one measured element like a dimensional drawing: the box, hatched
 * padding, W and H, gaps to the parent's content edge and a spec tag.
 * Coordinates are relative to the positioned container it is placed in;
 * `bounds` is that container's size, used to keep labels inside it.
 */
export default function MeasureOverlay({
  m,
  bounds,
}: {
  m: Measure;
  bounds: { w: number; h: number };
}) {
  const id = useId().replace(/[^a-zA-Z0-9-]/g, '');
  const arrow = `dw-arrow-${id}`;
  const hatch = `dw-hatch-${id}`;
  const { box, padding: pad, offset: off, parent } = m;

  // Size dims sit outside the box when there is room, inside otherwise
  const topY = box.y > 30 ? box.y - 12 : box.y + box.h + 12;
  const leftX = box.x > 48 ? box.x - 12 : box.x + box.w + 12;
  // Gap dims sit off-centre so their labels never land on the W / H labels
  const gapX = box.x + box.w * 0.8;
  const gapY = box.y + box.h * 0.75;

  return (
    <>
      <svg className="absolute inset-0 size-full overflow-visible">
        <defs>
          <marker
            id={arrow}
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
            markerUnits="userSpaceOnUse"
          >
            <path d="M0,1.7 L10,5 L0,8.3 z" className="fill-foreground" />
          </marker>
          <pattern
            id={hatch}
            width="5"
            height="5"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="5"
              className="stroke-foreground"
              strokeWidth={0.6}
              strokeOpacity={0.45}
            />
          </pattern>
        </defs>

        {/* Parent content box, so the gaps read against something */}
        <rect
          x={parent.x}
          y={parent.y}
          width={parent.w}
          height={parent.h}
          fill="none"
          className="stroke-foreground"
          strokeWidth={0.6}
          strokeDasharray="10 3 2 3"
          strokeOpacity={0.5}
        />

        {/* Padding, hatched */}
        {pad.t > 0 && (
          <rect
            x={box.x}
            y={box.y}
            width={box.w}
            height={pad.t}
            fill={`url(#${hatch})`}
          />
        )}
        {pad.b > 0 && (
          <rect
            x={box.x}
            y={box.y + box.h - pad.b}
            width={box.w}
            height={pad.b}
            fill={`url(#${hatch})`}
          />
        )}
        {pad.l > 0 && (
          <rect
            x={box.x}
            y={box.y + pad.t}
            width={pad.l}
            height={Math.max(0, box.h - pad.t - pad.b)}
            fill={`url(#${hatch})`}
          />
        )}
        {pad.r > 0 && (
          <rect
            x={box.x + box.w - pad.r}
            y={box.y + pad.t}
            width={pad.r}
            height={Math.max(0, box.h - pad.t - pad.b)}
            fill={`url(#${hatch})`}
          />
        )}

        {/* The element */}
        <rect
          x={box.x}
          y={box.y}
          width={box.w}
          height={box.h}
          rx={m.radius}
          fill="none"
          className="stroke-foreground"
          strokeWidth={1.25}
        />

        {/* Overall size */}
        <Dim
          from={{ x: box.x, y: topY }}
          to={{ x: box.x + box.w, y: topY }}
          label={`W ${round(box.w)}`}
          marker={arrow}
        />
        <Dim
          from={{ x: leftX, y: box.y }}
          to={{ x: leftX, y: box.y + box.h }}
          label={`H ${round(box.h)}`}
          marker={arrow}
        />

        {/* Gaps to the parent's content edge */}
        {off.t >= 1 && (
          <Dim
            from={{ x: gapX, y: parent.y }}
            to={{ x: gapX, y: box.y }}
            label={String(round(off.t))}
            marker={arrow}
          />
        )}
        {off.b >= 1 && (
          <Dim
            from={{ x: gapX, y: box.y + box.h }}
            to={{ x: gapX, y: parent.y + parent.h }}
            label={String(round(off.b))}
            marker={arrow}
          />
        )}
        {off.l >= 1 && (
          <Dim
            from={{ x: parent.x, y: gapY }}
            to={{ x: box.x, y: gapY }}
            label={String(round(off.l))}
            marker={arrow}
          />
        )}
        {off.r >= 1 && (
          <Dim
            from={{ x: box.x + box.w, y: gapY }}
            to={{ x: parent.x + parent.w, y: gapY }}
            label={String(round(off.r))}
            marker={arrow}
          />
        )}
      </svg>

      {/* Spec card beside the selection: right, else left, else below or above */}
      <dl
        className="bg-background text-foreground border-foreground absolute w-max max-w-64 space-y-0.5 break-words rounded-2xl border px-3.5 py-2.5 font-mono text-[11px] uppercase"
        style={specPosition(box, bounds)}
      >
        {specRows(m).map(([label, value]) => (
          <div key={label} className="flex gap-1.5">
            <dt className="text-muted-foreground">{label}:</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
