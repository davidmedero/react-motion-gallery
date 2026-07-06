import * as React from 'react';
import { B as BreakpointMap } from './responsiveNumber-CouEMJ9O.mjs';
import { l as SliderOptions, t as SliderIndexChannel, m as SliderHandle } from './types-CGPPAn9i.mjs';
export { C as CrossFade, d as CrossFadeWheel, e as CrossFadeWheelOptions, I as IndexMode, R as ResponsiveHeightRule, n as SliderApi, S as SliderAutoHeight, f as SliderAutoPlayTimer, o as SliderItemsApi, p as SliderNodeInput, r as SliderPlugin, s as SliderPluginKind, q as SliderRemoveTarget, g as SliderRevealOptions, h as SliderSkipSnaps, i as SliderSkipSnapsOptions, j as SliderUnderflowAlign, k as SliderVirtualizationOptions, c as createSliderIndexChannel } from './types-CGPPAn9i.mjs';
export { SliderReadyController, useSliderReady } from './slider-ready.mjs';
import './force-C5m1QpdF.mjs';
import './media.mjs';

declare const Slider: React.ForwardRefExoticComponent<SliderOptions & {
    children?: React.ReactNode;
    breakpoints?: BreakpointMap;
    indexChannel?: SliderIndexChannel;
} & React.RefAttributes<SliderHandle>>;

export { Slider, SliderHandle, SliderIndexChannel, SliderOptions, Slider as default };
