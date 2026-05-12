"use client";

import type { FullscreenControlsOptions } from "../types";
import { createFullscreenPlugin } from "./create";

export function fullscreenControls(options?: FullscreenControlsOptions) {
  return createFullscreenPlugin(
    "controls",
    { options: options ? { controls: options } : undefined }
  );
}
