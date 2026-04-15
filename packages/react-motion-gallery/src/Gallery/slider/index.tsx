/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import styles from "./Slider.module.css";
import SliderCore from "./Slider";
import createIndexChannel from "./sliderSub";
import { DEFAULT_SLIDER } from "./defaults";
import {
  BREAKPOINT_MAP,
  normalizeResponsiveToMinWidthRules,
  resolveNumberFromResponsive,
} from "../shared/responsive";
import { useViewportWidth } from "../shared/hooks/useViewportWidth";
import { usePrefersReducedMotion } from "../shared/hooks/usePrefersReducedMotion";
import { useLoadingLayerState } from "../shared/hooks/useLoadingLayerState";
import { resolveLoadingTiming } from "../shared/loading/timing";
import { buildScopedSkeletonCountCss } from "../shared/skeleton/buildScopedSkeletonCountCss";
import { buildStableScopeId } from "../shared/stableScope";
import type { BreakpointMap } from "../shared/responsive";
import type { SliderHandle, SliderLoadingOptions, SliderOptions  } from "./types";
import type { SliderIndexChannel } from "./sliderSub";
import { useOptionalGalleryCore } from "../core";
import { SliderSkeletonCard } from "./SliderSkeleton";
import { collectPredecodeImageUrls } from "./mediaKind";
import {
  collectResponsiveSliderBaseStyleBreakpoints,
  collectResponsiveSliderContainerBreakpoints,
  collectResponsiveSliderTextLineBreakpoints,
  buildCenterFirstSpacerWidthFromSkeletonSpecCssExpr,
  buildExtrasHeightFromSkeletonSpecCssExpr,
  buildInitialHeightFromSkeletonSpecCssExpr,
  buildRowHeightFromSkeletonSpecCssExpr,
} from "./SliderSkeleton";

type Props = SliderOptions & {
  children?: React.ReactNode;
  breakpoints?: BreakpointMap;
  expandableImageRefs?: React.RefObject<Array<HTMLImageElement | null>>;
  indexChannel?: SliderIndexChannel;
};

function useScopedSkeleton(args: {
  enabled: boolean;
  scopeId: string;
  loading: SliderLoadingOptions;
  fallbackCount: number;
  breakpointMap: BreakpointMap;
  maxSlots?: number;
  visibleSlotsForCount?: (count: number, maxSlots: number) => number[];
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
    visibleSlotsForCount,
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
      visibleSlotsForCount,
    });
  }, [
    enabled,
    loadingEnabled,
    scopeId,
    (loading as any).skeletonCount,
    fallbackCount,
    breakpointMap,
    maxSlots,
    visibleSlotsForCount,
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

function maxResolvedSkeletonCount(
  responsiveCount: any,
  fallbackCount: number,
  breakpointMap: BreakpointMap
) {
  return normalizeResponsiveToMinWidthRules(
    responsiveCount,
    fallbackCount,
    breakpointMap
  ).reduce((max, rule) => Math.max(max, rule.count), 0);
}

function centerFirstVisibleSlotsForCount(count: number, maxSlots: number) {
  const c = Math.max(0, Math.floor(count));
  if (c <= 0) return [];
  if (c === 1) return maxSlots >= 2 ? [2] : [];
  return Array.from({ length: Math.min(maxSlots, c + 1) }, (_, i) => i + 1);
}

function toCssLengthValue(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `${value}px`;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }

  return null;
}

function usesBlockContainerUnit(value: unknown): boolean {
  if (typeof value !== "string") return false;
  return /\bcq(?:h|b|min|max)\b/i.test(value);
}

function buildSliderShellScopeSelector(scopeId: string) {
  return `[data-rmg-scope="${scopeId}"] > [data-rmg-scope-shell="true"]`;
}

function buildSliderSkeletonScopeSelector(scopeId: string) {
  return `${buildSliderShellScopeSelector(scopeId)} [data-rmg-skel-part="overlay"]`;
}

export function buildScopedInitialHeightCss(args: {
  scopeId: string;
  skeletonSpec: any; // SliderSkeletonSpec | undefined
  responsiveCount: any; // loading.skeletonCount
  fallbackCount: number;
  breakpointMap: BreakpointMap;
  centerFirstSpacer?: boolean;
}) {
  const {
    scopeId,
    skeletonSpec,
    responsiveCount,
    fallbackCount,
    centerFirstSpacer = false,
  } = args;

  const spec = skeletonSpec;
  const layout = spec?.layout;
  if (!layout) return "";

  const mode: "fit" | "peek" = spec?.mode ?? "fit";

  const shellSel = buildSliderShellScopeSelector(scopeId);
  const responsiveCountRules = normalizeResponsiveToMinWidthRules(
    responsiveCount,
    fallbackCount,
    args.breakpointMap
  );
  const responsiveTextBreakpoints =
    collectResponsiveSliderTextLineBreakpoints(layout, args.breakpointMap);
  const responsiveContainerBreakpoints =
    collectResponsiveSliderContainerBreakpoints(layout, args.breakpointMap);
  const responsiveBaseStyleBreakpoints =
    collectResponsiveSliderBaseStyleBreakpoints(layout, args.breakpointMap);

  const resolveCountAtMinWidth = (minWidth: number) => {
    let resolved = fallbackCount;

    for (const rule of responsiveCountRules) {
      if (minWidth >= rule.minWidth) {
        resolved = rule.count;
      }
    }

    return Math.max(1, resolved | 0);
  };

  const mkRule = (count: number, minWidth: number) => {
    const totalExpr = buildInitialHeightFromSkeletonSpecCssExpr(
      layout,
      count,
      mode,
      minWidth,
      args.breakpointMap
    );
    const rowExpr = buildRowHeightFromSkeletonSpecCssExpr(
      layout,
      count,
      mode,
      minWidth,
      args.breakpointMap
    );
    const extrasExpr = buildExtrasHeightFromSkeletonSpecCssExpr(
      layout,
      minWidth,
      args.breakpointMap
    );
    const spacerExpr = centerFirstSpacer
        ? buildCenterFirstSpacerWidthFromSkeletonSpecCssExpr(
          layout,
          count,
          mode,
          minWidth,
          args.breakpointMap
        )
      : null;

    if (!totalExpr && !rowExpr && !extrasExpr && !spacerExpr && !centerFirstSpacer) {
      return "";
    }

    const decls = [
      totalExpr ? `--rmg-slider-initial-height:${totalExpr};` : "",
      rowExpr ? `--rmg-slider-row-height:${rowExpr};` : "",
      extrasExpr ? `--rmg-slider-extras-height:${extrasExpr};` : "",
      centerFirstSpacer
        ? `--rmg-slider-center-first-spacer-width:${spacerExpr ?? "0px"};`
        : "",
    ].join("");

    return `${shellSel}{${decls}}`;
  };
  const allBreakpoints = Array.from(
    new Set<number>([
      ...responsiveCountRules.map((rule) => rule.minWidth),
      ...responsiveBaseStyleBreakpoints,
      ...responsiveContainerBreakpoints,
      ...responsiveTextBreakpoints,
    ])
  ).sort((a, b) => a - b);

  const lines: string[] = [];

  for (const minWidth of allBreakpoints) {
    const rule = mkRule(resolveCountAtMinWidth(minWidth), minWidth);
    if (!rule) continue;

    if (minWidth <= 0) {
      lines.push(rule);
    } else {
      lines.push(`@media (min-width:${minWidth}px){${rule}}`);
    }
  }

  return lines.join("\n");
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
  // Only the primary slider layout should bind to GalleryCore's shared cells/api.
  // Nested sliders, like per-entry media sliders, must keep their own local children.
  const attachesToGalleryCore = core?.layout === "slider";
  const internalIndexChannel = React.useMemo(() => createIndexChannel(), []);
  const resolvedIndexChannel = providedIndexChannel ?? internalIndexChannel;
  const isClick = React.useRef(false);
  const localExpandableImageRefs = React.useRef<Array<HTMLImageElement | null>>([]);

  const expandableImageRefs =
    props.expandableImageRefs !== undefined
      ? props.expandableImageRefs
      : (attachesToGalleryCore ? (core?.expandableImageRefs ?? localExpandableImageRefs) : localExpandableImageRefs);

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

      if (attachesToGalleryCore && core?.sliderApiRef) {
        core.sliderApiRef.current = inst;
      }

      if (!forwardedRef) return;
      if (typeof forwardedRef === "function") forwardedRef(inst);
      else (forwardedRef as React.RefObject<SliderHandle | null>).current = inst;
    },
    [attachesToGalleryCore, core, forwardedRef]
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
        scrollbar: {
          ...DEFAULT_SLIDER.controls.scrollbar,
          ...(sliderOptions?.controls?.scrollbar ?? {}),
          root: {
            ...DEFAULT_SLIDER.controls.scrollbar.root,
            ...(sliderOptions?.controls?.scrollbar?.root ?? {}),
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

  const [localCellsState] = React.useState<Cell[]>(initialCells);
  const [useCoreCells, setUseCoreCells] = React.useState(
    () => !!core && attachesToGalleryCore && core.cellsRef.current.length > 0
  );

  React.useLayoutEffect(() => {
    if (!core) return;
    if (!attachesToGalleryCore) return;
    if (useCoreCells) return;

    if (core.cellsRef.current.length > 0) {
      setUseCoreCells(true);
      return;
    }

    core.setItems(initialCells.map((cell) => cell.node));
    setUseCoreCells(true);
  }, [attachesToGalleryCore, core, initialCells, useCoreCells]);

  const coreCells =
    attachesToGalleryCore
      ? ((core?.cellsState as Cell[] | undefined) ?? undefined)
      : undefined;
  const cellsState: Cell[] =
    core && attachesToGalleryCore && useCoreCells
      ? (coreCells ?? [])
      : localCellsState;

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

  const sliderLoading = React.useMemo(() => {
    const src = sliderObject.transitions?.loading ?? {};
    return {
      enabled: src.enabled ?? true,
      force: src.force ?? false,
      skeletonCount: src.skeletonCount,
      renderLoading: src.renderLoading,
      skeleton: src.skeleton,
      timing: src.timing,
    };
  }, [sliderObject.transitions?.loading]);

  const sliderScope = React.useMemo(
    () =>
      buildStableScopeId("rmg-slider-", {
        align: sliderObject.align,
        breakpoints: effectiveBreakpoints,
        direction: sliderObject.direction,
        layout: sliderObject.layout,
        loadingSkeleton: sliderLoading.skeleton,
        loadingSkeletonCount: sliderLoading.skeletonCount,
        viewportHeight: sliderObject.elements?.viewport?.style?.height,
      }),
    [
      sliderObject.align,
      effectiveBreakpoints,
      sliderObject.direction,
      sliderObject.layout,
      sliderLoading.skeleton,
      sliderLoading.skeletonCount,
      sliderObject.elements?.viewport?.style?.height,
    ]
  );
  const sliderSkeletonScopeSelector = React.useMemo(
    () => buildSliderSkeletonScopeSelector(sliderScope),
    [sliderScope]
  );

  function pickSsrBaseResponsiveValue(v: any, fallback: number) {
    return normalizeResponsiveToMinWidthRules(
      v,
      fallback,
      effectiveBreakpoints
    )[0]?.count ?? fallback;
  }

  const ssrCellsBase = React.useMemo(() => {
    return Math.max(1, (pickSsrBaseResponsiveValue(sliderObject.layout?.cellsPerSlide, 1) | 0));
  }, [effectiveBreakpoints, sliderObject.layout?.cellsPerSlide]);

  const centerFirstSkeleton = React.useMemo(() => {
    const layout = (sliderLoading.skeleton as any)?.layout;
    return (
      !sliderLoading.renderLoading &&
      sliderObject.align === "center" &&
      sliderLoading.skeleton?.centering === "first" &&
      (sliderLoading.skeleton?.mode ?? "fit") === "peek" &&
      layout?.kind === "slider"
    );
  }, [sliderLoading.renderLoading, sliderLoading.skeleton, sliderObject.align]);

  const centerFirstLeadingSpacer = React.useMemo(() => {
    return (
      centerFirstSkeleton &&
      maxResolvedSkeletonCount(
        sliderLoading.skeletonCount,
        ssrCellsBase,
        effectiveBreakpoints
      ) > 1
    );
  }, [
    centerFirstSkeleton,
    sliderLoading.skeletonCount,
    ssrCellsBase,
    effectiveBreakpoints,
  ]);

  const maxSkeletonSlots = React.useMemo(() => {
    const layout = (sliderLoading.skeleton as any)?.layout;
    const slotCount =
      layout?.kind === "slider" && Array.isArray(layout?.slots)
        ? layout.slots.length
        : 0;
    const realCountMax = maxResolvedSkeletonCount(
      sliderLoading.skeletonCount,
      ssrCellsBase,
      effectiveBreakpoints
    );
    const renderedSlotCount = centerFirstLeadingSpacer && slotCount > 0
      ? slotCount + 1
      : slotCount;
    const renderedCountMax = centerFirstLeadingSpacer ? realCountMax + 1 : realCountMax;

    return Math.max(12, renderedSlotCount, renderedCountMax);
  }, [
    sliderLoading.skeletonCount,
    ssrCellsBase,
    effectiveBreakpoints,
    centerFirstLeadingSpacer,
    sliderLoading.skeleton,
  ]);

  const sliderSkeleton = useScopedSkeleton({
    enabled: true,
    scopeId: sliderScope,
    loading: sliderLoading,
    fallbackCount: ssrCellsBase,
    breakpointMap: effectiveBreakpoints,
    maxSlots: maxSkeletonSlots,
    visibleSlotsForCount: centerFirstLeadingSpacer
      ? centerFirstVisibleSlotsForCount
      : undefined,
    showLoadingFallback: !isReady,

    defaultNode: (MAX_SKELETONS, baseCount) => {
      const spec = (sliderLoading).skeleton;

      if (spec) {
        return (
          <SliderSkeletonCard
            count={baseCount}
            maxSlots={MAX_SKELETONS}
            spec={spec}
            breakpoints={effectiveBreakpoints}
            centerFirst={centerFirstSkeleton}
            hasLeadingSpacer={centerFirstLeadingSpacer}
            responsiveCssScopeSelector={sliderSkeletonScopeSelector}
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

  const loadingTiming = React.useMemo(
    () =>
      resolveLoadingTiming({
        prefersReducedMotion,
        timing: sliderLoading.timing,
      }),
    [prefersReducedMotion, sliderLoading.timing]
  );
  const { showLoadingLayer, loadingExiting, introUnlocked } = useLoadingLayerState({
    loadingActive: sliderSkeleton.showLoading,
    exitMs: loadingTiming.exitMs,
    minVisibleMs: loadingTiming.minVisibleMs,
  });
  
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
    return collectPredecodeImageUrls(renderedCells, sliderObject.lazyLoad.enabled === true);
  }, [renderedCells, sliderObject.lazyLoad.enabled]);

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
      centerFirstSpacer: centerFirstLeadingSpacer,
    });
  }, [
    sliderScope,
    sliderLoading,
    ssrCellsBase,
    effectiveBreakpoints,
    centerFirstLeadingSpacer,
  ]);

  const explicitViewportHeightCss = React.useMemo(() => {
    const explicitHeight = toCssLengthValue(
      sliderObject.elements?.viewport?.style?.height
    );
    if (!explicitHeight) return "";

    return `${buildSliderShellScopeSelector(sliderScope)}{--rmg-slider-initial-height:${explicitHeight};--rmg-slider-row-height:${explicitHeight};}`;
  }, [sliderObject.elements?.viewport?.style?.height, sliderScope]);

  const needsBlockSizeContainer = React.useMemo(() => {
    const viewportStyle = sliderObject.elements?.viewport?.style;
    const skeletonStyle = sliderLoading.skeleton?.style;

    return (
      sliderObject.direction.axis === "y" &&
      (
        usesBlockContainerUnit(viewportStyle?.height) ||
        usesBlockContainerUnit(viewportStyle?.minHeight) ||
        usesBlockContainerUnit(viewportStyle?.maxHeight) ||
        usesBlockContainerUnit(skeletonStyle?.height) ||
        usesBlockContainerUnit(skeletonStyle?.minHeight) ||
        usesBlockContainerUnit(skeletonStyle?.maxHeight)
      )
    );
  }, [
    sliderObject.direction.axis,
    sliderObject.elements?.viewport?.style,
    sliderLoading.skeleton?.style,
  ]);

  const freezeDoneRef = React.useRef(false);
  const reserveLoadingHeight = !isReady;

  React.useLayoutEffect(() => {
    if (freezeDoneRef.current) return;
    const shell = sliderShellRef.current;
    if (!shell) return;

    const layout = shell.querySelector<HTMLElement>('[data-rmg-skel-part="layout"]');
    const row = shell.querySelector<HTMLElement>('[data-rmg-skel-part="row"]');
    const viewport =
      shell.querySelector<HTMLElement>(`[data-rmg-part="viewport"]`) ||
      shell.querySelector<HTMLElement>(`.${styles.viewport}`);
    const layoutH = layout?.getBoundingClientRect().height ?? 0;
    const rowH = row?.getBoundingClientRect().height ?? 0;
    const viewportH = viewport?.getBoundingClientRect().height ?? 0;
    const h = Math.max(layoutH, rowH, viewportH);

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
    const contentLayer = shell.querySelector<HTMLElement>(`.${styles.contentLayer}`);

    const viewportH = viewport?.getBoundingClientRect().height ?? 0;
    const contentLayerH = contentLayer?.getBoundingClientRect().height ?? 0;

    // Avoid carrying the loading shell height into the live slider height.
    const realH = Math.max(viewportH, contentLayerH);

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
      {explicitViewportHeightCss && (
        <style dangerouslySetInnerHTML={{ __html: explicitViewportHeightCss }} />
      )}

      <div
        id={sliderScope}
        data-rmg-scope={sliderScope}
        className={styles.sliderScope}
        style={
          needsBlockSizeContainer
            ? {
                height: "100%",
                containerType: "size",
              }
            : undefined
        }
      >
        <div
          ref={sliderShellRef}
          data-rmg-scope-shell="true"
          className={styles.sliderShell}
          style={{
            minHeight:
              reserveLoadingHeight
                ? "var(--rmg-slider-initial-height, var(--rmg-slider-height))"
                : undefined,
          }}
        >
          <div
            className={[
              styles.contentLayer,
              showLoadingLayer ? styles.contentBlocked : "",
            ].filter(Boolean).join(" ")}
            style={{
              paddingBottom: reserveLoadingHeight
                ? "var(--rmg-slider-extras-height, 0px)"
                : undefined,
            }}
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
              showScrollbar={sliderObject.controls.scrollbar.enabled}
              scrollbarClassName={sliderObject.controls.scrollbar.root.className}
              scrollbarStyle={sliderObject.controls.scrollbar.root.style}
              renderScrollbar={sliderObject.controls.scrollbar.render}
              parallax={sliderObject.effects?.parallax?.enabled}
              parallaxBleedPct={sliderObject.effects?.parallax?.bleedPct}
              parallaxBorderRadius={sliderObject.effects?.parallax?.borderRadius}
              parallaxSideWidth={sliderObject.effects?.parallax?.sideWidth}
              ref={setSliderHandle}
              scaleEffect={sliderObject.effects?.scale?.enabled}
              scaleAmount={sliderObject.effects?.scale?.amount}
              fadeEffect={sliderObject.effects?.fade?.enabled}
              fadeMinOpacity={sliderObject.effects?.fade?.minOpacity}
              crossfadeControls={sliderObject.effects?.crossfade?.controls}
              crossfadeDrag={sliderObject.effects?.crossfade?.drag}
              crossfadeDurationMs={sliderObject.effects?.crossfade?.durationMs}
              crossfadeEasing={sliderObject.effects?.crossfade?.easing}
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
              enableFullscreen={attachesToGalleryCore && !!core?.fsEnabled}
              requestFullscreenOpen={
                attachesToGalleryCore && core
                  ? ({ index, image, event }) => core.requestFullscreenOpen({ source: "slider", index, image, event })
                  : undefined
              }
              isFullscreenOpen={attachesToGalleryCore && !!core?.isFullscreenOpen}
              setFullscreenOpen={attachesToGalleryCore ? core?.setFullscreenOpen! : (() => {})}
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
              style={{
                ["--rmg-loading-fade-duration" as any]: `${loadingTiming.exitMs}ms`,
              }}
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
