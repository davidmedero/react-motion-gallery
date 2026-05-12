export const SLIDER_VIDEO_CLONE_ORIGIN_REBASE_THRESHOLD_PX = 1;

export function shouldRebaseSliderVideoCloneAtOrigin(args: {
  wrap: boolean;
  contentSize: number;
  location: number;
  selectedIndex: number;
  origin?: number;
  threshold?: number;
}) {
  const {
    wrap,
    contentSize,
    location,
    selectedIndex,
    origin = 0,
    threshold = SLIDER_VIDEO_CLONE_ORIGIN_REBASE_THRESHOLD_PX,
  } = args;

  if (!wrap) return false;
  if (selectedIndex !== 0) return false;
  if (!Number.isFinite(contentSize) || contentSize <= 0) return false;
  if (!Number.isFinite(location) || !Number.isFinite(origin)) return false;

  return Math.abs(location + contentSize - origin) <= Math.max(0, threshold);
}
