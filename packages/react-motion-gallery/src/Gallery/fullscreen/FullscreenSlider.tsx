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
import { Limit } from '../shared/motion/limit'
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

interface FullscreenSliderProps {
  sub: FullscreenSliderSub
  children: ReactNode
  imageCount: number
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
  closeButtonRef: RefObject<HTMLElement | null>
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
}

export interface FullscreenSliderHandle {
  centerSlider(): void
}

export const FullscreenSlider = forwardRef<FullscreenSliderHandle, FullscreenSliderProps>(
  (
    {
      sub,
      children,
      imageCount,
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
      plyrRef,
      closingModal,
      counterRef,
      leftChevronRef,
      rightChevronRef,
      closeButtonRef,
      overlayDivRef,
      direction,
      isWrapping,
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
      requestFsCloseRef
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
    type DragMode = 'none' | 'x' | 'y'
    const dragMode = useRef<DragMode>('none')

    function useLatest<T>(value: T) {
      const r = useRef(value)
      useEffect(() => { r.current = value }, [value])
      return r
    }
    const isZoomedRef = useLatest(isZoomed)

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
      perSlideRef.current = per;

      const len = slides.current.length || 1;
      const W   = per * len;

      contentSizeRef.current = W;
      loopLimitRef.current   = Limit(-W, 0);

      const snaps = Array.from({ length: len }, (_, i) => -per * i);
      scrollSnapsRef.current = snaps;

      const fsLimit = createBaseLimit(-W, 0);
      scrollLimitRef.current = fsLimit;

      if (loopLimitRef.current) {
        scrollTargetRef.current = ScrollTarget(
          true,
          snaps,
          W,
          loopLimitRef.current,
          targetRef.current
        );
      }

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
      if (imageCount > 1) {
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

    function commitXY(canonicalX: number, ny: number) {
      const nx = Math.round(canonicalX) * sign;
      translateRef.current?.to(nx, ny)
      if (overlayDivRef.current) {
        const progress = clamp01(Math.abs(ny) / FADE_DISTANCE)
        const o = 1 - easeOutCubic(progress)
        overlayDivRef.current.style.opacity = String(o)
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

      if (counterRef.current) {
        counterRef.current.textContent = `${
          !isWrapping.current ? slideIndex + 1 : slideIndex
        } / ${imageCount}`
      }

      if ((slideIndex === 1 && isWrapping.current === true) || (slideIndex === 0 && !isWrapping.current)) {
        selectedIndex.current = 0
        sub.setLocalIndex(0)
        setTimeout(() => {
          if (!slider.current) return
          const startX = 0
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
        return
      }

      let actualIndex = slideIndex - 1
      actualIndex = ((actualIndex % imageCount) + imageCount) % imageCount
      if (actualIndex === 0) actualIndex = imageCount
      const finalIndex = isWrapping.current === true ? actualIndex : slideIndex

      selectedIndex.current = finalIndex
      sub.setLocalIndex(finalIndex)

      setTimeout(() => {
        if (!slider.current) return
        const per = perSlideRef.current || slider.current.clientWidth
        const startX = -per * finalIndex
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
        imageCount > 1 &&
        selectedIndex.current === 0
      ) {
        const refs = imageRefs;

        const firstRealImg =
          refs[1]?.current?.querySelector('img') as HTMLElement | null;

        const firstCloneImg =
          refs[imageCount + 1]?.current?.querySelector('img') as HTMLElement | null;

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

      if (isZoomedRef.current && imageCount > 1 && selectedIndex.current === 0) {
        const refs = imageRefs;

        const firstRealImg =
          refs[1]?.current?.querySelector('img') as HTMLElement | null;
        const firstCloneImg =
          refs[imageCount + 1]?.current?.querySelector('img') as HTMLElement | null;

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
    }

    function next() {
      isVerticalScroll.current = false;
      isScrolling.current = false;
      isPinching.current = false;
      isTouchPinching.current = false;

      if (isZoomedRef.current && imageCount > 1 && selectedIndex.current === 0) {
        const refs = imageRefs;

        const firstRealImg =
          refs[1]?.current?.querySelector('img') as HTMLElement | null;
        const firstCloneImg =
          refs[imageCount + 1]?.current?.querySelector('img') as HTMLElement | null;

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
    }

    function updateCounterFromIndex(canonicalIndex: number) {
      const len = slides.current.length || 1

      let actualIndex = canonicalIndex + 1
      actualIndex = ((actualIndex % len) + len) % len

      if (actualIndex === 0) actualIndex = imageCount

      if (counterRef.current) {
        counterRef.current.textContent = `${actualIndex} / ${imageCount}`
      }
    }

    function toggleActiveVideoPlay() {
      const idx = selectedIndex.current ?? 0

      const actualIndex = idx + 1

      const api = plyrRefs.current[actualIndex] || plyrRef.current[0]
      const p = api?.plyr
      if (!p) return

      if (p.playing) p.pause()
      else p.play()
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

      const slide = under.closest('[data-rmg-fs-slide="true"]') as HTMLElement | null;
      if (!slide) return false;

      const plyrRoot = slide.querySelector('.plyr') as HTMLElement | null;
      if (!plyrRoot) return false;

      const wrap = plyrRoot.querySelector('.plyr__video-wrapper') as HTMLElement | null;
      if (!wrap) return false;

      const r = wrap.getBoundingClientRect();
      const inside =
        x >= r.left && x <= r.right &&
        y >= r.top  && y <= r.bottom;

      if (under.closest('.plyr__controls')) return false;

      return inside;
    }

    function isYouTubeVideoEvent(evt: Event): boolean {
      const target = evt.target as HTMLElement | null;
      if (!target) return false;

      const slide = target.closest('[data-rmg-fs-slide="true"]') as HTMLElement | null;
      if (!slide) return false;

      const plyrRoot = slide.querySelector('.rmg__player') as HTMLElement | null;
      if (!plyrRoot) return false;

      return plyrRoot.getAttribute('data-rmg-plyr-provider') === 'youtube';
    }

    useEffect(() => {
      const root = viewportRef.current;
      const track = slider.current;
      if (!root || !track) return;

      const axis = Axis();
      axisRef.current = axis;

      const per = perSlideRef.current || track.clientWidth || 1;
      const len = slides.current.length || 1;
      const W   = per * len;

      const counterMax = len - 1;
      const startIndex = selectedIndex.current || 0;

      const location         = Vector1D(0);
      const previousLocation = Vector1D(0);
      const offsetLocation   = Vector1D(0);
      const target           = Vector1D(0);

      locationRef.current         = location;
      previousLocationRef.current = previousLocation;
      offsetLocationRef.current   = offsetLocation;
      targetRef.current           = target;

      const scrollSnaps = Array.from({ length: len }, (_, i) => -per * i);
      scrollSnapsRef.current = scrollSnaps;

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

      contentSizeRef.current      = W;
      loopLimitRef.current        = Limit(-W, 0);
      scrollContentSizeRef.current = W;

      const fsLimit = createBaseLimit(-W, 0);
      scrollLimitRef.current = fsLimit;

      if (loopLimitRef.current) {
        scrollTargetRef.current = ScrollTarget(
          true,
          scrollSnaps,
          W,
          loopLimitRef.current,
          target
        );
      }

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

      const looper = ScrollLooper(
        contentSizeRef.current,
        loopLimitRef.current,
        location,
        [location, previousLocation, offsetLocation, target]
      )

      const body = ScrollBody(location, offsetLocation, previousLocation, target, sliderDuration, sliderFriction)
      bodyRef.current = body

      const anim = Animations(
        document,
        window as WindowType,
        () => {
          bodyRef.current?.seek()

          const body = bodyRef.current!
          const dir  = body.direction() || Math.sign(target.get() - location.get()) || 0
          if (!suppressLoopRef.current && imageCount > 1 && W > 0) {
            looper.loop(dir);
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

          const settled = bodyRef.current?.settled()
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

        if (isZoomedRef.current || closingModal) return
        const isMouseEvt = isMouseEvent(evt as any, window as any)
        isMouse = isMouseEvt
        if (isMouseEvt && (evt as MouseEvent).button !== 0) return

        startGrabbing();

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

          if (overlayDivRef.current) {
            const progress = clamp01(Math.abs(dy) / FADE_DISTANCE)
            overlayDivRef.current.style.opacity = String(1 - progress)
          }

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
          return
        }

        isPointerDown.current = false
        pointerDownRef.current = false
        moveStore.clear()
        preventScroll = false

        if (isClick.current) {
          const target = evt.target as HTMLElement
          if (clickedVideoSurface(evt) && !isYouTubeVideoEvent(evt)) {
            evt.preventDefault?.();
            (evt as any).stopPropagation?.();

            toggleActiveVideoPlay();
            dragMode.current = 'none';
            suppressLoopRef.current = true
            goToCanonical(selectedIndex.current)
            return;
          }

          if (target.closest("[class*='plyr__']")) return

          const t = evt as unknown as TouchEvent
          const clickedImg = target.closest('img')

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

          const imgIndex = (clickedImg as HTMLImageElement).dataset.index
          if (imgIndex == null) return
          const matchedRef = imageRefs[parseInt(imgIndex)]

          const idx = selectedIndex.current
          if (idx === imageCount - 1 && Number(imgIndex) === imageCount + 1) {
            suppressLoopRef.current = true
            goToCanonical(0)
            return
          }
          if (idx !== Number(imgIndex) && Number(imgIndex) !== idx + 2) {
            isZooming.current = true
            handleZoomToggle(evt as any, matchedRef)
          }
          if (idx === imageCount - 1 && Number(imgIndex) === imageCount + 1) {
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
            restoreOverlayTransition()
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
            restoreOverlayTransition()
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

          const baseSpeed = sliderDuration
          const baseFriction = sliderFriction
          const forceFactor = factorAbs(boostedForce, force)
          const speed = baseSpeed - 10 * forceFactor
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
        })
        .add(root, 'contextmenu', onUp as any)

      return () => {
        dragStore.clear()
        moveStore.clear()
        animRef.current?.destroy()
        animRef.current = null
      }
    }, [show, imageCount])

    function goToCanonical(canonicalIdx: number, mode: 'instant' | 'animated' = 'animated') {
      scrollToIndex(canonicalIdx, { jump: mode === 'instant' })
    }

    useEffect(() => {
      const root = viewportRef.current
      if (!root) return
      let wheelTimer: number | null = null
      function onWheel(e: WheelEvent) {
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

        if (wheelTimer) clearTimeout(wheelTimer as any)
        wheelTimer = window.setTimeout(() => {}, 120)
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
        let actualIndex = ((idx + 1) % imageCount + imageCount) % imageCount
        if (actualIndex === 0) actualIndex = imageCount
        if (counterRef.current) {
          counterRef.current.textContent = `${actualIndex} / ${imageCount}`
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

    useEffect(() => {
      const left  = leftChevronRef.current;
      const right = rightChevronRef.current;

      const onClick = (ev: Event) => {
        const target = ev.currentTarget as HTMLButtonElement | null;
        const action = target?.dataset.action;
        if (action === 'prev') previous();
        else if (action === 'next') next();
      };

      if (left)  left.addEventListener('click', onClick);
      if (right) right.addEventListener('click', onClick);

      return () => {
        if (left)  left.removeEventListener('click', onClick);
        if (right) right.removeEventListener('click', onClick);
      };
    }, [leftChevronRef.current, rightChevronRef.current, showFullscreenSlider, isRtl]);

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
                if (actual === 0) actual = imageCount;
                counterRef.current.textContent = `${actual} / ${imageCount}`;
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

    const len = normalizedItems?.length || imageCount || 1;

    const openingIndex =
      ((slideIndex ?? 0) % len + len) % len;

    const isVideoSlide =
      isVideoItem(normalizedItems?.[openingIndex]);


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
            transition: introFade || isVideoSlide
              ? `opacity ${introDuration}ms ${introEasing}`
              : undefined,
            opacity: showFullscreenSlider
              ? introFade || isVideoSlide
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