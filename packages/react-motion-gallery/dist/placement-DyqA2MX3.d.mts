import { R as ResponsiveNumber } from './responsiveNumber-CouEMJ9O.mjs';

type MasonryPlacement = "balanced" | "roundRobin" | "horizontalOrder";
type MasonrySpan = number | "full";
type ResponsiveMasonrySpan = MasonrySpan | Record<string, MasonrySpan>;
type MasonryHeightOffsetRule = {
    value: number;
    viewportMinWidth?: number;
    containerMinWidth?: number;
};
type MasonryHeightOffsetPx = number | ResponsiveNumber | {
    rules: ReadonlyArray<MasonryHeightOffsetRule>;
    fallback?: number;
};

export type { MasonryPlacement as M, ResponsiveMasonrySpan as R, MasonrySpan as a, MasonryHeightOffsetPx as b, MasonryHeightOffsetRule as c };
