import { l as DataLoadMoreOptions, m as UseDataLoadMoreOptions, n as DataLoadMoreController } from './dataPlugins-CsUwdsuu.mjs';
import { M as MasonryPlugin } from './types-Bg0qLhxl.mjs';
import { M as MasonryPlugin$1 } from './types-qMg7LB37.mjs';
import 'react';
import './infiniteScrollTrigger-BluBDW9o.mjs';

type MasonryLoadMoreOptions = DataLoadMoreOptions;
type UseMasonryLoadMoreOptions = UseDataLoadMoreOptions;
type MasonryLoadMorePlugin = MasonryPlugin & MasonryPlugin$1;
declare function masonryLoadMore(options: MasonryLoadMoreOptions): MasonryLoadMorePlugin;
declare function useMasonryLoadMore(options: UseMasonryLoadMoreOptions): DataLoadMoreController<MasonryLoadMorePlugin>;

export { type MasonryLoadMoreOptions, type MasonryLoadMorePlugin, type UseMasonryLoadMoreOptions, masonryLoadMore, useMasonryLoadMore };
