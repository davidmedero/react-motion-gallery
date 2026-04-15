export {
  clamp01,
  resolveCrossfadeDragTarget as resolveSliderCrossfadeDragTarget,
  shouldCompleteCrossfadeDrag as shouldCompleteSliderDragCrossfade,
} from "../shared/crossfade";

export function shouldStartSliderControlsCrossfade(args: {
  enabled?: boolean;
  busy: boolean;
  fromIndex: number;
  toIndex: number;
}) {
  const { enabled, busy, fromIndex, toIndex } = args;
  if (!enabled || busy) return false;
  return fromIndex !== toIndex;
}
