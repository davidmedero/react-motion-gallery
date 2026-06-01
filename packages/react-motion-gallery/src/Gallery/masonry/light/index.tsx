"use client";

import * as React from "react";

import {
  BREAKPOINT_MAP,
  DEFAULT_SERVER_VIEWPORT_WIDTH,
  type BreakpointMap,
  type ResponsiveNumber,
} from "../../shared/responsive";
import { useInViewOnce } from "../../shared/hooks/useInViewOnce";
import { useViewportWidth } from "../../shared/hooks/useViewportWidth";
import { useSkeletonRevealGate } from "../../shared/loading/skeletonRevealGate";
import {
  getDataPluginOptions,
  resolveDataWindow,
  useAbsoluteVirtualRange,
  type DataVirtualizationOptions,
} from "../../shared/dataPlugins";
import { usePrefersReducedMotion } from "../../shared/hooks/usePrefersReducedMotion";
import styles from "./MasonryLight.module.css";
import {
  resolveLoadingForceOptions,
  type LoadingForceOptions,
} from "../../shared/loading/force";
import {
  useDoublePaintReady,
  useElementInViewOnce,
  waitForElementMediaReady,
} from "../../shared/itemLifecycle";
import { useItemRevealScheduler } from "../../shared/itemRevealScheduler";
import { MasonrySkeleton } from "../../skeleton/masonry";
import type {
  MasonrySkeletonItem,
  MasonrySkeletonProps,
} from "../../skeleton/masonry";
import type { SkeletonCacheOptions } from "../../skeleton/cache";
import {
  buildDimensionedMasonryLayout,
  buildDimensionedMasonryFluidLayout,
  collectMasonryResponsiveMinWidths,
  resolveMasonryColumns,
  resolveMasonryGap,
  type MasonryPlacement,
  type MasonrySpan,
  type ResponsiveMasonrySpan,
} from "./placement";
import type { MasonryPlugin } from "./types";
import { buildStableScopeId } from "../../shared/stableScope";

export type {
  MasonryPlacement,
  MasonrySpan,
  ResponsiveMasonrySpan,
} from "./placement";

export type MasonryClassNames = {
  root?: string;
  item?: string;
};

export type MasonryRevealOptions = {
  staggerMs?: number;
  durationMs?: number;
  easing?: string;
  disabled?: boolean;
  staggerLimit?: number;
};

export type MasonryLoadingSkeletonArgs = {
  index: number;
  itemIndex?: number;
  key: React.Key;
  revealKey?: React.Key;
  placeholder: boolean;
  ready: boolean;
  span?: ResponsiveMasonrySpan;
  width?: number;
  height?: number;
};

export type MasonryLoadingOptions = {
  enabled?: boolean;
  active?: boolean;
  count?: number;
  skeleton?:
    | MasonrySkeletonProps
    | ((args: MasonryLoadingSkeletonArgs) => React.ReactNode);
  cache?: SkeletonCacheOptions;
  force?: LoadingForceOptions;
  timing?: {
    enterMs?: number;
    minVisibleMs?: number;
    exitMs?: number;
  };
  animate?: boolean;
  waitForMedia?: boolean;
  decodeTimeoutMs?: number;
  rootMargin?: string;
  threshold?: number;
  keepSkeletonMounted?: boolean;
  rememberRevealed?: boolean;
};

export type MasonryItemProps = {
  width: number;
  height: number;
  span?: ResponsiveMasonrySpan;
  revealKey?: React.Key;
  placeholder?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

export type MasonryHandle = {
  getRootNode: () => HTMLElement | null;
  getItemNodes: () => HTMLElement[];
  isReady: () => boolean;
  onReady: (callback: (nodes: HTMLElement[]) => void) => () => void;
};

export type MasonryOptions = {
  columns?: ResponsiveNumber;
  gap?: ResponsiveNumber;
  placement?: MasonryPlacement;
  plugins?: MasonryPlugin[];
  as?: React.ElementType;
  rootRef?: React.Ref<HTMLElement>;
  classNames?: MasonryClassNames;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  breakpoints?: BreakpointMap;
  reveal?: MasonryRevealOptions;
  revealReady?: boolean;
  loading?: MasonryLoadingOptions;
};

type MasonryItemComponent = React.FC<MasonryItemProps> & {
  __rmgLightMasonryItem: true;
};

type MasonryComponent = React.ForwardRefExoticComponent<
  MasonryOptions & React.RefAttributes<MasonryHandle>
> & {
  Item: MasonryItemComponent;
};

type MasonryCell = MasonryItemProps & {
  id: number;
  placeholder?: boolean;
};

type NormalizedMasonryLoading = {
  enabled: boolean;
  active: boolean;
  count: number;
  skeleton?: MasonryLoadingOptions["skeleton"];
  cache?: SkeletonCacheOptions;
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

type NormalizedMasonryRevealOptions = Required<
  Pick<MasonryRevealOptions, "staggerMs" | "durationMs" | "easing" | "disabled">
> & {
  staggerLimit: number;
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") ref(value);
  else (ref as React.MutableRefObject<T | null>).current = value;
}

function getItemNodes(root: HTMLElement | null) {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>("[data-rmg-idx]"));
}

function isMasonryPlugin(value: unknown): value is MasonryPlugin {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as MasonryPlugin).__rmgLightMasonryPlugin === true
  );
}

function normalizeReveal(src: MasonryRevealOptions | undefined) {
  return {
    staggerMs: src?.staggerMs ?? 160,
    durationMs: src?.durationMs ?? 600,
    easing: src?.easing ?? "cubic-bezier(.2,.7,.2,1)",
    disabled: src?.disabled === true,
    staggerLimit: Math.max(0, (src?.staggerLimit ?? 0) | 0),
  };
}

function normalizeMasonryLoading(
  src: MasonryLoadingOptions | undefined,
  prefersReducedMotion: boolean,
): NormalizedMasonryLoading {
  const enabled = src != null && src.enabled !== false;
  const exitMs =
    typeof src?.timing?.exitMs === "number" &&
    Number.isFinite(src.timing.exitMs)
      ? Math.max(0, src.timing.exitMs)
      : 220;
  const enterMs =
    typeof src?.timing?.enterMs === "number" &&
    Number.isFinite(src.timing.enterMs)
      ? Math.max(0, src.timing.enterMs)
      : exitMs;
  const minVisibleMs =
    typeof src?.timing?.minVisibleMs === "number" &&
    Number.isFinite(src.timing.minVisibleMs)
      ? Math.max(0, src.timing.minVisibleMs)
      : 120;
  const animate = src?.animate ?? true;

  return {
    enabled,
    active: enabled && !!src?.active,
    count:
      typeof src?.count === "number" && Number.isFinite(src.count)
        ? Math.max(0, src.count | 0)
        : 0,
    skeleton: src?.skeleton,
    cache: src?.cache,
    force: src?.force,
    animate,
    waitForMedia: src?.waitForMedia ?? true,
    decodeTimeoutMs:
      typeof src?.decodeTimeoutMs === "number" &&
      Number.isFinite(src.decodeTimeoutMs)
        ? Math.max(0, src.decodeTimeoutMs)
        : 8000,
    rootMargin: src?.rootMargin ?? "0px",
    threshold:
      typeof src?.threshold === "number" && Number.isFinite(src.threshold)
        ? src.threshold
        : 0.01,
    minVisibleMs,
    enterMs: prefersReducedMotion || !animate ? 0 : enterMs,
    exitMs: prefersReducedMotion || !animate ? 0 : exitMs,
    keepSkeletonMounted: src?.keepSkeletonMounted ?? false,
    rememberRevealed: src?.rememberRevealed ?? true,
  };
}

function isMasonrySkeletonProps(value: unknown): value is MasonrySkeletonProps {
  return !!value && typeof value === "object" && typeof value !== "function";
}

function getSkeletonItem(
  skeleton: MasonryLoadingOptions["skeleton"] | undefined,
  index: number,
): MasonrySkeletonItem | undefined {
  if (!isMasonrySkeletonProps(skeleton)) return undefined;

  return (
    skeleton.items?.[index] ??
    (skeleton.heightsPx?.[index] != null || skeleton.ratios?.[index] != null
      ? {
          width: 100,
          height:
            skeleton.heightsPx?.[index] ?? skeleton.ratios?.[index] ?? 100,
          span: skeleton.spans?.[index],
        }
      : undefined)
  );
}

function getSkeletonDefaultCount(
  skeleton: MasonryLoadingOptions["skeleton"] | undefined,
) {
  if (!isMasonrySkeletonProps(skeleton)) return 0;

  return Math.max(
    0,
    skeleton.count ??
      skeleton.items?.length ??
      skeleton.heightsPx?.length ??
      skeleton.ratios?.length ??
      0,
  );
}

function getPlaceholderCells(loading: NormalizedMasonryLoading): MasonryCell[] {
  if (!loading.enabled || !loading.active) return [];

  const fallbackCount = getSkeletonDefaultCount(loading.skeleton);
  const count = loading.count || fallbackCount;
  if (count <= 0) return [];

  return Array.from({ length: count }, (_, index) => {
    const item = getSkeletonItem(loading.skeleton, index);
    return {
      id: -1 - index,
      width: item?.width ?? 100,
      height: item?.height ?? 100,
      span: item?.span,
      children: null,
      placeholder: true,
    };
  });
}

function useElementWidth(ref: React.RefObject<HTMLElement | null>) {
  const [width, setWidth] = React.useState(0);

  React.useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const commit = (nextWidth: number | undefined) => {
      const next = Number(nextWidth);
      if (!Number.isFinite(next) || next <= 0) return;
      setWidth((prev) => (Math.abs(prev - next) < 0.5 ? prev : next));
    };
    const read = () => commit(node.getBoundingClientRect().width);

    read();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", read);
      return () => window.removeEventListener("resize", read);
    }

    const observer = new ResizeObserver((entries) => {
      commit(entries[0]?.contentRect.width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  return width;
}

export const MasonryItem = Object.assign(
  function MasonryItem({ children }: MasonryItemProps) {
    return <>{children}</>;
  },
  {
    __rmgLightMasonryItem: true as const,
    displayName: "Masonry.Item",
  },
) as MasonryItemComponent;

function isMasonryItemElement(
  node: React.ReactNode,
): node is React.ReactElement<MasonryItemProps> {
  return (
    React.isValidElement(node) &&
    Boolean((node.type as any)?.__rmgLightMasonryItem)
  );
}

function collectCells(children: React.ReactNode): MasonryCell[] {
  return React.Children.toArray(children)
    .filter(isMasonryItemElement)
    .map((child, index) => ({
      id: index,
      width: child.props.width,
      height: child.props.height,
      span: child.props.span,
      revealKey: child.props.revealKey,
      placeholder: child.props.placeholder === true,
      className: child.props.className,
      style: child.props.style,
      children: child.props.children,
    }));
}

function getMasonryCellRevealKey(cell: MasonryCell): React.Key {
  return cell.revealKey ?? cell.id;
}

function cssImportant(name: string, value: string | number) {
  return `${name}:${value} !important;`;
}

function buildResponsiveFluidLayoutCss(args: {
  scopeId: string;
  columns?: ResponsiveNumber;
  gap?: ResponsiveNumber;
  placement?: MasonryPlacement;
  items: ReadonlyArray<MasonryCell>;
  breakpointMap: BreakpointMap;
}) {
  const minWidths = collectMasonryResponsiveMinWidths({
    columns: args.columns,
    gap: args.gap,
    items: args.items,
    breakpointMap: args.breakpointMap,
  });

  if (minWidths.length <= 1) return null;

  const scopeSelector = `[data-rmg-masonry-fluid-scope="${args.scopeId}"]`;
  const spacerSelector = `${scopeSelector}>[data-rmg-masonry-fluid-spacer="true"]`;
  const buildRules = (minWidth: number) => {
    const responsiveWidth = Math.max(1, minWidth);
    const columnCount = resolveMasonryColumns({
      columns: args.columns,
      viewportWidth: responsiveWidth,
      breakpointMap: args.breakpointMap,
    });
    const gapPx = resolveMasonryGap({
      gap: args.gap,
      viewportWidth: responsiveWidth,
      breakpointMap: args.breakpointMap,
    });
    const layout = buildDimensionedMasonryFluidLayout({
      items: args.items,
      columnCount,
      gapPx,
      placement: args.placement,
      viewportWidth: responsiveWidth,
      breakpointMap: args.breakpointMap,
    });
    const rootCss =
      `${scopeSelector}{` +
      [
        cssImportant("height", "auto"),
        cssImportant("--rmg-cols", columnCount),
        cssImportant("--rmg-gap", `${gapPx}px`),
      ].join("") +
      "}";
    const spacerCss =
      `${spacerSelector}{` +
      [
        cssImportant("display", "block"),
        cssImportant("width", "100%"),
        cssImportant("height", layout.height),
        cssImportant("visibility", "hidden"),
        cssImportant("pointer-events", "none"),
      ].join("") +
      "}";
    const itemCss = layout.items
      .map(
        (item) =>
          `${scopeSelector}>[data-rmg-masonry-fluid-index="${item.index}"]{` +
          [
            cssImportant("top", item.top),
            cssImportant("left", item.left),
            cssImportant("width", item.width),
            cssImportant("height", item.height),
          ].join("") +
          "}",
      )
      .join("");

    return `${rootCss}${spacerCss}${itemCss}`;
  };

  return minWidths
    .map((minWidth) => {
      const css = buildRules(minWidth);
      if (minWidth <= 0) return css;
      return `@media (min-width:${minWidth}px){${css}}`;
    })
    .join("");
}

function renderMasonrySkeletonNode(args: {
  skeleton: MasonryLoadingOptions["skeleton"] | undefined;
  index: number;
  itemIndex: number;
  itemKey: React.Key;
  revealKey?: React.Key;
  placeholder: boolean;
  ready: boolean;
  cell: MasonryCell;
}) {
  if (!args.skeleton) return null;

  if (typeof args.skeleton === "function") {
    return args.skeleton({
      index: args.index,
      itemIndex: args.itemIndex,
      key: args.itemKey,
      revealKey: args.revealKey,
      placeholder: args.placeholder,
      ready: args.ready,
      span: args.cell.span,
      width: args.cell.width,
      height: args.cell.height,
    });
  }

  if (!isMasonrySkeletonProps(args.skeleton)) return null;

  const {
    children: _children,
    ready: _ready,
    enabled: _enabled,
    timing: _timing,
    masonry: _masonry,
    items: _items,
    count: _count,
    ratios: _ratios,
    heightsPx: _heightsPx,
    spans: _spans,
    columns: _columns,
    gap: _gap,
    placement: _placement,
    viewportWidth: _viewportWidth,
    layoutWidthPx: _layoutWidthPx,
    ...skeletonProps
  } = args.skeleton;

  return (
    <MasonrySkeleton
      {...skeletonProps}
      items={[
        {
          width: args.cell.width,
          height: args.cell.height,
          span: args.cell.span,
        },
      ]}
      columns={1}
      gap={0}
    />
  );
}

function MasonryLightItemHost({
  cell,
  itemKey,
  itemIndex,
  renderIndex,
  itemProps,
  itemRef,
  pluginItemEntry,
  pluginOptions,
  children,
  loading,
  reveal,
  revealGateActive,
  scheduleReveal,
  revealedIndicesRef,
  revealedKeysRef,
}: {
  cell: MasonryCell;
  itemKey: React.Key;
  itemIndex: number;
  renderIndex: number;
  itemProps: React.HTMLAttributes<HTMLDivElement>;
  itemRef: React.Ref<HTMLDivElement>;
  pluginItemEntry?: MasonryPlugin;
  pluginOptions?: unknown;
  children: React.ReactNode;
  loading: NormalizedMasonryLoading;
  reveal: NormalizedMasonryRevealOptions;
  revealGateActive: boolean;
  scheduleReveal: (
    key: React.Key,
    revealItem: () => void,
    staggerMsOverride?: number,
  ) => () => void;
  revealedIndicesRef: React.RefObject<Set<number>>;
  revealedKeysRef: React.RefObject<Set<React.Key>>;
}) {
  const stateKey = getMasonryCellRevealKey(cell);
  const stage = loading.enabled && reveal.disabled !== true;
  const placeholderActive = cell.placeholder === true;
  const wasPreviouslyRevealed =
    stage && loading.rememberRevealed && revealedKeysRef.current.has(stateKey);
  const [node, setNode] = React.useState<HTMLDivElement | null>(null);
  const [mediaReady, setMediaReady] = React.useState(
    !stage || wasPreviouslyRevealed,
  );
  const [revealed, setRevealed] = React.useState(
    !stage || wasPreviouslyRevealed,
  );
  const [settled, setSettled] = React.useState(!stage || wasPreviouslyRevealed);
  const skeletonMountedAtRef = React.useRef(0);
  const revealTimeoutRef = React.useRef<ReturnType<
    typeof globalThis.setTimeout
  > | null>(null);
  const inView = useElementInViewOnce(stage && !wasPreviouslyRevealed, node, {
    rootMargin: loading.rootMargin,
    threshold: loading.threshold,
    resetKey: stateKey,
  });
  const painted = useDoublePaintReady(
    stage && !wasPreviouslyRevealed,
    stateKey,
  );
  const loadingForce = React.useMemo(
    () => resolveLoadingForceOptions(loading.force),
    [loading.force],
  );
  const loadingBlocksReveal =
    (loading.active || placeholderActive) &&
    (!loadingForce.enabled || !loadingForce.showContent);
  const compareMode =
    loading.active &&
    loadingForce.enabled &&
    loadingForce.showContent &&
    (revealed || settled || mediaReady);
  const ready = !stage || revealed || settled || compareMode;
  const skeleton = renderMasonrySkeletonNode({
    skeleton: loading.skeleton,
    index: renderIndex,
    itemIndex,
    itemKey,
    revealKey: stateKey,
    placeholder: !!cell.placeholder,
    ready,
    cell,
  });
  const hasSkeleton = skeleton != null;
  const revealReady = !stage || (!loadingBlocksReveal && ready);
  const shouldMountSkeleton =
    hasSkeleton &&
    (!settled ||
      loading.active ||
      placeholderActive ||
      loading.keepSkeletonMounted);

  const mergedRef = React.useCallback(
    (nextNode: HTMLDivElement | null) => {
      setNode(nextNode);
      assignRef(itemRef, nextNode);
    },
    [itemRef],
  );

  React.useLayoutEffect(() => {
    if (!hasSkeleton) return;
    skeletonMountedAtRef.current =
      typeof performance === "undefined" ? 0 : performance.now();
  }, [hasSkeleton, stateKey]);

  React.useLayoutEffect(() => {
    const rememberedReveal =
      stage &&
      loading.rememberRevealed &&
      revealedKeysRef.current.has(stateKey);

    if (!stage || rememberedReveal) {
      setMediaReady(true);
      setRevealed(true);
      setSettled(true);
      return;
    }

    setMediaReady(false);
    setRevealed(false);
    setSettled(false);
  }, [loading.rememberRevealed, revealedKeysRef, stage, stateKey]);

  React.useEffect(() => {
    if (!stage || !loading.active) return;
    setSettled(false);
  }, [loading.active, stage, stateKey]);

  React.useEffect(() => {
    if (!stage || !node || !inView || !painted || mediaReady) return;

    if (!loading.waitForMedia) {
      const timeout = globalThis.setTimeout(() => setMediaReady(true), 0);
      return () => globalThis.clearTimeout(timeout);
    }

    let cancelled = false;
    void waitForElementMediaReady(node, {
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
    node,
    painted,
    stage,
    stateKey,
  ]);

  const markRevealed = React.useCallback(() => {
    setRevealed(true);
    revealedIndicesRef.current.add(itemIndex);
    revealedKeysRef.current.add(stateKey);
  }, [itemIndex, revealedIndicesRef, revealedKeysRef, stateKey]);

  React.useEffect(() => {
    if (
      !stage ||
      !revealGateActive ||
      !inView ||
      !painted ||
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
      typeof performance === "undefined"
        ? loading.minVisibleMs
        : performance.now() - skeletonMountedAtRef.current;
    const revealDelay = hasSkeleton
      ? Math.max(0, loading.minVisibleMs - elapsed)
      : 0;

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
    revealGateActive,
    revealed,
    scheduleReveal,
    stage,
    stateKey,
  ]);

  React.useEffect(() => {
    if (!stage || !hasSkeleton || !revealed || settled || loading.exitMs > 0)
      return;
    setSettled(true);
  }, [hasSkeleton, loading.exitMs, revealed, settled, stage]);

  React.useEffect(() => {
    return () => {
      if (revealTimeoutRef.current != null) {
        globalThis.clearTimeout(revealTimeoutRef.current);
        revealTimeoutRef.current = null;
      }
    };
  }, []);

  const lifecycleItemProps = {
    ...itemProps,
    ref: mergedRef,
    "data-rmg-masonry-item-stage": stage ? "1" : undefined,
    "data-rmg-masonry-item-reveal": stage
      ? revealReady
        ? "1"
        : "0"
      : undefined,
    "data-rmg-masonry-item-compare": compareMode ? "1" : undefined,
    "data-rmg-masonry-item-reveal-settled": settled ? "1" : undefined,
    "aria-hidden": cell.placeholder ? true : itemProps["aria-hidden"],
  } as React.HTMLAttributes<HTMLDivElement>;

  const content = (
    <>
      {children}
      {shouldMountSkeleton ? (
        <div
          className={styles.itemSkeleton}
          data-rmg-masonry-item-skeleton="true"
          aria-hidden="true"
          style={{
            ["--rmg-masonry-item-skeleton-enter-duration" as any]: `${loading.enterMs}ms`,
            ["--rmg-masonry-item-skeleton-exit-duration" as any]: `${loading.exitMs}ms`,
            ["--rmg-masonry-item-skeleton-opacity" as any]: compareMode
              ? loadingForce.skeletonOpacity
              : undefined,
          }}
          onTransitionEnd={(event) => {
            if (event.target !== event.currentTarget) return;
            if (event.propertyName !== "opacity") return;
            if (!revealed) return;
            setSettled(true);
          }}
        >
          {skeleton}
        </div>
      ) : null}
    </>
  );

  if (pluginItemEntry?.renderItem) {
    const { ref: _ref, ...pluginItemProps } =
      lifecycleItemProps as React.HTMLAttributes<HTMLDivElement> & {
        ref?: React.Ref<HTMLDivElement>;
      };

    return (
      <React.Fragment>
        {pluginItemEntry.renderItem(
          {
            index: itemIndex,
            itemIndex,
            itemRef: mergedRef,
            itemProps: pluginItemProps,
            children: content,
            revealedIndicesRef,
          },
          pluginOptions,
        )}
      </React.Fragment>
    );
  }

  return <div {...lifecycleItemProps}>{content}</div>;
}

const MasonryImpl = React.forwardRef<MasonryHandle, MasonryOptions>(
  function MasonryImpl(
    {
      columns,
      gap,
      placement = "balanced",
      plugins,
      as: RootComponent = "div",
      rootRef,
      classNames,
      className,
      style,
      children,
      breakpoints,
      reveal: revealProp,
      revealReady = true,
      loading: loadingProp,
    },
    forwardedRef,
  ) {
    const skeletonRevealGate = useSkeletonRevealGate();
    const rootNodeRef = React.useRef<HTMLElement | null>(null);
    const readySubsRef = React.useRef(
      new Set<(nodes: HTMLElement[]) => void>(),
    );
    const readyRef = React.useRef(false);
    const revealedIndicesRef = React.useRef(new Set<number>());
    const revealedKeysRef = React.useRef(new Set<React.Key>());
    const [clientReady, setClientReady] = React.useState(false);
    const [inView, setInView] = React.useState(false);
    const measuredWidth = useElementWidth(rootNodeRef);
    const observedViewportWidth = useViewportWidth();
    const viewportWidth =
      observedViewportWidth || DEFAULT_SERVER_VIEWPORT_WIDTH;
    const prefersReducedMotion = usePrefersReducedMotion();
    const reveal = React.useMemo(
      () => normalizeReveal(revealProp),
      [revealProp],
    );
    const loading = React.useMemo(
      () => normalizeMasonryLoading(loadingProp, prefersReducedMotion),
      [loadingProp, prefersReducedMotion],
    );
    const effectiveBreakpoints = React.useMemo(
      () => ({ ...BREAKPOINT_MAP, ...(breakpoints ?? {}) }),
      [breakpoints],
    );
    const cells = React.useMemo(() => collectCells(children), [children]);
    const activePlugins = React.useMemo(
      () => (plugins ?? []).filter(isMasonryPlugin),
      [plugins],
    );
    const pluginsLoading = React.useMemo(
      () => activePlugins.some((plugin) => !!(plugin.options as any)?.loading),
      [activePlugins],
    );
    const dataWindowCells = React.useMemo(
      () => resolveDataWindow(cells, activePlugins).map(({ item }) => item),
      [activePlugins, cells],
    );
    const renderCells = React.useMemo(() => {
      if (dataWindowCells.length > 0) return dataWindowCells;
      return getPlaceholderCells(loading);
    }, [dataWindowCells, loading]);
    const renderCellRevealKeys = React.useMemo(
      () => renderCells.map(getMasonryCellRevealKey),
      [renderCells],
    );
    const pluginItemEntry = React.useMemo(
      () => activePlugins.find((plugin) => plugin.renderItem),
      [activePlugins],
    );
    const columnCount = resolveMasonryColumns({
      columns,
      viewportWidth,
      breakpointMap: effectiveBreakpoints,
    });
    const gapPx = resolveMasonryGap({
      gap,
      viewportWidth,
      breakpointMap: effectiveBreakpoints,
    });
    const hasMeasuredWidth = measuredWidth > 0;
    const layoutWidth = hasMeasuredWidth ? measuredWidth : viewportWidth;
    const layout = React.useMemo(
      () =>
        buildDimensionedMasonryLayout({
          items: renderCells,
          columnCount,
          gapPx,
          containerWidth: layoutWidth,
          placement,
          viewportWidth,
          breakpointMap: effectiveBreakpoints,
        }),
      [
        renderCells,
        columnCount,
        gapPx,
        layoutWidth,
        placement,
        viewportWidth,
        effectiveBreakpoints,
      ],
    );
    const fluidLayout = React.useMemo(
      () =>
        hasMeasuredWidth
          ? null
          : buildDimensionedMasonryFluidLayout({
              items: renderCells,
              columnCount,
              gapPx,
              placement,
              viewportWidth,
              breakpointMap: effectiveBreakpoints,
            }),
      [
        renderCells,
        columnCount,
        gapPx,
        hasMeasuredWidth,
        placement,
        viewportWidth,
        effectiveBreakpoints,
      ],
    );
    const responsiveFluidScope = React.useMemo(
      () =>
        buildStableScopeId("rmg_masonry_fluid_", {
          columns,
          gap,
          placement,
          items: renderCells.map((cell) => ({
            width: cell.width,
            height: cell.height,
            span: cell.span,
          })),
          breakpoints: effectiveBreakpoints,
        }),
      [columns, gap, placement, renderCells, effectiveBreakpoints],
    );
    const responsiveFluidCss = React.useMemo(() => {
      if (hasMeasuredWidth) return null;

      return buildResponsiveFluidLayoutCss({
        scopeId: responsiveFluidScope,
        columns,
        gap,
        placement,
        items: renderCells,
        breakpointMap: effectiveBreakpoints,
      });
    }, [
      columns,
      effectiveBreakpoints,
      gap,
      hasMeasuredWidth,
      placement,
      renderCells,
      responsiveFluidScope,
    ]);
    const ready =
      (renderCells.length === 0 || measuredWidth > 0) &&
      !pluginsLoading &&
      !loading.active;
    const itemLifecycleActive = loading.enabled && reveal.disabled !== true;
    const revealActive =
      reveal.disabled ||
      (clientReady && inView && revealReady && (skeletonRevealGate ?? true));
    const revealGateActive =
      reveal.disabled ||
      (clientReady && revealReady && (skeletonRevealGate ?? true));
    const { clearRevealScheduler, pruneRevealQueue, scheduleReveal } =
      useItemRevealScheduler({
        staggerMs: reveal.staggerMs,
        revealedKeysRef,
      });

    const onInView = React.useCallback(() => {
      setInView(true);
    }, []);

    const mergedRootRef = React.useCallback(
      (node: HTMLElement | null) => {
        rootNodeRef.current = node;
        assignRef(rootRef, node);
      },
      [rootRef],
    );

    React.useEffect(() => {
      setClientReady(true);
    }, []);

    React.useEffect(() => {
      revealedIndicesRef.current.clear();
    }, [renderCells.length]);

    React.useEffect(() => {
      if (loading.rememberRevealed) return;

      const currentKeys = new Set(renderCellRevealKeys);

      revealedKeysRef.current.forEach((key) => {
        if (!currentKeys.has(key)) {
          revealedKeysRef.current.delete(key);
        }
      });

      pruneRevealQueue(currentKeys);
    }, [loading.rememberRevealed, pruneRevealQueue, renderCellRevealKeys]);

    React.useEffect(() => {
      if (pluginsLoading) {
        clearRevealScheduler();
      }
    }, [clearRevealScheduler, pluginsLoading]);

    useInViewOnce(!reveal.disabled, rootNodeRef, onInView);

    const handle = React.useMemo<MasonryHandle>(
      () => ({
        getRootNode: () => rootNodeRef.current,
        getItemNodes: () => getItemNodes(rootNodeRef.current),
        isReady: () => readyRef.current,
        onReady: (callback) => {
          readySubsRef.current.add(callback);
          return () => {
            readySubsRef.current.delete(callback);
          };
        },
      }),
      [],
    );

    const pluginHost = React.useMemo(
      () => ({
        handle,
        itemCount: cells.length,
        ready,
      }),
      [cells.length, handle, ready],
    );

    React.useImperativeHandle(forwardedRef, () => handle, [handle]);

    React.useEffect(() => {
      readyRef.current = ready;
      if (!ready) return;
      const nodes = getItemNodes(rootNodeRef.current);
      readySubsRef.current.forEach((callback) => callback(nodes));
    }, [ready, layout.height]);

    const virtualOptions = getDataPluginOptions<DataVirtualizationOptions>(
      activePlugins,
      "virtualization",
    );
    const virtualItems = React.useMemo(
      () =>
        layout.items.map((item) => ({
          top:
            typeof item.top === "number"
              ? item.top
              : parseFloat(String(item.top)) || 0,
          height:
            typeof item.height === "number"
              ? item.height
              : parseFloat(String(item.height)) || 0,
        })),
      [layout.items],
    );
    const virtualRange = useAbsoluteVirtualRange(
      virtualItems,
      rootNodeRef,
      virtualOptions,
    );

    return (
      <>
        <RootComponent
          ref={mergedRootRef}
          className={cx(
            styles.root,
            !itemLifecycleActive && !reveal.disabled && styles.revealContainer,
            !itemLifecycleActive &&
              !reveal.disabled &&
              revealActive &&
              styles.revealActive,
            classNames?.root,
            className,
          )}
          data-rmg-masonry-loading={loading.enabled ? "true" : undefined}
          data-rmg-masonry-fluid-scope={
            responsiveFluidCss ? responsiveFluidScope : undefined
          }
          style={{
            height: hasMeasuredWidth ? layout.height : undefined,
            ["--rmg-cols" as any]: columnCount,
            ["--rmg-gap" as any]: `${gapPx}px`,
            ["--rmg-reveal-stagger" as any]: `${reveal.staggerMs}ms`,
            ["--rmg-reveal-duration" as any]: `${reveal.durationMs}ms`,
            ["--rmg-reveal-easing" as any]: reveal.easing,
            ...style,
          }}
          aria-busy={ready ? undefined : true}
        >
          {responsiveFluidCss ? (
            <style dangerouslySetInnerHTML={{ __html: responsiveFluidCss }} />
          ) : null}
          {!hasMeasuredWidth ? (
            <div
              data-rmg-masonry-fluid-spacer="true"
              aria-hidden="true"
              style={
                responsiveFluidCss
                  ? undefined
                  : {
                      display: "block",
                      width: "100%",
                      height: fluidLayout?.height ?? layout.height,
                      visibility: "hidden",
                      pointerEvents: "none",
                    }
              }
            />
          ) : null}
          {renderCells.map((cell, index) => {
            const item = layout.items[index];
            const fluidItem = fluidLayout?.items[index];
            if (!item) return null;
            if (index < virtualRange.start || index >= virtualRange.end)
              return null;
            const itemIndex = cell.id;
            const itemKey = cell.placeholder
              ? `rmg-masonry-loading-${index}`
              : cell.id;

            const itemProps = {
              "data-rmg-idx": itemIndex,
              "data-rmg-masonry-fluid-index": responsiveFluidCss
                ? index
                : undefined,
              className: cx(
                styles.item,
                "rmg__masonry-item",
                classNames?.item,
                cell.className,
              ),
              style: {
                ...(responsiveFluidCss
                  ? null
                  : {
                      top: fluidItem?.top ?? item.top,
                      left: fluidItem?.left ?? item.left,
                      width: fluidItem?.width ?? item.width,
                      height: fluidItem?.height ?? item.height,
                    }),
                ["--rmg-reveal-index" as any]: index,
                ...cell.style,
              },
            } as React.HTMLAttributes<HTMLDivElement>;

            const itemRef = (_node: HTMLDivElement | null) => {};

            return (
              <MasonryLightItemHost
                key={itemKey}
                cell={cell}
                itemKey={itemKey}
                itemIndex={itemIndex}
                renderIndex={index}
                itemProps={itemProps}
                itemRef={itemRef}
                pluginItemEntry={pluginItemEntry}
                pluginOptions={pluginItemEntry?.options}
                loading={loading}
                reveal={reveal}
                revealGateActive={revealGateActive}
                scheduleReveal={scheduleReveal}
                revealedIndicesRef={revealedIndicesRef}
                revealedKeysRef={revealedKeysRef}
              >
                {cell.children}
              </MasonryLightItemHost>
            );
          })}
        </RootComponent>
        {activePlugins.map((plugin, index) => {
          const Runtime = plugin.Runtime;
          return Runtime ? (
            <Runtime
              key={`${plugin.kind}-${index}`}
              host={pluginHost}
              options={plugin.options}
            />
          ) : null;
        })}
      </>
    );
  },
);

const Masonry = Object.assign(MasonryImpl, {
  Item: MasonryItem,
}) as MasonryComponent;

export default Masonry;
export { Masonry };
export type {
  MasonryPlugin,
  MasonryPluginHost,
  MasonryPluginKind,
  MasonryPluginRuntimeProps,
} from "./types";
