import * as React from 'react';
import { B as BreakpointMap } from './responsiveNumber-CouEMJ9O.mjs';
import { i as SliderOptions, q as SliderIndexChannel, j as SliderHandle } from './types-BiXSaEk7.mjs';
export { C as CrossFade, d as CrossFadeWheel, e as CrossFadeWheelOptions, I as IndexMode, R as ResponsiveHeightRule, k as SliderApi, S as SliderAutoHeight, f as SliderAutoPlayTimer, l as SliderItemsApi, m as SliderNodeInput, o as SliderPlugin, p as SliderPluginKind, n as SliderRemoveTarget, g as SliderSkipSnaps, h as SliderSkipSnapsOptions, c as createSliderIndexChannel } from './types-BiXSaEk7.mjs';
export { SliderReadyController, useSliderReady } from './slider-ready.mjs';
import './force-C5m1QpdF.mjs';
import './media.mjs';

declare const Slider: React.ForwardRefExoticComponent<SliderOptions & {
    children?: React.ReactNode;
    breakpoints?: BreakpointMap;
    indexChannel?: SliderIndexChannel;
} & React.RefAttributes<SliderHandle>>;

export { Slider, SliderHandle, SliderIndexChannel, SliderOptions, Slider as default };
