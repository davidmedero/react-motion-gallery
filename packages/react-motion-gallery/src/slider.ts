export { Slider, Slider as default } from "./Gallery/slider/default";
export { createSliderIndexChannel } from "./Gallery/slider/sliderSub";
export { useSliderReady } from "./slider-ready";

export type {
  SliderApi,
  SliderItemsApi,
  SliderNodeInput,
  SliderRemoveTarget,
} from "./Gallery/slider/types";
export type { IndexMode } from "./Gallery/api/types";
export type {
  CrossFade,
  CrossFadeWheel,
  CrossFadeWheelOptions,
  SliderAutoHeight,
  SliderAutoPlayTimer,
  SliderRevealOptions,
  SliderSkipSnaps,
  SliderSkipSnapsOptions,
  SliderOptions,
  SliderHandle,
  SliderPlugin,
  SliderPluginKind,
  ResponsiveHeightRule,
} from "./Gallery/slider/types";
export type { SliderReadyController } from "./slider-ready";
export type { SliderIndexChannel } from "./Gallery/slider/sliderSub";
