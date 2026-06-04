import * as React from 'react';
import { a as EntriesMediaContainerRender } from './index-DUT57ncN.mjs';
import { j as SliderOptions, k as SliderHandle } from './types-D9WBOrx6.mjs';
import './responsive-BgOmwHgG.mjs';
import './types-uhDRb0mo.mjs';
import './responsiveNumber-CouEMJ9O.mjs';
import './force-C5m1QpdF.mjs';
import './transitions-ChhEdSB6.mjs';
import './media.mjs';
import './plyrTypes-B3vioQaS.mjs';
import './types-CLMzNXt4.mjs';
import './text-BBcRGVzn.mjs';
import './types-bZ-lDlKM.mjs';
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
