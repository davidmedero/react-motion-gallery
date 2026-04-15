import * as React from 'react';
import { R as ResponsiveTextLineCount, a as ResponsiveTextLineWidth } from './text-Cl2tR8oO.mjs';

type GalleryLazyLoadRenderArgs = {
    kind: "image" | "video";
    isClone: boolean;
};
type GalleryLazyLoadOptions = {
    enabled?: boolean;
    spinner?: boolean | React.ReactNode | ((args: GalleryLazyLoadRenderArgs) => React.ReactNode);
    spinnerClassName?: string;
    spinnerStyle?: React.CSSProperties;
};

type SkeletonLength = number | string;
type SkeletonShimmer = {
    enabled?: boolean;
    durationMs?: number;
    angleDeg?: number;
    opacity?: number;
    blurPx?: number;
    timing?: string;
    c1?: string;
    c2?: string;
    c3?: string;
};
type SkeletonBaseStyle = {
    width?: SkeletonLength;
    maxWidth?: SkeletonLength;
    height?: SkeletonLength;
    maxHeight?: SkeletonLength;
    backgroundColor?: string;
    borderRadius?: SkeletonLength;
    overflow?: React.CSSProperties["overflow"];
    marginTop?: SkeletonLength;
    marginRight?: SkeletonLength;
    marginBottom?: SkeletonLength;
    marginLeft?: SkeletonLength;
    alignSelf?: React.CSSProperties["alignSelf"];
    aspectRatio?: SkeletonLength;
    scale?: number;
};
type SkeletonBaseStyleResponsive = SkeletonBaseStyle | Record<string, SkeletonBaseStyle>;
type SkeletonWrapStyle = SkeletonBaseStyle & {
    padding?: SkeletonLength;
    border?: React.CSSProperties["border"];
    boxShadow?: React.CSSProperties["boxShadow"];
};
type SkeletonContainerStyle = {
    gap?: SkeletonLength;
    padding?: SkeletonLength;
    align?: React.CSSProperties["alignItems"];
    justify?: React.CSSProperties["justifyContent"];
    wrap?: boolean;
    width?: SkeletonLength;
    maxWidth?: SkeletonLength;
    overflow?: React.CSSProperties["overflow"];
};
type SkeletonContainerStyleResponsive = SkeletonContainerStyle | Record<string, SkeletonContainerStyle>;
type SkeletonNode = {
    kind: "stack" | "row" | "col";
    style?: SkeletonContainerStyleResponsive;
    children: SkeletonNode[];
} | {
    kind: "rect" | "square" | "circle";
    style?: SkeletonBaseStyleResponsive;
    shimmer?: SkeletonShimmer;
} | {
    kind: "media";
    count: number;
    direction?: "row" | "col";
    style?: SkeletonContainerStyleResponsive;
    tile?: {
        shape?: "rect" | "square" | "circle";
        style?: SkeletonBaseStyleResponsive;
        shimmer?: SkeletonShimmer;
    };
} | {
    kind: "text";
    fontSize: number;
    lineHeight: number;
    lines?: ResponsiveTextLineCount;
    lineWidth?: ResponsiveTextLineWidth;
    style?: SkeletonBaseStyleResponsive;
    shimmer?: SkeletonShimmer;
};
type SkeletonLayoutRoot<TKind extends string> = {
    kind: TKind;
    style?: SkeletonContainerStyleResponsive;
    count?: number;
    item: SkeletonNode;
    itemWrapStyle?: SkeletonWrapStyle;
};

export type { GalleryLazyLoadOptions as G, SkeletonLayoutRoot as S, SkeletonNode as a, SkeletonWrapStyle as b, SkeletonLength as c, SkeletonShimmer as d };
