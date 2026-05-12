"use client";

import type { FullscreenCaptionOptions } from "../types";
import {
  renderFullscreenCrossfadeSlides,
  renderFullscreenSlides,
} from "../renderFullscreenSlides";
import { createFullscreenPlugin } from "./create";

export function fullscreenCaptions(options?: FullscreenCaptionOptions) {
  return createFullscreenPlugin(
    "captions",
    {
      options: options ? { caption: options } : undefined,
      runtime: {
        renderSlides: renderFullscreenSlides,
        renderCrossfadeSlides: renderFullscreenCrossfadeSlides,
      },
    }
  );
}
