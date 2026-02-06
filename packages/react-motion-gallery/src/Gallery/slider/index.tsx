/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import styles from "./Slider.module.css";
import SliderCore from "./Slider";
import ThumbnailSlider from "./thumbnails/ThumbnailSlider";
import createIndexChannel from "./sliderSub";
import { DEFAULT_SLIDER } from "./defaults";
import { BREAKPOINT_MAP, resolveNumberFromResponsive, resolvePositionFromResponsive } from "../shared/responsive";
import { useViewportWidth } from "../shared/hooks/useViewportWidth";
import { buildScopedSkeletonCountCss } from "../shared/skeleton/buildScopedSkeletonCountCss";
import type { BreakpointMap } from "../shared/responsive";
import type { MediaItem } from "../shared/types/media";
import type { SliderHandle, SliderLoadingOptions, SliderOptions, ResponsiveHeightRule as SliderResponsiveHeightRule } from "./types";
import { useOptionalGalleryCore } from "../core";
import { SliderSkeletonCard } from "./SliderSkeleton";

type Props = SliderOptions & {
  children?: React.ReactNode;
  breakpoints?: BreakpointMap;
  expandableImgRefs?: React.RefObject<Array<HTMLImageElement | null>>;
};

function cssHeightValue(h: number | string) {
  return typeof h === "number" ? `${h}px` : h;
}

function parseAspectRatio(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;

  if (typeof value === "string") {
    const s = value.trim();
    const m = s.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
    if (m) {
      const w = Number(m[1]);
      const h = Number(m[2]);
      if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) return w / h;
    }
    const n = Number(s);
    if (Number.isFinite(n) && n > 0) return n;
  }

  return null;
}

function buildScopedAutoInitialHeightCssFromAspectRatio(args: {
  scope: string;
  breakpointMap: BreakpointMap;
  aspectRatioWOverH: number;
  cellsPerSlide?: any;
  gap?: any;
  baseCells: number;
  baseGap: number;
}) {
  const { scope, aspectRatioWOverH, cellsPerSlide, gap, baseCells, baseGap } = args;
  const rootSel = `[data-rmg-scope="${scope}"]`;

  const lines: string[] = [];

  lines.push(
    `${rootSel}{` +
      `container-type:inline-size;` +
      `--rmg-slider-ar:${aspectRatioWOverH};` +
      `--rmg-slider-cells:${baseCells};` +
      `--rmg-slider-gap:${baseGap}px;` +
      `--rmg-slider-initial-height:calc(` +
        `((100cqw - ((var(--rmg-slider-cells) - 1) * var(--rmg-slider-gap))) / var(--rmg-slider-cells))` +
        ` / var(--rmg-slider-ar)` +
      `);` +
    `}`
  );

  if (cellsPerSlide && typeof cellsPerSlide === "object") {
    Object.entries(cellsPerSlide).forEach(([k, v]) => {
      const min = Number(k);
      const cells = Math.max(1, (Number(v) | 0));
      if (!Number.isFinite(min) || !Number.isFinite(cells)) return;
      lines.push(`@media (min-width:${min}px){${rootSel}{--rmg-slider-cells:${cells};}}`);
    });
  }

  if (gap && typeof gap === "object") {
    Object.entries(gap).forEach(([k, v]) => {
      const min = Number(k);
      const g = Math.max(0, (Number(v) | 0));
      if (!Number.isFinite(min) || !Number.isFinite(g)) return;
      lines.push(`@media (min-width:${min}px){${rootSel}{--rmg-slider-gap:${g}px;}}`);
    });
  }

  return lines.join("\n");
}

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

  const showLoading =
    enabled && (loading.isLoading != null ? !!loading.isLoading : showLoadingFallback);

  const { cssText, ssrBaseCount } = React.useMemo(() => {
    if (!enabled) return { cssText: "", ssrBaseCount: fallbackCount };

    return buildScopedSkeletonCountCss({
      scopeId,
      responsiveCount: loading.skeletonCount,
      fallbackCount,
      breakpointMap,
      maxSlots,
    });
  }, [enabled, scopeId, loading.skeletonCount, fallbackCount, breakpointMap, maxSlots]);

  const node = showLoading
    ? loading.renderLoading
      ? loading.renderLoading()
      : defaultNode(maxSlots, ssrBaseCount)
    : null;

  return { cssText, ssrBaseCount, node, showLoading };
}

export const Slider = React.forwardRef<SliderHandle, Props>(function Slider(
  props,
  forwardedRef
) {
  const { children, breakpoints, ...sliderOptions } = props;
  const core = useOptionalGalleryCore();
  const indexChannel = React.useMemo(() => createIndexChannel(), []);
  const isClick = React.useRef(false);
  const localExpandableImgRefs = React.useRef<Array<HTMLImageElement | null>>([]);

  const expandableImgRefs =
    props.expandableImgRefs !== undefined
      ? props.expandableImgRefs
      : (core?.expandableImgRefs ?? localExpandableImgRefs);

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
      thumbnails: { ...DEFAULT_SLIDER.thumbnails, ...(sliderOptions?.thumbnails ?? {}) },
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

  const resolvedThumbPos = React.useMemo(() => {
    if (!sliderOptions?.thumbnails?.layout?.position) return undefined;

    return resolvePositionFromResponsive(
      sliderOptions?.thumbnails?.layout?.position,
      "bottom",
      vw,
      effectiveBreakpoints
    );
  }, [sliderOptions?.thumbnails?.layout?.position, vw, effectiveBreakpoints]);

  const sliderScopeId = React.useId();
  const sliderScope = `rmg-slider-${sliderScopeId.replace(/:/g, "")}`;

  const sliderLoading = React.useMemo(() => {
    const src = sliderObject.transitions?.loading ?? {};
    return {
      isLoading: src.isLoading,
      skeletonCount: src.skeletonCount,
      renderLoading: src.renderLoading,
      skeleton: src.skeleton,
      shimmer: src.shimmer
    };
  }, [sliderObject.transitions?.loading]);

  const responsiveCss = React.useMemo(() => {
    const rules = Array.isArray(sliderObject.size?.heightRules)
      ? (sliderObject.size?.heightRules as SliderResponsiveHeightRule[])
      : [];
    if (!rules.length) return "";

    const rootSel = `[data-rmg-scope="${sliderScope}"]`;
    return rules
      .map((r) => `@media ${r.query} { ${rootSel} { --rmg-slider-height: ${r.height} !important; } }`)
      .join("\n");
  }, [sliderObject.size?.heightRules, sliderScope]);

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

  const ssrCellsBase = Math.max(
    1,
    (pickSsrBaseResponsiveValue(sliderObject.layout?.cellsPerSlide, 1) | 0)
  );

  const [cellsPerSlideLive, setCellsPerSlideLive] = React.useState(ssrCellsBase);

  React.useEffect(() => {
    if (typeof sliderResponsiveColumns === "number") {
      setCellsPerSlideLive(sliderResponsiveColumns);
    }
  }, [sliderResponsiveColumns]);

  const sliderSkeleton = useScopedSkeleton({
    enabled: true,
    scopeId: sliderScope,
    loading: sliderLoading as any,
    fallbackCount: ssrCellsBase,
    breakpointMap: effectiveBreakpoints,
    maxSlots: 12,
    showLoadingFallback: !isReady,

    defaultNode: (MAX_SKELETONS, baseCount) => {
      const spec = (sliderLoading as any).skeleton;
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

  const initialHeightCss = React.useMemo(() => {
    const rules: SliderResponsiveHeightRule[] = Array.isArray(sliderObject.size?.initialHeightRules)
      ? (sliderObject.size!.initialHeightRules as any)
      : [];

    const hasRules = rules.length > 0;
    const hasValue = sliderObject.size?.initialHeight != null;

    if (hasRules || hasValue) {
      const rootSel = `[data-rmg-scope="${sliderScope}"]`;

      const base = hasValue
        ? `${rootSel} { --rmg-slider-initial-height: ${cssHeightValue(sliderObject.size!.initialHeight!)}; }`
        : "";

      const media = rules
        .map((r) => `@media ${r.query} { ${rootSel} { --rmg-slider-initial-height: ${cssHeightValue(r.height)} !important; } }`)
        .join("\n");

      return [base, media].filter(Boolean).join("\n");
    }

    const ar = parseAspectRatio(sliderObject.size?.aspectRatio);
    if (!ar) return "";

    const baseCells = Math.max(1, (pickSsrBaseResponsiveValue(sliderObject.layout?.cellsPerSlide, 1) | 0));
    const baseGap = Math.max(0, (pickSsrBaseResponsiveValue(sliderObject.layout?.gap, 12) | 0));

    return buildScopedAutoInitialHeightCssFromAspectRatio({
      scope: sliderScope,
      breakpointMap: effectiveBreakpoints,
      aspectRatioWOverH: ar,
      cellsPerSlide: sliderObject.layout?.cellsPerSlide,
      gap: sliderObject.layout?.gap,
      baseCells,
      baseGap,
    });
  }, [
    sliderObject.size?.initialHeight,
    sliderObject.size?.initialHeightRules,
    sliderObject.size?.aspectRatio,
    sliderObject.layout?.cellsPerSlide,
    sliderObject.layout?.gap,
    sliderScope,
    effectiveBreakpoints,
  ]);

  const thumbsScopeId = React.useId();
  const thumbsScope = `rmg-thumbs-${thumbsScopeId.replace(/:/g, "")}`;

  const thumbsLoading = React.useMemo(() => {
    const src = sliderObject.thumbnails.transitions?.loading ?? {};
    return {
      isLoading: src.isLoading,
      skeletonCount: src.skeletonCount,
      renderLoading: src.renderLoading,
    };
  }, [sliderObject.thumbnails.transitions?.loading]);

  const isHorizontalThumbs = resolvedThumbPos === "top" || resolvedThumbPos === "bottom";
  const thumbsGap = sliderObject.thumbnails.layout?.gap ?? 10;
  const thumbW = sliderObject.thumbnails.layout?.thumbnail?.width ?? 64;
  const thumbH = sliderObject.thumbnails.layout?.thumbnail?.height ?? 64;

  const thumbsSkeleton = useScopedSkeleton({
    enabled: true,
    scopeId: thumbsScope,
    loading: thumbsLoading,
    fallbackCount: 6,
    breakpointMap: effectiveBreakpoints,
    maxSlots: 12,
    showLoadingFallback: !isReady,
    defaultNode: (MAX_SKELETONS) => (
      <div
        className={styles.thumbSkeletonOverlay}
        data-rmg-skel-part="overlay"
        style={{
          height: sliderObject.thumbnails.layout?.container?.height,
          width: sliderObject.thumbnails.layout?.container?.width,
        }}
      >
        <div
          className={styles.thumbSkeletonRow}
          data-rmg-skel-part="row"
          style={{
            gap: thumbsGap,
            flexDirection: isHorizontalThumbs ? "row" : "column",
          }}
        >
          {Array.from({ length: MAX_SKELETONS }).map((_, i) => (
            <div
              key={`rmg-thumb-skel-${i}`}
              className={styles.thumbSkeleton}
              data-rmg-skel-slot={i + 1}
              style={{
                width: isHorizontalThumbs ? thumbW : "100%",
                height: isHorizontalThumbs ? "100%" : thumbH,
              }}
            />
          ))}
        </div>
      </div>
    ),
  });

  const sliderShellRef = React.useRef<HTMLDivElement | null>(null);

  const sliderImagesReady = true;
  const normalizedItems: MediaItem[] = core?.normalizedItems ?? [];

  const shimmerStyleVars = React.useMemo(() => {
    const s = sliderObject.transitions?.loading?.shimmer;
    if (!s) return undefined;

    const px = (v: number | string | undefined) =>
      v == null ? undefined : typeof v === "number" ? `${v}px` : v;

    return {
      ...(s.radius != null ? ({ ["--rmg-shimmer-radius" as any]: px(s.radius) } as any) : {}),
      ...(s.c1 != null ? ({ ["--rmg-shimmer-c1" as any]: s.c1 } as any) : {}),
      ...(s.c2 != null ? ({ ["--rmg-shimmer-c2" as any]: s.c2 } as any) : {}),
      ...(s.c3 != null ? ({ ["--rmg-shimmer-c3" as any]: s.c3 } as any) : {}),
      ...(s.size != null ? ({ ["--rmg-shimmer-size" as any]: s.size } as any) : {}),
      ...(s.duration != null ? ({ ["--rmg-shimmer-duration" as any]: s.duration } as any) : {}),
      ...(s.timing != null ? ({ ["--rmg-shimmer-timing" as any]: s.timing } as any) : {}),
    } as React.CSSProperties;
  }, [sliderObject.transitions?.loading?.shimmer]);

  const userProvidedHeight =
    sliderOptions?.size?.height != null ||
    (Array.isArray(sliderOptions?.size?.heightRules) && sliderOptions!.size!.heightRules!.length > 0);

  const userProvidedInitialHeight =
    sliderOptions?.size?.initialHeight != null ||
    (Array.isArray(sliderOptions?.size?.initialHeightRules) && sliderOptions!.size!.initialHeightRules!.length > 0);

  const sliderHeightProp = userProvidedHeight ? sliderObject.size?.height : undefined;
  const responsiveHeightsProp = userProvidedHeight ? sliderObject.size?.heightRules : undefined;

  const initialHeightProp = userProvidedInitialHeight ? sliderObject.size?.initialHeight : undefined;

  const hasCellsPerSlideProp = sliderObject.layout.cellsPerSlide != null;

  const cellsPerSlideProp = hasCellsPerSlideProp ? cellsPerSlideLive : undefined;


  return (
    <>
      {/* thumbs top/left */}
      {(resolvedThumbPos === "top" || resolvedThumbPos === "left") && (
        <>
          {thumbsSkeleton.cssText && <style dangerouslySetInnerHTML={{ __html: thumbsSkeleton.cssText }} />}
          <div id={thumbsScope} data-rmg-scope={thumbsScope} style={{ position: "relative" }}>
            {thumbsSkeleton.node}
            <ThumbnailSlider
              indexChannel={indexChannel}
              position={resolvedThumbPos}
              thumbnailWidth={sliderObject.thumbnails.layout?.thumbnail?.width}
              thumbnailHeight={sliderObject.thumbnails.layout?.thumbnail?.height}
              thumbnailsCenter={sliderObject.thumbnails.layout?.center}
              thumbnailsContainerWidth={sliderObject.thumbnails.layout?.container?.width}
              thumbnailsContainerHeight={sliderObject.thumbnails.layout?.container?.height}
              thumbnailsContainerStyle={sliderObject.thumbnails.elements?.container?.style}
              thumbnailsContainerClassName={sliderObject.thumbnails.elements?.container?.className}
              thumbnailItemStyle={sliderObject.thumbnails.elements?.thumbnail?.style}
              thumbnailItemClassName={sliderObject.thumbnails.elements?.thumbnail?.className}
              gap={sliderObject.thumbnails.layout?.gap}
              freeScroll={sliderObject.thumbnails.scroll?.freeScroll}
              groupCells={sliderObject.thumbnails.scroll?.groupCells}
              loop={sliderObject.thumbnails.scroll?.loop}
              skipSnaps={sliderObject.thumbnails.scroll?.skipSnaps}
              centerActiveThumb={sliderObject.thumbnails.scroll?.centerActiveThumb}
              selectDuration={sliderObject.thumbnails.motion?.selectDuration}
              freeScrollDuration={sliderObject.thumbnails.motion?.freeScrollDuration}
              sliderFriction={sliderObject.thumbnails.motion?.friction}
              loadingOptions={sliderObject.thumbnails.transitions?.loading}
              introOptions={sliderObject.thumbnails.transitions?.intro}
              breakpointMap={sliderObject.thumbnails.breakpointMap}
              rippleEnabled={sliderObject.thumbnails.controls?.ripple?.enabled}
              rippleClassName={sliderObject.thumbnails.controls?.ripple?.className}
              showArrows={sliderObject.thumbnails.controls?.enabled}
              arrowStyles={sliderObject.thumbnails.controls?.arrow?.style}
              arrowClassName={sliderObject.thumbnails.controls?.arrow?.className}
              prevArrowStyles={sliderObject.thumbnails.controls?.prev?.style}
              prevArrowClassName={sliderObject.thumbnails.controls?.prev?.className}
              nextArrowStyles={sliderObject.thumbnails.controls?.next?.style}
              nextArrowClassName={sliderObject.thumbnails.controls?.next?.className}
              renderArrows={sliderObject.thumbnails.controls?.render}
              renderPrevArrow={sliderObject.thumbnails.controls?.renderPrev}
              renderNextArrow={sliderObject.thumbnails.controls?.renderNext}
            >
              {sliderObject.thumbnails.children}
            </ThumbnailSlider>
          </div>
        </>
      )}

      {/* slider */}
      {sliderSkeleton.cssText && <style dangerouslySetInnerHTML={{ __html: sliderSkeleton.cssText }} />}
      {responsiveCss && <style dangerouslySetInnerHTML={{ __html: responsiveCss }} />}
      {initialHeightCss && <style dangerouslySetInnerHTML={{ __html: initialHeightCss }} />}

      <div
        id={sliderScope}
        ref={sliderShellRef}
        data-rmg-scope={sliderScope}
        className={styles.sliderShell}
        style={{
          position: "relative",
          ...(userProvidedHeight && sliderObject.size?.height != null
            ? ({ ["--rmg-slider-height" as any]: sliderObject.size.height } as any)
            : {}),
          ...(userProvidedInitialHeight && sliderObject.size?.initialHeight != null
            ? ({ ["--rmg-slider-initial-height" as any]: sliderObject.size.initialHeight } as any)
            : {}),
          ...(shimmerStyleVars ?? {}),
        }}
      >
        {sliderSkeleton.node}
        <SliderCore
          imageCount={cellsState.length}
          isClick={isClick}
          expandableImgRefs={expandableImgRefs}
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
          sliderHeight={sliderHeightProp}
          responsiveHeights={responsiveHeightsProp}
          initialHeight={initialHeightProp}
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
          indexChannel={indexChannel}
          introOptions={sliderObject.transitions?.intro}
          lazyLoad={sliderObject.lazyLoad}
          rippleEnabled={sliderObject.controls.ripple.enabled}
          rippleClassName={sliderObject.controls.ripple.className}
          normalizedItems={normalizedItems}
          sliderImagesReady={sliderImagesReady}
          breakpointMap={effectiveBreakpoints}
          enableFullscreen={!!core?.requestFullscreenOpen}
          requestFullscreenOpen={
            core
              ? ({ index, img, event }) => core.requestFullscreenOpen({ source: "slider", index, img, event })
              : undefined
          }
          isFullscreenOpen={!!core?.isFullscreenOpen}
          setFullscreenOpen={core?.setFullscreenOpen!}
        >
          {renderedCells}
        </SliderCore>
      </div>

      {/* thumbs bottom/right */}
      {(resolvedThumbPos === "bottom" || resolvedThumbPos === "right") && (
        <>
          {thumbsSkeleton.cssText && <style dangerouslySetInnerHTML={{ __html: thumbsSkeleton.cssText }} />}
          <div id={thumbsScope} data-rmg-scope={thumbsScope} style={{ position: "relative" }}>
            {thumbsSkeleton.node}
            <ThumbnailSlider
              indexChannel={indexChannel}
              position={resolvedThumbPos}
              thumbnailWidth={sliderObject.thumbnails.layout?.thumbnail?.width}
              thumbnailHeight={sliderObject.thumbnails.layout?.thumbnail?.height}
              thumbnailsCenter={sliderObject.thumbnails.layout?.center}
              thumbnailsContainerWidth={sliderObject.thumbnails.layout?.container?.width}
              thumbnailsContainerHeight={sliderObject.thumbnails.layout?.container?.height}
              thumbnailsContainerStyle={sliderObject.thumbnails.elements?.container?.style}
              thumbnailsContainerClassName={sliderObject.thumbnails.elements?.container?.className}
              thumbnailItemStyle={sliderObject.thumbnails.elements?.thumbnail?.style}
              thumbnailItemClassName={sliderObject.thumbnails.elements?.thumbnail?.className}
              gap={sliderObject.thumbnails.layout?.gap}
              freeScroll={sliderObject.thumbnails.scroll?.freeScroll}
              groupCells={sliderObject.thumbnails.scroll?.groupCells}
              loop={sliderObject.thumbnails.scroll?.loop}
              skipSnaps={sliderObject.thumbnails.scroll?.skipSnaps}
              centerActiveThumb={sliderObject.thumbnails.scroll?.centerActiveThumb}
              selectDuration={sliderObject.thumbnails.motion?.selectDuration}
              freeScrollDuration={sliderObject.thumbnails.motion?.freeScrollDuration}
              sliderFriction={sliderObject.thumbnails.motion?.friction}
              loadingOptions={sliderObject.thumbnails.transitions?.loading}
              introOptions={sliderObject.thumbnails.transitions?.intro}
              breakpointMap={sliderObject.thumbnails.breakpointMap}
              rippleEnabled={sliderObject.thumbnails.controls?.ripple?.enabled}
              rippleClassName={sliderObject.thumbnails.controls?.ripple?.className}
              showArrows={sliderObject.thumbnails.controls?.enabled}
              arrowStyles={sliderObject.thumbnails.controls?.arrow?.style}
              arrowClassName={sliderObject.thumbnails.controls?.arrow?.className}
              prevArrowStyles={sliderObject.thumbnails.controls?.prev?.style}
              prevArrowClassName={sliderObject.thumbnails.controls?.prev?.className}
              nextArrowStyles={sliderObject.thumbnails.controls?.next?.style}
              nextArrowClassName={sliderObject.thumbnails.controls?.next?.className}
              renderArrows={sliderObject.thumbnails.controls?.render}
              renderPrevArrow={sliderObject.thumbnails.controls?.renderPrev}
              renderNextArrow={sliderObject.thumbnails.controls?.renderNext}
            >
              {sliderObject.thumbnails.children}
            </ThumbnailSlider>
          </div>
        </>
      )}
    </>
  );
})