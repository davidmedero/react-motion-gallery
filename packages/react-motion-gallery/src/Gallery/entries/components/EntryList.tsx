import * as React from "react";
import styles from "../Entries.module.css";
import type {
  EntriesHandle,
  EntriesInfiniteScrollOptions,
  EntriesLoadMoreOptions,
  EntriesLayout,
  EntriesOptions,
  EntriesPaginationOptions,
  EntriesPlugin,
  EntriesVirtualizationOptions,
  EntryItem,
} from "../types";
import type { BreakpointMap } from "../../shared/responsive";
import { useEntryInView } from "../hooks/useEntryInView";
import { isEntriesPlugin } from "../plugins/create";
import { usePrefersReducedMotion } from "../../shared/hooks/usePrefersReducedMotion";
import { EntrySkeletonCard, EntrySkeletonSpec } from "./EntrySkeleton";
import {
  useNormalizedEntriesReveal,
  useNormalizedEntriesLoading,
} from "../normalize";
import { MediaItem } from "../../shared/types/media";
import { SliderHandle } from "../../slider/types";
import {
  resolveCompareLoadingLayerVisualState,
  resolveLoadingForceOptions,
  type LoadingForceOptions,
} from "../../shared/loading/force";

declare const process:
  | {
      env: {
        NODE_ENV?: string;
      };
    }
  | undefined;

const REVEAL_OVERLAP_MS = 220;
const ENTRY_READY_MEDIA_SELECTOR = '[data-rmg-entry-media-priority="true"]';

type IndexedEntry = {
  entry: EntryItem;
  entryIndex: number;
};

type VirtualWindowState = {
  start: number;
  end: number;
  startRow: number;
  endRow: number;
  topSpacer: number;
  bottomSpacer: number;
  columnCount: number;
  layout: "list" | "grid";
  measureRow: (index: number, node: HTMLElement | null) => void;
};

type VirtualWindowRange = Omit<VirtualWindowState, "measureRow">;

function countGridTemplateTracks(template: string | undefined) {
  if (!template || template === "none") return 0;

  let depth = 0;
  let tracks = 0;
  let token = "";
  let hasAutoRepeat = false;

  const countToken = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    const repeatMatch = trimmed.match(/^repeat\(\s*([^,\s]+)\s*,/i);
    if (repeatMatch) {
      const repeatCount = Number(repeatMatch[1]);
      if (Number.isFinite(repeatCount)) {
        tracks += Math.max(1, repeatCount | 0);
      } else {
        hasAutoRepeat = true;
      }
      return;
    }

    tracks += 1;
  };

  for (const char of template.trim()) {
    if (char === "(") depth += 1;
    if (char === ")") depth = Math.max(0, depth - 1);
    if (/\s/.test(char) && depth === 0) {
      countToken(token);
      token = "";
      continue;
    }

    token += char;
  }

  countToken(token);
  return hasAutoRepeat ? 0 : tracks;
}

function resolveEntryGridColumnCount(root: HTMLElement | null) {
  if (!root || typeof window === "undefined") return 1;

  const style = window.getComputedStyle(root);
  if (!style.display.includes("grid")) return 1;

  const tracks = countGridTemplateTracks(style.gridTemplateColumns);
  return Math.max(1, tracks || 1);
}

function isImageElement(node: Element): node is HTMLImageElement {
  return (
    typeof HTMLImageElement !== "undefined" && node instanceof HTMLImageElement
  );
}

function getBlockingEntryImages(row: HTMLElement) {
  const imageSet = new Set<HTMLImageElement>();
  const mediaRoots = Array.from(
    row.querySelectorAll(ENTRY_READY_MEDIA_SELECTOR),
  );

  mediaRoots.forEach((mediaRoot) => {
    if (isImageElement(mediaRoot)) {
      imageSet.add(mediaRoot);
    }

    mediaRoot.querySelectorAll("img").forEach((image) => {
      if (isImageElement(image)) imageSet.add(image);
    });
  });

  return Array.from(imageSet);
}

function waitForImageElementReady(
  image: HTMLImageElement,
  timeoutMs?: number,
) {
  if (image.complete) return Promise.resolve();

  const decode = (image as any).decode;
  const readyPromise =
    typeof decode === "function"
      ? decode.call(image).catch(() => undefined)
      : Promise.resolve();

  if (
    timeoutMs == null ||
    timeoutMs <= 0 ||
    typeof window === "undefined"
  ) {
    return readyPromise;
  }

  return Promise.race([
    readyPromise,
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, timeoutMs);
    }),
  ]);
}

async function waitForEntryContentReady(
  row: HTMLElement,
  options?: { waitForImages?: boolean; timeoutMs?: number },
) {
  const images =
    options?.waitForImages === false ? [] : getBlockingEntryImages(row);

  await Promise.all(
    images.map((image) => waitForImageElementReady(image, options?.timeoutMs)),
  );
}

type Props = {
  enabled: boolean;
  entries: EntriesOptions;
  fsEnabled: boolean;
  openFullscreenAt: (
    globalIndex: number,
    originEl?: HTMLElement | null,
  ) => void;
  entryFlatIndex: number[][] | null;
  entryFlatIndexRef: React.RefObject<number[][] | null>;
  nodeFromMedia: (m: MediaItem) => React.ReactNode;
  renderMediaContainer: (args: {
    entryIndex: number;
    entryInView?: boolean;
    mediaNodes: React.ReactNode[];
    entrySliderRefs?: React.RefObject<Array<SliderHandle | null>>;
  }) => React.ReactNode;
  breakpoints: BreakpointMap;
  registerExpandableImage?: (
    globalIndex: number,
    node: HTMLImageElement | HTMLVideoElement | null,
  ) => void;
  entrySliderRefs?: React.RefObject<Array<SliderHandle | null>>;
  listRef?: React.RefObject<HTMLDivElement | null>;
};

function warnEntriesOnce(key: string, message: string) {
  if (typeof process !== "undefined" && process.env.NODE_ENV === "production")
    return;

  const globalKey = "__rmgEntriesWarnings";
  const store = ((globalThis as any)[globalKey] ??=
    new Set<string>()) as Set<string>;
  if (store.has(key)) return;
  store.add(key);
  console.warn(message);
}

function getEnabledEntriesPlugins(plugins: EntriesPlugin[] | undefined) {
  return (plugins ?? []).filter((plugin) => {
    if (!isEntriesPlugin(plugin)) return false;
    return (plugin.options as any)?.enabled !== false;
  });
}

function resolveEntriesDataWindow(
  items: EntryItem[],
  plugins: EntriesPlugin[],
) {
  const indexedItems: IndexedEntry[] = items.map((entry, entryIndex) => ({
    entry,
    entryIndex,
  }));

  const windowPlugins = plugins.filter(
    (plugin) => plugin.kind === "pagination" || plugin.kind === "load-more",
  );

  if (windowPlugins.length > 1) {
    warnEntriesOnce(
      "entries-window-conflict",
      "[react-motion-gallery] Entries received multiple data-window plugins. Only the first pagination/load-more plugin is applied.",
    );
  }

  const plugin = windowPlugins[0];
  if (!plugin) return indexedItems;

  if (plugin.kind === "pagination") {
    const options = plugin.options as EntriesPaginationOptions;
    if (options.mode === "server") return indexedItems;

    const pageSize = Math.max(1, options.pageSize | 0);
    const pageIndex = Math.max(0, options.pageIndex | 0);
    const start = pageIndex * pageSize;
    return indexedItems.slice(start, start + pageSize);
  }

  const options = plugin.options as EntriesLoadMoreOptions;
  if (options.mode === "server") return indexedItems;

  return indexedItems.slice(0, Math.max(0, options.visibleCount | 0));
}

function useEntriesVirtualWindow(
  count: number,
  listRef: React.RefObject<HTMLDivElement | null>,
  options?: EntriesVirtualizationOptions,
  fallbackLayout: EntriesLayout = "list",
): VirtualWindowState {
  const enabled = options?.enabled !== false && !!options;
  const layout =
    (options?.layout ?? fallbackLayout) === "grid" ? "grid" : "list";
  const estimateSize = Math.max(1, options?.estimateSize ?? 420);
  const gap = Math.max(0, options?.gap ?? 24);
  const overscan = Math.max(0, options?.overscan ?? 3);
  const sizesRef = React.useRef(new Map<number, number>());
  const observersRef = React.useRef(new Map<HTMLElement, ResizeObserver>());
  const columnCountRef = React.useRef(1);
  const layoutRef = React.useRef<"list" | "grid">(layout);
  const [range, setRange] = React.useState<VirtualWindowRange>(() => ({
    start: 0,
    end: count,
    startRow: 0,
    endRow: count,
    topSpacer: 0,
    bottomSpacer: 0,
    columnCount: 1,
    layout,
  }));

  const getSize = React.useCallback(
    (index: number) => sizesRef.current.get(index) ?? estimateSize,
    [estimateSize],
  );

  const recomputeRange = React.useCallback(() => {
    const root = listRef.current;
    const columnCount =
      layout === "grid" ? resolveEntryGridColumnCount(root) : 1;
    const rowCount = layout === "grid" ? Math.ceil(count / columnCount) : count;

    if (
      columnCountRef.current !== columnCount ||
      layoutRef.current !== layout
    ) {
      sizesRef.current.clear();
      columnCountRef.current = columnCount;
      layoutRef.current = layout;
    }

    const fullRange: VirtualWindowRange = {
      start: 0,
      end: count,
      startRow: 0,
      endRow: rowCount,
      topSpacer: 0,
      bottomSpacer: 0,
      columnCount,
      layout,
    };

    if (!enabled || typeof window === "undefined") {
      setRange(fullRange);
      return;
    }

    if (!root || rowCount <= 0) {
      setRange(fullRange);
      return;
    }

    const rect = root.getBoundingClientRect();
    const viewportTop = -rect.top;
    const viewportBottom = viewportTop + window.innerHeight;
    let cursor = 0;
    let startRow = 0;
    let endRow = rowCount;

    for (let index = 0; index < rowCount; index++) {
      const size = getSize(index);
      const itemEnd = cursor + size;
      if (itemEnd >= viewportTop) {
        startRow = Math.max(0, index - overscan);
        break;
      }
      cursor = itemEnd + gap;
    }

    cursor = 0;
    for (let index = 0; index < rowCount; index++) {
      const size = getSize(index);
      const itemEnd = cursor + size;
      if (itemEnd >= viewportBottom) {
        endRow = Math.min(rowCount, index + 1 + overscan);
        break;
      }
      cursor = itemEnd + gap;
    }

    let topSpacer = 0;
    for (let index = 0; index < startRow; index++) {
      topSpacer += getSize(index);
      if (index < startRow - 1) topSpacer += gap;
    }

    let bottomSpacer = 0;
    for (let index = endRow; index < rowCount; index++) {
      bottomSpacer += getSize(index);
      if (index < rowCount - 1) bottomSpacer += gap;
    }

    const start = layout === "grid" ? startRow * columnCount : startRow;
    const end =
      layout === "grid"
        ? Math.min(count, endRow * columnCount)
        : Math.min(count, endRow);

    setRange((prev) =>
      prev.start === start &&
      prev.end === end &&
      prev.startRow === startRow &&
      prev.endRow === endRow &&
      prev.topSpacer === topSpacer &&
      prev.bottomSpacer === bottomSpacer &&
      prev.columnCount === columnCount &&
      prev.layout === layout
        ? prev
        : {
            start,
            end,
            startRow,
            endRow,
            topSpacer,
            bottomSpacer,
            columnCount,
            layout,
          },
    );
  }, [count, enabled, gap, getSize, layout, listRef, overscan]);

  React.useEffect(() => {
    recomputeRange();
  }, [count, enabled, estimateSize, gap, layout, overscan, recomputeRange]);

  React.useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    window.addEventListener("scroll", recomputeRange, { passive: true });
    window.addEventListener("resize", recomputeRange);
    return () => {
      window.removeEventListener("scroll", recomputeRange);
      window.removeEventListener("resize", recomputeRange);
    };
  }, [enabled, recomputeRange]);

  React.useEffect(() => {
    return () => {
      observersRef.current.forEach((observer) => observer.disconnect());
      observersRef.current.clear();
    };
  }, []);

  const measureRow = React.useCallback(
    (index: number, node: HTMLElement | null) => {
      for (const [observedNode, observer] of observersRef.current.entries()) {
        if (
          observedNode !== node &&
          observedNode.getAttribute("data-rmg-entry-virtual-measure-index") ===
            String(index)
        ) {
          observer.disconnect();
          observersRef.current.delete(observedNode);
        }
      }

      if (!enabled || !node) return;

      node.setAttribute("data-rmg-entry-virtual-measure-index", String(index));

      const read = () => {
        const next = node.getBoundingClientRect().height;
        if (next <= 0) return;
        if (sizesRef.current.get(index) === next) return;
        sizesRef.current.set(index, next);
        recomputeRange();
      };

      read();

      if (
        typeof ResizeObserver === "undefined" ||
        observersRef.current.has(node)
      ) {
        return;
      }

      const observer = new ResizeObserver(read);
      observer.observe(node);
      observersRef.current.set(node, observer);
    },
    [enabled, recomputeRange],
  );

  if (!enabled) {
    return {
      start: 0,
      end: count,
      startRow: 0,
      endRow: count,
      topSpacer: 0,
      bottomSpacer: 0,
      columnCount: 1,
      layout,
      measureRow: () => undefined,
    };
  }

  return {
    ...range,
    end: Math.min(range.end, count),
    measureRow,
  };
}

function EntriesInfiniteSentinel({
  options,
  listRef,
}: {
  options: EntriesInfiniteScrollOptions;
  listRef: React.RefObject<HTMLDivElement | null>;
}) {
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  const armedRef = React.useRef(true);
  const enabled = options.enabled !== false;
  const hasMore = options.hasMore ?? true;
  const loading = !!options.loading;

  React.useEffect(() => {
    armedRef.current = true;
  }, [hasMore]);

  React.useEffect(() => {
    if (!enabled || !hasMore || typeof IntersectionObserver === "undefined")
      return;

    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.some((entry) => entry.isIntersecting);
        if (!intersecting) {
          armedRef.current = true;
          return;
        }

        if (!armedRef.current || loading) return;
        armedRef.current = false;
        options.onLoadMore?.();
      },
      {
        root: null,
        rootMargin: options.rootMargin ?? "600px 0px",
        threshold: options.threshold ?? 0,
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [
    enabled,
    hasMore,
    listRef,
    loading,
    options,
    options.onLoadMore,
    options.rootMargin,
    options.threshold,
  ]);

  if (!enabled || !hasMore) return null;

  return (
    <div
      ref={sentinelRef}
      className={styles.entryDataSentinel}
      data-rmg-entries-infinite-sentinel
      data-rmg-entries-infinite-loading={loading ? "1" : "0"}
      aria-hidden="true"
    >
      {options.sentinel}
    </div>
  );
}

export function resolveEntryLoadingVisualState(args: {
  loadingActive: boolean;
  loadingForced?: LoadingForceOptions;
  shouldMountContent: boolean;
  contentReady: boolean;
  defaultReveal: boolean;
}) {
  const compareState = resolveCompareLoadingLayerVisualState({
    loadingActive: args.loadingActive && args.shouldMountContent,
    loadingForced: args.loadingForced,
    contentReady: args.contentReady,
  });
  const resolvedForce = resolveLoadingForceOptions(args.loadingForced);
  const forcedLoading = args.loadingActive && resolvedForce.enabled;

  return {
    compareMode: compareState.compareMode,
    revealContent: compareState.compareMode
      ? true
      : forcedLoading
        ? false
        : args.defaultReveal,
    loadingLayerOpacity: compareState.loadingLayerOpacity,
  };
}

function splitEntrySkeletonWrapStyle(
  style: React.CSSProperties | undefined,
): React.CSSProperties | undefined {
  if (!style) return undefined;

  const nextStyle = { ...style } as React.CSSProperties &
    Record<string, unknown>;

  if (nextStyle.boxShadow != null) {
    nextStyle["--rmg-entry-skel-wrap-shadow"] = nextStyle.boxShadow;
    delete nextStyle.boxShadow;
  }

  if (nextStyle.borderRadius != null) {
    nextStyle["--rmg-entry-skel-wrap-shadow-radius"] = nextStyle.borderRadius;
  }

  return nextStyle;
}

function getEntryKey(entry: any, entryIndex: number) {
  return String((entry as any).key ?? (entry as any).id ?? entryIndex);
}

function getEntryStateKey(entry: any, entryIndex: number) {
  return String(
    (entry as any).revealKey ??
      (entry as any).stateKey ??
      (entry as any).id ??
      (entry as any).key ??
      entryIndex,
  );
}

function isTransparentMasonryItemElement(node: React.ReactElement<any>) {
  const type = node.type as any;
  return Boolean(type?.__rmgLightMasonryItem || type?.__rmgMasonryItem);
}

function splitEntryKeySignature(signature: string) {
  return signature ? signature.split("\u0000") : [];
}

function pruneEntryKeySet(prev: Set<string>, keySignature: string) {
  if (prev.size === 0) return prev;

  const currentKeys = new Set(splitEntryKeySignature(keySignature));
  let changed = false;
  const next = new Set<string>();

  prev.forEach((entryKey) => {
    if (currentKeys.has(entryKey)) {
      next.add(entryKey);
    } else {
      changed = true;
    }
  });

  return changed ? next : prev;
}

function addEntryKeysToSet(prev: Set<string>, entryKeys: string[]) {
  let changed = false;
  const next = new Set(prev);

  entryKeys.forEach((entryKey) => {
    if (!next.has(entryKey)) {
      next.add(entryKey);
      changed = true;
    }
  });

  return changed ? next : prev;
}

export const EntryList = React.forwardRef<EntriesHandle, Props>(
  function EntryList(
    {
      enabled,
      entries,
      fsEnabled,
      openFullscreenAt,
      entryFlatIndex,
      nodeFromMedia,
      renderMediaContainer,
      breakpoints,
      registerExpandableImage,
      entrySliderRefs,
      listRef: providedListRef,
    },
    forwardedRef,
  ) {
    const DRAG_PX = 6;

    const downPosRef = React.useRef<{ x: number; y: number } | null>(null);
    const draggedRef = React.useRef(false);

    const onPointerDownCapture: React.PointerEventHandler<HTMLElement> = (
      e,
    ) => {
      if ((e as any).button != null && (e as any).button !== 0) return;

      draggedRef.current = false;
      downPosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMoveCapture: React.PointerEventHandler<HTMLElement> = (
      e,
    ) => {
      const p = downPosRef.current;
      if (!p) return;

      const dx = e.clientX - p.x;
      const dy = e.clientY - p.y;

      if (!draggedRef.current && dx * dx + dy * dy >= DRAG_PX * DRAG_PX) {
        draggedRef.current = true;
      }
    };

    const onPointerUpCapture: React.PointerEventHandler<HTMLElement> = () => {
      downPosRef.current = null;

      window.setTimeout(() => {
        draggedRef.current = false;
      }, 0);
    };

    const shouldBlockClick = () => draggedRef.current;

    function resolveEntrySkeletonSpec(
      entry: any,
      entryIndex: number,
    ): EntrySkeletonSpec {
      const skel = (entries as any)?.loading?.skeleton;

      if (typeof skel === "function") {
        const out = skel({ entry, entryIndex });
        if (out && typeof out === "object") return out as EntrySkeletonSpec;
      } else if (skel && typeof skel === "object") {
        return skel as EntrySkeletonSpec;
      }

      return {
        variant: "solid",
        minHeight: 260,
      };
    }

    const items = entries.items ?? [];
    const entryPlugins = React.useMemo(
      () => getEnabledEntriesPlugins(entries.plugins),
      [entries.plugins],
    );
    const loadingN = useNormalizedEntriesLoading(entries);
    const revealN = useNormalizedEntriesReveal(entries);
    const loadingOpts = (entries as any)?.loading as
      | {
          enabled?: boolean;
          force?: LoadingForceOptions;
        }
      | undefined;
    const loadingEnabled = loadingOpts?.enabled ?? true;
    const loadingActive = enabled && loadingEnabled;
    const renderedEntries = React.useMemo(
      () => resolveEntriesDataWindow(items, entryPlugins),
      [entryPlugins, items],
    );
    const infiniteScrollPlugin = React.useMemo(
      () => entryPlugins.find((plugin) => plugin.kind === "infinite-scroll"),
      [entryPlugins],
    );
    const paginationPlugin = React.useMemo(
      () => entryPlugins.find((plugin) => plugin.kind === "pagination"),
      [entryPlugins],
    );
    const virtualizationPlugin = React.useMemo(
      () => entryPlugins.find((plugin) => plugin.kind === "virtualization"),
      [entryPlugins],
    );
    const entryListLayout: EntriesLayout =
      entries.layout === "grid" ? "grid" : "list";
    const pluginsLoading = entryPlugins.some(
      (plugin) => !!(plugin.options as any)?.loading,
    );
    const paginationLoading = !!(
      paginationPlugin?.options as EntriesPaginationOptions | undefined
    )?.loading;
    const len = items.length;
    const entryRenderKeys = React.useMemo(
      () => items.map((entry, entryIndex) => getEntryKey(entry, entryIndex)),
      [items],
    );
    const entryStateKeys = React.useMemo(
      () =>
        items.map((entry, entryIndex) => getEntryStateKey(entry, entryIndex)),
      [items],
    );
    const entryStateKeySignature = entryStateKeys.join("\u0000");
    const retainedEntryStateKeySignature = React.useMemo(() => {
      if (loadingN.rememberRevealed !== false) return entryStateKeySignature;

      return renderedEntries
        .map(
          ({ entry, entryIndex }) =>
            entryStateKeys[entryIndex] ?? getEntryStateKey(entry, entryIndex),
        )
        .join("\u0000");
    }, [
      entryStateKeySignature,
      entryStateKeys,
      loadingN.rememberRevealed,
      renderedEntries,
    ]);
    const [animatedReadyEntryKeys, setAnimatedReadyEntryKeys] = React.useState<
      Set<string>
    >(() => new Set());
    const [paintedContentEntryKeys, setPaintedContentEntryKeys] =
      React.useState<Set<string>>(() => new Set());
    const [paintedReadyContentEntryKeys, setPaintedReadyContentEntryKeys] =
      React.useState<Set<string>>(() => new Set());
    const [verifiedReadyContentEntryKeys, setVerifiedReadyContentEntryKeys] =
      React.useState<Set<string>>(() => new Set());
    const [settledRevealEntryKeys, setSettledRevealEntryKeys] = React.useState<
      Set<string>
    >(() => new Set());
    const [settledSkeletonEntryKeys, setSettledSkeletonEntryKeys] =
      React.useState<Set<string>>(() => new Set());
    const entryRowNodesRef = React.useRef(new Map<string, HTMLElement>());
    const queuedRevealEntryKeysRef = React.useRef(new Set<string>());
    const revealQueueRef = React.useRef<string[]>([]);
    const revealSchedulerActiveRef = React.useRef(false);
    const revealSchedulerTimerRef = React.useRef<number | null>(null);
    const revealSchedulerFrameIdsRef = React.useRef<number[]>([]);

    const clearRevealScheduler = React.useCallback(() => {
      if (revealSchedulerTimerRef.current != null) {
        window.clearTimeout(revealSchedulerTimerRef.current);
        revealSchedulerTimerRef.current = null;
      }

      revealSchedulerFrameIdsRef.current.forEach((frameId) => {
        window.cancelAnimationFrame(frameId);
      });
      revealSchedulerFrameIdsRef.current = [];
      revealSchedulerActiveRef.current = false;
    }, []);

    const scheduleQueuedReveal = React.useCallback(
      (delayMs = 0) => {
        if (
          revealSchedulerActiveRef.current ||
          revealQueueRef.current.length === 0
        ) {
          return;
        }

        const releaseNextEntry = () => {
          revealSchedulerActiveRef.current = false;
          revealSchedulerTimerRef.current = null;
          revealSchedulerFrameIdsRef.current = [];

          const entryKey = revealQueueRef.current.shift();
          if (!entryKey) return;

          queuedRevealEntryKeysRef.current.delete(entryKey);
          setAnimatedReadyEntryKeys((prev) =>
            addEntryKeysToSet(prev, [entryKey]),
          );

          if (revealQueueRef.current.length > 0) {
            scheduleQueuedReveal(Math.max(0, revealN.staggerMs));
          }
        };

        const releaseAfterPaint = () => {
          if (
            typeof window === "undefined" ||
            typeof window.requestAnimationFrame !== "function"
          ) {
            releaseNextEntry();
            return;
          }

          const firstFrame = window.requestAnimationFrame(() => {
            const secondFrame = window.requestAnimationFrame(releaseNextEntry);
            revealSchedulerFrameIdsRef.current = [firstFrame, secondFrame];
          });
          revealSchedulerFrameIdsRef.current = [firstFrame];
        };

        revealSchedulerActiveRef.current = true;

        if (delayMs > 0 && typeof window !== "undefined") {
          revealSchedulerTimerRef.current = window.setTimeout(
            releaseAfterPaint,
            delayMs,
          );
          return;
        }

        releaseAfterPaint();
      },
      [revealN.staggerMs],
    );

    React.useEffect(() => {
      const currentKeys = new Set(
        splitEntryKeySignature(retainedEntryStateKeySignature),
      );

      setAnimatedReadyEntryKeys((prev) =>
        pruneEntryKeySet(prev, retainedEntryStateKeySignature),
      );
      setPaintedContentEntryKeys((prev) =>
        pruneEntryKeySet(prev, retainedEntryStateKeySignature),
      );
      setPaintedReadyContentEntryKeys((prev) =>
        pruneEntryKeySet(prev, retainedEntryStateKeySignature),
      );
      setVerifiedReadyContentEntryKeys((prev) =>
        pruneEntryKeySet(prev, retainedEntryStateKeySignature),
      );
      setSettledRevealEntryKeys((prev) =>
        pruneEntryKeySet(prev, retainedEntryStateKeySignature),
      );
      setSettledSkeletonEntryKeys((prev) =>
        pruneEntryKeySet(prev, retainedEntryStateKeySignature),
      );

      entryRowNodesRef.current.forEach((_, entryKey) => {
        if (!currentKeys.has(entryKey))
          entryRowNodesRef.current.delete(entryKey);
      });
      revealQueueRef.current = revealQueueRef.current.filter((entryKey) =>
        currentKeys.has(entryKey),
      );
      queuedRevealEntryKeysRef.current.forEach((entryKey) => {
        if (!currentKeys.has(entryKey))
          queuedRevealEntryKeysRef.current.delete(entryKey);
      });
      if (revealQueueRef.current.length === 0) {
        clearRevealScheduler();
      }
    }, [clearRevealScheduler, retainedEntryStateKeySignature]);

    React.useEffect(() => {
      return () => {
        entryRowNodesRef.current.clear();
        revealQueueRef.current = [];
        queuedRevealEntryKeysRef.current.clear();
        clearRevealScheduler();
      };
    }, [clearRevealScheduler]);

    const revealOrderRef = React.useRef<number>(0);
    const revealOrderByEntryRef = React.useRef<number[]>([]);
    if (revealOrderByEntryRef.current.length !== len) {
      revealOrderByEntryRef.current = Array.from({ length: len }, () => -1);
      revealOrderRef.current = 0;
    }

    const entryLoadingForce = paginationLoading
      ? ({ enabled: true, showContent: true, skeletonOpacity: 1 } as const)
      : loadingOpts?.force;
    const loadingForce = resolveLoadingForceOptions(entryLoadingForce);
    const prefersReducedMotion = usePrefersReducedMotion();
    const entrySkeletonSpecs = React.useMemo(
      () =>
        items.map((entry, entryIndex) =>
          resolveEntrySkeletonSpec(entry, entryIndex),
        ),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [items, entries.loading?.skeleton],
    );
    const localListRef = React.useRef<HTMLDivElement | null>(null);
    const listRef = providedListRef ?? localListRef;

    const virtualWindow = useEntriesVirtualWindow(
      renderedEntries.length,
      listRef,
      virtualizationPlugin?.options as EntriesVirtualizationOptions | undefined,
      entryListLayout,
    );
    const readySubsRef = React.useRef(
      new Set<(nodes: HTMLElement[]) => void>(),
    );
    const readyRef = React.useRef(false);

    const shouldStageEntryReveal =
      loadingActive &&
      !prefersReducedMotion &&
      (revealN.durationMs > 0 || revealN.staggerMs > 0);

    const { nearView, everInView, setEntryRef } = useEntryInView(
      len,
      {
        root: null,
        nearMargin: loadingN.nearMargin,
        viewMargin: loadingN.viewMargin,
        threshold: loadingN.threshold,
        keys: entryStateKeys,
      },
    );

    const resolvedSkeletonEnterMs = prefersReducedMotion
      ? 0
      : loadingN.enterMs;
    const resolvedSkeletonExitMs = prefersReducedMotion ? 0 : loadingN.exitMs;
    const revealUnlockDelayMs = Math.max(
      0,
      resolvedSkeletonExitMs - REVEAL_OVERLAP_MS,
    );
    const [revealUnlocked, setRevealUnlocked] = React.useState(
      () => !(loadingActive && (loadingForce.enabled || len === 0)),
    );

    let anyReveal = false;
    let anyCompareMode = false;
    let renderedRowCount = 0;
    let allRenderedRowsReady = true;
    const currentlyMountedContentEntryKeys: string[] = [];
    const currentlyReadyContentEntryKeys: string[] = [];
    const currentlyRevealableEntryKeys: string[] = [];
    const rowsForRender = renderedEntries.slice(
      virtualWindow.start,
      virtualWindow.end,
    );

    const entryRows = !len
      ? null
      : rowsForRender.map(({ entry, entryIndex }, virtualOffset) => {
          const virtualIndex = virtualWindow.start + virtualOffset;
          const virtualRowIndex =
            virtualWindow.layout === "grid"
              ? Math.floor(virtualIndex / virtualWindow.columnCount)
              : virtualIndex;
          const shouldMeasureVirtualRow =
            virtualWindow.layout !== "grid" ||
            virtualIndex % virtualWindow.columnCount === 0;
          const hasNear = nearView[entryIndex] ?? false;
          const hasEver = everInView[entryIndex] ?? false;
          const entryRenderKey =
            entryRenderKeys[entryIndex] ?? getEntryKey(entry, entryIndex);
          const entryStateKey =
            entryStateKeys[entryIndex] ?? getEntryStateKey(entry, entryIndex);
          const entryWasRevealed = animatedReadyEntryKeys.has(entryStateKey);
          const contentHadPaint =
            !shouldStageEntryReveal ||
            entryWasRevealed ||
            paintedContentEntryKeys.has(entryStateKey);
          const readyContentHadPaint =
            !shouldStageEntryReveal ||
            entryWasRevealed ||
            paintedReadyContentEntryKeys.has(entryStateKey);
          const readyContentVerified =
            !shouldStageEntryReveal ||
            entryWasRevealed ||
            verifiedReadyContentEntryKeys.has(entryStateKey);

          const shouldMountContent = entryWasRevealed || hasNear;
          const shouldRenderMedia = hasNear || entryWasRevealed;
          const mountedContentReady = entryWasRevealed || shouldMountContent;
          const defaultReveal = loadingActive
            ? entryWasRevealed || hasEver
            : shouldMountContent;
          const entryLoadingVisualState = resolveEntryLoadingVisualState({
            loadingActive,
            loadingForced: entryLoadingForce,
            shouldMountContent,
            contentReady: mountedContentReady,
            defaultReveal,
          });
          const reveal = entryLoadingVisualState.revealContent;
          const entryReady =
            reveal &&
            (!shouldStageEntryReveal ||
              entryLoadingVisualState.compareMode ||
              entryWasRevealed);
          const skeletonShimmerSettled =
            entryReady &&
            !entryLoadingVisualState.compareMode &&
            settledSkeletonEntryKeys.has(entryStateKey);
          const revealSettled =
            entryReady &&
            (entryLoadingVisualState.compareMode ||
              !shouldStageEntryReveal ||
              settledRevealEntryKeys.has(entryStateKey));
          renderedRowCount += 1;
          if (!entryReady) {
            allRenderedRowsReady = false;
          }

          if (entryLoadingVisualState.compareMode) {
            anyCompareMode = true;
          }

          if (reveal) {
            anyReveal = true;
          }

          if (shouldMountContent) {
            currentlyMountedContentEntryKeys.push(entryStateKey);
          }

          if (mountedContentReady) {
            currentlyReadyContentEntryKeys.push(entryStateKey);
          }

          if (
            reveal &&
            contentHadPaint &&
            readyContentHadPaint &&
            readyContentVerified &&
            !entryLoadingVisualState.compareMode
          ) {
            currentlyRevealableEntryKeys.push(entryStateKey);
          }

          let contentNode: React.ReactNode = null;

          if (shouldMountContent) {
            const mediaArray = entry.media ?? [];

            const mediaNodes = shouldRenderMedia
              ? mediaArray.map((media, mediaIndex) => {
                  const globalIndex =
                    entryFlatIndex?.[entryIndex]?.[mediaIndex] ?? 0;
                  const mediaIsRevealBlocking =
                    entries.mediaLayout === "slider" ? mediaIndex === 0 : true;
                  const mediaLoading = mediaIsRevealBlocking ? "eager" : "lazy";
                  const mediaFetchPriority = mediaIsRevealBlocking
                    ? "high"
                    : "low";
                  const mediaDecoding = "async";
                  const mediaReadinessProps = {
                    "data-rmg-entry-media-index": String(mediaIndex),
                    "data-rmg-entry-media-priority": mediaIsRevealBlocking
                      ? "true"
                      : undefined,
                  };

                  const rawContent =
                    typeof entries.render?.media === "function"
                      ? entries.render.media({
                          entry,
                          entryIndex,
                          media,
                          mediaIndex,
                          mediaPriority: mediaIsRevealBlocking,
                          mediaLoading,
                          mediaDecoding,
                          mediaFetchPriority,
                        })
                      : nodeFromMedia(media);

                  const reg = (
                    node: HTMLImageElement | HTMLVideoElement | null,
                  ) => {
                    registerExpandableImage?.(globalIndex, node);
                  };

                  const handleClick: React.MouseEventHandler<HTMLElement> = (
                    e,
                  ) => {
                    e.preventDefault();
                    if (!fsEnabled) return;
                    openFullscreenAt(
                      globalIndex,
                      e.currentTarget as HTMLElement,
                    );
                  };

                  if (React.isValidElement(rawContent)) {
                    const original = rawContent as React.ReactElement<any>;
                    const origOnClick = original.props?.onClick;
                    const origRef = (original as any).ref as
                      | React.Ref<HTMLElement>
                      | undefined;
                    const fullscreenImageStyle =
                      fsEnabled && media.kind === "image"
                        ? {
                            ...(original.props?.style ?? {}),
                            cursor: "zoom-in",
                          }
                        : original.props?.style;

                    const mergedOnClick: React.MouseEventHandler<any> = (e) => {
                      if (typeof origOnClick === "function") origOnClick(e);
                      if (e.defaultPrevented) return;
                      handleClick(e);
                    };

                    if (typeof original.type === "string") {
                      const intrinsicMediaProps =
                        original.type.toLowerCase() === "img"
                          ? {
                              loading: original.props?.loading ?? mediaLoading,
                              decoding:
                                original.props?.decoding ?? mediaDecoding,
                              fetchPriority:
                                original.props?.fetchPriority ??
                                mediaFetchPriority,
                            }
                          : null;
                      const mergedRef: React.RefCallback<
                        HTMLImageElement | HTMLVideoElement | null
                      > = (node) => {
                        if (typeof origRef === "function") origRef(node);
                        else if (origRef && typeof origRef === "object")
                          (origRef as any).current = node;
                        reg(node);
                      };

                      return React.cloneElement(original, {
                        key: `${entryIndex}-${mediaIndex}`,
                        ...mediaReadinessProps,
                        ...(intrinsicMediaProps ?? {}),
                        onClick: (e: any) => {
                          if (shouldBlockClick()) {
                            e.preventDefault();
                            e.stopPropagation();
                            return;
                          }
                          mergedOnClick(e);
                        },
                        onPointerDownCapture,
                        onPointerMoveCapture,
                        onPointerUpCapture,
                        ref: mergedRef,
                        style: fullscreenImageStyle,
                      });
                    }

                    if (isTransparentMasonryItemElement(original)) {
                      return React.cloneElement(original, {
                        key: `${entryIndex}-${mediaIndex}`,
                        children: (
                          <span
                            ref={reg as any}
                            style={{ display: "contents" }}
                            {...mediaReadinessProps}
                            onClick={(e: any) => {
                              if (shouldBlockClick()) {
                                e.preventDefault();
                                e.stopPropagation();
                                return;
                              }
                              mergedOnClick(e);
                            }}
                            onPointerDownCapture={onPointerDownCapture as any}
                            onPointerMoveCapture={onPointerMoveCapture as any}
                            onPointerUpCapture={onPointerUpCapture as any}
                          >
                            {original.props.children}
                          </span>
                        ),
                      });
                    }

                    return (
                      <span
                        key={`${entryIndex}-${mediaIndex}`}
                        ref={reg as any}
                        style={{ display: "contents" }}
                        {...mediaReadinessProps}
                        onPointerDownCapture={onPointerDownCapture as any}
                        onPointerMoveCapture={onPointerMoveCapture as any}
                        onPointerUpCapture={onPointerUpCapture as any}
                      >
                        {React.cloneElement(original, {
                          onClick: (e: any) => {
                            if (shouldBlockClick()) {
                              e.preventDefault();
                              e.stopPropagation();
                              return;
                            }
                            mergedOnClick(e);
                          },
                        })}
                      </span>
                    );
                  }

                  return (
                    <div
                      key={`${entryIndex}-${mediaIndex}`}
                      className={styles.entryMediaButton}
                      data-rmg-fullscreen-enabled={
                        fsEnabled ? "true" : undefined
                      }
                      data-rmg-fullscreen-trigger-mode={
                        fsEnabled ? "media" : undefined
                      }
                      {...mediaReadinessProps}
                      onClick={handleClick}
                      ref={reg as any}
                    >
                      {rawContent as any}
                    </div>
                  );
                })
              : [];

            const mediaContainer = renderMediaContainer({
              entryIndex,
              entryInView: entryReady && shouldRenderMedia,
              mediaNodes,
              entrySliderRefs,
            });

            contentNode =
              typeof entries.render?.card === "function"
                ? entries.render.card({
                    entry,
                    entryIndex,
                    media: mediaContainer,
                  })
                : mediaContainer;
          }

          const limit = revealN.staggerLimit;
          const delayIndex = limit > 0 && entryIndex < limit ? entryIndex : 0;

          const skeletonOverride =
            typeof (entries.render as any)?.skeleton === "function"
              ? (entries.render as any).skeleton({ entry, entryIndex })
              : null;

          const spec =
            entrySkeletonSpecs[entryIndex] ??
            resolveEntrySkeletonSpec(entry, entryIndex);
          const skelWrap = loadingN.skeletonWrap;
          const skeletonWrapStyle = splitEntrySkeletonWrapStyle(
            skelWrap?.style,
          );

          if (reveal && revealOrderByEntryRef.current[entryIndex] === -1) {
            revealOrderByEntryRef.current[entryIndex] =
              revealOrderRef.current++;
          }

          const order = revealOrderByEntryRef.current[entryIndex];
          const revealDelayMs =
            shouldStageEntryReveal || order < 0 ? 0 : order * revealN.staggerMs;

          return (
            <div
              key={entryRenderKey}
              ref={(node) => {
                if (node) entryRowNodesRef.current.set(entryStateKey, node);
                else entryRowNodesRef.current.delete(entryStateKey);
                setEntryRef(entryIndex)(node);
                if (shouldMeasureVirtualRow) {
                  virtualWindow.measureRow(virtualRowIndex, node);
                }
              }}
              data-rmg-entry-ready={entryReady ? "1" : "0"}
              data-rmg-entry-compare={
                entryLoadingVisualState.compareMode ? "1" : "0"
              }
              data-rmg-entry-mounted={shouldMountContent ? "1" : "0"}
              data-rmg-entry-reveal-settled={revealSettled ? "1" : undefined}
              className={[styles.entryRow, entries.entryRow?.className]
                .filter(Boolean)
                .join(" ")}
              data-rmg-entry-owner={entryIndex}
              data-rmg-entry-virtual-index={virtualIndex}
              data-rmg-entry-virtual-row={virtualRowIndex}
              style={{
                ["--rmg-entry-min-height" as any]: loadingN.minHeight,
                ["--rmg-entry-reveal-index" as any]: delayIndex,
                ["--rmg-entry-reveal-delay" as any]: `${revealDelayMs}ms`,
                ...entries.entryRow?.style,
              }}
            >
              {loadingActive ? (
                <div
                  className={[styles.entrySkeletonWrap, skelWrap?.className]
                    .filter(Boolean)
                    .join(" ")}
                  style={{
                    ["--rmg-entry-skeleton-opacity" as any]:
                      entryLoadingVisualState.loadingLayerOpacity,
                    ["--rmg-entry-skeleton-enter-duration" as any]:
                      `${resolvedSkeletonEnterMs}ms`,
                    ["--rmg-entry-skeleton-exit-duration" as any]:
                      `${resolvedSkeletonExitMs}ms`,
                    ...(skeletonWrapStyle ?? {}),
                  }}
                  aria-hidden="true"
                  data-rmg-entry-skeleton
                  data-rmg-entry-shimmer={
                    skeletonShimmerSettled ? "off" : undefined
                  }
                  onTransitionEnd={(event) => {
                    if (event.target !== event.currentTarget) return;
                    if (event.propertyName !== "opacity") return;
                    if (!entryReady || entryLoadingVisualState.compareMode)
                      return;

                    setSettledSkeletonEntryKeys((prev) =>
                      addEntryKeysToSet(prev, [entryStateKey]),
                    );
                  }}
                >
                  <div className={styles.entrySkeletonBody}>
                    {skeletonOverride ?? (
                      <EntrySkeletonCard
                        spec={spec}
                        breakpoints={breakpoints}
                      />
                    )}
                  </div>
                </div>
              ) : null}

              {shouldMountContent ? (
                <div
                  key={entryStateKey}
                  className={styles.entryInner}
                  onTransitionEnd={(event) => {
                    if (event.target !== event.currentTarget) return;
                    if (event.propertyName !== "opacity") return;
                    if (!entryReady) return;

                    setSettledRevealEntryKeys((prev) =>
                      addEntryKeysToSet(prev, [entryStateKey]),
                    );
                  }}
                >
                  {contentNode}
                </div>
              ) : null}
            </div>
          );
        });

    const currentlyRevealableEntryKeySignature =
      currentlyRevealableEntryKeys.join("\u0000");
    const currentlyMountedContentEntryKeySignature =
      currentlyMountedContentEntryKeys.join("\u0000");
    const currentlyReadyContentEntryKeySignature =
      currentlyReadyContentEntryKeys.join("\u0000");
    const currentlyReadyPaintedContentEntryKeySignature =
      currentlyReadyContentEntryKeys
        .filter((entryKey) => paintedReadyContentEntryKeys.has(entryKey))
        .join("\u0000");

    React.useEffect(() => {
      setPaintedContentEntryKeys((prev) =>
        pruneEntryKeySet(prev, currentlyMountedContentEntryKeySignature),
      );
    }, [currentlyMountedContentEntryKeySignature]);

    React.useEffect(() => {
      setPaintedReadyContentEntryKeys((prev) =>
        pruneEntryKeySet(prev, currentlyReadyContentEntryKeySignature),
      );
      setVerifiedReadyContentEntryKeys((prev) =>
        pruneEntryKeySet(prev, currentlyReadyContentEntryKeySignature),
      );
    }, [currentlyReadyContentEntryKeySignature]);

    React.useEffect(() => {
      if (!currentlyMountedContentEntryKeySignature) return;

      const entryKeysToMark = splitEntryKeySignature(
        currentlyMountedContentEntryKeySignature,
      );
      let cancelled = false;

      const markContentPainted = () => {
        if (cancelled) return;

        setPaintedContentEntryKeys((prev) =>
          addEntryKeysToSet(prev, entryKeysToMark),
        );
      };

      if (!shouldStageEntryReveal) {
        markContentPainted();
        return;
      }

      if (
        typeof window === "undefined" ||
        typeof window.requestAnimationFrame !== "function"
      ) {
        markContentPainted();
        return;
      }

      let firstFrame = 0;
      let secondFrame = 0;

      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(markContentPainted);
      });

      return () => {
        cancelled = true;
        window.cancelAnimationFrame(firstFrame);
        window.cancelAnimationFrame(secondFrame);
      };
    }, [currentlyMountedContentEntryKeySignature, shouldStageEntryReveal]);

    React.useEffect(() => {
      if (!currentlyReadyContentEntryKeySignature) return;

      const entryKeysToMark = splitEntryKeySignature(
        currentlyReadyContentEntryKeySignature,
      );
      let cancelled = false;

      const markReadyContentPainted = () => {
        if (cancelled) return;

        setPaintedReadyContentEntryKeys((prev) =>
          addEntryKeysToSet(prev, entryKeysToMark),
        );
      };

      if (!shouldStageEntryReveal) {
        markReadyContentPainted();
        return;
      }

      if (
        typeof window === "undefined" ||
        typeof window.requestAnimationFrame !== "function"
      ) {
        markReadyContentPainted();
        return;
      }

      let firstFrame = 0;
      let secondFrame = 0;

      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(markReadyContentPainted);
      });

      return () => {
        cancelled = true;
        window.cancelAnimationFrame(firstFrame);
        window.cancelAnimationFrame(secondFrame);
      };
    }, [currentlyReadyContentEntryKeySignature, shouldStageEntryReveal]);

    React.useEffect(() => {
      const readyPaintedEntryKeys = splitEntryKeySignature(
        currentlyReadyPaintedContentEntryKeySignature,
      );

      setVerifiedReadyContentEntryKeys((prev) =>
        pruneEntryKeySet(prev, currentlyReadyPaintedContentEntryKeySignature),
      );

      if (!currentlyReadyPaintedContentEntryKeySignature) return;

      if (!shouldStageEntryReveal) {
        setVerifiedReadyContentEntryKeys((prev) =>
          addEntryKeysToSet(prev, readyPaintedEntryKeys),
        );
        return;
      }

      let cancelled = false;

      readyPaintedEntryKeys.forEach((entryKey) => {
        const row = entryRowNodesRef.current.get(entryKey);
        if (!row) return;

        void waitForEntryContentReady(row, {
          waitForImages: loadingN.waitForDecode,
          timeoutMs: loadingN.decodeTimeoutMs,
        }).then(() => {
          if (cancelled) return;

          setVerifiedReadyContentEntryKeys((prev) =>
            addEntryKeysToSet(prev, [entryKey]),
          );
        });
      });

      return () => {
        cancelled = true;
      };
    }, [
      currentlyReadyPaintedContentEntryKeySignature,
      loadingN.waitForDecode,
      shouldStageEntryReveal,
    ]);

    React.useEffect(() => {
      const revealableEntryKeys = splitEntryKeySignature(
        currentlyRevealableEntryKeySignature,
      );
      const revealableEntryKeySet = new Set(revealableEntryKeys);

      revealQueueRef.current = revealQueueRef.current.filter((entryKey) =>
        revealableEntryKeySet.has(entryKey),
      );
      queuedRevealEntryKeysRef.current.forEach((entryKey) => {
        if (!revealableEntryKeySet.has(entryKey)) {
          queuedRevealEntryKeysRef.current.delete(entryKey);
        }
      });
      if (revealQueueRef.current.length === 0) {
        clearRevealScheduler();
      }

      if (!currentlyRevealableEntryKeySignature) return;

      const entryKeysToMark = revealableEntryKeys.filter(
        (entryKey) => !animatedReadyEntryKeys.has(entryKey),
      );
      if (!entryKeysToMark.length) return;

      let cancelled = false;

      const markEntriesReady = () => {
        if (cancelled) return;

        setAnimatedReadyEntryKeys((prev) =>
          addEntryKeysToSet(prev, entryKeysToMark),
        );
      };
      const clearRevealQueue = () => {
        revealQueueRef.current = [];
        queuedRevealEntryKeysRef.current.clear();
        clearRevealScheduler();
      };

      if (!shouldStageEntryReveal) {
        clearRevealQueue();
        markEntriesReady();
        return;
      }

      if (revealN.staggerMs > 0) {
        entryKeysToMark.forEach((entryKey) => {
          if (queuedRevealEntryKeysRef.current.has(entryKey)) return;

          revealQueueRef.current.push(entryKey);
          queuedRevealEntryKeysRef.current.add(entryKey);
        });
        scheduleQueuedReveal();
        return;
      }

      if (
        typeof window === "undefined" ||
        typeof window.requestAnimationFrame !== "function"
      ) {
        clearRevealQueue();
        markEntriesReady();
        return;
      }

      clearRevealQueue();

      let firstFrame = 0;
      let secondFrame = 0;

      // Safari can coalesce content mount and reveal into one paint; stage readiness
      // so the hidden entry state is observable before the opacity transition starts.
      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(markEntriesReady);
      });

      return () => {
        cancelled = true;
        window.cancelAnimationFrame(firstFrame);
        window.cancelAnimationFrame(secondFrame);
      };
    }, [
      animatedReadyEntryKeys,
      clearRevealScheduler,
      currentlyRevealableEntryKeySignature,
      revealN.staggerMs,
      scheduleQueuedReveal,
      shouldStageEntryReveal,
    ]);

    const showGlobalLoading =
      loadingActive &&
      (len === 0 || (loadingForce.enabled && !anyCompareMode && !anyReveal));
    const entriesReady =
      !showGlobalLoading &&
      !pluginsLoading &&
      (renderedRowCount === 0 || allRenderedRowsReady);

    const getEntryNodes = React.useCallback(() => {
      const root = listRef.current;
      if (!root) return [];

      return Array.from(root.querySelectorAll("[data-rmg-entry-owner]")).filter(
        (node): node is HTMLElement => node instanceof HTMLElement,
      );
    }, [listRef]);

    const handle = React.useMemo<EntriesHandle>(
      () => ({
        getRootNode: () => listRef.current,
        getEntryNodes,
        isReady: () => readyRef.current,
        onReady: (callback) => {
          readySubsRef.current.add(callback);
          return () => {
            readySubsRef.current.delete(callback);
          };
        },
      }),
      [getEntryNodes, listRef],
    );

    React.useImperativeHandle(forwardedRef, () => handle, [handle]);

    React.useEffect(() => {
      readyRef.current = entriesReady;
      if (!entriesReady) return;

      const nodes = getEntryNodes();
      readySubsRef.current.forEach((fn) => fn(nodes));
    }, [entriesReady, getEntryNodes]);

    React.useEffect(() => {
      if (showGlobalLoading) {
        setRevealUnlocked(false);
        return;
      }

      if (!loadingActive || prefersReducedMotion || revealUnlockDelayMs === 0) {
        setRevealUnlocked(loadingActive ? anyReveal : true);
        return;
      }

      const timeoutId = window.setTimeout(() => {
        setRevealUnlocked(anyReveal);
      }, revealUnlockDelayMs);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }, [
      anyReveal,
      revealUnlockDelayMs,
      loadingActive,
      prefersReducedMotion,
      showGlobalLoading,
    ]);

    const containerProps: React.HTMLAttributes<HTMLDivElement> &
      React.RefAttributes<HTMLDivElement> &
      Record<`data-${string}`, string | undefined> = {
      ref: listRef,
      className: [styles.entryList, entries.entryList?.className]
        .filter(Boolean)
        .join(" "),
      style: {
        ["--rmg-entry-reveal-stagger" as any]: `${revealN.staggerMs}ms`,
        ["--rmg-entry-reveal-duration" as any]: `${revealN.durationMs}ms`,
        ["--rmg-entry-reveal-easing" as any]: revealN.easing,
        ...entries.entryList?.style,
      },
      "aria-busy": showGlobalLoading || pluginsLoading ? true : undefined,
      "data-rmg-entries-layout": entryListLayout,
    };
    const virtualSpacerStyle = (height: number): React.CSSProperties => ({
      height,
      ...(virtualWindow.layout === "grid" ? { gridColumn: "1 / -1" } : {}),
    });

    const inner = (
      <div {...containerProps}>
        {virtualWindow.topSpacer > 0 ? (
          <div
            className={styles.entryVirtualSpacer}
            style={virtualSpacerStyle(virtualWindow.topSpacer)}
            aria-hidden="true"
            data-rmg-entry-virtual-spacer="top"
          />
        ) : null}
        {entryRows}
        {virtualWindow.bottomSpacer > 0 ? (
          <div
            className={styles.entryVirtualSpacer}
            style={virtualSpacerStyle(virtualWindow.bottomSpacer)}
            aria-hidden="true"
            data-rmg-entry-virtual-spacer="bottom"
          />
        ) : null}
        {infiniteScrollPlugin ? (
          <EntriesInfiniteSentinel
            options={
              infiniteScrollPlugin.options as EntriesInfiniteScrollOptions
            }
            listRef={listRef}
          />
        ) : null}
      </div>
    );

    return revealN.renderReveal
      ? revealN.renderReveal(
          { active: !showGlobalLoading && revealUnlocked, containerProps },
          inner,
        )
      : inner;
  },
);
