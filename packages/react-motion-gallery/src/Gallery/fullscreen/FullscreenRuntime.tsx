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
import {
  renderFullscreenCrossfadeSlides,
  renderFullscreenSlides,
} from './renderFullscreenSlides';
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
import { useFsCaptionOverlay } from './useFsCaptionOverlay';
import { useFullscreenCaptionZoomMotion } from './captionZoomMotion';
import { baseFitSize, distance, midpoint } from '../zoomPan/core/utils';
import { zoomTo } from '../zoomPan/zoom/zoomTo';
import { findImgAtPoint, getFullscreenTwinImages, getPrimaryImgEl, readDataIndex } from '../zoomPan/core/dom';
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
import {
  effectiveViewportHeight,
  effectiveViewportWidth,
  resolveLengthFromResponsive,
  ResponsiveCaptionPlacement,
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
  wrappedItems: MediaItem[];
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
  controlsFade: boolean;
  dragFade: boolean;
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
    placement: ResponsiveCaptionPlacement | undefined,
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
    wrappedItems,
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
    introFade,
    introDuration,
    introEasing,
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
    controlsFade,
    dragFade,
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

  const fsLazyImagesEnabled = !!fs.lazyLoad?.images?.enabled;
  const fsLazyVideosEnabled = !!fs.lazyLoad?.videos?.enabled;
  const fsAllowedImagesRef = React.useRef<Set<number>>(new Set());
  const fsAllowedVideosRef = React.useRef<Set<number>>(new Set());
  const fsLazyImageListenersRef = React.useRef(new Set<() => void>());
  const fsLazyVideoListenersRef = React.useRef(new Set<() => void>());
  const fsActiveIndexRef = React.useRef<number>(0);
  const fsDecodedImagesRef = React.useRef(new Set<string>());
  const fsCustomDecodedImagesRef = React.useRef(new Set<string>());
  const fsCustomResolvedSrcByKeyRef = React.useRef(new Map<string, string>());
  const fsPreparedVideosRef = React.useRef(new Set<string>());
  const fsForceMountVideosRef = React.useRef<Set<number>>(new Set());
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
  const fullscreenVideoSnapshotStoreRef = React.useRef<ReturnType<typeof createVideoSnapshotStore> | null>(null);
  if (!fullscreenVideoSnapshotStoreRef.current) {
    fullscreenVideoSnapshotStoreRef.current = createVideoSnapshotStore();
  }
  const fullscreenVideoSnapshotStore = fullscreenVideoSnapshotStoreRef.current;

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

  const resetFsSessionState = React.useCallback(() => {
    fsPreparedVideosRef.current.clear();
    fsForceMountVideosRef.current.clear();
    fsAllowedVideosRef.current = new Set<number>();
    fsAllowedImagesRef.current = new Set<number>();
  }, []);

  const syncFsSessionToCurrentIndex = React.useCallback(() => {
    const current = fsSub.get?.();
    const active =
      typeof current === 'number' && Number.isFinite(current)
        ? current
        : fsActiveIndexRef.current;

    if (typeof active !== 'number' || !Number.isFinite(active)) return;

    fsActiveIndexRef.current = active;
    recomputeAllowedAndNotify(active);
  }, [fsSub, recomputeAllowedAndNotify]);

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
    resetFsSessionState();
    fullscreenVideoSnapshotStore.reset();

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

  const hasEntriesViewportOverlay =
    layout === 'entries' &&
    typeof entriesObject.render?.overlay === 'function';

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
    });

    clearFsIntroReq();
  }, [entriesObject.overlay, fsIntroReq, fullscreenThumbnailSlot, hasEntriesViewportOverlay]);

  const boundsForCurrent = React.useCallback(
    (
      scaleNum: number,
      imgW: number,
      imgH: number,
      viewW?: number,
      viewH?: number
    ) => {
      const viewportWidth = effectiveViewportWidth(windowSize.width);
      const viewportHeight = effectiveViewportHeight(windowSize.height);

      const isSlideCaption = fs.caption?.layout !== "overlay";
      const overlayHasExplicitDims =
        fs.caption?.layout === "overlay" &&
        (fs.caption?.width != null || fs.caption?.height != null);

      const effectivePlacement =
        isSlideCaption || overlayHasExplicitDims
          ? resolveFsCaptionPlacement(
              fs.caption?.placement,
              fs.caption?.breakpoint,
              viewportWidth
            )
          : null;

      const resolvedCaptionWidth =
        fs.caption?.width == null
          ? undefined
          : resolveLengthFromResponsive(
              fs.caption.width,
              280,
              viewportWidth,
              viewportWidth
            );

      const resolvedCaptionHeight =
        fs.caption?.height == null
          ? undefined
          : resolveLengthFromResponsive(
              fs.caption.height,
              200,
              viewportWidth,
              viewportHeight
            );

      const effectiveEntryOverlayPlacement = hasEntriesViewportOverlay
        ? resolveFsCaptionPlacement(
            entriesObject.overlay?.placement,
            entriesObject.overlay?.breakpoint,
            viewportWidth
          )
        : null;

      const resolvedEntryOverlayWidth =
        !hasEntriesViewportOverlay || entriesObject.overlay?.width == null
          ? undefined
          : resolveLengthFromResponsive(
              entriesObject.overlay.width,
              280,
              viewportWidth,
              viewportWidth
            );

      const resolvedEntryOverlayHeight =
        !hasEntriesViewportOverlay || entriesObject.overlay?.height == null
          ? undefined
          : resolveLengthFromResponsive(
              entriesObject.overlay.height,
              200,
              viewportWidth,
              viewportHeight
            );

      const reservedLeft =
        (effectivePlacement === 'left'
          ? (isSlideCaption ? (resolvedCaptionWidth ?? 280) : (resolvedCaptionWidth ?? 0))
          : 0) +
        (effectiveEntryOverlayPlacement === 'left' ? (resolvedEntryOverlayWidth ?? 0) : 0);

      const reservedRight =
        (effectivePlacement === 'right'
          ? (isSlideCaption ? (resolvedCaptionWidth ?? 280) : (resolvedCaptionWidth ?? 0))
          : 0) +
        (effectiveEntryOverlayPlacement === 'right' ? (resolvedEntryOverlayWidth ?? 0) : 0);

      const reservedTop =
        (effectivePlacement === 'top'
          ? (isSlideCaption ? (resolvedCaptionHeight ?? 200) : (resolvedCaptionHeight ?? 0))
          : 0) +
        (effectiveEntryOverlayPlacement === 'top' ? (resolvedEntryOverlayHeight ?? 0) : 0);

      const reservedBottom =
        (effectivePlacement === 'bottom'
          ? (isSlideCaption ? (resolvedCaptionHeight ?? 200) : (resolvedCaptionHeight ?? 0))
          : 0) +
        (effectiveEntryOverlayPlacement === 'bottom'
          ? (resolvedEntryOverlayHeight ?? 0)
          : 0);

      return boundsForCurrentFn({
        scale: scaleNum,
        imgW,
        imgH,
        currentImageEl: currentImage.current,
        viewW,
        viewH,
        reservedLeft,
        reservedRight,
        reservedTop,
        reservedBottom,
      });
    },
    [
      currentImage,
      entriesObject.overlay,
      entriesObject.render?.overlay,
      fs.caption,
      hasEntriesViewportOverlay,
      layout,
      resolveFsCaptionPlacement,
      windowSize.height,
      windowSize.width,
    ]
  );

  React.useEffect(() => {
    axisRef.current = Axis();
  }, []);

  function renderPan(xPx: number, yPx: number) {
    if (changingSlides.current) return;
    if (!currentImage.current) return;

    const twinImages = getFullscreenTwinImages(currentImage.current);
    if (!twinImages.length) return;

    const transform = `translate3d(${xPx}px, ${yPx}px, 0) scale(${scaleRef.current})`;
    twinImages.forEach((img) => {
      img.style.transform = transform;
    });
  }

  function stopPanMotionForSlideReset() {
    animRef.current?.stop();

    bodyX.current?.useDuration(0).useFriction(1).sync();
    bodyY.current?.useDuration(0).useFriction(1).sync();

    const x = 0;
    const y = 0;

    locX.current?.set(x);
    prevX.current?.set(x);
    offX.current?.set(x);
    tgtX.current?.set(x);

    locY.current?.set(y);
    prevY.current?.set(y);
    offY.current?.set(y);
    tgtY.current?.set(y);
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

  function resetZoomForSlideChange(args?: { disableImageTransition?: boolean }) {
    const disableImageTransition = !!args?.disableImageTransition;

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
      stopPanMotion: stopPanMotionForSlideReset,
      transition: disableImageTransition ? "none" : undefined,
      unlockDelayMs: disableImageTransition ? 0 : undefined,
    });
  }

  function resetZoomForSlideNavigation() {
    resetZoomForSlideChange({ disableImageTransition: dragFade });
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
  }, [boundsForCurrent, fs, fs.zoom?.panDuration, fs.zoom?.panFriction]);

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

  const entryOverlayZoomMotion = useFullscreenCaptionZoomMotion({
    caption: {
      zoomFade: entriesObject.overlay?.zoomFade,
      zoomFadeDurationMs: entriesObject.overlay?.zoomFadeDurationMs,
      zoomFadeEasing: entriesObject.overlay?.zoomFadeEasing,
      zoomInTransform: entriesObject.overlay?.zoomInTransform,
      zoomOutTransform: entriesObject.overlay?.zoomOutTransform,
    },
    isZoomed,
  });

  const { setMountEl: setFsEntryOverlayMountEl, setOpacity: setFsEntryOverlayOpacity } =
    useFsEntryOverlay({
      enabled: !!showFullscreenModal && layout === 'entries',
      fsSub,
      entriesObject,
      entryMapRef,
      syncFullscreenSourceFromIndex,
      resetAllZoomDom: resetZoomForSlideChange,
      closing: !!closingModal,
      overlayZoomMotion: entryOverlayZoomMotion,
      viewportWidth: windowSize.width,
      viewportHeight: windowSize.height,
      resolveFsCaptionPlacement,
    });

  const showFsCaptionOverlayMount =
    !!showFullscreenModal &&
    fs.caption?.layout === 'overlay' &&
    typeof fs.caption?.render === 'function';

  const captionZoomMotion = useFullscreenCaptionZoomMotion({
    caption: fs.caption,
    isZoomed,
  });

  const { setMountEl: setFsCaptionOverlayMountEl } = useFsCaptionOverlay({
    enabled: showFsCaptionOverlayMount,
    fsSub,
    items: normalizedItems,
    caption: fs.caption,
    isZoomed,
    captionZoomMotion,
    viewportWidth: windowSize.width,
    viewportHeight: windowSize.height,
    interactive: !!showFullscreenSlider,
    closing: !!closingModal,
    resolveFsCaptionPlacement,
  });

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

  function mediaKey(item: MediaItem) {
    const any = item as any;
    return `${item.kind}|${any.src ?? ''}|${any.srcSet ?? ''}|${any.sizes ?? ''}|${any.poster ?? ''}`;
  }

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
    openingCanonicalIndex,
    openingInProgress,
    deferLiveVideoUntilVisible,
    getMediaKey: mediaKey,
  });

  const fullscreenCrossfadeSlides = renderFullscreenCrossfadeSlides({
    items: normalizedItems,
    plyrList: singlePlyrProps,
    getTransform: singleTransform,
    imageRefs: { current: crossfadeImageRefs },
    playerRefs: crossfadePlayerRefs,
    cells: crossfadeCellsRef,
    isZoomed,
    showFullscreenSlider: true,
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
  });

  const pauseAllFullscreenPlayers = React.useCallback(() => {
    const seenApis = new Set<APITypes>();

    for (const refs of [wrappedModePlyrRefs.current, singleModePlyrRefs.current]) {
      for (const api of refs) {
        if (!api || seenApis.has(api)) continue;
        seenApis.add(api);
        pausePlyrApi(api);
      }
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
  }, [closingModal]);

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
      } catch {}
    },
    [normalizedItems]
  );

  const preloadFsVideoAtIndex = React.useCallback(
    async (canonicalIndex: number) => {
      const item = normalizedItems[canonicalIndex];
      if (!item || item.kind !== 'video') return;

      const key = mediaKey(item);
      if (fsPreparedVideosRef.current.has(key)) return;

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
          v.preload = 'auto';
          v.muted = true;
          v.playsInline = true;
          // v.crossOrigin = 'anonymous'; // enable only if your CDN sends CORS headers
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

      fsForceMountVideosRef.current.add(canonicalIndex);
      notifyFsLazyVideos();

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
  const cellCount = normalizedItems.length;

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
          introFade={introFade}
          introDuration={introDuration}
          introEasing={introEasing}
          requestFsCloseRef={requestFsCloseRef}
          fs={fs}
          styles={styles}
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
                cellCount={cellCount}
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
                controlsFade={controlsFade}
                dragFade={dragFade}
                slideFadeDuration={slideFadeDuration}
                slideFadeEasing={slideFadeEasing}
                normalizedItems={normalizedItems}
                crossfadeSlides={fullscreenCrossfadeSlides}
                introDuration={introDuration}
                introEasing={introEasing}
                resetAllZoomDom={() => resetZoomForSlideNavigation()}
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

          {showFsCaptionOverlayMount ? (
            <FsEntryOverlayMount setMountEl={setFsCaptionOverlayMountEl} />
          ) : null}
          {showFsEntryOverlayMount ? <FsEntryOverlayMount setMountEl={setFsEntryOverlayMountEl} /> : null}
        </FullscreenModal>
      )}
    </>
  );
}

export default FullscreenRuntime;
