import type * as React from "react";
import type { AnimationsType } from "../../shared/motion/animations";
import type { ScrollBodyType } from "../../shared/motion/scrollBody";
import type { Vector1DType } from "../../shared/motion/vector1d";

export type WindowType = Window & typeof globalThis;

export type ImageRef = React.RefObject<HTMLDivElement | null>;

export type PanRuntimeDeps = {
  fs: any; // replace with your FS options type
  isZoomed: boolean;

  // used for click->zoom bridge
  zoomCtx: any; // your HandleZoomToggleCtx / ZoomCtx type
  handleZoomToggle: (
    ctx: any,
    e: React.PointerEvent<HTMLImageElement> | React.TouchEvent<HTMLImageElement>,
    imageRef: ImageRef
  ) => void;

  // dom / state refs
  currentImage: React.RefObject<HTMLElement | null>; // or HTMLDivElement if you want
  suppressNextClickRef: React.RefObject<boolean>;
  pointerDownRef: React.RefObject<boolean>;
  interactionModeRef: React.RefObject<"idle" | "drag" | string>;

  // hooks/util fns
  getImageAspectRatio: (imgEl: HTMLDivElement | null) => void;
  rebuildPanBodies: () => void;
  renderPan: (x: number, y: number) => void;

  // motion refs
  boundsX: React.RefObject<{ constrain: (pd: boolean) => void; reached: () => boolean } | null>;
  boundsY: React.RefObject<{ constrain: (pd: boolean) => void; reached: () => boolean } | null>;

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

  axisRef: React.RefObject<any | null>;

  animRef: React.RefObject<AnimationsType | null>;
};
