import type { IndexMode } from "../api/types";
import type { SliderIndexChannel } from "../slider/sliderSub";
import type { FullscreenSliderSub } from "../fullscreen/fullscreenSliderSub";

type CreateFullscreenThumbnailSyncBridgeArgs = {
  localChannel: SliderIndexChannel;
  fsSub: FullscreenSliderSub;
  clampIndex?: (index: number) => number;
};

export type FullscreenThumbnailSyncBridge = {
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

export function createFullscreenThumbnailSyncBridge(
  args: CreateFullscreenThumbnailSyncBridgeArgs
): FullscreenThumbnailSyncBridge {
  const { localChannel, fsSub, clampIndex } = args;

  let started = false;
  let unsubscribe: (() => void) | null = null;

  const setLocalIfChanged = (index: number, mode: IndexMode) => {
    const cur = localChannel.get();
    if (cur.index === index && normalizeMode(cur.mode) === mode) return;
    localChannel.set(index, mode);
  };

  const applyFsStateToLocal = () => {
    const nextIndexRaw = normalizeFiniteInt(fsSub.get?.());
    if (nextIndexRaw == null) return;

    const nextIndex = maybeClampIndex(nextIndexRaw, clampIndex);
    if (nextIndex == null) return;

    setLocalIfChanged(nextIndex, "animated");
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

    applyFsStateToLocal();

    unsubscribe = fsSub.onEvent((event) => {
      if (!event || typeof event !== "object") return;
      if (event.type !== "internalIndex") return;

      const nextIndexRaw = normalizeFiniteInt(event.index);
      if (nextIndexRaw == null) return;

      const nextIndex = maybeClampIndex(nextIndexRaw, clampIndex);
      if (nextIndex == null) return;

      setLocalIfChanged(nextIndex, "animated");
    });

    return stop;
  };

  const publishThumbnailClick = (index: number, mode: IndexMode = "animated") => {
    const nextIndexRaw = normalizeFiniteInt(index);
    if (nextIndexRaw == null) return;

    const nextIndex = maybeClampIndex(nextIndexRaw, clampIndex);
    if (nextIndex == null) return;

    fsSub.requestSet(nextIndex, normalizeMode(mode));
  };

  return {
    start,
    stop,
    publishThumbnailClick,
  };
}

export default createFullscreenThumbnailSyncBridge;
