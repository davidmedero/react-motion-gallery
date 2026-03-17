import * as React from 'react';
import { a as BreakpointMap } from './responsive-CvE5dTnP.mjs';
import { S as SliderOptions, a as SliderHandle } from './types-9fvdyhuG.mjs';
export { R as ResponsiveHeightRule } from './types-9fvdyhuG.mjs';
import { S as SliderIndexChannel } from './sliderSub-DDPjywVp.mjs';
export { c as createSliderIndexChannel } from './sliderSub-DDPjywVp.mjs';
export { I as IndexMode } from './types-tb9Qf2Mj.mjs';
import './elements-Bd1vm4Uk.mjs';

declare const Slider: React.ForwardRefExoticComponent<SliderOptions & {
    children?: React.ReactNode;
    breakpoints?: BreakpointMap;
    expandableImageRefs?: React.RefObject<Array<HTMLImageElement | null>>;
    indexChannel?: SliderIndexChannel;
} & React.RefAttributes<SliderHandle>>;

declare const DEFAULT_SLIDER: {
    readonly layout: {
        readonly gap: 20;
    };
    readonly direction: {
        readonly dir: "ltr";
        readonly axis: "x";
    };
    readonly align: "start";
    readonly scroll: {
        readonly groupCells: false;
        readonly skipSnaps: false;
        readonly freeScroll: false;
        readonly loop: false;
    };
    readonly lazyLoad: {
        readonly enabled: false;
        readonly spinner: true;
        readonly spinnerClassName: "";
        readonly spinnerStyle: {};
    };
    readonly controls: {
        readonly arrows: {
            readonly enabled: true;
            readonly arrow: {};
            readonly prev: {};
            readonly next: {};
        };
        readonly dots: {
            readonly enabled: true;
            readonly root: {};
            readonly dot: {};
        };
        readonly progress: {
            readonly enabled: false;
            readonly root: {};
            readonly bar: {};
        };
        readonly ripple: {
            readonly enabled: true;
            readonly className: "";
        };
    };
    readonly auto: {
        readonly play: {
            readonly enabled: false;
            readonly speedMs: 3000;
            readonly pauseMs: 1000;
            readonly pauseOnHover: true;
        };
        readonly scroll: {
            readonly enabled: false;
            readonly speedMs: 3000;
            readonly pauseMs: 1000;
            readonly pauseOnHover: true;
        };
    };
    readonly motion: {
        readonly selectDuration: 25;
        readonly freeScrollDuration: 43;
        readonly friction: 0.68;
    };
};

export { DEFAULT_SLIDER, Slider, SliderHandle, SliderIndexChannel, SliderOptions, Slider as default };
