/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import {
  Children,
  ReactElement,
  ReactNode,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import cls from './ThumbnailSlider.module.css'
import createIndexChannel from '../sliderSub'
import { createDragTracker } from '../../shared/input/dragTracker'
import { Vector1D, Vector1DType } from '../../shared/motion/vector1d'
import { ScrollBody, ScrollBodyType } from '../../shared/motion/scrollBody'
import { Limit, LimitType } from '../../shared/motion/limit'
import { ScrollLooper } from '../../shared/motion/scrollLooper'
import { ScrollBounds, ScrollBoundsType, PercentOfView, PercentOfViewType } from '../../shared/motion/scrollBounds'
import { BaseTarget, factorAbs, mathSign, ScrollTarget, ScrollTargetType } from '../../shared/motion/scrollTarget'
import { Animations, AnimationsType } from '../../shared/motion/animations'
import { EventStore } from '../../shared/motion/eventStore'
import { ThumbnailIntroOptions, ThumbnailLoadingOptions, ThumbnailPosition } from './types'
import { ArrowRenderArgs } from '../../shared/types/controls'
import { BreakpointMap } from '../../shared/responsive'
import { Counter, CounterType } from '../../shared/motion/counter'
import { BaseLimit, createBaseLimit } from '../../shared/motion/baseLimit'
import { RmgArrows } from '../controls/arrows'
import { isMouseEvent } from '../../shared/input/pointerTypes'
import { WindowType } from '../../shared/input/pointerTypes'
import { Axis, AxisType, AXSpec } from '../../shared/types/axis'
import { Translate } from '../../shared/motion/translate'

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))

function DragTracker(axis: AxisType, ownerWindow: WindowType) {
  return createDragTracker({
    ownerWindow,
    axis,
  })
}

type Page = {
  startIndex: number
  endIndex: number
  targetScroll: number
}

type BaseScrollTo = {
  distance: (n: number, snap: boolean) => void
  index: (n: number, direction: number) => void
}

type ThumbLayoutItem = { el: HTMLElement; start: number; end: number; size: number }

type Slide = { target: number; cells: { element: HTMLElement; index: number }[] }

interface ThumbnailSliderProps {
  children: ReactNode
  position: ThumbnailPosition
  thumbSize?: number
  className?: string
  style?: React.CSSProperties
  thumbnailWidth?: number | string
  thumbnailHeight?: number | string
  indexChannel?: ReturnType<typeof createIndexChannel>
  onSelectThumb?: (index: number) => void
  thumbnailsCenter?: boolean
  thumbnailsContainerWidth?: number | string
  thumbnailsContainerHeight?: number | string
  thumbnailsContainerClassName?: string
  thumbnailsContainerStyle?: React.CSSProperties
  thumbnailItemClassName?: string
  thumbnailItemStyle?: React.CSSProperties
  gap?: number
  freeScroll?: boolean
  groupCells?: boolean
  loop?: boolean
  direction?: 'ltr' | 'rtl';
  axis?: 'x' | 'y';
  skipSnaps?: boolean;
  centerActiveThumb?: boolean;
  selectDuration?: number;
  freeScrollDuration?: number;
  sliderFriction?: number;
  loadingOptions?: ThumbnailLoadingOptions;
  introOptions?: ThumbnailIntroOptions;
  breakpointMap?: BreakpointMap;
  rippleEnabled?: boolean;
  rippleClassName?: string;
  showArrows?: boolean;
  arrowStyles?: React.CSSProperties;
  arrowClassName?: string;
  prevArrowStyles?: React.CSSProperties;
  prevArrowClassName?: string;
  nextArrowStyles?: React. CSSProperties;
  nextArrowClassName?: string;
  renderArrows?: (args: ArrowRenderArgs & { dir: "prev" | "next" }) => React.ReactNode;
  renderPrevArrow?: (args: ArrowRenderArgs) => React.ReactNode;
  renderNextArrow?: (args: ArrowRenderArgs) => React.ReactNode;
}

export default function ThumbnailSlider({
  children,
  position,
  thumbSize,
  className,
  style,
  thumbnailWidth,
  thumbnailHeight,
  indexChannel,
  onSelectThumb,
  thumbnailsCenter,
  thumbnailsContainerWidth,
  thumbnailsContainerHeight,
  thumbnailsContainerClassName,
  thumbnailsContainerStyle,
  thumbnailItemClassName,
  thumbnailItemStyle,
  gap = 8,
  freeScroll = true,
  groupCells = false,
  loop = false,
  direction = 'ltr',
  skipSnaps = false,
  centerActiveThumb = false,
  selectDuration = 25,
  freeScrollDuration = 43,
  sliderFriction = 0.68,
  loadingOptions,
  introOptions,
  breakpointMap = { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280 },
  rippleEnabled,
  rippleClassName,
  showArrows = false,
  arrowStyles,
  arrowClassName,
  prevArrowStyles,
  prevArrowClassName,
  nextArrowStyles,
  nextArrowClassName,
  renderArrows,
  renderPrevArrow,
  renderNextArrow
}: ThumbnailSliderProps) {
  const isHorizontal = position === 'top' || position === 'bottom'
  const axis = Axis(isHorizontal);
  const isRtl = direction === 'rtl' ? true : false
  const sign = isHorizontal && isRtl ? -1 : 1;
  const containerRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const scopeId = useId().replace(/:/g, "-");
  const channelRef = useRef(indexChannel ?? createIndexChannel())
  const [thumbLong, setThumbLong] = useState<number>(thumbSize ?? 0)
  const [thumbCross, setThumbCross] = useState<number>(0)
  const [contentLength, setContentLength] = useState<number>(0)
  const [containerLength, setContainerLength] = useState<number>(0)
  const locationRef = useRef<Vector1DType | null>(null)
  const previousLocationRef = useRef<Vector1DType | null>(null)
  const offsetLocationRef = useRef<Vector1DType | null>(null)
  const targetRef = useRef<Vector1DType | null>(null)
  const bodyRef = useRef<ScrollBodyType | null>(null)
  const translateRef = useRef<ReturnType<typeof Translate> | null>(null)
  const animRef = useRef<AnimationsType | null>(null)
  const limitRef = useRef<LimitType | null>(null)
  const boundsRef = useRef<ScrollBoundsType | null>(null)
  const povRef    = useRef<PercentOfViewType | null>(null)
  const isAnimatingRef = useRef(false)
  const prevButtonRef = useRef<HTMLDivElement>(null)
  const nextButtonRef = useRef<HTMLDivElement>(null)
  const pagesRef = useRef<Page[]>([])
  type SnapMode = 'thumb' | 'base'
  const snapModeRef = useRef<SnapMode>('base')
  const pointerDownRef = useRef(false)
  const isPointerDown = useRef(false)
  const isClickRef = useRef(true)
  const xRef = useRef(0)
  const dragX = useRef(0)
  const previousDragX = useRef(0)
  const dragMoveTime = useRef<Date | null>(null)
  const sliderVelocity = useRef(0)
  const selectedIndexRef = useRef<number>(channelRef.current.get().index ?? 0)
  const rawKids = Children.toArray(children).filter(isValidElement) as ReactElement<ThumbnailSliderProps>[]
  const count = rawKids.length
  const baseOffsetRef = useRef(0);
  const downTargetRef = useRef<EventTarget | null>(null)
  const [inView, setInView] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const readyRafRef = useRef<number | null>(null);
  const readyPaintedRef = useRef(false);
  const contentSizeRef = useRef(0)
  const loopLimitRef = useRef<ReturnType<typeof Limit> | null>(null)
  const scrollSnapsRef = useRef<number[]>([])
  const scrollContentSizeRef = useRef(0)
  const scrollLimitRef = useRef<BaseLimit | null>(null)
  const scrollTargetRef = useRef<ScrollTargetType | null>(null)
  const scrollToRef = useRef<BaseScrollTo | null>(null)
  const indexCurrentRef = useRef<CounterType | null>(null)
  const indexPreviousRef = useRef<CounterType | null>(null)
  const [buildKey, setBuildKey] = useState(0)
  const loopStableRef = useRef<boolean | null>(null)
  const [geomKey, setGeomKey] = useState(0)
  const lastGeomSigRef = useRef<string>('')
  const [wrap, setWrap] = useState(false)
  const isWrapping = useRef(false)
  const clonesCountRef = useRef(0)
  const visibleThumbsRef = useRef(1)
  const layoutRef = useRef<{ originals: ThumbLayoutItem[]; cw: number } | null>(null)
  const thumbCells = useRef<{ element: HTMLElement; index: number }[]>([]);
  const [clonedChildren, setClonedChildren] = useState<ReactElement<any>[]>([]);
  const lastCloneSigRef = useRef<string>('');
  const slidesRef = useRef<Slide[]>([])
  const [slidesState, setSlidesState] = useState<Slide[]>([])
  const [isMeasured, setIsMeasured] = useState(false)
  const cellToSlideRef = useRef<number[]>([])
  const sliderWidth = useRef(0)
  const [layoutReady, setLayoutReady] = useState(false)
  const prevActiveRef = useRef<number>(-1)
  const draggingAttr = 'data-rmg-drag';
  const activePointerIdRef = useRef<number | null>(null);
  const guardsStoreRef = useRef<ReturnType<typeof EventStore> | null>(null);

  const AX: AXSpec = useMemo(() => {
    const main = isHorizontal ? 'x' : 'y';
    const cross = isHorizontal ? 'y' : 'x';
    const sizeKey   = isHorizontal ? 'width'  : 'height';
    const clientKey = isHorizontal ? 'clientWidth'  : 'clientHeight';
    const startKey  = isHorizontal ? 'left'   : 'top';
    const endKey    = isHorizontal ? 'right'  : 'bottom';

    const translate = (n: number) =>
      isHorizontal ? `translate3d(${n}px,0,0)` : `translate3d(0,${n}px,0)`;

    const place = (n: number) =>
      isHorizontal
        ? `translateX(${n}px) scale(var(--rmg-scale, 1))`
        : `translateY(${n}px) scale(var(--rmg-scale, 1))`;

    const wheelDelta = (e: WheelEvent) => (isHorizontal ? e.deltaX : e.deltaY);

    return { main, cross, sizeKey, clientKey, startKey, endKey, translate, place, wheelDelta };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    let canceled = false;

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (canceled) return;
        const ent = entries[0];
        setInView(!!ent?.isIntersecting);
      },
      {
        root: null,
        rootMargin: '200px 0px 200px 0px',
        threshold: 0.01,
      }
    );

    io.observe(root);

    return () => {
      canceled = true;
      io.disconnect();
    };
  }, []);

  function setWrapSafe(next: boolean) {
    if (loopStableRef.current === next) return
    loopStableRef.current = next

    setWrap(next)
    isWrapping.current = next

    setLayoutReady(false)

    setIsReady(false)
    readyPaintedRef.current = false

    setBuildKey((k) => k + 1)
  }

  function mod(n: number, m: number) {
    return ((n % m) + m) % m
  }

  function getCenterScroll(i: number) {
    const lay = layoutRef.current
    if (!lay?.originals?.length) return 0

    const o = lay.originals[i]
    if (!o) return 0

    const view = lay.cw || containerLength || 0
    const size = o.size

    const raw = o.start - (view - size) / 2

    if (!wrap) {
      const maxScroll = Math.max(0, contentLength - view)
      return clamp(raw, 0, maxScroll)
    }

    const W = contentLength || sliderWidth.current || 0
    if (!W) return 0
    return mod(raw, W)
  }

  function setTargetToScroll(scroll: number) {
    const tgt = targetRef.current
    if (!tgt) return

    const desired = -scroll

    if (!wrap) {
      tgt.set(desired)
      return
    }

    const W = contentLength || sliderWidth.current || 0
    if (!W) {
      tgt.set(desired)
      return
    }

    const cur = tgt.get()
    const c0 = desired
    const c1 = desired + W
    const c2 = desired - W

    const best =
      Math.abs(c0 - cur) <= Math.abs(c1 - cur) && Math.abs(c0 - cur) <= Math.abs(c2 - cur) ? c0 :
      Math.abs(c1 - cur) <= Math.abs(c2 - cur) ? c1 : c2

    tgt.set(best)
  }

  function cloneThumb(
    child: ReactElement<any>,
    key: string,
    canonicalIndex: number,
    elementIndex: number
  ) {
    return cloneElement(child as ReactElement<any>, {
      key,
      ['data-rmg-thumb-index' as any]: String(canonicalIndex),

      ref: (el: HTMLElement | null) => {
        if (!el) return;
        if (!thumbCells.current.some((c) => c.element === el)) {
          thumbCells.current.push({ element: el, index: elementIndex });
        }
      },

      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: thumbnailWidth,
        height: thumbnailHeight,
        cursor: 'pointer',
        userSelect: 'none',
        ...(thumbnailItemStyle || {}),
        ...(child.props?.style || {}),
      },

      className: [cls.thumb, thumbnailItemClassName, child.props?.className]
        .filter(Boolean)
        .join(' '),

      draggable: false,
    });
  }

  function computeCloneSig(originals: number, per: number) {
    return `${originals}|per=${per}|wrap=${wrap ? 1 : 0}`;
  }

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const rawKids = Children
        .toArray(children)
        .filter(isValidElement) as ReactElement<any>[];

      const originals = rawKids.length;

      if (originals < 1) {
        clonesCountRef.current = 0;
        thumbCells.current = [];
        setClonedChildren([]);
        sliderWidth.current = 0;
        layoutRef.current = null;

        setWrapSafe(false);
        slidesRef.current = [];
        setSlidesState([]);
        cellToSlideRef.current = [];
        return;
      }

      const allEls = Array.from(el.children) as HTMLElement[];
      const clonesBefore = clonesCountRef.current;
      const clonesAfter  = clonesBefore;
      const originalEls  = allEls.slice(clonesBefore, allEls.length - clonesAfter);

      const cw = (el as any)[AX.clientKey] as number;

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

      const per = Math.max(2, Math.min(originals, count));

      const shouldLoop = wrap;
      clonesCountRef.current = shouldLoop ? per : 0;
      if (visibleThumbsRef.current !== per) visibleThumbsRef.current = per;

      const sig = computeCloneSig(originals, per);
      if (sig === lastCloneSigRef.current) return;
      lastCloneSigRef.current = sig;

      const slides: ReactElement<any>[] = [];
      thumbCells.current = [];

      if (shouldLoop) {
        slides.push(
          ...rawKids.slice(-per).map((c, i) => {
            const canonicalIndex = originals - per + i;
            const elementIndex = -per + i;
            return cloneThumb(c, `before-${i}`, canonicalIndex, elementIndex);
          })
        );
      }

      slides.push(
        ...rawKids.map((c, i) => {
          const canonicalIndex = i;
          const elementIndex = i;
          return cloneThumb(c, `original-${i}`, canonicalIndex, elementIndex);
        })
      );

      if (shouldLoop) {
        slides.push(
          ...rawKids.slice(0, per).map((c, i) => {
            const canonicalIndex = i;
            const elementIndex = i;
            return cloneThumb(c, `after-${i}`, canonicalIndex, elementIndex);
          })
        );
      }

      setClonedChildren(slides);
    });

    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    children,
    buildKey,
    wrap,
    gap,
    thumbSize,
    thumbLong,
    thumbnailWidth,
    thumbnailHeight,
    thumbnailItemClassName,
    thumbnailItemStyle,
    position,
  ]);

  function getThumbIndexFromEventTarget(t: EventTarget | null): number {
    const track = trackRef.current
    if (!track) return -1
    const el = t as HTMLElement | null
    if (!el) return -1

    const thumbEl = el.closest?.('[data-rmg-thumb-index]') as HTMLElement | null
    if (!thumbEl) return -1

    if (!track.contains(thumbEl)) return -1

    const raw = thumbEl.getAttribute('data-rmg-thumb-index')
    const idx = raw != null ? parseInt(raw, 10) : -1
    return Number.isFinite(idx) ? idx : -1
  }

  function commitThumbSelect(i: number) {
    if (i < 0 || i >= count) return;

    snapModeRef.current = 'thumb'

    setActiveThumb(i)

    channelRef.current.set(i, 'animated')
    onSelectThumb?.(i)
  }

  useEffect(() => {
    if (!thumbnailsCenter) {
      baseOffsetRef.current = 0;
      return;
    }
    if (!contentLength || !containerLength) return;

    if (contentLength <= containerLength) {
      baseOffsetRef.current = (containerLength - contentLength) / 2;
    } else {
      baseOffsetRef.current = 0;
    }
  }, [thumbnailsCenter, contentLength, containerLength]);

  useEffect(() => {
    const track = trackRef.current;
    const container = containerRef.current
    if (!track || !container) return;

    const schedule = () => {
      measureAndPosition()
    };

    function measureAndPosition() {
      const trackEl = trackRef.current;
      const container = containerRef.current
      if (!trackEl || !container) return

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

      setContentLength(sliderWidth.current);

      setContainerLength(cw);

      const first = originalsForLayout[0]?.el;
      if (first) {
        const r = first.getBoundingClientRect();
        const long = r[AX.sizeKey];
        const cross = AX.main === 'x' ? r.height : r.width;

        setThumbLong(long || thumbSize || 0);
        setThumbCross(cross || 0);
      }
      
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
    ro.observe(container)

    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    vv?.addEventListener("resize", schedule);

    window.addEventListener("resize", schedule, { passive: true });

    schedule();

    return () => {
      ro.disconnect();
      vv?.removeEventListener("resize", schedule);
      window.removeEventListener("resize", schedule);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clonedChildren, gap, wrap, loop, AX, sign, position]);

  useEffect(() => {
    readyPaintedRef.current = false;
    setIsReady(false);

    if (readyRafRef.current != null) {
      cancelAnimationFrame(readyRafRef.current);
      readyRafRef.current = null;
    }

    const root = containerRef.current;
    const track = trackRef.current;

    const canBeReady =
      !!root &&
      !!track &&
      isMeasured &&
      layoutReady &&
      sliderWidth.current > 0 &&
      slidesRef.current.length > 0 &&
      !!(thumbSize || thumbLong);

    if (!canBeReady) return;

    readyRafRef.current = requestAnimationFrame(() => {
      readyRafRef.current = requestAnimationFrame(() => {
        readyPaintedRef.current = true;
        setIsReady(true);
        readyRafRef.current = null;
      });
    });

    return () => {
      if (readyRafRef.current != null) {
        cancelAnimationFrame(readyRafRef.current);
        readyRafRef.current = null;
      }
    };
  }, [
    isMeasured,
    layoutReady,
    geomKey,
    buildKey,
    wrap,
    count,
    contentLength,
    containerLength,
    thumbLong,
    thumbSize,
    position,
  ]);

  const getSnapTargets: () => number[] = () => (slidesRef.current || []).map((s) => s.target)
  const totalWidth = () => sliderWidth.current || 0

  useEffect(() => {
    const containerEl = trackRef.current
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
    const clonesBefore = wrap ? visibleThumbsRef.current : 0
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

      slidesRef.current = newSlides
      setSlidesState(newSlides)

      setLayoutReady(true)

      const map: number[] = []
      newSlides.forEach((s, slideIdx) => {
        s.cells.forEach((c) => {
          map[c.index] = slideIdx
        })
      })
      cellToSlideRef.current = map
    }

    buildPages()

    return () => {
      canceled = true
      if (retryTimer != null) window.clearTimeout(retryTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clonedChildren, geomKey, position]);

  function getPageForIndex(i: number) {
    const pages = pagesRef.current
    if (!pages.length) return null
    for (let p = 0; p < pages.length; p++) {
      const pg = pages[p]
      if (i >= pg.startIndex && i < pg.endIndex) return pg
    }
    return pages[pages.length - 1] ?? null
  }

  function getScrollForIndex(i: number) {
    if (centerActiveThumb) return getCenterScroll(i)

    if (groupCells && !freeScroll && snapModeRef.current === 'thumb') {
      const pg = getPageForIndex(i)
      if (pg) return pg.targetScroll
    }

    return snapModeRef.current === 'thumb'
      ? getStartSnapScroll(i)
      : getCenteredScroll(i)
  }

  function setActiveThumb(i: number) {
    const track = trackRef.current
    if (!track) return

    const kids = Array.from(track.children) as HTMLElement[]
    for (const el of kids) el.removeAttribute('data-active')

    const key = String(i)
    const matches = track.querySelectorAll<HTMLElement>(`[data-rmg-thumb-index="${CSS.escape(key)}"]`)
    matches.forEach((el) => el.setAttribute('data-active', 'true'))

    prevActiveRef.current = i
  }

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
    if (containerRef.current) ensureDragStyle(scopeId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef.current, scopeId]);

  function setDragCursor(on: boolean) {
    const root = containerRef.current;
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
    const root = containerRef.current;
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

  useEffect(() => {
    const ch = channelRef.current
    const unsub = ch.subscribe(() => {
      const { index, mode } = ch.get()
      selectedIndexRef.current = clamp(index, 0, Math.max(0, count - 1))
      setActiveThumb(selectedIndexRef.current)
      if (pointerDownRef.current) return

      snapModeRef.current = 'base'

      const scroll = getScrollForIndex(selectedIndexRef.current)

      if (mode === 'instant') {
        bodyRef.current?.useDuration(0).useFriction(1)
        setTargetToScroll(scroll)
        animRef.current?.start()
      } else {
        animateToScroll(scroll)
      }

    })
    return unsub
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, thumbnailsCenter, contentLength, containerLength])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const ready = !!(contentLength && containerLength && (thumbSize || thumbLong))
    if (!ready) return

    const maxIndex = Math.max(0, (track.children.length || count) - 1)
    const init = clamp(channelRef.current.get().index ?? 0, 0, maxIndex)
    setActiveThumb(init)
    animateToScroll(getScrollForIndex(init))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, contentLength, containerLength, thumbLong, thumbSize])

  function getCenteredScroll(i: number) {
    const lay = layoutRef.current
    if (!lay?.originals?.length) return 0

    const o = lay.originals[i]
    if (!o) return 0

    const view = lay.cw || containerLength || 0
    const size = o.size
    const centerWanted = o.start - (view - size) / 2
    const maxScroll = Math.max(0, contentLength - view)
    return clamp(centerWanted, 0, maxScroll)
  }

  function getStartSnapScroll(i: number) {
    const lay = layoutRef.current
    if (!lay?.originals?.length) return 0

    const o = lay.originals[i]
    if (!o) return 0

    const view = lay.cw || containerLength || 0
    const maxScroll = Math.max(0, contentLength - view)

    return clamp(o.start, 0, maxScroll)
  }

  function animateToScroll(scroll: number) {
    const isNarrow = thumbnailsCenter && contentLength <= containerLength
    if (isNarrow) return

    bodyRef.current?.useBaseDuration().useBaseFriction()

    setTargetToScroll(scroll)

    animRef.current?.start()
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

  function positionSlider() {
    const base = baseOffsetRef.current || 0
    const x = xRef.current || 0
    translateRef.current?.to((x + base) * sign)
  }

  function updateActiveIndexFromX(loc: number) {
    const indexCurrent = indexCurrentRef.current
    if (!indexCurrent) return

    const idxFromLoc = indexFromX(loc)
    const canonical  = indexCurrent.get()

    if (idxFromLoc === canonical) return

    if (!pointerDownRef.current && isAnimatingRef.current) {
      return
    }

    indexCurrent.set(idxFromLoc)
    selectedIndexRef.current = idxFromLoc
  }

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

  function clampIndex(i: number, len: number) {
    return Math.max(0, Math.min(len - 1, i))
  }

  function previous() {
    const scrollTo = scrollToRef.current
    const body     = bodyRef.current
    const indexCur = indexCurrentRef.current
    const len      = slidesRef.current?.length ?? 0
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
    const len      = slidesRef.current?.length ?? 0
    if (!scrollTo || !body || !indexCur || !len) return

    const cur = indexCur.get()
    const target = wrap
      ? ((cur + 1) % len + len) % len
      : clampIndex(cur + 1, len)

    body.useBaseDuration().useBaseFriction()
    scrollToIndex(target, { direction: -1 })
  }

  useEffect(() => {
    const root = containerRef.current
    const track = trackRef.current
    if (
      !root || 
      !track || 
      !slidesRef.current?.length ||
      !layoutReady ||
      !isMeasured ||
      sliderWidth.current === 0
    ) {
        return
      }

    const isNarrow =
      !wrap && thumbnailsCenter && contentLength <= containerLength

    const base =
      isNarrow ? (containerLength - contentLength) / 2 : 0

    baseOffsetRef.current = base

    const startIdx = selectedIndexRef.current || 0;

    const location = Vector1D(0);
    const previousLocation = Vector1D(0);
    const offsetLocation = Vector1D(0);
    const target = Vector1D(0);

    locationRef.current = location;
    previousLocationRef.current = previousLocation;
    offsetLocationRef.current = offsetLocation;
    targetRef.current = target;

    const W = sliderWidth.current || 0

    const len = slidesRef.current.length || 1
    const counterMax = len - 1
    const startIndex = selectedIndexRef.current || 0

    const indexCurrent = Counter(counterMax, startIndex, true)
    const indexPrevious = Counter(counterMax, startIndex, true)

    indexCurrentRef.current = indexCurrent
    indexPreviousRef.current = indexPrevious

    contentSizeRef.current = W
    scrollContentSizeRef.current = W

    const scrollSnaps = slidesRef.current.map((slide) => {
      return -(slide.target)
    })
    scrollSnapsRef.current = scrollSnaps

    const initialSnap = scrollSnaps[startIdx] ?? 0

    location.set(initialSnap);
    previousLocation.set(initialSnap);
    offsetLocation.set(initialSnap);
    target.set(initialSnap);
    xRef.current = initialSnap;

    translateRef.current = Translate(track, AX);
    translateRef.current?.to((initialSnap + base) * sign)

    selectedIndexRef.current = startIdx;

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
        selectedIndexRef.current = idx

        setActiveThumb(idx)
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
        updateActiveIndexFromX(loc)
      }
    )
    animRef.current = anim
    anim.init()

    const dragStore = EventStore()
    const moveStore = EventStore()
    const tracker = DragTracker(axis, window as WindowType)

    let isMouse = false
    let startMain = 0
    let startCross = 0
    let preventScroll = false

    function addDragEvents() {
      const node: any = isMouse ? document : root
      moveStore
        .add(node, 'touchmove', onMove as any)
        .add(node, 'touchend', onUp as any)
        .add(node, 'mousemove', onMove as any, { passive: false })
        .add(node, 'mouseup', onUp as any)
    }

    function onDown(evt: PointerEvent) {
      const isMouseEvt = isMouseEvent(evt as any, window as any)
      isMouse = isMouseEvt
      if (isMouseEvt && (evt as MouseEvent).button !== 0) return

      downTargetRef.current = evt.target

      setDragCursor(true);

      pointerDownRef.current = true
      isPointerDown.current = true
      isClickRef.current = true

      tracker.pointerDown(evt as any)
      startMain  = tracker.readPoint(evt as any, AX.main)
      startCross = tracker.readPoint(evt as any, AX.cross)

      bodyRef.current!.useFriction(0).useDuration(0)
      targetRef.current!.set(locationRef.current!.get())

      addDragEvents()
      animRef.current?.start()
    }

    const freeBoost = { mouse: 500, touch: 600 }
    function forceBoost(rawForce: number) {
      const type = isMouse ? 'mouse' : 'touch'
      return rawForce * (freeBoost[type as 'mouse' | 'touch'])
    }

    function onMove(evt: PointerEvent) {
      const isTouchEvt = !isMouseEvent(evt as any, window as any)
      if (isTouchEvt && (evt as any).touches?.length >= 2) return onUp(evt)

      if (pointerDownRef.current && activePointerIdRef.current != null) setDragCursor(true);

      const lastMain  = tracker.readPoint(evt as any, AX.main)
      const lastCross = tracker.readPoint(evt as any, AX.cross)
      const diffMain  = Math.abs(lastMain  - startMain)
      const diffCross = Math.abs(lastCross - startCross)

      if (diffMain > 5 || diffCross > 5) isClickRef.current = false

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

      if (isClickRef.current) {
        const idx = getThumbIndexFromEventTarget(evt.target)

        if (idx >= 0) {
          commitThumbSelect(idx)
          isMouse = false
          return
        }
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

        function allowedForce(force: number): number {
          const len = slidesRef.current.length || 1
          if (!len || !baseScrollTarget) return 0

          const curIndex = selectedIndexRef.current || 0
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

            const dirBump = slidesRef.current.length === 2 ? dir : 0;
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

          const dirBump = slidesRef.current.length === 2 ? dir : 0;

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
      const primary = isHorizontal ? e.deltaX : e.deltaY
      const primaryAbs = Math.abs(primary)
      const crossAbs = Math.abs(isHorizontal ? e.deltaY : e.deltaX)
      if (primaryAbs <= crossAbs) return

      if (contentLength <= containerLength) return;

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

    return () => {
      dragStore.clear()
      moveStore.clear()
      root.removeEventListener('wheel', onWheel as any)
      animRef.current?.destroy()
      animRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, contentLength, containerLength, position, slidesState.length, layoutReady, geomKey, isMeasured, wrap]);

  useEffect(() => {
    const isNarrow =
      !wrap && thumbnailsCenter && contentLength <= containerLength

    const base = isNarrow ? baseOffsetRef.current : 0

    const min = -(Math.max(0, contentLength - containerLength))
    const max = 0

    const nextLimit = Limit(isNaN(min) ? 0 : min, max)
    limitRef.current = nextLimit

    if (pointerDownRef.current) return
    if (isAnimatingRef.current) return

    const cur = targetRef.current?.get() ?? 0
    const clamped = nextLimit.constrain(cur)

    if (Math.abs(clamped - cur) < 0.001) return

    locationRef.current?.set(clamped)
    previousLocationRef.current?.set(clamped)
    offsetLocationRef.current?.set(clamped)
    targetRef.current?.set(clamped)
    xRef.current = clamped

    translateRef.current?.to((clamped + base) * sign)
  }, [contentLength, containerLength, thumbnailsCenter, sign, wrap])

  useEffect(() => {
    if (!contentLength || !containerLength || !(thumbSize || thumbLong)) return
    const i = clamp(channelRef.current.get().index ?? 0, 0, Math.max(0, count - 1))
    animateToScroll(getScrollForIndex(i))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentLength, containerLength, thumbLong, thumbSize, count])

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

  const renderedThumbs = (clonedChildren.length
    ? clonedChildren
    : rawKids.map((c, i) => cloneThumb(c, `fallback-${i}`, i, i))
  );

  const introChildren = useMemo(() => {
    return renderedThumbs.map((child: any, i: number) => {
      if (!isValidElement(child)) return child;

      const el = child as React.ReactElement<any>;
      const prevStyle = (el.props?.style || {}) as React.CSSProperties;

      return cloneElement<any>(el, {
        ...el.props,
        'data-rmg-index': i,
        style: {
          ...prevStyle,
          ['--rmg-intro-index' as any]: i,
        } as React.CSSProperties & Record<string, any>,
      });
    });
  }, [renderedThumbs]);

  const fadeClass = (isReady && inView)
    ? cls.fadeInActive
    : cls.fadeInStart;

  const baseContainerProps: React.HTMLAttributes<HTMLDivElement> = {
    className: [cls.fade_container, fadeClass].filter(Boolean).join(' ')
  };

  const outerStyle: React.CSSProperties = {
    overflow: 'hidden',
    ...(isHorizontal
      ? { width: thumbnailsContainerWidth, height: thumbCross ? '100%' : 'auto' }
      : { height: thumbnailsContainerHeight, width: thumbLong ? '100%' : 'auto' }),
    ...(style || {}),
  }

  const trackStyle: React.CSSProperties = {
    width: isHorizontal ? '100%' : (thumbnailWidth ?? '100%'),
    height: isHorizontal ? (thumbnailHeight ?? '100%') : '100%',
    willChange: 'transform',
    backfaceVisibility: 'hidden',
    touchAction: 'none',
    visibility: isReady ? 'visible' : 'hidden',
  }

  const effectiveRippleEnabled = rippleEnabled !== false;
  const effectiveRippleClass = (rippleClassName && rippleClassName.trim().length > 0)
    ? rippleClassName
    : cls.ripple;

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
      selectedIndex={selectedIndexRef.current}
      slideCount={slidesRef.current?.length ?? 0}
      measureRef={trackRef}
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

  const inner = (
    <>
      {arrowNodes}
      <div ref={trackRef} style={trackStyle}>
        {introChildren}
      </div>
    </>
  );

  const root = (
    <div
      {...baseContainerProps}
      ref={containerRef}
      id={scopeId}
      data-rmg-scope={scopeId}
      className={[className, thumbnailsContainerClassName, baseContainerProps.className]
        .filter(Boolean)
        .join(' ')
      }
      style={{
        ...outerStyle,
        ...(thumbnailsContainerStyle || {}),
        ...(baseContainerProps.style || {}),
        ['--rmg-intro-stagger' as any]: `${normalizedIntro.staggerMs}ms`,
        ['--rmg-intro-transform' as any]: `${normalizedIntro.transform}px`,
        ['--rmg-intro-duration' as any]: `${normalizedIntro.durationMs}ms`,
        ['--rmg-intro-easing' as any]: normalizedIntro.easing,
      }}
    >
      {normalizedIntro.renderIntro
        ? normalizedIntro.renderIntro(
            { active: isReady && inView, containerProps: baseContainerProps },
            inner
          )
        : inner}
    </div>
  );

  return (
    <>
      {root}
    </>
  );
}