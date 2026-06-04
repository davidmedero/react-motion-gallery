# Public API Inventory

This inventory is generated from `packages/react-motion-gallery/package.json` exports and the TypeScript source entry files. It intentionally includes runtime exports, default exports, helper functions, components, constants, and type-only exports; type-only imports are erased by TypeScript and do not add runtime JavaScript.

Use this page as the exhaustive checklist for the public package surface. The README explains the common workflows and option groups; this file makes sure every published import path and named export is discoverable.

## `react-motion-gallery`

Source entry: `src/index.ts`.

`BREAKPOINT_MAP`, `BreakpointMap`, `CoreLayout`, `createSliderIndexChannel`, `createThumbnailSyncBridge`, `CrossFade`, `CrossFadeWheel`, `CrossFadeWheelOptions`, `ElementStyle`, `Entries`, `EntriesHandle`, `EntriesInfiniteScrollOptions`, `EntriesLayout`, `EntriesLoadMoreOptions`, `EntriesOptions`, `EntriesPaginationOptions`, `EntriesPlugin`, `EntriesPluginKind`, `EntriesReadyController`, `EntriesVirtualizationOptions`, `flattenEntries`, `FsCaptionPlacement`, `FsIntroRequest`, `FSItem`, `FullscreenCaptionOptions`, `FullscreenCloseScrollContext`, `FullscreenCloseScrollEnabled`, `FullscreenCloseScrollOptions`, `FullscreenCloseScrollTiming`, `FullscreenControlsOptions`, `FullscreenCrossfadeOptions`, `FullscreenEffectsOptions`, `FullscreenIntroPathTiming`, `FullscreenLazyLoadOptions`, `FullscreenMobileDetectionContext`, `FullscreenOptions`, `FullscreenPlugin`, `FullscreenPluginKind`, `FullscreenSliderOptions`, `FullscreenThumbnailBridge`, `FullscreenThumbnailSlider`, `FullscreenThumbnailSliderProps`, `FullscreenThumbnailSlotLayout`, `FullscreenVideoOptions`, `FullscreenZoomPanOptions`, `GalleryApi`, `GalleryCore`, `GalleryCoreApi`, `GalleryCoreProps`, `GalleryLayoutApi`, `Grid`, `GridFullscreenTrigger`, `GridHandle`, `GridInfiniteScrollOptions`, `GridItemProps`, `GridItemsPerPageOption`, `GridLoadingOptions`, `GridLoadingSkeletonArgs`, `GridLoadMoreOptions`, `GridOptions`, `GridPaginationOptions`, `GridPaginationSessionStorageOptions`, `GridPlugin`, `GridPluginHost`, `GridPluginKind`, `GridPluginRuntimeProps`, `GridReadyController`, `GridSpan`, `GridVirtualizationOptions`, `ImageDecodeReadyOptions`, `ImageDecodeReadyResult`, `IndexMode`, `Masonry`, `MasonryHandle`, `MasonryInfiniteScrollOptions`, `MasonryItemProps`, `MasonryItemsPerPageOption`, `MasonryLoadingOptions`, `MasonryLoadingSkeletonArgs`, `MasonryLoadMoreOptions`, `MasonryOptions`, `MasonryPaginationOptions`, `MasonryPaginationSessionStorageOptions`, `MasonryPlacement`, `MasonryPlugin`, `MasonryPluginHost`, `MasonryPluginKind`, `MasonryPluginRuntimeProps`, `MasonryReadyController`, `MasonryRevealOptions`, `MasonrySpan`, `MasonryVirtualizationOptions`, `MediaEntryLink`, `MediaItem`, `PanAxisType`, `RatingStars`, `RatingStarsProps`, `ResponsiveCaptionPlacement`, `ResponsiveGridSpan`, `ResponsiveGridTemplate`, `ResponsiveHeightRule`, `ResponsiveLength`, `ResponsiveLengthValue`, `ResponsiveMasonrySpan`, `ResponsiveNumber`, `ResponsivePosition`, `Reveal`, `RevealAngle`, `RevealChannelOptions`, `RevealDuration`, `RevealEasing`, `RevealLength`, `RevealMotionChannel`, `RevealOptions`, `RevealProps`, `RevealTransform`, `RevealTransformObject`, `RevealVariant`, `RmgPlyrOptionsResolver`, `RmgPlyrSourceBuilder`, `RmgVideoLazyLoadOptions`, `Skeleton`, `SkeletonForceOptions`, `SkeletonNode`, `SkeletonProps`, `SkeletonTimingOptions`, `SlideOwner`, `Slider`, `SliderApi`, `SliderAutoHeight`, `SliderAutoPlayTimer`, `SliderHandle`, `SliderIndexChannel`, `SliderItemsApi`, `SliderNodeInput`, `SliderOptions`, `SliderPlugin`, `SliderPluginKind`, `SliderReadyController`, `SliderRemoveTarget`, `SliderRevealOptions`, `SliderSkipSnaps`, `SliderSkipSnapsOptions`, `ThumbnailLoadingElements`, `ThumbnailLoadingOptions`, `ThumbnailLoadingRenderArgs`, `ThumbnailPosition`, `ThumbnailRevealOptions`, `ThumbnailSkeletonMode`, `ThumbnailSlider`, `ThumbnailsOptions`, `ThumbnailSyncBridge`, `toMediaItems`, `useEntriesReady`, `useFullscreenController`, `useGalleryCore`, `UseGridInfiniteScrollOptions`, `UseGridLoadMoreOptions`, `UseGridPaginationOptions`, `useGridReady`, `UseGridVirtualizerOptions`, `useImageDecodeReady`, `UseMasonryInfiniteScrollOptions`, `UseMasonryLoadMoreOptions`, `UseMasonryPaginationOptions`, `useMasonryReady`, `UseMasonryVirtualizerOptions`, `useReveal`, `UseRevealResult`, `useSliderReady`, `Video`, `VideoProps`, `ZoomPanHoverOptions`, `ZoomPanImage`, `ZoomPanImageProps`, `ZoomPanOptions`, `ZoomPanPlugin`, `ZoomPanPluginKind`

## `react-motion-gallery/styles.css`

CSS asset export: `styles.css`.

## `react-motion-gallery/media`

Source entry: `src/media.ts`.

`MediaInput`, `MediaItem`, `toMediaItems`

## `react-motion-gallery/media/ready`

Source entry: `src/media-ready.ts`.

`ImageDecodeReadyOptions`, `ImageDecodeReadyResult`, `useImageDecodeReady`

## `react-motion-gallery/responsive`

Source entry: `src/responsive.ts`.

`BREAKPOINT_MAP`, `BreakpointMap`, `ResponsiveCaptionPlacement`, `ResponsiveLength`, `ResponsiveLengthValue`, `ResponsiveNumber`, `ResponsivePosition`

## `react-motion-gallery/reveal`

Source entry: `src/reveal.ts`.

`default`, `resolveRevealTransform`, `Reveal`, `RevealAngle`, `RevealChannelOptions`, `RevealDuration`, `RevealEasing`, `RevealLength`, `RevealMotionChannel`, `RevealOptions`, `RevealProps`, `RevealTransform`, `RevealTransformObject`, `RevealVariant`, `useReveal`, `UseRevealResult`

## `react-motion-gallery/rating-stars`

Source entry: `src/rating-stars.ts`.

`RatingStars`, `RatingStarsProps`

## `react-motion-gallery/core`

Source entry: `src/core.ts`.

`BaseVisibleIndexEvent`, `CoreLayout`, `FsVisibleIndexEvent`, `FullscreenSource`, `GalleryApi`, `GalleryCore`, `GalleryCoreApi`, `GalleryCoreProps`, `GalleryCoreProvider`, `GalleryLayoutApi`, `useGalleryCore`

## `react-motion-gallery/slider`

Source entry: `src/slider.ts`.

`createSliderIndexChannel`, `CrossFade`, `CrossFadeWheel`, `CrossFadeWheelOptions`, `default`, `IndexMode`, `ResponsiveHeightRule`, `Slider`, `SliderApi`, `SliderAutoHeight`, `SliderAutoPlayTimer`, `SliderHandle`, `SliderIndexChannel`, `SliderItemsApi`, `SliderNodeInput`, `SliderOptions`, `SliderPlugin`, `SliderPluginKind`, `SliderReadyController`, `SliderRemoveTarget`, `SliderRevealOptions`, `SliderSkipSnaps`, `SliderSkipSnapsOptions`, `useSliderReady`

## `react-motion-gallery/slider/ready`

Source entry: `src/slider-ready.ts`.

`SliderReadyController`, `useSliderReady`

## `react-motion-gallery/slider/arrows`

Source entry: `src/slider-arrows.ts`.

`sliderArrows`, `SliderArrows`

## `react-motion-gallery/slider/dots`

Source entry: `src/slider-dots.ts`.

`sliderDots`, `SliderDots`

## `react-motion-gallery/slider/progress`

Source entry: `src/slider-progress.ts`.

`sliderProgress`, `SliderProgress`

## `react-motion-gallery/slider/scrollbar`

Source entry: `src/slider-scrollbar.ts`.

`sliderScrollbar`, `SliderScrollbar`

## `react-motion-gallery/slider/ripple`

Source entry: `src/slider-ripple.ts`.

`sliderRipple`, `SliderRipple`

## `react-motion-gallery/slider/auto-play`

Source entry: `src/slider-auto-play.ts`.

`sliderAutoPlay`, `SliderAutoPlay`

## `react-motion-gallery/slider/auto-scroll`

Source entry: `src/slider-auto-scroll.ts`.

`sliderAutoScroll`, `SliderAutoScroll`

## `react-motion-gallery/slider/auto-height`

Source entry: `src/slider-auto-height.ts`.

`sliderAutoHeight`, `SliderAutoHeight`

## `react-motion-gallery/slider/lazy-load`

Source entry: `src/slider-lazy-load.ts`.

`sliderLazyLoad`, `SliderLazyLoadOptions`

## `react-motion-gallery/slider/parallax`

Source entry: `src/slider-parallax.ts`.

`sliderParallax`, `SliderParallax`

## `react-motion-gallery/slider/scale`

Source entry: `src/slider-scale.ts`.

`sliderScale`, `SliderScale`

## `react-motion-gallery/slider/fade`

Source entry: `src/slider-fade.ts`.

`sliderFade`, `SliderFade`

## `react-motion-gallery/slider/crossfade`

Source entry: `src/slider-crossfade.ts`.

`CrossFade`, `sliderCrossfade`

## `react-motion-gallery/slider/fullscreen`

Source entry: `src/slider-fullscreen.ts`.

`sliderFullscreen`

## `react-motion-gallery/slider/loading`

Source entry: `src/slider-loading.ts`.

`sliderLoading`, `SliderLoadingOptions`

## `react-motion-gallery/grid`

Source entry: `src/grid.ts`.

`default`, `Grid`, `GridFullscreenTrigger`, `GridHandle`, `GridInfiniteScrollOptions`, `GridItemProps`, `GridItemsPerPageOption`, `GridLoadingOptions`, `GridLoadingSkeletonArgs`, `GridLoadMoreOptions`, `GridOptions`, `GridPaginationControlsProps`, `GridPaginationOptions`, `GridPaginationRippleOptions`, `GridPaginationRippleProp`, `GridPaginationSessionStorageOptions`, `GridPlugin`, `GridPluginHost`, `GridPluginKind`, `GridPluginRuntimeProps`, `GridReadyController`, `GridSkeletonNode`, `GridSkeletonSlot`, `GridSkeletonSpec`, `GridSpan`, `GridVirtualizationOptions`, `ResponsiveGridSpan`, `ResponsiveGridTemplate`, `RevealOptions`, `UseGridInfiniteScrollOptions`, `UseGridLoadMoreOptions`, `UseGridPaginationOptions`, `useGridReady`, `UseGridVirtualizerOptions`

## `react-motion-gallery/grid/ready`

Source entry: `src/grid-ready.ts`.

`GridReadyController`, `useGridReady`

## `react-motion-gallery/grid/lazy-load`

Source entry: `src/grid-lazy-load.ts`.

`gridLazyLoad`, `GridLazyLoadOptions`

## `react-motion-gallery/grid/fullscreen`

Source entry: `src/grid-fullscreen.ts`.

`gridFullscreen`, `resolveGridFullscreenClick`

## `react-motion-gallery/grid/pagination`

Source entry: `src/grid-pagination.ts`.

`getGridPageItems`, `getGridPageRange`, `GridItemsPerPageOption`, `GridPageControlItem`, `GridPageItemsOptions`, `GridPageRangeItem`, `GridPageRangeOptions`, `gridPagination`, `GridPaginationControls`, `GridPaginationControlsProps`, `GridPaginationOptions`, `GridPaginationRippleOptions`, `GridPaginationRippleProp`, `GridPaginationSessionStorageOptions`, `GridPaginationUrlSyncOptions`, `useGridPagination`, `UseGridPaginationOptions`

## `react-motion-gallery/grid/load-more`

Source entry: `src/grid-load-more.ts`.

`gridLoadMore`, `GridLoadMoreOptions`, `useGridLoadMore`, `UseGridLoadMoreOptions`

## `react-motion-gallery/grid/infinite-scroll`

Source entry: `src/grid-infinite-scroll.ts`.

`gridInfiniteScroll`, `GridInfiniteScrollOptions`, `useGridInfiniteScroll`, `UseGridInfiniteScrollOptions`

## `react-motion-gallery/grid/virtualization`

Source entry: `src/grid-virtualization.ts`.

`gridVirtualization`, `GridVirtualizationOptions`, `useGridVirtualizer`, `UseGridVirtualizerOptions`

## `react-motion-gallery/masonry`

Source entry: `src/masonry.ts`.

`default`, `Masonry`, `MasonryHandle`, `MasonryHeightOffsetPx`, `MasonryHeightOffsetRule`, `MasonryInfiniteScrollOptions`, `MasonryItem`, `MasonryItemProps`, `MasonryItemsPerPageOption`, `MasonryLoadingOptions`, `MasonryLoadingSkeletonArgs`, `MasonryLoadMoreOptions`, `MasonryOptions`, `MasonryPaginationControlsProps`, `MasonryPaginationOptions`, `MasonryPaginationRippleOptions`, `MasonryPaginationRippleProp`, `MasonryPaginationSessionStorageOptions`, `MasonryPlacement`, `MasonryPlugin`, `MasonryPluginHost`, `MasonryPluginKind`, `MasonryPluginRuntimeProps`, `MasonryReadyController`, `MasonryRevealOptions`, `MasonrySpan`, `MasonryVirtualizationOptions`, `ResponsiveMasonrySpan`, `UseMasonryInfiniteScrollOptions`, `UseMasonryLoadMoreOptions`, `UseMasonryPaginationOptions`, `useMasonryReady`, `UseMasonryVirtualizerOptions`

`MasonryItemProps` includes `heightOffsetPx?: MasonryHeightOffsetPx` for fixed or responsive card chrome added after aspect-ratio layout.

## `react-motion-gallery/masonry/ready`

Source entry: `src/masonry-ready.ts`.

`MasonryReadyController`, `useMasonryReady`

## `react-motion-gallery/masonry/fullscreen`

Source entry: `src/masonry-fullscreen.ts`.

`masonryFullscreen`, `resolveMasonryFullscreenClick`

## `react-motion-gallery/masonry/lazy-load`

Source entry: `src/masonry-lazy-load.ts`.

`masonryLazyLoad`, `MasonryLazyLoadOptions`

## `react-motion-gallery/masonry/text-wrap`

Source entry: `src/masonry-text-wrap.ts`.

`createMasonryTextWrapSkeletonLayout`, `MasonryTextWrapChromeMetrics`, `MasonryTextWrapItemGeometry`, `MasonryTextWrapItemGeometryOptions`, `MasonryTextWrapLayoutController`, `MasonryTextWrapLayoutOptions`, `MasonryTextWrapResponsiveNumber`, `MasonryTextWrapTextEntry`, `MasonryTextWrapTextState`, `useMasonryTextWrapLayout`

## `react-motion-gallery/masonry/pagination`

Source entry: `src/masonry-pagination.ts`.

`getMasonryPageItems`, `getMasonryPageRange`, `MasonryItemsPerPageOption`, `MasonryPageControlItem`, `MasonryPageItemsOptions`, `MasonryPageRangeItem`, `MasonryPageRangeOptions`, `masonryPagination`, `MasonryPaginationControls`, `MasonryPaginationControlsProps`, `MasonryPaginationOptions`, `MasonryPaginationPlugin`, `MasonryPaginationRippleOptions`, `MasonryPaginationRippleProp`, `MasonryPaginationSessionStorageOptions`, `MasonryPaginationUrlSyncOptions`, `useMasonryPagination`, `UseMasonryPaginationOptions`

## `react-motion-gallery/masonry/load-more`

Source entry: `src/masonry-load-more.ts`.

`masonryLoadMore`, `MasonryLoadMoreOptions`, `MasonryLoadMorePlugin`, `useMasonryLoadMore`, `UseMasonryLoadMoreOptions`

## `react-motion-gallery/masonry/infinite-scroll`

Source entry: `src/masonry-infinite-scroll.ts`.

`masonryInfiniteScroll`, `MasonryInfiniteScrollOptions`, `MasonryInfiniteScrollPlugin`, `useMasonryInfiniteScroll`, `UseMasonryInfiniteScrollOptions`

## `react-motion-gallery/masonry/virtualization`

Source entry: `src/masonry-virtualization.ts`.

`masonryVirtualization`, `MasonryVirtualizationOptions`, `MasonryVirtualizationPlugin`, `useMasonryVirtualizer`, `UseMasonryVirtualizerOptions`

## `react-motion-gallery/entries`

Source entry: `src/entries.ts`.

`default`, `DEFAULT_ENTRIES_SKELETON_EXIT_MS`, `Entries`, `EntriesCore`, `EntriesCoreProps`, `EntriesDataMode`, `EntriesHandle`, `entriesInfiniteScroll`, `EntriesInfiniteScrollOptions`, `EntriesItemsPerPageOption`, `EntriesLayout`, `EntriesLoadingOptions`, `entriesLoadMore`, `EntriesLoadMoreController`, `EntriesLoadMoreOptions`, `EntriesMediaContainerRender`, `EntriesOptions`, `EntriesPageControlItem`, `EntriesPageItemsOptions`, `EntriesPageRangeItem`, `EntriesPageRangeOptions`, `entriesPagination`, `EntriesPaginationController`, `EntriesPaginationControls`, `EntriesPaginationControlsProps`, `EntriesPaginationOptions`, `EntriesPaginationRippleOptions`, `EntriesPaginationRippleProp`, `EntriesPaginationSessionStorageOptions`, `EntriesPaginationUrlSyncOptions`, `EntriesPlugin`, `EntriesPluginKind`, `EntriesPluginOptionsByKind`, `EntriesProps`, `EntriesReadyController`, `entriesVirtualization`, `EntriesVirtualizationOptions`, `EntryCardRenderArgs`, `EntryItem`, `EntryList`, `EntryMediaLayout`, `EntryMediaRenderArgs`, `EntryOverlayRenderArgs`, `EntryOverlayStyle`, `EntrySkeletonRenderArgs`, `EntrySkeletonResolverArgs`, `flattenEntries`, `getEntriesPageItems`, `getEntriesPageRange`, `MediaEntryLink`, `nodeFromMediaDefault`, `resolveEntryLoadingVisualState`, `RevealOptions`, `SlideOwner`, `useEntriesInfiniteScroll`, `UseEntriesInfiniteScrollOptions`, `useEntriesLoadMore`, `UseEntriesLoadMoreOptions`, `useEntriesPagination`, `UseEntriesPaginationOptions`, `useEntriesReady`, `UseEntriesReadyOptions`, `useEntriesVirtualizer`, `UseEntriesVirtualizerOptions`, `useEntryDecodeReady`, `useEntryInView`, `UseEntryInViewOpts`, `useNormalizedEntriesLoading`, `useNormalizedEntriesReveal`

## `react-motion-gallery/entries/media/slider`

Source entry: `src/entries-media-slider.ts`.

`createEntriesSliderMedia`

## `react-motion-gallery/entries/media/grid`

Source entry: `src/entries-media-grid.ts`.

`createEntriesGridMedia`

## `react-motion-gallery/entries/media/masonry`

Source entry: `src/entries-media-masonry.ts`.

`createEntriesMasonryMedia`

## `react-motion-gallery/entries/ready`

Source entry: `src/entries-ready.ts`.

`EntriesHandle`, `EntriesReadyController`, `useEntriesReady`, `UseEntriesReadyOptions`

## `react-motion-gallery/entries/pagination`

Source entry: `src/entries-pagination.ts`.

`EntriesItemsPerPageOption`, `EntriesPageControlItem`, `EntriesPageItemsOptions`, `EntriesPageRangeItem`, `EntriesPageRangeOptions`, `entriesPagination`, `EntriesPaginationController`, `EntriesPaginationControls`, `EntriesPaginationControlsProps`, `EntriesPaginationOptions`, `EntriesPaginationRippleOptions`, `EntriesPaginationRippleProp`, `EntriesPaginationSessionStorageOptions`, `EntriesPaginationUrlSyncOptions`, `getEntriesPageItems`, `getEntriesPageRange`, `useEntriesPagination`, `UseEntriesPaginationOptions`

## `react-motion-gallery/entries/load-more`

Source entry: `src/entries-load-more.ts`.

`entriesLoadMore`, `EntriesLoadMoreController`, `EntriesLoadMoreOptions`, `useEntriesLoadMore`, `UseEntriesLoadMoreOptions`

## `react-motion-gallery/entries/infinite-scroll`

Source entry: `src/entries-infinite-scroll.ts`.

`entriesInfiniteScroll`, `EntriesInfiniteScrollOptions`, `useEntriesInfiniteScroll`, `UseEntriesInfiniteScrollOptions`

## `react-motion-gallery/entries/virtualization`

Source entry: `src/entries-virtualization.ts`.

`entriesVirtualization`, `EntriesVirtualizationOptions`, `useEntriesVirtualizer`, `UseEntriesVirtualizerOptions`

## `react-motion-gallery/skeleton/base`

Source entry: `src/skeleton-base.ts`.

`default`, `ResponsiveTextBarHeight`, `ResponsiveTextBarWidth`, `ResponsiveTextLastBarWidth`, `ResponsiveTextLineCount`, `ResponsiveTextLineHeight`, `Skeleton`, `SkeletonBaseStyle`, `SkeletonBaseStyleResponsive`, `SkeletonContainerStyle`, `SkeletonContainerStyleResponsive`, `SkeletonForceOptions`, `SkeletonFrame`, `SkeletonFrameProps`, `SkeletonLength`, `SkeletonNode`, `SkeletonProps`, `SkeletonShimmer`, `SkeletonTimingOptions`, `TextSkeletonResponsiveBy`

## `react-motion-gallery/skeleton/cache`

Source entry: `src/skeleton-cache.ts`.

`DEFAULT_SKELETON_CACHE_COOKIE_MAX_BYTES`, `DEFAULT_SKELETON_CACHE_COOKIE_MAX_TOTAL_BYTES`, `DEFAULT_SKELETON_CACHE_DEBOUNCE_MS`, `DEFAULT_SKELETON_CACHE_TTL_MS`, `getSkeletonCacheCookieName`, `getSkeletonCacheRouteKey`, `parseSkeletonCacheCookie`, `serializeSkeletonCacheSnapshot`, `SKELETON_CACHE_VERSION`, `SkeletonCacheCookieOptions`, `SkeletonCacheKind`, `SkeletonCacheMasonrySnapshot`, `SkeletonCacheOptions`, `SkeletonCacheProviderProps`, `SkeletonCacheSliderRestoreSnapshot`, `SkeletonCacheSliderSnapshot`, `SkeletonCacheSnapshot`, `SkeletonCacheTextRecord`, `validateSkeletonCacheSnapshot`

## `react-motion-gallery/skeleton/cache/provider`

Source entry: `src/skeleton-cache-provider.ts`.

`SkeletonCacheProvider`, `SkeletonCacheProviderProps`

## `react-motion-gallery/skeleton/cache/slider`

Source entry: `src/skeleton-cache-slider.ts`.

`CachedSliderSkeleton`, `CachedSliderSkeletonProps`, `default`, `Skeleton`, `SkeletonCacheOptions`, `SkeletonCacheSnapshot`, `SkeletonNode`, `SkeletonSliderLayout`, `SliderSkeleton`, `SliderSkeletonNode`, `SliderSkeletonSlot`, `SliderSkeletonSpec`

## `react-motion-gallery/skeleton/slider`

Source entry: `src/skeleton-slider.ts`.

`buildScopedInitialHeightCss`, `default`, `Skeleton`, `SkeletonForceOptions`, `SkeletonNode`, `SkeletonSliderLayout`, `SkeletonTimingOptions`, `SliderSkeleton`, `SliderSkeletonNode`, `SliderSkeletonProps`, `SliderSkeletonSlot`, `SliderSkeletonSpec`

## `react-motion-gallery/skeleton/slider/restore`

Source entry: `src/skeleton-slider-restore.ts`.

`buildScopedInitialHeightCss`, `default`, `RestoredSliderSkeleton`, `RestoredSliderSkeletonProps`, `Skeleton`, `SkeletonCacheOptions`, `SkeletonCacheSnapshot`, `SkeletonNode`, `SkeletonSliderLayout`, `SkeletonSliderReadyHandle`, `SkeletonSliderRestoreOptions`, `SliderSkeleton`, `SliderSkeletonNode`, `SliderSkeletonSlot`, `SliderSkeletonSpec`

## `react-motion-gallery/skeleton/grid`

Source entry: `src/skeleton-grid.ts`.

`default`, `GridSkeleton`, `GridSkeletonNode`, `GridSkeletonProps`, `GridSkeletonSlot`, `GridSkeletonSpec`, `Skeleton`, `SkeletonForceOptions`, `SkeletonGridLayout`, `SkeletonGridOptions`, `SkeletonNode`, `SkeletonTimingOptions`

## `react-motion-gallery/skeleton/masonry`

Source entry: `src/skeleton-masonry.ts`.

`default`, `MasonryPlacement`, `MasonrySkeleton`, `MasonrySkeletonNode`, `MasonrySkeletonProps`, `MasonrySkeletonSlot`, `MasonrySkeletonSpec`, `Skeleton`, `SkeletonForceOptions`, `SkeletonMasonryLayout`, `SkeletonMasonryOptions`, `SkeletonNode`, `SkeletonTimingOptions`

## `react-motion-gallery/fullscreen`

Source entry: `src/fullscreen.ts`.

`FsCaptionPlacement`, `FsIntroRequest`, `FullscreenCaptionOptions`, `FullscreenCloseScrollContext`, `FullscreenCloseScrollEnabled`, `FullscreenCloseScrollOptions`, `FullscreenCloseScrollTiming`, `FullscreenControlsOptions`, `FullscreenCrossfadeOptions`, `FullscreenEffectsOptions`, `FullscreenIntroPathTiming`, `FullscreenLazyLoadOptions`, `FullscreenMobileDetectionContext`, `FullscreenOptions`, `FullscreenPlugin`, `FullscreenPluginKind`, `FullscreenSliderOptions`, `FullscreenVideoOptions`, `FullscreenZoomPanOptions`, `GalleryApi`, `GalleryCoreApi`, `IndexMode`, `useFullscreenController`

## `react-motion-gallery/fullscreen/slider`

Source entry: `src/fullscreen-slider.ts`.

`fullscreenSlider`

## `react-motion-gallery/fullscreen/controls`

Source entry: `src/fullscreen-controls.ts`.

`fullscreenControls`

## `react-motion-gallery/fullscreen/captions`

Source entry: `src/fullscreen-captions.ts`.

`fullscreenCaptions`

## `react-motion-gallery/fullscreen/zoom-pan`

Source entry: `src/fullscreen-zoom-pan.ts`.

`fullscreenZoomPan`

## `react-motion-gallery/fullscreen/video`

Source entry: `src/fullscreen-video.ts`.

`fullscreenVideo`

## `react-motion-gallery/fullscreen/lazy-load`

Source entry: `src/fullscreen-lazy-load.ts`.

`fullscreenLazyLoad`

## `react-motion-gallery/fullscreen/crossfade`

Source entry: `src/fullscreen-crossfade.ts`.

`fullscreenCrossfade`

## `react-motion-gallery/fullscreen/thumbnails`

Source entry: `src/fullscreen-thumbnails.ts`.

`fullscreenThumbnails`

## `react-motion-gallery/thumbnails`

Source entry: `src/thumbnails.ts`.

`createThumbnailSyncBridge`, `default`, `ResponsivePosition`, `ThumbnailContainerLayout`, `ThumbnailLayout`, `ThumbnailLoadingElements`, `ThumbnailLoadingOptions`, `ThumbnailLoadingRenderArgs`, `ThumbnailPosition`, `ThumbnailRevealOptions`, `ThumbnailsControls`, `ThumbnailsElements`, `ThumbnailSkeletonMode`, `ThumbnailsLayout`, `ThumbnailSlider`, `ThumbnailsMotion`, `ThumbnailsOptions`, `ThumbnailsRipple`, `ThumbnailsScroll`, `ThumbnailsTransitions`, `ThumbnailSyncBridge`

## `react-motion-gallery/fullscreenThumbnails`

Source entry: `src/fullscreenThumbnails.ts`.

`default`, `FSItem`, `FullscreenThumbnailBridge`, `FullscreenThumbnailSlider`, `FullscreenThumbnailSliderProps`, `FullscreenThumbnailSlotLayout`

## `react-motion-gallery/video`

Source entry: `src/video.ts`.

`default`, `RmgPlyrOptionsResolver`, `RmgPlyrSourceBuilder`, `RmgVideoLazyLoadOptions`, `Video`, `VideoProps`

## `react-motion-gallery/zoomPan`

Source entry: `src/zoomPan.ts`.

`default`, `ZoomPanHoverOptions`, `ZoomPanImage`, `ZoomPanImageProps`, `ZoomPanOptions`, `ZoomPanPlugin`, `ZoomPanPluginKind`

## `react-motion-gallery/zoomPan/hover`

Source entry: `src/zoomPan-hover.ts`.

`zoomPanHover`, `ZoomPanHoverOptions`
