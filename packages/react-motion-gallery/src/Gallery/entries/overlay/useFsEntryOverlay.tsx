'use client';

import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { FSEvent } from '../../fullscreen/fullscreenSliderSub';
import type { FullscreenCaptionZoomMotion } from '../../fullscreen/captionZoomMotion';
import type { FsCaptionPlacement } from '../../fullscreen/types';
import {
  effectiveViewportHeight,
  effectiveViewportWidth,
  resolveLengthFromResponsive,
  type ResponsiveCaptionPlacement,
  type ResponsiveLength,
} from '../../shared/responsive';
import { OverlayContentHeightStack } from '../../shared/OverlayContentHeightStack';

const ENTRY_OVERLAY_OPACITY_VAR = '--rmg-entry-overlay-opacity';
const DEFAULT_ENTRY_CROSSFADE_DURATION_MS = 300;
const DEFAULT_ENTRY_CROSSFADE_EASING = 'cubic-bezier(.4,0,.22,1)';
const CONTENT_CROSSFADE_OPACITY_EASING = 'linear';

export type FsSubLike = {
  get: () => number;
  onEvent: (cb: (e: FSEvent) => void) => () => void;
};

export type EntryLink = {
  entryIndex: number;
  mediaIndex: number;
  [k: string]: any;
};

type EntryOverlayMedia<EntryT> =
  EntryT extends { media?: Array<infer MediaT> } ? MediaT | null : unknown | null;

export type EntriesOverlayRenderArgs<EntryT> = {
  entry: EntryT;
  entryIndex: number;
  media: EntryOverlayMedia<EntryT>;
  mediaIndex: number;
  link: EntryLink;
  opacity: number;
  fsIndex: number;
  style: React.CSSProperties;
  containerProps: {
    className?: string;
    style: React.CSSProperties;
  };
};

export type EntriesObjectLike<EntryT> = {
  items?: EntryT[];
  overlay?: {
    className?: string;
    style?: React.CSSProperties;
    width?: ResponsiveLength;
    height?: ResponsiveLength;
    placement?: ResponsiveCaptionPlacement;
    breakpoint?: number;
    overlayCrossfadeTarget?: 'content' | 'overlay';
    overlayCrossfadeDurationMs?: number;
    overlayCrossfadeEasing?: string;
    zoomFade?: boolean;
    zoomFadeDurationMs?: number;
    zoomFadeEasing?: string;
    zoomInTransform?: string;
    zoomOutTransform?: string;
  };
  render?: {
    overlay?: (args: EntriesOverlayRenderArgs<EntryT>) => React.ReactNode;
  };
};

export type UseFsEntryOverlayArgs<EntryT> = {
  enabled: boolean;
  fsSub: FsSubLike;
  entriesObject: EntriesObjectLike<EntryT>;
  entryMapRef: React.RefObject<EntryLink[] | null>;
  syncFullscreenSourceFromIndex: (nextIndex: number) => void;
  resetAllZoomDom: () => void;
  wrapperBaseStyle?: React.CSSProperties;
  fadeOutMs?: number;
  closing?: boolean;
  overlayZoomMotion?: FullscreenCaptionZoomMotion;
  viewportWidth: number;
  viewportHeight: number;
  resolveFsCaptionPlacement: (
    placement: ResponsiveCaptionPlacement | undefined,
    breakpoint: number | undefined,
    viewportWidth: number
  ) => FsCaptionPlacement | null;
};

export type UseFsEntryOverlayReturn = {
  setMountEl: (el: HTMLDivElement | null) => void;
  setOpacity: (next: number) => void;
};

type FsEntryOverlayProps<EntryT> = UseFsEntryOverlayArgs<EntryT>;

type EntryOverlayLayer = {
  key: number;
  index: number;
  opacity: number;
};

function normalizeEntryOverlayIndex(index: number, length: number): number {
  if (!length) return index;
  return ((index % length) + length) % length;
}

type RenderedEntryOverlayLayer = {
  layer: EntryOverlayLayer;
  node: React.ReactNode;
};

type RenderFsEntryOverlayTreeArgs<EntryT> = {
  layers: EntryOverlayLayer[];
  entriesObject: EntriesObjectLike<EntryT>;
  entryMap: EntryLink[] | null | undefined;
  wrapperBaseStyle?: React.CSSProperties;
  overlayZoomMotion?: FullscreenCaptionZoomMotion;
  viewportWidth: number;
  viewportHeight: number;
  fadeOutMs: number;
  fadeOutEasing: string;
  overlayOpacity?: number;
  resolveFsCaptionPlacement: (
    placement: ResponsiveCaptionPlacement | undefined,
    breakpoint: number | undefined,
    viewportWidth: number
  ) => FsCaptionPlacement | null;
};

function overlayGradientForPlacement(p: FsCaptionPlacement | null | undefined): string {
  if (p === 'top') return 'linear-gradient(to bottom, rgba(0,0,0,0.75), transparent)';
  if (p === 'left') return 'linear-gradient(to right, rgba(0,0,0,0.75), transparent)';
  if (p === 'right') return 'linear-gradient(to left, rgba(0,0,0,0.75), transparent)';
  return 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)';
}

function overlayPositionForPlacement(args: {
  placement: FsCaptionPlacement | null | undefined;
  overlay: EntriesObjectLike<unknown>['overlay'];
  viewportWidth: number;
  viewportHeight: number;
}): React.CSSProperties {
  const { placement, overlay, viewportWidth, viewportHeight } = args;
  const resolvedViewportWidth = effectiveViewportWidth(viewportWidth);
  const resolvedViewportHeight = effectiveViewportHeight(viewportHeight);

  const sideWidth = resolveLengthFromResponsive(
    overlay?.width,
    280,
    resolvedViewportWidth,
    resolvedViewportWidth
  );
  const topBottomHeight =
    overlay?.height == null
      ? undefined
      : resolveLengthFromResponsive(
          overlay.height,
          200,
          resolvedViewportWidth,
          resolvedViewportHeight
        );

  if (placement === 'top') {
    return {
      top: 0,
      left: 0,
      right: 0,
      ...(topBottomHeight != null ? { height: topBottomHeight } : {}),
    };
  }

  if (placement === 'left') {
    return {
      top: 0,
      bottom: 0,
      left: 0,
      width: sideWidth,
    };
  }

  if (placement === 'right') {
    return {
      top: 0,
      bottom: 0,
      right: 0,
      width: sideWidth,
    };
  }

  return {
    bottom: 0,
    left: 0,
    right: 0,
    ...(topBottomHeight != null ? { height: topBottomHeight } : {}),
  };
}

function buildEntryOverlayShellStyle<EntryT>(args: {
  entriesObject: EntriesObjectLike<EntryT>;
  wrapperBaseStyle?: React.CSSProperties;
  viewportWidth: number;
  viewportHeight: number;
  placement: FsCaptionPlacement | null | undefined;
  fadeOutMs: number;
  fadeOutEasing: string;
  opacity: string;
}): React.CSSProperties {
  const {
    entriesObject,
    wrapperBaseStyle,
    viewportWidth,
    viewportHeight,
    placement,
    fadeOutMs,
    fadeOutEasing,
    opacity,
  } = args;

  return {
    position: 'fixed',
    boxSizing: 'border-box',
    zIndex: 'calc(var(--rmg-fs-z, 9999) + 1)',
    pointerEvents: 'none',
    ...overlayPositionForPlacement({
      placement,
      overlay: entriesObject.overlay,
      viewportWidth,
      viewportHeight,
    }),
    ...(wrapperBaseStyle ?? {}),
    opacity: opacity as any,
    transition:
      fadeOutMs > 0
        ? `opacity ${fadeOutMs}ms ${fadeOutEasing}`
        : undefined,
    willChange: fadeOutMs > 0 ? 'opacity' : undefined,
  };
}

function buildEntryOverlaySurfaceStyle<EntryT>(args: {
  entriesObject: EntriesObjectLike<EntryT>;
  placement: FsCaptionPlacement | null | undefined;
  overlayZoomMotion?: FullscreenCaptionZoomMotion;
}): React.CSSProperties {
  const { entriesObject, placement, overlayZoomMotion } = args;

  return {
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
    padding: '1.25rem 1.5rem',
    background: overlayGradientForPlacement(placement),
    color: '#fff',
    fontSize: '0.9rem',
    ...(entriesObject.overlay?.style ?? {}),
    ...(overlayZoomMotion?.contentStyle ?? {}),
  };
}

function buildEntryOverlayContentLayerStyle(args: {
  opacity: number;
  fadeOutMs: number;
  fadeOutEasing: string;
  stacked: boolean;
  active: boolean;
}): React.CSSProperties {
  const { opacity, fadeOutMs, fadeOutEasing, stacked, active } = args;

  return {
    ...(stacked
      ? {
          gridArea: '1 / 1',
          minWidth: 0,
          position: 'relative',
          zIndex: active ? 1 : 2,
        }
      : null),
    opacity,
    transition:
      fadeOutMs > 0
        ? `opacity ${fadeOutMs}ms ${
            stacked ? CONTENT_CROSSFADE_OPACITY_EASING : fadeOutEasing
          }`
        : undefined,
    willChange: fadeOutMs > 0 ? 'opacity' : undefined,
    pointerEvents: 'none',
  };
}

export function resolveFsEntryOverlayCrossfadeTarget<EntryT>(
  entriesObject: EntriesObjectLike<EntryT> | undefined
): 'content' | 'overlay' {
  return entriesObject?.overlay?.overlayCrossfadeTarget ?? 'overlay';
}

export function resolveFsEntryOverlayCrossfadeDurationMs<EntryT>(
  entriesObject: EntriesObjectLike<EntryT> | undefined,
  fallback = DEFAULT_ENTRY_CROSSFADE_DURATION_MS
): number {
  const duration = entriesObject?.overlay?.overlayCrossfadeDurationMs;
  return typeof duration === 'number' && Number.isFinite(duration)
    ? Math.max(0, duration)
    : fallback;
}

export function resolveFsEntryOverlayCrossfadeEasing<EntryT>(
  entriesObject: EntriesObjectLike<EntryT> | undefined
): string {
  const easing = entriesObject?.overlay?.overlayCrossfadeEasing;
  return typeof easing === 'string' && easing.trim()
    ? easing
    : DEFAULT_ENTRY_CROSSFADE_EASING;
}

export function shouldCrossfadeEntryOverlayIndexChange(args: {
  prevEntryIndex: number;
  nextEntryIndex: number;
  crossfadeTarget: 'content' | 'overlay';
}): boolean {
  const { prevEntryIndex, nextEntryIndex, crossfadeTarget } = args;
  return prevEntryIndex !== nextEntryIndex || crossfadeTarget === 'content';
}

export function renderFsEntryOverlayTree<EntryT>(
  args: RenderFsEntryOverlayTreeArgs<EntryT>
): React.ReactNode {
  const {
    layers,
    entriesObject,
    entryMap,
    wrapperBaseStyle,
    overlayZoomMotion,
    viewportWidth,
    viewportHeight,
    fadeOutMs,
    fadeOutEasing,
    resolveFsCaptionPlacement,
  } = args;
  const overlayOpacity = args.overlayOpacity;
  const overlayOpacityValue =
    overlayOpacity == null
      ? `var(${ENTRY_OVERLAY_OPACITY_VAR}, 1)`
      : String(overlayOpacity);

  const renderOverlay = entriesObject.render?.overlay;
  const items = entriesObject.items;
  if (typeof renderOverlay !== 'function' || !items?.length || !entryMap?.length || !layers.length) {
    return null;
  }

  const effectivePlacement = resolveFsCaptionPlacement(
    entriesObject.overlay?.placement,
    entriesObject.overlay?.breakpoint,
    viewportWidth
  );
  const surfaceStyle = buildEntryOverlaySurfaceStyle({
    entriesObject,
    placement: effectivePlacement,
    overlayZoomMotion,
  });
  const renderedLayers: RenderedEntryOverlayLayer[] = layers.flatMap((layer) => {
    const link = entryMap[layer.index];
    if (!link) return [];

    const entry = items[link.entryIndex];
    if (!entry) return [];
    const media = Array.isArray((entry as any).media)
      ? (entry as any).media[link.mediaIndex] ?? null
      : null;

    return [
      {
        layer,
        node: renderOverlay({
          entry,
          entryIndex: link.entryIndex,
          media,
          mediaIndex: link.mediaIndex,
          link,
          opacity: layer.opacity,
          fsIndex: layer.index,
          style: surfaceStyle,
          containerProps: {
            className: entriesObject.overlay?.className,
            style: surfaceStyle,
          },
        }),
      },
    ];
  });

  if (!renderedLayers.length) {
    return null;
  }

  const crossfadeTarget = resolveFsEntryOverlayCrossfadeTarget(entriesObject);
  const isContentCrossfade = crossfadeTarget === 'content';
  const activeLayerIndex = renderedLayers.length - 1;
  const activeLayer = renderedLayers[activeLayerIndex]?.layer;
  const activeLayerKey = activeLayer?.key ?? 'active';
  const activeLayerReady = (activeLayer?.opacity ?? 1) > 0;

  if (isContentCrossfade) {
    return (
      <div
        data-rmg-fs-entry-overlay="true"
        className={entriesObject.overlay?.className}
        style={buildEntryOverlayShellStyle({
          entriesObject,
          wrapperBaseStyle,
          viewportWidth,
          viewportHeight,
          placement: effectivePlacement,
          fadeOutMs,
          fadeOutEasing,
          opacity: overlayOpacityValue,
        })}
      >
        <div
          data-rmg-fs-entry-overlay-surface="true"
          style={surfaceStyle}
        >
          <OverlayContentHeightStack
            activeKey={activeLayerKey}
            activeReady={activeLayerReady}
            durationMs={fadeOutMs}
            easing={fadeOutEasing}
          >
            {renderedLayers.map(({ layer, node }, layerIndex) => (
              <div
                key={layer.key}
                data-rmg-fs-entry-overlay-content="true"
                data-rmg-overlay-height-layer-key={String(layer.key)}
                data-rmg-overlay-height-active={
                  layerIndex === activeLayerIndex ? 'true' : undefined
                }
                style={buildEntryOverlayContentLayerStyle({
                  opacity: layer.opacity,
                  fadeOutMs,
                  fadeOutEasing,
                  stacked: true,
                  active: layerIndex === activeLayerIndex,
                })}
                aria-hidden={layerIndex === activeLayerIndex ? undefined : true}
              >
                {node}
              </div>
            ))}
          </OverlayContentHeightStack>
        </div>
      </div>
    );
  }

  return (
    <>
      {renderedLayers.map(({ layer, node }, layerIndex) => {
        return (
          <div
            key={layer.key}
            data-rmg-fs-entry-overlay="true"
            className={entriesObject.overlay?.className}
            style={buildEntryOverlayShellStyle({
              entriesObject,
              wrapperBaseStyle,
              viewportWidth,
              viewportHeight,
              placement: effectivePlacement,
              fadeOutMs,
              fadeOutEasing,
              opacity:
                overlayOpacity == null
                  ? `calc(var(${ENTRY_OVERLAY_OPACITY_VAR}, 1) * ${layer.opacity})`
                  : String(overlayOpacity * layer.opacity),
            })}
            aria-hidden={layerIndex === activeLayerIndex ? undefined : true}
          >
            <div
              data-rmg-fs-entry-overlay-surface="true"
              style={surfaceStyle}
            >
              {node}
            </div>
          </div>
        );
      })}
    </>
  );
}

export function FsEntryOverlay<EntryT>(
  props: FsEntryOverlayProps<EntryT>
): React.ReactNode {
  const {
    enabled,
    fsSub,
    entriesObject,
    entryMapRef,
    syncFullscreenSourceFromIndex,
    resetAllZoomDom,
    wrapperBaseStyle,
    fadeOutMs: fadeOutMsProp,
    closing,
    overlayZoomMotion,
    viewportWidth,
    viewportHeight,
    resolveFsCaptionPlacement,
  } = props;

  const crossfadeTarget = resolveFsEntryOverlayCrossfadeTarget(entriesObject);
  const fadeOutMs = resolveFsEntryOverlayCrossfadeDurationMs(entriesObject, fadeOutMsProp);
  const fadeOutEasing = resolveFsEntryOverlayCrossfadeEasing(entriesObject);
  const [layers, setLayers] = React.useState<EntryOverlayLayer[]>(() => [
    {
      key: 1,
      index: normalizeEntryOverlayIndex(fsSub.get(), entryMapRef.current?.length ?? 0),
      opacity: 1,
    },
  ]);
  const [overlayOpacity, setOverlayOpacity] = React.useState(0);
  const layersRef = React.useRef<EntryOverlayLayer[]>(layers);
  const fsIndexRef = React.useRef<number>(
    normalizeEntryOverlayIndex(fsSub.get(), entryMapRef.current?.length ?? 0)
  );
  const layerKeyRef = React.useRef(1);
  const syncFullscreenSourceFromIndexRef = React.useRef(syncFullscreenSourceFromIndex);
  const resetAllZoomDomRef = React.useRef(resetAllZoomDom);
  const swapJobRef = React.useRef<{
    raf1: number;
    raf2: number;
    timeout: number | null;
  }>({ raf1: 0, raf2: 0, timeout: null });
  const visibilityJobRef = React.useRef<{
    raf1: number;
    raf2: number;
    timeout: number | null;
  }>({ raf1: 0, raf2: 0, timeout: null });

  const cancelSwapJob = React.useCallback(() => {
    const job = swapJobRef.current;
    if (job.raf1) cancelAnimationFrame(job.raf1);
    if (job.raf2) cancelAnimationFrame(job.raf2);
    if (job.timeout != null) window.clearTimeout(job.timeout);
    swapJobRef.current = { raf1: 0, raf2: 0, timeout: null };
  }, []);

  const cancelVisibilityJob = React.useCallback(() => {
    const job = visibilityJobRef.current;
    if (job.raf1) cancelAnimationFrame(job.raf1);
    if (job.raf2) cancelAnimationFrame(job.raf2);
    if (job.timeout != null) window.clearTimeout(job.timeout);
    visibilityJobRef.current = { raf1: 0, raf2: 0, timeout: null };
  }, []);

  const commitLayers = React.useCallback((nextLayers: EntryOverlayLayer[]) => {
    layersRef.current = nextLayers;
    setLayers(nextLayers);
  }, []);

  const normalizeFsIndex = React.useCallback((index: number) => {
    return normalizeEntryOverlayIndex(index, entryMapRef.current?.length ?? 0);
  }, [entryMapRef]);

  React.useEffect(() => {
    syncFullscreenSourceFromIndexRef.current = syncFullscreenSourceFromIndex;
    resetAllZoomDomRef.current = resetAllZoomDom;
  }, [resetAllZoomDom, syncFullscreenSourceFromIndex]);

  const buildLayer = React.useCallback((index: number, opacity = 1): EntryOverlayLayer => ({
    key: ++layerKeyRef.current,
    index,
    opacity,
  }), []);

  const getCurrentVisibleLayer = React.useCallback((fallbackIndex: number) => {
    const current = layersRef.current;
    const visibleLayer = current.reduce<EntryOverlayLayer | null>((best, layer) => {
      if (!best || layer.opacity > best.opacity) return layer;
      return best;
    }, null);

    return visibleLayer ?? buildLayer(fallbackIndex);
  }, [buildLayer]);

  const getEntryIndexForFsIndex = React.useCallback((fsIndex: number): number => {
    const map = entryMapRef.current;
    const link = map?.[fsIndex];
    return link?.entryIndex ?? -1;
  }, [entryMapRef]);

  const showEntryOverlayForIndex = React.useCallback((index: number) => {
    const activeLayer = layersRef.current[layersRef.current.length - 1];
    commitLayers([activeLayer ? { ...activeLayer, index, opacity: 1 } : buildLayer(index)]);
  }, [buildLayer, commitLayers]);

  const fadeSwapToIndex = React.useCallback((nextIndex: number) => {
    if (closing) return;

    cancelSwapJob();

    const outgoing = getCurrentVisibleLayer(fsIndexRef.current);
    const incoming = buildLayer(nextIndex, 0);

    commitLayers([{ ...outgoing, opacity: 1 }, incoming]);
    syncFullscreenSourceFromIndexRef.current(nextIndex);
    resetAllZoomDomRef.current();

    if (fadeOutMs <= 0) {
      commitLayers([{ ...incoming, opacity: 1 }]);
      return;
    }

    swapJobRef.current.raf1 = requestAnimationFrame(() => {
      swapJobRef.current.raf1 = 0;
      swapJobRef.current.raf2 = requestAnimationFrame(() => {
        swapJobRef.current.raf2 = 0;
        commitLayers([{ ...outgoing, opacity: 0 }, { ...incoming, opacity: 1 }]);

        swapJobRef.current.timeout = window.setTimeout(() => {
          commitLayers([{ ...incoming, opacity: 1 }]);
          swapJobRef.current = { raf1: 0, raf2: 0, timeout: null };
        }, fadeOutMs);
      });
    });
  }, [
    buildLayer,
    cancelSwapJob,
    closing,
    commitLayers,
    fadeOutMs,
    getCurrentVisibleLayer,
  ]);

  React.useEffect(() => {
    if (!enabled) {
      cancelSwapJob();
      cancelVisibilityJob();
      setOverlayOpacity(0);
      commitLayers([]);
      return;
    }

    if (closing) {
      cancelSwapJob();
      cancelVisibilityJob();
      setOverlayOpacity(0);

      if (fadeOutMs <= 0) {
        commitLayers([]);
      } else {
        visibilityJobRef.current.timeout = window.setTimeout(() => {
          commitLayers([]);
          visibilityJobRef.current = { raf1: 0, raf2: 0, timeout: null };
        }, fadeOutMs);
      }

      return;
    }

    cancelVisibilityJob();

    const start = normalizeFsIndex(fsSub.get());
    fsIndexRef.current = start;
    showEntryOverlayForIndex(start);
    syncFullscreenSourceFromIndexRef.current(start);
    setOverlayOpacity(0);
    visibilityJobRef.current.raf1 = requestAnimationFrame(() => {
      visibilityJobRef.current.raf1 = 0;
      visibilityJobRef.current.raf2 = requestAnimationFrame(() => {
        visibilityJobRef.current.raf2 = 0;
        setOverlayOpacity(1);
      });
    });

    const off = fsSub.onEvent((event) => {
      if (event.type !== 'internalIndex') return;

      const next = normalizeFsIndex(event.index);
      if (next === fsIndexRef.current && layersRef.current.length) return;

      const prevFsIndex = fsIndexRef.current;
      const prevEntryIndex = getEntryIndexForFsIndex(prevFsIndex);
      const nextEntryIndex = getEntryIndexForFsIndex(next);

      fsIndexRef.current = next;

      if (
        shouldCrossfadeEntryOverlayIndexChange({
          prevEntryIndex,
          nextEntryIndex,
          crossfadeTarget,
        })
      ) {
        fadeSwapToIndex(next);
      } else {
        cancelSwapJob();
        showEntryOverlayForIndex(next);
        syncFullscreenSourceFromIndexRef.current(next);
        resetAllZoomDomRef.current();
      }
    });

    return () => {
      cancelSwapJob();
      cancelVisibilityJob();
      off();
    };
  }, [
    cancelSwapJob,
    cancelVisibilityJob,
    closing,
    commitLayers,
    crossfadeTarget,
    enabled,
    fadeSwapToIndex,
    fadeOutMs,
    fsSub,
    getEntryIndexForFsIndex,
    normalizeFsIndex,
    showEntryOverlayForIndex,
  ]);

  React.useEffect(() => {
    return () => {
      cancelSwapJob();
      cancelVisibilityJob();
    };
  }, [cancelSwapJob, cancelVisibilityJob]);

  if (!layers.length) return null;

  return (
    <>
      {renderFsEntryOverlayTree({
        layers,
        entriesObject,
        entryMap: entryMapRef.current,
        wrapperBaseStyle,
        overlayZoomMotion,
        viewportWidth,
        viewportHeight,
        fadeOutMs,
        fadeOutEasing,
        overlayOpacity,
        resolveFsCaptionPlacement,
      })}
    </>
  );
}

export function useFsEntryOverlay<EntryT>(
  args: UseFsEntryOverlayArgs<EntryT>
): UseFsEntryOverlayReturn {
  const {
    enabled,
    fsSub,
    entriesObject,
    entryMapRef,
    syncFullscreenSourceFromIndex,
    resetAllZoomDom,
    wrapperBaseStyle,
    fadeOutMs: fadeOutMsProp,
    closing,
    overlayZoomMotion,
    viewportWidth,
    viewportHeight,
    resolveFsCaptionPlacement,
  } = args;
  const mountRef = React.useRef<HTMLDivElement | null>(null);
  const rootRef = React.useRef<Root | null>(null);
  const rootMountRef = React.useRef<HTMLDivElement | null>(null);
  const fsIndexRef = React.useRef<number>(fsSub.get());
  const pendingUnmountRef = React.useRef<number>(0);
  const pendingUnmountRootRef = React.useRef<Root | null>(null);
  const pendingUnmountMountRef = React.useRef<HTMLDivElement | null>(null);
  const swapJobRef = React.useRef<{ t: number | null; raf: number }>({
    t: null,
    raf: 0,
  });
  const layerKeyRef = React.useRef(0);
  const layersRef = React.useRef<EntryOverlayLayer[]>([]);
  const crossfadeTarget = resolveFsEntryOverlayCrossfadeTarget(entriesObject);
  const fadeOutMs = resolveFsEntryOverlayCrossfadeDurationMs(entriesObject, fadeOutMsProp);
  const fadeOutEasing = resolveFsEntryOverlayCrossfadeEasing(entriesObject);

  const cancelSwapJob = React.useCallback(() => {
    const job = swapJobRef.current;
    if (job.raf) cancelAnimationFrame(job.raf);
    if (job.t != null) clearTimeout(job.t);
    swapJobRef.current = { t: null, raf: 0 };
  }, []);

  const clearPendingUnmount = React.useCallback(() => {
    if (pendingUnmountRef.current) {
      cancelAnimationFrame(pendingUnmountRef.current);
      pendingUnmountRef.current = 0;
    }
    pendingUnmountRootRef.current = null;
    pendingUnmountMountRef.current = null;
  }, []);

  const setEntryOverlayOpacity = React.useCallback((next: number) => {
    const el = mountRef.current;
    if (!el) return;
    el.style.setProperty(ENTRY_OVERLAY_OPACITY_VAR, String(next));
  }, []);

  const getEntryIndexForFsIndex = React.useCallback(
    (fsIndex: number): number => {
      const map = entryMapRef.current;
      const link = map?.[fsIndex];
      return link?.entryIndex ?? -1;
    },
    [entryMapRef]
  );

  const restorePendingRootForMount = React.useCallback(
    (mount: HTMLDivElement): boolean => {
      const pendingRoot = pendingUnmountRootRef.current;
      const pendingMount = pendingUnmountMountRef.current;
      if (!pendingRoot || pendingMount !== mount) return false;

      if (pendingUnmountRef.current) {
        cancelAnimationFrame(pendingUnmountRef.current);
        pendingUnmountRef.current = 0;
      }

      pendingUnmountRootRef.current = null;
      pendingUnmountMountRef.current = null;
      rootRef.current = pendingRoot;
      rootMountRef.current = mount;
      return true;
    },
    []
  );

  const scheduleRootUnmount = React.useCallback((root: Root, mount: HTMLDivElement | null) => {
    if (pendingUnmountRef.current) {
      cancelAnimationFrame(pendingUnmountRef.current);
      pendingUnmountRef.current = 0;
    }

    pendingUnmountRootRef.current = root;
    pendingUnmountMountRef.current = mount;

    pendingUnmountRef.current = requestAnimationFrame(() => {
      pendingUnmountRef.current = 0;

      const rootToUnmount = pendingUnmountRootRef.current;
      const mountToUnmount = pendingUnmountMountRef.current;

      pendingUnmountRootRef.current = null;
      pendingUnmountMountRef.current = null;

      if (!rootToUnmount) return;

      // Strict Mode can briefly hand the same mount node back after ref cleanup.
      if (rootRef.current === rootToUnmount && rootMountRef.current === mountToUnmount) {
        return;
      }

      if (mountToUnmount && !mountToUnmount.isConnected) return;

      try {
        rootToUnmount.unmount();
      } catch {
        // ignore teardown races
      }
    });
  }, []);

  const buildLayer = React.useCallback(
    (index: number, opacity = 1): EntryOverlayLayer => ({
      key: ++layerKeyRef.current,
      index,
      opacity,
    }),
    []
  );

  const renderEntryOverlayLayers = React.useCallback(
    (layers: EntryOverlayLayer[]) => {
      const mount = mountRef.current;
      if (!mount) return;

      restorePendingRootForMount(mount);

      if (rootRef.current && rootMountRef.current !== mount) {
        const oldRoot = rootRef.current;
        const oldMount = rootMountRef.current;
        rootRef.current = null;
        rootMountRef.current = null;
        scheduleRootUnmount(oldRoot, oldMount);
        restorePendingRootForMount(mount);
      }

      if (!rootRef.current) {
        rootRef.current = createRoot(mount);
        rootMountRef.current = mount;
      }

      const root = rootRef.current;
      const tree = renderFsEntryOverlayTree({
        layers,
        entriesObject,
        entryMap: entryMapRef.current,
        wrapperBaseStyle,
        overlayZoomMotion,
        viewportWidth,
        viewportHeight,
        fadeOutMs,
        fadeOutEasing,
        resolveFsCaptionPlacement,
      });

      root.render(tree);
    },
    [
      entriesObject,
      entryMapRef,
      fadeOutMs,
      fadeOutEasing,
      overlayZoomMotion,
      resolveFsCaptionPlacement,
      restorePendingRootForMount,
      scheduleRootUnmount,
      viewportHeight,
      viewportWidth,
      wrapperBaseStyle,
    ]
  );

  const commitLayers = React.useCallback(
    (layers: EntryOverlayLayer[]) => {
      layersRef.current = layers;
      renderEntryOverlayLayers(layers);
    },
    [renderEntryOverlayLayers]
  );

  const renderEntryOverlayForIndex = React.useCallback(
    (index: number) => {
      const activeLayer = layersRef.current[layersRef.current.length - 1];
      commitLayers([activeLayer ? { ...activeLayer, index, opacity: 1 } : buildLayer(index)]);
    },
    [buildLayer, commitLayers]
  );

  const fadeSwapToIndex = React.useCallback(
    (nextIndex: number) => {
      if (closing) return;
      cancelSwapJob();

      const outgoing =
        layersRef.current[layersRef.current.length - 1] ?? buildLayer(fsIndexRef.current);
      const incoming = buildLayer(nextIndex, 0);

      commitLayers([{ ...outgoing, opacity: 1 }, incoming]);
      syncFullscreenSourceFromIndex(nextIndex);
      resetAllZoomDom();

      if (fadeOutMs <= 0) {
        commitLayers([{ ...incoming, opacity: 1 }]);
        return;
      }

      swapJobRef.current.raf = requestAnimationFrame(() => {
        swapJobRef.current.raf = requestAnimationFrame(() => {
          swapJobRef.current.raf = 0;
          commitLayers([{ ...outgoing, opacity: 0 }, { ...incoming, opacity: 1 }]);

          swapJobRef.current.t = window.setTimeout(() => {
            commitLayers([{ ...incoming, opacity: 1 }]);
            swapJobRef.current = { t: null, raf: 0 };
          }, fadeOutMs);
        });
      });
    },
    [
      buildLayer,
      cancelSwapJob,
      commitLayers,
      fadeOutMs,
      resetAllZoomDom,
      syncFullscreenSourceFromIndex,
      closing,
    ]
  );

  const setMountEl = React.useCallback(
    (el: HTMLDivElement | null) => {
      mountRef.current = el;

      if (el) {
        restorePendingRootForMount(el);
        el.style.setProperty(ENTRY_OVERLAY_OPACITY_VAR, '0');

        if (enabled) {
          if (layersRef.current.length) {
            renderEntryOverlayLayers(layersRef.current);
          } else {
            renderEntryOverlayForIndex(fsIndexRef.current);
          }

          requestAnimationFrame(() => {
            setEntryOverlayOpacity(closing ? 0 : 1);
          });
        }
        return;
      }

      cancelSwapJob();

      const root = rootRef.current;
      const rootMount = rootMountRef.current;
      rootRef.current = null;
      rootMountRef.current = null;

      if (root) {
        scheduleRootUnmount(root, rootMount);
      }
    },
    [
      cancelSwapJob,
      closing,
      enabled,
      renderEntryOverlayForIndex,
      renderEntryOverlayLayers,
      restorePendingRootForMount,
      scheduleRootUnmount,
      setEntryOverlayOpacity,
    ]
  );

  React.useEffect(() => {
    if (closing) {
      cancelSwapJob();
      setEntryOverlayOpacity(0);
      return;
    }
    if (!enabled) return;

    const start = fsSub.get();
    fsIndexRef.current = start;

    renderEntryOverlayForIndex(start);
    requestAnimationFrame(() => setEntryOverlayOpacity(1));
    syncFullscreenSourceFromIndex(start);

    const off = fsSub.onEvent((e) => {
      if (e.type !== 'internalIndex') return;

      const next = e.index;

      if (next === fsIndexRef.current && layersRef.current.length) return;

      const prevFsIndex = fsIndexRef.current;
      const prevEntryIndex = getEntryIndexForFsIndex(prevFsIndex);
      const nextEntryIndex = getEntryIndexForFsIndex(next);

      fsIndexRef.current = next;

      if (
        shouldCrossfadeEntryOverlayIndexChange({
          prevEntryIndex,
          nextEntryIndex,
          crossfadeTarget,
        })
      ) {
        fadeSwapToIndex(next);
      } else {
        cancelSwapJob();
        renderEntryOverlayForIndex(next);
        syncFullscreenSourceFromIndex(next);
        resetAllZoomDom();
      }
    });

    return () => {
      cancelSwapJob();
      off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    enabled,
    fsSub,
    entriesObject.render?.overlay,
    entriesObject.items,
    cancelSwapJob,
    crossfadeTarget,
    fadeSwapToIndex,
    getEntryIndexForFsIndex,
    renderEntryOverlayForIndex,
    resetAllZoomDom,
    setEntryOverlayOpacity,
    syncFullscreenSourceFromIndex,
    closing
  ]);

  React.useEffect(() => {
    return () => {
      clearPendingUnmount();
    };
  }, [clearPendingUnmount]);

  return { setMountEl, setOpacity: setEntryOverlayOpacity };
}
