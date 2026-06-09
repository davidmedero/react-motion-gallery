'use client';

import {
  DEMO_CANVAS_SHELL_CSS_VARS,
  DEMO_CANVAS_SHELL_RESPONSIVE_CSS,
} from "@/lib/demo-canvas-shell";
import { ChevronDown } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type SimpleBarCore from "simplebar-core";
import SimpleBar from "simplebar-react";
import {
  DEMO_CATEGORIES as DEMO_NAV_CATEGORIES,
  getDemoPath,
  getDemoTitle,
} from "./demo-catalog";
import {
  memo,
  startTransition,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentProps,
  type ComponentType,
  type ReactNode,
} from "react";
import type { JSX } from "react";
import styles from "./demos.module.css";
import type { SkeletonCacheSnapshot } from "react-motion-gallery/skeleton/cache";
import { SkeletonCacheProvider } from "react-motion-gallery/skeleton/cache/provider";

type DemoRuntimeProps = Record<string, never>;

type DemoComponent = ComponentType<DemoRuntimeProps>;

const CodeBlock = dynamic(
  () => import("@/components/ui/code-block").then((module) => module.CodeBlock),
  {
    loading: () => (
      <div className={styles.codeBlockPlaceholder} aria-hidden="true" />
    ),
  }
);

const DEMO_COMPONENT_IMPORTERS = {
  "slider-default": () =>
    import("./slider/slider-default/Component").then((module) => module.SliderDefaultDemo),
  "slider-loop": () =>
    import("./slider/slider-loop/Component").then((module) => module.SliderLoopDemo),
  "slider-video-html5": () =>
    import("./slider/slider-video-html5/Component").then((module) => module.SliderVideoHtml5Demo),
  "slider-video-html5-loop": () =>
    import("./slider/slider-video-html5-loop/Component").then((module) => module.SliderVideoHtml5LoopDemo),
  "slider-video-youtube": () =>
    import("./slider/slider-video-youtube/Component").then((module) => module.SliderVideoYoutubeDemo),
  "slider-video-youtube-loop": () =>
    import("./slider/slider-video-youtube-loop/Component").then((module) => module.SliderVideoYoutubeLoopDemo),
  "slider-video-vimeo": () =>
    import("./slider/slider-video-vimeo/Component").then((module) => module.SliderVideoVimeoDemo),
  "slider-video-vimeo-loop": () =>
    import("./slider/slider-video-vimeo-loop/Component").then((module) => module.SliderVideoVimeoLoopDemo),
  "slider-right-to-left": () =>
    import("./slider/slider-right-to-left/Component").then((module) => module.SliderRightToLeftDemo),
  "slider-group-cells": () =>
    import("./slider/slider-group-cells/Component").then((module) => module.SliderGroupCellsDemo),
  "slider-free-scroll": () =>
    import("./slider/slider-free-scroll/Component").then((module) => module.SliderFreeScrollDemo),
  "slider-skip-snaps": () =>
    import("./slider/slider-skip-snaps/Component").then((module) => module.SliderSkipSnapsDemo),
  "slider-strict-snaps": () =>
    import("./slider/slider-strict-snaps/Component").then((module) => module.SliderStrictSnapsDemo),
  "slider-center-align": () =>
    import("./slider/slider-center-align/Component").then((module) => module.SliderCenterAlignDemo),
  "slider-variable-widths": () =>
    import("./slider/slider-variable-widths/Component").then((module) => module.SliderVariableWidthsDemo),
  "slider-y-axis": () =>
    import("./slider/slider-y-axis/Component").then((module) => module.SliderYAxisDemo),
  "slider-cells-per-slide": () =>
    import("./slider/slider-cells-per-slide/Component").then((module) => module.SliderCellsPerSlideDemo),
  "slider-thumbnails": () =>
    import("./slider/slider-thumbnails/Component").then((module) => module.SliderThumbnailsDemo),
  "slider-lazy-load": () =>
    import("./slider/slider-lazy-load/Component").then((module) => module.SliderLazyLoadDemo),
  "slider-auto-scroll": () =>
    import("./slider/slider-auto-scroll/Component").then((module) => module.SliderAutoScrollDemo),
  "slider-auto-play": () =>
    import("./slider/slider-auto-play/Component").then((module) => module.SliderAutoPlayDemo),
  "slider-auto-height": () =>
    import("./slider/slider-auto-height/Component").then((module) => module.SliderAutoHeightDemo),
  "slider-parallax": () =>
    import("./slider/slider-parallax/Component").then((module) => module.SliderParallaxDemo),
  "slider-scale": () =>
    import("./slider/slider-scale/Component").then((module) => module.SliderScaleDemo),
  "slider-fade": () =>
    import("./slider/slider-fade/Component").then((module) => module.SliderFadeDemo),
  "slider-crossfade": () =>
    import("./slider/slider-crossfade/Component").then((module) => module.SliderCrossfadeDemo),
  "slider-cards": () =>
    import("./slider/slider-cards/Component").then((module) => module.SliderCardsDemo),
  "slider-interactive": () =>
    import("./slider/slider-interactive/Component").then((module) => module.SliderInteractiveDemo),
  "grid-columns": () =>
    import("./grid/grid-columns/Component").then((module) => module.GridColumnsDemo),
  "grid-template-columns": () =>
    import("./grid/grid-template-columns/Component").then((module) => module.GridTemplateColumnsDemo),
  "grid-min-column-width": () =>
    import("./grid/grid-min-column-width/Component").then((module) => module.GridMinColumnWidthDemo),
  "grid-lazy-load": () =>
    import("./grid/grid-lazy-load/Component").then((module) => module.GridLazyLoadDemo),
  "grid-pagination": () =>
    import("./grid/grid-pagination/Component").then((module) => module.GridPaginationDemo),
  "grid-pagination-client": () =>
    import("./grid/grid-pagination-client/Component").then((module) => module.GridPaginationClientDemo),
  "grid-load-more": () =>
    import("./grid/grid-load-more/Component").then((module) => module.GridLoadMoreDemo),
  "grid-infinite-scroll": () =>
    import("./grid/grid-infinite-scroll/Component").then((module) => module.GridInfiniteScrollDemo),
  "grid-virtualization": () =>
    import("./grid/grid-virtualization/Component").then((module) => module.GridVirtualizationDemo),
  "grid-video-html5": () =>
    import("./grid/grid-video-html5/Component").then((module) => module.GridVideoHtml5Demo),
  "grid-video-youtube": () =>
    import("./grid/grid-video-youtube/Component").then((module) => module.GridVideoYoutubeDemo),
  "grid-video-vimeo": () =>
    import("./grid/grid-video-vimeo/Component").then((module) => module.GridVideoVimeoDemo),
  "masonry-core-balanced": () =>
    import("./masonry/masonry-core-balanced/Component").then((module) => module.MasonryCoreBalancedDemo),
  "masonry-core-spans": () =>
    import("./masonry/masonry-core-spans/Component").then((module) => module.MasonryCoreSpansDemo),
  "masonry-core-horizontal-order": () =>
    import("./masonry/masonry-core-horizontal-order/Component").then((module) => module.MasonryCoreHorizontalOrderDemo),
  "masonry-core-round-robin": () =>
    import("./masonry/masonry-core-round-robin/Component").then((module) => module.MasonryCoreRoundRobinDemo),
  "masonry-core-lazy-load": () =>
    import("./masonry/masonry-core-lazy-load/Component").then((module) => module.MasonryCoreLazyLoadDemo),
  "masonry-pagination": () =>
    import("./masonry/masonry-pagination/Component").then((module) => module.MasonryPaginationDemo),
  "masonry-pagination-client": () =>
    import("./masonry/masonry-pagination-client/Component").then((module) => module.MasonryPaginationClientDemo),
  "masonry-load-more": () =>
    import("./masonry/masonry-load-more/Component").then((module) => module.MasonryLoadMoreDemo),
  "masonry-infinite-scroll": () =>
    import("./masonry/masonry-infinite-scroll/Component").then((module) => module.MasonryInfiniteScrollDemo),
  "masonry-virtualization": () =>
    import("./masonry/masonry-virtualization/Component").then((module) => module.MasonryVirtualizationDemo),
  "masonry-balanced": () =>
    import("./masonry/masonry-balanced/Component").then((module) => module.MasonryBalancedDemo),
  "masonry-spans": () =>
    import("./masonry/masonry-spans/Component").then((module) => module.MasonrySpansDemo),
  "masonry-horizontal-order": () =>
    import("./masonry/masonry-horizontal-order/Component").then((module) => module.MasonryHorizontalOrderDemo),
  "masonry-round-robin": () =>
    import("./masonry/masonry-round-robin/Component").then((module) => module.MasonryRoundRobinDemo),
  "masonry-lazy-load": () =>
    import("./masonry/masonry-lazy-load/Component").then((module) => module.MasonryLazyLoadDemo),
  "masonry-video-html5": () =>
    import("./masonry/masonry-video-html5/Component").then((module) => module.MasonryVideoHtml5Demo),
  "masonry-video-youtube": () =>
    import("./masonry/masonry-video-youtube/Component").then((module) => module.MasonryVideoYoutubeDemo),
  "masonry-video-vimeo": () =>
    import("./masonry/masonry-video-vimeo/Component").then((module) => module.MasonryVideoVimeoDemo),
  "entries-slider": () =>
    import("./entries/entries-slider/Component").then((module) => module.EntriesSliderDemo),
  "entries-slider-html5": () =>
    import("./entries/entries-slider-html5/Component").then((module) => module.EntriesSliderHtml5Demo),
  "entries-grid": () =>
    import("./entries/entries-grid/Component").then((module) => module.EntriesGridDemo),
  "entries-masonry": () =>
    import("./entries/entries-masonry/Component").then((module) => module.EntriesMasonryDemo),
  "entries-pagination": () =>
    import("./entries/entries-pagination/Component").then((module) => module.EntriesPaginationDemo),
  "entries-pagination-client": () =>
    import("./entries/entries-pagination-client/Component").then((module) => module.EntriesPaginationClientDemo),
  "entries-load-more": () =>
    import("./entries/entries-load-more/Component").then((module) => module.EntriesLoadMoreDemo),
  "entries-infinite-scroll": () =>
    import("./entries/entries-infinite-scroll/Component").then((module) => module.EntriesInfiniteScrollDemo),
  "entries-virtualization": () =>
    import("./entries/entries-virtualization/Component").then((module) => module.EntriesVirtualizationDemo),
  "entries-pagination-grid": () =>
    import("./entries/entries-pagination-grid/Component").then((module) => module.EntriesPaginationGridDemo),
  "entries-pagination-grid-client": () =>
    import("./entries/entries-pagination-grid-client/Component").then((module) => module.EntriesPaginationGridClientDemo),
  "entries-load-more-grid": () =>
    import("./entries/entries-load-more-grid/Component").then((module) => module.EntriesLoadMoreGridDemo),
  "entries-infinite-scroll-grid": () =>
    import("./entries/entries-infinite-scroll-grid/Component").then((module) => module.EntriesInfiniteScrollGridDemo),
  "entries-virtualization-grid": () =>
    import("./entries/entries-virtualization-grid/Component").then((module) => module.EntriesVirtualizationGridDemo),
  "fullscreen-slide-bound-caption": () =>
    import("./fullscreen/fullscreen-slide-bound-caption/Component").then((module) => module.FullscreenSlideBoundCaptionDemo),
  "fullscreen-thumbnails": () =>
    import("./fullscreen/fullscreen-thumbnails/Component").then((module) => module.FullscreenThumbnailsDemo),
  "fullscreen-caption-thumbnails": () =>
    import("./fullscreen/fullscreen-caption-thumbnails/Component").then((module) => module.FullscreenCaptionThumbnailsDemo),
  "fullscreen-fade-effects": () =>
    import("./fullscreen/fullscreen-fade-effects/Component").then((module) => module.FullscreenFadeEffectsDemo),
  "fullscreen-viewport-overlay-caption": () =>
    import("./fullscreen/fullscreen-viewport-overlay-caption/Component").then((module) => module.FullscreenViewportOverlayCaptionDemo),
  "fullscreen-viewport-overlay-caption-sized": () =>
    import("./fullscreen/fullscreen-viewport-overlay-caption-sized/Component").then((module) => module.FullscreenViewportOverlayCaptionSizedDemo),
  "fullscreen-lazy-load": () =>
    import("./fullscreen/fullscreen-lazy-load/Component").then((module) => module.FullscreenLazyLoadDemo),
  "fullscreen-image-hover": () =>
    import("./fullscreen/fullscreen-image-hover/Component").then((module) => module.FullscreenImageHoverDemo),
  "fullscreen-layout-agnostic": () =>
    import("./fullscreen/fullscreen-layout-agnostic/Component").then((module) => module.FullscreenLayoutAgnosticDemo),
  "skeleton-flex-cards": () =>
    import("./skeleton/skeleton-flex-cards/Component").then((module) => module.SkeletonFlexCardsDemo),
  "skeleton-app-shell": () =>
    import("./skeleton/skeleton-app-shell/Component").then((module) => module.SkeletonAppShellDemo),
  "skeleton-responsive-text": () =>
    import("./skeleton/skeleton-responsive-text/Component").then((module) => module.SkeletonResponsiveTextDemo),
  "skeleton-force-overlay": () =>
    import("./skeleton/skeleton-force-overlay/Component").then((module) => module.SkeletonForceOverlayDemo),
  "reveal-sections": () =>
    import("./reveal/reveal-sections/Component").then((module) => module.RevealSectionsDemo),
  "reveal-image-ready": () =>
    import("./reveal/reveal-image-ready/Component").then((module) => module.RevealImageReadyDemo),
  "zoom-pan-standalone": () =>
    import("./zoom-pan/standalone/Component").then((module) => module.ZoomPanStandaloneDemo),
  "zoom-pan-slider": () =>
    import("./zoom-pan/slider/Component").then((module) => module.ZoomPanSliderDemo),
  "zoom-pan-grid": () =>
    import("./zoom-pan/grid/Component").then((module) => module.ZoomPanGridDemo),
  "zoom-pan-masonry": () =>
    import("./zoom-pan/masonry/Component").then((module) => module.ZoomPanMasonryDemo),
  "zoom-pan-image-hover": () =>
    import("./zoom-pan/image-hover/Component").then((module) => module.ZoomPanImageHoverDemo),
} satisfies Record<string, () => Promise<DemoComponent>>;

const SliderDefaultDemo = dynamic<DemoRuntimeProps>(() =>
  import("./slider/slider-default/Component").then((module) => module.SliderDefaultDemo)
);
const SliderLoopDemo = dynamic<DemoRuntimeProps>(() =>
  import("./slider/slider-loop/Component").then((module) => module.SliderLoopDemo)
);
const SliderVideoHtml5Demo = dynamic<DemoRuntimeProps>(() =>
  import("./slider/slider-video-html5/Component").then((module) => module.SliderVideoHtml5Demo)
);
const SliderVideoHtml5LoopDemo = dynamic<DemoRuntimeProps>(() =>
  import("./slider/slider-video-html5-loop/Component").then((module) => module.SliderVideoHtml5LoopDemo)
);
const SliderVideoYoutubeDemo = dynamic<DemoRuntimeProps>(() =>
  import("./slider/slider-video-youtube/Component").then((module) => module.SliderVideoYoutubeDemo)
);
const SliderVideoYoutubeLoopDemo = dynamic<DemoRuntimeProps>(() =>
  import("./slider/slider-video-youtube-loop/Component").then((module) => module.SliderVideoYoutubeLoopDemo)
);
const SliderVideoVimeoDemo = dynamic<DemoRuntimeProps>(() =>
  import("./slider/slider-video-vimeo/Component").then((module) => module.SliderVideoVimeoDemo)
);
const SliderVideoVimeoLoopDemo = dynamic<DemoRuntimeProps>(() =>
  import("./slider/slider-video-vimeo-loop/Component").then((module) => module.SliderVideoVimeoLoopDemo)
);
const SliderRightToLeftDemo = dynamic<DemoRuntimeProps>(() =>
  import("./slider/slider-right-to-left/Component").then((module) => module.SliderRightToLeftDemo)
);
const SliderGroupCellsDemo = dynamic<DemoRuntimeProps>(() =>
  import("./slider/slider-group-cells/Component").then((module) => module.SliderGroupCellsDemo)
);
const SliderFreeScrollDemo = dynamic<DemoRuntimeProps>(() =>
  import("./slider/slider-free-scroll/Component").then((module) => module.SliderFreeScrollDemo)
);
const SliderSkipSnapsDemo = dynamic<DemoRuntimeProps>(() =>
  import("./slider/slider-skip-snaps/Component").then((module) => module.SliderSkipSnapsDemo)
);
const SliderStrictSnapsDemo = dynamic<DemoRuntimeProps>(() =>
  import("./slider/slider-strict-snaps/Component").then((module) => module.SliderStrictSnapsDemo)
);
const SliderCenterAlignDemo = dynamic<DemoRuntimeProps>(() =>
  import("./slider/slider-center-align/Component").then((module) => module.SliderCenterAlignDemo)
);
const SliderVariableWidthsDemo = dynamic<DemoRuntimeProps>(() =>
  import("./slider/slider-variable-widths/Component").then((module) => module.SliderVariableWidthsDemo)
);
const SliderYAxisDemo = dynamic<DemoRuntimeProps>(() =>
  import("./slider/slider-y-axis/Component").then((module) => module.SliderYAxisDemo)
);
const SliderCellsPerSlideDemo = dynamic<DemoRuntimeProps>(() =>
  import("./slider/slider-cells-per-slide/Component").then((module) => module.SliderCellsPerSlideDemo)
);
const SliderThumbnailsDemo = dynamic<DemoRuntimeProps>(() =>
  import("./slider/slider-thumbnails/Component").then((module) => module.SliderThumbnailsDemo)
);
const SliderLazyLoadDemo = dynamic<DemoRuntimeProps>(() =>
  import("./slider/slider-lazy-load/Component").then((module) => module.SliderLazyLoadDemo)
);
const SliderAutoScrollDemo = dynamic<DemoRuntimeProps>(() =>
  import("./slider/slider-auto-scroll/Component").then((module) => module.SliderAutoScrollDemo)
);
const SliderAutoPlayDemo = dynamic<DemoRuntimeProps>(() =>
  import("./slider/slider-auto-play/Component").then((module) => module.SliderAutoPlayDemo)
);
const SliderAutoHeightDemo = dynamic<DemoRuntimeProps>(() =>
  import("./slider/slider-auto-height/Component").then((module) => module.SliderAutoHeightDemo)
);
const SliderParallaxDemo = dynamic<DemoRuntimeProps>(() =>
  import("./slider/slider-parallax/Component").then((module) => module.SliderParallaxDemo)
);
const SliderScaleDemo = dynamic<DemoRuntimeProps>(() =>
  import("./slider/slider-scale/Component").then((module) => module.SliderScaleDemo)
);
const SliderFadeDemo = dynamic<DemoRuntimeProps>(() =>
  import("./slider/slider-fade/Component").then((module) => module.SliderFadeDemo)
);
const SliderCrossfadeDemo = dynamic<DemoRuntimeProps>(() =>
  import("./slider/slider-crossfade/Component").then((module) => module.SliderCrossfadeDemo)
);
const SliderCardsDemo = dynamic<DemoRuntimeProps>(() =>
  import("./slider/slider-cards/Component").then((module) => module.SliderCardsDemo)
);
const SliderInteractiveDemo = dynamic<DemoRuntimeProps>(() =>
  import("./slider/slider-interactive/Component").then((module) => module.SliderInteractiveDemo)
);
const GridColumnsDemo = dynamic<DemoRuntimeProps>(() =>
  import("./grid/grid-columns/Component").then((module) => module.GridColumnsDemo)
);
const GridTemplateColumnsDemo = dynamic<DemoRuntimeProps>(() =>
  import("./grid/grid-template-columns/Component").then((module) => module.GridTemplateColumnsDemo)
);
const GridMinColumnWidthDemo = dynamic<DemoRuntimeProps>(() =>
  import("./grid/grid-min-column-width/Component").then((module) => module.GridMinColumnWidthDemo)
);
const GridLazyLoadDemo = dynamic<DemoRuntimeProps>(() =>
  import("./grid/grid-lazy-load/Component").then((module) => module.GridLazyLoadDemo)
);
const GridPaginationDemo = dynamic<DemoRuntimeProps>(() =>
  import("./grid/grid-pagination/Component").then((module) => module.GridPaginationDemo)
);
const GridPaginationClientDemo = dynamic<DemoRuntimeProps>(() =>
  import("./grid/grid-pagination-client/Component").then((module) => module.GridPaginationClientDemo)
);
const GridLoadMoreDemo = dynamic<DemoRuntimeProps>(() =>
  import("./grid/grid-load-more/Component").then((module) => module.GridLoadMoreDemo)
);
const GridInfiniteScrollDemo = dynamic<DemoRuntimeProps>(() =>
  import("./grid/grid-infinite-scroll/Component").then((module) => module.GridInfiniteScrollDemo)
);
const GridVirtualizationDemo = dynamic<DemoRuntimeProps>(() =>
  import("./grid/grid-virtualization/Component").then((module) => module.GridVirtualizationDemo)
);
const GridVideoHtml5Demo = dynamic<DemoRuntimeProps>(() =>
  import("./grid/grid-video-html5/Component").then((module) => module.GridVideoHtml5Demo)
);
const GridVideoYoutubeDemo = dynamic<DemoRuntimeProps>(() =>
  import("./grid/grid-video-youtube/Component").then((module) => module.GridVideoYoutubeDemo)
);
const GridVideoVimeoDemo = dynamic<DemoRuntimeProps>(() =>
  import("./grid/grid-video-vimeo/Component").then((module) => module.GridVideoVimeoDemo)
);
const MasonryCoreBalancedDemo = dynamic<DemoRuntimeProps>(() =>
  import("./masonry/masonry-core-balanced/Component").then((module) => module.MasonryCoreBalancedDemo)
);
const MasonryCoreSpansDemo = dynamic<DemoRuntimeProps>(() =>
  import("./masonry/masonry-core-spans/Component").then((module) => module.MasonryCoreSpansDemo)
);
const MasonryCoreHorizontalOrderDemo = dynamic<DemoRuntimeProps>(() =>
  import("./masonry/masonry-core-horizontal-order/Component").then((module) => module.MasonryCoreHorizontalOrderDemo)
);
const MasonryCoreRoundRobinDemo = dynamic<DemoRuntimeProps>(() =>
  import("./masonry/masonry-core-round-robin/Component").then((module) => module.MasonryCoreRoundRobinDemo)
);
const MasonryCoreLazyLoadDemo = dynamic<DemoRuntimeProps>(() =>
  import("./masonry/masonry-core-lazy-load/Component").then((module) => module.MasonryCoreLazyLoadDemo)
);
const MasonryPaginationDemo = dynamic<DemoRuntimeProps>(() =>
  import("./masonry/masonry-pagination/Component").then((module) => module.MasonryPaginationDemo)
);
const MasonryPaginationClientDemo = dynamic<DemoRuntimeProps>(() =>
  import("./masonry/masonry-pagination-client/Component").then((module) => module.MasonryPaginationClientDemo)
);
const MasonryLoadMoreDemo = dynamic<DemoRuntimeProps>(() =>
  import("./masonry/masonry-load-more/Component").then((module) => module.MasonryLoadMoreDemo)
);
const MasonryInfiniteScrollDemo = dynamic<DemoRuntimeProps>(() =>
  import("./masonry/masonry-infinite-scroll/Component").then((module) => module.MasonryInfiniteScrollDemo)
);
const MasonryVirtualizationDemo = dynamic<DemoRuntimeProps>(() =>
  import("./masonry/masonry-virtualization/Component").then((module) => module.MasonryVirtualizationDemo)
);
const MasonryBalancedDemo = dynamic<DemoRuntimeProps>(() =>
  import("./masonry/masonry-balanced/Component").then((module) => module.MasonryBalancedDemo)
);
const MasonrySpansDemo = dynamic<DemoRuntimeProps>(() =>
  import("./masonry/masonry-spans/Component").then((module) => module.MasonrySpansDemo)
);
const MasonryHorizontalOrderDemo = dynamic<DemoRuntimeProps>(() =>
  import("./masonry/masonry-horizontal-order/Component").then((module) => module.MasonryHorizontalOrderDemo)
);
const MasonryRoundRobinDemo = dynamic<DemoRuntimeProps>(() =>
  import("./masonry/masonry-round-robin/Component").then((module) => module.MasonryRoundRobinDemo)
);
const MasonryLazyLoadDemo = dynamic<DemoRuntimeProps>(() =>
  import("./masonry/masonry-lazy-load/Component").then((module) => module.MasonryLazyLoadDemo)
);
const MasonryVideoHtml5Demo = dynamic<DemoRuntimeProps>(() =>
  import("./masonry/masonry-video-html5/Component").then((module) => module.MasonryVideoHtml5Demo)
);
const MasonryVideoYoutubeDemo = dynamic<DemoRuntimeProps>(() =>
  import("./masonry/masonry-video-youtube/Component").then((module) => module.MasonryVideoYoutubeDemo)
);
const MasonryVideoVimeoDemo = dynamic<DemoRuntimeProps>(() =>
  import("./masonry/masonry-video-vimeo/Component").then((module) => module.MasonryVideoVimeoDemo)
);
const EntriesSliderDemo = dynamic<DemoRuntimeProps>(() =>
  import("./entries/entries-slider/Component").then((module) => module.EntriesSliderDemo)
);
const EntriesSliderHtml5Demo = dynamic<DemoRuntimeProps>(() =>
  import("./entries/entries-slider-html5/Component").then((module) => module.EntriesSliderHtml5Demo)
);
const EntriesGridDemo = dynamic<DemoRuntimeProps>(() =>
  import("./entries/entries-grid/Component").then((module) => module.EntriesGridDemo)
);
const EntriesMasonryDemo = dynamic<DemoRuntimeProps>(() =>
  import("./entries/entries-masonry/Component").then((module) => module.EntriesMasonryDemo)
);
const EntriesPaginationDemo = dynamic<DemoRuntimeProps>(() =>
  import("./entries/entries-pagination/Component").then((module) => module.EntriesPaginationDemo)
);
const EntriesPaginationClientDemo = dynamic<DemoRuntimeProps>(() =>
  import("./entries/entries-pagination-client/Component").then((module) => module.EntriesPaginationClientDemo)
);
const EntriesLoadMoreDemo = dynamic<DemoRuntimeProps>(() =>
  import("./entries/entries-load-more/Component").then((module) => module.EntriesLoadMoreDemo)
);
const EntriesInfiniteScrollDemo = dynamic<DemoRuntimeProps>(() =>
  import("./entries/entries-infinite-scroll/Component").then((module) => module.EntriesInfiniteScrollDemo)
);
const EntriesVirtualizationDemo = dynamic<DemoRuntimeProps>(() =>
  import("./entries/entries-virtualization/Component").then((module) => module.EntriesVirtualizationDemo)
);
const EntriesPaginationGridDemo = dynamic<DemoRuntimeProps>(() =>
  import("./entries/entries-pagination-grid/Component").then((module) => module.EntriesPaginationGridDemo)
);
const EntriesPaginationGridClientDemo = dynamic<DemoRuntimeProps>(() =>
  import("./entries/entries-pagination-grid-client/Component").then((module) => module.EntriesPaginationGridClientDemo)
);
const EntriesLoadMoreGridDemo = dynamic<DemoRuntimeProps>(() =>
  import("./entries/entries-load-more-grid/Component").then((module) => module.EntriesLoadMoreGridDemo)
);
const EntriesInfiniteScrollGridDemo = dynamic<DemoRuntimeProps>(() =>
  import("./entries/entries-infinite-scroll-grid/Component").then((module) => module.EntriesInfiniteScrollGridDemo)
);
const EntriesVirtualizationGridDemo = dynamic<DemoRuntimeProps>(() =>
  import("./entries/entries-virtualization-grid/Component").then((module) => module.EntriesVirtualizationGridDemo)
);
const FullscreenSlideBoundCaptionDemo = dynamic<DemoRuntimeProps>(() =>
  import("./fullscreen/fullscreen-slide-bound-caption/Component").then((module) => module.FullscreenSlideBoundCaptionDemo)
);
const FullscreenThumbnailsDemo = dynamic<DemoRuntimeProps>(() =>
  import("./fullscreen/fullscreen-thumbnails/Component").then((module) => module.FullscreenThumbnailsDemo)
);
const FullscreenCaptionThumbnailsDemo = dynamic<DemoRuntimeProps>(() =>
  import("./fullscreen/fullscreen-caption-thumbnails/Component").then((module) => module.FullscreenCaptionThumbnailsDemo)
);
const FullscreenFadeEffectsDemo = dynamic<DemoRuntimeProps>(() =>
  import("./fullscreen/fullscreen-fade-effects/Component").then((module) => module.FullscreenFadeEffectsDemo)
);
const FullscreenViewportOverlayCaptionDemo = dynamic<DemoRuntimeProps>(() =>
  import("./fullscreen/fullscreen-viewport-overlay-caption/Component").then((module) => module.FullscreenViewportOverlayCaptionDemo)
);
const FullscreenViewportOverlayCaptionSizedDemo = dynamic<DemoRuntimeProps>(() =>
  import("./fullscreen/fullscreen-viewport-overlay-caption-sized/Component").then((module) => module.FullscreenViewportOverlayCaptionSizedDemo)
);
const FullscreenLazyLoadDemo = dynamic<DemoRuntimeProps>(() =>
  import("./fullscreen/fullscreen-lazy-load/Component").then((module) => module.FullscreenLazyLoadDemo)
);
const FullscreenImageHoverDemo = dynamic<DemoRuntimeProps>(() =>
  import("./fullscreen/fullscreen-image-hover/Component").then((module) => module.FullscreenImageHoverDemo)
);
const FullscreenLayoutAgnosticDemo = dynamic<DemoRuntimeProps>(() =>
  import("./fullscreen/fullscreen-layout-agnostic/Component").then((module) => module.FullscreenLayoutAgnosticDemo)
);
const SkeletonFlexCardsDemo = dynamic<DemoRuntimeProps>(() =>
  import("./skeleton/skeleton-flex-cards/Component").then((module) => module.SkeletonFlexCardsDemo)
);
const SkeletonAppShellDemo = dynamic<DemoRuntimeProps>(() =>
  import("./skeleton/skeleton-app-shell/Component").then((module) => module.SkeletonAppShellDemo)
);
const SkeletonResponsiveTextDemo = dynamic<DemoRuntimeProps>(() =>
  import("./skeleton/skeleton-responsive-text/Component").then((module) => module.SkeletonResponsiveTextDemo)
);
const SkeletonForceOverlayDemo = dynamic<DemoRuntimeProps>(() =>
  import("./skeleton/skeleton-force-overlay/Component").then((module) => module.SkeletonForceOverlayDemo)
);
const RevealSectionsDemo = dynamic<DemoRuntimeProps>(() =>
  import("./reveal/reveal-sections/Component").then((module) => module.RevealSectionsDemo)
);
const RevealImageReadyDemo = dynamic<DemoRuntimeProps>(() =>
  import("./reveal/reveal-image-ready/Component").then((module) => module.RevealImageReadyDemo)
);
const ZoomPanStandaloneDemo = dynamic<DemoRuntimeProps>(() =>
  import("./zoom-pan/standalone/Component").then((module) => module.ZoomPanStandaloneDemo)
);
const ZoomPanSliderDemo = dynamic<DemoRuntimeProps>(() =>
  import("./zoom-pan/slider/Component").then((module) => module.ZoomPanSliderDemo)
);
const ZoomPanGridDemo = dynamic<DemoRuntimeProps>(() =>
  import("./zoom-pan/grid/Component").then((module) => module.ZoomPanGridDemo)
);
const ZoomPanMasonryDemo = dynamic<DemoRuntimeProps>(() =>
  import("./zoom-pan/masonry/Component").then((module) => module.ZoomPanMasonryDemo)
);
const ZoomPanImageHoverDemo = dynamic<DemoRuntimeProps>(() =>
  import("./zoom-pan/image-hover/Component").then((module) => module.ZoomPanImageHoverDemo)
);

const DEMO_IDS_WITH_GENERATED_CODE_TABS = new Set<string>([
  "entries-grid",
  "entries-masonry",
  "entries-slider",
  "entries-slider-html5",
  "grid-columns",
  "grid-lazy-load",
  "grid-min-column-width",
  "grid-template-columns",
  "grid-video-html5",
  "grid-video-vimeo",
  "grid-video-youtube",
  "masonry-balanced",
  "masonry-horizontal-order",
  "masonry-lazy-load",
  "masonry-round-robin",
  "masonry-spans",
  "masonry-video-html5",
  "masonry-video-vimeo",
  "masonry-video-youtube",
  "skeleton-force-overlay",
  "skeleton-responsive-text",
  "slider-auto-height",
  "slider-cards",
]);

let generatedCodeTabsPromise: Promise<Record<string, DemoCodeFileTab[]>> | null = null;

function loadGeneratedCodeTabs() {
  generatedCodeTabsPromise ??= import("./generated-code-tabs").then(
    (module) => module.generatedCodeTabsByDemoId
  );

  return generatedCodeTabsPromise;
}

function loadDemoCode(
  sourceLoader: () => Promise<{ source: string }>,
  cssLoader: () => Promise<{ css: string }>,
  demoId: string
): DemoCodeLoader {
  let codePromise: Promise<LoadedDemoCode> | null = null;

  return () => {
    codePromise ??= Promise.all([
      sourceLoader(),
      cssLoader(),
      DEMO_IDS_WITH_GENERATED_CODE_TABS.has(demoId)
        ? loadGeneratedCodeTabs().then((tabsByDemoId) => tabsByDemoId[demoId] ?? [])
        : Promise.resolve([]),
    ]).then(([sourceModule, cssModule, extraCodeTabs]) => ({
      source: sourceModule.source,
      css: cssModule.css,
      extraCodeTabs,
    }));

    return codePromise;
  };
}

type DemoCategoryId =
  | "slider"
  | "grid"
  | "masonry"
  | "entries"
  | "zoom-pan"
  | "fullscreen"
  | "skeleton"
  | "reveal";

type DemoNavItem =
  | {
      readonly type: "demo";
      readonly demoId: string;
    }
  | {
      readonly type: "group";
      readonly id: string;
      readonly label: string;
      readonly demoIds: readonly string[];
    };

type DemoCategory = {
  readonly id: DemoCategoryId;
  readonly label: string;
  readonly description: string;
  readonly items: readonly DemoNavItem[];
};

type DemoDefinition = {
  id: string;
  title: string;
  eyebrow: string;
  tags: string[];
  categoryId: DemoCategoryId;
  Component: DemoComponent;
  loadComponent: () => Promise<DemoComponent>;
  loadCode: DemoCodeLoader;
  sourceFilename?: string;
  cssFilename?: string;
};

type LoadedDemoCode = {
  source: string;
  css: string;
  extraCodeTabs?: DemoCodeFileTab[];
};

type DemoCodeLoader = () => Promise<LoadedDemoCode>;

export type DemoCodeFileTab = {
  id: string;
  label: string;
  code: string;
  filename?: string;
  language?: string;
};

export type DemoCodeBlockOverride = {
  source?: string;
  css?: string;
  sourceFilename?: string;
  cssFilename?: string;
  extraCodeTabs?: DemoCodeFileTab[];
};

export type DemoCodeBlockOverrides = Record<string, DemoCodeBlockOverride>;

type SidebarExpansionState = {
  expandedCategories: DemoCategoryId[];
  syncedDemoId: string;
};

type DemoCanvasTab = "preview" | "code";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const SIMPLEBAR_SCROLLBAR_INTRO_MS = 320;

function toPascalCase(value: string) {
  return value
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("");
}

function resolveExpandedCategories(
  sidebarExpansion: SidebarExpansionState,
  selectedDemoId: string,
  selectedCategoryId: DemoCategoryId
) {
  if (
    sidebarExpansion.syncedDemoId === selectedDemoId ||
    sidebarExpansion.expandedCategories.includes(selectedCategoryId)
  ) {
    return sidebarExpansion.expandedCategories;
  }

  return [...sidebarExpansion.expandedCategories, selectedCategoryId];
}

function normalizeDemoSource(code: string) {
  return code
    .replaceAll("\\`", "`")
    .replaceAll("\\${", "${");
}

function basename(path: string) {
  const parts = path.split("/");
  return parts[parts.length - 1] ?? path;
}

function applyDemoCodeOverride(
  loadedCode: LoadedDemoCode,
  override: DemoCodeBlockOverride | undefined
): LoadedDemoCode {
  if (!override) return loadedCode;

  return {
    source: override.source ?? loadedCode.source,
    css: override.css ?? loadedCode.css,
    extraCodeTabs: [
      ...(loadedCode.extraCodeTabs ?? []),
      ...(override.extraCodeTabs ?? []),
    ],
  };
}

function getSidebarDemoLinkTitle(
  item: Extract<DemoNavItem, { type: "group" }>,
  demo: DemoDefinition
) {
  if (item.id === "entries-data-grid") {
    return demo.title.replace(/ Grid$/, "");
  }

  return demo.title;
}

function preloadDemo(demo: DemoDefinition) {
  void demo.loadComponent();
}

const DemoCodeBlock = memo(function DemoCodeBlock(props: {
  demo: DemoDefinition;
  codeBlockOverride?: DemoCodeBlockOverride;
}): JSX.Element {
  const { demo, codeBlockOverride } = props;
  const [loadedCode, setLoadedCode] = useState<LoadedDemoCode | null>(null);

  useEffect(() => {
    let isCurrent = true;

    demo.loadCode().then((nextLoadedCode) => {
      if (isCurrent) {
        setLoadedCode(nextLoadedCode);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [demo]);

  if (!loadedCode) {
    return <div className={styles.codeBlockPlaceholder} aria-hidden="true" />;
  }

  const resolvedCode = applyDemoCodeOverride(loadedCode, codeBlockOverride);
  const normalizedTypescriptCode = normalizeDemoSource(resolvedCode.source);
  const normalizedCssCode = normalizeDemoSource(resolvedCode.css);
  const normalizedExtraTabs = (resolvedCode.extraCodeTabs ?? []).map((tab) => ({
    ...tab,
    code: normalizeDemoSource(tab.code),
  }));
  const sourceFilename =
    codeBlockOverride?.sourceFilename ?? demo.sourceFilename ?? `${demo.title}.tsx`;
  const cssFilename =
    codeBlockOverride?.cssFilename ?? demo.cssFilename ?? `${demo.title}.css`;

  return (
    <CodeBlock
      className={styles.codeBlock}
      code={normalizedTypescriptCode}
      disableAnimations
      tabs={[
        {
          id: "typescript",
          label: basename(sourceFilename),
          code: normalizedTypescriptCode,
          filename: sourceFilename,
          language: "tsx",
        },
        ...normalizedExtraTabs,
        {
          id: "css",
          label: basename(cssFilename),
          code: normalizedCssCode,
          filename: cssFilename,
          language: "css",
        },
      ]}
      defaultTabId="typescript"
      aria-label={`${demo.title} code example`}
    />
  );
});

const SelectedDemoPane = memo(function SelectedDemoPane(props: {
  selectedCategoryLabel: string;
  selectedDemo: DemoDefinition;
  selectedDemoCanvasClassName: string;
  selectedDemoCodeOverride?: DemoCodeBlockOverride;
}): JSX.Element {
  const {
    selectedCategoryLabel,
    selectedDemo,
    selectedDemoCanvasClassName,
    selectedDemoCodeOverride,
  } = props;
  const [displayedTab, setDisplayedTab] = useState<DemoCanvasTab>("preview");
  const SelectedDemoComponent = selectedDemo.Component;
  const isDisplayingPreviewTab = displayedTab === "preview";

  return (
    <section className={styles.demoCard}>
      <div className={styles.demoHeader}>
        <span className={styles.demoCategory}>{selectedCategoryLabel}</span>
        <h2 className={styles.demoTitle}>{selectedDemo.title}</h2>
        <div className={styles.tagRow}>
          Add-ons: <span></span>
          {selectedDemo.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.demoCanvasTabs}>
        <div
          className={styles.demoCanvasTabList}
          aria-label={`${selectedDemo.title} demo view`}
          data-active-tab={displayedTab}
        >
          <span aria-hidden="true" className={styles.demoCanvasTabIndicator} />
          <button
            type="button"
            className={styles.demoCanvasTab}
            data-tab="preview"
            aria-pressed={isDisplayingPreviewTab}
            onClick={() => setDisplayedTab("preview")}
          >
            Preview
          </button>
          <button
            type="button"
            className={styles.demoCanvasTab}
            data-tab="code"
            aria-pressed={!isDisplayingPreviewTab}
            onClick={() => setDisplayedTab("code")}
          >
            Code
          </button>
        </div>

        <div className={styles.demoCanvasPanel}>
          {isDisplayingPreviewTab ? (
            <div
              className={`${cx(styles.demoCanvas, selectedDemoCanvasClassName)} shadow-sm`}
            >
              <SelectedDemoComponent />
            </div>
          ) : (
            <DemoCodeBlock
              key={selectedDemo.id}
              demo={selectedDemo}
              codeBlockOverride={selectedDemoCodeOverride}
            />
          )}
        </div>
      </div>
    </section>
  );
});

const SidebarScrollRegion = memo(function SidebarScrollRegion(props: {
  children: ReactNode;
}): JSX.Element {
  const { children } = props;
  const hasMounted = useHasMounted();
  const simpleBarRef = useRef<SimpleBarCore | null>(null);
  const [scrollbarIntroPlayed, setScrollbarIntroPlayed] = useState(false);
  const isCompactSidebar = useMediaQuery("(max-width: 767px)");
  const shouldUseSimpleBar = hasMounted && !isCompactSidebar;

  useEffect(() => {
    if (!shouldUseSimpleBar || scrollbarIntroPlayed) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setScrollbarIntroPlayed(true);
    }, SIMPLEBAR_SCROLLBAR_INTRO_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [scrollbarIntroPlayed, shouldUseSimpleBar]);

  useLayoutEffect(() => {
    if (!shouldUseSimpleBar) {
      return;
    }

    if (simpleBarRef.current === null) {
      return;
    }

    const simpleBarInstance = simpleBarRef.current;
    let frameId: number | null = null;

    function recalculate() {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      frameId = window.requestAnimationFrame(() => {
        simpleBarInstance.recalculate();
      });
    }

    function handleResize() {
      recalculate();
    }

    window.addEventListener("resize", handleResize);
    recalculate();

    return () => {
      window.removeEventListener("resize", handleResize);

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [shouldUseSimpleBar]);

  if (shouldUseSimpleBar) {
    return (
      <SimpleBar
        ref={simpleBarRef}
        className={cx(
          styles.sidebarNavScrollArea,
          !scrollbarIntroPlayed && styles.sidebarNavScrollAreaIntro
        )}
        autoHide={false}
        forceVisible="y"
      >
        {children}
      </SimpleBar>
    );
  }

  return (
    <div
      className={cx(
        styles.sidebarNavScrollArea,
        styles.sidebarNavScrollAreaNative
      )}
    >
      {children}
    </div>
  );
});

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(query);

    function handleChange(event: MediaQueryListEvent) {
      setMatches(event.matches);
    }

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}

function subscribeToHydration(): () => void {
  return () => {};
}

function useHasMounted(): boolean {
  return useSyncExternalStore(subscribeToHydration, () => true, () => false);
}

function AnimatedCategoryPanel(props: {
  id: string;
  isOpen: boolean;
  children: ReactNode;
}): JSX.Element {
  const { id, isOpen, children } = props;
  const panelRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const isFirstRenderRef = useRef(true);
  const isOpenRef = useRef(isOpen);
  const [initialInlineStyle] = useState<ComponentProps<"div">["style"]>(() => ({
    height: isOpen ? "auto" : "0px",
  }));

  useLayoutEffect(() => {
    const panel = panelRef.current;

    if (!panel) {
      return;
    }

    isOpenRef.current = isOpen;

    if (isFirstRenderRef.current) {
      panel.style.height = isOpen ? "auto" : "0px";
      isFirstRenderRef.current = false;
      return;
    }

    const content = contentRef.current;

    if (!content) {
      return;
    }

    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    const currentHeight = panel.getBoundingClientRect().height;
    const nextHeight = content.getBoundingClientRect().height;
    panel.style.setProperty(
      "--category-panel-duration",
      isOpen ? "260ms" : "260ms"
    );
    panel.style.setProperty(
      "--category-panel-easing",
      isOpen ? "cubic-bezier(0.4, 0, 0.2, 1)" : "cubic-bezier(0.22, 1, 0.36, 1)"
    );

    if (Math.abs(currentHeight - nextHeight) < 1 && isOpen) {
      panel.style.height = "auto";
      return;
    }

    panel.style.height = `${currentHeight}px`;
    void panel.offsetHeight;

    frameRef.current = window.requestAnimationFrame(() => {
      panel.style.height = isOpen ? `${nextHeight}px` : "0px";
    });

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [isOpen]);

  return (
    <div
      id={id}
      ref={panelRef}
      className={styles.categoryPanel}
      style={initialInlineStyle}
      aria-hidden={!isOpen}
      inert={!isOpen}
      onTransitionEnd={(event) => {
        if (event.target !== event.currentTarget || event.propertyName !== "height") {
          return;
        }

        event.currentTarget.style.height = isOpenRef.current ? "auto" : "0px";
      }}
    >
      <div ref={contentRef} className={styles.categoryPanelContent}>
        {children}
      </div>
    </div>
  );
}

const DEMOS: DemoDefinition[] = [
  {
    id: "slider-default",
    title: "Default",
    eyebrow: "Slider",
    tags: ["fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderDefaultDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["slider-default"],
    loadCode: loadDemoCode(
      () => import("./slider/slider-default/source"),
      () => import("./slider/slider-default/css"),
      "slider-default"
    ),
  },
  {
    id: "slider-loop",
    title: "Loop",
    eyebrow: "Slider",
    tags: ["center", "initialIndex", "fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderLoopDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["slider-loop"],
    loadCode: loadDemoCode(
      () => import("./slider/slider-loop/source"),
      () => import("./slider/slider-loop/css"),
      "slider-loop"
    ),
  },
  {
    id: "slider-video-html5",
    title: "HTML5",
    eyebrow: "Slider Video",
    tags: ["fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderVideoHtml5Demo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["slider-video-html5"],
    loadCode: loadDemoCode(
      () => import("./slider/slider-video-html5/source"),
      () => import("./slider/slider-video-html5/css"),
      "slider-video-html5"
    ),
  },
  {
    id: "slider-video-html5-loop",
    title: "HTML5 + Loop",
    eyebrow: "Slider Video",
    tags: ["center","fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderVideoHtml5LoopDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["slider-video-html5-loop"],
    loadCode: loadDemoCode(
      () => import("./slider/slider-video-html5-loop/source"),
      () => import("./slider/slider-video-html5-loop/css"),
      "slider-video-html5-loop"
    ),
  },
  {
    id: "slider-video-youtube",
    title: "Youtube",
    eyebrow: "Slider Video",
    tags: ["scroll-bar","fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderVideoYoutubeDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["slider-video-youtube"],
    loadCode: loadDemoCode(
      () => import("./slider/slider-video-youtube/source"),
      () => import("./slider/slider-video-youtube/css"),
      "slider-video-youtube"
    ),
  },
  {
    id: "slider-video-youtube-loop",
    title: "Youtube + Loop",
    eyebrow: "Slider Video",
    tags: ["scroll-bar","center","fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderVideoYoutubeLoopDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["slider-video-youtube-loop"],
    loadCode: loadDemoCode(
      () => import("./slider/slider-video-youtube-loop/source"),
      () => import("./slider/slider-video-youtube-loop/css"),
      "slider-video-youtube-loop"
    ),
  },
  {
    id: "slider-video-vimeo",
    title: "Vimeo",
    eyebrow: "Slider Video",
    tags: ["scroll-bar","fulscreen","skeleton"],
    categoryId: "slider",
    Component: SliderVideoVimeoDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["slider-video-vimeo"],
    loadCode: loadDemoCode(
      () => import("./slider/slider-video-vimeo/source"),
      () => import("./slider/slider-video-vimeo/css"),
      "slider-video-vimeo"
    ),
  },
  {
    id: "slider-video-vimeo-loop",
    title: "Vimeo + Loop",
    eyebrow: "Slider Video",
    tags: ["scroll-bar","center","fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderVideoVimeoLoopDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["slider-video-vimeo-loop"],
    loadCode: loadDemoCode(
      () => import("./slider/slider-video-vimeo-loop/source"),
      () => import("./slider/slider-video-vimeo-loop/css"),
      "slider-video-vimeo-loop"
    ),
  },
  {
    id: "slider-right-to-left",
    title: "Right To Left",
    eyebrow: "Slider",
    tags: ["fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderRightToLeftDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["slider-right-to-left"],
    loadCode: loadDemoCode(
      () => import("./slider/slider-right-to-left/source"),
      () => import("./slider/slider-right-to-left/css"),
      "slider-right-to-left"
    ),
  },
  {
    id: "slider-group-cells",
    title: "Group Cells",
    eyebrow: "Slider",
    tags: ["fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderGroupCellsDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["slider-group-cells"],
    loadCode: loadDemoCode(
      () => import("./slider/slider-group-cells/source"),
      () => import("./slider/slider-group-cells/css"),
      "slider-group-cells"
    ),
  },
  {
    id: "slider-free-scroll",
    title: "Free Scroll",
    eyebrow: "Slider",
    tags: ["group-cells","fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderFreeScrollDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["slider-free-scroll"],
    loadCode: loadDemoCode(
      () => import("./slider/slider-free-scroll/source"),
      () => import("./slider/slider-free-scroll/css"),
      "slider-free-scroll"
    ),
  },
  {
    id: "slider-skip-snaps",
    title: "Skip Snaps",
    eyebrow: "Slider",
    tags: ["fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderSkipSnapsDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["slider-skip-snaps"],
    loadCode: loadDemoCode(
      () => import("./slider/slider-skip-snaps/source"),
      () => import("./slider/slider-skip-snaps/css"),
      "slider-skip-snaps"
    ),
  },
  {
    id: "slider-strict-snaps",
    title: "Strict Snaps",
    eyebrow: "Slider",
    tags: ["loop","align-center","fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderStrictSnapsDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["slider-strict-snaps"],
    loadCode: loadDemoCode(
      () => import("./slider/slider-strict-snaps/source"),
      () => import("./slider/slider-strict-snaps/css"),
      "slider-strict-snaps"
    ),
  },
  {
    id: "slider-center-align",
    title: "Center Align",
    eyebrow: "Slider",
    tags: ["fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderCenterAlignDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["slider-center-align"],
    loadCode: loadDemoCode(
      () => import("./slider/slider-center-align/source"),
      () => import("./slider/slider-center-align/css"),
      "slider-center-align"
    ),
  },
  {
    id: "slider-variable-widths",
    title: "Variable Widths",
    eyebrow: "Slider",
    tags: ["center", "contain-scroll", "fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderVariableWidthsDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["slider-variable-widths"],
    loadCode: loadDemoCode(
      () => import("./slider/slider-variable-widths/source"),
      () => import("./slider/slider-variable-widths/css"),
      "slider-variable-widths"
    ),
  },
  {
    id: "slider-y-axis",
    title: "Y Axis",
    eyebrow: "Slider",
    tags: ["fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderYAxisDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["slider-y-axis"],
    loadCode: loadDemoCode(
      () => import("./slider/slider-y-axis/source"),
      () => import("./slider/slider-y-axis/css"),
      "slider-y-axis"
    ),
  },
  {
    id: "slider-cells-per-slide",
    title: "Cells Per Slide",
    eyebrow: "Slider",
    tags: ["group-cells","fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderCellsPerSlideDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["slider-cells-per-slide"],
    loadCode: loadDemoCode(
      () => import("./slider/slider-cells-per-slide/source"),
      () => import("./slider/slider-cells-per-slide/css"),
      "slider-cells-per-slide"
    ),
  },
  {
    id: "slider-thumbnails",
    title: "Thumbnails",
    eyebrow: "Slider",
    tags: ["fullscreen","skeleton","fullscreen-thumbnails"],
    categoryId: "slider",
    Component: SliderThumbnailsDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["slider-thumbnails"],
    loadCode: loadDemoCode(
      () => import("./slider/slider-thumbnails/source"),
      () => import("./slider/slider-thumbnails/css"),
      "slider-thumbnails"
    ),
  },
  {
    id: "slider-lazy-load",
    title: "Lazy Load",
    eyebrow: "Slider",
    tags: ["fullscreen","skeleton","fullscreen-lazy-load"],
    categoryId: "slider",
    Component: SliderLazyLoadDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["slider-lazy-load"],
    loadCode: loadDemoCode(
      () => import("./slider/slider-lazy-load/source"),
      () => import("./slider/slider-lazy-load/css"),
      "slider-lazy-load"
    ),
  },
  {
    id: "slider-auto-scroll",
    title: "Auto Scroll",
    eyebrow: "Slider",
    tags: ["progress","center","loop","fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderAutoScrollDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["slider-auto-scroll"],
    loadCode: loadDemoCode(
      () => import("./slider/slider-auto-scroll/source"),
      () => import("./slider/slider-auto-scroll/css"),
      "slider-auto-scroll"
    ),
  },
  {
    id: "slider-auto-play",
    title: "Auto Play",
    eyebrow: "Slider",
    tags: ["center","loop","fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderAutoPlayDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["slider-auto-play"],
    loadCode: loadDemoCode(
      () => import("./slider/slider-auto-play/source"),
      () => import("./slider/slider-auto-play/css"),
      "slider-auto-play"
    ),
  },
  {
    id: "slider-auto-height",
    title: "Auto Height",
    eyebrow: "Slider",
    tags: ["center","loop","fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderAutoHeightDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["slider-auto-height"],
    loadCode: loadDemoCode(
      () => import("./slider/slider-auto-height/source"),
      () => import("./slider/slider-auto-height/css"),
      "slider-auto-height"
    ),
  },
  {
    id: "slider-parallax",
    title: "Parallax",
    eyebrow: "Slider",
    tags: ["free-scroll","center","loop","fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderParallaxDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["slider-parallax"],
    loadCode: loadDemoCode(
      () => import("./slider/slider-parallax/source"),
      () => import("./slider/slider-parallax/css"),
      "slider-parallax"
    ),
  },
  {
    id: "slider-scale",
    title: "Scale",
    eyebrow: "Slider",
    tags: ["center","loop","fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderScaleDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["slider-scale"],
    loadCode: loadDemoCode(
      () => import("./slider/slider-scale/source"),
      () => import("./slider/slider-scale/css"),
      "slider-scale"
    ),
  },
  {
    id: "slider-fade",
    title: "Fade",
    eyebrow: "Slider",
    tags: ["center","loop","fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderFadeDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["slider-fade"],
    loadCode: loadDemoCode(
      () => import("./slider/slider-fade/source"),
      () => import("./slider/slider-fade/css"),
      "slider-fade"
    ),
  },
  {
    id: "slider-crossfade",
    title: "Crossfade",
    eyebrow: "Slider",
    tags: ["center","loop","drag","fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderCrossfadeDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["slider-crossfade"],
    loadCode: loadDemoCode(
      () => import("./slider/slider-crossfade/source"),
      () => import("./slider/slider-crossfade/css"),
      "slider-crossfade"
    ),
  },
  {
    id: "slider-cards",
    title: "Cards",
    eyebrow: "Slider",
    tags: ["cells-per-slide","group-cells","loop","fullscreen","skeleton"],
    categoryId: "slider",
    Component: SliderCardsDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["slider-cards"],
    loadCode: loadDemoCode(
      () => import("./slider/slider-cards/source"),
      () => import("./slider/slider-cards/css"),
      "slider-cards"
    ),
  },
  {
    id: "slider-interactive",
    title: "Interactive",
    eyebrow: "Slider API",
    tags: ["gallery-api","append","prepend","insert","remove","replace","set-items"],
    categoryId: "slider",
    Component: SliderInteractiveDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["slider-interactive"],
    loadCode: loadDemoCode(
      () => import("./slider/slider-interactive/source"),
      () => import("./slider/slider-interactive/css"),
      "slider-interactive"
    ),
  },
  {
    id: "grid-columns",
    title: "Spans",
    eyebrow: "Grid",
    tags: ["fullscreen","responsive","skeleton","span","grid.item"],
    categoryId: "grid",
    Component: GridColumnsDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["grid-columns"],
    loadCode: loadDemoCode(
      () => import("./grid/grid-columns/source"),
      () => import("./grid/grid-columns/css"),
      "grid-columns"
    ),
  },
  {
    id: "grid-template-columns",
    title: "Template Columns",
    eyebrow: "Grid",
    tags: ["fullscreen","skeleton","template-columns","span"],
    categoryId: "grid",
    Component: GridTemplateColumnsDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["grid-template-columns"],
    loadCode: loadDemoCode(
      () => import("./grid/grid-template-columns/source"),
      () => import("./grid/grid-template-columns/css"),
      "grid-template-columns"
    ),
  },
  {
    id: "grid-min-column-width",
    title: "Min Column Width",
    eyebrow: "Grid",
    tags: ["fullscreen","skeleton"],
    categoryId: "grid",
    Component: GridMinColumnWidthDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["grid-min-column-width"],
    loadCode: loadDemoCode(
      () => import("./grid/grid-min-column-width/source"),
      () => import("./grid/grid-min-column-width/css"),
      "grid-min-column-width"
    ),
  },
  {
    id: "grid-lazy-load",
    title: "Lazy Load",
    eyebrow: "Grid",
    tags: ["fullscreen","skeleton","fullscreen-lazy-load"],
    categoryId: "grid",
    Component: GridLazyLoadDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["grid-lazy-load"],
    loadCode: loadDemoCode(
      () => import("./grid/grid-lazy-load/source"),
      () => import("./grid/grid-lazy-load/css"),
      "grid-lazy-load"
    ),
  },
  {
    id: "grid-pagination",
    title: "Server Pagination",
    eyebrow: "Grid Data",
    tags: ["api","pagination","server","dummyjson"],
    categoryId: "grid",
    Component: GridPaginationDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["grid-pagination"],
    loadCode: loadDemoCode(
      () => import("./grid/grid-pagination/source"),
      () => import("./grid/grid-pagination/css"),
      "grid-pagination"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "grid-pagination-demo.module.css",
  },
  {
    id: "grid-pagination-client",
    title: "Client Pagination",
    eyebrow: "Grid Data",
    tags: ["api","pagination","client","dummyjson"],
    categoryId: "grid",
    Component: GridPaginationClientDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["grid-pagination-client"],
    loadCode: loadDemoCode(
      () => import("./grid/grid-pagination-client/source"),
      () => import("./grid/grid-pagination-client/css"),
      "grid-pagination-client"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "grid-pagination-demo.module.css",
  },
  {
    id: "grid-load-more",
    title: "Load More",
    eyebrow: "Grid Data",
    tags: ["api","load-more","dummyjson"],
    categoryId: "grid",
    Component: GridLoadMoreDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["grid-load-more"],
    loadCode: loadDemoCode(
      () => import("./grid/grid-load-more/source"),
      () => import("./grid/grid-load-more/css"),
      "grid-load-more"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "grid-load-more-demo.module.css",
  },
  {
    id: "grid-infinite-scroll",
    title: "Infinite Scroll",
    eyebrow: "Grid Data",
    tags: ["api","infinite-scroll","dummyjson"],
    categoryId: "grid",
    Component: GridInfiniteScrollDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["grid-infinite-scroll"],
    loadCode: loadDemoCode(
      () => import("./grid/grid-infinite-scroll/source"),
      () => import("./grid/grid-infinite-scroll/css"),
      "grid-infinite-scroll"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "grid-infinite-scroll-demo.module.css",
  },
  {
    id: "grid-virtualization",
    title: "Virtualization",
    eyebrow: "Grid Data",
    tags: ["api","virtualization","dummyjson"],
    categoryId: "grid",
    Component: GridVirtualizationDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["grid-virtualization"],
    loadCode: loadDemoCode(
      () => import("./grid/grid-virtualization/source"),
      () => import("./grid/grid-virtualization/css"),
      "grid-virtualization"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "grid-virtualization-demo.module.css",
  },
  {
    id: "grid-video-html5",
    title: "HTML5",
    eyebrow: "Grid Video",
    tags: ["fullscreen","skeleton"],
    categoryId: "grid",
    Component: GridVideoHtml5Demo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["grid-video-html5"],
    loadCode: loadDemoCode(
      () => import("./grid/grid-video-html5/source"),
      () => import("./grid/grid-video-html5/css"),
      "grid-video-html5"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "grid-video-html5-demo.module.css",
  },
  {
    id: "grid-video-youtube",
    title: "Youtube",
    eyebrow: "Grid Video",
    tags: ["fullscreen","skeleton"],
    categoryId: "grid",
    Component: GridVideoYoutubeDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["grid-video-youtube"],
    loadCode: loadDemoCode(
      () => import("./grid/grid-video-youtube/source"),
      () => import("./grid/grid-video-youtube/css"),
      "grid-video-youtube"
    ),
  },
  {
    id: "grid-video-vimeo",
    title: "Vimeo",
    eyebrow: "Grid Video",
    tags: ["fullscreen","skeleton"],
    categoryId: "grid",
    Component: GridVideoVimeoDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["grid-video-vimeo"],
    loadCode: loadDemoCode(
      () => import("./grid/grid-video-vimeo/source"),
      () => import("./grid/grid-video-vimeo/css"),
      "grid-video-vimeo"
    ),
  },
  {
    id: "masonry-core-balanced",
    title: "Balanced",
    eyebrow: "Masonry Core",
    tags: ["images","balanced","fullscreen","skeleton","core"],
    categoryId: "masonry",
    Component: MasonryCoreBalancedDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["masonry-core-balanced"],
    loadCode: loadDemoCode(
      () => import("./masonry/masonry-core-balanced/source"),
      () => import("./masonry/masonry-core-balanced/css"),
      "masonry-core-balanced"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "masonry-core-balanced-demo.module.css",
  },
  {
    id: "masonry-core-spans",
    title: "Spans",
    eyebrow: "Masonry Core",
    tags: ["images","balanced","span","fullscreen","skeleton","core"],
    categoryId: "masonry",
    Component: MasonryCoreSpansDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["masonry-core-spans"],
    loadCode: loadDemoCode(
      () => import("./masonry/masonry-core-spans/source"),
      () => import("./masonry/masonry-core-spans/css"),
      "masonry-core-spans"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "masonry-core-spans-demo.module.css",
  },
  {
    id: "masonry-core-horizontal-order",
    title: "Horizontal Order",
    eyebrow: "Masonry Core",
    tags: ["images","horizontal-order","span","fullscreen","skeleton","core"],
    categoryId: "masonry",
    Component: MasonryCoreHorizontalOrderDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["masonry-core-horizontal-order"],
    loadCode: loadDemoCode(
      () => import("./masonry/masonry-core-horizontal-order/source"),
      () => import("./masonry/masonry-core-horizontal-order/css"),
      "masonry-core-horizontal-order"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "masonry-core-horizontal-order-demo.module.css",
  },
  {
    id: "masonry-core-round-robin",
    title: "Round Robin",
    eyebrow: "Masonry Core",
    tags: ["images","round-robin","fullscreen","skeleton","core"],
    categoryId: "masonry",
    Component: MasonryCoreRoundRobinDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["masonry-core-round-robin"],
    loadCode: loadDemoCode(
      () => import("./masonry/masonry-core-round-robin/source"),
      () => import("./masonry/masonry-core-round-robin/css"),
      "masonry-core-round-robin"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "masonry-core-round-robin-demo.module.css",
  },
  {
    id: "masonry-core-lazy-load",
    title: "Lazy Load",
    eyebrow: "Masonry Core",
    tags: ["images","lazy-load","fullscreen","skeleton","core"],
    categoryId: "masonry",
    Component: MasonryCoreLazyLoadDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["masonry-core-lazy-load"],
    loadCode: loadDemoCode(
      () => import("./masonry/masonry-core-lazy-load/source"),
      () => import("./masonry/masonry-core-lazy-load/css"),
      "masonry-core-lazy-load"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "masonry-core-lazy-load-demo.module.css",
  },
  {
    id: "masonry-pagination",
    title: "Server Pagination",
    eyebrow: "Masonry Data",
    tags: ["api","pagination","server","dummyjson"],
    categoryId: "masonry",
    Component: MasonryPaginationDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["masonry-pagination"],
    loadCode: loadDemoCode(
      () => import("./masonry/masonry-pagination/source"),
      () => import("./masonry/masonry-pagination/css"),
      "masonry-pagination"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "masonry-pagination-demo.module.css",
  },
  {
    id: "masonry-pagination-client",
    title: "Client Pagination",
    eyebrow: "Masonry Data",
    tags: ["api","pagination","client","dummyjson"],
    categoryId: "masonry",
    Component: MasonryPaginationClientDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["masonry-pagination-client"],
    loadCode: loadDemoCode(
      () => import("./masonry/masonry-pagination-client/source"),
      () => import("./masonry/masonry-pagination-client/css"),
      "masonry-pagination-client"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "masonry-pagination-demo.module.css",
  },
  {
    id: "masonry-load-more",
    title: "Load More",
    eyebrow: "Masonry Data",
    tags: ["api","load-more","dummyjson"],
    categoryId: "masonry",
    Component: MasonryLoadMoreDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["masonry-load-more"],
    loadCode: loadDemoCode(
      () => import("./masonry/masonry-load-more/source"),
      () => import("./masonry/masonry-load-more/css"),
      "masonry-load-more"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "masonry-load-more-demo.module.css",
  },
  {
    id: "masonry-infinite-scroll",
    title: "Infinite Scroll",
    eyebrow: "Masonry Data",
    tags: ["api","infinite-scroll","dummyjson"],
    categoryId: "masonry",
    Component: MasonryInfiniteScrollDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["masonry-infinite-scroll"],
    loadCode: loadDemoCode(
      () => import("./masonry/masonry-infinite-scroll/source"),
      () => import("./masonry/masonry-infinite-scroll/css"),
      "masonry-infinite-scroll"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "masonry-infinite-scroll-demo.module.css",
  },
  {
    id: "masonry-virtualization",
    title: "Virtualization",
    eyebrow: "Masonry Data",
    tags: ["api","virtualization","dummyjson"],
    categoryId: "masonry",
    Component: MasonryVirtualizationDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["masonry-virtualization"],
    loadCode: loadDemoCode(
      () => import("./masonry/masonry-virtualization/source"),
      () => import("./masonry/masonry-virtualization/css"),
      "masonry-virtualization"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "masonry-virtualization-demo.module.css",
  },
  {
    id: "masonry-balanced",
    title: "Balanced",
    eyebrow: "Masonry",
    tags: ["balanced","video","fullscreen","skeleton","text","itemWrapStyle"],
    categoryId: "masonry",
    Component: MasonryBalancedDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["masonry-balanced"],
    loadCode: loadDemoCode(
      () => import("./masonry/masonry-balanced/source"),
      () => import("./masonry/masonry-balanced/css"),
      "masonry-balanced"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "masonry-balanced-demo.module.css",
  },
  {
    id: "masonry-spans",
    title: "Spans",
    eyebrow: "Masonry",
    tags: ["balanced","span","video","fullscreen","skeleton","masonry.item"],
    categoryId: "masonry",
    Component: MasonrySpansDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["masonry-spans"],
    loadCode: loadDemoCode(
      () => import("./masonry/masonry-spans/source"),
      () => import("./masonry/masonry-spans/css"),
      "masonry-spans"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "masonry-spans-demo.module.css",
  },
  {
    id: "masonry-horizontal-order",
    title: "Horizontal Order",
    eyebrow: "Masonry",
    tags: ["horizontal-order","span","video","fullscreen","skeleton"],
    categoryId: "masonry",
    Component: MasonryHorizontalOrderDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["masonry-horizontal-order"],
    loadCode: loadDemoCode(
      () => import("./masonry/masonry-horizontal-order/source"),
      () => import("./masonry/masonry-horizontal-order/css"),
      "masonry-horizontal-order"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "masonry-horizontal-order-demo.module.css",
  },
  {
    id: "masonry-round-robin",
    title: "Round Robin",
    eyebrow: "Masonry",
    tags: ["round-robin","video","fullscreen","skeleton"],
    categoryId: "masonry",
    Component: MasonryRoundRobinDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["masonry-round-robin"],
    loadCode: loadDemoCode(
      () => import("./masonry/masonry-round-robin/source"),
      () => import("./masonry/masonry-round-robin/css"),
      "masonry-round-robin"
    ),
  },
  {
    id: "masonry-lazy-load",
    title: "Lazy Load",
    eyebrow: "Masonry",
    tags: ["video","fullscreen","skeleton","fullscreen-lazy-load"],
    categoryId: "masonry",
    Component: MasonryLazyLoadDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["masonry-lazy-load"],
    loadCode: loadDemoCode(
      () => import("./masonry/masonry-lazy-load/source"),
      () => import("./masonry/masonry-lazy-load/css"),
      "masonry-lazy-load"
    ),
  },
  {
    id: "masonry-video-html5",
    title: "HTML5",
    eyebrow: "Masonry Video",
    tags: ["html5","video","fullscreen","skeleton"],
    categoryId: "masonry",
    Component: MasonryVideoHtml5Demo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["masonry-video-html5"],
    loadCode: loadDemoCode(
      () => import("./masonry/masonry-video-html5/source"),
      () => import("./masonry/masonry-video-html5/css"),
      "masonry-video-html5"
    ),
  },
  {
    id: "masonry-video-youtube",
    title: "Youtube",
    eyebrow: "Masonry Video",
    tags: ["youtube","video","fullscreen","skeleton"],
    categoryId: "masonry",
    Component: MasonryVideoYoutubeDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["masonry-video-youtube"],
    loadCode: loadDemoCode(
      () => import("./masonry/masonry-video-youtube/source"),
      () => import("./masonry/masonry-video-youtube/css"),
      "masonry-video-youtube"
    ),
  },
  {
    id: "masonry-video-vimeo",
    title: "Vimeo",
    eyebrow: "Masonry Video",
    tags: ["vimeo","video","fullscreen","skeleton"],
    categoryId: "masonry",
    Component: MasonryVideoVimeoDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["masonry-video-vimeo"],
    loadCode: loadDemoCode(
      () => import("./masonry/masonry-video-vimeo/source"),
      () => import("./masonry/masonry-video-vimeo/css"),
      "masonry-video-vimeo"
    ),
  },
  {
    id: "entries-slider",
    title: "Slider",
    eyebrow: "Entries",
    tags: ["slider","fullscreen"],
    categoryId: "entries",
    Component: EntriesSliderDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["entries-slider"],
    loadCode: loadDemoCode(
      () => import("./entries/entries-slider/source"),
      () => import("./entries/entries-slider/css"),
      "entries-slider"
    ),
  },
  {
    id: "entries-slider-html5",
    title: "Slider + HTML5",
    eyebrow: "Entries",
    tags: ["slider","html5","video","fullscreen"],
    categoryId: "entries",
    Component: EntriesSliderHtml5Demo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["entries-slider-html5"],
    loadCode: loadDemoCode(
      () => import("./entries/entries-slider-html5/source"),
      () => import("./entries/entries-slider-html5/css"),
      "entries-slider-html5"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "entries-slider-html5-demo.module.css",
  },
  {
    id: "entries-grid",
    title: "Grid",
    eyebrow: "Entries",
    tags: ["grid","fullscreen"],
    categoryId: "entries",
    Component: EntriesGridDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["entries-grid"],
    loadCode: loadDemoCode(
      () => import("./entries/entries-grid/source"),
      () => import("./entries/entries-grid/css"),
      "entries-grid"
    ),
  },
  {
    id: "entries-masonry",
    title: "Masonry",
    eyebrow: "Entries",
    tags: ["masonry","fullscreen"],
    categoryId: "entries",
    Component: EntriesMasonryDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["entries-masonry"],
    loadCode: loadDemoCode(
      () => import("./entries/entries-masonry/source"),
      () => import("./entries/entries-masonry/css"),
      "entries-masonry"
    ),
  },
  {
    id: "entries-pagination",
    title: "Server Pagination",
    eyebrow: "Entries Data",
    tags: ["api","pagination","server","ready","dummyjson"],
    categoryId: "entries",
    Component: EntriesPaginationDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["entries-pagination"],
    loadCode: loadDemoCode(
      () => import("./entries/entries-pagination/source"),
      () => import("./entries/entries-pagination/css"),
      "entries-pagination"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "entries-pagination-demo.module.css",
  },
  {
    id: "entries-pagination-client",
    title: "Client Pagination",
    eyebrow: "Entries Data",
    tags: ["api","pagination","client","ready","dummyjson"],
    categoryId: "entries",
    Component: EntriesPaginationClientDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["entries-pagination-client"],
    loadCode: loadDemoCode(
      () => import("./entries/entries-pagination-client/source"),
      () => import("./entries/entries-pagination-client/css"),
      "entries-pagination-client"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "entries-pagination-demo.module.css",
  },
  {
    id: "entries-load-more",
    title: "Load More",
    eyebrow: "Entries Data",
    tags: ["api","load-more","ready","dummyjson"],
    categoryId: "entries",
    Component: EntriesLoadMoreDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["entries-load-more"],
    loadCode: loadDemoCode(
      () => import("./entries/entries-load-more/source"),
      () => import("./entries/entries-load-more/css"),
      "entries-load-more"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "entries-load-more-demo.module.css",
  },
  {
    id: "entries-infinite-scroll",
    title: "Infinite Scroll",
    eyebrow: "Entries Data",
    tags: ["api","infinite-scroll","ready","dummyjson"],
    categoryId: "entries",
    Component: EntriesInfiniteScrollDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["entries-infinite-scroll"],
    loadCode: loadDemoCode(
      () => import("./entries/entries-infinite-scroll/source"),
      () => import("./entries/entries-infinite-scroll/css"),
      "entries-infinite-scroll"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "entries-infinite-scroll-demo.module.css",
  },
  {
    id: "entries-virtualization",
    title: "Virtualization",
    eyebrow: "Entries Data",
    tags: ["api","virtualization","ready","dummyjson"],
    categoryId: "entries",
    Component: EntriesVirtualizationDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["entries-virtualization"],
    loadCode: loadDemoCode(
      () => import("./entries/entries-virtualization/source"),
      () => import("./entries/entries-virtualization/css"),
      "entries-virtualization"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "entries-virtualization-demo.module.css",
  },
  {
    id: "entries-pagination-grid",
    title: "Server Pagination Grid",
    eyebrow: "Entries Data",
    tags: ["api","pagination","server","grid","ready","dummyjson"],
    categoryId: "entries",
    Component: EntriesPaginationGridDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["entries-pagination-grid"],
    loadCode: loadDemoCode(
      () => import("./entries/entries-pagination-grid/source"),
      () => import("./entries/entries-pagination-grid/css"),
      "entries-pagination-grid"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "entries-pagination-grid-demo.module.css",
  },
  {
    id: "entries-pagination-grid-client",
    title: "Client Pagination Grid",
    eyebrow: "Entries Data",
    tags: ["api","pagination","client","grid","ready","dummyjson"],
    categoryId: "entries",
    Component: EntriesPaginationGridClientDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["entries-pagination-grid-client"],
    loadCode: loadDemoCode(
      () => import("./entries/entries-pagination-grid-client/source"),
      () => import("./entries/entries-pagination-grid-client/css"),
      "entries-pagination-grid-client"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "entries-pagination-grid-demo.module.css",
  },
  {
    id: "entries-load-more-grid",
    title: "Load More Grid",
    eyebrow: "Entries Data",
    tags: ["api","load-more","grid","ready","dummyjson"],
    categoryId: "entries",
    Component: EntriesLoadMoreGridDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["entries-load-more-grid"],
    loadCode: loadDemoCode(
      () => import("./entries/entries-load-more-grid/source"),
      () => import("./entries/entries-load-more-grid/css"),
      "entries-load-more-grid"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "entries-load-more-grid-demo.module.css",
  },
  {
    id: "entries-infinite-scroll-grid",
    title: "Infinite Scroll Grid",
    eyebrow: "Entries Data",
    tags: ["api","infinite-scroll","grid","ready","dummyjson"],
    categoryId: "entries",
    Component: EntriesInfiniteScrollGridDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["entries-infinite-scroll-grid"],
    loadCode: loadDemoCode(
      () => import("./entries/entries-infinite-scroll-grid/source"),
      () => import("./entries/entries-infinite-scroll-grid/css"),
      "entries-infinite-scroll-grid"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "entries-infinite-scroll-grid-demo.module.css",
  },
  {
    id: "entries-virtualization-grid",
    title: "Virtualization Grid",
    eyebrow: "Entries Data",
    tags: ["api","virtualization","grid","ready","dummyjson"],
    categoryId: "entries",
    Component: EntriesVirtualizationGridDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["entries-virtualization-grid"],
    loadCode: loadDemoCode(
      () => import("./entries/entries-virtualization-grid/source"),
      () => import("./entries/entries-virtualization-grid/css"),
      "entries-virtualization-grid"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "entries-virtualization-grid-demo.module.css",
  },
  {
    id: "fullscreen-layout-agnostic",
    title: "Standalone",
    eyebrow: "Fullscreen",
    tags: ["openFullscreenAt","api","scale","custom-markup"],
    categoryId: "fullscreen",
    Component: FullscreenLayoutAgnosticDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["fullscreen-layout-agnostic"],
    loadCode: loadDemoCode(
      () => import("./fullscreen/fullscreen-layout-agnostic/source"),
      () => import("./fullscreen/fullscreen-layout-agnostic/css"),
      "fullscreen-layout-agnostic"
    ),
  },
  {
    id: "fullscreen-slide-bound-caption",
    title: "Slide Caption",
    eyebrow: "Fullscreen",
    tags: ["captions","slide","responsive"],
    categoryId: "fullscreen",
    Component: FullscreenSlideBoundCaptionDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["fullscreen-slide-bound-caption"],
    loadCode: loadDemoCode(
      () => import("./fullscreen/fullscreen-slide-bound-caption/source"),
      () => import("./fullscreen/fullscreen-slide-bound-caption/css"),
      "fullscreen-slide-bound-caption"
    ),
  },
  {
    id: "fullscreen-thumbnails",
    title: "Thumbnails",
    eyebrow: "Fullscreen",
    tags: ["thumbnails","navigation","sync"],
    categoryId: "fullscreen",
    Component: FullscreenThumbnailsDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["fullscreen-thumbnails"],
    loadCode: loadDemoCode(
      () => import("./fullscreen/fullscreen-thumbnails/source"),
      () => import("./fullscreen/fullscreen-thumbnails/css"),
      "fullscreen-thumbnails"
    ),
  },
  {
    id: "fullscreen-caption-thumbnails",
    title: "Caption + Thumbnails",
    eyebrow: "Fullscreen",
    tags: ["captions","overlay","thumbnails","responsive"],
    categoryId: "fullscreen",
    Component: FullscreenCaptionThumbnailsDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["fullscreen-caption-thumbnails"],
    loadCode: loadDemoCode(
      () => import("./fullscreen/fullscreen-caption-thumbnails/source"),
      () => import("./fullscreen/fullscreen-caption-thumbnails/css"),
      "fullscreen-caption-thumbnails"
    ),
    sourceFilename: "CaptionThumbnails.tsx",
    cssFilename: "caption-thumbnails-demo.module.css",
  },
  {
    id: "fullscreen-fade-effects",
    title: "Fade Effects",
    eyebrow: "Fullscreen",
    tags: ["intro-fade","slide-fade","thumbnails"],
    categoryId: "fullscreen",
    Component: FullscreenFadeEffectsDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["fullscreen-fade-effects"],
    loadCode: loadDemoCode(
      () => import("./fullscreen/fullscreen-fade-effects/source"),
      () => import("./fullscreen/fullscreen-fade-effects/css"),
      "fullscreen-fade-effects"
    ),
  },
  {
    id: "fullscreen-viewport-overlay-caption",
    title: "Overlay Caption",
    eyebrow: "Fullscreen",
    tags: ["overlay","captions","viewport"],
    categoryId: "fullscreen",
    Component: FullscreenViewportOverlayCaptionDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["fullscreen-viewport-overlay-caption"],
    loadCode: loadDemoCode(
      () => import("./fullscreen/fullscreen-viewport-overlay-caption/source"),
      () => import("./fullscreen/fullscreen-viewport-overlay-caption/css"),
      "fullscreen-viewport-overlay-caption"
    ),
  },
  {
    id: "fullscreen-viewport-overlay-caption-sized",
    title: "Overlay Caption (Sized)",
    eyebrow: "Fullscreen",
    tags: ["overlay","captions","responsive"],
    categoryId: "fullscreen",
    Component: FullscreenViewportOverlayCaptionSizedDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["fullscreen-viewport-overlay-caption-sized"],
    loadCode: loadDemoCode(
      () => import("./fullscreen/fullscreen-viewport-overlay-caption-sized/source"),
      () => import("./fullscreen/fullscreen-viewport-overlay-caption-sized/css"),
      "fullscreen-viewport-overlay-caption-sized"
    ),
  },
  {
    id: "fullscreen-lazy-load",
    title: "Lazy Load",
    eyebrow: "Fullscreen",
    tags: ["lazy-load","media"],
    categoryId: "fullscreen",
    Component: FullscreenLazyLoadDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["fullscreen-lazy-load"],
    loadCode: loadDemoCode(
      () => import("./fullscreen/fullscreen-lazy-load/source"),
      () => import("./fullscreen/fullscreen-lazy-load/css"),
      "fullscreen-lazy-load"
    ),
  },
  {
    id: "fullscreen-image-hover",
    title: "Image Hover",
    eyebrow: "Fullscreen",
    tags: ["zoom-pan","hover","lazy-load","thumbnails"],
    categoryId: "fullscreen",
    Component: FullscreenImageHoverDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["fullscreen-image-hover"],
    loadCode: loadDemoCode(
      () => import("./fullscreen/fullscreen-image-hover/source"),
      () => import("./fullscreen/fullscreen-image-hover/css"),
      "fullscreen-image-hover"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "fullscreen-image-hover-demo.module.css",
  },
  {
    id: "skeleton-flex-cards",
    title: "Flex Cards",
    eyebrow: "Skeleton",
    tags: ["standalone","flex","text","responsive"],
    categoryId: "skeleton",
    Component: SkeletonFlexCardsDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["skeleton-flex-cards"],
    loadCode: loadDemoCode(
      () => import("./skeleton/skeleton-flex-cards/source"),
      () => import("./skeleton/skeleton-flex-cards/css"),
      "skeleton-flex-cards"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "skeleton-flex-cards-demo.module.css",
  },
  {
    id: "skeleton-app-shell",
    title: "App Shell",
    eyebrow: "Skeleton",
    tags: ["standalone","flex","dashboard","nested"],
    categoryId: "skeleton",
    Component: SkeletonAppShellDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["skeleton-app-shell"],
    loadCode: loadDemoCode(
      () => import("./skeleton/skeleton-app-shell/source"),
      () => import("./skeleton/skeleton-app-shell/css"),
      "skeleton-app-shell"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "skeleton-app-shell-demo.module.css",
  },
  {
    id: "skeleton-responsive-text",
    title: "Responsive Text",
    eyebrow: "Skeleton",
    tags: ["standalone","text","container-query","responsive"],
    categoryId: "skeleton",
    Component: SkeletonResponsiveTextDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["skeleton-responsive-text"],
    loadCode: loadDemoCode(
      () => import("./skeleton/skeleton-responsive-text/source"),
      () => import("./skeleton/skeleton-responsive-text/css"),
      "skeleton-responsive-text"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "skeleton-responsive-text-demo.module.css",
  },
  {
    id: "skeleton-force-overlay",
    title: "Force Overlay",
    eyebrow: "Skeleton",
    tags: ["standalone","force","compare","opacity"],
    categoryId: "skeleton",
    Component: SkeletonForceOverlayDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["skeleton-force-overlay"],
    loadCode: loadDemoCode(
      () => import("./skeleton/skeleton-force-overlay/source"),
      () => import("./skeleton/skeleton-force-overlay/css"),
      "skeleton-force-overlay"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "skeleton-force-overlay-demo.module.css",
  },
  {
    id: "reveal-sections",
    title: "Sections",
    eyebrow: "Reveal",
    tags: ["standalone","fade","transform","stagger"],
    categoryId: "reveal",
    Component: RevealSectionsDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["reveal-sections"],
    loadCode: loadDemoCode(
      () => import("./reveal/reveal-sections/source"),
      () => import("./reveal/reveal-sections/css"),
      "reveal-sections"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "reveal-sections-demo.module.css",
  },
  {
    id: "reveal-image-ready",
    title: "Image Ready",
    eyebrow: "Reveal",
    tags: ["useReveal","image","decode","ready"],
    categoryId: "reveal",
    Component: RevealImageReadyDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["reveal-image-ready"],
    loadCode: loadDemoCode(
      () => import("./reveal/reveal-image-ready/source"),
      () => import("./reveal/reveal-image-ready/css"),
      "reveal-image-ready"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "reveal-image-ready-demo.module.css",
  },
  {
    id: "zoom-pan-standalone",
    title: "Standalone",
    eyebrow: "Zoom + Pan",
    tags: ["zoom-pan","image","standalone","crop"],
    categoryId: "zoom-pan",
    Component: ZoomPanStandaloneDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["zoom-pan-standalone"],
    loadCode: loadDemoCode(
      () => import("./zoom-pan/standalone/source"),
      () => import("./zoom-pan/standalone/css"),
      "zoom-pan-standalone"
    ),
  },
  {
    id: "zoom-pan-slider",
    title: "Slider",
    eyebrow: "Zoom + Pan",
    tags: ["zoom-pan","slider","images"],
    categoryId: "zoom-pan",
    Component: ZoomPanSliderDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["zoom-pan-slider"],
    loadCode: loadDemoCode(
      () => import("./zoom-pan/slider/source"),
      () => import("./zoom-pan/slider/css"),
      "zoom-pan-slider"
    ),
  },
  {
    id: "zoom-pan-grid",
    title: "Grid",
    eyebrow: "Zoom + Pan",
    tags: ["zoom-pan","grid","images"],
    categoryId: "zoom-pan",
    Component: ZoomPanGridDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["zoom-pan-grid"],
    loadCode: loadDemoCode(
      () => import("./zoom-pan/grid/source"),
      () => import("./zoom-pan/grid/css"),
      "zoom-pan-grid"
    ),
  },
  {
    id: "zoom-pan-masonry",
    title: "Masonry",
    eyebrow: "Zoom + Pan",
    tags: ["zoom-pan","masonry","images"],
    categoryId: "zoom-pan",
    Component: ZoomPanMasonryDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["zoom-pan-masonry"],
    loadCode: loadDemoCode(
      () => import("./zoom-pan/masonry/source"),
      () => import("./zoom-pan/masonry/css"),
      "zoom-pan-masonry"
    ),
  },
  {
    id: "zoom-pan-image-hover",
    title: "Image Hover",
    eyebrow: "Zoom + Pan",
    tags: ["zoom-pan","hover","image"],
    categoryId: "zoom-pan",
    Component: ZoomPanImageHoverDemo,
    loadComponent: DEMO_COMPONENT_IMPORTERS["zoom-pan-image-hover"],
    loadCode: loadDemoCode(
      () => import("./zoom-pan/image-hover/source"),
      () => import("./zoom-pan/image-hover/css"),
      "zoom-pan-image-hover"
    ),
    sourceFilename: "Component.tsx",
    cssFilename: "image-hover-demo.module.css",
  },
];

const DEMO_BY_ID = new Map(DEMOS.map((demo) => [demo.id, demo]));

const DEMO_CATEGORIES: readonly DemoCategory[] = DEMO_NAV_CATEGORIES;
const DEMO_PAGINATION_PARAMS = ["page", "gridPage", "masonryPage", "entriesPage"];

function toDemoCanvasClassName(demoId: string) {
  return `demoCanvas${toPascalCase(demoId)}`;
}

function DemosPageContent(props: {
  searchParamsString: string;
  onSearchParamsStringChange?: (nextSearchParamsString: string) => void;
  codeBlockOverrides?: DemoCodeBlockOverrides;
}) {
  const {
    searchParamsString,
    onSearchParamsStringChange,
    codeBlockOverrides,
  } = props;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = new URLSearchParams(searchParamsString);
  const fallbackDemo = DEMOS[0];
  const fallbackCategory = DEMO_CATEGORIES[0];
  const requestedDemoId = searchParams.get("demo");
  const requestedDemo = DEMO_BY_ID.get(requestedDemoId ?? "");
  const selectedDemo = requestedDemo ?? fallbackDemo;
  const selectedCategory =
    DEMO_CATEGORIES.find((category) => category.id === selectedDemo?.categoryId) ??
    fallbackCategory;
  const [sidebarExpansion, setSidebarExpansion] = useState<SidebarExpansionState>(() => ({
    expandedCategories: selectedCategory ? [selectedCategory.id] : [],
    syncedDemoId: selectedDemo?.id ?? "",
  }));

  if (!fallbackDemo || !fallbackCategory || !selectedDemo || !selectedCategory) {
    return null;
  }

  const expandedCategories = resolveExpandedCategories(
    sidebarExpansion,
    selectedDemo.id,
    selectedCategory.id
  );
  const selectedDemoCodeOverride = codeBlockOverrides?.[selectedDemo.id];
  const selectedDemoCanvasClassName = styles[toDemoCanvasClassName(selectedDemo.id)];
  const pageHeading = requestedDemo
    ? getDemoTitle(requestedDemo)
    : "React Motion Gallery demos";

  function toggleCategory(categoryId: DemoCategoryId) {
    setSidebarExpansion((current) => {
      const currentExpandedCategories = resolveExpandedCategories(
        current,
        selectedDemo.id,
        selectedCategory.id
      );

      return {
        syncedDemoId: selectedDemo.id,
        expandedCategories: currentExpandedCategories.includes(categoryId)
          ? currentExpandedCategories.filter((id) => id !== categoryId)
          : [...currentExpandedCategories, categoryId],
      };
    });
  }

  function selectDemo(demo: DemoDefinition) {
    const nextParams = new URLSearchParams(searchParams.toString());

    nextParams.set("demo", demo.id);
    DEMO_PAGINATION_PARAMS.forEach((param) => nextParams.delete(param));

    const query = nextParams.toString();
    onSearchParamsStringChange?.(query);

    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  }

  const sidebarNavigation = (
    <nav className={styles.sidebarNav} aria-label="Demo navigation">
      {DEMO_CATEGORIES.map((category) => {
        const isOpen = expandedCategories.includes(category.id);
        const categoryPanelId = `demo-category-panel-${category.id}`;

        return (
          <section key={category.id} className={styles.category}>
            <button
              type="button"
              className={styles.categoryToggle}
              onClick={() => toggleCategory(category.id)}
              aria-expanded={isOpen}
              aria-controls={categoryPanelId}
            >
              <span className={styles.categoryToggleCopy}>
                <strong className={styles.categoryLabel}>{category.label}</strong>
              </span>
              <ChevronDown
                className={cx(
                  styles.categoryChevron,
                  isOpen && styles.categoryChevronOpen
                )}
                strokeWidth={1.7}
              />
            </button>

            <AnimatedCategoryPanel id={categoryPanelId} isOpen={isOpen}>
              <div className={styles.demoList}>
                {category.items.map((item) => {
                  if (item.type === "demo") {
                    const demo = DEMO_BY_ID.get(item.demoId);

                    if (!demo) {
                      return null;
                    }

                    const isActive = demo.id === selectedDemo.id;

                    return (
                      <Link
                        key={demo.id}
                        href={getDemoPath(demo.id)}
                        scroll={false}
                        className={cx(
                          styles.demoLink,
                          isActive && styles.demoLinkActive
                        )}
                        onClick={(event) => {
                          event.preventDefault();
                          selectDemo(demo);
                        }}
                        onFocus={() => preloadDemo(demo)}
                        onMouseEnter={() => preloadDemo(demo)}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <strong className={styles.demoLinkTitle}>{demo.title}</strong>
                      </Link>
                    );
                  }

                  return (
                    <div key={item.id} className={styles.demoGroup}>
                      <span className={styles.demoGroupLabel}>{item.label}</span>
                      <div className={styles.demoGroupList}>
                        {item.demoIds.map((demoId) => {
                          const demo = DEMO_BY_ID.get(demoId);

                          if (!demo) {
                            return null;
                          }

                          const isActive = demo.id === selectedDemo.id;
                          const demoLinkTitle = getSidebarDemoLinkTitle(item, demo);

                          return (
                            <Link
                              key={demo.id}
                              href={getDemoPath(demo.id)}
                              scroll={false}
                              className={cx(
                                styles.demoLink,
                                isActive && styles.demoLinkActive
                              )}
                              onClick={(event) => {
                                event.preventDefault();
                                selectDemo(demo);
                              }}
                              onFocus={() => preloadDemo(demo)}
                              onMouseEnter={() => preloadDemo(demo)}
                              aria-current={isActive ? "page" : undefined}
                            >
                              <strong className={styles.demoLinkTitle}>
                                {demoLinkTitle}
                              </strong>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </AnimatedCategoryPanel>
          </section>
        );
      })}
    </nav>
  );

  return (
    <div
      className={styles.page}
      data-demo-canvas-shell=""
      style={DEMO_CANVAS_SHELL_CSS_VARS}
    >
      <style dangerouslySetInnerHTML={{ __html: DEMO_CANVAS_SHELL_RESPONSIVE_CSS }} />
      <div className={styles.shell}>
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarInner}>
              <div className={styles.sidebarIntro}>
                <span className={styles.sidebarKicker}>Browse</span>
                <strong className={styles.sidebarTitle}>{DEMOS.length} demos</strong>
                <p className={styles.sidebarCopy}>
                  Resize or refresh the page while viewing a demo to see layouts reflow and skeletons fade out.
                </p>
              </div>

              <SidebarScrollRegion>{sidebarNavigation}</SidebarScrollRegion>
            </div>
          </aside>

          <main className={styles.main}>
            <h1 className={styles.visuallyHidden}>{pageHeading}</h1>
            <SelectedDemoPane
              key={selectedDemo.id}
              selectedCategoryLabel={selectedCategory.label}
              selectedDemo={selectedDemo}
              selectedDemoCanvasClassName={selectedDemoCanvasClassName}
              selectedDemoCodeOverride={selectedDemoCodeOverride}
            />
          </main>
        </div>
      </div>
    </div>
  );
}

export default function DemosPageClient(props: {
  initialSearchParamsString: string;
  skeletonCacheSnapshots?: Record<string, SkeletonCacheSnapshot | null | undefined>;
  codeBlockOverrides?: DemoCodeBlockOverrides;
}) {
  const {
    initialSearchParamsString,
    skeletonCacheSnapshots,
    codeBlockOverrides,
  } = props;
  const [searchParamsString, setSearchParamsString] = useState(
    initialSearchParamsString
  );

  useEffect(() => {
    setSearchParamsString(initialSearchParamsString);
  }, [initialSearchParamsString]);

  useEffect(() => {
    function syncSearchParamsFromLocation() {
      setSearchParamsString(window.location.search.replace(/^\?/, ""));
    }

    window.addEventListener("popstate", syncSearchParamsFromLocation);

    return () => {
      window.removeEventListener("popstate", syncSearchParamsFromLocation);
    };
  }, []);

  return (
    <SkeletonCacheProvider snapshots={skeletonCacheSnapshots}>
      <DemosPageContent
        searchParamsString={searchParamsString}
        onSearchParamsStringChange={setSearchParamsString}
        codeBlockOverrides={codeBlockOverrides}
      />
    </SkeletonCacheProvider>
  );
}
