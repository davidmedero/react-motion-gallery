import * as react_jsx_runtime from 'react/jsx-runtime';
import { R as ResponsiveNumber, B as BreakpointMap } from './responsiveNumber-CouEMJ9O.mjs';
import { SkeletonCacheSnapshot } from './skeleton-cache.mjs';
import { RestoredSliderSkeletonProps as SliderSkeletonProps$1, SliderSkeletonSpec } from './skeleton-slider-restore.mjs';
export { SkeletonNode, SkeletonSliderLayout, SliderSkeletonNode, SliderSkeletonSlot } from './skeleton-slider-restore.mjs';
export { SkeletonForceOptions, SkeletonTimingOptions } from './skeleton-base.mjs';
import 'react';
import './responsive-DRmZH1Q2.mjs';
import './force-C5m1QpdF.mjs';
import './transitions-ChhEdSB6.mjs';
import './media.mjs';
import './plyrTypes-B3vioQaS.mjs';
import './types-CLMzNXt4.mjs';
import './text-BBcRGVzn.mjs';
import 'react-dom/client';
import './layout-BOy4geKv.mjs';

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
