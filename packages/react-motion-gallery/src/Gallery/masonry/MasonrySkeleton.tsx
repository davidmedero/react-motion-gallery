/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import type { BreakpointMap, ResponsiveNumber } from "../shared/responsive";
import { parseNumberLike } from "../shared/responsive";
import type { MasonryClassNames } from "./Masonry";

export type SkeletonLength = number | string;

export type SkeletonShimmer = {
  enabled?: boolean;
  durationMs?: number;
  angleDeg?: number;
  opacity?: number;
  blurPx?: number;
  timing?: string;
  c1?: string;
  c2?: string;
  c3?: string;
};

export type MasonryPlacement = "balanced" | "roundRobin";

export type MasonrySkeletonSpec = {
  className?: string;
  ratios?: number[];
  heightsPx?: number[];
  backgroundColor?: string;
  highlightColor?: string;
  radius?: SkeletonLength;
  shimmer?: SkeletonShimmer;
};

export type MasonrySkeletonCardProps = {
  count: number;
  columns?: ResponsiveNumber;
  gap?: ResponsiveNumber;
  breakpoints?: BreakpointMap;
  classNames?: MasonryClassNames;
  ratios?: number[];
  heightsPx?: number[];
  placement?: MasonryPlacement;
  estimatedItemHeight?: number;
  spec?: MasonrySkeletonSpec;
};

function cssLen(v: SkeletonLength | undefined): string | undefined {
  if (v == null) return undefined;
  return typeof v === "number" ? `${v}px` : v;
}

function escapeAttrValue(v: string) {
  return v.replace(/"/g, '\\"');
}

function sanitizeIdForAttr(id: string) {
  return id.replace(/[^a-zA-Z0-9_-]/g, "_");
}

type Rule = { minWidth: number; value: number };

function normalizeRulesFromResponsiveNumber(
  val: ResponsiveNumber | undefined,
  breakpoints?: BreakpointMap
): Rule[] {
  if (!val) return [];
  if (typeof val === "number") return [];
  if (typeof val === "string") return [];
  if (typeof val !== "object") return [];

  const rules: Rule[] = [];

  for (const [k, raw] of Object.entries(val as Record<string, any>)) {
    const value = Number(raw);
    if (!Number.isFinite(value)) continue;

    if (String(+k) === k) {
      const minWidth = +k;
      if (Number.isFinite(minWidth) && minWidth >= 0) rules.push({ minWidth, value });
      continue;
    }

    const bp = breakpoints?.[k as keyof BreakpointMap];
    if (typeof bp === "number" && Number.isFinite(bp)) {
      rules.push({ minWidth: bp, value });
      continue;
    }
  }

  rules.sort((a, b) => a.minWidth - b.minWidth);

  const out: Rule[] = [];
  for (const r of rules) {
    const last = out[out.length - 1];
    if (last && last.minWidth === r.minWidth) last.value = r.value;
    else out.push(r);
  }
  return out;
}

function resolveBaseNumberFromResponsive(
  val: ResponsiveNumber | undefined,
  rules: Rule[],
  fallback: number
): number {
  if (val == null) return fallback;
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const n = Number(val);
    return Number.isFinite(n) ? n : fallback;
  }
  if (rules.length) return rules[0]!.value;
  return fallback;
}

function valueAtMinWidth(rules: Rule[], minWidth: number, base: number) {
  let out = base;
  for (const r of rules) {
    if (r.minWidth <= minWidth) out = r.value;
    else break;
  }
  return out;
}

function defaultMasonrySpec(): MasonrySkeletonSpec {
  return {
    ratios: [55, 90, 130, 75],
    radius: 12,
  };
}

type FlexState = {
  minWidth: number;
  columns: number;
  gapPx: number;
  key: string;
};

function buildFlexStates(args: {
  columnsRules: Rule[];
  gapRules: Rule[];
  baseColumns: number;
  baseGapPx: number;
}) {
  const { columnsRules, gapRules, baseColumns, baseGapPx } = args;

  const mins = new Set<number>([0]);
  for (const r of columnsRules) mins.add(r.minWidth);
  for (const r of gapRules) mins.add(r.minWidth);

  const sorted = Array.from(mins).sort((a, b) => a - b);

  const states: FlexState[] = [];
  let prevKey = "";

  for (const minWidth of sorted) {
    const colsRaw = valueAtMinWidth(columnsRules, minWidth, baseColumns);
    const gapRaw = valueAtMinWidth(gapRules, minWidth, baseGapPx);

    const columns = Math.max(1, (colsRaw as any) | 0);
    const gapPx = Math.max(0, parseNumberLike(gapRaw as any, baseGapPx));

    const key = `c${columns}_g${gapPx}`;
    if (key === prevKey) continue;

    states.push({ minWidth, columns, gapPx, key });
    prevKey = key;
  }

  return states.length
    ? states
    : [
        {
          minWidth: 0,
          columns: baseColumns,
          gapPx: baseGapPx,
          key: `c${baseColumns}_g${baseGapPx}`,
        },
      ];
}

function buildFlexVariantVisibilityCss(scopeId: string, states: FlexState[]) {
  const scopeSel = `[data-rmg-mskel-scope="${escapeAttrValue(scopeId)}"]`;
  const lines: string[] = [];

  lines.push(
    `${scopeSel} [data-rmg-mskel-variant]{` +
      `width:100%;` +
      `align-items:flex-start;` +
    `}`
  );

  lines.push(
    `${scopeSel} [data-rmg-mskel-variant][style]{` +
      `column-gap: inherit;` +
    `}`
  );

  lines.push(`${scopeSel} [data-rmg-mskel-variant]{display:none !important;}`);

  const base = states[0]!;
  lines.push(`${scopeSel} [data-rmg-mskel-variant="${base.key}"]{display:flex !important;}`);

  for (const st of states) {
    if (st.minWidth <= 0) continue;
    lines.push(
      `@media (min-width:${st.minWidth}px){` +
        `${scopeSel} [data-rmg-mskel-variant]{display:none !important;}` +
        `${scopeSel} [data-rmg-mskel-variant="${st.key}"]{display:flex !important;}` +
      `}`
    );
  }

  return lines.join("\n");
}

function getColumnIndex(args: {
  i: number;
  colCount: number;
  placement: MasonryPlacement;
  colHeights: number[];
}) {
  const { i, colCount, placement, colHeights } = args;

  if (placement === "roundRobin") return i % colCount;

  let minIdx = 0;
  let minVal = colHeights[0] ?? 0;
  for (let c = 1; c < colCount; c++) {
    const v = colHeights[c] ?? 0;
    if (v < minVal) {
      minVal = v;
      minIdx = c;
    }
  }
  return minIdx;
}

export function MasonrySkeletonCard(props: MasonrySkeletonCardProps) {
  const { count, columns, gap, breakpoints, classNames, ratios, placement, spec } = props;

  const s = spec ?? defaultMasonrySpec();

  const DEFAULT_RATIOS = (s.ratios ?? defaultMasonrySpec().ratios!) as number[];
  const MIN_RATIO = 25;
  const MAX_RATIO = 220;

  const safeRatios =
    (Array.isArray(ratios) && ratios.length
      ? ratios
      : Array.isArray(s.ratios) && s.ratios.length
      ? s.ratios
      : DEFAULT_RATIOS)
      .map((r) => Number(r))
      .filter((r) => Number.isFinite(r))
      .map((r) => Math.max(MIN_RATIO, Math.min(MAX_RATIO, r)));

  const safeHeights =
    (Array.isArray(props.heightsPx) && props.heightsPx.length
      ? props.heightsPx
      : Array.isArray(s.heightsPx) && s.heightsPx.length
      ? s.heightsPx
      : null)
      ?.map((n) => Number(n))
      .filter((n) => Number.isFinite(n) && n > 0);

  const estimated = Math.max(0, (props.estimatedItemHeight ?? 0) | 0);

  function predictedHeight(i: number) {
    if (safeHeights?.length) return safeHeights[i % safeHeights.length]!;
    if (safeRatios.length) return Math.round((safeRatios[i % safeRatios.length] / 100) * 240);
    return estimated || 240;
  }

  const reactId = React.useId();
  const scopeId = React.useMemo(() => `mskel_${sanitizeIdForAttr(reactId)}`, [reactId]);

  const columnsRules = React.useMemo(
    () => normalizeRulesFromResponsiveNumber(columns, breakpoints),
    [columns, breakpoints]
  );
  const gapRules = React.useMemo(
    () => normalizeRulesFromResponsiveNumber(gap, breakpoints),
    [gap, breakpoints]
  );

  const baseColumnsRaw = resolveBaseNumberFromResponsive(columns, columnsRules, 4);
  const baseGapRaw = resolveBaseNumberFromResponsive(gap, gapRules, 8);

  const baseColumns = Math.max(1, (baseColumnsRaw as any) | 0);
  const baseGapPx = Math.max(0, parseNumberLike(baseGapRaw as any, 8));

  const rootStyle: React.CSSProperties = {
    ...(s.backgroundColor
      ? ({ ["--rmg-skel-bg" as any]: s.backgroundColor } as any)
      : null),
    ...(s.radius != null
      ? ({ ["--rmg-skel-radius" as any]: cssLen(s.radius) } as any)
      : null),
    ...(s.shimmer?.enabled === false
      ? ({ ["--rmg-skel-shimmer-enabled" as any]: "0" } as any)
      : null),
    ...(s.shimmer?.durationMs != null
      ? ({ ["--rmg-skel-shimmer-duration" as any]: `${s.shimmer!.durationMs}ms` } as any)
      : null),
    ...(s.shimmer?.angleDeg != null
      ? ({ ["--rmg-skel-shimmer-angle" as any]: `${s.shimmer!.angleDeg}deg` } as any)
      : null),
          ...(s.shimmer?.opacity != null
      ? ({ ["--rmg-skel-shimmer-opacity" as any]: String(s.shimmer!.opacity) } as any)
      : null),
    ...(s.shimmer?.blurPx != null
      ? ({ ["--rmg-skel-shimmer-blur" as any]: `${s.shimmer!.blurPx}px` } as any)
      : null),
    ...(s.shimmer?.timing != null
      ? ({ ["--rmg-skel-shimmer-timing" as any]: s.shimmer!.timing } as any)
      : null),
    ...(s.shimmer?.c1 != null
      ? ({ ["--rmg-skel-shimmer-c1" as any]: s.shimmer!.c1 } as any)
      : null),
    ...(s.shimmer?.c2 != null
      ? ({ ["--rmg-skel-shimmer-c2" as any]: s.shimmer!.c2 } as any)
      : null),
    ...(s.shimmer?.c3 != null
      ? ({ ["--rmg-skel-shimmer-c3" as any]: s.shimmer!.c3 } as any)
      : null),
  };

  const states = React.useMemo(
    () => buildFlexStates({ columnsRules, gapRules, baseColumns, baseGapPx }),
    [columnsRules, gapRules, baseColumns, baseGapPx]
  );

  const visibilityCss = React.useMemo(
    () => buildFlexVariantVisibilityCss(scopeId, states),
    [scopeId, states]
  );

  const effectivePlacement: MasonryPlacement =
    placement ?? "balanced";

  const variants = React.useMemo(() => {
    return states.map((st) => {
      const colCount = st.columns;
      const gapPx = st.gapPx;

      const cols: React.ReactNode[][] = Array.from({ length: colCount }, () => []);
      const colHeights = Array.from({ length: colCount }, () => 0);

      for (let i = 0; i < Math.max(0, count | 0); i++) {
        const h = predictedHeight(i);

        const colIdx = getColumnIndex({
          i,
          colCount,
          placement: effectivePlacement,
          colHeights,
        });

        colHeights[colIdx] += h + gapPx;

        cols[colIdx].push(
          <div
            key={`rmg-mskel-${st.key}-${i}`}
            className={classNames?.item}
            style={{ height: `${h}px`, marginBottom: `${gapPx}px` }}
          />
        );
      }

      return (
        <div
          key={st.key}
          data-rmg-mskel-variant={st.key}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "flex-start",
            columnGap: `${gapPx}px`,
          }}
        >
          {cols.map((children, c) => (
            <div
              key={c}
              className={classNames?.column}
              style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}
            >
              {children}
            </div>
          ))}
        </div>
      );
    });
  }, [states, count, effectivePlacement, classNames?.item, classNames?.column, predictedHeight]);

  return (
    <div
      data-rmg-mskel-scope={scopeId}
      className={classNames?.root}
      style={{ ...rootStyle, width: "100%" }}
    >
      {visibilityCss ? <style dangerouslySetInnerHTML={{ __html: visibilityCss }} /> : null}
      {variants}
    </div>
  );
}