import * as React from "react";

import type { BreakpointMap } from "../shared/responsive";
import type { GridItemProps, GridSpan, ResponsiveGridSpan } from "./types";

export type GridItemLayoutMeta = {
  span?: ResponsiveGridSpan;
  className?: string;
  style?: React.CSSProperties;
};

export type GridCell = {
  id: string;
  node: React.ReactNode;
  layoutMeta?: GridItemLayoutMeta;
};

type GridItemComponent = React.FC<GridItemProps> & {
  __rmgGridItem: true;
};

export const GridItem = Object.assign(
  function GridItem({ children }: GridItemProps) {
    return React.createElement(React.Fragment, null, children);
  },
  {
    __rmgGridItem: true as const,
    displayName: "Grid.Item",
  }
) as GridItemComponent;

function parseBreakpointMinWidth(key: string, breakpointMap: BreakpointMap): number {
  const mapped = breakpointMap[key];
  if (typeof mapped === "number" && Number.isFinite(mapped)) return mapped;

  const parsed = parseFloat(key);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function normalizeGridSpanValue(value: GridSpan | undefined): GridSpan | undefined {
  if (value === "full") return value;
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.max(1, value | 0);
}

function unwrapGridItemChildren(children: React.ReactNode): React.ReactNode | null {
  const items = React.Children.toArray(children);

  if (items.length === 0) return null;
  if (items.length === 1) return items[0] ?? null;

  return React.createElement(React.Fragment, null, children);
}

export function isGridItemElement(
  node: React.ReactNode
): node is React.ReactElement<GridItemProps> {
  return React.isValidElement(node) && Boolean((node.type as any)?.__rmgGridItem);
}

export function normalizeGridChild(node: React.ReactNode): {
  node: React.ReactNode | null;
  layoutMeta?: GridItemLayoutMeta;
} {
  if (!isGridItemElement(node)) return { node };

  const layoutMeta: GridItemLayoutMeta = {
    span: node.props.span,
    className: node.props.className,
    style: node.props.style,
  };

  return {
    node: unwrapGridItemChildren(node.props.children),
    layoutMeta,
  };
}

export function isResponsiveGridSpanMap(
  value: ResponsiveGridSpan | undefined
): value is Record<string, GridSpan> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function normalizeResponsiveGridSpanRules(
  value: ResponsiveGridSpan | undefined,
  breakpointMap: BreakpointMap
): Array<{ minWidth: number; span: GridSpan }> {
  if (!isResponsiveGridSpanMap(value)) {
    const span = normalizeGridSpanValue(value);
    return span == null ? [] : [{ minWidth: 0, span }];
  }

  const entries = Object.entries(value)
    .map(([key, rawSpan]) => ({
      minWidth: parseBreakpointMinWidth(key, breakpointMap),
      span: normalizeGridSpanValue(rawSpan),
    }))
    .filter((entry): entry is { minWidth: number; span: GridSpan } => entry.span != null)
    .sort((a, b) => a.minWidth - b.minWidth);

  if (entries.length === 0) return [];

  if (entries[0].minWidth > 0) {
    entries.unshift({ minWidth: 0, span: entries[0].span });
  } else if (entries[0].minWidth < 0) {
    entries[0] = { ...entries[0], minWidth: 0 };
  }

  return entries;
}

export function resolveGridColumnFromSpan(span: GridSpan | undefined): string | undefined {
  const normalized = normalizeGridSpanValue(span);

  if (normalized === "full") return "1 / -1";
  if (typeof normalized !== "number") return undefined;

  return `span ${normalized} / span ${normalized}`;
}

export function resolveInlineGridItemSpanStyle(args: {
  span?: ResponsiveGridSpan;
  allowSpan: boolean;
}): React.CSSProperties | undefined {
  if (!args.allowSpan || isResponsiveGridSpanMap(args.span)) return undefined;

  const gridColumn = resolveGridColumnFromSpan(args.span);
  return gridColumn ? { gridColumn } : undefined;
}
