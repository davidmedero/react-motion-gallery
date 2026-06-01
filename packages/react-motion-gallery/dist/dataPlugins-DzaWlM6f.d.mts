import * as React from 'react';

type PaginationRippleOptions = {
    enabled?: boolean;
    color?: string;
    duration?: number | string;
    easing?: string;
    opacity?: number;
    className?: string;
};
type PaginationRippleProp = boolean | PaginationRippleOptions;

type DataMode = "client" | "server";
type DataPaginationOptions = {
    enabled?: boolean;
    mode?: DataMode;
    pageIndex: number;
    pageSize: number;
    total?: number;
    loading?: boolean;
};
type DataItemsPerPageOption = number | {
    value: number;
    label: React.ReactNode;
};
type DataPaginationSessionStorageOptions = boolean | {
    enabled?: boolean;
    key?: string;
};
type DataLoadMoreOptions = {
    enabled?: boolean;
    mode?: DataMode;
    visibleCount: number;
    total?: number;
    loading?: boolean;
};
type DataInfiniteScrollOptions = {
    enabled?: boolean;
    hasMore?: boolean;
    loading?: boolean;
    rootMargin?: string;
    threshold?: number;
    onLoadMore?: () => void;
    sentinel?: React.ReactNode;
};
type DataVirtualizationOptions = {
    enabled?: boolean;
    estimateSize?: number;
    gap?: number;
    overscan?: number;
};
type UseDataPaginationOptions = {
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
type DataPaginationUrlSyncOptions = boolean | {
    enabled?: boolean;
    param?: string;
    history?: "push" | "replace";
    omitFirstPage?: boolean;
    basePath?: string;
    preserveSearch?: boolean;
};
type DataPaginationController<Plugin> = {
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
type UseDataLoadMoreOptions = {
    initialVisibleCount?: number;
    pageSize: number;
    total?: number;
    mode?: DataLoadMoreOptions["mode"];
    loading?: boolean;
    enabled?: boolean;
};
type DataLoadMoreController<Plugin> = {
    visibleCount: number;
    pageSize: number;
    canLoadMore: boolean;
    setVisibleCount: React.Dispatch<React.SetStateAction<number>>;
    loadMore: () => void;
    reset: () => void;
    plugin: Plugin;
};
type DataPageRangeItem = {
    type: "page";
    key: string;
    pageIndex: number;
    selected: boolean;
} | {
    type: "break";
    key: string;
};
type DataPageControlItem = {
    type: "previous" | "next";
    key: string;
    pageIndex: number;
    disabled: boolean;
    label: React.ReactNode;
} | {
    type: "page";
    key: string;
    pageIndex: number;
    selected: boolean;
    disabled: boolean;
    label: React.ReactNode;
} | {
    type: "break";
    key: string;
    disabled: true;
    label: React.ReactNode;
};
type DataPageRangeOptions = {
    pageIndex: number;
    pageCount: number;
    pageRangeDisplayed?: number;
    marginPagesDisplayed?: number;
};
type DataPageItemsOptions = DataPageRangeOptions & {
    disabled?: boolean;
    previousLabel?: React.ReactNode;
    nextLabel?: React.ReactNode;
    breakLabel?: React.ReactNode;
    getPageLabel?: (pageIndex: number) => React.ReactNode;
};
type DataPaginationRippleOptions = PaginationRippleOptions;
type DataPaginationRippleProp = PaginationRippleProp;
type DataPaginationControlsProps = DataPageItemsOptions & {
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
    getPageHref?: (pageIndex: number, item: DataPageControlItem) => string | undefined;
    renderItem?: (item: DataPageControlItem, defaultNode: React.ReactElement) => React.ReactNode;
};

export type { DataPaginationController as D, UseDataPaginationOptions as U, DataItemsPerPageOption as a, DataPageControlItem as b, DataPageItemsOptions as c, DataPageRangeItem as d, DataPageRangeOptions as e, DataPaginationControlsProps as f, DataPaginationRippleOptions as g, DataPaginationRippleProp as h, DataPaginationSessionStorageOptions as i, DataPaginationUrlSyncOptions as j, DataInfiniteScrollOptions as k, DataLoadMoreOptions as l, UseDataLoadMoreOptions as m, DataLoadMoreController as n, DataPaginationOptions as o, DataVirtualizationOptions as p };
