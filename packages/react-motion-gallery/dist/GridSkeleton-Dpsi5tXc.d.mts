import { c as SkeletonLayoutRoot, S as SkeletonNode$1, d as SkeletonWrapStyle, a as SkeletonLength, b as SkeletonShimmer } from './layout-BOy4geKv.mjs';
import { R as ResponsiveGridSpan } from './types-Do4Pq-Td.mjs';

type GridSkeletonWrapStyle = SkeletonWrapStyle;
type SkeletonNode = SkeletonNode$1;
type GridSkeletonSlot = {
    item?: SkeletonNode;
    itemWrapStyle?: GridSkeletonWrapStyle;
    span?: ResponsiveGridSpan;
};
type GridSkeletonLayoutNode = SkeletonLayoutRoot<"grid"> & {
    slots?: GridSkeletonSlot[];
};
type GridSkeletonNode = GridSkeletonLayoutNode | SkeletonNode$1;
type GridSkeletonSpec = {
    className?: string;
    layout?: GridSkeletonNode;
    backgroundColor?: string;
    radius?: SkeletonLength;
    shimmer?: SkeletonShimmer;
};

export type { GridSkeletonNode as G, GridSkeletonSlot as a, GridSkeletonSpec as b, GridSkeletonLayoutNode as c };
