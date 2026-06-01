"use client";

import * as React from "react";
import {
  PaginationRippleStyles,
  renderPaginationRipples,
  usePaginationRipples,
  type PaginationRippleOptions,
  type PaginationRippleProp,
} from "./paginationRipple";

export type DataMode = "client" | "server";

export type DataPaginationOptions = {
  enabled?: boolean;
  mode?: DataMode;
  pageIndex: number;
  pageSize: number;
  total?: number;
  loading?: boolean;
};

export type DataItemsPerPageOption =
  | number
  | {
      value: number;
      label: React.ReactNode;
    };

export type DataPaginationSessionStorageOptions =
  | boolean
  | {
      enabled?: boolean;
      key?: string;
    };

export type DataLoadMoreOptions = {
  enabled?: boolean;
  mode?: DataMode;
  visibleCount: number;
  total?: number;
  loading?: boolean;
};

export type DataInfiniteScrollOptions = {
  enabled?: boolean;
  hasMore?: boolean;
  loading?: boolean;
  rootMargin?: string;
  threshold?: number;
  onLoadMore?: () => void;
  sentinel?: React.ReactNode;
};

export type DataVirtualizationOptions = {
  enabled?: boolean;
  estimateSize?: number;
  gap?: number;
  overscan?: number;
};

export type DataWindowPluginLike = {
  readonly kind: string;
  readonly options?: unknown;
};

export type IndexedDataItem<T> = {
  item: T;
  index: number;
};

export type UseDataPaginationOptions = {
  total?: number;
  pageSize?: number;
  initialPageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
  initialPageIndex?: number;
  mode?: DataPaginationOptions["mode"];
  loading?: boolean;
  enabled?: boolean;
  urlSync?: DataPaginationUrlSyncOptions;
  sessionStorage?: DataPaginationSessionStorageOptions;
};

export type DataPaginationUrlSyncOptions =
  | boolean
  | {
      enabled?: boolean;
      param?: string;
      history?: "push" | "replace";
      omitFirstPage?: boolean;
      basePath?: string;
      preserveSearch?: boolean;
    };

export type DataPaginationController<Plugin> = {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  offset: number;
  getPageHref?: (pageIndex: number) => string | undefined;
  canPrevPage: boolean;
  canNextPage: boolean;
  setPageIndex: React.Dispatch<React.SetStateAction<number>>;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
  nextPage: () => void;
  prevPage: () => void;
  plugin: Plugin;
};

export type UseDataLoadMoreOptions = {
  initialVisibleCount?: number;
  pageSize: number;
  total?: number;
  mode?: DataLoadMoreOptions["mode"];
  loading?: boolean;
  enabled?: boolean;
};

export type DataLoadMoreController<Plugin> = {
  visibleCount: number;
  pageSize: number;
  canLoadMore: boolean;
  setVisibleCount: React.Dispatch<React.SetStateAction<number>>;
  loadMore: () => void;
  reset: () => void;
  plugin: Plugin;
};

export type DataPageRangeItem =
  | {
      type: "page";
      key: string;
      pageIndex: number;
      selected: boolean;
    }
  | {
      type: "break";
      key: string;
    };

export type DataPageControlItem =
  | {
      type: "previous" | "next";
      key: string;
      pageIndex: number;
      disabled: boolean;
      label: React.ReactNode;
    }
  | {
      type: "page";
      key: string;
      pageIndex: number;
      selected: boolean;
      disabled: boolean;
      label: React.ReactNode;
    }
  | {
      type: "break";
      key: string;
      disabled: true;
      label: React.ReactNode;
    };

export type DataPageRangeOptions = {
  pageIndex: number;
  pageCount: number;
  pageRangeDisplayed?: number;
  marginPagesDisplayed?: number;
};

export type DataPageItemsOptions = DataPageRangeOptions & {
  disabled?: boolean;
  previousLabel?: React.ReactNode;
  nextLabel?: React.ReactNode;
  breakLabel?: React.ReactNode;
  getPageLabel?: (pageIndex: number) => React.ReactNode;
};

export type DataPaginationRippleOptions = PaginationRippleOptions;
export type DataPaginationRippleProp = PaginationRippleProp;

export type DataPaginationControlsProps = DataPageItemsOptions & {
  onPageChange: (pageIndex: number) => void;
  pageSize?: number;
  itemsPerPageOptions?: readonly DataItemsPerPageOption[];
  itemsPerPageLabel?: React.ReactNode;
  itemsPerPageSelectLabel?: string;
  itemsPerPageClassName?: string;
  itemsPerPageLabelClassName?: string;
  itemsPerPageSelectClassName?: string;
  onItemsPerPageChange?: (pageSize: number) => void;
  className?: string;
  pageItemsClassName?: string;
  itemClassName?: string;
  pageClassName?: string;
  controlClassName?: string;
  breakClassName?: string;
  selectedClassName?: string;
  ariaLabel?: string;
  disableSelected?: boolean;
  ripple?: DataPaginationRippleProp;
  getPageHref?: (
    pageIndex: number,
    item: DataPageControlItem,
  ) => string | undefined;
  renderItem?: (
    item: DataPageControlItem,
    defaultNode: React.ReactElement,
  ) => React.ReactNode;
};

export type DataVirtualWindowState = {
  start: number;
  end: number;
  topSpacer: number;
  bottomSpacer: number;
  measureItem: (index: number, node: HTMLElement | null) => void;
};

export type AbsoluteVirtualItem = {
  top: number;
  height: number;
};

export function normalizeDataPaginationOptions(
  options: DataPaginationOptions,
): DataPaginationOptions {
  return {
    ...options,
    enabled: options.enabled ?? true,
    mode: options.mode ?? "client",
    pageIndex: Math.max(0, options.pageIndex | 0),
    pageSize: Math.max(1, options.pageSize | 0),
  };
}

export function normalizeDataLoadMoreOptions(
  options: DataLoadMoreOptions,
): DataLoadMoreOptions {
  return {
    ...options,
    enabled: options.enabled ?? true,
    mode: options.mode ?? "client",
    visibleCount: Math.max(0, options.visibleCount | 0),
  };
}

export function normalizeDataInfiniteScrollOptions(
  options: DataInfiniteScrollOptions = {},
): DataInfiniteScrollOptions {
  return {
    ...options,
    enabled: options.enabled ?? true,
    hasMore: options.hasMore ?? true,
    rootMargin: options.rootMargin ?? "600px 0px",
    threshold: options.threshold ?? 0,
  };
}

export function normalizeDataVirtualizationOptions(
  options: DataVirtualizationOptions = {},
): Required<DataVirtualizationOptions> {
  return {
    enabled: options.enabled ?? true,
    estimateSize: Math.max(1, options.estimateSize ?? 420),
    gap: Math.max(0, options.gap ?? 24),
    overscan: Math.max(0, options.overscan ?? 3),
  };
}

export function resolveDataWindow<T>(
  items: T[],
  plugins: readonly DataWindowPluginLike[] | undefined,
): Array<IndexedDataItem<T>> {
  const indexedItems = items.map((item, index) => ({ item, index }));
  const windowPlugins = (plugins ?? []).filter(
    (plugin) => plugin.kind === "pagination" || plugin.kind === "load-more",
  );
  const plugin = windowPlugins[0];
  if (!plugin) return indexedItems;

  if (plugin.kind === "pagination") {
    const options = plugin.options as DataPaginationOptions | undefined;
    if (!options || options.enabled === false || options.mode === "server") {
      return indexedItems;
    }

    const pageSize = Math.max(1, options.pageSize | 0);
    const pageIndex = Math.max(0, options.pageIndex | 0);
    const start = pageIndex * pageSize;
    return indexedItems.slice(start, start + pageSize);
  }

  const options = plugin.options as DataLoadMoreOptions | undefined;
  if (!options || options.enabled === false || options.mode === "server") {
    return indexedItems;
  }

  return indexedItems.slice(0, Math.max(0, options.visibleCount | 0));
}

export function getDataPluginOptions<T>(
  plugins: readonly DataWindowPluginLike[] | undefined,
  kind: string,
): T | undefined {
  return plugins?.find((plugin) => plugin.kind === kind)?.options as
    | T
    | undefined;
}

function clampPageIndex(index: number, pageCount: number) {
  if (pageCount <= 0) return 0;
  return Math.max(0, Math.min(index | 0, pageCount - 1));
}

function normalizePageSize(value: number | undefined, fallback = 1) {
  const next = value ?? fallback;
  return Number.isFinite(next)
    ? Math.max(1, next | 0)
    : Math.max(1, fallback | 0);
}

function normalizePageCount(pageCount: number) {
  if (!Number.isFinite(pageCount)) return 0;
  return Math.max(0, pageCount | 0);
}

function normalizeDisplayedCount(value: number | undefined, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(0, value! | 0);
}

function shouldClampPageIndex(total: number, loading: boolean | undefined) {
  return total > 0 || loading === false;
}

function clampPageIndexForState(args: {
  index: number;
  pageCount: number;
  total: number;
  loading?: boolean;
}) {
  const normalized = Math.max(0, args.index | 0);
  return shouldClampPageIndex(args.total, args.loading)
    ? clampPageIndex(normalized, args.pageCount)
    : normalized;
}

type ResolvedDataPaginationUrlSync = {
  enabled: boolean;
  param: string;
  history: "push" | "replace";
  omitFirstPage: boolean;
  basePath?: string;
  preserveSearch: boolean;
};

type ResolvedDataPaginationSessionStorage = {
  enabled: boolean;
  key?: string;
};

type DataPaginationSessionStorageState = {
  pageIndex?: number;
  pageSize?: number;
};

function resolveDataPaginationUrlSync(
  options: DataPaginationUrlSyncOptions | undefined,
): ResolvedDataPaginationUrlSync {
  if (!options) {
    return {
      enabled: false,
      param: "page",
      history: "push",
      omitFirstPage: true,
      preserveSearch: true,
    };
  }

  if (options === true) {
    return {
      enabled: true,
      param: "page",
      history: "push",
      omitFirstPage: true,
      preserveSearch: true,
    };
  }

  return {
    enabled: options.enabled ?? true,
    param: options.param || "page",
    history: options.history ?? "push",
    omitFirstPage: options.omitFirstPage ?? true,
    basePath: options.basePath,
    preserveSearch: options.preserveSearch ?? true,
  };
}

function resolveDataPaginationSessionStorage(
  options: DataPaginationSessionStorageOptions | undefined,
): ResolvedDataPaginationSessionStorage {
  if (!options) return { enabled: false };
  if (options === true) return { enabled: true };

  return {
    enabled: options.enabled ?? true,
    key: options.key,
  };
}

function buildPaginationStorageKey(
  storage: ResolvedDataPaginationSessionStorage,
  urlSync: ResolvedDataPaginationUrlSync,
) {
  if (!storage.enabled) return undefined;
  if (storage.key) return storage.key;

  const path =
    urlSync.basePath ??
    (typeof window !== "undefined" ? window.location.pathname : undefined);

  return path ? `rmg:pagination:${path}:${urlSync.param}` : undefined;
}

function readPaginationSessionStorage(
  key: string | undefined,
): DataPaginationSessionStorageState | null {
  if (!key || typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage?.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as DataPaginationSessionStorageState;
    return typeof parsed === "object" && parsed ? parsed : null;
  } catch {
    return null;
  }
}

function writePaginationSessionStorage(
  key: string | undefined,
  value: DataPaginationSessionStorageState,
) {
  if (!key || typeof window === "undefined") return;

  try {
    window.sessionStorage?.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable in private contexts; pagination still works.
  }
}

function parsePageIndexFromSearch(search: string, param: string) {
  const raw = new URLSearchParams(search).get(param);
  if (!raw) return null;

  const pageNumber = Number(raw);
  if (!Number.isFinite(pageNumber)) return null;

  const pageIndex = Math.floor(pageNumber) - 1;
  return pageIndex >= 0 ? pageIndex : null;
}

function splitBasePath(basePath: string) {
  const queryIndex = basePath.indexOf("?");
  if (queryIndex === -1) {
    return { pathname: basePath, search: "" };
  }

  return {
    pathname: basePath.slice(0, queryIndex) || "/",
    search: basePath.slice(queryIndex),
  };
}

function buildPaginationHref(
  pageIndex: number,
  urlSync: ResolvedDataPaginationUrlSync,
  options?: { useWindow?: boolean },
) {
  const canUseWindow =
    (options?.useWindow ?? true) && typeof window !== "undefined";
  if (!canUseWindow && !urlSync.basePath) return undefined;

  const base = splitBasePath(urlSync.basePath ?? window.location.pathname);
  const baseParams = new URLSearchParams(base.search);
  const params =
    urlSync.preserveSearch && canUseWindow
      ? new URLSearchParams(window.location.search)
      : baseParams;

  baseParams.forEach((value, key) => {
    if (!params.has(key)) params.set(key, value);
  });

  if (urlSync.omitFirstPage && pageIndex <= 0) {
    params.delete(urlSync.param);
  } else {
    params.set(urlSync.param, String(Math.max(0, pageIndex | 0) + 1));
  }

  const search = params.toString();
  const hash = canUseWindow ? window.location.hash : "";
  return `${base.pathname}${search ? `?${search}` : ""}${hash}`;
}

function writePaginationHref(
  pageIndex: number,
  urlSync: ResolvedDataPaginationUrlSync,
) {
  if (typeof window === "undefined" || !window.history) return;

  const href = buildPaginationHref(pageIndex, urlSync);
  if (!href) return;

  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (href === current) return;

  const method = urlSync.history === "replace" ? "replaceState" : "pushState";
  window.history[method](window.history.state, "", href);
}

function addPageIndexes(
  target: Set<number>,
  start: number,
  end: number,
  pageCount: number,
) {
  const from = Math.max(0, start);
  const to = Math.min(pageCount - 1, end);

  for (let index = from; index <= to; index += 1) {
    target.add(index);
  }
}

export function getDataPageRange({
  pageIndex,
  pageCount: rawPageCount,
  pageRangeDisplayed,
  marginPagesDisplayed,
}: DataPageRangeOptions): DataPageRangeItem[] {
  const pageCount = normalizePageCount(rawPageCount);
  if (pageCount <= 0) return [];

  const selectedIndex = clampPageIndex(pageIndex, pageCount);
  const centerCount = normalizeDisplayedCount(pageRangeDisplayed, 5);
  const marginCount = normalizeDisplayedCount(marginPagesDisplayed, 1);
  const allPages = new Set<number>();

  addPageIndexes(allPages, 0, marginCount - 1, pageCount);
  addPageIndexes(allPages, pageCount - marginCount, pageCount - 1, pageCount);

  if (centerCount > 0) {
    let centerStart = selectedIndex - Math.floor(centerCount / 2);
    let centerEnd = centerStart + centerCount - 1;
    const minCenter = marginCount;
    const maxCenter = pageCount - marginCount - 1;

    if (centerStart < minCenter) {
      centerEnd += minCenter - centerStart;
      centerStart = minCenter;
    }

    if (centerEnd > maxCenter) {
      centerStart -= centerEnd - maxCenter;
      centerEnd = maxCenter;
    }

    addPageIndexes(allPages, centerStart, centerEnd, pageCount);
  }

  const pages = Array.from(allPages).sort((a, b) => a - b);
  const items: DataPageRangeItem[] = [];

  pages.forEach((nextPage, index) => {
    const previousPage = pages[index - 1];

    if (previousPage != null && nextPage - previousPage > 1) {
      if (nextPage - previousPage === 2) {
        const middlePage = previousPage + 1;
        items.push({
          type: "page",
          key: `page-${middlePage}`,
          pageIndex: middlePage,
          selected: middlePage === selectedIndex,
        });
      } else {
        items.push({
          type: "break",
          key: `break-${previousPage}-${nextPage}`,
        });
      }
    }

    items.push({
      type: "page",
      key: `page-${nextPage}`,
      pageIndex: nextPage,
      selected: nextPage === selectedIndex,
    });
  });

  return items;
}

export function getDataPageItems({
  pageIndex,
  pageCount: rawPageCount,
  pageRangeDisplayed,
  marginPagesDisplayed,
  disabled = false,
  previousLabel = "Previous",
  nextLabel = "Next",
  breakLabel = "...",
  getPageLabel = (nextPageIndex) => String(nextPageIndex + 1),
}: DataPageItemsOptions): DataPageControlItem[] {
  const pageCount = normalizePageCount(rawPageCount);
  const selectedIndex = clampPageIndex(pageIndex, pageCount);
  const isDisabled = disabled || pageCount <= 0;

  return [
    {
      type: "previous",
      key: "previous",
      pageIndex: clampPageIndex(selectedIndex - 1, pageCount),
      disabled: isDisabled || selectedIndex <= 0,
      label: previousLabel,
    },
    ...getDataPageRange({
      pageIndex: selectedIndex,
      pageCount,
      pageRangeDisplayed,
      marginPagesDisplayed,
    }).map((item): DataPageControlItem => {
      if (item.type === "break") {
        return {
          ...item,
          disabled: true,
          label: breakLabel,
        };
      }

      return {
        ...item,
        disabled: isDisabled,
        label: getPageLabel(item.pageIndex),
      };
    }),
    {
      type: "next",
      key: "next",
      pageIndex: clampPageIndex(selectedIndex + 1, pageCount),
      disabled: isDisabled || selectedIndex >= pageCount - 1,
      label: nextLabel,
    },
  ];
}

function normalizeItemsPerPageOptions(
  options: readonly DataItemsPerPageOption[] | undefined,
) {
  return (options ?? [])
    .map((option) => {
      if (typeof option === "number") {
        const value = normalizePageSize(option);
        return { value, label: String(value) };
      }

      const value = normalizePageSize(option.value);
      return { value, label: option.label };
    })
    .filter(
      (option, index, all) =>
        all.findIndex((candidate) => candidate.value === option.value) ===
        index,
    );
}

export function useDataPagination<Plugin>(
  options: UseDataPaginationOptions,
  createPlugin: (options: DataPaginationOptions) => Plugin,
): DataPaginationController<Plugin> {
  const pageSizeControlled = options.pageSize != null;
  const initialPageSize = normalizePageSize(
    options.pageSize ?? options.initialPageSize,
    1,
  );
  const [uncontrolledPageSize, setUncontrolledPageSizeRaw] =
    React.useState(initialPageSize);
  const pageSize = normalizePageSize(
    pageSizeControlled ? options.pageSize : uncontrolledPageSize,
    initialPageSize,
  );
  const total = options.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const urlSync = React.useMemo(
    () => resolveDataPaginationUrlSync(options.urlSync),
    [options.urlSync],
  );
  const paginationSessionStorage = React.useMemo(
    () => resolveDataPaginationSessionStorage(options.sessionStorage),
    [options.sessionStorage],
  );
  const [urlSyncReady, setUrlSyncReady] = React.useState(
    () => !urlSync.enabled && !paginationSessionStorage.enabled,
  );
  const urlSyncStateRef = React.useRef({
    initialPageIndex: options.initialPageIndex,
    loading: options.loading,
    onPageSizeChange: options.onPageSizeChange,
    pageSize,
    pageSizeControlled,
    total,
  });
  urlSyncStateRef.current = {
    initialPageIndex: options.initialPageIndex,
    loading: options.loading,
    onPageSizeChange: options.onPageSizeChange,
    pageSize,
    pageSizeControlled,
    total,
  };
  const [pageIndex, setPageIndexRaw] = React.useState(() =>
    clampPageIndexForState({
      index:
        urlSync.enabled && urlSync.basePath
          ? (parsePageIndexFromSearch(
              splitBasePath(urlSync.basePath).search,
              urlSync.param,
            ) ??
            options.initialPageIndex ??
            0)
          : (options.initialPageIndex ?? 0),
      pageCount,
      total,
      loading: options.loading,
    }),
  );

  const setPageIndex = React.useCallback<
    React.Dispatch<React.SetStateAction<number>>
  >(
    (next) => {
      setPageIndexRaw((prev) =>
        clampPageIndexForState({
          index: typeof next === "function" ? next(prev) : next,
          pageCount,
          total,
          loading: options.loading,
        }),
      );
    },
    [options.loading, pageCount, total],
  );

  const setPageSize = React.useCallback<
    React.Dispatch<React.SetStateAction<number>>
  >(
    (next) => {
      const nextPageSize = normalizePageSize(
        typeof next === "function" ? next(pageSize) : next,
        pageSize,
      );

      if (!pageSizeControlled) setUncontrolledPageSizeRaw(nextPageSize);
      options.onPageSizeChange?.(nextPageSize);
      setPageIndexRaw(0);
    },
    [options.onPageSizeChange, pageSize, pageSizeControlled],
  );

  React.useEffect(() => {
    setPageIndexRaw((prev) =>
      clampPageIndexForState({
        index: prev,
        pageCount,
        total,
        loading: options.loading,
      }),
    );
  }, [options.loading, pageCount, total]);

  React.useEffect(() => {
    if (!urlSync.enabled && !paginationSessionStorage.enabled) {
      setUrlSyncReady(true);
      return;
    }

    if (typeof window === "undefined") return;

    const syncPageIndexFromLocation = () => {
      const storageKey = buildPaginationStorageKey(
        paginationSessionStorage,
        urlSync,
      );
      const stored = readPaginationSessionStorage(storageKey);
      const nextFromUrl = urlSync.enabled
        ? parsePageIndexFromSearch(window.location.search, urlSync.param)
        : null;
      const {
        initialPageIndex,
        loading,
        onPageSizeChange,
        pageSize: latestPageSize,
        pageSizeControlled: latestPageSizeControlled,
        total: latestTotal,
      } = urlSyncStateRef.current;
      const storedPageSize = normalizePageSize(stored?.pageSize, 0);
      const nextPageSize = stored?.pageSize ? storedPageSize : latestPageSize;
      const latestPageCount = Math.max(
        1,
        Math.ceil(latestTotal / nextPageSize),
      );

      if (stored?.pageSize) {
        if (!latestPageSizeControlled) {
          setUncontrolledPageSizeRaw(storedPageSize);
        } else if (storedPageSize !== latestPageSize) {
          onPageSizeChange?.(storedPageSize);
        }
      }

      setPageIndexRaw(
        clampPageIndexForState({
          index: nextFromUrl ?? stored?.pageIndex ?? initialPageIndex ?? 0,
          pageCount: latestPageCount,
          total: latestTotal,
          loading,
        }),
      );
    };

    syncPageIndexFromLocation();
    setUrlSyncReady(true);

    const onPopState = () => syncPageIndexFromLocation();
    if (urlSync.enabled) window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [
    paginationSessionStorage.enabled,
    paginationSessionStorage.key,
    urlSync.basePath,
    urlSync.enabled,
    urlSync.param,
  ]);

  React.useEffect(() => {
    if (!urlSync.enabled || !urlSyncReady) return;
    writePaginationHref(pageIndex, urlSync);
  }, [pageIndex, urlSync, urlSyncReady]);

  React.useEffect(() => {
    if (!paginationSessionStorage.enabled || !urlSyncReady) return;

    writePaginationSessionStorage(
      buildPaginationStorageKey(paginationSessionStorage, urlSync),
      { pageIndex, pageSize },
    );
  }, [
    pageIndex,
    pageSize,
    paginationSessionStorage.enabled,
    paginationSessionStorage.key,
    urlSync,
    urlSyncReady,
  ]);

  const canBuildPageHref =
    urlSync.enabled && (urlSyncReady || Boolean(urlSync.basePath));

  const getPageHref = React.useCallback(
    (nextPageIndex: number) =>
      canBuildPageHref
        ? buildPaginationHref(
            clampPageIndexForState({
              index: nextPageIndex,
              pageCount,
              total,
              loading: options.loading,
            }),
            urlSync,
            { useWindow: urlSyncReady },
          )
        : undefined,
    [
      canBuildPageHref,
      options.loading,
      pageCount,
      total,
      urlSync,
      urlSyncReady,
    ],
  );

  const canPrevPage = pageIndex > 0;
  const canNextPage = pageIndex < pageCount - 1;
  const nextPage = React.useCallback(() => {
    setPageIndex((prev) => prev + 1);
  }, [setPageIndex]);
  const prevPage = React.useCallback(() => {
    setPageIndex((prev) => prev - 1);
  }, [setPageIndex]);
  const plugin = React.useMemo(
    () =>
      createPlugin({
        enabled: options.enabled,
        mode: options.mode,
        loading: options.loading,
        pageIndex,
        pageSize,
        total,
      }),
    [
      createPlugin,
      options.enabled,
      options.loading,
      options.mode,
      pageIndex,
      pageSize,
      total,
    ],
  );

  return React.useMemo(
    () => ({
      pageIndex,
      pageSize,
      pageCount,
      offset: pageIndex * pageSize,
      getPageHref: canBuildPageHref ? getPageHref : undefined,
      canPrevPage,
      canNextPage,
      setPageIndex,
      nextPage,
      prevPage,
      setPageSize,
      plugin,
    }),
    [
      canBuildPageHref,
      canNextPage,
      canPrevPage,
      getPageHref,
      nextPage,
      pageCount,
      pageIndex,
      pageSize,
      plugin,
      prevPage,
      setPageIndex,
      setPageSize,
    ],
  );
}

function normalizeCount(value: number | undefined, fallback: number) {
  const next = value ?? fallback;
  return Math.max(0, next | 0);
}

export function useDataLoadMore<Plugin>(
  options: UseDataLoadMoreOptions,
  createPlugin: (options: DataLoadMoreOptions) => Plugin,
): DataLoadMoreController<Plugin> {
  const pageSize = Math.max(1, options.pageSize | 0);
  const initialVisibleCount = normalizeCount(
    options.initialVisibleCount,
    pageSize,
  );
  const total = options.total ?? initialVisibleCount;
  const [visibleCount, setVisibleCountRaw] =
    React.useState(initialVisibleCount);

  const setVisibleCount = React.useCallback<
    React.Dispatch<React.SetStateAction<number>>
  >((next) => {
    setVisibleCountRaw((prev) =>
      Math.max(0, typeof next === "function" ? next(prev) : next),
    );
  }, []);

  const canLoadMore = visibleCount < total;
  const loadMore = React.useCallback(() => {
    setVisibleCount((prev) => Math.min(total, prev + pageSize));
  }, [pageSize, setVisibleCount, total]);
  const reset = React.useCallback(() => {
    setVisibleCount(initialVisibleCount);
  }, [initialVisibleCount, setVisibleCount]);
  const plugin = React.useMemo(
    () =>
      createPlugin({
        enabled: options.enabled,
        mode: options.mode,
        loading: options.loading,
        visibleCount,
        total,
      }),
    [
      createPlugin,
      options.enabled,
      options.loading,
      options.mode,
      total,
      visibleCount,
    ],
  );

  return React.useMemo(
    () => ({
      visibleCount,
      pageSize,
      canLoadMore,
      setVisibleCount,
      loadMore,
      reset,
      plugin,
    }),
    [
      canLoadMore,
      loadMore,
      pageSize,
      plugin,
      reset,
      setVisibleCount,
      visibleCount,
    ],
  );
}

export function DataPaginationControls({
  pageIndex,
  pageCount,
  pageRangeDisplayed,
  marginPagesDisplayed,
  disabled,
  previousLabel,
  nextLabel,
  breakLabel,
  getPageLabel,
  onPageChange,
  pageSize,
  itemsPerPageOptions,
  itemsPerPageLabel = "Items per page",
  itemsPerPageSelectLabel = "Items per page",
  itemsPerPageClassName,
  itemsPerPageLabelClassName,
  itemsPerPageSelectClassName,
  onItemsPerPageChange,
  className,
  pageItemsClassName,
  itemClassName,
  pageClassName,
  controlClassName,
  breakClassName,
  selectedClassName,
  ariaLabel = "Pagination",
  disableSelected = false,
  ripple,
  getPageHref,
  renderItem,
}: DataPaginationControlsProps) {
  const {
    createRipple,
    options: rippleOptions,
    ripples,
    setRippleHostRef,
  } = usePaginationRipples(ripple);
  const itemsPerPageRef = React.useRef<HTMLDivElement | null>(null);
  const [itemsPerPageOpen, setItemsPerPageOpen] = React.useState(false);
  const itemsPerPage = normalizeItemsPerPageOptions(itemsPerPageOptions);
  const normalizedPageSize =
    pageSize == null ? undefined : normalizePageSize(pageSize);
  const renderedItemsPerPage =
    normalizedPageSize != null &&
    !itemsPerPage.some((option) => option.value === normalizedPageSize)
      ? [
          { value: normalizedPageSize, label: String(normalizedPageSize) },
          ...itemsPerPage,
        ]
      : itemsPerPage;
  const showItemsPerPage =
    normalizedPageSize != null &&
    renderedItemsPerPage.length > 0 &&
    Boolean(onItemsPerPageChange);
  const selectedItemsPerPage =
    renderedItemsPerPage.find(
      (option) => option.value === normalizedPageSize,
    ) ?? renderedItemsPerPage[0];
  const [activeItemsPerPageValue, setActiveItemsPerPageValue] = React.useState(
    () => selectedItemsPerPage?.value ?? normalizedPageSize ?? 1,
  );
  const items = getDataPageItems({
    pageIndex,
    pageCount,
    pageRangeDisplayed,
    marginPagesDisplayed,
    disabled,
    previousLabel,
    nextLabel,
    breakLabel,
    getPageLabel,
  });

  React.useEffect(() => {
    if (!showItemsPerPage || disabled) setItemsPerPageOpen(false);
  }, [disabled, showItemsPerPage]);

  React.useEffect(() => {
    if (selectedItemsPerPage)
      setActiveItemsPerPageValue(selectedItemsPerPage.value);
  }, [selectedItemsPerPage]);

  React.useEffect(() => {
    if (!itemsPerPageOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const node = itemsPerPageRef.current;
      if (node && !node.contains(event.target as Node)) {
        setItemsPerPageOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setItemsPerPageOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [itemsPerPageOpen]);

  const moveActiveItemsPerPage = React.useCallback(
    (direction: 1 | -1) => {
      if (renderedItemsPerPage.length === 0) return;

      setActiveItemsPerPageValue((previousValue) => {
        const currentIndex = Math.max(
          0,
          renderedItemsPerPage.findIndex(
            (option) => option.value === previousValue,
          ),
        );
        const nextIndex =
          (currentIndex + direction + renderedItemsPerPage.length) %
          renderedItemsPerPage.length;
        return renderedItemsPerPage[nextIndex]?.value ?? previousValue;
      });
    },
    [renderedItemsPerPage],
  );

  const selectItemsPerPage = React.useCallback(
    (nextPageSize: number) => {
      setItemsPerPageOpen(false);
      if (nextPageSize !== normalizedPageSize) {
        onItemsPerPageChange?.(nextPageSize);
      }
    },
    [normalizedPageSize, onItemsPerPageChange],
  );

  return (
    <nav
      className={className}
      aria-label={ariaLabel}
      data-rmg-pagination-controls="true"
    >
      <PaginationRippleStyles enabled={rippleOptions.enabled} />
      {showItemsPerPage ? (
        <div
          ref={itemsPerPageRef}
          className={itemsPerPageClassName}
          data-rmg-items-per-page="true"
        >
          <span className={itemsPerPageLabelClassName}>
            {itemsPerPageLabel}
          </span>
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={itemsPerPageOpen}
            aria-label={`${itemsPerPageSelectLabel}: ${
              selectedItemsPerPage?.label ?? normalizedPageSize ?? ""
            }`}
            className={itemsPerPageSelectClassName}
            data-rmg-items-per-page-select="true"
            data-rmg-items-per-page-trigger="true"
            data-state={itemsPerPageOpen ? "open" : "closed"}
            disabled={disabled}
            onClick={() => setItemsPerPageOpen((open) => !open)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                setItemsPerPageOpen(true);
                moveActiveItemsPerPage(event.key === "ArrowDown" ? 1 : -1);
                return;
              }

              if (event.key === "Home") {
                event.preventDefault();
                setItemsPerPageOpen(true);
                setActiveItemsPerPageValue(
                  renderedItemsPerPage[0]?.value ?? activeItemsPerPageValue,
                );
                return;
              }

              if (event.key === "End") {
                event.preventDefault();
                setItemsPerPageOpen(true);
                setActiveItemsPerPageValue(
                  renderedItemsPerPage[renderedItemsPerPage.length - 1]
                    ?.value ?? activeItemsPerPageValue,
                );
                return;
              }

              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                if (itemsPerPageOpen) {
                  selectItemsPerPage(activeItemsPerPageValue);
                } else {
                  setItemsPerPageOpen(true);
                }
              }
            }}
          >
            <span data-rmg-items-per-page-value="true">
              {selectedItemsPerPage?.label ?? normalizedPageSize}
            </span>
          </button>
          <div
            role="listbox"
            aria-label={itemsPerPageSelectLabel}
            aria-hidden={itemsPerPageOpen ? undefined : true}
            data-rmg-items-per-page-menu="true"
            data-state={itemsPerPageOpen ? "open" : "closed"}
          >
            {renderedItemsPerPage.map((option) => {
              const selected = option.value === normalizedPageSize;
              const active = option.value === activeItemsPerPageValue;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  data-active={active ? "true" : undefined}
                  data-rmg-items-per-page-option="true"
                  data-selected={selected ? "true" : undefined}
                  tabIndex={itemsPerPageOpen ? 0 : -1}
                  onMouseEnter={() => setActiveItemsPerPageValue(option.value)}
                  onClick={() => selectItemsPerPage(option.value)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
      <span className={pageItemsClassName} data-rmg-page-items="true">
        {items.map((item) => {
          if (item.type === "break") {
            const defaultNode = (
              <span
                key={item.key}
                className={
                  [itemClassName, breakClassName].filter(Boolean).join(" ") ||
                  undefined
                }
                aria-hidden="true"
                data-rmg-page-break="true"
              >
                {item.label}
              </span>
            );

            return renderItem ? renderItem(item, defaultNode) : defaultNode;
          }

          const isSelectedPage = item.type === "page" && item.selected;
          const isDisabled =
            item.disabled || (disableSelected && isSelectedPage);
          const href = getPageHref?.(item.pageIndex, item);
          const shouldCreateRipple = !isDisabled && rippleOptions.enabled;
          const shouldHostRipple = rippleOptions.enabled;
          const classNames = [
            itemClassName,
            item.type === "page" ? pageClassName : controlClassName,
            isSelectedPage ? selectedClassName : undefined,
          ]
            .filter(Boolean)
            .join(" ");
          const commonProps = {
            className: classNames || undefined,
            "aria-current": isSelectedPage ? ("page" as const) : undefined,
            "aria-label":
              item.type === "page"
                ? `Page ${item.pageIndex + 1}`
                : item.type === "previous"
                  ? "Previous page"
                  : "Next page",
            "data-rmg-page-button": "true",
            "data-rmg-page-control":
              item.type !== "page" ? item.type : undefined,
            "data-rmg-page-ripple-host": shouldHostRipple ? "true" : undefined,
            "data-page-index": item.pageIndex,
            "data-selected": isSelectedPage ? "true" : undefined,
          };
          const handlePageChange = () => {
            if (isDisabled || isSelectedPage) return;
            onPageChange(item.pageIndex);
          };
          const defaultNode = href ? (
            <a
              key={item.key}
              {...commonProps}
              href={href}
              data-disable-progress="true"
              data-prevent-progress="true"
              aria-disabled={isDisabled ? true : undefined}
              tabIndex={isDisabled ? -1 : undefined}
              ref={(node) => setRippleHostRef(item.key, node)}
              onClick={(event) => {
                if (isDisabled) {
                  event.preventDefault();
                  return;
                }

                if (
                  event.defaultPrevented ||
                  event.button !== 0 ||
                  event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey
                ) {
                  return;
                }

                event.preventDefault();
                if (shouldCreateRipple) createRipple(event, item.key);
                handlePageChange();
              }}
            >
              {renderPaginationRipples(ripples, rippleOptions, item.key)}
              {item.label}
            </a>
          ) : (
            <button
              key={item.key}
              {...commonProps}
              type="button"
              ref={(node) => setRippleHostRef(item.key, node)}
              onClick={(event) => {
                if (shouldCreateRipple) createRipple(event, item.key);
                handlePageChange();
              }}
              disabled={isDisabled}
            >
              {renderPaginationRipples(ripples, rippleOptions, item.key)}
              {item.label}
            </button>
          );

          return renderItem ? renderItem(item, defaultNode) : defaultNode;
        })}
      </span>
    </nav>
  );
}

export function DataInfiniteSentinel({
  options,
  resetKey,
  scope,
}: {
  options: DataInfiniteScrollOptions;
  resetKey?: React.Key;
  scope: string;
}) {
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  const armedRef = React.useRef(true);
  const resolved = React.useMemo(
    () => normalizeDataInfiniteScrollOptions(options),
    [options],
  );
  const enabled = resolved.enabled !== false;
  const hasMore = resolved.hasMore ?? true;
  const loading = !!resolved.loading;

  React.useEffect(() => {
    armedRef.current = true;
  }, [hasMore, resetKey]);

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
        resolved.onLoadMore?.();
      },
      {
        root: null,
        rootMargin: resolved.rootMargin ?? "600px 0px",
        threshold: resolved.threshold ?? 0,
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [
    enabled,
    hasMore,
    loading,
    resolved.onLoadMore,
    resolved.rootMargin,
    resolved.threshold,
    resetKey,
  ]);

  if (!enabled || !hasMore) return null;

  return (
    <div
      ref={sentinelRef}
      data-rmg-data-sentinel={scope}
      data-rmg-data-sentinel-loading={loading ? "1" : "0"}
      style={{ minHeight: 1 }}
      aria-hidden={resolved.sentinel ? undefined : true}
    >
      {resolved.sentinel}
    </div>
  );
}

export function useMeasuredVirtualWindow(
  count: number,
  rootRef: React.RefObject<HTMLElement | null>,
  options?: DataVirtualizationOptions,
): DataVirtualWindowState {
  const resolved = React.useMemo(
    () => normalizeDataVirtualizationOptions(options),
    [options],
  );
  const enabled = resolved.enabled !== false && !!options;
  const estimateSize = resolved.estimateSize;
  const gap = resolved.gap;
  const overscan = resolved.overscan;
  const sizesRef = React.useRef(new Map<number, number>());
  const observersRef = React.useRef(new Map<HTMLElement, ResizeObserver>());
  const [range, setRange] = React.useState(() => ({
    start: 0,
    end: count,
    topSpacer: 0,
    bottomSpacer: 0,
  }));

  const getSize = React.useCallback(
    (index: number) => sizesRef.current.get(index) ?? estimateSize,
    [estimateSize],
  );

  const recomputeRange = React.useCallback(() => {
    if (!enabled || typeof window === "undefined") {
      setRange({ start: 0, end: count, topSpacer: 0, bottomSpacer: 0 });
      return;
    }

    const root = rootRef.current;
    if (!root || count <= 0) {
      setRange({ start: 0, end: count, topSpacer: 0, bottomSpacer: 0 });
      return;
    }

    const rect = root.getBoundingClientRect();
    const viewportTop = -rect.top;
    const viewportBottom = viewportTop + window.innerHeight;
    let cursor = 0;
    let start = 0;
    let end = count;

    for (let index = 0; index < count; index++) {
      const size = getSize(index);
      const itemEnd = cursor + size;
      if (itemEnd >= viewportTop) {
        start = Math.max(0, index - overscan);
        break;
      }
      cursor = itemEnd + gap;
    }

    cursor = 0;
    for (let index = 0; index < count; index++) {
      const size = getSize(index);
      const itemEnd = cursor + size;
      if (itemEnd >= viewportBottom) {
        end = Math.min(count, index + 1 + overscan);
        break;
      }
      cursor = itemEnd + gap;
    }

    let topSpacer = 0;
    for (let index = 0; index < start; index++) {
      topSpacer += getSize(index);
      if (index < start - 1) topSpacer += gap;
    }

    let bottomSpacer = 0;
    for (let index = end; index < count; index++) {
      bottomSpacer += getSize(index);
      if (index < count - 1) bottomSpacer += gap;
    }

    setRange((prev) =>
      prev.start === start &&
      prev.end === end &&
      prev.topSpacer === topSpacer &&
      prev.bottomSpacer === bottomSpacer
        ? prev
        : { start, end, topSpacer, bottomSpacer },
    );
  }, [count, enabled, gap, getSize, overscan, rootRef]);

  React.useEffect(() => {
    recomputeRange();
  }, [count, enabled, estimateSize, gap, overscan, recomputeRange]);

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

  const measureItem = React.useCallback(
    (index: number, node: HTMLElement | null) => {
      for (const [observedNode, observer] of observersRef.current.entries()) {
        if (
          observedNode !== node &&
          observedNode.getAttribute("data-rmg-data-virtual-index") ===
            String(index)
        ) {
          observer.disconnect();
          observersRef.current.delete(observedNode);
        }
      }

      if (!enabled || !node) return;

      node.setAttribute("data-rmg-data-virtual-index", String(index));

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
      topSpacer: 0,
      bottomSpacer: 0,
      measureItem: () => undefined,
    };
  }

  return {
    ...range,
    end: Math.min(range.end, count),
    measureItem,
  };
}

export function useAbsoluteVirtualRange(
  items: readonly AbsoluteVirtualItem[],
  rootRef: React.RefObject<HTMLElement | null>,
  options?: DataVirtualizationOptions,
) {
  const resolved = React.useMemo(
    () => normalizeDataVirtualizationOptions(options),
    [options],
  );
  const enabled = resolved.enabled !== false && !!options;
  const [range, setRange] = React.useState(() => ({
    start: 0,
    end: items.length,
  }));

  const recomputeRange = React.useCallback(() => {
    if (!enabled || typeof window === "undefined") {
      setRange({ start: 0, end: items.length });
      return;
    }

    const root = rootRef.current;
    if (!root || items.length <= 0) {
      setRange({ start: 0, end: items.length });
      return;
    }

    const rect = root.getBoundingClientRect();
    const buffer = resolved.estimateSize * resolved.overscan;
    const viewportTop = -rect.top - buffer;
    const viewportBottom = viewportTop + window.innerHeight + buffer * 2;
    let start = items.length;
    let end = 0;

    items.forEach((item, index) => {
      const itemTop = item.top;
      const itemBottom = item.top + item.height;
      if (itemBottom < viewportTop || itemTop > viewportBottom) return;

      start = Math.min(start, index);
      end = Math.max(end, index + 1);
    });

    if (start === items.length) {
      start = 0;
      end = Math.min(items.length, resolved.overscan + 1);
    }

    setRange((prev) =>
      prev.start === start && prev.end === end ? prev : { start, end },
    );
  }, [enabled, items, resolved.estimateSize, resolved.overscan, rootRef]);

  React.useEffect(() => {
    recomputeRange();
  }, [items.length, enabled, recomputeRange]);

  React.useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    window.addEventListener("scroll", recomputeRange, { passive: true });
    window.addEventListener("resize", recomputeRange);
    return () => {
      window.removeEventListener("scroll", recomputeRange);
      window.removeEventListener("resize", recomputeRange);
    };
  }, [enabled, recomputeRange]);

  return enabled ? range : { start: 0, end: items.length };
}
