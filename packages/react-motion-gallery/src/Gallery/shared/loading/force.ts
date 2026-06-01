import type { CSSProperties } from "react";

export type LoadingForceOptions =
  | boolean
  | {
      enabled?: boolean;
      showContent?: boolean;
      skeletonOpacity?: number;
    };

export type ResolvedLoadingForceOptions = {
  enabled: boolean;
  showContent: boolean;
  skeletonOpacity: number;
};

export type CompareLoadingLayerVisualStateArgs = {
  loadingActive: boolean;
  loadingForced?: LoadingForceOptions;
  contentReady: boolean;
};

export type CompareLoadingLayerVisualState = {
  compareMode: boolean;
  contentBlocked: boolean;
  loadingLayerOpacity: number;
};

export type CompareLoadingLayerStyleArgs = {
  enterMs?: number;
  exitMs: number;
  compareMode: boolean;
  loadingLayerOpacity: number;
  opacityVarName: string;
  hidden?: boolean;
};

export const DEFAULT_COMPARE_SKELETON_OPACITY = 0.5;

function clampOpacity(value: number, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(0, Math.min(1, value));
}

export function resolveLoadingForceOptions(
  force: LoadingForceOptions | undefined
): ResolvedLoadingForceOptions {
  if (force === true) {
    return {
      enabled: true,
      showContent: false,
      skeletonOpacity: 1,
    };
  }

  if (!force || typeof force !== 'object') {
    return {
      enabled: false,
      showContent: false,
      skeletonOpacity: 1,
    };
  }

  const enabled = force.enabled ?? true;
  const showContent = enabled && force.showContent === true;
  const fallbackOpacity = showContent ? DEFAULT_COMPARE_SKELETON_OPACITY : 1;

  return {
    enabled,
    showContent,
    skeletonOpacity: clampOpacity(force.skeletonOpacity ?? fallbackOpacity, fallbackOpacity),
  };
}

export function resolveCompareLoadingLayerVisualState(
  args: CompareLoadingLayerVisualStateArgs
): CompareLoadingLayerVisualState {
  const force = resolveLoadingForceOptions(args.loadingForced);
  const showComparisonContent = force.showContent && args.contentReady;

  return {
    compareMode: args.loadingActive && showComparisonContent,
    contentBlocked: args.loadingActive && !showComparisonContent,
    loadingLayerOpacity: args.loadingActive && showComparisonContent ? force.skeletonOpacity : 1,
  };
}

export function resolveCompareLoadingLayerStyle(
  args: CompareLoadingLayerStyleArgs
): CSSProperties & Record<string, any> {
  const exitMs = Math.max(0, args.exitMs);
  const enterMs = Math.max(0, args.enterMs ?? exitMs);
  const style: CSSProperties & Record<string, any> = {
    ["--rmg-loading-fade-duration" as any]: `${exitMs}ms`,
    ["--rmg-loading-fade-enter-duration" as any]: `${enterMs}ms`,
    ["--rmg-loading-fade-exit-duration" as any]: `${exitMs}ms`,
  };

  if (args.hidden) {
    style[args.opacityVarName as any] = 0;
    return style;
  }

  // Leave the default opaque state in CSS so exit classes can animate to zero.
  if (args.compareMode) {
    style[args.opacityVarName as any] = args.loadingLayerOpacity;
  }

  return style;
}
