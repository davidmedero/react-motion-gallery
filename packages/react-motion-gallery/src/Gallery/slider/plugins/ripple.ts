import type { SliderRipple } from "../types";
import { createSliderPlugin } from "./create";

export function sliderRipple(_options: SliderRipple = {}) {
  return createSliderPlugin("ripple", { options: _options });
}

export type { SliderRipple };
