import type { IndexMode } from "../api/types";

export type SliderIndexEvent =
  | { type: "set"; index: number; mode: IndexMode }
  | { type: "bump"; delta: number; mode: IndexMode };

export type SliderIndexChannelLike = {
  get: () => { index: number; mode: IndexMode };
  set: (index: number, mode?: IndexMode, opts?: { silent?: boolean }) => void;
  bump: (delta: number, mode?: IndexMode, opts?: { silent?: boolean }) => void;
  onEvent?: (fn: (event: SliderIndexEvent) => void) => () => void;
  subscribe?: (fn: () => void) => () => void;
  onBasePointerDown?: (fn: () => void) => () => void;
  emitBasePointerDown?: () => void;
};

type CreateThumbnailSyncBridgeArgs = {
  localChannel: SliderIndexChannelLike;
  externalChannel?: SliderIndexChannelLike | null;
  clampIndex?: (index: number) => number;
};

export type ThumbnailSyncBridge = {
  start: () => () => void;
  stop: () => void;
  publishThumbnailClick: (index: number, mode?: IndexMode) => void;
};

function normalizeMode(mode: unknown): IndexMode {
  return mode === "instant" ? "instant" : "animated";
}

function normalizeFiniteInt(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value | 0;
}

function maybeClampIndex(
  index: number,
  clampIndex?: (index: number) => number
): number | null {
  if (!clampIndex) return index;
  const clamped = clampIndex(index);
  return normalizeFiniteInt(clamped);
}

export function createThumbnailSyncBridge(
  args: CreateThumbnailSyncBridgeArgs
): ThumbnailSyncBridge {
  const { localChannel, externalChannel = null, clampIndex } = args;

  let started = false;
  let unsubscribe: (() => void) | null = null;

  const setLocalIfChanged = (index: number, mode: IndexMode) => {
    const cur = localChannel.get();
    if (cur.index === index && normalizeMode(cur.mode) === mode) return;
    localChannel.set(index, mode);
  };

  const applyExternalStateToLocal = () => {
    if (!externalChannel) return;
    const state = externalChannel.get?.();
    const nextIndexRaw = normalizeFiniteInt(state?.index);
    if (nextIndexRaw == null) return;

    const nextIndex = maybeClampIndex(nextIndexRaw, clampIndex);
    if (nextIndex == null) return;

    setLocalIfChanged(nextIndex, normalizeMode(state?.mode));
  };

  const stop = () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    started = false;
  };

  const start = () => {
    if (started) return stop;
    started = true;

    if (!externalChannel) return stop;

    applyExternalStateToLocal();

    const unsubs: Array<() => void> = [];

    if (typeof externalChannel.onBasePointerDown === "function" &&
        typeof localChannel.emitBasePointerDown === "function") {
      unsubs.push(
        externalChannel.onBasePointerDown(() => {
          localChannel.emitBasePointerDown?.();
        })
      );
    }

    if (typeof externalChannel.onEvent === "function") {
      unsubs.push(
        externalChannel.onEvent((event) => {
          if (!event || typeof event !== "object") return;

          const mode = normalizeMode((event as SliderIndexEvent).mode);

          if ((event as SliderIndexEvent).type === "set") {
            const nextIndexRaw = normalizeFiniteInt((event as any).index);
            if (nextIndexRaw == null) return;
            const nextIndex = maybeClampIndex(nextIndexRaw, clampIndex);
            if (nextIndex == null) return;
            setLocalIfChanged(nextIndex, mode);
            return;
          }

          if ((event as SliderIndexEvent).type === "bump") {
            const delta = normalizeFiniteInt((event as any).delta);
            if (delta == null || delta === 0) return;
            localChannel.bump(delta, mode);
          }
        })
      );
    } else if (typeof externalChannel.subscribe === "function") {
      unsubs.push(
        externalChannel.subscribe(() => {
          applyExternalStateToLocal();
        })
      );
    }

    unsubscribe = () => {
      unsubs.forEach((fn) => fn());
    };

    return stop;
  };

  const publishThumbnailClick = (index: number, mode: IndexMode = "animated") => {
    if (!externalChannel) return;
    const nextIndexRaw = normalizeFiniteInt(index);
    if (nextIndexRaw == null) return;

    const nextIndex = maybeClampIndex(nextIndexRaw, clampIndex);
    if (nextIndex == null) return;

    externalChannel.set(nextIndex, normalizeMode(mode));
  };

  return {
    start,
    stop,
    publishThumbnailClick,
  };
}

export default createThumbnailSyncBridge;