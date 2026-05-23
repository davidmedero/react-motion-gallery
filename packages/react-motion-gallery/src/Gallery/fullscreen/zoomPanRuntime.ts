"use client";

import * as React from "react";
import { useFullscreenCaptionZoomMotion } from "./captionZoomMotion";
import { handleZoomToggle } from "../zoomPan/zoom/handleZoomToggle";
import { usePanRuntime } from "../zoomPan/pan";
import { rebuildPanBodiesFn } from "../zoomPan/core/rebuildPanBodies";
import { ScrollBounds } from "../shared/motion/scrollBounds";
import { ScrollBody } from "../shared/motion/scrollBody";
import { Vector1D } from "../shared/motion/vector1d";
import { PanAxis as Axis } from "../shared/types/axis";
import { boundsForCurrent as boundsForCurrentFn } from "../zoomPan/core/boundsForCurrent";
import { useGlobalPinchZoom } from "../zoomPan/zoom/useGlobalPinchZoom";
import { forceResetZoom as forceResetZoomFn } from "../zoomPan/zoom/forceResetZoom";
import { resetZoomForSlideChange as resetZoomForSlideChangeFn } from "../zoomPan/zoom/resetZoomForSlideChange";
import { resetPanForScale1 as resetPanForScale1Fn } from "../zoomPan/pan/resetPanForScale1";
import { baseFitSize, distance, midpoint } from "../zoomPan/core/utils";
import { zoomTo } from "../zoomPan/zoom/zoomTo";
import {
  isZoomPanHoverPointer,
  resolveZoomPanHoverOptions,
  zoomPanHoverEnter,
  zoomPanHoverLeave,
  zoomPanHoverMove,
} from "../zoomPan/hover/runtime";
import {
  findImgAtPoint,
  getFullscreenTwinImages,
  readDataIndex,
} from "../zoomPan/core/dom";
import {
  effectiveViewportHeight,
  effectiveViewportWidth,
  resolveLengthFromResponsive,
} from "../shared/responsive";

export function useFullscreenZoomPanRuntime(args: any) {
  const {
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
  } = args;
  const hoverActiveRef = React.useRef(false);
  const hoverPointerIdRef = React.useRef<number | null>(null);
  const hoverImageRef = React.useRef<React.RefObject<HTMLDivElement | null> | null>(
    null
  );
  const resetHoverState = React.useCallback(() => {
    hoverActiveRef.current = false;
    hoverPointerIdRef.current = null;
    hoverImageRef.current = null;
  }, []);
  const hoverOptions = React.useMemo(
    () => resolveZoomPanHoverOptions(fs.zoom),
    [fs.zoom]
  );

  const boundsForCurrent = React.useCallback(
    (
      scaleNum: number,
      imgW: number,
      imgH: number,
      viewW?: number,
      viewH?: number,
      options?: { ignoreReserved?: boolean }
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
        (effectivePlacement === "left"
          ? isSlideCaption
            ? resolvedCaptionWidth ?? 280
            : resolvedCaptionWidth ?? 0
          : 0) +
        (effectiveEntryOverlayPlacement === "left"
          ? resolvedEntryOverlayWidth ?? 0
          : 0);

      const reservedRight =
        (effectivePlacement === "right"
          ? isSlideCaption
            ? resolvedCaptionWidth ?? 280
            : resolvedCaptionWidth ?? 0
          : 0) +
        (effectiveEntryOverlayPlacement === "right"
          ? resolvedEntryOverlayWidth ?? 0
          : 0);

      const reservedTop =
        (effectivePlacement === "top"
          ? isSlideCaption
            ? resolvedCaptionHeight ?? 200
            : resolvedCaptionHeight ?? 0
          : 0) +
        (effectiveEntryOverlayPlacement === "top"
          ? resolvedEntryOverlayHeight ?? 0
          : 0);

      const reservedBottom =
        (effectivePlacement === "bottom"
          ? isSlideCaption
            ? resolvedCaptionHeight ?? 200
            : resolvedCaptionHeight ?? 0
          : 0) +
        (effectiveEntryOverlayPlacement === "bottom"
          ? resolvedEntryOverlayHeight ?? 0
          : 0);

      const includeReserved = !options?.ignoreReserved;

      return boundsForCurrentFn({
        scale: scaleNum,
        imgW,
        imgH,
        currentImageEl: currentImage.current,
        viewW,
        viewH,
        reservedLeft: includeReserved ? reservedLeft : 0,
        reservedRight: includeReserved ? reservedRight : 0,
        reservedTop: includeReserved ? reservedTop : 0,
        reservedBottom: includeReserved ? reservedBottom : 0,
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
  }, [axisRef]);

  const renderPan = React.useCallback(
    (xPx: number, yPx: number) => {
      if (changingSlides.current) return;
      if (!currentImage.current) return;

      const twinImages = getFullscreenTwinImages(currentImage.current);
      if (!twinImages.length) return;

      const transform = `translate3d(${xPx}px, ${yPx}px, 0) scale(${scaleRef.current})`;
      twinImages.forEach((img) => {
        if (img.style.transition) img.style.transition = "";
        img.style.transform = transform;
      });
    },
    [changingSlides, currentImage, scaleRef]
  );

  const stopPanMotionForSlideReset = React.useCallback(() => {
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
  }, [animRef, bodyX, bodyY, locX, locY, offX, offY, prevX, prevY, tgtX, tgtY]);

  const prepareZoomToggleReset = React.useCallback(() => {
    animRef.current?.stop();
    changingSlides.current = false;
    suppressLoopRef.current = false;

    bodyX.current?.resetVelocity();
    bodyX.current?.useBaseDuration();
    bodyX.current?.useBaseFriction();
    bodyX.current?.sync();

    bodyY.current?.resetVelocity();
    bodyY.current?.useBaseDuration();
    bodyY.current?.useBaseFriction();
    bodyY.current?.sync();
  }, [animRef, bodyX, bodyY, changingSlides, suppressLoopRef]);

  const resetPanForScale1 = React.useCallback(() => {
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
      panDuration: fs.zoom?.panDuration,
      panFriction: fs.zoom?.panFriction,
      animRef,
    });
  }, [
    animRef,
    bodyX,
    bodyY,
    boundsForCurrent,
    boundsX,
    boundsY,
    currentImage,
    fs.zoom?.panDuration,
    fs.zoom?.panFriction,
    locX,
    locY,
    offX,
    offY,
    prevX,
    prevY,
    tgtX,
    tgtY,
  ]);

  const resetZoomForSlideChange = React.useCallback(
    (resetArgs?: { disableImageTransition?: boolean }) => {
      resetHoverState();
      const disableImageTransition = !!resetArgs?.disableImageTransition;

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
    },
    [
      changingSlides,
      imageRefs,
      panRef,
      previousZoom,
      resetHoverState,
      resetPanForScale1,
      scaleRef,
      setScale,
      stopPanMotionForSlideReset,
      suppressLoopRef,
    ]
  );

  const resetZoomForSlideNavigation = React.useCallback(() => {
    resetZoomForSlideChange({
      disableImageTransition: !!fs.effects?.crossfade?.drag,
    });
  }, [fs.effects?.crossfade?.drag, resetZoomForSlideChange]);

  const onForceResetZoom = React.useCallback(() => {
    resetHoverState();
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
  }, [
    imageRefs,
    panRef,
    previousZoom,
    resetHoverState,
    resetPanForScale1,
    scaleRef,
    setScale,
  ]);

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
      resetAllZoomDom: prepareZoomToggleReset,
    }),
    [
      animRef,
      bodyX,
      bodyY,
      boundsForCurrent,
      boundsX,
      boundsY,
      currentImage,
      fs,
      locX,
      locY,
      offX,
      offY,
      panRef,
      prevX,
      prevY,
      previousZoom,
      prepareZoomToggleReset,
      renderPan,
      scaleRef,
      setScale,
      suppressLoopRef,
      tgtX,
      tgtY,
    ]
  );

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
  }, [boundsForCurrent, bodyX, bodyY, boundsX, boundsY, currentImage, fs, locX, locY, offX, offY, prevX, prevY, scaleRef, tgtX, tgtY]);

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
    panDuration: fs.zoom?.panDuration,
    findImgAtPoint,
    readDataIndex,
    distance,
    midpoint,
  });

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

  const captionZoomMotion = useFullscreenCaptionZoomMotion({
    caption: fs.caption,
    isZoomed,
  });

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

  const handleHoverPointerEnter = React.useCallback(
    (
      event: React.PointerEvent<HTMLDivElement>,
      imageRef: React.RefObject<HTMLDivElement | null>
    ) => {
      if (!hoverOptions || !isZoomPanHoverPointer(event)) return false;
      if (scaleRef.current > 1.01) return false;

      const activated = zoomPanHoverEnter(zoomCtx as any, {
        imageRef: imageRef as React.RefObject<HTMLElement | null>,
        clientX: event.clientX,
        clientY: event.clientY,
        hover: hoverOptions,
      });

      if (!activated) return false;

      hoverActiveRef.current = true;
      hoverPointerIdRef.current = event.pointerId ?? null;
      hoverImageRef.current = imageRef;
      return true;
    },
    [hoverOptions, scaleRef, zoomCtx]
  );

  const handleHoverPointerMove = React.useCallback(
    (
      event: React.PointerEvent<HTMLDivElement>,
      imageRef: React.RefObject<HTMLDivElement | null>
    ) => {
      if (!hoverOptions) return false;
      if (!isZoomPanHoverPointer(event)) return false;

      if (!hoverActiveRef.current) {
        if (scaleRef.current > 1.01) return false;

        const activated = zoomPanHoverEnter(zoomCtx as any, {
          imageRef: imageRef as React.RefObject<HTMLElement | null>,
          clientX: event.clientX,
          clientY: event.clientY,
          hover: hoverOptions,
        });

        if (!activated) return false;

        hoverActiveRef.current = true;
        hoverPointerIdRef.current = event.pointerId ?? null;
        hoverImageRef.current = imageRef;
        return true;
      }

      if (
        hoverPointerIdRef.current != null &&
        event.pointerId !== hoverPointerIdRef.current
      ) {
        return false;
      }

      return zoomPanHoverMove(zoomCtx as any, {
        imageRef: imageRef as React.RefObject<HTMLElement | null>,
        clientX: event.clientX,
        clientY: event.clientY,
      });
    },
    [hoverOptions, zoomCtx]
  );

  const handleHoverPointerLeave = React.useCallback(
    (
      event: React.PointerEvent<HTMLDivElement>,
      imageRef: React.RefObject<HTMLDivElement | null>
    ) => {
      if (!hoverOptions || !hoverActiveRef.current) return false;
      if (!isZoomPanHoverPointer(event)) return false;
      if (
        hoverPointerIdRef.current != null &&
        event.pointerId !== hoverPointerIdRef.current
      ) {
        return false;
      }

      resetHoverState();
      return zoomPanHoverLeave(zoomCtx as any, {
        imageRef: imageRef as React.RefObject<HTMLElement | null>,
        durationMs: hoverOptions.zoomOutDurationMs,
      });
    },
    [hoverOptions, resetHoverState, zoomCtx]
  );

  React.useEffect(() => {
    if (!hoverOptions) return;

    function handleWindowPointerMove(event: PointerEvent) {
      if (!isZoomPanHoverPointer(event)) return;

      const img = findImgAtPoint(document, event.clientX, event.clientY);
      const idx = readDataIndex(img);
      const imageRef = idx == null ? null : imageRefs.current[idx];

      if (imageRef?.current) {
        hoverImageRef.current = imageRef;
        handleHoverPointerMove(event as any, imageRef);
        return;
      }

      if (!hoverActiveRef.current) return;

      const currentHoverImageRef = hoverImageRef.current;
      if (!currentHoverImageRef?.current) {
        resetHoverState();
        return;
      }

      handleHoverPointerLeave(event as any, currentHoverImageRef);
    }

    window.addEventListener("pointermove", handleWindowPointerMove, {
      passive: true,
    });

    return () => {
      window.removeEventListener("pointermove", handleWindowPointerMove);
    };
  }, [
    handleHoverPointerLeave,
    handleHoverPointerMove,
    hoverOptions,
    imageRefs,
    resetHoverState,
  ]);

  const handlePanPointerStart = React.useCallback(
    (
      event: React.PointerEvent<HTMLDivElement>,
      imageRef: React.RefObject<HTMLDivElement | null>
    ) => {
      if (hoverActiveRef.current && isZoomPanHoverPointer(event)) {
        suppressNextClickRef.current = true;
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      pan.handlePanPointerStart(event, imageRef);
    },
    [pan, suppressNextClickRef]
  );

  const handleRuntimeZoomToggle = React.useCallback(
    (
      event: React.PointerEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
      imageRef: React.RefObject<HTMLDivElement | null>
    ) => {
      if (hoverActiveRef.current && isZoomPanHoverPointer(event as any)) {
        suppressNextClickRef.current = true;
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      handleZoomToggle(zoomCtx as any, event as any, imageRef as any);
    },
    [suppressNextClickRef, zoomCtx]
  );

  React.useEffect(() => {
    if (animRef.current) {
      resetHoverState();
      animRef.current.stop();
      setScale(1);
      previousZoom.current.x = 0;
      previousZoom.current.y = 0;
      panRef.current = { x: 0, y: 0 };
      scaleRef.current = 1;
    }
  }, [
    animRef,
    closingModal,
    panRef,
    previousZoom,
    resetHoverState,
    scaleRef,
    setScale,
  ]);

  return {
    isPinching,
    isTouchPinching,
    entryOverlayZoomMotion,
    captionZoomMotion,
    handlePanPointerStart,
    handleZoomToggle: handleRuntimeZoomToggle,
    resetAllZoomDom: resetZoomForSlideChange,
    resetForSlideNavigation: resetZoomForSlideNavigation,
    forceResetZoom: onForceResetZoom,
    handleHoverPointerEnter,
    handleHoverPointerMove,
    handleHoverPointerLeave,
  };
}
