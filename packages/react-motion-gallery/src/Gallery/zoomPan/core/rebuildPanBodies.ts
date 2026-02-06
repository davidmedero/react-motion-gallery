import { baseFitSize, getCurrentTransform } from "./utils";
import { getPrimaryImgEl } from "./dom";

type VectorLike = { get(): number; set(v: number): void };
type RefLike<T> = { current: T };

export type RebuildPanBodiesCtx = {
  fs: { zoom: { panDuration: number; panFriction: number } };
  currentImage: RefLike<HTMLElement | null>;
  scaleRef: RefLike<number>;
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
    containerH: number
  ) => { x: any; y: any; povX: any; povY: any };
};

export function rebuildPanBodiesFn(ctx: RebuildPanBodiesCtx) {
  if (!ctx.currentImage.current) return;

  const container = ctx.currentImage.current;
  const img = getPrimaryImgEl(container);
  if (!img) return;

  const rect = container.getBoundingClientRect();
  const containerW = rect.width;
  const containerH = rect.height;

  const { baseW, baseH } = baseFitSize(img, containerW, containerH);

  const { x, y } = getCurrentTransform(img);

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

  const { x: limX, y: limY, povX, povY } = ctx.boundsForCurrent(
    ctx.scaleRef.current,
    baseW,
    baseH,
    containerW,
    containerH
  );

  ctx.boundsX.current = ctx.ScrollBounds(
    limX,
    ctx.offX.current,
    ctx.tgtX.current,
    ctx.bodyX.current,
    povX,
    ctx.fs.zoom.panDuration
  );

  ctx.boundsY.current = ctx.ScrollBounds(
    limY,
    ctx.offY.current,
    ctx.tgtY.current,
    ctx.bodyY.current,
    povY,
    ctx.fs.zoom.panDuration
  );
}