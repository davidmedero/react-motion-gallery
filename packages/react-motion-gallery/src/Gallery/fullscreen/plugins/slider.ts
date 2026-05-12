"use client";

import type { FullscreenSliderOptions } from "../types";
import { createLegacyFullscreenRuntimePlugin } from "./legacyRuntime";

export function fullscreenSlider(options?: FullscreenSliderOptions) {
  return createLegacyFullscreenRuntimePlugin(
    "slider",
    options ? { slider: options } : undefined
  );
}

