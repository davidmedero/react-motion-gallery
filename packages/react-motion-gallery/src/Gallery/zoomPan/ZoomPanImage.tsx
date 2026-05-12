'use client';

import * as React from "react";

import { FullscreenAxis } from "../shared/types/axis";
import type { AnimationsType } from "../shared/motion/animations";
import { ScrollBounds } from "../shared/motion/scrollBounds";
import { ScrollBody } from "../shared/motion/scrollBody";
import { Vector1D } from "../shared/motion/vector1d";
import { useRmgSlide } from "../shared/slideContext";
import { boundsForCurrent as boundsForCurrentFn } from "./core/boundsForCurrent";
import { getPrimaryImgEl } from "./core/dom";
import { baseFitSize, distance, midpoint } from "./core/utils";
import { rebuildPanBodiesFn } from "./core/rebuildPanBodies";
import { DEFAULT_ZOOM_PAN } from "./defaults";
import { usePanRuntime } from "./pan";
import { resetPanForScale1 as resetPanForScale1Fn } from "./pan/resetPanForScale1";
import type { ZoomPanImageProps } from "./types";
import { forceResetZoom } from "./zoom/forceResetZoom";
import { handleZoomToggle } from "./zoom/handleZoomToggle";
import { zoomTo } from "./zoom/zoomTo";

type Point = { x: number; y: number };
type PreZoomPointerIntent = {
  active: boolean;
  pointerId: number | null;
  lastX: number;
  lastY: number;
  totalAbsDx: number;
  totalAbsDy: number;
};

type LayoutZoomPanSyncStore = {
  publishZoomIn: (sourceIndex: number) => void;
  subscribeZoomIn: (listener: (sourceIndex: number) => void) => () => void;
};

const PRE_ZOOM_CLICK_MOVE_TOL = 3;
const SLIDER_SCOPE_SELECTOR = "[data-rmg-slider-core-scope]";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function readScaleValue(scale: number) {
  return scale > 1.01;
}

function createLayoutZoomPanSyncStore(): LayoutZoomPanSyncStore {
  const zoomInSubs = new Set<(sourceIndex: number) => void>();

  return {
    publishZoomIn(sourceIndex) {
      zoomInSubs.forEach((listener) => listener(sourceIndex));
    },
    subscribeZoomIn(listener) {
      zoomInSubs.add(listener);
      return () => {
        zoomInSubs.delete(listener);
      };
    },
  };
}

export const ZoomPanImage = React.forwardRef<HTMLDivElement, ZoomPanImageProps>(
  function ZoomPanImage(props, forwardedRef) {
    const {
      className,
      style,
      imageClassName,
      imageStyle,
      zoom,
      disabled = false,
      onDragStart,
      src,
      ...imgProps
    } = props;

    const resolvedZoom = React.useMemo(
      () => ({ ...DEFAULT_ZOOM_PAN, ...(zoom ?? {}) }),
      [zoom]
    );

    const fs = React.useMemo(() => ({ zoom: resolvedZoom }), [resolvedZoom]);
    const slideCtx = useRmgSlide();

    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const imageRefs = React.useRef<React.RefObject<HTMLDivElement | null>[]>([]);
    imageRefs.current = [containerRef];

    const scaleRef = React.useRef(1);
    const panRef = React.useRef({ x: 0, y: 0 });
    const previousZoom = React.useRef({ x: 0, y: 0 });
    const suppressLoopRef = React.useRef(false);
    const suppressNextClickRef = React.useRef(false);
    const suppressPreZoomClickRef = React.useRef(false);
    const currentImage = React.useRef<HTMLElement | null>(null);
    const pointerDownRef = React.useRef(false);
    const interactionModeRef = React.useRef<"idle" | "drag" | "wheel" | "programmatic">("idle");
    const axisRef = React.useRef<ReturnType<typeof FullscreenAxis> | null>(null);
    const locX = React.useRef<ReturnType<typeof Vector1D> | null>(null);
    const locY = React.useRef<ReturnType<typeof Vector1D> | null>(null);
    const prevX = React.useRef<ReturnType<typeof Vector1D> | null>(null);
    const prevY = React.useRef<ReturnType<typeof Vector1D> | null>(null);
    const offX = React.useRef<ReturnType<typeof Vector1D> | null>(null);
    const offY = React.useRef<ReturnType<typeof Vector1D> | null>(null);
    const tgtX = React.useRef<ReturnType<typeof Vector1D> | null>(null);
    const tgtY = React.useRef<ReturnType<typeof Vector1D> | null>(null);
    const bodyX = React.useRef<ReturnType<typeof ScrollBody> | null>(null);
    const bodyY = React.useRef<ReturnType<typeof ScrollBody> | null>(null);
    const boundsX = React.useRef<ReturnType<typeof ScrollBounds> | null>(null);
    const boundsY = React.useRef<ReturnType<typeof ScrollBounds> | null>(null);
    const animRef = React.useRef<AnimationsType | null>(null);
    const touchPinchingRef = React.useRef(false);
    const startTouchDistanceRef = React.useRef(0);
    const startTouchScaleRef = React.useRef(1);
    const isInsideSliderRef = React.useRef(false);
    const preZoomPointerIntentRef = React.useRef<PreZoomPointerIntent>({
      active: false,
      pointerId: null,
      lastX: 0,
      lastY: 0,
      totalAbsDx: 0,
      totalAbsDy: 0,
    });

    const [scale, setScaleState] = React.useState(1);

    const setScale = React.useCallback((nextScale: number) => {
      scaleRef.current = nextScale;
      setScaleState(nextScale);
    }, []);

    const isZoomed = readScaleValue(scale);
    const layoutItemIndex = typeof slideCtx?.normIdx === "number" ? slideCtx.normIdx : null;
    const sliderIndexChannel = slideCtx?.indexChannel;
    const layoutZoomPanSyncStore = React.useMemo(() => {
      if (!slideCtx?.storeBag) return null;
      return slideCtx.storeBag.getOrCreate(
        "rmg-zoom-pan-layout-sync",
        createLayoutZoomPanSyncStore
      );
    }, [slideCtx?.storeBag]);
    const previousIsZoomedRef = React.useRef(false);

    const setContainerRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        containerRef.current = node;
        currentImage.current = node;

        if (!forwardedRef) return;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
          return;
        }

        forwardedRef.current = node;
      },
      [forwardedRef]
    );

    const boundsForCurrent = React.useCallback(
      (
        scaleNum: number,
        imgW: number,
        imgH: number,
        viewW?: number,
        viewH?: number
      ) =>
        boundsForCurrentFn({
          scale: scaleNum,
          imgW,
          imgH,
          currentImageEl: currentImage.current,
          viewW,
          viewH,
        }),
      []
    );

    const renderPan = React.useCallback((xPx: number, yPx: number) => {
      const container = currentImage.current;
      const img = getPrimaryImgEl(container);
      if (!img) return;

      if (img.style.transition) img.style.transition = "";
      img.style.transform = `translate3d(${xPx}px, ${yPx}px, 0) scale(${scaleRef.current})`;
    }, []);

    const rebuildPanBodies = React.useCallback(() => {
      currentImage.current = containerRef.current;

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
    }, [boundsForCurrent, fs]);

    const stopPanMotion = React.useCallback(() => {
      animRef.current?.stop();
      bodyX.current?.useDuration(0).useFriction(1).sync();
      bodyY.current?.useDuration(0).useFriction(1).sync();
    }, []);

    const resetPanForScale1 = React.useCallback(() => {
      currentImage.current = containerRef.current;

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
        panDuration: resolvedZoom.panDuration,
        panFriction: resolvedZoom.panFriction,
        animRef,
      });
    }, [boundsForCurrent, resolvedZoom.panDuration, resolvedZoom.panFriction]);

    const resetZoomToIdentity = React.useCallback(
      (transition = "transform 0.2s cubic-bezier(.4,0,.22,1)") => {
        currentImage.current = containerRef.current;
        stopPanMotion();

        forceResetZoom({
          setScale,
          zoomState: {
            previousZoom,
            panRef,
            scaleRef,
          },
          imageRefs,
          resetPan: resetPanForScale1,
          transition,
        });
      },
      [resetPanForScale1, setScale, stopPanMotion]
    );

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
        // Preserve the current transform so click-to-zoom-out can animate
        // back to identity instead of snapping there first.
        resetAllZoomDom: stopPanMotion,
      }),
      [boundsForCurrent, fs, renderPan, setScale, stopPanMotion]
    );

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

    React.useEffect(() => {
      axisRef.current = FullscreenAxis();
    }, []);

    React.useLayoutEffect(() => {
      currentImage.current = containerRef.current;
      isInsideSliderRef.current = !!containerRef.current?.closest(SLIDER_SCOPE_SELECTOR);
    });

    const resetPreZoomPointerIntent = React.useCallback(() => {
      preZoomPointerIntentRef.current = {
        active: false,
        pointerId: null,
        lastX: 0,
        lastY: 0,
        totalAbsDx: 0,
        totalAbsDy: 0,
      };
    }, []);

    const handlePreZoomPointerStart = React.useCallback(
      (event: React.PointerEvent<HTMLDivElement>) => {
        if (disabled || readScaleValue(scaleRef.current)) return;

        if (event.button !== undefined && event.button !== 0) return;

        suppressPreZoomClickRef.current = false;
        preZoomPointerIntentRef.current = {
          active: true,
          pointerId: event.pointerId,
          lastX: event.clientX,
          lastY: event.clientY,
          totalAbsDx: 0,
          totalAbsDy: 0,
        };
      },
      [disabled]
    );

    const handlePreZoomPointerMove = React.useCallback(
      (event: React.PointerEvent<HTMLDivElement>) => {
        if (disabled || readScaleValue(scaleRef.current)) return;

        const intent = preZoomPointerIntentRef.current;
        if (!intent.active || intent.pointerId !== event.pointerId) return;

        const dx = event.clientX - intent.lastX;
        const dy = event.clientY - intent.lastY;

        intent.lastX = event.clientX;
        intent.lastY = event.clientY;
        intent.totalAbsDx += Math.abs(dx);
        intent.totalAbsDy += Math.abs(dy);

        if (
          intent.totalAbsDx > PRE_ZOOM_CLICK_MOVE_TOL ||
          intent.totalAbsDy > PRE_ZOOM_CLICK_MOVE_TOL
        ) {
          suppressPreZoomClickRef.current = true;
        }
      },
      [disabled]
    );

    const handlePreZoomPointerEnd = React.useCallback(
      (event: React.PointerEvent<HTMLDivElement>) => {
        if (disabled || readScaleValue(scaleRef.current)) return;

        const intent = preZoomPointerIntentRef.current;
        if (!intent.active || intent.pointerId !== event.pointerId) return;
        resetPreZoomPointerIntent();
      },
      [disabled, resetPreZoomPointerIntent]
    );

    const handleRootClickCapture = React.useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        if (suppressNextClickRef.current || suppressPreZoomClickRef.current) {
          suppressNextClickRef.current = false;
          suppressPreZoomClickRef.current = false;
          event.preventDefault();
          event.stopPropagation();
        }
      },
      []
    );

    const handleRootClick = React.useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.defaultPrevented) return;
        if (disabled || isZoomed || touchPinchingRef.current) return;

        currentImage.current = containerRef.current;
        handleZoomToggle(zoomCtx as any, event as any, containerRef as any);
      },
      [disabled, isZoomed, zoomCtx]
    );

    const handleWheel = React.useCallback(
      (event: WheelEvent) => {
        if (disabled || !containerRef.current) return;
        currentImage.current = containerRef.current;

        if (event.ctrlKey) {
          if (event.cancelable) event.preventDefault();
          event.stopPropagation();

          let deltaY = event.deltaY;
          if (event.deltaMode === 1) {
            deltaY *= 15;
          }

          const destZoomLevel = scaleRef.current * (1 - deltaY / 100);
          zoomTo(zoomCtx, {
            destZoomLevel,
            centerPoint: { x: event.clientX, y: event.clientY },
            imageRef: containerRef as React.RefObject<HTMLDivElement | null>,
          });
          return;
        }

        if (!readScaleValue(scaleRef.current)) return;

        if (event.cancelable) event.preventDefault();
        event.stopPropagation();
        rebuildPanBodies();

        const imgEl = getPrimaryImgEl(containerRef.current);
        if (!imgEl) return;

        const rect = containerRef.current.getBoundingClientRect();
        const { baseW, baseH } = baseFitSize(imgEl, rect.width, rect.height);
        const { x: limX, y: limY, povX, povY } = boundsForCurrent(
          scaleRef.current,
          baseW,
          baseH,
          rect.width,
          rect.height
        );

        boundsX.current = ScrollBounds(
          limX,
          offX.current!,
          tgtX.current!,
          bodyX.current!,
          povX,
          resolvedZoom.panDuration
        );

        boundsY.current = ScrollBounds(
          limY,
          offY.current!,
          tgtY.current!,
          bodyY.current!,
          povY,
          resolvedZoom.panDuration
        );

        const nextX = limX.constrain((offX.current?.get() ?? 0) - event.deltaX);
        const nextY = limY.constrain((offY.current?.get() ?? 0) - event.deltaY);

        tgtX.current?.set(nextX);
        tgtY.current?.set(nextY);

        bodyX.current?.useDuration(0).useFriction(1);
        bodyY.current?.useDuration(0).useFriction(1);
        animRef.current?.start();
      },
      [boundsForCurrent, disabled, rebuildPanBodies, resolvedZoom.panDuration, zoomCtx]
    );

    React.useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      // React's delegated wheel listeners are not reliable for canceling
      // browser ctrl-wheel zoom, so bind a native passive:false listener.
      container.addEventListener("wheel", handleWheel, { passive: false });

      return () => {
        container.removeEventListener("wheel", handleWheel);
      };
    }, [handleWheel]);

    React.useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const stopSliderDragStart = (event: Event) => {
        if (disabled) return;
        if (!isInsideSliderRef.current) return;
        if (!readScaleValue(scaleRef.current)) return;

        event.stopPropagation();
      };

      container.addEventListener("mousedown", stopSliderDragStart, { capture: true });
      container.addEventListener("touchstart", stopSliderDragStart, {
        capture: true,
        passive: false,
      });

      return () => {
        container.removeEventListener("mousedown", stopSliderDragStart, true);
        container.removeEventListener("touchstart", stopSliderDragStart, true);
      };
    }, [disabled]);

    const handleTouchStart = React.useCallback(
      (event: React.TouchEvent<HTMLDivElement>) => {
        if (disabled || event.touches.length !== 2) return;
        event.preventDefault();
        resetPreZoomPointerIntent();
        suppressPreZoomClickRef.current = false;

        touchPinchingRef.current = true;
        startTouchDistanceRef.current = distance(
          event.touches[0] as unknown as Touch,
          event.touches[1] as unknown as Touch
        );
        startTouchScaleRef.current = scaleRef.current;
      },
      [disabled, resetPreZoomPointerIntent]
    );

    const handleTouchMove = React.useCallback(
      (event: React.TouchEvent<HTMLDivElement>) => {
        if (disabled || !touchPinchingRef.current || event.touches.length !== 2) return;
        if (!containerRef.current) return;

        event.preventDefault();
        currentImage.current = containerRef.current;

        const destZoomLevel =
          startTouchScaleRef.current *
          (distance(
            event.touches[0] as unknown as Touch,
            event.touches[1] as unknown as Touch
          ) / startTouchDistanceRef.current);

        const centerPoint: Point = midpoint(
          event.touches[0] as unknown as Touch,
          event.touches[1] as unknown as Touch
        );
        zoomTo(zoomCtx, {
          destZoomLevel,
          centerPoint,
          imageRef: containerRef as React.RefObject<HTMLDivElement | null>,
        });
      },
      [disabled, zoomCtx]
    );

    const endTouchPinch = React.useCallback(() => {
      touchPinchingRef.current = false;
    }, []);

    React.useEffect(() => {
      if (!disabled) return;
      if (!readScaleValue(scaleRef.current)) return;

      resetZoomToIdentity();
    }, [disabled, resetZoomToIdentity]);

    React.useEffect(() => {
      if (!sliderIndexChannel) return;

      return sliderIndexChannel.onBasePointerDown(() => {
        if (!readScaleValue(scaleRef.current)) return;
        resetZoomToIdentity();
      });
    }, [resetZoomToIdentity, sliderIndexChannel]);

    React.useEffect(() => {
      if (!layoutZoomPanSyncStore) return;
      if (layoutItemIndex == null) return;

      return layoutZoomPanSyncStore.subscribeZoomIn((sourceIndex) => {
        if (sourceIndex === layoutItemIndex) return;
        if (!readScaleValue(scaleRef.current)) return;
        resetZoomToIdentity();
      });
    }, [layoutItemIndex, layoutZoomPanSyncStore, resetZoomToIdentity]);

    React.useEffect(() => {
      const wasZoomed = previousIsZoomedRef.current;
      previousIsZoomedRef.current = isZoomed;

      if (wasZoomed || !isZoomed) return;
      if (layoutItemIndex == null) return;

      layoutZoomPanSyncStore?.publishZoomIn(layoutItemIndex);

      const currentSliderIndex = sliderIndexChannel?.get().index;
      if (currentSliderIndex == null || currentSliderIndex === layoutItemIndex) return;

      sliderIndexChannel?.set(layoutItemIndex, "animated", {
        meta: { source: "external" },
      });
    }, [isZoomed, layoutItemIndex, layoutZoomPanSyncStore, sliderIndexChannel]);

    const previousSrcRef = React.useRef(src);
    React.useEffect(() => {
      if (previousSrcRef.current === src) return;
      previousSrcRef.current = src;
      resetZoomToIdentity("none");
    }, [resetZoomToIdentity, src]);

    React.useEffect(() => {
      return () => {
        const container = containerRef.current;
        const img = getPrimaryImgEl(container);
        if (img) {
          img.style.transition = "";
          img.style.transform = "translate(0, 0) scale(1)";
        }
        scaleRef.current = 1;
      };
    }, []);

    const handleImageDragStart = React.useCallback(
      (event: React.DragEvent<HTMLImageElement>) => {
        event.preventDefault();
        onDragStart?.(event);
      },
      [onDragStart]
    );

    return (
      <div
        ref={setContainerRef}
        className={className}
        data-rmg-zoom-pan-root="true"
        data-rmg-fs-media="true"
        data-rmg-fs-media-viewport="true"
        onClickCapture={handleRootClickCapture}
        onClick={handleRootClick}
        onPointerDown={(event) => {
          handlePreZoomPointerStart(event);
          if (disabled) return;
          pan.handlePanPointerStart(event, containerRef);
        }}
        onPointerMove={handlePreZoomPointerMove}
        onPointerUp={handlePreZoomPointerEnd}
        onPointerCancel={handlePreZoomPointerEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={endTouchPinch}
        onTouchCancel={endTouchPinch}
        style={{
          position: "relative",
          overflow: "hidden",
          minWidth: 0,
          minHeight: 0,
          touchAction: disabled ? "auto" : "none",
          ...style,
        }}
      >
        <div
          data-rmg-zoom-pan-stage="true"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            minHeight: "100%",
            minWidth: 0,
          }}
        >
          <img
            {...imgProps}
            ref={(node) => {
              if (node && !node.style.transform) {
                node.style.transform = "translate(0, 0) scale(1)";
              }
            }}
            src={src}
            className={cx(imageClassName)}
            data-rmg-zoom-pan-image="true"
            draggable={false}
            onDragStart={handleImageDragStart}
            style={{
              display: "block",
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              transformOrigin: "0 0",
              transform: "translate(0, 0) scale(1)",
              touchAction: "manipulation",
              userSelect: "none",
              cursor: disabled ? "default" : isZoomed ? "grab" : "zoom-in",
              ...imageStyle,
            }}
          />
        </div>
      </div>
    );
  }
);

export default ZoomPanImage;
