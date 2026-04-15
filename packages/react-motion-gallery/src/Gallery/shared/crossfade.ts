export function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function resolveCrossfadeDragTarget(args: {
  currentIndex: number;
  delta: number;
  slideCount: number;
  wrap: boolean;
}) {
  const { currentIndex, delta, slideCount, wrap } = args;
  if (slideCount <= 1) return currentIndex;
  if (Math.abs(delta) < 0.5) return currentIndex;

  const requested = delta < 0 ? currentIndex + 1 : currentIndex - 1;

  if (wrap) {
    return ((requested % slideCount) + slideCount) % slideCount;
  }

  return Math.max(0, Math.min(slideCount - 1, requested));
}

export function shouldCompleteCrossfadeDrag(args: {
  progress: number;
  force: number;
  delta: number;
}) {
  const { progress, force, delta } = args;
  const normalizedProgress = clamp01(progress);

  if (normalizedProgress >= 0.5) return true;

  const dragDir = Math.sign(delta);
  const forceDir = Math.sign(force);

  return forceDir !== 0 && dragDir !== 0 && forceDir === dragDir && Math.abs(force) >= 0.05;
}
