import * as React from 'react';
import { k as SliderHandle } from './types-D9WBOrx6.mjs';
import './responsiveNumber-CouEMJ9O.mjs';
import './force-C5m1QpdF.mjs';
import './media.mjs';

type SliderReadyController = {
    ref: React.RefCallback<SliderHandle>;
    ready: boolean;
    handleRef: React.MutableRefObject<SliderHandle | null>;
};
declare function useSliderReady(): SliderReadyController;

export { type SliderReadyController, useSliderReady };
