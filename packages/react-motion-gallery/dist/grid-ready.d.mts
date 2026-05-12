import * as React from 'react';
import { G as GridHandle } from './types-Do4Pq-Td.mjs';
import './responsiveNumber-CouEMJ9O.mjs';

type GridReadyController = {
    ref: React.RefCallback<GridHandle>;
    ready: boolean;
    handleRef: React.MutableRefObject<GridHandle | null>;
};
declare function useGridReady(): GridReadyController;

export { type GridReadyController, useGridReady };
