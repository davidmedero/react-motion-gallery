import {
  clamp01,
  DEFAULT_CROSSFADE_WHEEL_COMMIT_THRESHOLD,
  DEFAULT_CROSSFADE_WHEEL_SENSITIVITY,
  DEFAULT_CROSSFADE_WHEEL_SESSION_GAP_MS,
  resolveCrossfadeDragTarget,
  resolveCrossfadeWheelOptions,
  resolveCrossfadeWheelProgress,
  resolveCrossfadeWheelTarget,
  shouldCompleteCrossfadeDrag,
  shouldCompleteCrossfadeWheel,
  shouldTreatCrossfadeWheelAsSameSession,
} from "../shared/crossfade";

export {
  clamp01,
  DEFAULT_CROSSFADE_WHEEL_COMMIT_THRESHOLD as DEFAULT_SLIDER_CROSSFADE_WHEEL_COMMIT_THRESHOLD,
  DEFAULT_CROSSFADE_WHEEL_SENSITIVITY as DEFAULT_SLIDER_CROSSFADE_WHEEL_SENSITIVITY,
  DEFAULT_CROSSFADE_WHEEL_SESSION_GAP_MS as DEFAULT_SLIDER_CROSSFADE_WHEEL_SESSION_GAP_MS,
  resolveCrossfadeDragTarget as resolveSliderCrossfadeDragTarget,
  resolveCrossfadeWheelProgress as resolveSliderWheelCrossfadeProgress,
  resolveCrossfadeWheelTarget as resolveSliderWheelCrossfadeTarget,
  shouldCompleteCrossfadeWheel as shouldCompleteSliderWheelCrossfade,
  shouldCompleteCrossfadeDrag as shouldCompleteSliderDragCrossfade,
  shouldTreatCrossfadeWheelAsSameSession as shouldTreatSliderWheelAsSameSession,
};

type SharedWheelOptionsArgs = Parameters<typeof resolveCrossfadeWheelOptions>[0];

export function resolveSliderWheelCrossfadeOptions(
  args: Omit<SharedWheelOptionsArgs, "defaults">
) {
  return resolveCrossfadeWheelOptions({
    ...args,
    defaults: {
      sensitivity: DEFAULT_CROSSFADE_WHEEL_SENSITIVITY,
      commitThreshold: DEFAULT_CROSSFADE_WHEEL_COMMIT_THRESHOLD,
      sessionGapMs: DEFAULT_CROSSFADE_WHEEL_SESSION_GAP_MS,
    },
  });
}

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
