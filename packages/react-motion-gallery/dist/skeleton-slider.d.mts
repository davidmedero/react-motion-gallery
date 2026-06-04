import * as react_jsx_runtime from 'react/jsx-runtime';
import { R as ResponsiveNumber, B as BreakpointMap } from './responsiveNumber-CouEMJ9O.mjs';
import { SkeletonCacheSnapshot } from './skeleton-cache.mjs';
import { RestoredSliderSkeletonProps as SliderSkeletonProps$1, SliderSkeletonSpec } from './skeleton-slider-restore.mjs';
export { SkeletonNode, SkeletonSliderLayout, SliderSkeletonNode, SliderSkeletonSlot } from './skeleton-slider-restore.mjs';
export { SkeletonForceOptions, SkeletonTimingOptions } from './skeleton-base.mjs';
import 'react';
import './types-D9WBOrx6.mjs';
import './force-C5m1QpdF.mjs';
import './media.mjs';
import './layout-BOy4geKv.mjs';
import './text-BBcRGVzn.mjs';
import './transitions-ChhEdSB6.mjs';

type SliderSkeletonProps = Omit<SliderSkeletonProps$1, "cache" | "restore">;
declare function buildScopedInitialHeightCss(args: {
    scopeId: string;
    skeletonSpec: SliderSkeletonSpec;
    responsiveCount: ResponsiveNumber | undefined;
    fallbackCount: number;
    breakpointMap: BreakpointMap;
    centerFirstSpacer?: boolean;
    cacheSnapshot?: SkeletonCacheSnapshot | null;
}): string;
declare function SliderSkeleton(props: SliderSkeletonProps): react_jsx_runtime.JSX.Element;

export { SliderSkeleton as Skeleton, SliderSkeleton, type SliderSkeletonProps, SliderSkeletonSpec, buildScopedInitialHeightCss, SliderSkeleton as default };
