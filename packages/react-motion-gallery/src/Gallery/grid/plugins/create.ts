import type { GridPlugin, GridPluginKind } from "../types";

export function createGridPlugin(
  kind: GridPluginKind,
  plugin: Omit<GridPlugin, "__rmgGridPlugin" | "kind"> = {}
): GridPlugin {
  return {
    __rmgGridPlugin: true,
    kind,
    ...plugin,
  };
}
