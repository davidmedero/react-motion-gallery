"use client";

import * as React from "react";
import type { APITypes } from "plyr-react";
import { detectProvider, PlyrProp } from "../video/plyr";
import { installDblclickGuardWhenReady } from "../video/plyrGuards";
import { Plyr } from "../video/LazyPlyr";
import { MediaItem } from "../shared/types/media";
import {
  FsCaptionPlacement,
  FsCaptionRenderArgs,
  FullscreenLazyLoadOptions,
  FullscreenLazyLoadConfig,
} from "./types";
import styles from "./renderFullscreenSlides.module.css";
import type { CanonicalPlaybackRegistration } from "../video/canonicalPlaybackSync";

type ResolvedPlyrOptions = NonNullable<PlyrProp>["options"];

type RenderFullscreenSlidesArgs = {
  items: MediaItem[];
  plyrList: PlyrProp[];
  getTransform: (index: number) => string;
  imageRefs: React.RefObject<React.RefObject<HTMLDivElement | null>[]>;
  playerRefs: React.RefObject<(APITypes | null)[]>;
  cells: React.RefObject<{ element: HTMLElement; index: number }[]>;
  isZoomed: boolean;
  showFullscreenSlider: boolean;
  defaultPlayerStyle: React.CSSProperties;
  fsVideoStyle?: React.CSSProperties;
  fsVideoClassName?: string;
  onPanPointerDown: (
    e: React.PointerEvent<HTMLDivElement>,
    imageRef: React.RefObject<HTMLDivElement | null>
  ) => void;
  onSuppressNextClickCapture: (e: React.SyntheticEvent) => void;

  renderCaption?: (args: FsCaptionRenderArgs) => React.ReactNode;
  captionClassName?: string;
  captionStyle?: React.CSSProperties;
  fsCaptionPlacement?: FsCaptionPlacement;
  fsCaptionWidth?: number;
  fsCaptionHeight?: number;
  fsCaptionBreakpoint?: number;
  resolveFsCaptionPlacement: (
    placement: FsCaptionPlacement | undefined,
    breakpoint: number | undefined,
    viewportWidth: number
  ) => FsCaptionPlacement | null;

  styles: {
    imgMargin: string;
    fullscreenImages: string;
  };

  renderImage?: (args: {
    item: Extract<MediaItem, { kind: "image" }>;
    index: number;
    isZoomed: boolean;
    className: string;
    baseStyle: React.CSSProperties;
  }) => React.ReactNode;

  // ✅ lazy-load config (still one object)
  fsLazy?: FullscreenLazyLoadOptions;

  // ✅ separate lazy flows
  fsLazyAllowedImagesRef?: React.RefObject<Set<number>>;
  fsLazyListenersImagesRef?: React.RefObject<Set<() => void>>;
  fsLazyAllowedVideosRef?: React.RefObject<Set<number>>;
  fsLazyListenersVideosRef?: React.RefObject<Set<() => void>>;

  canonicalLength?: number;

  // ✅ separate caches
  fsDecodedImagesRef: React.RefObject<Set<string>>;
  fsPreparedVideosRef: React.RefObject<Set<string>>;

  getMediaKey: (item: MediaItem) => string;
  onRegisterVideoApi?: (args: CanonicalPlaybackRegistration) => void;
};

function isWrappedItems(itemsLen: number, canonicalLen: number) {
  return canonicalLen > 1 && itemsLen === canonicalLen + 2;
}

function toCanonicalIndex(
  renderedIndex: number,
  itemsLen: number,
  canonicalLen: number
) {
  if (!isWrappedItems(itemsLen, canonicalLen)) {
    const len = canonicalLen || itemsLen || 1;
    return ((renderedIndex % len) + len) % len;
  }

  if (renderedIndex === 0) return canonicalLen - 1;
  if (renderedIndex === itemsLen - 1) return 0;
  return renderedIndex - 1;
}

function isCloneIndex(
  renderedIndex: number,
  itemsLen: number,
  canonicalLen: number
) {
  return (
    isWrappedItems(itemsLen, canonicalLen) &&
    (renderedIndex === 0 || renderedIndex === itemsLen - 1)
  );
}

function resolveFsSpinnerNode<K extends "image" | "video">(
  spinner: FullscreenLazyLoadConfig["spinner"] | undefined,
  args: { kind: K; isClone?: boolean }
): { render: boolean; node: React.ReactNode | null; isCustom: boolean } {
  if (spinner === false) return { render: false, node: null, isCustom: false };
  if (typeof spinner === "function")
    return { render: true, node: spinner(args as any), isCustom: true };
  if (spinner === true || spinner == null)
    return { render: true, node: null, isCustom: false };
  return { render: true, node: spinner, isCustom: true };
}

function setPlayerVisible(playerEl: HTMLElement | null, visible: boolean) {
  if (!playerEl) return;
  playerEl.style.opacity = visible ? "1" : "0";
}

function showSpinnerEl(spinnerEl: HTMLElement | null) {
  if (!spinnerEl) return;
  spinnerEl.style.setProperty("opacity", "1", "important");
  spinnerEl.style.setProperty("visibility", "visible", "important");
  spinnerEl.style.setProperty("pointer-events", "none", "important");
}

function hideSpinnerEl(spinnerEl: HTMLElement | null) {
  if (!spinnerEl) return;
  spinnerEl.style.setProperty("opacity", "0", "important");
  spinnerEl.style.setProperty("visibility", "hidden", "important");
  spinnerEl.style.setProperty("pointer-events", "none", "important");
}

function withForcedCloneMuteOptions(
  options: ResolvedPlyrOptions | undefined
): ResolvedPlyrOptions {
  const base = (options ?? {}) as any;
  const storage =
    typeof base.storage === "object" && base.storage != null
      ? { ...base.storage }
      : {};

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

/**
 * IMAGE FLOW
 * - gates only on fsLazy.images + fsLazyAllowedImagesRef + fsLazyListenersImagesRef
 * - caches only in fsDecodedImagesRef
 */
function FsImageContent(props: {
  item: Extract<MediaItem, { kind: "image" }>;
  renderedIndex: number;
  canonicalIndex: number;
  isClone: boolean;
  isZoomed: boolean;
  className: string;
  baseStyle: React.CSSProperties;
  renderImage?: RenderFullscreenSlidesArgs["renderImage"];

  fsLazy?: FullscreenLazyLoadConfig;
  fsLazyAllowedRef?: React.RefObject<Set<number>>;
  fsLazyListenersRef?: React.RefObject<Set<() => void>>;

  fsDecodedImagesRef: React.RefObject<Set<string>>;
  getMediaKey: (item: MediaItem) => string;
}) {
  const {
    item,
    renderedIndex,
    canonicalIndex,
    isClone,
    isZoomed,
    className,
    baseStyle,
    renderImage,
    fsLazy,
    fsLazyAllowedRef,
    fsLazyListenersRef,
    fsDecodedImagesRef,
    getMediaKey,
  } = props;

  // If user provided renderImage, keep behavior unchanged.
  if (renderImage) {
    return renderImage({
      item,
      index: renderedIndex,
      isZoomed,
      className,
      baseStyle,
    }) as any;
  }

  const lazyEnabled = !!fsLazy?.enabled;

  const key = React.useMemo(() => getMediaKey(item), [
    getMediaKey,
    item,
    (item as any).src,
    (item as any).srcSet,
    (item as any).sizes,
  ]);

  const seenBefore = fsDecodedImagesRef.current.has(key);

  const spinnerRef = React.useRef<HTMLDivElement | null>(null);
  const imgRef = React.useRef<HTMLImageElement | null>(null);

  const cleanupRef = React.useRef<null | (() => void)>(null);
  const didRevealRef = React.useRef(false);

  const any = item as any;

  const computeAllowed = React.useCallback(() => {
    // Once revealed before, never gate again
    if (seenBefore) return true;
    if (!lazyEnabled) return true;
    return !!fsLazyAllowedRef?.current?.has(canonicalIndex);
  }, [seenBefore, lazyEnabled, fsLazyAllowedRef, canonicalIndex]);

  const showSpinner = React.useCallback((show: boolean) => {
    const sp = spinnerRef.current;
    if (!sp) return;
    if (show) showSpinnerEl(sp);
    else hideSpinnerEl(sp);
  }, []);

  const spinnerResolved = React.useMemo(() => {
    return resolveFsSpinnerNode(fsLazy?.spinner, { kind: "image", isClone });
  }, [fsLazy?.spinner, isClone]);

  const shouldRenderSpinner = lazyEnabled && spinnerResolved.render;

  const spinnerClassName = React.useMemo(() => {
    return [
      spinnerResolved.isCustom ? styles.spinnerWrap : styles.spinner,
      fsLazy?.spinnerClassName,
    ]
      .filter(Boolean)
      .join(" ");
  }, [spinnerResolved.isCustom, fsLazy?.spinnerClassName]);

  const spinnerEl = shouldRenderSpinner ? (
    spinnerResolved.isCustom ? (
      <div
        ref={spinnerRef}
        className={spinnerClassName}
        style={fsLazy?.spinnerStyle}
        data-rmg-image-spinner
      >
        {spinnerResolved.node}
      </div>
    ) : (
      <div
        ref={spinnerRef}
        className={spinnerClassName}
        style={fsLazy?.spinnerStyle}
        data-rmg-image-spinner
      />
    )
  ) : null;

  const applySrc = React.useCallback(() => {
    const img = imgRef.current;
    if (!img) return;

    const nextSrc = any.src ?? item.src;
    const nextSrcSet = any.srcSet ?? "";
    const nextSizes = any.sizes ?? "";

    if (img.getAttribute("data-rmg-src-applied") === "true") return;

    img.setAttribute("data-rmg-src-applied", "true");
    img.src = nextSrc;
    if (nextSrcSet) img.srcset = nextSrcSet;
    if (nextSizes) img.sizes = nextSizes;
  }, [any.src, any.srcSet, any.sizes, item.src]);

  const forceFadeIn = React.useCallback(() => {
    const img = imgRef.current;
    if (!img) return;

    showSpinner(false);

    if (seenBefore) {
      img.style.transition = "none";
      img.style.opacity = "1";
      img.style.willChange = "";
      return;
    }

    img.style.willChange = "opacity";
    img.style.transition = "opacity 120ms linear";
    img.style.opacity = "0";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        img.style.opacity = "1";
        if (!didRevealRef.current) {
          didRevealRef.current = true;
          fsDecodedImagesRef.current.add(key);
        }
      });
    });
  }, [fsDecodedImagesRef, key, seenBefore, showSpinner]);

  React.useLayoutEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    if (seenBefore) {
      img.style.opacity = "1";
      img.style.transition = "none";
      showSpinner(false);
      applySrc();
      return;
    }

    img.style.opacity = "0";
    img.style.transition = "opacity 120ms linear";
    img.style.willChange = "opacity";

    if (!computeAllowed()) {
      showSpinner(true);
      return;
    }

    showSpinner(true);
    applySrc();
  }, [seenBefore, computeAllowed, applySrc, showSpinner]);

  React.useEffect(() => {
    cleanupRef.current?.();
    cleanupRef.current = null;

    const img = imgRef.current;
    if (!img) return;

    let cancelled = false;

    const onReady = () => {
      if (cancelled) return;
      forceFadeIn();
    };

    const attachLoadHandlers = () => {
      img.addEventListener("load", onReady);
      img.addEventListener("error", onReady);

      if (img.complete && img.naturalWidth > 0) {
        onReady();
      }
    };

    if (seenBefore) {
      attachLoadHandlers();
      cleanupRef.current = () => {
        cancelled = true;
        img.removeEventListener("load", onReady);
        img.removeEventListener("error", onReady);
      };
      return cleanupRef.current;
    }

    const ensureAllowedThenLoad = () => {
      if (cancelled) return false;

      if (computeAllowed()) {
        applySrc();
        attachLoadHandlers();
        showSpinner(true);
        return true;
      }
      return false;
    };

    if (ensureAllowedThenLoad()) {
      cleanupRef.current = () => {
        cancelled = true;
        img.removeEventListener("load", onReady);
        img.removeEventListener("error", onReady);
      };
      return cleanupRef.current;
    }

    const cb = () => {
      if (ensureAllowedThenLoad()) {
        fsLazyListenersRef?.current?.delete(cb);
      }
    };

    if (lazyEnabled) {
      fsLazyListenersRef?.current?.add(cb);
    }

    showSpinner(true);

    cleanupRef.current = () => {
      cancelled = true;
      fsLazyListenersRef?.current?.delete(cb);
      img.removeEventListener("load", onReady);
      img.removeEventListener("error", onReady);
    };

    return cleanupRef.current;
  }, [
    seenBefore,
    lazyEnabled,
    fsLazyListenersRef,
    computeAllowed,
    applySrc,
    forceFadeIn,
    showSpinner,
  ]);

  return (
    <>
      <img
        ref={imgRef}
        alt={item.alt ?? `cell-${renderedIndex}`}
        data-index={renderedIndex}
        className={className}
        draggable="false"
        decoding="async"
        loading="lazy"
        fetchPriority="low"
        style={{
          ...baseStyle,
          display: "block",
        }}
      />
      {spinnerEl}
    </>
  );
}

/**
 * VIDEO FLOW
 * - gates only on fsLazy.videos + fsLazyAllowedVideosRef + fsLazyListenersVideosRef
 * - caches only in fsPreparedVideosRef (NOT the image decoded set)
 *
 * "prepared" here means: we’ve mounted and/or reached a ready state at least once.
 * If you want stricter semantics ("poster warmed" vs "player ready"), split this into two sets later.
 */
function FsVideoContent(props: {
  item: Extract<MediaItem, { kind: "video" }>;
  renderedIndex: number;
  canonicalIndex: number;
  isClone: boolean;
  plyr: PlyrProp;

  playerRefs: React.RefObject<(APITypes | null)[]>;
  defaultPlayerStyle: React.CSSProperties;
  fsVideoStyle?: React.CSSProperties;
  fsVideoClassName?: string;

  fsLazy?: FullscreenLazyLoadConfig;
  fsLazyAllowedRef?: React.RefObject<Set<number>>;
  fsLazyListenersRef?: React.RefObject<Set<() => void>>;

  fsPreparedVideosRef: React.RefObject<Set<string>>;
  getMediaKey: (item: MediaItem) => string;
  onRegisterVideoApi?: (args: CanonicalPlaybackRegistration) => void;
}) {
  const {
    item,
    renderedIndex,
    canonicalIndex,
    isClone,
    plyr,
    playerRefs,
    defaultPlayerStyle,
    fsVideoStyle,
    fsVideoClassName,
    fsLazy,
    fsLazyAllowedRef,
    fsLazyListenersRef,
    fsPreparedVideosRef,
    getMediaKey,
    onRegisterVideoApi,
  } = props;

  const lazyEnabled = !!fsLazy?.enabled;

  const key = React.useMemo(() => `video:${getMediaKey(item)}`, [
    getMediaKey,
    item,
    (item as any).src,
    (item as any).poster,
  ]);

  const seenBefore = fsPreparedVideosRef.current.has(key);

  const provider = React.useMemo(
    () => detectProvider(plyr?.source),
    [plyr?.source]
  );
  const effectivePlyrOptions = React.useMemo(() => {
    if (!isClone) return plyr?.options;
    return withForcedCloneMuteOptions(plyr?.options);
  }, [isClone, plyr?.options]);

  const spinnerRef = React.useRef<HTMLDivElement | null>(null);
  const playerWrapRef = React.useRef<HTMLDivElement | null>(null);
  const apiRef = React.useRef<APITypes | null>(null);

  const mountedRef = React.useRef(false);
  const readyRef = React.useRef(false);
  const revealedRef = React.useRef(false);

  // Keep state minimal: only used to actually mount Plyr & show content.
  const [revealed, setRevealed] = React.useState(false);
  const [everMounted, setEverMounted] = React.useState(false);

  const gateRef = React.useRef<HTMLDivElement | null>(null);
  const visibleRef = React.useRef(false);

  const computeAllowed = React.useCallback(() => {
    if (seenBefore) return true;
    if (!lazyEnabled) return true;
    return !!fsLazyAllowedRef?.current?.has(canonicalIndex);
  }, [seenBefore, lazyEnabled, fsLazyAllowedRef, canonicalIndex]);

  const promoteCanonicalWhenVisible = React.useCallback(() => {
    if (!lazyEnabled) return;

    const allowSet = fsLazyAllowedRef?.current;
    if (!allowSet) return;
    if (allowSet.has(canonicalIndex)) return;

    allowSet.add(canonicalIndex);

    const listeners = fsLazyListenersRef?.current;
    if (!listeners?.size) return;

    for (const cb of Array.from(listeners)) {
      try {
        cb();
      } catch {}
    }
  }, [lazyEnabled, fsLazyAllowedRef, fsLazyListenersRef, canonicalIndex]);

  const syncSpinner = React.useCallback((wantVisible: boolean) => {
    const sp = spinnerRef.current;
    if (!sp) return;
    if (wantVisible) showSpinnerEl(sp);
    else hideSpinnerEl(sp);
  }, []);

  const spinnerResolved = React.useMemo(() => {
    return resolveFsSpinnerNode(fsLazy?.spinner, { kind: "video", isClone });
  }, [fsLazy?.spinner, isClone]);

  const shouldRenderSpinner = (fsLazy?.enabled ?? false) && spinnerResolved.render;

  const spinnerClassName = React.useMemo(() => {
    return [
      spinnerResolved.isCustom ? styles.spinnerWrap : styles.spinner,
      fsLazy?.spinnerClassName,
    ]
      .filter(Boolean)
      .join(" ");
  }, [spinnerResolved.isCustom, fsLazy?.spinnerClassName]);

  const setWrapVisible = React.useCallback((visible: boolean) => {
    setPlayerVisible(playerWrapRef.current, visible);
  }, []);

  // Baseline: no flicker
  React.useLayoutEffect(() => {
    if (seenBefore) {
      setWrapVisible(true);
      syncSpinner(false);
      revealedRef.current = true;
      setRevealed(true);
      if (!everMounted) setEverMounted(true);
      return;
    }

    setWrapVisible(false);
    syncSpinner(true);
  }, [seenBefore, setWrapVisible, syncSpinner, everMounted]);

  // Reveal gate (no React re-render until it flips true)
  React.useEffect(() => {
    if (seenBefore) return;

    const tryReveal = () => {
      if (revealedRef.current) return true;
      if (!computeAllowed()) return false;

      revealedRef.current = true;
      setRevealed(true);
      return true;
    };

    if (tryReveal()) return;

    const cb = () => {
      if (tryReveal()) {
        fsLazyListenersRef?.current?.delete(cb);
      }
    };

    if (lazyEnabled) fsLazyListenersRef?.current?.add(cb);

    return () => {
      fsLazyListenersRef?.current?.delete(cb);
    };
  }, [seenBefore, lazyEnabled, computeAllowed, fsLazyListenersRef]);

  // Once revealed, mount exactly once
  React.useEffect(() => {
    if (!revealed) return;
    if (mountedRef.current) return;

    mountedRef.current = true;

    // keep hidden until ready
    setWrapVisible(false);

    // spinner behavior:
    // - if lazy enabled: show spinner until ready
    // - if lazy disabled: usually you'd NOT show spinner; keep consistent with your file
    syncSpinner(lazyEnabled);
    if (!lazyEnabled) syncSpinner(false);

    setEverMounted(true);
  }, [revealed, lazyEnabled, setWrapVisible, syncSpinner]);

  const markReady = React.useCallback(() => {
    if (readyRef.current) return;
    readyRef.current = true;

    requestAnimationFrame(() => {
      syncSpinner(false);
      setWrapVisible(true);

      // mark prepared once we are actually ready
      fsPreparedVideosRef.current.add(key);
    });
  }, [fsPreparedVideosRef, key, setWrapVisible, syncSpinner]);

  const handlePlyrRef = React.useCallback(
    (api: any) => {
      const apiOrNull = (api ?? null) as APITypes | null;
      apiRef.current = apiOrNull;

      playerRefs.current[renderedIndex] = apiOrNull;
      onRegisterVideoApi?.({
        renderedIndex,
        canonicalIndex,
        isClone,
        api: apiOrNull,
      });

      installDblclickGuardWhenReady(api);

      requestAnimationFrame(() => {
        setWrapVisible(readyRef.current || seenBefore);
        syncSpinner(!(readyRef.current || seenBefore));
      });

      const plyrInst = (api as any)?.plyr ?? api;
      try {
        plyrInst?.on?.("ready", markReady);

        const media: HTMLMediaElement | undefined = plyrInst?.media;
        if (media) {
          const onCanPlay = () => markReady();
          media.addEventListener("loadedmetadata", onCanPlay, { once: true });
          media.addEventListener("loadeddata", onCanPlay, { once: true });
          media.addEventListener("canplay", onCanPlay, { once: true });

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
      canonicalIndex,
      isClone,
      markReady,
      onRegisterVideoApi,
      playerRefs,
      renderedIndex,
      seenBefore,
      setWrapVisible,
      syncSpinner,
    ]
  );

  // Cleanup: pause & clear refs
  React.useEffect(() => {
    return () => {
      pauseApi(apiRef.current);
      apiRef.current = null;
      playerRefs.current[renderedIndex] = null;
      onRegisterVideoApi?.({
        renderedIndex,
        canonicalIndex,
        isClone,
        api: null,
      });
    };
  }, [playerRefs, renderedIndex, canonicalIndex, isClone, onRegisterVideoApi]);

  // Pause video when out of view (IO)
  React.useEffect(() => {
    const gateEl = gateRef.current;
    if (!gateEl) return;

    const root =
      gateEl.closest("[data-rmg-viewport='true']") ??
      gateEl.closest("[data-rmg-fs-viewport='true']") ??
      null;

    const ENTER = 0.7;
    const LEAVE = 0.55;

    const io = new IntersectionObserver(
      ([ent]) => {
        const ratio = ent.intersectionRatio ?? 0;

        const nowVisible = visibleRef.current
          ? !!(ent.isIntersecting && ratio >= LEAVE)
          : !!(ent.isIntersecting && ratio >= ENTER);

        if (nowVisible === visibleRef.current) return;
        visibleRef.current = nowVisible;

        if (!nowVisible) {
          pauseApi(apiRef.current);
          if (!readyRef.current) setWrapVisible(false);
          return;
        }

        promoteCanonicalWhenVisible();

        requestAnimationFrame(() => {
          setWrapVisible(readyRef.current || seenBefore);
          syncSpinner(!(readyRef.current || seenBefore));
        });
      },
      {
        root: root as Element | null,
        threshold: [0, LEAVE, ENTER, 1],
        rootMargin: "0px",
      }
    );

    io.observe(gateEl);
    return () => io.disconnect();
  }, [setWrapVisible, syncSpinner, seenBefore, promoteCanonicalWhenVisible]);

  const spinnerEl = shouldRenderSpinner ? (
    spinnerResolved.isCustom ? (
      <div
        ref={spinnerRef}
        className={spinnerClassName}
        style={fsLazy?.spinnerStyle}
        data-rmg-video-spinner
      >
        {spinnerResolved.node}
      </div>
    ) : (
      <div
        ref={spinnerRef}
        className={spinnerClassName}
        style={fsLazy?.spinnerStyle}
        data-rmg-video-spinner
      />
    )
  ) : null;

  return (
    <>
      <div
        ref={gateRef}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      />
      {spinnerEl}
      <div
        ref={playerWrapRef}
        data-index={renderedIndex}
        style={{
          ...defaultPlayerStyle,
          ...(fsVideoStyle ?? {}),
          zIndex: 2,
          pointerEvents: isClone ? "none" : "auto",
          opacity: 0,
          transition: "opacity 220ms ease",
          willChange: "opacity",
        }}
        className={["rmg__player", fsVideoClassName].filter(Boolean).join(" ")}
        data-rmg-plyr="true"
        data-rmg-plyr-index={String(renderedIndex)}
        data-rmg-plyr-provider={provider}
      >
        {revealed && everMounted ? (
          <Plyr
            source={plyr?.source}
            options={effectivePlyrOptions}
            ref={handlePlyrRef as any}
          />
        ) : null}
      </div>
    </>
  );
}

function FsSlide(props: {
  item: MediaItem;
  index: number;
  canonicalIndex: number;
  isClone: boolean;
  plyr?: PlyrProp;
  imageRef: React.RefObject<HTMLDivElement | null>;
  playerRefs: React.RefObject<(APITypes | null)[]>;
  cells: React.RefObject<{ element: HTMLElement; index: number }[]>;
  isZoomed: boolean;
  showFullscreenSlider: boolean;
  defaultPlayerStyle: React.CSSProperties;
  fsVideoStyle?: React.CSSProperties;
  fsVideoClassName?: string;
  onPanPointerDown: (
    e: React.PointerEvent<HTMLDivElement>,
    imageRef: React.RefObject<HTMLDivElement | null>
  ) => void;
  onSuppressNextClickCapture: (e: React.SyntheticEvent) => void;

  captionNode: React.ReactNode;
  captionFirst: boolean;
  captionClassName?: string;
  captionStyle?: React.CSSProperties;
  isHorizontal: boolean;
  isVertical: boolean;
  sideWidth: number;
  topBottomHeight: number;

  getTransform: (index: number) => string;
  styles: { imgMargin: string; fullscreenImages: string };

  renderImage?: RenderFullscreenSlidesArgs["renderImage"];

  fsLazy?: FullscreenLazyLoadOptions;

  fsLazyAllowedImagesRef?: React.RefObject<Set<number>>;
  fsLazyListenersImagesRef?: React.RefObject<Set<() => void>>;
  fsLazyAllowedVideosRef?: React.RefObject<Set<number>>;
  fsLazyListenersVideosRef?: React.RefObject<Set<() => void>>;

  fsDecodedImagesRef: React.RefObject<Set<string>>;
  fsPreparedVideosRef: React.RefObject<Set<string>>;
  getMediaKey: (item: MediaItem) => string;
  onRegisterVideoApi?: (args: CanonicalPlaybackRegistration) => void;
}) {
  const {
    item,
    index,
    canonicalIndex,
    isClone,
    plyr,
    imageRef,
    playerRefs,
    cells,
    isZoomed,
    showFullscreenSlider,
    defaultPlayerStyle,
    fsVideoStyle,
    fsVideoClassName,
    onPanPointerDown,
    onSuppressNextClickCapture,
    captionNode,
    captionFirst,
    captionClassName,
    captionStyle,
    isHorizontal,
    isVertical,
    sideWidth,
    topBottomHeight,
    getTransform,
    styles,
    renderImage,
    fsLazy,
    fsLazyAllowedImagesRef,
    fsLazyListenersImagesRef,
    fsLazyAllowedVideosRef,
    fsLazyListenersVideosRef,
    fsDecodedImagesRef,
    fsPreparedVideosRef,
    getMediaKey,
    onRegisterVideoApi,
  } = props;

  const baseImgStyle: React.CSSProperties = {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
    touchAction: "manipulation",
    transformOrigin: "0 0",
    transform: "translate(0, 0) scale(1)",
    cursor: isZoomed ? "grab" : "zoom-in",
    userSelect: "none",
  };

  return (
    <div
      key={`${(item as any).src ?? "slide"}-${index}`}
      data-rmg-fs-slide="true"
      data-index={index}
      data-rmg-canonical-idx={canonicalIndex}
      data-rmg-clone={isClone ? "true" : "false"}
      ref={(el: HTMLDivElement | null) => {
        if (el && !cells.current.some((c) => c.element === el)) {
          cells.current.push({ element: el as unknown as HTMLElement, index });
        }
      }}
      style={{
        transform: getTransform(index),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        left: 0,
        minWidth: "100%",
        height: "100%",
        margin: "auto",
        touchAction: "none",
      }}
      className={styles.imgMargin}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: isHorizontal ? "row" : "column",
          justifyContent: "center",
        }}
      >
        {captionNode && captionFirst && (
          <div
            className={captionClassName}
            data-rmg-fs-caption="true"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: isHorizontal ? `0 0 ${sideWidth}px` : "0 0 auto",
              alignSelf: "stretch",
              textAlign: "left",
              pointerEvents: showFullscreenSlider ? "auto" : "none",
              padding: "0.75rem 1rem",
              color: "#fff",
              fontSize: "0.875rem",
              width: isHorizontal ? sideWidth : "100%",
              height: isVertical ? topBottomHeight : "auto",
              boxSizing: "border-box",
              ...captionStyle,
            }}
          >
            {captionNode}
          </div>
        )}

        <div
          ref={imageRef}
          onPointerDown={(e) => onPanPointerDown(e, imageRef)}
          onClickCapture={onSuppressNextClickCapture as any}
          style={{
            overflow: "visible",
            touchAction: "none",
            height: isVertical
              ? `calc(100% - ${captionNode ? topBottomHeight : 0}px)`
              : "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {item.kind === "video" ? (
            <FsVideoContent
              item={item as any}
              renderedIndex={index}
              canonicalIndex={canonicalIndex}
              isClone={isClone}
              plyr={plyr!}
              playerRefs={playerRefs}
              defaultPlayerStyle={defaultPlayerStyle}
              fsVideoStyle={fsVideoStyle}
              fsVideoClassName={fsVideoClassName}
              fsLazy={fsLazy?.videos}
              fsLazyAllowedRef={fsLazyAllowedVideosRef}
              fsLazyListenersRef={fsLazyListenersVideosRef}
              fsPreparedVideosRef={fsPreparedVideosRef}
              getMediaKey={getMediaKey}
              onRegisterVideoApi={onRegisterVideoApi}
            />
          ) : (
            <FsImageContent
              item={item as any}
              renderedIndex={index}
              canonicalIndex={canonicalIndex}
              isClone={isClone}
              isZoomed={isZoomed}
              className={styles.fullscreenImages}
              baseStyle={baseImgStyle}
              renderImage={renderImage}
              fsLazy={fsLazy?.images}
              fsLazyAllowedRef={fsLazyAllowedImagesRef}
              fsLazyListenersRef={fsLazyListenersImagesRef}
              fsDecodedImagesRef={fsDecodedImagesRef}
              getMediaKey={getMediaKey}
            />
          )}
        </div>

        {captionNode && !captionFirst && (
          <div
            className={captionClassName}
            data-rmg-fs-caption="true"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: isHorizontal ? `0 0 ${sideWidth}px` : "0 0 auto",
              alignSelf: "stretch",
              textAlign: "left",
              pointerEvents: showFullscreenSlider ? "auto" : "none",
              padding: "0.75rem 1rem",
              color: "#fff",
              fontSize: "0.875rem",
              width: isHorizontal ? sideWidth : "100%",
              height: isVertical ? topBottomHeight : "100%",
              boxSizing: "border-box",
              ...captionStyle,
            }}
          >
            {captionNode}
          </div>
        )}
      </div>
    </div>
  );
}

export function renderFullscreenSlides(opts: RenderFullscreenSlidesArgs) {
  const {
    items,
    plyrList,
    getTransform,
    imageRefs,
    playerRefs,
    cells,
    isZoomed,
    showFullscreenSlider,
    defaultPlayerStyle,
    fsVideoStyle,
    fsVideoClassName,
    onPanPointerDown,
    onSuppressNextClickCapture,
    renderCaption,
    captionClassName,
    captionStyle,
    fsCaptionPlacement,
    fsCaptionWidth,
    fsCaptionHeight,
    fsCaptionBreakpoint,
    resolveFsCaptionPlacement,
    styles,
    renderImage,
    fsLazy,

    fsLazyAllowedImagesRef,
    fsLazyListenersImagesRef,
    fsLazyAllowedVideosRef,
    fsLazyListenersVideosRef,

    canonicalLength,

    fsDecodedImagesRef,
    fsPreparedVideosRef,

    getMediaKey,
    onRegisterVideoApi,
  } = opts;

  const vw =
    typeof window !== "undefined" ? document.documentElement.clientWidth : 1024;

  const effectivePlacement = resolveFsCaptionPlacement(
    fsCaptionPlacement,
    fsCaptionBreakpoint,
    vw
  );

  const isHorizontal =
    effectivePlacement === "left" || effectivePlacement === "right";
  const isVertical =
    effectivePlacement === "top" || effectivePlacement === "bottom";

  const captionFirst =
    effectivePlacement === "left" || effectivePlacement === "top";

  const DEFAULT_SIDE = 280;
  const DEFAULT_TOP_BOTTOM = 200;

  const sideWidth = fsCaptionWidth ?? DEFAULT_SIDE;
  const topBottomHeight = fsCaptionHeight ?? DEFAULT_TOP_BOTTOM;

  const canonLen = canonicalLength ?? items.length;

  return items.map((item, index) => {
    const imageRef = imageRefs.current[index];
    const plyr = plyrList[index];

    const captionNode = renderCaption
      ? renderCaption({ item, index, isZoomed })
      : null;

    const canonicalIndex = toCanonicalIndex(index, items.length, canonLen);
    const isClone = isCloneIndex(index, items.length, canonLen);

    return (
      <FsSlide
        key={`${(item as any).src ?? "slide"}-${index}`}
        item={item}
        index={index}
        canonicalIndex={canonicalIndex}
        isClone={isClone}
        plyr={plyr}
        imageRef={imageRef}
        playerRefs={playerRefs}
        cells={cells}
        isZoomed={isZoomed}
        showFullscreenSlider={showFullscreenSlider}
        defaultPlayerStyle={defaultPlayerStyle}
        fsVideoStyle={fsVideoStyle}
        fsVideoClassName={fsVideoClassName}
        onPanPointerDown={onPanPointerDown}
        onSuppressNextClickCapture={onSuppressNextClickCapture}
        captionNode={captionNode}
        captionFirst={captionFirst}
        captionClassName={captionClassName}
        captionStyle={captionStyle}
        isHorizontal={!!isHorizontal}
        isVertical={!!isVertical}
        sideWidth={sideWidth}
        topBottomHeight={topBottomHeight}
        getTransform={getTransform}
        styles={styles}
        renderImage={renderImage}
        fsLazy={fsLazy}
        fsLazyAllowedImagesRef={fsLazyAllowedImagesRef}
        fsLazyListenersImagesRef={fsLazyListenersImagesRef}
        fsLazyAllowedVideosRef={fsLazyAllowedVideosRef}
        fsLazyListenersVideosRef={fsLazyListenersVideosRef}
        fsDecodedImagesRef={fsDecodedImagesRef}
        fsPreparedVideosRef={fsPreparedVideosRef}
        getMediaKey={getMediaKey}
        onRegisterVideoApi={onRegisterVideoApi}
      />
    );
  });
}
