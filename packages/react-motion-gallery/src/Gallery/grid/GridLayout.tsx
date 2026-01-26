import * as React from 'react';
import styles from '../index.module.css';
import type { BreakpointMap, ResponsiveNumber } from '../shared/responsive';
import { resolveNumberFromResponsive } from '../shared/responsive';

// ✅ shared hooks (update these paths/names to yours)
import { useInViewOnce } from '../shared/hooks/useInViewOnce';
import { useMediaReady } from '../shared/hooks/useMediaReady';

type GridOptions = {
  columns?: ResponsiveNumber;
  minColumnWidth?: number | string;
  gap?: ResponsiveNumber;
  rootClassName?: string;
  itemClassName?: string;
};

type IntroConfig = {
  active: boolean;
  containerProps: React.HTMLAttributes<HTMLDivElement>;
};

type IntroNormalized = {
  renderIntro?: (args: IntroConfig, inner: React.ReactNode) => React.ReactNode;
  staggerMs: number;
  transform: string;
  durationMs: number;
  easing: string;
};

type LoadingNormalized = {
  isLoading?: boolean;
  renderLoading?: (args: { layout: 'grid'; count: number }) => React.ReactNode;
};

export type GridLayoutProps = {
  cells: Array<{ id: string; node: React.ReactNode }>;
  grid: GridOptions;
  breakpoints: BreakpointMap;
  viewportWidth: number;

  loading: LoadingNormalized;
  intro: IntroNormalized;

  // fullscreen wiring from Gallery
  enableFullscreen: boolean;
  onOpen: (index: number, originEl?: HTMLElement | null) => void;
  registerExpandableImg: (index: number, node: HTMLElement | null) => void;

  // styling
  gridItemBaseClass?: string; // default 'rmg__grid-item'
  renderMode?: "wrap" | "passthrough";
};

export function GridLayout({
  cells,
  grid,
  breakpoints,
  viewportWidth,
  loading,
  intro,
  enableFullscreen,
  onOpen,
  registerExpandableImg,
  gridItemBaseClass = 'rmg__grid-item',
  renderMode
}: GridLayoutProps) {
  /* ------------------------------------------------------------------
     View + media-ready (shared hooks)
  ------------------------------------------------------------------ */
  const gridRootRef = React.useRef<HTMLDivElement | null>(null);

  const [inView, setInView] = React.useState(false);
  const [mediaReady, setMediaReady] = React.useState(false);

  // in-view once
  useInViewOnce(true, gridRootRef as any, () => setInView(true));

  // media ready
  useMediaReady(true, gridRootRef as any, setMediaReady);

  const isLoading = loading.isLoading ?? !mediaReady;
  const introActive = !isLoading && inView;

  /* ------------------------------------------------------------------
     Grid style
  ------------------------------------------------------------------ */
  const minWidth =
    typeof grid.minColumnWidth === 'number'
      ? `${grid.minColumnWidth}px`
      : grid.minColumnWidth ?? '160px';

  const gapVal = React.useMemo(() => {
    if (typeof grid.gap === 'string' && Number.isNaN(parseFloat(grid.gap))) return grid.gap;

    const raw = resolveNumberFromResponsive(
      grid.gap,
      typeof grid.gap === 'number' ? grid.gap : 8,
      viewportWidth,
      breakpoints
    );

    const px = Math.max(0, raw | 0);
    return `${px}px`;
  }, [grid.gap, viewportWidth, breakpoints]);

  const resolvedGridColumnCount = React.useMemo(() => {
    if (grid.columns == null) return undefined;
    const raw = resolveNumberFromResponsive(grid.columns, 1, viewportWidth, breakpoints);
    return Math.max(1, raw | 0);
  }, [grid.columns, viewportWidth, breakpoints]);

  const gridStyle: React.CSSProperties = {
    ['--rmg-grid-min' as any]: minWidth,
    ['--rmg-grid-gap' as any]: gapVal,
  };

  if (resolvedGridColumnCount && resolvedGridColumnCount > 0) {
    gridStyle.gridTemplateColumns = `repeat(${resolvedGridColumnCount}, minmax(0, 1fr))`;
  }

  /* ------------------------------------------------------------------
     Loading UI
  ------------------------------------------------------------------ */
  const skeletonCount = cells.length;

  const defaultGridSkeleton = (
    <div className={styles.gridSkeletonOverlay}>
      <div
        className={[styles.gridSkeletonGrid, grid.rootClassName || ''].filter(Boolean).join(' ')}
        style={gridStyle}
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={`rmg-grid-skel-${i}`} className={styles.gridSkeletonItem} />
        ))}
      </div>
    </div>
  );

  const loadingNode = isLoading
    ? loading.renderLoading
      ? loading.renderLoading({ layout: 'grid', count: skeletonCount })
      : defaultGridSkeleton
    : null;

  /* ------------------------------------------------------------------
     Children
  ------------------------------------------------------------------ */
  const renderModeProp = renderMode ?? "wrap";

  const gridChildren = React.useMemo(() => {
    return cells.map((cell, index) => {
      const original = cell.node;

      const introStyle: React.CSSProperties & Record<string, any> = {
        ["--rmg-intro-index" as any]: index,
      };

      const baseClassName = [
        gridItemBaseClass,
        styles.gridItem,
        styles.introItem,
        grid.itemClassName || "",
      ]
        .filter(Boolean)
        .join(" ");

      // ✅ PASS-THROUGH MODE: don't wrap/clone, don't touch clicks/refs.
      // This is the mode you want for Entries, because EntryList already handles click/origin.
      if (renderModeProp === "passthrough") {
        return (
          <div
            key={cell.id}
            data-rmg-idx={index}
            className={baseClassName}
            style={introStyle}
          >
            {original as any}
          </div>
        );
      }

      // ------------------------------
      // Existing WRAP MODE (unchanged)
      // ------------------------------
      if (!React.isValidElement(original)) {
        return (
          <button
            key={cell.id}
            type="button"
            data-rmg-idx={index}
            className={baseClassName}
            style={introStyle}
            onClick={(e) => {
              e.preventDefault();
              if (!enableFullscreen) return;
              onOpen(index, e.currentTarget);
            }}
          >
            {original as any}
          </button>
        );
      }

      const originalEl = original as React.ReactElement<any, any>;
      const origProps = (originalEl.props ?? {}) as {
        onClick?: React.MouseEventHandler<HTMLElement>;
        className?: string;
        style?: React.CSSProperties;
      };
      const origRef = (originalEl as any).ref as React.Ref<HTMLElement> | undefined;

      const mergedRef: React.RefCallback<HTMLElement> = (node) => {
        if (typeof origRef === "function") origRef(node);
        else if (origRef && typeof origRef === "object") (origRef as any).current = node;
        registerExpandableImg(index, node);
      };

      const mergedOnClick: React.MouseEventHandler<HTMLElement> = (e) => {
        origProps.onClick?.(e);
        if (e.defaultPrevented) return;
        if (!enableFullscreen) return;
        onOpen(index, e.currentTarget);
      };

      return React.cloneElement(originalEl, {
        key: cell.id,
        ref: mergedRef,
        onClick: mergedOnClick,
        "data-rmg-idx": index,
        className: [baseClassName, origProps.className || ""].filter(Boolean).join(" "),
        style: { ...(origProps.style || {}), ...introStyle },
      });
    });
  }, [
    cells,
    enableFullscreen,
    onOpen,
    registerExpandableImg,
    grid.itemClassName,
    gridItemBaseClass,
    renderModeProp,
  ]);

  React.useLayoutEffect(() => {
    if (renderModeProp !== "passthrough") return;

    const root = gridRootRef.current;
    if (!root) return;

    // Find each rendered cell wrapper by data-rmg-idx
    for (let i = 0; i < cells.length; i++) {
      const host = root.querySelector(`[data-rmg-idx="${i}"]`) as HTMLElement | null;
      if (!host) {
        registerExpandableImg(i, null);
        continue;
      }

      // Prefer an actual img inside
      const img = host.querySelector("img") as HTMLImageElement | null;
      registerExpandableImg(i, img ?? host);
    }

    // Cleanup: when unmounting, clear refs
    return () => {
      for (let i = 0; i < cells.length; i++) registerExpandableImg(i, null);
    };
  }, [renderModeProp, cells.length, registerExpandableImg]);

  /* ------------------------------------------------------------------
     Container + intro wrapper
  ------------------------------------------------------------------ */
  const containerProps: React.HTMLAttributes<HTMLDivElement> = {
    className: [
      styles.gridRoot,
      styles.introContainer,
      introActive ? styles.introActive : '',
      grid.rootClassName || '',
    ]
      .filter(Boolean)
      .join(' '),
    style: {
      ...gridStyle,
      ['--rmg-intro-stagger' as any]: `${intro.staggerMs}ms`,
      ['--rmg-intro-transform' as any]: intro.transform,
      ['--rmg-intro-duration' as any]: `${intro.durationMs}ms`,
      ['--rmg-intro-easing' as any]: intro.easing,
    },
    'aria-busy': isLoading ? true : undefined,
  };

  const inner = (
    <div ref={gridRootRef} {...containerProps}>
      {gridChildren}
    </div>
  );

  const introWrapped = intro.renderIntro
    ? intro.renderIntro({ active: introActive, containerProps }, inner)
    : inner;

  return (
    <>
      {loadingNode}
      {introWrapped}
    </>
  );
}
