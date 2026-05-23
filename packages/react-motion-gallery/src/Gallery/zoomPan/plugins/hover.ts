"use client";

import type { ZoomPanHoverOptions } from "../types";
import { createZoomPanPlugin } from "./create";

export function zoomPanHover(options: ZoomPanHoverOptions = {}) {
  return createZoomPanPlugin("hover", options);
}
