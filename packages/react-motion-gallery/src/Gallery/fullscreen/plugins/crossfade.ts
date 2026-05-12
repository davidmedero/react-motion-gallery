"use client";

import type { FullscreenCrossfadeOptions } from "../types";
import { createFullscreenPlugin } from "./create";

export function fullscreenCrossfade(options?: FullscreenCrossfadeOptions) {
  return createFullscreenPlugin("crossfade", {
    options: options ? { effects: { crossfade: options } } : undefined,
  });
}
