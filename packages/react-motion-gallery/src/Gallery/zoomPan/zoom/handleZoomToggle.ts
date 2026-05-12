import type React from "react";
import { getCurrentTransform, baseFitSize } from "../core/utils";
import {
  gapAllEdges,
  getClientXY,
  getFsMediaViewportEl,
  getPrimaryImgEl,
} from "../core/dom";
import { applySmoothTransform, type ZoomCtx } from "./zoomTo";

type ImageRef = React.RefObject<HTMLElement | null>;

export type HandleZoomToggleCtx = ZoomCtx & {
  panRef: { current: { x: number; y: number } };
  resetAllZoomDom: () => void;
  scale: number;
};

export function handleZoomToggle(
  ctx: HandleZoomToggleCtx,
  e: React.PointerEvent<any> | React.TouchEvent<any>,
  imageRef: ImageRef
) {
  if (!imageRef.current) return;

  ctx.currentImage.current = imageRef.current;
  const container = ctx.currentImage.current;
  if (!container) return;

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
  const goingIn = s0 === 1;
  const s1 = goingIn ? ctx.fs.zoom.clickZoomLevel : 1;

  const ZOOM_EPS = 1.01;
  const wasZoomed = s0 > ZOOM_EPS;
  const willBeZoomed = s1 > ZOOM_EPS;

  if (wasZoomed && !willBeZoomed) {
    ctx.suppressLoopRef.current = false;
    ctx.resetAllZoomDom();
  }

  const rect = measureEl.getBoundingClientRect();
  const containerW = rect.width;
  const containerH = rect.height;

  const { clientX, clientY } = getClientXY(e as any);
  const cx = clientX - rect.left;
  const cy = clientY - rect.top;

  const { baseW, baseH } = baseFitSize(imgEl, containerW, containerH);
  const offXc = (containerW - baseW) / 2;
  const offYc = (containerH - baseH) / 2;

  const tx0 = ctx.offX.current!.get();
  const ty0 = ctx.offY.current!.get();

  let tx1: number;
  let ty1: number;

  if (goingIn) {
    const k = s1 / s0;
    tx1 = tx0 + (1 - k) * (cx - offXc - tx0);
    ty1 = ty0 + (1 - k) * (cy - offYc - ty0);

    const { x: limX, y: limY } = ctx.boundsForCurrent(
      s1,
      baseW,
      baseH,
      containerW,
      containerH
    );
    tx1 = limX.constrain(tx1);
    ty1 = limY.constrain(ty1);
  } else {
    tx1 = 0;
    ty1 = 0;
  }

  const DURATION = 300;
  applySmoothTransform(ctx, tx1, ty1, s1, DURATION);

  ctx.scaleRef.current = s1;
  ctx.setScale(s1);

  ctx.previousZoom.current.x = cx;
  ctx.previousZoom.current.y = cy;

  ctx.panRef.current = { x: tx1, y: ty1 };

  ctx.locX.current!.set(tx1);
  ctx.prevX.current!.set(tx1);
  ctx.offX.current!.set(tx1);
  ctx.tgtX.current!.set(tx1);

  ctx.locY.current!.set(ty1);
  ctx.prevY.current!.set(ty1);
  ctx.offY.current!.set(ty1);
  ctx.tgtY.current!.set(ty1);

  ctx.bodyX.current = ctx.ScrollBody(
    ctx.locX.current!,
    ctx.offX.current!,
    ctx.prevX.current!,
    ctx.tgtX.current!,
    ctx.fs.zoom.panDuration,
    ctx.fs.zoom.panFriction
  ).sync();

  ctx.bodyY.current = ctx.ScrollBody(
    ctx.locY.current!,
    ctx.offY.current!,
    ctx.prevY.current!,
    ctx.tgtY.current!,
    ctx.fs.zoom.panDuration,
    ctx.fs.zoom.panFriction
  ).sync();

  const { x: limX2, y: limY2, povX, povY } = ctx.boundsForCurrent(
    s1,
    baseW,
    baseH,
    containerW,
    containerH
  );

  ctx.boundsX.current = ctx.ScrollBounds(
    limX2,
    ctx.offX.current!,
    ctx.tgtX.current!,
    ctx.bodyX.current!,
    povX,
    ctx.fs.zoom.panDuration
  );

  ctx.boundsY.current = ctx.ScrollBounds(
    limY2,
    ctx.offY.current!,
    ctx.tgtY.current!,
    ctx.bodyY.current!,
    povY,
    ctx.fs.zoom.panDuration
  );

  ctx.tgtX.current!.set(limX2.constrain(ctx.tgtX.current!.get()));
  ctx.tgtY.current!.set(limY2.constrain(ctx.tgtY.current!.get()));

  ctx.animRef.current?.resetBlend();
}
