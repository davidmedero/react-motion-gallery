/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import styles from "../../slider/Slider.module.css";
import { Slider } from "../../slider/";
import type { EntriesMediaContainerRender } from "../index";
import { useOptionalGalleryCore } from "../../core";
import { BREAKPOINT_MAP } from "../../shared/responsive";
import { sliderArrows } from "../../slider/plugins/arrows";
import { sliderDots } from "../../slider/plugins/dots";
import type { SliderHandle, SliderOptions } from "../../slider/types";

const DEFAULT_SLIDER_OBJECT: SliderOptions = {
  align: 'start',
  direction: { dir: "ltr", axis: "x" },
  scroll: { loop: false, freeScroll: false, groupCells: false, skipSnaps: false },
  motion: { selectDuration: 25, freeScrollDuration: 43, friction: 0.68 },
  elements: { container: {}, viewport: {} },
  reveal: { staggerMs: 0, durationMs: 0 },
  plugins: [sliderArrows(), sliderDots()],
};

export type EntriesSliderMediaVirtualizationOptions = {
  enabled?: boolean;
  overscan?: number;
  minItems?: number;
  placeholder?:
    | React.ReactNode
    | ((args: { index: number; count: number }) => React.ReactNode);
};

export type EntriesSliderMediaOptions = {
  sliderObject?: SliderOptions;
  gap?: number;
  initialHeight?: number | string;
  columns?: number;
  sliderImagesReady?: any;
  renderFsCaption?: any;
  entrySliderRefs?: React.RefObject<Array<SliderHandle | null>>;
  virtualization?: boolean | EntriesSliderMediaVirtualizationOptions;
};

type SliderMediaWindowState = {
  activeIndex: number;
  visibleIndices: number[];
};

export type EntriesSliderMediaWindowContextValue = SliderMediaWindowState & {
  count: number;
  enabled: boolean;
  loop: boolean;
  overscan: number;
  minItems: number;
  placeholder?: EntriesSliderMediaVirtualizationOptions["placeholder"];
};

type EntriesSliderMediaWindowStore = {
  getContext: () => EntriesSliderMediaWindowContextValue | null;
  getSnapshot: (index: number) => boolean;
  setWindow: (next: EntriesSliderMediaWindowContextValue | null) => void;
  subscribe: (index: number, listener: () => void) => () => void;
};

const EntriesSliderMediaWindowContext =
  React.createContext<EntriesSliderMediaWindowStore | null>(null);

function normalizeVirtualizationOptions(
  virtualization: EntriesSliderMediaOptions["virtualization"],
) {
  if (virtualization === true) {
    return {
      enabled: true,
      overscan: 4,
      minItems: 12,
      placeholder: undefined,
    };
  }

  if (!virtualization) {
    return {
      enabled: false,
      overscan: 4,
      minItems: 12,
      placeholder: undefined,
    };
  }

  return {
    enabled: virtualization.enabled !== false,
    overscan: Math.max(0, virtualization.overscan ?? 4),
    minItems: Math.max(1, virtualization.minItems ?? 12),
    placeholder: virtualization.placeholder,
  };
}

function clampMediaIndex(index: number, count: number) {
  if (count <= 0) return 0;
  return Math.max(0, Math.min(count - 1, index));
}

function mediaIndexDistance(
  a: number,
  b: number,
  count: number,
  loop: boolean,
) {
  const direct = Math.abs(a - b);
  if (!loop || count <= 1) return direct;
  return Math.min(direct, count - direct);
}

export function shouldHydrateSliderMediaIndex(
  index: number,
  context: EntriesSliderMediaWindowContextValue | null,
) {
  if (!context?.enabled) return true;
  if (context.count < context.minItems) return true;

  const targets = context.visibleIndices.length
    ? context.visibleIndices
    : [context.activeIndex];

  return targets.some(
    (target) =>
      mediaIndexDistance(index, target, context.count, context.loop) <=
      context.overscan,
  );
}

function createEntriesSliderMediaWindowStore(
  initialContext: EntriesSliderMediaWindowContextValue | null,
): EntriesSliderMediaWindowStore {
  let context = initialContext;
  const listenersByIndex = new Map<number, Set<() => void>>();

  const getSnapshot = (index: number) =>
    shouldHydrateSliderMediaIndex(index, context);

  const notifyIndex = (index: number) => {
    const listeners = listenersByIndex.get(index);
    if (!listeners?.size) return;

    listeners.forEach((listener) => listener());
  };

  return {
    getContext: () => context,
    getSnapshot,
    setWindow: (next) => {
      const prev = context;
      context = next;

      listenersByIndex.forEach((_listeners, index) => {
        const wasHydrated = shouldHydrateSliderMediaIndex(index, prev);
        const isHydrated = shouldHydrateSliderMediaIndex(index, next);
        const placeholderChanged = prev?.placeholder !== next?.placeholder;
        const countChanged = prev?.count !== next?.count;

        if (
          wasHydrated !== isHydrated ||
          (!isHydrated && (placeholderChanged || countChanged))
        ) {
          notifyIndex(index);
        }
      });
    },
    subscribe: (index, listener) => {
      let listeners = listenersByIndex.get(index);
      if (!listeners) {
        listeners = new Set();
        listenersByIndex.set(index, listeners);
      }

      listeners.add(listener);

      return () => {
        listeners?.delete(listener);
        if (!listeners?.size) listenersByIndex.delete(index);
      };
    },
  };
}

function defaultVirtualPlaceholder() {
  return (
    <span
      aria-hidden="true"
      data-rmg-entry-slider-media-placeholder="true"
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        minHeight: "inherit",
        aspectRatio: "inherit",
        pointerEvents: "none",
      }}
    />
  );
}

function EntriesSliderMediaWindowItem({
  index,
  children,
}: {
  index: number;
  children: React.ReactNode;
}) {
  const store = React.useContext(EntriesSliderMediaWindowContext);
  const subscribe = React.useCallback(
    (listener: () => void) => store?.subscribe(index, listener) ?? (() => {}),
    [index, store],
  );
  const getSnapshot = React.useCallback(
    () => store?.getSnapshot(index) ?? true,
    [index, store],
  );
  const hydrate = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );
  const context = store?.getContext() ?? null;

  if (hydrate || !context) return <>{children}</>;

  if (typeof context.placeholder === "function") {
    return <>{context.placeholder({ index, count: context.count })}</>;
  }

  return <>{context.placeholder ?? defaultVirtualPlaceholder()}</>;
}

function getNodeKey(node: React.ReactNode, index: number) {
  return React.isValidElement(node) && node.key != null
    ? node.key
    : `media-${index}`;
}

function sameNumberArray(a: number[], b: number[]) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function EntriesSliderMediaContainer(props: {
  entryIndex: number;
  entryInView?: boolean;
  mediaNodes: React.ReactNode[];
  opts?: EntriesSliderMediaOptions;
  entrySliderRefs: React.RefObject<Array<SliderHandle | null>>;
}) {
  const { entryIndex, entryInView, mediaNodes, opts, entrySliderRefs } = props;
  const sliderHandleRef = React.useRef<SliderHandle | null>(null);
  const [sliderHandle, setSliderHandle] = React.useState<SliderHandle | null>(
    null,
  );

  const hasMedia = Array.isArray(mediaNodes) && mediaNodes.length > 0;

  const core = useOptionalGalleryCore();

  const sliderObject = React.useMemo(() => {
    const src = opts?.sliderObject;

    return {
      ...(src ?? DEFAULT_SLIDER_OBJECT),
      reveal: {
        ...(DEFAULT_SLIDER_OBJECT.reveal ?? {}),
        ...(src?.reveal ?? {}),
        inView: entryInView,
      },
    } satisfies SliderOptions;
  }, [entryInView, opts?.sliderObject]);

  const effectiveBreakpoints = (core?.effectiveBreakpoints ?? { ...BREAKPOINT_MAP });
  const initialHeight =
    typeof opts?.initialHeight === "number"
      ? `${opts.initialHeight}px`
      : opts?.initialHeight;
  const virtualization = React.useMemo(
    () => normalizeVirtualizationOptions(opts?.virtualization),
    [opts?.virtualization],
  );
  const loop = sliderObject.scroll?.loop === true;
  const initialWindowContext =
    React.useMemo<EntriesSliderMediaWindowContextValue | null>(
      () =>
        virtualization.enabled
          ? {
              activeIndex: 0,
              visibleIndices: [0],
              count: mediaNodes.length,
              enabled: true,
              loop,
              overscan: virtualization.overscan,
              minItems: virtualization.minItems,
              placeholder: virtualization.placeholder,
            }
          : null,
      [
        loop,
        mediaNodes.length,
        virtualization.enabled,
        virtualization.minItems,
        virtualization.overscan,
        virtualization.placeholder,
      ],
    );
  const mediaWindowStore = React.useMemo(
    () => createEntriesSliderMediaWindowStore(initialWindowContext),
    // The store is intentionally stable; option and window changes flow through
    // setWindow so subscribed cells can update independently.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const syncMediaWindow = React.useCallback(
    (handle: SliderHandle | null = sliderHandleRef.current) => {
      if (!virtualization.enabled) {
        mediaWindowStore.setWindow(null);
        return;
      }
      if (!handle) {
        mediaWindowStore.setWindow(initialWindowContext);
        return;
      }

      const count = mediaNodes.length;
      const activeIndex = clampMediaIndex(handle.getIndex?.() ?? 0, count);
      let visibleIndices: number[] = [];

      try {
        visibleIndices = handle
          .cellsInView()
          .filter((index) => Number.isFinite(index))
          .map((index) => clampMediaIndex(index, count));
      } catch {
        visibleIndices = [];
      }

      if (!visibleIndices.length) visibleIndices = [activeIndex];

      visibleIndices = Array.from(new Set(visibleIndices)).sort(
        (a, b) => a - b,
      );

      const prev = mediaWindowStore.getContext();
      if (
        prev?.activeIndex === activeIndex &&
        prev.count === count &&
        prev.loop === loop &&
        prev.overscan === virtualization.overscan &&
        prev.minItems === virtualization.minItems &&
        prev.placeholder === virtualization.placeholder &&
        sameNumberArray(prev.visibleIndices, visibleIndices)
      ) {
        return;
      }

      mediaWindowStore.setWindow({
        activeIndex,
        visibleIndices,
        count,
        enabled: true,
        loop,
        overscan: virtualization.overscan,
        minItems: virtualization.minItems,
        placeholder: virtualization.placeholder,
      });
    },
    [
      initialWindowContext,
      loop,
      mediaNodes.length,
      mediaWindowStore,
      virtualization.enabled,
      virtualization.minItems,
      virtualization.overscan,
      virtualization.placeholder,
    ],
  );

  React.useEffect(() => {
    syncMediaWindow(sliderHandleRef.current);
  }, [syncMediaWindow]);

  React.useEffect(() => {
    if (!virtualization.enabled || !sliderHandle) return;

    const rafIds: number[] = [];
    const timeoutIds: number[] = [];

    const scheduleSync = () => {
      syncMediaWindow(sliderHandle);

      if (typeof requestAnimationFrame === "function") {
        rafIds.push(requestAnimationFrame(() => syncMediaWindow(sliderHandle)));
      }

      if (typeof window !== "undefined") {
        timeoutIds.push(
          window.setTimeout(() => syncMediaWindow(sliderHandle), 80),
          window.setTimeout(() => syncMediaWindow(sliderHandle), 240),
        );
      }
    };

    scheduleSync();

    const unsubscribeIndex = sliderHandle.subscribeIndex(() => {
      scheduleSync();
    });
    const unsubscribeBuilt = sliderHandle.onSlidesBuilt(() => {
      scheduleSync();
    });
    const raf =
      typeof requestAnimationFrame === "function"
        ? requestAnimationFrame(scheduleSync)
        : null;

    return () => {
      unsubscribeIndex();
      unsubscribeBuilt();
      if (raf != null && typeof cancelAnimationFrame === "function") {
        cancelAnimationFrame(raf);
      }
      rafIds.forEach((id) => {
        if (typeof cancelAnimationFrame === "function") {
          cancelAnimationFrame(id);
        }
      });
      timeoutIds.forEach((id) => window.clearTimeout(id));
    };
  }, [sliderHandle, syncMediaWindow, virtualization.enabled]);

  const sliderMediaNodes = React.useMemo(() => {
    if (!virtualization.enabled) return mediaNodes;

    return mediaNodes.map((node, index) => (
      <EntriesSliderMediaWindowItem key={getNodeKey(node, index)} index={index}>
        {node}
      </EntriesSliderMediaWindowItem>
    ));
  }, [mediaNodes, virtualization.enabled]);

  const setSliderRef = React.useCallback(
    (node: SliderHandle | null) => {
      const handle = node ?? null;
      entrySliderRefs.current[entryIndex] = handle;
      sliderHandleRef.current = handle;
      setSliderHandle((current) => (current === handle ? current : handle));
      syncMediaWindow(handle);
    },
    [entryIndex, entrySliderRefs, syncMediaWindow],
  );

  React.useEffect(() => {
    if (hasMedia) return;
    entrySliderRefs.current[entryIndex] = null;
    sliderHandleRef.current = null;
    setSliderHandle(null);
  }, [entryIndex, entrySliderRefs, hasMedia]);

  if (!hasMedia) return null;

  return (
    <div
      className={styles.sliderShell}
      style={{
        ...(initialHeight
          ? { ["--rmg-slider-initial-height" as any]: initialHeight }
          : null),
        minHeight:
          "var(--rmg-slider-initial-height, var(--rmg-slider-height, 0px))",
      }}
    >
      <EntriesSliderMediaWindowContext.Provider value={mediaWindowStore}>
        <Slider
          {...sliderObject}
          breakpoints={effectiveBreakpoints}
          ref={setSliderRef}
        >
          {sliderMediaNodes}
        </Slider>
      </EntriesSliderMediaWindowContext.Provider>
    </div>
  );
}

export function createEntriesSliderMedia(
  opts: EntriesSliderMediaOptions = {}
): EntriesMediaContainerRender {
  const fallbackRefs =
    opts.entrySliderRefs ?? ({ current: [] } as React.RefObject<Array<SliderHandle | null>>);

  return ({ entryIndex, entryInView, mediaNodes, entrySliderRefs }) => {
    const refs = entrySliderRefs ?? fallbackRefs;

    return (
      <EntriesSliderMediaContainer
        entryIndex={entryIndex}
        entryInView={entryInView}
        mediaNodes={mediaNodes}
        opts={opts}
        entrySliderRefs={refs}
      />
    );
  };
}
