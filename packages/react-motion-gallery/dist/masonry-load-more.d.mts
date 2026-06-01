import { l as DataLoadMoreOptions, m as UseDataLoadMoreOptions, n as DataLoadMoreController } from './dataPlugins-DzaWlM6f.mjs';
import { M as MasonryPlugin } from './types-L2pRy8k4.mjs';
import { M as MasonryPlugin$1 } from './types-qMg7LB37.mjs';
import 'react';
import './responsiveNumber-CouEMJ9O.mjs';
import './force-C5m1QpdF.mjs';
import './skeleton-cache.mjs';
import './layout-BSjd7pwQ.mjs';
import './text-BBcRGVzn.mjs';

type MasonryLoadMoreOptions = DataLoadMoreOptions;
type UseMasonryLoadMoreOptions = UseDataLoadMoreOptions;
type MasonryLoadMorePlugin = MasonryPlugin & MasonryPlugin$1;
declare function masonryLoadMore(options: MasonryLoadMoreOptions): MasonryLoadMorePlugin;
declare function useMasonryLoadMore(options: UseMasonryLoadMoreOptions): DataLoadMoreController<MasonryLoadMorePlugin>;

export { type MasonryLoadMoreOptions, type MasonryLoadMorePlugin, type UseMasonryLoadMoreOptions, masonryLoadMore, useMasonryLoadMore };
