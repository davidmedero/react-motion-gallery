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
  stopPanMotion?: () => void;
  transition?: string;
  unlockDelayMs?: number;
};

export function resetZoomForSlideChange(args: ResetAllArgs) {
  const {
    setScale,
    zoomState,
    imageRefs,
    resetPan,
    stopPanMotion,
  } = args;

  if (zoomState.scaleRef.current === 1) return;

  zoomState.changingSlides.current = true;
  zoomState.suppressLoopRef.current = false;

  // Critical: stop any in-flight pan animation before touching DOM transforms.
  stopPanMotion?.();

  setScale(1);
  zoomState.previousZoom.current = { x: 0, y: 0 };
  zoomState.panRef.current = { x: 0, y: 0 };
  zoomState.scaleRef.current = 1;

  const transition =
    args.transition ?? "transform 0.2s cubic-bezier(.4,0,.22,1)";
  const transform = "translate3d(0px, 0px, 0) scale(1)";
  const disableTransition = transition.trim() === "none";
  const match = disableTransition ? null : transition.match(/([\d.]+)s/);
  const durationMs = match ? parseFloat(match[1]) * 1000 : 300;

  imageRefs.current.forEach((ref) => {
    const element = ref.current;
    if (!element) return;

    const firstChild = element.children[0] as HTMLElement | undefined;
    if (isVideoSlideElement(firstChild)) return;

    const imgEl = getPrimaryImgEl(element);
    if (!imgEl) return;

    const previousTransition = imgEl.style.transition;
    const restoreTransition =
      previousTransition === "none" ? "" : previousTransition;

    imgEl.style.transition = transition;

    // Force layout so the browser honors the transition change.
    void (imgEl as any).offsetWidth;

    imgEl.style.transform = transform;

    if (disableTransition) {
      requestAnimationFrame(() => {
        if (imgEl.style.transition === transition) {
          imgEl.style.transition = restoreTransition;
        }
      });
      return;
    }

    window.setTimeout(() => {
      if (imgEl.style.transition === transition) {
        imgEl.style.transition = "";
      }
    }, durationMs + 50);
  });

  // Rebuild the pan system only after the DOM transform has been reset.
  resetPan?.();

  const unlockDelayMs =
    args.unlockDelayMs ?? (disableTransition ? 0 : durationMs + 50);

  window.setTimeout(() => {
    zoomState.changingSlides.current = false;
  }, unlockDelayMs);
}
