import { MasonryOptions } from "./types";

export const DEFAULT_MASONRY: Required<Pick<MasonryOptions, "placement" | "fullscreenTrigger">> = {
  placement: "balanced",
  fullscreenTrigger: "media",
};
