import * as React from "react";
import { isVideoSlideElement } from "../../video/plyr";
import { getPrimaryImgEl } from "../core/dom";

type ZoomStateRefs = {
  previousZoom: React.RefObject<{ x: number; y: number }>;
  panRef: React.RefObject<{ x: number; y: number }>;
  scaleRef: React.RefObject<number>;
  suppressLoopRef: React.RefObject<boolean>;
  changingSlides: React.RefObject<boolean>;
};

type ResetAllArgs = {
  setScale: (n: number) => void;
  zoomState: ZoomStateRefs;
  imageRefs: React.RefObject<React.RefObject<HTMLDivElement | null>[]>;
  resetPan?: () => void;
  transition?: string;
  unlockDelayMs?: number;
};

export function resetZoomForSlideChange(args: ResetAllArgs) {
  const { setScale, zoomState, imageRefs, resetPan } = args;

  if (zoomState.scaleRef.current === 1) return;

  zoomState.changingSlides.current = true;

  setScale(1);
  zoomState.previousZoom.current.x = 0;
  zoomState.previousZoom.current.y = 0;
  zoomState.panRef.current = { x: 0, y: 0 };
  zoomState.scaleRef.current = 1;
  
  const transition = "transform 0.2s cubic-bezier(.4,0,.22,1)";
  const transform = "translate(0, 0) scale(1)";

  imageRefs.current.forEach((ref) => {
    const element = ref.current;
    if (!element) return;

    const firstChild = element.children[0] as HTMLElement | undefined;
    if (isVideoSlideElement(firstChild)) return;
    const imgEl = getPrimaryImgEl(element);
    if (!imgEl) return;

    const match = transition.match(/([\d.]+)s/);
    const durationMs = match ? parseFloat(match[1]) * 1000 : 300;

    imgEl.style.transition = transition;

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    (imgEl as any).offsetWidth;

    imgEl.style.transform = transform;

    setTimeout(() => {
      imgEl.style.transition = "";
    }, durationMs + 50);
  });

  resetPan?.();

  const match = transition.match(/([\d.]+)s/);
  const durationMs = match ? parseFloat(match[1]) * 1000 : 300;

  const unlockDelayMs = durationMs + 50;
  setTimeout(() => {
    zoomState.changingSlides.current = false;
    zoomState.suppressLoopRef.current = false;
  }, unlockDelayMs);
}
