import * as React from 'react';
import styles from './Grid.module.css';
import {
  BREAKPOINT_MAP,
  effectiveViewportWidth,
  normalizeResponsiveToMinWidthRules,
  resolveNumberFromResponsive,
  type BreakpointMap,
  type ResponsiveNumber,
} from '../shared/responsive';
import { usePrefersReducedMotion } from '../shared/hooks/usePrefersReducedMotion';
import { useSkeletonRevealGate } from '../shared/loading/skeletonRevealGate';
import {
  resolveCompareLoadingLayerVisualState,
  resolveLoadingForceOptions,
  type LoadingForceOptions,
} from '../shared/loading/force';
import {
  useDoublePaintReady,
  useElementInViewOnce,
  waitForElementMediaReady,
} from '../shared/itemLifecycle';
import { RmgSlideProvider } from '../shared/slideContext';
import { createRmgSlideStoreBag } from '../shared/slideStoreBag';
import { buildStableScopeId } from '../shared/stableScope';
import {
  getDataPluginOptions,
  resolveDataWindow,
  useMeasuredVirtualWindow,
  type DataVirtualizationOptions,
} from '../shared/dataPlugins';
import {
  isResponsiveGridSpanMap,
  normalizeResponsiveGridSpanRules,
  resolveGridColumnFromSpan,
  resolveInlineGridItemSpanStyle,
  type GridCell,
  type GridItemLayoutMeta,
} from './item';
import {
  GridSkeletonCard,
  GridSkeletonSlotContent,
  type GridSkeletonSpec,
} from '../skeleton/GridSkeleton';
import { SkeletonFrame } from '../skeleton/base';
import {
  type GridFullscreenTrigger,
  type GridHandle,
  type GridLoadingOptions,
  type GridLoadingSkeletonArgs,
  type GridPlugin,
  type RevealOptions,
  type ResponsiveGridTemplate,
} from './types';

declare const process:
  | {
      env: {
        NODE_ENV?: string;
      };
    }
  | undefined;

type GridOptions = {
  columns?: ResponsiveNumber;
  templateColumns?: ResponsiveGridTemplate;
  minColumnWidth?: number | string;
  gap?: ResponsiveNumber;
  rootClassName?: string;
  itemClassName?: string;
  fullscreenTrigger?: GridFullscreenTrigger;
  plugins?: GridPlugin[];
  loading?: GridLoadingOptions;
};

type RenderableGridCell = GridCell & {
  placeholder?: boolean;
};

type GridRevealQueueItem = {
  key: React.Key;
  reveal: () => void;
};

type NormalizedGridLoading = {
  enabled: boolean;
  active: boolean;
  count: number;
  skeleton?: GridLoadingOptions['skeleton'];
  force?: LoadingForceOptions;
  animate: boolean;
  waitForMedia: boolean;
  decodeTimeoutMs: number;
  rootMargin: string;
  threshold: number;
  minVisibleMs: number;
  enterMs: number;
  exitMs: number;
  keepSkeletonMounted: boolean;
  rememberRevealed: boolean;
};

type NormalizedRevealOptions = RevealOptions & {
  staggerMs: number;
  durationMs: number;
  easing: string;
  disabled: boolean;
};

type GridItemHostProps = {
  as?: React.ElementType;
  itemKey: React.Key;
  index: number;
  revealKey?: React.Key;
  placeholder?: boolean;
  itemRef?: React.Ref<HTMLElement>;
  originalRef?: React.Ref<HTMLElement>;
  className?: string;
  style?: React.CSSProperties;
  originalProps?: Record<string, unknown>;
  children: React.ReactNode;
  renderSkeleton: (ready: boolean) => React.ReactNode;
  loading: NormalizedGridLoading;
  loadingForce?: LoadingForceOptions;
  reveal: NormalizedRevealOptions;
  revealGateActive: boolean;
  scheduleReveal: (key: React.Key, reveal: () => void) => () => void;
  revealedIndicesRef: React.RefObject<Set<number>>;
  revealedKeysRef: React.RefObject<Set<React.Key>>;
};

function resolveGridLoadingVisualState(args: {
  loadingActive: boolean;
  loadingForced?: LoadingForceOptions;
  shouldMountContent: boolean;
  contentReady: boolean;
  defaultReveal: boolean;
}) {
  const compareState = resolveCompareLoadingLayerVisualState({
    loadingActive: args.loadingActive && args.shouldMountContent,
    loadingForced: args.loadingForced,
    contentReady: args.contentReady,
  });
  const resolvedForce = resolveLoadingForceOptions(args.loadingForced);
  const forcedLoading = args.loadingActive && resolvedForce.enabled;

  return {
    compareMode: compareState.compareMode,
    revealContent: compareState.compareMode
      ? true
      : forcedLoading
        ? false
        : args.defaultReveal,
    loadingLayerOpacity: compareState.loadingLayerOpacity,
  };
}

function getGridCellRevealKey(cell: GridCell): React.Key {
  if (cell.layoutMeta?.revealKey != null) return cell.layoutMeta.revealKey;

  if (React.isValidElement(cell.node)) {
    const revealKey = (cell.node.props as any)?.['data-rmg-grid-reveal-key'];
    if (revealKey != null) return revealKey as React.Key;
  }

  return cell.id;
}

export type GridLayoutProps = {
  cells: GridCell[];
  grid: GridOptions;
  breakpoints?: BreakpointMap;
  viewportWidth: number;
  reveal: NormalizedRevealOptions;
  gridItemBaseClass?: string;
  revealReady?: boolean;
  renderMode?: 'wrap' | 'passthrough';
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

function isGridPlugin(value: unknown): value is GridPlugin {
  return (
    typeof value === 'object' &&
    value != null &&
    (value as GridPlugin).__rmgGridPlugin === true
  );
}

function isGridSkeletonSpec(value: unknown): value is GridSkeletonSpec {
  return (
    typeof value === 'object' &&
    value != null &&
    !('kind' in (value as Record<string, unknown>)) &&
    (value as GridSkeletonSpec).layout?.kind === 'grid'
  );
}

const warnedGridMessages = new Set<string>();
const VOID_HTML_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

function warnGridOnce(key: string, message: string) {
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') return;
  if (warnedGridMessages.has(key)) return;
  warnedGridMessages.add(key);
  console.warn(message);
}

function canHoistGridHostElement(type: unknown): type is string {
  return typeof type === 'string' && !VOID_HTML_ELEMENTS.has(type);
}

function isResponsiveMap(value: ResponsiveNumber | undefined): value is Record<string, number> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isResponsiveGridTemplateMap(
  value: ResponsiveGridTemplate | undefined
): value is Record<string, string> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function parseBreakpointMinWidth(key: string, breakpointMap: BreakpointMap): number {
  const mapped = breakpointMap[key];
  if (typeof mapped === 'number' && Number.isFinite(mapped)) return mapped;

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
      template: typeof template === 'string' ? template.trim() : '',
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

function resolveGridTemplateFromResponsive(args: {
  templateColumns: ResponsiveGridTemplate | undefined;
  viewportWidth: number;
  breakpointMap: BreakpointMap;
}): string | undefined {
  const { templateColumns, viewportWidth, breakpointMap } = args;

  if (typeof templateColumns === 'string') {
    const trimmed = templateColumns.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  const rules = normalizeResponsiveGridTemplateRules({ templateColumns, breakpointMap });
  if (!rules.length) return undefined;

  const vw = effectiveViewportWidth(viewportWidth);
  let resolved = rules[0]?.template;

  for (const rule of rules) {
    if (vw >= rule.minWidth) resolved = rule.template;
  }

  return resolved;
}

function buildScopedGridResponsiveCss(args: {
  scopeId: string;
  columns?: ResponsiveNumber;
  templateColumns?: ResponsiveGridTemplate;
  gap?: ResponsiveNumber;
  breakpointMap: BreakpointMap;
  fallbackGap: number;
}) {
  const { scopeId, columns, templateColumns, gap, breakpointMap, fallbackGap } = args;
  const scopeSelector = `[data-rmg-grid-scope="${scopeId}"]`;
  const targets = `${scopeSelector} [data-rmg-grid-node="true"]`;
  const lines: string[] = [];

  const pushRule = (minWidth: number, declarations: string[]) => {
    if (!declarations.length) return;

    const rule = `${targets}{${declarations.join('')}}`;
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

  return lines.join('\n');
}

function buildScopedGridItemSpanCss(args: {
  scopeId: string;
  cells: RenderableGridCell[];
  breakpointMap: BreakpointMap;
  allowSpan: boolean;
}) {
  const { scopeId, cells, breakpointMap, allowSpan } = args;
  if (!allowSpan) return '';

  const lines: string[] = [];
  const scopeSelector = `[data-rmg-grid-scope="${scopeId}"]`;

  for (const cell of cells) {
    const span = cell.layoutMeta?.span;
    if (!isResponsiveGridSpanMap(span)) continue;

    const selector = `${scopeSelector} [data-rmg-grid-item-key="${cell.id}"]`;
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

  return lines.join('\n');
}

function buildGridItemHostStyle(args: {
  originalStyle?: React.CSSProperties;
  layoutMeta?: GridItemLayoutMeta;
  allowSpan: boolean;
  revealStyle: React.CSSProperties & Record<string, any>;
}) {
  const { originalStyle, layoutMeta, allowSpan, revealStyle } = args;

  return {
    ...(originalStyle || {}),
    ...(resolveInlineGridItemSpanStyle({
      span: layoutMeta?.span,
      allowSpan,
    }) || {}),
    ...(layoutMeta?.style || {}),
    ...revealStyle,
  };
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === 'function') ref(value);
  else if (typeof ref === 'object') (ref as any).current = value;
}

function countGridTemplateTracks(template: string | undefined) {
  if (!template) return 0;

  let depth = 0;
  let tracks = 0;
  let token = '';
  let hasAutoRepeat = false;

  const countToken = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    const repeatMatch = trimmed.match(/^repeat\(\s*([^,\s]+)\s*,/i);
    if (repeatMatch) {
      const repeatCount = Number(repeatMatch[1]);
      if (Number.isFinite(repeatCount)) {
        tracks += Math.max(1, repeatCount | 0);
      } else {
        hasAutoRepeat = true;
      }
      return;
    }

    tracks += 1;
  };

  for (const char of template.trim()) {
    if (char === '(') depth += 1;
    if (char === ')') depth = Math.max(0, depth - 1);
    if (/\s/.test(char) && depth === 0) {
      countToken(token);
      token = '';
      continue;
    }

    token += char;
  }

  countToken(token);
  return hasAutoRepeat ? 0 : tracks;
}

function resolveGridVirtualColumnCount(args: {
  resolvedGridColumnCount?: number;
  resolvedGridTemplateColumns?: string;
  minWidth: string;
  viewportWidth: number;
}) {
  if (args.resolvedGridColumnCount && args.resolvedGridColumnCount > 0) {
    return args.resolvedGridColumnCount;
  }

  const templateTracks = countGridTemplateTracks(args.resolvedGridTemplateColumns);
  if (templateTracks > 0) return templateTracks;

  const min = parseFloat(args.minWidth);
  const safeMin = Number.isFinite(min) && min > 0 ? min : 160;
  const width = Math.max(1, effectiveViewportWidth(args.viewportWidth));
  return Math.max(1, Math.floor(width / safeMin));
}

function resolveGridSpanAtWidth(args: {
  layoutMeta?: GridItemLayoutMeta;
  allowSpan: boolean;
  columnCount: number;
  viewportWidth: number;
  breakpointMap: BreakpointMap;
}) {
  if (!args.allowSpan) return 1;

  const span = args.layoutMeta?.span;
  if (isResponsiveGridSpanMap(span)) {
    const rules = normalizeResponsiveGridSpanRules(span, args.breakpointMap);
    let resolved = rules[0]?.span;

    for (const rule of rules) {
      if (effectiveViewportWidth(args.viewportWidth) >= rule.minWidth) {
        resolved = rule.span;
      }
    }

    if (resolved === 'full') return args.columnCount;
    if (typeof resolved === 'number') {
      return Math.max(1, Math.min(args.columnCount, resolved | 0));
    }
    return 1;
  }

  if (span === 'full') return args.columnCount;
  if (typeof span === 'number' && Number.isFinite(span)) {
    return Math.max(1, Math.min(args.columnCount, span | 0));
  }
  return 1;
}

function buildGridVirtualRows(args: {
  cells: RenderableGridCell[];
  columnCount: number;
  allowSpan: boolean;
  viewportWidth: number;
  breakpointMap: BreakpointMap;
}) {
  const rowByCell = new Map<string, number>();
  const firstCellByRow = new Map<number, string>();
  let row = 0;
  let used = 0;

  args.cells.forEach((cell) => {
    const span = resolveGridSpanAtWidth({
      layoutMeta: cell.layoutMeta,
      allowSpan: args.allowSpan,
      columnCount: args.columnCount,
      viewportWidth: args.viewportWidth,
      breakpointMap: args.breakpointMap,
    });

    if (span >= args.columnCount) {
      if (used > 0) {
        row += 1;
        used = 0;
      }
      rowByCell.set(cell.id, row);
      firstCellByRow.set(row, firstCellByRow.get(row) ?? cell.id);
      row += 1;
      used = 0;
      return;
    }

    if (used > 0 && used + span > args.columnCount) {
      row += 1;
      used = 0;
    }

    rowByCell.set(cell.id, row);
    firstCellByRow.set(row, firstCellByRow.get(row) ?? cell.id);
    used += span;

    if (used >= args.columnCount) {
      row += 1;
      used = 0;
    }
  });

  return {
    rowByCell,
    firstCellByRow,
    rowCount: args.cells.length === 0 ? 0 : row + (used > 0 ? 1 : 0),
  };
}

function normalizeGridLoading(
  src: GridLoadingOptions | undefined,
  prefersReducedMotion: boolean
): NormalizedGridLoading {
  const enabled = src != null && src.enabled !== false;
  const exitMs =
    typeof src?.timing?.exitMs === 'number' && Number.isFinite(src.timing.exitMs)
      ? Math.max(0, src.timing.exitMs)
      : 220;
  const enterMs =
    typeof src?.timing?.enterMs === 'number' && Number.isFinite(src.timing.enterMs)
      ? Math.max(0, src.timing.enterMs)
      : exitMs;
  const animate = src?.animate ?? true;
  const minVisibleMs =
    typeof src?.timing?.minVisibleMs === 'number' &&
    Number.isFinite(src.timing.minVisibleMs)
      ? Math.max(0, src.timing.minVisibleMs)
      : 120;

  return {
    enabled,
    active: enabled && !!src?.active,
    count:
      typeof src?.count === 'number' && Number.isFinite(src.count)
        ? Math.max(0, src.count | 0)
        : 0,
    skeleton: src?.skeleton,
    force: src?.force,
    animate,
    waitForMedia: src?.waitForMedia ?? true,
    decodeTimeoutMs:
      typeof src?.decodeTimeoutMs === 'number' && Number.isFinite(src.decodeTimeoutMs)
        ? Math.max(0, src.decodeTimeoutMs)
        : 8000,
    rootMargin: src?.rootMargin ?? '0px',
    threshold:
      typeof src?.threshold === 'number' && Number.isFinite(src.threshold)
        ? src.threshold
        : 0.01,
    minVisibleMs,
    enterMs: prefersReducedMotion || !animate ? 0 : enterMs,
    exitMs: prefersReducedMotion || !animate ? 0 : exitMs,
    keepSkeletonMounted: src?.keepSkeletonMounted ?? false,
    rememberRevealed: src?.rememberRevealed ?? true,
  };
}

function getGridSkeletonSlotSpan(
  skeleton: GridLoadingOptions['skeleton'] | undefined,
  index: number
) {
  if (!isGridSkeletonSpec(skeleton)) return undefined;
  return skeleton.layout?.kind === 'grid' ? skeleton.layout.slots?.[index]?.span : undefined;
}

function getGridSkeletonDefaultCount(
  skeleton: GridLoadingOptions['skeleton'] | undefined
) {
  if (!isGridSkeletonSpec(skeleton)) return 0;
  return skeleton.layout?.kind === 'grid' && typeof skeleton.layout.count === 'number'
    ? Math.max(0, skeleton.layout.count | 0)
    : 0;
}

function getPlaceholderCells(
  loading: NormalizedGridLoading,
  fallbackCount: number
): RenderableGridCell[] {
  if (!loading.enabled || !loading.active) return [];

  const count = loading.count || fallbackCount;
  if (count <= 0) return [];

  return Array.from({ length: count }, (_, index) => ({
    id: `rmg-grid-loading-${index}`,
    node: null,
    placeholder: true,
    sourceIndex: index,
    layoutMeta: {
      span: getGridSkeletonSlotSpan(loading.skeleton, index),
    },
  }));
}

function resolveSkeletonNode(args: {
  skeleton: GridLoadingOptions['skeleton'] | undefined;
  index: number;
  itemKey: React.Key;
  revealKey?: React.Key;
  placeholder: boolean;
  ready: boolean;
  count: number;
  breakpoints: BreakpointMap;
}) {
  if (!args.skeleton) return null;

  if (typeof args.skeleton === 'function') {
    return args.skeleton({
      index: args.index,
      key: args.itemKey,
      revealKey: args.revealKey,
      placeholder: args.placeholder,
      ready: args.ready,
    } satisfies GridLoadingSkeletonArgs);
  }

  if (!isGridSkeletonSpec(args.skeleton)) return null;

  return (
    <GridSkeletonSlotContent
      index={args.index}
      count={args.count}
      spec={args.skeleton}
      breakpoints={args.breakpoints}
    />
  );
}

function GridItemHost({
  as: Root = 'div',
  itemKey,
  index,
  revealKey,
  placeholder,
  itemRef,
  originalRef,
  className,
  style,
  originalProps,
  children,
  renderSkeleton,
  loading,
  loadingForce: loadingForceProp,
  reveal,
  revealGateActive,
  scheduleReveal,
  revealedIndicesRef,
  revealedKeysRef,
}: GridItemHostProps) {
  const stateKey = revealKey ?? itemKey;
  const stage = loading.enabled && reveal.disabled !== true;
  const wasPreviouslyRevealed =
    stage && loading.rememberRevealed && revealedKeysRef.current.has(stateKey);
  const [node, setNode] = React.useState<HTMLElement | null>(null);
  const [contentNode, setContentNode] = React.useState<HTMLElement | null>(null);
  const [mediaReady, setMediaReady] = React.useState(!stage || wasPreviouslyRevealed);
  const [revealed, setRevealed] = React.useState(!stage || wasPreviouslyRevealed);
  const [settled, setSettled] = React.useState(!stage || wasPreviouslyRevealed);
  const [skeletonSettled, setSkeletonSettled] = React.useState(false);
  const lifecycleKeyRef = React.useRef<{
    stateKey: React.Key;
    stage: boolean;
  }>({
    stateKey,
    stage,
  });
  const lifecycleChanged =
    lifecycleKeyRef.current.stateKey !== stateKey ||
    lifecycleKeyRef.current.stage !== stage;
  const resetReady = !stage || wasPreviouslyRevealed;
  const effectiveMediaReady = lifecycleChanged ? resetReady : mediaReady;
  const effectiveRevealed = lifecycleChanged ? resetReady : revealed;
  const effectiveSettled = lifecycleChanged ? resetReady : settled;
  const effectiveSkeletonSettled = lifecycleChanged ? false : skeletonSettled;
  const skeletonRenderStateRef = React.useRef<{
    key: React.Key;
    stage: boolean;
    ready: boolean;
  }>({
    key: stateKey,
    stage,
    ready: !stage || wasPreviouslyRevealed,
  });
  const skeletonMountedAtRef = React.useRef(0);
  const revealTimeoutRef = React.useRef<ReturnType<typeof globalThis.setTimeout> | null>(
    null
  );
  const inView = useElementInViewOnce(stage && !wasPreviouslyRevealed, node, {
    rootMargin: loading.rootMargin,
    threshold: loading.threshold,
    resetKey: stateKey,
  });
  const painted = useDoublePaintReady(stage && !wasPreviouslyRevealed, stateKey);
  const readyPainted = useDoublePaintReady(
    stage && !wasPreviouslyRevealed && mediaReady,
    `${String(stateKey)}:ready`
  );
  const loadingForcePropResolved = loadingForceProp ?? loading.force;
  const loadingForce = React.useMemo(
    () => resolveLoadingForceOptions(loadingForcePropResolved),
    [loadingForcePropResolved]
  );
  const contentReady = effectiveMediaReady || effectiveRevealed || effectiveSettled;
  const defaultReveal = !stage || effectiveRevealed || effectiveSettled;
  const loadingVisualState = resolveGridLoadingVisualState({
    loadingActive: loading.active,
    loadingForced: loadingForcePropResolved,
    shouldMountContent: !placeholder || contentNode != null,
    contentReady,
    defaultReveal,
  });
  const loadingBlocksReveal =
    loading.active &&
    (!loadingForce.enabled || !loadingVisualState.revealContent);
  const compareMode = loadingVisualState.compareMode;
  const ready = !stage || loadingVisualState.revealContent;
  if (
    skeletonRenderStateRef.current.key !== stateKey ||
    skeletonRenderStateRef.current.stage !== stage
  ) {
    skeletonRenderStateRef.current = {
      key: stateKey,
      stage,
      ready: !stage || wasPreviouslyRevealed,
    };
  }
  const skeleton = React.useMemo(
    () => renderSkeleton(skeletonRenderStateRef.current.ready),
    [renderSkeleton, stateKey]
  );
  const hasSkeleton = skeleton != null;
  const hasStructuredSkeleton = isGridSkeletonSpec(loading.skeleton);
  const revealReady = !stage || !loadingBlocksReveal && ready;
  const skeletonShimmerSettled =
    revealReady && !compareMode && effectiveSkeletonSettled;
  const keepSkeletonAsLayoutAnchor = stage && hasStructuredSkeleton;
  const shouldMountSkeleton =
    hasSkeleton &&
    (!effectiveSettled ||
      loading.active ||
      loading.keepSkeletonMounted ||
      keepSkeletonAsLayoutAnchor);

  const setMergedNode = React.useCallback(
    (nextNode: HTMLElement | null) => {
      setNode(nextNode);
      assignRef(itemRef, nextNode);
      assignRef(originalRef, nextNode);
    },
    [itemRef, originalRef]
  );

  React.useLayoutEffect(() => {
    if (!hasSkeleton) return;
    skeletonMountedAtRef.current =
      typeof performance === 'undefined' ? 0 : performance.now();
  }, [hasSkeleton, stateKey]);

  React.useLayoutEffect(() => {
    lifecycleKeyRef.current = {
      stateKey,
      stage,
    };

    const rememberedReveal =
      stage && loading.rememberRevealed && revealedKeysRef.current.has(stateKey);

    if (!stage) {
      setMediaReady(true);
      setRevealed(true);
      setSettled(true);
      return;
    }

    if (rememberedReveal) {
      setMediaReady(true);
      setRevealed(true);
      setSettled(true);
      return;
    }

    setMediaReady(false);
    setRevealed(false);
    setSettled(false);
    setSkeletonSettled(false);
  }, [loading.rememberRevealed, revealedKeysRef, stage, stateKey]);

  React.useEffect(() => {
    if (!stage || !loading.active) return;
    setSettled(false);
  }, [loading.active, stage, stateKey]);

  React.useEffect(() => {
    if (!stage || !contentNode || !inView || !painted || mediaReady) return;

    if (!loading.waitForMedia) {
      const timeout = globalThis.setTimeout(() => setMediaReady(true), 0);
      return () => globalThis.clearTimeout(timeout);
    }

    let cancelled = false;
    void waitForElementMediaReady(contentNode, {
      timeoutMs: loading.decodeTimeoutMs,
      waitForLazy: true,
    }).then(() => {
      if (!cancelled) setMediaReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [
    inView,
    loading.decodeTimeoutMs,
    loading.waitForMedia,
    mediaReady,
    contentNode,
    painted,
    stage,
    stateKey,
  ]);

  const markRevealed = React.useCallback(() => {
    setRevealed(true);
    revealedIndicesRef.current.add(index);
    revealedKeysRef.current.add(stateKey);
  }, [index, revealedIndicesRef, revealedKeysRef, stateKey]);

  React.useEffect(() => {
    if (
      !stage ||
      !revealGateActive ||
      !inView ||
      !painted ||
      !readyPainted ||
      !mediaReady ||
      loadingBlocksReveal ||
      revealed
    ) {
      return;
    }

    if (revealTimeoutRef.current != null) {
      globalThis.clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }

    const elapsed =
      typeof performance === 'undefined'
        ? loading.minVisibleMs
        : performance.now() - skeletonMountedAtRef.current;
    const revealDelay = hasSkeleton ? Math.max(0, loading.minVisibleMs - elapsed) : 0;

    let cancelScheduledReveal: (() => void) | undefined;

    const startReveal = () => {
      revealTimeoutRef.current = null;
      cancelScheduledReveal = scheduleReveal(stateKey, markRevealed);
    };

    revealTimeoutRef.current = globalThis.setTimeout(startReveal, revealDelay);

    return () => {
      if (revealTimeoutRef.current != null) {
        globalThis.clearTimeout(revealTimeoutRef.current);
        revealTimeoutRef.current = null;
      }
      cancelScheduledReveal?.();
    };
  }, [
    hasSkeleton,
    inView,
    loading.minVisibleMs,
    loadingBlocksReveal,
    markRevealed,
    mediaReady,
    painted,
    readyPainted,
    revealGateActive,
    revealed,
    scheduleReveal,
    stage,
    stateKey,
  ]);

  React.useEffect(() => {
    if (!stage || !hasSkeleton || !revealed || settled || loading.exitMs > 0) return;
    setSettled(true);
    setSkeletonSettled(true);
  }, [hasSkeleton, loading.exitMs, revealed, settled, stage]);

  React.useEffect(() => {
    return () => {
      if (revealTimeoutRef.current != null) {
        globalThis.clearTimeout(revealTimeoutRef.current);
        revealTimeoutRef.current = null;
      }
    };
  }, []);

  const rootProps: Record<string, unknown> = {
    ...(originalProps ?? {}),
    ref: setMergedNode,
    className: cx(className, originalProps?.className as string | undefined),
    style: {
      ...((originalProps?.style as React.CSSProperties | undefined) ?? null),
      ...(style ?? null),
    },
    'data-rmg-idx': index,
    'data-rmg-grid-item-key': itemKey,
    'data-rmg-grid-item-stage': stage ? '1' : undefined,
    'data-rmg-grid-item-reveal': stage ? (revealReady ? '1' : '0') : undefined,
    'data-rmg-grid-item-compare': compareMode ? '1' : undefined,
    'data-rmg-grid-item-layered': shouldMountSkeleton ? '1' : undefined,
    'data-rmg-grid-item-reveal-settled': effectiveSettled ? '1' : undefined,
  };

  if (placeholder) {
    rootProps['aria-hidden'] = true;
  }

  return React.createElement(
    Root,
    rootProps,
    shouldMountSkeleton ? (
      <div
        className={styles.itemSkeleton}
        data-rmg-grid-item-skeleton="true"
        aria-hidden="true"
        style={{
          ['--rmg-grid-item-skeleton-enter-duration' as any]: `${loading.enterMs}ms`,
          ['--rmg-grid-item-skeleton-exit-duration' as any]: `${loading.exitMs}ms`,
          ['--rmg-grid-item-skeleton-opacity' as any]: compareMode
            ? loadingVisualState.loadingLayerOpacity
            : undefined,
        }}
        data-rmg-grid-item-shimmer={skeletonShimmerSettled ? 'off' : undefined}
        onTransitionEnd={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.propertyName !== 'opacity') return;
          if (!revealReady || compareMode) return;
          setSettled(true);
          setSkeletonSettled(true);
        }}
      >
        {skeleton}
      </div>
    ) : null,
    <div
      key={stateKey}
      className={styles.itemInner}
      data-rmg-grid-item-content="true"
      ref={setContentNode}
    >
      {children}
    </div>
  );
}

export const GridLayout = React.forwardRef<GridHandle, GridLayoutProps>(function GridLayout(
  {
    cells,
    grid,
    breakpoints,
    viewportWidth,
    reveal,
    gridItemBaseClass = 'rmg__grid-item',
    revealReady = true,
    renderMode,
  },
  forwardedRef
) {
  const breakpointMap = breakpoints ?? BREAKPOINT_MAP;
  const prefersReducedMotion = usePrefersReducedMotion();
  const skeletonRevealGate = useSkeletonRevealGate();
  const gridRootRef = React.useRef<HTMLDivElement | null>(null);
  const layoutStoreBag = React.useMemo(() => createRmgSlideStoreBag(), []);
  const [clientReady, setClientReady] = React.useState(false);
  const revealedIndicesRef = React.useRef(new Set<number>());
  const revealedKeysRef = React.useRef(new Set<React.Key>());
  const queuedRevealKeysRef = React.useRef(new Set<React.Key>());
  const revealQueueRef = React.useRef<GridRevealQueueItem[]>([]);
  const revealSchedulerActiveRef = React.useRef(false);
  const revealSchedulerTimerRef = React.useRef<number | null>(null);
  const revealSchedulerFrameIdsRef = React.useRef<number[]>([]);
  const previousPluginsLoadingRef = React.useRef(false);
  const readySubsRef = React.useRef(new Set<(nodes: HTMLElement[]) => void>());
  const readyRef = React.useRef(false);
  const normalizedLoading = React.useMemo(
    () => normalizeGridLoading(grid.loading, prefersReducedMotion),
    [grid.loading, prefersReducedMotion]
  );

  React.useEffect(() => {
    setClientReady(true);
  }, []);

  const pluginEntries = React.useMemo(
    () => (grid.plugins ?? []).filter(isGridPlugin),
    [grid.plugins]
  );
  const pluginItemEntry = React.useMemo(
    () => pluginEntries.find((plugin) => plugin.renderItem),
    [pluginEntries]
  );
  const pluginsLoading = React.useMemo(
    () =>
      pluginEntries.some(
        (plugin) => plugin.blocksReady !== false && !!(plugin.options as any)?.loading
      ),
    [pluginEntries]
  );
  const paginationLoading = !!(
    pluginEntries.find((plugin) => plugin.kind === 'pagination')?.options as
      | { loading?: boolean }
      | undefined
  )?.loading;
  const paginationLoadingForce = React.useMemo<LoadingForceOptions | undefined>(
    () =>
      paginationLoading
        ? { enabled: true, showContent: true, skeletonOpacity: 1 }
        : undefined,
    [paginationLoading]
  );
  const loading = React.useMemo(
    () =>
      paginationLoading && normalizedLoading.enabled
        ? {
            ...normalizedLoading,
            active: true,
            force: paginationLoadingForce,
          }
        : normalizedLoading,
    [normalizedLoading, paginationLoading, paginationLoadingForce]
  );
  const dataWindowCells = React.useMemo<RenderableGridCell[]>(
    () =>
      resolveDataWindow(cells, pluginEntries).map(({ item, index }) => ({
        ...item,
        sourceIndex: item.sourceIndex ?? index,
      })),
    [cells, pluginEntries]
  );
  const skeletonDefaultCount = getGridSkeletonDefaultCount(loading.skeleton);
  const renderCells = React.useMemo<RenderableGridCell[]>(() => {
    if (dataWindowCells.length > 0) return dataWindowCells;
    return getPlaceholderCells(loading, skeletonDefaultCount);
  }, [dataWindowCells, loading, skeletonDefaultCount]);
  const allCellRevealKeys = React.useMemo(
    () => cells.map(getGridCellRevealKey),
    [cells]
  );
  const renderCellRevealKeys = React.useMemo(
    () => renderCells.map(getGridCellRevealKey),
    [renderCells]
  );
  const renderModeProp = renderMode ?? 'wrap';
  const fullscreenTrigger: GridFullscreenTrigger = grid.fullscreenTrigger ?? 'media';
  const revealGateActive =
    reveal.disabled === true || (clientReady && revealReady && (skeletonRevealGate ?? true));
  const noopRegisterExpandableImage = React.useCallback(
    (_index: number, _node: HTMLImageElement | null) => {},
    []
  );

  const clearRevealScheduler = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      if (revealSchedulerTimerRef.current != null) {
        window.clearTimeout(revealSchedulerTimerRef.current);
      }

      if (typeof window.cancelAnimationFrame === 'function') {
        revealSchedulerFrameIdsRef.current.forEach((frameId) => {
          window.cancelAnimationFrame(frameId);
        });
      }
    }

    revealSchedulerTimerRef.current = null;
    revealSchedulerFrameIdsRef.current = [];
    revealSchedulerActiveRef.current = false;
  }, []);

  const scheduleQueuedReveal = React.useCallback(
    (delayMs = 0) => {
      if (revealSchedulerActiveRef.current || revealQueueRef.current.length === 0) {
        return;
      }

      const releaseNextItem = () => {
        revealSchedulerActiveRef.current = false;
        revealSchedulerTimerRef.current = null;
        revealSchedulerFrameIdsRef.current = [];

        const item = revealQueueRef.current.shift();
        if (!item) return;

        queuedRevealKeysRef.current.delete(item.key);
        item.reveal();

        if (revealQueueRef.current.length > 0) {
          scheduleQueuedReveal(Math.max(0, reveal.staggerMs));
        }
      };

      const releaseAfterPaint = () => {
        if (
          typeof window === 'undefined' ||
          typeof window.requestAnimationFrame !== 'function'
        ) {
          releaseNextItem();
          return;
        }

        const firstFrame = window.requestAnimationFrame(() => {
          const secondFrame = window.requestAnimationFrame(releaseNextItem);
          revealSchedulerFrameIdsRef.current = [firstFrame, secondFrame];
        });
        revealSchedulerFrameIdsRef.current = [firstFrame];
      };

      revealSchedulerActiveRef.current = true;

      if (delayMs > 0 && typeof window !== 'undefined') {
        revealSchedulerTimerRef.current = window.setTimeout(releaseAfterPaint, delayMs);
        return;
      }

      releaseAfterPaint();
    },
    [reveal.staggerMs]
  );

  const scheduleGridItemReveal = React.useCallback(
    (key: React.Key, revealItem: () => void) => {
      if (revealedKeysRef.current.has(key)) {
        revealItem();
        return () => {};
      }

      if (Math.max(0, reveal.staggerMs) <= 0) {
        let cancelled = false;
        let firstFrame: number | null = null;
        let secondFrame: number | null = null;
        let timeout: ReturnType<typeof globalThis.setTimeout> | null = null;

        const releaseItem = () => {
          if (cancelled) return;
          revealItem();
        };

        if (
          typeof window === 'undefined' ||
          typeof window.requestAnimationFrame !== 'function'
        ) {
          timeout = globalThis.setTimeout(releaseItem, 0);
        } else {
          firstFrame = window.requestAnimationFrame(() => {
            secondFrame = window.requestAnimationFrame(releaseItem);
          });
        }

        return () => {
          cancelled = true;
          if (timeout != null) {
            globalThis.clearTimeout(timeout);
          }
          if (
            typeof window !== 'undefined' &&
            typeof window.cancelAnimationFrame === 'function'
          ) {
            if (firstFrame != null) window.cancelAnimationFrame(firstFrame);
            if (secondFrame != null) window.cancelAnimationFrame(secondFrame);
          }
        };
      }

      if (queuedRevealKeysRef.current.has(key)) {
        return () => {};
      }

      revealQueueRef.current.push({ key, reveal: revealItem });
      queuedRevealKeysRef.current.add(key);
      scheduleQueuedReveal();

      return () => {
        if (revealedKeysRef.current.has(key)) return;

        queuedRevealKeysRef.current.delete(key);
        revealQueueRef.current = revealQueueRef.current.filter((item) => item.key !== key);

        if (revealQueueRef.current.length === 0) {
          clearRevealScheduler();
        }
      };
    },
    [clearRevealScheduler, reveal.staggerMs, scheduleQueuedReveal]
  );

  React.useEffect(() => {
    if (pluginsLoading && !previousPluginsLoadingRef.current) {
      revealQueueRef.current = [];
      queuedRevealKeysRef.current.clear();
      clearRevealScheduler();
    }

    previousPluginsLoadingRef.current = pluginsLoading;
  }, [clearRevealScheduler, pluginsLoading]);

  React.useEffect(() => {
    const retainedRevealKeys = loading.rememberRevealed
      ? allCellRevealKeys
      : renderCellRevealKeys;
    const currentKeys = new Set(retainedRevealKeys);

    revealedKeysRef.current.forEach((key) => {
      if (!currentKeys.has(key)) {
        revealedKeysRef.current.delete(key);
      }
    });

    queuedRevealKeysRef.current.forEach((key) => {
      if (!currentKeys.has(key)) {
        queuedRevealKeysRef.current.delete(key);
      }
    });

    revealQueueRef.current = revealQueueRef.current.filter((item) =>
      currentKeys.has(item.key)
    );

    if (revealQueueRef.current.length === 0) {
      clearRevealScheduler();
    }
  }, [
    allCellRevealKeys,
    clearRevealScheduler,
    loading.rememberRevealed,
    renderCellRevealKeys,
  ]);

  React.useEffect(() => {
    return () => {
      revealQueueRef.current = [];
      queuedRevealKeysRef.current.clear();
      clearRevealScheduler();
    };
  }, [clearRevealScheduler]);

  React.useEffect(() => {
    return () => {
      layoutStoreBag.destroyAll();
    };
  }, [layoutStoreBag]);

  const getItemNodes = React.useCallback(() => {
    const root = gridRootRef.current;
    if (!root) return [];

    return Array.from(root.querySelectorAll('[data-rmg-idx]')).filter(
      (node): node is HTMLElement => node instanceof HTMLElement
    );
  }, []);

  const handle = React.useMemo<GridHandle>(
    () => ({
      getRootNode: () => gridRootRef.current,
      getItemNodes,
      isReady: () => readyRef.current,
      onReady: (callback) => {
        readySubsRef.current.add(callback);
        return () => {
          readySubsRef.current.delete(callback);
        };
      },
    }),
    [getItemNodes]
  );

  React.useImperativeHandle(
    forwardedRef,
    () => handle,
    [handle]
  );

  const minWidth =
    typeof grid.minColumnWidth === 'number'
      ? `${grid.minColumnWidth}px`
      : grid.minColumnWidth ?? '160px';

  const fallbackGap =
    typeof grid.gap === 'number' && Number.isFinite(grid.gap)
      ? grid.gap
      : 8;

  const hasResponsiveGap = isResponsiveMap(grid.gap);
  const hasResponsiveTemplateColumns = isResponsiveGridTemplateMap(grid.templateColumns);
  const hasResponsiveColumns = isResponsiveMap(grid.columns);
  const hasExplicitTracks = grid.templateColumns != null || grid.columns != null;

  if (grid.templateColumns != null && (grid.columns != null || grid.minColumnWidth != null)) {
    warnGridOnce(
      'grid-template-columns-precedence',
      '[react-motion-gallery] Grid `templateColumns` overrides `columns` and `minColumnWidth` when they are provided together.'
    );
  }

  if (!hasExplicitTracks && renderCells.some((cell) => cell.layoutMeta?.span != null)) {
    warnGridOnce(
      'grid-span-autofill-ignored',
      '[react-motion-gallery] Grid item `span` is ignored when the grid is using auto-fill `minColumnWidth` mode. Use `columns` or `templateColumns` to enable spans.'
    );
  }

  const gridScope = React.useMemo(() => {
    return buildStableScopeId('rmg-grid-', {
      columns: grid.columns,
      templateColumns: grid.templateColumns,
      gap: grid.gap,
      breakpointMap,
      fallbackGap,
    });
  }, [grid.columns, grid.templateColumns, grid.gap, breakpointMap, fallbackGap]);

  const gapVal = React.useMemo(() => {
    if (hasResponsiveGap) return undefined;
    if (typeof grid.gap === 'string' && Number.isNaN(parseFloat(grid.gap))) return grid.gap;

    const raw = resolveNumberFromResponsive(
      grid.gap,
      fallbackGap,
      viewportWidth,
      breakpointMap
    );

    return `${Math.max(0, raw | 0)}px`;
  }, [grid.gap, hasResponsiveGap, viewportWidth, breakpointMap, fallbackGap]);

  const resolvedGridTemplateColumns = React.useMemo(
    () =>
      hasResponsiveTemplateColumns
        ? undefined
        : resolveGridTemplateFromResponsive({
            templateColumns: grid.templateColumns,
            viewportWidth,
            breakpointMap,
          }),
    [grid.templateColumns, hasResponsiveTemplateColumns, viewportWidth, breakpointMap]
  );

  const virtualGridTemplateColumns = React.useMemo(
    () =>
      resolveGridTemplateFromResponsive({
        templateColumns: grid.templateColumns,
        viewportWidth,
        breakpointMap,
      }),
    [grid.templateColumns, viewportWidth, breakpointMap]
  );

  const resolvedGridColumnCount = React.useMemo(() => {
    if (grid.templateColumns != null) return undefined;
    if (hasResponsiveColumns) return undefined;
    if (grid.columns == null) return undefined;
    const raw = resolveNumberFromResponsive(grid.columns, 1, viewportWidth, breakpointMap);
    return Math.max(1, raw | 0);
  }, [grid.columns, grid.templateColumns, hasResponsiveColumns, viewportWidth, breakpointMap]);

  const virtualGridColumnCount = React.useMemo(() => {
    if (grid.templateColumns != null) return undefined;
    if (grid.columns == null) return undefined;

    const raw = resolveNumberFromResponsive(
      grid.columns,
      1,
      viewportWidth,
      breakpointMap
    );

    return Math.max(1, raw | 0);
  }, [grid.columns, grid.templateColumns, viewportWidth, breakpointMap]);

  const responsiveGridCssText = React.useMemo(
    () =>
      buildScopedGridResponsiveCss({
        scopeId: gridScope,
        columns:
          grid.templateColumns == null && hasResponsiveColumns ? grid.columns : undefined,
        templateColumns: grid.templateColumns,
        gap: hasResponsiveGap ? grid.gap : undefined,
        breakpointMap,
        fallbackGap,
      }),
    [
      gridScope,
      hasResponsiveColumns,
      hasResponsiveGap,
      grid.columns,
      grid.templateColumns,
      grid.gap,
      breakpointMap,
      fallbackGap,
    ]
  );

  const responsiveItemCssText = React.useMemo(
    () =>
      buildScopedGridItemSpanCss({
        scopeId: gridScope,
        cells: renderCells,
        breakpointMap,
        allowSpan: hasExplicitTracks,
      }),
    [gridScope, renderCells, breakpointMap, hasExplicitTracks]
  );

  const structuredSkeleton = isGridSkeletonSpec(loading.skeleton)
    ? loading.skeleton
    : undefined;

  const responsiveCssText = React.useMemo(
    () =>
      [responsiveGridCssText, responsiveItemCssText]
        .filter(Boolean)
        .join('\n'),
    [responsiveGridCssText, responsiveItemCssText]
  );

  const gridStyle: React.CSSProperties = React.useMemo(() => {
    const style: React.CSSProperties = {
      ['--rmg-grid-min' as any]: minWidth,
    };

    if (gapVal != null) {
      (style as any)['--rmg-grid-gap'] = gapVal;
    }

    if (resolvedGridTemplateColumns) {
      style.gridTemplateColumns = resolvedGridTemplateColumns;
    } else if (resolvedGridColumnCount && resolvedGridColumnCount > 0) {
      style.gridTemplateColumns = `repeat(${resolvedGridColumnCount}, minmax(0, 1fr))`;
    }

    return style;
  }, [minWidth, gapVal, resolvedGridTemplateColumns, resolvedGridColumnCount]);

  const baseItemClassName = React.useMemo(
    () => cx(gridItemBaseClass, styles.gridItem, grid.itemClassName),
    [gridItemBaseClass, grid.itemClassName]
  );

  const virtualOptions = getDataPluginOptions<DataVirtualizationOptions>(
    pluginEntries,
    'virtualization'
  );
  const virtualColumnCount = React.useMemo(
    () =>
      resolveGridVirtualColumnCount({
        resolvedGridColumnCount: virtualGridColumnCount,
        resolvedGridTemplateColumns: virtualGridTemplateColumns,
        minWidth,
        viewportWidth,
      }),
    [minWidth, virtualGridColumnCount, virtualGridTemplateColumns, viewportWidth]
  );
  const virtualRows = React.useMemo(
    () =>
      buildGridVirtualRows({
        cells: renderCells,
        columnCount: virtualColumnCount,
        allowSpan: hasExplicitTracks,
        viewportWidth,
        breakpointMap,
      }),
    [
      breakpointMap,
      renderCells,
      hasExplicitTracks,
      virtualColumnCount,
      viewportWidth,
    ]
  );
  const virtualWindow = useMeasuredVirtualWindow(
    virtualRows.rowCount,
    gridRootRef,
    virtualOptions
  );
  const visibleCells = React.useMemo(
    () =>
      renderCells.filter((cell) => {
        const row = virtualRows.rowByCell.get(cell.id) ?? 0;
        return row >= virtualWindow.start && row < virtualWindow.end;
      }),
    [renderCells, virtualRows.rowByCell, virtualWindow.end, virtualWindow.start]
  );
  const gridReady = clientReady && !pluginsLoading && !loading.active;

  React.useEffect(() => {
    readyRef.current = gridReady;
    if (!gridReady) return;

    const nodes = getItemNodes();
    readySubsRef.current.forEach((fn) => fn(nodes));
  }, [getItemNodes, gridReady]);

  const skeletonCount = Math.max(renderCells.length, loading.count, skeletonDefaultCount);
  const structuredSkeletonLayoutItems = React.useMemo(
    () =>
      renderCells.map((cell) => ({
        id: cell.id,
        span: cell.layoutMeta?.span,
      })),
    [renderCells]
  );

  const gridChildren = React.useMemo(() => {
    return visibleCells.map((cell, virtualIndex) => {
      const sourceIndex = cell.sourceIndex ?? virtualIndex;
      const rowIndex = virtualRows.rowByCell.get(cell.id) ?? 0;
      const shouldMeasureRow = virtualRows.firstCellByRow.get(rowIndex) === cell.id;
      const original = cell.node;
      const layoutMeta = cell.layoutMeta;
      const originalRevealKey = getGridCellRevealKey(cell);
      const rowMeasureRef: React.Ref<HTMLElement> | undefined = shouldMeasureRow
        ? (node) => virtualWindow.measureItem(rowIndex, node)
        : undefined;
      const revealDelayIndex =
        reveal.staggerLimit && reveal.staggerLimit > 0 && sourceIndex >= reveal.staggerLimit
          ? 0
          : sourceIndex;
      const revealDurationMs = loading.animate ? reveal.durationMs : 0;
      const revealStyle: React.CSSProperties & Record<string, any> = {
        ['--rmg-reveal-index' as any]: revealDelayIndex,
        ['--rmg-reveal-duration' as any]: `${revealDurationMs}ms`,
        ['--rmg-reveal-easing' as any]: reveal.easing,
      };
      const itemClassName = cx(baseItemClassName, layoutMeta?.className);
      const baseItemStyle = buildGridItemHostStyle({
        layoutMeta,
        allowSpan: hasExplicitTracks,
        revealStyle,
      });
      const renderSkeleton = (ready: boolean) =>
        resolveSkeletonNode({
          skeleton: loading.skeleton,
          index: sourceIndex,
          itemKey: cell.id,
          revealKey: originalRevealKey,
          placeholder: !!cell.placeholder,
          ready,
          count: skeletonCount,
          breakpoints: breakpointMap,
        });

      let Root: React.ElementType = 'div';
      let originalProps: Record<string, unknown> | undefined;
      let originalRef: React.Ref<HTMLElement> | undefined;
      let contentNode: React.ReactNode = null;

      if (cell.placeholder) {
        contentNode = null;
      } else if (
        !loading.enabled &&
        renderModeProp !== 'passthrough' &&
        React.isValidElement(original) &&
        canHoistGridHostElement((original as any).type)
      ) {
        const originalEl = original as React.ReactElement<any>;
        Root = originalEl.type;
        const {
          children: originalChildren,
          className,
          style,
          ref: _ref,
          key: _key,
          ...restOriginalProps
        } = originalEl.props ?? {};
        originalRef = (originalEl as any).ref as React.Ref<HTMLElement> | undefined;
        originalProps = {
          ...restOriginalProps,
          className,
          style,
        };
        contentNode =
          originalChildren === undefined ? null : (
            <RmgSlideProvider
              value={{ normIdx: sourceIndex, isClone: false, storeBag: layoutStoreBag }}
            >
              {originalChildren}
            </RmgSlideProvider>
          );
      } else {
        contentNode = (
          <RmgSlideProvider
            value={{ normIdx: sourceIndex, isClone: false, storeBag: layoutStoreBag }}
          >
            {original as any}
          </RmgSlideProvider>
        );
      }

      const itemContent = pluginItemEntry?.renderItem
        ? pluginItemEntry.renderItem(
            {
              index: sourceIndex,
              key: cell.id,
              itemProps: {},
              children: contentNode,
              registerExpandableImage: noopRegisterExpandableImage,
              revealedIndicesRef,
            },
            pluginItemEntry.options
          )
        : contentNode;

      return (
        <GridItemHost
          key={cell.id}
          as={Root}
          itemKey={cell.id}
          index={sourceIndex}
          revealKey={originalRevealKey}
          placeholder={cell.placeholder}
          itemRef={rowMeasureRef}
          originalRef={originalRef}
          className={itemClassName}
          style={baseItemStyle}
          originalProps={originalProps}
          renderSkeleton={renderSkeleton}
          loading={loading}
          loadingForce={paginationLoadingForce}
          reveal={reveal}
          revealGateActive={revealGateActive}
          scheduleReveal={scheduleGridItemReveal}
          revealedIndicesRef={revealedIndicesRef}
          revealedKeysRef={revealedKeysRef}
        >
          {itemContent}
        </GridItemHost>
      );
    });
  }, [
    baseItemClassName,
    breakpointMap,
    hasExplicitTracks,
    layoutStoreBag,
    loading,
    noopRegisterExpandableImage,
    pluginItemEntry,
    paginationLoadingForce,
    renderModeProp,
    reveal,
    revealGateActive,
    scheduleGridItemReveal,
    skeletonCount,
    virtualRows.firstCellByRow,
    virtualRows.rowByCell,
    virtualWindow,
    visibleCells,
  ]);

  const containerProps: React.HTMLAttributes<HTMLDivElement> = React.useMemo(
    () => ({
      className: cx(styles.gridRoot, grid.rootClassName),
      'data-rmg-grid-node': 'true',
      'data-rmg-grid-reveal-active': revealGateActive ? 'true' : undefined,
      'data-rmg-grid-loading': loading.enabled ? 'true' : undefined,
      style: {
        ...gridStyle,
        ['--rmg-reveal-stagger' as any]: `${reveal.staggerMs}ms`,
        ['--rmg-reveal-duration' as any]: `${reveal.durationMs}ms`,
        ['--rmg-reveal-easing' as any]: reveal.easing,
      },
      'aria-busy': gridReady ? undefined : true,
    }),
    [
      grid.rootClassName,
      gridStyle,
      gridReady,
      loading.enabled,
      reveal.durationMs,
      reveal.easing,
      reveal.staggerMs,
      revealGateActive,
    ]
  );

  const pluginHost = React.useMemo(
    () => ({
      handle,
      itemCount: cells.length,
      visibleItemCount: visibleCells.length,
      ready: gridReady,
      fullscreenTrigger,
    }),
    [cells.length, fullscreenTrigger, gridReady, handle, visibleCells.length]
  );

  const gridNode = (
    <>
      {responsiveCssText ? (
        <style dangerouslySetInnerHTML={{ __html: responsiveCssText }} />
      ) : null}
      <div ref={gridRootRef} {...containerProps}>
        {virtualWindow.topSpacer > 0 ? (
          <div
            data-rmg-grid-virtual-spacer="top"
            style={{ gridColumn: '1 / -1', height: virtualWindow.topSpacer }}
            aria-hidden="true"
          />
        ) : null}
        {gridChildren}
        {virtualWindow.bottomSpacer > 0 ? (
          <div
            data-rmg-grid-virtual-spacer="bottom"
            style={{ gridColumn: '1 / -1', height: virtualWindow.bottomSpacer }}
            aria-hidden="true"
          />
        ) : null}
      </div>
    </>
  );
  const structuredSkeletonLayoutOwner =
    loading.enabled && structuredSkeleton ? (
      <SkeletonFrame
        skeletonNode={
          <GridSkeletonCard
            count={skeletonCount}
            spec={structuredSkeleton}
            breakpoints={breakpointMap}
            columns={grid.columns}
            templateColumns={grid.templateColumns}
            minColumnWidth={grid.minColumnWidth}
            gap={grid.gap}
            items={structuredSkeletonLayoutItems}
            allowItemSpans={hasExplicitTracks}
          />
        }
        ready={gridReady}
        enabled
        force={loading.force}
        timing={{
          enterMs: loading.enterMs,
          exitMs: loading.exitMs,
          minVisibleMs: loading.minVisibleMs,
        }}
        contentOwnsWrapperLayout
        lockContentLayoutWhileLoading
        loadingLayerFirst
      >
        {gridNode}
      </SkeletonFrame>
    ) : null;

  return (
    <div
      className={styles.gridShell}
      data-rmg-grid-scope={gridScope}
    >
      {structuredSkeletonLayoutOwner ?? gridNode}
      {pluginEntries.map((plugin, index) => {
        const Runtime = plugin.Runtime;
        return Runtime ? (
          <Runtime
            key={`${plugin.kind}-${index}`}
            host={pluginHost}
            options={plugin.options}
          />
        ) : null;
      })}
    </div>
  );
});
