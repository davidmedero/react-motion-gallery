import * as React from 'react';
import { M as MasonryHandle } from './types-Br27DWP7.mjs';
import './responsiveNumber-CouEMJ9O.mjs';

type MasonryReadyController = {
    ref: React.RefCallback<MasonryHandle>;
    ready: boolean;
    handleRef: React.MutableRefObject<MasonryHandle | null>;
};
declare function useMasonryReady(): MasonryReadyController;

export { type MasonryReadyController, useMasonryReady };
