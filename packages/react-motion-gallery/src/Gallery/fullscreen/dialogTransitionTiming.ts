import {
  resolveFullscreenIntroDurationMs,
  resolveFullscreenIntroEasing,
} from "./introTiming";
import type {
  FullscreenDialogOptions,
  FullscreenDialogTransitionOptions,
  FullscreenEffectsOptions,
} from "./types";

function resolveFiniteDuration(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, value)
    : null;
}

function resolveNonEmptyEasing(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

export function resolveFullscreenDialogSwitchTransitionOptions(args: {
  options?: FullscreenDialogTransitionOptions;
  dialog?: FullscreenDialogOptions;
  effects?: FullscreenEffectsOptions;
}) {
  const durationMs =
    resolveFiniteDuration(args.options?.durationMs) ??
    resolveFiniteDuration(args.dialog?.switchOpacityDuration) ??
    resolveFiniteDuration(args.dialog?.opacityDuration) ??
    resolveFullscreenIntroDurationMs(args.effects?.introDuration, "fade");

  const easing =
    resolveNonEmptyEasing(args.options?.easing) ??
    resolveNonEmptyEasing(args.dialog?.switchOpacityEasing) ??
    resolveNonEmptyEasing(args.dialog?.opacityEasing) ??
    resolveFullscreenIntroEasing(args.effects?.introEasing, "fade");

  return {
    durationMs,
    easing,
  };
}
