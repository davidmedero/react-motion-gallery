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

const ENTRY_OVERLAY_OPACITY_VAR = '--rmg-entry-overlay-opacity';
const ENTRY_CROSSFADE_EASING = 'cubic-bezier(.4,0,.22,1)';

export type FsSubLike = {
  get: () => number;
  onEvent: (cb: (e: FSEvent) => void) => () => void;
};

export type EntryLink = {
  entryIndex: number;
  mediaIndex: number;
  [k: string]: any;
};

export type EntriesOverlayRenderArgs<EntryT> = {
  entry: EntryT;
  entryIndex: number;
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
  overlayZoomMotion: FullscreenCaptionZoomMotion;
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

type EntryOverlayLayer = {
  key: number;
  index: number;
  opacity: number;
};

type RenderFsEntryOverlayTreeArgs<EntryT> = {
  layers: EntryOverlayLayer[];
  entriesObject: EntriesObjectLike<EntryT>;
  entryMap: EntryLink[] | null | undefined;
  wrapperBaseStyle?: React.CSSProperties;
  overlayZoomMotion: FullscreenCaptionZoomMotion;
  viewportWidth: number;
  viewportHeight: number;
  fadeOutMs: number;
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
  opacity: string;
}): React.CSSProperties {
  const {
    entriesObject,
    wrapperBaseStyle,
    viewportWidth,
    viewportHeight,
    placement,
    fadeOutMs,
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
        ? `opacity ${fadeOutMs}ms ${ENTRY_CROSSFADE_EASING}`
        : undefined,
    willChange: fadeOutMs > 0 ? 'opacity' : undefined,
  };
}

function buildEntryOverlaySurfaceStyle<EntryT>(args: {
  entriesObject: EntriesObjectLike<EntryT>;
  placement: FsCaptionPlacement | null | undefined;
  overlayZoomMotion: FullscreenCaptionZoomMotion;
}): React.CSSProperties {
  const { entriesObject, placement, overlayZoomMotion } = args;

  return {
    padding: '1.25rem 1.5rem',
    background: overlayGradientForPlacement(placement),
    color: '#fff',
    fontSize: '0.9rem',
    ...(entriesObject.overlay?.style ?? {}),
    ...overlayZoomMotion.contentStyle,
  };
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
    resolveFsCaptionPlacement,
  } = args;

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
  const activeLayerIndex = layers.length - 1;

  return (
    <>
      {layers.map((layer, layerIndex) => {
        const link = entryMap[layer.index];
        if (!link) return null;

        const entry = items[link.entryIndex];
        if (!entry) return null;

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
              opacity: `calc(var(${ENTRY_OVERLAY_OPACITY_VAR}, 1) * ${layer.opacity})`,
            })}
            aria-hidden={layerIndex === activeLayerIndex ? undefined : true}
          >
            <div
              data-rmg-fs-entry-overlay-surface="true"
              style={surfaceStyle}
            >
              {renderOverlay({
                entry,
                entryIndex: link.entryIndex,
                mediaIndex: link.mediaIndex,
                link,
                opacity: layer.opacity,
                fsIndex: layer.index,
                style: surfaceStyle,
                containerProps: {
                  className: entriesObject.overlay?.className,
                  style: surfaceStyle,
                },
              })}
            </div>
          </div>
        );
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
    fadeOutMs = 300,
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
      root.render(
        renderFsEntryOverlayTree({
          layers,
          entriesObject,
          entryMap: entryMapRef.current,
          wrapperBaseStyle,
          overlayZoomMotion,
          viewportWidth,
          viewportHeight,
          fadeOutMs,
          resolveFsCaptionPlacement,
        })
      );
    },
    [
      entriesObject,
      entryMapRef,
      fadeOutMs,
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

      swapJobRef.current.raf = requestAnimationFrame(() => {
        commitLayers([{ ...outgoing, opacity: 0 }, { ...incoming, opacity: 1 }]);

        swapJobRef.current.t = window.setTimeout(() => {
          commitLayers([{ ...incoming, opacity: 1 }]);
          swapJobRef.current = { t: null, raf: 0 };
        }, fadeOutMs);
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

      if (prevEntryIndex !== nextEntryIndex) {
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
