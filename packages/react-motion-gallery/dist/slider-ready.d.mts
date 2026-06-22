import * as React from 'react';
import { k as SliderHandle } from './responsive-DRmZH1Q2.mjs';
import './responsiveNumber-CouEMJ9O.mjs';
import './force-C5m1QpdF.mjs';
import './transitions-ChhEdSB6.mjs';
import './media.mjs';
import './plyrTypes-B3vioQaS.mjs';
import './types-CLMzNXt4.mjs';
import './text-BBcRGVzn.mjs';
import 'react-dom/client';

type SliderReadyController = {
    ref: React.RefCallback<SliderHandle>;
    ready: boolean;
    handleRef: React.MutableRefObject<SliderHandle | null>;
};
declare function useSliderReady(): SliderReadyController;

export { type SliderReadyController, useSliderReady };
