import { Limit } from "../../shared/motion/limit";
import { PercentOfView } from "../../shared/motion/scrollBounds";

type BoundsForCurrentArgs = {
  scale: number;
  imgW: number;
  imgH: number;
  currentImageEl: HTMLElement | null;
  viewW?: number;
  viewH?: number;
};

export function boundsForCurrent(args: BoundsForCurrentArgs) {
  const {
    scale,
    imgW,
    imgH,
    currentImageEl,
    viewW,
    viewH
  } = args;

  const rect = currentImageEl?.getBoundingClientRect() || null;

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

  const offsetW = (vw - imgW) / 2;
  const offsetH = (vh - imgH) / 2;

  const xMin =
    scaledW <= vw
      ? -offsetW - (scaledW - vw) / 2
      : -(scaledW - vw) - offsetW;
  const xMax =
    scaledW <= vw
      ? -offsetW - (scaledW - vw) / 2
      : -offsetW;

  const yMin =
    scaledH <= vh
      ? -offsetH - (scaledH - vh) / 2
      : -(scaledH - vh) - offsetH;
  const yMax =
    scaledH <= vh
      ? -offsetH - (scaledH - vh) / 2
      : -offsetH;

  return {
    x: Limit(xMin, xMax),
    y: Limit(yMin, yMax),
    povX: PercentOfView(vw),
    povY: PercentOfView(vh),
  };
}