'use client';

import * as React from 'react';
import { FullscreenModal } from './FullscreenModal';
import { FullscreenSlider } from './FullscreenSlider';
import { FsEntryOverlay } from '../entries/overlay/useFsEntryOverlay';
import type { FullscreenSliderHandle } from './FullscreenSlider';
import type { EntriesOptions, MediaEntryLink } from '../entries/types';
import type { APITypes } from '../video/plyrTypes';
import type { FullscreenThumbnailSlotLayout } from '../fullscreenThumbnails/types';
import { MediaItem } from '../shared/types/media';
import { runFullscreenIntro } from './fullscreenIntro';
import {
  FsCaptionPlacement,
  FsIntroRequest,
  FullscreenCrossfadeOptions,
  FullscreenOptions,
  FullscreenIntroPathTiming,
  FullscreenPlugin,
  FullscreenRuntimeFeatures,
} from './types';
import type { SliderSkipSnaps } from '../slider/types';
import type { Root } from 'react-dom/client';
import {
  renderFullscreenBaseCrossfadeSlides,
  renderFullscreenBaseSlides,
} from './renderFullscreenBaseSlides';
import { createSingleTransform, createWrappedTransform } from './transforms';
import { useWrappedItemsAndRefs } from './hooks/useWrappedItemsAndRefs';
import type { ScrollBoundsType } from '../shared/motion/scrollBounds';
import type { ScrollBodyType } from '../shared/motion/scrollBody';
import type { Vector1DType } from '../shared/motion/vector1d';
import type { PanAxisType as AxisType } from '../shared/types/axis';
import type { AnimationsType } from '../shared/motion/animations';
import { FsCaptionOverlay } from './useFsCaptionOverlay';
import { useOptionalGalleryCore } from '../core';
import { FullscreenOpenMethod } from '../api/types';
import {
  isEntryOwnerReady,
  scrollEntrySectionIntoView,
  waitForEntryOwnerReady,
} from './entryOwnerReady';
import {
  resolveFullscreenIntroDurationMs,
  resolveFullscreenIntroEasing,
  type FullscreenIntroPath,
} from './introTiming';
import {
  ResponsiveCaptionPlacement,
  resolveLengthFromResponsive,
} from '../shared/responsive';

export type FullscreenRuntimeProps = {
  fsEnabled: boolean;
  fsSub: any;
  showFullscreenModal: boolean;
  setShowFullscreenModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowFullscreenSlider: React.Dispatch<React.SetStateAction<boolean>>;
  showFullscreenSlider: boolean;
  isClick: React.RefObject<boolean>;
  isAnimatingRef: React.RefObject<boolean>;
  overlayDivRef: React.RefObject<HTMLDivElement | null>;
  duplicateImgRef: React.RefObject<HTMLElement | null>;
  cells: React.RefObject<{ element: HTMLElement; index: number }[]>;
  slidesForFullscreen: React.RefObject<
    { cells: { element: HTMLElement; index: number }[]; target: number }[]
  >;
  sliderForFullscreen: React.RefObject<HTMLDivElement | null>;
  isWrappingForFullscreen: React.RefObject<boolean>;
  setClosingModal: React.Dispatch<React.SetStateAction<boolean>>;
  closingModal: boolean;
  closeButtonRef: React.RefObject<HTMLElement | null>;
  counterRef: React.RefObject<HTMLElement | null>;
  leftChevronRef: React.RefObject<HTMLElement | null>;
  rightChevronRef: React.RefObject<HTMLElement | null>;
  centerSliderForFullscreen: () => void;
  setSliderIndexForFullscreen: (index: number, mode?: any) => void;
  layout?: 'slider' | 'grid' | 'masonry' | 'entries' | null;
  expandableImageRefs: React.RefObject<any[]>;
  resolveLayoutlessTarget: (index: number) => {
    host: HTMLElement | null;
    image: HTMLImageElement | null;
    media: HTMLElement | null;
  };
  entryMapRef: React.RefObject<MediaEntryLink[] | null>;
  entryMediaLayout: any;
  transitionFade: boolean;
  transitionDuration?: FullscreenIntroPathTiming<number>;
  transitionEasing?: FullscreenIntroPathTiming<string>;
  fullscreenSliderApi: React.RefObject<FullscreenSliderHandle | null>;
  slideIndex: number;
  isZoomClick: React.RefObject<boolean>;
  isZoomed: boolean;
  windowSize: any;
  imageRefs: React.RefObject<React.RefObject<HTMLDivElement | null>[]>;
  wrappedItems: MediaItem[];
  setWrappedItems: React.Dispatch<React.SetStateAction<MediaItem[]>>;
  scale: number;
  isZooming: React.RefObject<boolean>;
  singleModePlyrRefs: React.RefObject<(APITypes | null)[]>;
  wrappedModePlyrRefs: React.RefObject<(APITypes | null)[]>;
  direction: 'ltr' | 'rtl';
  sliderGap?: number;
  sliderDuration: number;
  sliderFriction: number;
  sliderSkipSnaps?: SliderSkipSnaps;
  sliderStrictSnaps?: boolean;
  suppressLoopRef: React.RefObject<boolean>;
  fsFadeOpening: boolean;
  normalizedItems: MediaItem[];
  fsThumbContainerRef: React.RefObject<HTMLDivElement | null>;
  fullscreenThumbnailSlot: FullscreenThumbnailSlotLayout | null;
  setFullscreenThumbnailMountEl: React.RefCallback<HTMLDivElement>;
  showFsEntryOverlayMount: boolean;
  fsIntroReq: FsIntroRequest;
  clearFsIntroReq: () => void;
  styles: Record<string, string>;
  fs: FullscreenOptions;
  overlayCaptionRef: React.RefObject<HTMLDivElement | null>;
  overlayCaptionRootRef: React.RefObject<Root | null>;
  setFsFadeOpening: React.Dispatch<React.SetStateAction<boolean>>;
  addShield: (timeoutMs?: number | undefined) => void;
  resolveFsCaptionPlacement: (
    placement: ResponsiveCaptionPlacement | undefined,
    breakpoint: number | undefined,
    viewportWidth: number
  ) => FsCaptionPlacement | null;
  requestFsCloseRef: React.RefObject<null | (() => void)>;
  cancelFsCloseRef: React.RefObject<null | (() => void)>;
  suppressNextClickRef: React.RefObject<boolean>;
  currentImage: React.RefObject<HTMLDivElement | null>;
  scaleRef: React.RefObject<number>;
  pointerDownRef: React.RefObject<boolean>;
  interactionModeRef: React.RefObject<'idle' | 'drag' | 'wheel' | 'programmatic'>;
  boundsX: React.RefObject<ScrollBoundsType | null>;
  boundsY: React.RefObject<ScrollBoundsType | null>;
  bodyX: React.RefObject<ScrollBodyType | null>;
  bodyY: React.RefObject<ScrollBodyType | null>;
  locX: React.RefObject<Vector1DType | null>;
  locY: React.RefObject<Vector1DType | null>;
  prevX: React.RefObject<Vector1DType | null>;
  prevY: React.RefObject<Vector1DType | null>;
  offX: React.RefObject<Vector1DType | null>;
  offY: React.RefObject<Vector1DType | null>;
  tgtX: React.RefObject<Vector1DType | null>;
  tgtY: React.RefObject<Vector1DType | null>;
  axisRef: React.RefObject<AxisType | null>;
  animRef: React.RefObject<AnimationsType | null>;
  setScale: (newScale: number) => void;
  previousZoom: React.RefObject<{ x: number; y: number }>;
  panRef: React.RefObject<{ x: number; y: number }>;
  changingSlides: React.RefObject<boolean>;
  fsIndexRef: React.RefObject<number>;
  entriesObject: EntriesOptions;
  syncFullscreenSourceFromIndex: (nextIndex: number) => void;
  setFullscreenOpen: (open: boolean) => void;
  runtimePlugins?: FullscreenPlugin[];
};

const EMPTY_RUNTIME_PLUGINS: FullscreenPlugin[] = [];
const EMPTY_PLAYER_STYLE: React.CSSProperties = {};

function useEmptyPlyrProps(_args?: unknown) {
  return React.useMemo(() => [], []);
}

function useNoopZoomPanRuntime() {
  const isPinching = React.useRef(false);
  const isTouchPinching = React.useRef(false);
  const noop = React.useCallback(() => {}, []);

  return React.useMemo(
    () => ({
      isPinching,
      isTouchPinching,
      entryOverlayZoomMotion: undefined,
      captionZoomMotion: undefined,
      handlePanPointerStart: noop,
      handleZoomToggle: noop,
      resetAllZoomDom: noop,
      resetForSlideNavigation: noop,
      forceResetZoom: noop,
      handleHoverPointerEnter: noop,
      handleHoverPointerMove: noop,
      handleHoverPointerLeave: noop,
    }),
    [isPinching, isTouchPinching, noop]
  );
}

function mergeRuntimeFeatures(plugins: FullscreenPlugin[]): FullscreenRuntimeFeatures {
  return plugins.reduce<FullscreenRuntimeFeatures>((merged, plugin) => {
    if (!plugin.runtime) return merged;
    return { ...merged, ...plugin.runtime };
  }, {});
}

function canonicalIndexOf(active: number, len: number) {
  return ((active % len) + len) % len;
}

function fullscreenMediaSignature(items: MediaItem[]) {
  return items
    .map((item) => {
      const any = item as any;
      return `${item.kind}|${any.src ?? ''}|${any.srcSet ?? ''}|${any.sizes ?? ''}|${any.poster ?? ''}`;
    })
    .join('||');
}

function isCrossOriginMediaUrl(src: string) {
  if (typeof window === 'undefined') return false;

  try {
    const url = new URL(src, window.location.href);
    return url.origin !== window.location.origin;
  } catch {
    return false;
  }
}

function shouldUseAnonymousCrossOrigin(src: string) {
  if (!isCrossOriginMediaUrl(src)) return false;
  return /\.(?:mp4|m4v|webm|ogv|ogg|mov)(?:[?#]|$)/i.test(src);
}

function pausePlyrApi(api: APITypes | null) {
  if (!api) return;

  try {
    (api as any)?.pause?.();
  } catch {}

  const plyr = (api as any)?.plyr ?? null;

  try {
    plyr?.pause?.();
  } catch {}

  try {
    const media: HTMLMediaElement | undefined = plyr?.media;
    media?.pause?.();
  } catch {}
}

export function getFullscreenVideoOpenRefIndex(args: {
  canonicalIndex: number;
  canonicalLength: number;
}) {
  const { canonicalIndex, canonicalLength } = args;

  if (!Number.isFinite(canonicalIndex)) return null;
  if (!Number.isFinite(canonicalLength) || canonicalLength <= 0) return null;

  const normalizedIndex = canonicalIndexOf(canonicalIndex, canonicalLength);
  return canonicalLength > 1 ? normalizedIndex + 1 : normalizedIndex;
}

export function shouldPlayFullscreenVideoOnOpen(args: {
  enabled?: boolean;
  showFullscreenModal: boolean;
  showFullscreenSlider: boolean;
  closingModal: boolean;
  item?: MediaItem | null;
}) {
  return (
    !!args.enabled &&
    args.showFullscreenModal &&
    args.showFullscreenSlider &&
    !args.closingModal &&
    args.item?.kind === 'video'
  );
}

export function resolveAllowedFullscreenImageIndices(
  activeCanonicalIndex: number,
  baseVisibleIndices: Iterable<number>
) {
  return new Set<number>([activeCanonicalIndex, ...baseVisibleIndices]);
}

export function areFullscreenIndexSetsEqual(
  a: ReadonlySet<number>,
  b: ReadonlySet<number>
) {
  if (a === b) return true;
  if (a.size !== b.size) return false;

  for (const value of a) {
    if (!b.has(value)) return false;
  }

  return true;
}

export function shouldRenderFullscreenCrossfadeSlides(
  crossfade?: FullscreenCrossfadeOptions
) {
  if (!crossfade) return false;
  if (crossfade.controls) return true;
  if (crossfade.drag) return true;

  const wheel = crossfade.wheel;
  if (wheel === true) return true;
  if (wheel && typeof wheel === "object") return wheel.enabled !== false;

  return false;
}

function playPlyrApi(api: APITypes | null) {
  const player: APITypes["plyr"] | null = api?.plyr ?? null;
  if (!player || typeof player.play !== 'function') return false;

  try {
    const playResult = player.play();
    if (
      playResult &&
      typeof (playResult as Promise<void>).catch === 'function'
    ) {
      (playResult as Promise<void>).catch(() => {});
    }
    return true;
  } catch {
    return false;
  }
}

function fullscreenThumbnailSlotLayoutStyle(
  style: React.CSSProperties | undefined
): React.CSSProperties | undefined {
  if (!style) return undefined;

  const {
    width,
    height,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    flex,
    flexBasis,
    flexGrow,
    flexShrink,
    alignSelf,
    margin,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    marginBlock,
    marginBlockStart,
    marginBlockEnd,
    marginInline,
    marginInlineStart,
    marginInlineEnd,
  } = style;

  return {
    width,
    height,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    flex,
    flexBasis,
    flexGrow,
    flexShrink,
    alignSelf,
    margin,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    marginBlock,
    marginBlockStart,
    marginBlockEnd,
    marginInline,
    marginInlineStart,
    marginInlineEnd,
  };
}

function fullscreenDialogFlexDirection(
  placement: FsCaptionPlacement | null | undefined
): React.CSSProperties['flexDirection'] {
  if (placement === 'left') return 'row-reverse';
  if (placement === 'right') return 'row';
  if (placement === 'top') return 'column-reverse';
  return 'column';
}

function isFullscreenDialogSidePlacement(
  placement: FsCaptionPlacement | null | undefined
) {
  return placement === 'left' || placement === 'right';
}

export function FullscreenRuntime(props: FullscreenRuntimeProps) {
  const {
    fsEnabled,
    fsSub,
    showFullscreenModal,
    setShowFullscreenModal,
    isClick,
    isAnimatingRef,
    overlayDivRef,
    cells,
    setShowFullscreenSlider,
    slidesForFullscreen,
    sliderForFullscreen,
    isWrappingForFullscreen,
    setClosingModal,
    closeButtonRef,
    counterRef,
    leftChevronRef,
    rightChevronRef,
    centerSliderForFullscreen,
    setSliderIndexForFullscreen,
    layout,
    expandableImageRefs,
    resolveLayoutlessTarget,
    entryMapRef,
    entryMediaLayout,
    transitionFade,
    transitionDuration,
    transitionEasing,
    fullscreenSliderApi,
    slideIndex,
    isZoomClick,
    isZoomed,
    windowSize,
    imageRefs,
    wrappedItems,
    setWrappedItems,
    scale,
    showFullscreenSlider,
    isZooming,
    singleModePlyrRefs,
    wrappedModePlyrRefs,
    closingModal,
    duplicateImgRef,
    direction,
    sliderGap,
    sliderDuration,
    sliderFriction,
    sliderSkipSnaps,
    sliderStrictSnaps,
    suppressLoopRef,
    fsFadeOpening,
    normalizedItems,
    fsThumbContainerRef,
    fullscreenThumbnailSlot,
    setFullscreenThumbnailMountEl,
    showFsEntryOverlayMount,
    fsIntroReq,
    clearFsIntroReq,
    styles,
    fs,
    overlayCaptionRef,
    overlayCaptionRootRef,
    setFsFadeOpening,
    addShield,
    resolveFsCaptionPlacement,
    requestFsCloseRef,
    cancelFsCloseRef,
    suppressNextClickRef,
    currentImage,
    scaleRef,
    pointerDownRef,
    interactionModeRef,
    boundsX,
    boundsY,
    bodyX,
    bodyY,
    locX,
    locY,
    prevX,
    prevY,
    offX,
    offY,
    tgtX,
    tgtY,
    axisRef,
    animRef,
    setScale,
    previousZoom,
    panRef,
    changingSlides,
    fsIndexRef,
    entriesObject,
    syncFullscreenSourceFromIndex,
    setFullscreenOpen,
    runtimePlugins = EMPTY_RUNTIME_PLUGINS,
  } = props;

  const runtimeFeatures = React.useMemo(
    () => mergeRuntimeFeatures(runtimePlugins),
    [runtimePlugins]
  );
  const renderSlides =
    runtimeFeatures.renderSlides ?? renderFullscreenBaseSlides;
  const renderCrossfadeSlides =
    runtimeFeatures.renderCrossfadeSlides ?? renderFullscreenBaseCrossfadeSlides;
  const useFullscreenPlyrProps =
    runtimeFeatures.usePlyrProps ?? useEmptyPlyrProps;
  const useFullscreenZoomPanRuntime =
    runtimeFeatures.useZoomPanRuntime ?? useNoopZoomPanRuntime;
  const fullscreenDefaultPlayerStyle =
    runtimeFeatures.defaultPlayerStyle ?? EMPTY_PLAYER_STYLE;
  const hasVideoRuntime = !!runtimeFeatures.usePlyrProps;

  const fsLazyImagesEnabled = !!fs.lazyLoad?.images?.enabled;
  const fsLazyVideosEnabled = hasVideoRuntime && !!fs.lazyLoad?.videos?.enabled;
  const fsAllowedImagesRef = React.useRef<Set<number>>(new Set());
  const fsAllowedVideosRef = React.useRef<Set<number>>(new Set());
  const fsLazyImageListenersRef = React.useRef(new Set<() => void>());
  const fsLazyVideoListenersRef = React.useRef(new Set<() => void>());
  const fsBaseVisibleImagesRef = React.useRef<Set<number>>(new Set());
  const fsActiveIndexRef = React.useRef<number>(0);
  const fsLastNotifiedVisibleIndexRef = React.useRef<number | null>(null);
  const fsDecodedImagesRef = React.useRef(new Set<string>());
  const fsCustomDecodedImagesRef = React.useRef(new Set<string>());
  const fsCustomResolvedSrcByKeyRef = React.useRef(new Map<string, string>());
  const fsPreparedVideosRef = React.useRef(new Set<string>());
  const fsPreloadedVideosRef = React.useRef(new Set<string>());
  const [fsActiveRenderIndex, setFsActiveRenderIndex] = React.useState(0);
  const [latchedIntroMethod, setLatchedIntroMethod] =
    React.useState<FullscreenOpenMethod | null>(null);
  const [latchedIntroIndex, setLatchedIntroIndex] =
    React.useState<number>(0);
  const canonicalLen = normalizedItems.length || 0;
  const entryPrimeSeqRef = React.useRef(0);
  const mediaSignature = React.useMemo(
    () => fullscreenMediaSignature(normalizedItems),
    [normalizedItems]
  );
  const fullscreenVideoSnapshotStoreRef = React.useRef<unknown | null>(null);
  if (
    !fullscreenVideoSnapshotStoreRef.current &&
    runtimeFeatures.createVideoSnapshotStore
  ) {
    fullscreenVideoSnapshotStoreRef.current =
      runtimeFeatures.createVideoSnapshotStore();
  }
  const fullscreenVideoSnapshotStore = fullscreenVideoSnapshotStoreRef.current;

  function notifyFsLazyImages() {
    fsLazyImageListenersRef.current.forEach((fn) => fn());
  }

  function notifyFsLazyVideos() {
    fsLazyVideoListenersRef.current.forEach((fn) => fn());
  }

  function updateFullscreenIndexSet(
    ref: React.RefObject<Set<number>>,
    next: Set<number>,
    notify: () => void
  ) {
    if (areFullscreenIndexSetsEqual(ref.current, next)) return false;

    ref.current = next;
    notify();
    return true;
  }

  const core = useOptionalGalleryCore();

  const recomputeAllowedAndNotify = React.useCallback(
    (active: number) => {
      if (!canonicalLen) return;

      const c = canonicalIndexOf(active, canonicalLen);

      if (fsLazyVideosEnabled) {
        updateFullscreenIndexSet(
          fsAllowedVideosRef,
          new Set<number>([c]),
          notifyFsLazyVideos
        );
      }

      if (fsLazyImagesEnabled) {
        updateFullscreenIndexSet(
          fsAllowedImagesRef,
          resolveAllowedFullscreenImageIndices(c, fsBaseVisibleImagesRef.current),
          notifyFsLazyImages
        );
      }
    },
    [canonicalLen, fsLazyImagesEnabled, fsLazyVideosEnabled]
  );

  const resetFsSessionState = React.useCallback(() => {
    fsAllowedVideosRef.current = new Set<number>();
    fsAllowedImagesRef.current = new Set<number>(fsBaseVisibleImagesRef.current);
  }, []);

  const syncFsVisibleIndex = React.useCallback(
    (active: number) => {
      if (!core || !showFullscreenModal || !canonicalLen) return;

      const c = canonicalIndexOf(active, canonicalLen);
      if (fsLastNotifiedVisibleIndexRef.current === c) return;

      fsLastNotifiedVisibleIndexRef.current = c;
      core.notifyFsVisibleIndex(c);
    },
    [canonicalLen, core, showFullscreenModal]
  );

  const handleFsActiveIndex = React.useCallback(
    (value: number) => {
      if (typeof value !== 'number' || !Number.isFinite(value)) return;

      fsActiveIndexRef.current = value;
      setFsActiveRenderIndex((current) => (current === value ? current : value));
      recomputeAllowedAndNotify(value);
      syncFsVisibleIndex(value);
    },
    [recomputeAllowedAndNotify, syncFsVisibleIndex]
  );

  const syncFsSessionToCurrentIndex = React.useCallback(() => {
    const current = fsSub.get?.();
    const active =
      typeof current === 'number' && Number.isFinite(current)
        ? current
        : fsActiveIndexRef.current;

    handleFsActiveIndex(active);
  }, [fsSub, handleFsActiveIndex]);

  React.useEffect(() => {
    if (!showFullscreenModal) {
      fsLastNotifiedVisibleIndexRef.current = null;
    }
  }, [showFullscreenModal]);

  React.useEffect(() => {
    if (!fsSub) return;

    if (showFullscreenModal) {
      const cur = fsSub.get?.();
      if (typeof cur === 'number') handleFsActiveIndex(cur);
    }

    if (typeof fsSub.subscribe === 'function') {
      const off = fsSub.subscribe((v: number) => handleFsActiveIndex(v));
      return () => off?.();
    }

    if (typeof fsSub.onEvent === 'function') {
      const off = fsSub.onEvent((evt: any) => {
        if (typeof evt === 'number') handleFsActiveIndex(evt);
        else if (typeof evt?.index === 'number') handleFsActiveIndex(evt.index);
        else {
          const cur = fsSub.get?.();
          if (typeof cur === 'number') handleFsActiveIndex(cur);
        }
      });
      return () => off?.();
    }
  }, [fsSub, handleFsActiveIndex, showFullscreenModal]);

  function nextZ() {
    const w = window as any;
    if (!w.__rmgZ) w.__rmgZ = 9999;
    w.__rmgZ += 1;
    return w.__rmgZ;
  }

  const fsZRef = React.useRef<number>(9999);
  const fullscreenRootRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (showFullscreenModal) {
      fsZRef.current = nextZ();
    }
  }, [showFullscreenModal]);

  const wasFullscreenOpenRef = React.useRef(showFullscreenModal);
  React.useEffect(() => {
    const wasOpen = wasFullscreenOpenRef.current;
    wasFullscreenOpenRef.current = showFullscreenModal;

    if (!showFullscreenModal || wasOpen) return;

    resetFsSessionState();
    syncFsSessionToCurrentIndex();
  }, [showFullscreenModal, resetFsSessionState, syncFsSessionToCurrentIndex]);

  const prevMediaSignatureRef = React.useRef(mediaSignature);
  React.useEffect(() => {
    if (prevMediaSignatureRef.current === mediaSignature) return;

    prevMediaSignatureRef.current = mediaSignature;
    fsBaseVisibleImagesRef.current.clear();
    fsPreparedVideosRef.current.clear();
    fsPreloadedVideosRef.current.clear();
    resetFsSessionState();
    (fullscreenVideoSnapshotStore as any)?.reset?.();

    if (showFullscreenModal) {
      syncFsSessionToCurrentIndex();
    }
  }, [
    mediaSignature,
    resetFsSessionState,
    showFullscreenModal,
    syncFsSessionToCurrentIndex,
    fullscreenVideoSnapshotStore,
  ]);

  const fullscreenDialog = fs.dialog;
  const fullscreenDialogEnabled =
    !!fullscreenDialog && fullscreenDialog.enabled !== false;
  const [fullscreenDialogVisible, setFullscreenDialogVisible] =
    React.useState(false);
  const fullscreenDialogIntroPathRef =
    React.useRef<FullscreenIntroPath>('transform');
  const activeDialogIntroItem =
    normalizedItems[fsIntroReq?.index ?? latchedIntroIndex];
  const activeDialogIntroItemKind = activeDialogIntroItem
    ? ((activeDialogIntroItem as any).kind ??
        (activeDialogIntroItem as any).type ??
        null)
    : null;
  const requestedDialogIntroMethod = fsIntroReq?.method ?? latchedIntroMethod;
  const resolvedFullscreenDialogIntroPath: FullscreenIntroPath =
    fs.effects?.transitionFade ||
    fsIntroReq?.originalImage === null ||
    requestedDialogIntroMethod === 'fade' ||
    activeDialogIntroItemKind === 'video'
      ? 'fade'
      : 'transform';

  if (showFullscreenModal && fsIntroReq) {
    fullscreenDialogIntroPathRef.current = resolvedFullscreenDialogIntroPath;
  } else if (!showFullscreenModal) {
    fullscreenDialogIntroPathRef.current = 'transform';
  }

  const fullscreenDialogIntroPath = fsIntroReq
    ? resolvedFullscreenDialogIntroPath
    : fullscreenDialogIntroPathRef.current;
  const fullscreenDialogOpenDurationMs = resolveFullscreenIntroDurationMs(
    transitionDuration,
    fullscreenDialogIntroPath
  );
  const fullscreenDialogOpenEasing = resolveFullscreenIntroEasing(
    transitionEasing,
    fullscreenDialogIntroPath
  );
  const fullscreenDialogCloseDurationMs = resolveFullscreenIntroDurationMs(
    transitionDuration,
    'fade'
  );
  const fullscreenDialogCloseEasing = resolveFullscreenIntroEasing(
    transitionEasing,
    'fade'
  );
  const fullscreenDialogTransitionDurationMs = closingModal
    ? fullscreenDialogCloseDurationMs
    : fullscreenDialogOpenDurationMs;
  const fullscreenDialogTransitionEasing = closingModal
    ? fullscreenDialogCloseEasing
    : fullscreenDialogOpenEasing;
  const fullscreenDialogOpacityDurationMs =
    typeof fullscreenDialog?.opacityDuration === 'number' &&
    Number.isFinite(fullscreenDialog.opacityDuration)
      ? Math.max(0, fullscreenDialog.opacityDuration)
      : fullscreenDialogTransitionDurationMs;
  const fullscreenDialogOpacityEasing =
    typeof fullscreenDialog?.opacityEasing === 'string' &&
    fullscreenDialog.opacityEasing.trim()
      ? fullscreenDialog.opacityEasing
      : fullscreenDialogTransitionEasing;
  const fullscreenDialogScaleMotion =
    fullscreenDialogIntroPath === 'fade' && !closingModal;
  const fullscreenDialogUserTransform =
    typeof fullscreenDialog?.style?.transform === 'string'
      ? fullscreenDialog.style.transform.trim()
      : '';
  const fullscreenDialogVisibleTransform =
    fullscreenDialogUserTransform || 'scale(1)';
  const fullscreenDialogHiddenTransform = fullscreenDialogUserTransform
    ? `${fullscreenDialogUserTransform} scale(0.985)`
    : 'scale(0.985)';
  const fullscreenDialogMotionStyle: React.CSSProperties | undefined =
    fullscreenDialogEnabled
      ? {
          opacity: fullscreenDialogVisible && !closingModal ? 1 : 0,
          ...(fullscreenDialogScaleMotion
            ? {
                transform:
                  fullscreenDialogVisible
                    ? fullscreenDialogVisibleTransform
                    : fullscreenDialogHiddenTransform,
                transformOrigin:
                  fullscreenDialog?.style?.transformOrigin ?? 'center',
                transition: `opacity ${fullscreenDialogOpacityDurationMs}ms ${fullscreenDialogOpacityEasing}, transform ${fullscreenDialogTransitionDurationMs}ms ${fullscreenDialogTransitionEasing}`,
                willChange: 'opacity, transform',
              }
            : {
                transition: `opacity ${fullscreenDialogOpacityDurationMs}ms ${fullscreenDialogOpacityEasing}`,
                willChange: 'opacity',
              }),
          contain: fullscreenDialog?.style?.contain ?? 'layout paint style',
          isolation: fullscreenDialog?.style?.isolation ?? 'isolate',
        }
      : undefined;
  const hasEntriesOverlay =
    layout === 'entries' &&
    typeof entriesObject.render?.overlay === 'function';
  const hasEntriesViewportOverlay =
    hasEntriesOverlay && !fullscreenDialogEnabled;

  React.useEffect(() => {
    if (!showFullscreenModal || !fullscreenDialogEnabled || closingModal) {
      setFullscreenDialogVisible(false);
      return;
    }

    setFullscreenDialogVisible(false);

    if (typeof window === 'undefined' || !window.requestAnimationFrame) {
      setFullscreenDialogVisible(true);
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setFullscreenDialogVisible(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [showFullscreenModal, fullscreenDialogEnabled, closingModal]);

  React.useEffect(() => {
    if (!fsIntroReq) return;

    const { originalImage, index, closestSelector, method } = fsIntroReq;

    setLatchedIntroMethod(method ?? null);
    setLatchedIntroIndex(index);

    const fullscreenThumbnailPosition = fullscreenThumbnailSlot?.position ?? null;

    runFullscreenIntro({
      originalImage,
      method,
      index,
      normalizedItems,
      styles,
      fs,
      overlayDivRef,
      duplicateImgRef,
      overlayCaptionRef,
      overlayCaptionRootRef,
      fsThumbContainerRef,
      fullscreenThumbnailPosition,
      setShowFullscreenSlider,
      setFsFadeOpening,
      addShield,
      resolveFsCaptionPlacement,
      viewportOverlay: hasEntriesViewportOverlay
        ? {
            placement: entriesObject.overlay?.placement,
            width: entriesObject.overlay?.width,
            height: entriesObject.overlay?.height,
            breakpoint: entriesObject.overlay?.breakpoint,
          }
        : undefined,
      closestSelector,
      baseZ: fsZRef.current,
      fullscreenRootRef,
    });

    clearFsIntroReq();
  }, [entriesObject.overlay, fsIntroReq, fullscreenThumbnailSlot, hasEntriesViewportOverlay]);

  useWrappedItemsAndRefs({
    normalizedItems,
    wrappedItems,
    setWrappedItems,
    imageRefs,
  });

  React.useEffect(() => {
    cells.current = [];
  }, [cells, mediaSignature, wrappedItems.length]);

  const zoomRuntime = useFullscreenZoomPanRuntime({
    fs,
    entriesObject,
    hasEntriesViewportOverlay,
    layout,
    resolveFsCaptionPlacement,
    windowSize,
    currentImage,
    scaleRef,
    setScale,
    previousZoom,
    suppressLoopRef,
    locX,
    prevX,
    offX,
    tgtX,
    locY,
    prevY,
    offY,
    tgtY,
    bodyX,
    bodyY,
    boundsX,
    boundsY,
    animRef,
    panRef,
    imageRefs,
    changingSlides,
    fullscreenSliderApi,
    isZoomed,
    pointerDownRef,
    interactionModeRef,
    axisRef,
    suppressNextClickRef,
    closingModal,
  });

  React.useEffect(() => {
    if (!showFullscreenModal) return;
    const start = fsSub.get();
    fsIndexRef.current = start;
    syncFullscreenSourceFromIndex(start);
  }, [showFullscreenModal, fsSub]);

  React.useEffect(() => {
    if (!showFullscreenModal) return;
    if (layout !== 'entries') return;
    if (closingModal) return;
    if (!fsSub) return;
    if (!canonicalLen) return;
    if (!entryMapRef.current?.length) return;

    let cancelled = false;

    const primeEntryOwnerForFsIndex = async (value: number) => {
      if (typeof value !== 'number') return;

      const canonicalIndex = canonicalIndexOf(value, canonicalLen);
      const link = entryMapRef.current?.[canonicalIndex];
      if (!link) return;

      const seq = ++entryPrimeSeqRef.current;

      if (!isEntryOwnerReady(link.entryIndex)) {
        await scrollEntrySectionIntoView(link.entryIndex);
      }
      await waitForEntryOwnerReady(link.entryIndex);

      if (cancelled) return;
      if (seq !== entryPrimeSeqRef.current) return;

      syncFullscreenSourceFromIndex(canonicalIndex);
    };

    const cur = fsSub.get?.();
    if (typeof cur === 'number') {
      void primeEntryOwnerForFsIndex(cur);
    }

    return () => {
      cancelled = true;
      entryPrimeSeqRef.current += 1;
    };
  }, [
    showFullscreenModal,
    layout,
    closingModal,
    fsSub,
    canonicalLen,
    entryMapRef,
    syncFullscreenSourceFromIndex,
  ]);

  const showFsCaptionOverlayMount =
    !!showFullscreenModal &&
    fs.caption?.layout === 'overlay' &&
    typeof fs.caption?.render === 'function';

  const fullscreenSliderGap = normalizedItems.length > 1 ? sliderGap ?? 0 : 0;

  const singlePlyrProps = useFullscreenPlyrProps({
    items: normalizedItems,
    source: fs.video?.source,
    options: fs.video?.options,
  });
  const wrappedPlyrProps = useFullscreenPlyrProps({
    items: wrappedItems,
    source: fs.video?.source,
    options: fs.video?.options,
  });

  const singleTransform = React.useMemo(() => createSingleTransform(), []);
  const wrappedTransformSign = direction === 'rtl' ? -1 : 1;
  const wrappedTransform = React.useMemo(
    () =>
      createWrappedTransform({
        length: wrappedItems.length,
        sign: wrappedTransformSign,
        gap: fullscreenSliderGap,
      }),
    [fullscreenSliderGap, wrappedItems.length, wrappedTransformSign]
  );
  const crossfadeImageRefs = React.useMemo(
    () =>
      normalizedItems.map(
        () => React.createRef<HTMLDivElement | null>()
      ),
    [mediaSignature]
  );
  const crossfadePlayerRefs = React.useRef<(APITypes | null)[]>([]);
  const crossfadeCellsRef = React.useRef<
    { element: HTMLElement; index: number }[]
  >([]);
  const handlePanPointerStart = zoomRuntime.handlePanPointerStart;
  const handleZoomToggle = zoomRuntime.handleZoomToggle;
  const resetZoomForSlideNavigation = zoomRuntime.resetForSlideNavigation;
  const resetZoomForSlideChange = zoomRuntime.resetAllZoomDom;
  const onForceResetZoom = zoomRuntime.forceResetZoom ?? zoomRuntime.resetAllZoomDom;
  const handleHoverPointerEnter = zoomRuntime.handleHoverPointerEnter ?? (() => {});
  const handleHoverPointerMove = zoomRuntime.handleHoverPointerMove ?? (() => {});
  const handleHoverPointerLeave = zoomRuntime.handleHoverPointerLeave ?? (() => {});
  const isPinching = zoomRuntime.isPinching;
  const isTouchPinching = zoomRuntime.isTouchPinching;
  const captionZoomMotion = zoomRuntime.captionZoomMotion as any;
  const entryOverlayZoomMotion = zoomRuntime.entryOverlayZoomMotion as any;

  function mediaKey(item: MediaItem) {
    const any = item as any;
    return `${item.kind}|${any.src ?? ''}|${any.srcSet ?? ''}|${any.sizes ?? ''}|${any.poster ?? ''}`;
  }

  React.useEffect(() => {
    return () => {
      (fullscreenVideoSnapshotStore as any)?.destroy?.();
    };
  }, [fullscreenVideoSnapshotStore]);

  const openingInProgress = showFullscreenModal && !showFullscreenSlider;
  const openingCanonicalIndex = canonicalLen
    ? canonicalIndexOf(latchedIntroIndex, canonicalLen)
    : null;
  const currentFsRenderIndex = (() => {
    const current = fsSub.get?.();
    return typeof current === "number" && Number.isFinite(current)
      ? current
      : fsActiveRenderIndex;
  })();
  const activeCanonicalIndex = canonicalLen
    ? canonicalIndexOf(currentFsRenderIndex, canonicalLen)
    : null;
  const openingTargetKind =
    openingCanonicalIndex != null
      ? normalizedItems[openingCanonicalIndex]?.kind ?? null
      : null;
  const deferLiveVideoUntilVisible =
    fsLazyVideosEnabled && !!openingInProgress && openingTargetKind !== "video";
  const playOnOpenKeyRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (showFullscreenModal) return;
    playOnOpenKeyRef.current = null;
  }, [showFullscreenModal]);

  React.useEffect(() => {
    if (!canonicalLen) return;

    const canonicalIndex = canonicalIndexOf(latchedIntroIndex, canonicalLen);
    const item = normalizedItems[canonicalIndex] ?? null;

    if (
      !shouldPlayFullscreenVideoOnOpen({
        enabled: fs.video?.playOnOpen,
        showFullscreenModal,
        showFullscreenSlider,
        closingModal,
        item,
      })
    ) {
      return;
    }

    const refIndex = getFullscreenVideoOpenRefIndex({
      canonicalIndex,
      canonicalLength: canonicalLen,
    });
    if (refIndex == null) return;

    const playRefs =
      canonicalLen > 1 ? wrappedModePlyrRefs : singleModePlyrRefs;
    const sessionKey = `${mediaSignature}|${canonicalIndex}|${latchedIntroIndex}`;
    if (playOnOpenKeyRef.current === sessionKey) return;
    playOnOpenKeyRef.current = sessionKey;

    let cancelled = false;
    let rafId: number | null = null;
    const deadline = performance.now() + 1600;

    const attempt = () => {
      if (cancelled) return;

      const api = playRefs.current[refIndex] ?? null;

      if (playPlyrApi(api)) return;
      if (performance.now() >= deadline) return;

      rafId = window.requestAnimationFrame(attempt);
    };

    rafId = window.requestAnimationFrame(attempt);

    return () => {
      cancelled = true;
      if (rafId != null) window.cancelAnimationFrame(rafId);
    };
  }, [
    canonicalLen,
    closingModal,
    fs.video?.playOnOpen,
    latchedIntroIndex,
    mediaSignature,
    normalizedItems,
    showFullscreenModal,
    showFullscreenSlider,
    singleModePlyrRefs,
    wrappedModePlyrRefs,
  ]);

  const oneFullscreenSlide = renderSlides({
    items: normalizedItems,
    plyrList: singlePlyrProps,
    getTransform: singleTransform,
    imageRefs,
    playerRefs: singleModePlyrRefs,
    cells,
    isZoomed,
    showFullscreenSlider,
    defaultPlayerStyle: fullscreenDefaultPlayerStyle,
    fsVideoStyle: fs.video?.style,
    fsVideoClassName: fs.video?.className,
    onPanPointerDown: (
      e: React.PointerEvent<HTMLDivElement>,
      imageRef: React.RefObject<HTMLDivElement | null>
    ) => handlePanPointerStart(e, imageRef),
    onHoverPointerEnter: (
      e: React.PointerEvent<HTMLDivElement>,
      imageRef: React.RefObject<HTMLDivElement | null>
    ) => handleHoverPointerEnter(e, imageRef),
    onHoverPointerMove: (
      e: React.PointerEvent<HTMLDivElement>,
      imageRef: React.RefObject<HTMLDivElement | null>
    ) => handleHoverPointerMove(e, imageRef),
    onHoverPointerLeave: (
      e: React.PointerEvent<HTMLDivElement>,
      imageRef: React.RefObject<HTMLDivElement | null>
    ) => handleHoverPointerLeave(e, imageRef),
    onSuppressNextClickCapture: (e: React.SyntheticEvent) => {
      if (suppressNextClickRef.current) {
        suppressNextClickRef.current = false;
        e.preventDefault();
        e.stopPropagation();
      }
    },
    renderCaption: fs.caption?.render,
    captionClassName: fs.caption?.className,
    captionStyle: fs.caption?.style,
    captionZoomMotion,
    fsCaptionPlacement: fs.caption?.placement,
    fsCaptionWidth: fs.caption?.width,
    fsCaptionHeight: fs.caption?.height,
    fsCaptionBreakpoint: fs.caption?.breakpoint,
    fsCaptionLayout: fs.caption?.layout,
    fsViewportOverlayPlacement: hasEntriesViewportOverlay
      ? entriesObject.overlay?.placement
      : undefined,
    fsViewportOverlayWidth: hasEntriesViewportOverlay
      ? entriesObject.overlay?.width
      : undefined,
    fsViewportOverlayHeight: hasEntriesViewportOverlay
      ? entriesObject.overlay?.height
      : undefined,
    fsViewportOverlayBreakpoint: hasEntriesViewportOverlay
      ? entriesObject.overlay?.breakpoint
      : undefined,
    viewportWidth: windowSize.width,
    viewportHeight: windowSize.height,
    resolveFsCaptionPlacement,
    styles: {
      imgMargin: styles.imgMargin,
      fullscreenImages: styles.fullscreenImages,
    },
    renderImage: fs.renderImage as any,
    fsLazy: fs.lazyLoad,
    fsLazyAllowedImagesRef: fsAllowedImagesRef,
    fsLazyListenersImagesRef: fsLazyImageListenersRef,
    fsLazyAllowedVideosRef: fsAllowedVideosRef,
    fsLazyListenersVideosRef: fsLazyVideoListenersRef,
    fsDecodedImagesRef: fsDecodedImagesRef,
    fsCustomDecodedImagesRef: fsCustomDecodedImagesRef,
    fsCustomResolvedSrcByKeyRef: fsCustomResolvedSrcByKeyRef,
    fsPreparedVideosRef: fsPreparedVideosRef,
    videoSnapshotStore: fullscreenVideoSnapshotStore,
    canonicalLength: canonicalLen,
    activeCanonicalIndex,
    openingCanonicalIndex,
    openingInProgress,
    deferLiveVideoUntilVisible,
    getMediaKey: mediaKey,
  });

  const wrappedFullscreenSlides = renderSlides({
    items: wrappedItems,
    plyrList: wrappedPlyrProps,
    getTransform: wrappedTransform,
    imageRefs,
    playerRefs: wrappedModePlyrRefs,
    cells,
    isZoomed,
    showFullscreenSlider,
    defaultPlayerStyle: fullscreenDefaultPlayerStyle,
    fsVideoStyle: fs.video?.style,
    fsVideoClassName: fs.video?.className,
    onPanPointerDown: (
      e: React.PointerEvent<HTMLDivElement>,
      imageRef: React.RefObject<HTMLDivElement | null>
    ) => handlePanPointerStart(e, imageRef),
    onHoverPointerEnter: (
      e: React.PointerEvent<HTMLDivElement>,
      imageRef: React.RefObject<HTMLDivElement | null>
    ) => handleHoverPointerEnter(e, imageRef),
    onHoverPointerMove: (
      e: React.PointerEvent<HTMLDivElement>,
      imageRef: React.RefObject<HTMLDivElement | null>
    ) => handleHoverPointerMove(e, imageRef),
    onHoverPointerLeave: (
      e: React.PointerEvent<HTMLDivElement>,
      imageRef: React.RefObject<HTMLDivElement | null>
    ) => handleHoverPointerLeave(e, imageRef),
    onSuppressNextClickCapture: (e: React.SyntheticEvent) => {
      if (suppressNextClickRef.current) {
        suppressNextClickRef.current = false;
        e.preventDefault();
        e.stopPropagation();
      }
    },
    renderCaption: fs.caption?.render,
    captionClassName: fs.caption?.className,
    captionStyle: fs.caption?.style,
    captionZoomMotion,
    fsCaptionPlacement: fs.caption?.placement,
    fsCaptionWidth: fs.caption?.width,
    fsCaptionHeight: fs.caption?.height,
    fsCaptionBreakpoint: fs.caption?.breakpoint,
    fsCaptionLayout: fs.caption?.layout,
    fsViewportOverlayPlacement: hasEntriesViewportOverlay
      ? entriesObject.overlay?.placement
      : undefined,
    fsViewportOverlayWidth: hasEntriesViewportOverlay
      ? entriesObject.overlay?.width
      : undefined,
    fsViewportOverlayHeight: hasEntriesViewportOverlay
      ? entriesObject.overlay?.height
      : undefined,
    fsViewportOverlayBreakpoint: hasEntriesViewportOverlay
      ? entriesObject.overlay?.breakpoint
      : undefined,
    viewportWidth: windowSize.width,
    viewportHeight: windowSize.height,
    resolveFsCaptionPlacement,
    styles: {
      imgMargin: styles.imgMargin,
      fullscreenImages: styles.fullscreenImages,
    },
    renderImage: fs.renderImage as any,
    fsLazy: fs.lazyLoad,
    fsLazyAllowedImagesRef: fsAllowedImagesRef,
    fsLazyListenersImagesRef: fsLazyImageListenersRef,
    fsLazyAllowedVideosRef: fsAllowedVideosRef,
    fsLazyListenersVideosRef: fsLazyVideoListenersRef,
    fsDecodedImagesRef: fsDecodedImagesRef,
    fsCustomDecodedImagesRef: fsCustomDecodedImagesRef,
    fsCustomResolvedSrcByKeyRef: fsCustomResolvedSrcByKeyRef,
    fsPreparedVideosRef: fsPreparedVideosRef,
    videoSnapshotStore: fullscreenVideoSnapshotStore,
    canonicalLength: canonicalLen,
    activeCanonicalIndex,
    openingCanonicalIndex,
    openingInProgress,
    deferLiveVideoUntilVisible,
    getMediaKey: mediaKey,
  });

  const fullscreenCrossfadeSlides = shouldRenderFullscreenCrossfadeSlides(
    fs.effects?.crossfade
  )
    ? renderCrossfadeSlides({
        items: normalizedItems,
        plyrList: singlePlyrProps,
        getTransform: singleTransform,
        imageRefs: { current: crossfadeImageRefs },
        playerRefs: crossfadePlayerRefs,
        cells: crossfadeCellsRef,
        isZoomed,
        showFullscreenSlider: true,
        defaultPlayerStyle: fullscreenDefaultPlayerStyle,
        fsVideoStyle: fs.video?.style,
        fsVideoClassName: fs.video?.className,
        onPanPointerDown: (
          e: React.PointerEvent<HTMLDivElement>,
          imageRef: React.RefObject<HTMLDivElement | null>
        ) => handlePanPointerStart(e, imageRef),
        onHoverPointerEnter: (
          e: React.PointerEvent<HTMLDivElement>,
          imageRef: React.RefObject<HTMLDivElement | null>
        ) => handleHoverPointerEnter(e, imageRef),
        onHoverPointerMove: (
          e: React.PointerEvent<HTMLDivElement>,
          imageRef: React.RefObject<HTMLDivElement | null>
        ) => handleHoverPointerMove(e, imageRef),
        onHoverPointerLeave: (
          e: React.PointerEvent<HTMLDivElement>,
          imageRef: React.RefObject<HTMLDivElement | null>
        ) => handleHoverPointerLeave(e, imageRef),
        onSuppressNextClickCapture: (e: React.SyntheticEvent) => {
          if (suppressNextClickRef.current) {
            suppressNextClickRef.current = false;
            e.preventDefault();
            e.stopPropagation();
          }
        },
        renderCaption: fs.caption?.render,
        captionClassName: fs.caption?.className,
        captionStyle: fs.caption?.style,
        captionZoomMotion,
        fsCaptionPlacement: fs.caption?.placement,
        fsCaptionWidth: fs.caption?.width,
        fsCaptionHeight: fs.caption?.height,
        fsCaptionBreakpoint: fs.caption?.breakpoint,
        fsCaptionLayout: fs.caption?.layout,
        fsViewportOverlayPlacement: hasEntriesViewportOverlay
          ? entriesObject.overlay?.placement
          : undefined,
        fsViewportOverlayWidth: hasEntriesViewportOverlay
          ? entriesObject.overlay?.width
          : undefined,
        fsViewportOverlayHeight: hasEntriesViewportOverlay
          ? entriesObject.overlay?.height
          : undefined,
        fsViewportOverlayBreakpoint: hasEntriesViewportOverlay
          ? entriesObject.overlay?.breakpoint
          : undefined,
        viewportWidth: windowSize.width,
        viewportHeight: windowSize.height,
        resolveFsCaptionPlacement,
        styles: {
          imgMargin: styles.imgMargin,
          fullscreenImages: styles.fullscreenImages,
        },
        renderImage: fs.renderImage as any,
        fsLazy: fs.lazyLoad,
        fsLazyAllowedImagesRef: fsAllowedImagesRef,
        fsLazyListenersImagesRef: fsLazyImageListenersRef,
        fsLazyAllowedVideosRef: fsAllowedVideosRef,
        fsLazyListenersVideosRef: fsLazyVideoListenersRef,
        fsDecodedImagesRef: fsDecodedImagesRef,
        fsCustomDecodedImagesRef: fsCustomDecodedImagesRef,
        fsCustomResolvedSrcByKeyRef: fsCustomResolvedSrcByKeyRef,
        fsPreparedVideosRef: fsPreparedVideosRef,
        videoSnapshotStore: fullscreenVideoSnapshotStore,
        canonicalLength: normalizedItems.length,
        openingCanonicalIndex: null,
        openingInProgress: false,
        deferLiveVideoUntilVisible: false,
        getMediaKey: mediaKey,
      })
    : undefined;

  const pauseAllFullscreenPlayers = React.useCallback(() => {
    const seenApis = new Set<APITypes>();

    for (const api of singleModePlyrRefs.current) {
      if (!api || seenApis.has(api)) continue;
      seenApis.add(api);
      pausePlyrApi(api);
    }

    for (const api of wrappedModePlyrRefs.current) {
      if (!api || seenApis.has(api)) continue;
      seenApis.add(api);
      pausePlyrApi(api);
    }

    if (typeof document === 'undefined') return;

    const medias = document.querySelectorAll<HTMLMediaElement>(
      '[data-rmg-fs-slide="true"] video, [data-rmg-fs-slide="true"] audio'
    );

    medias.forEach((media) => {
      try {
        media.pause();
      } catch {}
    });
  }, [singleModePlyrRefs, wrappedModePlyrRefs]);

  React.useEffect(() => {
    if (!closingModal) return;
    pauseAllFullscreenPlayers();
  }, [closingModal, pauseAllFullscreenPlayers]);

  React.useEffect(() => {
    if (showFullscreenModal) return;
    pauseAllFullscreenPlayers();
  }, [showFullscreenModal, pauseAllFullscreenPlayers]);

  const idlePreloadedImagesRef = React.useRef(new Set<string>());

  function preloadFsImagesIdle(items: MediaItem[], concurrency = 3) {
    const imgs = items.filter((i) => i.kind === 'image');
    let idx = 0;

    const runWorker = async () => {
      while (idx < imgs.length) {
        const item = imgs[idx++];

        const key = `${(item as any).src ?? ''}|${(item as any).srcSet ?? ''}|${(item as any).sizes ?? ''}`;
        if (idlePreloadedImagesRef.current.has(key)) continue;
        idlePreloadedImagesRef.current.add(key);

        const img = new Image();
        img.decoding = 'async';
        (img as any).fetchPriority = 'low';
        img.src = (item as any).src;
        img.srcset = (item as any).srcSet ?? '';
        img.sizes = (item as any).sizes ?? '';

        try {
          await img.decode();
        } catch {}
      }
    };

    return Promise.all(Array.from({ length: concurrency }, () => runWorker()));
  }

  const preloadKey = React.useMemo(
    () => normalizedItems.map((i) => (i.kind === 'image' ? (i as any).src ?? '' : '')).join('|'),
    [normalizedItems]
  );

  const didPreloadKeyRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (fsLazyImagesEnabled) return;
    if (showFullscreenModal) return;

    if (didPreloadKeyRef.current === preloadKey) return;
    didPreloadKeyRef.current = preloadKey;

    const run = () => {
      void preloadFsImagesIdle(normalizedItems, 3);
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(run, { timeout: 2000 });
    } else {
      setTimeout(run, 250);
    }
  }, [fsLazyImagesEnabled, showFullscreenModal, preloadKey, normalizedItems]);

  const preloadFsImageAtIndex = React.useCallback(
    async (canonicalIndex: number) => {
      const item = normalizedItems[canonicalIndex];
      if (!item || item.kind !== 'image') return;

      const nextBaseVisibleImages = new Set(fsBaseVisibleImagesRef.current);
      nextBaseVisibleImages.add(canonicalIndex);
      fsBaseVisibleImagesRef.current = nextBaseVisibleImages;

      if (fsLazyImagesEnabled) {
        const active = fsActiveIndexRef.current;
        const activeCanonical = canonicalLen
          ? canonicalIndexOf(active, canonicalLen)
          : canonicalIndex;

        updateFullscreenIndexSet(
          fsAllowedImagesRef,
          resolveAllowedFullscreenImageIndices(
            activeCanonical,
            nextBaseVisibleImages
          ),
          notifyFsLazyImages
        );
      }

      const key = mediaKey(item);
      if (fsDecodedImagesRef.current.has(key)) return;

      const img = new Image();
      img.decoding = 'async';
      (img as any).fetchPriority = 'high';
      img.src = (item as any).src;
      img.srcset = (item as any).srcSet ?? '';
      img.sizes = (item as any).sizes ?? '';

      try {
        await img.decode();
        fsDecodedImagesRef.current.add(key);
      } catch {}
    },
    [canonicalLen, fsLazyImagesEnabled, normalizedItems]
  );

  const preloadFsVideoAtIndex = React.useCallback(
    async (canonicalIndex: number) => {
      const item = normalizedItems[canonicalIndex];
      if (!item || item.kind !== 'video') return;

      const key = mediaKey(item);
      if (fsPreloadedVideosRef.current.has(key)) return;
      fsPreloadedVideosRef.current.add(key);

      const poster = (item as any).poster ?? (item as any).thumbSrc ?? null;

      if (poster) {
        try {
          const img = new Image();
          img.decoding = 'async';
          (img as any).fetchPriority = 'high';
          img.src = poster;
          await img.decode().catch(() => {});
        } catch {}
      }

      const mp4 =
        (item as any).src ||
        (item as any).videoSrc ||
        (item as any).sources?.[0]?.src ||
        null;

      if (typeof mp4 === 'string' && mp4) {
        try {
          const v = document.createElement('video');
          if (shouldUseAnonymousCrossOrigin(mp4)) {
            v.crossOrigin = 'anonymous';
          }
          v.preload = 'metadata';
          v.muted = true;
          v.playsInline = true;
          if (poster) v.poster = poster;
          v.src = mp4;

          v.load();

          setTimeout(() => {
            try {
              v.removeAttribute('src');
              v.load();
            } catch {}
          }, 1500);
        } catch {}
      }
    },
    [normalizedItems]
  );

  React.useEffect(() => {
    if (!core) return;

    const shouldListen = fsLazyImagesEnabled || fsLazyVideosEnabled;
    if (!shouldListen) return;

    const off = core.baseVisibleSub.subscribe((evt) => {
      const idx = evt?.index;
      if (typeof idx !== 'number') return;
      if (!canonicalLen) return;

      const c = canonicalIndexOf(idx, canonicalLen);

      if (fsLazyImagesEnabled) void preloadFsImageAtIndex(c);
      if (fsLazyVideosEnabled) void preloadFsVideoAtIndex(c);
    });

    return () => off?.();
  }, [
    core,
    fsLazyImagesEnabled,
    fsLazyVideosEnabled,
    preloadFsImageAtIndex,
    preloadFsVideoAtIndex,
  ]);

  const fullscreenThumbnailPosition = fullscreenThumbnailSlot?.position ?? null;
  const fullscreenLayoutDirection =
    fullscreenThumbnailPosition === 'left'
      ? 'row-reverse'
      : fullscreenThumbnailPosition === 'right'
      ? 'row'
      : fullscreenThumbnailPosition === 'top'
      ? 'column-reverse'
      : 'column';
  const fullscreenThumbnailSlotBaseStyle =
    fullscreenThumbnailSlotLayoutStyle(fullscreenThumbnailSlot?.style);
  const cellCount = normalizedItems.length;
  const dialogHasCaptionPane =
    fullscreenDialogEnabled &&
    (showFsEntryOverlayMount || showFsCaptionOverlayMount);
  const dialogCaptionPlacement = showFsEntryOverlayMount
    ? resolveFsCaptionPlacement(
        entriesObject.overlay?.placement,
        entriesObject.overlay?.breakpoint,
        windowSize.width
      )
    : showFsCaptionOverlayMount
    ? resolveFsCaptionPlacement(
        fs.caption?.placement,
        fs.caption?.breakpoint,
        windowSize.width
      )
    : null;
  const dialogCaptionIsSidePlacement =
    isFullscreenDialogSidePlacement(dialogCaptionPlacement);
  const dialogCaptionWidth = resolveLengthFromResponsive(
    showFsEntryOverlayMount ? entriesObject.overlay?.width : fs.caption?.width,
    380,
    windowSize.width,
    windowSize.width
  );
  const dialogCaptionHeight = resolveLengthFromResponsive(
    showFsEntryOverlayMount ? entriesObject.overlay?.height : fs.caption?.height,
    240,
    windowSize.width,
    windowSize.height
  );
  const dialogCaptionPaneSizeStyle: React.CSSProperties =
    dialogCaptionIsSidePlacement
      ? {
          width: dialogCaptionWidth,
          flexBasis: dialogCaptionWidth,
        }
      : {
          height: dialogCaptionHeight,
          flexBasis: dialogCaptionHeight,
        };
  const fullscreenDialogOverlayWrapperStyle:
    | React.CSSProperties
    | undefined = fullscreenDialogEnabled
    ? {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'auto',
      }
    : undefined;
  const fullscreenSliderNode = (
    <FullscreenSlider
      sub={fsSub}
      ref={fullscreenSliderApi}
      cellCount={cellCount}
      slideIndex={slideIndex}
      isClick={isZoomClick}
      isZoomed={isZoomed}
      windowSize={windowSize}
      show={showFullscreenModal}
      handleZoomToggle={handleZoomToggle}
      imageRefs={imageRefs.current}
      cells={cells}
      isPinching={isPinching}
      scale={scale}
      isTouchPinching={isTouchPinching}
      showFullscreenSlider={showFullscreenSlider}
      isZooming={isZooming}
      plyrRefs={
        normalizedItems.length > 1
          ? wrappedModePlyrRefs
          : singleModePlyrRefs
      }
      plyrRef={
        normalizedItems.length > 1
          ? wrappedModePlyrRefs
          : singleModePlyrRefs
      }
      closingModal={closingModal}
      counterRef={counterRef}
      leftChevronRef={leftChevronRef}
      rightChevronRef={rightChevronRef}
      overlayDivRef={overlayDivRef}
      direction={direction}
      isWrapping={isWrappingForFullscreen}
      sliderGap={fullscreenSliderGap}
      sliderDuration={sliderDuration}
      sliderFriction={sliderFriction}
      skipSnaps={sliderSkipSnaps}
      strictSnaps={sliderStrictSnaps}
      suppressLoopRef={suppressLoopRef}
      fadeOpening={fsFadeOpening}
      transitionFade={transitionFade}
      controlsFade={!!fs.effects?.crossfade?.controls}
      dragFade={!!fs.effects?.crossfade?.drag}
      wheelFade={fs.effects?.crossfade?.wheel}
      slideFadeDuration={fs.effects?.crossfade?.durationMs}
      slideFadeEasing={fs.effects?.crossfade?.easing}
      normalizedItems={normalizedItems}
      crossfadeSlides={fullscreenCrossfadeSlides}
      transitionDuration={transitionDuration}
      transitionEasing={transitionEasing}
      resetAllZoomDom={() => resetZoomForSlideNavigation()}
      requestFsCloseRef={requestFsCloseRef}
      introMethod={latchedIntroMethod}
      fs={fs}
      chromeStyles={styles}
    >
      {normalizedItems.length > 1
        ? wrappedFullscreenSlides
        : oneFullscreenSlide}
    </FullscreenSlider>
  );
  const fullscreenThumbnailSlotNode = fullscreenThumbnailSlot ? (
    <div
      ref={setFullscreenThumbnailMountEl}
      style={{
        flex: '0 0 auto',
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
        backgroundColor: 'transparent',
        ...(fullscreenThumbnailSlotBaseStyle || {}),
      }}
    />
  ) : null;
  const fsCaptionOverlayNode = showFsCaptionOverlayMount ? (
    <FsCaptionOverlay
      enabled={showFsCaptionOverlayMount}
      fsSub={fsSub}
      items={normalizedItems}
      caption={fs.caption}
      isZoomed={isZoomed}
      captionZoomMotion={captionZoomMotion}
      viewportWidth={windowSize.width}
      viewportHeight={windowSize.height}
      wrapperBaseStyle={fullscreenDialogOverlayWrapperStyle}
      interactive={!!showFullscreenSlider}
      closing={!!closingModal}
      resolveFsCaptionPlacement={resolveFsCaptionPlacement}
    />
  ) : null;
  const fsEntryOverlayNode = showFsEntryOverlayMount ? (
    <FsEntryOverlay
      enabled={showFsEntryOverlayMount}
      fsSub={fsSub}
      entriesObject={entriesObject}
      entryMapRef={entryMapRef}
      syncFullscreenSourceFromIndex={syncFullscreenSourceFromIndex}
      resetAllZoomDom={resetZoomForSlideChange}
      wrapperBaseStyle={fullscreenDialogOverlayWrapperStyle}
      closing={!!closingModal}
      overlayZoomMotion={entryOverlayZoomMotion}
      viewportWidth={windowSize.width}
      viewportHeight={windowSize.height}
      resolveFsCaptionPlacement={resolveFsCaptionPlacement}
    />
  ) : null;

  return (
    <>
      {fsEnabled && (
        <FullscreenModal
          fsSub={fsSub}
          open={showFullscreenModal}
          onClose={() => setShowFullscreenModal(false)}
          isClick={isClick}
          isAnimating={isAnimatingRef}
          overlayDivRef={overlayDivRef}
          cells={cells}
          setShowFullscreenSlider={setShowFullscreenSlider}
          cellCount={cellCount}
          slides={slidesForFullscreen}
          slider={sliderForFullscreen}
          wrappedItems={wrappedItems}
          setClosingModal={setClosingModal}
          closeButtonRef={closeButtonRef}
          counterRef={counterRef}
          leftChevronRef={leftChevronRef}
          rightChevronRef={rightChevronRef}
          centerSlider={centerSliderForFullscreen}
          setSliderIndex={setSliderIndexForFullscreen}
          onForceResetZoom={() => onForceResetZoom()}
          layout={layout}
          expandableImageRefs={expandableImageRefs}
          resolveLayoutlessTarget={resolveLayoutlessTarget}
          entryMapRef={entryMapRef}
          entryMediaLayout={entryMediaLayout}
          transitionFade={transitionFade}
          transitionDuration={transitionDuration}
          transitionEasing={transitionEasing}
          requestFsCloseRef={requestFsCloseRef}
          cancelFsCloseRef={cancelFsCloseRef}
          fs={fs}
          styles={styles}
          syncFullscreenSourceFromIndex={syncFullscreenSourceFromIndex}
          baseZ={fsZRef.current}
          rootRef={fullscreenRootRef}
          introMethod={latchedIntroMethod}
          setLatchedIntroMethod={setLatchedIntroMethod}
          latchedIntroIndex={latchedIntroIndex}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: fullscreenLayoutDirection,
            }}
          >
            <div
              style={{
                flex: '1 1 auto',
                position: 'relative',
                minWidth: 0,
                minHeight: 0,
                ...(fullscreenDialogEnabled
                  ? {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }
                  : null),
              }}
            >
              {fullscreenDialogEnabled ? (
                <div
                  data-rmg-fs-dialog="true"
                  data-rmg-fs-dialog-placement={dialogCaptionPlacement ?? 'bottom'}
                  className={fullscreenDialog?.className}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection:
                      fullscreenDialogFlexDirection(dialogCaptionPlacement),
                    width: '100%',
                    height: '100%',
                    minWidth: 0,
                    minHeight: 0,
                    overflow: 'hidden',
                    ...(fullscreenDialog?.style ?? {}),
                    ...(fullscreenDialogMotionStyle ?? {}),
                  }}
                >
                  <div
                    data-rmg-fs-dialog-media="true"
                    className={fullscreenDialog?.media?.className}
                    style={{
                      flex: '1 1 auto',
                      position: 'relative',
                      minWidth: 0,
                      minHeight: 0,
                      overflow: 'hidden',
                      ...(fullscreenDialog?.media?.style ?? {}),
                    }}
                  >
                    {fullscreenSliderNode}
                  </div>

                  {dialogHasCaptionPane ? (
                    <div
                      data-rmg-fs-dialog-caption="true"
                      className={fullscreenDialog?.caption?.className}
                      style={{
                        flex: '0 0 auto',
                        position: 'relative',
                        minWidth: 0,
                        minHeight: 0,
                        overflow: 'hidden',
                        ...dialogCaptionPaneSizeStyle,
                        ...(fullscreenDialog?.caption?.style ?? {}),
                      }}
                    >
                      {fsCaptionOverlayNode}
                      {fsEntryOverlayNode}
                    </div>
                  ) : null}
                </div>
              ) : (
                fullscreenSliderNode
              )}
            </div>

            {fullscreenThumbnailSlotNode}
          </div>

          {!fullscreenDialogEnabled ? fsCaptionOverlayNode : null}
          {!fullscreenDialogEnabled ? fsEntryOverlayNode : null}
        </FullscreenModal>
      )}
    </>
  );
}

export default FullscreenRuntime;
