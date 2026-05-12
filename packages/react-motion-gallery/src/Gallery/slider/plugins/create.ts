import type { SliderPlugin, SliderPluginKind } from "../types";

export function createSliderPlugin(
  kind: SliderPluginKind,
  plugin: Omit<SliderPlugin, "__rmgSliderPlugin" | "kind"> = {}
): SliderPlugin {
  return {
    __rmgSliderPlugin: true,
    kind,
    ...plugin,
  };
}
