/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import type { BreakpointMap } from "../shared/responsive";
import { BREAKPOINT_MAP } from "../shared/responsive";
import type { MediaItem } from "../shared/types/media";
import { toMediaItems } from "../shared/types/media";
import type { SliderHandle } from "../slider/types";
import { MediaEntryLink } from "../entries";

export type FullscreenOpenRequest =
  | {
      source: "slider";
      // index in slider space (your finalIndex)
      index: number;
      // clicked image element if any (for intro)
      img: HTMLImageElement | null;
      // original DOM event (optional)
      event?: Event;
    }
  | {
      source: "grid" | "masonry" | "entries";
      index: number;
      img: HTMLImageElement | null;
      event?: Event;
    };

function createSub<T>() {
  const subs = new Set<(v: T) => void>();
  return {
    emit(v: T) { subs.forEach(fn => fn(v)); },
    subscribe(fn: (v: T) => void) {
      subs.add(fn);
      return () => {
        subs.delete(fn);
      };
    }
  };
}

export type CoreLayout = "slider" | "grid" | "masonry" | "entries";

type Cell = { id: string; node: React.ReactNode };

export type FullscreenSource = FullscreenOpenRequest["source"];

export type FullscreenEntryContext = {
  entryMapRef?: React.RefObject<MediaEntryLink[] | null>
  entryMediaLayout?: "slider" | "grid" | "masonry";
  entriesObject?: any;
  entrySliderRefs?: React.RefObject<Array<SliderHandle | null>>;
  expandableImgRefs?: React.RefObject<Array<HTMLImageElement | null>>;
};

export type FullscreenSourceAdapter = {
  /** for layouts that have a “real slider” behind a given index */
  getOwnerSliderHandle?: (index: number) => SliderHandle | null;

  /** for entries: ensure the correct media slider is ready before opening */
  syncBeforeOpen?: (index: number) => void;

  /** used by intro logic to find the “cell wrapper” */
  closestSelector?: string;

  /** extra context used by fullscreen runtime (entries only) */
  getEntryContext?: () => FullscreenEntryContext;
};

export type GalleryCore = {
  // config
  layout: CoreLayout;
  effectiveBreakpoints: BreakpointMap;

  // nodes (optional helper if you want core to “own” node arrays)
  cellsState: Cell[];
  cellsRef: React.RefObject<Cell[]>;

  // normalized media (optional: used by fullscreen or any consumer)
  normalizedItems: MediaItem[];
  setNormalizedItems: React.Dispatch<React.SetStateAction<MediaItem[]>>;

  // base slider ref (used by fullscreen bridge or external add-ons)
  sliderApiRef: React.RefObject<SliderHandle | null>;

  // basic API for dynamic node operations (optional but useful)
  append: (nodes: React.ReactNode | React.ReactNode[]) => number;
  prepend: (nodes: React.ReactNode | React.ReactNode[]) => number;
  insert: (index: number, nodes: React.ReactNode | React.ReactNode[]) => number;
  remove: (index: number) => number;
  replace: (index: number, node: React.ReactNode) => void;
  setItems: (nodes: React.ReactNode[]) => number;

  requestFullscreenOpen: (req: FullscreenOpenRequest) => void;
  fsOpenSub: {
    emit(v: FullscreenOpenRequest): void;
    subscribe(fn: (v: FullscreenOpenRequest) => void): () => void;
  };

  isFullscreenOpen: boolean;
  isFullscreenOpenRef: React.RefObject<boolean>;
  setFullscreenOpen: (open: boolean) => void;
  registerFullscreenAdapter: (source: FullscreenSource, a: FullscreenSourceAdapter) => void;
  getFullscreenAdapter: (source: FullscreenSource) => FullscreenSourceAdapter | null;
  expandableImgRefs: React.RefObject<Array<HTMLImageElement | null>>;
  registerExpandableImg: (index: number, node: HTMLElement | null) => void;
};

export type GalleryCoreProps = {
  children?: React.ReactNode;

  /** tells add-ons which base layout is mounted */
  layout: CoreLayout;

  /** optional breakpoint override */
  breakpoints?: BreakpointMap;

  /**
   * optional: provide fullscreen/media items centrally.
   * - If MediaItem[], use as-is
   * - If string[], will be converted via toMediaItems()
   */
  fullscreenItems?: MediaItem[] | string[];

  /**
   * optional: if user passes children nodes (e.g. SliderLayout children),
   * core can manage them as cells.
   *
   * NOTE: This is intentionally "opt-in" to keep core generic.
   */
  nodes?: React.ReactNode | React.ReactNode[];
};

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function asArray<T>(x: T | T[]) {
  return Array.isArray(x) ? x : [x];
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

function normalizeItemsInput(v: MediaItem[] | string[] | undefined): MediaItem[] {
  if (!v || !v.length) return [];
  return isStringArray(v) ? toMediaItems(v) : v;
}

function buildCellsFromNodes(
  nodes: React.ReactNode | React.ReactNode[] | undefined,
  newId: () => string
): Cell[] {
  if (!nodes) return [];
  const arr = React.Children.toArray(nodes);
  return arr.map((n) => ({ id: newId(), node: n }));
}

function useGalleryCoreInternal(props: GalleryCoreProps): GalleryCore {
  const { layout, breakpoints, fullscreenItems, nodes } = props;

  const expandableImgRefs = React.useRef<Array<HTMLImageElement | null>>([]);

  const registerExpandableImg = React.useCallback((index: number, node: HTMLElement | null) => {
    if (!node) {
      expandableImgRefs.current[index] = null;
      return;
    }
    const img =
      node.tagName === "IMG"
        ? (node as HTMLImageElement)
        : (node.querySelector("img") as HTMLImageElement | null);

    expandableImgRefs.current[index] = img;
  }, []);

  const effectiveBreakpoints = React.useMemo(
    () => ({ ...BREAKPOINT_MAP, ...(breakpoints || {}) }),
    [breakpoints]
  );

  const sliderApiRef = React.useRef<SliderHandle | null>(null);

  const fsAdaptersRef = React.useRef(new Map<FullscreenSource, FullscreenSourceAdapter>());

  const registerFullscreenAdapter = React.useCallback(
    (source: FullscreenSource, a: FullscreenSourceAdapter) => {
      fsAdaptersRef.current.set(source, a);
    },
    []
  );

  const getFullscreenAdapter = React.useCallback(
    (source: FullscreenSource) => fsAdaptersRef.current.get(source) ?? null,
    []
  );

  const idSeqRef = React.useRef(0);
  const newId = React.useCallback(() => `rmg-${++idSeqRef.current}`, []);

  const [isFullscreenOpen, _setIsFullscreenOpen] = React.useState(false);
  const isFullscreenOpenRef = React.useRef(false);

  const setFullscreenOpen = React.useCallback((open: boolean) => {
    isFullscreenOpenRef.current = open;
    _setIsFullscreenOpen(open);
  }, []);

  // nodes -> cells (one-time init by design)
  const initialCells = React.useMemo<Cell[]>(
    () => buildCellsFromNodes(nodes, newId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const cellsRef = React.useRef<Cell[]>(initialCells);
  const [cellsState, setCellsState] = React.useState<Cell[]>(initialCells);

  const [normalizedItems, setNormalizedItems] = React.useState<MediaItem[]>(() => {
    return normalizeItemsInput(fullscreenItems);
  });

  // keep normalizedItems in sync if fullscreenItems changes
  React.useEffect(() => {
    setNormalizedItems(normalizeItemsInput(fullscreenItems));
  }, [fullscreenItems]);

  function commit(next: Cell[]) {
    cellsRef.current = next;
    setCellsState(next);
  }

  const append = React.useCallback(
    (nodes: React.ReactNode | React.ReactNode[]) => {
      const add = asArray(nodes).map((n) => ({ id: newId(), node: n }));
      const next = [...cellsRef.current, ...add];
      commit(next);
      return next.length;
    },
    [newId]
  );

  const prepend = React.useCallback(
    (nodes: React.ReactNode | React.ReactNode[]) => {
      const add = asArray(nodes).map((n) => ({ id: newId(), node: n }));
      const next = [...add, ...cellsRef.current];
      commit(next);
      return next.length;
    },
    [newId]
  );

  const insert = React.useCallback(
    (index: number, nodes: React.ReactNode | React.ReactNode[]) => {
      const arr = cellsRef.current.slice();
      const add = asArray(nodes).map((n) => ({ id: newId(), node: n }));
      const to = clamp(index | 0, 0, arr.length);
      const next = [...arr.slice(0, to), ...add, ...arr.slice(to)];
      commit(next);
      return next.length;
    },
    [newId]
  );

  const remove = React.useCallback((index: number) => {
    const arr = cellsRef.current;
    if (!arr.length) return 0;
    const i = clamp(index | 0, 0, arr.length - 1);
    const next = arr.slice(0, i).concat(arr.slice(i + 1));
    commit(next);
    return next.length;
  }, []);

  const replace = React.useCallback((index: number, node: React.ReactNode) => {
    const arr = cellsRef.current;
    if (!arr.length) return;
    const i = clamp(index | 0, 0, arr.length - 1);
    const keepId = arr[i].id;
    const next = arr.slice();
    next[i] = { id: keepId, node };
    commit(next);
  }, []);

  const setItems = React.useCallback(
    (nodes: React.ReactNode[]) => {
      const next = (nodes ?? []).map((n) => ({ id: newId(), node: n }));
      commit(next);
      return next.length;
    },
    [newId]
  );

  const fsOpenSub = React.useMemo(() => createSub<FullscreenOpenRequest>(), []);

  const requestFullscreenOpen = React.useCallback((req: FullscreenOpenRequest) => {
    fsOpenSub.emit(req);
  }, [fsOpenSub]);

  return {
    layout,
    effectiveBreakpoints,

    cellsState,
    cellsRef,

    normalizedItems,
    setNormalizedItems,

    sliderApiRef,

    append,
    prepend,
    insert,
    remove,
    replace,
    setItems,

    requestFullscreenOpen,
    fsOpenSub,

    isFullscreenOpen,
    isFullscreenOpenRef,
    setFullscreenOpen,
    registerFullscreenAdapter,
    getFullscreenAdapter,

    expandableImgRefs,
    registerExpandableImg,
  };
}

/** Context + hooks */
const GalleryCoreContext = React.createContext<GalleryCore | null>(null);

/** Provider (internal name kept for clarity) */
export function GalleryCoreProvider(props: GalleryCoreProps) {
  const core = useGalleryCoreInternal(props);
  return (
    <GalleryCoreContext.Provider value={core}>
      {props.children}
    </GalleryCoreContext.Provider>
  );
}

/** ✅ Option A: public component alias */
export const GalleryCore = GalleryCoreProvider;

/** Strict: used by add-ons (Fullscreen) */
export function useGalleryCore(): GalleryCore {
  const v = React.useContext(GalleryCoreContext);
  if (!v) throw new Error("useGalleryCore() must be used inside <GalleryCore />");
  return v;
}

/** Optional: used by base layouts (Slider/Grid/Masonry) */
export function useOptionalGalleryCore(): GalleryCore | null {
  return React.useContext(GalleryCoreContext);
}
