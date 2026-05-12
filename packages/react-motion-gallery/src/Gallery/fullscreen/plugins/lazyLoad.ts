"use client";

import type { FullscreenLazyLoadOptions } from "../types";
import {
  renderFullscreenCrossfadeSlides,
  renderFullscreenSlides,
} from "../renderFullscreenSlides";
import { createFullscreenPlugin } from "./create";

export function fullscreenLazyLoad(options?: FullscreenLazyLoadOptions) {
  return createFullscreenPlugin(
    "lazy-load",
    {
      options: options ? { lazyLoad: options } : undefined,
      runtime: {
        renderSlides: renderFullscreenSlides,
        renderCrossfadeSlides: renderFullscreenCrossfadeSlides,
      },
    }
  );
}
