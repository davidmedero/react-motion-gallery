'use client';

import * as React from 'react';
import { FullscreenModal } from './FullscreenModal';
import { FullscreenSlider } from './FullscreenSlider';
import FullscreenThumbnailSlider from './FullscreenThumbnailSlider';
import { FsEntryOverlayMount } from '../entries/overlay/FsEntryOverlayMount';
import type { FullscreenSliderHandle } from './FullscreenSlider';
import type { EntriesOptions, MediaEntryLink } from '../entries/types';
import type { APITypes } from "plyr-react";
import { MediaItem } from '../shared/types/media';
import { runFullscreenIntro } from "./fullscreenIntro";
import { FsCaptionPlacement, FsIntroRequest, FullscreenOptions } from './types';
import { Root } from 'react-dom/client';
import { usePlyrProps } from "../video/usePlyrProps";
import { renderFullscreenSlides } from "./renderFullscreenSlides";
import { createSingleTransform, createWrappedTransform } from "./transforms";
import { defaultPlayerStyle } from "../video/fullscreenPlayerStyle";
import { usePanRuntime } from "../zoomPan/pan";
import { rebuildPanBodiesFn } from '../zoomPan/core/rebuildPanBodies';
import { ScrollBounds, ScrollBoundsType } from '../shared/motion/scrollBounds';
import { ScrollBody, ScrollBodyType } from '../shared/motion/scrollBody';
import { Vector1D, Vector1DType } from '../shared/motion/vector1d';
import { PanAxis as Axis, PanAxisType as AxisType } from "../shared/types/axis";
import { AnimationsType } from '../shared/motion/animations';
import { boundsForCurrent as boundsForCurrentFn } from '../zoomPan/core/boundsForCurrent';
import { useGlobalPinchZoom } from '../zoomPan/zoom/useGlobalPinchZoom';
import { useWrappedItemsAndRefs } from './hooks/useWrappedItemsAndRefs';
import { forceResetZoom as forceResetZoomFn } from "../zoomPan/zoom/forceResetZoom";
import { resetZoomForSlideChange as resetZoomForSlideChangeFn } from "../zoomPan/zoom/resetZoomForSlideChange";
import { resetPanForScale1 as resetPanForScale1Fn } from '../zoomPan/pan/resetPanForScale1';
import { useFsEntryOverlay } from '../entries/overlay/useFsEntryOverlay';
import { baseFitSize, distance, midpoint } from '../zoomPan/core/utils';
import { zoomTo } from '../zoomPan/zoom/zoomTo';
import { findImgAtPoint, readDataIndex } from '../zoomPan/core/dom';

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
  expandableImgRefs: React.RefObject<any[]>;
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
  flexDirection: any;
  fsThumbContainerRef: React.RefObject<HTMLDivElement | null>;
  fsThumbFadeDuration: number;
  fsThumbFadeEasing: any;
  fsThumbsOpen: boolean;
  fsResolvedThumbPos: any;
  fsThumbnailsPositionDefined: boolean;
  fsThumbnailsContainerClassName?: string;
  fsThumbnailsContainerStyle?: React.CSSProperties;
  fsThumbThumbnailWidth?: number | string;
  fsThumbThumbnailHeight?: number | string;
  fsThumbCenter?: boolean;
  fsThumbContainerWidth?: number | string;
  fsThumbContainerHeight?: number | string;
  fsThumbGap?: number;
  fsThumbFreeScroll?: boolean;
  fsThumbGroupCells?: boolean;
  fsThumbLoop?: boolean;
  fsThumbSkipSnaps?: boolean;
  fsThumbCenterActiveThumb?: boolean;
  fsThumbSelectDuration?: number;
  fsThumbFreeScrollDuration?: number;
  fsThumbFriction?: number;
  fsThumbBreakpointMap?: any;
  fsThumbRippleEnabled?: boolean;
  fsThumbRippleClassName?: string;
  fsThumbControlsEnabled?: boolean;
  sliderThumbArrowStyles?: React.CSSProperties;
  sliderThumbArrowClassName?: string;
  fsThumbPrevArrowStyles?: React.CSSProperties;
  fsThumbPrevArrowClassName?: string;
  fsThumbNextArrowStyles?: React.CSSProperties;
  fsThumbNextArrowClassName?: string;
  sliderThumbRenderArrows?: any;
  fsThumbRenderPrevArrow?: any;
  fsThumbRenderNextArrow?: any;
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
  interactionModeRef: React.RefObject<"idle" | "drag" | "wheel" | "programmatic">;
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
    expandableImgRefs,
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
    flexDirection,
    fsThumbContainerRef,
    fsThumbFadeDuration,
    fsThumbFadeEasing,
    fsThumbsOpen,
    fsResolvedThumbPos,
    fsThumbnailsPositionDefined,
    fsThumbnailsContainerClassName,
    fsThumbnailsContainerStyle,
    fsThumbThumbnailWidth,
    fsThumbThumbnailHeight,
    fsThumbCenter,
    fsThumbContainerWidth,
    fsThumbContainerHeight,
    fsThumbGap,
    fsThumbFreeScroll,
    fsThumbGroupCells,
    fsThumbLoop,
    fsThumbSkipSnaps,
    fsThumbCenterActiveThumb,
    fsThumbSelectDuration,
    fsThumbFreeScrollDuration,
    fsThumbFriction,
    fsThumbBreakpointMap,
    fsThumbRippleEnabled,
    fsThumbRippleClassName,
    fsThumbControlsEnabled,
    sliderThumbArrowStyles,
    sliderThumbArrowClassName,
    fsThumbPrevArrowStyles,
    fsThumbPrevArrowClassName,
    fsThumbNextArrowStyles,
    fsThumbNextArrowClassName,
    sliderThumbRenderArrows,
    fsThumbRenderPrevArrow,
    fsThumbRenderNextArrow,
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

  React.useEffect(() => {
    if (!fsIntroReq) return;

    const { origImg, index, closestSelector } = fsIntroReq;

    runFullscreenIntro({
      origImg,
      index,
      normalizedItems,
      styles,
      fs,
      overlayDivRef,
      duplicateImgRef,
      overlayCaptionRef,
      overlayCaptionRootRef,
      fsThumbContainerRef,
      setShowFullscreenSlider,
      setFsFadeOpening,
      addShield,
      resolveFsCaptionPlacement,
      closestSelector,
    });

    clearFsIntroReq();
  }, [fsIntroReq]);

  function boundsForCurrent(
    scale: number,
    imgW: number,
    imgH: number,
    viewW?: number,
    viewH?: number
  ) {
    return boundsForCurrentFn({
      scale,
      imgW,
      imgH,
      currentImageEl: currentImage.current,
      viewW,
      viewH
    });
  }

  React.useEffect(() => {
    axisRef.current = Axis()
  }, []);

  const zoomCtx = React.useMemo(() => ({
    fs,
    currentImage,
    scaleRef,
    setScale,
    previousZoom,
    suppressLoopRef,
    locX, prevX, offX, tgtX,
    locY, prevY, offY, tgtY,
    bodyX, bodyY,
    boundsX, boundsY,
    Vector1D,
    ScrollBody,
    ScrollBounds,
    boundsForCurrent,
    renderPan,
    animRef,
    panRef,
    resetAllZoomDom: resetZoomForSlideChange,
  }), [
    fs,
    setScale,
    Vector1D,
    ScrollBody,
    ScrollBounds,
    boundsForCurrent,
    renderPan,
  ]);

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
      locX, prevX, offX, tgtX,
      locY, prevY, offY, tgtY,
      bodyX, bodyY,
      boundsX, boundsY,
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

  React.useEffect(() => {
    if (!showFullscreenModal) return;
    const start = fsSub.get();
    fsIndexRef.current = start;
    syncFullscreenSourceFromIndex(start);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFullscreenModal, fsSub]);

  const { setMountEl: setFsEntryOverlayMountEl, setOpacity: setFsEntryOverlayOpacity } = useFsEntryOverlay({
    enabled: !!showFullscreenModal && layout === 'entries',
    fsSub,
    entriesObject,
    entryMapRef,
    syncFullscreenSourceFromIndex,
    resetAllZoomDom: resetZoomForSlideChange,
    closing: !!closingModal
  });

  const isRtl = direction === "rtl";
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

  const singleTransform = React.useMemo(
    () => createSingleTransform(),
    []
  );

  function renderPan(xPx: number, yPx: number) {
    if (!currentImage.current) return
    const img = currentImage.current.children[0] as HTMLElement | null
    if (!img) return
    img.style.transform = `translate3d(${xPx}px, ${yPx}px, 0) scale(${scaleRef.current})`
  }

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
    boundsX, boundsY,
    bodyX, bodyY,
    locX, locY,
    prevX, prevY,
    offX, offY,
    tgtX, tgtY,
    axisRef,
    animRef,
  });

  const wrappedFullscreenImages = renderFullscreenSlides({
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
    onPanPointerDown: (e, imageRef) => pan.handlePanPointerStart(e, imageRef),
    onSuppressNextClickCapture: (e) => {
      if (suppressNextClickRef.current) {
        suppressNextClickRef.current = false;
        e.preventDefault();
        (e as any).stopPropagation?.();
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
  });

  const oneFullscreenImage = renderFullscreenSlides({
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
    onPanPointerDown: (e, imageRef) => pan.handlePanPointerStart(e, imageRef),
    onSuppressNextClickCapture: (e) => {
      if (suppressNextClickRef.current) {
        suppressNextClickRef.current = false;
        e.preventDefault();
        (e as any).stopPropagation?.();
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
  });

  React.useEffect(() => {
    if (animRef.current) {
      animRef.current.stop()
      setScale(1);
      previousZoom.current.x = 0; previousZoom.current.y = 0;
      panRef.current = { x: 0, y: 0 }
      scaleRef.current = 1
      setFsEntryOverlayOpacity(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closingModal])

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
          imageCount={cellsStateLength}
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
          expandableImgRefs={expandableImgRefs}
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
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection,
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
                key={epoch}
                sub={fsSub}
                ref={fullscreenSliderApi}
                imageCount={cellsStateLength}
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
                closeButtonRef={closeButtonRef}
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
              >
                {normalizedItems.length > 1 ? wrappedFullscreenImages : oneFullscreenImage}
              </FullscreenSlider>
            </div>

            {fsThumbnailsPositionDefined && (
              <div
                ref={fsThumbContainerRef}
                className={fsThumbnailsContainerClassName}
                style={{
                  flex:
                    fsResolvedThumbPos === 'left' || fsResolvedThumbPos === 'right'
                      ? '0 0 auto'
                      : '0 0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding:
                    fsResolvedThumbPos === 'top' || fsResolvedThumbPos === 'bottom'
                      ? '0.75rem 1rem'
                      : '0.75rem 0.5rem',
                  transition: `background-color ${fsThumbFadeDuration}ms ${fsThumbFadeEasing}`,
                  backgroundColor: fsThumbsOpen
                    ? 'rgba(255,255,255,1)'
                    : 'rgba(255,255,255,0)',
                  ...(fsThumbnailsContainerStyle || {}),
                }}
              >
                {normalizedItems.length > 1 && (
                  <FullscreenThumbnailSlider
                    items={normalizedItems.map((item) => ({
                      thumbSrc: (item as any).thumbSrc ?? (item as any).src,
                      alt: (item as any).alt,
                    }))}
                    position={fsResolvedThumbPos}
                    fsSub={fsSub}
                    thumbnailWidth={fsThumbThumbnailWidth}
                    thumbnailHeight={fsThumbThumbnailHeight}
                    thumbnailsCenter={fsThumbCenter}
                    thumbnailsContainerWidth={fsThumbContainerWidth}
                    thumbnailsContainerHeight={fsThumbContainerHeight}
                    visible={showFullscreenModal}
                    invisible={closingModal}
                    thumbnailItemClassName={undefined}
                    thumbnailItemStyle={undefined}
                    gap={fsThumbGap}
                    freeScroll={fsThumbFreeScroll}
                    groupCells={fsThumbGroupCells}
                    loop={fsThumbLoop}
                    direction={direction}
                    skipSnaps={fsThumbSkipSnaps}
                    centerActiveThumb={fsThumbCenterActiveThumb}
                    selectDuration={fsThumbSelectDuration}
                    freeScrollDuration={fsThumbFreeScrollDuration}
                    sliderFriction={fsThumbFriction}
                    breakpointMap={fsThumbBreakpointMap}
                    rippleEnabled={fsThumbRippleEnabled}
                    rippleClassName={fsThumbRippleClassName}
                    showArrows={fsThumbControlsEnabled}
                    arrowStyles={sliderThumbArrowStyles}
                    arrowClassName={sliderThumbArrowClassName}
                    prevArrowStyles={fsThumbPrevArrowStyles}
                    prevArrowClassName={fsThumbPrevArrowClassName}
                    nextArrowStyles={fsThumbNextArrowStyles}
                    nextArrowClassName={fsThumbNextArrowClassName}
                    renderArrows={sliderThumbRenderArrows}
                    renderPrevArrow={fsThumbRenderPrevArrow}
                    renderNextArrow={fsThumbRenderNextArrow}
                  />
                )}
              </div>
            )}
          </div>

          {showFsEntryOverlayMount ? (
            <FsEntryOverlayMount setMountEl={setFsEntryOverlayMountEl} />
          ) : null}
        </FullscreenModal>
      )}
    </>
  );
}

export default FullscreenRuntime;