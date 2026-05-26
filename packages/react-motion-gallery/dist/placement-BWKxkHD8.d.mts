type MasonryPlacement = "balanced" | "roundRobin" | "horizontalOrder";
type MasonrySpan = number | "full";
type ResponsiveMasonrySpan = MasonrySpan | Record<string, MasonrySpan>;

export type { MasonryPlacement as M, ResponsiveMasonrySpan as R, MasonrySpan as a };
