import { BreakpointMap, normalizeResponsiveToMinWidthRules, ResponsiveNumber } from "../responsive";

export function buildScopedSkeletonCountCss(args: {
  scopeId: string;
  responsiveCount: ResponsiveNumber | undefined;
  fallbackCount: number;
  breakpointMap: BreakpointMap;
  maxSlots: number;
}): { cssText: string; ssrBaseCount: number } {
  const { scopeId, responsiveCount, fallbackCount, breakpointMap, maxSlots } = args;

  const rules = normalizeResponsiveToMinWidthRules(responsiveCount, fallbackCount, breakpointMap);

  const clamp = (n: number) => Math.max(0, Math.min(maxSlots, Math.floor(n)));

  const baseCount = clamp(rules[0]?.count ?? fallbackCount);

  const rootSel = `[data-rmg-scope="${scopeId}"]`;
  const slotSel = `${rootSel} [data-rmg-skel-slot]`;

  const lines: string[] = [];

  lines.push(`${slotSel}{ display:none; }`);

  const showFirstN = (count: number) => {
    const c = clamp(count);
    if (c <= 0) return '';
    return Array.from({ length: c })
      .map((_, i) => `${rootSel} [data-rmg-skel-slot="${i + 1}"]{ display:block; }`)
      .join('\n');
  };

  lines.push(showFirstN(baseCount));

  for (const r of rules.slice(1)) {
    const c = clamp(r.count);
    lines.push(`@media (min-width:${r.minWidth}px){\n${showFirstN(c)}\n}`);
  }

  return { cssText: lines.join('\n'), ssrBaseCount: baseCount };
}