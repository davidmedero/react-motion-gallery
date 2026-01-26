import * as React from "react";
import { EventStore } from "../../shared/motion/eventStore";
import { createDragTracker } from "../../shared/input/dragTracker";
import type { PanRuntimeDeps, WindowType, ImageRef } from "./types";

function Axis() {
  return {
    scroll: "x" as const,
    cross: "y" as const,
    direction(n: number) { return n; },
    measureSize(rect: DOMRect) { return rect.width; },
  };
}

type PointerEventType = TouchEvent | MouseEvent;
function isMouseEvent(evt: PointerEventType, ownerWindow: WindowType): evt is MouseEvent {
  return typeof ownerWindow.MouseEvent !== "undefined" && evt instanceof ownerWindow.MouseEvent;
}

function DragTracker(axis: any, ownerWindow: WindowType) {
  return createDragTracker({ ownerWindow, axis });
}

export function usePanDrag(d: PanRuntimeDeps) {
  const freeBoost = React.useMemo(() => ({ mouse: 400, touch: 400 }), []);
  const trackerRef = React.useRef<ReturnType<typeof DragTracker> | null>(null);

  const dragStore = React.useRef(EventStore()).current;
  const moveStore = React.useRef(EventStore()).current;

  const forceBoost = React.useCallback(
    (rawForce: number, isMouse: boolean) => rawForce * (isMouse ? freeBoost.mouse : freeBoost.touch),
    [freeBoost]
  );

  let injected = false;

  function ensurePanCursorStyle() {
    if (injected) return;
    injected = true;

    const style = document.createElement("style");
    style.setAttribute("data-rmg-pan-cursor", "true");
    style.textContent = `
      html.rmg-pan-grabbing,
      html.rmg-pan-grabbing * {
        cursor: grabbing !important;
        user-select: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  React.useEffect(() => {
    ensurePanCursorStyle();
  }, []);

  const setGrabbing = React.useCallback((on: boolean) => {
    const root = document.documentElement;
    if (on) root.classList.add("rmg-pan-grabbing");
    else root.classList.remove("rmg-pan-grabbing");
  }, []);

  const handlePanPointerStart = React.useCallback(
    (
      e: React.PointerEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
      imageRef: ImageRef
    ) => {
      if (!d.isZoomed) return;
      if (!imageRef.current) return;

      d.currentImage.current = imageRef.current as any;
      d.getImageAspectRatio(imageRef.current as any);

      d.rebuildPanBodies();

      const ownerWin = window as WindowType;
      const axis = d.axisRef.current || Axis();
      trackerRef.current = DragTracker(axis, ownerWin);

      const mouse = (e as any).button !== undefined;
      const isPrimaryMouse = mouse ? (e as React.PointerEvent).button === 0 : false;
      if (mouse && !isPrimaryMouse) return;

      d.pointerDownRef.current = true;
      d.interactionModeRef.current = "drag";
      setGrabbing(true);

      const endDrag = () => {
        d.pointerDownRef.current = false;
        d.interactionModeRef.current = "idle";
        moveStore.clear();
        setGrabbing(false);
      };

      d.tgtX.current?.set(d.locX.current?.get?.() ?? 0);
      d.tgtY.current?.set(d.locY.current?.get?.() ?? 0);

      const CLICK_MOVE_TOL = 3;
      const CLICK_TIME_TOL_MS = 220;
      const FLICK_FORCE_TOL = 0.075;

      let totalAbsDx = 0;
      let totalAbsDy = 0;
      let canceledByMultiTouch = false;

      const downTs = performance.now();
      const downNativeEvt = e.nativeEvent as any;

      trackerRef.current.pointerDown(downNativeEvt);

      const onMove = (evt: PointerEvent | TouchEvent) => {
        if (!isMouseEvent(evt as any, window as any) && (evt as TouchEvent).touches?.length >= 2) {
          canceledByMultiTouch = true;
          endDrag();
          return onUp(evt as any);
        }

        const moved = trackerRef.current!.pointerMove(evt as any);
        totalAbsDx += Math.abs(moved.dx);
        totalAbsDy += Math.abs(moved.dy);

        d.bodyX.current?.useFriction(0.3).useDuration(0.75);
        d.bodyY.current?.useFriction(0.3).useDuration(0.75);

        d.tgtX.current?.add(moved.dx);
        d.tgtY.current?.add(moved.dy);

        d.animRef.current?.start();
        if ("cancelable" in evt && (evt as any).cancelable) (evt as any).preventDefault?.();
      };

      const onUp = (evt: PointerEvent | TouchEvent) => {
        const flick = trackerRef.current!.pointerUp(evt as any);
        const isMouse = isMouseEvent(evt as any, window as any);

        const durMs = performance.now() - downTs;
        const tinyTravel = totalAbsDx <= CLICK_MOVE_TOL && totalAbsDy <= CLICK_MOVE_TOL;
        const tinyFlick = Math.abs(flick.fx) <= FLICK_FORCE_TOL && Math.abs(flick.fy) <= FLICK_FORCE_TOL;
        const isClick = !canceledByMultiTouch && tinyTravel && tinyFlick && durMs <= CLICK_TIME_TOL_MS;

        d.pointerDownRef.current = false;
        d.interactionModeRef.current = "idle";
        moveStore.clear();
        endDrag();

        if (isClick) {
          const current = d.currentImage.current as any;
          const imgEl =
            (current?.querySelector?.("img") ?? current?.children?.[0]) as HTMLImageElement | null;

          if (imgEl) {
            const upAny = evt as any;
            const cx =
              upAny?.touches?.[0]?.clientX ??
              upAny?.changedTouches?.[0]?.clientX ??
              upAny?.clientX ??
              downNativeEvt?.clientX;

            const cy =
              upAny?.touches?.[0]?.clientY ??
              upAny?.changedTouches?.[0]?.clientY ??
              upAny?.clientY ??
              downNativeEvt?.clientY;

            const fakeReactEvt = {
              target: imgEl,
              currentTarget: imgEl,
              clientX: cx,
              clientY: cy,
              nativeEvent: upAny ?? downNativeEvt,
            } as unknown as React.PointerEvent<HTMLImageElement>;

            d.handleZoomToggle(d.zoomCtx as any, fakeReactEvt as any, d.currentImage as any);

            d.suppressNextClickRef.current = true;
            const anyEvt: any = evt;
            anyEvt?.preventDefault?.();
            anyEvt?.stopPropagation?.();
            d.animRef.current?.stop();
            return;
          }

          d.animRef.current?.stop();
          return;
        }

        const fx = forceBoost(flick.fx, isMouse);
        const fy = forceBoost(flick.fy, isMouse);

        const factorX = Math.min(
          1,
          Math.abs(flick.fx) > 0
            ? Math.abs((Math.abs(fx) - Math.abs(flick.fx)) / (flick.fx || 1))
            : 0
        );
        const factorY = Math.min(
          1,
          Math.abs(flick.fy) > 0
            ? Math.abs((Math.abs(fy) - Math.abs(flick.fy)) / (flick.fy || 1))
            : 0
        );

        const speedX = d.fs.zoom.panDuration - 10 * factorX;
        const speedY = d.fs.zoom.panDuration - 10 * factorY;
        const frictionX = d.fs.zoom.panFriction + factorX / 50;
        const frictionY = d.fs.zoom.panFriction + factorY / 50;

        d.bodyX.current?.useDuration(speedX).useFriction(frictionX);
        d.bodyY.current?.useDuration(speedY).useFriction(frictionY);

        d.tgtX.current?.add(fx);
        d.tgtY.current?.add(fy);

        d.animRef.current?.start();
      };

      const isMouseDown = (e as any).nativeEvent instanceof MouseEvent;
      const node: any = isMouseDown ? document : window;

      moveStore
        .add(node, "touchmove", onMove as any, { passive: false })
        .add(node, "touchend", onUp as any)
        .add(node, "mousemove", onMove as any, { passive: false })
        .add(node, "mouseup", onUp as any);

      dragStore
        .add(window, "touchcancel", onUp as any)
        .add(window, "contextmenu", onUp as any);
    },
    [d, dragStore, moveStore, forceBoost, setGrabbing]
  );

  React.useEffect(() => {
    return () => {
      moveStore.clear();
      dragStore.clear();
      document.documentElement.classList.remove("rmg-pan-grabbing");
    };
  }, [moveStore, dragStore]);

  return { handlePanPointerStart };
}