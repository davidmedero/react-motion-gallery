"use client";

import type { FullscreenZoomPanOptions } from "../types";
import { useFullscreenZoomPanRuntime } from "../zoomPanRuntime";
import { createFullscreenPlugin } from "./create";

export function fullscreenZoomPan(options?: FullscreenZoomPanOptions) {
  return createFullscreenPlugin(
    "zoom-pan",
    {
      options: options ? { zoom: options } : undefined,
      runtime: {
        useZoomPanRuntime: useFullscreenZoomPanRuntime,
      },
    }
  );
}
