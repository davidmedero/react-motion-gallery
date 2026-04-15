/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { getFsMediaViewportEl, getPrimaryImgEl } from '../core/dom';

type Point = { x: number; y: number };

type RefDiv = React.RefObject<HTMLDivElement | null>;

export type UseGlobalPinchZoomArgs = {
  scaleRef: React.RefObject<number>;
  zoomCtx: any;
  zoomTo: (
    zoomCtx: any,
    args: {
      destZoomLevel: number;
      centerPoint: Point;
      imageRef: RefDiv;
    }
  ) => void;
  isZoomed: boolean;
  currentImage: React.RefObject<HTMLDivElement | null>;
  imageRefs: React.RefObject<Array<RefDiv | null>>;
  fullscreenSliderApi: React.RefObject<{ centerSlider: () => void } | null>;
  rebuildPanBodies: () => void;
  baseFitSize: (
    img: HTMLImageElement,
    containerW: number,
    containerH: number
  ) => { baseW: number; baseH: number };
  boundsForCurrent: (
    scale: number,
    baseW: number,
    baseH: number,
    containerW: number,
    containerH: number
  ) => {
    x: { constrain: (n: number) => number };
    y: { constrain: (n: number) => number };
    povX: any;
    povY: any;
  };
  ScrollBounds: (
    lim: any,
    off: any,
    tgt: any,
    body: any,
    pov: any,
    duration: number
  ) => any;
  boundsX: React.RefObject<any>;
  boundsY: React.RefObject<any>;
  offX: React.RefObject<any>;
  offY: React.RefObject<any>;
  tgtX: React.RefObject<any>;
  tgtY: React.RefObject<any>;
  bodyX: React.RefObject<any>;
  bodyY: React.RefObject<any>;
  animRef: React.RefObject<{ start: () => void } | null>;
  panDuration: number;
  findImgAtPoint: (doc: Document, x: number, y: number) => HTMLImageElement | null;
  readDataIndex: (el: HTMLElement | null) => number | null;
  distance: (t0: Touch, t1: Touch) => number;
  midpoint: (t0: Touch, t1: Touch) => Point;
};

function isPinchGesture(e: WheelEvent): boolean {
  if (e.ctrlKey) return true;

  const absX = Math.abs(e.deltaX);
  const absY = Math.abs(e.deltaY);
  if (absX < 1 && absY < 1) return false;

  const ratio = absX / absY;
  return ratio >= 0.8 && ratio <= 1.2;
}

export function useGlobalPinchZoom(args: UseGlobalPinchZoomArgs) {
  const {
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
    panDuration,
    findImgAtPoint,
    readDataIndex,
    distance,
    midpoint,
  } = args;

  const isPinching = React.useRef(false);
  const isTouchPinching = React.useRef(false);
  const pinchJustEnded = React.useRef(false);

  const startDist = React.useRef(0);
  const startScale = React.useRef(1);

  const handlePinchWheel = React.useCallback(
    (e: WheelEvent, imageRef: RefDiv) => {
      if (!imageRef.current) return;
      if (!e.ctrlKey) return;
      e.preventDefault();

      fullscreenSliderApi.current?.centerSlider();

      if (scaleRef.current > 1.01) {
        isPinching.current = true;
      }

      const { ctrlKey, deltaMode } = e;
      let { deltaY } = e;

      if (deltaMode === 1) {
        deltaY *= 15;
      }

      const divisor = ctrlKey ? 100 : 300;
      const scaleDiff = 1 - deltaY / divisor;
      const destZoomLevel = scaleRef.current * scaleDiff;

      zoomTo(zoomCtx, {
        destZoomLevel,
        centerPoint: { x: e.clientX, y: e.clientY },
        imageRef,
      });
    },
    [fullscreenSliderApi, scaleRef, zoomTo, zoomCtx]
  );

  const handleWheelPan = React.useCallback(
    (e: WheelEvent) => {
      if (!isZoomed) return;
      if (isPinchGesture(e)) return;
      if (e.ctrlKey) return;
      if (!currentImage.current) return;

      e.preventDefault();

      rebuildPanBodies();

      const container = currentImage.current as HTMLDivElement;
      const rect =
        getFsMediaViewportEl(container)?.getBoundingClientRect() ??
        container.getBoundingClientRect();
      const containerW = rect.width;
      const containerH = rect.height;
      const imgEl = getPrimaryImgEl(container);
      if (!imgEl) return;

      const { baseW, baseH } = baseFitSize(imgEl, containerW, containerH);

      const { x: limX, y: limY, povX, povY } = boundsForCurrent(
        scaleRef.current,
        baseW,
        baseH,
        containerW,
        containerH
      );

      boundsX.current = ScrollBounds(
        limX,
        offX.current!,
        tgtX.current!,
        bodyX.current!,
        povX,
        panDuration
      );
      boundsY.current = ScrollBounds(
        limY,
        offY.current!,
        tgtY.current!,
        bodyY.current!,
        povY,
        panDuration
      );

      let tx = (offX.current?.get() ?? 0) - e.deltaX;
      let ty = (offY.current?.get() ?? 0) - e.deltaY;

      tx = limX.constrain(tx);
      ty = limY.constrain(ty);

      tgtX.current?.set(tx);
      tgtY.current?.set(ty);

      bodyX.current?.useDuration(0).useFriction(1);
      bodyY.current?.useDuration(0).useFriction(1);

      animRef.current?.start();
    },
    [
      isZoomed,
      currentImage,
      rebuildPanBodies,
      baseFitSize,
      boundsForCurrent,
      scaleRef,
      boundsX,
      boundsY,
      ScrollBounds,
      offX,
      offY,
      tgtX,
      tgtY,
      bodyX,
      bodyY,
      animRef,
      panDuration,
    ]
  );

  React.useEffect(() => {
    window.addEventListener('wheel', handleWheelPan as any, { passive: false } as any);
    return () => window.removeEventListener('wheel', handleWheelPan as any);
  }, [handleWheelPan]);

  React.useLayoutEffect(() => {
    function pinchWheelHandler(e: WheelEvent) {
      const img = findImgAtPoint(document, e.clientX, e.clientY);
      if (!img) return;

      const idx = readDataIndex(img);
      if (idx == null) return;

      const matchedRef = imageRefs.current[idx];
      if (!matchedRef) return;

      currentImage.current = matchedRef.current;
      handlePinchWheel(e, matchedRef);
    }

    window.addEventListener('wheel', pinchWheelHandler, { passive: false });
    return () => window.removeEventListener('wheel', pinchWheelHandler);
  }, [findImgAtPoint, readDataIndex, imageRefs, currentImage, handlePinchWheel]);

  const onTouchStart = React.useCallback(
    (e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      e.preventDefault();

      fullscreenSliderApi.current?.centerSlider();

      isTouchPinching.current = true;
      const [t0, t1] = [e.touches[0], e.touches[1]];
      startDist.current = distance(t0, t1);
      startScale.current = scaleRef.current;
    },
    [distance, fullscreenSliderApi, scaleRef]
  );

  const onTouchMove = React.useCallback(
    (e: TouchEvent, imageRef: RefDiv) => {
      if (!isTouchPinching.current || e.touches.length !== 2) return;
      e.preventDefault();

      const [t0, t1] = [e.touches[0], e.touches[1]];
      const currDist = distance(t0, t1);
      const factor = currDist / startDist.current;
      const destZoomLevel = startScale.current * factor;

      const center = midpoint(t0, t1);
      zoomTo(zoomCtx, { destZoomLevel, centerPoint: center, imageRef });
    },
    [distance, midpoint, zoomTo, zoomCtx]
  );

  const endPinch = React.useCallback(() => {
    if (!isTouchPinching.current) return;
    isTouchPinching.current = false;
    pinchJustEnded.current = true;
  }, []);

  React.useLayoutEffect(() => {
    function touchPinchMoveHandler(e: TouchEvent) {
      if (e.touches.length < 2) return;

      const mid = midpoint(e.touches[0], e.touches[1]);
      const img = findImgAtPoint(document, mid.x, mid.y);
      if (!img) return;

      const idx = readDataIndex(img);
      if (idx == null) return;

      const matchedRef = imageRefs.current[idx];
      if (!matchedRef) return;

      currentImage.current = matchedRef.current;
      onTouchMove(e, matchedRef);
    }

    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', touchPinchMoveHandler, { passive: false });
    window.addEventListener('touchend', endPinch);
    window.addEventListener('touchcancel', endPinch);

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', touchPinchMoveHandler);
      window.removeEventListener('touchend', endPinch);
      window.removeEventListener('touchcancel', endPinch);
    };
  }, [
    onTouchStart,
    onTouchMove,
    endPinch,
    midpoint,
    findImgAtPoint,
    readDataIndex,
    imageRefs,
    currentImage,
  ]);

  return {
    isPinching,
    isTouchPinching
  };
}
