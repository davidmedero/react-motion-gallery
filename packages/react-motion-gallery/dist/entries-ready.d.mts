import * as React from 'react';
import { E as EntriesHandle } from './responsive-Bw0ub6Hv.mjs';
import './types-uhDRb0mo.mjs';
import './responsiveNumber-CouEMJ9O.mjs';
import './force-C5m1QpdF.mjs';
import './types-D9WBOrx6.mjs';
import './media.mjs';
import './transitions-ChhEdSB6.mjs';
import './plyrTypes-B3vioQaS.mjs';
import './types-CLMzNXt4.mjs';
import './text-BBcRGVzn.mjs';
import './types-bZ-lDlKM.mjs';
import 'react-dom/client';

type EntriesReadyController = {
    ref: React.RefCallback<EntriesHandle>;
    ready: boolean;
    handleRef: React.MutableRefObject<EntriesHandle | null>;
};
type UseEntriesReadyOptions = {
    dataReady?: boolean;
};
declare function useEntriesReady(options?: UseEntriesReadyOptions): EntriesReadyController;

export { EntriesHandle, type EntriesReadyController, type UseEntriesReadyOptions, useEntriesReady };
