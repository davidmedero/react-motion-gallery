import { c as EntriesLoadMoreOptions, f as EntriesPlugin } from './responsive-Bw0ub6Hv.mjs';
import * as React from 'react';
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

type UseEntriesLoadMoreOptions = {
    initialVisibleCount?: number;
    pageSize: number;
    total?: number;
    mode?: EntriesLoadMoreOptions["mode"];
    loading?: boolean;
    enabled?: boolean;
};
type EntriesLoadMoreController = {
    visibleCount: number;
    pageSize: number;
    canLoadMore: boolean;
    setVisibleCount: React.Dispatch<React.SetStateAction<number>>;
    loadMore: () => void;
    reset: () => void;
    plugin: ReturnType<typeof entriesLoadMore>;
};
declare function entriesLoadMore(options: EntriesLoadMoreOptions): EntriesPlugin<"load-more">;
declare function useEntriesLoadMore(options: UseEntriesLoadMoreOptions): EntriesLoadMoreController;

export { type EntriesLoadMoreController, EntriesLoadMoreOptions, type UseEntriesLoadMoreOptions, entriesLoadMore, useEntriesLoadMore };
