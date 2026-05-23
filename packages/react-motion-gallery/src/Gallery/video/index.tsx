'use client';

import * as React from 'react';
import { Plyr } from './LazyPlyr';
import { VideoCloneSnapshot } from './VideoCloneSnapshot';
import { useRmgSlide } from '../shared/slideContext';
import { bindEmbedReady, detectProvider } from './plyr';
import type { APITypes, PlyrOptions, PlyrSource } from './plyrTypes';
import { createVideoSnapshotStore } from './videoSnapshotStore';
import { installDragClickSwallower } from './plyrGuards';
import styles from './index.module.css';
import { useOptionalGalleryCore } from '../core';

export type RmgPlyrSourceBuilder = (args: { src: string }) => PlyrSource;

export type RmgPlyrOptionsResolver =
  | PlyrOptions
  | ((args: { src: string; index: number }) => PlyrOptions);

export type RmgVideoLazyLoadOptions = {
  enabled?: boolean;
  spinner?:
    | boolean
    | React.ReactNode
    | ((args: { kind: 'image' | 'video'; isClone: boolean }) => React.ReactNode);
  spinnerClassName?: string;
  spinnerStyle?: React.CSSProperties;
};

export type VideoProps = {
  src: string;
  poster?: string;
  alt?: string;
  source?: PlyrSource;
  sourceBuilder?: RmgPlyrSourceBuilder;
  options?: RmgPlyrOptionsResolver;
  className?: string;
  style?: React.CSSProperties;
  onApi?: (api: APITypes | null) => void;
  registerApiByIndex?: (index: number, api: APITypes | null) => void;
  lazyLoad?: RmgVideoLazyLoadOptions;
};

const baseWrap: React.CSSProperties = { width: '100%', height: '100%' };
const PLAYER_FADE_MS = 280;
const SPINNER_FADE_MS = 180;

function useSlideRevealedGate() {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = React.useState(false);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const slide = el.closest<HTMLElement>('[data-rmg-slide="true"]');
    if (!slide) {
      setRevealed(true);
      return;
    }

    if (!slide.hasAttribute('data-rmg-lazyload')) {
      setRevealed(true);
      return;
    }

    const check = () => setRevealed(slide.getAttribute('data-rmg-lazyloaded') === 'true');
    check();

    const mo = new MutationObserver(check);
    mo.observe(slide, {
      attributes: true,
      attributeFilter: ['data-rmg-lazyloaded', 'data-rmg-lazyload'],
    });
    return () => mo.disconnect();
  }, []);

  return { ref, revealed };
}

function parsePlyrRatio(r: unknown): number | null {
  // Accept:
  // - "16:9"
  // - "4/3"
  // - 1.777...
  // - { w: 16, h: 9 } (optional)
  if (typeof r === "number" && Number.isFinite(r) && r > 0) return r;

  if (typeof r === "string") {
    const s = r.trim();
    const mColon = s.match(/^(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)$/);
    if (mColon) {
      const w = parseFloat(mColon[1]);
      const h = parseFloat(mColon[2]);
      if (w > 0 && h > 0) return w / h;
    }

    const mSlash = s.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
    if (mSlash) {
      const w = parseFloat(mSlash[1]);
      const h = parseFloat(mSlash[2]);
      if (w > 0 && h > 0) return w / h;
    }

    const asNum = Number(s);
    if (Number.isFinite(asNum) && asNum > 0) return asNum;
  }

  if (typeof r === "object" && r) {
    const w = (r as any).w ?? (r as any).width;
    const h = (r as any).h ?? (r as any).height;
    if (typeof w === "number" && typeof h === "number" && w > 0 && h > 0) {
      return w / h;
    }
  }

  return null;
}

function useViewportRoot(ref: React.RefObject<HTMLElement | null>) {
  const rootRef = React.useRef<Element | null>(null);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    rootRef.current = el.closest('[data-rmg-viewport="true"]');
  }, [ref]);

  return rootRef;
}

function resolveOptions(
  options: VideoProps['options'],
  args: { src: string; index: number; forceCrossorigin?: boolean }
): PlyrOptions | undefined {
  const resolved = typeof options === 'function' ? options(args) : options;
  if (!resolved) {
    return args.forceCrossorigin
      ? ({
          crossorigin: true,
          autoplay: false,
          preload: 'none',
        } as any)
      : resolved;
  }

  const autoplay = (resolved as any).autoplay ?? false;

  const next = {
    ...(resolved as any),
    autoplay,
    preload: (resolved as any).preload ?? (autoplay ? 'auto' : 'none'),
  } as any;

  if (args.forceCrossorigin && next.crossorigin == null) {
    next.crossorigin = true;
  }

  return next as any;
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

function setPlayerVisible(playerEl: HTMLElement | null, visible: boolean) {
  if (!playerEl) return;
  playerEl.style.opacity = visible ? '1' : '0';
}

function clearTimer(timerRef: React.MutableRefObject<number | null>) {
  if (timerRef.current == null) return;
  window.clearTimeout(timerRef.current);
  timerRef.current = null;
}

function showSpinner(
  spinnerEl: HTMLElement | null,
  hideTimerRef: React.MutableRefObject<number | null>
) {
  if (!spinnerEl) return;
  clearTimer(hideTimerRef);
  spinnerEl.style.setProperty('animation-play-state', 'running', 'important');
  spinnerEl.style.setProperty('opacity', '1', 'important');
  spinnerEl.style.setProperty('visibility', 'visible', 'important');
  spinnerEl.style.setProperty('pointer-events', 'none', 'important');
}

function hideSpinner(
  spinnerEl: HTMLElement | null,
  hideTimerRef: React.MutableRefObject<number | null>,
  onHidden?: () => void
) {
  if (!spinnerEl) {
    onHidden?.();
    return;
  }

  clearTimer(hideTimerRef);
  spinnerEl.style.setProperty('animation-play-state', 'paused', 'important');
  spinnerEl.style.setProperty('opacity', '0', 'important');
  spinnerEl.style.setProperty('pointer-events', 'none', 'important');

  hideTimerRef.current = window.setTimeout(() => {
    hideTimerRef.current = null;
    spinnerEl.style.setProperty('visibility', 'hidden', 'important');
    onHidden?.();
  }, SPINNER_FADE_MS);
}

function pauseApi(api: APITypes | null) {
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

function isApiMediaReady(api: APITypes | null) {
  const plyr = (api as any)?.plyr ?? api;
  if (!plyr) return false;

  try {
    const media: HTMLMediaElement | undefined = plyr?.media;
    if (!media) return false;

    const readyState = Number(media.readyState ?? 0);
    const videoWidth = Number((media as any).videoWidth ?? 0);
    const videoHeight = Number((media as any).videoHeight ?? 0);

    return readyState >= 1 || (videoWidth > 0 && videoHeight > 0);
  } catch {
    return false;
  }
}

function resolveSpinnerNode(
  spinner: RmgVideoLazyLoadOptions['spinner'] | undefined,
  args: { kind: 'image' | 'video'; isClone: boolean }
): { render: boolean; node: React.ReactNode | null; isCustom: boolean } {
  if (spinner === false) return { render: false, node: null, isCustom: false };
  if (typeof spinner === 'function') return { render: true, node: spinner(args), isCustom: true };
  if (spinner === true || spinner == null) return { render: true, node: null, isCustom: false };
  return { render: true, node: spinner, isCustom: true };
}

export function Video(props: VideoProps) {
  const ctx = useRmgSlide();
  const isClone = ctx?.isClone ?? false;
  const index = ctx?.normIdx ?? 0;
  const storeBag = ctx?.storeBag;
  const registerApiByIndex = props.registerApiByIndex ?? ctx?.registerApiByIndex;
  const videoSnapshotStore = React.useMemo(() => {
    if (!storeBag) return null;

    return storeBag.getOrCreate(
      'rmg-video-snapshot-store',
      createVideoSnapshotStore,
      (store) => {
        store.destroy();
      }
    );
  }, [storeBag]);

  const apiRef = React.useRef<APITypes | null>(null);
  const playerWrapRef = React.useRef<HTMLDivElement | null>(null);
  const visibleRef = React.useRef(false);
  const mountedRef = React.useRef(false);
  const readyRef = React.useRef(false);
  const { ref: gateRef, revealed } = useSlideRevealedGate();
  const viewportRootRef = useViewportRoot(gateRef as any);
  const [everMounted, setEverMounted] = React.useState(false);
  const [fsPrewarmIntent, setFsPrewarmIntent] = React.useState(false);
  const lazy = props.lazyLoad;
  const lazyEnabled = lazy?.enabled !== false; // default true

  const spinnerResolved = React.useMemo(() => {
    return resolveSpinnerNode(lazy?.spinner, { kind: 'video', isClone });
  }, [lazy?.spinner, isClone]);

  const shouldRenderSpinner = lazyEnabled && spinnerResolved.render;

  const core = useOptionalGalleryCore();
  const isFullscreenOpen = core?.isFullscreenOpen ?? false;
  const isFullscreenOpenRef = core?.isFullscreenOpenRef ?? null;
  const shouldSuspendBasePlayer = !isClone && isFullscreenOpen;

  const baseIdxRef = React.useRef<number | null>(null);
  const notifySeenRef = React.useRef(false);
  const fsPreloadSeenRef = React.useRef(false);

  React.useLayoutEffect(() => {
    const el = gateRef.current as HTMLElement | null;
    if (!el) return;

    const slideEl = el.closest<HTMLElement>('[data-rmg-slide="true"]');
    if (!slideEl) return;

    const idxAttr = slideEl.getAttribute('data-rmg-idx');
    const idx = idxAttr != null ? parseInt(idxAttr, 10) : NaN;
    if (!Number.isFinite(idx)) return;

    baseIdxRef.current = idx;
  }, []);

  const promoteLazyVideoShell = React.useCallback(() => {
    if (!lazyEnabled) return;

    const el = gateRef.current as HTMLElement | null;
    if (!el) return;

    const slideEl = el.closest<HTMLElement>('[data-rmg-slide="true"]');
    if (!slideEl) return;

    const kind = slideEl.getAttribute('data-rmg-kind');
    const isVideoShell = kind === 'video' || !!slideEl.querySelector('[data-rmg-plyr="true"]');
    if (!isVideoShell) return;

    if (!slideEl.hasAttribute('data-rmg-lazyload')) return;
    if (slideEl.getAttribute('data-rmg-lazyloaded') === 'true') return;

    slideEl.setAttribute('data-rmg-lazyloaded', 'true');
    slideEl.removeAttribute('aria-busy');

    const shellSpinner = slideEl.querySelector<HTMLElement>('[data-rmg-spinner]');
    if (shellSpinner) shellSpinner.style.display = 'none';
  }, [gateRef, lazyEnabled]);

  React.useEffect(() => {
    fsPreloadSeenRef.current = false;
    setFsPrewarmIntent(false);
  }, [props.src, props.poster]);

  const preloadFromFsVisible = React.useCallback(() => {
    if (fsPreloadSeenRef.current) return;
    fsPreloadSeenRef.current = true;

    const poster = props.poster ?? null;
    if (poster) {
      try {
        const img = new Image();
        img.decoding = 'async';
        (img as any).fetchPriority = 'high';
        img.src = poster;
        void img.decode().catch(() => {});
      } catch {}
    }

    const mp4 = props.src;
    if (typeof mp4 !== 'string' || !mp4) return;

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

      window.setTimeout(() => {
        try {
          v.removeAttribute('src');
          v.load();
        } catch {}
      }, 1500);
    } catch {}
  }, [props.poster, props.src]);

  React.useEffect(() => {
    if (isClone) return;
    if (!core) return;

    const off = core.fsVisibleSub.subscribe((evt) => {
      const idx = evt?.index;
      if (typeof idx !== 'number' || !Number.isFinite(idx)) return;
      if (idx !== baseIdxRef.current) return;
      setFsPrewarmIntent(true);
      preloadFromFsVisible();
    });

    return () => off?.();
  }, [core, isClone, preloadFromFsVisible]);

  React.useEffect(() => {
    if (!core) return;
    if (!lazyEnabled) return;

    const off = core.baseVisibleSub.subscribe((evt) => {
      const idx = evt?.index;
      if (typeof idx !== 'number' || !Number.isFinite(idx)) return;
      if (idx !== baseIdxRef.current) return;

      promoteLazyVideoShell();
      setFsPrewarmIntent(true);
    });

    return () => off?.();
  }, [core, lazyEnabled, promoteLazyVideoShell]);

  const source: PlyrSource = React.useMemo(() => {
    return (
      props.source ??
      props.sourceBuilder?.({ src: props.src }) ??
      ({
        type: 'video',
        poster: props.poster,
        sources: [{ src: props.src, type: 'video/mp4' }],
      } as any)
    );
  }, [props.source, props.sourceBuilder, props.src, props.poster]);

  const provider = React.useMemo(() => detectProvider(source), [source]);
  const posterSrc = React.useMemo(() => {
    const explicitPoster =
      typeof props.poster === 'string' && props.poster.trim().length > 0 ? props.poster : null;
    const sourcePoster =
      typeof (source as any)?.poster === 'string' && String((source as any).poster).trim().length > 0
        ? String((source as any).poster)
        : null;

    return explicitPoster ?? sourcePoster;
  }, [props.poster, source]);
  const subscribeVideoSnapshot = React.useCallback(
    (listener: () => void) => {
      if (isClone || !videoSnapshotStore) return () => {};
      return videoSnapshotStore.subscribe(index, listener);
    },
    [index, isClone, videoSnapshotStore]
  );
  const getVideoSnapshot = React.useCallback(() => {
    if (isClone || !videoSnapshotStore) return null;
    return videoSnapshotStore.getSnapshot(index);
  }, [index, isClone, videoSnapshotStore]);
  const getServerVideoSnapshot = React.useCallback(() => null, []);
  const videoSnapshot = React.useSyncExternalStore(
    subscribeVideoSnapshot,
    getVideoSnapshot,
    getServerVideoSnapshot
  );
  const shouldUsePosterShield = React.useMemo(() => {
    if (!posterSrc) return false;
    return provider === 'youtube' || provider === 'vimeo';
  }, [posterSrc, provider]);
  const shouldForceSnapshotCrossorigin = React.useMemo(() => {
    if (isClone) return false;
    if (!videoSnapshotStore) return false;
    if (provider !== 'mp4') return false;
    return isCrossOriginMediaUrl(props.src);
  }, [isClone, props.src, provider, videoSnapshotStore]);

  const options = React.useMemo(() => {
    return resolveOptions(props.options, {
      src: props.src,
      index,
      forceCrossorigin: shouldForceSnapshotCrossorigin,
    });
  }, [index, props.options, props.src, shouldForceSnapshotCrossorigin]);
  const autoplayEnabled = React.useMemo(() => Boolean((options as any)?.autoplay), [options]);

  const ratio = React.useMemo(() => parsePlyrRatio((options as any)?.ratio ?? null), [options]);
  const [posterShieldVisible, setPosterShieldVisible] = React.useState(shouldUsePosterShield);
  const posterHideTimeoutRef = React.useRef<number | null>(null);
  const spinnerHideTimeoutRef = React.useRef<number | null>(null);

  const resolveReady = React.useCallback((api: APITypes | null = apiRef.current) => {
    if (readyRef.current) return true;
    if (!isApiMediaReady(api)) return false;
    readyRef.current = true;
    return true;
  }, []);

  const syncRuntimeRegistration = React.useCallback(
    (api: APITypes | null) => {

      if (!videoSnapshotStore) return;
      if (isClone) return;

      const hostEl = gateRef.current;
      if (!api || !hostEl) {
        videoSnapshotStore.unregisterOriginal(index);
        return;
      }

      videoSnapshotStore.registerOriginal({
        canonicalIndex: index,
        api,
        hostEl,
        provider,
        src: props.src,
        poster: props.poster,
        ratio,
      });
    },
    [gateRef, index, isClone, props.poster, props.src, provider, ratio, videoSnapshotStore]
  );

  const clearPosterHideTimeout = React.useCallback(() => {
    clearTimer(posterHideTimeoutRef);
  }, []);

  const clearSpinnerHideTimeout = React.useCallback(() => {
    clearTimer(spinnerHideTimeoutRef);
  }, []);

  React.useLayoutEffect(() => {
    clearPosterHideTimeout();
    clearSpinnerHideTimeout();
    setPosterShieldVisible(shouldUsePosterShield);
  }, [clearPosterHideTimeout, clearSpinnerHideTimeout, props.src, shouldUsePosterShield]);

  React.useEffect(() => {
    return () => {
      clearPosterHideTimeout();
      clearSpinnerHideTimeout();
    };
  }, [clearPosterHideTimeout, clearSpinnerHideTimeout]);

  React.useEffect(() => {
    syncRuntimeRegistration(apiRef.current);

    return () => {
      syncRuntimeRegistration(null);
    };
  }, [syncRuntimeRegistration]);

  const getSpinnerEl = React.useCallback(() => {
    if (!shouldRenderSpinner) return null;
    const gateEl = gateRef.current as HTMLElement | null;
    return gateEl?.querySelector<HTMLElement>('[data-rmg-video-spinner]') ?? null;
  }, [gateRef, shouldRenderSpinner]);

  const syncSpinner = React.useCallback(
    (wantVisible: boolean, onHidden?: () => void) => {
      const nextVisible = wantVisible && !shouldSuspendBasePlayer;

      if (!shouldRenderSpinner) {
        if (!nextVisible) onHidden?.();
        return;
      }
      const el = getSpinnerEl();
      if (!el) {
        if (!nextVisible) onHidden?.();
        return;
      }
      if (nextVisible) showSpinner(el, spinnerHideTimeoutRef);
      else hideSpinner(el, spinnerHideTimeoutRef, onHidden);
    },
    [getSpinnerEl, shouldRenderSpinner, shouldSuspendBasePlayer]
  );

  const pauseForFullscreenOpen = React.useCallback(
    (api: APITypes | null = apiRef.current) => {
      if (isClone) return;
      if (!(isFullscreenOpenRef?.current ?? isFullscreenOpen)) return;
      pauseApi(api);
    },
    [isClone, isFullscreenOpen, isFullscreenOpenRef]
  );

  const tryAutoplay = React.useCallback(
    (api: APITypes | null = apiRef.current) => {
      if (!autoplayEnabled) return;
      if (isClone) return;
      if (!visibleRef.current) return;
      if (isFullscreenOpenRef?.current ?? isFullscreenOpen) return;

      const plyr = (api as any)?.plyr ?? api;
      if (!plyr) return;

      try {
        const muted = (options as any)?.muted;
        if (typeof muted === 'boolean') {
          plyr.muted = muted;
        }
      } catch {}

      try {
        const media: HTMLMediaElement | undefined = plyr?.media;
        if (media) {
          media.autoplay = true;
          media.setAttribute('autoplay', '');

          if ((options as any)?.muted) {
            media.muted = true;
            media.setAttribute('muted', '');
          }

          if ((options as any)?.playsinline !== false) {
            (media as HTMLVideoElement).playsInline = true;
            media.setAttribute('playsinline', '');
            media.setAttribute('webkit-playsinline', '');
          }
        }
      } catch {}

      requestAnimationFrame(() => {
        try {
          const result = plyr.play?.();
          if (result && typeof result.catch === 'function') {
            result.catch(() => {});
          }
        } catch {}
      });
    },
    [autoplayEnabled, isClone, isFullscreenOpen, isFullscreenOpenRef, options]
  );

  const markReady = React.useCallback(() => {
    if (readyRef.current) return;
    readyRef.current = true;

    requestAnimationFrame(() => {
      clearPosterHideTimeout();
      syncSpinner(false, () => {
        requestAnimationFrame(() => {
          setPlayerVisible(playerWrapRef.current, true);
          setPosterShieldVisible(false);
          pauseForFullscreenOpen();
          tryAutoplay();
        });
      });
    });
  }, [clearPosterHideTimeout, pauseForFullscreenOpen, syncSpinner, tryAutoplay]);

  React.useEffect(() => {
    if (!isFullscreenOpen) return;
    pauseForFullscreenOpen();
  }, [isFullscreenOpen, pauseForFullscreenOpen]);

  React.useEffect(() => {
    if (!shouldSuspendBasePlayer) return;

    pauseApi(apiRef.current);
    setPlayerVisible(playerWrapRef.current, false);
    syncSpinner(false);
  }, [shouldSuspendBasePlayer, syncSpinner]);

  React.useEffect(() => {
    if (isClone || shouldSuspendBasePlayer || !everMounted) return;

    requestAnimationFrame(() => {
      const ready = resolveReady();
      setPlayerVisible(playerWrapRef.current, ready);
      syncSpinner(!ready);
      if (ready) tryAutoplay();
    });
  }, [everMounted, isClone, resolveReady, shouldSuspendBasePlayer, syncSpinner, tryAutoplay]);

  const readyCleanupRef = React.useRef<(() => void) | null>(null);
  const guardedPlyrRef = React.useRef<any>(null);

  const cleanupDragSwallowGuard = React.useCallback(() => {
    const guardedPlyr = guardedPlyrRef.current;
    if (!guardedPlyr) return;

    try {
      guardedPlyr.__rmgDragSwallowCleanup?.();
    } catch {}

    guardedPlyrRef.current = null;
  }, []);

  const handlePlyrRef = React.useCallback(
    (api: any) => {
      readyCleanupRef.current?.();
      readyCleanupRef.current = null;

      const apiOrNull = (api ?? null) as APITypes | null;
      apiRef.current = apiOrNull;
      syncRuntimeRegistration(apiOrNull);

      props.onApi?.(apiOrNull);
      registerApiByIndex?.(index, apiOrNull);
      pauseForFullscreenOpen(apiOrNull);

      requestAnimationFrame(() => {
        const ready = resolveReady(apiOrNull);
        setPlayerVisible(playerWrapRef.current, ready);
        syncSpinner(!ready);
      });

      if (!api) {
        cleanupDragSwallowGuard();
        return;
      }

      const plyr = (api as any)?.plyr ?? api;
      if (guardedPlyrRef.current !== plyr) {
        cleanupDragSwallowGuard();
        installDragClickSwallower(plyr);
        guardedPlyrRef.current = plyr;
      }

      const provider = detectProvider(source);

      try {
        // YOUTUBE / VIMEO:
        // Native provider controls skip Plyr's ready event, so we also
        // listen to the embed surface itself becoming interactive.
        if (provider === 'youtube' || provider === 'vimeo') {
          readyCleanupRef.current = bindEmbedReady(plyr, markReady, {
            provider,
            posterSrc,
          });

          return;
        }

        // HTML5:
        const media: HTMLMediaElement | undefined = plyr?.media;
        if (media) {
          const onCanPlay = () => markReady();

          media.addEventListener('loadedmetadata', onCanPlay, { once: true });
          media.addEventListener('loadeddata', onCanPlay, { once: true });
          media.addEventListener('canplay', onCanPlay, { once: true });

          readyCleanupRef.current = () => {
            try {
              media.removeEventListener('loadedmetadata', onCanPlay);
            } catch {}
            try {
              media.removeEventListener('loadeddata', onCanPlay);
            } catch {}
            try {
              media.removeEventListener('canplay', onCanPlay);
            } catch {}
          };

          try {
            const rs = media.readyState ?? 0;
            const vw = (media as any).videoWidth ?? 0;
            const vh = (media as any).videoHeight ?? 0;
            if (rs >= 1 || (vw > 0 && vh > 0)) markReady();
          } catch {}
        }
      } catch {}
    },
    [
      cleanupDragSwallowGuard,
      index,
      markReady,
      props.onApi,
      pauseForFullscreenOpen,
      registerApiByIndex,
      resolveReady,
      syncRuntimeRegistration,
      syncSpinner,
      posterSrc,
      source,
    ]
  );

  React.useEffect(() => {
    return () => {
      readyCleanupRef.current?.();
      readyCleanupRef.current = null;
      cleanupDragSwallowGuard();
    };
  }, [cleanupDragSwallowGuard]);

  React.useLayoutEffect(() => {
    setPlayerVisible(playerWrapRef.current, false);
    syncSpinner(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldRenderSpinner, lazyEnabled]);

  React.useEffect(() => {
    readyRef.current = false;

    requestAnimationFrame(() => {
      setPlayerVisible(playerWrapRef.current, false);
      syncSpinner(true);
    });
    // This is a media-source reset. Do not depend on syncSpinner; it changes when
    // fullscreen opens/closes and would incorrectly put a ready player back into
    // its loading state after closing fullscreen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.src]);

  React.useEffect(() => {
    if (isClone) return;

    const el = gateRef.current as HTMLElement | null;
    if (!el) return;

    const root = viewportRootRef.current ?? null;

    const ENTER = 0;
    const LEAVE = 0.55;

    const io = new IntersectionObserver(
      ([ent]) => {
        const ratio = ent.intersectionRatio ?? 0;

        const nowVisible = visibleRef.current
          ? !!(ent.isIntersecting && ratio >= LEAVE)
          : !!(ent.isIntersecting && ratio >= ENTER);

        if (nowVisible === visibleRef.current) return;
        visibleRef.current = nowVisible;

        if (nowVisible) {
          const idx = baseIdxRef.current;
          if (typeof idx === 'number' && Number.isFinite(idx) && core) {
            if (lazyEnabled) {
              core.notifyBaseVisibleIndex(idx);
            } else if (!notifySeenRef.current && !isClone) {
              notifySeenRef.current = true;
              core.notifyBaseVisibleIndex(idx);
            }
          }
        }

        if (!nowVisible) {
          pauseApi(apiRef.current);

          if (!readyRef.current) setPlayerVisible(playerWrapRef.current, false);
          return;
        }

        if (!lazyEnabled) {
          if (!mountedRef.current && revealed) {
            mountedRef.current = true;

            setPlayerVisible(playerWrapRef.current, false);
            syncSpinner(false);

            setEverMounted(true);
            return;
          }

          requestAnimationFrame(() => {
            const ready = resolveReady();
            setPlayerVisible(playerWrapRef.current, ready);
            syncSpinner(false);
            if (ready) tryAutoplay();
          });
          return;
        }

        if (!mountedRef.current && revealed) {
          mountedRef.current = true;

          setPlayerVisible(playerWrapRef.current, false);
          syncSpinner(true);

          setEverMounted(true);
          return;
        }

        requestAnimationFrame(() => {
          const ready = resolveReady();
          setPlayerVisible(playerWrapRef.current, ready);
          syncSpinner(!ready);
          if (ready) tryAutoplay();
        });
      },
      {
        root,
        threshold: [0, LEAVE, ENTER, 1],
        rootMargin: '0px',
      }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [gateRef, viewportRootRef, revealed, isClone, resolveReady, syncSpinner, lazyEnabled, core, tryAutoplay]);

  React.useEffect(() => {
    if (isClone) return;
    if (!revealed) return;

    if (!lazyEnabled) {
      if (mountedRef.current) return;
      mountedRef.current = true;

      setPlayerVisible(playerWrapRef.current, false);
      syncSpinner(false);

      setEverMounted(true);
      return;
    }

    if (!visibleRef.current && !fsPrewarmIntent) return;
    if (mountedRef.current) return;

    mountedRef.current = true;

    setPlayerVisible(playerWrapRef.current, false);
    syncSpinner(true);

    setEverMounted(true);
  }, [revealed, lazyEnabled, syncSpinner, fsPrewarmIntent]);

  const spinnerClassName = [
    spinnerResolved.isCustom ? styles.spinnerWrap : styles.spinner,
    lazy?.spinnerClassName,
  ]
    .filter(Boolean)
    .join(' ');

  const spinnerEl = shouldRenderSpinner ? (
    spinnerResolved.isCustom ? (
      <div
        data-rmg-video-spinner
        className={spinnerClassName}
        style={lazy?.spinnerStyle}
      >
        {spinnerResolved.node}
      </div>
    ) : (
      <div data-rmg-video-spinner className={spinnerClassName} style={lazy?.spinnerStyle} />
    )
  ) : null;

  const suspendedFrameSrc = videoSnapshot?.frameSrc ?? posterSrc ?? null;
  const shouldRenderSuspendedFrame = shouldSuspendBasePlayer;
  const shouldMountPlayer = revealed && everMounted;

  React.useLayoutEffect(() => {
    const el = gateRef.current as HTMLElement | null;
    if (!el) return;

    if (!ratio) return;

    el.setAttribute("data-rmg-wh", String(ratio));

    el.dispatchEvent(new Event("loadedmetadata", { bubbles: true }));
  }, [ratio]);

  if (isClone && videoSnapshotStore) {
    return (
      <VideoCloneSnapshot
        canonicalIndex={index}
        store={videoSnapshotStore}
        src={props.src}
        poster={props.poster}
        source={props.source}
        sourceBuilder={props.sourceBuilder}
        options={props.options}
        className={props.className}
        style={props.style}
        lazyLoad={props.lazyLoad}
      />
    );
  }

  return (
    <div
      ref={gateRef}
      className={['rmg__plyr__video', props.className].filter(Boolean).join(' ')}
      style={{
        ...baseWrap,
        ...(props.style || {}),
        position: 'relative',
        background: 'transparent',
        overflow: 'hidden',
      }}
      data-rmg-plyr="true"
      data-rmg-plyr-index={String(index)}
      data-rmg-plyr-provider={provider}
    >
      {spinnerEl}

      {shouldRenderSuspendedFrame ? (
        <div
          data-rmg-video-suspended="true"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            pointerEvents: 'none',
            background: '#000',
          }}
        >
          {suspendedFrameSrc ? (
            <img
              src={suspendedFrameSrc}
              alt=""
              draggable={false}
              decoding="async"
              style={{
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            />
          ) : null}
        </div>
      ) : null}

      {shouldUsePosterShield ? (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            pointerEvents: 'none',
            visibility: posterShieldVisible ? 'visible' : 'hidden',
            opacity: posterShieldVisible ? 1 : 0,
            transition: `opacity ${PLAYER_FADE_MS}ms ease`,
            willChange: 'opacity',
            background: 'transparent',
          }}
        >
          <img
            src={posterSrc ?? ''}
            alt=""
            draggable={false}
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />
        </div>
      ) : null}

      <div
        ref={playerWrapRef}
        className={styles.playerWrap}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          width: '100%',
          height: '100%',
          opacity: 0,
          transition: `opacity ${PLAYER_FADE_MS}ms ease`,
          willChange: 'opacity',
          background: 'transparent',
          display: shouldSuspendBasePlayer ? 'none' : undefined,
          visibility: shouldSuspendBasePlayer ? 'hidden' : undefined,
          pointerEvents: shouldSuspendBasePlayer ? 'none' : 'auto',
        }}
      >
        {shouldMountPlayer ? (
          <Plyr ref={handlePlyrRef as any} source={source} options={options} />
        ) : null}
      </div>
    </div>
  );
}

(Video as typeof Video & { rmgMediaKind?: string }).rmgMediaKind = 'video';
