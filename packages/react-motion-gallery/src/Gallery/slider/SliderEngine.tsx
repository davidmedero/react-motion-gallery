/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import {
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
  cloneElement,
  Children,
  ReactNode,
  ReactElement,
  HTMLAttributes,
  ClassAttributes,
  Dispatch,
  SetStateAction,
  RefObject,
  isValidElement,
  useCallback,
  useMemo,
  Ref,
  useImperativeHandle,
  forwardRef,
} from 'react'
import styles from './Slider.module.css'
import createIndexChannel, {
  isValidSliderInitialIndex,
  normalizeSliderInitialIndex,
} from './sliderSub'
import { AxisKey, isMouseEvent } from '../shared/input/pointerTypes';
import { createDragTracker } from '../shared/input/dragTracker';
import { Vector1D, Vector1DType } from '../shared/motion/vector1d';
import { ScrollBody, ScrollBodyType } from '../shared/motion/scrollBody';
import { Limit, LimitType } from '../shared/motion/limit';
import { ScrollLooper } from '../shared/motion/scrollLooper';
import { ScrollBounds, ScrollBoundsType, PercentOfView, PercentOfViewType } from '../shared/motion/scrollBounds';
import { BaseTarget, factorAbs, ScrollTarget, ScrollTargetType } from '../shared/motion/scrollTarget';
import { EventStore } from '../shared/motion/eventStore';
import { Animations, AnimationsType } from '../shared/motion/animations';
import type { APITypes } from '../video/plyrTypes';
import { RmgSlideProvider } from '../shared/slideContext';
import { SliderRevealOptions, SliderLazyLoadOptions, type CrossFadeWheel, type SliderAutoPlayTimer, type SliderCoreHandle, type SliderSkipSnaps } from './types';
import type { ArrowRenderArgs, DotsRenderArgs, ProgressRenderArgs, ScrollbarRenderArgs } from '../shared/types/controls';
import { BreakpointMap } from '../shared/responsive';
import { IndexMode } from '../api/types';
import { Counter, CounterType } from '../shared/motion/counter';
import { useParallaxEffect } from './effects/useParallaxEffect';
import { useScaleEffect } from './effects/useScaleEffect';
import { useFadeEffect } from './effects/useFadeEffect';
import { useSkeletonRevealGate } from '../shared/loading/skeletonRevealGate';
import { BaseLimit, createBaseLimit } from '../shared/motion/baseLimit';
import { WindowType } from '../shared/input/pointerTypes'
import { AXSpec } from '../shared/types/axis';
import { Translate } from '../shared/motion/translate';
import { useWheelLock } from '../shared/hooks/useWheelLock';
import { useInViewOnce } from '../shared/hooks/useInViewOnce';
import { createRmgSlideStoreBag, type RmgSlideStoreBag } from '../shared/slideStoreBag';
import {
  LAZY_ATTR,
  RMG_BLANK,
  hydrateLazyImageShell,
  markLazyImageShell,
  revealLazyImageShell,
} from '../shared/lazy/lazyShell';
import { buildStableScopeId } from '../shared/stableScope';
import { detectKindFromChild, isRmgVideoElement } from './mediaKind';
import { computeSliderChildrenKey } from './childrenSignature';
import {
  buildSliderScrollSnaps,
  fitsWithinSliderViewport,
  getSliderCenterOffset,
  roundSliderLayoutMetric,
  resolveSliderGroupCells,
  resolveSliderMeasuredSize,
  resolveSliderContentSpan,
  shouldEnableSliderLoop,
} from './layoutStability';
import {
  clamp01,
  DEFAULT_SLIDER_CROSSFADE_WHEEL_COMMIT_THRESHOLD,
  DEFAULT_SLIDER_CROSSFADE_WHEEL_SENSITIVITY,
  DEFAULT_SLIDER_CROSSFADE_WHEEL_SESSION_GAP_MS,
  resolveSliderCrossfadeDragTarget,
  resolveSliderWheelCrossfadeOptions,
  resolveSliderWheelCrossfadeProgress,
  resolveSliderWheelCrossfadeTarget,
  shouldCompleteSliderDragCrossfade,
  shouldCompleteSliderWheelCrossfade,
  shouldTreatSliderWheelAsSameSession,
  shouldStartSliderControlsCrossfade,
} from './crossfade';
import { resolveSliderReleaseSnapForce } from './snapRelease';
import {
  shouldRebaseSliderVideoCloneAtOrigin,
} from './videoCloneRebase';

function DragTracker(main: AxisKey | undefined, ownerWindow: WindowType) {
  const scroll: AxisKey = main ?? 'x'
  const cross: AxisKey = scroll === 'x' ? 'y' : 'x'

  return createDragTracker({
    ownerWindow,
    axis: { scroll, cross },
  })
}

type BaseScrollTo = {
  distance: (n: number, snap: boolean) => void
  index: (n: number, direction: number) => void
}

const DEFAULT_SLIDER_CROSSFADE_MS = 420;
const DEFAULT_SLIDER_CROSSFADE_EASING = 'cubic-bezier(.4,0,.22,1)';

const SLIDER_LAYOUT_EPS = 0.75;
const SLIDER_CELL_SIZE_STEP = 0.5;
const SLIDER_WRAP_HYSTERESIS_PX = 6;

function nowMs() {
  return typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now();
}

type MeasuredCell = {
  el: HTMLElement;
  start: number;
  end: number;
  size: number;
};

type SliderPage = {
  cells: { element: HTMLElement; index: number }[];
  target: number;
  alignSize: number;
};

type PageModel = {
  slides: SliderPage[];
  cellToSlide: number[];
};

function quantizeSliderMetric(value: number, step = SLIDER_CELL_SIZE_STEP) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value / step) * step;
}

function nearlyEqual(a: number, b: number, eps = SLIDER_LAYOUT_EPS) {
  return Math.abs(a - b) <= eps;
}

export function shouldReanchorSliderOnResize(args: {
  wrap: boolean;
  centerAlign?: boolean;
  cellsPerSlide?: number;
  groupCells?: boolean | number;
}) {
  const { wrap, centerAlign, cellsPerSlide, groupCells } = args;
  const hasFixedCellsPerSlide =
    typeof cellsPerSlide === 'number' &&
    Number.isFinite(cellsPerSlide) &&
    cellsPerSlide > 0;
  const hasFixedGroupCells =
    typeof groupCells === 'number' &&
    Number.isFinite(groupCells) &&
    groupCells > 1;

  return wrap || !!centerAlign || hasFixedCellsPerSlide || hasFixedGroupCells;
}

function shouldEnableLoopWithHysteresis(args: {
  loop?: boolean;
  itemCount: number;
  span: number;
  viewport: number;
  previous: boolean;
}) {
  const { loop, itemCount, span, viewport, previous } = args;
  if (!loop) return false;
  if (itemCount <= 1) return false;

  // Prevent flapping when resize hovers around the fit threshold.
  if (previous) {
    return span > viewport - SLIDER_WRAP_HYSTERESIS_PX;
  }

  return span > viewport + SLIDER_WRAP_HYSTERESIS_PX;
}

function computeCellsPerSideForLoop(args: {
  originalsCount: number;
  measuredOriginals: MeasuredCell[];
  viewport: number;
  gap: number;
  fixedCellsPerSlide: number | null;
}) {
  const { originalsCount, measuredOriginals, viewport, gap, fixedCellsPerSlide } = args;

  if (!originalsCount) return 0;

  if (fixedCellsPerSlide != null) {
    return Math.max(1, Math.min(originalsCount, fixedCellsPerSlide));
  }

  let sum = 0;
  let count = 0;
  for (const item of measuredOriginals) {
    const next = count === 0 ? item.size : sum + gap + item.size;
    if (fitsWithinSliderViewport(next, viewport)) {
      sum = next;
      count++;
    } else {
      count++;
      break;
    }
  }

  return Math.max(2, Math.min(originalsCount, count || 1));
}

function computePagesFromLayout(args: {
  data: MeasuredCell[];
  originals: HTMLElement[];
  wrap: boolean;
  groupCells?: boolean | number;
  centerAlign?: boolean;
  cellsPerSlide?: number;
  viewport: number;
  contentSpan: number;
  getLayoutMainSize: (el: HTMLElement | null) => number;
}): PageModel {
  const {
    data,
    originals,
    wrap,
    groupCells,
    centerAlign,
    cellsPerSlide,
    viewport,
    contentSpan,
    getLayoutMainSize,
  } = args;

  const idxMap = new Map<HTMLElement, number>(originals.map((el, i) => [el, i]));
  const allowCenteredOverflow = !!centerAlign && !wrap;

  const pages: { els: HTMLElement[]; target: number }[] = [];
  let i = 0;

  const resolvedGroupCells = resolveSliderGroupCells({
    total: data.length,
    groupCells,
    cellsPerSlide,
  });

  if (resolvedGroupCells.enabled) {
    while (i < data.length) {
      const startLeft = data[i]?.start ?? 0;
      let j = i;

      if (resolvedGroupCells.fixedCount != null) {
        j = Math.min(data.length, i + resolvedGroupCells.fixedCount);
      } else {
        const viewRight = startLeft + viewport;
        while (j < data.length && (data[j]?.end ?? 0) <= viewRight + 0.5) j++;
        if (j === i) j++;
      }

      const slice = data.slice(i, j).map((d) => d.el);
      const isLast = j >= data.length;

      let target = startLeft;
      if (isLast && !wrap && !allowCenteredOverflow) {
        target = Math.max(0, contentSpan - viewport);
      }
      if (i === 0) target = 0;

      pages.push({ els: slice, target });
      i = j;
    }
  } else {
    const maxTarget = Math.max(0, contentSpan - viewport);

    if (wrap || allowCenteredOverflow) {
      data.forEach((d, idx) => {
        const t = idx === 0 ? 0 : d.start;
        if (!pages.length || Math.abs(t - pages[pages.length - 1].target) > 0.5) {
          pages.push({ els: [d.el], target: t });
        }
      });
    } else {
      for (let idx = 0; idx < data.length; idx++) {
        const d = data[idx];
        let t = idx === 0 ? 0 : d.start;
        t = Math.min(t, maxTarget);

        if (!pages.length || Math.abs(t - pages[pages.length - 1].target) > 0.5) {
          pages.push({ els: [d.el], target: t });
        }

        if (Math.abs(t - maxTarget) <= 0.5) break;
      }

      const winStart = maxTarget - 0.5;
      const winEnd = maxTarget + viewport + 0.5;

      const lastEls = data
        .filter((d) => d.start < winEnd && d.end > winStart)
        .map((d) => d.el);

      if (lastEls.length) {
        const lastT = pages[pages.length - 1]?.target ?? -1;
        if (Math.abs(lastT - maxTarget) > 0.5) {
          pages.push({ els: lastEls, target: maxTarget });
        } else {
          const uniq = new Set(pages[pages.length - 1].els.concat(lastEls));
          pages[pages.length - 1].els = Array.from(uniq);
        }
      }
    }
  }

  const slides: SliderPage[] = pages.map((page) => {
    let alignSize = 0;

    if (resolvedGroupCells.enabled) {
      let minStart = Infinity;
      let maxEnd = -Infinity;

      for (const el of page.els) {
        const dataIdx = idxMap.get(el);
        if (dataIdx == null) continue;

        const cell = data[dataIdx];
        if (!cell) continue;

        minStart = Math.min(minStart, cell.start);
        maxEnd = Math.max(maxEnd, cell.end);
      }

      if (Number.isFinite(minStart) && Number.isFinite(maxEnd) && maxEnd > minStart) {
        alignSize = maxEnd - minStart;
      }
    }

    if (alignSize <= 0) {
      alignSize = getLayoutMainSize(page.els[0] ?? null);
    }

    return {
      target: page.target,
      alignSize,
      cells: page.els.map((el) => ({
        element: el,
        index: idxMap.get(el)!,
      })),
    };
  });

  const cellToSlide: number[] = [];
  slides.forEach((slide, slideIdx) => {
    slide.cells.forEach((cell) => {
      cellToSlide[cell.index] = slideIdx;
    });
  });

  return { slides, cellToSlide };
}

interface SliderProps {
  children: ReactNode
  cellCount: number
  isClick: RefObject<boolean>
  expandableImageRefs?: React.RefObject<(HTMLImageElement | null)[]>
  overlayDivRef?: RefObject<HTMLDivElement | null>
  duplicateImgRef?: RefObject<HTMLElement | null>
  closeButtonRef?: RefObject<HTMLElement | null>
  counterRef?: RefObject<HTMLElement | null>
  leftChevronRef?: RefObject<HTMLElement | null>
  rightChevronRef?: RefObject<HTMLElement | null>
  isReady: boolean
  setIsReady: Dispatch<SetStateAction<boolean>>
  loop?: boolean
  freeScroll?: boolean
  autoPlay?: boolean
  autoPlaySpeed: number
  autoPlayPause: number
  autoScroll?: boolean
  autoScrollSpeed: number
  autoScrollPause: number
  pauseAutoPlayOnHover?: boolean;
  pauseAutoScrollOnHover?: boolean;
  autoHeight?: boolean;
  autoHeightDuration: string;
  autoHeightEasing: string;
  groupCells?: boolean | number
  centerAlign?: boolean
  gap: number;
  sliderViewportStyles?: React.CSSProperties;
  sliderViewportClassName?: string;
  sliderContainerStyles?: React.CSSProperties;
  sliderContainerClassName?: string;
  backgroundColor?: string
  arrowStyles?: React.CSSProperties;
  arrowClassName?: string;
  prevArrowStyles?: React.CSSProperties;
  prevArrowClassName?: string;
  nextArrowStyles?: React. CSSProperties;
  nextArrowClassName?: string;
  dotsContainerStyles?: React.CSSProperties;
  dotsContainerClassName?: string;
  dotsStyles?: React.CSSProperties;
  dotsClassName?: string;
  renderArrows?: (args: ArrowRenderArgs & { dir: "prev" | "next" }) => React.ReactNode;
  renderPrevArrow?: (args: ArrowRenderArgs) => React.ReactNode;
  renderNextArrow?: (args: ArrowRenderArgs) => React.ReactNode;
  renderDots?: (args: DotsRenderArgs) => React.ReactNode;
  showArrows?: boolean;
  showDots?: boolean;
  showProgress?: boolean;
  progressClassName?: string;
  progressStyle?: React.CSSProperties;
  progressInnerClassName?: string;
  progressInnerStyle?: React.CSSProperties;
  renderProgress?: (args: ProgressRenderArgs) => React.ReactNode;
  showScrollbar?: boolean;
  scrollbarClassName?: string;
  scrollbarStyle?: React.CSSProperties;
  renderScrollbar?: (args: ScrollbarRenderArgs) => React.ReactNode;
  parallax?: boolean;
  parallaxBleedPct?: string;
  parallaxBorderRadius?: string;
  parallaxSideWidth?: string;
  scaleEffect?: boolean;
  scaleAmount?: number;
  fadeEffect?: boolean;
  fadeMinOpacity?: number;
  crossfadeControls?: boolean;
  crossfadeDrag?: boolean;
  crossfadeWheel?: CrossFadeWheel;
  crossfadeDurationMs?: number;
  crossfadeEasing?: string;
  cellsPerSlide?: number;
  direction?: 'ltr' | 'rtl';
  axis?: 'x' | 'y';
  skipSnaps?: SliderSkipSnaps;
  strictSnaps?: boolean;
  selectDuration: number;
  freeScrollDuration: number;
  sliderFriction: number;
  initialIndex?: number;
  indexChannel?: ReturnType<typeof createIndexChannel>;
  indexChannelControlled?: boolean;
  revealOptions?: SliderRevealOptions;
  revealUnlocked?: boolean;
  lazyLoad?: SliderLazyLoadOptions;
  rippleEnabled?: boolean;
  rippleClassName?: string;
  sliderImagesReady?: boolean;
  breakpointMap: BreakpointMap;
  enableFullscreen?: boolean;
  requestFullscreenOpen?: (req: {
    index: number;
    image: HTMLImageElement | null;
    event?: Event;
  }) => void;
  isFullscreenOpen?: boolean;
  setFullscreenOpen?: (open: boolean) => void;
}

type CarouselChildProps = HTMLAttributes<HTMLElement> &
  ClassAttributes<HTMLElement> & {
    style?: React.CSSProperties
  }

function getSlidesForCanonicalIndex(track: HTMLElement, canonicalIndex: number): HTMLElement[] {
  return Array.from(
    track.querySelectorAll<HTMLElement>(
      `[data-rmg-slide="true"][data-rmg-idx="${canonicalIndex}"]`
    )
  );
}

function getCanonicalIndexFromSlide(slideEl: HTMLElement): number | null {
  const idxAttr = slideEl.getAttribute("data-rmg-idx");
  const idx = idxAttr != null ? parseInt(idxAttr, 10) : NaN;
  return Number.isFinite(idx) ? idx : null;
}

function rememberRevealedCanonical(slideEl: HTMLElement, revealedCanonicals?: Set<number>) {
  if (!revealedCanonicals) return;
  const idx = getCanonicalIndexFromSlide(slideEl);
  if (idx == null) return;
  revealedCanonicals.add(idx);
}

async function revealCanonicalSlides(
  track: HTMLElement,
  canonicalIndex: number,
  revealedCanonicals?: Set<number>
) {
  const slides = getSlidesForCanonicalIndex(track, canonicalIndex);
  if (!slides.length) return;

  const pending = slides.filter(
    (slideEl) =>
      slideEl.hasAttribute("data-rmg-lazyload") &&
      slideEl.getAttribute("data-rmg-lazyloaded") !== "true"
  );

  if (!pending.length) return;

  await Promise.all(
    pending.map(async (slideEl) => {
      if (slideEl.getAttribute("data-rmg-lazyloading") === "true") return;

      slideEl.setAttribute("data-rmg-lazyloading", "true");
      try {
        await revealSlide(slideEl, revealedCanonicals);
      } finally {
        slideEl.removeAttribute("data-rmg-lazyloading");
      }
    })
  );
}

function markLazyShell(slideEl: HTMLElement) {
  markLazyImageShell(slideEl);
}

function hydrateRevealedShell(slideEl: HTMLElement, revealedCanonicals?: Set<number>) {
  hydrateLazyImageShell(slideEl, {
    onRevealed: () => {
      rememberRevealedCanonical(slideEl, revealedCanonicals);
    },
  });
}

async function revealSlide(slideEl: HTMLElement, revealedCanonicals?: Set<number>) {
  await revealLazyImageShell(slideEl, {
    onRevealed: () => {
      rememberRevealedCanonical(slideEl, revealedCanonicals);
    },
  });
}

function detectKindFromDom(slideEl: HTMLElement): 'video' | 'image' {
  // Plyr root
  if (slideEl.querySelector('.plyr')) return 'video';

  if (slideEl.querySelector('[data-rmg-video-snapshot="true"]')) return 'video';

  // Native video
  if (slideEl.querySelector('video')) return 'video';

  // Common embed patterns (YouTube/Vimeo)
  if (slideEl.querySelector('iframe')) return 'video';

  // (Optional) Plyr sometimes marks provider on iframe
  if (slideEl.querySelector('[data-plyr-provider], [data-plyr-embed-id]')) return 'video';

  return 'image';
}

function normalizeLazyLoad(src?: SliderLazyLoadOptions) {
  return {
    enabled: src?.enabled ?? false,
    spinner: src?.spinner ?? true,
    spinnerClassName: src?.spinnerClassName,
    spinnerStyle: src?.spinnerStyle,
  };
}

function resolveLazySpinnerNode(args: {
  lazy: ReturnType<typeof normalizeLazyLoad>;
  kind: 'image' | 'video';
  isClone: boolean;
}): { render: boolean; node: React.ReactNode | null; isCustom: boolean } {
  const { lazy, kind, isClone } = args;

  if (!lazy.enabled) return { render: false, node: null, isCustom: false };

  const sp = lazy.spinner;

  if (sp === false) return { render: false, node: null, isCustom: false };

  if (typeof sp === "function") {
    return { render: true, node: sp({ kind, isClone }), isCustom: true };
  }

  if (sp === true || sp == null) return { render: true, node: null, isCustom: false };
  return { render: true, node: sp, isCustom: true };
}

function parseCssPixelValue(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getOuterHeight(el: HTMLElement) {
  const rect = el.getBoundingClientRect();

  if (typeof window === "undefined") return rect.height;

  const style = window.getComputedStyle(el);
  return Math.max(
    0,
    rect.height +
      parseCssPixelValue(style.marginTop) +
      parseCssPixelValue(style.marginBottom)
  );
}

function getAutoHeightTargets(slideEl: HTMLElement) {
  const directChildren = Array.from(slideEl.children) as HTMLElement[];
  const parallaxLayer = directChildren.find((child) =>
    child.classList.contains("rmg__parallax")
  );

  if (parallaxLayer) return [parallaxLayer];

  const contentChildren = directChildren.filter(
    (child) => !child.hasAttribute("data-rmg-spinner")
  );

  return contentChildren.length ? contentChildren : [slideEl];
}

function getSlideAutoHeight(slideEl: HTMLElement) {
  const targets = getAutoHeightTargets(slideEl);
  if (!targets.length) return getOuterHeight(slideEl);

  let minTop = Infinity;
  let maxBottom = -Infinity;

  for (const target of targets) {
    const rect = target.getBoundingClientRect();
    if (!Number.isFinite(rect.height) || rect.height <= 0) continue;

    let marginTop = 0;
    let marginBottom = 0;

    if (typeof window !== "undefined") {
      const style = window.getComputedStyle(target);
      marginTop = parseCssPixelValue(style.marginTop);
      marginBottom = parseCssPixelValue(style.marginBottom);
    }

    minTop = Math.min(minTop, rect.top - marginTop);
    maxBottom = Math.max(maxBottom, rect.bottom + marginBottom);
  }

  if (!Number.isFinite(minTop) || !Number.isFinite(maxBottom)) {
    return getOuterHeight(slideEl);
  }

  return Math.max(0, maxBottom - minTop);
}

type PlyrApi = APITypes | null;

type PlyrRefsByIndex = React.RefObject<Record<number, PlyrApi>>;

type PendingCloneToggleState = {
  canonicalIndex: number;
  observer: IntersectionObserver | null;
  rafId: number | null;
  deadlineTs: number;
};

const AUTO_HEIGHT_PIXEL_PRECISION = 1000;
const AUTO_HEIGHT_PIXEL_EPSILON = 0.01;

function toStableAutoHeightPx(value: number) {
  return (
    Math.round((value + Number.EPSILON) * AUTO_HEIGHT_PIXEL_PRECISION) /
    AUTO_HEIGHT_PIXEL_PRECISION
  );
}

function cloneSlide(
  child: ReactElement<any>,
  key: string,
  elementIndex: number,
  cells: React.RefObject<{ element: HTMLElement; index: number }[]>,
  enableParallax?: boolean,
  cellCountForIdx?: number,
  lazyLoad?: ReturnType<typeof normalizeLazyLoad>,
  extraStyle?: React.CSSProperties,
  isClone?: boolean,
  plyrRefsByIdx?: PlyrRefsByIndex,
  slideStoreBag?: RmgSlideStoreBag,
  revealedCanonicals?: Set<number>,
  indexChannel?: ReturnType<typeof createIndexChannel>
): ReactElement<CarouselChildProps> {
  const normIdx =
    cellCountForIdx != null
      ? ((elementIndex % cellCountForIdx) + cellCountForIdx) % cellCountForIdx
      : elementIndex;
  const kind = detectKindFromChild(child);
  const isRmgVideo = isRmgVideoElement(child);
  const isCanonicallyRevealed = revealedCanonicals?.has(normIdx) ?? false;
  const registerCanonicalApi = (index: number, api: APITypes | null) => {
    if (!plyrRefsByIdx) return;

    if (api) plyrRefsByIdx.current[normIdx] = api;
    else delete plyrRefsByIdx.current[normIdx];
  };

  const ctxVal = {
    normIdx,
    isClone: !!isClone,
    storeBag: slideStoreBag,
    indexChannel,
    registerApiByIndex: registerCanonicalApi,
  };

  const spinnerResolved = lazyLoad
    ? resolveLazySpinnerNode({ lazy: lazyLoad, kind, isClone: !!isClone })
    : { render: false, node: null, isCustom: false };
  const spinnerClassName = [
    spinnerResolved.isCustom ? styles.spinnerWrap : styles.spinner,
    lazyLoad?.spinnerClassName,
  ]
    .filter(Boolean)
    .join(' ');
  const spinnerNode =
    lazyLoad?.enabled && spinnerResolved.render ? (
      spinnerResolved.isCustom ? (
        <div
          data-rmg-spinner
          className={spinnerClassName}
          style={lazyLoad.spinnerStyle}
          aria-hidden="true"
        >
          {spinnerResolved.node}
        </div>
      ) : (
        <div
          data-rmg-spinner
          className={spinnerClassName}
          style={lazyLoad.spinnerStyle}
          aria-hidden="true"
        />
      )
    ) : null;

  const shellProps = {
    ['data-rmg-slide' as any]: 'true',
    ['data-rmg-idx' as any]: String(normIdx),
    ['data-rmg-rendered-idx' as any]: String(elementIndex),
    ['data-rmg-kind' as any]: kind,
    ['data-rmg-clone' as any]: isClone ? 'true' : 'false',
    ref: (el: HTMLElement | null) => {
      if (el && !cells.current.some((c) => c.element === el)) {
        cells.current.push({ element: el, index: elementIndex });
      }
      if (el && lazyLoad?.enabled) {
        if (isCanonicallyRevealed) hydrateRevealedShell(el, revealedCanonicals);
        else markLazyShell(el);
      }

      if (el) {
        const kind = detectKindFromDom(el);
        if (el.getAttribute('data-rmg-kind') !== kind) {
          el.setAttribute('data-rmg-kind', kind);
        }
      }
    },
    style: {
      position: 'relative',
      flex: '0 0 auto',
      ...(extraStyle || {}),
      ['--rmg-reveal-index' as any]: normIdx,
      transform: 'scale(var(--rmg-scale, 1))',
      transformOrigin: 'center',
      userSelect: 'none',
    } as React.CSSProperties,
  };

  let contentNode: React.ReactNode = child;

  if (isRmgVideo) {
    const videoProps = child.props ?? {};
    const existingRegisterApiByIndex = videoProps.registerApiByIndex;
    contentNode = cloneElement(child, {
      registerApiByIndex: (index: number, api: APITypes | null) => {
        registerCanonicalApi(index, api);
        existingRegisterApiByIndex?.(index, api);
      },
    });
  } else if (
    lazyLoad?.enabled &&
    !isCanonicallyRevealed &&
    typeof child.type === "string" &&
    child.type.toLowerCase() === "img"
  ) {
    const imgProps = child.props || {};
    const alt = imgProps.alt ?? "";
    const realSrc = typeof imgProps.src === "string" ? imgProps.src : "";

    if (realSrc && realSrc !== RMG_BLANK) {
      contentNode = cloneElement(child, {
        src: RMG_BLANK,
        alt,
        [LAZY_ATTR]: realSrc,
        decoding: imgProps.decoding ?? "async",
        style: {
          ...(imgProps.style || {}),
          opacity: 0,
          transition: imgProps.style?.transition ?? "opacity 280ms ease",
        },
      });
    }
  }

  if (!enableParallax) {
    return (
      <div key={key} {...shellProps}>
        <RmgSlideProvider value={ctxVal}>
          {contentNode}
          {spinnerNode}
        </RmgSlideProvider>
      </div>
    );
  }

  return (
    <div key={key} {...shellProps} className="rmg__slide">
      <RmgSlideProvider value={ctxVal}>
        <div className="rmg__parallax">
          <div className="rmg__parallax__layer">{contentNode}</div>
          {spinnerNode}
        </div>
      </RmgSlideProvider>
    </div>
  );
}

const SliderCore = forwardRef<SliderCoreHandle, SliderProps>(function SliderCore(
  {
    children,
    cellCount,
    isClick,
    expandableImageRefs,
    isReady,
    setIsReady,
    loop,
    freeScroll,
    autoPlay,
    autoPlaySpeed,
    autoPlayPause,
    autoScroll,
    autoScrollSpeed,
    autoScrollPause,
    pauseAutoPlayOnHover,
    pauseAutoScrollOnHover,
    autoHeight,
    autoHeightDuration,
    autoHeightEasing,
    groupCells,
    centerAlign,
    gap,
    sliderViewportStyles,
    sliderViewportClassName,
    sliderContainerStyles,
    sliderContainerClassName,
    parallax,
    parallaxBleedPct,
    parallaxBorderRadius,
    parallaxSideWidth,
    scaleEffect,
    scaleAmount,
    fadeEffect,
    fadeMinOpacity,
    crossfadeControls,
    crossfadeDrag,
    crossfadeWheel,
    crossfadeDurationMs,
    crossfadeEasing,
    cellsPerSlide,
    direction,
    axis,
    skipSnaps,
    strictSnaps,
    selectDuration,
    freeScrollDuration,
    sliderFriction,
    initialIndex,
    indexChannel: externalIndexChannel,
    indexChannelControlled,
    revealOptions,
    revealUnlocked,
    lazyLoad,
    sliderImagesReady,
  }: SliderProps,
  ref: Ref<SliderCoreHandle>
) {
  const skeletonRevealGate = useSkeletonRevealGate();
  const hasInitialIndexRef = useRef(isValidSliderInitialIndex(initialIndex));
  const initialSelectedIndexRef = useRef(normalizeSliderInitialIndex(initialIndex));
  const hasAppliedInitialIndexRef = useRef(false);
  const slider = useRef<HTMLDivElement | null>(null);
  const slides = useRef<{ cells: { element: HTMLElement, index: number }[], target: number, alignSize: number }[]>([]);
  const visibleImagesRef = useRef(0);
  const selectedIndex = useRef(initialSelectedIndexRef.current);
  const sliderX = useRef(0);
  const sliderVelocity = useRef(0);
  const isWrapping = useRef(true);
  const sliderContainer = useRef<HTMLDivElement | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const prevButtonRef = useRef<HTMLDivElement>(null)
  const nextButtonRef = useRef<HTMLDivElement>(null)
  const dotRefs = useRef<(HTMLDivElement | null)[]>([])
  const dotsContainerRef = useRef<HTMLDivElement | null>(null)
  const crossfadeLayerRef = useRef<HTMLDivElement | null>(null)
  const crossfadeSourceRef = useRef<HTMLDivElement | null>(null)
  const crossfadeTargetRef = useRef<HTMLDivElement | null>(null)
  const [clonedChildren, setClonedChildren] = useState<React.ReactElement[]>([])
  const clonesCountRef = useRef(0)
  const [visibleImages, setVisibleImages] = useState(1)
  const [slidesState, setSlidesState] = useState<{ cells: { element: HTMLElement }[] }[]>([])
  const [isMeasured, setIsMeasured] = useState(false)
  const [inView, setInView] = useState(false)
  const [wrap, setWrap] = useState(false)
  const progressHolderRef = useRef<HTMLDivElement | null>(null);
  const progressInnerRef  = useRef<HTMLDivElement | null>(null);
  const scrollbarRef = useRef<HTMLInputElement | null>(null);
  const lastProgressRef   = useRef(0);
  const cellToSlideRef = useRef<number[]>([]);
  const builtOnceRef = useRef(false);
  const slideBuildSubs = useRef(new Set<(nodes: HTMLElement[]) => void>());
  const readySubs = useRef(new Set<(nodes: HTMLElement[]) => void>());
  const readyResolvers = useRef<Array<(nodes: HTMLElement[]) => void>>([]);
  const [layoutReady, setLayoutReady] = useState(false);
  const [engineReady, setEngineReady] = useState(false);
  const [autoHeightReady, setAutoHeightReady] = useState(false);
  const trackCenterOffsetRef = useRef(0);
  const lastEmittedIndexRef = useRef<number>(-1);
  const locationRef = useRef<Vector1DType | null>(null)
  const previousLocationRef = useRef<Vector1DType | null>(null)
  const offsetLocationRef = useRef<Vector1DType | null>(null)
  const targetRef = useRef<Vector1DType | null>(null)
  const bodyRef = useRef<ScrollBodyType | null>(null)
  const translateRef = useRef<ReturnType<typeof Translate> | null>(null)
  const animRef = useRef<AnimationsType | null>(null)
  const limitRef = useRef<LimitType | null>(null)
  const pointerDownRef = useRef(false)
  const isAnimatingRef = useRef(false)
  const isPointerDown = useRef(false)
  const isScrolling = useRef(false)
  const xRef = useRef(0)
  const dragX = useRef(0)
  const previousDragX = useRef(0)
  const dragMoveTime = useRef<number>(0)
  const dragStartIndexRef = useRef(0)
  const dragStartLocationRef = useRef(0)
  const dragDisplacementRef = useRef(0)
  const boundsRef = useRef<ScrollBoundsType | null>(null)
  const povRef    = useRef<PercentOfViewType | null>(null)
  const cells = useRef<{ element: HTMLElement; index: number }[]>([])
  const sliderWidth = useRef(0)
  const hasPositioned = useRef<boolean>(false)
  const getSnapTargets: () => number[] = () =>
    (slides.current || []).map((_, i) => -getSnapLocationForIndex(i))
  const totalWidth = () => sliderWidth.current || 0
  const contentSizeRef = useRef(0)
  const loopLimitRef = useRef<ReturnType<typeof Limit> | null>(null)
  const looperRef = useRef<ReturnType<typeof ScrollLooper> | null>(null)
  const loopRenderOffsetRef = useRef(0)
  const scrollSnapsRef = useRef<number[]>([])
  const scrollContentSizeRef = useRef(0)
  const scrollLimitRef = useRef<BaseLimit | null>(null)
  const scrollTargetRef = useRef<ScrollTargetType | null>(null)
  const scrollToRef = useRef<BaseScrollTo | null>(null)
  const indexCurrentRef = useRef<CounterType | null>(null)
  const indexPreviousRef = useRef<CounterType | null>(null)
  const layoutRef = useRef<{
    originals: { el: HTMLElement; start: number; end: any; size: any }[];
    cw: number;
  } | null>(null);
  const draggingAttr = 'data-rmg-drag';
  const activePointerIdRef = useRef<number | null>(null);
  const guardsStoreRef = useRef<ReturnType<typeof EventStore> | null>(null);
  const isHoveringRef = useRef(false);
  const lastPointerUpTime = useRef<number>(nowMs() - 1000);
  const autoPlayTimerStartedAtRef = useRef<number | null>(null);
  const autoScrollPauseUntil = useRef(0);
  const [buildKey, setBuildKey] = useState(0);
  const loopStableRef = useRef(false);
  const lastGeomSigRef = useRef<string>("");
  const plyrRefsByIdx = useRef<Record<number, any>>({});
  const slideStoreBag = useMemo(() => createRmgSlideStoreBag(), [buildKey]);
  const lastCloneSigRef = useRef<string>("");
  const rebuildPagesRef = useRef<(() => void) | null>(null);
  const rebuildPagesRafRef = useRef<number | null>(null);
  const revealedCanonicalIndicesRef = useRef<Set<number>>(new Set());
  const pendingCloneToggleRef = useRef<PendingCloneToggleState | null>(null);
  const pendingSetIndexRef = useRef<{ index: number; mode: IndexMode } | null>(null);
  const internalIndexChannel = useMemo(
    () => createIndexChannel(initialSelectedIndexRef.current, "instant"),
    []
  );
  const indexChannel = externalIndexChannel ?? internalIndexChannel;
  const hasExternalIndexChannel = indexChannelControlled === true;

  const autoHeightRafRef = useRef<number | null>(null);
  const lastAutoHeightPxRef = useRef<number | null>(null);
  const crossfadeBusyRef = useRef(false);
  const crossfadeSeqRef = useRef(0);
  const crossfadeRaf1Ref = useRef<number | null>(null);
  const crossfadeRaf2Ref = useRef<number | null>(null);
  const crossfadeTimeoutRef = useRef<number | null>(null);
  const crossfadeCommittedTrackIndexRef = useRef<number | null>(null);
  const wheelCrossfadeStateRef = useRef<{
    sourceIndex: number;
    targetIndex: number;
    delta: number;
    progress: number;
    direction: 1 | -1;
  } | null>(null);
  const wheelCrossfadeSessionRef = useRef<{
    direction: 1 | -1;
    lastEventTs: number;
  } | null>(null);
  const dragCrossfadeStateRef = useRef<{
    sourceIndex: number;
    targetIndex: number;
    progress: number;
    delta: number;
  } | null>(null);
  const isRtl = direction === 'rtl' ? true : false
  const rtlCls = isRtl ? styles.rtl : '';
  const sign = axis === 'x' && isRtl ? -1 : 1;
  const resolvedCrossfadeDurationMs =
    typeof crossfadeDurationMs === 'number' && Number.isFinite(crossfadeDurationMs)
      ? Math.max(0, crossfadeDurationMs)
      : DEFAULT_SLIDER_CROSSFADE_MS;
  const resolvedCrossfadeEasing =
    typeof crossfadeEasing === 'string' && crossfadeEasing.trim().length > 0
      ? crossfadeEasing
      : DEFAULT_SLIDER_CROSSFADE_EASING;
  const resolvedCrossfadeWheel = resolveSliderWheelCrossfadeOptions({
    controls: crossfadeControls,
    wheel: crossfadeWheel,
    sharedDurationMs: resolvedCrossfadeDurationMs,
    defaults: {
      sensitivity: DEFAULT_SLIDER_CROSSFADE_WHEEL_SENSITIVITY,
      commitThreshold: DEFAULT_SLIDER_CROSSFADE_WHEEL_COMMIT_THRESHOLD,
      sessionGapMs: DEFAULT_SLIDER_CROSSFADE_WHEEL_SESSION_GAP_MS,
    },
  });
  const shouldReanchorOnResize = shouldReanchorSliderOnResize({
    wrap,
    centerAlign,
    cellsPerSlide,
    groupCells,
  });

  const scopeId = useMemo(
    () =>
      buildStableScopeId('rmg-slider-core-', {
        axis,
        parallaxBleedPct,
        parallaxBorderRadius,
        parallaxSideWidth,
      }),
    [axis, parallaxBleedPct, parallaxBorderRadius, parallaxSideWidth]
  );

  const AX: AXSpec = useMemo(() => {
    const main = axis!;
    const cross = axis === 'x' ? 'y' : 'x';
    const sizeKey   = axis === 'x' ? 'width'  : 'height';
    const clientKey = axis === 'x' ? 'clientWidth'  : 'clientHeight';
    const startKey  = axis === 'x' ? 'left'   : 'top';
    const endKey    = axis === 'x' ? 'right'  : 'bottom';

    const translate = (n: number) =>
      axis === 'x' ? `translate3d(${n}px,0,0)` : `translate3d(0,${n}px,0)`;

    const wheelDelta = (e: WheelEvent) => (axis === 'x' ? e.deltaX : e.deltaY);

    return {
      main,
      cross,
      sizeKey,
      clientKey,
      startKey,
      endKey,
      translate,
      place: (n: number) =>
        axis === 'x'
          ? `translateX(${n}px) scale(var(--rmg-scale, 1))`
          : `translateY(${n}px) scale(var(--rmg-scale, 1))`,
      wheelDelta,
    };
  }, [axis]);

  function getViewportMainSize() {
    const viewport = viewportRef.current;
    if (viewport) {
      const size = (viewport as any)[AX.clientKey] as number;
      if (Number.isFinite(size) && size > 0) return size;
    }

    const track = slider.current;
    if (!track) return 0;

    const fallback = (track as any)[AX.clientKey] as number;
    return Number.isFinite(fallback) ? fallback : 0;
  }

  function createMainSizeStableResizeGuard(targets: Array<HTMLElement | null>) {
    let lastMainSize = getViewportMainSize();
    // Auto-height may resize the cross axis; that should not reanchor scroll.
    const lastTargetMainSizes = new WeakMap<Element, number>();

    const readTargetMainSize = (target: Element | null) => {
      if (typeof HTMLElement === "undefined" || !(target instanceof HTMLElement)) return 0;

      const rectSize = target.getBoundingClientRect()[AX.sizeKey];
      if (Number.isFinite(rectSize) && rectSize > 0) return rectSize;

      const clientSize = (target as any)[AX.clientKey] as number;
      return Number.isFinite(clientSize) ? clientSize : 0;
    };

    const readEntryMainSize = (entry: ResizeObserverEntry) => {
      const entrySize = entry.contentRect?.[AX.sizeKey];
      if (Number.isFinite(entrySize) && entrySize > 0) return entrySize;

      return readTargetMainSize(entry.target);
    };

    targets.forEach((target) => {
      if (!target) return;
      const size = readTargetMainSize(target);
      if (Number.isFinite(size) && size > 0) {
        lastTargetMainSizes.set(target, size);
      }
    });

    return (entries: ResizeObserverEntry[]) => {
      if (!entries.length) return false;

      const activeTargets = targets.filter(Boolean) as HTMLElement[];
      if (!activeTargets.length) return false;

      const onlyGuardedTargets = entries.every((entry) =>
        activeTargets.some((target) => target === entry.target)
      );

      if (!onlyGuardedTargets) return false;

      const nextMainSize = getViewportMainSize();
      if (nextMainSize <= 0) return false;

      const previousMainSize = lastMainSize;
      lastMainSize = nextMainSize;

      let targetMainSizesStable = true;
      for (const entry of entries) {
        const nextTargetMainSize = readEntryMainSize(entry);
        const previousTargetMainSize = lastTargetMainSizes.get(entry.target);

        if (Number.isFinite(nextTargetMainSize) && nextTargetMainSize > 0) {
          lastTargetMainSizes.set(entry.target, nextTargetMainSize);
        }

        if (
          previousTargetMainSize == null ||
          !Number.isFinite(nextTargetMainSize) ||
          Math.abs(nextTargetMainSize - previousTargetMainSize) > 0.5
        ) {
          targetMainSizesStable = false;
        }
      }

      return (
        Number.isFinite(previousMainSize) &&
        Math.abs(nextMainSize - previousMainSize) <= 0.5 &&
        targetMainSizesStable
      );
    };
  }

  function getLayoutMainSize(el: HTMLElement | null) {
    if (!el) return 0;

    const rectSize = el.getBoundingClientRect()[AX.sizeKey];
    const scaleRaw =
      typeof window !== "undefined"
        ? window.getComputedStyle(el).getPropertyValue("--rmg-scale").trim()
        : "";
    const scale = Number.parseFloat(scaleRaw);
    const offsetSize =
      AX.main === "x"
        ? el.offsetWidth
        : el.offsetHeight;

    const marginExtentSize = (() => {
      const children = Array.from(el.children) as HTMLElement[];
      if (!children.length || typeof window === "undefined") return 0;

      const offsetKey = AX.main === "x" ? "offsetLeft" : "offsetTop";
      const sizeKey = AX.main === "x" ? "offsetWidth" : "offsetHeight";
      const marginStartKey = AX.main === "x" ? "marginLeft" : "marginTop";
      const marginEndKey = AX.main === "x" ? "marginRight" : "marginBottom";

      let minStart = Infinity;
      let maxEnd = -Infinity;
      let foundMargin = false;

      for (const child of children) {
        const style = window.getComputedStyle(child);
        if (style.position === "absolute" || style.position === "fixed") continue;

        const offset = (child as any)[offsetKey] as number;
        const size = (child as any)[sizeKey] as number;
        if (!Number.isFinite(offset) || !Number.isFinite(size) || size <= 0) continue;

        const marginStart = Number.parseFloat(style[marginStartKey]) || 0;
        const marginEnd = Number.parseFloat(style[marginEndKey]) || 0;
        if (marginStart !== 0 || marginEnd !== 0) foundMargin = true;

        minStart = Math.min(minStart, offset - marginStart);
        maxEnd = Math.max(maxEnd, offset + size + marginEnd);
      }

      if (!foundMargin || !Number.isFinite(minStart) || !Number.isFinite(maxEnd)) return 0;
      return Math.max(0, maxEnd - minStart);
    })();

    // In-flow child margins can extend the slide's visual footprint beyond the
    // shell's border box, but transformed overflow like parallax bleed should
    // not affect layout or loop geometry.
    return resolveSliderMeasuredSize({
      rectSize,
      scale,
      offsetSize,
      marginExtentSize,
    });
  }

  const baseCss = useMemo(() => {
    const root = `[data-rmg-slider-core-scope="${scopeId}"]`;
    const fixedSel = `${root}[data-rmg-fixed-height="true"]`;
    const autoSel = `${root}[data-rmg-fixed-height="false"]`;
    const bleedScale = parseFloat(parallaxBleedPct ?? "130%") / 100;

    return `
  ${root} .rmg__slide {
    position: relative;
    overflow: hidden;
    border-radius: ${parallaxBorderRadius};
  }

  ${fixedSel} .rmg__slide,
  ${autoSel} .rmg__slide {
    width: ${parallaxSideWidth};
  }

  ${fixedSel} .rmg__slide {
    height: 100%;
  }

  ${root} .rmg__parallax {
    width: 100%;
  }

  ${fixedSel} .rmg__parallax,
  ${fixedSel} .rmg__parallax__layer {
    height: 100%;
  }

  ${root} .rmg__parallax__layer {
    width: 100%;
    will-change: transform;
    --rmg-bleed-scale: ${bleedScale};
    transform: ${
      axis === 'x' ? 'translateX(0%) scale(var(--rmg-bleed-scale))' : 'translateY(0%) scale(var(--rmg-bleed-scale))'
    }
  }

  ${fixedSel} .rmg__parallax__layer > img,
  ${fixedSel} .rmg__parallax__layer > picture,
  ${fixedSel} .rmg__parallax__layer > video {
    height: 100%;
    object-fit: cover;
  }
  `;
  }, [axis, scopeId, parallaxBleedPct, parallaxBorderRadius, parallaxSideWidth]);

  useEffect(() => {
    return () => {
      slideStoreBag.destroyAll()
    }
  }, [slideStoreBag]);

  function syncProgressUiInFrame() {
    const limit = scrollLimitRef.current;
    if (!limit) {
      lastProgressRef.current = 0;
      return;
    }

    const span = limit.max - limit.min;
    if (span <= 0) {
      lastProgressRef.current = 1;
      return;
    }

    const current = offsetLocationRef.current?.get() ?? limit.max;
    const bounded = wrap ? limit.removeOffset(current) : limit.constrain(current);
    lastProgressRef.current = Math.max(0, Math.min(1, (limit.max - bounded) / span));
  }

  const childrenKey = useMemo(() => {
    return computeSliderChildrenKey(children);
  }, [children]);

  useEffect(() => {
    // Child mutations still need a fresh measure/build pass, but they should not
    // replay mount-only loading or reveal state after the slider has become ready.
    setEngineReady(false);
    setLayoutReady(false);
    if (autoHeight) setAutoHeightReady(false);
    hasPositioned.current = false;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cellCount, childrenKey, loop, axis, autoHeight]);

  function getOriginalNodes(): HTMLElement[] {
    const track = slider.current;
    if (!track) return [];
    const kids = Array.from(track.children) as HTMLElement[];
    const before = clonesCountRef.current || 0;
    const after  = before;
    return kids.slice(before, kids.length - after);
  }

  function measureFlowLayout(elements: HTMLElement[]) {
    if (!elements.length) return [];

    const offsetKey = AX.main === 'x' ? 'offsetLeft' : 'offsetTop';
    const first = elements[0];
    const firstSize = getLayoutMainSize(first);
    const firstOffset = (first as any)[offsetKey] as number;
    const firstEnd = firstOffset + firstSize;

    return elements.map((el) => {
      const size = getLayoutMainSize(el);
      const offset = (el as any)[offsetKey] as number;
      const start =
        AX.main === 'x' && isRtl
          ? firstEnd - (offset + size)
          : offset - firstOffset;

      return {
        el,
        start,
        end: start + size,
        size,
      };
    });
  }

  function measureLoopRenderOffset(track: HTMLElement | null, firstOriginal: HTMLElement | null) {
    if (!track || !firstOriginal) return 0;

    if (AX.main === 'y') {
      return firstOriginal.offsetTop;
    }

    if (isRtl) {
      return track.scrollWidth - (firstOriginal.offsetLeft + getLayoutMainSize(firstOriginal));
    }

    return firstOriginal.offsetLeft;
  }

  function clampIndex(i: number, len: number) {
    return Math.max(0, Math.min(len - 1, i))
  }

  useEffect(() => {
    isWrapping.current = wrap
  }, [wrap, isWrapping])

  function ensureDragStyle(scopeId: string) {
    const id = 'rmg-drag-style-' + scopeId;
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      /* Only while data-rmg-drag is present on this slider root */
      [data-rmg-slider-core-scope="${scopeId}"][data-rmg-drag]        { cursor: grabbing !important; }
      [data-rmg-slider-core-scope="${scopeId}"][data-rmg-drag] *      { cursor: grabbing !important; }
      [data-rmg-slider-core-scope="${scopeId}"][data-rmg-fullscreen-enabled="true"] [data-rmg-slide="true"] img,
      [data-rmg-slider-core-scope="${scopeId}"][data-rmg-fullscreen-enabled="true"] [data-rmg-fullscreen-trigger] {
        cursor: zoom-in;
      }
    `;
    document.head.appendChild(style);
  }

  useEffect(() => {
    if (sliderContainer.current) ensureDragStyle(scopeId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sliderContainer.current, scopeId]);

  function setDragCursor(on: boolean) {
    const root = sliderContainer.current;
    if (!root) return;

    if (on) {
      if (!root.hasAttribute(draggingAttr)) root.setAttribute(draggingAttr, '');
      return;
    }

    if (root.hasAttribute(draggingAttr)) root.removeAttribute(draggingAttr);
    activePointerIdRef.current = null;
    guardsStoreRef.current?.clear();
    guardsStoreRef.current = null;
  }

  useEffect(() => {
    const root = sliderContainer.current;
    if (!root) return;

    const onLeave = () => {
      if (pointerDownRef.current) setDragCursor(false);
    };
    const onEnter = () => {
      if (pointerDownRef.current && activePointerIdRef.current != null) setDragCursor(true);
    };

    root.addEventListener('mouseleave', onLeave, { passive: true });
    root.addEventListener('mouseenter', onEnter, { passive: true });
    return () => {
      root.removeEventListener('mouseleave', onLeave as any);
      root.removeEventListener('mouseenter', onEnter as any);
    };
  }, []);

  function getCenterOffsetForIndex(idx: number) {
    const slide = slides.current?.[idx];
    if (!slide?.cells?.[0]?.element) return 0;
    const containerSize = getViewportMainSize();
    if (containerSize <= 0) return 0;
    const alignSize =
      slide.alignSize > 0
        ? slide.alignSize
        : getLayoutMainSize(slide.cells[0].element);
    return getSliderCenterOffset({
      viewport: containerSize,
      alignSize,
      centerAlign,
    });
  }

  function getSnapLocationForIndex(idx: number) {
    const slide = slides.current?.[idx];
    if (!slide) return 0;
    return -(slide.target ?? 0) + getCenterOffsetForIndex(idx);
  }

  function computeCurrentScrollSnaps() {
    const viewport = getViewportMainSize();

    return buildSliderScrollSnaps({
      targets: (slides.current || []).map((slide) => slide.target ?? 0),
      alignSizes: (slides.current || []).map((slide) => {
        const fallbackEl = slide.cells?.[0]?.element;
        const fallbackSize = getLayoutMainSize(fallbackEl ?? null);
        return slide.alignSize > 0 ? slide.alignSize : fallbackSize;
      }),
      viewport,
      centerAlign,
    });
  }

  const autoHeightTransition = useMemo(() => {
    const heightTransition = `height ${autoHeightDuration} ${autoHeightEasing}`;
    const existingTransition = sliderViewportStyles?.transition;
    if (existingTransition == null || existingTransition === "") return heightTransition;
    return `${existingTransition}, ${heightTransition}`;
  }, [
    autoHeightDuration,
    autoHeightEasing,
    sliderViewportStyles?.transition,
  ]);

  const autoHeightWillChange = useMemo(() => {
    const existingWillChange = sliderViewportStyles?.willChange;
    if (existingWillChange == null || existingWillChange === "") return "height";

    const value = String(existingWillChange);
    const hasHeight = value
      .split(",")
      .some((part) => part.trim().toLowerCase() === "height");

    return hasHeight ? value : `${value}, height`;
  }, [sliderViewportStyles?.willChange]);

  const applyAutoHeightViewportStyles = useCallback((viewport: HTMLDivElement, animate = true) => {
    viewport.style.transition = animate ? autoHeightTransition : "none";
    viewport.style.willChange = autoHeightWillChange;
  }, [autoHeightTransition, autoHeightWillChange]);

  const resetAutoHeightViewportStyles = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const explicitHeight = sliderViewportStyles?.height;
    if (explicitHeight == null || explicitHeight === "") {
      viewport.style.removeProperty("height");
    } else if (typeof explicitHeight === "number") {
      viewport.style.height = `${explicitHeight}px`;
    } else {
      viewport.style.height = explicitHeight;
    }

    if (sliderViewportStyles?.transition == null) {
      viewport.style.removeProperty("transition");
    } else {
      viewport.style.transition = String(sliderViewportStyles.transition);
    }

    if (sliderViewportStyles?.willChange == null) {
      viewport.style.removeProperty("will-change");
    } else {
      viewport.style.willChange = String(sliderViewportStyles.willChange);
    }
  }, [
    sliderViewportStyles?.height,
    sliderViewportStyles?.transition,
    sliderViewportStyles?.willChange,
  ]);

  const measureAutoHeightForIndex = useCallback((index: number) => {
    const slide = slides.current?.[index];
    const cellsForSlide = slide?.cells ?? [];

    if (!cellsForSlide.length) return 0;

    return cellsForSlide.reduce((max, cell) => {
      const measured = getSlideAutoHeight(cell.element);
      return Math.max(max, measured);
    }, 0);
  }, []);

  const queueAutoHeightMeasure = useCallback((
    index = selectedIndex.current,
    options: { animate?: boolean } = {}
  ) => {
    if (!autoHeight || typeof window === "undefined") return;
    const viewport = viewportRef.current;
    if (!viewport) return;

    if (autoHeightRafRef.current != null) {
      window.cancelAnimationFrame(autoHeightRafRef.current);
    }

    autoHeightRafRef.current = window.requestAnimationFrame(() => {
      autoHeightRafRef.current = null;

      const measured = measureAutoHeightForIndex(index);
      if (!Number.isFinite(measured) || measured <= 0) return;

      const nextHeight = toStableAutoHeightPx(measured);
      if (
        lastAutoHeightPxRef.current != null &&
        Math.abs(lastAutoHeightPxRef.current - nextHeight) < AUTO_HEIGHT_PIXEL_EPSILON
      ) {
        setAutoHeightReady(true);
        return;
      }

      const hasMeasuredAutoHeight = lastAutoHeightPxRef.current != null;
      lastAutoHeightPxRef.current = nextHeight;
      applyAutoHeightViewportStyles(
        viewport,
        options.animate === true && hasMeasuredAutoHeight
      );
      viewport.style.height = `${nextHeight}px`;
      setAutoHeightReady(true);
    });
  }, [
    applyAutoHeightViewportStyles,
    autoHeight,
    measureAutoHeightForIndex,
  ]);

  useEffect(() => {
    if (autoHeight) return;

    if (autoHeightRafRef.current != null && typeof window !== "undefined") {
      window.cancelAnimationFrame(autoHeightRafRef.current);
      autoHeightRafRef.current = null;
    }

    lastAutoHeightPxRef.current = null;
    setAutoHeightReady(false);
    resetAutoHeightViewportStyles();
  }, [autoHeight, resetAutoHeightViewportStyles]);

  useEffect(() => {
    return () => {
      if (autoHeightRafRef.current != null && typeof window !== "undefined") {
        window.cancelAnimationFrame(autoHeightRafRef.current);
      }
    };
  }, []);

  useLayoutEffect(() => {
    if (!autoHeight || !layoutReady) return;

    queueAutoHeightMeasure(undefined, { animate: true });
  }, [autoHeight, layoutReady, slidesState, queueAutoHeightMeasure]);

  useLayoutEffect(() => {
    if (!autoHeight || !layoutReady || typeof ResizeObserver === "undefined") return;

    const track = slider.current;
    if (!track) return;

    const ro = new ResizeObserver(() => {
      queueAutoHeightMeasure(undefined, { animate: true });
    });
    const observed = new Set<HTMLElement>();

    getOriginalNodes().forEach((slideEl) => {
      getAutoHeightTargets(slideEl).forEach((target) => {
        if (observed.has(target)) return;
        observed.add(target);
        ro.observe(target);
      });
    });

    queueAutoHeightMeasure(undefined, { animate: true });

    return () => {
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    autoHeight,
    layoutReady,
    clonedChildren.length,
    childrenKey,
    queueAutoHeightMeasure,
  ]);

  function applyScrollMetrics(scrollSnaps: number[]) {
    const W = sliderWidth.current || 0;

    scrollSnapsRef.current = scrollSnaps;
    contentSizeRef.current = W;
    scrollContentSizeRef.current = W;

    let minSnap = 0;
    let maxSnap = 0;

    if (scrollSnaps.length) {
      minSnap = Math.min(...scrollSnaps);
      maxSnap = Math.max(...scrollSnaps);
    }

    const loopLimit = wrap ? Limit(-W, 0) : Limit(minSnap, maxSnap);
    loopLimitRef.current = loopLimit;

    const loopProgressOrigin = scrollSnaps[0] ?? 0;
    scrollLimitRef.current = wrap
      ? createBaseLimit(loopProgressOrigin - W, loopProgressOrigin)
      : createBaseLimit(minSnap, maxSnap);

    scrollTargetRef.current = targetRef.current
      ? ScrollTarget(wrap, scrollSnaps, W, loopLimit, targetRef.current)
      : null;

    const location = locationRef.current;
    const previousLocation = previousLocationRef.current;
    const offsetLocation = offsetLocationRef.current;
    const target = targetRef.current;

    if (wrap && W > 0 && location && previousLocation && offsetLocation && target) {
      looperRef.current = ScrollLooper(
        W,
        loopLimit,
        location,
        [location, previousLocation, offsetLocation, target]
      );
    } else {
      looperRef.current = null;
    }

    return { minSnap, maxSnap };
  }

  function syncMotionGeometry(options: { reanchor?: boolean } = {}) {
    const { reanchor = false } = options;
    const scrollSnaps = computeCurrentScrollSnaps();
    const { minSnap, maxSnap } = applyScrollMetrics(scrollSnaps);

    if (!scrollSnaps.length) return;

    if (wrap) {
      limitRef.current = null;
      boundsRef.current = null;
      povRef.current = null;

      if (reanchor) {
        reanchorToCurrentIndex();
      } else {
        renderTrackAtLocation(offsetLocationRef.current?.get() ?? xRef.current);
        syncProgressUiInFrame();
        updateControlsImperatively();
      }

      return;
    }

    const cw = getViewportMainSize();
    if (cw <= 0) return;

    limitRef.current = Limit(
      Number.isFinite(minSnap) ? minSnap : 0,
      Number.isFinite(maxSnap) ? maxSnap : 0
    );

    if (
      locationRef.current &&
      targetRef.current &&
      bodyRef.current
    ) {
      povRef.current = PercentOfView(cw);
      boundsRef.current = ScrollBounds(
        limitRef.current,
        locationRef.current,
        targetRef.current,
        bodyRef.current,
        povRef.current,
        selectDuration
      );
    }

    if (reanchor) {
      reanchorToCurrentIndex();
      return;
    }

    const current = offsetLocationRef.current?.get() ?? xRef.current ?? 0;
    const clamped = limitRef.current.constrain(current);

    renderTrackAtLocation(clamped);
    bodyRef.current?.useDuration(0).useFriction(1).sync().resetVelocity();
    animRef.current?.stop();
    isAnimatingRef.current = false;
    syncProgressUiInFrame();
    updateControlsImperatively();
  }

  function snapToIndex(requested: number) {
    const len = slides.current?.length ?? 0;
    if (!len) return;

    const idx = clampIndex(requested, len);
    if (!slides.current?.[idx]) return;

    jumpTrackToIndexInstant(idx);

    selectedIndex.current = idx;
    lastEmittedIndexRef.current = idx;
    indexCurrentRef.current?.set(idx);
    indexPreviousRef.current?.set(idx);

    updateControlsImperatively();
    queueAutoHeightMeasure(idx, { animate: false });
  }

  function reanchorToCurrentIndex() {
    const requested = indexChannel.get().index ?? selectedIndex.current ?? 0;
    snapToIndex(requested);
  }

  useEffect(() => {
    const root = sliderContainer.current;
    if (!root) return;

    const onEnter = () => {
      isHoveringRef.current = true;
    };

    const onLeave = () => {
      isHoveringRef.current = false;
    };

    root.addEventListener('mouseenter', onEnter);
    root.addEventListener('mouseleave', onLeave);

    return () => {
      root.removeEventListener('mouseenter', onEnter);
      root.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  function canRunAutoPlayTimer(now: number): boolean {
    const slideCount = slides.current?.length ?? 0;
    const currentIndex = indexCurrentRef.current?.get() ?? selectedIndex.current ?? 0;

    if (
      !autoPlay ||
      !isReady ||
      !Number.isFinite(autoPlaySpeed) ||
      autoPlaySpeed <= 0 ||
      isPointerDown.current ||
      slideCount <= 1 ||
      (pauseAutoPlayOnHover && isHoveringRef.current)
    ) {
      return false;
    }

    if (now - lastPointerUpTime.current < autoPlayPause) return false;

    if (!wrap) {
      const atStart = currentIndex <= 0;
      const atEnd = currentIndex >= Math.max(0, slideCount - 1);

      if (isRtl ? atStart : atEnd) {
        return false;
      }
    }

    return true;
  }

  function getAutoPlayTimerSnapshot(now = nowMs()): SliderAutoPlayTimer {
    const speedMs = Number.isFinite(autoPlaySpeed)
      ? Math.max(0, autoPlaySpeed)
      : 0;
    const startedAt = autoPlayTimerStartedAtRef.current;
    const elapsedRaw = startedAt == null ? 0 : Math.max(0, now - startedAt);
    const elapsedMs = speedMs > 0 ? Math.min(speedMs, elapsedRaw) : 0;

    return {
      active: canRunAutoPlayTimer(now),
      speedMs,
      startedAt,
      elapsedMs,
      remainingMs: Math.max(0, speedMs - elapsedRaw),
      progress: speedMs > 0 ? clamp01(elapsedRaw / speedMs) : 0,
    };
  }

  useEffect(() => {
    if (!autoPlay || !isReady || !Number.isFinite(autoPlaySpeed) || autoPlaySpeed <= 0) {
      autoPlayTimerStartedAtRef.current = null;
      return;
    }

    autoPlayTimerStartedAtRef.current = nowMs();

    const id = window.setInterval(() => {
      const now = nowMs();
      const slideCount = slides.current?.length ?? 0;
      const currentIndex = indexCurrentRef.current?.get() ?? selectedIndex.current ?? 0;

      if (
        isPointerDown.current ||
        slideCount <= 1 ||
        (pauseAutoPlayOnHover && isHoveringRef.current)
      ) {
        return;
      }

      if (now - lastPointerUpTime.current < autoPlayPause) return;

      if (!wrap) {
        const atStart = currentIndex <= 0;
        const atEnd = currentIndex >= Math.max(0, slideCount - 1);

        if (isRtl ? atStart : atEnd) {
          return;
        }
      }

      if (isRtl) {
        previous();
      } else {
        next();
      }

      autoPlayTimerStartedAtRef.current = nowMs();
    }, autoPlaySpeed);

    return () => {
      window.clearInterval(id);
      autoPlayTimerStartedAtRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    autoPlay,
    autoPlayPause,
    autoPlaySpeed,
    isReady,
    isRtl,
    pauseAutoPlayOnHover,
    slidesState.length,
    wrap,
  ]);

  useEffect(() => {
    if (!autoScroll) return;

    let lastTime = performance.now();
    let frameId: number;

    function loop(now: number) {
      frameId = requestAnimationFrame(loop);

      const dt = now - lastTime;
      lastTime = now;

      if (
        !slider.current ||
        !isWrapping.current ||
        isPointerDown.current ||
        isAnimatingRef.current ||
        (pauseAutoScrollOnHover && isHoveringRef.current)
      ) {
        return;
      }

      if (now < autoScrollPauseUntil.current) return;

      const dir = isRtl ? +1 : -1;
      const offset = offsetLocationRef.current?.get() ?? 0;
      const next = offset + dir * autoScrollSpeed * dt;

      targetRef.current?.set(next);
      bodyRef.current?.useDuration(0).useFriction(1);
      isAnimatingRef.current = true;
      animRef.current?.start();
    }

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoScroll, autoScrollSpeed, isRtl, pauseAutoScrollOnHover]);

  function setWrapSafe(next: boolean) {
    if (loopStableRef.current === next) return;
    loopStableRef.current = next;
    setWrap(next);
    isWrapping.current = next;
    if (!next) loopRenderOffsetRef.current = 0;

    hasPositioned.current = false;
    setLayoutReady(false);

    setBuildKey(k => k + 1);
  }

  const rebuildingPagesRef = useRef(false);

  function rebuildPagesNow() {
    if (rebuildingPagesRef.current) return;
    rebuildingPagesRef.current = true;
    try {
      rebuildPagesRef.current?.();
    } finally {
      rebuildingPagesRef.current = false;
    }
  }

  function isPlyrControlsEl(el: HTMLElement | null) {
    return !!el?.closest?.(
      [
        '.plyr__controls',
        '.plyr__control--overlaid',
        '.plyr__menu__container',
        '.plyr__tooltip',
        '.plyr__captions',
      ].join(',')
    );
  }

  function getClientXY(evt: any) {
    const t = evt.changedTouches?.[0] ?? evt.touches?.[0];
    if (t) return { x: t.clientX, y: t.clientY };
    return { x: evt.clientX, y: evt.clientY };
  }

  function clickedVideoSurface(
    evt: any
  ): { renderedIndex: number; canonicalIndex: number; isClone: boolean } | null {
    const { x, y } = getClientXY(evt);

    const under = document.elementFromPoint(x, y) as HTMLElement | null;
    if (!under) return null;

    const slide = under.closest('[data-rmg-slide="true"]') as HTMLElement | null;
    if (!slide) return null;

    const host = slide.querySelector('[data-rmg-plyr="true"]') as HTMLElement | null;
    if (!host) return null;

    const r = host.getBoundingClientRect();
    const inside =
      x >= r.left && x <= r.right &&
      y >= r.top  && y <= r.bottom;

    if (!inside) return null;

    if (under.closest('.plyr__controls')) return null;

    const renderedAttr = slide.getAttribute('data-rmg-rendered-idx');
    const canonicalAttr = slide.getAttribute('data-rmg-idx');
    const renderedIdx = renderedAttr != null ? parseInt(renderedAttr, 10) : NaN;
    const canonicalIdx = canonicalAttr != null ? parseInt(canonicalAttr, 10) : NaN;
    if (!Number.isFinite(renderedIdx) || !Number.isFinite(canonicalIdx)) return null;

    return {
      renderedIndex: renderedIdx,
      canonicalIndex: canonicalIdx,
      isClone: slide.getAttribute('data-rmg-clone') === 'true',
    };
  }

  function togglePlayerApi(api: PlyrApi): boolean {
    const player = api?.plyr ?? null;
    if (!player) return false;

    const isPlaying = typeof player.playing === 'boolean' ? player.playing : !player.paused;

    if (isPlaying) {
      player.pause();
      return true;
    }

    const playResult = player.play();
    if (playResult && typeof (playResult as Promise<void>).catch === 'function') {
      (playResult as Promise<void>).catch(() => {});
    }

    return true;
  }

  function toggleCanonicalVideoPlay(canonicalIndex: number): boolean {
    const api = plyrRefsByIdx.current[canonicalIndex] ?? null;
    return togglePlayerApi(api);
  }

  function hasVideoCloneSnapshotForCanonical(canonicalIndex: number): boolean {
    const track = slider.current;
    if (!track) return false;

    return !!track.querySelector(
      `:scope > [data-rmg-slide="true"][data-rmg-clone="true"][data-rmg-idx="${canonicalIndex}"] [data-rmg-video-snapshot="true"]`
    );
  }

  function rebaseVideoCloneSnapshotVectorsNearOrigin(locationValue?: number) {
    const location = locationRef.current;
    const previousLocation = previousLocationRef.current;
    const offsetLocation = offsetLocationRef.current;
    const target = targetRef.current;
    const contentSize = contentSizeRef.current || sliderWidth.current || 0;
    const selected = indexCurrentRef.current?.get() ?? selectedIndex.current ?? 0;
    const origin = scrollSnapsRef.current[0] ?? 0;
    const renderedLocation = locationValue ?? location?.get() ?? 0;

    if (
      !location ||
      !previousLocation ||
      !offsetLocation ||
      !target ||
      !shouldRebaseSliderVideoCloneAtOrigin({
        wrap,
        contentSize,
        location: renderedLocation,
        selectedIndex: selected,
        origin,
      }) ||
      !hasVideoCloneSnapshotForCanonical(0)
    ) {
      return false;
    }

    location.add(contentSize);
    previousLocation.add(contentSize);
    offsetLocation.add(contentSize);
    target.add(contentSize);
    xRef.current = location.get();

    return contentSize;
  }

  function findOriginalSlideForCanonical(canonicalIndex: number): HTMLElement | null {
    const track = slider.current;
    if (!track) return null;

    return track.querySelector<HTMLElement>(
      `[data-rmg-slide="true"][data-rmg-clone="false"][data-rmg-idx="${canonicalIndex}"]`
    );
  }

  function cancelPendingCloneToggle() {
    const pending = pendingCloneToggleRef.current;
    if (!pending) return;

    pending.observer?.disconnect();
    if (pending.rafId != null) cancelAnimationFrame(pending.rafId);

    pendingCloneToggleRef.current = null;
  }

  function startPendingCloneToggleRetry(canonicalIndex: number) {
    const pending = pendingCloneToggleRef.current;
    if (!pending || pending.canonicalIndex !== canonicalIndex) return;

    pending.deadlineTs = performance.now() + 1200;
    let lastHasApi: boolean | null = null;

    const tick = () => {
      const current = pendingCloneToggleRef.current;
      if (current !== pending) return;

      const hasApi = !!plyrRefsByIdx.current[canonicalIndex];
      if (hasApi !== lastHasApi) {
        lastHasApi = hasApi;
      }

      if (toggleCanonicalVideoPlay(canonicalIndex)) {
        cancelPendingCloneToggle();
        return;
      }

      if (performance.now() >= pending.deadlineTs) {
        cancelPendingCloneToggle();
        return;
      }

      pending.rafId = requestAnimationFrame(tick);
    };

    pending.rafId = requestAnimationFrame(tick);
  }

  function armCloneToggleOnVisibility(canonicalIndex: number) {
    cancelPendingCloneToggle();
    snapToIndex(canonicalIndex);

    const slideEl = findOriginalSlideForCanonical(canonicalIndex);
    const root = viewportRef.current;
    if (!slideEl || !root) return;

    const pending: PendingCloneToggleState = {
      canonicalIndex,
      observer: null,
      rafId: null,
      deadlineTs: 0,
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const current = pendingCloneToggleRef.current;
        if (current !== pending) return;

        for (const entry of entries) {
          if (!entry.isIntersecting || (entry.intersectionRatio ?? 0) < 0.1) continue;

          pending.observer?.disconnect();
          pending.observer = null;
          startPendingCloneToggleRetry(canonicalIndex);
          return;
        }
      },
      {
        root,
        rootMargin: '0px',
        threshold: [0, 0.1],
      }
    );

    pending.observer = observer;
    pendingCloneToggleRef.current = pending;
    observer.observe(slideEl);
  }

  function computeCloneSig(originals: number, per: number, useCols: boolean) {
    return `${originals}|per=${per}|cols=${useCols ? cellsPerSlide : 0}|group=${groupCells ?? 0}|wrap=${wrap ? 1 : 0}`;
  }

  const normalizedLazy = useMemo(
    () => normalizeLazyLoad(lazyLoad),
    [lazyLoad]
  );

  const preloadCanonicalIndex = useCallback(
    (canonicalIndex: number) => {
      if (!normalizedLazy.enabled) return;

      const track = slider.current;
      if (!track) return;
      if (canonicalIndex < 0 || canonicalIndex >= cellCount) return;

      void revealCanonicalSlides(track, canonicalIndex, revealedCanonicalIndicesRef.current);
    },
    [normalizedLazy.enabled, cellCount]
  );

  useEffect(() => {
    if (!normalizedLazy.enabled) return;
    if (!layoutReady) return;
    if (!clonedChildren.length) return;

    preloadCanonicalIndex(selectedIndex.current);
  }, [normalizedLazy.enabled, layoutReady, clonedChildren.length, preloadCanonicalIndex]);

  useEffect(() => {
    return () => {
      const pending = pendingCloneToggleRef.current;
      pending?.observer?.disconnect();
      if (pending?.rafId != null) cancelAnimationFrame(pending.rafId);
      pendingCloneToggleRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!normalizedLazy.enabled) return;
    if (!layoutReady) return;
    if (!clonedChildren.length) return;

    let cancelled = false;
    const frameId = requestAnimationFrame(() => {
      if (cancelled) return;
      const track = slider.current;
      if (!track) return;

      const next = new Set<number>([selectedIndex.current]);
      cellsInViewInternal().forEach((idx) => next.add(idx));

      next.forEach((idx) => {
        if (idx >= 0 && idx < cellCount) {
          void revealCanonicalSlides(track, idx, revealedCanonicalIndicesRef.current);
        }
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
    };
  }, [normalizedLazy.enabled, layoutReady, clonedChildren.length, cellCount]);

  useEffect(() => {
    const el = slider.current;
    if (!el) return;

    let retryTimeout: number | null = null;
    let isRebuilding = false;

    const queueCloneRetry = () => {
      if (retryTimeout != null) return;

      retryTimeout = window.setTimeout(() => {
        retryTimeout = null;
        rebuildClonedChildren();
      }, 0);
    };

    const rebuildClonedChildren = () => {
      if (isRebuilding) return;
      isRebuilding = true;

      try {
        const rawKids = Children
          .toArray(children)
          .filter(isValidElement) as ReactElement<any>[];

        const originals = rawKids.length;
        if (originals < 1) {
          el.style.removeProperty("--rmg-slide-main-size");
          clonesCountRef.current = 0;
          loopRenderOffsetRef.current = 0;
          lastCloneSigRef.current = "";
          cells.current = [];
          setClonedChildren([]);
          sliderWidth.current = 0;
          layoutRef.current = null;

          setWrapSafe(false);
          slides.current = [];
          setSlidesState([]);
          cellToSlideRef.current = [];

          return;
        }

        const allEls = Array.from(el.children) as HTMLElement[];
        const clonesBefore = clonesCountRef.current;
        const clonesAfter = clonesBefore;
        const originalEls = allEls.slice(clonesBefore, allEls.length - clonesAfter);

        const cw = getViewportMainSize();
        if (cw <= 0) return;

        const useCols =
          typeof cellsPerSlide === "number" && cellsPerSlide > 0;
        const fixedGroupCells = resolveSliderGroupCells({
          total: originals,
          groupCells,
          cellsPerSlide,
        }).fixedCount;

        let cols = 1;
        let cellSize: number | undefined;

        if (useCols) {
          cols = Math.max(1, Math.min(originals, cellsPerSlide as number));
          const totalGap = gap * Math.max(0, cols - 1);
          cellSize = (cw - totalGap) / cols;
        }

        if (useCols && cellSize != null) {
          el.style.setProperty("--rmg-slide-main-size", `${cellSize}px`);
        } else {
          el.style.removeProperty("--rmg-slide-main-size");
        }

        let sum = 0;
        let count = 0;
        for (const slot of originalEls) {
          const w = getLayoutMainSize(slot);
          if (w === 0) {
            queueCloneRetry();
            return;
          }

          const next = count === 0 ? w : sum + gap + w;
          if (fitsWithinSliderViewport(next, cw)) {
            sum = next;
            count++;
          } else {
            count++;
            break;
          }
        }

        const measuredPer = useCols
          ? Math.max(1, Math.min(originals, cols))
          : Math.max(2, Math.min(originals, count));
        const per = Math.max(measuredPer, fixedGroupCells ?? 0);

        const shouldLoop = wrap;
        clonesCountRef.current = shouldLoop ? per : 0;

        if (visibleImagesRef.current !== per) {
          setVisibleImages(per);
          visibleImagesRef.current = per;
        }

        const sig = computeCloneSig(originals, per, useCols);
        const cloneSig = `${sig}|kids=${childrenKey}`;
        if (cloneSig === lastCloneSigRef.current) return;
        lastCloneSigRef.current = cloneSig;

        const enableParallax = !!parallax;
        const slidesArr: ReactElement<any>[] = [];
        cells.current = [];

        const extraStyle: React.CSSProperties | undefined =
          useCols && cellSize != null
            ? ({
                flex: "0 0 auto",
                [AX.sizeKey]: "var(--rmg-slide-main-size)",
              } as any)
            : undefined;

        if (shouldLoop) {
          slidesArr.push(
            ...rawKids.slice(-per).map((c, i) =>
              cloneSlide(
                c,
                `before-${i}`,
                -per + i,
                cells,
                enableParallax,
                cellCount,
                normalizedLazy,
                extraStyle,
                true,
                plyrRefsByIdx,
                slideStoreBag,
                revealedCanonicalIndicesRef.current,
                indexChannel
              )
            )
          );
        }

        slidesArr.push(
          ...rawKids.map((c, i) =>
            cloneSlide(
              c,
              `original-${i}`,
              i,
              cells,
              enableParallax,
              cellCount,
              normalizedLazy,
              extraStyle,
              false,
              plyrRefsByIdx,
              slideStoreBag,
              revealedCanonicalIndicesRef.current,
              indexChannel
            )
          )
        );

        if (shouldLoop) {
          slidesArr.push(
            ...rawKids.slice(0, per).map((c, i) =>
              cloneSlide(
                c,
                `after-${i}`,
                originals + i,
                cells,
                enableParallax,
                cellCount,
                normalizedLazy,
                extraStyle,
                true,
                plyrRefsByIdx,
                slideStoreBag,
                revealedCanonicalIndicesRef.current,
                indexChannel
              )
            )
          );
        }

        setClonedChildren(slidesArr);
      } finally {
        isRebuilding = false;
      }
    };

    const shouldIgnoreResize = createMainSizeStableResizeGuard([
      viewportRef.current,
      sliderContainer.current,
    ]);

    const ro = new ResizeObserver((entries) => {
      if (autoHeight && shouldIgnoreResize(entries)) return;
      rebuildClonedChildren();
    });

    rebuildClonedChildren();

    if (viewportRef.current) {
      ro.observe(viewportRef.current);
    }

    if (sliderContainer.current) {
      ro.observe(sliderContainer.current);
    }

    return () => {
      if (retryTimeout != null) {
        window.clearTimeout(retryTimeout);
      }
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    cellCount,
    slider,
    visibleImagesRef,
    cellsPerSlide,
    groupCells,
    buildKey,
    childrenKey,
    wrap,
    slideStoreBag,
    autoHeight,
  ]);

  useLayoutEffect(() => {
    const track = slider.current;
    if (!track) return;

    function measureAndPosition() {
      const trackEl = slider.current;
      if (!trackEl) return;

      const slideEls = Array.from(trackEl.children) as HTMLElement[];
      if (slideEls.length === 0) return;

      const clonesBefore = clonesCountRef.current;
      const originalEls = slideEls.slice(clonesBefore, slideEls.length - clonesBefore);
      if (originalEls.length === 0) return;

      const originalsForLayout = measureFlowLayout(originalEls);
      if (originalsForLayout.some((item) => item.size === 0)) {
        setTimeout(measureAndPosition, 0);
        return;
      }

      const cw = getViewportMainSize();
      if (cw <= 0) return;

      layoutRef.current = {
        originals: originalsForLayout,
        cw,
      };

      const originalsCount = layoutRef.current?.originals?.length ?? 0;
      const baseSpan = originalsForLayout[originalsCount - 1]?.end ?? 0;

      // Only original slide geometry should decide whether looping is needed.
      const wantLoop = shouldEnableSliderLoop({
        loop,
        itemCount: originalsCount,
        span: baseSpan,
        viewport: cw,
      });

      sliderWidth.current = resolveSliderContentSpan({
        baseSpan,
        gap,
        shouldLoop: wantLoop,
      });

      const flowSig = originalsForLayout
        .map((o) => `${roundSliderLayoutMetric(o.start)}:${roundSliderLayoutMetric(o.size)}`)
        .join(",");

      const sig = `${flowSig}|cw=${roundSliderLayoutMetric(cw)}|W=${roundSliderLayoutMetric(baseSpan)}|wrap=${wantLoop ? 1 : 0}`;

      if (sig !== lastGeomSigRef.current) {
        lastGeomSigRef.current = sig;
        rebuildPagesNow();
      }

      setWrapSafe(wantLoop);
      setIsMeasured(true);
    }

    const shouldIgnoreResize = createMainSizeStableResizeGuard([
      viewportRef.current,
      sliderContainer.current,
    ]);

    const ro = new ResizeObserver((entries) => {
      if (autoHeight && shouldIgnoreResize(entries)) return;
      measureAndPosition();
    });

    if (viewportRef.current) {
      ro.observe(viewportRef.current);
    }

    if (sliderContainer.current) {
      ro.observe(sliderContainer.current);
    }

    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    vv?.addEventListener("resize", measureAndPosition);

    window.addEventListener("resize", measureAndPosition, { passive: true });

    measureAndPosition();

    return () => {
      ro.disconnect();
      vv?.removeEventListener("resize", measureAndPosition);
      window.removeEventListener("resize", measureAndPosition);
    };
  }, [
    cellCount,
    clonedChildren,
    visibleImages,
    cellsPerSlide,
    gap,
    wrap,
    loop,
    AX,
    isRtl,
    autoHeight,
  ]);

  useEffect(() => {
    if (isReady) return;

    const imagesOk = lazyLoad?.enabled ? true : (sliderImagesReady ?? true);
    const autoHeightOk = !autoHeight || autoHeightReady;
    if (!engineReady || !imagesOk || !autoHeightOk) return;

    setIsReady(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lazyLoad, sliderImagesReady, engineReady, isReady, autoHeight, autoHeightReady]);

  useEffect(() => {
    if (!isReady) return;

    const nodes = getOriginalNodes();
    readySubs.current.forEach((fn) => fn(nodes));
    readyResolvers.current.splice(0).forEach((resolve) => resolve(nodes));
  }, [isReady]);

  useLayoutEffect(() => {
    if (
      !slider.current ||
      cells.current.length === 0 ||
      sliderWidth.current === 0 ||
      !slides.current ||
      !slides.current[0] ||
      !slides.current[0].cells[0]?.element
    ) return;

    const containerSize = getViewportMainSize();
    if (containerSize <= 0) return;

    if (!wrap && sliderWidth.current <= containerSize) {
      trackCenterOffsetRef.current = Math.round((containerSize - sliderWidth.current) / 2);
    } else {
      trackCenterOffsetRef.current = 0;
    }

    positionSlider(offsetLocationRef.current?.get() ?? xRef.current);
    updateControlsImperatively();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slidesState, wrap]);

  useEffect(() => {
    const containerEl = slider.current
    if (!containerEl) return

    let canceled = false

    let retryTimer: number | null = null
    let tries = 0
    const MAX_TRIES = 5

    function retry() {
      if (canceled) return
      if (tries++ >= MAX_TRIES) return
      if (retryTimer != null) window.clearTimeout(retryTimer)
      retryTimer = window.setTimeout(() => {
        buildPages()
      }, 0)
    }

    function buildPages() {
      if (canceled || !containerEl) return

      const clonesBefore = wrap ? visibleImages : 0
      const clonesAfter = clonesBefore
      const allEls = Array.from(containerEl.children) as HTMLElement[]
      const originals = allEls.slice(clonesBefore, allEls.length - clonesAfter)
      const idxMap = new Map<HTMLElement, number>(originals.map((el, i) => [el, i]))
      const L = layoutRef.current
      if (!L || !L.originals?.length) {
        retry()
        return
      }
      if (originals.length !== L.originals.length) {
        retry()
        return
      }

      const data = L.originals
      const cw = L.cw
      const allowCenteredOverflow = centerAlign && !wrap

      const pages: { els: HTMLElement[]; target: number }[] = []
      let i = 0

      const resolvedGroupCells = resolveSliderGroupCells({
        total: data.length,
        groupCells,
        cellsPerSlide,
      })

      if (resolvedGroupCells.enabled) {
        while (i < data.length) {
          const startLeft = data[i]?.start ?? 0
          let j = i

          if (resolvedGroupCells.fixedCount != null) {
            j = Math.min(data.length, i + resolvedGroupCells.fixedCount)
          } else {
            const viewRight = startLeft + cw
            const EPS = 0.5

            while (j < data.length && (data[j]?.end ?? 0) <= viewRight + EPS) j++
            if (j === i) j++
          }

          const slice = data.slice(i, j).map((d) => d.el)
          const isLast = j >= data.length

          let target = startLeft
          if (isLast && !wrap && !allowCenteredOverflow) {
            target = Math.max(0, (sliderWidth.current || 0) - cw)
          }
          if (i === 0) target = 0

          pages.push({ els: slice, target })
          i = j
        }
      } else {
        const maxTarget = Math.max(0, (sliderWidth.current || 0) - cw)
        const EPS = 0.5

        if (wrap || allowCenteredOverflow) {
          data.forEach((d, idx) => {
            const t = idx === 0 ? 0 : d.start
            if (!pages.length || Math.abs(t - pages[pages.length - 1].target) > EPS) {
              pages.push({ els: [d.el], target: t })
            }
          })
        } else {
          for (let idx = 0; idx < data.length; idx++) {
            const d = data[idx]
            let t = idx === 0 ? 0 : d.start
            t = Math.min(t, maxTarget)

            if (!pages.length || Math.abs(t - pages[pages.length - 1].target) > EPS) {
              pages.push({ els: [d.el], target: t })
            }

            if (Math.abs(t - maxTarget) <= EPS) break
          }

          const winStart = maxTarget - EPS
          const winEnd = maxTarget + cw + EPS

          const lastEls = data
            .filter((d) => d.start < winEnd && d.end > winStart)
            .map((d) => d.el)

          if (lastEls.length) {
            const lastT = pages[pages.length - 1]?.target ?? -1
            if (Math.abs(lastT - maxTarget) > EPS) {
              pages.push({ els: lastEls, target: maxTarget })
            } else {
              const uniq = new Set(pages[pages.length - 1].els.concat(lastEls))
              pages[pages.length - 1].els = Array.from(uniq)
            }
          } else {
            let safeIdx = -1
            for (let i = data.length - 1; i >= 0; i--) {
              if (data[i].start <= maxTarget + EPS) {
                safeIdx = i
                break
              }
            }
            const fallback = data[Math.max(0, safeIdx)]
            if (fallback) {
              const lastT = pages[pages.length - 1]?.target ?? -1
              if (Math.abs(lastT - maxTarget) > EPS) {
                pages.push({ els: [fallback.el], target: maxTarget })
              }
            }
          }
        }
      }

      const newSlides = pages.map((page) => {
        let alignSize = 0

        if (resolvedGroupCells.enabled) {
          let minStart = Infinity
          let maxEnd = -Infinity

          for (const el of page.els) {
            const dataIdx = idxMap.get(el)
            if (dataIdx == null) continue

            const cell = data[dataIdx]
            if (!cell) continue

            minStart = Math.min(minStart, cell.start)
            maxEnd = Math.max(maxEnd, cell.end)
          }

          if (Number.isFinite(minStart) && Number.isFinite(maxEnd) && maxEnd > minStart) {
            alignSize = maxEnd - minStart
          }
        }

        if (alignSize <= 0) {
          alignSize = getLayoutMainSize(page.els[0] ?? null)
        }

        return {
          target: page.target,
          alignSize,
          cells: page.els.map((el) => ({
            element: el,
            index: idxMap.get(el)!,
          })),
        }
      })

      const hasNaN = newSlides.some((s) => Number.isNaN(s.target))
      const unstable = hasNaN || (wrap && newSlides.length === 1)
      if (unstable) {
        retry()
        return
      }

      const baseSpan = data[data.length - 1]?.end ?? 0
      const nextWrap = shouldEnableSliderLoop({
        loop,
        itemCount: newSlides.length,
        span: baseSpan,
        viewport: cw,
      })
      if (nextWrap !== wrap) {
        setWrapSafe(nextWrap)
        return
      }

      loopRenderOffsetRef.current =
        wrap && originals.length
          ? measureLoopRenderOffset(containerEl, originals[0] ?? null)
          : 0

      isWrapping.current = nextWrap

      slides.current = newSlides
      setSlidesState(newSlides)

      if (translateRef.current) {
        syncMotionGeometry({
          reanchor: shouldReanchorOnResize,
        })
      }

      setLayoutReady(true)

      const map: number[] = []
      newSlides.forEach((s, slideIdx) => {
        s.cells.forEach((c) => {
          map[c.index] = slideIdx
        })
      })
      cellToSlideRef.current = map

      window.setTimeout(() => {
        if (canceled) return
        const nodes = getOriginalNodes()
        if (nodes.length) {
          builtOnceRef.current = true
          slideBuildSubs.current.forEach((fn) => fn(nodes))
        }
      }, 0)
    }

    rebuildPagesRef.current = buildPages
    buildPages()

    return () => {
      canceled = true
      if (rebuildPagesRef.current === buildPages) {
        rebuildPagesRef.current = null
      }
      if (rebuildPagesRafRef.current != null) {
        cancelAnimationFrame(rebuildPagesRafRef.current)
        rebuildPagesRafRef.current = null
      }
      if (retryTimer != null) window.clearTimeout(retryTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cellCount, childrenKey, clonedChildren, visibleImages, cellsPerSlide, groupCells, wrap]);

  useEffect(() => {
    if (!lazyLoad?.enabled) return;
    if (!layoutReady) return;
    const root = viewportRef.current;
    const track = slider.current;
    if (!root || !track) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const ent of entries) {
          const slideEl = ent.target as HTMLElement;

          if (slideEl.getAttribute('data-rmg-lazyloaded') === 'true') {
            io.unobserve(slideEl);
            continue;
          }

          if (ent.isIntersecting && ent.intersectionRatio >= 0.25) {
            const idxAttr = slideEl.getAttribute("data-rmg-idx");
            const idx = idxAttr != null ? parseInt(idxAttr, 10) : NaN;

            if (Number.isFinite(idx)) {
              void revealCanonicalSlides(track, idx, revealedCanonicalIndicesRef.current);
            } else {
              if (slideEl.getAttribute("data-rmg-lazyloading") !== "true") {
                slideEl.setAttribute("data-rmg-lazyloading", "true");
                void revealSlide(slideEl, revealedCanonicalIndicesRef.current).finally(() => {
                  slideEl.removeAttribute("data-rmg-lazyloading");
                });
              }
            }

            io.unobserve(slideEl);
          }
        }
      },
      {
        root: root,
        rootMargin: '0px',
        threshold: [0, 0.25, 0.5, 0.6, 0.75, 1],
      }
    );

    const slidesToObserve = Array.from(track.children).filter((el) =>
      (el as HTMLElement).hasAttribute('data-rmg-lazyload')
    );
    slidesToObserve.forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, [lazyLoad, clonedChildren, wrap, AX.main, layoutReady]);

  useEffect(() => {
    const track = slider.current;
    if (!track) return;
    if (!expandableImageRefs) return;

    const slideEls = Array.from(
      track.querySelectorAll<HTMLElement>(':scope > [data-rmg-slide="true"]')
    );

    if (!slideEls.length) return;

    const arr = new Array<HTMLImageElement | null>(slideEls.length).fill(null);

    slideEls.forEach((slide, index) => {
      const img = slide.querySelector<HTMLImageElement>("img");
      if (img) {
        arr[index] = img;
        return;
      }
    });

    expandableImageRefs.current = arr;

  }, [clonedChildren.length, wrap, visibleImages, childrenKey]);

  useEffect(() => {
    return () => {
      if (expandableImageRefs) expandableImageRefs.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useInViewOnce(
    layoutReady && engineReady && isReady && isMeasured,
    sliderContainer,
    () => setInView(true),
    { threshold: 0.2 }
  );

  const programNavRef = useRef(false);

  function scrollToIndex(
    requested: number,
    opts: { jump?: boolean; direction?: number; programmatic?: boolean } = {}
  ) {
    const { jump = false, direction, programmatic = false } = opts;

    const indexCurrent = indexCurrentRef.current;
    if (!scrollToRef.current || !bodyRef.current || !indexCurrent) return;

    if (programmatic) programNavRef.current = true;

    const targetIndex = indexCurrent.clone().set(requested).get();
    const indexMode: IndexMode = jump ? "instant" : "animated";

    commitIndex(targetIndex, indexMode)

    if (jump) bodyRef.current.useDuration(0);
    else bodyRef.current.useBaseDuration().useBaseFriction();

    const dir = typeof direction === "number" ? direction : 0;
    scrollToRef.current.index(targetIndex, dir);

    if (!bodyRef.current.duration()) {
      const settled = offsetLocationRef.current?.get() ?? targetRef.current?.get() ?? 0;
      xRef.current = settled;
      syncProgressUiInFrame();
      if (parallax) tweenParallax();
      if (scaleEffect) applyPairScaleTween();
      if (fadeEffect) applyFadeTween();
      updateControlsImperatively();
      programNavRef.current = false;
    }
  }

  function previous() {
    const scrollTo = scrollToRef.current;
    const body = bodyRef.current;
    const indexCur = indexCurrentRef.current;
    const len = slides.current?.length ?? 0;
    if (!scrollTo || !body || !indexCur || !len) return;

    const cur = indexCur.get();
    const target = wrap ? ((cur - 1) % len + len) % len : clampIndex(cur - 1, len);

    body.useBaseDuration().useBaseFriction();
    scrollToIndex(target, { direction: 1, programmatic: true });
    const ch: any = indexChannel;

    ch.emitBasePointerDown?.();
  }

  function next() {
    const scrollTo = scrollToRef.current;
    const body = bodyRef.current;
    const indexCur = indexCurrentRef.current;
    const len = slides.current?.length ?? 0;
    if (!scrollTo || !body || !indexCur || !len) return;

    const cur = indexCur.get();
    const target = wrap ? ((cur + 1) % len + len) % len : clampIndex(cur + 1, len);

    body.useBaseDuration().useBaseFriction();
    scrollToIndex(target, { direction: -1, programmatic: true });
    const ch: any = indexChannel;

    ch.emitBasePointerDown?.();
  }

  function indexFromX(loc: number) {
    const x = -loc
    const targets = getSnapTargets()
    const W = totalWidth()
    if (!targets.length) return 0
    let best = 0
    let min = Infinity
    for (let i = 0; i < targets.length; i++) {
      const base = targets[i]
      const candidates = !W || !wrap ? [base] : [base, base + W, base - W]
      for (const c of candidates) {
        const d = Math.abs(c - x)
        if (d < min) {
          min = d
          best = i
        }
      }
    }
    return best
  }

  function positionSlider(loc?: number) {
    const x = loc ?? xRef.current
    const renderOffset = wrap ? loopRenderOffsetRef.current : 0;
    translateRef.current?.to((x + trackCenterOffsetRef.current - renderOffset) * sign);
  }

  function updateArrowsOnly() {
    const setArrow = (el: HTMLElement | null, disabled: boolean) => {
      if (!el) return;
      el.style.cursor = disabled ? "default" : "pointer";
      el.style.opacity = disabled ? "0.35" : "1";
      el.setAttribute("aria-disabled", disabled ? "true" : "false");
    };

    if (wrap) {
      setArrow(prevButtonRef.current, false);
      setArrow(nextButtonRef.current, false);
      return;
    }

    const lim = limitRef.current;
    if (!lim) return;

    const x = offsetLocationRef.current?.get() ?? xRef.current ?? 0;
    const EPS = 0.75;

    const atStart = x >= lim.max - EPS;
    const atEnd = x <= lim.min + EPS;

    const prevDisabled = isRtl ? atEnd : atStart;
    const nextDisabled = isRtl ? atStart : atEnd;

    setArrow(prevButtonRef.current, prevDisabled);
    setArrow(nextButtonRef.current, nextDisabled);
  }

  function updateDotsOnly(prev: number, next: number) {
    const prevEl = dotRefs.current[prev];
    if (prevEl) {
      prevEl.classList.remove(styles.active);
      prevEl.classList.add(styles.inactive);
    }
    const nextEl = dotRefs.current[next];
    if (nextEl) {
      nextEl.classList.add(styles.active);
      nextEl.classList.remove(styles.inactive);
    }
  }

  function commitIndex(nextIdx: number, mode: IndexMode) {
    const prev = lastEmittedIndexRef.current;
    if (prev === nextIdx) return;
    lastEmittedIndexRef.current = nextIdx;

    indexCurrentRef.current?.set(nextIdx);
    selectedIndex.current = nextIdx;
    indexChannel.set(nextIdx, mode);

    updateDotsOnly(prev, nextIdx);

    if (normalizedLazy.enabled) {
      preloadCanonicalIndex(nextIdx);
    }

    queueAutoHeightMeasure(nextIdx, {
      animate: mode === "animated",
    });
  }

  function updateActiveIndexFromX(loc: number) {
    if (programNavRef.current) return;

    const idxFromLoc = indexFromX(loc);
    if (idxFromLoc === selectedIndex.current) return;

    commitIndex(idxFromLoc, 'animated');
  }

  function previousFromUi() {
    beginUiNavWheelTakeover();
    const len = slides.current?.length ?? 0;
    if (!len) {
      previous();
      return;
    }
    const cur = indexCurrentRef.current?.get() ?? selectedIndex.current ?? 0;
    const target = wrap ? ((cur - 1) % len + len) % len : clampIndex(cur - 1, len);

    if (startControlsCrossfadeToIndex(target)) {
      const ch: any = indexChannel;
      ch.emitBasePointerDown?.();
      return;
    }

    previous();
  }

  function nextFromUi() {
    beginUiNavWheelTakeover();
    const len = slides.current?.length ?? 0;
    if (!len) {
      next();
      return;
    }
    const cur = indexCurrentRef.current?.get() ?? selectedIndex.current ?? 0;
    const target = wrap ? ((cur + 1) % len + len) % len : clampIndex(cur + 1, len);

    if (startControlsCrossfadeToIndex(target)) {
      const ch: any = indexChannel;
      ch.emitBasePointerDown?.();
      return;
    }

    next();
  }

  function scrollToProgressFromUi(progress: number) {
    const scrollTo = scrollToRef.current;
    const body = bodyRef.current;
    const limit = scrollLimitRef.current;
    if (!scrollTo || !body || !limit) return;

    const span = limit.max - limit.min;
    if (span <= 0) {
      syncProgressUiInFrame();
      return;
    }

    beginUiNavWheelTakeover();

    animRef.current?.stop();
    isAnimatingRef.current = false;
    programNavRef.current = false;

    const nextProgress = Math.max(0, Math.min(1, progress));
    const currentOffset =
      offsetLocationRef.current?.get() ??
      targetRef.current?.get() ??
      limit.max;
    const currentNormalized = wrap
      ? limit.removeOffset(currentOffset)
      : limit.constrain(currentOffset);
    const targetOffset = limit.max - nextProgress * span;
    const distance = targetOffset - currentNormalized;

    body.useDuration(0).useFriction(1).sync().resetVelocity();
    scrollTo.distance(distance, false);

    const settled = offsetLocationRef.current?.get() ?? targetRef.current?.get() ?? currentOffset;
    xRef.current = settled;

    syncProgressUiInFrame();
    if (parallax) tweenParallax();
    if (scaleEffect) applyPairScaleTween();
    if (fadeEffect) applyFadeTween();
    updateControlsImperatively();

    const ch: any = indexChannel;
    ch.emitBasePointerDown?.();
  }

  function onScrollBarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextProgress = Number.parseFloat(event.target.value);
    if (!Number.isFinite(nextProgress)) return;
    scrollToProgressFromUi(nextProgress);
  }

  useEffect(() => {
    const ch: any = indexChannel;
    const len = () => slides.current?.length ?? 0;

    const handle = (ev: any) => {
      const L = len();
      if (!L) return;

      const cur = selectedIndex.current;
      const signed = (n: number) => (isRtl ? -n : n);

      if (ev.type === "set") {
        const nextC = wrap ? ((ev.index % L) + L) % L : clampIndex(ev.index, L);
        if (nextC === cur) return;

        const wantsCrossfade =
          ev?.meta?.source === "thumbnail" &&
          ev?.meta?.transition === "crossfade" &&
          ev.mode !== "instant";

        if (wantsCrossfade) {
          goToIndex(nextC, {
            fromUi: true,
            preferCrossfade: true,
            crossfade: {
              durationMs: ev?.meta?.crossfade?.durationMs,
              easing: ev?.meta?.crossfade?.easing,
            },
          });
          return;
        }

        scrollToIndex(nextC, {
          jump: ev.mode !== "animated",
          programmatic: true,
        });
        return;
      }

      if (ev.type === "bump") {
        const delta = signed(ev.delta | 0);
        if (!delta) return;

        if (!wrap) {
          const bounded = clampIndex(cur + delta, L);
          if (bounded === cur) return;
          scrollToIndex(bounded, {
            jump: ev.mode !== "animated",
            programmatic: true,
          });
        } else {
          const targetC = ((cur + delta) % L + L) % L;
          scrollToIndex(targetC, {
            jump: ev.mode !== "animated",
            programmatic: true,
          });
        }
        return;
      }

      if (typeof ev.index === "number") {
        const nextC = wrap ? ((ev.index % L) + L) % L : clampIndex(ev.index, L);
        if (nextC !== cur) {
          scrollToIndex(nextC, {
            jump: ev.mode === "instant",
            programmatic: true,
          });
        }
      }
    };

    if (typeof ch.onEvent === "function") {
      return ch.onEvent(handle);
    } else {
      return ch.subscribe(() => {
        const { index, mode } = ch.get();
        handle({ type: "set", index, mode });
      });
    }
  }, [indexChannel, wrap, isRtl]);

  function isYouTubeVideoEvent(evt: Event): boolean {
    const target = evt.target as HTMLElement | null;
    if (!target) return false;

    const plyrRoot = target.closest('[data-rmg-plyr="true"]') as HTMLElement | null;
    if (!plyrRoot) return false;

    return plyrRoot.getAttribute('data-rmg-plyr-provider') === 'youtube';
  }

  const {
    wheelLockMs: WHEEL_LOCK_MS,
    lockWheelFor,
    unlockWheelNow,
    markWheelSeen,
    isWheelLocked,
  } = useWheelLock();
  const UI_NAV_WHEEL_LOCK_MS = 300;

  function beginUiNavWheelTakeover() {
    unlockWheelNow();
    lockWheelFor(UI_NAV_WHEEL_LOCK_MS);
  }

  useEffect(() => {
    const root = sliderContainer.current
    const track = slider.current
    if (
      !root ||
      !track ||
      !slides.current?.length ||
      !layoutReady ||
      !isMeasured ||
      sliderWidth.current === 0
    ) {
      return;
    }

    const location        = Vector1D(0);
    const previousLocation = Vector1D(0);
    const offsetLocation  = Vector1D(0);
    const target          = Vector1D(0);

    locationRef.current        = location;
    previousLocationRef.current = previousLocation;
    offsetLocationRef.current  = offsetLocation;
    targetRef.current          = target;

    const W = sliderWidth.current || 0

    const len = slides.current.length || 1
    const requestedInitialStart =
      hasInitialIndexRef.current && !hasAppliedInitialIndexRef.current
        ? initialSelectedIndexRef.current
        : undefined;
    const requestedStart =
      (hasExternalIndexChannel ? indexChannel.get().index : undefined) ??
      requestedInitialStart ??
      selectedIndex.current ??
      0
    const startIdx = clampIndex(requestedStart, len)
    selectedIndex.current = startIdx
    hasAppliedInitialIndexRef.current = true
    const counterMax = len - 1
    const startIndex = startIdx

    const indexCurrent = Counter(counterMax, startIndex, true)
    const indexPrevious = Counter(counterMax, startIndex, true)

    indexCurrentRef.current = indexCurrent
    indexPreviousRef.current = indexPrevious

    const scrollSnaps = computeCurrentScrollSnaps()
    const { minSnap, maxSnap } = applyScrollMetrics(scrollSnaps)

    const initialSnap = scrollSnaps[startIdx] ?? 0;

    location.set(initialSnap);
    previousLocation.set(initialSnap);
    offsetLocation.set(initialSnap);
    target.set(initialSnap);
    xRef.current = initialSnap;

    translateRef.current = Translate(track, AX);
    positionSlider(initialSnap);

    commitIndex(startIdx, 'instant');

    function scrollTo(target: BaseTarget): void {
      const indexCurrent = indexCurrentRef.current
      const indexPrevious = indexPreviousRef.current
      if (!indexCurrent || !indexPrevious) return

      const distanceDiff = target.distance
      const indexDiff = target.index !== indexCurrent.get()

      targetRef.current!.add(distanceDiff)

      if (distanceDiff) {
        if (bodyRef.current!.duration()) {
          isAnimatingRef.current = true;
          animRef.current!.start()
        } else {
          bodyRef.current!.seek()
          const settled = targetRef.current!.get()
          offsetLocationRef.current?.set(settled)
          xRef.current = settled
          positionSlider(settled)
        }
      }

      if (indexDiff) {
        indexPrevious.set(indexCurrent.get())
        indexCurrent.set(target.index)

        const idx = indexCurrent.get()
        selectedIndex.current = idx

        const mode = bodyRef.current?.duration() ? 'animated' : 'instant'
        indexChannel.set(idx, mode)
      }
    }

    const baseScrollTo: BaseScrollTo = {
      distance(n, snap) {
        const st = scrollTargetRef.current
        if (!st) return
        const target = st.byDistance(n, snap)
        scrollTo(target)
      },
      index(n, direction) {
        const st = scrollTargetRef.current
        const indexCurrent = indexCurrentRef.current
        if (!st || !indexCurrent) return

        const targetIndex = indexCurrent.clone().set(n)
        const target = st.byIndex(targetIndex.get(), direction)

        scrollTo(target)
      },
    }

    scrollToRef.current = baseScrollTo

    const body = ScrollBody(location, offsetLocation, previousLocation, target, selectDuration, sliderFriction)
    bodyRef.current = body
    syncProgressUiInFrame();

    if (!wrap) {
      const cw = getViewportMainSize();
      if (cw <= 0) return;
      limitRef.current = Limit(
        Number.isFinite(minSnap) ? minSnap : 0,
        Number.isFinite(maxSnap) ? maxSnap : 0
      )

      povRef.current    = PercentOfView(cw)
      boundsRef.current = ScrollBounds(
        limitRef.current,
        locationRef.current!,
        targetRef.current!,
        bodyRef.current!,
        povRef.current,
        selectDuration
      )
    } else {
      limitRef.current = null
      boundsRef.current = null
      povRef.current = null
    }

    const anim = Animations(
      document,
      window as WindowType,
      () => {
        if (!wrap) {
          boundsRef.current?.constrain(pointerDownRef.current)
        }

        bodyRef.current?.seek()

        if (wrap && (sliderWidth.current || 0) > 0) {
          const body = bodyRef.current!
          const dir = body.direction() || Math.sign(targetRef.current!.get() - locationRef.current!.get()) || 0
          looperRef.current?.loop(dir)
        }

        xRef.current = locationRef.current!.get()
      },
      (alpha) => {
        const body = bodyRef.current
        const shouldSettle = body ? body.settled() : true
        const recoveringOob = !wrap && (boundsRef.current?.reached() ?? false)
        const idle = shouldSettle && !pointerDownRef.current && !recoveringOob
        if (idle) {
          animRef.current?.stop()
          isAnimatingRef.current = false
          programNavRef.current = false
        }
        const cur = locationRef.current!.get()
        const prev = previousLocationRef.current!.get()
        let loc = cur * alpha + prev * (1 - alpha)
        const rebaseShift = rebaseVideoCloneSnapshotVectorsNearOrigin(loc)
        if (rebaseShift) loc += rebaseShift
        offsetLocationRef.current!.set(loc)
        xRef.current = loc
        positionSlider()
        if (scaleEffect) applyPairScaleTween()
        if (fadeEffect) applyFadeTween();
        syncProgressUiInFrame();
        if (parallax) tweenParallax();
        updateArrowsOnly()
        updateActiveIndexFromX(loc)
      }
    )
    animRef.current = anim
    anim.init()

    const dragStore = EventStore()
    const moveStore = EventStore()
    const tracker = DragTracker(AX.main, window as WindowType);

    let isMouse = false
    let startMain = 0
    let startCross = 0
    let preventScroll = false
    const freeBoost = { mouse: 500, touch: 600 }

    function addDragEvents() {
      const node: any = isMouse ? document : root
      moveStore
        .add(node, 'touchmove', onMove as any)
        .add(node, 'touchend', onUp as any)
        .add(node, 'mousemove', onMove as any, { passive: false })
        .add(node, 'mouseup', onUp as any)
    }

    function forceBoost(rawForce: number) {
      const type = isMouse ? 'mouse' : 'touch'
      return rawForce * (freeBoost[type as 'mouse' | 'touch'])
    }

    function onDown(evt: PointerEvent) {
      const targetEl = evt.target as HTMLElement;
      if (
        isPlyrControlsEl(targetEl) &&
        !targetEl.closest('.plyr__control--overlaid')
      ) {
        return;
      }
      const hit = (evt.target as Node)

      if (prevButtonRef.current?.contains(hit)) return
      if (nextButtonRef.current?.contains(hit)) return
      const dotIndex = dotRefs.current.findIndex((dot) => dot?.contains(hit))
      if (dotIndex >= 0) return
      if (dotsContainerRef.current?.contains(hit)) return
      if (scrollbarRef.current?.contains(hit)) return

      const isMouseEvt = isMouseEvent(evt as any, window as any)
      isMouse = isMouseEvt
      if (isMouseEvt && (evt as MouseEvent).button !== 0) return

      if (crossfadeBusyRef.current) {
        finishCrossfade();
      }

      setDragCursor(true);

      const ch: any = indexChannel;

      ch.emitBasePointerDown?.();

      lockWheelFor(WHEEL_LOCK_MS);

      pointerDownRef.current = true
      isPointerDown.current = true
      isScrolling.current = false
      isClick.current = true

      programNavRef.current = false;

      dragStartIndexRef.current = selectedIndex.current || 0
      dragStartLocationRef.current = targetRef.current?.get() ?? locationRef.current?.get() ?? 0
      dragDisplacementRef.current = 0

      tracker.pointerDown(evt as any)
      startMain  = tracker.readPoint(evt as any, AX.main)
      startCross = tracker.readPoint(evt as any, AX.cross)

      if (canUseCrossfadeDrag()) {
        finishCrossfade();
        jumpTrackToIndexInstant(selectedIndex.current);
      } else {
        bodyRef.current!.useFriction(0).useDuration(0)
        targetRef.current!.set(locationRef.current!.get())
      }

      addDragEvents()
      if (!canUseCrossfadeDrag()) {
        animRef.current?.start()
      }
    }

    function onMove(evt: PointerEvent) {
      const isTouchEvt = !isMouseEvent(evt as any, window as any)
      if (isTouchEvt && (evt as any).touches?.length >= 2) return onUp(evt)

      if (pointerDownRef.current && activePointerIdRef.current != null) setDragCursor(true);

      const lastMain  = tracker.readPoint(evt as any, AX.main)
      const lastCross = tracker.readPoint(evt as any, AX.cross)
      const diffMain  = Math.abs(lastMain  - startMain)
      const diffCross = Math.abs(lastCross - startCross)

      if (diffMain > 5 || diffCross > 5) isClick.current = false

      if (!preventScroll && !isMouse) {
        if (!('cancelable' in evt) || !(evt as any).cancelable) return onUp(evt)
        preventScroll = diffMain > diffCross
        if (!preventScroll) return onUp(evt)
      }

      const { dx, dy } = tracker.pointerMove(evt as any)
      const deltaMain = (AX.main === 'x' ? dx : dy) * sign

      previousDragX.current = dragX.current;
      dragX.current = lastMain * sign

      sliderVelocity.current = deltaMain;
      dragMoveTime.current = performance.now();

      const totalDeltaMain = (lastMain - startMain) * sign;
      dragDisplacementRef.current = totalDeltaMain;

      if (canUseCrossfadeDrag()) {
        isScrolling.current = Math.abs(totalDeltaMain) > 0.5;
        updateDragCrossfade(totalDeltaMain);
        if ((evt as any).cancelable) evt.preventDefault?.()
        return;
      }

      bodyRef.current!.useFriction(0.3).useDuration(0.75);
      targetRef.current!.add(deltaMain);

      animRef.current?.start()
      if ((evt as any).cancelable) evt.preventDefault?.()
    }

    function onUp(evt: PointerEvent) {
      isPointerDown.current = false
      preventScroll = false
      pointerDownRef.current = false
      moveStore.clear()

      setDragCursor(false);

      unlockWheelNow();

      lockWheelFor(300);

      if (isClick.current) {
        scrollToIndex(selectedIndex.current)
        const clickedVideo = clickedVideoSurface(evt);
        if (clickedVideo != null && (clickedVideo.isClone || !isYouTubeVideoEvent(evt))) {

          if (clickedVideo.isClone) {
            armCloneToggleOnVisibility(clickedVideo.canonicalIndex);
          } else {
            snapToIndex(clickedVideo.canonicalIndex);
          }
          return;
        }
      }

      autoScrollPauseUntil.current = performance.now() + autoScrollPause;

      if (canUseCrossfadeDrag()) {
        const end = tracker.pointerUp(evt as any)
        let rawForce = (AX.main === 'x' ? end.fx : end.fy)

        if (isRtl) rawForce = -rawForce

        isScrolling.current = false
        settleDragCrossfade(rawForce)
        return
      }

      if (freeScroll === false) {
        const end = tracker.pointerUp(evt as any)
        let rawForce = (AX.main === 'x' ? end.fx : end.fy)

        if (isRtl) rawForce = -rawForce

        const isMouseEvt = isMouseEvent(evt as any, window as any)
        const snapForceBoost = { mouse: 300, touch: 400 }
        const boost = snapForceBoost[isMouseEvt ? 'mouse' : 'touch']

        const boostedForce = rawForce * boost

        const baseScrollTarget = scrollTargetRef.current
        const baseScrollTo = scrollToRef.current
        const body = bodyRef.current

        if (!baseScrollTarget || !baseScrollTo || !body) {
          return
        }

        const releaseScrollTarget = baseScrollTarget

        function allowedForce(force: number): number {
          const currentPosition =
            targetRef.current?.get() ?? locationRef.current?.get() ?? dragStartLocationRef.current

          return resolveSliderReleaseSnapForce({
            force,
            fallbackDirection:
              dragDisplacementRef.current ||
              currentPosition - dragStartLocationRef.current,
            slideCount: slides.current.length || 1,
            currentIndex: selectedIndex.current || 0,
            dragStartIndex: dragStartIndexRef.current,
            wrap,
            skipSnaps,
            strictSnaps,
            scrollTarget: releaseScrollTarget,
          })
        }

        const isOutOfBounds = boundsRef.current?.passed()

        const force = allowedForce(boostedForce)

        const snapTarget = baseScrollTarget.byDistance(force, true);
        commitIndex(snapTarget.index, body.duration() ? 'animated' : 'instant');

        const baseFriction = sliderFriction
        const forceFactor = factorAbs(boostedForce, force)
        let speed = selectDuration
        if (isOutOfBounds) {
          speed = selectDuration + 5
        }
        const friction = baseFriction + forceFactor / 50

        body.useDuration(speed).useFriction(friction)
        baseScrollTo.distance(force, true)
      } else {
        const end = tracker.pointerUp(evt as any)
        const raw = (AX.main === 'x' ? end.fx : end.fy)
        const force = forceBoost(raw)
        const forceFactor = factorAbs(raw, force)
        let speed = freeScrollDuration
        const friction = sliderFriction + forceFactor / 50

        body.useDuration(speed).useFriction(friction)

        targetRef.current!.add(force)

        anim.start()
        isMouse = false
      }
    }

    dragStore
      .add(root, 'dragstart', (evt) => (evt as Event).preventDefault(), { passive: false })
      .add(root, 'touchstart', onDown as any)
      .add(root, 'mousedown', onDown as any, { passive: true })
      .add(root, 'touchcancel', onUp as any)
      .add(root, 'contextmenu', onUp as any)

    function onWheel(e: WheelEvent) {
      const now = markWheelSeen();

      if (pointerDownRef.current) {
        lockWheelFor(WHEEL_LOCK_MS);
        if ((e as any).cancelable) e.preventDefault?.();
        return;
      }

      if (isWheelLocked(now)) {
        lockWheelFor(40);
        if ((e as any).cancelable) e.preventDefault?.();
        return;
      }

      const trackEl = slider.current;
      if (!trackEl) return;

      const containerSize = getViewportMainSize();
      const contentSize = sliderWidth.current;
      const canScrollMain = contentSize > containerSize;

      const isMain =
        AX.main === "x"
          ? Math.abs(e.deltaX) > Math.abs(e.deltaY)
          : Math.abs(e.deltaY) >= Math.abs(e.deltaX);

      if (!isMain || !canScrollMain) return;
      if (scrollbarRef.current?.contains(e.target as Node)) return;

      if (canUseCrossfadeWheel()) {
        if ((e as any).cancelable) e.preventDefault?.();

        const signedWheelDelta = AX.wheelDelta(e) * sign;

        if (updateWheelCrossfade(signedWheelDelta, now)) {
          autoScrollPauseUntil.current = now + 100;
          const ch: any = indexChannel;
          ch.emitBasePointerDown?.();
        }
        return;
      }

      const ch: any = indexChannel;

      ch.emitBasePointerDown?.();

      programNavRef.current = false;

      autoScrollPauseUntil.current = now + 100;

      const cur = (offsetLocationRef.current?.get() ?? 0) - AX.wheelDelta(e) * sign;
      let next = cur;
      if (!wrap && limitRef.current) next = limitRef.current.constrain(cur);

      bodyRef.current?.useDuration(0).useFriction(1);

      targetRef.current?.set(next);
      xRef.current = next;

      positionSlider(next);
      updateActiveIndexFromX(next);

      animRef.current?.start();
      if ((e as any).cancelable) e.preventDefault?.();
    }

    root.addEventListener('wheel', onWheel as any, { passive: false })

    requestAnimationFrame(() => {
      if (!slider.current || !slides.current?.length) return;
      setEngineReady(true);
    });

    hasPositioned.current = true;

    return () => {
      dragStore.clear()
      moveStore.clear()
      root.removeEventListener('wheel', onWheel as any)
      animRef.current?.destroy()
      animRef.current = null
      looperRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    slidesState.length,
    wrap,
    cellsPerSlide,
    layoutReady,
    isMeasured,
  ]);

  const { tweenParallax } = useParallaxEffect({
    enabled: parallax,
    wrap,
    axisMain: AX.main,
    sliderRef: slider,
    sliderWidthRef: sliderWidth,
    offsetLocationRef,
    visibleImagesRef,
    slidesRef: slides,
    getCenterOffsetForIndex,
    slidesLen: slidesState.length,
    clonedLen: clonedChildren.length,
    isReady,
  });

  const { applyPairScaleTween } = useScaleEffect({
    enabled: scaleEffect,
    scaleAmount,
    wrap,
    sliderRef: slider,
    sliderWidthRef: sliderWidth,
    offsetLocationRef,
    slidesRef: slides,
    getCenterOffsetForIndex,
    slidesLen: slidesState.length,
    clonedLen: clonedChildren.length,
  });

  const { applyFadeTween } = useFadeEffect({
    enabled: fadeEffect,
    minOpacity: fadeMinOpacity,
    wrap,
    sliderRef: slider,
    sliderWidthRef: sliderWidth,
    offsetLocationRef,
    slidesRef: slides,
    getCenterOffsetForIndex,
    slidesLen: slidesState.length,
    clonedLen: clonedChildren.length,
  });

  function readMotionState() {
    return {
      location: locationRef.current?.get() ?? xRef.current ?? 0,
      previous: previousLocationRef.current?.get() ?? xRef.current ?? 0,
      offset: offsetLocationRef.current?.get() ?? xRef.current ?? 0,
      target: targetRef.current?.get() ?? xRef.current ?? 0,
      x: xRef.current ?? 0,
    };
  }

  function restoreMotionState(state: ReturnType<typeof readMotionState>) {
    locationRef.current?.set(state.location);
    previousLocationRef.current?.set(state.previous);
    offsetLocationRef.current?.set(state.offset);
    targetRef.current?.set(state.target);
    xRef.current = state.x;

    positionSlider(state.offset);
    if (parallax) tweenParallax();
    if (scaleEffect) applyPairScaleTween();
    if (fadeEffect) applyFadeTween();
  }

  function renderTrackAtLocation(loc: number) {
    locationRef.current?.set(loc);
    previousLocationRef.current?.set(loc);
    offsetLocationRef.current?.set(loc);
    targetRef.current?.set(loc);
    xRef.current = loc;

    positionSlider(loc);
    if (parallax) tweenParallax();
    if (scaleEffect) applyPairScaleTween();
    if (fadeEffect) applyFadeTween();
  }

  function cloneViewportSnapshot() {
    const viewport = viewportRef.current;
    if (!viewport) return null;

    const clone = viewport.cloneNode(true) as HTMLDivElement;
    clone.removeAttribute('data-rmg-part');
    clone.setAttribute('aria-hidden', 'true');
    clone.style.position = 'absolute';
    clone.style.inset = '0';
    clone.style.width = '100%';
    clone.style.height = '100%';
    clone.style.margin = '0';
    clone.style.pointerEvents = 'none';
    clone
      .querySelectorAll('[data-rmg-slider-crossfade-layer="true"]')
      .forEach((node) => node.remove());
    clone.querySelectorAll<HTMLElement>('[id]').forEach((node) => {
      node.removeAttribute('id');
    });
    return clone;
  }

  function captureViewportSnapshotForIndex(idx: number) {
    const state = readMotionState();
    const next = getSnapLocationForIndex(idx);

    renderTrackAtLocation(next);
    const snapshot = cloneViewportSnapshot();
    restoreMotionState(state);

    return snapshot;
  }

  function clearPendingCrossfadeWork() {
    if (crossfadeRaf1Ref.current != null) {
      cancelAnimationFrame(crossfadeRaf1Ref.current);
      crossfadeRaf1Ref.current = null;
    }
    if (crossfadeRaf2Ref.current != null) {
      cancelAnimationFrame(crossfadeRaf2Ref.current);
      crossfadeRaf2Ref.current = null;
    }
    if (crossfadeTimeoutRef.current != null) {
      window.clearTimeout(crossfadeTimeoutRef.current);
      crossfadeTimeoutRef.current = null;
    }
  }

  function clearCrossfadeSnapshots() {
    crossfadeSourceRef.current?.replaceChildren();
    crossfadeTargetRef.current?.replaceChildren();

    if (crossfadeLayerRef.current) {
      crossfadeLayerRef.current.style.opacity = '0';
      crossfadeLayerRef.current.style.visibility = 'hidden';
    }
  }

  function materializeCommittedCrossfadeTrack() {
    const committedIndex = crossfadeCommittedTrackIndexRef.current;
    if (committedIndex == null) return;

    crossfadeCommittedTrackIndexRef.current = null;
    jumpTrackToIndexInstant(committedIndex);
    updateControlsImperatively();
  }

  function finishCrossfade() {
    clearPendingCrossfadeWork();
    materializeCommittedCrossfadeTrack();
    crossfadeBusyRef.current = false;
    dragCrossfadeStateRef.current = null;
    wheelCrossfadeStateRef.current = null;
    crossfadeCommittedTrackIndexRef.current = null;
    clearCrossfadeSnapshots();
  }

  function setCrossfadeProgress(progress: number, transition = 'none') {
    const clamped = clamp01(progress);

    if (crossfadeLayerRef.current) {
      crossfadeLayerRef.current.style.opacity = '1';
      crossfadeLayerRef.current.style.visibility = 'visible';
    }

    if (crossfadeSourceRef.current) {
      crossfadeSourceRef.current.style.transition = transition;
      crossfadeSourceRef.current.style.opacity = String(1 - clamped);
    }

    if (crossfadeTargetRef.current) {
      crossfadeTargetRef.current.style.transition = transition;
      crossfadeTargetRef.current.style.opacity = String(clamped);
    }
  }

  function mountCrossfadeSnapshots(sourceSnapshot: HTMLElement, targetSnapshot: HTMLElement) {
    if (!crossfadeSourceRef.current || !crossfadeTargetRef.current) return false;

    crossfadeSourceRef.current.replaceChildren(sourceSnapshot);
    crossfadeTargetRef.current.replaceChildren(targetSnapshot);
    setCrossfadeProgress(0, 'none');
    return true;
  }

  function jumpTrackToIndexInstant(idx: number) {
    const next = getSnapLocationForIndex(idx);

    animRef.current?.stop();
    isAnimatingRef.current = false;

    renderTrackAtLocation(next);

    bodyRef.current?.useDuration(0).useFriction(1).sync().resetVelocity();
    syncProgressUiInFrame();
  }

  function jumpToIndexInstant(idx: number, mode: IndexMode = 'instant') {
    const normalizedIdx = clampIndex(idx, slides.current?.length ?? 0);
    const prev = selectedIndex.current;

    jumpTrackToIndexInstant(normalizedIdx);

    indexPreviousRef.current?.set(prev);
    commitIndex(normalizedIdx, mode);
    indexCurrentRef.current?.set(normalizedIdx);
    selectedIndex.current = normalizedIdx;
    updateControlsImperatively();
  }

  useLayoutEffect(() => {
    if (!isReady) return;
    const pending = pendingSetIndexRef.current;
    if (!pending) return;

    pendingSetIndexRef.current = null;
    jumpToIndexInstant(pending.index, pending.mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  function prepareCrossfadeSnapshots(targetIdx: number) {
    const sourceSnapshot = cloneViewportSnapshot();
    const targetSnapshot = captureViewportSnapshotForIndex(targetIdx);

    if (!sourceSnapshot || !targetSnapshot) return false;

    return mountCrossfadeSnapshots(sourceSnapshot, targetSnapshot);
  }

  function startControlsCrossfadeToIndex(
    requested: number,
    opts?: {
      enabled?: boolean;
      durationMs?: number;
      easing?: string;
    }
  ) {
    const len = slides.current?.length ?? 0;
    if (!len) return false;

    const nextIdx = wrap ? ((requested % len) + len) % len : clampIndex(requested, len);
    const fromIdx = wrap
      ? ((selectedIndex.current % len) + len) % len
      : clampIndex(selectedIndex.current, len);

    if ((opts?.enabled ?? crossfadeControls) && crossfadeBusyRef.current) {
      finishCrossfade();
    }

    if (
      !shouldStartSliderControlsCrossfade({
        enabled: opts?.enabled ?? crossfadeControls,
        busy: crossfadeBusyRef.current,
        fromIndex: fromIdx,
        toIndex: nextIdx,
      })
    ) {
      return false;
    }

    const durationMs = opts?.durationMs ?? resolvedCrossfadeDurationMs;
    const easing = opts?.easing ?? resolvedCrossfadeEasing;

    if (normalizedLazy.enabled) preloadCanonicalIndex(nextIdx);

    finishCrossfade();
    if (!prepareCrossfadeSnapshots(nextIdx)) return false;

    const id = ++crossfadeSeqRef.current;
    crossfadeBusyRef.current = true;
    jumpToIndexInstant(nextIdx, "animated");

    crossfadeRaf1Ref.current = requestAnimationFrame(() => {
      crossfadeRaf1Ref.current = null;
      if (crossfadeSeqRef.current !== id) return;

      crossfadeRaf2Ref.current = requestAnimationFrame(() => {
        crossfadeRaf2Ref.current = null;
        if (crossfadeSeqRef.current !== id) return;

        setCrossfadeProgress(1, `opacity ${durationMs}ms ${easing}`);

        crossfadeTimeoutRef.current = window.setTimeout(() => {
          if (crossfadeSeqRef.current !== id) return;
          finishCrossfade();
        }, durationMs + 48);
      });
    });

    return true;
  }

  function goToIndex(
    idx: number,
    opts: {
      preserveTiming?: boolean;
      fromUi?: boolean;
      preferCrossfade?: boolean;
      crossfade?: {
        durationMs?: number;
        easing?: string;
      };
    } = {}
  ) {
    const {
      preserveTiming = false,
      fromUi = false,
      preferCrossfade = false,
      crossfade,
    } = opts;

    if (!bodyRef.current || !targetRef.current) return;

    if (fromUi) {
      beginUiNavWheelTakeover();

      if (
        preferCrossfade &&
        startControlsCrossfadeToIndex(idx, {
          enabled: true,
          durationMs: crossfade?.durationMs,
          easing: crossfade?.easing,
        })
      ) {
        const ch: any = indexChannel;
        ch.emitBasePointerDown?.();
        return;
      }
    }

    if (!preserveTiming) bodyRef.current.useBaseDuration().useBaseFriction();
    scrollToIndex(idx, { programmatic: true });

    const ch: any = indexChannel;
    ch.emitBasePointerDown?.();
  }

  function canUseCrossfadeDrag() {
    return !!crossfadeDrag && freeScroll !== true && (slides.current?.length ?? 0) > 1;
  }

  function canUseCrossfadeWheel() {
    return !!resolvedCrossfadeWheel.enabled && freeScroll !== true && (slides.current?.length ?? 0) > 1;
  }

  function clearWheelCrossfadeSession() {
    wheelCrossfadeSessionRef.current = null;
  }

  function shouldAbsorbWheelCrossfadeSession(direction: 1 | -1, now: number) {
    const session = wheelCrossfadeSessionRef.current;
    if (!session) return false;

    const sameSession = shouldTreatSliderWheelAsSameSession({
      now,
      direction,
      sessionDirection: session.direction,
      lastEventTs: session.lastEventTs,
      sessionGapMs: resolvedCrossfadeWheel.sessionGapMs,
    });

    if (!sameSession) {
      clearWheelCrossfadeSession();
      return false;
    }

    session.lastEventTs = now;
    return true;
  }

  function armWheelCrossfadeSession(direction: 1 | -1, now: number) {
    wheelCrossfadeSessionRef.current = {
      direction,
      lastEventTs: now,
    };
  }

  function resetWheelCrossfadeAfterIndexChange(direction: 1 | -1, now: number) {
    wheelCrossfadeStateRef.current = null;
    armWheelCrossfadeSession(direction, now);
  }

  function completeWheelCrossfade(
    state: NonNullable<typeof wheelCrossfadeStateRef.current>,
    now: number
  ) {
    const id = ++crossfadeSeqRef.current;
    const durationMs = resolvedCrossfadeWheel.durationMs;

    resetWheelCrossfadeAfterIndexChange(state.direction, now);
    crossfadeBusyRef.current = true;

    commitIndex(state.targetIndex, 'animated');
    indexPreviousRef.current?.set(state.sourceIndex);
    indexCurrentRef.current?.set(state.targetIndex);
    selectedIndex.current = state.targetIndex;
    crossfadeCommittedTrackIndexRef.current = state.targetIndex;

    setCrossfadeProgress(
      1,
      `opacity ${durationMs}ms ${resolvedCrossfadeEasing}`
    );

    crossfadeTimeoutRef.current = window.setTimeout(() => {
      if (crossfadeSeqRef.current !== id) return;
      finishCrossfade();
    }, durationMs + 48);
  }

  function updateWheelCrossfade(signedWheelDelta: number, now: number) {
    if (!Number.isFinite(signedWheelDelta)) {
      return false;
    }

    const wheelDirection = (signedWheelDelta > 0 ? 1 : -1) as 1 | -1;
    if (shouldAbsorbWheelCrossfadeSession(wheelDirection, now)) {
      return true;
    }

    const len = slides.current?.length ?? 0;
    if (!len) return false;

    const sourceIndex = wrap
      ? ((selectedIndex.current % len) + len) % len
      : clampIndex(selectedIndex.current, len);
    const virtualDelta =
      signedWheelDelta * resolvedCrossfadeWheel.sensitivity;
    const existing = wheelCrossfadeStateRef.current;
    const accumulatedDelta =
      existing && existing.sourceIndex === sourceIndex
        ? existing.delta + virtualDelta
        : virtualDelta;
    const targetDirection = (accumulatedDelta > 0 ? 1 : -1) as 1 | -1;
    const targetIndex = resolveSliderWheelCrossfadeTarget({
      currentIndex: sourceIndex,
      delta: accumulatedDelta,
      slideCount: len,
      wrap,
    });

    if (targetIndex === sourceIndex) {
      if (Math.abs(accumulatedDelta) < 0.5) {
        finishCrossfade();
        return true;
      }

      return false;
    }

    if (normalizedLazy.enabled) preloadCanonicalIndex(targetIndex);

    const needsSnapshots =
      !existing ||
      existing.sourceIndex !== sourceIndex ||
      existing.targetIndex !== targetIndex;

    if (needsSnapshots) {
      finishCrossfade();

      if (!prepareCrossfadeSnapshots(targetIndex)) return false;
    } else if (crossfadeBusyRef.current && !wheelCrossfadeStateRef.current) {
      finishCrossfade();
    }

    const progress = resolveSliderWheelCrossfadeProgress({
      delta: accumulatedDelta,
      distance: Math.max(1, getViewportMainSize()),
    });
    const nextState = {
      sourceIndex,
      targetIndex,
      delta: accumulatedDelta,
      progress,
      direction: targetDirection,
    };

    crossfadeBusyRef.current = true;
    wheelCrossfadeStateRef.current = nextState;
    setCrossfadeProgress(progress, 'none');

    if (
      shouldCompleteSliderWheelCrossfade({
        progress,
        threshold: resolvedCrossfadeWheel.commitThreshold,
      })
    ) {
      completeWheelCrossfade(nextState, now);
    }

    return true;
  }

  function updateDragCrossfade(delta: number) {
    const len = slides.current?.length ?? 0;
    if (!len) return false;

    const sourceIndex = wrap
      ? ((selectedIndex.current % len) + len) % len
      : clampIndex(selectedIndex.current, len);
    const targetIndex = resolveSliderCrossfadeDragTarget({
      currentIndex: sourceIndex,
      delta,
      slideCount: len,
      wrap,
    });

    if (targetIndex === sourceIndex) {
      dragCrossfadeStateRef.current = null;
      finishCrossfade();
      return false;
    }

    if (normalizedLazy.enabled) preloadCanonicalIndex(targetIndex);

    const current = dragCrossfadeStateRef.current;
    const needsSnapshots =
      !current ||
      current.sourceIndex !== sourceIndex ||
      current.targetIndex !== targetIndex;

    if (needsSnapshots) {
      finishCrossfade();

      if (!prepareCrossfadeSnapshots(targetIndex)) return false;
    }

    const trackSize = Math.max(1, getViewportMainSize());
    const progress = clamp01(Math.abs(delta) / trackSize);

    crossfadeBusyRef.current = true;
    dragCrossfadeStateRef.current = {
      sourceIndex,
      targetIndex,
      progress,
      delta,
    };
    setCrossfadeProgress(progress, 'none');
    return true;
  }

  function settleDragCrossfade(force: number) {
    const state = dragCrossfadeStateRef.current;
    if (!state) {
      finishCrossfade();
      return false;
    }

    const shouldAdvance = shouldCompleteSliderDragCrossfade({
      progress: state.progress,
      force,
      delta: state.delta,
    });

    if (!shouldAdvance) {
      const id = ++crossfadeSeqRef.current;
      crossfadeBusyRef.current = true;
      crossfadeCommittedTrackIndexRef.current = null;

      setCrossfadeProgress(
        0,
        `opacity ${resolvedCrossfadeDurationMs}ms ${resolvedCrossfadeEasing}`
      );

      crossfadeTimeoutRef.current = window.setTimeout(() => {
        if (crossfadeSeqRef.current !== id) return;
        finishCrossfade();
      }, resolvedCrossfadeDurationMs + 48);

      return false;
    }

    const id = ++crossfadeSeqRef.current;
    crossfadeBusyRef.current = true;
    commitIndex(state.targetIndex, 'animated');
    indexPreviousRef.current?.set(state.sourceIndex);
    indexCurrentRef.current?.set(state.targetIndex);
    selectedIndex.current = state.targetIndex;
    crossfadeCommittedTrackIndexRef.current = state.targetIndex;

    setCrossfadeProgress(
      1,
      `opacity ${resolvedCrossfadeDurationMs}ms ${resolvedCrossfadeEasing}`
    );

    crossfadeTimeoutRef.current = window.setTimeout(() => {
      if (crossfadeSeqRef.current !== id) return;
      finishCrossfade();
    }, resolvedCrossfadeDurationMs + 48);

    return true;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => {
    finishCrossfade();
    clearWheelCrossfadeSession();
  }, []);

  function cellsInViewInternal(): number[] {
    const L = layoutRef.current;
    const track = slider.current;
    if (!L || !track) return [];

    const cellsMeta = L.originals;
    const cw = L.cw;
    if (!cellsMeta.length || cw <= 0) return [];

    const loc = -(offsetLocationRef.current?.get() ?? 0);

    if (!wrap) {
      const viewStart = loc;
      const viewEnd = loc + cw;
      const res: number[] = [];

      cellsMeta.forEach((m, i) => {
        const cellStart = m.start;
        const cellEnd   = m.end;
        if (cellEnd > viewStart && cellStart < viewEnd) {
          res.push(i);
        }
      });

      return res;
    }

    const W = sliderWidth.current || 0;
    if (W <= 0) return [];

    const world = ((loc % W) + W) % W;

    const resSet = new Set<number>();

    const view1Start = world;
    const view1End   = Math.min(world + cw, W);

    const checkSegment = (vStart: number, vEnd: number) => {
      cellsMeta.forEach((m, i) => {
        const cellStart = m.start;
        const cellEnd   = m.end;
        if (cellEnd > vStart && cellStart < vEnd) {
          resSet.add(i);
        }
      });
    };

    checkSegment(view1Start, view1End);

    if (world + cw > W) {
      const spill = (world + cw) - W;
      const view2Start = 0;
      const view2End   = spill;
      checkSegment(view2Start, view2End);
    }

    return Array.from(resSet);
  }

  useImperativeHandle(
    ref,
    () => {
      const getSafeIndex = () => indexChannel.get().index ?? 0;

      const slideCount = () => slides.current?.length ?? 0;

      function canScrollNextInternal(): boolean {
        const L = slideCount();
        if (L <= 1) return false;
        if (wrap) return true;

        const atFirst = getSafeIndex() <= 0;
        const atLast  = getSafeIndex() >= Math.max(0, L - 1);

        return !(isRtl ? atFirst : atLast);
      }

      function canScrollPrevInternal(): boolean {
        const L = slideCount();
        if (L <= 1) return false;
        if (wrap) return true;

        const atFirst = getSafeIndex() <= 0;
        const atLast  = getSafeIndex() >= Math.max(0, L - 1);

        return !(isRtl ? atLast : atFirst);
      }

      function scrollProgressInternal(): number {
        return lastProgressRef.current;
      }

      function getInternals() {
        return {
          slides: slides ?? [],
          slider: slider,

          visibleImages: visibleImagesRef,
          selectedIndex: selectedIndex,

          sliderX: sliderX,
          sliderVelocity: sliderVelocity,

          isWrapping: isWrapping,
        };
      }

      return {
        centerSlider: () => reanchorToCurrentIndex(),

        getIndex: () => getSafeIndex(),

        setIndex: (i: number, mode: IndexMode = 'animated') => {
          if (!isReady || !scrollToRef.current || !bodyRef.current || !indexCurrentRef.current) {
            const normalizedIdx = clampIndex(
              i,
              slides.current?.length ? slides.current.length : cellCount
            );
            pendingSetIndexRef.current = { index: normalizedIdx, mode };
            selectedIndex.current = normalizedIdx;
            return;
          }

          pendingSetIndexRef.current = null;
          if (mode !== "animated") {
            jumpToIndexInstant(i, mode);
            return;
          }

          scrollToIndex(i, { jump: mode !== 'animated', programmatic: true });
        },

        setIndexFromUi: (i: number, opts) => {
          goToIndex(i, {
            fromUi: true,
            preferCrossfade: !!opts?.crossfade,
            crossfade: opts,
          });
        },

        subscribeIndex: (fn: () => void) => indexChannel.subscribe(fn),

        getAutoPlayTimer: () => getAutoPlayTimerSnapshot(),

        slideIndexForCell: (cellIndex: number) => {
          const Lcells = cellCount;
          const Lslides = slideCount();
          if (!Lcells || !Lslides) return 0;

          const ci = ((cellIndex % Lcells) + Lcells) % Lcells;
          const s = cellToSlideRef.current[ci];
          return typeof s === 'number' ? s : Math.min(ci, Lslides - 1);
        },

        getRootNode: () => sliderContainer.current,
        getContainerNode: () => slider.current,
        getViewportNode: () => viewportRef.current,

        getSlideNodes: () => {
          return getOriginalNodes();
        },

        onSlidesBuilt: (cb: (nodes: HTMLElement[]) => void) => {
          slideBuildSubs.current.add(cb);
          if (builtOnceRef.current) cb(getOriginalNodes());
          return () => slideBuildSubs.current.delete(cb);
        },

        whenSlidesBuilt: () => {
          if (builtOnceRef.current) {
            return Promise.resolve(getOriginalNodes());
          }
          return new Promise<HTMLElement[]>((resolve) => {
            const handler = (nodes: HTMLElement[]) => {
              slideBuildSubs.current.delete(handler);
              resolve(nodes);
            };
            slideBuildSubs.current.add(handler);
          });
        },

        isSlidesBuilt: () => builtOnceRef.current,

        onReady: (cb: (nodes: HTMLElement[]) => void) => {
          readySubs.current.add(cb);
          if (isReady) cb(getOriginalNodes());
          return () => readySubs.current.delete(cb);
        },

        whenReady: () => {
          if (isReady) {
            return Promise.resolve(getOriginalNodes());
          }
          return new Promise<HTMLElement[]>((resolve) => {
            readyResolvers.current.push(resolve);
          });
        },

        isReady: () => isReady,

        scrollNext: () => {
          if (!canScrollNextInternal()) return;
          next();
        },

        scrollPrev: () => {
          if (!canScrollPrevInternal()) return;
          previous();
        },

        canScrollNext: () => canScrollNextInternal(),
        canScrollPrev: () => canScrollPrevInternal(),

        scrollProgress: () => scrollProgressInternal(),

        cellsInView: () => cellsInViewInternal(),

        getInternals,
      } as SliderCoreHandle;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      autoPlay,
      autoPlayPause,
      autoPlaySpeed,
      cellCount,
      indexChannel,
      isReady,
      isRtl,
      pauseAutoPlayOnHover,
      wrap,
    ]
  );
  
  function updateControlsImperatively() {
    const count = slides.current?.length ?? 0;
    const idx   = selectedIndex.current;
    const atFirst = !wrap && idx <= 0;
    const atLast  = !wrap && idx >= Math.max(0, count - 1);

    const setArrow = (el: HTMLElement | null, disabled: boolean) => {
      if (!el) return;
      el.style.cursor = disabled ? 'default' : 'pointer',
      el.style.opacity = disabled ? '0.35' : '1';
      el.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    };
    setArrow(prevButtonRef.current, (isRtl ? atLast : atFirst));
    setArrow(nextButtonRef.current, (isRtl ? atFirst : atLast));

    const L = dotRefs.current.length;
    for (let i = 0; i < L; i++) {
      const el = dotRefs.current[i];
      if (!el) continue;
      el.classList.toggle(styles.active,   i === idx);
      el.classList.toggle(styles.inactive, i !== idx);
    }
  }

  useEffect(() => {
    const root = sliderContainer.current
    const track = slider.current;
    if (
      !root ||
      !track ||
      !slides.current?.length ||
      !layoutReady ||
      !isMeasured ||
      sliderWidth.current === 0 ||
      !isReady
    ) {
      return;
    }

    const shouldIgnoreMainSizeStableResize = createMainSizeStableResizeGuard([
      viewportRef.current,
      track,
    ]);

    const ro = new ResizeObserver((entries) => {
      if (autoHeight && shouldIgnoreMainSizeStableResize(entries)) return;

      const cw = getViewportMainSize();
      if (cw <= 0) return;
      const contentW = sliderWidth.current || 0;

      // =========================
      // ✅ NON-WRAP
      // =========================
      if (!wrap) {
        // ✅ When non-scrollable, we MUST reset to a "single snap world" at index 0,
        // otherwise resizing from scrollable -> non-scrollable while on index != 0
        // can freeze after onUp (snap logic runs with stale multi-snap state).
        if (contentW <= cw) {
          const center = Math.round((cw - contentW) / 2);
          trackCenterOffsetRef.current = center;

          // If engine isn't ready yet, just re-position (don't touch null refs).
          if (
            !locationRef.current ||
            !previousLocationRef.current ||
            !offsetLocationRef.current ||
            !targetRef.current ||
            !bodyRef.current
          ) {
            positionSlider(offsetLocationRef.current?.get() ?? xRef.current);
            return;
          }

          const canCollapseToSingle = (slides.current?.length ?? 0) <= 1;
          if (!canCollapseToSingle) {
            positionSlider(offsetLocationRef.current?.get() ?? xRef.current);
            syncProgressUiInFrame();
            if (parallax) tweenParallax();
            if (scaleEffect) applyPairScaleTween();
            if (fadeEffect) applyFadeTween();
            updateControlsImperatively();
            return;
          }

          // ✅ collapse snaps to a single snap at 0
          applyScrollMetrics([0]);

          // ✅ force index back to 0 everywhere
          selectedIndex.current = 0;
          indexCurrentRef.current?.set(0);
          indexPreviousRef.current?.set(0);
          indexChannel.set(0, "instant");

          // ✅ trivial limits/bounds (no movement possible)
          limitRef.current = Limit(0, 0);
          povRef.current = PercentOfView(cw);
          boundsRef.current = ScrollBounds(
            limitRef.current,
            locationRef.current!,
            targetRef.current!,
            bodyRef.current!,
            povRef.current,
            selectDuration
          )

          // ✅ kill motion + set canonical state to 0
          bodyRef.current.useDuration(0).useFriction(1);

          isAnimatingRef.current = false;
          animRef.current?.stop();

          locationRef.current.set(0);
          previousLocationRef.current.set(0);
          offsetLocationRef.current.set(0);
          targetRef.current.set(0);
          xRef.current = 0;

          // ✅ always position through canonical function
          positionSlider(0);
          syncProgressUiInFrame();
          if (parallax) tweenParallax();
          if (scaleEffect) applyPairScaleTween();
          if (fadeEffect) applyFadeTween();
          updateControlsImperatively();
          return;
        }

        // ✅ scrollable again: remove centering offset + restore bounds/limits
        trackCenterOffsetRef.current = 0;
        syncMotionGeometry({ reanchor: shouldReanchorOnResize });
        return;
      }

      // =========================
      // ✅ WRAP
      // =========================
      trackCenterOffsetRef.current = 0;
      syncMotionGeometry({ reanchor: true });
    });

    ro.observe(track);
    if (viewportRef.current) {
      ro.observe(viewportRef.current);
    }
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wrap, layoutReady, isMeasured, isReady, shouldReanchorOnResize, autoHeight]);

  function onTouchStart(e: TouchEvent) {
    const t0 = e.touches[0]
    ;(onTouchStart as any)._sx = t0.clientX
    ;(onTouchStart as any)._sy = t0.clientY
  }
  function onTouchMove(e: TouchEvent) {
    if (e.touches.length !== 1) return;
    const t0 = e.touches[0];
    const sx = (onTouchStart as any)._sx ?? t0.clientX;
    const sy = (onTouchStart as any)._sy ?? t0.clientY;
    const dx = t0.clientX - sx;
    const dy = t0.clientY - sy;

    const mainMag  = AX.main === 'x' ? Math.abs(dx) : Math.abs(dy);
    const crossMag = AX.main === 'x' ? Math.abs(dy) : Math.abs(dx);

    if (mainMag > crossMag) e.preventDefault();
  }
  useEffect(() => {
    const el = sliderContainer.current!
    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => {
      el.removeEventListener('touchstart', onTouchStart as any)
      el.removeEventListener('touchmove', onTouchMove as any)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const normalizedReveal = useMemo(() => {
    const src = revealOptions ?? {};
    return {
      renderReveal: src.renderReveal,
      inView: src.inView === true,
      staggerMs: src.staggerMs ?? 60,
      durationMs: src.durationMs ?? 600,
      easing: src.easing ?? 'cubic-bezier(.2,.7,.2,1)',
    };
  }, [revealOptions]);

  const revealEnabled = revealOptions != null;
  const revealInView = inView || normalizedReveal.inView;
  const skeletonRevealUnlocked = skeletonRevealGate ?? true;
  const revealActive =
    !revealEnabled ||
    (isReady && revealInView && (revealUnlocked ?? true) && skeletonRevealUnlocked);

  const revealChildren = useMemo(
    () =>
      clonedChildren.map((child, i) => {
        if (!isValidElement(child)) return child;

        const el = child as React.ReactElement<any>;
        const prevStyle = (el.props?.style || {}) as React.CSSProperties;

        return cloneElement<any>(el, {
          ...el.props,
          style: {
            ...prevStyle,
            ['--rmg-reveal-index' as any]: i,
          } as React.CSSProperties & Record<string, any>,
        });
      }),
    [clonedChildren]
  );

  const viewportStyle = useMemo(() => {
    if (!autoHeight) return sliderViewportStyles;

    const {
      height: _autoHeightControlledHeight,
      ...restViewportStyles
    } = sliderViewportStyles ?? {};

    return {
      ...restViewportStyles,
      transition: autoHeightTransition,
      willChange: autoHeightWillChange,
    };
  }, [
    autoHeight,
    autoHeightTransition,
    autoHeightWillChange,
    sliderViewportStyles,
  ]);

  const inner = (
    <>
      <div 
        ref={viewportRef}
        data-rmg-part="viewport"
        className={[
          styles.viewport,
          sliderViewportClassName ?? "",
        ].join(" ")}
        style={viewportStyle}
      >
        <div
          ref={slider}
          className={`${styles.track} ${rtlCls}`}
          data-rmg-axis={AX.main}
          style={{ gap: `${gap}px` }}
        >
          {revealChildren}
        </div>
        <div
          ref={crossfadeLayerRef}
          data-rmg-slider-crossfade-layer="true"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            // Keep the crossfade overlay above the track, but below arrows/dots.
            zIndex: 1,
            pointerEvents: 'none',
            opacity: 0,
            visibility: 'hidden',
          }}
        >
          <div
            ref={crossfadeSourceRef}
            data-rmg-slider-crossfade-slide="source"
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 1,
              willChange: 'opacity',
            }}
          />
          <div
            ref={crossfadeTargetRef}
            data-rmg-slider-crossfade-slide="target"
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0,
              willChange: 'opacity',
            }}
          />
        </div>
      </div>
    </>
  );

  const baseContainerProps: React.HTMLAttributes<HTMLDivElement> = {
    className: [
      styles.fade_container,
      rtlCls,
      revealActive ? styles.fadeInActive : styles.fadeInStart,
    ].join(' '),
    style: {
      position: 'relative',
    },
    'aria-busy': !isReady ? true : undefined,
  };

  const revealWrapped = normalizedReveal.renderReveal
    ? (
        <div {...baseContainerProps}>
          {normalizedReveal.renderReveal(
            { active: revealActive, containerProps: baseContainerProps },
            inner
          )}
        </div>
      )
    : (
        <div {...baseContainerProps}>{inner}</div>
      );

  return (
    <>
      {baseCss && <style dangerouslySetInnerHTML={{ __html: baseCss }} />}

      <div
        data-rmg-slider-core-scope={scopeId}
        ref={sliderContainer}
        className={[
          styles.sliderScope,
          styles.slider_container,
          rtlCls,
          sliderContainerClassName ?? "",
        ].join(" ")}
        dir={isRtl ? 'rtl' : undefined}
        style={{
          position: 'relative',
          ['--rmg-reveal-stagger' as any]: `${normalizedReveal.staggerMs}ms`,
          ['--rmg-reveal-duration' as any]: `${normalizedReveal.durationMs}ms`,
          ['--rmg-reveal-easing' as any]: normalizedReveal.easing,
          zIndex: 1,
          ...sliderContainerStyles,
        }}
      >
        {revealWrapped}
      </div>
    </>
  );
});

export default SliderCore
