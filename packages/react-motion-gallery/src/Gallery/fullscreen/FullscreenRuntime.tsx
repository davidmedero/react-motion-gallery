'use client';

import * as React from 'react';
import { FullscreenModal } from './FullscreenModal';
import { FullscreenSlider } from './FullscreenSlider';
import { FsEntryOverlay } from '../entries/overlay/useFsEntryOverlay';
import type { FullscreenSliderHandle } from './FullscreenSlider';
import type { EntriesOptions, MediaEntryLink } from '../entries/types';
import type { APITypes } from '../video/plyrTypes';
import type { FullscreenThumbnailSlotLayout } from '../fullscreenThumbnails/types';
import { MediaItem } from '../shared/types/media';
import { runFullscreenIntro } from './fullscreenIntro';
import {
  FsCaptionPlacement,
  FsIntroRequest,
  FullscreenOptions,
  FullscreenIntroPathTiming,
  FullscreenLazyLoadConfig,
  FullscreenLazyLoadOptions,
  FullscreenPlugin,
  FullscreenRuntimeFeatures,
} from './types';
import type { SliderSkipSnaps } from '../slider/types';
import type { Root } from 'react-dom/client';
import {
  renderFullscreenBaseCrossfadeSlides,
  renderFullscreenBaseSlides,
} from './renderFullscreenBaseSlides';
import type { RenderFullscreenSlideWindowItem } from './renderFullscreenSlides';
import { createSingleTransform, createWrappedTransform } from './transforms';
import { useWrappedItemsAndRefs } from './hooks/useWrappedItemsAndRefs';
import type { ScrollBoundsType } from '../shared/motion/scrollBounds';
import type { ScrollBodyType } from '../shared/motion/scrollBody';
import type { Vector1DType } from '../shared/motion/vector1d';
import type { PanAxisType as AxisType } from '../shared/types/axis';
import type { AnimationsType } from '../shared/motion/animations';
import { FsCaptionOverlay } from './useFsCaptionOverlay';
import { useOptionalGalleryCore } from '../core';
import { FullscreenOpenMethod } from '../api/types';
import {
  isEntryOwnerReady,
  scrollEntrySectionIntoView,
  waitForEntryOwnerReady,
} from './entryOwnerReady';
import {
  resolveFullscreenIntroDurationMs,
  resolveFullscreenIntroEasing,
  type FullscreenIntroPath,
} from './introTiming';
import {
  BREAKPOINT_MAP,
  ResponsiveCaptionPlacement,
  type ResponsiveLength,
  effectiveViewportWidth,
} from '../shared/responsive';
import { DefaultCloseIcon } from './controls/DefaultCloseIcon';
import {
  FULLSCREEN_CLOSE_MEDIA_LAYER_Z_INDEX,
  FULLSCREEN_THUMBNAIL_SLOT_Z_INDEX,
  FULLSCREEN_TOP_CHROME_Z_INDEX,
} from './layering';
import type { FullscreenDialogSwitch } from './dialogSwitch';

export type FullscreenRuntimeProps = {
  fsEnabled: boolean;
  fsSub: any;
  showFullscreenModal: boolean;
  setShowFullscreenModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowFullscreenSlider: React.Dispatch<React.SetStateAction<boolean>>;
  showFullscreenSlider: boolean;
  isClick: React.RefObject<boolean>;
  isAnimatingRef: React.RefObject<boolean>;
  overlayDivRef: React.RefObject<HTMLDivElement | null>;
  duplicateImgRef: React.RefObject<HTMLElement | null>;
  cells: React.RefObject<{ element: HTMLElement; index: number }[]>;
  slidesForFullscreen: React.RefObject<
    { cells: { element: HTMLElement; index: number }[]; target: number }[]
  >;
  sliderForFullscreen: React.RefObject<HTMLDivElement | null>;
  isWrappingForFullscreen: React.RefObject<boolean>;
  setClosingModal: React.Dispatch<React.SetStateAction<boolean>>;
  closingModal: boolean;
  closeButtonRef: React.RefObject<HTMLElement | null>;
  counterRef: React.RefObject<HTMLElement | null>;
  leftChevronRef: React.RefObject<HTMLElement | null>;
  rightChevronRef: React.RefObject<HTMLElement | null>;
  centerSliderForFullscreen: () => void;
  setSliderIndexForFullscreen: (index: number, mode?: any) => void;
  layout?: 'slider' | 'grid' | 'masonry' | 'entries' | null;
  expandableImageRefs: React.RefObject<any[]>;
  resolveLayoutlessTarget: (index: number) => {
    host: HTMLElement | null;
    image: HTMLImageElement | null;
    media: HTMLElement | null;
  };
  entryMapRef: React.RefObject<MediaEntryLink[] | null>;
  entryRootRef?: React.RefObject<HTMLDivElement | null>;
  entryMediaLayout: any;
  introFade: boolean;
  introDuration?: FullscreenIntroPathTiming<number>;
  introEasing?: FullscreenIntroPathTiming<string>;
  fullscreenSliderApi: React.RefObject<FullscreenSliderHandle | null>;
  slideIndex: number;
  isZoomClick: React.RefObject<boolean>;
  isZoomed: boolean;
  windowSize: any;
  imageRefs: React.RefObject<React.RefObject<HTMLDivElement | null>[]>;
  wrappedItems: MediaItem[];
  setWrappedItems: React.Dispatch<React.SetStateAction<MediaItem[]>>;
  scale: number;
  isZooming: React.RefObject<boolean>;
  singleModePlyrRefs: React.RefObject<(APITypes | null)[]>;
  wrappedModePlyrRefs: React.RefObject<(APITypes | null)[]>;
  direction: 'ltr' | 'rtl';
  sliderGap?: number;
  sliderDuration: number;
  sliderFriction: number;
  sliderSkipSnaps?: SliderSkipSnaps;
  sliderStrictSnaps?: boolean;
  suppressLoopRef: React.RefObject<boolean>;
  fsFadeOpening: boolean;
  normalizedItems: MediaItem[];
  fsThumbContainerRef: React.RefObject<HTMLDivElement | null>;
  fullscreenThumbnailSlot: FullscreenThumbnailSlotLayout | null;
  setFullscreenThumbnailMountEl: React.RefCallback<HTMLDivElement>;
  showFsEntryOverlayMount: boolean;
  fsIntroReq: FsIntroRequest;
  clearFsIntroReq: () => void;
  styles: Record<string, string>;
  fs: FullscreenOptions;
  overlayCaptionRef: React.RefObject<HTMLDivElement | null>;
  overlayCaptionRootRef: React.RefObject<Root | null>;
  setFsFadeOpening: React.Dispatch<React.SetStateAction<boolean>>;
  addShield: (timeoutMs?: number | undefined) => void;
  resolveFsCaptionPlacement: (
    placement: ResponsiveCaptionPlacement | undefined,
    breakpoint: number | undefined,
    viewportWidth: number
  ) => FsCaptionPlacement | null;
  requestFsCloseRef: React.RefObject<null | (() => void)>;
  cancelFsCloseRef: React.RefObject<null | (() => void)>;
  suppressNextClickRef: React.RefObject<boolean>;
  currentImage: React.RefObject<HTMLDivElement | null>;
  scaleRef: React.RefObject<number>;
  pointerDownRef: React.RefObject<boolean>;
  interactionModeRef: React.RefObject<'idle' | 'drag' | 'wheel' | 'programmatic'>;
  boundsX: React.RefObject<ScrollBoundsType | null>;
  boundsY: React.RefObject<ScrollBoundsType | null>;
  bodyX: React.RefObject<ScrollBodyType | null>;
  bodyY: React.RefObject<ScrollBodyType | null>;
  locX: React.RefObject<Vector1DType | null>;
  locY: React.RefObject<Vector1DType | null>;
  prevX: React.RefObject<Vector1DType | null>;
  prevY: React.RefObject<Vector1DType | null>;
  offX: React.RefObject<Vector1DType | null>;
  offY: React.RefObject<Vector1DType | null>;
  tgtX: React.RefObject<Vector1DType | null>;
  tgtY: React.RefObject<Vector1DType | null>;
  axisRef: React.RefObject<AxisType | null>;
  animRef: React.RefObject<AnimationsType | null>;
  setScale: (newScale: number) => void;
  previousZoom: React.RefObject<{ x: number; y: number }>;
  panRef: React.RefObject<{ x: number; y: number }>;
  changingSlides: React.RefObject<boolean>;
  fsIndexRef: React.RefObject<number>;
  entriesObject: EntriesOptions;
  syncFullscreenSourceFromIndex: (nextIndex: number) => void;
  setFullscreenOpen: (open: boolean) => void;
  runtimePlugins?: FullscreenPlugin[];
  dialogHidden?: boolean;
  dialogTransitionDurationMs?: number;
  dialogTransitionEasing?: string;
  dialogTransitionSwitch?: FullscreenDialogSwitch | null;
  onDialogSwitchClaim?: (durationMs: number) => void;
};

const EMPTY_RUNTIME_PLUGINS: FullscreenPlugin[] = [];
const EMPTY_PLAYER_STYLE: React.CSSProperties = {};
type DialogPaneRadiusKey =
  | 'borderTopLeftRadius'
  | 'borderTopRightRadius'
  | 'borderBottomRightRadius'
  | 'borderBottomLeftRadius';

function setDialogPaneRadiusCorner(
  style: React.CSSProperties,
  corner: DialogPaneRadiusKey
) {
  style[corner] = 'inherit';
}

function createFullscreenDialogPaneRadiusStyles(
  placement: FsCaptionPlacement | null,
  hasCaptionPane: boolean,
  headerOwnsTopCorners: boolean,
  mediaPaneHidden: boolean
) {
  const header: React.CSSProperties = {};
  const media: React.CSSProperties = {};
  const caption: React.CSSProperties = {};

  if (headerOwnsTopCorners) {
    setDialogPaneRadiusCorner(header, 'borderTopLeftRadius');
    setDialogPaneRadiusCorner(header, 'borderTopRightRadius');
    header.overflow = 'hidden';
  }

  if (mediaPaneHidden && hasCaptionPane) {
    if (!headerOwnsTopCorners) {
      setDialogPaneRadiusCorner(caption, 'borderTopLeftRadius');
      setDialogPaneRadiusCorner(caption, 'borderTopRightRadius');
    }

    setDialogPaneRadiusCorner(caption, 'borderBottomRightRadius');
    setDialogPaneRadiusCorner(caption, 'borderBottomLeftRadius');
    return { header, media, caption };
  }

  if (!hasCaptionPane) {
    if (!headerOwnsTopCorners) {
      setDialogPaneRadiusCorner(media, 'borderTopLeftRadius');
      setDialogPaneRadiusCorner(media, 'borderTopRightRadius');
    }

    setDialogPaneRadiusCorner(media, 'borderBottomRightRadius');
    setDialogPaneRadiusCorner(media, 'borderBottomLeftRadius');
    return { header, media, caption };
  }

  switch (placement ?? 'bottom') {
    case 'left':
      if (!headerOwnsTopCorners) {
        setDialogPaneRadiusCorner(caption, 'borderTopLeftRadius');
        setDialogPaneRadiusCorner(media, 'borderTopRightRadius');
      }
      setDialogPaneRadiusCorner(caption, 'borderBottomLeftRadius');
      setDialogPaneRadiusCorner(media, 'borderBottomRightRadius');
      break;
    case 'right':
      if (!headerOwnsTopCorners) {
        setDialogPaneRadiusCorner(media, 'borderTopLeftRadius');
        setDialogPaneRadiusCorner(caption, 'borderTopRightRadius');
      }
      setDialogPaneRadiusCorner(media, 'borderBottomLeftRadius');
      setDialogPaneRadiusCorner(caption, 'borderBottomRightRadius');
      break;
    case 'top':
      if (!headerOwnsTopCorners) {
        setDialogPaneRadiusCorner(caption, 'borderTopLeftRadius');
        setDialogPaneRadiusCorner(caption, 'borderTopRightRadius');
      }
      setDialogPaneRadiusCorner(media, 'borderBottomRightRadius');
      setDialogPaneRadiusCorner(media, 'borderBottomLeftRadius');
      break;
    case 'bottom':
    default:
      if (!headerOwnsTopCorners) {
        setDialogPaneRadiusCorner(media, 'borderTopLeftRadius');
        setDialogPaneRadiusCorner(media, 'borderTopRightRadius');
      }
      setDialogPaneRadiusCorner(caption, 'borderBottomRightRadius');
      setDialogPaneRadiusCorner(caption, 'borderBottomLeftRadius');
      break;
  }

  return { header, media, caption };
}

function dialogPaneDisplayNone(style: React.CSSProperties | undefined) {
  return (
    typeof style?.display === 'string' &&
    style.display.trim().toLowerCase() === 'none'
  );
}

function dialogHeaderOwnsTopCorners(
  node: React.ReactNode,
  style: React.CSSProperties | undefined
) {
  if (!node) return false;
  const position =
    typeof style?.position === 'string'
      ? style.position.trim().toLowerCase()
      : '';

  return position !== 'absolute' && position !== 'fixed';
}

function useEmptyPlyrProps(_args?: unknown) {
  return React.useMemo(() => [], []);
}

function useNoopZoomPanRuntime() {
  const isPinching = React.useRef(false);
  const isTouchPinching = React.useRef(false);
  const noop = React.useCallback(() => {}, []);

  return React.useMemo(
    () => ({
      isPinching,
      isTouchPinching,
      entryOverlayZoomMotion: undefined,
      captionZoomMotion: undefined,
      handlePanPointerStart: noop,
      handleZoomToggle: noop,
      resetAllZoomDom: noop,
      resetForSlideNavigation: noop,
      forceResetZoom: noop,
      prepareZoomOutForClose: noop,
      handleHoverPointerEnter: noop,
      handleHoverPointerMove: noop,
      handleHoverPointerLeave: noop,
    }),
    [isPinching, isTouchPinching, noop]
  );
}

function mergeRuntimeFeatures(plugins: FullscreenPlugin[]): FullscreenRuntimeFeatures {
  return plugins.reduce<FullscreenRuntimeFeatures>((merged, plugin) => {
    if (!plugin.runtime) return merged;
    return { ...merged, ...plugin.runtime };
  }, {});
}

function canonicalIndexOf(active: number, len: number) {
  return ((active % len) + len) % len;
}

function fullscreenMediaSignature(items: MediaItem[]) {
  return items
    .map((item) => {
      const any = item as any;
      return `${item.kind}|${any.src ?? ''}|${any.srcSet ?? ''}|${any.sizes ?? ''}|${any.poster ?? ''}`;
    })
    .join('||');
}

function suppressDefaultFullscreenLazySpinner(
  config: FullscreenLazyLoadConfig | undefined
) {
  if (!config || config.spinner !== undefined) return config;
  return { ...config, spinner: false };
}

function suppressOpenStrategyDefaultLazySpinners(
  lazyLoad: FullscreenLazyLoadOptions | undefined
) {
  if (!lazyLoad) return lazyLoad;

  const images = suppressDefaultFullscreenLazySpinner(lazyLoad.images);
  const videos = suppressDefaultFullscreenLazySpinner(lazyLoad.videos);

  if (images === lazyLoad.images && videos === lazyLoad.videos) {
    return lazyLoad;
  }

  return {
    ...lazyLoad,
    images,
    videos,
  };
}

function isCrossOriginMediaUrl(src: string) {
  if (typeof window === 'undefined') return false;

  try {
    const url = new URL(src, window.location.href);
    return url.origin !== window.location.origin;
  } catch {
    return false;
  }
}

function shouldUseAnonymousCrossOrigin(src: string) {
  if (!isCrossOriginMediaUrl(src)) return false;
  return /\.(?:mp4|m4v|webm|ogv|ogg|mov)(?:[?#]|$)/i.test(src);
}

function pausePlyrApi(api: APITypes | null) {
  if (!api) return;

  try {
    (api as any)?.pause?.();
  } catch {}

  const plyr = (api as any)?.plyr ?? null;

  try {
    plyr?.pause?.();
  } catch {}

  try {
    const media: HTMLMediaElement | undefined = plyr?.media;
    media?.pause?.();
  } catch {}
}

export function getFullscreenVideoOpenRefIndex(args: {
  canonicalIndex: number;
  canonicalLength: number;
}) {
  const { canonicalIndex, canonicalLength } = args;

  if (!Number.isFinite(canonicalIndex)) return null;
  if (!Number.isFinite(canonicalLength) || canonicalLength <= 0) return null;

  const normalizedIndex = canonicalIndexOf(canonicalIndex, canonicalLength);
  return canonicalLength > 1 ? normalizedIndex + 1 : normalizedIndex;
}

export function shouldPlayFullscreenVideoOnOpen(args: {
  playOnOpen?: boolean;
  playOnTransition?: boolean;
  openingFromDialogTransition?: boolean;
  showFullscreenModal: boolean;
  showFullscreenSlider: boolean;
  closingModal: boolean;
  item?: MediaItem | null;
}) {
  const enabled = args.openingFromDialogTransition
    ? args.playOnTransition
    : args.playOnOpen;

  return (
    !!enabled &&
    args.showFullscreenModal &&
    args.showFullscreenSlider &&
    !args.closingModal &&
    args.item?.kind === 'video'
  );
}

export function shouldDeferFullscreenLiveVideo(args: {
  showFullscreenModal: boolean;
  fsLazyVideosEnabled: boolean;
  openingInProgress: boolean;
  openingTargetKind?: MediaItem["kind"] | null;
}) {
  if (!args.showFullscreenModal) return true;

  return (
    args.openingInProgress &&
    args.openingTargetKind !== "video"
  );
}

export function resolveAllowedFullscreenImageIndices(
  activeCanonicalIndex: number,
  baseVisibleIndices: Iterable<number>
) {
  return new Set<number>([activeCanonicalIndex, ...baseVisibleIndices]);
}

function playPlyrApi(api: APITypes | null) {
  const player: APITypes["plyr"] | null = api?.plyr ?? null;
  if (!player || typeof player.play !== 'function') return false;

  try {
    const playResult = player.play();
    if (
      playResult &&
      typeof (playResult as Promise<void>).catch === 'function'
    ) {
      (playResult as Promise<void>).catch(() => {});
    }
    return true;
  } catch {
    return false;
  }
}

function fullscreenThumbnailSlotLayoutStyle(
  style: React.CSSProperties | undefined
): React.CSSProperties | undefined {
  if (!style) return undefined;

  const {
    width,
    height,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    flex,
    flexBasis,
    flexGrow,
    flexShrink,
    alignSelf,
    margin,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    marginBlock,
    marginBlockStart,
    marginBlockEnd,
    marginInline,
    marginInlineStart,
    marginInlineEnd,
  } = style;

  return {
    width,
    height,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    flex,
    flexBasis,
    flexGrow,
    flexShrink,
    alignSelf,
    margin,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    marginBlock,
    marginBlockStart,
    marginBlockEnd,
    marginInline,
    marginInlineStart,
    marginInlineEnd,
  };
}

function fullscreenDialogFlexDirection(
  placement: FsCaptionPlacement | null | undefined
): React.CSSProperties['flexDirection'] {
  if (placement === 'left') return 'row-reverse';
  if (placement === 'right') return 'row';
  if (placement === 'top') return 'column-reverse';
  return 'column';
}

function isFullscreenDialogSidePlacement(
  placement: FsCaptionPlacement | null | undefined
) {
  return placement === 'left' || placement === 'right';
}

const FULLSCREEN_DIALOG_MEDIA_MIN_INLINE_SIZE = '45%';
const FULLSCREEN_DIALOG_CAPTION_MAX_INLINE_SIZE = '55%';

function finiteCssPx(value: number): number | null {
  return Number.isFinite(value) ? value : null;
}

function parseDialogPaneLength(
  value: string,
  fallback: string | number
): string | number {
  const raw = value.trim();
  if (!raw) return fallback;

  if (raw.includes('%')) return raw;

  const pxMatch = raw.match(/^([+-]?(?:\d+\.?\d*|\.\d+))(px)?$/i);
  if (pxMatch) {
    return finiteCssPx(Number.parseFloat(pxMatch[1])) ?? fallback;
  }

  return raw;
}

function resolveDialogPaneLengthFromResponsive(
  value: ResponsiveLength | undefined,
  fallback: string | number,
  viewportWidth: number
): string | number {
  const vw = effectiveViewportWidth(viewportWidth);

  if (value == null) return fallback;
  if (typeof value === 'number') return finiteCssPx(value) ?? fallback;
  if (typeof value === 'string') return parseDialogPaneLength(value, fallback);

  if (Array.isArray(value)) {
    return resolveDialogPaneLengthFromResponsive(
      value[0] as any,
      fallback,
      vw
    );
  }

  if (typeof value !== 'object') return fallback;

  const entries = Object.entries(value)
    .map(([key, v]) => {
      const minWidth =
        BREAKPOINT_MAP[key] ??
        (Number.isNaN(Number.parseFloat(key)) ? 0 : Number.parseFloat(key));
      return { minWidth, value: v };
    })
    .filter((entry) => Number.isFinite(entry.minWidth) && entry.minWidth >= 0)
    .sort((a, b) => a.minWidth - b.minWidth);

  let result = fallback;

  for (const entry of entries) {
    if (vw >= entry.minWidth) {
      result = resolveDialogPaneLengthFromResponsive(
        entry.value as any,
        result,
        vw
      );
    }
  }

  return result;
}

export function FullscreenRuntime(props: FullscreenRuntimeProps) {
  const {
    fsEnabled,
    fsSub,
    showFullscreenModal,
    setShowFullscreenModal,
    isClick,
    isAnimatingRef,
    overlayDivRef,
    cells,
    setShowFullscreenSlider,
    slidesForFullscreen,
    sliderForFullscreen,
    isWrappingForFullscreen,
    setClosingModal,
    closeButtonRef,
    counterRef,
    leftChevronRef,
    rightChevronRef,
    centerSliderForFullscreen,
    setSliderIndexForFullscreen,
    layout,
    expandableImageRefs,
    resolveLayoutlessTarget,
    entryMapRef,
    entryRootRef,
    entryMediaLayout,
    introFade,
    introDuration,
    introEasing,
    fullscreenSliderApi,
    slideIndex,
    isZoomClick,
    isZoomed,
    windowSize,
    imageRefs,
    wrappedItems,
    setWrappedItems,
    scale,
    showFullscreenSlider,
    isZooming,
    singleModePlyrRefs,
    wrappedModePlyrRefs,
    closingModal,
    duplicateImgRef,
    direction,
    sliderGap,
    sliderDuration,
    sliderFriction,
    sliderSkipSnaps,
    sliderStrictSnaps,
    suppressLoopRef,
    fsFadeOpening,
    normalizedItems,
    fsThumbContainerRef,
    fullscreenThumbnailSlot,
    setFullscreenThumbnailMountEl,
    showFsEntryOverlayMount,
    fsIntroReq,
    clearFsIntroReq,
    styles,
    fs,
    overlayCaptionRef,
    overlayCaptionRootRef,
    setFsFadeOpening,
    addShield,
    resolveFsCaptionPlacement,
    requestFsCloseRef,
    cancelFsCloseRef,
    suppressNextClickRef,
    currentImage,
    scaleRef,
    pointerDownRef,
    interactionModeRef,
    boundsX,
    boundsY,
    bodyX,
    bodyY,
    locX,
    locY,
    prevX,
    prevY,
    offX,
    offY,
    tgtX,
    tgtY,
    axisRef,
    animRef,
    setScale,
    previousZoom,
    panRef,
    changingSlides,
    fsIndexRef,
    entriesObject,
    syncFullscreenSourceFromIndex,
    setFullscreenOpen,
    runtimePlugins = EMPTY_RUNTIME_PLUGINS,
    dialogHidden = false,
    dialogTransitionDurationMs,
    dialogTransitionEasing,
    dialogTransitionSwitch,
    onDialogSwitchClaim,
  } = props;

  const runtimeFeatures = React.useMemo(
    () => mergeRuntimeFeatures(runtimePlugins),
    [runtimePlugins]
  );
  const renderSlides =
    runtimeFeatures.renderSlides ?? renderFullscreenBaseSlides;
  const renderCrossfadeSlides =
    runtimeFeatures.renderCrossfadeSlides ?? renderFullscreenBaseCrossfadeSlides;
  const useFullscreenPlyrProps =
    runtimeFeatures.usePlyrProps ?? useEmptyPlyrProps;
  const useFullscreenZoomPanRuntime =
    runtimeFeatures.useZoomPanRuntime ?? useNoopZoomPanRuntime;
  const fullscreenDefaultPlayerStyle =
    runtimeFeatures.defaultPlayerStyle ?? EMPTY_PLAYER_STYLE;
  const hasVideoRuntime = !!runtimeFeatures.usePlyrProps;
  const hasLazyLoadRuntime = !!runtimeFeatures.lazyLoad;
  const activeFsLazy = React.useMemo(() => {
    if (!hasLazyLoadRuntime) return undefined;
    if ((fs.mountStrategy ?? "always") !== "open") return fs.lazyLoad;
    return suppressOpenStrategyDefaultLazySpinners(fs.lazyLoad);
  }, [fs.lazyLoad, fs.mountStrategy, hasLazyLoadRuntime]);
  const shouldMountFullscreenView =
    (fs.mountStrategy ?? "always") !== "open" ||
    showFullscreenModal ||
    closingModal ||
    !!fsIntroReq;

  const fsLazyImagesEnabled = !!activeFsLazy?.images?.enabled;
  const fsLazyVideosEnabled = hasVideoRuntime && !!activeFsLazy?.videos?.enabled;
  const fsAllowedImagesRef = React.useRef<Set<number>>(new Set());
  const fsAllowedVideosRef = React.useRef<Set<number>>(new Set());
  const fsLazyImageListenersRef = React.useRef(new Set<() => void>());
  const fsLazyVideoListenersRef = React.useRef(new Set<() => void>());
  const fsBaseVisibleImagesRef = React.useRef<Set<number>>(new Set());
  const fsActiveIndexRef = React.useRef<number>(0);
  const fsDecodedImagesRef = React.useRef(new Set<string>());
  const fsCustomDecodedImagesRef = React.useRef(new Set<string>());
  const fsCustomResolvedSrcByKeyRef = React.useRef(new Map<string, string>());
  const fsPreparedVideosRef = React.useRef(new Set<string>());
  const fsPreloadedVideosRef = React.useRef(new Set<string>());
  const fsForceMountVideosRef = React.useRef<Set<number>>(new Set());
  const [fsActiveRenderIndex, setFsActiveRenderIndex] = React.useState(0);
  const [latchedIntroMethod, setLatchedIntroMethod] =
    React.useState<FullscreenOpenMethod | null>(null);
  const [latchedIntroIndex, setLatchedIntroIndex] =
    React.useState<number>(0);
  const [closeDragLayerActive, setCloseDragLayerActive] =
    React.useState(false);
  const canonicalLen = normalizedItems.length || 0;
  const entryPrimeSeqRef = React.useRef(0);
  const mediaSignature = React.useMemo(
    () => fullscreenMediaSignature(normalizedItems),
    [normalizedItems]
  );
  const fullscreenVideoSnapshotStoreRef = React.useRef<unknown | null>(null);
  if (
    !fullscreenVideoSnapshotStoreRef.current &&
    runtimeFeatures.createVideoSnapshotStore
  ) {
    fullscreenVideoSnapshotStoreRef.current =
      runtimeFeatures.createVideoSnapshotStore();
  }
  const fullscreenVideoSnapshotStore = fullscreenVideoSnapshotStoreRef.current;

  function notifyFsLazyImages() {
    fsLazyImageListenersRef.current.forEach((fn) => fn());
  }

  function notifyFsLazyVideos() {
    fsLazyVideoListenersRef.current.forEach((fn) => fn());
  }

  const recomputeAllowedAndNotify = React.useCallback(
    (active: number) => {
      if (!canonicalLen) return;

      const c = canonicalIndexOf(active, canonicalLen);

      if (fsLazyVideosEnabled) {
        const forced = fsForceMountVideosRef.current;
        fsAllowedVideosRef.current = new Set<number>([c, ...forced]);
        notifyFsLazyVideos();
      }

      if (fsLazyImagesEnabled) {
        fsAllowedImagesRef.current = resolveAllowedFullscreenImageIndices(
          c,
          fsBaseVisibleImagesRef.current
        );
        notifyFsLazyImages();
      }
    },
    [canonicalLen, fsLazyImagesEnabled, fsLazyVideosEnabled]
  );

  const resetFsSessionState = React.useCallback(() => {
    fsForceMountVideosRef.current.clear();
    fsAllowedVideosRef.current = new Set<number>();
    fsAllowedImagesRef.current = new Set<number>(fsBaseVisibleImagesRef.current);
  }, []);

  const syncFsSessionToCurrentIndex = React.useCallback(() => {
    const current = fsSub.get?.();
    const active =
      typeof current === 'number' && Number.isFinite(current)
        ? current
        : fsActiveIndexRef.current;

    if (typeof active !== 'number' || !Number.isFinite(active)) return;

    fsActiveIndexRef.current = active;
    recomputeAllowedAndNotify(active);
  }, [fsSub, recomputeAllowedAndNotify]);

  React.useEffect(() => {
    if ((!fsLazyImagesEnabled && !fsLazyVideosEnabled) || !fsSub) return;

    const setActive = (v: number) => {
      if (typeof v !== 'number') return;
      fsActiveIndexRef.current = v;
      recomputeAllowedAndNotify(v);
    };

    if (showFullscreenModal) {
      const cur = fsSub.get?.();
      if (typeof cur === 'number') setActive(cur);
    }

    if (typeof fsSub.subscribe === 'function') {
      const off = fsSub.subscribe((v: number) => setActive(v));
      return () => off?.();
    }

    if (typeof fsSub.onEvent === 'function') {
      const off = fsSub.onEvent((evt: any) => {
        if (typeof evt === 'number') setActive(evt);
        else if (typeof evt?.index === 'number') setActive(evt.index);
        else {
          const cur = fsSub.get?.();
          if (typeof cur === 'number') setActive(cur);
        }
      });
      return () => off?.();
    }
  }, [fsLazyImagesEnabled, fsLazyVideosEnabled, fsSub, showFullscreenModal, recomputeAllowedAndNotify]);

  React.useEffect(() => {
    if (!fsSub) return;

    const setActive = (value: number) => {
      if (typeof value !== 'number' || !Number.isFinite(value)) return;
      setFsActiveRenderIndex(value);
    };

    if (showFullscreenModal) {
      const current = fsSub.get?.();
      if (typeof current === 'number') setActive(current);
    }

    if (typeof fsSub.subscribe === 'function') {
      const off = fsSub.subscribe((value: number) => setActive(value));
      return () => off?.();
    }

    if (typeof fsSub.onEvent === 'function') {
      const off = fsSub.onEvent((evt: any) => {
        if (typeof evt === 'number') setActive(evt);
        else if (typeof evt?.index === 'number') setActive(evt.index);
        else {
          const current = fsSub.get?.();
          if (typeof current === 'number') setActive(current);
        }
      });
      return () => off?.();
    }
  }, [fsSub, showFullscreenModal]);

  function nextZ() {
    const w = window as any;
    if (!w.__rmgZ) w.__rmgZ = 9999;
    w.__rmgZ += 1;
    return w.__rmgZ;
  }

  const fsZRef = React.useRef<number>(9999);
  const fullscreenRootRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (showFullscreenModal) {
      fsZRef.current = nextZ();
    }
  }, [showFullscreenModal]);

  React.useEffect(() => {
    if (showFullscreenModal) return;
    setCloseDragLayerActive(false);
  }, [showFullscreenModal]);

  const wasFullscreenOpenRef = React.useRef(showFullscreenModal);
  React.useEffect(() => {
    const wasOpen = wasFullscreenOpenRef.current;
    wasFullscreenOpenRef.current = showFullscreenModal;

    if (!showFullscreenModal || wasOpen) return;

    resetFsSessionState();
    syncFsSessionToCurrentIndex();
  }, [showFullscreenModal, resetFsSessionState, syncFsSessionToCurrentIndex]);

  const prevMediaSignatureRef = React.useRef(mediaSignature);
  React.useEffect(() => {
    if (prevMediaSignatureRef.current === mediaSignature) return;

    prevMediaSignatureRef.current = mediaSignature;
    fsBaseVisibleImagesRef.current.clear();
    fsPreparedVideosRef.current.clear();
    fsPreloadedVideosRef.current.clear();
    resetFsSessionState();
    (fullscreenVideoSnapshotStore as any)?.reset?.();

    if (showFullscreenModal) {
      syncFsSessionToCurrentIndex();
    }
  }, [
    mediaSignature,
    resetFsSessionState,
    showFullscreenModal,
    syncFsSessionToCurrentIndex,
    fullscreenVideoSnapshotStore,
  ]);

  const fullscreenDialog = fs.dialog;
  const fullscreenDialogEnabled =
    !!fullscreenDialog && fullscreenDialog.enabled !== false;
  const fullscreenDialogMediaPaneHidden =
    fullscreenDialogEnabled && dialogPaneDisplayNone(fullscreenDialog?.media?.style);
  const fullscreenCloseEnabled = fs?.controls?.close?.enabled !== false;
  const [fullscreenDialogVisible, setFullscreenDialogVisible] =
    React.useState(false);
  const fullscreenDialogIntroPathRef =
    React.useRef<FullscreenIntroPath>('transform');
  const activeDialogIntroIndex = fsIntroReq?.index ?? latchedIntroIndex;
  const activeDialogIntroItem =
    canonicalLen > 0
      ? normalizedItems[canonicalIndexOf(activeDialogIntroIndex, canonicalLen)]
      : normalizedItems[activeDialogIntroIndex];
  const activeDialogIntroItemKind = activeDialogIntroItem
    ? ((activeDialogIntroItem as any).kind ??
        (activeDialogIntroItem as any).type ??
        null)
    : null;
  const requestedDialogIntroMethod = fsIntroReq?.method ?? latchedIntroMethod;
  const resolvedFullscreenDialogIntroPath: FullscreenIntroPath =
    introFade ||
    fsIntroReq?.originalImage === null ||
    requestedDialogIntroMethod === 'fade' ||
    activeDialogIntroItemKind === 'video'
      ? 'fade'
      : 'transform';

  if (showFullscreenModal && fsIntroReq) {
    fullscreenDialogIntroPathRef.current = resolvedFullscreenDialogIntroPath;
  } else if (!showFullscreenModal) {
    fullscreenDialogIntroPathRef.current = 'transform';
  }

  const fullscreenDialogIntroPath = fsIntroReq
    ? resolvedFullscreenDialogIntroPath
    : fullscreenDialogIntroPathRef.current;
  const fullscreenDialogOpenDurationMs = resolveFullscreenIntroDurationMs(
    introDuration,
    fullscreenDialogIntroPath
  );
  const fullscreenDialogOpenEasing = resolveFullscreenIntroEasing(
    introEasing,
    fullscreenDialogIntroPath
  );
  const fullscreenDialogCloseDurationMs = resolveFullscreenIntroDurationMs(
    introDuration,
    'fade'
  );
  const fullscreenDialogCloseEasing = resolveFullscreenIntroEasing(
    introEasing,
    'fade'
  );
  const fullscreenDialogTransitionDurationMs = closingModal
    ? fullscreenDialogCloseDurationMs
    : fullscreenDialogOpenDurationMs;
  const fullscreenDialogTransitionEasing = closingModal
    ? fullscreenDialogCloseEasing
    : fullscreenDialogOpenEasing;
  const fullscreenDialogOpacityDurationMs =
    typeof fullscreenDialog?.opacityDuration === 'number' &&
    Number.isFinite(fullscreenDialog.opacityDuration)
      ? Math.max(0, fullscreenDialog.opacityDuration)
      : fullscreenDialogTransitionDurationMs;
  const fullscreenDialogOpacityEasing =
    typeof fullscreenDialog?.opacityEasing === 'string' &&
    fullscreenDialog.opacityEasing.trim()
      ? fullscreenDialog.opacityEasing
      : fullscreenDialogTransitionEasing;
  const activeDialogOpacityDurationMs =
    typeof dialogTransitionDurationMs === 'number' &&
    Number.isFinite(dialogTransitionDurationMs)
      ? Math.max(0, dialogTransitionDurationMs)
      : fullscreenDialogOpacityDurationMs;
  const activeDialogOpacityEasing =
    typeof dialogTransitionEasing === 'string' &&
    dialogTransitionEasing.trim()
      ? dialogTransitionEasing
      : fullscreenDialogOpacityEasing;
  const fullscreenDialogIsVisible =
    fullscreenDialogVisible && !closingModal && !dialogHidden;
  const fullscreenDialogScaleMotion =
    fullscreenDialogIntroPath === 'fade' && !closingModal && !dialogHidden;
  const fullscreenCloseLayerActive = closeDragLayerActive || closingModal;
  const fullscreenDialogCloseMediaLayerActive =
    fullscreenDialogEnabled &&
    !fullscreenDialogMediaPaneHidden &&
    fs.overlaysAboveIntroMedia === false &&
    fullscreenCloseLayerActive;
  const fullscreenNonDialogCloseMediaLayerActive =
    !fullscreenDialogEnabled && fullscreenCloseLayerActive;
  const fullscreenCloseMediaLayerActive =
    fullscreenDialogCloseMediaLayerActive ||
    fullscreenNonDialogCloseMediaLayerActive;
  const fullscreenCloseMediaLayerStyle: React.CSSProperties | undefined =
    fullscreenCloseMediaLayerActive
      ? {
          overflow: 'visible',
          zIndex: FULLSCREEN_CLOSE_MEDIA_LAYER_Z_INDEX,
          contain: 'none',
          isolation: 'auto',
        }
      : undefined;
  const fullscreenDialogUserTransform =
    typeof fullscreenDialog?.style?.transform === 'string'
      ? fullscreenDialog.style.transform.trim()
      : '';
  const fullscreenDialogVisibleTransform =
    fullscreenDialogUserTransform || 'scale(1)';
  const fullscreenDialogHiddenTransform = fullscreenDialogUserTransform
    ? `${fullscreenDialogUserTransform} scale(0.985)`
    : 'scale(0.985)';
  const fullscreenDialogMotionStyle: React.CSSProperties | undefined =
    fullscreenDialogEnabled
      ? {
          opacity: fullscreenDialogIsVisible ? 1 : 0,
          pointerEvents: fullscreenDialogIsVisible ? undefined : 'none',
          ...(fullscreenDialogScaleMotion
            ? {
                transform: fullscreenDialogIsVisible
                  ? fullscreenDialogVisibleTransform
                  : fullscreenDialogHiddenTransform,
                transformOrigin:
                  fullscreenDialog?.style?.transformOrigin ?? 'center',
                transition: `opacity ${activeDialogOpacityDurationMs}ms ${activeDialogOpacityEasing}, transform ${fullscreenDialogTransitionDurationMs}ms ${fullscreenDialogTransitionEasing}`,
                willChange: 'opacity, transform',
              }
            : {
                transition: `opacity ${activeDialogOpacityDurationMs}ms ${activeDialogOpacityEasing}`,
                willChange: 'opacity',
              }),
          contain: fullscreenDialog?.style?.contain ?? 'layout paint style',
          isolation: fullscreenDialog?.style?.isolation ?? 'isolate',
        }
      : undefined;
  const hasEntriesOverlay =
    layout === 'entries' &&
    typeof entriesObject.render?.overlay === 'function';
  const hasEntriesViewportOverlay =
    hasEntriesOverlay && !fullscreenDialogEnabled;

  React.useEffect(() => {
    if (!showFullscreenModal || !fullscreenDialogEnabled || closingModal) {
      setFullscreenDialogVisible(false);
      return;
    }

    setFullscreenDialogVisible(false);

    if (typeof window === 'undefined' || !window.requestAnimationFrame) {
      setFullscreenDialogVisible(true);
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setFullscreenDialogVisible(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [showFullscreenModal, fullscreenDialogEnabled, closingModal]);

  React.useEffect(() => {
    if (!fsIntroReq) return;

    const {
      originalImage,
      index,
      closestSelector,
      method,
    } = fsIntroReq;

    setLatchedIntroMethod(method ?? null);
    setLatchedIntroIndex(index);

    const fullscreenThumbnailPosition = fullscreenThumbnailSlot?.position ?? null;

    runFullscreenIntro({
      originalImage,
      method,
      index,
      normalizedItems,
      styles,
      fs,
      overlayDivRef,
      duplicateImgRef,
      overlayCaptionRef,
      overlayCaptionRootRef,
      fsThumbContainerRef,
      fullscreenThumbnailPosition,
      setShowFullscreenSlider,
      setFsFadeOpening,
      onDialogSwitchClaim,
      addShield,
      resolveFsCaptionPlacement,
      viewportOverlay: hasEntriesViewportOverlay
        ? {
            placement: entriesObject.overlay?.placement,
            width: entriesObject.overlay?.width,
            height: entriesObject.overlay?.height,
            breakpoint: entriesObject.overlay?.breakpoint,
          }
        : undefined,
      closestSelector,
      baseZ: fsZRef.current,
      fullscreenRootRef,
    });

    clearFsIntroReq();
  }, [
    entriesObject.overlay,
    fsIntroReq,
    fullscreenThumbnailSlot,
    hasEntriesViewportOverlay,
    onDialogSwitchClaim,
  ]);

  useWrappedItemsAndRefs({
    normalizedItems,
    wrappedItems,
    setWrappedItems,
    imageRefs,
  });

  React.useEffect(() => {
    cells.current = [];
  }, [cells, mediaSignature, wrappedItems.length]);

  const zoomRuntime = useFullscreenZoomPanRuntime({
    fs,
    entriesObject,
    hasEntriesViewportOverlay,
    layout,
    resolveFsCaptionPlacement,
    windowSize,
    currentImage,
    scaleRef,
    setScale,
    previousZoom,
    suppressLoopRef,
    locX,
    prevX,
    offX,
    tgtX,
    locY,
    prevY,
    offY,
    tgtY,
    bodyX,
    bodyY,
    boundsX,
    boundsY,
    animRef,
    panRef,
    imageRefs,
    changingSlides,
    fullscreenSliderApi,
    isZoomed,
    pointerDownRef,
    interactionModeRef,
    axisRef,
    suppressNextClickRef,
    closingModal,
  });

  React.useEffect(() => {
    if (!showFullscreenModal) return;
    const start = fsSub.get();
    fsIndexRef.current = start;
    syncFullscreenSourceFromIndex(start);
  }, [showFullscreenModal, fsSub]);

  React.useEffect(() => {
    if (!showFullscreenModal) return;
    if (layout !== 'entries') return;
    if (closingModal) return;
    if (!fsSub) return;
    if (!canonicalLen) return;
    if (!entryMapRef.current?.length) return;

    let cancelled = false;

    const primeEntryOwnerForFsIndex = async (value: number) => {
      if (typeof value !== 'number') return;

      const canonicalIndex = canonicalIndexOf(value, canonicalLen);
      const link = entryMapRef.current?.[canonicalIndex];
      if (!link) return;

      const seq = ++entryPrimeSeqRef.current;
      const entryRoot = entryRootRef?.current ?? null;

      if (!isEntryOwnerReady(link.entryIndex, entryRoot)) {
        await scrollEntrySectionIntoView(link.entryIndex, entryRoot);
      }
      await waitForEntryOwnerReady(link.entryIndex, undefined, entryRoot);

      if (cancelled) return;
      if (seq !== entryPrimeSeqRef.current) return;

      syncFullscreenSourceFromIndex(canonicalIndex);
    };

    const cur = fsSub.get?.();
    if (typeof cur === 'number') {
      void primeEntryOwnerForFsIndex(cur);
    }

    return () => {
      cancelled = true;
      entryPrimeSeqRef.current += 1;
    };
  }, [
    showFullscreenModal,
    layout,
    closingModal,
    fsSub,
    canonicalLen,
    entryMapRef,
    entryRootRef,
    syncFullscreenSourceFromIndex,
  ]);

  const showFsCaptionOverlayMount =
    !!showFullscreenModal &&
    fs.caption?.layout === 'overlay' &&
    typeof fs.caption?.render === 'function';

  const fullscreenSliderGap = normalizedItems.length > 1 ? sliderGap ?? 0 : 0;

  const singlePlyrProps = useFullscreenPlyrProps({
    items: normalizedItems,
    source: fs.video?.source,
    options: fs.video?.options,
  });
  const wrappedPlyrProps = useFullscreenPlyrProps({
    items: wrappedItems,
    source: fs.video?.source,
    options: fs.video?.options,
  });

  const singleTransform = React.useMemo(() => createSingleTransform(), []);
  const wrappedTransformSign = direction === 'rtl' ? -1 : 1;
  const wrappedTransform = React.useMemo(
    () =>
      createWrappedTransform({
        length: wrappedItems.length,
        sign: wrappedTransformSign,
        gap: fullscreenSliderGap,
      }),
    [fullscreenSliderGap, wrappedItems.length, wrappedTransformSign]
  );
  const crossfadeImageRefs = React.useMemo(
    () =>
      normalizedItems.map(
        () => React.createRef<HTMLDivElement | null>()
      ),
    [mediaSignature]
  );
  const crossfadePlayerRefs = React.useRef<(APITypes | null)[]>([]);
  const crossfadeCellsRef = React.useRef<
    { element: HTMLElement; index: number }[]
  >([]);
  const handlePanPointerStart = zoomRuntime.handlePanPointerStart;
  const handleZoomToggle = zoomRuntime.handleZoomToggle;
  const resetZoomForSlideNavigation = zoomRuntime.resetForSlideNavigation;
  const resetZoomForSlideChange = zoomRuntime.resetAllZoomDom;
  const onForceResetZoom = zoomRuntime.forceResetZoom ?? zoomRuntime.resetAllZoomDom;
  const prepareZoomOutForClose = zoomRuntime.prepareZoomOutForClose;
  const handleHoverPointerEnter = zoomRuntime.handleHoverPointerEnter ?? (() => {});
  const handleHoverPointerMove = zoomRuntime.handleHoverPointerMove ?? (() => {});
  const handleHoverPointerLeave = zoomRuntime.handleHoverPointerLeave ?? (() => {});
  const isPinching = zoomRuntime.isPinching;
  const isTouchPinching = zoomRuntime.isTouchPinching;
  const captionZoomMotion = zoomRuntime.captionZoomMotion as any;
  const entryOverlayZoomMotion = zoomRuntime.entryOverlayZoomMotion as any;

  function mediaKey(item: MediaItem) {
    const any = item as any;
    return `${item.kind}|${any.src ?? ''}|${any.srcSet ?? ''}|${any.sizes ?? ''}|${any.poster ?? ''}`;
  }

  React.useEffect(() => {
    return () => {
      (fullscreenVideoSnapshotStore as any)?.destroy?.();
    };
  }, [fullscreenVideoSnapshotStore]);

  const openingInProgress = showFullscreenModal && !showFullscreenSlider;
  const openingCanonicalIndex = canonicalLen
    ? canonicalIndexOf(activeDialogIntroIndex, canonicalLen)
    : null;
  const currentFsRenderIndex = (() => {
    const current = fsSub.get?.();
    return typeof current === "number" && Number.isFinite(current)
      ? current
      : fsActiveRenderIndex;
  })();
  const activeCanonicalIndex = canonicalLen
    ? canonicalIndexOf(currentFsRenderIndex, canonicalLen)
    : null;
  const openingTargetKind =
    openingCanonicalIndex != null
      ? normalizedItems[openingCanonicalIndex]?.kind ?? null
      : null;
  const deferLiveVideoUntilVisible =
    shouldDeferFullscreenLiveVideo({
      showFullscreenModal,
      fsLazyVideosEnabled,
      openingInProgress: !!openingInProgress,
      openingTargetKind,
    });
  const playOnOpenKeyRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (showFullscreenModal) return;
    playOnOpenKeyRef.current = null;
  }, [showFullscreenModal]);

  React.useEffect(() => {
    if (!canonicalLen) return;

    const canonicalIndex = canonicalIndexOf(latchedIntroIndex, canonicalLen);
    const item = normalizedItems[canonicalIndex] ?? null;
    const openingFromDialogTransition = !!dialogTransitionSwitch;

    if (
      !shouldPlayFullscreenVideoOnOpen({
        playOnOpen: fs.video?.playOnOpen,
        playOnTransition: fs.video?.playOnTransition,
        openingFromDialogTransition,
        showFullscreenModal,
        showFullscreenSlider,
        closingModal,
        item,
      })
    ) {
      return;
    }

    const refIndex = getFullscreenVideoOpenRefIndex({
      canonicalIndex,
      canonicalLength: canonicalLen,
    });
    if (refIndex == null) return;

    const playRefs =
      canonicalLen > 1 ? wrappedModePlyrRefs : singleModePlyrRefs;
    const sessionKey = `${mediaSignature}|${canonicalIndex}|${latchedIntroIndex}|${
      dialogTransitionSwitch?.id ?? "open"
    }`;
    if (playOnOpenKeyRef.current === sessionKey) return;
    playOnOpenKeyRef.current = sessionKey;

    let cancelled = false;
    let rafId: number | null = null;
    let delayId: number | null = null;
    let deadline = 0;

    const attempt = () => {
      if (cancelled) return;

      const api = playRefs.current[refIndex] ?? null;

      if (playPlyrApi(api)) return;
      if (performance.now() >= deadline) return;

      rafId = window.requestAnimationFrame(attempt);
    };

    const startAttempts = () => {
      deadline = performance.now() + 1600;
      rafId = window.requestAnimationFrame(attempt);
    };

    const transitionDelayMs = openingFromDialogTransition
      ? Math.max(0, dialogTransitionSwitch?.durationMs ?? 0)
      : 0;

    if (transitionDelayMs > 0) {
      delayId = window.setTimeout(startAttempts, transitionDelayMs);
    } else {
      startAttempts();
    }

    return () => {
      cancelled = true;
      if (delayId != null) window.clearTimeout(delayId);
      if (rafId != null) window.cancelAnimationFrame(rafId);
    };
  }, [
    canonicalLen,
    closingModal,
    fs.video?.playOnOpen,
    fs.video?.playOnTransition,
    dialogTransitionSwitch,
    latchedIntroIndex,
    mediaSignature,
    normalizedItems,
    showFullscreenModal,
    showFullscreenSlider,
    singleModePlyrRefs,
    wrappedModePlyrRefs,
  ]);

  const renderFullscreenTrackChildren = (
    renderWindow: RenderFullscreenSlideWindowItem[] | null
  ) => {
    if (!shouldMountFullscreenView) return null;

    const useWrappedSlides = normalizedItems.length > 1;
    const openingRenderWindow =
      (fs.mountStrategy ?? "always") === "open" &&
      openingInProgress &&
      openingCanonicalIndex != null &&
      renderWindow == null
        ? [
            {
              renderedIndex: useWrappedSlides
                ? openingCanonicalIndex + 1
                : openingCanonicalIndex,
              canonicalIndex: openingCanonicalIndex,
              isClone: false,
            },
          ]
        : renderWindow;

    return renderSlides({
      items: useWrappedSlides ? wrappedItems : normalizedItems,
      plyrList: useWrappedSlides ? wrappedPlyrProps : singlePlyrProps,
      getTransform: useWrappedSlides ? wrappedTransform : singleTransform,
      renderWindow: openingRenderWindow,
      imageRefs,
      playerRefs: useWrappedSlides ? wrappedModePlyrRefs : singleModePlyrRefs,
      cells,
      isZoomed,
      showFullscreenSlider,
      defaultPlayerStyle: fullscreenDefaultPlayerStyle,
      fsVideoStyle: fs.video?.style,
      fsVideoClassName: fs.video?.className,
      onPanPointerDown: (
        e: React.PointerEvent<HTMLDivElement>,
        imageRef: React.RefObject<HTMLDivElement | null>
      ) => handlePanPointerStart(e, imageRef),
      onHoverPointerEnter: (
        e: React.PointerEvent<HTMLDivElement>,
        imageRef: React.RefObject<HTMLDivElement | null>
      ) => handleHoverPointerEnter(e, imageRef),
      onHoverPointerMove: (
        e: React.PointerEvent<HTMLDivElement>,
        imageRef: React.RefObject<HTMLDivElement | null>
      ) => handleHoverPointerMove(e, imageRef),
      onHoverPointerLeave: (
        e: React.PointerEvent<HTMLDivElement>,
        imageRef: React.RefObject<HTMLDivElement | null>
      ) => handleHoverPointerLeave(e, imageRef),
      onSuppressNextClickCapture: (e: React.SyntheticEvent) => {
        if (suppressNextClickRef.current) {
          suppressNextClickRef.current = false;
          e.preventDefault();
          e.stopPropagation();
        }
      },
      renderCaption: fs.caption?.render,
      captionClassName: fs.caption?.className,
      captionStyle: fs.caption?.style,
      captionZoomMotion,
      fsCaptionPlacement: fs.caption?.placement,
      fsCaptionWidth: fs.caption?.width,
      fsCaptionHeight: fs.caption?.height,
      fsCaptionBreakpoint: fs.caption?.breakpoint,
      fsCaptionLayout: fs.caption?.layout,
      fsViewportOverlayPlacement: hasEntriesViewportOverlay
        ? entriesObject.overlay?.placement
        : undefined,
      fsViewportOverlayWidth: hasEntriesViewportOverlay
        ? entriesObject.overlay?.width
        : undefined,
      fsViewportOverlayHeight: hasEntriesViewportOverlay
        ? entriesObject.overlay?.height
        : undefined,
      fsViewportOverlayBreakpoint: hasEntriesViewportOverlay
        ? entriesObject.overlay?.breakpoint
        : undefined,
      viewportWidth: windowSize.width,
      viewportHeight: windowSize.height,
      resolveFsCaptionPlacement,
      styles: {
        imgMargin: styles.imgMargin,
        fullscreenImages: styles.fullscreenImages,
      },
      renderImage: fs.renderImage as any,
      fsLazy: activeFsLazy,
      fsLazyAllowedImagesRef: fsAllowedImagesRef,
      fsLazyListenersImagesRef: fsLazyImageListenersRef,
      fsLazyAllowedVideosRef: fsAllowedVideosRef,
      fsLazyListenersVideosRef: fsLazyVideoListenersRef,
      fsDecodedImagesRef: fsDecodedImagesRef,
      fsCustomDecodedImagesRef: fsCustomDecodedImagesRef,
      fsCustomResolvedSrcByKeyRef: fsCustomResolvedSrcByKeyRef,
      fsPreparedVideosRef: fsPreparedVideosRef,
      videoSnapshotStore: fullscreenVideoSnapshotStore,
      canonicalLength: canonicalLen,
      activeCanonicalIndex,
      openingCanonicalIndex,
      openingInProgress,
      deferLiveVideoUntilVisible,
      getMediaKey: mediaKey,
    });
  };

  const renderFullscreenCrossfadeWindow = (indexes: number[]) => {
    if (!shouldMountFullscreenView || !indexes.length) return [];

    const seenIndexes = new Set<number>();
    const renderWindow = indexes.reduce<RenderFullscreenSlideWindowItem[]>(
      (items, index) => {
        if (!Number.isFinite(index) || seenIndexes.has(index)) return items;
        seenIndexes.add(index);
        const canonicalIndex = canonicalIndexOf(index, canonicalLen || 1);
        items.push({
          renderedIndex: canonicalIndex,
          canonicalIndex,
          virtualIndex: index,
          isClone: false,
          key: `crossfade-${index}-${canonicalIndex}`,
        });
        return items;
      },
      []
    );

    const renderedNodes = renderCrossfadeSlides({
      items: normalizedItems,
      plyrList: singlePlyrProps,
      getTransform: singleTransform,
      renderWindow,
      imageRefs: { current: crossfadeImageRefs },
      playerRefs: crossfadePlayerRefs,
      cells: crossfadeCellsRef,
      isZoomed,
      showFullscreenSlider: true,
      defaultPlayerStyle: fullscreenDefaultPlayerStyle,
      fsVideoStyle: fs.video?.style,
      fsVideoClassName: fs.video?.className,
      onPanPointerDown: (
        e: React.PointerEvent<HTMLDivElement>,
        imageRef: React.RefObject<HTMLDivElement | null>
      ) => handlePanPointerStart(e, imageRef),
      onHoverPointerEnter: (
        e: React.PointerEvent<HTMLDivElement>,
        imageRef: React.RefObject<HTMLDivElement | null>
      ) => handleHoverPointerEnter(e, imageRef),
      onHoverPointerMove: (
        e: React.PointerEvent<HTMLDivElement>,
        imageRef: React.RefObject<HTMLDivElement | null>
      ) => handleHoverPointerMove(e, imageRef),
      onHoverPointerLeave: (
        e: React.PointerEvent<HTMLDivElement>,
        imageRef: React.RefObject<HTMLDivElement | null>
      ) => handleHoverPointerLeave(e, imageRef),
      onSuppressNextClickCapture: (e: React.SyntheticEvent) => {
        if (suppressNextClickRef.current) {
          suppressNextClickRef.current = false;
          e.preventDefault();
          e.stopPropagation();
        }
      },
      renderCaption: fs.caption?.render,
      captionClassName: fs.caption?.className,
      captionStyle: fs.caption?.style,
      captionZoomMotion,
      fsCaptionPlacement: fs.caption?.placement,
      fsCaptionWidth: fs.caption?.width,
      fsCaptionHeight: fs.caption?.height,
      fsCaptionBreakpoint: fs.caption?.breakpoint,
      fsCaptionLayout: fs.caption?.layout,
      fsViewportOverlayPlacement: hasEntriesViewportOverlay
        ? entriesObject.overlay?.placement
        : undefined,
      fsViewportOverlayWidth: hasEntriesViewportOverlay
        ? entriesObject.overlay?.width
        : undefined,
      fsViewportOverlayHeight: hasEntriesViewportOverlay
        ? entriesObject.overlay?.height
        : undefined,
      fsViewportOverlayBreakpoint: hasEntriesViewportOverlay
        ? entriesObject.overlay?.breakpoint
        : undefined,
      viewportWidth: windowSize.width,
      viewportHeight: windowSize.height,
      resolveFsCaptionPlacement,
      styles: {
        imgMargin: styles.imgMargin,
        fullscreenImages: styles.fullscreenImages,
      },
      renderImage: fs.renderImage as any,
      fsLazy: activeFsLazy,
      fsLazyAllowedImagesRef: fsAllowedImagesRef,
      fsLazyListenersImagesRef: fsLazyImageListenersRef,
      fsLazyAllowedVideosRef: fsAllowedVideosRef,
      fsLazyListenersVideosRef: fsLazyVideoListenersRef,
      fsDecodedImagesRef: fsDecodedImagesRef,
      fsCustomDecodedImagesRef: fsCustomDecodedImagesRef,
      fsCustomResolvedSrcByKeyRef: fsCustomResolvedSrcByKeyRef,
      fsPreparedVideosRef: fsPreparedVideosRef,
      videoSnapshotStore: fullscreenVideoSnapshotStore,
      canonicalLength: normalizedItems.length,
      openingCanonicalIndex: null,
      openingInProgress: false,
      deferLiveVideoUntilVisible: false,
      getMediaKey: mediaKey,
    });

    const byIndex: React.ReactNode[] = [];
    renderWindow.forEach((item, offset) => {
      byIndex[item.virtualIndex ?? item.renderedIndex] =
        renderedNodes[offset] ?? null;
    });

    return byIndex;
  };

  const pauseAllFullscreenPlayers = React.useCallback(() => {
    const seenApis = new Set<APITypes>();

    for (const api of singleModePlyrRefs.current) {
      if (!api || seenApis.has(api)) continue;
      seenApis.add(api);
      pausePlyrApi(api);
    }

    for (const api of wrappedModePlyrRefs.current) {
      if (!api || seenApis.has(api)) continue;
      seenApis.add(api);
      pausePlyrApi(api);
    }

    const fullscreenRoot = fullscreenRootRef.current;
    if (!fullscreenRoot) return;

    const medias = fullscreenRoot.querySelectorAll<HTMLMediaElement>(
      '[data-rmg-fs-slide="true"] video, [data-rmg-fs-slide="true"] audio'
    );

    medias.forEach((media) => {
      try {
        media.pause();
      } catch {}
    });
  }, [singleModePlyrRefs, wrappedModePlyrRefs]);

  React.useEffect(() => {
    if (!closingModal) return;
    pauseAllFullscreenPlayers();
  }, [closingModal, pauseAllFullscreenPlayers]);

  React.useEffect(() => {
    if (showFullscreenModal) return;
    pauseAllFullscreenPlayers();
  }, [showFullscreenModal, pauseAllFullscreenPlayers]);

  const idlePreloadedImagesRef = React.useRef(new Set<string>());

  function preloadFsImagesIdle(items: MediaItem[], concurrency = 3) {
    const imgs = items.filter((i) => i.kind === 'image');
    let idx = 0;

    const runWorker = async () => {
      while (idx < imgs.length) {
        const item = imgs[idx++];

        const key = `${(item as any).src ?? ''}|${(item as any).srcSet ?? ''}|${(item as any).sizes ?? ''}`;
        if (idlePreloadedImagesRef.current.has(key)) continue;
        idlePreloadedImagesRef.current.add(key);

        const img = new Image();
        img.decoding = 'async';
        (img as any).fetchPriority = 'low';
        img.src = (item as any).src;
        img.srcset = (item as any).srcSet ?? '';
        img.sizes = (item as any).sizes ?? '';

        try {
          await img.decode();
        } catch {}
      }
    };

    return Promise.all(Array.from({ length: concurrency }, () => runWorker()));
  }

  const preloadKey = React.useMemo(
    () => normalizedItems.map((i) => (i.kind === 'image' ? (i as any).src ?? '' : '')).join('|'),
    [normalizedItems]
  );

  const didPreloadKeyRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (fsLazyImagesEnabled) return;
    if (showFullscreenModal) return;

    if (didPreloadKeyRef.current === preloadKey) return;
    didPreloadKeyRef.current = preloadKey;

    const run = () => {
      void preloadFsImagesIdle(normalizedItems, 3);
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(run, { timeout: 2000 });
    } else {
      setTimeout(run, 250);
    }
  }, [fsLazyImagesEnabled, showFullscreenModal, preloadKey, normalizedItems]);

  const core = useOptionalGalleryCore();

  React.useEffect(() => {
    if (!core) return;
    if (!showFullscreenModal) return;
    if (!fsSub) return;
    if (!canonicalLen) return;

    const emitVisible = (v: number) => {
      if (typeof v !== 'number') return;
      const c = canonicalIndexOf(v, canonicalLen);
      core.notifyFsVisibleIndex(c);
    };

    const cur = fsSub.get?.();
    if (typeof cur === 'number') emitVisible(cur);

    if (typeof fsSub.subscribe === 'function') {
      const off = fsSub.subscribe((v: number) => emitVisible(v));
      return () => off?.();
    }

    if (typeof fsSub.onEvent === 'function') {
      const off = fsSub.onEvent((evt: any) => {
        if (typeof evt === 'number') emitVisible(evt);
        else if (typeof evt?.index === 'number') emitVisible(evt.index);
        else {
          const next = fsSub.get?.();
          if (typeof next === 'number') emitVisible(next);
        }
      });
      return () => off?.();
    }
  }, [core, showFullscreenModal, fsSub, canonicalLen]);

  const preloadFsImageAtIndex = React.useCallback(
    async (canonicalIndex: number) => {
      const item = normalizedItems[canonicalIndex];
      if (!item || item.kind !== 'image') return;

      fsBaseVisibleImagesRef.current.add(canonicalIndex);
      fsAllowedImagesRef.current.add(canonicalIndex);
      notifyFsLazyImages();

      const key = mediaKey(item);
      if (fsDecodedImagesRef.current.has(key)) return;

      const img = new Image();
      img.decoding = 'async';
      (img as any).fetchPriority = 'high';
      img.src = (item as any).src;
      img.srcset = (item as any).srcSet ?? '';
      img.sizes = (item as any).sizes ?? '';

      try {
        await img.decode();
        fsDecodedImagesRef.current.add(key);
      } catch {}
    },
    [normalizedItems]
  );

  const preloadFsVideoAtIndex = React.useCallback(
    async (canonicalIndex: number) => {
      const item = normalizedItems[canonicalIndex];
      if (!item || item.kind !== 'video') return;

      const key = mediaKey(item);
      if (fsPreloadedVideosRef.current.has(key)) return;
      fsPreloadedVideosRef.current.add(key);

      const poster = (item as any).poster ?? (item as any).thumbSrc ?? null;

      if (poster) {
        try {
          const img = new Image();
          img.decoding = 'async';
          (img as any).fetchPriority = 'high';
          img.src = poster;
          await img.decode().catch(() => {});
        } catch {}
      }

      const mp4 =
        (item as any).src ||
        (item as any).videoSrc ||
        (item as any).sources?.[0]?.src ||
        null;

      if (typeof mp4 === 'string' && mp4) {
        try {
          const v = document.createElement('video');
          if (shouldUseAnonymousCrossOrigin(mp4)) {
            v.crossOrigin = 'anonymous';
          }
          v.preload = 'auto';
          v.muted = true;
          v.playsInline = true;
          if (poster) v.poster = poster;
          v.src = mp4;

          v.load();

          setTimeout(() => {
            try {
              v.removeAttribute('src');
              v.load();
            } catch {}
          }, 1500);
        } catch {}
      }

      fsForceMountVideosRef.current.add(canonicalIndex);
      fsAllowedVideosRef.current.add(canonicalIndex);
      notifyFsLazyVideos();

    },
    [normalizedItems]
  );

  React.useEffect(() => {
    if (!showFullscreenModal) return;
    if (!canonicalLen) return;
    if (!fsLazyImagesEnabled && !fsLazyVideosEnabled) return;

    const current = fsSub.get?.();
    const active =
      typeof current === "number" && Number.isFinite(current)
        ? current
        : latchedIntroIndex;
    const canonicalIndex = canonicalIndexOf(active, canonicalLen);

    if (fsLazyImagesEnabled) void preloadFsImageAtIndex(canonicalIndex);
    if (fsLazyVideosEnabled) void preloadFsVideoAtIndex(canonicalIndex);
  }, [
    canonicalLen,
    fsLazyImagesEnabled,
    fsLazyVideosEnabled,
    fsSub,
    latchedIntroIndex,
    preloadFsImageAtIndex,
    preloadFsVideoAtIndex,
    showFullscreenModal,
  ]);

  React.useEffect(() => {
    if (!core) return;

    const shouldListen = fsLazyImagesEnabled || fsLazyVideosEnabled;
    if (!shouldListen) return;

    const off = core.baseVisibleSub.subscribe((evt) => {
      const idx = evt?.index;
      if (typeof idx !== 'number') return;
      if (!canonicalLen) return;

      const c = canonicalIndexOf(idx, canonicalLen);

      if (fsLazyImagesEnabled) void preloadFsImageAtIndex(c);
      if (fsLazyVideosEnabled) void preloadFsVideoAtIndex(c);
    });

    return () => off?.();
  }, [
    core,
    fsLazyImagesEnabled,
    fsLazyVideosEnabled,
    preloadFsImageAtIndex,
    preloadFsVideoAtIndex,
  ]);

  const fullscreenThumbnailPosition = fullscreenThumbnailSlot?.position ?? null;
  const fullscreenLayoutDirection =
    fullscreenThumbnailPosition === 'left'
      ? 'row-reverse'
      : fullscreenThumbnailPosition === 'right'
      ? 'row'
      : fullscreenThumbnailPosition === 'top'
      ? 'column-reverse'
      : 'column';
  const fullscreenThumbnailSlotBaseStyle =
    fullscreenThumbnailSlotLayoutStyle(fullscreenThumbnailSlot?.style);
  const cellCount = normalizedItems.length;
  const dialogHasCaptionPane =
    fullscreenDialogEnabled &&
    (showFsEntryOverlayMount || showFsCaptionOverlayMount);
  const dialogCaptionPlacement = showFsEntryOverlayMount
    ? resolveFsCaptionPlacement(
        entriesObject.overlay?.placement,
        entriesObject.overlay?.breakpoint,
        windowSize.width
      )
    : showFsCaptionOverlayMount
    ? resolveFsCaptionPlacement(
        fs.caption?.placement,
        fs.caption?.breakpoint,
        windowSize.width
      )
    : null;
  const dialogCaptionIsSidePlacement =
    isFullscreenDialogSidePlacement(dialogCaptionPlacement);
  const dialogCaptionWidth = resolveDialogPaneLengthFromResponsive(
    showFsEntryOverlayMount ? entriesObject.overlay?.width : fs.caption?.width,
    380,
    windowSize.width
  );
  const dialogCaptionHeight = resolveDialogPaneLengthFromResponsive(
    showFsEntryOverlayMount ? entriesObject.overlay?.height : fs.caption?.height,
    240,
    windowSize.width
  );
  const dialogCaptionPaneSizeStyle: React.CSSProperties =
    dialogCaptionIsSidePlacement
      ? {
          width: dialogCaptionWidth,
          flexBasis: dialogCaptionWidth,
          maxWidth: FULLSCREEN_DIALOG_CAPTION_MAX_INLINE_SIZE,
        }
      : {
          height: dialogCaptionHeight,
          flexBasis: dialogCaptionHeight,
        };
  const fullscreenDialogOverlayWrapperStyle:
    | React.CSSProperties
    | undefined = fullscreenDialogEnabled
    ? {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'auto',
      }
    : undefined;
  const requestFullscreenDialogClose = React.useCallback(() => {
    if (!fullscreenCloseEnabled) return;

    const requestClose = requestFsCloseRef.current;
	    if (requestClose) {
	      requestClose();
	      return;
	    }

    setShowFullscreenModal(false);
  }, [fullscreenCloseEnabled, requestFsCloseRef, setShowFullscreenModal]);
  const backdropPointerDownRef = React.useRef(false);
  const backdropPointerUpRef = React.useRef(false);
  const isFullscreenDialogBackdropTarget = React.useCallback(
    (target: EventTarget | null) =>
      target instanceof HTMLElement &&
      target.getAttribute("data-rmg-fs-dialog-backdrop") === "true",
    []
  );
  const resetFullscreenDialogBackdropPress = React.useCallback(() => {
    backdropPointerDownRef.current = false;
    backdropPointerUpRef.current = false;
  }, []);
  const handleFullscreenDialogBackdropPointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!fullscreenDialogEnabled || !fullscreenCloseEnabled || closingModal) {
        resetFullscreenDialogBackdropPress();
        return;
      }

      if (event.target === event.currentTarget) {
        backdropPointerDownRef.current = true;
        backdropPointerUpRef.current = false;
        return;
      }

      if (isFullscreenDialogBackdropTarget(event.target)) return;
      resetFullscreenDialogBackdropPress();
    },
    [
      closingModal,
      fullscreenCloseEnabled,
      fullscreenDialogEnabled,
      isFullscreenDialogBackdropTarget,
      resetFullscreenDialogBackdropPress,
    ]
  );
  const handleFullscreenDialogBackdropPointerUp = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!backdropPointerDownRef.current) {
        backdropPointerUpRef.current = false;
        return;
      }

      if (event.target === event.currentTarget) {
        backdropPointerUpRef.current = true;
        return;
      }

      if (isFullscreenDialogBackdropTarget(event.target)) return;
      resetFullscreenDialogBackdropPress();
    },
    [isFullscreenDialogBackdropTarget, resetFullscreenDialogBackdropPress]
  );
  const handleFullscreenDialogBackdropClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!fullscreenDialogEnabled || !fullscreenCloseEnabled || closingModal) return;
      if (event.target !== event.currentTarget) return;
      if (!backdropPointerDownRef.current || !backdropPointerUpRef.current) {
        resetFullscreenDialogBackdropPress();
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      resetFullscreenDialogBackdropPress();
      requestFullscreenDialogClose();
    },
    [
      closingModal,
      fullscreenCloseEnabled,
      fullscreenDialogEnabled,
      requestFullscreenDialogClose,
      resetFullscreenDialogBackdropPress,
    ]
  );
  const fullscreenDialogCloseNode = fullscreenCloseEnabled ? (
    <button
      ref={closeButtonRef as any}
      type="button"
      aria-label="Close"
      data-rmg-fs-dialog-close="true"
      onClick={(event) => {
        event.stopPropagation();
        requestFullscreenDialogClose();
      }}
      className={[
        fs?.controls?.close?.className ?? "",
        fullscreenDialogVisible && !closingModal ? styles.open : "",
      ].filter(Boolean).join(" ")}
      style={{
        appearance: 'none',
        border: 0,
        margin: 0,
        padding: 0,
        width: 36,
        height: 36,
        display: 'grid',
        placeItems: 'center',
        borderRadius: 999,
        background: 'transparent',
        color: 'inherit',
        cursor: 'pointer',
        transition: `opacity ${activeDialogOpacityDurationMs}ms ${activeDialogOpacityEasing}`,
        ...(fs?.controls?.close?.style ?? {}),
        position: 'static',
        flex: '0 0 auto',
        zIndex: FULLSCREEN_TOP_CHROME_Z_INDEX,
        opacity: fullscreenDialogIsVisible ? 1 : 0,
        pointerEvents:
          fullscreenDialogIsVisible ? 'auto' : 'none',
      }}
    >
      {typeof fs?.controls?.close?.render === 'function'
        ? fs.controls.close.render()
        : <DefaultCloseIcon />}
    </button>
  ) : null;
  const fullscreenDialogPaneRadiusStyles =
    createFullscreenDialogPaneRadiusStyles(
      dialogCaptionPlacement,
      dialogHasCaptionPane,
      dialogHeaderOwnsTopCorners(
        fullscreenDialogCloseNode,
        fullscreenDialog?.header?.style
      ),
      fullscreenDialogMediaPaneHidden
    );
  const fullscreenSliderNode = shouldMountFullscreenView ? (
    <FullscreenSlider
      sub={fsSub}
      ref={fullscreenSliderApi}
      cellCount={cellCount}
      slideIndex={slideIndex}
      isClick={isZoomClick}
      isZoomed={isZoomed}
      windowSize={windowSize}
      show={showFullscreenModal}
      handleZoomToggle={handleZoomToggle}
      imageRefs={imageRefs.current}
      cells={cells}
      isPinching={isPinching}
      scale={scale}
      isTouchPinching={isTouchPinching}
      showFullscreenSlider={showFullscreenSlider}
      isZooming={isZooming}
      plyrRefs={
        normalizedItems.length > 1 ? wrappedModePlyrRefs : singleModePlyrRefs
      }
      plyrRef={
        normalizedItems.length > 1 ? wrappedModePlyrRefs : singleModePlyrRefs
      }
      closingModal={closingModal}
      counterRef={counterRef}
      leftChevronRef={leftChevronRef}
      rightChevronRef={rightChevronRef}
      overlayDivRef={overlayDivRef}
      direction={direction}
      isWrapping={isWrappingForFullscreen}
      sliderGap={fullscreenSliderGap}
      sliderDuration={sliderDuration}
      sliderFriction={sliderFriction}
      skipSnaps={sliderSkipSnaps}
      strictSnaps={sliderStrictSnaps}
      virtualization={fs.slider?.virtualization}
      suppressLoopRef={suppressLoopRef}
      fadeOpening={fsFadeOpening}
      introFade={introFade}
      controlsFade={!!fs.effects?.crossfade?.controls}
      dragFade={!!fs.effects?.crossfade?.drag}
      wheelFade={fs.effects?.crossfade?.wheel}
      slideFadeDuration={fs.effects?.crossfade?.durationMs}
      slideFadeEasing={fs.effects?.crossfade?.easing}
      normalizedItems={normalizedItems}
      renderChildren={renderFullscreenTrackChildren}
      renderCrossfadeSlides={renderFullscreenCrossfadeWindow}
      introDuration={introDuration}
      introEasing={introEasing}
      resetAllZoomDom={() => resetZoomForSlideNavigation()}
      requestFsCloseRef={requestFsCloseRef}
      onCloseDragLayerChange={setCloseDragLayerActive}
      introMethod={latchedIntroMethod}
      chromeHidden={dialogHidden}
      fs={fs}
      chromeStyles={styles}
    />
  ) : null;
  const fullscreenThumbnailSlotNode = shouldMountFullscreenView && fullscreenThumbnailSlot ? (
    <div
      ref={setFullscreenThumbnailMountEl}
	      style={{
	        flex: '0 0 auto',
	        position: 'relative',
	        zIndex: fullscreenCloseMediaLayerActive
	          ? FULLSCREEN_THUMBNAIL_SLOT_Z_INDEX - 1
	          : FULLSCREEN_THUMBNAIL_SLOT_Z_INDEX,
	        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
        backgroundColor: 'transparent',
        ...(fullscreenThumbnailSlotBaseStyle || {}),
      }}
    />
  ) : null;
  const fsCaptionOverlayNode = shouldMountFullscreenView && showFsCaptionOverlayMount ? (
    <FsCaptionOverlay
      enabled={showFsCaptionOverlayMount}
      fsSub={fsSub}
      items={normalizedItems}
      caption={fs.caption}
      isZoomed={isZoomed}
      captionZoomMotion={captionZoomMotion}
      viewportWidth={windowSize.width}
      viewportHeight={windowSize.height}
      wrapperBaseStyle={fullscreenDialogOverlayWrapperStyle}
      interactive={!!showFullscreenSlider}
      closing={!!closingModal}
      resolveFsCaptionPlacement={resolveFsCaptionPlacement}
    />
  ) : null;
  const showFsEntryOverlaySurface =
    showFsEntryOverlayMount && typeof entriesObject.render?.overlay === 'function';
  const fsEntryOverlayNode = shouldMountFullscreenView && showFsEntryOverlaySurface ? (
    <FsEntryOverlay
      enabled={showFsEntryOverlaySurface}
      fsSub={fsSub}
      entriesObject={entriesObject}
      entryMapRef={entryMapRef}
      syncFullscreenSourceFromIndex={syncFullscreenSourceFromIndex}
      resetAllZoomDom={resetZoomForSlideChange}
      wrapperBaseStyle={fullscreenDialogOverlayWrapperStyle}
      closing={!!closingModal}
      overlayZoomMotion={entryOverlayZoomMotion}
      viewportWidth={windowSize.width}
      viewportHeight={windowSize.height}
      resolveFsCaptionPlacement={resolveFsCaptionPlacement}
    />
  ) : null;
  const promoteRootAboveIntroMedia =
    fs.overlaysAboveIntroMedia !== false &&
    (showFsCaptionOverlayMount || showFsEntryOverlaySurface);

  return (
    <>
      {fsEnabled && shouldMountFullscreenView && (
        <FullscreenModal
          fsSub={fsSub}
          open={showFullscreenModal}
          onClose={() => setShowFullscreenModal(false)}
          isClick={isClick}
          isAnimating={isAnimatingRef}
          overlayDivRef={overlayDivRef}
          cells={cells}
          setShowFullscreenSlider={setShowFullscreenSlider}
          cellCount={cellCount}
          slides={slidesForFullscreen}
          slider={sliderForFullscreen}
          wrappedItems={wrappedItems}
          setClosingModal={setClosingModal}
          closeButtonRef={closeButtonRef}
          counterRef={counterRef}
          leftChevronRef={leftChevronRef}
          rightChevronRef={rightChevronRef}
          centerSlider={centerSliderForFullscreen}
          setSliderIndex={setSliderIndexForFullscreen}
          onForceResetZoom={() => onForceResetZoom()}
          prepareZoomOutForClose={prepareZoomOutForClose}
          isZoomed={isZoomed}
          layout={layout}
          expandableImageRefs={expandableImageRefs}
          resolveLayoutlessTarget={resolveLayoutlessTarget}
          entryMapRef={entryMapRef}
          entryRootRef={entryRootRef}
          entryMediaLayout={entryMediaLayout}
          introFade={introFade}
          introDuration={introDuration}
          introEasing={introEasing}
          requestFsCloseRef={requestFsCloseRef}
          cancelFsCloseRef={cancelFsCloseRef}
          fs={fs}
          styles={styles}
          syncFullscreenSourceFromIndex={syncFullscreenSourceFromIndex}
          baseZ={fsZRef.current}
          rootRef={fullscreenRootRef}
          promoteRootAboveIntroMedia={promoteRootAboveIntroMedia}
          introMethod={latchedIntroMethod}
          setLatchedIntroMethod={setLatchedIntroMethod}
          latchedIntroIndex={latchedIntroIndex}
          renderCloseButton={!fullscreenDialogEnabled}
        >
	          <div
	            data-rmg-fs-dialog-backdrop={fullscreenDialogEnabled ? "true" : undefined}
	            onPointerDown={
	              fullscreenDialogEnabled
	                ? handleFullscreenDialogBackdropPointerDown
	                : undefined
	            }
	            onPointerUp={
	              fullscreenDialogEnabled
	                ? handleFullscreenDialogBackdropPointerUp
	                : undefined
	            }
	            onPointerCancel={
	              fullscreenDialogEnabled
	                ? resetFullscreenDialogBackdropPress
	                : undefined
	            }
	            onClick={fullscreenDialogEnabled ? handleFullscreenDialogBackdropClick : undefined}
	            style={{
	              position: 'absolute',
	              inset: 0,
	              display: 'flex',
	              flexDirection: fullscreenLayoutDirection,
	            }}
	          >
	            <div
	              data-rmg-fs-dialog-backdrop={fullscreenDialogEnabled ? "true" : undefined}
	              onPointerDown={
	                fullscreenDialogEnabled
	                  ? handleFullscreenDialogBackdropPointerDown
	                  : undefined
	              }
	              onPointerUp={
	                fullscreenDialogEnabled
	                  ? handleFullscreenDialogBackdropPointerUp
	                  : undefined
	              }
	              onPointerCancel={
	                fullscreenDialogEnabled
	                  ? resetFullscreenDialogBackdropPress
	                  : undefined
	              }
	              onClick={fullscreenDialogEnabled ? handleFullscreenDialogBackdropClick : undefined}
	              style={{
	                flex: '1 1 auto',
	                position: 'relative',
	                minWidth: 0,
	                minHeight: 0,
	                ...(fullscreenDialogEnabled
	                  ? {
	                      display: 'flex',
	                      alignItems: 'center',
	                      justifyContent: 'center',
	                      overflow: 'hidden',
	                    }
	                  : null),
	                ...(fullscreenCloseMediaLayerStyle ?? {}),
	              }}
	            >
              {fullscreenDialogEnabled ? (
                <div
                  data-rmg-fs-dialog="true"
                  data-rmg-fs-dialog-placement={dialogCaptionPlacement ?? 'bottom'}
                  className={fullscreenDialog?.className}
                  style={{
                    position: 'relative',
                    display: 'flex',
	                    flexDirection: 'column',
	                    width: '100%',
	                    height: '100%',
	                    minWidth: 0,
	                    minHeight: 0,
	                    overflow: 'hidden',
	                    ...(fullscreenDialog?.style ?? {}),
	                    ...(fullscreenDialogMotionStyle ?? {}),
	                    ...(fullscreenCloseMediaLayerStyle
	                      ? {
	                          ...fullscreenCloseMediaLayerStyle,
	                          overflow: fullscreenDialog?.style?.overflow ?? 'visible',
	                        }
	                      : null),
	                  }}
                >
                  {fullscreenDialogCloseNode ? (
                    <div
                      data-rmg-fs-dialog-header="true"
                      className={fullscreenDialog?.header?.className}
                      style={{
                        flex: '0 0 auto',
                        position: 'relative',
                        zIndex: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        minHeight: 56,
                        padding: 12,
                        pointerEvents: 'none',
                        ...fullscreenDialogPaneRadiusStyles.header,
                        ...(fullscreenDialog?.header?.style ?? {}),
                      }}
                    >
                      {fullscreenDialogCloseNode}
                    </div>
                  ) : null}
                  <div
                    data-rmg-fs-dialog-body="true"
                    style={{
                      flex: '1 1 auto',
	                      position: 'relative',
	                      display: 'flex',
	                      flexDirection:
	                        fullscreenDialogFlexDirection(dialogCaptionPlacement),
	                      minWidth: 0,
	                      minHeight: 0,
	                      overflow: 'hidden',
	                      ...(fullscreenCloseMediaLayerStyle ?? {}),
	                    }}
	                  >
	                    <div
	                      data-rmg-fs-dialog-media="true"
	                      className={fullscreenDialog?.media?.className}
	                      style={{
	                        flex: '1 1 auto',
	                        position: 'relative',
	                        minWidth:
	                          dialogHasCaptionPane && dialogCaptionIsSidePlacement
	                            ? FULLSCREEN_DIALOG_MEDIA_MIN_INLINE_SIZE
	                            : 0,
	                        minHeight: 0,
	                        overflow: 'hidden',
	                        ...fullscreenDialogPaneRadiusStyles.media,
	                        ...(fullscreenDialog?.media?.style ?? {}),
	                        ...(fullscreenCloseMediaLayerStyle ?? {}),
	                      }}
	                    >
                      {fullscreenSliderNode}
                    </div>

                    {dialogHasCaptionPane ? (
                      <div
                        data-rmg-fs-dialog-caption="true"
                        className={fullscreenDialog?.caption?.className}
                        style={{
                          flex: '0 0 auto',
                          position: 'relative',
                          minWidth: 0,
                          minHeight: 0,
                          overflow: 'hidden',
                          ...dialogCaptionPaneSizeStyle,
                          ...fullscreenDialogPaneRadiusStyles.caption,
                          ...(fullscreenDialog?.caption?.style ?? {}),
                        }}
                      >
                        {fsCaptionOverlayNode}
                        {fsEntryOverlayNode}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                fullscreenSliderNode
              )}
            </div>

            {fullscreenThumbnailSlotNode}
          </div>

          {!fullscreenDialogEnabled ? fsCaptionOverlayNode : null}
          {!fullscreenDialogEnabled ? fsEntryOverlayNode : null}
        </FullscreenModal>
      )}
    </>
  );
}

export default FullscreenRuntime;
