import { BreakpointMap, normalizeResponsiveToMinWidthRules, ResponsiveNumber } from "../responsive";

export function buildScopedSkeletonCountCss(args: {
  scopeId: string;
  responsiveCount: ResponsiveNumber | undefined;
  fallbackCount: number;
  breakpointMap: BreakpointMap;
  maxSlots: number;
  visibleSlotsForCount?: (count: number, maxSlots: number) => number[];
  slotOrderForCount?: (
    count: number,
    maxSlots: number
  ) => Array<{ slot: number; order: number }>;
}): { cssText: string; ssrBaseCount: number } {
  const {
    scopeId,
    responsiveCount,
    fallbackCount,
    breakpointMap,
    maxSlots,
    visibleSlotsForCount,
    slotOrderForCount,
  } = args;

  const rules = normalizeResponsiveToMinWidthRules(responsiveCount, fallbackCount, breakpointMap);

  const normalizeCount = (n: number) => Math.max(0, Math.floor(n));

  const baseCount = normalizeCount(rules[0]?.count ?? fallbackCount);

  const rootSel = `[data-rmg-scope="${scopeId}"]`;
  const slotSel = `${rootSel} [data-rmg-skel-slot]`;

  const lines: string[] = [];

  lines.push(`${slotSel}{ display:none; }`);

  const resolveVisibleSlots = (count: number) => {
    const c = normalizeCount(count);
    if (c <= 0) return [];

    const slots = visibleSlotsForCount
      ? visibleSlotsForCount(c, maxSlots)
      : Array.from({ length: Math.min(maxSlots, c) }, (_, i) => i + 1);

    return Array.from(
      new Set(
        slots
          .map((slot) => Math.floor(slot))
          .filter((slot) => Number.isFinite(slot) && slot >= 1 && slot <= maxSlots)
      )
    );
  };

  const showResolvedSlots = (count: number) => {
    const orderedSlots = slotOrderForCount?.(normalizeCount(count), maxSlots);
    const slots = orderedSlots?.length
      ? orderedSlots
          .map(({ slot }) => Math.floor(slot))
          .filter((slot) => Number.isFinite(slot) && slot >= 1 && slot <= maxSlots)
      : resolveVisibleSlots(count);
    if (!slots.length) return "";

    const orderBySlot = new Map(
      (orderedSlots ?? []).map(({ slot, order }) => [Math.floor(slot), order])
    );

    return Array.from(new Set(slots))
      .map((slot) => {
        const order = orderBySlot.get(slot);
        const orderDecl = Number.isFinite(order) ? ` order:${order};` : "";
        return `${rootSel} [data-rmg-skel-slot="${slot}"]{ display:block;${orderDecl} }`;
      })
      .join("\n");
  };

  lines.push(showResolvedSlots(baseCount));

  for (const r of rules.slice(1)) {
    lines.push(
      `@media (min-width:${r.minWidth}px){\n${slotSel}{ display:none; }\n${showResolvedSlots(r.count)}\n}`
    );
  }

  return { cssText: lines.join("\n"), ssrBaseCount: baseCount };
}
