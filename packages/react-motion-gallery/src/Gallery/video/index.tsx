'use client';

import * as React from 'react';
import type { APITypes } from 'plyr-react';
import { Plyr } from './LazyPlyr';
import { useRmgSlide } from '../shared/slideContext';
import { installDblclickGuardWhenReady } from './plyrGuards';
import { detectProvider } from './plyr';
import type { PlyrOptions, PlyrSource } from './plyrTypes';
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
  // kept in props for backwards compat; used only for Plyr's native poster attr in source
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
      if (w > 0 && h > 0) return w / h; // width/height
    }

    const mSlash = s.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
    if (mSlash) {
      const w = parseFloat(mSlash[1]);
      const h = parseFloat(mSlash[2]);
      if (w > 0 && h > 0) return w / h; // width/height
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
  args: { src: string; index: number }
): PlyrOptions | undefined {
  const resolved = typeof options === 'function' ? options(args) : options;
  if (!resolved) return resolved;

  return {
    ...(resolved as any),
    autoplay: (resolved as any).autoplay ?? false,
    preload: (resolved as any).preload ?? 'none',
  } as any;
}

function withForcedCloneMuteOptions(options: PlyrOptions | undefined): PlyrOptions {
  const base = (options ?? {}) as any;
  const storage =
    typeof base.storage === 'object' && base.storage != null ? { ...base.storage } : {};

  return {
    ...base,
    muted: true,
    volume: 0,
    storage: {
      ...storage,
      enabled: false,
    },
  } as any;
}

/**
 * Imperative player fade control
 */
function setPlayerVisible(playerEl: HTMLElement | null, visible: boolean) {
  if (!playerEl) return;
  playerEl.style.opacity = visible ? '1' : '0';
}

/**
 * Spinner visibility that can defeat external `!important` rules.
 * (element.style.opacity loses to stylesheet `opacity: 1 !important`)
 */
function showSpinner(spinnerEl: HTMLElement | null) {
  if (!spinnerEl) return;
  spinnerEl.style.setProperty('opacity', '1', 'important');
  spinnerEl.style.setProperty('visibility', 'visible', 'important');
  spinnerEl.style.setProperty('pointer-events', 'none', 'important');
}

function hideSpinner(spinnerEl: HTMLElement | null) {
  if (!spinnerEl) return;
  spinnerEl.style.setProperty('opacity', '0', 'important');
  spinnerEl.style.setProperty('visibility', 'hidden', 'important');
  spinnerEl.style.setProperty('pointer-events', 'none', 'important');
}

/**
 * Pause safely (Plyr API shape varies depending on wrapper)
 * - works for wrapper shapes: api.pause(), api.plyr.pause()
 * - also pauses underlying HTMLMediaElement (api.plyr.media) when present
 */
function pauseApi(api: APITypes | null) {
  if (!api) return;

  try {
    // 1) Some wrappers expose pause directly
    (api as any)?.pause?.();
  } catch {}

  // 2) plyr-react often exposes the Plyr instance on `.plyr`
  const plyr = (api as any)?.plyr ?? null;

  try {
    plyr?.pause?.();
  } catch {}

  // 3) If we can reach the native media element, pause it too
  try {
    const media: HTMLMediaElement | undefined = plyr?.media;
    media?.pause?.();
  } catch {}
}

function resolveSpinnerNode(
  spinner: RmgVideoLazyLoadOptions['spinner'] | undefined,
  args: { kind: 'image' | 'video'; isClone: boolean }
): { render: boolean; node: React.ReactNode | null; isCustom: boolean } {
  if (spinner === false) return { render: false, node: null, isCustom: false };
  if (typeof spinner === 'function') return { render: true, node: spinner(args), isCustom: true };
  if (spinner === true || spinner == null) return { render: true, node: null, isCustom: false }; // default spinner
  return { render: true, node: spinner, isCustom: true }; // ReactNode
}

export function Video(props: VideoProps) {
  const ctx = useRmgSlide();
  const isClone = ctx?.isClone ?? false;
  const index = ctx?.normIdx ?? 0;

  const apiRef = React.useRef<APITypes | null>(null);

  // Wrap that contains Plyr. We fade THIS in when ready.
  const playerWrapRef = React.useRef<HTMLDivElement | null>(null);

  const visibleRef = React.useRef(false);
  const mountedRef = React.useRef(false);

  // once true, we keep player visible (unless src changes)
  const readyRef = React.useRef(false);

  const { ref: gateRef, revealed } = useSlideRevealedGate();
  const viewportRootRef = useViewportRoot(gateRef as any);

  // Mount Plyr once, either when visible or when fullscreen prewarm targets this slide.
  const [everMounted, setEverMounted] = React.useState(false);
  const [fsPrewarmIntent, setFsPrewarmIntent] = React.useState(false);

  const lazy = props.lazyLoad;
  const lazyEnabled = lazy?.enabled !== false; // default true

  const spinnerResolved = React.useMemo(() => {
    return resolveSpinnerNode(lazy?.spinner, { kind: 'video', isClone });
  }, [lazy?.spinner, isClone]);

  const shouldRenderSpinner = lazyEnabled && spinnerResolved.render;

  const core = useOptionalGalleryCore();

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

  // Memoize source/options so Plyr doesn't rebuild on unrelated renders
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

  const options = React.useMemo(() => {
    return resolveOptions(props.options, { src: props.src, index });
  }, [props.options, props.src, index]);

  const effectiveOptions = React.useMemo(() => {
    if (!isClone) return options;

    return {
      ...withForcedCloneMuteOptions(options),
      preload: 'auto',
      autoplay: false,
    } as PlyrOptions;
  }, [isClone, options]);

  const provider = React.useMemo(() => detectProvider(source), [source]);

  React.useEffect(() => {
    if (!isClone) return;
    if (!props.src) return;

    if (provider === 'mp4') {
      try {
        const v = document.createElement('video');
        v.preload = 'auto';
        v.muted = true;
        v.playsInline = true;
        if (props.poster) v.poster = props.poster;
        v.src = props.src;
        v.load();

        const timer = window.setTimeout(() => {
          try {
            v.removeAttribute('src');
            v.load();
          } catch {}
        }, 1500);

        return () => {
          window.clearTimeout(timer);
          try {
            v.removeAttribute('src');
            v.load();
          } catch {}
        };
      } catch {}
    }

    if ((provider === 'youtube' || provider === 'vimeo') && props.poster) {
      try {
        const img = new Image();
        img.decoding = 'async';
        (img as any).fetchPriority = 'high';
        img.src = props.poster;
        void img.decode().catch(() => {});
      } catch {}
    }
  }, [isClone, provider, props.src, props.poster]);

  // Helper that always targets the spinner under THIS gate (avoids wrong-node issues)
  const getSpinnerEl = React.useCallback(() => {
    if (!shouldRenderSpinner) return null;
    const gateEl = gateRef.current as HTMLElement | null;
    return gateEl?.querySelector<HTMLElement>('[data-rmg-video-spinner]') ?? null;
  }, [gateRef, shouldRenderSpinner]);

  const syncSpinner = React.useCallback(
    (wantVisible: boolean) => {
      if (!shouldRenderSpinner) return;
      const el = getSpinnerEl();
      if (!el) return;
      if (wantVisible) showSpinner(el);
      else hideSpinner(el);
    },
    [getSpinnerEl, shouldRenderSpinner]
  );

  const markReady = React.useCallback(() => {
    if (readyRef.current) return;
    readyRef.current = true;

    requestAnimationFrame(() => {
      syncSpinner(false);
      setPlayerVisible(playerWrapRef.current, true);
    });
  }, [syncSpinner]);

  const readyCleanupRef = React.useRef<(() => void) | null>(null);

  const handlePlyrRef = React.useCallback(
    (api: any) => {
      // cleanup previous listeners first
      readyCleanupRef.current?.();
      readyCleanupRef.current = null;

      const apiOrNull = (api ?? null) as APITypes | null;
      apiRef.current = apiOrNull;

      ctx?.registerPlyr?.(apiOrNull);
      props.onApi?.(apiOrNull);
      props.registerApiByIndex?.(index, apiOrNull);

      installDblclickGuardWhenReady(api);

      requestAnimationFrame(() => {
        setPlayerVisible(playerWrapRef.current, readyRef.current);
        syncSpinner(!readyRef.current);
      });

      if (!api) return;

      const plyr = (api as any)?.plyr ?? api;
      const provider = detectProvider(source);

      try {
        // YOUTUBE / VIMEO:
        // rely on Plyr's own ready event
        if (provider === 'youtube' || provider === 'vimeo') {
          const onReady = () => markReady();

          plyr?.on?.('ready', onReady);

          readyCleanupRef.current = () => {
            try {
              plyr?.off?.('ready', onReady);
            } catch {}
          };

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
    [ctx, index, props.onApi, props.registerApiByIndex, markReady, syncSpinner, source]
  );

  React.useEffect(() => {
    return () => {
      readyCleanupRef.current?.();
      readyCleanupRef.current = null;
    };
  }, []);

  React.useEffect(() => {
    if (!isClone) return;

    mountedRef.current = true;
    setEverMounted(true);
  }, [isClone]);

  // ✅ DEFAULT STATE:
  // Spinner visible by default (if enabled), player hidden by default,
  // regardless of visibility/IO. This avoids "late spinner" entirely.
  React.useLayoutEffect(() => {
    setPlayerVisible(playerWrapRef.current, false);
    syncSpinner(true);
    // only run on mount / when spinner enablement changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldRenderSpinner, lazyEnabled]);

  React.useEffect(() => {
    if (!isClone) return;

    setPlayerVisible(playerWrapRef.current, false);
    syncSpinner(true);

    mountedRef.current = true;
    setEverMounted(true);
  }, [isClone, syncSpinner]);

  React.useEffect(() => {
    readyRef.current = false;

    requestAnimationFrame(() => {
      setPlayerVisible(playerWrapRef.current, false);
      // show spinner again on src change (until ready)
      syncSpinner(true);
    });
  }, [props.src, syncSpinner]);

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

          // If not ready: keep player hidden. Spinner stays visible (default state).
          if (!readyRef.current) setPlayerVisible(playerWrapRef.current, false);
          return;
        }

        // If lazy is disabled: mount as soon as revealed, and never show spinner.
        if (!lazyEnabled) {
          if (!mountedRef.current && revealed) {
            mountedRef.current = true;

            setPlayerVisible(playerWrapRef.current, false);
            syncSpinner(false);

            setEverMounted(true);
            return;
          }

          requestAnimationFrame(() => {
            setPlayerVisible(playerWrapRef.current, readyRef.current);
            syncSpinner(false);
          });
          return;
        }

        // lazy enabled:
        if (!mountedRef.current && revealed) {
          mountedRef.current = true;

          // Spinner already visible by default; keep it visible until ready
          setPlayerVisible(playerWrapRef.current, false);
          syncSpinner(true);

          setEverMounted(true);
          return;
        }

        requestAnimationFrame(() => {
          setPlayerVisible(playerWrapRef.current, readyRef.current);
          syncSpinner(!readyRef.current);
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
  }, [gateRef, viewportRootRef, revealed, isClone, syncSpinner, lazyEnabled, core]);

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

  React.useLayoutEffect(() => {
    const el = gateRef.current as HTMLElement | null;
    if (!el) return;

    // pull ratio from options (effectiveOptions already includes clone muting etc)
    const rawRatio = (effectiveOptions as any)?.ratio ?? (options as any)?.ratio;

    const wh = parsePlyrRatio(rawRatio); // width/height
    if (!wh) return;

    // Slider wants intrinsic dimensions; easiest is to store ratio directly
    // We'll store width/height ratio as data-rmg-wh
    el.setAttribute("data-rmg-wh", String(wh));

    // bubble event so Slider hook re-measures
    el.dispatchEvent(new Event("loadedmetadata", { bubbles: true }));
  }, [effectiveOptions, options]);

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

      <div
        ref={playerWrapRef}
        className={styles.playerWrap}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          width: '100%',
          height: '100%',
          pointerEvents: isClone ? 'none' : 'auto',
          opacity: 0,
          transition: 'opacity 220ms ease',
          willChange: 'opacity',
          background: 'transparent',
        }}
      >
        {(isClone || (revealed && everMounted)) ? (
          <Plyr ref={handlePlyrRef as any} source={source} options={effectiveOptions} />
        ) : null}
      </div>
    </div>
  );
}
