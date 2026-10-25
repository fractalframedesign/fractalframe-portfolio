export type Box = { x: number; y: number; w: number; h: number };
export type Sides = { t: number; r: number; b: number; l: number };

export type Measure = {
  box: Box;
  padding: Sides;
  /** Gap from the element to its parent's content edge, per side */
  offset: Sides;
  /** The parent's content box (inside its border and padding) */
  parent: Box;
  tag: string;
  radius: number;
  /** Space between this element's children (flex or grid gap), when set */
  gap: { row: number; column: number } | null;
  /** Family size/line-height · weight, for elements with their own text */
  font: string | null;
};

export const round = (n: number) => Math.round(n * 10) / 10;

const px = (value: string) => parseFloat(value) || 0;

/**
 * Measures an element's box, padding, radius, type and its gaps to the
 * parent's content edge. Coordinates are relative to `origin` (viewport
 * by default), so the result can be drawn in any positioned overlay.
 */
export function measure(
  el: Element,
  origin: { x: number; y: number } = { x: 0, y: 0 },
): Measure | null {
  const rect = el.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) return null;
  const cs = getComputedStyle(el);

  const parentEl = el.parentElement;
  const pr = parentEl?.getBoundingClientRect();
  const pcs = parentEl ? getComputedStyle(parentEl) : null;
  const parent =
    pr && pcs
      ? {
          x: pr.left + px(pcs.borderLeftWidth) + px(pcs.paddingLeft),
          y: pr.top + px(pcs.borderTopWidth) + px(pcs.paddingTop),
          w:
            pr.width -
            px(pcs.borderLeftWidth) -
            px(pcs.borderRightWidth) -
            px(pcs.paddingLeft) -
            px(pcs.paddingRight),
          h:
            pr.height -
            px(pcs.borderTopWidth) -
            px(pcs.borderBottomWidth) -
            px(pcs.paddingTop) -
            px(pcs.paddingBottom),
        }
      : { x: rect.left, y: rect.top, w: rect.width, h: rect.height };

  const hasText = Array.from(el.childNodes).some(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
  );
  // next/font families look like "__GeistSans_a1b2c3": keep the readable part
  const family = cs.fontFamily
    .split(',')[0]
    .replace(/["']/g, '')
    .replace(/^__|_[a-f0-9]+$/gi, '');

  return {
    box: {
      x: rect.left - origin.x,
      y: rect.top - origin.y,
      w: rect.width,
      h: rect.height,
    },
    padding: {
      t: px(cs.paddingTop),
      r: px(cs.paddingRight),
      b: px(cs.paddingBottom),
      l: px(cs.paddingLeft),
    },
    offset: {
      t: rect.top - parent.y,
      r: parent.x + parent.w - rect.right,
      b: parent.y + parent.h - rect.bottom,
      l: rect.left - parent.x,
    },
    parent: {
      x: parent.x - origin.x,
      y: parent.y - origin.y,
      w: parent.w,
      h: parent.h,
    },
    tag: el.tagName.toLowerCase(),
    radius: Math.min(px(cs.borderTopLeftRadius), rect.height / 2),
    gap:
      /flex|grid/.test(cs.display) && px(cs.rowGap) + px(cs.columnGap) > 0
        ? { row: px(cs.rowGap), column: px(cs.columnGap) }
        : null,
    font: hasText
      ? `${family} ${round(px(cs.fontSize))}/${cs.lineHeight === 'normal' ? 'auto' : round(px(cs.lineHeight))} · ${cs.fontWeight}`
      : null,
  };
}
