/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import {
  useRef,
  useEffect,
  ReactNode,
  Children,
  RefObject,
  useCallback,
  useImperativeHandle,
  forwardRef
} from 'react'
import type { APITypes } from 'plyr-react'
import styles from './FullscreenSlider.module.css'
import type { FullscreenSliderSub, FSRequest } from './fullscreenSliderSub'
import { createDragTracker } from '../shared/input/dragTracker'
import { Vector1D, Vector1DType } from '../shared/motion/vector1d'
import { ScrollBody, ScrollBodyType } from '../shared/motion/scrollBody'
import { Limit, LimitType } from '../shared/motion/limit'
import { ScrollLooper } from '../shared/motion/scrollLooper'
import { BaseTarget, factorAbs, mathSign, ScrollTarget, ScrollTargetType } from '../shared/motion/scrollTarget'
import { Animations, AnimationsType } from '../shared/motion/animations'
import { EventStore } from '../shared/motion/eventStore'
import { MediaItem } from '../shared/types/media'
import { isMouseEvent } from '../shared/input/pointerTypes'
import { WindowType } from '../shared/input/pointerTypes'
import { FullscreenAxisType as AxisType, FullscreenAxis as Axis, FullscreenAxisLike as AxisLike } from '../shared/types/axis'
import { TranslateFullscreen as Translate } from '../shared/motion/translate'
import { createBaseLimit } from '../shared/motion/baseLimit'
import { Counter, CounterType } from '../shared/motion/counter'
import { PercentOfView, PercentOfViewType, ScrollBounds, ScrollBoundsType } from '../shared/motion/scrollBounds'
import { useWheelLock } from '../shared/hooks/useWheelLock'
import { DefaultChevronIcon } from './DefaultChevronIcon'
import { FullscreenOptions } from './types'
import { getFsMediaContainer, getPrimaryImgEl } from '../zoomPan/core/dom'

const clamp01 = (n: number) => Math.max(0, Math.min(1, n))
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

function DragTracker(axis: AxisLike, ownerWindow: WindowType) {
  return createDragTracker({
    ownerWindow,
    axis,
  })
}

type FsScrollTo = {
  distance: (n: number, snap: boolean) => void
  index: (n: number, direction: number) => void
}

type FsLimit = {
  min: number
  max: number
  reachedAny: (n: number) => boolean
  constrain: (n: number) => number
  removeOffset: (n: number) => number
}

type PendingCloneToggleState = {
  canonicalIndex: number
  observer: IntersectionObserver | null
  rafId: number | null
  deadlineTs: number
}

interface FullscreenSliderProps {
  sub: FullscreenSliderSub
  children: ReactNode
  cellCount: number
  slideIndex: number
  isClick: React.RefObject<boolean>
  isZoomed: boolean
  windowSize: { width: number; height: number }
  show: boolean
  handleZoomToggle: (
    e:
      | React.PointerEvent<HTMLDivElement>
      | React.TouchEvent<HTMLDivElement>,
    imageRef: React.RefObject<HTMLDivElement | null>
  ) => void
  imageRefs: React.RefObject<HTMLDivElement | null>[]
  cells: RefObject<{ element: HTMLElement; index: number }[]>
  isPinching: React.RefObject<boolean>
  scale: number
  isTouchPinching: React.RefObject<boolean>
  showFullscreenSlider: boolean
  isZooming: RefObject<boolean>
  plyrRefs: RefObject<(APITypes | null)[]>
  plyrRef: RefObject<(APITypes | null)[]>
  closingModal: boolean
  counterRef: RefObject<HTMLElement | null>
  leftChevronRef: RefObject<HTMLElement | null>
  rightChevronRef: RefObject<HTMLElement | null>
  overlayDivRef: RefObject<HTMLDivElement | null>
  direction?: 'ltr' | 'rtl';
  isWrapping: RefObject<boolean>
  sliderDuration: number;
  sliderFriction: number;
  suppressLoopRef: React.RefObject<boolean>;
  fadeOpening: boolean;
  introFade?: boolean;
  slideFade?: boolean;
  slideFadeDuration?: number;
  slideFadeEasing?: string;
  normalizedItems: MediaItem[];
  introDuration?: number;
  introEasing?: string;
  resetAllZoomDom: () => void;
  requestFsCloseRef: React.RefObject<null | (() => void)>;
  introMethod?: "fade" | "scale" | null;
  fs: FullscreenOptions;
  chromeStyles: Record<string, string>;
}

export interface FullscreenSliderHandle {
  centerSlider(): void
}

export const FullscreenSlider = forwardRef<FullscreenSliderHandle, FullscreenSliderProps>(
  (
    {
      sub,
      children,
      cellCount,
      slideIndex,
      isClick,
      isZoomed,
      windowSize,
      show,
      handleZoomToggle,
      imageRefs,
      cells,
      isPinching,
      isTouchPinching,
      showFullscreenSlider,
      isZooming,
      plyrRefs,
      closingModal,
      counterRef,
      leftChevronRef,
      rightChevronRef,
      overlayDivRef,
      direction,
      sliderDuration,
      sliderFriction,
      suppressLoopRef,
      fadeOpening,
      introFade,
      slideFade = false,
      slideFadeDuration = 120,
      slideFadeEasing = 'cubic-bezier(.4,0,.22,1)',
      normalizedItems,
      introDuration = 300,
      introEasing = 'cubic-bezier(.4,0,.22,1)',
      resetAllZoomDom,
      requestFsCloseRef,
      introMethod,
      fs,
      chromeStyles
    },
    ref
  ) => {
    const isRtl = direction === 'rtl' ? true : false
    const rtlCls = isRtl ? styles.rtl : '';
    const sign = isRtl ? -1 : 1;
    const viewportRef = useRef<HTMLDivElement | null>(null)
    const slider = useRef<HTMLDivElement | null>(null)
    const axisRef = useRef<AxisType | null>(null)
    const locationRef = useRef<Vector1DType | null>(null)
    const previousLocationRef = useRef<Vector1DType | null>(null)
    const offsetLocationRef = useRef<Vector1DType | null>(null)
    const targetRef = useRef<Vector1DType | null>(null)
    const bodyRef = useRef<ScrollBodyType | null>(null)
    const translateRef = useRef<ReturnType<typeof Translate> | null>(null)
    const animRef = useRef<AnimationsType | null>(null)
    const isAnimatingRef = useRef(false)
    const pointerDownRef = useRef(false)
    const yTemp = useRef(0)
    const dragThreshold = 5
    const FADE_DISTANCE = 300
    const selectedIndex = useRef(0)
    const hasPositioned = useRef<boolean>(false)
    const perSlideRef = useRef(0)
    const contentSizeRef = useRef(0)
    const loopLimitRef = useRef<ReturnType<typeof Limit> | null>(null)
    const looperRef = useRef<ReturnType<typeof ScrollLooper> | null>(null)
    const scrollSnapsRef = useRef<number[]>([])
    const scrollContentSizeRef = useRef(0)
    const scrollLimitRef = useRef<FsLimit | null>(null)
    const scrollTargetRef = useRef<ScrollTargetType | null>(null)
    const scrollToRef = useRef<FsScrollTo | null>(null)
    const slides = useRef<{ cells: { element: HTMLElement }[] }[]>([])
    const indexCurrentRef = useRef<CounterType | null>(null)
    const indexPreviousRef = useRef<CounterType | null>(null)
    const isPointerDown = useRef(false)
    const isVerticalScroll = useRef(false)
    const isScrolling = useRef(false)
    const isClosing = useRef(false)
    const clickedImgMargin = useRef(false)
    const dragStartY = useRef(0)
    const dragYForClose = useRef(0)
    const x = useRef(0)
    const y = useRef(0)
    const velocityX = useRef(0)
    const dragX = useRef(0)
    const previousDragX = useRef(0)
    const dragMoveTime = useRef<Date | null>(null)
    const activeTouchCount = useRef(0)
    const wasPinch = useRef(false)
    const appliedYRef = useRef(0)
    const overlayOpacityRef = useRef(1)
    type DragMode = 'none' | 'x' | 'y'
    const dragMode = useRef<DragMode>('none')
    const limitRef = useRef<LimitType | null>(null)
    const povRef    = useRef<PercentOfViewType | null>(null)
    const boundsRef = useRef<ScrollBoundsType | null>(null)
    const pendingCloneToggleRef = useRef<PendingCloneToggleState | null>(null)

        type ElementStyleLike = { className?: string; style?: React.CSSProperties } | null | undefined;

    function mergeClassNames(...parts: Array<string | undefined | null | false>) {
      return parts.filter(Boolean).join(' ');
    }

    function styleFromElementStyle(es?: ElementStyleLike) {
      return (es?.style ?? undefined) as React.CSSProperties | undefined;
    }

    function classFromElementStyle(es?: ElementStyleLike) {
      return es?.className ?? '';
    }

    function getArrowAction(side: 'left' | 'right', isRtl: boolean): 'prev' | 'next' {
      if (side === 'left') return isRtl ? 'next' : 'prev';
      return isRtl ? 'prev' : 'next';
    }

    const allowFsArrows =
      fs?.controls?.arrows?.enabled !== false && cellCount > 1;

    const arrows = fs?.controls?.arrows;

    const renderArrowNode = (dir: 'prev' | 'next', side: 'left' | 'right') => {
      const explicit =
        dir === 'prev'
          ? typeof arrows?.renderPrev === 'function' ? arrows.renderPrev() : null
          : typeof arrows?.renderNext === 'function' ? arrows.renderNext() : null;

      if (explicit != null) return explicit;

      if (typeof arrows?.render === 'function') {
        const node = arrows.render({ dir });
        if (node != null) return node;
      }

      return <DefaultChevronIcon side={side} />;
    };

    function useLatest<T>(value: T) {
      const r = useRef(value)
      useEffect(() => { r.current = value }, [value])
      return r
    }
    const isZoomedRef = useLatest(isZoomed)

    const {
      wheelLockMs: WHEEL_LOCK_MS,
      lockWheelFor,
      unlockWheelNow,
      markWheelSeen,
      isWheelLocked,
    } = useWheelLock()

    function syncLoopGeometry(per: number, len: number) {
      const safeLen = len || 1
      const W = per * safeLen

      perSlideRef.current = per
      contentSizeRef.current = W
      scrollContentSizeRef.current = W

      const loopLimit = Limit(-W, 0)
      loopLimitRef.current = loopLimit

      scrollLimitRef.current = createBaseLimit(-W, 0)

      const snaps = Array.from({ length: safeLen }, (_, i) => -per * i)
      scrollSnapsRef.current = snaps

      const location = locationRef.current
      const previousLocation = previousLocationRef.current
      const offsetLocation = offsetLocationRef.current
      const target = targetRef.current

      if (!location || !previousLocation || !offsetLocation || !target) {
        scrollTargetRef.current = null
        looperRef.current = null
        return
      }

      scrollTargetRef.current = ScrollTarget(
        true,
        snaps,
        W,
        loopLimit,
        target
      )

      looperRef.current = ScrollLooper(
        W,
        loopLimit,
        location,
        [location, previousLocation, offsetLocation, target]
      )
    }

    const recenterWithAnchor = useCallback(() => {
      const track = slider.current;
      if (
        !track ||
        !locationRef.current ||
        !previousLocationRef.current ||
        !offsetLocationRef.current ||
        !targetRef.current
      ) {
        return;
      }

      const per = track.clientWidth || 1;
      const len = slides.current.length || 1;
      syncLoopGeometry(per, len)

      const idx =
        indexCurrentRef.current?.get() ??
        selectedIndex.current ??
        0;

      const nx = -per * idx;

      setAllX(nx);
      setTranslateX(nx, 0);
      animRef.current?.resetBlend();
    }, []);
    
    useEffect(() => {
      const el = slider.current;
      if (!el) return;

      const update = () => {
        recenterWithAnchor();
      };

      update();

      const ro = new ResizeObserver(update);
      ro.observe(el);

      return () => ro.disconnect();
    }, [show, recenterWithAnchor]);

    useEffect(() => {
      const childrenArray = Children.toArray(children)
      slides.current = []
      if (cellCount > 1) {
        for (let i = 1; i < childrenArray.length - 1; i++) {
          slides.current.push({ cells: [cells.current[i]] as any })
        }
      } else {
        for (let i = 0; i < childrenArray.length; i++) {
          slides.current.push({ cells: [cells.current[i]] as any })
        }
      }
    }, [children])

    function commitIndexChange(idx: number) {
      selectedIndex.current = idx;
      indexCurrentRef.current?.set(idx);
      sub.setLocalIndex(idx);
      updateCounterFromIndex(idx);

      resetAllZoomDom();
    }
    
    const GLOBAL_DRAG_ATTR = 'data-rmg-global-drag';
    const GLOBAL_DRAG_STYLE_ID = 'rmg-global-drag-style';

    function ensureGlobalDragStyle() {
      if (document.getElementById(GLOBAL_DRAG_STYLE_ID)) return;
      const style = document.createElement('style');
      style.id = GLOBAL_DRAG_STYLE_ID;
      style.textContent = `
        html[${GLOBAL_DRAG_ATTR}] * { cursor: grabbing !important; }
        html[${GLOBAL_DRAG_ATTR}] { cursor: grabbing !important; }
      `;
      document.head.appendChild(style);
    }

    function setGlobalGrabbing(on: boolean) {
      const html = document.documentElement;
      if (!html) return;
      if (on) html.setAttribute(GLOBAL_DRAG_ATTR, '');
      else    html.removeAttribute(GLOBAL_DRAG_ATTR);
    }

    function useGlobalGrabbingGuards() {
      const guardsRef = useRef<ReturnType<typeof EventStore> | null>(null);

      const start = () => {
        if (guardsRef.current) return;
        ensureGlobalDragStyle();
        setGlobalGrabbing(true);
        guardsRef.current = EventStore()
          .add(window,   'mouseup',          stop, true)
          .add(window,   'pointerup',        stop, true)
          .add(window,   'touchend',         stop, { passive: true })
          .add(window,   'touchcancel',      stop, { passive: true })
          .add(window,   'blur',             stop, true)
          .add(document, 'visibilitychange', () => { if (document.hidden) stop(); });
      };

      const stop = () => {
        guardsRef.current?.clear();
        guardsRef.current = null;
        setGlobalGrabbing(false);
      };

      useEffect(() => stop, []);

      return { start, stop };
    }

    const { start: startGrabbing, stop: stopGrabbing } = useGlobalGrabbingGuards();

    const slideFadeBusyRef = useRef(false);

    const SLIDE_FADE_MS = slideFadeDuration;
    const SLIDE_FADE_EASING = slideFadeEasing

    function jumpToIndexInstant(idx: number) {
      const per = perSlide();
      const nx = -per * idx;

      animRef.current?.stop();
      bodyRef.current?.useDuration(0).useFriction(1);

      setAllX(nx);
      setTranslateX(nx, 0);

      commitIndexChange(idx);
    }

    function fadeToIndex(idx: number) {
      if (!slideFade) return;

      const track = slider.current;
      if (!track) return;

      if (!showFullscreenSlider) return;

      slideFadeBusyRef.current = true;

      const prevTransition = track.style.transition;
      const prevOpacity = track.style.opacity;

      track.style.transition = `opacity ${SLIDE_FADE_MS}ms ${SLIDE_FADE_EASING}`;

      const computed = window.getComputedStyle(track).opacity;
      track.style.opacity = computed;
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      (track as any).offsetWidth;

      track.style.opacity = '0';

      const t1 = window.setTimeout(() => {

        jumpToIndexInstant(idx);

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        (track as any).offsetWidth;

        track.style.opacity = '1';

        const t2 = window.setTimeout(() => {
          track.style.transition = prevTransition;
          if (!prevTransition) track.style.opacity = prevOpacity;

          slideFadeBusyRef.current = false;
          window.clearTimeout(t2);
        }, SLIDE_FADE_MS + 40);

        window.clearTimeout(t1);
      }, SLIDE_FADE_MS + 20);
    }

    function perSlide() {
      return perSlideRef.current || slider.current?.clientWidth || 1
    }
    function slideCount() {
      return slides.current.length || 1
    }
    function resolveStartIndex(requestedIndex: number, len: number) {
      const safeLen = Math.max(1, len)
      return ((requestedIndex % safeLen) + safeLen) % safeLen
    }

    function commitXY(canonicalX: number, ny: number) {
      const nx = Math.round(canonicalX) * sign;
      translateRef.current?.to(nx, ny)
    }

    function getOverlayOpacityFromDrag(dyPx: number) {
      return 1 - clamp01(Math.abs(dyPx) / FADE_DISTANCE)
    }

    function setOverlayOpacity(next: number) {
      const clamped = clamp01(next)
      if (Math.abs(overlayOpacityRef.current - clamped) < 0.001) return
      overlayOpacityRef.current = clamped
      if (overlayDivRef.current) {
        overlayDivRef.current.style.opacity = String(clamped)
      }
    }

    useEffect(() => {
      if (closingModal) {
        animRef.current?.stop()
        pointerDownRef.current = false
      }
    }, [closingModal])

    useEffect(() => {
      if (!slider.current || hasPositioned.current) return

      const len = Math.max(1, slides.current.length || cellCount || 1)
      const startIndex = resolveStartIndex(slideIndex, len)

      selectedIndex.current = startIndex
      sub.setLocalIndex(startIndex)
      updateCounterFromIndex(startIndex)

      setTimeout(() => {
        if (!slider.current) return
        const per = perSlideRef.current || slider.current.clientWidth
        const startX = -per * startIndex
        x.current = startX
        y.current = 0
        if (locationRef.current && previousLocationRef.current && offsetLocationRef.current && targetRef.current) {
          locationRef.current.set(startX)
          previousLocationRef.current.set(startX)
          offsetLocationRef.current.set(startX)
          targetRef.current.set(startX)
          setTranslateX(startX, 0)
        } else {
          const sx = Math.round(startX) * sign
          slider.current.style.transform = `translate3d(${sx}px, 0, 0)`
        }
      }, 100)

      hasPositioned.current = true
    }, [show, slides.current])

    const ySnapTweenId = { current: 0 }
    function snapBackY(ms = 300) {
      const startId = ++ySnapTweenId.current
      const fromY = yTemp.current || 0
      const start = performance.now()
      const step = (now: number) => {
        if (startId !== ySnapTweenId.current || isPointerDown.current) return
        const t = Math.min(1, (now - start) / ms)
        const k = easeOutCubic(t)
        yTemp.current = fromY + (0 - fromY) * k
        const xNow = offsetLocationRef.current!.get()
        y.current = yTemp.current
        commitXY(xNow, y.current)
        setOverlayOpacity(getOverlayOpacityFromDrag(y.current * 2))
        if (t >= 1) {
          y.current = 0
          yTemp.current = 0
          appliedYRef.current = 0
          setOverlayOpacity(1)
          restoreOverlayTransition()
          return
        }
        if (t < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }

    function disableOverlayTransition() {
      if (overlayDivRef.current) overlayDivRef.current.style.transition = 'opacity 0s'
    }
    function restoreOverlayTransition() {
      if (overlayDivRef.current) overlayDivRef.current.style.transition = ''
    }

    useEffect(() => {
      if (!show) {
        overlayOpacityRef.current = 1
        return
      }

      if (!showFullscreenSlider || closingModal) return

      overlayOpacityRef.current = 1
      if (overlayDivRef.current) {
        overlayDivRef.current.style.opacity = '1'
      }
    }, [show, showFullscreenSlider, closingModal])

    function scrollToIndex(
      requested: number,
      opts: { jump?: boolean; direction?: number } = {}
    ) {
      const { jump = false, direction } = opts;

      const indexCurrent = indexCurrentRef.current;
      const fsScrollTo   = scrollToRef.current;
      const body         = bodyRef.current;

      if (!fsScrollTo || !body || !indexCurrent) return;

      const len = slideCount();
      const from = ((selectedIndex.current || 0) % len + len) % len;
      const to   = ((requested || 0) % len + len) % len;

      const crossesSeam =
        len > 1 &&
        ((from === 0 && to === len - 1) || (from === len - 1 && to === 0));

      if (
        crossesSeam &&
        isZoomedRef.current &&
        cellCount > 1 &&
        selectedIndex.current === 0
      ) {
        const refs = imageRefs;

        const firstRealImg =
          refs[1]?.current?.querySelector('img') as HTMLElement | null;

        const firstCloneImg =
          refs[cellCount + 1]?.current?.querySelector('img') as HTMLElement | null;

        if (firstRealImg && firstCloneImg) {
          const extractScale = (el: HTMLElement | null): number => {
            if (!el) return 1;
            const tr = el.style.transform || '';
            const m = tr.match(/scale\(([^)]+)\)/);
            if (!m) return 1;
            const v = parseFloat(m[1]);
            return Number.isFinite(v) ? v : 1;
          };

          const readTransform = (el: HTMLElement): string => {
            let transform = el.style.transform;
            if (!transform) {
              const cs = window.getComputedStyle(el);
              transform = cs.transform !== 'none' ? cs.transform : '';
            }
            return transform || '';
          };

          const realScale  = extractScale(firstRealImg);
          const cloneScale = extractScale(firstCloneImg);

          if (realScale > 1.01 && cloneScale <= 1.01) {
            const transform = readTransform(firstRealImg);
            firstCloneImg.style.transition = 'none';
            firstCloneImg.style.transform  = transform;

            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            (firstCloneImg as any).offsetWidth;
          }

          // Copy clone -> real if clone is zoomed but real isn't
          if (cloneScale > 1.01 && realScale <= 1.01) {
            const transform = readTransform(firstCloneImg);
            firstRealImg.style.transition = 'none';
            firstRealImg.style.transform  = transform;

            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            (firstRealImg as any).offsetWidth;
          }
        }
      }

      const targetIndex = indexCurrent.clone().set(requested).get();

      if (jump) {
        body.useDuration(0);
      } else {
        body.useBaseDuration().useBaseFriction();
      }

      const dir = typeof direction === 'number' ? direction : 0;
      fsScrollTo.index(targetIndex, dir);
    }

    function previous() {
      isVerticalScroll.current = false;
      isScrolling.current = false;
      isPinching.current = false;
      isTouchPinching.current = false;
      suppressLoopRef.current = false;

      if (isZoomedRef.current && cellCount > 1 && selectedIndex.current === 0) {
        const refs = imageRefs;

        const firstRealImg =
          refs[1]?.current?.querySelector('img') as HTMLElement | null;
        const firstCloneImg =
          refs[cellCount + 1]?.current?.querySelector('img') as HTMLElement | null;

        if (firstRealImg && firstCloneImg) {
          const extractScale = (el: HTMLElement | null): number => {
            if (!el) return 1;
            const tr = el.style.transform || '';
            const m = tr.match(/scale\(([^)]+)\)/);
            if (!m) return 1;
            const v = parseFloat(m[1]);
            return Number.isFinite(v) ? v : 1;
          };

          const realScale  = extractScale(firstRealImg);
          const cloneScale = extractScale(firstCloneImg);

          if (realScale > 1.01 && cloneScale <= 1.01) {
            let transform = firstRealImg.style.transform;
            if (!transform) {
              const cs = window.getComputedStyle(firstRealImg);
              transform = cs.transform !== 'none' ? cs.transform : '';
            }

            firstCloneImg.style.transition = 'none';
            firstCloneImg.style.transform  = transform;

            (firstCloneImg as any).offsetWidth;
          }

          if (cloneScale > 1.01 && realScale <= 1.01) {
            let transform = firstCloneImg.style.transform;
            if (!transform) {
              const cs = window.getComputedStyle(firstCloneImg);
              transform = cs.transform !== 'none' ? cs.transform : '';
            }

            firstRealImg.style.transition = 'none';
            firstRealImg.style.transform  = transform;

            (firstRealImg as any).offsetWidth;
          }
        }
      }

      const len = slideCount();
      const cur = selectedIndex.current || 0;
      const nextIdx = ((cur - 1) % len + len) % len;

      if (slideFade) {
        fadeToIndex(nextIdx);
        return;
      }

      const fsScrollTo = scrollToRef.current;
      const body = bodyRef.current;
      if (!fsScrollTo || !body) return;

      const step = perSlide();

      body.useBaseDuration().useBaseFriction();
      fsScrollTo.distance(step, true);
      sub.emitBasePointerDown?.();
    }

    function next() {
      isVerticalScroll.current = false;
      isScrolling.current = false;
      isPinching.current = false;
      isTouchPinching.current = false;
      suppressLoopRef.current = false;

      if (isZoomedRef.current && cellCount > 1 && selectedIndex.current === 0) {
        const refs = imageRefs;

        const firstRealImg =
          refs[1]?.current?.querySelector('img') as HTMLElement | null;
        const firstCloneImg =
          refs[cellCount + 1]?.current?.querySelector('img') as HTMLElement | null;

        if (firstRealImg && firstCloneImg) {
          const extractScale = (el: HTMLElement | null): number => {
            if (!el) return 1;
            const tr = el.style.transform || '';
            const m = tr.match(/scale\(([^)]+)\)/);
            if (!m) return 1;
            const v = parseFloat(m[1]);
            return Number.isFinite(v) ? v : 1;
          };

          const realScale  = extractScale(firstRealImg);
          const cloneScale = extractScale(firstCloneImg);

          if (realScale > 1.01 && cloneScale <= 1.01) {
            let transform = firstRealImg.style.transform;
            if (!transform) {
              const cs = window.getComputedStyle(firstRealImg);
              transform = cs.transform !== 'none' ? cs.transform : '';
            }

            firstCloneImg.style.transition = 'none';
            firstCloneImg.style.transform  = transform;

            (firstCloneImg as any).offsetWidth;
          }

          if (cloneScale > 1.01 && realScale <= 1.01) {
            let transform = firstCloneImg.style.transform;
            if (!transform) {
              const cs = window.getComputedStyle(firstCloneImg);
              transform = cs.transform !== 'none' ? cs.transform : '';
            }

            firstRealImg.style.transition = 'none';
            firstRealImg.style.transform  = transform;

            (firstRealImg as any).offsetWidth;
          }
        }
      }

      const len = slideCount();
      const cur = selectedIndex.current || 0;
      const nextIdx = ((cur + 1) % len + len) % len;

      if (slideFade) {
        fadeToIndex(nextIdx);
        return;
      }

      const fsScrollTo = scrollToRef.current;
      const body = bodyRef.current;
      if (!fsScrollTo || !body) return;

      const step = perSlide();

      body.useBaseDuration().useBaseFriction();
      fsScrollTo.distance(-step, true);
      sub.emitBasePointerDown?.();
    }

    function updateCounterFromIndex(canonicalIndex: number) {
      const len = slides.current.length || 1

      let actualIndex = canonicalIndex + 1
      actualIndex = ((actualIndex % len) + len) % len

      if (actualIndex === 0) actualIndex = cellCount

      if (counterRef.current) {
        counterRef.current.textContent = `${actualIndex} / ${cellCount}`
      }
    }

    function findOriginalFsSlideForCanonical(canonicalIndex: number): HTMLElement | null {
      const track = slider.current
      if (!track) return null

      return track.querySelector<HTMLElement>(
        `[data-rmg-fs-slide="true"][data-rmg-canonical-idx="${canonicalIndex}"][data-rmg-clone="false"]`
      )
    }

    function findOriginalRenderedIndexForCanonical(canonicalIndex: number): number | null {
      const originalSlide = findOriginalFsSlideForCanonical(canonicalIndex)
      if (!originalSlide) return null

      const renderedAttr = originalSlide.getAttribute('data-index')
      const renderedIndex = renderedAttr != null ? parseInt(renderedAttr, 10) : NaN
      return Number.isFinite(renderedIndex) ? renderedIndex : null
    }

    function toggleCanonicalVideoPlayStrict(canonicalIndex: number): boolean {
      const renderedIndex = findOriginalRenderedIndexForCanonical(canonicalIndex)
      if (renderedIndex == null) return false

      const api = plyrRefs.current[renderedIndex] || null
      const player: APITypes["plyr"] | null = api?.plyr ?? null
      if (!player) return false

      const isPlaying = typeof player.playing === 'boolean'
        ? player.playing
        : !player.paused

      if (isPlaying) {
        player.pause()
        return true
      }

      const playResult = player.play()
      if (
        playResult &&
        typeof (playResult as Promise<void>).catch === 'function'
      ) {
        (playResult as Promise<void>).catch(() => {})
      }
      return true
    }

    function cancelPendingCloneToggle() {
      const pending = pendingCloneToggleRef.current
      if (!pending) return

      pending.observer?.disconnect()
      if (pending.rafId != null) cancelAnimationFrame(pending.rafId)

      pendingCloneToggleRef.current = null
    }

    function startPendingCloneToggleRetry(canonicalIndex: number) {
      const pending = pendingCloneToggleRef.current
      if (!pending || pending.canonicalIndex !== canonicalIndex) return

      pending.deadlineTs = performance.now() + 1200

      const tick = () => {
        const current = pendingCloneToggleRef.current
        if (current !== pending) return

        if (toggleCanonicalVideoPlayStrict(canonicalIndex)) {
          cancelPendingCloneToggle()
          return
        }

        if (performance.now() >= pending.deadlineTs) {
          cancelPendingCloneToggle()
          return
        }

        pending.rafId = requestAnimationFrame(tick)
      }

      pending.rafId = requestAnimationFrame(tick)
    }

    function armCloneToggleOnVisibility(canonicalIndex: number) {
      cancelPendingCloneToggle()
      scrollToIndex(canonicalIndex)

      const slideEl = findOriginalFsSlideForCanonical(canonicalIndex)
      const root = viewportRef.current
      if (!slideEl || !root) return

      const pending: PendingCloneToggleState = {
        canonicalIndex,
        observer: null,
        rafId: null,
        deadlineTs: 0,
      }

      const observer = new IntersectionObserver(
        (entries) => {
          const current = pendingCloneToggleRef.current
          if (current !== pending) return

          for (const entry of entries) {
            if (!entry.isIntersecting || (entry.intersectionRatio ?? 0) < 0.1) continue

            pending.observer?.disconnect()
            pending.observer = null
            startPendingCloneToggleRetry(canonicalIndex)
            return
          }
        },
        {
          root,
          rootMargin: '0px',
          threshold: [0, 0.1],
        }
      )

      pending.observer = observer
      pendingCloneToggleRef.current = pending
      observer.observe(slideEl)
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

      const slide = under.closest('[data-rmg-fs-slide="true"]') as HTMLElement | null;
      if (!slide) return null;

      const videoSurface =
        (slide.querySelector('[data-rmg-video-snapshot="true"]') as HTMLElement | null) ??
        (slide.querySelector('[data-rmg-plyr="true"]') as HTMLElement | null);
      if (!videoSurface) return null;

      const wrap =
        (videoSurface.querySelector('.plyr__video-wrapper') as HTMLElement | null) ??
        videoSurface;

      const r = wrap.getBoundingClientRect();
      const inside =
        x >= r.left && x <= r.right &&
        y >= r.top  && y <= r.bottom;

      if (under.closest('.plyr__controls')) return null;

      if (!inside) return null;

      const renderedAttr = slide.getAttribute('data-index');
      const canonicalAttr = slide.getAttribute('data-rmg-canonical-idx');
      const renderedIndex = renderedAttr != null ? parseInt(renderedAttr, 10) : NaN;
      const canonicalIndex = canonicalAttr != null ? parseInt(canonicalAttr, 10) : NaN;
      if (!Number.isFinite(renderedIndex) || !Number.isFinite(canonicalIndex)) return null;

      return {
        renderedIndex,
        canonicalIndex,
        isClone: slide.getAttribute('data-rmg-clone') === 'true',
      };
    }

    function resolveClickedImageTarget(
      target: HTMLElement | null,
      evt: MouseEvent | TouchEvent
    ): {
      clickedImg: HTMLImageElement | null;
      renderedIndex: number | null;
    } {
      if (!target) return { clickedImg: null, renderedIndex: null };

      const slide = target.closest('[data-rmg-fs-slide="true"]') as HTMLElement | null;
      const mediaContainer = getFsMediaContainer(target);
      const clickedImg = mediaContainer ? getPrimaryImgEl(mediaContainer) : null;
      if (!clickedImg) {
        return { clickedImg: null, renderedIndex: null };
      }

      const { x, y } = getClientXY(evt);
      const rect = clickedImg.getBoundingClientRect();
      const insideImage =
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom;

      if (!insideImage) {
        return { clickedImg: null, renderedIndex: null };
      }

      const renderedAttr =
        slide?.getAttribute('data-index') ??
        clickedImg?.dataset.index ??
        null;
      const renderedIndex = renderedAttr != null ? parseInt(renderedAttr, 10) : NaN;

      return {
        clickedImg,
        renderedIndex: Number.isFinite(renderedIndex) ? renderedIndex : null,
      };
    }

    useEffect(() => {
      const root = viewportRef.current;
      const track = slider.current;
      if (!root || !track) return;

      const axis = Axis();
      axisRef.current = axis;

      const per = perSlideRef.current || track.clientWidth || 1;
      const len = slides.current.length || 1;

      const counterMax = len - 1;
      const startIndex = resolveStartIndex(slideIndex, len);

      const location         = Vector1D(0);
      const previousLocation = Vector1D(0);
      const offsetLocation   = Vector1D(0);
      const target           = Vector1D(0);

      locationRef.current         = location;
      previousLocationRef.current = previousLocation;
      offsetLocationRef.current   = offsetLocation;
      targetRef.current           = target;

      syncLoopGeometry(per, len)

      const scrollSnaps = scrollSnapsRef.current

      const initialSnap = scrollSnaps[startIndex] ?? 0;

      location.set(initialSnap);
      previousLocation.set(initialSnap);
      offsetLocation.set(initialSnap);
      target.set(initialSnap);
      x.current = initialSnap;

      translateRef.current = Translate(track);
      setTranslateX(initialSnap, 0);

      const indexCurrent  = Counter(counterMax, startIndex, true);
      const indexPrevious = Counter(counterMax, startIndex, true);

      indexCurrentRef.current  = indexCurrent;
      indexPreviousRef.current = indexPrevious;

      selectedIndex.current = startIndex;
      sub.setLocalIndex(startIndex);
      updateCounterFromIndex(startIndex);

      function scrollTo(target: BaseTarget): void {
        const indexCurrent  = indexCurrentRef.current;
        const indexPrevious = indexPreviousRef.current;
        if (!indexCurrent || !indexPrevious) return;

        const distanceDiff = target.distance;
        const indexDiff    = target.index !== indexCurrent.get();

        targetRef.current!.add(distanceDiff);

        if (distanceDiff) {
          if (bodyRef.current!.duration()) {
            animRef.current!.start();
          } else {
            bodyRef.current!.seek();
            positionSlider();
          }
        }

        if (indexDiff) {
          indexPrevious.set(indexCurrent.get());
          indexCurrent.set(target.index);

          const idx = indexCurrent.get();
          commitIndexChange(idx);
        }
      }

      const fsScrollTo: FsScrollTo = {
        distance(n, snap) {
          const st = scrollTargetRef.current;
          if (!st) return;
          const target = st.byDistance(n, snap);
          scrollTo(target);
        },
        index(n, direction) {
          const st = scrollTargetRef.current;
          const indexCurrent = indexCurrentRef.current;
          if (!st || !indexCurrent) return;

          const targetIndex = indexCurrent.clone().set(n).get();
          const target = st.byIndex(targetIndex, direction);

          scrollTo(target);
        },
      };

      scrollToRef.current = fsScrollTo;

      const body = ScrollBody(location, offsetLocation, previousLocation, target, sliderDuration, sliderFriction)
      bodyRef.current = body

      if (cellCount === 1) {
        const cw = (track as any)['clientWidth'] as number;
        const per = track.clientWidth || 1;
        perSlideRef.current = per;

        const len = slides.current.length || 1;
        const W   = per * len;
        const min = -(Math.max(0, W - cw))
        const max = 0
        limitRef.current = Limit(isNaN(min) ? 0 : min, max)
  
        povRef.current    = PercentOfView(cw)
        boundsRef.current = ScrollBounds(
          limitRef.current,
          locationRef.current!,
          targetRef.current!,
          bodyRef.current!,
          povRef.current,
          sliderDuration
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
          if (cellCount === 1) {
            boundsRef.current?.constrain(pointerDownRef.current)
          }
          
          bodyRef.current?.seek()

          const dir  = body.direction() || Math.sign(target.get() - location.get()) || 0
          if (!suppressLoopRef.current && cellCount > 1 && contentSizeRef.current > 0) {
            looperRef.current?.loop(dir);
          }

          x.current = location.get()
        },
        (alpha) => {
          const cur = location.get()
          const prev = previousLocation.get()
          const loc = cur * alpha + prev * (1 - alpha)

          offsetLocation.set(loc)
          x.current = loc
          y.current = isVerticalScroll.current ? yTemp.current : y.current

          positionSlider()

          const oob = cellCount === 1 && (boundsRef.current?.passed() ?? false)
          const settled = bodyRef.current?.settled() && !oob
          if (settled && !pointerDownRef.current) {
            animRef.current?.stop()
            isAnimatingRef.current = false
          }
          if (!isZoomedRef.current && !isAnimatingRef.current) {
            updateActiveIndexFromX(loc)
          }
        }
      )
      animRef.current = anim
      anim.init()

      const dragStore = EventStore()
      const moveStore = EventStore()
      const trackerX = DragTracker(axis, window as WindowType)

      const axisY: AxisLike = {
        scroll: 'y',
        cross: 'x',
        direction(n: number) { return n },
        measureSize: (r: DOMRect) => r.height
      }
      const trackerY = DragTracker(axisY, window as WindowType)

      let isMouse = false
      let preventScroll = false
      let startPX = 0
      let startPY = 0
      const dragThresholdLocal = dragThreshold

      function addDragEvents() {
        const node: any = isMouse ? document : root
        moveStore
          .add(node, 'touchmove', onMove as any, { passive: false })
          .add(node, 'touchend', onUp as any)
          .add(node, 'mousemove', onMove as any, { passive: false })
          .add(node, 'mouseup', onUp as any)
      }

      function onDown(evt: PointerEvent) {
        const targetEl = evt.target as HTMLElement;
        if (isPlyrControlsEl(targetEl)) return;

        const hit = (evt.target as Node)

        if (leftChevronRef.current?.contains(hit)) return
        if (rightChevronRef.current?.contains(hit)) return

        if (isZoomedRef.current || closingModal) return

        sub.emitBasePointerDown?.();
        
        const isMouseEvt = isMouseEvent(evt as any, window as any)
        isMouse = isMouseEvt
        if (isMouseEvt && (evt as MouseEvent).button !== 0) return

        startGrabbing();
        lockWheelFor(WHEEL_LOCK_MS);

        wasPinch.current = false
        isTouchPinching.current = false
        activeTouchCount.current = !isMouseEvt
          ? ((evt as unknown as TouchEvent).touches?.length ?? 1)
          : 0

        pointerDownRef.current = true
        isPointerDown.current = true
        isScrolling.current = false
        isPinching.current = false
        isTouchPinching.current = false
        isClick.current = true
        dragMode.current = 'none'
        yTemp.current = 0
        dragStartY.current = 0
        dragYForClose.current = 0

        trackerX.pointerDown(evt as any)
        trackerY.pointerDown(evt as any)

        startPX = trackerX.readPoint(evt as any, 'x')
        startPY = trackerY.readPoint(evt as any, 'y')

        bodyRef.current!.useFriction(0).useDuration(0)
        targetRef.current!.set(locationRef.current!.get())

        addDragEvents()
        animRef.current?.start()
      }

      function onMove(evt: PointerEvent) {
        if (isZoomedRef.current) return
        const isTouchEvt = !isMouseEvent(evt as any, window as any)
        if (isTouchEvt) {
          const t = evt as unknown as TouchEvent
          activeTouchCount.current = t.touches?.length ?? 1
          if (activeTouchCount.current >= 2) {
            wasPinch.current = true
            isTouchPinching.current = true
            isClick.current = false
            dragMode.current = 'none'
            animRef.current?.stop()
            if (t.cancelable)  {
              t.preventDefault()
            }
            return
          }
        }

        const lastScroll = trackerX.readPoint(evt as any, 'x')
        const lastCross = trackerY.readPoint(evt as any, 'y')
        const dxAbs = Math.abs(lastScroll - startPX)
        const dyAbs = Math.abs(lastCross - startPY)

        if (dragMode.current === 'none') {
          if (dxAbs > dragThresholdLocal || dyAbs > dragThresholdLocal) {
            dragMode.current = dxAbs >= dyAbs ? 'x' : 'y'
            isClick.current = false
            if (dragMode.current === 'y') {
              isVerticalScroll.current = true
              dragStartY.current = lastCross
              yTemp.current = 0
            }
          }
        }

        disableOverlayTransition()

        const diffX = trackerX.pointerMove(evt as any).dx * sign
        trackerY.pointerMove(evt as any)

        previousDragX.current = dragX.current
        dragX.current = lastScroll * sign
        velocityX.current = diffX
        dragMoveTime.current = new Date()

        if (!preventScroll && !isMouse && dragMode.current === 'x') {
          if (!('cancelable' in evt) || !(evt as any).cancelable) return
          preventScroll = dxAbs > dyAbs
          if (!preventScroll) return
        }

        if (dragMode.current === 'y') {
          const dy = lastCross - dragStartY.current
          dragYForClose.current = dy
          yTemp.current = dy * 0.5
          y.current = yTemp.current
          const xNow = offsetLocationRef.current!.get()
          commitXY(xNow, y.current)
          setOverlayOpacity(getOverlayOpacityFromDrag(dy))

          evt.preventDefault?.()
          return
        }

        bodyRef.current!.useFriction(0.3).useDuration(0.75)
        const delta = axisRef.current!.direction(diffX)
        targetRef.current!.add(delta)
        animRef.current?.start()

        if ((evt as any).cancelable) evt.preventDefault()
      }

      function onUp(evt: PointerEvent) {
        const isTouchEvt = !isMouseEvent(evt as any, window as any)
        if (isTouchEvt && (isTouchPinching.current || wasPinch.current)) {
          const t = evt as unknown as TouchEvent
          activeTouchCount.current = t.touches?.length ?? 0

          if (activeTouchCount.current > 0) {
            return
          }

          stopGrabbing();

          isTouchPinching.current = false
          wasPinch.current = false
          pointerDownRef.current = false
          isPointerDown.current = false
          isClick.current = false
          dragMode.current = 'none'
          isVerticalScroll.current = false
          yTemp.current = 0
          moveStore.clear()
          preventScroll = false
          unlockWheelNow();
          lockWheelFor(300);
          return
        }

        isPointerDown.current = false
        pointerDownRef.current = false
        moveStore.clear()
        preventScroll = false
        unlockWheelNow();
        lockWheelFor(300);

        if (isClick.current) {
          const target = evt.target as HTMLElement
          const clickedVideo = clickedVideoSurface(evt);
          if (clickedVideo != null) {
            dragMode.current = 'none';

            if (clickedVideo.isClone) {
              armCloneToggleOnVisibility(clickedVideo.canonicalIndex);
            } else {
              scrollToIndex(selectedIndex.current);
            }
            return;
          }

          if (target.closest("[class*='plyr__']")) return

          const t = evt as unknown as TouchEvent
          const { clickedImg, renderedIndex } = resolveClickedImageTarget(target, t)

          if (!clickedImg) {
            restoreOverlayTransition()
            clickedImgMargin.current = true
            animRef.current?.stop()
            requestFsCloseRef.current?.();
            if (t.cancelable)  {
              t.preventDefault()
            }
            return
          }

          if (renderedIndex == null) return

          const matchedRef = imageRefs[renderedIndex]
          if (!matchedRef) return

          const idx = selectedIndex.current
          if (idx === cellCount - 1 && renderedIndex === cellCount + 1) {
            suppressLoopRef.current = true
            goToCanonical(0)
            return
          }
          if (idx !== renderedIndex && renderedIndex !== idx + 2) {
            isZooming.current = true
            handleZoomToggle(evt as any, matchedRef)
          }
          if (idx === cellCount - 1 && renderedIndex === cellCount + 1) {
            isZooming.current = true
            handleZoomToggle(evt as any, matchedRef)
          }
          if (slider.current && slider.current.children.length === 1) {
            isZooming.current = true
            handleZoomToggle(evt as any, matchedRef)
          }
          suppressLoopRef.current = true
          goToCanonical(idx)
          return
        }

        if (dragMode.current === 'y') {
          const rawY = trackerY.pointerUp(evt as any).fy
          const tinyFlick = Math.abs(rawY) > 0.15
          if (tinyFlick) {
            anim?.stop()
            translateRef.current?.lockY(yTemp.current)
            isClosing.current = true
            requestFsCloseRef.current?.();
            yTemp.current = 0
            isVerticalScroll.current = false
            return
          }
          const dy = dragYForClose.current
          const distanceThreshold = windowSize.height * 0.3
          if (Math.abs(dy) > distanceThreshold) {
            anim?.stop()
            translateRef.current?.lockY(yTemp.current)
            isClosing.current = true
            requestFsCloseRef.current?.();
            yTemp.current = 0
            isVerticalScroll.current = false
            return
          }
          snapBackY(300)
          dragMode.current = 'none'
          isVerticalScroll.current = false
        } else {
          const end = trackerX.pointerUp(evt as any)
          let rawForce = end.fx

          if (isRtl) rawForce = -rawForce

          const isMouseEvt = isMouseEvent(evt as any, window as any)
          const snapForceBoost = { mouse: 300, touch: 400 }
          const boost = snapForceBoost[isMouseEvt ? 'mouse' : 'touch']

          const boostedForce = rawForce * boost

          const fsScrollTarget = scrollTargetRef.current
          const fsScrollTo = scrollToRef.current
          const body = bodyRef.current

          if (!fsScrollTarget || !fsScrollTo || !body) {
            dragMode.current = 'none'
            return
          }

          function allowedForce(force: number): number {
            const len = slides.current.length || 1
            const curIndex = selectedIndex.current || 0

            const dirIndex = mathSign(force) * -1
            const nextIndex = ((curIndex + dirIndex) % len + len) % len

            const dirBump = slides.current.length === 2 ? mathSign(force) : 0;
            const nextTarget = fsScrollTarget!.byIndex(nextIndex, dirBump)
            return nextTarget.distance
          }
          
          const force = allowedForce(boostedForce)

          const baseFriction = sliderFriction
          const forceFactor = factorAbs(boostedForce, force)
          let speed = sliderDuration
          if (boundsRef.current?.passed()) {
            speed = sliderDuration + 10 * forceFactor
          }
          const friction = baseFriction + forceFactor / 50

          body.useDuration(speed).useFriction(friction)
          fsScrollTo.distance(force, true)
        }

        dragMode.current = 'none'
      }

      dragStore
        .add(root, 'dragstart', (evt) => (evt as Event).preventDefault(), { passive: false })
        .add(root, 'touchstart', onDown as any)
        .add(root, 'mousedown', onDown as any, { passive: true })
        .add(root, 'touchcancel', () => {
          isTouchPinching.current = false
          wasPinch.current = false
          pointerDownRef.current = false
          isPointerDown.current = false
          dragMode.current = 'none'
          isVerticalScroll.current = false
          yTemp.current = 0
          moveStore.clear()
          unlockWheelNow();
          lockWheelFor(WHEEL_LOCK_MS);
        })
        .add(root, 'contextmenu', onUp as any)

      return () => {
        dragStore.clear()
        moveStore.clear()
        animRef.current?.destroy()
        animRef.current = null
      }
    }, [show, cellCount])

    function goToCanonical(canonicalIdx: number, mode: 'instant' | 'animated' = 'animated') {
      scrollToIndex(canonicalIdx, { jump: mode === 'instant' })
    }

    useEffect(() => {
      const root = viewportRef.current
      if (!root) return
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

        sub.emitBasePointerDown?.();

        if (isZoomed) return
        const track = slider.current
        if (!track) return
        const containerWidth = track.clientWidth
        const contentWidth = (slides.current.length || 1) * (perSlideRef.current || containerWidth)
        const canScrollHorizontally = contentWidth > containerWidth
        const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY)
        if (!isHorizontal || !canScrollHorizontally) return
        e.preventDefault()
        const cur = (offsetLocationRef.current?.get() ?? 0) - (e.deltaX * sign)
        const next = cur

        targetRef.current?.set(next)
        bodyRef.current?.useDuration(0).useFriction(1)

        animRef.current?.start()
        x.current = next
        positionSlider()
        updateActiveIndexFromX(next)
      }
      root.addEventListener('wheel', onWheel as any, { passive: false })
      return () => root.removeEventListener('wheel', onWheel as any)
    }, [isZoomed])

    function updateActiveIndexFromX(loc: number) {
      const per = perSlide()
      const len = slideCount()
      let idx = Math.round(Math.abs(loc) / per)
      idx = ((idx % len) + len) % len

      if (selectedIndex.current !== idx) {
        selectedIndex.current = idx
        indexCurrentRef.current?.set(idx)

        sub.setLocalIndex(idx)
        let actualIndex = ((idx + 1) % cellCount + cellCount) % cellCount
        if (actualIndex === 0) actualIndex = cellCount
        if (counterRef.current) {
          counterRef.current.textContent = `${actualIndex} / ${cellCount}`
        }
      }
    }

    function setTranslateX(tx: number, ty: number) {
      if (!slider.current) return
      let ny: number
      if (isVerticalScroll.current) {
        ny = Math.round(ty)
      } else {
        const currentY = appliedYRef.current
        const easedY = currentY + (0 - currentY) * 0.2
        ny = Math.round(easedY)
        appliedYRef.current = ny
      }
      commitXY(tx, ny)
    }

    function positionSlider() {
      setTranslateX(x.current, y.current)
    }

    function setAllX(nx: number) {
      locationRef.current?.set(nx);
      previousLocationRef.current?.set(nx);
      offsetLocationRef.current?.set(nx);
      targetRef.current?.set(nx);
      x.current = nx;
    }

    useEffect(() => {
      let raf = 0;
      function onResize() {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          animRef.current?.stop();
          recenterWithAnchor();
        });
      }

      onResize();

      const roViewport = new ResizeObserver(onResize);
      if (viewportRef.current) roViewport.observe(viewportRef.current);

      window.addEventListener('orientationchange', onResize, { passive: true });

      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('orientationchange', onResize);
        roViewport.disconnect();
      };
    }, [windowSize, recenterWithAnchor]);

    useEffect(() => {
      const offReq = sub.onRequest((req: FSRequest) => {
        switch (req.type) {
          case 'requestSet': {
            const mode = req.mode ?? 'animated';
            if (mode === 'instant') {
              const per = perSlide();
              const nx = -per * req.index;
              setAllX(nx);
              setTranslateX(nx, 0);
              animRef.current?.stop();
              const idx = ((req.index % slideCount()) + slideCount()) % slideCount();
              commitIndexChange(idx);
              if (counterRef.current) {
                let actual = selectedIndex.current + 1;
                const len = slideCount();
                actual = ((actual % len) + len) % len;
                if (actual === 0) actual = cellCount;
                counterRef.current.textContent = `${actual} / ${cellCount}`;
              }
            } else {
              const mode = req.mode ?? 'animated'
              const jump = mode === 'instant'
              scrollToIndex(req.index, { jump });
            }
            break;
          }
          case 'requestPrev':
            previous();
            break;
          case 'requestNext':
            next();
            break;
          case 'center':
            recenterWithAnchor();
            break;
        }
      });

      const offEvt = sub.onEvent(() => { /* noop here */ });

      return () => {
        offReq();
        offEvt();
      };
    }, [sub]);

    useEffect(() => {
      return () => {
        const pending = pendingCloneToggleRef.current
        pending?.observer?.disconnect()
        if (pending?.rafId != null) cancelAnimationFrame(pending.rafId)
        pendingCloneToggleRef.current = null
      }
    }, [])

    function centerSlider() {
      scrollToIndex(selectedIndex.current, { jump: false })
    }

    useImperativeHandle(ref, () => ({ centerSlider: centerSlider }), [centerSlider]);

    function isVideoItem(item: MediaItem | undefined | null) {
      if (!item) return false;

      const any = item as any;

      if (any.type === 'video') return true;
      if (any.kind === 'video') return true;
      if (any.mediaType === 'video') return true;

      if (any.videoSrc) return true;
      if (any.src && typeof any.src === 'string' && any.src.match(/\.(mp4|webm|mov)(\?|#|$)/i)) return true;

      if (any.plyrSource) return true;
      if (any.sources?.video) return true;

      return false;
    }

    const len = normalizedItems?.length || cellCount || 1;

    const openingIndex =
      ((slideIndex ?? 0) % len + len) % len;

    const isVideoSlide =
      isVideoItem(normalizedItems?.[openingIndex]);

    const shouldFadeIntro = introMethod === "fade" || introFade || isVideoSlide;

    function setChevronOpen(open: boolean) {
      const cls = chromeStyles?.open;
      if (!cls) return;

      leftChevronRef.current?.classList.toggle(cls, open);
      rightChevronRef.current?.classList.toggle(cls, open);
    }

    useEffect(() => {
      let raf1 = 0;
      let raf2 = 0;

      if (!show || closingModal) {
        setChevronOpen(false);
        return;
      }

      setChevronOpen(false);

      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          setChevronOpen(true);
        });
      });

      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }, [show, closingModal, chromeStyles]);

    return (
      <div
        ref={viewportRef}
        className={`fs_viewport ${rtlCls}`}
        dir={isRtl ? 'rtl' : undefined}
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
        }}
      >
        {allowFsArrows && (
          <>
            <button
              ref={leftChevronRef as any}
              type="button"
              aria-label={getArrowAction('left', isRtl) === 'prev' ? 'Previous' : 'Next'}
              onClick={() => {
                if (getArrowAction('left', isRtl) === 'prev') previous();
                else next();
              }}
              className={mergeClassNames(
                chromeStyles?.leftChevron,
                classFromElementStyle(arrows?.arrow as any),
                classFromElementStyle(arrows?.prev as any),
              )}
              style={{
                position: 'absolute',
                top: '50%',
                left: '16px',
                transform: 'translateY(-50%) rotate(180deg)',
                zIndex: 3,
                ...(styleFromElementStyle(arrows?.arrow as any) ?? {}),
                ...(styleFromElementStyle(arrows?.prev as any) ?? {}),
              }}
            >
              {renderArrowNode(getArrowAction('left', isRtl), 'left')}
            </button>

            <button
              ref={rightChevronRef as any}
              type="button"
              aria-label={getArrowAction('right', isRtl) === 'prev' ? 'Previous' : 'Next'}
              onClick={() => {
                if (getArrowAction('right', isRtl) === 'prev') previous();
                else next();
              }}
              className={mergeClassNames(
                chromeStyles?.rightChevron,
                classFromElementStyle(arrows?.arrow as any),
                classFromElementStyle(arrows?.next as any),
              )}
              style={{
                position: 'absolute',
                top: '50%',
                right: '16px',
                transform: 'translateY(-50%)',
                zIndex: 3,
                ...(styleFromElementStyle(arrows?.arrow as any) ?? {}),
                ...(styleFromElementStyle(arrows?.next as any) ?? {}),
              }}
            >
              {renderArrowNode(getArrowAction('right', isRtl), 'right')}
            </button>
          </>
        )}
        <div
          ref={slider}
          className={`fullscreen_slider ${rtlCls}`}
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'visible',
            cursor: 'grab',
            userSelect: 'none',
            willChange: 'opacity, transform',
            backfaceVisibility: 'hidden',
            transition: shouldFadeIntro
              ? `opacity ${introDuration}ms ${introEasing}`
              : undefined,
            opacity: showFullscreenSlider
              ? shouldFadeIntro
                ? (fadeOpening ? 0 : 1)
                : 1
              : 0,
          }}
        >
          {children}
        </div>
      </div>
    )
  }
)

FullscreenSlider.displayName = 'FullscreenSlider'
export default FullscreenSlider
