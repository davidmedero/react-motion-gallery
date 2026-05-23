import type React from "react";

import {
  getFsMediaViewportEl,
  getFullscreenTwinImages,
  getPrimaryImgEl,
  gapAllEdges,
} from "../core/dom";
import { baseFitSize, clampNum, getCurrentTransform } from "../core/utils";
import type {
  ResolvedZoomPanOptions,
  ZoomPanHoverOptions,
  ZoomPanPlugin,
} from "../types";
import { applySmoothTransform, type ZoomCtx } from "../zoom/zoomTo";

export type ResolvedZoomPanHoverOptions = {
  enabled: true;
  zoomLevel: number;
  zoomInDurationMs: number;
  zoomOutDurationMs: number;
};

type ZoomPanHoverCtx = ZoomCtx & {
  panRef?: { current: { x: number; y: number } };
};

type PointerLike = {
  pointerType?: string;
};

type HoverLayout = {
  rect: DOMRect;
  bounds: ReturnType<ZoomPanHoverCtx["boundsForCurrent"]>;
};

type HoverTransformTarget = { x: number; y: number };

type HoverZoomAnimation = {
  ctx: ZoomPanHoverCtx;
  imageRef: React.RefObject<HTMLElement | null>;
  imgEl: HTMLImageElement;
  rafId: number;
  startMs: number;
  lastFrameMs: number;
  durationMs: number;
  fromX: number;
  fromY: number;
  currentX: number;
  currentY: number;
  fromScale: number;
  target: HoverTransformTarget;
  targetScale: number;
};

const DEFAULT_HOVER_ZOOM_OUT_DURATION_MS = 260;
const HOVER_ZOOM_PAN_FOLLOW_MS = 32;
const ZOOM_EPS = 1.01;
const hoverZoomAnimations = new WeakMap<HTMLImageElement, HoverZoomAnimation>();

function isZoomPanPlugin(value: unknown): value is ZoomPanPlugin {
  return (
    typeof value === "object" &&
    value != null &&
    (value as ZoomPanPlugin).__rmgZoomPanPlugin === true
  );
}

function nowMs() {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  }

  return Date.now();
}

function readCurrentScale(
  imageRef: React.RefObject<HTMLElement | null>,
  fallbackScale: number
) {
  const imgEl = getPrimaryImgEl(imageRef.current);
  if (!imgEl) return fallbackScale;

  const transform =
    typeof window !== "undefined" && typeof window.getComputedStyle === "function"
      ? window.getComputedStyle(imgEl).transform
      : imgEl.style.transform;

  if (!transform || transform === "none") return fallbackScale;

  const matrix3d = transform.match(/matrix3d\(([^)]+)\)/);
  if (matrix3d) {
    const values = matrix3d[1].split(",").map(Number.parseFloat);
    return Number.isFinite(values[0]) ? values[0] : fallbackScale;
  }

  const matrix = transform.match(/matrix\(([^)]+)\)/);
  if (matrix) {
    const values = matrix[1].split(",").map(Number.parseFloat);
    const a = values[0] || 0;
    const b = values[1] || 0;
    const scale = Math.hypot(a, b);
    return Number.isFinite(scale) && scale > 0 ? scale : fallbackScale;
  }

  const scale = transform.match(/scale\(([-\d.]+)\)/);
  if (scale) {
    const value = Number.parseFloat(scale[1]);
    return Number.isFinite(value) ? value : fallbackScale;
  }

  return fallbackScale;
}

function cancelHoverZoomAnimation(imageRef: React.RefObject<HTMLElement | null>) {
  const imgEl = getPrimaryImgEl(imageRef.current);
  if (!imgEl) return;

  const animation = hoverZoomAnimations.get(imgEl);
  if (animation) {
    window.cancelAnimationFrame(animation.rafId);
    hoverZoomAnimations.delete(imgEl);
  }
}

function getHoverZoomAnimation(
  imageRef: React.RefObject<HTMLElement | null>
) {
  const imgEl = getPrimaryImgEl(imageRef.current);
  return imgEl ? hoverZoomAnimations.get(imgEl) ?? null : null;
}

export function resolveZoomPanHoverOptions(
  zoom: ResolvedZoomPanOptions | null | undefined
): ResolvedZoomPanHoverOptions | null {
  if (!zoom) return null;

  const plugin = zoom.plugins?.find(
    (entry): entry is ZoomPanPlugin<ZoomPanHoverOptions> =>
      isZoomPanPlugin(entry) && entry.kind === "hover"
  );

  if (!plugin) return null;

  const options = plugin.options ?? {};
  if (options.enabled === false) return null;

  const zoomOutDurationMs =
    options.zoomOutDurationMs ?? DEFAULT_HOVER_ZOOM_OUT_DURATION_MS;

  return {
    enabled: true,
    zoomLevel: options.zoomLevel ?? zoom.clickZoomLevel,
    zoomInDurationMs: options.zoomInDurationMs ?? zoomOutDurationMs,
    zoomOutDurationMs,
  };
}

export function isZoomPanHoverPointer(event: PointerLike) {
  const pointerType = event.pointerType;
  if (pointerType && pointerType !== "mouse") return false;

  if (typeof window === "undefined") return true;
  if (typeof window.matchMedia !== "function") return true;

  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function ensurePanBodies(ctx: ZoomPanHoverCtx, x: number, y: number) {
  if (ctx.locX.current && ctx.locY.current) return;

  ctx.locX.current = ctx.Vector1D(x);
  ctx.prevX.current = ctx.Vector1D(x);
  ctx.offX.current = ctx.Vector1D(x);
  ctx.tgtX.current = ctx.Vector1D(x);

  ctx.locY.current = ctx.Vector1D(y);
  ctx.prevY.current = ctx.Vector1D(y);
  ctx.offY.current = ctx.Vector1D(y);
  ctx.tgtY.current = ctx.Vector1D(y);

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

function readHoverLayout(
  ctx: ZoomPanHoverCtx,
  imageRef: React.RefObject<HTMLElement | null>,
  scale: number
): HoverLayout | null {
  if (!imageRef.current) return null;

  ctx.currentImage.current = imageRef.current;
  const container = ctx.currentImage.current;
  const imgEl = getPrimaryImgEl(container);
  if (!imgEl) return null;

  const measureEl = getFsMediaViewportEl(container) ?? container;
  const rect = measureEl.getBoundingClientRect();
  if (gapAllEdges({ width: rect.width, height: rect.height }, imgEl)) return null;

  const { x: domTx, y: domTy } = getCurrentTransform(imgEl);
  ensurePanBodies(ctx, domTx, domTy);

  const { baseW, baseH } = baseFitSize(imgEl, rect.width, rect.height);
  const bounds = ctx.boundsForCurrent(
    scale,
    baseW,
    baseH,
    rect.width,
    rect.height
  );

  return { rect, bounds };
}

function resolveTargetFromPointer(
  layout: HoverLayout,
  clientX: number,
  clientY: number
) {
  const ratioX = clampNum(
    layout.rect.width > 0 ? (clientX - layout.rect.left) / layout.rect.width : 0.5,
    0,
    1
  );
  const ratioY = clampNum(
    layout.rect.height > 0 ? (clientY - layout.rect.top) / layout.rect.height : 0.5,
    0,
    1
  );

  const xSpan = layout.bounds.x.max - layout.bounds.x.min;
  const ySpan = layout.bounds.y.max - layout.bounds.y.min;

  return {
    x: layout.bounds.x.constrain(layout.bounds.x.max - xSpan * ratioX),
    y: layout.bounds.y.constrain(layout.bounds.y.max - ySpan * ratioY),
  };
}

function syncHoverBounds(ctx: ZoomPanHoverCtx, layout: HoverLayout) {
  ctx.boundsX.current = ctx.ScrollBounds(
    layout.bounds.x,
    ctx.offX.current!,
    ctx.tgtX.current!,
    ctx.bodyX.current!,
    layout.bounds.povX,
    ctx.fs.zoom.panDuration
  );

  ctx.boundsY.current = ctx.ScrollBounds(
    layout.bounds.y,
    ctx.offY.current!,
    ctx.tgtY.current!,
    ctx.bodyY.current!,
    layout.bounds.povY,
    ctx.fs.zoom.panDuration
  );
}

function syncHoverPanTarget(
  ctx: ZoomPanHoverCtx,
  target: HoverTransformTarget
) {
  ctx.panRef && (ctx.panRef.current = target);
  ctx.offX.current?.set(target.x);
  ctx.offY.current?.set(target.y);
  ctx.locX.current?.set(target.x);
  ctx.locY.current?.set(target.y);
  ctx.prevX.current?.set(target.x);
  ctx.prevY.current?.set(target.y);
  ctx.tgtX.current?.set(target.x);
  ctx.tgtY.current?.set(target.y);
}

function renderHoverTransform(
  ctx: ZoomPanHoverCtx,
  target: HoverTransformTarget,
  scale: number
) {
  const container = ctx.currentImage.current;
  const twinImages = getFullscreenTwinImages(container);
  if (!twinImages.length) return;

  const transform = `translate3d(${target.x}px, ${target.y}px, 0) scale(${scale})`;
  twinImages.forEach((imgEl) => {
    if (imgEl.style.transition) imgEl.style.transition = "";
    imgEl.style.transform = transform;
  });

  syncHoverPanTarget(ctx, target);
}

function cubicBezierYForX(x: number) {
  const x1 = 0.4;
  const y1 = 0;
  const x2 = 0.22;
  const y2 = 1;

  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  let t = x;
  for (let i = 0; i < 6; i += 1) {
    const xAtT = ((ax * t + bx) * t + cx) * t;
    const dxAtT = (3 * ax * t + 2 * bx) * t + cx;
    if (Math.abs(xAtT - x) < 0.001 || Math.abs(dxAtT) < 0.001) break;
    t -= (xAtT - x) / dxAtT;
    t = clampNum(t, 0, 1);
  }

  return ((ay * t + by) * t + cy) * t;
}

function renderHoverZoomAnimationFrame(
  animation: HoverZoomAnimation,
  timestampMs: number
) {
  const dtMs = Math.max(0, timestampMs - animation.lastFrameMs);
  const elapsedMs = timestampMs - animation.startMs;
  const progress =
    animation.durationMs <= 0
      ? 1
      : clampNum(elapsedMs / animation.durationMs, 0, 1);
  const easedProgress = cubicBezierYForX(progress);
  const currentTarget = {
    x:
      animation.fromX +
      (animation.target.x - animation.fromX) * easedProgress,
    y:
      animation.fromY +
      (animation.target.y - animation.fromY) * easedProgress,
  };
  const currentScale =
    animation.fromScale +
    (animation.targetScale - animation.fromScale) * easedProgress;
  const panFollow = progress >= 1
    ? 1
    : clampNum(dtMs / HOVER_ZOOM_PAN_FOLLOW_MS, 0, 1);

  animation.currentX += (currentTarget.x - animation.currentX) * panFollow;
  animation.currentY += (currentTarget.y - animation.currentY) * panFollow;
  animation.lastFrameMs = timestampMs;

  renderHoverTransform(
    animation.ctx,
    { x: animation.currentX, y: animation.currentY },
    currentScale
  );
  return progress >= 1;
}

function startHoverZoomAnimation(
  ctx: ZoomPanHoverCtx,
  imageRef: React.RefObject<HTMLElement | null>,
  args: {
    fromX: number;
    fromY: number;
    fromScale: number;
    target: HoverTransformTarget;
    targetScale: number;
    durationMs: number;
  }
) {
  const imgEl = getPrimaryImgEl(imageRef.current);
  if (!imgEl) return;

  cancelHoverZoomAnimation(imageRef);

  const animation: HoverZoomAnimation = {
    ctx,
    imageRef,
    imgEl,
    rafId: 0,
    startMs: nowMs(),
    lastFrameMs: 0,
    durationMs: args.durationMs,
    fromX: args.fromX,
    fromY: args.fromY,
    currentX: args.fromX,
    currentY: args.fromY,
    fromScale: args.fromScale,
    target: args.target,
    targetScale: args.targetScale,
  };
  animation.lastFrameMs = animation.startMs;

  function tick(timestampMs: number) {
    if (hoverZoomAnimations.get(imgEl) !== animation) return;

    const done = renderHoverZoomAnimationFrame(animation, timestampMs);
    if (done) {
      hoverZoomAnimations.delete(imgEl);
      ctx.scaleRef.current = animation.targetScale;
      ctx.setScale(animation.targetScale);
      renderHoverTransform(ctx, animation.target, animation.targetScale);
      return;
    }

    animation.rafId = window.requestAnimationFrame(tick);
  }

  hoverZoomAnimations.set(imgEl, animation);
  renderHoverZoomAnimationFrame(animation, animation.startMs);
  animation.rafId = window.requestAnimationFrame(tick);
}

export function zoomPanHoverEnter(
  ctx: ZoomPanHoverCtx,
  args: {
    imageRef: React.RefObject<HTMLElement | null>;
    clientX: number;
    clientY: number;
    hover: ResolvedZoomPanHoverOptions;
  }
) {
  const scale = clampNum(args.hover.zoomLevel, 1, ctx.fs.zoom.maxZoomLevel);
  if (scale <= ZOOM_EPS) return false;

  const layout = readHoverLayout(ctx, args.imageRef, scale);
  if (!layout) return false;

  const target = resolveTargetFromPointer(layout, args.clientX, args.clientY);
  syncHoverBounds(ctx, layout);

  ctx.animRef.current?.stop();
  ctx.suppressLoopRef.current = true;
  ctx.previousZoom.current.x = args.clientX - layout.rect.left;
  ctx.previousZoom.current.y = args.clientY - layout.rect.top;
  ctx.panRef && (ctx.panRef.current = target);
  ctx.scaleRef.current = scale;
  ctx.setScale(scale);

  startHoverZoomAnimation(ctx, args.imageRef, {
    fromX: ctx.offX.current?.get() ?? 0,
    fromY: ctx.offY.current?.get() ?? 0,
    fromScale: readCurrentScale(args.imageRef, 1),
    target,
    targetScale: scale,
    durationMs: args.hover.zoomInDurationMs,
  });

  return true;
}

export function zoomPanHoverMove(
  ctx: ZoomPanHoverCtx,
  args: {
    imageRef: React.RefObject<HTMLElement | null>;
    clientX: number;
    clientY: number;
  }
) {
  const scale = ctx.scaleRef.current;
  if (scale <= ZOOM_EPS) return false;

  const layout = readHoverLayout(ctx, args.imageRef, scale);
  if (!layout) return false;

  const target = resolveTargetFromPointer(layout, args.clientX, args.clientY);
  syncHoverBounds(ctx, layout);

  ctx.suppressLoopRef.current = true;
  ctx.panRef && (ctx.panRef.current = target);
  ctx.tgtX.current!.set(target.x);
  ctx.tgtY.current!.set(target.y);

  const animation = getHoverZoomAnimation(args.imageRef);
  if (animation) {
    animation.target = target;
    return true;
  }

  ctx.animRef.current?.stop();
  renderHoverTransform(ctx, target, scale);

  return true;
}

export function zoomPanHoverLeave(
  ctx: ZoomPanHoverCtx,
  args: { imageRef: React.RefObject<HTMLElement | null>; durationMs: number }
) {
  if (!args.imageRef.current) return false;

  ctx.currentImage.current = args.imageRef.current;
  ensurePanBodies(ctx, ctx.offX.current?.get() ?? 0, ctx.offY.current?.get() ?? 0);
  cancelHoverZoomAnimation(args.imageRef);

  ctx.animRef.current?.stop();
  ctx.suppressLoopRef.current = false;
  ctx.previousZoom.current.x = 0;
  ctx.previousZoom.current.y = 0;
  ctx.panRef && (ctx.panRef.current = { x: 0, y: 0 });
  ctx.bodyX.current?.resetVelocity?.();
  ctx.bodyX.current?.useDuration?.(0);
  ctx.bodyX.current?.useFriction?.(1);
  ctx.bodyX.current?.sync?.();
  ctx.bodyY.current?.resetVelocity?.();
  ctx.bodyY.current?.useDuration?.(0);
  ctx.bodyY.current?.useFriction?.(1);
  ctx.bodyY.current?.sync?.();

  applySmoothTransform(ctx, 0, 0, 1, args.durationMs);

  return true;
}
