import { c as SkeletonLayoutRoot, S as SkeletonNode$1, d as SkeletonWrapStyle, a as SkeletonLength, b as SkeletonShimmer } from './layout-DoYnPD0I.mjs';
import { R as ResponsiveMasonrySpan } from './types-Br27DWP7.mjs';

type MasonryPlacement = "balanced" | "roundRobin" | "horizontalOrder";
type MasonrySkeletonWrapStyle = SkeletonWrapStyle;
type SkeletonNode = SkeletonNode$1;
type MasonrySkeletonSlot = {
    item?: SkeletonNode;
    itemWrapStyle?: MasonrySkeletonWrapStyle;
    ratio?: number;
    heightPx?: number;
    span?: ResponsiveMasonrySpan;
};
type MasonrySkeletonLayoutNode = SkeletonLayoutRoot<"masonry"> & {
    slots?: MasonrySkeletonSlot[];
};
type MasonrySkeletonNode = MasonrySkeletonLayoutNode | SkeletonNode$1;
type MasonrySkeletonSpec = {
    className?: string;
    layout?: MasonrySkeletonNode;
    ratios?: number[];
    heightsPx?: number[];
    backgroundColor?: string;
    highlightColor?: string;
    radius?: SkeletonLength;
    shimmer?: SkeletonShimmer;
};

export type { MasonrySkeletonLayoutNode as M, MasonryPlacement as a, MasonrySkeletonSpec as b, MasonrySkeletonNode as c, MasonrySkeletonSlot as d };
