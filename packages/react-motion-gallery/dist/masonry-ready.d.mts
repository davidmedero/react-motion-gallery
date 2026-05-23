import * as React from 'react';
import { M as MasonryHandle } from './types-plwyER1z.mjs';
import './responsiveNumber-CouEMJ9O.mjs';

type MasonryReadyController = {
    ref: React.RefCallback<MasonryHandle>;
    ready: boolean;
    handleRef: React.MutableRefObject<MasonryHandle | null>;
};
declare function useMasonryReady(): MasonryReadyController;

export { type MasonryReadyController, useMasonryReady };
