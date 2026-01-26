/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import {
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
  createRef,
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
  useId,
  useMemo,
  Ref,
  useImperativeHandle,
  forwardRef,
} from 'react'
import styles from './Slider.module.css'
import createIndexChannel from './sliderSub'
import { createRoot } from 'react-dom/client';
import { AxisKey, isMouseEvent } from '../shared/input/pointerTypes';
import { createDragTracker } from '../shared/input/dragTracker';
import { Vector1D, Vector1DType } from '../shared/motion/vector1d';
import { ScrollBody, ScrollBodyType } from '../shared/motion/scrollBody';
import { Limit, LimitType } from '../shared/motion/limit';
import { ScrollLooper } from '../shared/motion/scrollLooper';
import { ScrollBounds, ScrollBoundsType, PercentOfView, PercentOfViewType } from '../shared/motion/scrollBounds';
import { BaseTarget, factorAbs, mathSign, ScrollTarget, ScrollTargetType } from '../shared/motion/scrollTarget';
import { EventStore } from '../shared/motion/eventStore';
import { Animations, AnimationsType } from '../shared/motion/animations';
import type { APITypes } from 'plyr-react';
import { RmgSlideProvider } from '../shared/slideContext';
import { ResponsiveHeightRule, SliderHandle, SliderIntroOptions, SliderLoadingOptions } from './types';
import { ArrowRenderArgs, DotsRenderArgs, ProgressRenderArgs } from '../shared/types/controls';
import { ElementStyle } from '../shared/types/elements';
import { FsCaptionPlacement, FsCaptionRenderArgs, FsCounterArgs } from '../fullscreen/types';
import { MediaItem } from '../shared/types/media';
import { ThumbnailPosition } from './thumbnails/types';
import { BreakpointMap } from '../shared/responsive';
import { IndexMode } from '../api/types';
import { Counter, CounterType } from '../shared/motion/counter';
import { createGestureShield } from '../fullscreen/gestureShield';
import { buildScopedSkeletonCountCss } from '../shared/skeleton/buildScopedSkeletonCountCss';
import { useParallaxEffect } from './effects/useParallaxEffect';
import { useScaleEffect } from './effects/useScaleEffect';
import { useFadeEffect } from './effects/useFadeEffect';
import { BaseLimit, createBaseLimit } from '../shared/motion/baseLimit';
import { RmgArrows } from './controls/arrows';
import { buildDotsNode } from './controls/dots';
import { buildProgressNode } from './controls/progress';
import { FullscreenOptions } from '../fullscreen/types';
import { createSliderFullscreenIntroRunner } from '../fullscreen/fullscreenIntro';
import { WindowType } from '../shared/input/pointerTypes'
import { AXSpec } from '../shared/types/axis';
import { Translate } from '../shared/motion/translate';

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

interface SliderProps {
  children: ReactNode
  imageCount: number
  isClick: RefObject<boolean>
  expandableImgRefs?: RefObject<RefObject<HTMLImageElement | null>[]>
  overlayDivRef: RefObject<HTMLDivElement | null>
  setSlideIndex: (index: number) => void
  setShowFullscreenModal: (show: boolean) => void
  setShowFullscreenSlider: Dispatch<SetStateAction<boolean>>
  showFullscreenSlider: boolean
  duplicateImgRef: RefObject<HTMLElement | null>
  closeButtonRef: RefObject<HTMLElement | null>
  counterRef: RefObject<HTMLElement | null>
  leftChevronRef: RefObject<HTMLElement | null>
  rightChevronRef: RefObject<HTMLElement | null>
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
  groupCells?: boolean
  centerAlign?: boolean
  gap: number;
  sliderViewportStyles?: React.CSSProperties;
  sliderViewportClassName?: string;
  sliderContainerStyles?: React.CSSProperties;
  sliderContainerClassName?: string;
  backgroundColor?: string
  sliderHeight?: string;
  responsiveHeights?: ResponsiveHeightRule[];
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
  enableFullscreen?: boolean;
  showProgress?: boolean;
  progressClassName?: string;
  progressStyle?: React.CSSProperties;
  progressInnerClassName?: string;
  progressInnerStyle?: React.CSSProperties;
  renderProgress?: (args: ProgressRenderArgs) => React.ReactNode;
  fullscreenControls?: {
    close?: ElementStyle;
    arrows?: {
      arrow?: ElementStyle;
      prev?: ElementStyle;
      next?: ElementStyle;
    };
    counter?: ElementStyle;
  };
  showFsArrows?: boolean;
  showFsClose?: boolean;
  renderFsClose?:   ()   => HTMLElement | null;
  renderFsArrows?: (args: { dir: "prev" | "next" }) => HTMLElement | null;
  renderFsPrev?: () => HTMLElement | null;
  renderFsNext?: () => HTMLElement | null;
  showFsCounter?: boolean;
  renderFsCounter?: (args: FsCounterArgs) => HTMLElement | null;
  fsCaptionPlacement?: FsCaptionPlacement;
  fsCaptionWidth?: number;
  fsCaptionHeight?: number;
  fsCaptionBreakpoint?: number;
  parallax?: boolean;
  parallaxBleedPct?: string;
  parallaxBorderRadius?: string;
  parallaxSideWidth?: string;
  scaleEffect?: boolean;
  scaleAmount?: number;
  fadeEffect?: boolean;
  initialHeight?: number | string;
  cellsPerSlide?: number;
  direction?: 'ltr' | 'rtl';
  axis?: 'x' | 'y';
  skipSnaps?: boolean;
  selectDuration: number;
  freeScrollDuration: number;
  sliderFriction: number;
  indexChannel?: ReturnType<typeof createIndexChannel>;
  loadingOptions?: SliderLoadingOptions;
  introOptions?: SliderIntroOptions;
  lazyLoad?: boolean;
  rippleEnabled?: boolean;
  rippleClassName?: string;
  renderFsCaption?: (args: FsCaptionRenderArgs) => React.ReactNode;
  normalizedItems: MediaItem[];
  fsThumbContainerRef?: RefObject<HTMLDivElement | null>
  fullscreenThumbnails?: ThumbnailPosition;
  sliderImagesReady?: boolean;
  fullscreenIntroFade?: boolean;
  setFsFadeOpening: Dispatch<SetStateAction<boolean>>;
  breakpointMap: BreakpointMap;
  fsIntroDuration?: number;
  fsIntroEasing?: string;
}

type CarouselChildProps = HTMLAttributes<HTMLElement> &
  ClassAttributes<HTMLElement> & {
    style?: React.CSSProperties
  }

const RMG_BLANK =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

function markLazyShell(slideEl: HTMLElement) {
  slideEl.setAttribute('data-rmg-lazyload', '');
  slideEl.setAttribute('aria-busy', 'true');

  const targets = slideEl.querySelectorAll<HTMLElement>('[data-rmg-src]');
  targets.forEach((t) => {
    if (t instanceof HTMLImageElement) {
      if (!t.getAttribute('src')) t.src = RMG_BLANK;
      const s = t.style as CSSStyleDeclaration;
      if (!s.opacity) s.opacity = '0';
      if (!s.transition) s.transition = 'opacity 220ms ease';
      t.addEventListener('error', () => {
        if (!t.src.endsWith('/rmg-blank.png')) t.src = '/rmg-blank.png';
      }, { once: true });
    } else {
      t.style.opacity = '0';
    }
  });
}

function revealSlide(slideEl: HTMLElement) {
  const targets = slideEl.querySelectorAll<HTMLElement>('[data-rmg-src]');
  targets.forEach((t) => {
    const src = t.getAttribute('data-rmg-src');
    if (!src) return;

    if (t instanceof HTMLImageElement) {
      t.src = src;
      t.removeAttribute('data-rmg-src');
      t.style.opacity = '1';
    } else {
      (t.style as any).backgroundImage = `url("${src}")`;
      t.removeAttribute('data-rmg-src');
      t.style.opacity = '1';
    }
  });

  slideEl.setAttribute('data-rmg-lazyloaded', 'true');
  slideEl.removeAttribute('aria-busy');

  const sp = slideEl.querySelector<HTMLElement>('[data-rmg-spinner]');
  if (sp) sp.style.display = 'none';
}

function detectKindFromDom(slideEl: HTMLElement): 'video' | 'image' {
  // Plyr root
  if (slideEl.querySelector('.plyr')) return 'video';

  // Native video
  if (slideEl.querySelector('video')) return 'video';

  // Common embed patterns (YouTube/Vimeo)
  if (slideEl.querySelector('iframe')) return 'video';

  // (Optional) Plyr sometimes marks provider on iframe
  if (slideEl.querySelector('[data-plyr-provider], [data-plyr-embed-id]')) return 'video';

  return 'image';
}

type PlyrApi = APITypes | null;

type PlyrRefsByIndex = React.RefObject<Record<number, PlyrApi>>;

function cloneSlide(
  child: ReactElement<any>,
  key: string,
  elementIndex: number,
  cells: React.RefObject<{ element: HTMLElement; index: number }[]>,
  enableParallax?: boolean,
  imageCountForIdx?: number,
  lazyLoad?: boolean,
  extraStyle?: React.CSSProperties,
  fullscreen?: boolean,
  isClone?: boolean,
  plyrRefsByIdx?: PlyrRefsByIndex
): ReactElement<CarouselChildProps> {
  const normIdx =
    imageCountForIdx != null
      ? ((elementIndex % imageCountForIdx) + imageCountForIdx) % imageCountForIdx
      : elementIndex;

  const ctxVal = {
    normIdx,
    isClone: !!isClone,
    registerPlyr: (api: APITypes | null) => {
      if (isClone || !plyrRefsByIdx) return;
      if (api) plyrRefsByIdx.current[normIdx] = api;
      else delete plyrRefsByIdx.current[normIdx];
    },
  };

  const shellProps = {
    ['data-rmg-slide' as any]: 'true',
    ['data-rmg-idx' as any]: String(normIdx),
    ['data-rmg-kind' as any]: 'image',
    ['data-rmg-clone' as any]: isClone ? 'true' : 'false',
    ref: (el: HTMLElement | null) => {
      if (el && !cells.current.some((c) => c.element === el)) {
        cells.current.push({ element: el, index: elementIndex });
      }
      if (el && lazyLoad) markLazyShell(el);

      if (el) {
        const kind = detectKindFromDom(el);
        if (el.getAttribute('data-rmg-kind') !== kind) {
          el.setAttribute('data-rmg-kind', kind);
        }
      }
    },
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      ...(extraStyle || {}),
      userSelect: 'none',
      ...(fullscreen ? { cursor: 'zoom-in' } : {}),
    } as React.CSSProperties,
  };

  let contentNode: React.ReactNode = child;

  if (
    !isClone &&
    lazyLoad &&
    typeof child.type === 'string' &&
    child.type.toLowerCase() === 'img'
  ) {
    const imgProps = child.props || {};
    const realSrc = imgProps.src;
    const alt = imgProps.alt ?? '';

    contentNode = cloneElement(child, {
      src: RMG_BLANK,
      alt,
      ['data-rmg-src']: realSrc,
      decoding: 'async',
      style: {
        ...(imgProps.style || {}),
        opacity: 0,
        transition: 'opacity 220ms ease',
      },
    });
  }

  if (!enableParallax) {
    return (
      <div key={key} {...shellProps}>
        <RmgSlideProvider value={ctxVal}>{contentNode}</RmgSlideProvider>
      </div>
    );
  }

  return (
    <div key={key} {...shellProps} className="rmg__slide">
      <RmgSlideProvider value={ctxVal}>
        <div className="rmg__parallax">
          <div className="rmg__parallax__layer">{contentNode}</div>
        </div>
      </RmgSlideProvider>
    </div>
  );
}

const Slider = forwardRef<SliderHandle, SliderProps>(function Slider(
  {
    children,
    imageCount,
    isClick,
    expandableImgRefs,
    overlayDivRef,
    setSlideIndex,
    setShowFullscreenModal,
    setShowFullscreenSlider,
    showFullscreenSlider,
    duplicateImgRef,
    closeButtonRef,
    counterRef,
    leftChevronRef,
    rightChevronRef,
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
    groupCells,
    centerAlign,
    gap,
    sliderViewportStyles,
    sliderViewportClassName,
    sliderContainerStyles,
    sliderContainerClassName,
    sliderHeight,
    responsiveHeights,
    arrowStyles,
    arrowClassName,
    prevArrowStyles,
    prevArrowClassName,
    nextArrowStyles,
    nextArrowClassName,
    dotsContainerStyles,
    dotsContainerClassName,
    dotsStyles,
    dotsClassName,
    renderArrows,
    renderPrevArrow,
    renderNextArrow,
    renderDots,
    showArrows,
    showDots,
    enableFullscreen,
    showProgress,
    progressClassName,
    progressStyle,
    progressInnerClassName,
    progressInnerStyle,
    renderProgress,
    fullscreenControls = {},
    showFsArrows,
    showFsClose,
    renderFsClose,
    renderFsArrows,
    renderFsPrev,
    renderFsNext,
    showFsCounter,
    renderFsCounter,
    fsCaptionPlacement,
    fsCaptionWidth,
    fsCaptionHeight,
    fsCaptionBreakpoint,
    parallax,
    parallaxBleedPct,
    parallaxBorderRadius,
    parallaxSideWidth,
    scaleEffect,
    scaleAmount,
    fadeEffect,
    initialHeight,
    cellsPerSlide,
    direction,
    axis,
    skipSnaps,
    selectDuration,
    freeScrollDuration,
    sliderFriction,
    indexChannel: externalIndexChannel,
    loadingOptions,
    introOptions,
    lazyLoad,
    rippleEnabled,
    rippleClassName,
    renderFsCaption,
    normalizedItems,
    fsThumbContainerRef,
    fullscreenThumbnails,
    sliderImagesReady,
    fullscreenIntroFade,
    setFsFadeOpening,
    breakpointMap,
    fsIntroDuration = 300,
    fsIntroEasing = 'cubic-bezier(.4,0,.22,1)'
  }: SliderProps,
  ref: Ref<SliderHandle>
) {
  const slider = useRef<HTMLDivElement | null>(null);
  const slides = useRef<{ cells: { element: HTMLElement, index: number }[], target: number }[]>([]);
  const visibleImagesRef = useRef(0);
  const selectedIndex = useRef(0);
  const sliderX = useRef(0);
  const sliderVelocity = useRef(0);
  const isWrapping = useRef(true);
  const sliderContainer = useRef<HTMLDivElement | null>(null)
  const prevButtonRef = useRef<HTMLDivElement>(null)
  const nextButtonRef = useRef<HTMLDivElement>(null)
  const dotRefs = useRef<(HTMLDivElement | null)[]>([])
  const dotsContainerRef = useRef<HTMLDivElement | null>(null)
  const [clonedChildren, setClonedChildren] = useState<React.ReactElement[]>([])
  const clonesCountRef = useRef(0)
  const [visibleImages, setVisibleImages] = useState(1)
  const [slidesState, setSlidesState] = useState<{ cells: { element: HTMLElement }[] }[]>([])
  const [isMeasured, setIsMeasured] = useState(false)
  const [inView, setInView] = useState(false)
  const [wrap, setWrap] = useState(false)
  const progressHolderRef = useRef<HTMLDivElement | null>(null);
  const progressInnerRef  = useRef<HTMLDivElement | null>(null);
  const lastProgressRef   = useRef(0);
  const cellToSlideRef = useRef<number[]>([]);
  const builtOnceRef = useRef(false);
  const slideBuildSubs = useRef(new Set<(nodes: HTMLElement[]) => void>());
  const [layoutReady, setLayoutReady] = useState(false);
  const [engineReady, setEngineReady] = useState(false);
  const overlayCaptionRef = useRef<HTMLDivElement | null>(null);
  const overlayCaptionRootRef = useRef<ReturnType<typeof createRoot> | null>(null);
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
  const dragMoveTime = useRef<Date | null>(null)
  const boundsRef = useRef<ScrollBoundsType | null>(null)
  const povRef    = useRef<PercentOfViewType | null>(null)
  const cells = useRef<{ element: HTMLElement; index: number }[]>([])
  const sliderWidth = useRef(0)
  const hasPositioned = useRef<boolean>(false)
  const getSnapTargets: () => number[] = () => (slides.current || []).map((s) => s.target)
  const totalWidth = () => sliderWidth.current || 0
  const contentSizeRef = useRef(0)
  const loopLimitRef = useRef<ReturnType<typeof Limit> | null>(null)
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
  const lastPointerUpTime = useRef<number>(performance.now() - 1000);
  const autoScrollPauseUntil = useRef(0);
  const [buildKey, setBuildKey] = useState(0);
  const loopStableRef = useRef<boolean | null>(null);
  const [geomKey, setGeomKey] = useState(0);
  const lastGeomSigRef = useRef<string>("");
  const plyrRefsByIdx = useRef<Record<number, any>>({});
  const lastCloneSigRef = useRef<string>("");
  const shieldCleanupRef = useRef<null | (() => void)>(null);
  const shieldRef = useRef<ReturnType<typeof createGestureShield> | null>(null);
  const internalIndexChannel = useMemo(() => createIndexChannel(), []);
  const indexChannel = externalIndexChannel ?? internalIndexChannel;
  const isRtl = direction === 'rtl' ? true : false
  const rtlCls = isRtl ? styles.rtl : '';
  const sign = axis === 'x' && isRtl ? -1 : 1;
  const [responsiveSliderHeight, setResponsiveSliderHeight] = useState<string>(() => {
    if (typeof initialHeight === 'number' && initialHeight > 0) {
      return `${initialHeight}px`;
    }

    if (typeof initialHeight === 'string' && initialHeight.trim() !== '') {
      return initialHeight;
    }

    return '0px';
  });

  const lastNonZeroHeightRef = useRef<number>(
    typeof initialHeight === 'number' && initialHeight > 0 ? initialHeight : 1
  );

  const scopeId = useId().replace(/:/g, "-");

  const AX: AXSpec = useMemo(() => {
    const main = axis!;
    const cross = axis === 'x' ? 'y' : 'x';
    const sizeKey   = axis === 'x' ? 'width'  : 'height';
    const clientKey = axis === 'x' ? 'clientWidth'  : 'clientHeight';
    const startKey  = axis === 'x' ? 'left'   : 'top';
    const endKey    = axis === 'x' ? 'right'  : 'bottom';

    const translate = (n: number) =>
      axis === 'x' ? `translate3d(${n}px,0,0)` : `translate3d(0,${n}px,0)`;

    const place = (n: number) =>
      axis === 'x'
        ? `translateX(${n}px) scale(var(--rmg-scale, 1))`
        : `translateY(${n}px) scale(var(--rmg-scale, 1))`;

    const wheelDelta = (e: WheelEvent) => (axis === 'x' ? e.deltaX : e.deltaY);

    return { main, cross, sizeKey, clientKey, startKey, endKey, translate, place, wheelDelta };
  }, [axis]);

  const responsiveCss = useMemo<string>(() => {
    const rules: ResponsiveHeightRule[] = Array.isArray(responsiveHeights)
      ? responsiveHeights
      : [];

    if (rules.length === 0) return "";

    const rootSel = `#${scopeId}`;

    return rules
      .map((r) => `@media ${r.query} { ${rootSel} { --rmg-slider-height: ${r.height} !important; } }`)
      .join("\n");
  }, [responsiveHeights, scopeId]);

  const hasResponsiveHeights =
    Array.isArray(responsiveHeights) && responsiveHeights.length > 0;

  const heightVarValue =
    sliderHeight
      ? sliderHeight
      : hasResponsiveHeights
        ? undefined
        : responsiveSliderHeight;

  const baseCss = useMemo(() => {
    const root = `#${scopeId}`;
    return `
  ${root} .rmg__slide {
    position: absolute;
    left: 0;
    width: ${parallaxSideWidth};
    height: 100dvh;
    overflow: hidden;
    border-radius: ${parallaxBorderRadius};
  }

  ${root} .rmg__parallax {
    width: 100%;
    height: 100%;
  }

  ${root} .rmg__parallax__layer {
    width: 100%;
    height: 100%;
    will-change: transform;
    transform: ${
      axis === 'x' ? 'translateX(0%)' : 'translateY(0%)'
    }
  }

  ${root} .rmg__parallax__layer > img,
  ${root} .rmg__parallax__layer > picture,
  ${root} .rmg__parallax__layer > video {
    display: block;
    height: 100%;
    width: ${parallaxBleedPct};
    max-width: none;
    object-fit: cover;
    margin-left: calc((100% - ${parallaxBleedPct}) / 2);
  }
  `;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeId, parallaxBleedPct, parallaxBorderRadius, parallaxSideWidth]);

  const progressApi = buildProgressNode({
    AX,
    slider,
    sliderWidth,
    wrap,
    offsetLocationRef,
    lastProgressRef,
    progressHolderRef,
    progressInnerRef,
    showProgress,
    renderProgress,
    progressClassName,
    progressStyle,
    progressInnerClassName,
    progressInnerStyle,
  });

  const progressNode = progressApi.progressNode;

  function resolveFsCaptionPlacement(
    placement: FsCaptionPlacement | undefined,
    breakpoint: number | undefined,
    viewportWidth: number
  ): FsCaptionPlacement | null {
    if (!placement) return null;

    if (breakpoint != null && viewportWidth < breakpoint) {
      return 'bottom';
    }
    return placement;
  }

  const childrenKey = useMemo(() => {
    const arr = Children.toArray(children) as any[];
    // only keys, so this doesn’t change on every render
    return arr.map((c) => String(c?.key ?? "")).join("|");
  }, [children]);

  useEffect(() => {
    setEngineReady(false);
    setLayoutReady(false);
    hasPositioned.current = false;
    setIsReady(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageCount, childrenKey, loop, axis]);

  function getOriginalNodes(): HTMLElement[] {
    const track = slider.current;
    if (!track) return [];
    const kids = Array.from(track.children) as HTMLElement[];
    const before = clonesCountRef.current || 0;
    const after  = before;
    return kids.slice(before, kids.length - after);
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
      #${scopeId}[data-rmg-drag]        { cursor: grabbing !important; }
      #${scopeId}[data-rmg-drag] *      { cursor: grabbing !important; }
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
    const track = slider.current;
    if (!track || !slides.current?.[idx]?.cells?.[0]?.element) return 0;
    const containerSize = (track as any)[AX.clientKey] as number;
    const cellSize = slides.current[idx].cells[0].element.getBoundingClientRect()[AX.sizeKey];
    return centerAlign ? (containerSize - cellSize) / 2 : 0;
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

  useEffect(() => {
    const id = window.setInterval(() => {
      const now = performance.now();
      if (
        isPointerDown.current ||
        showFullscreenSlider ||
        !isWrapping.current ||
        !autoPlay ||
        !isReady ||
        (pauseAutoPlayOnHover && isHoveringRef.current)
      ) {
        return;
      }

      if (now - lastPointerUpTime.current < autoPlayPause) return;

      if (isRtl) {
        previous();
      } else {
        next();
      }
    }, autoPlaySpeed);

    return () => {
      window.clearInterval(id);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFullscreenSlider, slidesState, clonedChildren, isWrapping.current]);

  useEffect(() => {
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
        showFullscreenSlider ||
        !autoScroll ||
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

      animRef.current?.start();
      xRef.current = next;
      positionSlider();
      progressApi.updateProgressInFrame();
      tweenParallax();
      updateActiveIndexFromX(next);
    }

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFullscreenSlider]);

  function setWrapSafe(next: boolean) {
    if (loopStableRef.current === next) return;
    loopStableRef.current = next;
    setWrap(next);
    isWrapping.current = next;

    hasPositioned.current = false;
    setLayoutReady(false);

    setBuildKey(k => k + 1);
  }

  function getPlyrInstance(api: any) {
    return api?.plyr ?? api ?? null;
  }

  function togglePlyr(api: any) {
    const inst = getPlyrInstance(api);
    if (!inst) return;

    const isPaused =
      typeof inst.paused === 'boolean'
        ? inst.paused
        : (inst.media?.paused ?? true);

    if (isPaused) inst.play?.();
    else inst.pause?.();
  }

  function toggleActiveVideoPlay() {
    const active = selectedIndex.current;
    const api = plyrRefsByIdx.current[active];
    if (!api) return;
    togglePlyr(api);
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

  function clickedVideoSurface(evt: any): boolean {
    const { x, y } = getClientXY(evt);

    const under = document.elementFromPoint(x, y) as HTMLElement | null;
    if (!under) return false;

    const slide = under.closest('[data-rmg-slide="true"]') as HTMLElement | null;
    if (!slide) return false;

    const host = slide.querySelector('[data-rmg-plyr="true"]') as HTMLElement | null;
    if (!host) return false;

    const r = host.getBoundingClientRect();
    const inside =
      x >= r.left && x <= r.right &&
      y >= r.top  && y <= r.bottom;

    if (!inside) return false;

    if (under.closest('.plyr__controls')) return false;

    return true;
  }

  function computeCloneSig(originals: number, per: number, useCols: boolean, cellSize?: number) {
    return `${originals}|per=${per}|cols=${useCols ? cellsPerSlide : 0}|cell=${cellSize ?? 0}|wrap=${wrap ? 1 : 0}`;
  }

  useEffect(() => {
    const el = slider.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const rawKids = Children
        .toArray(children)
        .filter(isValidElement) as ReactElement<any>[];

      const originals = rawKids.length;
      if (originals < 1) {
        clonesCountRef.current = 0;
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
      const clonesAfter  = clonesBefore;
      const originalEls  = allEls.slice(clonesBefore, allEls.length - clonesAfter);

      const cw = (el as any)[AX.clientKey] as number;

      const useCols =
        typeof cellsPerSlide === 'number' && cellsPerSlide > 0;

      let cols = 1;
      let cellSize: number | undefined;

      if (useCols) {
        cols = Math.max(1, Math.min(originals, cellsPerSlide as number));
        const totalGap = gap * Math.max(0, cols - 1);
        cellSize = (cw - totalGap) / cols;
      }

      let sum = 0;
      let count = 0;
      for (const slot of originalEls) {
        const w = slot.getBoundingClientRect()[AX.sizeKey];
        if (w === 0) {
          requestAnimationFrame(() => ro.observe(el));
          return;
        }
        if (sum + w <= cw) {
          sum += w;
          count++;
        } else {
          count++;
          break;
        }
      }

      const per = useCols
        ? Math.max(1, Math.min(originals, cols))
        : Math.max(2, Math.min(originals, count));

      const shouldLoop = wrap;
      clonesCountRef.current = shouldLoop ? per : 0;
      if (visibleImagesRef.current !== per) {
        setVisibleImages(per);
        visibleImagesRef.current = per;
      }

      const sig = computeCloneSig(originals, per, useCols, cellSize);
      if (sig === lastCloneSigRef.current) return;
      lastCloneSigRef.current = sig;

      const enableParallax = !!parallax;
      const slidesArr: ReactElement<any>[] = [];
      cells.current = [];

      const extraStyle: React.CSSProperties | undefined =
        useCols && cellSize != null
          ? {
              flex: '0 0 auto',
              [AX.sizeKey]: `${cellSize}px`,
            } as any
          : undefined;

      if (shouldLoop) {
        slidesArr.push(
          ...rawKids
            .slice(-per)
            .map((c, i) =>
              cloneSlide(
                c,
                `before-${i}`,
                -per + i,
                cells,
                enableParallax,
                imageCount,
                lazyLoad,
                extraStyle,
                enableFullscreen,
                true,
                plyrRefsByIdx
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
            imageCount,
            lazyLoad,
            extraStyle,
            enableFullscreen,
            false,
            plyrRefsByIdx
          )
        )
      );

      if (shouldLoop) {
        slidesArr.push(
          ...rawKids
            .slice(0, per)
            .map((c, i) =>
              cloneSlide(
                c,
                `after-${i}`,
                originals + i,
                cells,
                enableParallax,
                imageCount,
                lazyLoad,
                extraStyle,
                enableFullscreen,
                true,
                plyrRefsByIdx
              )
            )
        );
      }

      setClonedChildren(slidesArr);
    });

    ro.observe(el);
    return () => ro.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    imageCount,
    slider,
    visibleImagesRef,
    cellsPerSlide,
    buildKey,
    wrap,
  ]);

  useEffect(() => {
    const track = slider.current;
    if (!track) return;

    const schedule = () => {
      measureAndPosition()
    };

    function measureAndPosition() {
      const trackEl = slider.current;
      if (!trackEl) return;

      const slideEls = Array.from(trackEl.children) as HTMLElement[];
      if (slideEls.length === 0) return;

      const sizes = slideEls.map((sl) => sl.getBoundingClientRect()[AX.sizeKey]);
      if (sizes.some((s) => s === 0)) {
        setTimeout(measureAndPosition, 0);
        return;
      }

      const contentSize =
        AX.main === "x" ? trackEl.scrollWidth : trackEl.scrollHeight;

      const clonesBefore = clonesCountRef.current;
      const beforeSizes = sizes.slice(0, clonesBefore);
      let running = -(beforeSizes.reduce((s, w) => s + w, 0) + gap * clonesBefore);
      slideEls.forEach((sl, i) => {
        sl.style.transformOrigin = 'center';
        sl.style.transform = AX.place(running * sign);
        running += sizes[i] + gap;
      });

      const origSizes = sizes.slice(clonesBefore, sizes.length - clonesBefore);
      let m0 = 0;
      const originalsForLayout = slideEls
        .slice(clonesBefore, slideEls.length - clonesBefore)
        .map((sl, i) => {
          const s = origSizes[i];
          const start = m0;
          const end   = m0 + s;
          m0 += s + gap;
          return { el: sl, start, end, size: s };
        });

      layoutRef.current = {
        originals: originalsForLayout,
        cw: (trackEl as any)[AX.clientKey] as number,
      };

      const originalsCount = layoutRef.current?.originals?.length ?? 0;
      const innerGaps = Math.max(0, originalsCount - 1);
      const baseWidth = origSizes.reduce((sum, s) => sum + s, 0) + gap * innerGaps;
      sliderWidth.current = wrap ? baseWidth + (originalsCount > 0 ? gap : 0) : baseWidth;

      const cw = (trackEl as any)[AX.clientKey] as number;

      const wantLoop = !!loop && originalsCount > 1 && contentSize > cw;

      const origSizesCsv = originalsForLayout.map((o) => o.size).join(",");
      const sig = `${origSizesCsv}|gap=${gap}|cw=${cw}|W=${contentSize}`;

      if (sig !== lastGeomSigRef.current) {
        lastGeomSigRef.current = sig;
        setGeomKey((k) => k + 1)
      }

      setWrapSafe(wantLoop);
      setIsMeasured(true);
    }

    const ro = new ResizeObserver(schedule);

    ro.observe(track);

    if (sliderContainer.current) {
      ro.observe(sliderContainer.current);
    }

    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    vv?.addEventListener("resize", schedule);

    window.addEventListener("resize", schedule, { passive: true });

    schedule();

    return () => {
      ro.disconnect();
      vv?.removeEventListener("resize", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [imageCount, clonedChildren, visibleImages, cellsPerSlide, gap, wrap, loop, AX, sign]);

  useEffect(() => {
    if (isReady) return;

    const imagesOk = lazyLoad ? true : sliderImagesReady;
    if (!engineReady || !imagesOk) return;

    setIsReady(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lazyLoad, sliderImagesReady, engineReady, isReady]);

  useLayoutEffect(() => {
    if (
      !slider.current ||
      cells.current.length === 0 ||
      sliderWidth.current === 0 ||
      !slides.current ||
      !slides.current[0] ||
      !slides.current[0].cells[0]?.element
    ) return;

    const containerSize = (slider.current as any)[AX.clientKey] as number;

    if (!wrap && sliderWidth.current <= containerSize) {
      sliderX.current = (containerSize - sliderWidth.current) / 2;
      translateRef.current?.to(Math.round(sliderX.current));
    }

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

    const rawKids = Children.toArray(children).filter(isValidElement)
    const childCount = rawKids.length
    const clonesBefore = wrap ? visibleImages : 0
    const clonesAfter = clonesBefore
    const cw = (containerEl as any)[AX.clientKey] as number

    function buildPages() {
      if (canceled || !containerEl) return

      const allEls = Array.from(containerEl.children) as HTMLElement[]
      const originals = allEls.slice(clonesBefore, allEls.length - clonesAfter)
      const idxMap = new Map<HTMLElement, number>(originals.map((el, i) => [el, i]))

      const start0 = containerEl.getBoundingClientRect()[AX.startKey]
      const data = originals.map((el) => {
        const r = el.getBoundingClientRect()
        return {
          el,
          start: r[AX.startKey] - start0,
          end: r[AX.endKey] - start0,
        }
      })

      const pages: { els: HTMLElement[]; target: number }[] = []
      let i = 0

      if (groupCells) {
        while (i < childCount) {
          const startLeft = data[i]?.start ?? 0
          const viewRight = startLeft + cw

          let j = i
          while (j < childCount && (data[j]?.end ?? 0) <= viewRight) j++
          if (j === i) j++

          const slice = originals.slice(i, j)
          const isLast = j >= childCount

          let target = startLeft
          if (isLast && !wrap) {
            target = Math.max(0, (sliderWidth.current || 0) - cw)
          }
          if (i === 0) target = 0

          pages.push({ els: slice, target })
          i = j
        }
      } else {
        const L = layoutRef.current
        if (!L || !L.originals?.length) {
          retry()
          return
        }

        const data = L.originals
        const cw = L.cw

        const maxTarget = Math.max(0, (sliderWidth.current || 0) - cw)
        const EPS = 0.5

        if (wrap) {
          data.forEach((d, idx) => {
            const t = idx === 0 ? 0 : d.start
            pages.push({ els: [d.el], target: t })
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

      const newSlides = pages.map((page) => ({
        target: page.target,
        cells: page.els.map((el) => ({
          element: el,
          index: idxMap.get(el)!,
        })),
      }))

      const hasNaN = newSlides.some((s) => Number.isNaN(s.target))
      const unstable = hasNaN || (wrap && newSlides.length === 1)
      if (unstable) {
        retry()
        return
      }

      const pagesAllowLoop = newSlides.length > 1

      setWrap(!!loop && pagesAllowLoop && sliderWidth.current > cw)
      isWrapping.current = !!loop && pagesAllowLoop && sliderWidth.current > cw

      slides.current = newSlides
      setSlidesState(newSlides)

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

    buildPages()

    return () => {
      canceled = true
      if (retryTimer != null) window.clearTimeout(retryTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageCount, children, clonedChildren, visibleImages, cellsPerSlide, geomKey]);

  useEffect(() => {
    if (!lazyLoad) return;
    if (!layoutReady) return;
    const root = sliderContainer.current;
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
          if (ent.isIntersecting && ent.intersectionRatio >= 0.6) {
            revealSlide(slideEl);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lazyLoad, clonedChildren, wrap, AX.main]);

  useEffect(() => {
    if (!slider.current) return
    const childrenArray = Children.toArray(children)
    const imgOffset = !wrap ? 0 : visibleImages * 2
    if (clonedChildren.length !== Children.toArray(children).length + imgOffset) return
    if (!expandableImgRefs) return;

    expandableImgRefs.current = []
    expandableImgRefs.current = Array(childrenArray.length + imgOffset)
      .fill(null)
      .map(() => createRef<HTMLImageElement>())

    const images = slider.current.querySelectorAll('img')
    images.forEach((img, index) => {
      if (expandableImgRefs.current[index]) {
        ;(expandableImgRefs.current[index] as any).current = img
      }
    })
    return () => {
      expandableImgRefs.current = []
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children, clonedChildren, visibleImages, wrap]);

  useLayoutEffect(() => {
    if (hasResponsiveHeights) return;

    if (sliderHeight) return;

    if (typeof initialHeight === 'number' && initialHeight > 0) return;

    if (typeof initialHeight === 'string' && initialHeight.trim() !== '') return;

    if (typeof cellsPerSlide !== 'number' || cellsPerSlide <= 0) return;

    if (axis !== 'x') return;

    const root = sliderContainer.current;
    if (!root) return;

    const updateFromWidth = () => {
      if (!sliderContainer.current) return;
      const cw = sliderContainer.current.getBoundingClientRect().width;
      if (!cw || cw <= 0) return;

      const cols = Math.max(1, cellsPerSlide);
      const totalGap = gap * Math.max(0, cols - 1);
      const cellSize = (cw - totalGap) / cols;

      if (cellSize <= 0) return;

      if (Math.abs(cellSize - lastNonZeroHeightRef.current) >= 1) {
        lastNonZeroHeightRef.current = cellSize;
        setResponsiveSliderHeight(cellSize + 'px');
      }
    };

    updateFromWidth();

    const ro = new ResizeObserver(() => {
      updateFromWidth();
    });

    ro.observe(root);

    return () => {
      ro.disconnect();
    };
    }, [
    sliderHeight,
    initialHeight,
    cellsPerSlide,
    axis,
    gap,
    sliderContainer,
    hasResponsiveHeights
  ]);

  useEffect(() => {
    if (inView) return;
    if (!sliderContainer.current || !layoutReady || !engineReady || !isReady || !isMeasured) return;

    const el = sliderContainer.current;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [layoutReady, engineReady, isReady, isMeasured, inView]);

  function scrollToIndex(
    requested: number,
    opts: { jump?: boolean; direction?: number } = {}
  ) {
    const { jump = false, direction } = opts
    const indexCurrent = indexCurrentRef.current
    if (!scrollToRef.current || !bodyRef.current || !indexCurrent) return

    const targetIndex = indexCurrent.clone().set(requested).get()

    if (jump) {
      bodyRef.current.useDuration(0)
    } else {
      bodyRef.current.useBaseDuration().useBaseFriction()
    }

    const dir = typeof direction === 'number' ? direction : 0

    scrollToRef.current.index(targetIndex, dir)
  }

  function previous() {
    const scrollTo = scrollToRef.current
    const body     = bodyRef.current
    const indexCur = indexCurrentRef.current
    const len      = slides.current?.length ?? 0
    if (!scrollTo || !body || !indexCur || !len) return

    const cur = indexCur.get()
    const target = wrap
      ? ((cur - 1) % len + len) % len
      : clampIndex(cur - 1, len)

    body.useBaseDuration().useBaseFriction()
    scrollToIndex(target, { direction: 1 })
  }

  function next() {
    const scrollTo = scrollToRef.current
    const body     = bodyRef.current
    const indexCur = indexCurrentRef.current
    const len      = slides.current?.length ?? 0
    if (!scrollTo || !body || !indexCur || !len) return

    const cur = indexCur.get()
    const target = wrap
      ? ((cur + 1) % len + len) % len
      : clampIndex(cur + 1, len)

    body.useBaseDuration().useBaseFriction()
    scrollToIndex(target, { direction: -1 })
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
    translateRef.current?.to(x * sign)
  }

  function updateActiveIndexFromX(loc: number) {
    const indexCurrent = indexCurrentRef.current
    if (!indexCurrent) return

    const idxFromLoc = indexFromX(loc)
    const canonical  = indexCurrent.get()
    updateControlsImperatively()

    if (idxFromLoc === canonical) return

    if (!pointerDownRef.current && isAnimatingRef.current) {
      return
    }

    indexCurrent.set(idxFromLoc)
    selectedIndex.current = idxFromLoc
    indexChannel.set(idxFromLoc, 'animated')
  }

  function goToIndex(idx: number, opts: { preserveTiming?: boolean } = {}) {
    const { preserveTiming = false } = opts
    if (!bodyRef.current || !targetRef.current) return
    if (!preserveTiming) bodyRef.current.useBaseDuration().useBaseFriction()
    scrollToIndex(idx)
  }

  useEffect(() => {
    const ch: any = indexChannel;
    const len = () => slides.current?.length ?? 0;

    const handle = (ev: any) => {
      const L = len(); if (!L) return;
      const cur = selectedIndex.current;
      const signed = (n: number) => (isRtl ? -n : n);

      if (ev.type === 'set') {
        const nextC = wrap ? ((ev.index % L) + L) % L : clampIndex(ev.index, L);
        if (nextC === cur) return;
        scrollToIndex(nextC, ev.mode);
        return;
      }

      if (ev.type === 'bump') {
        const delta = signed(ev.delta | 0);
        if (!delta) return;
        if (!wrap) {
          const bounded = clampIndex(cur + delta, L);
          if (bounded === cur) return;
          scrollToIndex(bounded, ev.mode);
        } else {
          const targetC = ((cur + delta) % L + L) % L;
          scrollToIndex(targetC, ev.mode);
        }
        return;
      }

      if (typeof ev.index === 'number') {
        const nextC = wrap ? ((ev.index % L) + L) % L : clampIndex(ev.index, L);
        if (nextC !== cur) scrollToIndex(nextC, ev.mode || 'animated');
      }
    };

    if (typeof ch.onEvent === 'function') {
      return ch.onEvent(handle);
    } else {
      return ch.subscribe(() => {
        const { index, mode } = ch.get();
        handle({ type: 'set', index, mode });
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

    const startIdx = selectedIndex.current || 0;

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
    const counterMax = len - 1
    const startIndex = selectedIndex.current || 0

    const indexCurrent = Counter(counterMax, startIndex, true)
    const indexPrevious = Counter(counterMax, startIndex, true)

    indexCurrentRef.current = indexCurrent
    indexPreviousRef.current = indexPrevious

    contentSizeRef.current = W
    scrollContentSizeRef.current = W

    const scrollSnaps = slides.current.map((slide, i) => {
      const centerOffset = getCenterOffsetForIndex(i)
      return -(slide.target) + centerOffset
    })
    scrollSnapsRef.current = scrollSnaps

    const initialSnap = scrollSnaps[startIdx] ?? 0;

    location.set(initialSnap);
    previousLocation.set(initialSnap);
    offsetLocation.set(initialSnap);
    target.set(initialSnap);
    xRef.current = initialSnap;

    translateRef.current = Translate(track, AX);
    translateRef.current.to(initialSnap * sign);

    selectedIndex.current = startIdx;
    indexChannel.set(startIdx, 'instant');

    const minSnap = Math.min(...scrollSnaps)
    const maxSnap = Math.max(...scrollSnaps)

    loopLimitRef.current = wrap ? Limit(-W, 0) : Limit(minSnap, maxSnap)

    const baseLimit = wrap ? createBaseLimit(-W, 0) : createBaseLimit(minSnap, maxSnap)
    scrollLimitRef.current = baseLimit

    if (loopLimitRef.current) {
      scrollTargetRef.current = ScrollTarget(
        wrap,
        scrollSnaps,
        W,
        loopLimitRef.current,
        target
      )
    }

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
          positionSlider()
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

    const loLimit = Limit(-W, 0)
    const looper = wrap && W > 0
      ? ScrollLooper(
          W,
          loLimit,
          locationRef.current!,
          [locationRef.current!, previousLocationRef.current!, offsetLocationRef.current!, targetRef.current!]
        )
      : null

    const body = ScrollBody(location, offsetLocation, previousLocation, target, selectDuration, sliderFriction)
    bodyRef.current = body

    if (!wrap) {
      const cw = (track as any)[AX.clientKey] as number;
      const min = -(Math.max(0, sliderWidth.current - cw))
      const max = 0
      limitRef.current = Limit(isNaN(min) ? 0 : min, max)

      povRef.current    = PercentOfView(cw)
      boundsRef.current = ScrollBounds(
        limitRef.current,
        offsetLocationRef.current!,
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

        if (wrap && W > 0) {
          const body = bodyRef.current!
          const dir = body.direction() || Math.sign(targetRef.current!.get() - locationRef.current!.get()) || 0
          looper?.loop(dir)
        }

        xRef.current = locationRef.current!.get()
      },
      (alpha) => {
        const body = bodyRef.current
        const shouldSettle = body ? body.settled() : true
        const idle = shouldSettle && !pointerDownRef.current
        if (idle) {
          animRef.current?.stop()
          isAnimatingRef.current = false
        }
        const cur = locationRef.current!.get()
        const prev = previousLocationRef.current!.get()
        const loc = cur * alpha + prev * (1 - alpha)
        offsetLocationRef.current!.set(loc)
        xRef.current = loc
        positionSlider()
        applyPairScaleTween()
        applyFadeTween();
        progressApi.updateProgressInFrame();
        tweenParallax();
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
      if (isPlyrControlsEl(targetEl)) return;
      const hit = (evt.target as Node)

      if (prevButtonRef.current?.contains(hit)) return
      if (nextButtonRef.current?.contains(hit)) return
      const dotIndex = dotRefs.current.findIndex((dot) => dot?.contains(hit))
      if (dotIndex >= 0) return
      if (dotsContainerRef.current?.contains(hit)) return

      const isMouseEvt = isMouseEvent(evt as any, window as any)
      isMouse = isMouseEvt
      if (isMouseEvt && (evt as MouseEvent).button !== 0) return

      setDragCursor(true);

      pointerDownRef.current = true
      isPointerDown.current = true
      isScrolling.current = false
      isClick.current = true

      tracker.pointerDown(evt as any)
      startMain  = tracker.readPoint(evt as any, AX.main)
      startCross = tracker.readPoint(evt as any, AX.cross)

      bodyRef.current!.useFriction(0).useDuration(0)
      targetRef.current!.set(locationRef.current!.get())

      addDragEvents()
      animRef.current?.start()
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
      dragMoveTime.current = new Date();

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

      if (isClick.current && enableFullscreen) {
        const target = evt.target as HTMLElement
        const img = target.closest('img') as HTMLImageElement | null
        if (img) {
          if (!expandableImgRefs) return;
          const index = expandableImgRefs.current.findIndex((ref) => ref.current === img)
          if (index >= 0) handleImageClick(evt as any, index)
          scrollToIndex(selectedIndex.current)
          return
        }
        if (clickedVideoSurface(evt) && !isYouTubeVideoEvent(evt)) {
          evt.preventDefault?.();
          (evt as any).stopPropagation?.();

          toggleActiveVideoPlay();
          scrollToIndex(selectedIndex.current)
          return;
        }
      }

      autoScrollPauseUntil.current = performance.now() + autoScrollPause;

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

        function allowedForce(force: number): number {
          const len = slides.current.length || 1
          if (!len || !baseScrollTarget) return 0

          const curIndex = selectedIndex.current || 0
          const dir = mathSign(force)

          if (dir === 0) return 0

          if (!skipSnaps) {
            const dirIndex = dir * -1
            let nextIndex = curIndex + dirIndex

            if (!wrap) {
              if (nextIndex < 0 || nextIndex > len - 1) {
                nextIndex = curIndex
              }
            } else {
              nextIndex = ((nextIndex % len) + len) % len
            }

            const dirBump = slides.current.length === 2 ? dir : 0;
            const nextTarget = baseScrollTarget.byIndex(nextIndex, dirBump)
            return nextTarget.distance
          }

          const baseTarget = baseScrollTarget.byDistance(force, true)
          let { index: proposedIndex } = baseTarget
          const { distance } = baseTarget

          const currentIndex = curIndex

          if (proposedIndex !== currentIndex) {
            if (!wrap) {
              proposedIndex = Math.max(0, Math.min(len - 1, proposedIndex))
              const clamped = baseScrollTarget.byIndex(proposedIndex, dir)
              return clamped.distance
            }
            return distance
          }

          const dirIndex = dir * -1
          let nextIndex = currentIndex + dirIndex

          if (wrap) {
            nextIndex = ((nextIndex % len) + len) % len
          } else {
            nextIndex = Math.max(0, Math.min(len - 1, nextIndex))
            if (nextIndex === currentIndex) {
              return 0
            }
          }

          const dirBump = slides.current.length === 2 ? dir : 0;

          const forced = baseScrollTarget.byIndex(nextIndex, dirBump)
          return forced.distance
        }
        
        const force = allowedForce(boostedForce)

        const baseSpeed = selectDuration
        const baseFriction = sliderFriction
        const forceFactor = factorAbs(boostedForce, force)
        const speed = baseSpeed - 10 * forceFactor
        const friction = baseFriction + forceFactor / 50

        body.useDuration(speed).useFriction(friction)

        baseScrollTo.distance(force, true)
      } else {
        const end = tracker.pointerUp(evt as any)
        const raw = (AX.main === 'x' ? end.fx : end.fy)
        const boosted = forceBoost(raw)
        const force = boosted
        const factor = Math.min(1, Math.abs(raw) > 0 ? Math.abs((Math.abs(boosted) - Math.abs(force)) / (raw || 1)) : 0)
        const speed = freeScrollDuration - 10 * factor
        const friction = sliderFriction + factor / 50
        bodyRef.current!.useDuration(speed).useFriction(friction)

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
      const trackEl = slider.current;
      if (!trackEl) return;

      const containerSize = (trackEl as any)[AX.clientKey] as number;
      const contentSize   = sliderWidth.current;
      const canScrollMain = contentSize > containerSize;

      const isMain = AX.main === 'x'
        ? Math.abs(e.deltaX) > Math.abs(e.deltaY)
        : Math.abs(e.deltaY) >= Math.abs(e.deltaX);

      if (!isMain || !canScrollMain) return;

      autoScrollPauseUntil.current = performance.now() + 100;

      const cur = (offsetLocationRef.current?.get() ?? 0) - (AX.wheelDelta(e) * sign);
      let next = cur;
      if (!wrap && limitRef.current) next = limitRef.current.constrain(cur);

      targetRef.current?.set(next);
      bodyRef.current?.useDuration(0).useFriction(1);

      animRef.current?.start();
      xRef.current = next;
      positionSlider();
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    slidesState.length,
    wrap,
    cellsPerSlide,
    geomKey,
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
    wrap,
    sliderRef: slider,
    sliderWidthRef: sliderWidth,
    offsetLocationRef,
    slidesRef: slides,
    getCenterOffsetForIndex,
    slidesLen: slidesState.length,
    clonedLen: clonedChildren.length,
  });

  const centerSlider = useCallback(() => {
    const track = slider.current
    if (!track) return
    const idx = selectedIndex.current || 0
    const x = -(slides.current?.[idx]?.target ?? 0) + getCenterOffsetForIndex(idx)
    locationRef.current?.set(x)
    previousLocationRef.current?.set(x)
    offsetLocationRef.current?.set(x)
    targetRef.current?.set(x)
    xRef.current = x
    positionSlider()
    progressApi.updateProgressInFrame()
    tweenParallax();
    applyFadeTween();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        centerSlider: () => centerSlider(),

        getIndex: () => getSafeIndex(),

        setIndex: (i: number, mode: IndexMode = 'animated') => {
          scrollToIndex(i, { jump: mode === 'animated' ? false : true });
        },

        subscribeIndex: (fn: () => void) => indexChannel.subscribe(fn),

        slideIndexForCell: (cellIndex: number) => {
          const Lcells = imageCount;
          const Lslides = slideCount();
          if (!Lcells || !Lslides) return 0;

          const ci = ((cellIndex % Lcells) + Lcells) % Lcells;
          const s = cellToSlideRef.current[ci];
          return typeof s === 'number' ? s : Math.min(ci, Lslides - 1);
        },

        getRootNode: () => sliderContainer.current,
        getContainerNode: () => slider.current,

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
      } as SliderHandle;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [centerSlider, indexChannel, wrap, imageCount, isRtl, showFullscreenSlider]
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
    const track = slider.current;
    if (!track) return;

    const ro = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const cw = (track as any)[AX.clientKey] as number
          const contentW = sliderWidth.current || 0;

          if (!isWrapping.current) {
            if (contentW <= cw) {
              const center = Math.round((cw - contentW) / 2);

              const newLimit = Limit(center, center);
              limitRef.current = newLimit;
              povRef.current = PercentOfView(cw);
              boundsRef.current = ScrollBounds(
                newLimit,
                offsetLocationRef.current!,
                targetRef.current!,
                bodyRef.current!,
                povRef.current!,
                selectDuration
              );

              locationRef.current?.set(center);
              previousLocationRef.current?.set(center);
              offsetLocationRef.current?.set(center);
              targetRef.current?.set(center);
              translateRef.current?.to(center);
              xRef.current = center;
              sliderX.current = center;
            } else {
              const min = -(contentW - cw);
              const max = 0;

              const newLimit = Limit(min, max);
              limitRef.current = newLimit;
              povRef.current = PercentOfView(cw);
              boundsRef.current = ScrollBounds(
                newLimit,
                offsetLocationRef.current!,
                targetRef.current!,
                bodyRef.current!,
                povRef.current!,
                selectDuration
              );

              const cur = offsetLocationRef.current?.get() ?? 0;
              const constrained = newLimit.constrain(cur);

              locationRef.current?.set(constrained);
              previousLocationRef.current?.set(constrained);
              offsetLocationRef.current?.set(constrained);
              targetRef.current?.set(constrained);
              translateRef.current?.to(constrained);
              xRef.current = constrained;
              sliderX.current = constrained;
            }
          } else {
            limitRef.current = null;
            povRef.current = null;
            boundsRef.current = null;

            const a = offsetLocationRef.current?.get() ?? xRef.current ?? 0;
            const W = sliderWidth.current || 0;
            if (W > 0) {
              const normalized = ((a % W) + W) % W - W;
              const delta = normalized - a;

              locationRef.current?.add(delta);
              previousLocationRef.current?.add(delta);
              offsetLocationRef.current?.add(delta);
              targetRef.current?.add(delta);
              xRef.current += delta;

              translateRef.current?.to(xRef.current);
            }
          }
        });
      });
    });

    ro.observe(track);
    return () => ro.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wrap]);

  useEffect(() => {
    const track = slider.current;
    if (!track || sliderHeight) return;

    const ro = new ResizeObserver(() => {
      centerSlider()
    });

    ro.observe(track);
    return () => ro.disconnect();
  }, [clonedChildren, visibleImages, wrap, cellsPerSlide, slider, sliderHeight, centerSlider, slidesState]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    shieldRef.current = createGestureShield(10000);
  }, []);

  const addShield = useCallback((timeoutMs?: number) => {
    shieldCleanupRef.current?.();
    const teardown = shieldRef.current?.add(timeoutMs);
    shieldCleanupRef.current = teardown ?? null;
  }, []);

  function handleImageClick(e: React.PointerEvent | MouseEvent, parsedImgIndex: number) {
    isClick.current = true
    const originalIndex = ((parsedImgIndex - visibleImagesRef.current) % imageCount + imageCount) % imageCount
    const fullscreenIndex = originalIndex + 1
    const finalIndex = !wrap ? parsedImgIndex : fullscreenIndex
    setShowFullscreenModal(true)
    if (!expandableImgRefs) return;
    runSlideFullscreenIntro(e as React.PointerEvent<HTMLDivElement>, expandableImgRefs.current[parsedImgIndex], finalIndex)
    setSlideIndex(finalIndex)
  }

  const fsForIntro = useMemo<FullscreenOptions>(() => {
    return {
      effects: {
        introDuration: fsIntroDuration,
        introEasing: fsIntroEasing,
        introFade: fullscreenIntroFade,
      },
      caption: {
        placement: fsCaptionPlacement,
        breakpoint: fsCaptionBreakpoint,
        width: fsCaptionWidth,
        height: fsCaptionHeight,
        render: renderFsCaption,
      },
      thumbnails: {
        layout: { position: fullscreenThumbnails } as any,
      } as any,
      controls: {
        close: {
          enabled: showFsClose !== false,
          render: renderFsClose ?? undefined,
          style: fullscreenControls?.close?.style as any,
          className: fullscreenControls?.close?.className,
        },
        counter: {
          enabled: showFsCounter !== false,
          render: renderFsCounter ?? undefined,
          style: fullscreenControls?.counter?.style as any,
          className: fullscreenControls?.counter?.className,
        },
        arrows: {
          enabled: showFsArrows !== false,
          render: renderFsArrows ?? undefined,
          renderPrev: renderFsPrev ?? undefined,
          renderNext: renderFsNext ?? undefined,
          arrow: fullscreenControls?.arrows?.arrow,
          prev: fullscreenControls?.arrows?.prev,
          next: fullscreenControls?.arrows?.next,
        },
      },
    };
  }, [
    fsIntroDuration,
    fsIntroEasing,
    fullscreenIntroFade,
    fsCaptionPlacement,
    fsCaptionBreakpoint,
    fsCaptionWidth,
    fsCaptionHeight,
    fullscreenThumbnails,
    showFsClose,
    showFsCounter,
    showFsArrows,
    fullscreenControls,
    renderFsCaption,
    renderFsClose,
    renderFsCounter,
    renderFsArrows,
    renderFsPrev,
    renderFsNext,
  ]);

  const runSlideFullscreenIntro = useMemo(() => {
    return createSliderFullscreenIntroRunner({
      normalizedItems,
      isRtl: direction === "rtl",
      styles,
      fs: fsForIntro,
      overlayDivRef,
      duplicateImgRef,
      overlayCaptionRef,
      overlayCaptionRootRef,
      closeButtonRef,
      leftChevronRef,
      rightChevronRef,
      counterRef,
      fsThumbContainerRef,
      setShowFullscreenSlider,
      setFsFadeOpening,
      addShield,
      resolveFsCaptionPlacement,
      closestSelector: ".rmg__slide",
    });
  }, [
    normalizedItems,
    direction,
    styles,
    fsForIntro,
    overlayDivRef,
    duplicateImgRef,
    overlayCaptionRef,
    overlayCaptionRootRef,
    closeButtonRef,
    leftChevronRef,
    rightChevronRef,
    counterRef,
    fsThumbContainerRef,
    setShowFullscreenSlider,
    setFsFadeOpening,
    addShield,
    resolveFsCaptionPlacement,
  ]);

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

  const effectiveRippleEnabled = rippleEnabled !== false;
  const effectiveRippleClass = (rippleClassName && rippleClassName.trim().length > 0)
  ? rippleClassName
  : styles.ripple;

  const createRipple = useCallback((container: HTMLElement) => {
    if (!effectiveRippleEnabled || !container) return;

    const old = container.querySelector<HTMLElement>('[data-rmg-ripple]');
    if (old) old.remove();

    const rect = container.getBoundingClientRect();
    const diameter = Math.max(rect.width, rect.height);
    const radius   = diameter / 2;
    const x = rect.width  / 2 - radius;
    const y = rect.height / 2 - radius;

    const span = document.createElement('span');
    span.setAttribute('data-rmg-ripple', '');
    if (effectiveRippleClass) {
      span.className = effectiveRippleClass;
    }

    span.style.width  = `${diameter}px`;
    span.style.height = `${diameter}px`;
    span.style.left   = `${x}px`;
    span.style.top    = `${y}px`;

    container.appendChild(span);
    span.addEventListener('animationend', () => span.remove(), { once: true });
  }, [effectiveRippleEnabled, effectiveRippleClass]);

  const arrowNodes = (
    <RmgArrows
      axisMain={AX.main}
      clientKey={AX.clientKey}
      wrap={wrap}
      isRtl={isRtl}
      showArrows={showArrows}
      selectedIndex={selectedIndex.current}
      slideCount={slides.current?.length ?? 0}
      measureRef={slider}
      viewportMainSizeRef={sliderWidth}
      previous={previous}
      next={next}
      prevButtonRef={prevButtonRef}
      nextButtonRef={nextButtonRef}
      createRipple={createRipple}
      arrowStyles={arrowStyles}
      prevArrowStyles={prevArrowStyles}
      nextArrowStyles={nextArrowStyles}
      arrowClassName={arrowClassName}
      prevArrowClassName={prevArrowClassName}
      nextArrowClassName={nextArrowClassName}
      renderPrevArrow={renderPrevArrow}
      renderNextArrow={renderNextArrow}
      renderArrows={renderArrows}
    />
  );

  const { dotsNode } = buildDotsNode({
    AX,
    slider,
    sliderWidth,
    wrap,
    showDots,
    selectedIndex,
    slides,
    dotsContainerRef,
    dotRefs,
    isScrolling,
    goToIndex,
    renderDots,
    createRipple,
    styles,
    dotsContainerStyles,
    dotsStyles,
    dotsContainerClassName,
    dotsClassName,
  });

  useEffect(() => {
    if (hasResponsiveHeights) return;
    
    const el = slider.current;
    if (!el) return;

    if (!isReady) return;

    const ro = new ResizeObserver(entries => {
      let max = 0;
      for (const ent of entries) {
        max = Math.max(max, ent.contentRect.height || 0);
      }

      if (max < 1) return;

      if (Math.abs(max - lastNonZeroHeightRef.current) >= 1) {
        lastNonZeroHeightRef.current = max;
        setResponsiveSliderHeight(max + 'px');
      }
    });

    Array.from(el.children).forEach(child => ro.observe(child as Element));

    return () => ro.disconnect();
  }, [clonedChildren, visibleImages, wrap, isReady, hasResponsiveHeights]);

  const normalizedLoading = useMemo(() => {
    const src = loadingOptions ?? {};
    return {
      isLoading: src.isLoading,
      skeletonCount: src.skeletonCount,
      renderLoading: src.renderLoading,
    };
  }, [loadingOptions]);

  const normalizedIntro = useMemo(() => {
    const src = introOptions ?? {};
    return {
      renderIntro: src.renderIntro,
      staggerMs: src.staggerMs ?? 40,
      transform: src.transform ?? 10,
      durationMs: src.durationMs ?? 300,
      easing: src.easing ?? 'cubic-bezier(.2,.7,.2,1)',
    };
  }, [introOptions]);

  const introChildren = useMemo(
    () =>
      clonedChildren.map((child, i) => {
        if (!isValidElement(child)) return child;

        const el = child as React.ReactElement<any>;
        const prevStyle = (el.props?.style || {}) as React.CSSProperties;

        return cloneElement<any>(el, {
          ...el.props,
          'data-rmg-idx': i,
          style: {
            ...prevStyle,
            ['--rmg-intro-index' as any]: i,
          } as React.CSSProperties & Record<string, any>,
        });
      }),
    [clonedChildren]
  );

  const inner = (
    <>
      {arrowNodes}
      <div 
        className={[
          styles.viewport,
          sliderViewportClassName ?? "",
        ].join(" ")}
        style={{
          ...sliderViewportStyles,
        }}
      >
        <div
          ref={slider}
          className={`${styles.track} ${rtlCls}`}
          style={{ gap: `${gap}px`, [AX.sizeKey]: '100%' }}
        >
          {introChildren}
        </div>
      </div>
      {dotsNode}
      {progressNode}
    </>
  );

  const baseContainerProps: React.HTMLAttributes<HTMLDivElement> = {
    className: [
      styles.fade_container,
      rtlCls,
      (isReady && inView) ? styles.fadeInActive : styles.fadeInStart,
    ].join(' '),
    style: {
      position: 'relative',
      ...(heightVarValue != null ? { ['--rmg-slider-height' as any]: heightVarValue } : {}),
    },
    'aria-busy': !isReady ? true : undefined,
  };

  const columnsForSkeleton =
    typeof cellsPerSlide === 'number' && cellsPerSlide > 0
      ? cellsPerSlide
      : (visibleImages || visibleImagesRef.current || 1);

  const MAX_SKELETONS = 12;

  const bpMap = breakpointMap

  const { cssText: skeletonCss, ssrBaseCount: skeletonCountBase } = useMemo(() => {
    return buildScopedSkeletonCountCss({
      scopeId,
      responsiveCount: normalizedLoading.skeletonCount,
      fallbackCount: columnsForSkeleton,
      breakpointMap: bpMap,
      maxSlots: MAX_SKELETONS,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeId, normalizedLoading.skeletonCount, columnsForSkeleton, bpMap]);

  const defaultSliderSkeleton = (
    <div className={styles.sliderSkeletonOverlay} data-rmg-skel-part="overlay">
      <div className={styles.sliderSkeletonRow} data-rmg-skel-part="row">
        {Array.from({ length: MAX_SKELETONS }).map((_, i) => (
          <div
            key={`rmg-slider-skel-${i}`}
            className={styles.sliderSkeleton}
            data-rmg-skel-slot={i + 1}
          />
        ))}
      </div>
    </div>
  );

  const loadingNode = (!isReady)
    ? (
        normalizedLoading.renderLoading
          ? normalizedLoading.renderLoading({
              layout: 'slider',
              count: skeletonCountBase,
            })
          : defaultSliderSkeleton
      )
    : null;

  const introWrapped = normalizedIntro.renderIntro
    ? (
        <div {...baseContainerProps}>
          {normalizedIntro.renderIntro(
            { active: isReady && inView, containerProps: baseContainerProps },
            inner
          )}
        </div>
      )
    : (
        <div {...baseContainerProps}>{inner}</div>
      );


  return (
    <>
      {responsiveCss && <style dangerouslySetInnerHTML={{ __html: responsiveCss }} />}
      {baseCss && <style dangerouslySetInnerHTML={{ __html: baseCss }} />}
      {skeletonCss && <style dangerouslySetInnerHTML={{ __html: skeletonCss }} />}

      <div
        id={scopeId}
        data-rmg-scope={scopeId}
        ref={sliderContainer}
        className={[
          styles.slider_container,
          rtlCls,
          sliderContainerClassName ?? "",
        ].join(" ")}
        dir={isRtl ? 'rtl' : undefined}
        style={{
          position: 'relative',
          ...(heightVarValue != null ? { ['--rmg-slider-height' as any]: heightVarValue } : {}),
          ['--rmg-intro-stagger' as any]: `${normalizedIntro.staggerMs}ms`,
          ['--rmg-intro-transform' as any]: `${normalizedIntro.transform}px`,
          ['--rmg-intro-duration' as any]: `${normalizedIntro.durationMs}ms`,
          ['--rmg-intro-easing' as any]: normalizedIntro.easing,
          zIndex: 1,
          ...sliderContainerStyles,
        }}
      >
        {loadingNode}
        {introWrapped}
      </div>
    </>
  );
});

export default Slider