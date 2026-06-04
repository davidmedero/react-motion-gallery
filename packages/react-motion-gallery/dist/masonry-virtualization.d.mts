import { p as DataVirtualizationOptions } from './dataPlugins-C91mlyu6.mjs';
import { M as MasonryPlugin } from './types-Bg0qLhxl.mjs';
import { M as MasonryPlugin$1 } from './types-qMg7LB37.mjs';
import 'react';

type MasonryVirtualizationOptions = DataVirtualizationOptions;
type UseMasonryVirtualizerOptions = MasonryVirtualizationOptions;
type MasonryVirtualizationPlugin = MasonryPlugin & MasonryPlugin$1;
declare function masonryVirtualization(options?: MasonryVirtualizationOptions): MasonryVirtualizationPlugin;
declare function useMasonryVirtualizer(options?: UseMasonryVirtualizerOptions): MasonryVirtualizationPlugin;

export { type MasonryVirtualizationOptions, type MasonryVirtualizationPlugin, type UseMasonryVirtualizerOptions, masonryVirtualization, useMasonryVirtualizer };
