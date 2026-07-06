'use client';

import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { MediaItem } from '../shared/types/media';
import type {
  FsCaptionPlacement,
  FsCaptionRenderArgs,
  FullscreenCaptionOptions,
} from './types';
import type { FSEvent } from './fullscreenSliderSub';
import type { FullscreenCaptionZoomMotion } from './captionZoomMotion';
import {
  effectiveViewportHeight,
  effectiveViewportWidth,
  resolveLengthFromResponsive,
  ResponsiveCaptionPlacement,
} from '../shared/responsive';
import { OverlayContentHeightStack } from '../shared/OverlayContentHeightStack';

const CAPTION_OVERLAY_OPACITY_VAR = '--rmg-fs-caption-overlay-opacity';
const DEFAULT_CAPTION_CROSSFADE_DURATION_MS = 300;
const DEFAULT_CAPTION_CROSSFADE_EASING = 'cubic-bezier(.4,0,.22,1)';
const CONTENT_CROSSFADE_OPACITY_EASING = 'linear';

type FsSubLike = {
  get: () => number;
  onEvent: (cb: (e: FSEvent) => void) => () => void;
};

type UseFsCaptionOverlayArgs = {
  enabled: boolean;
  fsSub: FsSubLike;
  items: MediaItem[];
  caption?: FullscreenCaptionOptions;
  isZoomed: boolean;
  captionZoomMotion?: FullscreenCaptionZoomMotion;
  viewportWidth: number;
  viewportHeight: number;
  interactive?: boolean;
  closing?: boolean;
  fadeOutMs?: number;
  wrapperBaseStyle?: React.CSSProperties;
  resolveFsCaptionPlacement: (
    placement: ResponsiveCaptionPlacement | undefined,
    breakpoint: number | undefined,
    viewportWidth: number
  ) => FsCaptionPlacement | null;
};

type UseFsCaptionOverlayReturn = {
  setMountEl: (el: HTMLDivElement | null) => void;
  setOpacity: (next: number) => void;
};

type FsCaptionOverlayProps = Omit<UseFsCaptionOverlayArgs, 'interactive'> & {
  interactive?: boolean;
};

type CaptionOverlayLayer = {
  key: number;
  index: number;
  opacity: number;
};

function normalizeCaptionOverlayIndex(index: number, length: number): number {
  if (!length) return index;
  return ((index % length) + length) % length;
}

type RenderFsCaptionOverlayTreeArgs = {
  layers: CaptionOverlayLayer[];
  items: MediaItem[];
  caption?: FullscreenCaptionOptions;
  isZoomed: boolean;
  captionZoomMotion?: FullscreenCaptionZoomMotion;
  viewportWidth: number;
  viewportHeight: number;
  fadeOutMs: number;
  fadeOutEasing: string;
  overlayOpacity?: number;
  wrapperBaseStyle?: React.CSSProperties;
  resolveFsCaptionPlacement: (
    placement: ResponsiveCaptionPlacement | undefined,
    breakpoint: number | undefined,
    viewportWidth: number
  ) => FsCaptionPlacement | null;
};

type RenderedCaptionLayer = {
  layer: CaptionOverlayLayer;
  node: React.ReactNode;
};

type CaptionShellProps = Record<string, unknown> & {
  children?: React.ReactNode;
};

type CaptionShellElement = React.ReactElement<CaptionShellProps>;

export function resolveFsCaptionOverlayCrossfadeTarget(
  caption: FullscreenCaptionOptions | undefined
): 'content' | 'overlay' {
  return caption?.overlayCrossfadeTarget ?? 'content';
}

export function resolveFsCaptionOverlayCrossfadeDurationMs(
  caption: FullscreenCaptionOptions | undefined,
  fallback = DEFAULT_CAPTION_CROSSFADE_DURATION_MS
): number {
  const duration = caption?.overlayCrossfadeDurationMs;
  return typeof duration === 'number' && Number.isFinite(duration)
    ? Math.max(0, duration)
    : fallback;
}

export function resolveFsCaptionOverlayCrossfadeEasing(
  caption: FullscreenCaptionOptions | undefined
): string {
  const easing = caption?.overlayCrossfadeEasing;
  return typeof easing === 'string' && easing.trim()
    ? easing
    : DEFAULT_CAPTION_CROSSFADE_EASING;
}

function buildCaptionOverlayShellStyle(args: {
  caption: FullscreenCaptionOptions | undefined;
  viewportWidth: number;
  viewportHeight: number;
  placement: FsCaptionPlacement | null | undefined;
  fadeOutMs: number;
  fadeOutEasing: string;
  opacity: string;
  wrapperBaseStyle?: React.CSSProperties;
}): React.CSSProperties {
  const {
    caption,
    viewportWidth,
    viewportHeight,
    placement,
    fadeOutMs,
    fadeOutEasing,
    opacity,
    wrapperBaseStyle,
  } = args;

  return {
    position: 'fixed',
    boxSizing: 'border-box',
    zIndex: 'calc(var(--rmg-fs-z, 9999) + 1)',
    ...overlayPositionForPlacement({
      placement,
      caption,
      viewportWidth,
      viewportHeight,
    }),
    opacity: opacity as any,
    transition:
      fadeOutMs > 0
        ? `opacity ${fadeOutMs}ms ${fadeOutEasing}`
        : undefined,
    willChange: fadeOutMs > 0 ? 'opacity' : undefined,
    pointerEvents: 'none',
    ...(wrapperBaseStyle ?? {}),
  };
}

function buildCaptionOverlaySurfaceStyle(args: {
  caption: FullscreenCaptionOptions | undefined;
  placement: FsCaptionPlacement | null | undefined;
  captionZoomMotion?: FullscreenCaptionZoomMotion;
}): React.CSSProperties {
  const { caption, placement, captionZoomMotion } = args;

  return {
    padding: '1.25rem 1.5rem',
    background: overlayGradientForPlacement(placement),
    color: '#fff',
    fontSize: '0.9rem',
    ...(caption?.style ?? {}),
    ...(captionZoomMotion?.contentStyle ?? {}),
    pointerEvents: 'none',
  };
}

function buildCaptionContentLayerStyle(args: {
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

function sameCaptionShellProps(
  a: CaptionShellProps,
  b: CaptionShellProps
) {
  const aKeys = Object.keys(a).filter((key) => key !== 'children');
  const bKeys = Object.keys(b).filter((key) => key !== 'children');

  if (aKeys.length !== bKeys.length) return false;

  for (const key of aKeys) {
    if (!bKeys.includes(key)) return false;

    const aValue = a[key];
    const bValue = b[key];

    if (key === 'style' && aValue && bValue && typeof aValue === 'object' && typeof bValue === 'object') {
      const aStyle = aValue as Record<string, unknown>;
      const bStyle = bValue as Record<string, unknown>;
      const aStyleKeys = Object.keys(aStyle);
      const bStyleKeys = Object.keys(bStyle);

      if (aStyleKeys.length !== bStyleKeys.length) return false;

      for (const styleKey of aStyleKeys) {
        if (aStyle[styleKey] !== bStyle[styleKey]) return false;
      }

      continue;
    }

    if (aValue !== bValue) return false;
  }

  return true;
}

function isCaptionShellElement(node: React.ReactNode): node is CaptionShellElement {
  return React.isValidElement<CaptionShellProps>(node) && node.type !== React.Fragment;
}

function canUseStableCaptionRootShell(
  renderedLayers: RenderedCaptionLayer[]
): renderedLayers is Array<RenderedCaptionLayer & { node: CaptionShellElement }> {
  if (!renderedLayers.length) return false;

  const [first] = renderedLayers;
  if (!first || !isCaptionShellElement(first.node)) return false;

  const firstNode = first.node;

  return renderedLayers.every(({ node }) => {
    if (!isCaptionShellElement(node)) return false;
    return (
      node.type === firstNode.type &&
      sameCaptionShellProps(firstNode.props, node.props)
    );
  });
}

export function renderFsCaptionOverlayTree(
  args: RenderFsCaptionOverlayTreeArgs
): React.ReactNode {
  const {
    layers,
    items,
    caption,
    isZoomed,
    captionZoomMotion,
    viewportWidth,
    viewportHeight,
    fadeOutMs,
    fadeOutEasing,
    wrapperBaseStyle,
    resolveFsCaptionPlacement,
  } = args;
  const overlayOpacity = args.overlayOpacity;
  const overlayOpacityValue =
    overlayOpacity == null
      ? `var(${CAPTION_OVERLAY_OPACITY_VAR}, 1)`
      : String(overlayOpacity);

  const renderCaption = caption?.render;
  if (typeof renderCaption !== 'function' || !layers.length) {
    return null;
  }

  const renderedLayers: RenderedCaptionLayer[] = layers.flatMap((layer) => {
    const item = items[layer.index];
    if (!item) return [];

    return [
      {
        layer,
        node: renderCaption({
          item,
          index: layer.index,
          isZoomed,
        } satisfies FsCaptionRenderArgs),
      },
    ];
  });

  if (!renderedLayers.length) {
    return null;
  }

  const effectivePlacement = resolveFsCaptionPlacement(
    caption?.placement,
    caption?.breakpoint,
    viewportWidth
  );
  const crossfadeTarget = resolveFsCaptionOverlayCrossfadeTarget(caption);
  const isContentCrossfade = crossfadeTarget === 'content';
  const activeLayerIndex = renderedLayers.length - 1;
  const shellClassName = caption?.className;
  const captionInteractive = captionZoomMotion?.interactive ?? true;
  const surfaceStyle = buildCaptionOverlaySurfaceStyle({
    caption,
    placement: effectivePlacement,
    captionZoomMotion,
  });
  const canUseStableShell = canUseStableCaptionRootShell(renderedLayers);

  if (isContentCrossfade) {
    const stableCaptionShell = canUseStableShell
      ? renderedLayers[activeLayerIndex]?.node ?? null
      : null;
    const activeLayer = renderedLayers[activeLayerIndex]?.layer;
    const activeLayerKey = activeLayer?.key ?? 'active';
    const activeLayerReady = (activeLayer?.opacity ?? 1) > 0;

    return (
      <div
        data-rmg-fs-caption="true"
        data-rmg-fs-caption-overlay="true"
        className={shellClassName}
        style={buildCaptionOverlayShellStyle({
          caption,
          viewportWidth,
          viewportHeight,
          placement: effectivePlacement,
          fadeOutMs,
          fadeOutEasing,
          opacity: overlayOpacityValue,
          wrapperBaseStyle,
        })}
        aria-hidden={captionInteractive ? undefined : true}
      >
        <div
          data-rmg-fs-caption-surface="true"
          style={surfaceStyle}
        >
          {stableCaptionShell && isCaptionShellElement(stableCaptionShell)
            ? React.cloneElement(
                stableCaptionShell,
                stableCaptionShell.props,
                <OverlayContentHeightStack
                  activeKey={activeLayerKey}
                  activeReady={activeLayerReady}
                  durationMs={fadeOutMs}
                  easing={fadeOutEasing}
                >
                  {renderedLayers.map(({ layer, node }, layerIndex) => {
                    const contentChildren =
                      isCaptionShellElement(node)
                        ? node.props.children
                        : node;

                    return (
                      <div
                        key={layer.key}
                        data-rmg-fs-caption-content="true"
                        data-rmg-overlay-height-layer-key={String(layer.key)}
                        data-rmg-overlay-height-active={
                          layerIndex === activeLayerIndex ? 'true' : undefined
                        }
                        style={buildCaptionContentLayerStyle({
                          opacity: layer.opacity,
                          fadeOutMs,
                          fadeOutEasing,
                          stacked: true,
                          active: layerIndex === activeLayerIndex,
                        })}
                        aria-hidden={
                          layerIndex === activeLayerIndex && captionInteractive
                            ? undefined
                            : true
                        }
                      >
                        {contentChildren}
                      </div>
                    );
                  })}
                </OverlayContentHeightStack>
              )
            : (
                <OverlayContentHeightStack
                  activeKey={activeLayerKey}
                  activeReady={activeLayerReady}
                  durationMs={fadeOutMs}
                  easing={fadeOutEasing}
                >
                  {renderedLayers.map(({ layer, node }, layerIndex) => (
                    <div
                      key={layer.key}
                      data-rmg-fs-caption-content="true"
                      data-rmg-overlay-height-layer-key={String(layer.key)}
                      data-rmg-overlay-height-active={
                        layerIndex === activeLayerIndex ? 'true' : undefined
                      }
                      style={buildCaptionContentLayerStyle({
                        opacity: layer.opacity,
                        fadeOutMs,
                        fadeOutEasing,
                        stacked: true,
                        active: layerIndex === activeLayerIndex,
                      })}
                      aria-hidden={
                        layerIndex === activeLayerIndex && captionInteractive
                          ? undefined
                          : true
                      }
                    >
                      {node}
                    </div>
                  ))}
                </OverlayContentHeightStack>
              )}
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
            data-rmg-fs-caption="true"
            data-rmg-fs-caption-overlay="true"
            className={shellClassName}
            style={buildCaptionOverlayShellStyle({
              caption,
              viewportWidth,
              viewportHeight,
              placement: effectivePlacement,
              fadeOutMs,
              fadeOutEasing,
              opacity:
                overlayOpacity == null
                  ? `calc(var(${CAPTION_OVERLAY_OPACITY_VAR}, 1) * ${layer.opacity})`
                  : String(overlayOpacity * layer.opacity),
              wrapperBaseStyle,
            })}
            aria-hidden={
              layerIndex === activeLayerIndex && captionInteractive
                ? undefined
                : true
            }
          >
            <div
              data-rmg-fs-caption-surface="true"
              style={surfaceStyle}
            >
              <div
                data-rmg-fs-caption-content="true"
                style={buildCaptionContentLayerStyle({
                  opacity: 1,
                  fadeOutMs: 0,
                  fadeOutEasing,
                  stacked: false,
                  active: true,
                })}
              >
                {node}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

export function FsCaptionOverlay(props: FsCaptionOverlayProps) {
  const {
    enabled,
    fsSub,
    items,
    caption,
    isZoomed,
    captionZoomMotion,
    viewportWidth,
    viewportHeight,
    closing,
    fadeOutMs: fadeOutMsProp,
    wrapperBaseStyle,
    resolveFsCaptionPlacement,
  } = props;

  const fadeOutMs = resolveFsCaptionOverlayCrossfadeDurationMs(caption, fadeOutMsProp);
  const fadeOutEasing = resolveFsCaptionOverlayCrossfadeEasing(caption);
  const [layers, setLayers] = React.useState<CaptionOverlayLayer[]>(() => [
    {
      key: 1,
      index: normalizeCaptionOverlayIndex(fsSub.get(), items.length),
      opacity: 1,
    },
  ]);
  const [overlayOpacity, setOverlayOpacity] = React.useState(0);
  const layersRef = React.useRef<CaptionOverlayLayer[]>(layers);
  const fsIndexRef = React.useRef<number>(
    normalizeCaptionOverlayIndex(fsSub.get(), items.length)
  );
  const layerKeyRef = React.useRef(1);
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

  const commitLayers = React.useCallback((nextLayers: CaptionOverlayLayer[]) => {
    layersRef.current = nextLayers;
    setLayers(nextLayers);
  }, []);

  const normalizeFsIndex = React.useCallback((index: number) => {
    return normalizeCaptionOverlayIndex(index, items.length);
  }, [items.length]);

  const buildLayer = React.useCallback((index: number, opacity = 1): CaptionOverlayLayer => ({
    key: ++layerKeyRef.current,
    index,
    opacity,
  }), []);

  const getCurrentVisibleLayer = React.useCallback((fallbackIndex: number) => {
    const current = layersRef.current;
    const visibleLayer = current.reduce<CaptionOverlayLayer | null>((best, layer) => {
      if (!best || layer.opacity > best.opacity) return layer;
      return best;
    }, null);

    return visibleLayer ?? buildLayer(fallbackIndex);
  }, [buildLayer]);

  const showCaptionForIndex = React.useCallback((index: number) => {
    const activeLayer = layersRef.current[layersRef.current.length - 1];
    commitLayers([activeLayer ? { ...activeLayer, index, opacity: 1 } : buildLayer(index)]);
  }, [buildLayer, commitLayers]);

  const crossfadeCaptionToIndex = React.useCallback((nextIndex: number) => {
    if (closing) return;

    cancelSwapJob();

    const outgoing = getCurrentVisibleLayer(fsIndexRef.current);
    const incoming = buildLayer(nextIndex, 0);

    commitLayers([{ ...outgoing, opacity: 1 }, incoming]);

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
    showCaptionForIndex(start);
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
      if (next === fsIndexRef.current) return;

      fsIndexRef.current = next;
      crossfadeCaptionToIndex(next);
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
    crossfadeCaptionToIndex,
    enabled,
    fadeOutMs,
    fsSub,
    normalizeFsIndex,
    showCaptionForIndex,
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
      {renderFsCaptionOverlayTree({
        layers,
        items,
        caption,
        isZoomed,
        captionZoomMotion,
        viewportWidth,
        viewportHeight,
        fadeOutMs,
        fadeOutEasing,
        overlayOpacity,
        wrapperBaseStyle,
        resolveFsCaptionPlacement,
      })}
    </>
  );
}

function overlayGradientForPlacement(p: FsCaptionPlacement | null | undefined): string {
  if (p === 'top') return 'linear-gradient(to bottom, rgba(0,0,0,0.75), transparent)';
  if (p === 'left') return 'linear-gradient(to right, rgba(0,0,0,0.75), transparent)';
  if (p === 'right') return 'linear-gradient(to left, rgba(0,0,0,0.75), transparent)';
  return 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)';
}

function overlayPositionForPlacement(args: {
  placement: FsCaptionPlacement | null | undefined;
  caption: FullscreenCaptionOptions | undefined;
  viewportWidth: number;
  viewportHeight: number;
}): React.CSSProperties {
  const { placement, caption, viewportWidth, viewportHeight } = args;
  const resolvedViewportWidth = effectiveViewportWidth(viewportWidth);
  const resolvedViewportHeight = effectiveViewportHeight(viewportHeight);

  const sideWidth = resolveLengthFromResponsive(
    caption?.width,
    280,
    resolvedViewportWidth,
    resolvedViewportWidth
  );
  const topBottomHeight =
    caption?.height == null
      ? undefined
      : resolveLengthFromResponsive(
          caption.height,
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

export function useFsCaptionOverlay(
  args: UseFsCaptionOverlayArgs
): UseFsCaptionOverlayReturn {
  const {
    enabled,
    fsSub,
    items,
    caption,
    isZoomed,
    captionZoomMotion,
    viewportWidth,
    viewportHeight,
    interactive,
    closing,
    fadeOutMs: fadeOutMsProp,
    wrapperBaseStyle,
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
  const layersRef = React.useRef<CaptionOverlayLayer[]>([]);
  const fadeOutMs = resolveFsCaptionOverlayCrossfadeDurationMs(caption, fadeOutMsProp);
  const fadeOutEasing = resolveFsCaptionOverlayCrossfadeEasing(caption);

  const setCaptionOverlayOpacity = React.useCallback((next: number) => {
    const el = mountRef.current;
    if (!el) return;
    el.style.setProperty(CAPTION_OVERLAY_OPACITY_VAR, String(next));
  }, []);

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
    (index: number, opacity = 1): CaptionOverlayLayer => ({
      key: ++layerKeyRef.current,
      index,
      opacity,
    }),
    []
  );

  const renderCaptionLayers = React.useCallback(
    (layers: CaptionOverlayLayer[]) => {
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
      if (!root) return;

      const tree = renderFsCaptionOverlayTree({
        layers,
        items,
        caption,
        isZoomed,
        captionZoomMotion,
        viewportWidth,
        viewportHeight,
        fadeOutMs,
        fadeOutEasing,
        wrapperBaseStyle,
        resolveFsCaptionPlacement,
      });

      root.render(tree);
    },
    [
      caption,
      fadeOutMs,
      fadeOutEasing,
      interactive,
      items,
      isZoomed,
      captionZoomMotion,
      resolveFsCaptionPlacement,
      restorePendingRootForMount,
      scheduleRootUnmount,
      viewportWidth,
      viewportHeight,
      wrapperBaseStyle,
    ]
  );

  const commitLayers = React.useCallback(
    (layers: CaptionOverlayLayer[]) => {
      layersRef.current = layers;
      renderCaptionLayers(layers);
    },
    [renderCaptionLayers]
  );

  const renderCaptionForIndex = React.useCallback(
    (index: number) => {
      const activeLayer = layersRef.current[layersRef.current.length - 1];
      commitLayers([activeLayer ? { ...activeLayer, index, opacity: 1 } : buildLayer(index)]);
    },
    [buildLayer, commitLayers]
  );

  const crossfadeCaptionToIndex = React.useCallback(
    (nextIndex: number) => {
      if (closing) return;

      cancelSwapJob();

      const outgoing =
        layersRef.current[layersRef.current.length - 1] ?? buildLayer(fsIndexRef.current);
      const incoming = buildLayer(nextIndex, 0);

      commitLayers([{ ...outgoing, opacity: 1 }, incoming]);

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
    [buildLayer, cancelSwapJob, commitLayers, closing, fadeOutMs]
  );

  const setMountEl = React.useCallback(
    (el: HTMLDivElement | null) => {
      mountRef.current = el;

      if (el) {
        restorePendingRootForMount(el);

        el.style.setProperty(CAPTION_OVERLAY_OPACITY_VAR, '0');

        if (enabled) {
          if (layersRef.current.length) {
            renderCaptionLayers(layersRef.current);
          } else {
            renderCaptionForIndex(fsIndexRef.current);
          }
          requestAnimationFrame(() => setCaptionOverlayOpacity(closing ? 0 : 1));
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
      renderCaptionForIndex,
      renderCaptionLayers,
      restorePendingRootForMount,
      scheduleRootUnmount,
      setCaptionOverlayOpacity,
    ]
  );

  React.useEffect(() => {
    if (closing) {
      cancelSwapJob();
      setCaptionOverlayOpacity(0);
      return;
    }
    if (!enabled) return;

    const start = fsSub.get();
    fsIndexRef.current = start;

    renderCaptionForIndex(start);
    requestAnimationFrame(() => setCaptionOverlayOpacity(1));

    const off = fsSub.onEvent((event) => {
      if (event.type !== 'internalIndex') return;

      const next = event.index;
      if (next === fsIndexRef.current && layersRef.current.length) return;

      fsIndexRef.current = next;
      crossfadeCaptionToIndex(next);
    });

    return () => {
      cancelSwapJob();
      off();
    };
  }, [
    cancelSwapJob,
    closing,
    enabled,
    crossfadeCaptionToIndex,
    fsSub,
    renderCaptionForIndex,
    setCaptionOverlayOpacity,
  ]);

  React.useEffect(() => {
    if (!enabled || closing) return;
    if (layersRef.current.length) {
      renderCaptionLayers(layersRef.current);
      return;
    }
    renderCaptionForIndex(fsIndexRef.current);
  }, [enabled, closing, renderCaptionForIndex, renderCaptionLayers]);

  React.useEffect(() => {
    return () => {
      clearPendingUnmount();
    };
  }, [clearPendingUnmount]);

  return { setMountEl, setOpacity: setCaptionOverlayOpacity };
}
