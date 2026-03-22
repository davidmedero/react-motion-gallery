import type { MediaItem } from "../shared/types/media";
import type {
  PlyrOptions,
  PlyrOptionsBuilder,
  PlyrSource,
  PlyrSourceBuilder,
} from "./plyrTypes";

export type PlyrProp = { source: PlyrSource; options: PlyrOptions } | null;
export type PlyrProvider = "youtube" | "vimeo" | "mp4" | "other";
export type BindEmbedReadyOptions = {
  provider?: PlyrProvider;
  posterSrc?: string | null;
};

export const defaultPlyrOptions: PlyrOptions = {
  controls: ["play-large", "play", "progress", "current-time", "volume", "fullscreen"],
  ratio: "",
  fullscreen: { enabled: true, fallback: true, iosNative: true },
};

export const defaultPlyrSource: PlyrSourceBuilder = (item) => ({
  type: "video",
  poster: (item as any).thumb,
  sources: [{ src: (item as any).src, type: "video/mp4" }],
});

export const getSource = (item: MediaItem): PlyrSource => ({
  type: "video",
  sources: [{ src: (item as any).src, type: "video/mp4" }],
});

export const getOptions = () => defaultPlyrOptions;

export const isVideoItem = (m: MediaItem) => m.kind === "video";

export function buildPlyrProps(
  items: MediaItem[],
  getSource: (item: MediaItem, index: number) => PlyrSource,
  resolveOptions: (item: MediaItem, index: number) => PlyrOptions
): PlyrProp[] {
  return items.map((item, index) => {
    if (!isVideoItem(item)) return null;
    return { source: getSource(item, index), options: resolveOptions(item, index) };
  });
}

export function mergePlyrOptions(
  base: PlyrOptions,
  options?: PlyrOptionsBuilder
) {
  return (item: MediaItem, index: number): PlyrOptions => {
    const resolved =
      typeof options === "function" ? options(item, index) : (options ?? {});

    return { ...base, ...resolved };
  };
}

export function detectProvider(source: unknown): PlyrProvider {
  const s = source as Partial<PlyrSource> | null | undefined;

  const provider = String(s?.sources?.[0]?.provider ?? "").toLowerCase();
  if (provider === "youtube") return "youtube";
  if (provider === "vimeo") return "vimeo";

  const src0 = String(s?.sources?.[0]?.src ?? "").toLowerCase();
  const looksMp4 = src0.endsWith(".mp4") || src0.includes(".mp4?");
  if (looksMp4) return "mp4";

  return "other";
}

function hasEmbedPlaybackFacade(media: any) {
  return typeof media?.play === "function" && typeof media?.pause === "function";
}

function hasResolvedEmbedState(media: any) {
  const duration = Number(media?.duration ?? 0);
  if (Number.isFinite(duration) && duration > 0) return true;

  const currentSrc = media?.currentSrc;
  return typeof currentSrc === "string" && currentSrc.length > 0;
}

function extractCssUrl(value: string | null | undefined) {
  if (!value) return null;
  const match = /url\(["']?(.*?)["']?\)/.exec(value);
  return match?.[1] ?? null;
}

function resolveEmbedPosterSrc(plyr: any, preferredPosterSrc?: string | null) {
  if (preferredPosterSrc) return preferredPosterSrc;

  const container = plyr?.elements?.container as HTMLElement | null | undefined;
  const posterEl = container?.querySelector?.(".plyr__poster") as HTMLElement | null;
  if (!posterEl) return null;

  const inlineUrl = extractCssUrl(posterEl.style.backgroundImage);
  if (inlineUrl) return inlineUrl;

  try {
    return extractCssUrl(getComputedStyle(posterEl).backgroundImage);
  } catch {
    return null;
  }
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }

    window.setTimeout(resolve, Math.max(0, ms));
  });
}

async function waitForAnimationFrames(count = 1) {
  if (typeof window === "undefined" || count <= 0) return;

  for (let i = 0; i < count; i += 1) {
    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => resolve());
    });
  }
}

async function decodeImageSrc(src: string) {
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = src;

    if (img.complete) {
      return img.naturalWidth > 0 && img.naturalHeight > 0;
    }

    if (typeof img.decode === "function") {
      try {
        await img.decode();
        return img.naturalWidth > 0 && img.naturalHeight > 0;
      } catch {}
    }

    return await new Promise<boolean>((resolve) => {
      const cleanup = () => {
        img.onload = null;
        img.onerror = null;
      };

      img.onload = () => {
        cleanup();
        resolve(img.naturalWidth > 0 && img.naturalHeight > 0);
      };

      img.onerror = () => {
        cleanup();
        resolve(false);
      };
    });
  } catch {
    return false;
  }
}

async function settleEmbedReady(
  plyr: any,
  options: BindEmbedReadyOptions
) {
  if (options.provider !== "youtube") return;

  const posterSrc = resolveEmbedPosterSrc(plyr, options.posterSrc ?? null);
  if (posterSrc) {
    await Promise.race([
      decodeImageSrc(posterSrc),
      wait(650).then(() => false),
    ]);
  }

  await waitForAnimationFrames(2);
  await wait(posterSrc ? 120 : 180);
}

export function bindEmbedReady(
  plyr: any,
  onReady: () => void,
  options: BindEmbedReadyOptions = {}
) {
  let active = true;
  let settling = false;
  let mediaTarget: EventTarget | null = null;
  let intervalId: number | null = null;

  const teardown = () => {
    if (intervalId != null) {
      window.clearInterval(intervalId);
      intervalId = null;
    }

    try {
      plyr?.off?.("ready", handlePlyrReady);
    } catch {}

    detachMediaListeners();
  };

  const cleanup = () => {
    active = false;
    teardown();
  };

  const finalize = () => {
    if (!active) return;
    active = false;
    teardown();
    onReady();
  };

  const complete = () => {
    if (!active || settling) return;
    settling = true;
    teardown();

    void settleEmbedReady(plyr, options).finally(() => {
      finalize();
    });
  };

  const tryFromState = () => {
    const media = plyr?.media as any;
    if (!hasEmbedPlaybackFacade(media)) return false;
    if (!hasResolvedEmbedState(media)) return false;

    complete();
    return true;
  };

  const handleMediaReady = () => {
    complete();
  };

  const detachMediaListeners = () => {
    if (!mediaTarget || typeof (mediaTarget as any).removeEventListener !== "function") return;

    for (const type of ["durationchange", "timeupdate", "canplaythrough", "loadedmetadata", "load"]) {
      try {
        (mediaTarget as any).removeEventListener(type, handleMediaReady);
      } catch {}
    }

    mediaTarget = null;
  };

  const attachMediaListeners = () => {
    const nextTarget = (plyr?.media ?? null) as EventTarget | null;
    if (!nextTarget || nextTarget === mediaTarget) return;
    if (typeof (nextTarget as any).addEventListener !== "function") return;

    detachMediaListeners();
    mediaTarget = nextTarget;

    for (const type of ["durationchange", "timeupdate", "canplaythrough", "loadedmetadata", "load"]) {
      try {
        (nextTarget as any).addEventListener(type, handleMediaReady);
      } catch {}
    }
  };

  const handlePlyrReady = () => {
    complete();
  };

  try {
    plyr?.on?.("ready", handlePlyrReady);
  } catch {}

  attachMediaListeners();
  if (!tryFromState() && typeof window !== "undefined") {
    intervalId = window.setInterval(() => {
      attachMediaListeners();
      void tryFromState();
    }, 120);
  }

  return cleanup;
}

export function isVideoSlideElement(el: HTMLElement | undefined | null) {
  if (!el) return false;
  if (el.classList?.contains("rmg__player")) return true;
  if (el.tagName.toLowerCase() === "video") return true;
  return false;
}
