/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import styles from "./Slider.module.css";
import SliderCore from "./Slider";
import createIndexChannel from "./sliderSub";
import { DEFAULT_SLIDER } from "./defaults";
import { BREAKPOINT_MAP, resolveNumberFromResponsive } from "../shared/responsive";
import { useViewportWidth } from "../shared/hooks/useViewportWidth";
import { usePrefersReducedMotion } from "../shared/hooks/usePrefersReducedMotion";
import { buildScopedSkeletonCountCss } from "../shared/skeleton/buildScopedSkeletonCountCss";
import type { BreakpointMap } from "../shared/responsive";
import type { SliderHandle, SliderLoadingOptions, SliderOptions  } from "./types";
import type { SliderIndexChannel } from "./sliderSub";
import { useOptionalGalleryCore } from "../core";
import { SliderSkeletonCard } from "./SliderSkeleton";
import { buildInitialHeightFromSkeletonSpecCssExpr } from "./SliderSkeleton";

type Props = SliderOptions & {
  children?: React.ReactNode;
  breakpoints?: BreakpointMap;
  expandableImageRefs?: React.RefObject<Array<HTMLImageElement | null>>;
  indexChannel?: SliderIndexChannel;
};

const SKELETON_EXIT_MS = 220;
const INTRO_OVERLAP_MS = 220;

function useScopedSkeleton(args: {
  enabled: boolean;
  scopeId: string;
  loading: SliderLoadingOptions;
  fallbackCount: number;
  breakpointMap: BreakpointMap;
  maxSlots?: number;
  showLoadingFallback: boolean;
  defaultNode: (maxSlots: number, baseCount: number) => React.ReactNode;
}) {
  const {
    enabled,
    scopeId,
    loading,
    fallbackCount,
    breakpointMap,
    maxSlots = 12,
    showLoadingFallback,
    defaultNode,
  } = args;

  const loadingEnabled = loading.enabled ?? true;
  const loadingForced = loading.force ?? false;

  const showLoading =
    enabled && loadingEnabled && (loadingForced || showLoadingFallback);

  const { cssText, ssrBaseCount } = React.useMemo(() => {
    if (!enabled || !loadingEnabled) return { cssText: "", ssrBaseCount: fallbackCount };

    return buildScopedSkeletonCountCss({
      scopeId,
      responsiveCount: (loading as any).skeletonCount,
      fallbackCount,
      breakpointMap,
      maxSlots,
    });
  }, [
    enabled,
    loadingEnabled,
    scopeId,
    (loading as any).skeletonCount,
    fallbackCount,
    breakpointMap,
    maxSlots,
  ]);

  const node = React.useMemo(() => {
    if (!showLoading) return null;

    if (loading.renderLoading) {
      return loading.renderLoading({ count: ssrBaseCount } as any);
    }

    return defaultNode(maxSlots, ssrBaseCount);
  }, [showLoading, loading.renderLoading, defaultNode, maxSlots, ssrBaseCount]);

  return { cssText, ssrBaseCount, node, showLoading };
}

function buildScopedInitialHeightCss(args: {
  scopeId: string;
  skeletonSpec: any; // SliderSkeletonSpec | undefined
  responsiveCount: any; // loading.skeletonCount
  fallbackCount: number;
  breakpointMap: BreakpointMap;
}) {
  const { scopeId, skeletonSpec, responsiveCount, fallbackCount } = args;

  const spec = skeletonSpec;
  const layout = spec?.layout;
  if (!layout) return "";

  const mode: "fit" | "peek" = spec?.mode ?? "fit";

  const shellSel = `#${scopeId} > [data-rmg-scope-shell="true"]`;

  const mkRule = (count: number) => {
    const expr = buildInitialHeightFromSkeletonSpecCssExpr(layout, count, mode);
    if (!expr) return "";
    return `${shellSel}{--rmg-slider-initial-height:${expr};}`;
  };

  // responsiveCount can be number or { [minWidth]: count }
  if (typeof responsiveCount === "number") {
    return mkRule(Math.max(1, responsiveCount | 0)) || mkRule(fallbackCount);
  }

  if (responsiveCount && typeof responsiveCount === "object") {
    const entries = Object.entries(responsiveCount)
      .map(([k, v]) => [Number(k), Number(v)] as const)
      .filter(([k, v]) => Number.isFinite(k) && Number.isFinite(v))
      .sort((a, b) => a[0] - b[0]);

    const lines: string[] = [];
    // base
    lines.push(mkRule(entries[0]?.[1] ?? fallbackCount) || mkRule(fallbackCount));

    for (const [minW, c] of entries) {
      const rule = mkRule(Math.max(1, c | 0));
      if (rule) lines.push(`@media (min-width:${minW}px){${rule}}`);
    }

    return lines.filter(Boolean).join("\n");
  }

  return mkRule(fallbackCount);
}

export const Slider = React.forwardRef<SliderHandle, Props>(function Slider(
  props,
  forwardedRef
) {
  const {
    children,
    breakpoints,
    indexChannel: providedIndexChannel,
    ...sliderOptions
  } = props;
  const core = useOptionalGalleryCore();
  const internalIndexChannel = React.useMemo(() => createIndexChannel(), []);
  const resolvedIndexChannel = providedIndexChannel ?? internalIndexChannel;
  const isClick = React.useRef(false);
  const localExpandableImageRefs = React.useRef<Array<HTMLImageElement | null>>([]);

  const expandableImageRefs =
    props.expandableImageRefs !== undefined
      ? props.expandableImageRefs
      : (core?.expandableImageRefs ?? localExpandableImageRefs);

  const overlayDivRef = React.useRef<HTMLDivElement | null>(null);
  const duplicateImgRef = React.useRef<HTMLElement | null>(null);
  const closeButtonRef = React.useRef<HTMLElement | null>(null);
  const counterRef = React.useRef<HTMLElement | null>(null);
  const leftChevronRef = React.useRef<HTMLElement | null>(null);
  const rightChevronRef = React.useRef<HTMLElement | null>(null);
  const localSliderApiRef = React.useRef<SliderHandle | null>(null);
  const setSliderHandle = React.useCallback(
    (inst: SliderHandle | null) => {
      localSliderApiRef.current = inst;

      if (core?.sliderApiRef) {
        core.sliderApiRef.current = inst;
      }

      if (!forwardedRef) return;
      if (typeof forwardedRef === "function") forwardedRef(inst);
      else (forwardedRef as React.RefObject<SliderHandle | null>).current = inst;
    },
    [core, forwardedRef]
  );

  const [isReady, setIsReady] = React.useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const effectiveBreakpoints = React.useMemo(
    () => core?.effectiveBreakpoints ?? ({ ...BREAKPOINT_MAP, ...(breakpoints || {}) }),
    [core?.effectiveBreakpoints, breakpoints]
  );

  const sliderObject = React.useMemo(() => {
    return {
      ...DEFAULT_SLIDER,
      ...(sliderOptions ?? {}),
      layout: { ...DEFAULT_SLIDER.layout, ...(sliderOptions?.layout ?? {}) },
      direction: { ...DEFAULT_SLIDER.direction, ...(sliderOptions?.direction ?? {}) },
      align: sliderOptions?.align ?? DEFAULT_SLIDER.align,
      scroll: { ...DEFAULT_SLIDER.scroll, ...(sliderOptions?.scroll ?? {}) },
      controls: {
        ...DEFAULT_SLIDER.controls,
        ...(sliderOptions?.controls ?? {}),
        arrows: {
          ...DEFAULT_SLIDER.controls.arrows,
          ...(sliderOptions?.controls?.arrows ?? {}),
          arrow: {
            ...DEFAULT_SLIDER.controls.arrows.arrow,
            ...(sliderOptions?.controls?.arrows?.arrow ?? {}),
          },
          prev: {
            ...DEFAULT_SLIDER.controls.arrows.prev,
            ...(sliderOptions?.controls?.arrows?.prev ?? {}),
          },
          next: {
            ...DEFAULT_SLIDER.controls.arrows.next,
            ...(sliderOptions?.controls?.arrows?.next ?? {}),
          },
        },
        dots: {
          ...DEFAULT_SLIDER.controls.dots,
          ...(sliderOptions?.controls?.dots ?? {}),
          root: {
            ...DEFAULT_SLIDER.controls.dots.root,
            ...(sliderOptions?.controls?.dots?.root ?? {}),
          },
          dot: {
            ...DEFAULT_SLIDER.controls.dots.dot,
            ...(sliderOptions?.controls?.dots?.dot ?? {}),
          },
        },
        progress: {
          ...DEFAULT_SLIDER.controls.progress,
          ...(sliderOptions?.controls?.progress ?? {}),
          root: {
            ...DEFAULT_SLIDER.controls.progress.root,
            ...(sliderOptions?.controls?.progress?.root ?? {}),
          },
          bar: {
            ...DEFAULT_SLIDER.controls.progress.bar,
            ...(sliderOptions?.controls?.progress?.bar ?? {}),
          },
        },
        ripple: {
          ...DEFAULT_SLIDER.controls.ripple,
          ...(sliderOptions?.controls?.ripple ?? {}),
        },
      },
      lazyLoad: sliderOptions?.lazyLoad ?? DEFAULT_SLIDER.lazyLoad,
      auto: {
        ...DEFAULT_SLIDER.auto,
        ...(sliderOptions?.auto ?? {}),
        play: { ...DEFAULT_SLIDER.auto.play, ...(sliderOptions?.auto?.play ?? {}) },
        scroll: { ...DEFAULT_SLIDER.auto.scroll, ...(sliderOptions?.auto?.scroll ?? {}) },
      },
      motion: { ...DEFAULT_SLIDER.motion, ...(sliderOptions?.motion ?? {}) },
    };
  }, [sliderOptions]);

  type Cell = { id: string; node: React.ReactNode };
  const idSeqRef = React.useRef(0);
  const newId = React.useCallback(() => `rmg-${++idSeqRef.current}`, []);

  const initialCells = React.useMemo<Cell[]>(() => {
    const kids = React.Children.toArray(children);
    return kids.map((n) => ({ id: newId(), node: n }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [cellsState] = React.useState<Cell[]>(initialCells);

  const renderedCells = React.useMemo(() => {
    return cellsState.map((c) => {
      const n = c.node;
      return React.isValidElement(n)
        ? React.cloneElement(n as React.ReactElement, { key: c.id })
        : (
          <span key={c.id} style={{ display: "block" }}>
            {n as any}
          </span>
        );
    });
  }, [cellsState]);

  const vw = useViewportWidth();

  const resolvedCellsPerSlide = React.useMemo(() => {
    const hasCellsPerSlideProp = sliderObject.layout.cellsPerSlide != null;
    if (!hasCellsPerSlideProp) return undefined;

    const raw = resolveNumberFromResponsive(
      sliderObject.layout.cellsPerSlide,
      1,
      vw,
      effectiveBreakpoints
    );

    return Math.max(1, raw | 0);
  }, [sliderObject.layout.cellsPerSlide, vw, effectiveBreakpoints]);

  const sliderResponsiveColumns =
    typeof resolvedCellsPerSlide === "number" ? resolvedCellsPerSlide : undefined;

  const resolvedGap = React.useMemo(() => {
    const raw = resolveNumberFromResponsive(
      sliderObject.layout.gap,
      20,
      vw,
      effectiveBreakpoints
    );
    return Math.max(0, raw | 0);
  }, [sliderObject.layout.gap, vw, effectiveBreakpoints]);

  const sliderScopeId = React.useId();
  const sliderScope = `rmg-slider-${sliderScopeId.replace(/:/g, "")}`;

  const sliderLoading = React.useMemo(() => {
    const src = sliderObject.transitions?.loading ?? {};
    return {
      enabled: src.enabled ?? true,
      force: src.force ?? false,
      skeletonCount: src.skeletonCount,
      renderLoading: src.renderLoading,
      skeleton: src.skeleton,
    };
  }, [sliderObject.transitions?.loading]);

  function pickSsrBaseResponsiveValue(v: any, fallback: number) {
    if (typeof v === "number") return v;
    if (v && typeof v === "object") {
      const entries = Object.entries(v)
        .map(([k, val]) => [Number(k), Number(val)] as const)
        .filter(([k, val]) => Number.isFinite(k) && Number.isFinite(val))
        .sort((a, b) => a[0] - b[0]);
      if (entries.length) return entries[0][1];
    }
    return fallback;
  }

  const ssrCellsBase = React.useMemo(() => {
    return Math.max(1, (pickSsrBaseResponsiveValue(sliderObject.layout?.cellsPerSlide, 1) | 0));
  }, [sliderObject.layout?.cellsPerSlide]);

  const sliderSkeleton = useScopedSkeleton({
    enabled: true,
    scopeId: sliderScope,
    loading: sliderLoading,
    fallbackCount: ssrCellsBase,
    breakpointMap: effectiveBreakpoints,
    maxSlots: 12,
    showLoadingFallback: !isReady,

    defaultNode: (MAX_SKELETONS, baseCount) => {
      const spec = (sliderLoading).skeleton;
      if (spec) {
        return (
          <SliderSkeletonCard
            count={baseCount}
            maxSlots={MAX_SKELETONS}
            spec={spec}
          />
        );
      }

      return (
        <div className={styles.sliderSkeletonOverlay} data-rmg-skel-part="overlay">
          <div className={styles.sliderSkeletonRow} data-rmg-skel-part="row">
            {Array.from({ length: MAX_SKELETONS }).map((_, i) => (
              <div key={`rmg-slider-skel-${i}`} className={styles.sliderSkeleton} data-rmg-skel-slot={i + 1} />
            ))}
          </div>
        </div>
      );
    },
  });

  const sliderShellRef = React.useRef<HTMLDivElement | null>(null);
  const persistedLoadingNodeRef = React.useRef<React.ReactNode>(sliderSkeleton.node);

  if (sliderSkeleton.node) {
    persistedLoadingNodeRef.current = sliderSkeleton.node;
  }

  const resolvedSkeletonExitMs = prefersReducedMotion ? 0 : SKELETON_EXIT_MS;
  const introUnlockDelayMs = Math.max(0, resolvedSkeletonExitMs - INTRO_OVERLAP_MS);
  const [showLoadingLayer, setShowLoadingLayer] = React.useState(() => sliderSkeleton.showLoading);
  const [loadingExiting, setLoadingExiting] = React.useState(false);
  const [introUnlocked, setIntroUnlocked] = React.useState(() => !sliderSkeleton.showLoading);

  React.useEffect(() => {
    if (sliderSkeleton.showLoading) {
      setShowLoadingLayer(true);
      setLoadingExiting(false);
      setIntroUnlocked(false);
      return;
    }

    if (!showLoadingLayer) {
      setIntroUnlocked(true);
      return;
    }

    if (resolvedSkeletonExitMs === 0) {
      setLoadingExiting(false);
      setShowLoadingLayer(false);
      setIntroUnlocked(true);
      return;
    }

    setLoadingExiting(true);

    const introTimeoutId = window.setTimeout(() => {
      setIntroUnlocked(true);
    }, introUnlockDelayMs);

    const exitTimeoutId = window.setTimeout(() => {
      setShowLoadingLayer(false);
      setLoadingExiting(false);
    }, resolvedSkeletonExitMs);

    return () => {
      window.clearTimeout(introTimeoutId);
      window.clearTimeout(exitTimeoutId);
    };
  }, [introUnlockDelayMs, resolvedSkeletonExitMs, showLoadingLayer, sliderSkeleton.showLoading]);
  
  function extractSrcsFromReactNode(node: React.ReactNode): string[] {
    const out: string[] = [];

    const visit = (n: React.ReactNode) => {
      if (n == null || typeof n === "boolean") return;

      if (Array.isArray(n)) {
        n.forEach(visit);
        return;
      }

      if (typeof n === "string" || typeof n === "number") return;

      if (React.isValidElement(n)) {
        const anyEl = n as any;

        const src = anyEl.props?.src;
        if (typeof src === "string" && src.length) out.push(src);

        const children = anyEl.props?.children;
        if (children != null) visit(children);

        return;
      }
    };

    visit(node);
    return out;
  }

  function usePredecodeImages(urls: string[]): boolean {
    const [ready, setReady] = React.useState(
      urls.length === 0
    );

    React.useEffect(() => {
      if (!urls.length) {
        setReady(true);
        return;
      }

      let cancelled = false;
      setReady(false);

      const decodeUrl = (url: string) =>
        new Promise<void>((resolve) => {
          const img = new Image() as HTMLImageElement;
          img.src = url;

          const hasDecode =
            typeof (img as any).decode === 'function';

          if (hasDecode) {
            (img as any)
              .decode()
              .catch(() => {})
              .finally(() => {
                if (!cancelled) resolve();
              });
          } else {
            if (img.complete) {
              if (!cancelled) resolve();
              return;
            }

            const done = () => {
              img.onload = null;
              img.onerror = null;
              if (!cancelled) resolve();
            };

            img.onload = done;
            img.onerror = done;
          }
        });

      (async () => {
        for (const url of urls) {
          if (cancelled) break;
          await decodeUrl(url);
        }
        if (!cancelled) {
          setReady(true);
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [urls]);

    return ready;
  }

  const sliderImageUrls = React.useMemo(() => {
    if (sliderObject.lazyLoad.enabled === true) return;
    const urls = extractSrcsFromReactNode(renderedCells);
    return Array.from(new Set(urls.filter(Boolean)));
  }, [renderedCells]);

  const sliderUrlsKey = React.useMemo(() => {
    if (sliderObject.lazyLoad.enabled === true) return;
    return sliderImageUrls?.join("|")
  }, [sliderImageUrls]);

  const sliderImagesReady = sliderObject.lazyLoad.enabled === true ? true : usePredecodeImages(
    React.useMemo(() => sliderImageUrls!, [sliderUrlsKey])
  );

  const cellsPerSlideProp =
    sliderObject.layout.cellsPerSlide != null
      ? (sliderResponsiveColumns ?? ssrCellsBase)
      : undefined;

  const initialHeightCss = React.useMemo(() => {
    const skelSpec = (sliderLoading as any).skeleton;
    const responsiveCount = (sliderLoading as any).skeletonCount;
    return buildScopedInitialHeightCss({
      scopeId: sliderScope,
      skeletonSpec: skelSpec,
      responsiveCount,
      fallbackCount: ssrCellsBase,
      breakpointMap: effectiveBreakpoints,
    });
  }, [sliderScope, sliderLoading, ssrCellsBase, effectiveBreakpoints]);

  const freezeDoneRef = React.useRef(false);

  React.useLayoutEffect(() => {
    if (freezeDoneRef.current) return;
    const shell = sliderShellRef.current;
    if (!shell) return;

    const row = shell.querySelector<HTMLElement>('[data-rmg-skel-part="row"]');
    const h = row?.getBoundingClientRect().height || shell.getBoundingClientRect().height;

    if (h && h > 1) {
      shell.style.height = `${h}px`;
      shell.style.maxHeight = `${h}px`;
      shell.style.overflow = "hidden";
      freezeDoneRef.current = true;
    }
  }, []);

  React.useLayoutEffect(() => {
    const shell = sliderShellRef.current;
    if (!shell) return;

    if (!isReady) return;

    const viewport =
      shell.querySelector<HTMLElement>(`[data-rmg-part="viewport"]`) ||
      shell.querySelector<HTMLElement>(`.${styles.viewport}`);

    const realH = viewport?.getBoundingClientRect().height;

    if (realH && realH > 1) {
      shell.style.height = `${realH}px`;
      shell.style.maxHeight = `${realH}px`;

      requestAnimationFrame(() => {
        shell.style.height = "";
        shell.style.maxHeight = "";
        shell.style.overflow = "";
      });
    } else {
      shell.style.height = "";
      shell.style.maxHeight = "";
      shell.style.overflow = "";
    }
  }, [isReady]);

  return (
    <>
      {sliderSkeleton.cssText && <style dangerouslySetInnerHTML={{ __html: sliderSkeleton.cssText }} />}
      {initialHeightCss && <style dangerouslySetInnerHTML={{ __html: initialHeightCss }} />}

      <div
        id={sliderScope}
        data-rmg-scope={sliderScope}
        className={styles.sliderScope}
      >
        <div
          ref={sliderShellRef}
          data-rmg-scope-shell="true"
          className={styles.sliderShell}
          style={{
            minHeight: "var(--rmg-slider-initial-height, var(--rmg-slider-height))"
          }}
        >
          <div
            className={[
              styles.contentLayer,
              showLoadingLayer ? styles.contentBlocked : "",
            ].filter(Boolean).join(" ")}
          >
            <SliderCore
              cellCount={cellsState.length}
              isClick={isClick}
              expandableImageRefs={expandableImageRefs}
              overlayDivRef={overlayDivRef}
              duplicateImgRef={duplicateImgRef}
              closeButtonRef={closeButtonRef}
              counterRef={counterRef}
              leftChevronRef={leftChevronRef}
              rightChevronRef={rightChevronRef}
              isReady={isReady}
              setIsReady={setIsReady}
              loop={sliderObject.scroll.loop}
              freeScroll={sliderObject.scroll.freeScroll}
              autoPlay={sliderObject.auto.play.enabled}
              autoPlaySpeed={sliderObject.auto.play.speedMs}
              autoPlayPause={sliderObject.auto.play.pauseMs}
              autoScroll={sliderObject.auto.scroll.enabled}
              autoScrollSpeed={sliderObject.auto.scroll.speedMs}
              autoScrollPause={sliderObject.auto.scroll.pauseMs}
              pauseAutoPlayOnHover={sliderObject.auto.play.pauseOnHover}
              pauseAutoScrollOnHover={sliderObject.auto.scroll.pauseOnHover}
              groupCells={sliderObject.scroll.groupCells}
              centerAlign={sliderObject.align === "center"}
              gap={resolvedGap}
              sliderViewportStyles={sliderObject.elements?.viewport?.style}
              sliderViewportClassName={sliderObject.elements?.viewport?.className}
              sliderContainerStyles={sliderObject.elements?.container?.style}
              sliderContainerClassName={sliderObject.elements?.container?.className}
              arrowStyles={sliderObject.controls.arrows.arrow.style}
              arrowClassName={sliderObject.controls.arrows.arrow.className}
              prevArrowStyles={sliderObject.controls.arrows.prev.style}
              prevArrowClassName={sliderObject.controls.arrows.prev.className}
              nextArrowStyles={sliderObject.controls.arrows.next.style}
              nextArrowClassName={sliderObject.controls.arrows.next.className}
              dotsContainerStyles={sliderObject.controls.dots.root.style}
              dotsContainerClassName={sliderObject.controls.dots.root.className}
              dotsStyles={sliderObject.controls.dots.dot.style}
              dotsClassName={sliderObject.controls.dots.dot.className}
              renderArrows={sliderObject.controls.arrows.render}
              renderPrevArrow={sliderObject.controls.arrows.renderPrev}
              renderNextArrow={sliderObject.controls.arrows.renderNext}
              renderDots={sliderObject.controls.dots.render}
              showArrows={sliderObject.controls.arrows.enabled}
              showDots={sliderObject.controls.dots.enabled}
              showProgress={sliderObject.controls.progress.enabled}
              progressClassName={sliderObject.controls.progress.root.className}
              progressStyle={sliderObject.controls.progress.root.style}
              progressInnerClassName={sliderObject.controls.progress.bar.className}
              progressInnerStyle={sliderObject.controls.progress.bar.style}
              renderProgress={sliderObject.controls.progress.render}
              parallax={sliderObject.effects?.parallax?.enabled}
              parallaxBleedPct={sliderObject.effects?.parallax?.bleedPct}
              parallaxBorderRadius={sliderObject.effects?.parallax?.borderRadius}
              parallaxSideWidth={sliderObject.effects?.parallax?.sideWidth}
              ref={setSliderHandle}
              scaleEffect={sliderObject.effects?.scale?.enabled}
              scaleAmount={sliderObject.effects?.scale?.amount}
              fadeEffect={sliderObject.effects?.fade?.enabled}
              cellsPerSlide={cellsPerSlideProp}
              direction={sliderObject.direction.dir}
              axis={sliderObject.direction.axis}
              skipSnaps={sliderObject.scroll.skipSnaps}
              selectDuration={sliderObject.motion.selectDuration}
              freeScrollDuration={sliderObject.motion.freeScrollDuration}
              sliderFriction={sliderObject.motion.friction}
              indexChannel={resolvedIndexChannel}
              introOptions={sliderObject.transitions?.intro}
              introUnlocked={introUnlocked}
              lazyLoad={sliderObject.lazyLoad}
              rippleEnabled={sliderObject.controls.ripple.enabled}
              rippleClassName={sliderObject.controls.ripple.className}
              sliderImagesReady={sliderImagesReady}
              breakpointMap={effectiveBreakpoints}
              enableFullscreen={!!core?.requestFullscreenOpen}
              requestFullscreenOpen={
                core
                  ? ({ index, image, event }) => core.requestFullscreenOpen({ source: "slider", index, image, event })
                  : undefined
              }
              isFullscreenOpen={!!core?.isFullscreenOpen}
              setFullscreenOpen={core?.setFullscreenOpen!}
            >
              {renderedCells}
            </SliderCore>
          </div>
          {showLoadingLayer && (sliderSkeleton.node ?? persistedLoadingNodeRef.current) ? (
            <div
              className={[
                styles.loadingLayer,
                loadingExiting ? styles.loadingLayerExit : "",
              ].filter(Boolean).join(" ")}
              aria-hidden="true"
            >
              {sliderSkeleton.node ?? persistedLoadingNodeRef.current}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
})
