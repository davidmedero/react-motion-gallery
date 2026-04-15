import { Limit } from "../../shared/motion/limit";
import { PercentOfView } from "../../shared/motion/scrollBounds";
import { getFsMediaViewportEl } from "./dom";

type BoundsForCurrentArgs = {
  scale: number;
  imgW: number;
  imgH: number;
  currentImageEl: HTMLElement | null;
  viewW?: number;
  viewH?: number;
  captionW?: number;
  captionH?: number;
  captionPlacement?: "top" | "right" | "bottom" | "left";
  reservedLeft?: number;
  reservedRight?: number;
  reservedTop?: number;
  reservedBottom?: number;
};

export function boundsForCurrent(args: BoundsForCurrentArgs) {
  const {
    scale,
    imgW,
    imgH,
    currentImageEl,
    viewW,
    viewH,
    captionW,
    captionH,
    captionPlacement,
    reservedLeft,
    reservedRight,
    reservedTop,
    reservedBottom,
  } = args;

  const rect = getFsMediaViewportEl(currentImageEl)?.getBoundingClientRect() ?? null;

  // Actual image-area size after caption layout has taken space.
  const vw =
    viewW ??
    rect?.width ??
    document.documentElement.clientWidth;

  const vh =
    viewH ??
    rect?.height ??
    window.innerHeight;

  const scaledW = imgW * scale;
  const scaledH = imgH * scale;

  // Keep these based on the actual image area, not the caption-compensated one.
  const offsetW = (vw - imgW) / 2;
  const offsetH = (vh - imgH) / 2;

  const containerLeft = rect?.left ?? 0;
  const containerTop = rect?.top ?? 0;
  const imgScreenLeft = containerLeft + offsetW;
  const imgScreenTop = containerTop + offsetH;

  const captionOnLeft = captionPlacement === "left" ? (captionW ?? 0) : 0;
  const captionOnRight = captionPlacement === "right" ? (captionW ?? 0) : 0;
  const captionOnTop = captionPlacement === "top" ? (captionH ?? 0) : 0;
  const captionOnBottom = captionPlacement === "bottom" ? (captionH ?? 0) : 0;
  const reservedSpaceLeft = reservedLeft ?? captionOnLeft;
  const reservedSpaceRight = reservedRight ?? captionOnRight;
  const reservedSpaceTop = reservedTop ?? captionOnTop;
  const reservedSpaceBottom = reservedBottom ?? captionOnBottom;

  // Virtual visible area: actual image area + caption space added back.
  const contentLeft = containerLeft - reservedSpaceLeft;
  const contentRight = containerLeft + vw + reservedSpaceRight;
  const contentTop = containerTop - reservedSpaceTop;
  const contentBottom = containerTop + vh + reservedSpaceBottom;

  const visibleW = contentRight - contentLeft;
  const visibleH = contentBottom - contentTop;

  let xMin: number;
  let xMax: number;
  let yMin: number;
  let yMax: number;

  if (scaledW <= visibleW) {
    const cx = (contentLeft + contentRight) / 2;
    const centered = cx - imgScreenLeft - scaledW / 2;
    xMin = centered;
    xMax = centered;
  } else {
    xMax = contentLeft - imgScreenLeft;
    xMin = contentRight - scaledW - imgScreenLeft;
  }

  if (scaledH <= visibleH) {
    const cy = (contentTop + contentBottom) / 2;
    const centered = cy - imgScreenTop - scaledH / 2;
    yMin = centered;
    yMax = centered;
  } else {
    yMax = contentTop - imgScreenTop;
    yMin = contentBottom - scaledH - imgScreenTop;
  }

  return {
    x: Limit(xMin, xMax),
    y: Limit(yMin, yMax),
    povX: PercentOfView(visibleW),
    povY: PercentOfView(visibleH),
  };
}
