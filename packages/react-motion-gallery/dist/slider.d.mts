import * as React from 'react';
import { B as BreakpointMap } from './responsiveNumber-CouEMJ9O.mjs';
import { j as SliderOptions, r as SliderIndexChannel, k as SliderHandle } from './responsive-DRmZH1Q2.mjs';
export { C as CrossFade, d as CrossFadeWheel, e as CrossFadeWheelOptions, I as IndexMode, R as ResponsiveHeightRule, l as SliderApi, S as SliderAutoHeight, f as SliderAutoPlayTimer, m as SliderItemsApi, n as SliderNodeInput, p as SliderPlugin, q as SliderPluginKind, o as SliderRemoveTarget, g as SliderRevealOptions, h as SliderSkipSnaps, i as SliderSkipSnapsOptions, c as createSliderIndexChannel } from './responsive-DRmZH1Q2.mjs';
export { SliderReadyController, useSliderReady } from './slider-ready.mjs';
import './force-C5m1QpdF.mjs';
import './transitions-ChhEdSB6.mjs';
import './media.mjs';
import './plyrTypes-B3vioQaS.mjs';
import './types-CLMzNXt4.mjs';
import './text-BBcRGVzn.mjs';
import 'react-dom/client';

declare const Slider: React.ForwardRefExoticComponent<SliderOptions & {
    children?: React.ReactNode;
    breakpoints?: BreakpointMap;
    indexChannel?: SliderIndexChannel;
} & React.RefAttributes<SliderHandle>>;

export { Slider, SliderHandle, SliderIndexChannel, SliderOptions, Slider as default };
