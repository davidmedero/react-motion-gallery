import * as React from 'react';
import { a as GridHandle } from './types-BmnPcuoM.mjs';
import './force-C5m1QpdF.mjs';
import './responsiveNumber-CouEMJ9O.mjs';
import './layout-BOy4geKv.mjs';
import './text-BBcRGVzn.mjs';

type GridReadyController = {
    ref: React.RefCallback<GridHandle>;
    ready: boolean;
    handleRef: React.MutableRefObject<GridHandle | null>;
};
declare function useGridReady(): GridReadyController;

export { type GridReadyController, useGridReady };
