import * as React from "react";
import { isVideoSlideElement } from "../../video/plyr";
import { Vector1DType } from "../../shared/motion/vector1d";
import { LimitType } from "../../shared/motion/limit";
import { ScrollBodyType } from "../../shared/motion/scrollBody";
import { PercentOfViewType, ScrollBoundsType } from "../../shared/motion/scrollBounds";

type AnimationsLike = {
  resetBlend: () => void;
};

type ResetZoomArgs = {
  currentImage: React.RefObject<HTMLElement | null>;

  // vectors
  locX: React.RefObject<Vector1DType | null>;
  prevX: React.RefObject<Vector1DType | null>;
  offX: React.RefObject<Vector1DType | null>;
  tgtX: React.RefObject<Vector1DType | null>;

  locY: React.RefObject<Vector1DType | null>;
  prevY: React.RefObject<Vector1DType | null>;
  offY: React.RefObject<Vector1DType | null>;
  tgtY: React.RefObject<Vector1DType | null>;

  // bodies + bounds
  bodyX: React.RefObject<ScrollBodyType | null>;
  bodyY: React.RefObject<ScrollBodyType | null>;
  boundsX: React.RefObject<ScrollBoundsType | null>;
  boundsY: React.RefObject<ScrollBoundsType | null>;

  // factories
  ScrollBody: (
    loc: Vector1DType,
    off: Vector1DType,
    prev: Vector1DType,
    tgt: Vector1DType,
    duration: number,
    friction: number
  ) => ScrollBodyType;

  ScrollBounds: (
    lim: LimitType,
    off: Vector1DType,
    tgt: Vector1DType,
    body: ScrollBodyType,
    pov: PercentOfViewType,
    duration: number
  ) => ScrollBoundsType;

  // sizing helpers
  baseFitSizeC: (
    img: HTMLImageElement,
    containerW: number,
    containerH: number
  ) => { baseW: number; baseH: number };

  boundsForCurrent: (
    scale: number,
    imgW: number,
    imgH: number,
    viewW?: number,
    viewH?: number
  ) => { x: LimitType; y: LimitType; povX: any; povY: any };

  // settings
  panDuration: number;
  panFriction: number;

  // animation runtime
  animRef: React.RefObject<AnimationsLike | null>;
};

export function resetPanForScale1(args: ResetZoomArgs) {
  const {
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
    baseFitSizeC,
    boundsForCurrent,
    panDuration,
    panFriction,
    animRef,
  } = args;

  const container = currentImage.current;
  if (
    !container ||
    !locX.current ||
    !prevX.current ||
    !offX.current ||
    !tgtX.current ||
    !bodyX.current ||
    !boundsX.current ||
    !tgtX.current
  ) return;

  const firstChild = container.children[0] as HTMLElement | undefined;
  if (isVideoSlideElement(firstChild)) return;

  const imgEl = firstChild as HTMLImageElement;

  const rect = container.getBoundingClientRect();
  const containerW = rect.width;
  const containerH = rect.height;

  const { baseW, baseH } = baseFitSizeC(imgEl, containerW, containerH);

  locX.current!.set(0); prevX.current!.set(0); offX.current!.set(0); tgtX.current!.set(0);
  locY.current!.set(0); prevY.current!.set(0); offY.current!.set(0); tgtY.current!.set(0);

  bodyX.current = ScrollBody(
    locX.current!, offX.current!, prevX.current!, tgtX.current!,
    panDuration, panFriction
  ).sync();
  bodyY.current = ScrollBody(
    locY.current!, offY.current!, prevY.current!, tgtY.current!,
    panDuration, panFriction
  ).sync();

  const { x: limX2, y: limY2, povX, povY } =
    boundsForCurrent(1, baseW, baseH, containerW, containerH);

  boundsX.current = ScrollBounds(limX2, offX.current!, tgtX.current!, bodyX.current!, povX, panDuration);
  boundsY.current = ScrollBounds(limY2, offY.current!, tgtY.current!, bodyY.current!, povY, panDuration);

  tgtX.current!.set(limX2.constrain(tgtX.current!.get()));
  tgtY.current!.set(limY2.constrain(tgtY.current!.get()));

  animRef.current?.resetBlend();
}