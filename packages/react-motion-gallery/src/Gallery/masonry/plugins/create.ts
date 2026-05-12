import type { MasonryPlugin, MasonryPluginKind } from "../types";

export function createMasonryPlugin(
  kind: MasonryPluginKind,
  plugin: Omit<MasonryPlugin, "__rmgMasonryPlugin" | "kind"> = {}
): MasonryPlugin {
  return {
    __rmgMasonryPlugin: true,
    kind,
    ...plugin,
  };
}
