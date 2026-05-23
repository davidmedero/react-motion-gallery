import type { ResolvedZoomPanOptions } from "./types";

export const DEFAULT_ZOOM_PAN: Required<Omit<ResolvedZoomPanOptions, "plugins">> = {
  clickZoomLevel: 2.5,
  maxZoomLevel: 3,
  panDuration: 43,
  panFriction: 0.68,
};
