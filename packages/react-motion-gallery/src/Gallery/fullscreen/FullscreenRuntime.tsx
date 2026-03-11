'use client';

import * as React from 'react';
import { FullscreenModal } from './FullscreenModal';
import { FullscreenSlider } from './FullscreenSlider';
import { FsEntryOverlayMount } from '../entries/overlay/FsEntryOverlayMount';
import type { FullscreenSliderHandle } from './FullscreenSlider';
import type { EntriesOptions, MediaEntryLink } from '../entries/types';
import type { APITypes } from 'plyr-react';
import type { FullscreenThumbnailSlotLayout } from '../fullscreenThumbnails/types';
import { MediaItem } from '../shared/types/media';
import { runFullscreenIntro } from './fullscreenIntro';
import { FsCaptionPlacement, FsIntroRequest, FullscreenOptions } from './types';
import { Root } from 'react-dom/client';
import { usePlyrProps } from '../video/usePlyrProps';
import { renderFullscreenSlides } from './renderFullscreenSlides';
import { createSingleTransform, createWrappedTransform } from './transforms';
import { defaultPlayerStyle } from '../video/fullscreenPlayerStyle';
import { usePanRuntime } from '../zoomPan/pan';
import { rebuildPanBodiesFn } from '../zoomPan/core/rebuildPanBodies';
import { ScrollBounds, ScrollBoundsType } from '../shared/motion/scrollBounds';
import { ScrollBody, ScrollBodyType } from '../shared/motion/scrollBody';
import { Vector1D, Vector1DType } from '../shared/motion/vector1d';
import { PanAxis as Axis, PanAxisType as AxisType } from '../shared/types/axis';
import { AnimationsType } from '../shared/motion/animations';
import { boundsForCurrent as boundsForCurrentFn } from '../zoomPan/core/boundsForCurrent';
import { useGlobalPinchZoom } from '../zoomPan/zoom/useGlobalPinchZoom';
import { useWrappedItemsAndRefs } from './hooks/useWrappedItemsAndRefs';
import { forceResetZoom as forceResetZoomFn } from '../zoomPan/zoom/forceResetZoom';
import { resetZoomForSlideChange as resetZoomForSlideChangeFn } from '../zoomPan/zoom/resetZoomForSlideChange';
import { resetPanForScale1 as resetPanForScale1Fn } from '../zoomPan/pan/resetPanForScale1';
import { useFsEntryOverlay } from '../entries/overlay/useFsEntryOverlay';
import { baseFitSize, distance, midpoint } from '../zoomPan/core/utils';
import { zoomTo } from '../zoomPan/zoom/zoomTo';
import { findImgAtPoint, getPrimaryImgEl, readDataIndex } from '../zoomPan/core/dom';
import { useOptionalGalleryCore } from '../core';
import {
  createVideoSnapshotStore,
} from '../video/videoSnapshotStore';
import { FullscreenOpenMethod } from '../api/types';
import {
  isEntryOwnerReady,
  scrollEntrySectionIntoView,
  waitForEntryOwnerReady,
} from './entryOwnerReady';

export type FullscreenRuntimeProps = {
  fsEnabled: boolean;
  fsSub: any;
  showFullscreenModal: boolean;
  setShowFullscreenModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowFullscreenSlider: React.Dispatch<React.SetStateAction<boolean>>;
  showFullscreenSlider: boolean;
  epoch: number;
  isClick: React.RefObject<boolean>;
  isAnimatingRef: React.RefObject<boolean>;
  overlayDivRef: React.RefObject<HTMLDivElement | null>;
  duplicateImgRef: React.RefObject<HTMLElement | null>;
  cells: React.RefObject<{ element: HTMLElement; index: number }[]>;
  cellsStateLength: number;
  slidesForFullscreen: React.RefObject<
    { cells: { element: HTMLElement; index: number }[]; target: number }[]
  >;
  sliderForFullscreen: React.RefObject<HTMLDivElement | null>;
  visibleImagesForFullscreen: React.RefObject<number>;
  selectedIndexForFullscreen: React.RefObject<number>;
  sliderXForFullscreen: React.RefObject<number>;
  sliderVelocityForFullscreen: React.RefObject<number>;
  isWrappingForFullscreen: React.RefObject<boolean>;
  wrappedItems: MediaItem[];
  setClosingModal: React.Dispatch<React.SetStateAction<boolean>>;
  closingModal: boolean;
  closeButtonRef: React.RefObject<HTMLElement | null>;
  counterRef: React.RefObject<HTMLElement | null>;
  leftChevronRef: React.RefObject<HTMLElement | null>;
  rightChevronRef: React.RefObject<HTMLElement | null>;
  centerAlign: boolean;
  centerSliderForFullscreen: () => void;
  setSliderIndexForFullscreen: (index: number, mode?: any) => void;
  layout: 'slider' | 'grid' | 'masonry' | 'entries';
  expandableImageRefs: React.RefObject<any[]>;
  entryMapRef: React.RefObject<MediaEntryLink[] | null>;
  entryMediaLayout: any;
  introFade: boolean;
  introDuration: number;
  introEasing: any;
  fullscreenSliderApi: React.RefObject<FullscreenSliderHandle | null>;
  slideIndex: number;
  isZoomClick: React.RefObject<boolean>;
  isZoomed: boolean;
  windowSize: any;
  handleZoomToggle: (zoomCtx: any, e: any, imageRef: any) => void;
  imageRefs: React.RefObject<React.RefObject<HTMLDivElement | null>[]>;
  scale: number;
  isZooming: React.RefObject<boolean>;
  wrappedModePlyrRefs: React.RefObject<(APITypes | null)[]>;
  singleModePlyrRefs: React.RefObject<(APITypes | null)[]>;
  direction: 'ltr' | 'rtl';
  sliderDuration: number;
  sliderFriction: number;
  suppressLoopRef: React.RefObject<boolean>;
  fsFadeOpening: boolean;
  slideFade: boolean;
  slideFadeDuration: number;
  slideFadeEasing: any;
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
    placement: any,
    breakpoint: number | undefined,
    viewportWidth: number
  ) => FsCaptionPlacement | null;
  requestFsCloseRef: React.RefObject<null | (() => void)>;
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
  setWrappedItems: React.Dispatch<React.SetStateAction<MediaItem[]>>;
  fsIndexRef: React.RefObject<number>;
  entriesObject: EntriesOptions;
  syncFullscreenSourceFromIndex: (nextIndex: number) => void;
  setFullscreenOpen: (open: boolean) => void;
};

function canonicalIndexOf(active: number, len: number) {
  // stable modulo for negative
  return ((active % len) + len) % len;
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
    cellsStateLength,
    slidesForFullscreen,
    sliderForFullscreen,
    visibleImagesForFullscreen,
    selectedIndexForFullscreen,
    sliderXForFullscreen,
    sliderVelocityForFullscreen,
    isWrappingForFullscreen,
    wrappedItems,
    setClosingModal,
    closeButtonRef,
    counterRef,
    leftChevronRef,
    rightChevronRef,
    centerAlign,
    centerSliderForFullscreen,
    setSliderIndexForFullscreen,
    layout,
    expandableImageRefs,
    entryMapRef,
    entryMediaLayout,
    introFade,
    introDuration,
    introEasing,
    epoch,
    fullscreenSliderApi,
    slideIndex,
    isZoomClick,
    isZoomed,
    windowSize,
    handleZoomToggle,
    imageRefs,
    scale,
    showFullscreenSlider,
    isZooming,
    wrappedModePlyrRefs,
    singleModePlyrRefs,
    closingModal,
    duplicateImgRef,
    direction,
    sliderDuration,
    sliderFriction,
    suppressLoopRef,
    fsFadeOpening,
    slideFade,
    slideFadeDuration,
    slideFadeEasing,
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
    setWrappedItems,
    fsIndexRef,
    entriesObject,
    syncFullscreenSourceFromIndex,
    setFullscreenOpen,
  } = props;

  // -------------------------
  // Lazy-load feature gates
  // -------------------------
  const fsLazyImagesEnabled = !!fs.lazyLoad?.images?.enabled;
  const fsLazyVideosEnabled = !!fs.lazyLoad?.videos?.enabled;

  // Separate allowed sets + listeners so images and videos can evolve independently.
  // (Right now both are "only active index", but videos might become "active +/- 1" later.)
  const fsAllowedImagesRef = React.useRef<Set<number>>(new Set());
  const fsAllowedVideosRef = React.useRef<Set<number>>(new Set());
  const fsLazyImageListenersRef = React.useRef(new Set<() => void>());
  const fsLazyVideoListenersRef = React.useRef(new Set<() => void>());

  const fsActiveIndexRef = React.useRef<number>(0);

  // Cache keys for "already prepared" work
  const fsDecodedImagesRef = React.useRef(new Set<string>()); // image decode cache
  const fsCustomDecodedImagesRef = React.useRef(new Set<string>()); // custom render image decode cache
  const fsCustomResolvedSrcByKeyRef = React.useRef(new Map<string, string>());
  const fsPreparedVideosRef = React.useRef(new Set<string>()); // video "prepare" cache
  const fsForceMountVideosRef = React.useRef<Set<number>>(new Set());

  const [latchedIntroMethod, setLatchedIntroMethod] =
    React.useState<FullscreenOpenMethod | null>(null);

  const [latchedIntroIndex, setLatchedIntroIndex] =
    React.useState<number>(0);

  const canonicalLen = normalizedItems.length || 0;
  const entryPrimeSeqRef = React.useRef(0);

  function notifyFsLazyImages() {
    fsLazyImageListenersRef.current.forEach((fn) => fn());
  }

  function notifyFsLazyVideos() {
    fsLazyVideoListenersRef.current.forEach((fn) => fn());
  }

  const recomputeAllowedAndNotify = React.useCallback(
    (active: number) => {
      if (!canonicalLen) return;

      const c = canonicalIndexOf(active, canonicalLen);

      if (fsLazyVideosEnabled) {
        const forced = fsForceMountVideosRef.current;
        fsAllowedVideosRef.current = new Set<number>([c, ...forced]);
        notifyFsLazyVideos();
      }

      if (fsLazyImagesEnabled) {
        fsAllowedImagesRef.current = new Set<number>([c]);
        notifyFsLazyImages();
      }
    },
    [canonicalLen, fsLazyImagesEnabled, fsLazyVideosEnabled]
  );

  React.useEffect(() => {
    if ((!fsLazyImagesEnabled && !fsLazyVideosEnabled) || !fsSub) return;

    const setActive = (v: number) => {
      if (typeof v !== 'number') return;
      fsActiveIndexRef.current = v;
      recomputeAllowedAndNotify(v);
    };

    if (showFullscreenModal) {
      const cur = fsSub.get?.();
      if (typeof cur === 'number') setActive(cur);
    }

    if (typeof fsSub.subscribe === 'function') {
      const off = fsSub.subscribe((v: number) => setActive(v));
      return () => off?.();
    }

    if (typeof fsSub.onEvent === 'function') {
      const off = fsSub.onEvent((evt: any) => {
        if (typeof evt === 'number') setActive(evt);
        else if (typeof evt?.index === 'number') setActive(evt.index);
        else {
          const cur = fsSub.get?.();
          if (typeof cur === 'number') setActive(cur);
        }
      });
      return () => off?.();
    }
  }, [fsLazyImagesEnabled, fsLazyVideosEnabled, fsSub, showFullscreenModal, recomputeAllowedAndNotify]);

  function nextZ() {
    const w = window as any;
    if (!w.__rmgZ) w.__rmgZ = 9999;
    w.__rmgZ += 1;
    return w.__rmgZ;
  }

  const fsZRef = React.useRef<number>(9999);

  React.useEffect(() => {
    if (showFullscreenModal) {
      fsZRef.current = nextZ();
    }
  }, [showFullscreenModal]);

  // -------------------------
  // Fullscreen intro
  // -------------------------
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
      closestSelector,
      baseZ: fsZRef.current,
    });

    clearFsIntroReq();
  }, [fsIntroReq, fullscreenThumbnailSlot]);

  // -------------------------
  // Zoom / Pan plumbing
  // -------------------------
  function boundsForCurrent(
    scaleNum: number,
    imgW: number,
    imgH: number,
    viewW?: number,
    viewH?: number
  ) {
    return boundsForCurrentFn({
      scale: scaleNum,
      imgW,
      imgH,
      currentImageEl: currentImage.current,
      viewW,
      viewH,
    });
  }

  React.useEffect(() => {
    axisRef.current = Axis();
  }, []);

  function renderPan(xPx: number, yPx: number) {
    if (!currentImage.current) return;
    const img = getPrimaryImgEl(currentImage.current);
    if (!img) return;
    img.style.transform = `translate3d(${xPx}px, ${yPx}px, 0) scale(${scaleRef.current})`;
  }

  function resetPanForScale1() {
    resetPanForScale1Fn({
      currentImage,
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
      ScrollBody,
      ScrollBounds,
      baseFitSize,
      boundsForCurrent,
      panDuration: fs.zoom?.panDuration!,
      panFriction: fs.zoom?.panFriction!,
      animRef,
    });
  }

  function resetZoomForSlideChange() {
    resetZoomForSlideChangeFn({
      setScale,
      zoomState: {
        previousZoom,
        panRef,
        scaleRef,
        suppressLoopRef,
        changingSlides,
      },
      imageRefs,
      resetPan: resetPanForScale1,
    });
  }

  function onForceResetZoom() {
    forceResetZoomFn({
      setScale,
      zoomState: {
        previousZoom,
        panRef,
        scaleRef,
      },
      imageRefs,
      resetPan: resetPanForScale1,
    });
  }

  const zoomCtx = React.useMemo(
    () => ({
      fs,
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
      Vector1D,
      ScrollBody,
      ScrollBounds,
      boundsForCurrent,
      renderPan,
      animRef,
      panRef,
      resetAllZoomDom: resetZoomForSlideChange,
    }),
    [
      fs,
      setScale,
      Vector1D,
      ScrollBody,
      ScrollBounds,
      boundsForCurrent,
      renderPan,
    ]
  );

  useWrappedItemsAndRefs({
    normalizedItems,
    wrappedItems,
    setWrappedItems,
    imageRefs,
  });

  const rebuildPanBodies = React.useCallback(() => {
    rebuildPanBodiesFn({
      fs,
      currentImage,
      scaleRef,
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
      Vector1D,
      ScrollBody,
      ScrollBounds,
      boundsForCurrent,
    } as any);
  }, [fs.zoom?.panDuration, fs.zoom?.panFriction]);

  const { isPinching, isTouchPinching } = useGlobalPinchZoom({
    scaleRef,
    zoomCtx,
    zoomTo,
    isZoomed,
    currentImage,
    imageRefs,
    fullscreenSliderApi,
    rebuildPanBodies,
    baseFitSize,
    boundsForCurrent,
    ScrollBounds,
    boundsX,
    boundsY,
    offX,
    offY,
    tgtX,
    tgtY,
    bodyX,
    bodyY,
    animRef,
    panDuration: fs.zoom?.panDuration!,
    findImgAtPoint,
    readDataIndex,
    distance,
    midpoint,
  });

  // -------------------------
  // Keep source in sync on open
  // -------------------------
  React.useEffect(() => {
    if (!showFullscreenModal) return;
    const start = fsSub.get();
    fsIndexRef.current = start;
    syncFullscreenSourceFromIndex(start);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    if (typeof fsSub.subscribe === 'function') {
      const off = fsSub.subscribe((v: number) => {
        void primeEntryOwnerForFsIndex(v);
      });
      return () => {
        cancelled = true;
        entryPrimeSeqRef.current += 1;
        off?.();
      };
    }

    if (typeof fsSub.onEvent === 'function') {
      const off = fsSub.onEvent((evt: any) => {
        if (typeof evt === 'number') {
          void primeEntryOwnerForFsIndex(evt);
          return;
        }
        if (typeof evt?.index === 'number') {
          void primeEntryOwnerForFsIndex(evt.index);
        }
      });
      return () => {
        cancelled = true;
        entryPrimeSeqRef.current += 1;
        off?.();
      };
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

  const { setMountEl: setFsEntryOverlayMountEl, setOpacity: setFsEntryOverlayOpacity } =
    useFsEntryOverlay({
      enabled: !!showFullscreenModal && layout === 'entries',
      fsSub,
      entriesObject,
      entryMapRef,
      syncFullscreenSourceFromIndex,
      resetAllZoomDom: resetZoomForSlideChange,
      closing: !!closingModal,
    });

  // -------------------------
  // Plyr props + transforms
  // -------------------------
  const isRtl = direction === 'rtl';
  const sign = isRtl ? -1 : 1;

  const wrappedPlyrProps = usePlyrProps({
    items: wrappedItems,
    source: fs.video?.source,
    options: fs.video?.options,
  });

  const singlePlyrProps = usePlyrProps({
    items: normalizedItems,
    source: fs.video?.source,
    options: fs.video?.options,
  });

  const wrappedTransform = React.useMemo(
    () => createWrappedTransform({ length: wrappedItems.length, sign }),
    [wrappedItems.length, sign]
  );

  const singleTransform = React.useMemo(() => createSingleTransform(), []);

  const pan = usePanRuntime({
    fs,
    isZoomed,
    zoomCtx,
    currentImage,
    rebuildPanBodies,
    renderPan,
    handleZoomToggle,
    suppressNextClickRef,
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
  });

  // -------------------------
  // Slide render (pass separate lazy plumbing)
  // -------------------------
  function mediaKey(item: MediaItem) {
    const any = item as any;
    return `${item.kind}|${any.src ?? ''}|${any.srcSet ?? ''}|${any.sizes ?? ''}|${any.poster ?? ''}`;
  }

  const fullscreenVideoSnapshotStore = React.useMemo(
    () => createVideoSnapshotStore(),
    [epoch]
  );

  React.useEffect(() => {
    return () => {
      fullscreenVideoSnapshotStore.destroy();
    };
  }, [fullscreenVideoSnapshotStore]);

  const openingInProgress = showFullscreenModal && !showFullscreenSlider;
  const openingCanonicalIndex = canonicalLen
    ? canonicalIndexOf(latchedIntroIndex, canonicalLen)
    : null;
  const openingTargetKind =
    openingCanonicalIndex != null
      ? normalizedItems[openingCanonicalIndex]?.kind ?? null
      : null;
  const deferLiveVideoUntilVisible =
    !!openingInProgress && openingTargetKind !== "video";

  const wrappedFullscreenSlides = renderFullscreenSlides({
    items: wrappedItems,
    plyrList: wrappedPlyrProps,
    getTransform: wrappedTransform,
    imageRefs,
    playerRefs: wrappedModePlyrRefs,
    cells,
    isZoomed,
    showFullscreenSlider,
    defaultPlayerStyle,
    fsVideoStyle: fs.video?.style,
    fsVideoClassName: fs.video?.className,

    onPanPointerDown: (
      e: React.PointerEvent<HTMLDivElement>,
      imageRef: React.RefObject<HTMLDivElement | null>
    ) => pan.handlePanPointerStart(e, imageRef),

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
    fsCaptionPlacement: fs.caption?.placement,
    fsCaptionWidth: fs.caption?.width,
    fsCaptionHeight: fs.caption?.height,
    fsCaptionBreakpoint: fs.caption?.breakpoint,
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
    openingCanonicalIndex,
    openingInProgress,
    deferLiveVideoUntilVisible,
    getMediaKey: mediaKey,
  });

  const oneFullscreenSlide = renderFullscreenSlides({
    items: normalizedItems,
    plyrList: singlePlyrProps,
    getTransform: singleTransform,
    imageRefs,
    playerRefs: singleModePlyrRefs,
    cells,
    isZoomed,
    showFullscreenSlider,
    defaultPlayerStyle,
    fsVideoStyle: fs.video?.style,
    fsVideoClassName: fs.video?.className,

    onPanPointerDown: (
      e: React.PointerEvent<HTMLDivElement>,
      imageRef: React.RefObject<HTMLDivElement | null>
    ) => pan.handlePanPointerStart(e, imageRef),

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
    fsCaptionPlacement: fs.caption?.placement,
    fsCaptionWidth: fs.caption?.width,
    fsCaptionHeight: fs.caption?.height,
    fsCaptionBreakpoint: fs.caption?.breakpoint,
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
    openingCanonicalIndex,
    openingInProgress,
    deferLiveVideoUntilVisible,
    getMediaKey: mediaKey,
  });

  // Reset zoom state on close
  React.useEffect(() => {
    if (animRef.current) {
      animRef.current.stop();
      setScale(1);
      previousZoom.current.x = 0;
      previousZoom.current.y = 0;
      panRef.current = { x: 0, y: 0 };
      scaleRef.current = 1;
      setFsEntryOverlayOpacity(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closingModal]);

  // -------------------------
  // Idle preload (non-lazy mode)
  // -------------------------
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
    // In non-lazy mode, preload images in idle time for snappy FS open
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

  // -------------------------
  // Preload-on-base-visible (lazy mode)
  // -------------------------
  const core = useOptionalGalleryCore();

  React.useEffect(() => {
    if (!core) return;
    if (!showFullscreenModal) return;
    if (!fsSub) return;
    if (!canonicalLen) return;

    const emitVisible = (v: number) => {
      if (typeof v !== 'number') return;
      const c = canonicalIndexOf(v, canonicalLen);
      core.notifyFsVisibleIndex(c);
    };

    const cur = fsSub.get?.();
    if (typeof cur === 'number') emitVisible(cur);

    if (typeof fsSub.subscribe === 'function') {
      const off = fsSub.subscribe((v: number) => emitVisible(v));
      return () => off?.();
    }

    if (typeof fsSub.onEvent === 'function') {
      const off = fsSub.onEvent((evt: any) => {
        if (typeof evt === 'number') emitVisible(evt);
        else if (typeof evt?.index === 'number') emitVisible(evt.index);
        else {
          const next = fsSub.get?.();
          if (typeof next === 'number') emitVisible(next);
        }
      });
      return () => off?.();
    }
  }, [core, showFullscreenModal, fsSub, canonicalLen]);

  const preloadFsImageAtIndex = React.useCallback(
    async (canonicalIndex: number) => {
      const item = normalizedItems[canonicalIndex];
      if (!item || item.kind !== 'image') return;

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
      } catch {
        // don’t mark decoded on failure
      }
    },
    [normalizedItems]
  );

  /**
   * Video "preload" / "prepare" flow.
   */

  const preloadFsVideoAtIndex = React.useCallback(
    async (canonicalIndex: number) => {
      const item = normalizedItems[canonicalIndex];
      if (!item || item.kind !== 'video') return;

      const key = mediaKey(item);
      if (fsPreparedVideosRef.current.has(key)) return;

      const poster = (item as any).poster ?? (item as any).thumbSrc ?? null;

      // 1) poster warm-up
      if (poster) {
        try {
          const img = new Image();
          img.decoding = 'async';
          (img as any).fetchPriority = 'high';
          img.src = poster;
          await img.decode().catch(() => {});
        } catch {}
      }

      // 2) mp4 warm-up
      // try to derive the mp4 url from your MediaItem shape
      const mp4 =
        (item as any).src ||
        (item as any).videoSrc ||
        (item as any).sources?.[0]?.src ||
        null;

      if (typeof mp4 === 'string' && mp4) {
        try {
          const v = document.createElement('video');
          v.preload = 'auto';
          v.muted = true;
          v.playsInline = true;
          // v.crossOrigin = 'anonymous'; // enable only if your CDN sends CORS headers
          if (poster) v.poster = poster;
          v.src = mp4;

          // touch the pipeline
          v.load();

          // give it a moment to start requests then release
          setTimeout(() => {
            try {
              v.removeAttribute('src');
              v.load();
            } catch {}
          }, 1500);
        } catch {}
      }

      // 3) force FS plyr mount (by allowing this index for FS lazy videos)
      fsForceMountVideosRef.current.add(canonicalIndex);
      notifyFsLazyVideos();

      // Mark prepared so we don't repeat heavy work
      fsPreparedVideosRef.current.add(key);
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
  const fullscreenThumbnailFadeDuration =
    fullscreenThumbnailSlot?.fadeDurationMs ?? 300;
  const fullscreenThumbnailFadeEasing =
    fullscreenThumbnailSlot?.fadeEasing ?? 'cubic-bezier(.4,0,.22,1)';
  const fullscreenThumbnailOpen = showFullscreenModal && !closingModal;

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
          cellCount={cellsStateLength}
          slides={slidesForFullscreen}
          slider={sliderForFullscreen}
          visibleImagesRef={visibleImagesForFullscreen}
          selectedIndex={selectedIndexForFullscreen}
          sliderX={sliderXForFullscreen}
          sliderVelocity={sliderVelocityForFullscreen}
          isWrapping={isWrappingForFullscreen}
          wrappedItems={wrappedItems}
          setClosingModal={setClosingModal}
          closeButtonRef={closeButtonRef}
          counterRef={counterRef}
          leftChevronRef={leftChevronRef}
          rightChevronRef={rightChevronRef}
          centerAlign={centerAlign}
          centerSlider={centerSliderForFullscreen}
          setSliderIndex={setSliderIndexForFullscreen}
          onForceResetZoom={() => onForceResetZoom()}
          layout={layout}
          expandableImageRefs={expandableImageRefs}
          entryMapRef={entryMapRef}
          entryMediaLayout={entryMediaLayout}
          introFade={introFade}
          introDuration={introDuration}
          introEasing={introEasing}
          requestFsCloseRef={requestFsCloseRef}
          fs={fs}
          styles={styles}
          direction={direction}
          setFullscreenOpen={setFullscreenOpen}
          syncFullscreenSourceFromIndex={syncFullscreenSourceFromIndex}
          baseZ={fsZRef.current}
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
                minHeight: 0,
              }}
            >
              <FullscreenSlider
                sub={fsSub}
                ref={fullscreenSliderApi}
                cellCount={cellsStateLength}
                slideIndex={slideIndex}
                isClick={isZoomClick}
                isZoomed={isZoomed}
                windowSize={windowSize}
                show={showFullscreenModal}
                handleZoomToggle={(e, imageRef) =>
                  handleZoomToggle(zoomCtx as any, e as any, imageRef as any)
                }
                imageRefs={imageRefs.current}
                cells={cells}
                isPinching={isPinching}
                scale={scale}
                isTouchPinching={isTouchPinching}
                showFullscreenSlider={showFullscreenSlider}
                isZooming={isZooming}
                plyrRefs={wrappedModePlyrRefs}
                plyrRef={singleModePlyrRefs}
                closingModal={closingModal}
                counterRef={counterRef}
                leftChevronRef={leftChevronRef}
                rightChevronRef={rightChevronRef}
                overlayDivRef={overlayDivRef}
                direction={direction}
                isWrapping={isWrappingForFullscreen}
                sliderDuration={sliderDuration}
                sliderFriction={sliderFriction}
                suppressLoopRef={suppressLoopRef}
                fadeOpening={fsFadeOpening}
                introFade={introFade}
                slideFade={slideFade}
                slideFadeDuration={slideFadeDuration}
                slideFadeEasing={slideFadeEasing}
                normalizedItems={normalizedItems}
                introDuration={introDuration}
                introEasing={introEasing}
                resetAllZoomDom={() => resetZoomForSlideChange()}
                requestFsCloseRef={requestFsCloseRef}
                introMethod={latchedIntroMethod}
                fs={fs}
                chromeStyles={styles}
              >
                {normalizedItems.length > 1 ? wrappedFullscreenSlides : oneFullscreenSlide}
              </FullscreenSlider>
            </div>

            {fullscreenThumbnailSlot && (
              <div
                ref={setFullscreenThumbnailMountEl}
                className={fullscreenThumbnailSlot.className}
                style={{
                  flex: '0 0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition:
                    `background-color ${fullscreenThumbnailFadeDuration}ms ${fullscreenThumbnailFadeEasing}`,
                  backgroundColor: fullscreenThumbnailOpen
                    ? 'rgba(255,255,255,1)'
                    : 'rgba(255,255,255,0)',
                  ...(fullscreenThumbnailSlot.style || {}),
                }}
              />
            )}
          </div>

          {showFsEntryOverlayMount ? <FsEntryOverlayMount setMountEl={setFsEntryOverlayMountEl} /> : null}
        </FullscreenModal>
      )}
    </>
  );
}

export default FullscreenRuntime;