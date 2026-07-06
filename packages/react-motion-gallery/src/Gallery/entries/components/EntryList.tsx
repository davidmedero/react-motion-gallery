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
import { useReliableInfiniteTrigger } from "../../shared/infiniteScrollTrigger";

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

function waitForImageElementReady(image: HTMLImageElement) {
  if (image.complete) return Promise.resolve();

  const decode = (image as any).decode;
  if (typeof decode === "function") {
    return decode.call(image).catch(() => undefined);
  }

  return Promise.resolve();
}

function waitForDocumentFontsReady() {
  if (typeof document === "undefined") return Promise.resolve();

  const fonts = (document as any).fonts;
  if (!fonts || fonts.status === "loaded" || !fonts.ready) {
    return Promise.resolve();
  }

  return Promise.resolve(fonts.ready).catch(() => undefined);
}

async function waitForEntryContentReady(
  row: HTMLElement,
  options?: { waitForImages?: boolean },
) {
  const images =
    options?.waitForImages === false ? [] : getBlockingEntryImages(row);

  await waitForDocumentFontsReady();

  for (const image of images) {
    await waitForImageElementReady(image);
  }
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
    mediaReadyKey?: React.Key;
    mediaReadyTimeoutMs?: number;
    onMediaReadyChange?: (ready: boolean) => void;
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

function resolveVirtualScrollRoot(
  scrollRoot: EntriesVirtualizationOptions["scrollRoot"] | undefined,
) {
  if (!scrollRoot) return null;
  if (typeof scrollRoot === "function") return scrollRoot();
  if ("current" in scrollRoot) return scrollRoot.current;
  return scrollRoot;
}

function getVirtualViewportRange(
  listRoot: HTMLElement,
  scrollRoot: Element | null,
) {
  const listRect = listRoot.getBoundingClientRect();

  if (!scrollRoot) {
    return {
      viewportTop: -listRect.top,
      viewportBottom: -listRect.top + window.innerHeight,
    };
  }

  const rootRect = scrollRoot.getBoundingClientRect();

  return {
    viewportTop: rootRect.top - listRect.top,
    viewportBottom: rootRect.bottom - listRect.top,
  };
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

    const { viewportTop, viewportBottom } = getVirtualViewportRange(
      root,
      resolveVirtualScrollRoot(options?.scrollRoot),
    );
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
  }, [
    count,
    enabled,
    gap,
    getSize,
    layout,
    listRef,
    options?.scrollRoot,
    overscan,
  ]);

  React.useEffect(() => {
    recomputeRange();
  }, [count, enabled, estimateSize, gap, layout, overscan, recomputeRange]);

  React.useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const scrollRoot = resolveVirtualScrollRoot(options?.scrollRoot);
    const scrollTarget = scrollRoot ?? window;

    scrollTarget.addEventListener("scroll", recomputeRange, { passive: true });
    if (scrollRoot) {
      window.addEventListener("scroll", recomputeRange, { passive: true });
    }
    window.addEventListener("resize", recomputeRange);
    return () => {
      scrollTarget.removeEventListener("scroll", recomputeRange);
      if (scrollRoot) {
        window.removeEventListener("scroll", recomputeRange);
      }
      window.removeEventListener("resize", recomputeRange);
    };
  }, [enabled, options?.scrollRoot, recomputeRange]);

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
  resetKey,
}: {
  options: EntriesInfiniteScrollOptions;
  resetKey?: React.Key;
}) {
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  const enabled = options.enabled !== false;
  const hasMore = options.hasMore ?? true;
  const loading = !!options.loading;

  useReliableInfiniteTrigger(sentinelRef, {
    enabled,
    hasMore,
    loading,
    onLoadMore: options.onLoadMore,
    resetKey,
    rootMargin: options.rootMargin ?? "600px 0px",
    scrollRoot: options.scrollRoot,
    threshold: options.threshold ?? 0,
  });

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

function setEntryKeyInSet(prev: Set<string>, entryKey: string, value: boolean) {
  const hasKey = prev.has(entryKey);
  if (value === hasKey) return prev;

  const next = new Set(prev);
  if (value) next.add(entryKey);
  else next.delete(entryKey);
  return next;
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
    const [mediaReadyEntryKeys, setMediaReadyEntryKeys] =
      React.useState<Set<string>>(() => new Set());
    const [mediaReportedEntryKeys, setMediaReportedEntryKeys] =
      React.useState<Set<string>>(() => new Set());
    const [settledRevealEntryKeys, setSettledRevealEntryKeys] = React.useState<
      Set<string>
    >(() => new Set());
    const [settledSkeletonEntryKeys, setSettledSkeletonEntryKeys] =
      React.useState<Set<string>>(() => new Set());
    const entryRowNodesRef = React.useRef(new Map<string, HTMLElement>());
    const fallbackMediaVerificationEntryKeysRef = React.useRef(new Set<string>());
    const mountedPaintedContentEntryKeysRef = React.useRef(new Set<string>());
    const mediaReportedEntryKeysRef = React.useRef(new Set<string>());
    const mediaReadyCallbacksRef = React.useRef(
      new Map<string, (ready: boolean) => void>(),
    );
    const mediaReadyMountedRef = React.useRef(true);

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
      setMediaReadyEntryKeys((prev) =>
        pruneEntryKeySet(prev, retainedEntryStateKeySignature),
      );
      setMediaReportedEntryKeys((prev) =>
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
      mediaReadyCallbacksRef.current.forEach((_, entryKey) => {
        if (!currentKeys.has(entryKey))
          mediaReadyCallbacksRef.current.delete(entryKey);
      });
      fallbackMediaVerificationEntryKeysRef.current.forEach((entryKey) => {
        if (!currentKeys.has(entryKey)) {
          fallbackMediaVerificationEntryKeysRef.current.delete(entryKey);
        }
      });
      mountedPaintedContentEntryKeysRef.current.forEach((entryKey) => {
        if (!currentKeys.has(entryKey)) {
          mountedPaintedContentEntryKeysRef.current.delete(entryKey);
        }
      });
    }, [retainedEntryStateKeySignature]);

    React.useEffect(() => {
      mediaReadyMountedRef.current = true;

      return () => {
        mediaReadyMountedRef.current = false;
        entryRowNodesRef.current.clear();
        mediaReadyCallbacksRef.current.clear();
        fallbackMediaVerificationEntryKeysRef.current.clear();
        mountedPaintedContentEntryKeysRef.current.clear();
        mediaReportedEntryKeysRef.current.clear();
      };
    }, []);

    React.useEffect(() => {
      mediaReportedEntryKeysRef.current = mediaReportedEntryKeys;
    }, [mediaReportedEntryKeys]);

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
      revealN.durationMs > 0;

    const { nearView, inView, everInView, setEntryRef } = useEntryInView(len, {
      root: null,
      nearMargin: loadingN.nearMargin,
      viewMargin: loadingN.viewMargin,
      threshold: loadingN.threshold,
      keys: entryStateKeys,
    });

    const setEntryMediaReady = React.useCallback(
      (entryKey: string, ready: boolean) => {
        setMediaReportedEntryKeys((prev) =>
          setEntryKeyInSet(prev, entryKey, true),
        );
        setMediaReadyEntryKeys((prev) => setEntryKeyInSet(prev, entryKey, ready));
      },
      [],
    );
    const getEntryMediaReadyCallback = React.useCallback(
      (entryKey: string) => {
        const existing = mediaReadyCallbacksRef.current.get(entryKey);
        if (existing) return existing;

        const callback = (ready: boolean) => {
          setEntryMediaReady(entryKey, ready);
        };
        mediaReadyCallbacksRef.current.set(entryKey, callback);
        return callback;
      },
      [setEntryMediaReady],
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
    const currentlyFallbackMediaEntryKeys: string[] = [];
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
          const isNear = nearView[entryIndex] ?? false;
          const isCurrentInView = inView[entryIndex] ?? false;
          const hasEver = everInView[entryIndex] ?? false;
          const mediaArray = entry.media ?? [];
          const entryHasMedia = mediaArray.length > 0;
          const mediaReadyKey = mediaArray
            .map(
              (media, mediaIndex) =>
                `${mediaIndex}:${(media as any)?.kind ?? ""}:${(media as any)?.src ?? ""}`,
            )
            .join("\u0000");
          const entryRenderKey =
            entryRenderKeys[entryIndex] ?? getEntryKey(entry, entryIndex);
          const entryStateKey =
            entryStateKeys[entryIndex] ?? getEntryStateKey(entry, entryIndex);
          const entryWasRevealed = animatedReadyEntryKeys.has(entryStateKey);
          const mediaReady =
            !entryHasMedia ||
            entryWasRevealed ||
            !loadingN.waitForMedia ||
            mediaReadyEntryKeys.has(entryStateKey);
          const mediaReadinessReported =
            !entryHasMedia ||
            mediaReportedEntryKeys.has(entryStateKey);
          const contentHadPaint =
            !shouldStageEntryReveal ||
            entryWasRevealed ||
            paintedContentEntryKeys.has(entryStateKey);
          const readyContentHadPaint =
            !shouldStageEntryReveal ||
            entryWasRevealed ||
            paintedReadyContentEntryKeys.has(entryStateKey);

          const shouldMountContent = entryWasRevealed || isNear || hasEver;
          const mountedContentReady =
            entryWasRevealed ||
            (shouldMountContent && mediaReady);
          const canRevealEntry = entryWasRevealed || isCurrentInView;
          const defaultReveal = loadingActive
            ? entryWasRevealed ||
              (canRevealEntry && mediaReady)
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
            !entryLoadingVisualState.compareMode
          ) {
            currentlyRevealableEntryKeys.push(entryStateKey);
          }

          if (
            shouldMountContent &&
            loadingN.waitForMedia &&
            entryHasMedia &&
            !entryWasRevealed &&
            !mediaReady &&
            !mediaReadinessReported
          ) {
            currentlyFallbackMediaEntryKeys.push(entryStateKey);
          }

          let contentNode: React.ReactNode = null;

          if (shouldMountContent) {
            const mediaNodes = mediaArray.map((media, mediaIndex) => {
              const globalIndex =
                entryFlatIndex?.[entryIndex]?.[mediaIndex] ?? 0;
              const mediaIsRevealBlocking =
                entries.mediaLayout === "slider" ? mediaIndex === 0 : true;
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
                    })
                  : nodeFromMedia(media);

              const reg = (
                node: HTMLImageElement | HTMLVideoElement | null,
              ) => {
                registerExpandableImage?.(globalIndex, node);
              };

              const handleClick: React.MouseEventHandler<HTMLElement> = (e) => {
                e.preventDefault();
                if (!fsEnabled) return;
                openFullscreenAt(globalIndex, e.currentTarget as HTMLElement);
              };

              if (React.isValidElement(rawContent)) {
                const original = rawContent as React.ReactElement<any>;
                const origOnClick = original.props?.onClick;
                const origRef = (original as any).ref as
                  | React.Ref<HTMLElement>
                  | undefined;
                const fullscreenImageStyle =
                  fsEnabled && media.kind === "image"
                    ? { ...(original.props?.style ?? {}), cursor: "zoom-in" }
                    : original.props?.style;

                const mergedOnClick: React.MouseEventHandler<any> = (e) => {
                  if (typeof origOnClick === "function") origOnClick(e);
                  if (e.defaultPrevented) return;
                  handleClick(e);
                };

                if (typeof original.type === "string") {
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
                  data-rmg-fullscreen-enabled={fsEnabled ? "true" : undefined}
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
            });

            const mediaContainer = renderMediaContainer({
              entryIndex,
              entryInView: canRevealEntry,
              mediaNodes,
              entrySliderRefs,
              mediaReadyKey,
              mediaReadyTimeoutMs: loadingN.decodeTimeoutMs,
              onMediaReadyChange: getEntryMediaReadyCallback(entryStateKey),
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
    const currentlyMountedPaintedContentEntryKeySignature =
      currentlyMountedContentEntryKeys
        .filter((entryKey) => paintedContentEntryKeys.has(entryKey))
        .join("\u0000");
    const currentlyFallbackMediaEntryKeySignature = currentlyFallbackMediaEntryKeys
      .filter((entryKey) => paintedContentEntryKeys.has(entryKey))
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
      mountedPaintedContentEntryKeysRef.current = new Set(
        splitEntryKeySignature(currentlyMountedPaintedContentEntryKeySignature),
      );
    }, [currentlyMountedPaintedContentEntryKeySignature]);

    React.useEffect(() => {
      if (!currentlyFallbackMediaEntryKeySignature) return;

      const fallbackEntryKeys = splitEntryKeySignature(
        currentlyFallbackMediaEntryKeySignature,
      );

      fallbackEntryKeys.forEach((entryKey) => {
        if (mediaReadyEntryKeys.has(entryKey)) return;
        if (mediaReportedEntryKeysRef.current.has(entryKey)) return;
        if (fallbackMediaVerificationEntryKeysRef.current.has(entryKey)) return;

        const row = entryRowNodesRef.current.get(entryKey);
        if (!row) return;

        fallbackMediaVerificationEntryKeysRef.current.add(entryKey);

        void (async () => {
          await waitForEntryContentReady(row, {
            waitForImages: true,
          });

          if (!mediaReadyMountedRef.current) return;
          if (!mountedPaintedContentEntryKeysRef.current.has(entryKey)) return;
          if (mediaReportedEntryKeysRef.current.has(entryKey)) return;

          setMediaReadyEntryKeys((prev) =>
            setEntryKeyInSet(prev, entryKey, true),
          );
        })().finally(() => {
          fallbackMediaVerificationEntryKeysRef.current.delete(entryKey);
        });
      });
    }, [
      currentlyFallbackMediaEntryKeySignature,
      mediaReadyEntryKeys,
      mediaReportedEntryKeys,
    ]);

    React.useEffect(() => {
      const revealableEntryKeys = splitEntryKeySignature(
        currentlyRevealableEntryKeySignature,
      );

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

      if (!shouldStageEntryReveal) {
        markEntriesReady();
        return;
      }

      if (
        typeof window === "undefined" ||
        typeof window.requestAnimationFrame !== "function"
      ) {
        markEntriesReady();
        return;
      }

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
      currentlyRevealableEntryKeySignature,
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
            resetKey={renderedEntries.length}
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
