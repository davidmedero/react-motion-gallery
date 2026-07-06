import * as React from 'react';
import { m as SliderHandle } from './types-CGPPAn9i.mjs';
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
