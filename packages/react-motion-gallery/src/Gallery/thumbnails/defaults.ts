import type { ThumbnailsOptions } from "./types";

export const DEFAULT_THUMBNAILS: Required<
  Pick<ThumbnailsOptions, "layout" | "scroll" | "motion">
> = {
  layout: {
    position: "bottom",
    gap: 8,
    center: false,
  },
  scroll: {
    freeScroll: true,
    groupCells: false,
    loop: false,
    skipSnaps: false,
    centerActiveThumb: false,
  },
  motion: {
    selectDuration: 25,
    freeScrollDuration: 43,
    friction: 0.68,
  },
};