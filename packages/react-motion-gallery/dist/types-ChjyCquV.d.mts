import { E as ElementStyle } from './elements-Bd1vm4Uk.mjs';
import { M as MediaItem } from './media-moIXOhT1.mjs';
import * as React$1 from 'react';

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
    marginTop?: SkeletonLength;
    marginRight?: SkeletonLength;
    marginBottom?: SkeletonLength;
    marginLeft?: SkeletonLength;
    alignSelf?: React$1.CSSProperties["alignSelf"];
    aspectRatio?: number | string;
};
type SkeletonContainerStyle = {
    gap?: SkeletonLength;
    padding?: SkeletonLength;
    align?: React$1.CSSProperties["alignItems"];
    justify?: React$1.CSSProperties["justifyContent"];
    wrap?: boolean;
    width?: SkeletonLength;
    maxWidth?: SkeletonLength;
};
type SkeletonContainerStyleResponsive = SkeletonContainerStyle | Record<string, SkeletonContainerStyle>;
type SkeletonNode = {
    kind: "stack" | "row" | "col";
    style?: SkeletonContainerStyleResponsive;
    children: SkeletonNode[];
} | {
    kind: "rect" | "square" | "circle";
    style?: SkeletonBaseStyle;
    shimmer?: SkeletonShimmer;
} | {
    kind: "media";
    count: number;
    direction?: "row" | "col";
    style?: SkeletonContainerStyleResponsive;
    tile?: {
        shape?: "rect" | "square" | "circle";
        style?: SkeletonBaseStyle;
        shimmer?: SkeletonShimmer;
    };
} | {
    kind: "text";
    fontSize: number;
    lineHeight: number;
    lines?: number;
    style?: SkeletonBaseStyle;
    shimmer?: SkeletonShimmer;
};
type EntrySkeletonSpec = {
    layout?: SkeletonNode;
    variant?: "solid";
    minHeight?: SkeletonLength;
    defaults?: {
        backgroundColor?: string;
        highlightColor?: string;
        radius?: SkeletonLength;
        shimmer?: SkeletonShimmer;
    };
};

type EntryItem = {
    media?: MediaItem[];
    [key: string]: any;
};
type EntryMediaRenderArgs = {
    entry: EntryItem;
    entryIndex: number;
    media: MediaItem;
    mediaIndex: number;
};
type MediaEntryLink = {
    entryIndex: number;
    mediaIndex: number;
};
type EntryOverlayRenderArgs = {
    entry: EntryItem;
    entryIndex: number;
    mediaIndex: number | null;
    link: MediaEntryLink | null;
    opacity: number;
    fsIndex: number;
    style: React.CSSProperties;
    containerProps: React.HTMLAttributes<HTMLDivElement>;
};
type EntryMediaLayout = "slider" | "grid" | "masonry";
type EntryCardRenderArgs = {
    entry: EntryItem;
    entryIndex: number;
    media: React.ReactNode;
};
type EntrySkeletonResolverArgs = {
    entry: EntryItem;
    entryIndex: number;
};
type EntriesLoadingOptions = {
    enabled?: boolean;
    force?: boolean;
    skeleton?: EntrySkeletonSpec | ((args: EntrySkeletonResolverArgs) => EntrySkeletonSpec | null | undefined);
    minHeight?: SkeletonLength;
    nearMargin?: string;
    viewMargin?: string;
    threshold?: number;
    waitForDecode?: boolean;
    decodeTimeoutMs?: number;
    skeletonWrap?: ElementStyle;
};
type IntroOptions = {
    renderIntro?: (args: {
        active: boolean;
        containerProps: React.HTMLAttributes<HTMLDivElement>;
    }, content: React.ReactNode) => React.ReactNode;
    staggerMs?: number;
    durationMs?: number;
    easing?: string;
    staggerLimit?: number;
};
type EntrySkeletonRenderArgs = {
    entry: EntryItem;
    entryIndex: number;
};
type EntriesOptions = {
    items?: EntryItem[];
    mediaLayout?: EntryMediaLayout;
    render?: {
        card?: (args: EntryCardRenderArgs) => React.ReactNode;
        media?: (args: EntryMediaRenderArgs) => React.ReactNode;
        overlay?: (args: EntryOverlayRenderArgs) => React.ReactNode;
        skeleton?: (args: EntrySkeletonRenderArgs) => React.ReactNode;
    };
    overlay?: ElementStyle;
    loading?: EntriesLoadingOptions;
    intro?: IntroOptions;
    entryList?: ElementStyle;
    entryRow?: ElementStyle;
};
type SlideOwner = {
    entryIndex: number;
};

export type { EntriesOptions as E, IntroOptions as I, MediaEntryLink as M, SlideOwner as S, EntryItem as a, EntryMediaRenderArgs as b, EntryOverlayRenderArgs as c, EntryMediaLayout as d, EntryCardRenderArgs as e, EntrySkeletonResolverArgs as f, EntriesLoadingOptions as g, EntrySkeletonRenderArgs as h };
