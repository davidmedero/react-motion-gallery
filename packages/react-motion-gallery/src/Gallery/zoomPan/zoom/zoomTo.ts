import type React from "react";
import { getCurrentTransform, baseFitSize, clampNum } from "../core/utils";
import {
  gapAllEdges,
  getFsMediaViewportEl,
  getFullscreenTwinImages,
  getPrimaryImgEl,
} from "../core/dom";

export type ZoomPoint = { x: number; y: number };

type VectorLike = { get(): number; set(v: number): void; add?(v: number): void };
type RefLike<T> = { current: T };

export type ZoomToArgs = {
  destZoomLevel: number;
  centerPoint: ZoomPoint;
  imageRef: React.RefObject<HTMLElement | null>;
};

type PovLike = { measure(n: number): number };
type BoundsForCurrentOptions = { ignoreReserved?: boolean };
const smoothTransformTimers = new WeakMap<
  HTMLImageElement,
  ReturnType<typeof window.setTimeout>
>();

function readRenderedTransform(imgEl: HTMLImageElement) {
  const computedTransform =
    typeof window !== "undefined" && typeof window.getComputedStyle === "function"
      ? window.getComputedStyle(imgEl).transform
      : "";

  if (computedTransform && computedTransform !== "none") {
    return computedTransform;
  }

  const inlineTransform = imgEl.style.transform;
  return inlineTransform || "translate3d(0px, 0px, 0) scale(1)";
}

export type ZoomCtx = {
  fs: {
    zoom: {
      maxZoomLevel: number;
      panDuration: number;
      panFriction: number;
      clickZoomLevel: number;
    };
  };
  currentImage: RefLike<HTMLElement | null>;
  scaleRef: RefLike<number>;
  setScale: (n: number) => void;
  previousZoom: RefLike<{ x: number; y: number }>;
  suppressLoopRef: RefLike<boolean>;
  locX: RefLike<VectorLike | null>;
  prevX: RefLike<VectorLike | null>;
  offX: RefLike<VectorLike | null>;
  tgtX: RefLike<VectorLike | null>;
  locY: RefLike<VectorLike | null>;
  prevY: RefLike<VectorLike | null>;
  offY: RefLike<VectorLike | null>;
  tgtY: RefLike<VectorLike | null>;
  bodyX: RefLike<any>;
  bodyY: RefLike<any>;
  boundsX: RefLike<any>;
  boundsY: RefLike<any>;
  Vector1D: (n: number) => VectorLike;
  ScrollBody: (...args: any[]) => any;
  ScrollBounds: (...args: any[]) => any;
  boundsForCurrent: (
    scale: number,
    baseW: number,
    baseH: number,
    containerW: number,
    containerH: number,
    options?: BoundsForCurrentOptions
  ) => { x: any; y: any; povX: PovLike; povY: PovLike };
  renderPan: (x: number, y: number) => void;
  animRef: RefLike<{ start(): void; stop(): void; resetBlend(): void } | null>;
  panRef?: RefLike<{ x: number; y: number }>;
};

export function applySmoothTransform(
  ctx: ZoomCtx,
  x: number,
  y: number,
  scale: number,
  durationMs = 300
) {
  const container = ctx.currentImage.current;
  if (!container) return;

  const twinImages = getFullscreenTwinImages(container);
  if (!twinImages.length) return;

  const transition = `transform ${durationMs}ms cubic-bezier(.4,0,.22,1)`;
  const toTransform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;

  twinImages.forEach((imgEl) => {
    const previousTimer = smoothTransformTimers.get(imgEl);
    if (previousTimer != null) window.clearTimeout(previousTimer);

    const fromTransform = readRenderedTransform(imgEl);
    imgEl.style.transition = "";
    imgEl.style.transform = fromTransform;
    void imgEl.offsetWidth;

    imgEl.style.transition = transition;
    imgEl.style.transform = toTransform;

    const timer = window.setTimeout(() => {
      if (smoothTransformTimers.get(imgEl) !== timer) return;
      imgEl.style.transition = "";
      smoothTransformTimers.delete(imgEl);
    }, durationMs + 30);

    smoothTransformTimers.set(imgEl, timer);
  });

  ctx.offX.current?.set(x);
  ctx.offY.current?.set(y);
  ctx.locX.current?.set(x);
  ctx.locY.current?.set(y);
  ctx.prevX.current?.set(x);
  ctx.prevY.current?.set(y);
  ctx.tgtX.current?.set(x);
  ctx.tgtY.current?.set(y);

  ctx.scaleRef.current = scale;
  ctx.setScale(scale);

}

export function zoomTo(ctx: ZoomCtx, args: ZoomToArgs) {
  const { destZoomLevel, centerPoint, imageRef } = args;
  if (!imageRef.current) return;

  ctx.currentImage.current = imageRef.current;
  const container = ctx.currentImage.current;

  const imgEl = getPrimaryImgEl(container);
  if (!imgEl) return;

  const measureEl = getFsMediaViewportEl(container) ?? container;
  const rect0 = measureEl.getBoundingClientRect();
  if (gapAllEdges({ width: rect0.width, height: rect0.height }, imgEl)) return;

  const { x: domTx, y: domTy } = getCurrentTransform(imgEl);

  if (!ctx.locX.current || !ctx.locY.current) {
    ctx.locX.current = ctx.Vector1D(domTx);
    ctx.prevX.current = ctx.Vector1D(domTx);
    ctx.offX.current = ctx.Vector1D(domTx);
    ctx.tgtX.current = ctx.Vector1D(domTx);

    ctx.locY.current = ctx.Vector1D(domTy);
    ctx.prevY.current = ctx.Vector1D(domTy);
    ctx.offY.current = ctx.Vector1D(domTy);
    ctx.tgtY.current = ctx.Vector1D(domTy);

    ctx.bodyX.current = ctx.ScrollBody(
      ctx.locX.current,
      ctx.offX.current,
      ctx.prevX.current,
      ctx.tgtX.current,
      ctx.fs.zoom.panDuration,
      ctx.fs.zoom.panFriction
    ).sync();

    ctx.bodyY.current = ctx.ScrollBody(
      ctx.locY.current,
      ctx.offY.current,
      ctx.prevY.current,
      ctx.tgtY.current,
      ctx.fs.zoom.panDuration,
      ctx.fs.zoom.panFriction
    ).sync();
  }

  const s0 = ctx.scaleRef.current || 1;
  const s1 = clampNum(destZoomLevel, 1, ctx.fs.zoom.maxZoomLevel);

  const ZOOM_EPS = 1.01;
  if (s1 === s0) {
    const panX = ctx.offX.current?.get() ?? domTx;
    const panY = ctx.offY.current?.get() ?? domTy;
    const alreadyCentered = Math.abs(panX) < 0.5 && Math.abs(panY) < 0.5;
    if (s1 > ZOOM_EPS || alreadyCentered) return;
  }

  const wasZoomed = s0 > ZOOM_EPS;
  const willBeZoomed = s1 > ZOOM_EPS;

  if (!wasZoomed && willBeZoomed) ctx.suppressLoopRef.current = true;
  else if (wasZoomed && !willBeZoomed) ctx.suppressLoopRef.current = false;

  const rect = measureEl.getBoundingClientRect();
  const containerW = rect.width;
  const containerH = rect.height;

  const cx = centerPoint.x - rect.left;
  const cy = centerPoint.y - rect.top;

  const { baseW, baseH } = baseFitSize(imgEl, containerW, containerH);
  const offXc = (containerW - baseW) / 2;
  const offYc = (containerH - baseH) / 2;

  const tx0 = ctx.offX.current!.get();
  const ty0 = ctx.offY.current!.get();

  const k = s1 / s0;
  let tx1 = tx0 + (1 - k) * (cx - offXc - tx0);
  let ty1 = ty0 + (1 - k) * (cy - offYc - ty0);

  const { x: limX, y: limY, povX, povY } = ctx.boundsForCurrent(
    s1,
    baseW,
    baseH,
    containerW,
    containerH,
    { ignoreReserved: true }
  );
  tx1 = limX.constrain(tx1);
  ty1 = limY.constrain(ty1);

  ctx.scaleRef.current = s1;
  ctx.setScale(s1);
  ctx.previousZoom.current.x = cx;
  ctx.previousZoom.current.y = cy;

  if (!willBeZoomed) {
    tx1 = limX.constrain(0);
    ty1 = limY.constrain(0);

    ctx.animRef.current?.stop();

    ctx.boundsX.current = ctx.ScrollBounds(
      limX,
      ctx.offX.current!,
      ctx.tgtX.current!,
      ctx.bodyX.current!,
      povX,
      ctx.fs.zoom.panDuration
    );
    ctx.boundsY.current = ctx.ScrollBounds(
      limY,
      ctx.offY.current!,
      ctx.tgtY.current!,
      ctx.bodyY.current!,
      povY,
      ctx.fs.zoom.panDuration
    );

    ctx.tgtX.current!.set(tx1);
    ctx.locX.current!.set(tx1);
    ctx.prevX.current!.set(tx1);
    ctx.offX.current!.set(tx1);

    ctx.tgtY.current!.set(ty1);
    ctx.locY.current!.set(ty1);
    ctx.prevY.current!.set(ty1);
    ctx.offY.current!.set(ty1);

    ctx.panRef && (ctx.panRef.current = { x: tx1, y: ty1 });

    ctx.bodyX.current?.resetVelocity?.();
    ctx.bodyX.current?.useDuration(0).useFriction(1).sync();
    ctx.bodyY.current?.resetVelocity?.();
    ctx.bodyY.current?.useDuration(0).useFriction(1).sync();

    ctx.animRef.current?.resetBlend();
    ctx.renderPan(tx1, ty1);
    return;
  }

  ctx.tgtX.current!.set(tx1);
  ctx.locX.current!.set(tx1);
  ctx.prevX.current!.set(tx1);
  ctx.offX.current!.set(tx1);

  ctx.tgtY.current!.set(ty1);
  ctx.locY.current!.set(ty1);
  ctx.prevY.current!.set(ty1);
  ctx.offY.current!.set(ty1);

  ctx.boundsX.current = ctx.ScrollBounds(
    limX,
    ctx.offX.current!,
    ctx.tgtX.current!,
    ctx.bodyX.current!,
    povX,
    ctx.fs.zoom.panDuration
  );
  ctx.boundsY.current = ctx.ScrollBounds(
    limY,
    ctx.offY.current!,
    ctx.tgtY.current!,
    ctx.bodyY.current!,
    povY,
    ctx.fs.zoom.panDuration
  );

  ctx.bodyX.current?.useDuration(0).useFriction(1);
  ctx.bodyY.current?.useDuration(0).useFriction(1);

  ctx.renderPan(tx1, ty1);
  ctx.animRef.current?.start();
}
