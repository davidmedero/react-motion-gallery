import type { MasonryPlugin, MasonryPluginKind } from "../types";

export function createMasonryPlugin(
  kind: MasonryPluginKind,
  plugin: Omit<MasonryPlugin, "__rmgLightMasonryPlugin" | "kind"> = {}
): MasonryPlugin {
  return {
    __rmgLightMasonryPlugin: true,
    kind,
    ...plugin,
  };
}
