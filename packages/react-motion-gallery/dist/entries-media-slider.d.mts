import * as React from 'react';
import { a as EntriesMediaContainerRender } from './index--Rr6axdJ.mjs';
import { l as SliderOptions, m as SliderHandle } from './types-CGPPAn9i.mjs';
import './responsive-Bq9VSmbl.mjs';
import './types-DTSXOwzF.mjs';
import './responsiveNumber-CouEMJ9O.mjs';
import './force-C5m1QpdF.mjs';
import './transitions-ChhEdSB6.mjs';
import './media.mjs';
import './plyrTypes-B3vioQaS.mjs';
import './types-CLMzNXt4.mjs';
import './text-BBcRGVzn.mjs';
import './infiniteScrollTrigger-BluBDW9o.mjs';
import './types-BtQK91-K.mjs';
import 'react-dom/client';

type EntriesSliderMediaOptions = {
    sliderObject?: SliderOptions;
    gap?: number;
    initialHeight?: number | string;
    columns?: number;
    sliderImagesReady?: any;
    renderFsCaption?: any;
    entrySliderRefs?: React.RefObject<Array<SliderHandle | null>>;
};
declare function createEntriesSliderMedia(opts?: EntriesSliderMediaOptions): EntriesMediaContainerRender;

export { createEntriesSliderMedia };
