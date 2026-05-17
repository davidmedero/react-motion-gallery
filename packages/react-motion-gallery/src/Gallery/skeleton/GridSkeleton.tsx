import * as React from "react";

import {
  BREAKPOINT_MAP,
  normalizeResponsiveToMinWidthRules,
  type BreakpointMap,
  type ResponsiveNumber,
} from "../shared/responsive";
import styles from "./GridSkeleton.module.css";
import sharedSkeletonStyles from "../shared/skeleton/layout.module.css";
import {
  applySkeletonTextSnapshot,
  type SkeletonBaseStyle,
  type SkeletonBaseStyleResponsive,
  type SkeletonContainerStyle,
  type SkeletonContainerStyleResponsive,
  type SkeletonLayoutRoot,
  type SkeletonLength,
  type SkeletonNode as SharedSkeletonNode,
  type SkeletonResponsiveCssEntry,
  type SkeletonShimmer,
  type SkeletonWrapStyle,
  SkeletonLayoutNode,
  applyBoxMargins,
  buildResponsiveCssText,
  collectResponsiveCss,
  containerStylesPlain,
  cssLen,
  escapeAttrValue,
  resolveInlineResponsiveContainerStyle,
  shimmerStyleVars,
  wrapStyleVars,
} from "../shared/skeleton/layout";
import { buildStableScopeId } from "../shared/stableScope";
import {
  isResponsiveGridSpanMap,
  normalizeResponsiveGridSpanRules,
  resolveGridColumnFromSpan,
  resolveInlineGridItemSpanStyle,
} from "../grid/item";
import type { ResponsiveGridSpan, ResponsiveGridTemplate } from "../grid/types";
import type { SkeletonCacheSnapshot } from "./cache";

export type {
  SkeletonBaseStyle,
  SkeletonBaseStyleResponsive,
  SkeletonContainerStyle,
  SkeletonContainerStyleResponsive,
  SkeletonLength,
  SkeletonShimmer,
} from "../shared/skeleton/layout";

export type GridSkeletonWrapStyle = SkeletonWrapStyle;
export type SkeletonNode = SharedSkeletonNode;
export type GridSkeletonSlot = {
  item?: SkeletonNode;
  itemWrapStyle?: GridSkeletonWrapStyle;
  span?: ResponsiveGridSpan;
};
export type GridSkeletonLayoutNode = SkeletonLayoutRoot<"grid"> & {
  slots?: GridSkeletonSlot[];
};
export type GridSkeletonNode = GridSkeletonLayoutNode | SharedSkeletonNode;

export type GridSkeletonSpec = {
  className?: string;
  layout?: GridSkeletonNode;
  backgroundColor?: string;
  radius?: SkeletonLength;
  shimmer?: SkeletonShimmer;
};

export type GridSkeletonCardProps = {
  count: number;
  gridStyle?: React.CSSProperties;
  spec?: GridSkeletonSpec;
  breakpoints?: BreakpointMap;
  columns?: ResponsiveNumber;
  templateColumns?: ResponsiveGridTemplate;
  minColumnWidth?: number | string;
  gap?: ResponsiveNumber;
  items?: Array<{
    id: string;
    span?: ResponsiveGridSpan;
  }>;
  allowItemSpans?: boolean;
  disableShimmer?: boolean;
  cacheSnapshot?: SkeletonCacheSnapshot | null;
};

function isResponsiveMap(
  value: ResponsiveNumber | undefined
): value is Record<string, number> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isResponsiveGridTemplateMap(
  value: ResponsiveGridTemplate | undefined
): value is Record<string, string> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function parseBreakpointMinWidth(key: string, breakpointMap: BreakpointMap): number {
  const mapped = breakpointMap[key];
  if (typeof mapped === "number" && Number.isFinite(mapped)) return mapped;

  const parsed = parseFloat(key);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function normalizeResponsiveGridTemplateRules(args: {
  templateColumns: ResponsiveGridTemplate | undefined;
  breakpointMap: BreakpointMap;
}): Array<{ minWidth: number; template: string }> {
  const { templateColumns, breakpointMap } = args;

  if (!isResponsiveGridTemplateMap(templateColumns)) return [];

  const entries = Object.entries(templateColumns)
    .map(([key, template]) => ({
      minWidth: parseBreakpointMinWidth(key, breakpointMap),
      template: typeof template === "string" ? template.trim() : "",
    }))
    .filter((entry) => entry.template.length > 0)
    .sort((a, b) => a.minWidth - b.minWidth);

  if (entries.length === 0) return [];

  if (entries[0].minWidth > 0) {
    entries.unshift({ minWidth: 0, template: entries[0].template });
  } else if (entries[0].minWidth < 0) {
    entries[0] = { ...entries[0], minWidth: 0 };
  }

  return entries;
}

function buildGridSkeletonTracksCss(args: {
  scopeId: string;
  columns?: ResponsiveNumber;
  templateColumns?: ResponsiveGridTemplate;
  gap?: ResponsiveNumber;
  breakpointMap: BreakpointMap;
  fallbackGap: number;
}) {
  const { scopeId, columns, templateColumns, gap, breakpointMap, fallbackGap } = args;
  const scopeSelector = `[data-rmg-grid-skel-scope="${escapeAttrValue(scopeId)}"]`;
  const target = `${scopeSelector} .${styles.gridSkeletonGrid}`;
  const lines: string[] = [];

  const pushRule = (minWidth: number, declarations: string[]) => {
    if (!declarations.length) return;

    const rule = `${target}{${declarations.join("")}}`;
    if (minWidth <= 0) {
      lines.push(rule);
      return;
    }

    lines.push(`@media (min-width:${minWidth}px){${rule}}`);
  };

  const templateRules = normalizeResponsiveGridTemplateRules({
    templateColumns,
    breakpointMap,
  });

  if (templateRules.length > 0) {
    for (const rule of templateRules) {
      pushRule(rule.minWidth, [`grid-template-columns:${rule.template};`]);
    }
  } else if (isResponsiveMap(columns)) {
    const rules = normalizeResponsiveToMinWidthRules(columns, 1, breakpointMap);
    for (const rule of rules) {
      pushRule(rule.minWidth, [
        `grid-template-columns:repeat(${Math.max(1, rule.count | 0)}, minmax(0, 1fr));`,
      ]);
    }
  }

  if (isResponsiveMap(gap)) {
    const rules = normalizeResponsiveToMinWidthRules(gap, fallbackGap, breakpointMap);
    for (const rule of rules) {
      pushRule(rule.minWidth, [`--rmg-grid-gap:${Math.max(0, rule.count | 0)}px;`]);
    }
  }

  return lines.join("\n");
}

function buildGridSkeletonItemSpanCss(args: {
  scopeId: string;
  items: Array<{
    id: string;
    span?: ResponsiveGridSpan;
  }>;
  breakpointMap: BreakpointMap;
  allowSpan: boolean;
}) {
  const { scopeId, items, breakpointMap, allowSpan } = args;
  if (!allowSpan) return "";

  const lines: string[] = [];
  const scopeSelector = `[data-rmg-grid-skel-scope="${escapeAttrValue(scopeId)}"]`;

  for (const item of items) {
    const span = item.span;
    if (!isResponsiveGridSpanMap(span)) continue;

    const selector = `${scopeSelector} [data-rmg-grid-item-key="${escapeAttrValue(item.id)}"]`;
    const rules = normalizeResponsiveGridSpanRules(span, breakpointMap);

    for (const rule of rules) {
      const gridColumn = resolveGridColumnFromSpan(rule.span);
      if (!gridColumn) continue;

      const cssRule = `${selector}{grid-column:${gridColumn};}`;
      if (rule.minWidth <= 0) {
        lines.push(cssRule);
        continue;
      }

      lines.push(`@media (min-width:${rule.minWidth}px){${cssRule}}`);
    }
  }

  return lines.join("\n");
}

function buildBaseGridStyle(args: {
  gridStyle?: React.CSSProperties;
  columns?: ResponsiveNumber;
  templateColumns?: ResponsiveGridTemplate;
  minColumnWidth?: number | string;
  gap?: ResponsiveNumber;
}) {
  const style: React.CSSProperties = {
    ...(args.gridStyle || {}),
  };

  if (args.minColumnWidth != null && (style as any)["--rmg-grid-min"] == null) {
    (style as any)["--rmg-grid-min"] =
      typeof args.minColumnWidth === "number"
        ? `${args.minColumnWidth}px`
        : args.minColumnWidth;
  }

  if (
    !isResponsiveMap(args.gap) &&
    args.gap != null &&
    (style as any)["--rmg-grid-gap"] == null
  ) {
    (style as any)["--rmg-grid-gap"] =
      typeof args.gap === "number"
        ? `${Math.max(0, args.gap | 0)}px`
        : String(args.gap);
  }

  if (
    !isResponsiveGridTemplateMap(args.templateColumns) &&
    typeof args.templateColumns === "string" &&
    args.templateColumns.trim().length > 0 &&
    style.gridTemplateColumns == null
  ) {
    style.gridTemplateColumns = args.templateColumns.trim();
  } else if (
    args.templateColumns == null &&
    !isResponsiveMap(args.columns) &&
    typeof args.columns === "number" &&
    Number.isFinite(args.columns) &&
    style.gridTemplateColumns == null
  ) {
    style.gridTemplateColumns = `repeat(${Math.max(1, args.columns | 0)}, minmax(0, 1fr))`;
  }

  return style;
}

function defaultGridSpec(): GridSkeletonSpec {
  const item: SkeletonNode = {
    kind: "rect",
    style: { width: "100%", aspectRatio: 1, borderRadius: 12 },
  };

  return {
    layout: {
      kind: "grid",
      item,
      itemWrapStyle: undefined,
    },
    radius: 12,
  };
}

function mergeWrapStyles(
  base: GridSkeletonWrapStyle | undefined,
  override: GridSkeletonWrapStyle | undefined
): GridSkeletonWrapStyle | undefined {
  if (!base && !override) return undefined;
  return {
    ...(base || {}),
    ...(override || {}),
  };
}

function resolveGridSlot(
  grid: GridSkeletonLayoutNode,
  slotIndex: number
): { item: SkeletonNode; itemWrapStyle: GridSkeletonWrapStyle | undefined } {
  const slot = grid.slots?.[slotIndex];
  return {
    item: slot?.item ?? grid.item,
    itemWrapStyle: mergeWrapStyles(grid.itemWrapStyle, slot?.itemWrapStyle),
  };
}

function splitGridItemWrapStyles(
  itemWrapStyle: GridSkeletonWrapStyle | undefined
): {
  outerStyle: React.CSSProperties | undefined;
  innerStyle: React.CSSProperties | undefined;
} {
  if (!itemWrapStyle) {
    return {
      outerStyle: undefined,
      innerStyle: undefined,
    };
  }

  const innerStyle = wrapStyleVars(itemWrapStyle);
  const outerStyle: React.CSSProperties = {};

  if (innerStyle.boxShadow != null) {
    (outerStyle as any)["--rmg-grid-skel-wrap-shadow"] = innerStyle.boxShadow;
    delete innerStyle.boxShadow;
  }

  if (innerStyle.borderRadius != null) {
    (outerStyle as any)["--rmg-grid-skel-wrap-shadow-radius"] = innerStyle.borderRadius;
  }

  return {
    outerStyle: Object.keys(outerStyle).length ? outerStyle : undefined,
    innerStyle,
  };
}

export function GridSkeletonCard({
  count,
  gridStyle,
  spec,
  breakpoints,
  columns,
  templateColumns,
  minColumnWidth,
  gap,
  items,
  allowItemSpans,
  disableShimmer,
  cacheSnapshot,
}: GridSkeletonCardProps) {
  const s = spec ?? defaultGridSpec();
  const effectiveBreakpoints = React.useMemo(
    () => ({ ...BREAKPOINT_MAP, ...(breakpoints ?? {}) }),
    [breakpoints]
  );

  const layoutSource: GridSkeletonNode = React.useMemo(() => {
    const source = s.layout ?? (defaultGridSpec().layout as GridSkeletonNode);
    return cacheSnapshot?.text
      ? (applySkeletonTextSnapshot(
          source,
          cacheSnapshot.text,
          "grid",
          effectiveBreakpoints
        ) as GridSkeletonNode)
      : source;
  }, [cacheSnapshot, effectiveBreakpoints, s.layout]);
  const scopeId = React.useMemo(() => {
    return buildStableScopeId("gskel_", {
      count,
      breakpoints: effectiveBreakpoints,
      gridStyle,
      spec,
      columns,
      templateColumns,
      minColumnWidth,
      gap,
      items,
      allowItemSpans,
      disableShimmer,
    });
  }, [
    count,
    effectiveBreakpoints,
    gridStyle,
    spec,
    columns,
    templateColumns,
    minColumnWidth,
    gap,
    items,
    allowItemSpans,
    disableShimmer,
  ]);

  const rootStyle: React.CSSProperties = {
    ...buildBaseGridStyle({
      gridStyle,
      columns,
      templateColumns,
      minColumnWidth,
      gap,
    }),
    ...(disableShimmer
      ? null
      : shimmerStyleVars(s.shimmer, {
          enabledVarName: "--rmg-skel-card-shimmer-enabled",
        })),
  };

  if (s.backgroundColor) (rootStyle as any)["--rmg-skel-bg"] = s.backgroundColor;
  if (s.radius != null) (rootStyle as any)["--rmg-skel-radius"] = cssLen(s.radius);

  const { layout, responsiveCss, itemLayouts } = React.useMemo(() => {
    let n = 0;
    const allocId = () => `n${++n}`;
    const collected: SkeletonResponsiveCssEntry[] = [];

    const withIds = collectResponsiveCss(
      layoutSource,
      allocId,
      collected,
      "grid",
      effectiveBreakpoints
    );
    const layoutCssText = buildResponsiveCssText({
      scopeAttr: "data-rmg-grid-skel-scope",
      scopeId,
      rules: collected,
    });
    const gridNode = layoutSource as GridSkeletonLayoutNode;
    const fallbackItems = Array.from(
      {
        length: Math.max(
          0,
          typeof gridNode.count === "number" ? gridNode.count | 0 : count | 0
        ),
      },
      (_, index) => ({
        id: `slot-${index}`,
        span: gridNode.slots?.[index]?.span,
      })
    );
    const itemLayouts = items ?? fallbackItems;
    const gridTracksCssText = buildGridSkeletonTracksCss({
      scopeId,
      columns,
      templateColumns,
      gap,
      breakpointMap: effectiveBreakpoints,
      fallbackGap: typeof gap === "number" && Number.isFinite(gap) ? gap : 8,
    });
    const itemSpanCssText = buildGridSkeletonItemSpanCss({
      scopeId,
      items: itemLayouts,
      breakpointMap: effectiveBreakpoints,
      allowSpan: !!allowItemSpans,
    });
    const cssText = [layoutCssText, gridTracksCssText, itemSpanCssText]
      .filter(Boolean)
      .join("\n");

    return { layout: withIds, responsiveCss: cssText, itemLayouts };
  }, [
    layoutSource,
    scopeId,
    effectiveBreakpoints,
    columns,
    templateColumns,
    gap,
    items,
    allowItemSpans,
  ]);

  const gridNode = layout as GridSkeletonLayoutNode;
  const gridNodeId = (gridNode as any).__rmgNodeId as string | undefined;
  const plainGridStyle = containerStylesPlain(
    resolveInlineResponsiveContainerStyle(
      gridNode.style,
      effectiveBreakpoints
    )
  );
  const cellCount =
    gridNode.count != null ? Math.max(0, gridNode.count | 0) : Math.max(0, count | 0);

  return (
    <div
      data-rmg-grid-skel-scope={scopeId}
      className={[styles.gridSkeletonOverlay, s.className].filter(Boolean).join(" ")}
    >
      {responsiveCss ? <style dangerouslySetInnerHTML={{ __html: responsiveCss }} /> : null}

      <div
        data-rmg-skel-node={gridNodeId}
        className={styles.gridSkeletonGrid}
        style={{
          ...rootStyle,
          ...(plainGridStyle || {}),
          display: "grid",
        }}
      >
        {Array.from({ length: cellCount }).map((_, index) => {
          const itemLayout = itemLayouts[index];
          const { item, itemWrapStyle } = resolveGridSlot(gridNode, index);
          const { outerStyle, innerStyle } = splitGridItemWrapStyles(itemWrapStyle);

          return (
            <div
              key={`rmg-grid-skel-${index}`}
              data-rmg-grid-item-key={itemLayout?.id}
              className={styles.gridSkeletonItem}
              style={{
                ...(resolveInlineGridItemSpanStyle({
                  span: itemLayout?.span,
                  allowSpan: !!allowItemSpans,
                }) || {}),
                ...(itemWrapStyle ? applyBoxMargins(itemWrapStyle) : null),
                ...(outerStyle || null),
              }}
            >
              <div
                className={[
                  styles.gridSkeletonItemInner,
                  disableShimmer ? null : sharedSkeletonStyles.skelCardShimmer,
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={innerStyle}
              >
                <SkeletonLayoutNode
                  node={item}
                  disableShimmer
                  breakpointMap={effectiveBreakpoints}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
