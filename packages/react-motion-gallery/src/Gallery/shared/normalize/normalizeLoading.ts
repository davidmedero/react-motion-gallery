import { LoadingOptions } from "../types/transitions";

export function normalizeLoading(src?: LoadingOptions) {
  return {
    isLoading: src?.isLoading,
    skeletonCount: src?.skeletonCount,
    renderLoading: src?.renderLoading,
    shimmer: src?.shimmer,
    ratios: src?.ratios
  };
}