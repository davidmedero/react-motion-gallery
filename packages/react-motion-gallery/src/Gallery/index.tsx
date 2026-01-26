/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo, ReactNode, useImperativeHandle } from "react";
import FullscreenSlider, { FullscreenSliderHandle } from "./fullscreen/FullscreenSlider";
import FullscreenModal from "./fullscreen/FullscreenModal";
import Slider from './slider/Slider';
import styles from './index.module.css';
import type { APITypes } from "plyr-react";
import ThumbnailSlider from "./slider/thumbnails/ThumbnailSlider";
import createIndexChannel from "./slider/sliderSub";
import { createFullscreenSliderSub } from './fullscreen/fullscreenSliderSub';
import FullscreenThumbnailSlider from "./fullscreen/FullscreenThumbnailSlider";
import { createRoot } from 'react-dom/client';
import { ScrollBody, ScrollBodyType } from "./shared/motion/scrollBody";
import { AnimationsType } from "./shared/motion/animations";
import { ScrollBounds, ScrollBoundsType } from "./shared/motion/scrollBounds";
import { Vector1D, Vector1DType } from "./shared/motion/vector1d";
import { GridLayout } from "./grid/GridLayout";
import { MasonryLayout } from "./masonry/MasonryLayout";
import { BREAKPOINT_MAP, BreakpointMap, resolveNumberFromResponsive, resolvePositionFromResponsive } from "./shared/responsive";
import { DEFAULT_ENTRIES, EntriesOptions, EntryList, MediaEntryLink, SlideOwner } from "./entries";
import { useViewportWidth } from "./shared/hooks/useViewportWidth";
import { normalizeLoading } from "./shared/normalize/normalizeLoading";
import { normalizeIntro } from "./shared/normalize/normalizeIntro";
import { createGestureShield } from "./fullscreen/gestureShield";
import { useFsEntryOverlay } from "./entries/overlay/useFsEntryOverlay";
import { FsEntryOverlayMount } from "./entries/overlay/FsEntryOverlayMount";
import { buildMasonryChildren } from "./masonry/buildMasonryChildren";
import { baseFitSizeC, distance, midpoint } from "./zoomPan/core/utils";
import { findImgAtPoint, getPrimaryImgEl, readDataIndex } from "./zoomPan/core/dom";
import { zoomTo } from "./zoomPan/zoom/zoomTo";
import { handleZoomToggle } from "./zoomPan/zoom/handleZoomToggle";
import { rebuildPanBodiesFn } from "./zoomPan/core/rebuildPanBodies";
import { usePanRuntime } from "./zoomPan/pan";
import { forceResetZoom as forceResetZoomFn } from "./zoomPan/zoom/forceResetZoom";
import { resetZoomForSlideChange as resetZoomForSlideChangeFn } from "./zoomPan/zoom/resetZoomForSlideChange";
import { resetPanForScale1 as resetPanForScale1Fn } from "./zoomPan/pan/resetPanForScale1";
import { boundsForCurrent as boundsForCurrentFn } from "./zoomPan/core/boundsForCurrent";
import { useWrappedItemsAndRefs } from "./fullscreen/hooks/useWrappedItemsAndRefs";
import { useWindowSize } from "./shared/hooks/useWindowSize";
import { usePlyrProps } from "./video/usePlyrProps";
import { renderFullscreenSlides } from "./fullscreen/renderFullscreenSlides";
import { createSingleTransform, createWrappedTransform } from "./fullscreen/transforms";
import { useGlobalPinchZoom } from "./zoomPan/zoom/useGlobalPinchZoom";
import { MediaItem, toMediaItems } from "./shared/types/media";
import { ElementStyle } from "./shared/types/elements";
import { FsCaptionPlacement, FullscreenOptions } from "./fullscreen/types";
import { MasonryOptions } from "./masonry/types";
import { GridOptions } from "./grid/types";
import { SliderHandle, SliderOptions } from "./slider/types";
import { GalleryApi, IndexMode } from "./api/types";
import { DEFAULT_FULLSCREEN } from "./fullscreen/defaults";
import { DEFAULT_SLIDER } from "./slider/defaults";
import { DEFAULT_GRID } from "./grid/defaults";
import { DEFAULT_MASONRY } from "./masonry/defaults";
import { defaultPlayerStyle } from "./video/fullscreenPlayerStyle";
import { runFullscreenIntro } from "./fullscreen/fullscreenIntro";
import { PanAxis as Axis, PanAxisType as AxisType } from "./shared/types/axis";

function useOpenEpoch(open: boolean) {
  const [epoch, setEpoch] = useState(0);
  const prev = useRef(open);
  useEffect(() => {
    if (open && !prev.current) setEpoch(e => e + 1);
    prev.current = open;
  }, [open]);
  return epoch;
}

type Props = { 
  children?: ReactNode;
  fullscreen?: FullscreenOptions;
  slider?: SliderOptions;
  layout?: 'slider' | 'grid' | 'masonry' | 'entries';
  grid?: GridOptions;
  masonry?: MasonryOptions;
  entries?: EntriesOptions;
  breakpoints?: BreakpointMap;
  root?: ElementStyle;
  container?: ElementStyle;
};

const Gallery = React.forwardRef<GalleryApi, Props>(function Gallery({ 
  children,
  fullscreen,
  slider,
  layout = "slider",
  grid,
  masonry,
  entries,
  breakpoints,
  root,
  container,
}: Props, ref) {
  const indexChannel = useMemo(() => createIndexChannel(), [])
  const fsSub = useMemo(() => createFullscreenSliderSub(0), []);
  const [slideIndex, setSlideIndex] = useState(0);
  const isClick = useRef(false);
  const isZoomClick = useRef(false);
  const imageRefs = useRef<React.RefObject<HTMLDivElement | null>[]>([]);
  const [showFullscreenSlider, setShowFullscreenSlider] = useState(false);
  const fullscreenSliderApi = useRef<FullscreenSliderHandle>(null);
  const isZooming = useRef(false);
  const expandableImgRefs = useRef<any>([]);
  const overlayDivRef = useRef<HTMLDivElement | null>(null);
  const duplicateImgRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLElement | null>(null);
  const counterRef = useRef<HTMLElement | null>(null);
  const leftChevronRef = useRef<HTMLElement | null>(null);
  const rightChevronRef = useRef<HTMLElement | null>(null);
  const [showFullscreenModal, setShowFullscreenModal] = useState(false);
  const [wrappedItems, setWrappedItems] = useState<MediaItem[]>([]);
  const windowSize = useWindowSize();
  const scaleRef = useRef(1);
  const panRef   = useRef({ x: 0, y: 0 });
  const previousZoom = useRef({ x: 0, y: 0 });
  const sliderForFullscreen = useRef<HTMLDivElement | null>(null)
  const slidesForFullscreen = useRef<{ cells: { element: HTMLElement; index: number }[]; target: number }[]>([]);
  const visibleImagesForFullscreen = useRef<number>(1);
  const selectedIndexForFullscreen = useRef<number>(0);
  const sliderXForFullscreen = useRef<number>(0);
  const sliderVelocityForFullscreen = useRef<number>(0);
  const isWrappingForFullscreen = useRef<boolean>(false);
  const fsIndexRef = useRef<number>(fsSub.get());
  const [fsFadeOpening, setFsFadeOpening] = useState(false);
  const entryMapRef = useRef<MediaEntryLink[] | null>(null);
  const entryFlatIndexRef = useRef<number[][] | null>(null);
  const fsOwnersRef = useRef<SlideOwner[]>([]);
  const [closingModal, setClosingModal] = useState(false);
  const changingSlides = useRef(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const isZoomedRef = useRef(false);
  const currentImage = useRef<HTMLDivElement | null>(null);
  const aspectRatioRef = useRef(1);
  const axisRef = useRef<AxisType | null>(null);
  const pointerDownRef = useRef(false);
  const interactionModeRef = useRef<'idle' | 'drag' | 'wheel' | 'programmatic'>('idle');
  const locX = useRef<Vector1DType | null>(null);
  const locY = useRef<Vector1DType | null>(null);
  const prevX = useRef<Vector1DType | null>(null);
  const prevY = useRef<Vector1DType | null>(null);
  const offX = useRef<Vector1DType | null>(null);
  const offY = useRef<Vector1DType | null>(null);
  const tgtX = useRef<Vector1DType | null>(null);
  const tgtY = useRef<Vector1DType | null>(null);
  const sliderApiRef = useRef<SliderHandle>(null);
  const entrySliderRefs = useRef<(SliderHandle | null)[]>([]);
  const overlayCaptionRef = useRef<HTMLDivElement | null>(null);
  const overlayCaptionRootRef = useRef<ReturnType<typeof createRoot> | null>(null);
  const fsThumbContainerRef = useRef<HTMLDivElement | null>(null);
  const epoch = useOpenEpoch(showFullscreenModal);
  const [isReady, setIsReady] = useState(false);
  const suppressLoopRef = useRef(false);
  const shieldCleanupRef = React.useRef<null | (() => void)>(null);
  const shieldRef = useRef<ReturnType<typeof createGestureShield> | null>(null);
  const bodyX = useRef<ScrollBodyType | null>(null);
  const bodyY = useRef<ScrollBodyType | null>(null);
  const boundsX = useRef<ScrollBoundsType | null>(null);
  const boundsY = useRef<ScrollBoundsType | null>(null);
  const isAnimatingRef = useRef(false);
  const animRef = useRef<AnimationsType | null>(null);
  const wrappedModePlyrRefs = useRef<(APITypes | null)[]>([]);
  const singleModePlyrRefs  = useRef<(APITypes | null)[]>([]);
  const suppressNextClickRef = useRef(false);
  const cells = useRef<{ element: HTMLElement, index: number }[]>([]);
  const idSeqRef = useRef(0);
  type Cell = { id: string; node: React.ReactNode };
  const asArray = <T,>(x: T | T[]) => (Array.isArray(x) ? x : [x]);
  const newId = useCallback(() => `rmg-${++idSeqRef.current}`, []);

  function nodeFromMedia(m: MediaItem): React.ReactNode {
    if (m.kind === 'image') return <img src={m.src} alt={m.alt ?? ''} />;
    if (m.kind === 'video') {
      return <video src={m.src} controls preload="metadata" />;
    }
    return null;
  }

  const initialCells = useMemo<Cell[]>(() => {
    const kids = React.Children.toArray(children);
    if (kids.length > 0) return kids.map((n) => ({ id: newId(), node: n }));

    if (flattenedEntryMedia && flattenedEntryMedia.length && flattenedEntryMap) {
      const cells: Cell[] = [];
      const links: MediaEntryLink[] = [];

      flattenedEntryMedia.forEach((m, flatIdx) => {
        const link = flattenedEntryMap[flatIdx];
        if (!link) return;

        const entry = entriesObject.items?.[link.entryIndex];
        if (!entry) return;

        const node =
          typeof entriesObject.render?.media === 'function'
            ? entriesObject.render.media({
                entry,
                entryIndex: link.entryIndex,
                media: m,
                mediaIndex: link.mediaIndex,
              })
            : nodeFromMedia(m);

        cells.push({ id: newId(), node });
        links.push(link);
      });

      entryMapRef.current = links;
      return cells;
    }

    if (normalizedItems.length) {
      return normalizedItems.map((mi) => ({ id: newId(), node: nodeFromMedia(mi) }));
    }

    return [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cellsRef = React.useRef<Cell[]>(initialCells);
  const [cellsState, setCellsState] = React.useState<Cell[]>(initialCells);

  const effectiveBreakpoints = useMemo(
    () => ({ ...BREAKPOINT_MAP, ...(breakpoints || {}) }),
    [breakpoints]
  );

  const fs = {
    ...DEFAULT_FULLSCREEN,
    ...(fullscreen ?? {}),
    slider: { ...DEFAULT_FULLSCREEN.slider, ...(fullscreen?.slider ?? {}) },
    zoom: { ...DEFAULT_FULLSCREEN.zoom, ...(fullscreen?.zoom ?? {}) },
    effects: { ...DEFAULT_FULLSCREEN.effects, ...(fullscreen?.effects ?? {}) },
    controls: { ...(fullscreen?.controls ?? {}) },
  };

  const sliderObject = {
    ...DEFAULT_SLIDER,
    ...(slider ?? {}),
    layout: { ...DEFAULT_SLIDER.layout, ...(slider?.layout ?? {}) },
    direction: { ...DEFAULT_SLIDER.direction, ...(slider?.direction ?? {}) },
    align: slider?.align ?? DEFAULT_SLIDER.align,
    scroll: { ...DEFAULT_SLIDER.scroll, ...(slider?.scroll ?? {}) },
    controls: {
    ...DEFAULT_SLIDER.controls,
    ...(slider?.controls ?? {}),
      arrows: {
        ...DEFAULT_SLIDER.controls.arrows,
        ...(slider?.controls?.arrows ?? {}),
        arrow: {
          ...DEFAULT_SLIDER.controls.arrows.arrow,
          ...(slider?.controls?.arrows?.arrow ?? {}),
        },
        prev: {
          ...DEFAULT_SLIDER.controls.arrows.prev,
          ...(slider?.controls?.arrows?.prev ?? {}),
        },
        next: {
          ...DEFAULT_SLIDER.controls.arrows.next,
          ...(slider?.controls?.arrows?.next ?? {}),
        }
      },
      dots: {
        ...DEFAULT_SLIDER.controls.dots,
        ...(slider?.controls?.dots ?? {}),
        root: {
          ...DEFAULT_SLIDER.controls.dots.root,
          ...(slider?.controls?.dots?.root ?? {}),
        },
        dot: {
          ...DEFAULT_SLIDER.controls.dots.dot,
          ...(slider?.controls?.dots?.dot ?? {}),
        },
      },
      progress: {
        ...DEFAULT_SLIDER.controls.progress,
        ...(slider?.controls?.progress ?? {}),
        root: {
          ...DEFAULT_SLIDER.controls.progress.root,
          ...(slider?.controls?.progress?.root ?? {}),
        },
        bar: {
          ...DEFAULT_SLIDER.controls.progress.bar,
          ...(slider?.controls?.progress?.bar ?? {}),
        },
      },
      ripple: {
        ...DEFAULT_SLIDER.controls.ripple,
        ...(slider?.controls?.ripple ?? {}),
      },
    },
    thumbnails: { ...DEFAULT_SLIDER.thumbnails, ...(slider?.thumbnails ?? {}) },
    lazyLoad: slider?.lazyLoad ?? DEFAULT_SLIDER.lazyLoad,
    auto: {
    ...DEFAULT_SLIDER.auto,
    ...(slider?.auto ?? {}),
      play: { ...DEFAULT_SLIDER.auto.play, ...(slider?.auto?.play ?? {}) },
      scroll: { ...DEFAULT_SLIDER.auto.scroll, ...(slider?.auto?.scroll ?? {}) },
    },
    motion: { ...DEFAULT_SLIDER.motion, ...(slider?.motion ?? {}) }
  };

  const gridObject: GridOptions = {
    ...grid,
    minColumnWidth: grid?.minColumnWidth ?? DEFAULT_GRID.minColumnWidth,
    gap: grid?.gap ?? DEFAULT_GRID.gap,
  };

  const masonryObject: MasonryOptions = {
    ...masonry,
    placement: masonry?.placement ?? DEFAULT_MASONRY.placement,
  };

  const entriesObject: EntriesOptions = {
    ...entries,
    mediaLayout: entries?.mediaLayout ?? DEFAULT_ENTRIES.mediaLayout,
  };

  const { flattenedEntryMedia, flattenedEntryMap } = useMemo(() => {
    if (!entriesObject.items || entriesObject.items.length === 0) {
      entryFlatIndexRef.current = null;
      fsOwnersRef.current = [];
      return {
        flattenedEntryMedia: null as MediaItem[] | null,
        flattenedEntryMap: null as MediaEntryLink[] | null,
      };
    }

    const media: MediaItem[] = [];
    const map: MediaEntryLink[] = [];
    const indexByEntry: number[][] = [];
    const owners: SlideOwner[] = [];

    entriesObject.items.forEach((ent, rIdx) => {
      indexByEntry[rIdx] = [];
      (ent.media ?? []).forEach((m, mIdx) => {
        const flatIndex = media.length;
        media.push(m);
        map.push({ entryIndex: rIdx, mediaIndex: mIdx });

        owners.push({ entryIndex: rIdx });
        indexByEntry[rIdx][mIdx] = flatIndex;
      });
    });

    entryFlatIndexRef.current = indexByEntry;
    fsOwnersRef.current = owners;

    return { flattenedEntryMedia: media, flattenedEntryMap: map };
  }, [entries]);

  const isStringArray = (v: unknown): v is string[] =>
    Array.isArray(v) && v.every((x) => typeof x === "string");

  type FullscreenItemsInput = MediaItem[] | string[];

  const normalizeFsItems = (v: FullscreenItemsInput | undefined): MediaItem[] => {
    if (!v || !v.length) return [];
    return isStringArray(v) ? toMediaItems(v) : v;
  };

  const [normalizedItems, setNormalizedItems] = useState<MediaItem[]>(() => {
    const fs = normalizeFsItems(fullscreen?.items);
    if (fs.length) return fs;
    if (flattenedEntryMedia?.length) return flattenedEntryMedia;
    return [];
  });

  function usePredecodeImages(urls: string[], enabled: boolean): boolean {
    const [ready, setReady] = useState(
      !enabled || urls.length === 0
    );

    useEffect(() => {
      if (!enabled || !urls.length) {
        setReady(true);
        return;
      }

      let cancelled = false;
      setReady(false);

      const decodeUrl = (url: string) =>
        new Promise<void>((resolve) => {
          const img = new Image() as HTMLImageElement;
          img.src = url;

          const hasDecode =
            typeof (img as any).decode === 'function';

          if (hasDecode) {
            (img as any)
              .decode()
              .catch(() => {})
              .finally(() => {
                if (!cancelled) resolve();
              });
          } else {
            if (img.complete) {
              if (!cancelled) resolve();
              return;
            }

            const done = () => {
              img.onload = null;
              img.onerror = null;
              if (!cancelled) resolve();
            };

            img.onload = done;
            img.onerror = done;
          }
        });

      (async () => {
        for (const url of urls) {
          if (cancelled) break;
          await decodeUrl(url);
        }
        if (!cancelled) {
          setReady(true);
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [enabled, urls]);

    return ready;
  }

  const fullscreenImageUrls = useMemo(
    () => normalizedItems.filter(m => m.kind === 'image').map(m => m.src),
    [normalizedItems]
  );

  usePredecodeImages(
    fullscreenImageUrls,
    fs.enabled
  );

  const sliderImageUrls = useMemo(
    () => normalizedItems
      .filter(m => m.kind === 'image')
      .map(m => m.src),
    [normalizedItems]
  );

  const sliderImagesReady = usePredecodeImages(
    sliderImageUrls,
    sliderImageUrls.length > 0
  );

  function syncFullscreenSourceFromIndex(nextIndex: number) {
    fsIndexRef.current = nextIndex;

    if (layout === 'entries' && entriesObject.items?.length && fsOwnersRef.current.length) {
      const owner = fsOwnersRef.current[nextIndex];
      const entryHandle = owner ? entrySliderRefs.current[owner.entryIndex] : null;
      const internals = entryHandle?.getInternals?.();
      if (!internals) return;

      sliderForFullscreen.current         = internals.slider.current;
      slidesForFullscreen.current         = internals.slides.current;
      visibleImagesForFullscreen.current  = internals.visibleImages.current;
      selectedIndexForFullscreen.current  = internals.selectedIndex.current;
      sliderXForFullscreen.current        = internals.sliderX.current;
      sliderVelocityForFullscreen.current = internals.sliderVelocity.current;
      isWrappingForFullscreen.current     = internals.isWrapping.current;
      return;
    }

    const internals = sliderApiRef.current?.getInternals?.();
    console.log('internals', internals)
    if (!internals) return;

    sliderForFullscreen.current         = internals.slider.current;
    slidesForFullscreen.current         = internals.slides.current;
    visibleImagesForFullscreen.current  = internals.visibleImages.current;
    selectedIndexForFullscreen.current  = internals.selectedIndex.current;
    sliderXForFullscreen.current        = internals.sliderX.current;
    sliderVelocityForFullscreen.current = internals.sliderVelocity.current;
    isWrappingForFullscreen.current     = internals.isWrapping.current;
  }

  useEffect(() => {
    if (!showFullscreenModal) return;

    const start = fsSub.get();
    fsIndexRef.current = start;

    syncFullscreenSourceFromIndex(start);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFullscreenModal, fsSub]);

  const { setMountEl: setFsEntryOverlayMountEl, setOpacity: setFsEntryOverlayOpacity } = useFsEntryOverlay({
    enabled: !!showFullscreenModal && layout === 'entries',
    fsSub,
    entriesObject,
    entryMapRef,
    syncFullscreenSourceFromIndex,
    resetAllZoomDom: resetZoomForSlideChange,
    closing: !!closingModal
  });

  const setScale = useCallback((newScale: number) => {
    scaleRef.current = newScale;
    const prev = isZoomedRef.current;
    const next = newScale > 1.01;
    if (next !== prev) {
      isZoomedRef.current = next;
      setIsZoomed(next);
    }
  }, []);

  const attachEntrySliderRef = useCallback(
    (entryIndex: number) =>
      (instance: SliderHandle | null) => {
        entrySliderRefs.current[entryIndex] = instance;
      },
    []
  );

  function resolveFsCaptionPlacement(
    placement: FsCaptionPlacement | undefined,
    breakpoint: number | undefined,
    viewportWidth: number
  ): FsCaptionPlacement | null {
    if (!placement) return null;

    if (breakpoint != null && viewportWidth < breakpoint) {
      return 'bottom';
    }
    return placement;
  }

  type AnyElement = React.ReactElement<
    Record<string, any>,
    string | React.JSXElementConstructor<any>
  >;

  function isForwardRefType(t: any): t is { $$typeof: symbol; render: (p: any, r: any) => React.ReactNode } {
    return t && typeof t === 'object' && 'render' in t;
  }

  function cellsToMediaItems(next: Cell[]): MediaItem[] {
    const extract = (node: React.ReactNode): MediaItem | null => {
      if (!React.isValidElement(node)) return null;

      const n = node as AnyElement;
      const p = (n.props ?? {}) as Record<string, any>;

      const keyStr = String(n.key ?? "");
      const decodedKey = keyStr.replace(/=2/g, ":").replace(/=0/g, "=");
      const cleanedKey = decodedKey.replace(/^\.\$/, "");

      if (typeof n.type === "string" && n.type.toLowerCase() === "img") {
        const src = p.src ?? "";
        if (!src) return null;
        return { kind: "image", src, alt: p.alt ?? "" };
      }

      const videoMatch = cleanedKey.match(/https?:\/\/[^\s'")]+?\.(mp4|webm|mov|m4v)(\?|#|$)/i);
      if (videoMatch) {
        return { kind: "video", src: videoMatch[0], alt: p.alt ?? "", thumb: p.src ?? "" };
      }

      if (typeof n.type === "string" && n.type.toLowerCase() === "video") {
        const src = p.src ?? "";
        if (!src) return null;
        return { kind: "video", src, alt: p.alt ?? "", thumb: p.thumb ?? p.poster ?? "" };
      }

      const t = n.type;

      if (isForwardRefType(t)) {
        try { return extract(t.render(p, null)); } catch {}
      }

      if (typeof t === "function" && !(t as any).prototype?.isReactComponent) {
        try { return extract((t as (props: any) => React.ReactNode)(p)); } catch {}
      }

      if (p.children) {
        for (const child of React.Children.toArray(p.children)) {
          const res = extract(child);
          if (res) return res;
        }
      }

      return null;
    };

    const out: MediaItem[] = [];
    for (const cell of next) {
      const media = extract(cell.node);
      if (media) out.push(media);
    }
    return out;
  }

  function commit(next: Cell[], opts?: { adjustIndex?: (cur: number) => number }) {
    cellsRef.current = next;
    setCellsState(next);

    setNormalizedItems(() => {
      const fromCells = cellsToMediaItems(next);
      if (fromCells.length) return fromCells;

      // fallback only if cells didn’t yield anything
      const fs = normalizeFsItems(fullscreen?.items);
      if (fs.length) return fs;

      if (flattenedEntryMedia?.length) return flattenedEntryMedia;
      return [];
    });

    if (!next.length) {
      indexChannel.set(0, 'instant');
      return;
    }

    if (opts?.adjustIndex) {
      const cur = sliderApiRef.current?.getIndex() ?? 0;
      const adj = opts.adjustIndex(cur);
      if (adj !== cur) sliderApiRef.current?.setIndex(adj as any, 'instant');
    }
  }

  function clamp(n: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, n)); }

  function append(nodes: React.ReactNode | React.ReactNode[]) {
    const add = asArray(nodes).map((n) => ({ id: newId(), node: n }));
    const next = [...cellsRef.current, ...add];
    commit(next);
    return next.length;
  }

  function prepend(nodes: React.ReactNode | React.ReactNode[]) {
    const add = asArray(nodes).map((n) => ({ id: newId(), node: n }));
    const prevLen = cellsRef.current.length;
    const addLen  = add.length;

    commit([...add, ...cellsRef.current], {
      adjustIndex: (cur) => clamp(cur + addLen, 0, prevLen + addLen - 1),
    });
    return prevLen + addLen;
  }

  function insert(index: number, nodes: React.ReactNode | React.ReactNode[]) {
    const arr   = cellsRef.current.slice();
    const add   = asArray(nodes).map((n) => ({ id: newId(), node: n }));
    const to    = clamp(index | 0, 0, arr.length);
    const next  = [...arr.slice(0, to), ...add, ...arr.slice(to)];
    const addLen = add.length;

    commit(next, {
      adjustIndex: (cur) => (cur >= to ? cur + addLen : cur),
    });

    return next.length;
  }

  function remove(indexOrPredicate: number | ((i: number) => boolean)) {
    const arr = cellsRef.current;
    if (!arr.length) return 0;

    let predicate: (i: number) => boolean;
    if (typeof indexOrPredicate === 'number') {
      const idx = clamp(indexOrPredicate, 0, arr.length - 1);
      predicate = (i) => i === idx;
    } else {
      predicate = indexOrPredicate;
    }

    const curIndex = sliderApiRef.current?.getIndex() ?? 0;

    const next: Cell[] = [];
    let removedBeforeOrAt = 0;
    arr.forEach((c, i) => {
      const isRemoved = predicate(i);
      if (!isRemoved) next.push(c);
      if (isRemoved && i <= curIndex) removedBeforeOrAt++;
    });

    commit(next, {
      adjustIndex: (cur) => clamp(cur - Math.max(0, removedBeforeOrAt), 0, Math.max(0, next.length - 1)),
    });

    return next.length;
  }

  function replace(index: number, node: React.ReactNode) {
    const arr = cellsRef.current;
    if (!arr.length) return;

    const i = clamp(index | 0, 0, arr.length - 1);

    const keepId = arr[i].id;
    const next = arr.slice();
    next[i] = { id: keepId, node };

    commit(next);
  }

  function setItems(input: React.ReactNode[]) {
    let nextCells: { id: string; node: React.ReactNode }[] = [];

    const nodes = (input as React.ReactNode[]) ?? [];
    nextCells = nodes.map(n => ({ id: newId(), node: n }));

    commit(nextCells, {
      adjustIndex: (cur) => clamp(cur, 0, Math.max(0, nextCells.length - 1)),
    });

    return nextCells.length;
  }

  useImperativeHandle(ref, () => {
    return {
      rootNode() {
        return sliderApiRef.current?.getRootNode() ?? null;
      },
      containerNode() {
        return sliderApiRef.current?.getContainerNode() ?? null;
      },
      slideNodes() {
        return sliderApiRef.current?.getSlideNodes() ?? [];
      },
      onReady: (cb) => sliderApiRef.current?.onSlidesBuilt(cb) ?? (() => {}),
      whenReady: () => sliderApiRef.current?.whenSlidesBuilt() ?? Promise.resolve([]),
      isReady: () => sliderApiRef.current?.isSlidesBuilt() ?? false,
      scrollTo(index: number, jump?: boolean) {
        const len = normalizedItems.length;
        if (!len) return;
        const cur = indexChannel.get().index ?? 0;
        const next = index;
        if (next === cur) return;
        indexChannel.set(next, jump ? 'instant' : 'animated');
      },

      scrollNext() {
        const api = sliderApiRef.current;
        if (!api) return;
        api.scrollNext();
      },
      scrollPrev() {
        const api = sliderApiRef.current;
        if (!api) return;
        api.scrollPrev();
      },
      canScrollNext() {
        return sliderApiRef.current?.canScrollNext() ?? false;
      },
      canScrollPrev() {
        return sliderApiRef.current?.canScrollPrev() ?? false;
      },

      cellsInView() {
        return sliderApiRef.current?.cellsInView() ?? [];
      },
      scrollProgress() {
        return sliderApiRef.current?.scrollProgress() ?? 0;
      },

      selectCell(index: number, jump?: boolean) {
        const sliderApi = sliderApiRef.current;
        const lenCells = normalizedItems.length;
        if (!sliderApi || !lenCells) return;

        const slideIdx = sliderApi.slideIndexForCell
          ? sliderApi.slideIndexForCell(index)
          : ((index % lenCells) + lenCells) % lenCells;

        const cur = indexChannel.get().index ?? 0;
        const next = slideIdx;

        if (!sliderObject.scroll.loop && next === cur) return;
        if (next !== cur) {
          indexChannel.set(next, jump ? 'instant' : 'animated');
        }
      },

      getIndex() {
        return indexChannel.get().index ?? 0;
      },

      onIndexChange(cb) {
        const off = indexChannel.onEvent(ev => {
          if (ev.type === 'set' || ev.type === 'bump') {
            cb(indexChannel.get().index, { mode: ev.mode });
          }
        });
        return off;
      },

      append,
      prepend,
      insert,
      remove,
      replace,
      setItems
    } as GalleryApi;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indexChannel, cellsState.length, sliderObject.scroll.loop]);

  const renderedCells = React.useMemo(() => {
    return cellsState.map((c) => {
      const n = c.node;
      return React.isValidElement(n)
        ? React.cloneElement(n as React.ReactElement, { key: c.id })
        : <span key={c.id} style={{ display: 'block' }}>{n as any}</span>;
    });
  }, [cellsState]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    shieldRef.current = createGestureShield(10000);
  }, []);

  const addShield = useCallback((timeoutMs?: number) => {
    shieldCleanupRef.current?.();
    const teardown = shieldRef.current?.add(timeoutMs);
    shieldCleanupRef.current = teardown ?? null;
  }, []);

  const openFullscreenAt = useCallback(
    (gridIndex: number, originEl?: HTMLElement | null) => {
      if (!fs.enabled) return;

      if (
        layout === 'entries' &&
        entriesObject.mediaLayout === 'slider' &&
        entryMapRef.current
      ) {
        const link = entryMapRef.current[gridIndex];
        if (link) {
          const { entryIndex } = link;

          const entryHandle = entrySliderRefs.current[entryIndex];
          const internals = entryHandle?.getInternals?.();

          const ownerSlider = entrySliderRefs.current[entryIndex] as any;

          const sel = internals?.selectedIndex?.current;

          if (ownerSlider && typeof ownerSlider.setIndex === 'function' && typeof sel === 'number') {
            ownerSlider.setIndex(sel, 'animated');
          }
        }
      }

      const imageCount = normalizedItems.length;
      if (!imageCount) return;

      let imgEl: HTMLImageElement | null = null;

      if (originEl) {
        imgEl =
          originEl.tagName === 'IMG'
            ? (originEl as HTMLImageElement)
            : originEl.querySelector('img');
      }

      if (!imgEl) {
        imgEl = (expandableImgRefs.current[gridIndex] ?? null) as HTMLImageElement | null;
      }

      if (!imgEl) return;

      let fullscreenIndex = gridIndex;
      if (layout === 'grid' || layout === 'masonry') fullscreenIndex = gridIndex;

      isClick.current = true;
      setShowFullscreenModal(true);

      runFullscreenIntro({
        origImg: imgEl,
        index: fullscreenIndex,
        normalizedItems,
        isRtl: sliderObject.direction.dir === "rtl",
        styles,
        fs,
        overlayDivRef,
        duplicateImgRef,
        overlayCaptionRef,
        overlayCaptionRootRef,
        closeButtonRef,
        counterRef,
        leftChevronRef,
        rightChevronRef,
        fsThumbContainerRef,
        setShowFullscreenSlider,
        setFsFadeOpening,
        addShield,
        resolveFsCaptionPlacement,
        closestSelector: ".rmg__grid-item"
      });

      setSlideIndex(fullscreenIndex);
    },
    [fs.enabled, normalizedItems.length, layout, entriesObject.mediaLayout]
  );

  function registerExpandableImg(index: number, node: HTMLElement | null) {
    if (!node) {
      expandableImgRefs.current[index] = null;
      return;
    }

    let img: HTMLImageElement | null = null;

    if (node.tagName === 'IMG') {
      img = node as HTMLImageElement;
    } else {
      img = node.querySelector('img');
    }

    expandableImgRefs.current[index] = img;
  }

  const viewportWidth = useViewportWidth();
  const gridLoading = useMemo(() => normalizeLoading(gridObject.loading), [gridObject.loading]);
  const gridIntro   = useMemo(() => normalizeIntro(gridObject.intro), [gridObject.intro]);

  const masonryLoading = useMemo(() => normalizeLoading(masonryObject.loading), [masonryObject.loading]);
  const masonryIntro   = useMemo(() => normalizeIntro(masonryObject.intro), [masonryObject.intro]);

  const resolvedCellsPerSlide = useMemo(() => {
    if (layout !== 'slider') return undefined;

    const hasCellsPerSlideProp = sliderObject.layout.cellsPerSlide != null;

    if (!hasCellsPerSlideProp) {
      return undefined;
    }

    const source = hasCellsPerSlideProp ? sliderObject.layout.cellsPerSlide : undefined;

    const raw = resolveNumberFromResponsive(
      source,
      1,
      viewportWidth,
      effectiveBreakpoints
    );

    const n = Math.max(1, raw | 0);
    return n;
  }, [sliderObject.layout.cellsPerSlide, viewportWidth, effectiveBreakpoints, layout]);

  const hasUserCellsPerSlide =
    sliderObject.layout.cellsPerSlide != null;

  const sliderResponsiveColumns =
    hasUserCellsPerSlide && typeof resolvedCellsPerSlide === 'number'
      ? resolvedCellsPerSlide
      : undefined;

  const resolvedGap = useMemo(() => {

    const raw = resolveNumberFromResponsive(
      sliderObject.layout.gap,
      20,
      viewportWidth,
      effectiveBreakpoints
    );

    return Math.max(0, raw | 0);
  }, [sliderObject.layout.gap, viewportWidth, effectiveBreakpoints]);

  const fsEnabled = fs.enabled;

  const openFullscreenAtStable = useCallback(
    (index: number) => {
      openFullscreenAt(index);
    },
    [openFullscreenAt]
  );

  const registerExpandableImgStable = useCallback(
    (index: number, node: HTMLElement) => {
      registerExpandableImg(index, node);
    },
    [registerExpandableImg]
  );

  const itemClassName = masonryObject.classNames?.item ?? "";

  const masonryChildren = useMemo(() => {
    return buildMasonryChildren({
      cells: cellsState,
      fsEnabled,
      openFullscreenAt: openFullscreenAtStable,
      registerExpandableImg: registerExpandableImgStable,
      itemBaseClass: "rmg__masonry-item",
      itemBaseStyleClass: "",
      itemClassName,
    });
  }, [
    cellsState,
    fsEnabled,
    openFullscreenAtStable,
    registerExpandableImgStable,
    itemClassName,
  ]);

  const isRtl = sliderObject.direction.dir === 'rtl' ? true : false
  const sign = isRtl ? -1 : 1;

  useEffect(() => {
    if (animRef.current) {
      animRef.current.stop()
      setScale(1);;
      previousZoom.current.x = 0; previousZoom.current.y = 0;
      panRef.current = { x: 0, y: 0 }
      scaleRef.current = 1
      setFsEntryOverlayOpacity(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closingModal])

  function boundsForCurrent(
    scale: number,
    imgW: number,
    imgH: number,
    viewW?: number,
    viewH?: number
  ) {
    return boundsForCurrentFn({
      scale,
      imgW,
      imgH,
      currentImageEl: currentImage.current,
      viewW,
      viewH
    });
  }

  function renderPan(xPx: number, yPx: number) {
    if (!currentImage.current) return
    const img = currentImage.current.children[0] as HTMLElement | null
    if (!img) return
    img.style.transform = `translate3d(${xPx}px, ${yPx}px, 0) scale(${scaleRef.current})`
  }

  useEffect(() => {
    axisRef.current = Axis()
  }, []);

  const wrappedPlyrProps = usePlyrProps({
    items: wrappedItems,
    source: fs.video?.source,
    options: fs.video?.options,
  });

  const singlePlyrProps = usePlyrProps({
    items: normalizedItems,
    source: fs.video?.source,
    options: fs.video?.options,
  });

  const rebuildPanBodies = useCallback(() => {
    rebuildPanBodiesFn({
      fs,
      currentImage,
      scaleRef,
      locX, prevX, offX, tgtX,
      locY, prevY, offY, tgtY,
      bodyX, bodyY,
      boundsX, boundsY,
      Vector1D,
      ScrollBody,
      ScrollBounds,
      boundsForCurrent,
    } as any);
  }, [fs.zoom.panDuration, fs.zoom.panFriction]);

  const zoomCtx = useMemo(() => ({
    fs,
    currentImage,
    scaleRef,
    setScale,
    previousZoom,
    suppressLoopRef,
    locX, prevX, offX, tgtX,
    locY, prevY, offY, tgtY,
    bodyX, bodyY,
    boundsX, boundsY,
    Vector1D,
    ScrollBody,
    ScrollBounds,
    boundsForCurrent,
    renderPan,
    animRef,
    panRef,
    resetAllZoomDom: resetZoomForSlideChange,
  }), [
    fs,
    setScale,
    Vector1D,
    ScrollBody,
    ScrollBounds,
    boundsForCurrent,
    renderPan,
  ]);

  const pan = usePanRuntime({
    fs,
    isZoomed,
    zoomCtx,
    currentImage,
    getImageAspectRatio,
    rebuildPanBodies,
    renderPan,
    handleZoomToggle,
    suppressNextClickRef,
    pointerDownRef,
    interactionModeRef,
    boundsX, boundsY,
    bodyX, bodyY,
    locX, locY,
    prevX, prevY,
    offX, offY,
    tgtX, tgtY,
    axisRef,
    animRef,
  });

  const wrappedTransform = React.useMemo(
    () => createWrappedTransform({ length: wrappedItems.length, sign }),
    [wrappedItems.length, sign]
  );

  const singleTransform = React.useMemo(
    () => createSingleTransform(),
    []
  );

  const wrappedFullscreenImages = renderFullscreenSlides({
    items: wrappedItems,
    plyrList: wrappedPlyrProps,
    getTransform: wrappedTransform,

    imageRefs,
    playerRefs: wrappedModePlyrRefs,
    cells,

    isZoomed,
    showFullscreenSlider,
    defaultPlayerStyle,
    fsVideoStyle: fs.video?.style,
    fsVideoClassName: fs.video?.className,

    onPanPointerDown: (e, imageRef) => pan.handlePanPointerStart(e, imageRef),
    onSuppressNextClickCapture: (e) => {
      if (suppressNextClickRef.current) {
        suppressNextClickRef.current = false;
        e.preventDefault();
        (e as any).stopPropagation?.();
      }
    },

    renderCaption: fs.caption?.render,
    captionClassName: fs.caption?.className,
    captionStyle: fs.caption?.style,
    fsCaptionPlacement: fs.caption?.placement,
    fsCaptionWidth: fs.caption?.width,
    fsCaptionHeight: fs.caption?.height,
    fsCaptionBreakpoint: fs.caption?.breakpoint,
    resolveFsCaptionPlacement,

    styles: {
      imgMargin: styles.imgMargin,
      fullscreenImages: styles.fullscreenImages,
    },

    renderImage: fs.renderImage as any,
  });

  const oneFullscreenImage = renderFullscreenSlides({
    items: normalizedItems,
    plyrList: singlePlyrProps,
    getTransform: singleTransform,

    imageRefs,
    playerRefs: singleModePlyrRefs,
    cells,

    isZoomed,
    showFullscreenSlider,
    defaultPlayerStyle,
    fsVideoStyle: fs.video?.style,
    fsVideoClassName: fs.video?.className,

    onPanPointerDown: (e, imageRef) => pan.handlePanPointerStart(e, imageRef),
    onSuppressNextClickCapture: (e) => {
      if (suppressNextClickRef.current) {
        suppressNextClickRef.current = false;
        e.preventDefault();
        (e as any).stopPropagation?.();
      }
    },

    renderCaption: fs.caption?.render,
    captionClassName: fs.caption?.className,
    captionStyle: fs.caption?.style,
    fsCaptionPlacement: fs.caption?.placement,
    fsCaptionWidth: fs.caption?.width,
    fsCaptionHeight: fs.caption?.height,
    fsCaptionBreakpoint: fs.caption?.breakpoint,
    resolveFsCaptionPlacement,

    styles: {
      imgMargin: styles.imgMargin,
      fullscreenImages: styles.fullscreenImages,
    },

    renderImage: fs.renderImage as any,
  });

  function resetPanForScale1() {
    resetPanForScale1Fn({
      currentImage,
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
      ScrollBody,
      ScrollBounds,
      baseFitSizeC,
      boundsForCurrent,
      panDuration: fs.zoom.panDuration,
      panFriction: fs.zoom.panFriction,
      animRef,
    });
  }

  function onForceResetZoom() {
    forceResetZoomFn({
      setScale,
      zoomState: {
        previousZoom,
        panRef,
        scaleRef,
      },
      imageRefs,
      resetPan: resetPanForScale1,
    });
  }

  function resetZoomForSlideChange() {
    resetZoomForSlideChangeFn({
      setScale,
      zoomState: {
        previousZoom,
        panRef,
        scaleRef,
        suppressLoopRef,
        changingSlides,
      },
      imageRefs,
      resetPan: resetPanForScale1,
    });
  }

  useWrappedItemsAndRefs({
    normalizedItems,
    wrappedItems,
    setWrappedItems,
    imageRefs,
  });

  function getImageAspectRatio(image: HTMLDivElement | null) {
    if (!image) return;
    const imgElement = getPrimaryImgEl(image);
    if (imgElement && imgElement.naturalWidth && imgElement.naturalHeight) {
      aspectRatioRef.current = imgElement.naturalWidth / imgElement.naturalHeight;
    }
  }

  const { isPinching, isTouchPinching } = useGlobalPinchZoom({
    scaleRef,
    zoomCtx,
    zoomTo,
    isZoomed,
    currentImage,
    imageRefs,
    fullscreenSliderApi,
    rebuildPanBodies,
    baseFitSizeC,
    boundsForCurrent,
    ScrollBounds,
    boundsX,
    boundsY,
    offX,
    offY,
    tgtX,
    tgtY,
    bodyX,
    bodyY,
    animRef,
    panDuration: fs.zoom.panDuration,
    findImgAtPoint,
    readDataIndex,
    distance,
    midpoint,
  });

  function getSliderHandleForFullscreen() {
    const idx = fsIndexRef.current;

    if (layout === 'entries' && entriesObject.items?.length && fsOwnersRef.current.length) {
      const owner = fsOwnersRef.current[idx];
      if (!owner) return null;
      return entrySliderRefs.current[owner.entryIndex] ?? null;
    }

    return sliderApiRef.current ?? null;
  }

  const centerSliderForFullscreen = () => {
    const handle = getSliderHandleForFullscreen();
    handle?.centerSlider?.();
  };

  const setSliderIndexForFullscreen = (index: number, mode: IndexMode) => {
    const handle = getSliderHandleForFullscreen();
    handle?.setIndex?.(index, mode);
  };

  const flexDirection =
  fs.thumbnails?.layout?.position === 'left'
    ? 'row-reverse'
    : fs.thumbnails?.layout?.position === 'right'
    ? 'row'
    : fs.thumbnails?.layout?.position === 'top'
    ? 'column-reverse'
    : 'column';

  const fsThumbsOpen = showFullscreenModal && !closingModal
  const fsThumbFadeDuration = fs.effects.thumbnailsFadeDuration
  const fsThumbFadeEasing = fs.effects.thumbnailsFadeEasing

  const vw = useViewportWidth();

  const resolvedThumbPos = useMemo(() => {
    if (!slider?.thumbnails?.layout?.position) return undefined;

    return resolvePositionFromResponsive(
      slider?.thumbnails?.layout?.position,
      "bottom",
      vw,
      effectiveBreakpoints
    );
  }, [slider?.thumbnails?.layout?.position, vw, effectiveBreakpoints]);

  const fsResolvedThumbPos = useMemo(
    () =>
      resolvePositionFromResponsive(
        fs.thumbnails?.layout?.position,
        'bottom',
        vw,
        effectiveBreakpoints
      ),
    [fs.thumbnails?.layout?.position, vw, effectiveBreakpoints]
  );


  return (
    <>
      <div className={root?.className} style={root?.style}>
        {layout === 'slider' && (resolvedThumbPos === 'top' || resolvedThumbPos === 'left') && (
          <ThumbnailSlider
            indexChannel={indexChannel}
            position={resolvedThumbPos}
            thumbnailWidth={sliderObject.thumbnails.layout?.thumbnail?.width}
            thumbnailHeight={sliderObject.thumbnails.layout?.thumbnail?.height}
            thumbnailsCenter={sliderObject.thumbnails.layout?.center}
            thumbnailsContainerWidth={sliderObject.thumbnails.layout?.container?.width}
            thumbnailsContainerHeight={sliderObject.thumbnails.layout?.container?.height}
            thumbnailsContainerStyle={sliderObject.thumbnails.elements?.container?.style}
            thumbnailsContainerClassName={sliderObject.thumbnails.elements?.container?.className}
            thumbnailItemStyle={sliderObject.thumbnails.elements?.thumbnail?.style}
            thumbnailItemClassName={sliderObject.thumbnails.elements?.thumbnail?.className}
            gap={sliderObject.thumbnails.layout?.gap}
            freeScroll={sliderObject.thumbnails.scroll?.freeScroll}
            groupCells={sliderObject.thumbnails.scroll?.groupCells}
            loop={sliderObject.thumbnails.scroll?.loop}
            skipSnaps={sliderObject.thumbnails.scroll?.skipSnaps}
            centerActiveThumb={sliderObject.thumbnails.scroll?.centerActiveThumb}
            selectDuration={sliderObject.thumbnails.motion?.selectDuration}
            freeScrollDuration={sliderObject.thumbnails.motion?.freeScrollDuration}
            sliderFriction={sliderObject.thumbnails.motion?.friction}
            loadingOptions={sliderObject.thumbnails.transitions?.loading}
            introOptions={sliderObject.thumbnails.transitions?.intro}
            breakpointMap={sliderObject.thumbnails.breakpointMap}
            rippleEnabled={sliderObject.thumbnails.controls?.ripple?.enabled}
            rippleClassName={sliderObject.thumbnails.controls?.ripple?.className}
            showArrows={sliderObject.thumbnails.controls?.enabled}
            arrowStyles={sliderObject.thumbnails.controls?.arrow?.style}
            arrowClassName={sliderObject.thumbnails.controls?.arrow?.className}
            prevArrowStyles={sliderObject.thumbnails.controls?.prev?.style}
            prevArrowClassName={sliderObject.thumbnails.controls?.prev?.className}
            nextArrowStyles={sliderObject.thumbnails.controls?.next?.style}
            nextArrowClassName={sliderObject.thumbnails.controls?.next?.className}
            renderArrows={sliderObject.thumbnails.controls?.render}
            renderPrevArrow={sliderObject.thumbnails.controls?.renderPrev}
            renderNextArrow={sliderObject.thumbnails.controls?.renderNext}
          >
            {sliderObject.thumbnails.children}
          </ThumbnailSlider>
        )}
        <div className={container?.className} style={container?.style}>
          {layout === 'slider' ? (
            <Slider
              imageCount={cellsState.length}
              isClick={isClick}
              expandableImgRefs={expandableImgRefs}
              overlayDivRef={overlayDivRef}
              setSlideIndex={setSlideIndex}
              setShowFullscreenModal={setShowFullscreenModal}
              setShowFullscreenSlider={setShowFullscreenSlider}
              showFullscreenSlider={showFullscreenSlider}
              duplicateImgRef={duplicateImgRef}
              closeButtonRef={closeButtonRef}
              counterRef={counterRef}
              leftChevronRef={leftChevronRef}
              rightChevronRef={rightChevronRef}
              isReady={isReady}
              setIsReady={setIsReady}
              loop={sliderObject.scroll.loop}
              freeScroll={sliderObject.scroll.freeScroll}
              autoPlay={sliderObject.auto.play.enabled}
              autoPlaySpeed={sliderObject.auto.play.speedMs}
              autoPlayPause={sliderObject.auto.play.pauseMs}
              autoScroll={sliderObject.auto.scroll.enabled}
              autoScrollSpeed={sliderObject.auto.scroll.speedMs}
              autoScrollPause={sliderObject.auto.scroll.pauseMs}
              pauseAutoPlayOnHover={sliderObject.auto.play.pauseOnHover}
              pauseAutoScrollOnHover={sliderObject.auto.scroll.pauseOnHover}
              groupCells={sliderObject.scroll.groupCells}
              centerAlign={sliderObject.align === 'center'}
              gap={resolvedGap}
              sliderViewportStyles={sliderObject.elements?.viewport?.style}
              sliderViewportClassName={sliderObject.elements?.viewport?.className}
              sliderContainerStyles={sliderObject.elements?.container?.style}
              sliderContainerClassName={sliderObject.elements?.container?.className}
              sliderHeight={sliderObject.size?.height}
              responsiveHeights={sliderObject.size?.heightRules}
              arrowStyles={sliderObject.controls.arrows.arrow.style}
              arrowClassName={sliderObject.controls.arrows.arrow.className}
              prevArrowStyles={sliderObject.controls.arrows.prev.style}
              prevArrowClassName={sliderObject.controls.arrows.prev.className}
              nextArrowStyles={sliderObject.controls.arrows.next.style}
              nextArrowClassName={sliderObject.controls.arrows.next.className}
              dotsContainerStyles={sliderObject.controls.dots.root.style}
              dotsContainerClassName={sliderObject.controls.dots.root.className}
              dotsStyles={sliderObject.controls.dots.dot.style}
              dotsClassName={sliderObject.controls.dots.dot.className}
              renderArrows={sliderObject.controls.arrows.render}
              renderPrevArrow={sliderObject.controls.arrows.renderPrev}
              renderNextArrow={sliderObject.controls.arrows.renderNext}
              renderDots={sliderObject.controls.dots.render}
              showArrows={sliderObject.controls.arrows.enabled}
              showDots={sliderObject.controls.dots.enabled}
              enableFullscreen={fs.enabled}
              showProgress={sliderObject.controls.progress.enabled}
              progressClassName={sliderObject.controls.progress.root.className}
              progressStyle={sliderObject.controls.progress.root.style}
              progressInnerClassName={sliderObject.controls.progress.bar.className}
              progressInnerStyle={sliderObject.controls.progress.bar.style}
              renderProgress={sliderObject.controls.progress.render}
              fullscreenControls={{
                close: fs.controls.close,
                arrows: {
                  arrow: fs.controls.arrows?.arrow,
                  prev: fs.controls.arrows?.prev,
                  next: fs.controls.arrows?.next,
                },
                counter: fs.controls.counter,
              }}
              showFsArrows={fs.controls.arrows?.enabled}
              showFsClose={fs.controls.close?.enabled}
              renderFsClose={fs.controls.close?.render}
              renderFsArrows={fs.controls.arrows?.render}
              renderFsPrev={fs.controls.arrows?.renderPrev}
              renderFsNext={fs.controls.arrows?.renderNext}
              showFsCounter={fs.controls.counter?.enabled}
              renderFsCounter={fs.controls.counter?.render}
              parallax={sliderObject.effects?.parallax?.enabled}
              parallaxBleedPct={sliderObject.effects?.parallax?.bleedPct}
              parallaxBorderRadius={sliderObject.effects?.parallax?.borderRadius}
              parallaxSideWidth={sliderObject.effects?.parallax?.sideWidth}
              ref={sliderApiRef}
              scaleEffect={sliderObject.effects?.scale?.enabled}
              scaleAmount={sliderObject.effects?.scale?.amount}
              fadeEffect={sliderObject.effects?.fade?.enabled}
              initialHeight={sliderObject.size?.initialHeight}
              cellsPerSlide={sliderResponsiveColumns}
              direction={sliderObject.direction.dir}
              axis={sliderObject.direction.axis}
              skipSnaps={sliderObject.scroll.skipSnaps}
              selectDuration={sliderObject.motion.selectDuration}
              freeScrollDuration={sliderObject.motion.freeScrollDuration}
              sliderFriction={sliderObject.motion.friction}
              indexChannel={indexChannel}
              loadingOptions={sliderObject.transitions?.loading}
              introOptions={sliderObject.transitions?.intro}
              lazyLoad={sliderObject.lazyLoad}
              rippleEnabled={sliderObject.controls.ripple.enabled}
              rippleClassName={sliderObject.controls.ripple.className}
              fsCaptionPlacement={fs.caption?.placement}
              fsCaptionWidth={fs.caption?.width}
              fsCaptionHeight={fs.caption?.height}
              fsCaptionBreakpoint={fs.caption?.breakpoint}
              renderFsCaption={fs.caption?.render}
              normalizedItems={normalizedItems}
              fsThumbContainerRef={fsThumbContainerRef}
              fullscreenThumbnails={fsResolvedThumbPos}
              sliderImagesReady={sliderImagesReady}
              fullscreenIntroFade={fs.effects.introFade}
              setFsFadeOpening={setFsFadeOpening}
              breakpointMap={effectiveBreakpoints}
              fsIntroDuration={fs.effects.introDuration}
              fsIntroEasing={fs.effects.introEasing}
            >
              {renderedCells}
            </Slider>
          ) : layout === 'masonry' ? (
            <MasonryLayout
              items={masonryChildren}
              masonry={masonryObject}
              breakpoints={effectiveBreakpoints}
              viewportWidth={viewportWidth}
              loading={masonryLoading}
              intro={masonryIntro}
              skeletonCount={cellsState.length}
            />
          ) : layout === 'entries' ? (
            <EntryList
              enabled={layout === "entries"}
              entries={entriesObject}
              fsEnabled={!!fs.enabled}
              openFullscreenAt={openFullscreenAt}
              entryFlatIndexRef={entryFlatIndexRef}
              nodeFromMedia={nodeFromMedia}
              isClickRef={isClick}
              registerExpandableImg={registerExpandableImg}
              renderMediaContainer={({ entryIndex, mediaNodes }) => {
                if (entriesObject.mediaLayout === "masonry") {
                  return (
                    <div className={styles.entryMasonry}>
                      <MasonryLayout
                        items={mediaNodes}
                        masonry={masonryObject}
                        breakpoints={effectiveBreakpoints}
                        viewportWidth={viewportWidth}
                        loading={masonryLoading}
                        intro={masonryIntro}
                        skeletonCount={mediaNodes.length}
                      />
                    </div>
                  );
                }

                if (entriesObject.mediaLayout === "slider") {
                  return (
                    <Slider
                      imageCount={mediaNodes.length}
                      isClick={isClick}
                      overlayDivRef={overlayDivRef}
                      setSlideIndex={setSlideIndex}
                      setShowFullscreenModal={setShowFullscreenModal}
                      setShowFullscreenSlider={setShowFullscreenSlider}
                      showFullscreenSlider={showFullscreenSlider}
                      duplicateImgRef={duplicateImgRef}
                      closeButtonRef={closeButtonRef}
                      counterRef={counterRef}
                      leftChevronRef={leftChevronRef}
                      rightChevronRef={rightChevronRef}
                      isReady={true}
                      setIsReady={() => {}}
                      loadingOptions={{ isLoading: false }}
                      loop={sliderObject.scroll.loop}
                      freeScroll={sliderObject.scroll.freeScroll}
                      autoPlay={sliderObject.auto.play.enabled}
                      autoPlaySpeed={sliderObject.auto.play.speedMs ?? 3000}
                      autoPlayPause={sliderObject.auto.play.pauseMs ?? 1000}
                      autoScroll={sliderObject.auto.scroll.enabled}
                      autoScrollSpeed={sliderObject.auto.scroll.speedMs ?? 3000}
                      autoScrollPause={sliderObject.auto.scroll.pauseMs ?? 1000}
                      pauseAutoPlayOnHover={sliderObject.auto.play.pauseOnHover}
                      pauseAutoScrollOnHover={sliderObject.auto.scroll.pauseOnHover}
                      groupCells={sliderObject.scroll.groupCells}
                      centerAlign={sliderObject.align === 'center'}
                      gap={resolvedGap}
                      sliderViewportStyles={sliderObject.elements?.viewport?.style}
                      sliderViewportClassName={sliderObject.elements?.viewport?.className}
                      sliderContainerStyles={sliderObject.elements?.container?.style}
                      sliderContainerClassName={sliderObject.elements?.container?.className}
                      sliderHeight={sliderObject.size?.height}
                      responsiveHeights={sliderObject.size?.heightRules}
                      arrowStyles={sliderObject.controls.arrows.arrow.style}
                      arrowClassName={sliderObject.controls.arrows.arrow.className}
                      prevArrowStyles={sliderObject.controls.arrows.prev.style}
                      prevArrowClassName={sliderObject.controls.arrows.prev.className}
                      nextArrowStyles={sliderObject.controls.arrows.next.style}
                      nextArrowClassName={sliderObject.controls.arrows.next.className}
                      dotsContainerStyles={sliderObject.controls.dots.root.style}
                      dotsContainerClassName={sliderObject.controls.dots.root.className}
                      dotsStyles={sliderObject.controls.dots.dot.style}
                      dotsClassName={sliderObject.controls.dots.dot.className}
                      renderArrows={sliderObject.controls.arrows.render}
                      renderPrevArrow={sliderObject.controls.arrows.renderPrev}
                      renderNextArrow={sliderObject.controls.arrows.renderNext}
                      renderDots={sliderObject.controls.dots.render}
                      showArrows={sliderObject.controls.arrows.enabled}
                      showDots={sliderObject.controls.dots.enabled}
                      enableFullscreen={fs.enabled}
                      showProgress={sliderObject.controls.progress.enabled}
                      progressClassName={sliderObject.controls.progress.root.className}
                      progressStyle={sliderObject.controls.progress.root.style}
                      progressInnerClassName={sliderObject.controls.progress.bar.className}
                      progressInnerStyle={sliderObject.controls.progress.bar.style}
                      renderProgress={sliderObject.controls.progress.render}
                      fullscreenControls={{
                        close: fs.controls.close,
                        arrows: {
                          arrow: fs.controls.arrows?.arrow,
                          prev: fs.controls.arrows?.prev,
                          next: fs.controls.arrows?.next,
                        },
                        counter: fs.controls.counter,
                      }}
                      showFsArrows={fs.controls.arrows?.enabled}
                      showFsClose={fs.controls.close?.enabled}
                      renderFsClose={fs.controls.close?.render}
                      renderFsArrows={fs.controls.arrows?.render}
                      renderFsPrev={fs.controls.arrows?.renderPrev}
                      renderFsNext={fs.controls.arrows?.renderNext}
                      showFsCounter={fs.controls.counter?.enabled}
                      renderFsCounter={fs.controls.counter?.render}
                      parallax={sliderObject.effects?.parallax?.enabled}
                      parallaxBleedPct={sliderObject.effects?.parallax?.bleedPct}
                      parallaxBorderRadius={sliderObject.effects?.parallax?.borderRadius}
                      parallaxSideWidth={sliderObject.effects?.parallax?.sideWidth}
                      ref={attachEntrySliderRef(entryIndex)}
                      scaleEffect={sliderObject.effects?.scale?.enabled}
                      scaleAmount={sliderObject.effects?.scale?.amount}
                      fadeEffect={sliderObject.effects?.fade?.enabled}
                      initialHeight={sliderObject.size?.initialHeight}
                      cellsPerSlide={sliderResponsiveColumns}
                      direction={sliderObject.direction.dir}
                      axis={sliderObject.direction.axis}
                      skipSnaps={sliderObject.scroll.skipSnaps}
                      selectDuration={sliderObject.motion.selectDuration}
                      freeScrollDuration={sliderObject.motion.freeScrollDuration}
                      sliderFriction={sliderObject.motion.friction}
                      introOptions={sliderObject.transitions?.intro}
                      lazyLoad={sliderObject.lazyLoad}
                      rippleEnabled={sliderObject.controls.ripple.enabled}
                      rippleClassName={sliderObject.controls.ripple.className}
                      renderFsCaption={fs.caption?.render}
                      normalizedItems={normalizedItems}
                      fsThumbContainerRef={fsThumbContainerRef}
                      fullscreenThumbnails={fsResolvedThumbPos}
                      sliderImagesReady={sliderImagesReady}
                      fullscreenIntroFade={fs.effects.introFade}
                      setFsFadeOpening={setFsFadeOpening}
                      breakpointMap={effectiveBreakpoints}
                      fsIntroDuration={fs.effects.introDuration}
                      fsIntroEasing={fs.effects.introEasing}
                    >
                      {mediaNodes}
                    </Slider>
                  );
                }

                const cells = mediaNodes.map((node, i) => ({
                  id: `entry-${entryIndex}-media-${i}`,
                  node,
                }));

                return (
                  <GridLayout
                    cells={cells}
                    grid={{
                      ...gridObject,
                      rootClassName: [gridObject.rootClassName, styles.gridEntryRoot].filter(Boolean).join(" "),
                      itemClassName: [gridObject.itemClassName, styles.gridEntryItem].filter(Boolean).join(" "),
                    }}
                    renderMode="passthrough"
                    gridItemBaseClass=""
                    breakpoints={effectiveBreakpoints}
                    viewportWidth={viewportWidth}
                    loading={{ isLoading: false }}
                    intro={gridIntro}
                    enableFullscreen={false}
                    onOpen={() => {}}
                    registerExpandableImg={() => {}}
                  />
                );
              }}
            />
          ) : layout === 'grid' ? (
            <GridLayout
              cells={cellsState}
              grid={gridObject}
              breakpoints={effectiveBreakpoints}
              viewportWidth={viewportWidth}
              loading={gridLoading}
              intro={gridIntro}
              enableFullscreen={!!fs.enabled}
              onOpen={openFullscreenAt}
              registerExpandableImg={registerExpandableImg}
            />
          ) : null}
        </div>
        {layout === 'slider' && (resolvedThumbPos === 'bottom' || resolvedThumbPos === 'right') && (
          <ThumbnailSlider
            indexChannel={indexChannel}
            position={resolvedThumbPos}
            thumbnailWidth={sliderObject.thumbnails.layout?.thumbnail?.width}
            thumbnailHeight={sliderObject.thumbnails.layout?.thumbnail?.height}
            thumbnailsCenter={sliderObject.thumbnails.layout?.center}
            thumbnailsContainerWidth={sliderObject.thumbnails.layout?.container?.width}
            thumbnailsContainerHeight={sliderObject.thumbnails.layout?.container?.height}
            thumbnailsContainerStyle={sliderObject.thumbnails.elements?.container?.style}
            thumbnailsContainerClassName={sliderObject.thumbnails.elements?.container?.className}
            thumbnailItemStyle={sliderObject.thumbnails.elements?.thumbnail?.style}
            thumbnailItemClassName={sliderObject.thumbnails.elements?.thumbnail?.className}
            gap={sliderObject.thumbnails.layout?.gap}
            freeScroll={sliderObject.thumbnails.scroll?.freeScroll}
            groupCells={sliderObject.thumbnails.scroll?.groupCells}
            loop={sliderObject.thumbnails.scroll?.loop}
            skipSnaps={sliderObject.thumbnails.scroll?.skipSnaps}
            centerActiveThumb={sliderObject.thumbnails.scroll?.centerActiveThumb}
            selectDuration={sliderObject.thumbnails.motion?.selectDuration}
            freeScrollDuration={sliderObject.thumbnails.motion?.freeScrollDuration}
            sliderFriction={sliderObject.thumbnails.motion?.friction}
            loadingOptions={sliderObject.thumbnails.transitions?.loading}
            introOptions={sliderObject.thumbnails.transitions?.intro}
            breakpointMap={sliderObject.thumbnails.breakpointMap}
            rippleEnabled={sliderObject.thumbnails.controls?.ripple?.enabled}
            rippleClassName={sliderObject.thumbnails.controls?.ripple?.className}
            showArrows={sliderObject.thumbnails.controls?.enabled}
            arrowStyles={sliderObject.thumbnails.controls?.arrow?.style}
            arrowClassName={sliderObject.thumbnails.controls?.arrow?.className}
            prevArrowStyles={sliderObject.thumbnails.controls?.prev?.style}
            prevArrowClassName={sliderObject.thumbnails.controls?.prev?.className}
            nextArrowStyles={sliderObject.thumbnails.controls?.next?.style}
            nextArrowClassName={sliderObject.thumbnails.controls?.next?.className}
            renderArrows={sliderObject.thumbnails.controls?.render}
            renderPrevArrow={sliderObject.thumbnails.controls?.renderPrev}
            renderNextArrow={sliderObject.thumbnails.controls?.renderNext}
          >
            {sliderObject.thumbnails.children}
          </ThumbnailSlider>
        )}
      </div>
      {fs.enabled && (
        <FullscreenModal
          fsSub={fsSub}
          open={showFullscreenModal}
          onClose={() => setShowFullscreenModal(false)}
          isClick={isClick}
          isAnimating={isAnimatingRef}
          overlayDivRef={overlayDivRef}
          cells={cells}
          setShowFullscreenSlider={setShowFullscreenSlider}
          imageCount={cellsState.length}
          slides={slidesForFullscreen}
          slider={sliderForFullscreen}
          visibleImagesRef={visibleImagesForFullscreen}
          selectedIndex={selectedIndexForFullscreen}
          sliderX={sliderXForFullscreen}
          sliderVelocity={sliderVelocityForFullscreen}
          isWrapping={isWrappingForFullscreen}
          wrappedItems={wrappedItems}
          setClosingModal={setClosingModal}
          closeButtonRef={closeButtonRef}
          counterRef={counterRef}
          leftChevronRef={leftChevronRef}
          rightChevronRef={rightChevronRef}
          centerAlign={sliderObject.align === 'center'}
          centerSlider={centerSliderForFullscreen}
          setSliderIndex={setSliderIndexForFullscreen}
          onForceResetZoom={() => onForceResetZoom()}
          layout={layout}
          expandableImgRefs={expandableImgRefs}
          entryMapRef={entryMapRef}
          entryMediaLayout={entriesObject.mediaLayout}
          introFade={fs.effects.introFade}
          introDuration={fs.effects.introDuration}
          introEasing={fs.effects.introEasing}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection
            }}
          >
            <div
              style={{
                flex: '1 1 auto',
                position: 'relative',
                minHeight: 0,
              }}
            >
              <FullscreenSlider
                key={epoch}
                sub={fsSub}
                ref={fullscreenSliderApi}
                imageCount={cellsState.length}
                slideIndex={slideIndex}
                isClick={isZoomClick}
                isZoomed={isZoomed}
                windowSize={windowSize}
                show={showFullscreenModal}
                handleZoomToggle={(e, imageRef) =>
                  handleZoomToggle(zoomCtx as any, e as any, imageRef as any)
                }
                imageRefs={imageRefs.current}
                cells={cells}
                isPinching={isPinching}
                scale={scaleRef.current}
                isTouchPinching={isTouchPinching}
                showFullscreenSlider={showFullscreenSlider}
                isZooming={isZooming}
                plyrRefs={wrappedModePlyrRefs}
                plyrRef={singleModePlyrRefs}
                closingModal={closingModal}
                closeButtonRef={closeButtonRef}
                counterRef={counterRef}
                leftChevronRef={leftChevronRef}
                rightChevronRef={rightChevronRef}
                overlayDivRef={overlayDivRef}
                direction={sliderObject.direction.dir}
                isWrapping={isWrappingForFullscreen}
                sliderDuration={fs.slider.duration}
                sliderFriction={fs.slider.friction}
                suppressLoopRef={suppressLoopRef}
                fadeOpening={fsFadeOpening}
                introFade={fs.effects.introFade}
                slideFade={fs.effects.slideFade}
                slideFadeDuration={fs.effects.slideFadeDuration}
                slideFadeEasing={fs.effects.slideFadeEasing}
                normalizedItems={normalizedItems}
                introDuration={fs.effects.introDuration}
                introEasing={fs.effects.introEasing}
                resetAllZoomDom={() => resetZoomForSlideChange()}
              >
                {normalizedItems.length > 1 ? wrappedFullscreenImages : oneFullscreenImage}
              </FullscreenSlider>
            </div>
            {
              fs.thumbnails?.layout?.position !== undefined && (
                <div
                  ref={fsThumbContainerRef}
                  className={fs.thumbnails.elements?.container?.className}
                  style={{
                    flex: fs.thumbnails?.layout?.position === 'left' || fs.thumbnails?.layout?.position === 'right'
                      ? '0 0 auto'
                      : '0 0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding:
                      fs.thumbnails?.layout?.position === 'top' || fs.thumbnails?.layout?.position === 'bottom'
                        ? '0.75rem 1rem'
                        : '0.75rem 0.5rem',
                    transition: `background-color ${fsThumbFadeDuration}ms ${fsThumbFadeEasing}`,
                    backgroundColor: fsThumbsOpen
                      ? 'rgba(255,255,255,1)'
                      : 'rgba(255,255,255,0)',
                    ...(fs.thumbnails.elements?.container?.style || {})
                  }}
                >
                  {normalizedItems.length > 1 && (
                    <FullscreenThumbnailSlider
                      items={normalizedItems.map((item) => ({
                        thumbSrc: (item as any).thumbSrc ?? (item as any).src,
                        alt: (item as any).alt,
                      }))}
                      position={fsResolvedThumbPos}
                      fsSub={fsSub}
                      thumbnailWidth={fs.thumbnails.layout?.thumbnail?.width}
                      thumbnailHeight={fs.thumbnails.layout?.thumbnail?.height}
                      thumbnailsCenter={fs.thumbnails.layout?.center}
                      thumbnailsContainerWidth={fs.thumbnails.layout?.container?.width}
                      thumbnailsContainerHeight={fs.thumbnails.layout?.container?.height}
                      visible={showFullscreenModal}
                      invisible={closingModal}
                      thumbnailItemClassName={fs.thumbnails.elements?.thumbnail?.className}
                      thumbnailItemStyle={fs.thumbnails.elements?.thumbnail?.style}
                      gap={fs.thumbnails.layout?.gap}
                      freeScroll={fs.thumbnails.scroll?.freeScroll}
                      groupCells={fs.thumbnails.scroll?.groupCells}
                      loop={fs.thumbnails.scroll?.loop}
                      direction={sliderObject.direction.dir}
                      skipSnaps={fs.thumbnails.scroll?.skipSnaps}
                      centerActiveThumb={fs.thumbnails.scroll?.centerActiveThumb}
                      selectDuration={fs.thumbnails.motion?.selectDuration}
                      freeScrollDuration={fs.thumbnails.motion?.freeScrollDuration}
                      sliderFriction={fs.thumbnails.motion?.friction}
                      breakpointMap={fs.thumbnails.breakpointMap}
                      rippleEnabled={fs.thumbnails.controls?.ripple?.enabled}
                      rippleClassName={fs.thumbnails.controls?.ripple?.className}
                      showArrows={fs.thumbnails.controls?.enabled}
                      arrowStyles={sliderObject.thumbnails.controls?.arrow?.style}
                      arrowClassName={sliderObject.thumbnails.controls?.arrow?.className}
                      prevArrowStyles={fs.thumbnails.controls?.prev?.style}
                      prevArrowClassName={fs.thumbnails.controls?.prev?.className}
                      nextArrowStyles={fs.thumbnails.controls?.next?.style}
                      nextArrowClassName={fs.thumbnails.controls?.next?.className}
                      renderArrows={sliderObject.thumbnails.controls?.render}
                      renderPrevArrow={fs.thumbnails.controls?.renderPrev}
                      renderNextArrow={fs.thumbnails.controls?.renderNext}
                    />
                  )}
                </div>
              )
            }
          </div>
          {showFullscreenModal && layout === 'entries' ? (
            <FsEntryOverlayMount setMountEl={setFsEntryOverlayMountEl} />
          ) : null}
        </FullscreenModal>
      )}
    </>
  );
})

export default Gallery;