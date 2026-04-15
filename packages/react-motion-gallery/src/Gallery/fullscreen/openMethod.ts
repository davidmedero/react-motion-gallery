import type { FullscreenOpenMethod } from "../api/types";
import type { MediaItem } from "../shared/types/media";

export function resolveFullscreenControllerOpenMethod(
  item: MediaItem | undefined,
  requested: FullscreenOpenMethod | undefined,
  forceFade: boolean
): FullscreenOpenMethod {
  if (forceFade) return "fade";

  const req: FullscreenOpenMethod = requested ?? "scale";
  if (req === "fade") return "fade";

  if (!item || item.kind !== "image") return "fade";

  return "scale";
}
