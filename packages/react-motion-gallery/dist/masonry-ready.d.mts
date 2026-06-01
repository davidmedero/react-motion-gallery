import * as React from 'react';
import { g as MasonryHandle } from './types-L2pRy8k4.mjs';
import './responsiveNumber-CouEMJ9O.mjs';
import './force-C5m1QpdF.mjs';
import './skeleton-cache.mjs';
import './layout-BSjd7pwQ.mjs';
import './text-BBcRGVzn.mjs';

type MasonryReadyController = {
    ref: React.RefCallback<MasonryHandle>;
    ready: boolean;
    handleRef: React.MutableRefObject<MasonryHandle | null>;
};
declare function useMasonryReady(): MasonryReadyController;

export { type MasonryReadyController, useMasonryReady };
