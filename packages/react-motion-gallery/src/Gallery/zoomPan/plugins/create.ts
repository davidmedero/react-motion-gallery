import type { ZoomPanPlugin, ZoomPanPluginKind } from "../types";

export function createZoomPanPlugin<TOptions>(
  kind: ZoomPanPluginKind,
  options?: TOptions
): ZoomPanPlugin<TOptions> {
  return {
    __rmgZoomPanPlugin: true,
    kind,
    options,
  };
}
