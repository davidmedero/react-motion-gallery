import * as React from 'react';
import { c as MasonryHandle } from './types-Cc37Drgz.mjs';
import './responsiveNumber-CouEMJ9O.mjs';

type MasonryReadyController = {
    ref: React.RefCallback<MasonryHandle>;
    ready: boolean;
    handleRef: React.MutableRefObject<MasonryHandle | null>;
};
declare function useMasonryReady(): MasonryReadyController;

export { type MasonryReadyController, useMasonryReady };
