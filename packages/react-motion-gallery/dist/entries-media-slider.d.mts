import * as React from 'react';
import { a as EntriesMediaContainerRender } from './index-DWKBlQMl.mjs';
import { j as SliderOptions, k as SliderHandle } from './responsive-DRmZH1Q2.mjs';
import './media.mjs';
import './responsiveNumber-CouEMJ9O.mjs';
import './force-C5m1QpdF.mjs';
import './transitions-ChhEdSB6.mjs';
import './plyrTypes-B3vioQaS.mjs';
import './types-CLMzNXt4.mjs';
import './text-BBcRGVzn.mjs';
import 'react-dom/client';

type EntriesSliderMediaVirtualizationOptions = {
    enabled?: boolean;
    overscan?: number;
    minItems?: number;
    placeholder?: React.ReactNode | ((args: {
        index: number;
        count: number;
    }) => React.ReactNode);
};
type EntriesSliderMediaOptions = {
    sliderObject?: SliderOptions;
    gap?: number;
    initialHeight?: number | string;
    columns?: number;
    sliderImagesReady?: any;
    renderFsCaption?: any;
    entrySliderRefs?: React.RefObject<Array<SliderHandle | null>>;
    virtualization?: boolean | EntriesSliderMediaVirtualizationOptions;
};
declare function createEntriesSliderMedia(opts?: EntriesSliderMediaOptions): EntriesMediaContainerRender;

export { createEntriesSliderMedia };
