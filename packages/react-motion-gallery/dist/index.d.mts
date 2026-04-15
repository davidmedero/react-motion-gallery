export { CoreLayout, GalleryCore, GalleryCoreProps, useGalleryCore } from './core.mjs';
export { D as DEFAULT_ENTRIES, E as Entries, f as flattenEntries } from './index-CwwxTQKa.mjs';
export { DEFAULT_FULLSCREEN, useFullscreenController } from './fullscreen.mjs';
export { FullscreenThumbnailSlider } from './fullscreenThumbnails.mjs';
export { F as FSItem, a as FullscreenThumbnailBridge, b as FullscreenThumbnailSliderProps, c as FullscreenThumbnailSlotLayout } from './types-ROPjU8Nl.mjs';
export { DEFAULT_SLIDER, Slider } from './slider.mjs';
export { DEFAULT_GRID, default as Grid } from './grid.mjs';
export { DEFAULT_MASONRY, default as Masonry } from './masonry.mjs';
export { DEFAULT_THUMBNAILS, ThumbnailSlider, ThumbnailSyncBridge, createThumbnailSyncBridge } from './thumbnails.mjs';
export { RmgPlyrOptionsResolver, RmgPlyrSourceBuilder, RmgVideoLazyLoadOptions, Video, VideoProps } from './video.mjs';
export { DEFAULT_ZOOM_PAN, ZoomPanImage } from './zoomPan.mjs';
export { Z as ZoomPanImageProps, a as ZoomPanOptions } from './types-Dhh8xfHo.mjs';
export { S as SliderIndexChannel, c as createSliderIndexChannel } from './sliderSub-Bo6Y8as_.mjs';
export { B as BREAKPOINT_MAP, E as ElementStyle, a as FsCaptionPlacement, b as FsIntroRequest, F as FullscreenOptions, G as GalleryApi, I as IndexMode } from './responsive-D_xhZmVI.mjs';
export { M as MediaItem, t as toMediaItems } from './plyrTypes-Cq4C3ul5.mjs';
export { R as ResponsiveHeightRule, a as SliderHandle, S as SliderOptions } from './types-DY058l5M.mjs';
export { G as GridItemProps, a as GridLazyLoadOptions, b as GridOptions, c as GridSpan, R as ResponsiveGridSpan, d as ResponsiveGridTemplate } from './types-XEr8LRal.mjs';
export { a as MasonryLazyLoadOptions, M as MasonryOptions } from './types-VULXzSa2.mjs';
export { R as ResponsivePosition, e as ThumbnailIntroOptions, a as ThumbnailLoadingElements, c as ThumbnailLoadingOptions, b as ThumbnailLoadingRenderArgs, T as ThumbnailPosition, d as ThumbnailSkeletonMode, f as ThumbnailsOptions } from './types-CHUayqcj.mjs';
export { E as EntriesOptions, M as MediaEntryLink, S as SlideOwner } from './types-_1D0QtfD.mjs';
import 'react/jsx-runtime';
import 'react';
import 'plyr-react';
import 'plyr';
import './controls-SpWg1Kgt.mjs';
import './text-Cl2tR8oO.mjs';
import './layout-CR6f2aPH.mjs';

declare function PanAxis(): {
    scroll: "x";
    cross: "y";
    direction(n: number): number;
};
type PanAxisType = ReturnType<typeof PanAxis>;

export type { PanAxisType };
