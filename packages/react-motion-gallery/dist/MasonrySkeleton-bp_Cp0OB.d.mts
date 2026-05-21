import { g as SkeletonLayoutRoot, S as SkeletonNode$1, h as SkeletonWrapStyle, e as SkeletonLength, f as SkeletonShimmer } from './layout-BSjd7pwQ.mjs';
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

export type { MasonryPlacement as M, MasonrySkeletonNode as a, MasonrySkeletonSlot as b, MasonrySkeletonSpec as c, MasonrySkeletonLayoutNode as d };
