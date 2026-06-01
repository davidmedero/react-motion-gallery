import * as React from 'react';
import { a as GridHandle } from './types-DcUQOXvS.mjs';
import './force-C5m1QpdF.mjs';
import './responsiveNumber-CouEMJ9O.mjs';
import './skeleton-cache.mjs';
import './layout-BSjd7pwQ.mjs';
import './text-BBcRGVzn.mjs';

type GridReadyController = {
    ref: React.RefCallback<GridHandle>;
    ready: boolean;
    handleRef: React.MutableRefObject<GridHandle | null>;
};
declare function useGridReady(): GridReadyController;

export { type GridReadyController, useGridReady };
