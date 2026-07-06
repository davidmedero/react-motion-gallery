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
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { flushSync } from 'react-dom'
import cls from './ThumbnailSlider.module.css'
import { IndexMode } from '../api/types'
import createIndexChannel from '../slider/sliderSub'
import { createDragTracker } from '../shared/input/dragTracker'
import { Vector1D, Vector1DType } from '../shared/motion/vector1d'
import { ScrollBody, ScrollBodyType } from '../shared/motion/scrollBody'
import { Limit, LimitType } from '../shared/motion/limit'
import { ScrollLooper } from '../shared/motion/scrollLooper'
import { ScrollBounds, ScrollBoundsType, PercentOfView, PercentOfViewType } from '../shared/motion/scrollBounds'
import { BaseTarget, factorAbs, mathSign, ScrollTarget, ScrollTargetType } from '../shared/motion/scrollTarget'
import { Animations, AnimationsType } from '../shared/motion/animations'
import { EventStore } from '../shared/motion/eventStore'
import {
  ThumbnailCrossfadeOptions,
  ThumbnailRevealOptions,
  ThumbnailLoadingOptions,
  ThumbnailPosition,
  ThumbnailSelectMeta,
  ThumbnailFadeOnSyncOptions,
  type ThumbnailItemKey,
  type ThumbnailRenderItem,
} from './types'
import { ArrowRenderArgs } from '../shared/types/controls'
import { BreakpointMap } from '../shared/responsive'
import { Counter, CounterType } from '../shared/motion/counter'
import { BaseLimit, createBaseLimit } from '../shared/motion/baseLimit'
import { RmgArrows } from './controls/arrows'
import { isMouseEvent } from '../shared/input/pointerTypes'
import { WindowType } from '../shared/input/pointerTypes'
import { Axis, AxisType, AXSpec } from '../shared/types/axis'
import { Translate } from '../shared/motion/translate'
import { useWheelLock } from '../shared/hooks/useWheelLock'
import { useInViewOnce } from '../shared/hooks/useInViewOnce'
import { usePrefersReducedMotion } from '../shared/hooks/usePrefersReducedMotion'
import { buildStableScopeId } from '../shared/stableScope'
import { waitForImageDecode } from '../shared/lazy/imageLifecycle'
import { computeSliderChildrenKey } from '../slider/childrenSignature';
import {
  roundSliderLayoutMetric,
  resolveSliderContentSpan,
  shouldEnableSliderLoop,
} from '../slider/layoutStability'
import {
  accumulateFixedVirtualTrackRebaseOffset,
  buildFixedVirtualTrackWindow,
  resolveFixedVirtualTrackMetricsFromCellSize,
  resolveSliderVirtualizationOptions,
  sameFixedVirtualTrackWindow,
  warnSliderVirtualizationFallback,
  type FixedVirtualTrackMetrics,
  type FixedVirtualTrackWindow,
  type SliderVirtualizationOptions,
} from '../shared/virtualTrack'

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))
const wrapModulo = (n: number, m: number) => ((n % m) + m) % m
const THUMBNAIL_FADE_ON_SYNC_DURATION_MS = 220
const THUMBNAIL_FADE_ON_SYNC_EASING = 'cubic-bezier(.4,0,.22,1)'

export function resolveThumbnailCrossfadeMinDistance(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.max(0, Math.trunc(value));
}

export function resolveThumbnailIndexDistance(args: {
  fromIndex: number;
  toIndex: number;
  count: number;
  loop?: boolean;
}) {
  const { fromIndex, toIndex, count, loop = false } = args;
  const distance = Math.abs(toIndex - fromIndex);
  if (!loop || count <= 0) return distance;
  return Math.min(distance, Math.max(0, count - distance));
}

export function shouldUseThumbnailCrossfade(args: {
  crossfade?: ThumbnailCrossfadeOptions;
  fromIndex: number;
  toIndex: number;
  count: number;
  loop?: boolean;
}) {
  const { crossfade, fromIndex, toIndex, count, loop = false } = args;
  if (!crossfade?.enabled) return false;

  const minDistance = resolveThumbnailCrossfadeMinDistance(crossfade.minDistance);
  if (minDistance == null) return true;

  return (
    resolveThumbnailIndexDistance({
      fromIndex,
      toIndex,
      count,
      loop,
    }) >= minDistance
  );
}

export function resolveThumbnailFadeOnSyncOptions(
  value: boolean | ThumbnailFadeOnSyncOptions | undefined
) {
  if (value === true) {
    return {
      enabled: true,
      minDistance: 0,
      durationMs: THUMBNAIL_FADE_ON_SYNC_DURATION_MS,
      easing: THUMBNAIL_FADE_ON_SYNC_EASING,
    };
  }

  if (!value || value === false) {
    return {
      enabled: false,
      minDistance: 0,
      durationMs: THUMBNAIL_FADE_ON_SYNC_DURATION_MS,
      easing: THUMBNAIL_FADE_ON_SYNC_EASING,
    };
  }

  const minDistance =
    typeof value.minDistance === 'number' && Number.isFinite(value.minDistance)
      ? Math.max(0, Math.trunc(value.minDistance))
      : 0;
  const durationMs =
    typeof value.durationMs === 'number' && Number.isFinite(value.durationMs)
      ? Math.max(0, value.durationMs)
      : THUMBNAIL_FADE_ON_SYNC_DURATION_MS;
  const easing =
    typeof value.easing === 'string' && value.easing.trim()
      ? value.easing
      : THUMBNAIL_FADE_ON_SYNC_EASING;

  return {
    enabled: value.enabled ?? true,
    minDistance,
    durationMs,
    easing,
  };
}

export function resolveThumbnailSyncCellDistance(args: {
  targetIndex: number;
  visibleIndices: readonly number[];
  count: number;
  loop?: boolean;
}) {
  const { targetIndex, visibleIndices, count, loop = false } = args;
  if (count <= 0 || !Number.isFinite(targetIndex) || visibleIndices.length === 0) {
    return 0;
  }

  return visibleIndices.reduce((minDistance, visibleIndex) => {
    if (!Number.isFinite(visibleIndex)) return minDistance;

    return Math.min(
      minDistance,
      resolveThumbnailIndexDistance({
        fromIndex: visibleIndex,
        toIndex: targetIndex,
        count,
        loop,
      })
    );
  }, Number.POSITIVE_INFINITY);
}

export function shouldFadeThumbnailSync(args: {
  fadeOnSync?: boolean | ThumbnailFadeOnSyncOptions;
  targetIndex: number;
  visibleIndices: readonly number[];
  count: number;
  loop?: boolean;
}) {
  const { fadeOnSync, targetIndex, visibleIndices, count, loop = false } = args;
  const options = resolveThumbnailFadeOnSyncOptions(fadeOnSync);
  if (!options.enabled || count <= 0 || visibleIndices.length === 0) return false;

  return (
    resolveThumbnailSyncCellDistance({
      targetIndex,
      visibleIndices,
      count,
      loop,
    }) > options.minDistance
  );
}

export function resolveThumbnailVisibleIndicesForScroll(args: {
  items: readonly { index?: number; start: number; end: number }[];
  scroll: number;
  viewport: number;
  trackSpan?: number;
  loop?: boolean;
  epsilon?: number;
}) {
  const {
    items,
    scroll,
    viewport,
    trackSpan = 0,
    loop = false,
    epsilon = 0.5,
  } = args;

  if (!items.length || viewport <= 0) return [];

  const indexedItems = items.map((item, index) => ({
    ...item,
    index: item.index ?? index,
  }));

  if (loop && trackSpan > 0) {
    if (viewport >= trackSpan - epsilon) {
      return indexedItems.map((item) => item.index);
    }

    const normalizedScroll = wrapModulo(scroll, trackSpan);
    const viewStart = normalizedScroll - epsilon;
    const viewEnd = normalizedScroll + viewport + epsilon;

    return indexedItems
      .filter((item) =>
        [0, trackSpan, -trackSpan].some((shift) => {
          const start = item.start + shift;
          const end = item.end + shift;
          return start < viewEnd && end > viewStart;
        })
      )
      .map((item) => item.index);
  }

  const viewStart = scroll - epsilon;
  const viewEnd = scroll + viewport + epsilon;

  return indexedItems
    .filter((item) => item.start < viewEnd && item.end > viewStart)
    .map((item) => item.index);
}

function DragTracker(axis: AxisType, ownerWindow: WindowType) {
  return createDragTracker({
    ownerWindow,
    axis,
  })
}

function waitForVideoReady(video: HTMLVideoElement): Promise<void> {
  if (video.readyState >= 2 || video.error) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const done = () => {
      video.removeEventListener("loadeddata", done);
      video.removeEventListener("error", done);
      resolve();
    };

    video.addEventListener("loadeddata", done);
    video.addEventListener("error", done);
  });
}

type Page = {
  startIndex: number
  endIndex: number
  targetScroll: number
}

type CssLength = number | string;

type BaseScrollTo = {
  distance: (n: number, snap: boolean) => void
  index: (n: number, direction: number) => void
}

type ThumbLayoutItem = { el: HTMLElement | null; start: number; end: number; size: number }

type Slide = { target: number; cells: { element: HTMLElement | null; index: number }[] }

type BoxSide = 'top' | 'right' | 'bottom' | 'left';

type NativeThumbVirtualMetrics = {
  enabled: boolean;
  metrics: FixedVirtualTrackMetrics;
  shouldLoop: boolean;
};

type SyncFadeOverlayItem = {
  key: string;
  index: number;
  active: boolean;
  node: ReactNode;
  style: React.CSSProperties;
};

type SyncFadeState = {
  id: number;
  phase: 'hold' | 'fade';
  items: SyncFadeOverlayItem[];
  durationMs: number;
  easing: string;
};

function splitCssShorthand(value: string): string[] {
  const parts: string[] = [];
  let current = '';
  let depth = 0;

  for (const char of value.trim()) {
    if (/\s/.test(char) && depth === 0) {
      if (current) {
        parts.push(current);
        current = '';
      }
      continue;
    }

    if (char === '(') depth += 1;
    if (char === ')') depth = Math.max(0, depth - 1);
    current += char;
  }

  if (current) parts.push(current);
  return parts;
}

function resolveQuadPart(parts: string[], side: BoxSide) {
  if (!parts.length) return undefined;

  switch (side) {
    case 'top':
      return parts[0];
    case 'right':
      return parts[1] ?? parts[0];
    case 'bottom':
      return parts[2] ?? parts[0];
    case 'left':
      return parts[3] ?? parts[1] ?? parts[0];
  }
}

function resolvePairPart(parts: string[], end: boolean) {
  if (!parts.length) return undefined;
  return end ? parts[1] ?? parts[0] : parts[0];
}

function readCssLength(value: unknown): CssLength | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed || trimmed === 'auto') return null;
  if (trimmed === '0') return 0;

  const pxMatch = trimmed.match(/^(-?\d*\.?\d+)px$/i);
  if (pxMatch) {
    const parsed = Number.parseFloat(pxMatch[1] ?? '');
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (
    /^-?\d*\.?\d+(?:%|em|rem|ch|ex|lh|rlh|vw|vh|vmin|vmax|dvw|dvh|svw|svh|lvw|lvh|cm|mm|q|in|pc|pt)$/i.test(trimmed) ||
    /^(?:calc|min|max|clamp|var)\(/i.test(trimmed)
  ) {
    return trimmed;
  }

  return null;
}

function readShorthandLength(value: unknown, side: BoxSide) {
  if (typeof value !== 'string') return null;
  return readCssLength(resolveQuadPart(splitCssShorthand(value), side));
}

function readPairLength(value: unknown, end: boolean) {
  if (typeof value !== 'string') return null;
  return readCssLength(resolvePairPart(splitCssShorthand(value), end));
}

function readBorderShorthandWidth(value: unknown) {
  if (typeof value !== 'string') return null;

  for (const part of splitCssShorthand(value)) {
    const length = readCssLength(part);
    if (length != null) return length;
  }

  return null;
}

function readPaddingSide(style: React.CSSProperties, side: BoxSide) {
  const physicalProp = `padding${side[0].toUpperCase()}${side.slice(1)}` as keyof React.CSSProperties;
  const logicalProp =
    side === 'top'
      ? 'paddingBlockStart'
      : side === 'bottom'
        ? 'paddingBlockEnd'
        : side === 'left'
          ? 'paddingInlineStart'
          : 'paddingInlineEnd';
  const logicalPairProp =
    side === 'top' || side === 'bottom' ? 'paddingBlock' : 'paddingInline';

  return (
    readCssLength(style[physicalProp]) ??
    readCssLength(style[logicalProp as keyof React.CSSProperties]) ??
    readPairLength(
      style[logicalPairProp as keyof React.CSSProperties],
      side === 'bottom' || side === 'right'
    ) ??
    readShorthandLength(style.padding, side)
  );
}

function readBorderSide(style: React.CSSProperties, side: BoxSide) {
  const capSide = `${side[0].toUpperCase()}${side.slice(1)}`;
  const widthProp = `border${capSide}Width` as keyof React.CSSProperties;
  const borderProp = `border${capSide}` as keyof React.CSSProperties;

  return (
    readCssLength(style[widthProp]) ??
    readShorthandLength(style.borderWidth, side) ??
    readBorderShorthandWidth(style[borderProp]) ??
    readBorderShorthandWidth(style.border)
  );
}

function addCssLengths(lengths: Array<CssLength | null | undefined>) {
  let pxTotal = 0;
  const parts: string[] = [];

  for (const length of lengths) {
    const normalized = readCssLength(length);
    if (normalized == null) continue;
    if (typeof normalized === 'number') {
      pxTotal += normalized;
    } else {
      parts.push(normalized);
    }
  }

  if (!parts.length) return pxTotal;

  const calcParts = pxTotal ? [`${pxTotal}px`, ...parts] : parts;
  return calcParts.length === 1 ? calcParts[0] : `calc(${calcParts.join(' + ')})`;
}

function resolveTrackCrossMinSize(args: {
  isHorizontal: boolean;
  measuredTrackCrossSize: React.CSSProperties['minHeight'];
  style?: React.CSSProperties;
  thumbnailsContainerStyle?: React.CSSProperties;
}) {
  const base = readCssLength(args.measuredTrackCrossSize);
  if (base == null) return undefined;

  const mergedStyle = {
    ...(args.style || {}),
    ...(args.thumbnailsContainerStyle || {}),
  } as React.CSSProperties;

  if (mergedStyle.boxSizing === 'content-box') return base;

  const sides: BoxSide[] = args.isHorizontal ? ['top', 'bottom'] : ['left', 'right'];
  const extra = sides.flatMap((side) => [
    readPaddingSide(mergedStyle, side),
    readBorderSide(mergedStyle, side),
  ]);

  return addCssLengths([base, ...extra]);
}

interface ThumbnailSliderProps {
  children?: ReactNode
  items?: readonly unknown[]
  renderItem?: ThumbnailRenderItem
  getItemKey?: ThumbnailItemKey
  position: ThumbnailPosition
  thumbSize?: number
  className?: string
  style?: React.CSSProperties
  thumbnailWidth?: number | string
  thumbnailHeight?: number | string
  indexChannel?: ReturnType<typeof createIndexChannel>
  onSelectThumb?: (index: number, meta?: ThumbnailSelectMeta) => void;
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
  fadeOnSync?: boolean | ThumbnailFadeOnSyncOptions;
  selectDuration?: number;
  freeScrollDuration?: number;
  sliderFriction?: number;
  loadingOptions?: ThumbnailLoadingOptions;
  revealOptions?: ThumbnailRevealOptions;
  revealUnlocked?: boolean;
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
  onReadyChange?: (ready: boolean) => void;
  crossfade?: ThumbnailCrossfadeOptions;
  virtualization?: SliderVirtualizationOptions;
}

export default function ThumbnailSlider({
  children,
  items,
  renderItem,
  getItemKey,
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
  fadeOnSync,
  selectDuration = 25,
  freeScrollDuration = 43,
  sliderFriction = 0.68,
  loadingOptions,
  revealOptions,
  revealUnlocked,
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
  renderNextArrow,
  onReadyChange,
  crossfade,
  virtualization
}: ThumbnailSliderProps) {
  const isHorizontal = position === 'top' || position === 'bottom'
  const axis = Axis(isHorizontal);
  const isRtl = direction === 'rtl' ? true : false
  const sign = isHorizontal && isRtl ? -1 : 1;
  const containerRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const prefersReducedMotion = usePrefersReducedMotion();
  const scopeId = useMemo(
    () =>
      buildStableScopeId('rmg-thumb-core-', {
        direction,
        position,
        thumbSize,
        thumbnailHeight,
        thumbnailWidth,
      }),
    [direction, position, thumbSize, thumbnailHeight, thumbnailWidth]
  );
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
  const selectedSlideIndexRef = useRef<number>(0);
  const activeThumbIndexRef = useRef<number>(channelRef.current.get().index ?? 0);
  const [virtualIndex, setVirtualIndex] = useState<number>(
    channelRef.current.get().index ?? 0
  );
  const programNavRef = useRef(false)
  const rawKids = Children.toArray(children).filter(isValidElement) as ReactElement<ThumbnailSliderProps>[]
  const itemList = Array.isArray(items) && typeof renderItem === 'function' ? items : null
  const usesItemRendering = !!itemList
  const count = itemList?.length ?? rawKids.length
  const explicitThumbLong = (() => {
    const axisSize = isHorizontal ? thumbnailWidth : thumbnailHeight;
    if (typeof axisSize === 'number' && Number.isFinite(axisSize) && axisSize > 0) {
      return axisSize;
    }
    if (typeof thumbSize === 'number' && Number.isFinite(thumbSize) && thumbSize > 0) {
      return thumbSize;
    }
    return 0;
  })();
  const baseOffsetRef = useRef(0);
  const downTargetRef = useRef<EventTarget | null>(null)
  const [inView, setInView] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);
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
  const thumbVirtualWindowRef = useRef<FixedVirtualTrackWindow | null>(null);
  const thumbVirtualMetricsRef = useRef<NativeThumbVirtualMetrics | null>(null);
  const thumbVirtualRebaseOffsetRef = useRef(0);
  const thumbVirtualRebaseClearPendingRef = useRef(false);
  const pendingVirtualThumbsBuiltRef = useRef(false);
  const lastCloneSigRef = useRef<string>('');
  const slidesRef = useRef<Slide[]>([])
  const [isMeasured, setIsMeasured] = useState(false)
  const cellToSlideRef = useRef<number[]>([])
  const sliderWidth = useRef(0)
  const [layoutReady, setLayoutReady] = useState(false)
  const layoutReadyRef = useRef(false)
  const prevActiveRef = useRef<number>(-1)
  const draggingAttr = 'data-rmg-drag';
  const activePointerIdRef = useRef<number | null>(null);
  const guardsStoreRef = useRef<ReturnType<typeof EventStore> | null>(null);
  const muteChannelRef = useRef(false);
  const onReadyChangeRef = useRef(onReadyChange);
  const [syncFade, setSyncFade] = useState<SyncFadeState | null>(null);
  const syncFadeIdRef = useRef(0);
  const syncFadeRafRef = useRef<number[]>([]);
  const syncFadeTimerRef = useRef<number | null>(null);

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

  const {
    wheelLockMs: WHEEL_LOCK_MS,
    lockWheelFor,
    unlockWheelNow,
    markWheelSeen,
    isWheelLocked,
  } = useWheelLock()

  useEffect(() => {
    onReadyChangeRef.current = onReadyChange;
  }, [onReadyChange]);

  useEffect(() => {
    // Only notify parents when readiness changes, not when callback identities churn.
    onReadyChangeRef.current?.(isReady);
  }, [isReady]);
  const UI_NAV_WHEEL_LOCK_MS = 300

  function beginUiNavWheelTakeover() {
    unlockWheelNow()
    lockWheelFor(UI_NAV_WHEEL_LOCK_MS)
  }

  function readViewportMainSize(fallback?: HTMLElement | null) {
    const container = containerRef.current;
    const containerSize = container
      ? ((container as any)[AX.clientKey] as number)
      : 0;
    if (containerSize > 0) {
      const computed = window.getComputedStyle(container);
      const start = AX.main === 'x' ? computed.paddingLeft : computed.paddingTop;
      const end = AX.main === 'x' ? computed.paddingRight : computed.paddingBottom;
      const padding =
        (Number.parseFloat(start) || 0) + (Number.parseFloat(end) || 0);

      return Math.max(0, containerSize - padding);
    }

    return fallback ? (((fallback as any)[AX.clientKey] as number) || 0) : 0;
  }

  useInViewOnce(
    true,
    containerRef,
    () => setInView(true),
    {
      root: null,
      rootMargin: '200px 0px 200px 0px',
      threshold: 0.01,
    }
  );

  function setWrapSafe(next: boolean) {
    if (loopStableRef.current === next) return
    loopStableRef.current = next

    setWrap(next)
    isWrapping.current = next

    if (layoutReadyRef.current) {
      layoutReadyRef.current = false
      setLayoutReady(false)
    }

    setIsReady(false)
    setMediaReady(false)
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

  function getThumbItemKey(canonicalIndex: number) {
    const item = itemList?.[canonicalIndex];
    if (item == null) return canonicalIndex;
    return getItemKey?.(item, canonicalIndex) ?? canonicalIndex;
  }

  function renderThumbContent(
    canonicalIndex: number,
    virtualIndex?: number
  ): ReactNode {
    const item = itemList?.[canonicalIndex];
    if (itemList && item != null && renderItem) {
      return renderItem({
        item,
        index: canonicalIndex,
        active: canonicalIndex === activeThumbIndexRef.current,
        virtualIndex,
      });
    }

    return rawKids[canonicalIndex] ?? null;
  }

  function cloneThumb(
    child: ReactNode,
    key: string,
    canonicalIndex: number,
    elementIndex: number,
    virtualOffset?: number
  ) {
    if (child == null || typeof child === 'boolean') return null;

    return (
      <div
        key={key}
        data-rmg-thumb-index={String(canonicalIndex)}
        data-rmg-thumb-rendered-index={String(elementIndex)}
        data-rmg-thumb-virtual={virtualOffset != null ? "true" : undefined}
        data-active={
          canonicalIndex === activeThumbIndexRef.current ? 'true' : undefined
        }
        ref={(el: HTMLElement | null) => {
          if (!el) return;
          if (!thumbCells.current.some((c) => c.element === el)) {
            thumbCells.current.push({ element: el, index: elementIndex });
          }
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: thumbnailWidth,
          height: thumbnailHeight,
          ...(virtualOffset != null
            ? { transform: getVirtualThumbTransform(virtualOffset) }
            : null),
          cursor: 'pointer',
          userSelect: 'none',
          ...(thumbnailItemStyle || {}),
        }}
        className={[cls.thumb, thumbnailItemClassName].filter(Boolean).join(' ')}
        draggable={false}
      >
        {child}
      </div>
    );
  }

  function getVirtualThumbTransform(offset: number) {
    const signedOffset = offset * sign;
    if (AX.main === 'x') {
      return `translateX(calc(${signedOffset}px + var(--rmg-thumb-virtual-rebase-offset, 0px))) scale(var(--rmg-scale, 1))`;
    }

    return `translateY(calc(${signedOffset}px + var(--rmg-thumb-virtual-rebase-offset, 0px))) scale(var(--rmg-scale, 1))`;
  }

  function setThumbVirtualRebaseOffset(offset: number) {
    const track = trackRef.current;
    if (!track) return;

    if (Math.abs(offset) <= 0.01) {
      track.style.removeProperty('--rmg-thumb-virtual-rebase-offset');
      return;
    }

    track.style.setProperty('--rmg-thumb-virtual-rebase-offset', `${offset * sign}px`);
  }

  function applyThumbVirtualLoopCompensation(loopShift: number) {
    if (!thumbVirtualMetricsRef.current?.enabled || loopShift === 0) return;

    const nextOffset = accumulateFixedVirtualTrackRebaseOffset(
      thumbVirtualRebaseOffsetRef.current,
      loopShift
    );
    thumbVirtualRebaseOffsetRef.current = nextOffset;
    thumbVirtualRebaseClearPendingRef.current = true;
    setThumbVirtualRebaseOffset(nextOffset);
  }

  function clearThumbVirtualRebaseOffset() {
    if (
      thumbVirtualRebaseOffsetRef.current === 0 &&
      !thumbVirtualRebaseClearPendingRef.current
    ) {
      return;
    }

    thumbVirtualRebaseOffsetRef.current = 0;
    thumbVirtualRebaseClearPendingRef.current = false;
    setThumbVirtualRebaseOffset(0);
  }

  function renderThumbVirtualWindow(
    next: FixedVirtualTrackWindow,
    metrics: NativeThumbVirtualMetrics,
    force = false
  ) {
    if (!force && sameFixedVirtualTrackWindow(thumbVirtualWindowRef.current, next)) return;

    thumbVirtualWindowRef.current = next;
    const slides: ReactElement<any>[] = [];
    thumbCells.current = [];

    next.items.forEach((item) => {
      const child = renderThumbContent(item.canonicalIndex, item.virtualIndex);
      if (!child) return;

      const keyPart = getThumbItemKey(item.canonicalIndex);
      const node = cloneThumb(
        child,
        `virtual-${item.virtualIndex}-${String(keyPart)}`,
        item.canonicalIndex,
        item.virtualIndex,
        item.offset
      );
      if (node) slides.push(node as ReactElement<any>);
    });

    pendingVirtualThumbsBuiltRef.current = true;
    setClonedChildren(slides);
  }

  function syncThumbVirtualWindowForOffset(scrollOffset: number, force = false) {
    const virtual = thumbVirtualMetricsRef.current;
    if (!virtual?.enabled) return;

    renderThumbVirtualWindow(
      buildFixedVirtualTrackWindow({
        metrics: virtual.metrics,
        scrollOffset,
        loop: virtual.shouldLoop,
        options: virtualization,
      }),
      virtual,
      force
    );
  }

  function syncThumbVirtualWindowForLocation(location: number, force = false) {
    syncThumbVirtualWindowForOffset(-location, force);
  }

  function computeCloneSig(originals: number, per: number) {
    return `${originals}|per=${per}|wrap=${wrap ? 1 : 0}`;
  }

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const originals = count;

      if (originals < 1) {
        clonesCountRef.current = 0;
        thumbCells.current = [];
        setClonedChildren([]);
        sliderWidth.current = 0;
        layoutRef.current = null;
        pagesRef.current = [];

        setWrapSafe(false);
        slidesRef.current = [];
        cellToSlideRef.current = [];
        return;
      }

      const allEls = Array.from(el.children) as HTMLElement[];
      const clonesBefore = clonesCountRef.current;
      const clonesAfter  = clonesBefore;
      const originalEls  = allEls.slice(clonesBefore, allEls.length - clonesAfter);

      const cw = readViewportMainSize(el);

      const virtualOptions = resolveSliderVirtualizationOptions(virtualization);
      const measuredSizes = usesItemRendering
        ? []
        : originalEls.map((slot) => slot.getBoundingClientRect()[AX.sizeKey]);
      const measuredFirstSize = usesItemRendering
        ? explicitThumbLong
        : measuredSizes.find((size) => size > 0) ?? thumbLong ?? thumbSize ?? 0;
      const hasFullMeasurement = usesItemRendering || originalEls.length === originals;
      const uniformMeasured =
        usesItemRendering ||
        !hasFullMeasurement ||
        measuredSizes.every((size) => Math.abs(size - measuredFirstSize) <= 0.5);
      const canUseVirtual =
        virtualOptions.enabled &&
        originals > virtualOptions.threshold &&
        measuredFirstSize > 0 &&
        cw > 0 &&
        uniformMeasured;

      if (canUseVirtual) {
        const baseMetrics = resolveFixedVirtualTrackMetricsFromCellSize({
          count: originals,
          viewport: cw,
          cellSize: measuredFirstSize,
          gap,
          loop,
        });

        if (baseMetrics) {
          const shouldLoop = shouldEnableSliderLoop({
            loop,
            itemCount: originals,
            span: baseMetrics.baseSpan,
            viewport: cw,
          });
          const metrics =
            baseMetrics.trackSpan === resolveSliderContentSpan({
              baseSpan: baseMetrics.baseSpan,
              gap,
              shouldLoop,
            })
              ? baseMetrics
              : resolveFixedVirtualTrackMetricsFromCellSize({
                  count: originals,
                  viewport: cw,
                  cellSize: measuredFirstSize,
                  gap,
                  loop: shouldLoop,
                });

          if (metrics) {
            thumbVirtualMetricsRef.current = {
              enabled: true,
              metrics,
              shouldLoop,
            };
            clonesCountRef.current = 0;
            clearThumbVirtualRebaseOffset();
            if (visibleThumbsRef.current !== Math.max(1, metrics.cellsPerSlide)) {
              visibleThumbsRef.current = Math.max(1, metrics.cellsPerSlide);
            }

            if (AX.main === "x") {
              el.style.width = `${metrics.trackSpan}px`;
              el.style.minWidth = `${metrics.trackSpan}px`;
            } else {
              el.style.height = `${metrics.trackSpan}px`;
              el.style.minHeight = `${metrics.trackSpan}px`;
            }

            setContentLength(metrics.trackSpan);
            setContainerLength(cw);
            setThumbLong(measuredFirstSize);
            if (hasFullMeasurement && !usesItemRendering) {
              const first = originalEls[0];
              if (first) {
                const rect = first.getBoundingClientRect();
                setThumbCross(AX.main === "x" ? rect.height : rect.width);
              }
            } else if (usesItemRendering) {
              const crossSize = AX.main === "x" ? thumbnailHeight : thumbnailWidth;
              if (
                typeof crossSize === "number" &&
                Number.isFinite(crossSize) &&
                crossSize > 0
              ) {
                setThumbCross(crossSize);
              }
            }
            setWrapSafe(shouldLoop);

            const currentLocation =
              offsetLocationRef.current?.get() ??
              xRef.current ??
              -activeThumbIndexRef.current * metrics.stride;
            syncThumbVirtualWindowForLocation(currentLocation, true);
            return;
          }
        }
      }

      if (virtualOptions.enabled && originals > virtualOptions.threshold) {
        warnSliderVirtualizationFallback(
          usesItemRendering
            ? "[react-motion-gallery] Thumbnail item virtualization needs fixed thumbnail dimensions and fell back to full rendering."
            : "[react-motion-gallery] Thumbnail virtualization needs uniform measured thumbnail sizes and fell back to full rendering."
        );
      }

      thumbVirtualMetricsRef.current = null;
      thumbVirtualWindowRef.current = null;
      clearThumbVirtualRebaseOffset();
      el.style.removeProperty('width');
      el.style.removeProperty('height');
      el.style.removeProperty('min-width');
      el.style.removeProperty('min-height');

      let sum = 0;
      let visibleCount = 0;
      for (const slot of originalEls) {
        const w = slot.getBoundingClientRect()[AX.sizeKey];
        if (w === 0) {
          requestAnimationFrame(() => ro.observe(el));
          return;
        }
        if (sum + w <= cw) {
          sum += w;
          visibleCount++;
        } else {
          visibleCount++;
          break;
        }
      }

      const per = Math.max(2, Math.min(originals, visibleCount));

      const shouldLoop = wrap;
      clonesCountRef.current = shouldLoop ? per : 0;
      if (visibleThumbsRef.current !== per) visibleThumbsRef.current = per;

      const sig = computeCloneSig(originals, per);
      if (sig === lastCloneSigRef.current) return;
      lastCloneSigRef.current = sig;

      const slides: ReactElement<any>[] = [];
      thumbCells.current = [];

      if (shouldLoop) {
        for (let i = 0; i < per; i += 1) {
          const canonicalIndex = originals - per + i;
          const elementIndex = -per + i;
          const child = renderThumbContent(canonicalIndex, elementIndex);
          const node = cloneThumb(
            child,
            `before-${String(getThumbItemKey(canonicalIndex))}-${i}`,
            canonicalIndex,
            elementIndex
          );
          if (node) slides.push(node as ReactElement<any>);
        }
      }

      for (let i = 0; i < originals; i += 1) {
        const canonicalIndex = i;
        const elementIndex = i;
        const child = renderThumbContent(canonicalIndex, elementIndex);
        const node = cloneThumb(
          child,
          `original-${String(getThumbItemKey(canonicalIndex))}`,
          canonicalIndex,
          elementIndex
        );
        if (node) slides.push(node as ReactElement<any>);
      }

      if (shouldLoop) {
        for (let i = 0; i < per; i += 1) {
          const canonicalIndex = i;
          const elementIndex = i;
          const child = renderThumbContent(canonicalIndex, elementIndex);
          const node = cloneThumb(
            child,
            `after-${String(getThumbItemKey(canonicalIndex))}-${i}`,
            canonicalIndex,
            elementIndex
          );
          if (node) slides.push(node as ReactElement<any>);
        }
      }

      setClonedChildren(slides);
    });

    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    children,
    virtualIndex,
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
    virtualization,
    count,
    usesItemRendering,
    explicitThumbLong,
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

  function commitThumbSelect(canonicalIndex: number) {
    if (canonicalIndex < 0 || canonicalIndex >= count) return;

    beginUiNavWheelTakeover();

    const thumbSlideIndex = findThumbSlideIndexForBaseIndex(canonicalIndex);
    const previousThumbIndex = activeThumbIndexRef.current;
    const shouldCrossfade = shouldUseThumbnailCrossfade({
      crossfade,
      fromIndex: previousThumbIndex,
      toIndex: canonicalIndex,
      count,
      loop: isWrapping.current,
    });

    snapModeRef.current = "thumb";
    muteChannelRef.current = true;

    activeThumbIndexRef.current = canonicalIndex;
    selectedSlideIndexRef.current = thumbSlideIndex;
    indexCurrentRef.current?.set(thumbSlideIndex);

    setActiveThumb(canonicalIndex);

    const scroll = centerActiveThumb
      ? getCenterScroll(canonicalIndex)
      : slidesRef.current[thumbSlideIndex]?.target ?? 0;

    animateToScroll(scroll);

    onSelectThumb?.(canonicalIndex, {
      transition: shouldCrossfade ? "crossfade" : "scroll",
      crossfade,
    });
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

      const virtual = thumbVirtualMetricsRef.current;
      if (virtual?.enabled) {
        const metrics = virtual.metrics;
        const cw = readViewportMainSize(trackEl);
        if (cw <= 0) return;

        const originalsForLayout = Array.from({ length: metrics.count }, (_, index) => {
          const start = index * metrics.stride;
          return {
            el: null,
            start,
            end: start + metrics.cellSize,
            size: metrics.cellSize,
          };
        });
        const wantLoop = shouldEnableSliderLoop({
          loop,
          itemCount: metrics.count,
          span: metrics.baseSpan,
          viewport: cw,
        });

        layoutRef.current = {
          originals: originalsForLayout,
          cw,
        };

        sliderWidth.current = resolveSliderContentSpan({
          baseSpan: metrics.baseSpan,
          gap,
          shouldLoop: wantLoop,
        });

        setContentLength(sliderWidth.current);
        setContainerLength(cw);
        setThumbLong(metrics.cellSize);

        const first = slideEls[0];
        if (first) {
          const rect = first.getBoundingClientRect();
          setThumbCross(AX.main === 'x' ? rect.height : rect.width);
        }

        const sig =
          `virtual|count=${metrics.count}` +
          `|cw=${roundSliderLayoutMetric(cw)}` +
          `|cell=${roundSliderLayoutMetric(metrics.cellSize)}` +
          `|W=${roundSliderLayoutMetric(metrics.baseSpan)}` +
          `|wrap=${wantLoop ? 1 : 0}`;

        if (sig !== lastGeomSigRef.current) {
          lastGeomSigRef.current = sig;
          setGeomKey((k) => k + 1)
        }

        setWrapSafe(wantLoop);
        setIsMeasured(true);
        return;
      }

      const sizes = slideEls.map((sl) => sl.getBoundingClientRect()[AX.sizeKey]);
      if (sizes.some((s) => s === 0)) {
        setTimeout(measureAndPosition, 0);
        return;
      }

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

      const cw = readViewportMainSize(trackEl);
      layoutRef.current = {
        originals: originalsForLayout,
        cw,
      };
      const originalsCount = layoutRef.current?.originals?.length ?? 0;
      const baseSpan = originalsForLayout[originalsCount - 1]?.end ?? 0;

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
      
      const flowSig = originalsForLayout
        .map((o) => `${roundSliderLayoutMetric(o.start)}:${roundSliderLayoutMetric(o.size)}`)
        .join(",");
      const sig =
        `${flowSig}|gap=${gap}|cw=${roundSliderLayoutMetric(cw)}` +
        `|W=${roundSliderLayoutMetric(baseSpan)}|wrap=${wantLoop ? 1 : 0}`;

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

  const contentSig = useMemo(() => {
    if (usesItemRendering) {
      return Array.from({ length: count }, (_, index) => {
        const key = getThumbItemKey(index);
        return `item:${String(key)}`;
      }).join('|');
    }
    return computeSliderChildrenKey(rawKids);
  }, [count, rawKids, usesItemRendering, itemList, getItemKey]);

  const mediaSig = useMemo(
    () =>
      `${contentSig}|build=${buildKey}|wrap=${wrap ? 1 : 0}|clones=${
        thumbVirtualMetricsRef.current?.enabled ? "virtual" : clonedChildren.length
      }`,
    [buildKey, clonedChildren.length, contentSig, wrap]
  );

  const lastContentSigRef = useRef<string>('');

  useEffect(() => {
    if (lastContentSigRef.current === mediaSig) return;
    lastContentSigRef.current = mediaSig;

    readyPaintedRef.current = false;
    setIsReady(false);
    setMediaReady(false);

    if (readyRafRef.current != null) {
      cancelAnimationFrame(readyRafRef.current);
      readyRafRef.current = null;
    }
  }, [mediaSig]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let canceled = false;
    const mediaNodes = Array.from(track.querySelectorAll("img,video")) as Array<
      HTMLImageElement | HTMLVideoElement
    >;

    if (mediaNodes.length === 0) {
      setMediaReady(true);
      return () => {
        canceled = true;
      };
    }

    void Promise.all(
      mediaNodes.map((node) => {
        if (node instanceof HTMLImageElement) {
          return waitForImageDecode(node);
        }

        return waitForVideoReady(node);
      })
    ).then(() => {
      if (canceled) return;
      setMediaReady(true);
    });

    return () => {
      canceled = true;
    };
  }, [mediaSig]);

  useEffect(() => {
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
      mediaReady &&
      sliderWidth.current > 0 &&
      slidesRef.current.length > 0 &&
      !!(thumbSize || thumbLong);

    if (!canBeReady) return;

    if (isReady && readyPaintedRef.current) return;

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
    mediaReady,
    thumbLong,
    thumbSize,
    position,
    isReady,
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

    const childCount = count
    const clonesBefore = wrap ? visibleThumbsRef.current : 0
    const clonesAfter = clonesBefore
    const cw = readViewportMainSize(containerEl)

    function buildPages() {
      if (canceled || !containerEl) return

      const allEls = Array.from(containerEl.children) as HTMLElement[]
      const virtual = thumbVirtualMetricsRef.current;
      if (virtual?.enabled) {
        const L = layoutRef.current;
        if (!L || !L.originals?.length) {
          retry();
          return;
        }

        const data = L.originals;
        const cw = L.cw || readViewportMainSize(containerEl);
        const renderedByCanonical = new Map<number, HTMLElement>();
        allEls.forEach((el) => {
          const raw = el.getAttribute('data-rmg-thumb-index');
          const index = raw == null ? NaN : Number.parseInt(raw, 10);
          if (Number.isFinite(index)) renderedByCanonical.set(index, el);
        });

        const maxTarget = Math.max(0, (sliderWidth.current || 0) - cw);
        const EPS = 0.5;
        const pages: Array<{
          target: number;
          indices: number[];
        }> = [];

        if (groupCells) {
          let i = 0;
          while (i < childCount) {
            const startLeft = data[i]?.start ?? 0;
            const viewRight = startLeft + cw;
            let j = i;
            while (j < childCount && (data[j]?.end ?? 0) <= viewRight + EPS) j++;
            if (j === i) j++;

            const isLast = j >= childCount;
            let target = startLeft;
            if (isLast && !wrap) target = maxTarget;
            if (i === 0) target = 0;

            pages.push({
              target,
              indices: Array.from({ length: j - i }, (_, offset) => i + offset),
            });
            i = j;
          }
        } else {
          if (wrap) {
            data.forEach((d, index) => {
              pages.push({ target: index === 0 ? 0 : d.start, indices: [index] });
            });
          } else {
            for (let index = 0; index < data.length; index++) {
              const d = data[index];
              let target = index === 0 ? 0 : d.start;
              target = Math.min(target, maxTarget);
              if (!pages.length || Math.abs(target - pages[pages.length - 1].target) > EPS) {
                pages.push({ target, indices: [index] });
              }
              if (Math.abs(target - maxTarget) <= EPS) break;
            }

            const winStart = maxTarget - EPS;
            const winEnd = maxTarget + cw + EPS;
            const lastIndices = data
              .map((d, index) => ({ d, index }))
              .filter(({ d }) => d.start < winEnd && d.end > winStart)
              .map(({ index }) => index);
            if (lastIndices.length) {
              const lastT = pages[pages.length - 1]?.target ?? -1;
              if (Math.abs(lastT - maxTarget) > EPS) {
                pages.push({ target: maxTarget, indices: lastIndices });
              } else {
                pages[pages.length - 1].indices = Array.from(
                  new Set(pages[pages.length - 1].indices.concat(lastIndices))
                );
              }
            }
          }
        }

        const newSlides: Slide[] = pages.map((page) => ({
          target: page.target,
          cells: page.indices.map((index) => ({
            element: renderedByCanonical.get(index) ?? null,
            index,
          })),
        }));

        pagesRef.current = pages.map((page) => ({
          startIndex: Math.min(...page.indices),
          endIndex: Math.max(...page.indices) + 1,
          targetScroll: page.target,
        }));

        const hasNaN = newSlides.some((s) => Number.isNaN(s.target));
        if (hasNaN || (wrap && newSlides.length === 1)) {
          retry();
          return;
        }

        const baseSpan = data[data.length - 1]?.end ?? 0;
        const nextWrap = shouldEnableSliderLoop({
          loop,
          itemCount: data.length,
          span: baseSpan,
          viewport: cw,
        });
        if (nextWrap !== wrap) {
          setWrapSafe(nextWrap);
          return;
        }

        isWrapping.current = nextWrap;
        slidesRef.current = newSlides;
        if (!layoutReadyRef.current) {
          layoutReadyRef.current = true;
          setLayoutReady(true);
        }

        const map: number[] = [];
        newSlides.forEach((slide, slideIdx) => {
          slide.cells.forEach((cell) => {
            map[cell.index] = slideIdx;
          });
        });
        cellToSlideRef.current = map;
        return;
      }

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
            if (d.el) pages.push({ els: [d.el], target: t })
          })
        } else {
          for (let idx = 0; idx < data.length; idx++) {
            const d = data[idx]
            let t = idx === 0 ? 0 : d.start
            t = Math.min(t, maxTarget)

            if (!pages.length || Math.abs(t - pages[pages.length - 1].target) > EPS) {
              if (d.el) pages.push({ els: [d.el], target: t })
            }

            if (Math.abs(t - maxTarget) <= EPS) break
          }

          const winStart = maxTarget - EPS
          const winEnd = maxTarget + cw + EPS

          const lastEls = data
            .filter((d) => d.start < winEnd && d.end > winStart)
            .map((d) => d.el)
            .filter((el): el is HTMLElement => !!el)

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
            if (fallback?.el) {
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

      pagesRef.current = pages
        .map((page) => {
          const indices = page.els
            .map((el) => idxMap.get(el))
            .filter((idx): idx is number => typeof idx === 'number')

          if (!indices.length) return null

          return {
            startIndex: Math.min(...indices),
            endIndex: Math.max(...indices) + 1,
            targetScroll: page.target,
          }
        })
        .filter((page): page is Page => page !== null)

      const hasNaN = newSlides.some((s) => Number.isNaN(s.target))
      const unstable = hasNaN || (wrap && newSlides.length === 1)
      if (unstable) {
        retry()
        return
      }

      const layoutOriginals = layoutRef.current?.originals ?? []
      const baseSpan = layoutOriginals[layoutOriginals.length - 1]?.end ?? 0

      const nextWrap = shouldEnableSliderLoop({
        loop,
        itemCount: newSlides.length,
        span: baseSpan,
        viewport: cw,
      })
      // Rebuild clones against the new loop mode before committing slide pages.
      if (nextWrap !== wrap) {
        setWrapSafe(nextWrap)
        return
      }

      isWrapping.current = nextWrap

      slidesRef.current = newSlides

      if (!layoutReadyRef.current) {
        layoutReadyRef.current = true
        setLayoutReady(true)
      }

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

  useLayoutEffect(() => {
    if (!pendingVirtualThumbsBuiltRef.current) return;
    if (!thumbVirtualMetricsRef.current?.enabled) return;

    pendingVirtualThumbsBuiltRef.current = false;
    clearThumbVirtualRebaseOffset();
  }, [clonedChildren]);

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
    if (thumbVirtualMetricsRef.current?.enabled) {
      setVirtualIndex(i);
    }

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
      [data-rmg-thumb-core-scope="${scopeId}"][data-rmg-drag]        { cursor: grabbing !important; }
      [data-rmg-thumb-core-scope="${scopeId}"][data-rmg-drag] *      { cursor: grabbing !important; }
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

  function findThumbSlideIndexForBaseIndex(baseIndex: number) {
    const slides = slidesRef.current;
    if (!slides.length) return 0;

    const matched = slides.findIndex((slide) =>
      slide.cells.some((cell) => cell.index === baseIndex)
    );

    return matched >= 0 ? matched : 0;
  }

  function getActiveSelectionScroll(canonicalIndex: number, thumbSlideIndex: number) {
    if (centerActiveThumb) return getCenterScroll(canonicalIndex);
    return slidesRef.current[thumbSlideIndex]?.target ?? 0;
  }

  function getCurrentVisibleThumbIndices() {
    const slideIndices =
      slidesRef.current[selectedSlideIndexRef.current]?.cells.map(
        (cell) => cell.index
      ) ?? [];
    const layout = layoutRef.current;
    const viewport = layout?.cw || containerLength || 0;

    if (!layout?.originals?.length || viewport <= 0) return slideIndices;

    const location =
      offsetLocationRef.current?.get() ??
      xRef.current ??
      targetRef.current?.get() ??
      0;
    const visibleIndices = resolveThumbnailVisibleIndicesForScroll({
      items: layout.originals.map((item, index) => ({
        index,
        start: item.start,
        end: item.end,
      })),
      scroll: -location,
      viewport,
      trackSpan: sliderWidth.current || contentLength,
      loop: isWrapping.current,
    });

    return visibleIndices.length ? visibleIndices : slideIndices;
  }

  function cancelSyncFadeTimers() {
    syncFadeRafRef.current.forEach((rafId) => window.cancelAnimationFrame(rafId));
    syncFadeRafRef.current = [];

    if (syncFadeTimerRef.current != null) {
      window.clearTimeout(syncFadeTimerRef.current);
      syncFadeTimerRef.current = null;
    }
  }

  function clearSyncFade() {
    cancelSyncFadeTimers();
    setSyncFade(null);
  }

  function getThumbSelector(index: number) {
    const value = String(index);
    const escaped =
      typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
        ? CSS.escape(value)
        : value.replace(/"/g, '\\"');
    return `[data-rmg-thumb-index="${escaped}"]`;
  }

  function captureSyncFadeOverlayItems(visibleIndices: readonly number[]) {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track || !visibleIndices.length) return [];

    const containerRect = container.getBoundingClientRect();
    const uniqueIndices = Array.from(new Set(visibleIndices));

    return uniqueIndices.flatMap((index, order): SyncFadeOverlayItem[] => {
      const child = renderThumbContent(index);
      if (!child) return [];

      const matches = Array.from(
        track.querySelectorAll<HTMLElement>(getThumbSelector(index))
      );
      if (!matches.length) return [];

      let bestEl: HTMLElement | null = null;
      let bestArea = -1;

      for (const el of matches) {
        const rect = el.getBoundingClientRect();
        const overlapX = Math.max(
          0,
          Math.min(rect.right, containerRect.right) -
            Math.max(rect.left, containerRect.left)
        );
        const overlapY = Math.max(
          0,
          Math.min(rect.bottom, containerRect.bottom) -
            Math.max(rect.top, containerRect.top)
        );
        const area = overlapX * overlapY;

        if (area > bestArea) {
          bestArea = area;
          bestEl = el;
        }
      }

      if (!bestEl) return [];

      const rect = bestEl.getBoundingClientRect();
      return [
        {
          key: `sync-fade-${syncFadeIdRef.current + 1}-${index}-${order}`,
          index,
          active: index === activeThumbIndexRef.current,
          node: child,
          style: {
            ...(thumbnailItemStyle || {}),
            position: 'absolute',
            left: rect.left - containerRect.left,
            top: rect.top - containerRect.top,
            width: rect.width,
            height: rect.height,
            transform: 'none',
            cursor: 'default',
            pointerEvents: 'none',
          },
        },
      ];
    });
  }

  function applyInstantSyncScroll(scroll: number) {
    bodyRef.current?.useDuration(0).useFriction(1);
    setTargetToScroll(scroll);

    const nextLocation = targetRef.current?.get();
    if (typeof nextLocation !== 'number') {
      animRef.current?.start();
      return;
    }

    locationRef.current?.set(nextLocation);
    previousLocationRef.current?.set(nextLocation);
    offsetLocationRef.current?.set(nextLocation);
    xRef.current = nextLocation;

    positionSlider();
    syncThumbVirtualWindowForLocation(nextLocation, true);
    updateArrowsImperatively();

    animRef.current?.start();
  }

  function beginFadeOnSyncScroll(
    scroll: number,
    options: ReturnType<typeof resolveThumbnailFadeOnSyncOptions>,
    overlayItems: SyncFadeOverlayItem[]
  ) {
    const durationMs = prefersReducedMotion ? 0 : options.durationMs;
    if (overlayItems.length === 0) return false;

    cancelSyncFadeTimers();

    if (durationMs <= 0) {
      applyInstantSyncScroll(scroll);
      setSyncFade(null);
      return true;
    }

    const id = syncFadeIdRef.current + 1;
    syncFadeIdRef.current = id;

    flushSync(() => {
      setSyncFade({
        id,
        phase: 'hold',
        items: overlayItems,
        durationMs,
        easing: options.easing,
      });
    });

    applyInstantSyncScroll(scroll);

    const rafId = window.requestAnimationFrame(() => {
      const nextRafId = window.requestAnimationFrame(() => {
        syncFadeRafRef.current = syncFadeRafRef.current.filter(
          (storedId) => storedId !== nextRafId
        );

        setSyncFade((current) =>
          current?.id === id ? { ...current, phase: 'fade' } : current
        );

        syncFadeTimerRef.current = window.setTimeout(() => {
          setSyncFade((current) => (current?.id === id ? null : current));
          syncFadeTimerRef.current = null;
        }, durationMs + 80);
      });

      syncFadeRafRef.current = syncFadeRafRef.current.filter(
        (storedId) => storedId !== rafId
      );
      syncFadeRafRef.current.push(nextRafId);
    });

    syncFadeRafRef.current.push(rafId);
    return true;
  }

  useEffect(() => {
    return () => {
      cancelSyncFadeTimers();
    };
  }, []);

  useEffect(() => {
    const ch = channelRef.current;

    const unsub = ch.subscribe(() => {
      const { index, mode } = ch.get();
      const canonicalIndex = clamp(index, 0, Math.max(0, count - 1));
      const thumbSlideIndex = findThumbSlideIndexForBaseIndex(canonicalIndex);
      const currentVisibleIndices = getCurrentVisibleThumbIndices();

      if (snapModeRef.current === "thumb" || muteChannelRef.current) {
        return;
      }

      const sameSlide = thumbSlideIndex === selectedSlideIndexRef.current;
      const sameThumb = canonicalIndex === activeThumbIndexRef.current;

      if (sameSlide && sameThumb) {
        setActiveThumb(canonicalIndex);
        return;
      }

      const fadeOptions = resolveThumbnailFadeOnSyncOptions(fadeOnSync);
      const shouldFadeSync = shouldFadeThumbnailSync({
        fadeOnSync,
        targetIndex: canonicalIndex,
        visibleIndices: currentVisibleIndices,
        count,
        loop: isWrapping.current,
      });
      const syncFadeOverlayItems = shouldFadeSync
        ? captureSyncFadeOverlayItems(currentVisibleIndices)
        : [];

      activeThumbIndexRef.current = canonicalIndex;
      selectedSlideIndexRef.current = thumbSlideIndex;
      indexCurrentRef.current?.set(thumbSlideIndex);

      setActiveThumb(canonicalIndex);

      if (pointerDownRef.current) return;

      snapModeRef.current = "base";

      const scroll = getActiveSelectionScroll(canonicalIndex, thumbSlideIndex);

      if (mode === "instant") {
        clearSyncFade();
        applyInstantSyncScroll(scroll);
      } else if (
        shouldFadeSync &&
        beginFadeOnSyncScroll(scroll, fadeOptions, syncFadeOverlayItems)
      ) {
        return;
      } else {
        clearSyncFade();
        animateToScroll(scroll);
      }
    });

    return unsub;
  }, [count, thumbnailsCenter, contentLength, containerLength, fadeOnSync, prefersReducedMotion]);

  useEffect(() => {
    const ch = channelRef.current;

    return ch.onBasePointerDown(() => {
      if (snapModeRef.current === "thumb") {
        muteChannelRef.current = false;
        snapModeRef.current = "base";
      }
    });
  }, []);

  useEffect(() => {
    if (!layoutReady || !isMeasured) return;
    if (!trackRef.current) return;
    if (!trackRef.current.children.length) return;

    const i = clamp(channelRef.current.get().index ?? 0, 0, Math.max(0, count - 1));
    setActiveThumb(i);

    animateToScroll(getScrollForIndex(i));
  }, [layoutReady, isMeasured, geomKey, buildKey, wrap, count]);

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
    if (programNavRef.current) return;

    const slideIndex = indexFromX(loc);
    if (slideIndex === selectedSlideIndexRef.current) return;

    indexCurrentRef.current?.set(slideIndex);
    selectedSlideIndexRef.current = slideIndex;
  }

  function scrollToIndex(
    requested: number,
    opts: { jump?: boolean; direction?: number; programmatic?: boolean } = {}
  ) {
    const { jump = false, direction, programmatic = false } = opts
    const indexCurrent = indexCurrentRef.current
    if (!scrollToRef.current || !bodyRef.current || !indexCurrent) return

    if (programmatic) programNavRef.current = true

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
    scrollToIndex(target, { direction: 1, programmatic: true })
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
    scrollToIndex(target, { direction: -1, programmatic: true })
  }

  function previousFromUi() {
    beginUiNavWheelTakeover()
    previous()
  }

  function nextFromUi() {
    beginUiNavWheelTakeover()
    next()
  }

  function commitIndex(nextIdx: number, mode: IndexMode) {
    setActiveThumb(nextIdx)

    const scroll = getScrollForIndex(nextIdx)

    if (mode === 'instant') {
      bodyRef.current?.useDuration(0).useFriction(1)
      setTargetToScroll(scroll)
      animRef.current?.start()
    } else {
      animateToScroll(scroll)
    }
  }

  function updateArrowsImperatively() {
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

  function isFromArrow(target: EventTarget | null) {
    const t = target as HTMLElement | null
    if (!t) return false

    const prev = prevButtonRef.current
    const next = nextButtonRef.current

    return !!(
      (prev && (t === prev || prev.contains(t))) ||
      (next && (t === next || next.contains(t)))
    )
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

    const virtual = thumbVirtualMetricsRef.current;
    const activeIndex = clamp(channelRef.current.get().index ?? 0, 0, Math.max(0, count - 1));
    const startIdx = virtual?.enabled
      ? findThumbSlideIndexForBaseIndex(activeIndex)
      : selectedSlideIndexRef.current || 0;

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
    const startIndex = startIdx

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

    const initialSnap = virtual?.enabled
      ? -(centerActiveThumb
          ? getCenterScroll(activeIndex)
          : slidesRef.current[startIdx]?.target ?? 0)
      : scrollSnaps[startIdx] ?? 0

    location.set(initialSnap);
    previousLocation.set(initialSnap);
    offsetLocation.set(initialSnap);
    target.set(initialSnap);
    xRef.current = initialSnap;
    if (virtual?.enabled) {
      syncThumbVirtualWindowForLocation(initialSnap, true);
    }

    translateRef.current = Translate(track, AX);
    translateRef.current?.to((initialSnap + base) * sign)

    if (virtual?.enabled) {
      activeThumbIndexRef.current = activeIndex;
    }
    selectedSlideIndexRef.current = startIdx;

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
      const cw = readViewportMainSize(track);
      const min = -(Math.max(0, sliderWidth.current - cw))
      const max = 0
      limitRef.current = Limit(isNaN(min) ? 0 : min, max)

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

        if (wrap && W > 0) {
          const body = bodyRef.current!
          const dir = body.direction() || Math.sign(targetRef.current!.get() - locationRef.current!.get()) || 0
          const loopShift = looper?.loop(dir) ?? 0
          if (loopShift !== 0) {
            applyThumbVirtualLoopCompensation(loopShift)
            syncThumbVirtualWindowForLocation(locationRef.current!.get(), true)
          }
        }

        xRef.current = locationRef.current!.get()
      },
      (alpha) => {
        const body = bodyRef.current
        const shouldSettle = body ? body.settled() : true
        const recoveringOob = !wrap && (boundsRef.current?.reached() ?? false)
        const idle = shouldSettle && !pointerDownRef.current && !recoveringOob
        if (idle) {
          animRef.current?.stop();
          isAnimatingRef.current = false;
        }
        const cur = locationRef.current!.get()
        const prev = previousLocationRef.current!.get()
        const loc = cur * alpha + prev * (1 - alpha)
        offsetLocationRef.current!.set(loc)
        xRef.current = loc
        positionSlider()
        syncThumbVirtualWindowForLocation(loc)
        updateArrowsImperatively()
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
      if (isFromArrow(evt.target)) return
      const isMouseEvt = isMouseEvent(evt as any, window as any)
      isMouse = isMouseEvt
      if (isMouseEvt && (evt as MouseEvent).button !== 0) return

      downTargetRef.current = evt.target

      setDragCursor(true);
      lockWheelFor(WHEEL_LOCK_MS);

      pointerDownRef.current = true
      isPointerDown.current = true
      isClickRef.current = true
      programNavRef.current = false

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
      unlockWheelNow();
      lockWheelFor(300);

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

          const curIndex = selectedSlideIndexRef.current || 0
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
        
        const isOutOfBounds = boundsRef.current?.passed()

        const force = allowedForce(boostedForce)

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

      const trackEl = trackRef.current;
      if (!trackEl) return;

      const containerSize = readViewportMainSize(trackEl);
      const contentSize = sliderWidth.current;
      const canScrollMain = contentSize > containerSize;

      const isMain =
        AX.main === "x"
          ? Math.abs(e.deltaX) > Math.abs(e.deltaY)
          : Math.abs(e.deltaY) >= Math.abs(e.deltaX);

      if (!isMain || !canScrollMain) return;
      programNavRef.current = false;

      const cur = (offsetLocationRef.current?.get() ?? 0) - (AX.wheelDelta(e) * sign);
      let next = cur;
      if (!wrap && limitRef.current) next = limitRef.current.constrain(cur);

      bodyRef.current?.useDuration(0).useFriction(1);

      targetRef.current?.set(next);
      locationRef.current?.set(next);
      previousLocationRef.current?.set(next);
      offsetLocationRef.current?.set(next);
      xRef.current = next;

      positionSlider();
      syncThumbVirtualWindowForLocation(next);
      updateActiveIndexFromX(next);

      animRef.current?.start();
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
  }, [count, contentLength, containerLength, position, layoutReady, geomKey, isMeasured, wrap]);

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

  const normalizedReveal = useMemo(() => {
    const src = revealOptions ?? {};
    return {
      renderReveal: src.renderReveal,
      staggerMs: src.staggerMs ?? 40,
      durationMs: src.durationMs ?? 300,
      easing: src.easing ?? 'cubic-bezier(.2,.7,.2,1)',
    };
  }, [revealOptions]);

  const shouldDelayItemFallbackForVirtualization = (() => {
    if (!usesItemRendering) return false;
    const options = resolveSliderVirtualizationOptions(virtualization);
    return (
      options.enabled &&
      count > options.threshold &&
      explicitThumbLong > 0 &&
      !clonedChildren.length
    );
  })();

  const renderedThumbs = clonedChildren.length
    ? clonedChildren
    : shouldDelayItemFallbackForVirtualization
      ? []
      : Array.from({ length: count }, (_, i) => {
          const child = renderThumbContent(i, i);
          return cloneThumb(
            child,
            `fallback-${String(getThumbItemKey(i))}`,
            i,
            i
          );
        }).filter(Boolean);

  const revealChildren = useMemo(() => {
    return renderedThumbs.map((child: any, i: number) => {
      if (!isValidElement(child)) return child;

      const el = child as React.ReactElement<any>;
      const prevStyle = (el.props?.style || {}) as React.CSSProperties;

      return cloneElement<any>(el, {
        ...el.props,
        'data-rmg-index': i,
        style: {
          ...prevStyle,
          ['--rmg-reveal-index' as any]: i,
        } as React.CSSProperties & Record<string, any>,
      });
    });
  }, [renderedThumbs]);

  const fadeClass = (isReady && inView && (revealUnlocked ?? true))
    ? cls.fadeInActive
    : cls.fadeInStart;

  const baseContainerProps: React.HTMLAttributes<HTMLDivElement> = {
    className: [cls.fade_container, fadeClass].filter(Boolean).join(' ')
  };

  const measuredTrackCrossSize =
    AX.main === 'x'
      ? (thumbnailHeight ?? (thumbCross > 0 ? thumbCross : undefined) ?? thumbSize)
      : (thumbnailWidth ?? (thumbCross > 0 ? thumbCross : undefined) ?? thumbSize);
  const resolvedTrackCrossMinSize = resolveTrackCrossMinSize({
    isHorizontal,
    measuredTrackCrossSize,
    style,
    thumbnailsContainerStyle,
  });

  const outerStyle: React.CSSProperties = {
    boxSizing: 'border-box',
    overflow: 'hidden',
    ...(isHorizontal
      ? {
          width: thumbnailsContainerWidth,
          height: thumbnailsContainerHeight,
          minHeight: thumbnailsContainerHeight == null ? resolvedTrackCrossMinSize : undefined,
        }
      : {
          height: thumbnailsContainerHeight,
          width: thumbnailsContainerWidth,
          minWidth: thumbnailsContainerWidth == null ? resolvedTrackCrossMinSize : undefined,
        }),
    ...(style || {}),
  }

  const thumbVirtualTrackMetrics = thumbVirtualMetricsRef.current?.metrics ?? null;
  const trackCrossSize = measuredTrackCrossSize ?? '100%';
  const trackMainSize =
    AX.main === 'x'
      ? (thumbVirtualTrackMetrics ? `${thumbVirtualTrackMetrics.trackSpan}px` : '100%')
      : (thumbVirtualTrackMetrics
          ? `${thumbVirtualTrackMetrics.trackSpan}px`
          : contentLength > 0
            ? `${contentLength}px`
            : '100%');
  const trackStyle: React.CSSProperties = {
    position: 'relative',
    width: isHorizontal ? trackMainSize : trackCrossSize,
    height: isHorizontal ? trackCrossSize : trackMainSize,
    willChange: 'transform',
    backfaceVisibility: 'hidden',
    touchAction: 'none',
    visibility: isReady ? 'visible' : 'hidden',
    opacity: syncFade?.phase === 'hold' ? 0 : 1,
    transition:
      syncFade?.phase === 'fade'
        ? `opacity ${syncFade.durationMs}ms ${syncFade.easing}`
        : undefined,
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
      selectedIndex={selectedSlideIndexRef.current}
      slideCount={slidesRef.current?.length ?? 0}
      measureRef={containerRef}
      viewportMainSizeRef={sliderWidth}
      previous={previousFromUi}
      next={nextFromUi}
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

  const syncFadeOverlay = syncFade ? (
    <div
      aria-hidden="true"
      className={cls.syncFadeOverlay}
      data-rmg-thumb-sync-fade-overlay="true"
      data-rmg-thumb-sync-fade-phase={syncFade.phase}
      onTransitionEnd={(event) => {
        if (event.currentTarget !== event.target) return;
        if (syncFade.phase === 'fade') clearSyncFade();
      }}
      style={{
        opacity: syncFade.phase === 'fade' ? 0 : 1,
        transition:
          syncFade.phase === 'fade'
            ? `opacity ${syncFade.durationMs}ms ${syncFade.easing}`
            : 'none',
      }}
    >
      {syncFade.items.map((item) => (
        <div
          key={item.key}
          className={[cls.thumb, cls.syncFadeThumb, thumbnailItemClassName]
            .filter(Boolean)
            .join(' ')}
          data-active={item.active ? 'true' : undefined}
          data-rmg-thumb-sync-fade-index={item.index}
          style={item.style}
          draggable={false}
        >
          {item.node}
        </div>
      ))}
    </div>
  ) : null;

  const inner = (
    <>
      {arrowNodes}
      <div ref={trackRef} style={trackStyle}>
        {revealChildren}
      </div>
      {syncFadeOverlay}
    </>
  );

  const root = (
    <div
      {...baseContainerProps}
      ref={containerRef}
      data-rmg-thumb-core-scope={scopeId}
      data-rmg-scope={scopeId}
      className={[className, thumbnailsContainerClassName, baseContainerProps.className]
        .filter(Boolean)
        .join(' ')
      }
      style={{
        ...outerStyle,
        ...(thumbnailsContainerStyle || {}),
        ...(baseContainerProps.style || {}),
        ['--rmg-reveal-stagger' as any]: `${normalizedReveal.staggerMs}ms`,
        ['--rmg-reveal-duration' as any]: `${normalizedReveal.durationMs}ms`,
        ['--rmg-reveal-easing' as any]: normalizedReveal.easing,
      }}
    >
      {normalizedReveal.renderReveal
        ? normalizedReveal.renderReveal(
            { active: isReady && inView && (revealUnlocked ?? true), containerProps: baseContainerProps },
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
