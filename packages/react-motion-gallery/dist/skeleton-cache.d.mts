import * as React from 'react';

declare const SKELETON_CACHE_VERSION = 1;
declare const DEFAULT_SKELETON_CACHE_TTL_MS: number;
declare const DEFAULT_SKELETON_CACHE_DEBOUNCE_MS = 250;
type SkeletonCacheKind = "skeleton" | "masonry";
type SkeletonCacheTextRecord = {
    lines: number;
    barWidths?: string[];
    lineWidthsPx?: number[];
    barHeight?: number;
    lineHeight?: number;
    containerWidthPx?: number;
};
type SkeletonCacheMasonrySnapshot = {
    variantKey: string;
    shellHeightPx?: number;
    itemHeightsPx?: number[];
};
type SkeletonCacheSnapshot = {
    version: 1;
    key: string;
    scopeId: string;
    kind: SkeletonCacheKind;
    routeKey?: string;
    createdAt: number;
    widthBucketMin: number;
    viewportWidth: number;
    layoutWidthPx?: number;
    masonry?: SkeletonCacheMasonrySnapshot;
    text: Record<string, SkeletonCacheTextRecord>;
};
type SkeletonCacheCookieOptions = {
    path?: string;
    sameSite?: "lax" | "strict" | "none";
    secure?: boolean;
};
type SkeletonCacheOptions = {
    key: string;
    snapshot?: SkeletonCacheSnapshot | null;
    ttlMs?: number;
    debounceMs?: number;
    routeKey?: string;
    cookie?: SkeletonCacheCookieOptions;
};
type SkeletonCacheProviderProps = {
    children?: React.ReactNode;
    options?: Omit<SkeletonCacheOptions, "snapshot">;
    snapshot?: SkeletonCacheSnapshot | null;
    snapshots?: Record<string, SkeletonCacheSnapshot | null | undefined>;
};
type SkeletonCacheParseOptions = {
    key?: string;
    scopeId?: string;
    kind?: SkeletonCacheKind;
    routeKey?: string;
    ttlMs?: number;
    now?: number;
    textIds?: readonly string[];
    itemCount?: number;
    variantKeys?: readonly string[];
    widthBucketMin?: number;
};
declare function getSkeletonCacheCookieName(key: string): string;
declare function serializeSkeletonCacheSnapshot(snapshot: SkeletonCacheSnapshot): string;
declare function validateSkeletonCacheSnapshot(snapshot: SkeletonCacheSnapshot | null | undefined, options?: SkeletonCacheParseOptions): SkeletonCacheSnapshot | null;
declare function parseSkeletonCacheCookie(raw: string | null | undefined, options?: SkeletonCacheParseOptions): SkeletonCacheSnapshot | null;
declare function getSkeletonCacheRouteKey(loc?: Pick<Location, "pathname" | "search"> | undefined): string;

export { DEFAULT_SKELETON_CACHE_DEBOUNCE_MS, DEFAULT_SKELETON_CACHE_TTL_MS, SKELETON_CACHE_VERSION, type SkeletonCacheCookieOptions, type SkeletonCacheKind, type SkeletonCacheMasonrySnapshot, type SkeletonCacheOptions, type SkeletonCacheProviderProps, type SkeletonCacheSnapshot, type SkeletonCacheTextRecord, getSkeletonCacheCookieName, getSkeletonCacheRouteKey, parseSkeletonCacheCookie, serializeSkeletonCacheSnapshot, validateSkeletonCacheSnapshot };
