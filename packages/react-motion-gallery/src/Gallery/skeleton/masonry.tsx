"use client";

import * as React from "react";

import {
  BREAKPOINT_MAP,
  DEFAULT_SERVER_VIEWPORT_WIDTH,
  type BreakpointMap,
  type ResponsiveNumber,
} from "../shared/responsive";
import { useViewportWidth } from "../shared/hooks/useViewportWidth";
import {
  buildDimensionedMasonryLayout,
  buildDimensionedMasonryFluidLayout,
  collectMasonryResponsiveMinWidths,
  resolveMasonryColumns,
  resolveMasonryGap,
  type MasonryDimensionItem,
} from "../masonry/light/placement";
import type {
  MasonryPlacement,
  ResponsiveMasonrySpan,
} from "../masonry/light/placement";
import { SkeletonRevealGateProvider } from "../shared/loading/skeletonRevealGate";
import styles from "./MasonryLightSkeleton.module.css";

export type {
  MasonryPlacement,
  ResponsiveMasonrySpan,
} from "../masonry/light/placement";

export type SkeletonLength = number | string;

export type SkeletonShimmer = {
  durationMs?: number;
  angleDeg?: number;
  opacity?: number;
  blurPx?: number;
  timing?: string;
  c1?: string;
  c2?: string;
  c3?: string;
};

export type MasonrySkeletonItem = {
  width: number;
  height: number;
  span?: ResponsiveMasonrySpan;
};

export type SkeletonMasonryOptions = {
  count?: number;
  items?: ReadonlyArray<MasonrySkeletonItem>;
  columns?: ResponsiveNumber;
  gap?: ResponsiveNumber;
  ratios?: number[];
  heightsPx?: number[];
  spans?: ReadonlyArray<ResponsiveMasonrySpan | undefined>;
  placement?: MasonryPlacement;
  viewportWidth?: number;
  layoutWidthPx?: number;
};

export type MasonrySkeletonProps = SkeletonMasonryOptions & {
  masonry?: SkeletonMasonryOptions;
  children?: React.ReactNode;
  breakpoints?: BreakpointMap;
  className?: string;
  style?: React.CSSProperties;
  shellClassName?: string;
  shellStyle?: React.CSSProperties;
  contentClassName?: string;
  contentStyle?: React.CSSProperties;
  backgroundColor?: string;
  radius?: SkeletonLength;
  shimmer?: SkeletonShimmer;
  disableShimmer?: boolean;
  ariaLabel?: string;
  ready?: boolean;
  enabled?: boolean;
  timing?: MasonrySkeletonTimingOptions;
};

export type SkeletonMasonryLayout = {
  kind: "masonry";
  count?: number;
  items?: ReadonlyArray<MasonrySkeletonItem>;
  columns?: ResponsiveNumber;
  gap?: ResponsiveNumber;
  ratios?: number[];
  heightsPx?: number[];
  spans?: ReadonlyArray<ResponsiveMasonrySpan | undefined>;
  placement?: MasonryPlacement;
  viewportWidth?: number;
  layoutWidthPx?: number;
};

export type MasonrySkeletonSlot = MasonrySkeletonItem;
export type MasonrySkeletonNode = SkeletonMasonryLayout;
export type MasonrySkeletonSpec = SkeletonMasonryOptions;
export type SkeletonNode = MasonrySkeletonItem;

const DEFAULT_RATIOS = [55, 90, 130, 75];
const DEFAULT_EXIT_MS = 600;
const DEFAULT_MIN_VISIBLE_MS = 220;

export type MasonrySkeletonTimingOptions = {
  enterMs?: number;
  exitMs?: number;
  minVisibleMs?: number;
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function cssLen(value: SkeletonLength | undefined) {
  return value == null ? undefined : typeof value === "number" ? `${value}px` : value;
}

function stablePart(value: unknown): string {
  if (value == null) return "";
  if (typeof value !== "object") return String(value);
  if (Array.isArray(value)) return value.map(stablePart).join(",");

  return Object.keys(value as Record<string, unknown>)
    .sort()
    .map((key) => `${key}:${stablePart((value as Record<string, unknown>)[key])}`)
    .join("|");
}

function stableScope(value: unknown) {
  const seed = stablePart(value);
  let hash = 0;
  for (let index = 0; index < seed.length; index++) {
    hash = (hash * 31 + seed.charCodeAt(index)) | 0;
  }
  return `lmskel_${(hash >>> 0).toString(36)}`;
}

function useTimedLoadingLayer(
  loadingActive: boolean,
  timing: MasonrySkeletonTimingOptions | undefined
) {
  const exitMs = Math.max(0, timing?.exitMs ?? DEFAULT_EXIT_MS);
  const enterMs = Math.max(0, timing?.enterMs ?? exitMs);
  const minVisibleMs = Math.max(
    0,
    timing?.minVisibleMs ?? DEFAULT_MIN_VISIBLE_MS
  );
  const [showLoadingLayer, setShowLoadingLayer] = React.useState(() => loadingActive);
  const [loadingExiting, setLoadingExiting] = React.useState(false);
  const [revealUnlocked, setRevealUnlocked] = React.useState(() => !loadingActive);
  const loadingVisibleSinceRef = React.useRef<number | null>(null);
  const wasLoadingActiveRef = React.useRef(loadingActive);

  React.useEffect(() => {
    if (showLoadingLayer && loadingVisibleSinceRef.current == null) {
      loadingVisibleSinceRef.current = Date.now();
      return;
    }

    if (!showLoadingLayer) {
      loadingVisibleSinceRef.current = null;
    }
  }, [showLoadingLayer]);

  React.useEffect(() => {
    if (loadingActive && !wasLoadingActiveRef.current) {
      loadingVisibleSinceRef.current = Date.now();
    }

    wasLoadingActiveRef.current = loadingActive;
  }, [loadingActive]);

  React.useEffect(() => {
    if (loadingActive) {
      setShowLoadingLayer(true);
      setLoadingExiting(false);
      setRevealUnlocked(false);
      return;
    }

    if (!showLoadingLayer) {
      setRevealUnlocked(true);
      return;
    }

    const visibleForMs =
      loadingVisibleSinceRef.current == null
        ? minVisibleMs
        : Math.max(0, Date.now() - loadingVisibleSinceRef.current);
    const remainingVisibleMs = Math.max(0, minVisibleMs - visibleForMs);
    let minVisibleTimer: ReturnType<typeof setTimeout> | null = null;
    let revealTimer: ReturnType<typeof setTimeout> | null = null;
    let exitTimer: ReturnType<typeof setTimeout> | null = null;

    const beginExit = () => {
      if (exitMs === 0) {
        setRevealUnlocked(true);
        setShowLoadingLayer(false);
        setLoadingExiting(false);
        return;
      }

      setLoadingExiting(true);
      revealTimer = setTimeout(() => {
        setRevealUnlocked(true);
      }, 0);
      exitTimer = setTimeout(() => {
        setShowLoadingLayer(false);
        setLoadingExiting(false);
      }, exitMs);
    };

    if (remainingVisibleMs > 0) {
      minVisibleTimer = setTimeout(beginExit, remainingVisibleMs);
    } else {
      beginExit();
    }

    return () => {
      if (minVisibleTimer) clearTimeout(minVisibleTimer);
      if (revealTimer) clearTimeout(revealTimer);
      if (exitTimer) clearTimeout(exitTimer);
    };
  }, [exitMs, loadingActive, minVisibleMs, showLoadingLayer]);

  return { enterMs, exitMs, showLoadingLayer, loadingExiting, revealUnlocked };
}

function shimmerVars(shimmer: SkeletonShimmer | undefined): React.CSSProperties {
  return {
    ...(shimmer?.durationMs != null
      ? ({ ["--rmg-skel-shimmer-duration" as any]: `${shimmer.durationMs}ms` } as any)
      : null),
    ...(shimmer?.angleDeg != null
      ? ({ ["--rmg-skel-shimmer-angle" as any]: `${shimmer.angleDeg}deg` } as any)
      : null),
    ...(shimmer?.opacity != null
      ? ({ ["--rmg-skel-shimmer-opacity" as any]: shimmer.opacity } as any)
      : null),
    ...(shimmer?.blurPx != null
      ? ({ ["--rmg-skel-shimmer-filter" as any]: `blur(${shimmer.blurPx}px)` } as any)
      : null),
    ...(shimmer?.timing
      ? ({ ["--rmg-skel-shimmer-timing" as any]: shimmer.timing } as any)
      : null),
    ...(shimmer?.c1 ? ({ ["--rmg-skel-shimmer-c1" as any]: shimmer.c1 } as any) : null),
    ...(shimmer?.c2 ? ({ ["--rmg-skel-shimmer-c2" as any]: shimmer.c2 } as any) : null),
    ...(shimmer?.c3 ? ({ ["--rmg-skel-shimmer-c3" as any]: shimmer.c3 } as any) : null),
  };
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

function resolveItems(options: SkeletonMasonryOptions): MasonryDimensionItem[] {
  if (options.items?.length) {
    return options.items.map((item) => ({
      width: item.width,
      height: item.height,
      span: item.span,
    }));
  }

  const count = Math.max(0, options.count ?? options.ratios?.length ?? options.heightsPx?.length ?? 1);
  const ratios = options.ratios?.length ? options.ratios : DEFAULT_RATIOS;

  return Array.from({ length: count }, (_, index) => {
    const height = options.heightsPx?.[index] ?? ratios[index % ratios.length] ?? 100;
    return {
      width: 100,
      height,
      span: options.spans?.[index],
    };
  });
}

function MasonrySkeletonNode({
  options,
  breakpoints,
  className,
  style,
  backgroundColor,
  radius,
  shimmer,
  disableShimmer,
  ariaLabel,
}: {
  options: SkeletonMasonryOptions;
  breakpoints: BreakpointMap;
  className?: string;
  style?: React.CSSProperties;
  backgroundColor?: string;
  radius?: SkeletonLength;
  shimmer?: SkeletonShimmer;
  disableShimmer?: boolean;
  ariaLabel?: string;
}) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const measuredWidth = useElementWidth(rootRef);
  const observedViewportWidth = useViewportWidth();
  const viewportReady = observedViewportWidth > 0;
  const liveViewportWidth = observedViewportWidth || DEFAULT_SERVER_VIEWPORT_WIDTH;
  const viewportWidth = options.viewportWidth ?? liveViewportWidth;
  const resolvedLayoutWidth = options.layoutWidthPx ?? measuredWidth;
  const hasResolvedLayoutWidth = resolvedLayoutWidth > 0;
  const layoutWidth = hasResolvedLayoutWidth ? resolvedLayoutWidth : viewportWidth;
  const items = React.useMemo(() => resolveItems(options), [options]);
  const responsiveScope = React.useMemo(
    () =>
      stableScope({
        columns: options.columns,
        gap: options.gap,
        placement: options.placement,
        items,
        breakpoints,
      }),
    [options.columns, options.gap, options.placement, items, breakpoints]
  );
  const columnCount = resolveMasonryColumns({
    columns: options.columns,
    viewportWidth,
    breakpointMap: breakpoints,
  });
  const gapPx = resolveMasonryGap({
    gap: options.gap,
    viewportWidth,
    breakpointMap: breakpoints,
  });
  const layout = React.useMemo(
    () =>
      buildDimensionedMasonryLayout({
        items,
        columnCount,
        gapPx,
        containerWidth: layoutWidth,
        placement: options.placement,
        viewportWidth,
        breakpointMap: breakpoints,
      }),
    [
      items,
      columnCount,
      gapPx,
      layoutWidth,
      options.placement,
      viewportWidth,
      breakpoints,
    ]
  );
  const fluidLayout = React.useMemo(
    () =>
      hasResolvedLayoutWidth
        ? null
        : buildDimensionedMasonryFluidLayout({
            items,
            columnCount,
            gapPx,
            placement: options.placement,
            viewportWidth,
            breakpointMap: breakpoints,
          }),
    [
      items,
      columnCount,
      gapPx,
      hasResolvedLayoutWidth,
      options.placement,
      viewportWidth,
      breakpoints,
    ]
  );
  let fluidVariants:
    | Array<{
        minWidth: number;
        layout: ReturnType<typeof buildDimensionedMasonryFluidLayout>;
      }>
    | null = null;
  if ((!hasResolvedLayoutWidth || !viewportReady) && options.viewportWidth == null) {
    const minWidths = collectMasonryResponsiveMinWidths({
      columns: options.columns,
      gap: options.gap,
      items,
      breakpointMap: breakpoints,
    });

    if (minWidths.length > 1) {
      fluidVariants = minWidths.map((minWidth) => {
        const variantResponsiveWidth = Math.max(1, minWidth);
        const variantColumnCount = resolveMasonryColumns({
          columns: options.columns,
          viewportWidth: variantResponsiveWidth,
          breakpointMap: breakpoints,
        });
        const variantGapPx = resolveMasonryGap({
          gap: options.gap,
          viewportWidth: variantResponsiveWidth,
          breakpointMap: breakpoints,
        });

        return {
          minWidth,
          layout: buildDimensionedMasonryFluidLayout({
            items,
            columnCount: variantColumnCount,
            gapPx: variantGapPx,
            placement: options.placement,
            viewportWidth: variantResponsiveWidth,
            breakpointMap: breakpoints,
          }),
        };
      });
    }
  }

  let responsiveCss: string | null = null;
  if (fluidVariants?.length) {
    const selector = `[data-rmg-mskel-scope="${responsiveScope}"]`;
    const rulesFor = (variant: (typeof fluidVariants)[number]) =>
      `${selector}{height:${variant.layout.height};}` +
      variant.layout.items
        .map(
          (item) =>
            `${selector}>div:nth-of-type(${item.index + 1}){top:${item.top};left:${item.left};width:${item.width};height:${item.height};}`
        )
        .join("");
    const css = [rulesFor(fluidVariants[0]!)];

    for (const variant of fluidVariants.slice(1)) {
      css.push(`@media (min-width:${variant.minWidth}px){${rulesFor(variant)}}`);
    }

    responsiveCss = css.join("");
  }
  const renderItems = () => {
    return layout.items.map((item) => {
      const fluidItem = fluidLayout?.items[item.index];
      return (
        <div
          key={item.index}
          data-rmg-mskel-index={item.index}
          className={cx(styles.item, !disableShimmer && styles.shimmer)}
          style={
            responsiveCss
              ? undefined
              : {
                  top: fluidItem?.top ?? item.top,
                  left: fluidItem?.left ?? item.left,
                  width: fluidItem?.width ?? item.width,
                  height: fluidItem?.height ?? item.height,
                }
          }
        />
      );
    });
  };

  return (
    <div className={styles.rootFrame}>
      <div
        ref={rootRef}
        className={cx(styles.root, className)}
        data-rmg-mskel-scope={responsiveCss ? responsiveScope : undefined}
        style={{
          height: responsiveCss ? undefined : fluidLayout?.height ?? layout.height,
          ["--rmg-skel-bg" as any]: backgroundColor,
          ["--rmg-skel-radius" as any]: cssLen(radius),
          ...(!disableShimmer ? shimmerVars(shimmer) : null),
          ...style,
        }}
        aria-hidden={ariaLabel ? undefined : true}
        aria-label={ariaLabel}
        role={ariaLabel ? "status" : undefined}
        aria-live={ariaLabel ? "polite" : undefined}
      >
        {responsiveCss ? <style dangerouslySetInnerHTML={{ __html: responsiveCss }} /> : null}
        {renderItems()}
      </div>
    </div>
  );
}

export function MasonrySkeleton({
  masonry,
  children,
  breakpoints,
  className,
  style,
  shellClassName,
  shellStyle,
  contentClassName,
  contentStyle,
  backgroundColor,
  radius,
  shimmer,
  disableShimmer,
  ariaLabel,
  ready,
  enabled = true,
  timing,
  ...options
}: MasonrySkeletonProps) {
  const effectiveOptions = masonry ? { ...options, ...masonry } : options;
  const effectiveBreakpoints = React.useMemo(
    () => ({ ...BREAKPOINT_MAP, ...(breakpoints ?? {}) }),
    [breakpoints]
  );
  const skeleton = (
    <MasonrySkeletonNode
      options={effectiveOptions}
      breakpoints={effectiveBreakpoints}
      className={className}
      style={style}
      backgroundColor={backgroundColor}
      radius={radius}
      shimmer={shimmer}
      disableShimmer={disableShimmer}
      ariaLabel={ariaLabel}
    />
  );

  const wrapperMode = children !== undefined;
  const loadingActive = wrapperMode && enabled !== false && ready !== true;
  const { enterMs, exitMs, showLoadingLayer, loadingExiting, revealUnlocked } = useTimedLoadingLayer(
    loadingActive,
    timing
  );

  if (!wrapperMode) return skeleton;

  const shouldShowSkeleton = enabled !== false && showLoadingLayer;
  const contentVisible = enabled === false || loadingExiting || !shouldShowSkeleton;
  const contentBlocked = enabled !== false && shouldShowSkeleton && !loadingExiting;
  const transitionStyle = {
    ["--rmg-light-mskel-enter-ms" as any]: `${enterMs}ms`,
    ["--rmg-light-mskel-exit-ms" as any]: `${exitMs}ms`,
  } as React.CSSProperties;

  return (
    <div className={cx(styles.shell, shellClassName)} style={shellStyle}>
      {shouldShowSkeleton ? (
        <div
          className={cx(
            styles.layer,
            styles.loadingLayer,
            loadingExiting && styles.loadingLayerExit
          )}
          style={transitionStyle}
          data-rmg-light-mskel-loading-layer="true"
        >
          {skeleton}
        </div>
      ) : null}
      <div
        className={cx(
          styles.layer,
          styles.content,
          contentVisible && styles.contentVisible,
          contentBlocked && styles.contentBlocked,
          contentClassName
        )}
        style={{
          ...transitionStyle,
          ...contentStyle,
        }}
        aria-hidden={contentVisible ? undefined : true}
        data-rmg-light-mskel-content-layer="true"
      >
        <SkeletonRevealGateProvider value={revealUnlocked}>
          {children}
        </SkeletonRevealGateProvider>
      </div>
    </div>
  );
}

export { MasonrySkeleton as Skeleton, MasonrySkeleton as default };
