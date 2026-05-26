import * as React from 'react';
import { a as GridHandle } from './types-CYB4fl6-.mjs';
import './responsiveNumber-CouEMJ9O.mjs';

type GridReadyController = {
    ref: React.RefCallback<GridHandle>;
    ready: boolean;
    handleRef: React.MutableRefObject<GridHandle | null>;
};
declare function useGridReady(): GridReadyController;

export { type GridReadyController, useGridReady };
