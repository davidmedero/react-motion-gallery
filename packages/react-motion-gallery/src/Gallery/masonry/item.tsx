import * as React from "react";

import type { BreakpointMap } from "../shared/responsive";
import type {
  MasonryItemProps,
  MasonrySpan,
  ResponsiveMasonrySpan,
} from "./types";

export type MasonryItemLayoutMeta = {
  span?: ResponsiveMasonrySpan;
  revealKey?: React.Key;
  placeholder?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export type MasonryCell = {
  id: string;
  node: React.ReactNode;
  layoutMeta?: MasonryItemLayoutMeta;
  sourceIndex?: number;
};

type MasonryItemComponent = React.FC<MasonryItemProps> & {
  __rmgMasonryItem: true;
};

export const MasonryItem = Object.assign(
  function MasonryItem({ children }: MasonryItemProps) {
    return React.createElement(React.Fragment, null, children);
  },
  {
    __rmgMasonryItem: true as const,
    displayName: "Masonry.Item",
  }
) as MasonryItemComponent;

function parseBreakpointMinWidth(key: string, breakpointMap: BreakpointMap): number {
  const mapped = breakpointMap[key];
  if (typeof mapped === "number" && Number.isFinite(mapped)) return mapped;

  const parsed = parseFloat(key);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function normalizeMasonrySpanValue(value: MasonrySpan | undefined): MasonrySpan | undefined {
  if (value === "full") return value;
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.max(1, value | 0);
}

function unwrapMasonryItemChildren(children: React.ReactNode): React.ReactNode | null {
  const items = React.Children.toArray(children);

  if (items.length === 0) return null;
  if (items.length === 1) return items[0] ?? null;

  return React.createElement(React.Fragment, null, children);
}

export function isMasonryItemElement(
  node: React.ReactNode
): node is React.ReactElement<MasonryItemProps> {
  return React.isValidElement(node) && Boolean((node.type as any)?.__rmgMasonryItem);
}

export function normalizeMasonryChild(node: React.ReactNode): {
  node: React.ReactNode | null;
  layoutMeta?: MasonryItemLayoutMeta;
} {
  if (!isMasonryItemElement(node)) return { node };

  const layoutMeta: MasonryItemLayoutMeta = {
    span: node.props.span,
    revealKey: node.props.revealKey,
    placeholder: node.props.placeholder === true,
    className: node.props.className,
    style: node.props.style,
  };

  return {
    node: unwrapMasonryItemChildren(node.props.children),
    layoutMeta,
  };
}

export function isResponsiveMasonrySpanMap(
  value: ResponsiveMasonrySpan | undefined
): value is Record<string, MasonrySpan> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function normalizeResponsiveMasonrySpanRules(
  value: ResponsiveMasonrySpan | undefined,
  breakpointMap: BreakpointMap
): Array<{ minWidth: number; span: MasonrySpan }> {
  if (!isResponsiveMasonrySpanMap(value)) {
    const span = normalizeMasonrySpanValue(value);
    return span == null ? [] : [{ minWidth: 0, span }];
  }

  const entries = Object.entries(value)
    .map(([key, rawSpan]) => ({
      minWidth: parseBreakpointMinWidth(key, breakpointMap),
      span: normalizeMasonrySpanValue(rawSpan),
    }))
    .filter((entry): entry is { minWidth: number; span: MasonrySpan } => entry.span != null)
    .sort((a, b) => a.minWidth - b.minWidth);

  if (entries.length === 0) return [];

  if (entries[0].minWidth > 0) {
    entries.unshift({ minWidth: 0, span: entries[0].span });
  } else if (entries[0].minWidth < 0) {
    entries[0] = { ...entries[0], minWidth: 0 };
  }

  return entries;
}

export function clampResolvedMasonrySpan(
  span: MasonrySpan | undefined,
  columnCount: number
): number {
  const safeColumnCount = Math.max(1, columnCount | 0);
  if (span === "full") return safeColumnCount;
  if (typeof span !== "number" || !Number.isFinite(span)) return 1;

  return Math.max(1, Math.min(safeColumnCount, span | 0));
}

export function resolveMasonrySpanAtWidth(args: {
  span?: ResponsiveMasonrySpan;
  columnCount: number;
  width: number;
  breakpointMap: BreakpointMap;
}): number {
  const { span, columnCount, width, breakpointMap } = args;
  const rules = normalizeResponsiveMasonrySpanRules(span, breakpointMap);

  if (!rules.length) return 1;

  let resolved = rules[0]!.span;
  for (const rule of rules) {
    if (width >= rule.minWidth) resolved = rule.span;
    else break;
  }

  return clampResolvedMasonrySpan(resolved, columnCount);
}
