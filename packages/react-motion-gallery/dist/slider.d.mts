import * as React from 'react';
import { c as BreakpointMap } from './responsive-D_xhZmVI.mjs';
export { I as IndexMode } from './responsive-D_xhZmVI.mjs';
import { S as SliderOptions, a as SliderHandle } from './types-DY058l5M.mjs';
export { R as ResponsiveHeightRule } from './types-DY058l5M.mjs';
import { S as SliderIndexChannel } from './sliderSub-Bo6Y8as_.mjs';
export { c as createSliderIndexChannel } from './sliderSub-Bo6Y8as_.mjs';
import './plyrTypes-Cq4C3ul5.mjs';
import 'plyr';
import './types-Dhh8xfHo.mjs';
import './controls-SpWg1Kgt.mjs';
import './text-Cl2tR8oO.mjs';

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
        readonly scrollbar: {
            readonly enabled: false;
            readonly root: {};
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
            readonly speedMs: 0.3;
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
