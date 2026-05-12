import * as React from 'react';
import { G as GridHandle } from './types-BlFwyRVQ.mjs';
import './responsiveNumber-CouEMJ9O.mjs';
import './lazy-dGoYpcRa.mjs';

type GridReadyController = {
    ref: React.RefCallback<GridHandle>;
    ready: boolean;
    handleRef: React.MutableRefObject<GridHandle | null>;
};
declare function useGridReady(): GridReadyController;

export { type GridReadyController, useGridReady };
