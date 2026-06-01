# Entries Data Plugins

Entries data plugins let the structured `Entries` surface work with dynamic data sets while your app keeps ownership of fetching, caching, and state. Add them through `entries.plugins`.

`entries.layout` controls the outer entry rows. The default `"list"` stacks entries vertically; `"grid"` arranges entries as cards in a responsive grid and makes infinite-scroll sentinels and virtualization spacers span all columns. `entries.mediaLayout` is separate and still describes the media block inside each entry.

The four data plugins are:

- `entriesPagination` for fixed page windows.
- `entriesLoadMore` for progressively revealing or appending records.
- `entriesInfiniteScroll` for a sentinel that requests the next batch.
- `entriesVirtualization` for mounting only the rows near the viewport.

Prefer granular subpaths for small bundles:

```typescript
import {
  EntriesPaginationControls,
  entriesPagination,
  useEntriesPagination,
} from "react-motion-gallery/entries/pagination";
import {
  entriesLoadMore,
  useEntriesLoadMore,
} from "react-motion-gallery/entries/load-more";
import {
  entriesInfiniteScroll,
  useEntriesInfiniteScroll,
} from "react-motion-gallery/entries/infinite-scroll";
import {
  entriesVirtualization,
  useEntriesVirtualizer,
} from "react-motion-gallery/entries/virtualization";
```

The `react-motion-gallery/entries` subpath also exports the plugin helpers when a module already imports the full Entries surface.

| Plugin          | Entry point                                    | Primary exports                                                          |
| --------------- | ---------------------------------------------- | ------------------------------------------------------------------------ |
| Pagination      | `react-motion-gallery/entries/pagination`      | `entriesPagination`, `useEntriesPagination`, `EntriesPaginationControls` |
| Load more       | `react-motion-gallery/entries/load-more`       | `entriesLoadMore`, `useEntriesLoadMore`                                  |
| Infinite scroll | `react-motion-gallery/entries/infinite-scroll` | `entriesInfiniteScroll`, `useEntriesInfiniteScroll`                      |
| Virtualization  | `react-motion-gallery/entries/virtualization`  | `entriesVirtualization`, `useEntriesVirtualizer`                         |

The snippets below focus on data behavior and assume your component already provides a `renderMediaContainer` function such as the helper returned by `createEntriesGridMedia()`, `createEntriesSliderMedia()`, or `createEntriesMasonryMedia()`.

Minimal examples:

```tsx
const pagination = useEntriesPagination({ pageSize: 12, total: items.length });
<Entries
  entries={{ items, plugins: [pagination.plugin] }}
  renderMediaContainer={renderEntryMedia}
/>;

const loadMore = useEntriesLoadMore({
  initialVisibleCount: 12,
  pageSize: 12,
  total: items.length,
});
<Entries
  entries={{ items, plugins: [loadMore.plugin] }}
  renderMediaContainer={renderEntryMedia}
/>;

const infinite = useEntriesInfiniteScroll({ hasMore, loading, onLoadMore });
<Entries
  entries={{ items, plugins: [infinite] }}
  renderMediaContainer={renderEntryMedia}
/>;

<Entries
  entries={{
    items,
    layout: "grid",
    plugins: [entriesVirtualization({ estimateSize: 420, gap: 16 })],
  }}
  renderMediaContainer={renderEntryMedia}
/>;
```

## Windowing model

Pagination and load-more are data-window plugins. In `"client"` mode, Entries slices the supplied `entries.items` array before rendering. In `"server"` mode, Entries leaves the supplied items unchanged, so the current page or visible window should already be reflected in the data passed to `entries.items`.

If both pagination and load-more plugins are enabled, only the first one is applied and a development warning is emitted.

Infinite scroll does not window data. It renders a sentinel after the current rows and calls `onLoadMore` when the sentinel intersects, `hasMore` is true, and `loading` is false.

Virtualization runs after any pagination or load-more windowing. It inserts top and bottom spacers, mounts rows near the viewport, starts from `estimateSize`, and refines measured row heights with `ResizeObserver`. In `entries.layout: "grid"`, it windows grid rows unless `entriesVirtualization({ layout })` overrides the layout mode.

Any enabled data plugin with `loading: true` marks the entry list as busy. Pagination loading also forces an opaque skeleton overlay over the current rows so server-paged content can keep its layout while the next page loads.

Use `entries.loading.exitMs` to tune the entry skeleton opacity fade-out duration. The default is `220`.

Entries remember revealed rows by default. Set `entries.loading.rememberRevealed: false` when rows should animate again after leaving and later re-entering the rendered window, such as revisiting pages in client pagination.

## Pagination

```typescript
import { Entries } from "react-motion-gallery/entries";
import {
  EntriesPaginationControls,
  useEntriesPagination,
} from "react-motion-gallery/entries/pagination";

function ProductEntries({ items, total, loading }) {
  const pagination = useEntriesPagination({
    mode: "server",
    initialPageSize: 12,
    total,
    loading,
    urlSync: { param: "page" },
  });

  return (
    <>
      <Entries
        entries={{
          items,
          plugins: [pagination.plugin],
        }}
        renderMediaContainer={renderEntryMedia}
      />
      <EntriesPaginationControls
        pageIndex={pagination.pageIndex}
        pageCount={pagination.pageCount}
        pageSize={pagination.pageSize}
        itemsPerPageOptions={[12, 24, 48]}
        onPageChange={pagination.setPageIndex}
        onItemsPerPageChange={pagination.setPageSize}
        getPageHref={pagination.getPageHref}
      />
    </>
  );
}
```

### `entriesPagination()` options

| Option      | Type                   | Default    | Notes                                                                              |
| ----------- | ---------------------- | ---------- | ---------------------------------------------------------------------------------- |
| `enabled`   | `boolean`              | `true`     | Disables the plugin when false.                                                    |
| `mode`      | `"client" \| "server"` | `"client"` | Client mode slices `entries.items`; server mode leaves supplied items untouched.   |
| `pageIndex` | `number`               | required   | Zero-based current page. Values below zero clamp to zero.                          |
| `pageSize`  | `number`               | required   | Items per page. Values below one clamp to one.                                     |
| `total`     | `number`               | `—`        | Total record count.                                                                |
| `loading`   | `boolean`              | `—`        | Marks the list busy and forces an opaque skeleton overlay during page transitions. |

### `useEntriesPagination()` options

| Option             | Type                                             | Default           | Notes                                                                                          |
| ------------------ | ------------------------------------------------ | ----------------- | ---------------------------------------------------------------------------------------------- |
| `pageSize`         | `number`                                         | `initialPageSize` | Controlled items per page.                                                                     |
| `initialPageSize`  | `number`                                         | `1`               | Uncontrolled initial items per page when `pageSize` is omitted.                                |
| `onPageSizeChange` | `(pageSize: number) => void`                     | `—`               | Called from `setPageSize`, including when stored page size is restored into a controlled hook. |
| `total`            | `number`                                         | `0`               | Used to derive `pageCount`.                                                                    |
| `initialPageIndex` | `number`                                         | `0`               | Initial zero-based page when URL sync does not provide one.                                    |
| `mode`             | `"client" \| "server"`                           | `"client"`        | Passed through to the plugin.                                                                  |
| `loading`          | `boolean`                                        | `—`               | Passed through to the plugin.                                                                  |
| `enabled`          | `boolean`                                        | `true`            | Passed through to the plugin.                                                                  |
| `urlSync`          | `boolean \| EntriesPaginationUrlSyncOptions`     | `false`           | Reads and writes a one-based page query param.                                                 |
| `sessionStorage`   | `boolean \| { enabled?: boolean; key?: string }` | `false`           | Restores and writes `pageIndex` and `pageSize` in `window.sessionStorage`.                     |

The controller returns `pageIndex`, `pageSize`, `pageCount`, `offset`, `canPrevPage`, `canNextPage`, `setPageIndex`, `setPageSize`, `nextPage`, `prevPage`, `plugin`, and optional `getPageHref`. Calling `setPageSize` resets the current page to zero.

`urlSync: true` uses `?page=2`, pushes history entries, omits the first page from the URL, and preserves the current search string. Pass `{ param, history, omitFirstPage, basePath, preserveSearch }` to customize the behavior. `basePath` lets server-rendered controls build hrefs before `window.location` is available.

`sessionStorage: true` uses a default key based on the current path and page query param; pass `{ key: "products-pagination" }` when a page has multiple paginated surfaces. If URL sync is also enabled, the URL page wins and storage fills in when the query param is absent. Session storage is client-only persistence for pagination state; it does not fetch or cache records.

`EntriesPaginationControls` renders buttons by default. If `getPageHref` returns a URL, it renders anchors, preserves normal modified-click behavior, and intercepts plain clicks to call `onPageChange`. Pass `pageSize`, `itemsPerPageOptions`, and `onItemsPerPageChange` to render an items-per-page listbox selector above the page controls. The selector and page buttons render as separate groups (`data-rmg-items-per-page` and `data-rmg-page-items`) so they can align or wrap independently. Use `renderItem` to customize the markup.

Page, previous, and next controls render a click-position ripple by default. Pass `ripple={false}` to disable it, or pass `ripple={{ color, duration, easing, opacity, className }}` to customize the feedback. `duration` accepts milliseconds as a number or a CSS duration string such as `"420ms"`.

Pagination helpers:

| API                         | Purpose                                                                        |
| --------------------------- | ------------------------------------------------------------------------------ |
| `getEntriesPageRange()`     | Returns page and break items for compact pagination.                           |
| `getEntriesPageItems()`     | Adds previous/next controls, disabled state, and labels around the page range. |
| `EntriesPaginationControls` | Renders accessible pagination buttons or anchors.                              |

## Load More

Use `entriesLoadMore()` when you already own `visibleCount`, or `useEntriesLoadMore()` when the component should own the count locally.

```typescript
const loadMore = useEntriesLoadMore({
  mode: "client",
  initialVisibleCount: 12,
  pageSize: 12,
  total: items.length,
});

<Entries
  entries={{
    items,
    plugins: [loadMore.plugin],
  }}
  renderMediaContainer={renderEntryMedia}
/>;
```

| Option                | Type                   | Default                             | Notes                                                                                            |
| --------------------- | ---------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------ |
| `enabled`             | `boolean`              | `true`                              | Disables the plugin when false.                                                                  |
| `mode`                | `"client" \| "server"` | `"client"`                          | Client mode renders the first `visibleCount` items; server mode leaves supplied items untouched. |
| `visibleCount`        | `number`               | required for `entriesLoadMore()`    | Number of currently visible records.                                                             |
| `initialVisibleCount` | `number`               | `pageSize`                          | Hook-only initial visible count.                                                                 |
| `pageSize`            | `number`               | required for `useEntriesLoadMore()` | Records added by each `loadMore()` call.                                                         |
| `total`               | `number`               | `initialVisibleCount`               | Used by the hook to compute `canLoadMore`.                                                       |
| `loading`             | `boolean`              | `—`                                 | Marks the list busy.                                                                             |

The load-more controller returns `visibleCount`, `pageSize`, `canLoadMore`, `setVisibleCount`, `loadMore`, `reset`, and `plugin`.

## Infinite Scroll

Infinite scroll is usually paired with server-mode load-more, but it can also call any append function your app provides.

```typescript
const infiniteScroll = useEntriesInfiniteScroll({
  hasMore,
  loading,
  onLoadMore,
  rootMargin: "800px 0px",
});

<Entries
  entries={{
    items,
    plugins: [infiniteScroll],
  }}
  renderMediaContainer={renderEntryMedia}
/>;
```

| Option       | Type         | Default       | Notes                                                                        |
| ------------ | ------------ | ------------- | ---------------------------------------------------------------------------- |
| `enabled`    | `boolean`    | `true`        | Disables sentinel rendering when false.                                      |
| `hasMore`    | `boolean`    | `true`        | Removes the sentinel when false.                                             |
| `loading`    | `boolean`    | `—`           | Prevents repeated `onLoadMore` calls while a request is active.              |
| `rootMargin` | `string`     | `"600px 0px"` | IntersectionObserver preload margin.                                         |
| `threshold`  | `number`     | `0`           | IntersectionObserver threshold.                                              |
| `onLoadMore` | `() => void` | `—`           | Called when the sentinel intersects and loading gates allow another request. |
| `sentinel`   | `ReactNode`  | `—`           | Optional visual content inside the sentinel element.                         |

`useEntriesInfiniteScroll(options)` memoizes `entriesInfiniteScroll(options)` and returns the plugin.

## Virtualization

Virtualization is useful when the current item window is still large. Keep `estimateSize` close to the typical rendered row height, and set `gap` to match the vertical gap used by your entry list styles.

```typescript
<Entries
  entries={{
    items,
    plugins: [
      entriesVirtualization({
        estimateSize: 440,
        gap: 24,
        overscan: 3,
      }),
    ],
  }}
  renderMediaContainer={renderEntryMedia}
/>;
```

| Option         | Type               | Default          | Notes                                                                                           |
| -------------- | ------------------ | ---------------- | ----------------------------------------------------------------------------------------------- |
| `enabled`      | `boolean`          | `true`           | Disables virtualization when false.                                                             |
| `layout`       | `"list" \| "grid"` | `entries.layout` | Windows one entry per row for list layouts or grid rows with multiple entries for grid layouts. |
| `estimateSize` | `number`           | `420`            | Initial row height estimate in pixels. Values below one clamp to one.                           |
| `gap`          | `number`           | `24`             | Vertical gap included in spacer calculations. Values below zero clamp to zero.                  |
| `overscan`     | `number`           | `3`              | Extra rows to mount before and after the visible range. Values below zero clamp to zero.        |

`useEntriesVirtualizer(options)` memoizes `entriesVirtualization(options)` and returns the plugin.

## Demos

The marketing app includes live demos and source for all four data plugin patterns:

- `entries-pagination`
- `entries-pagination-grid`
- `entries-load-more`
- `entries-load-more-grid`
- `entries-infinite-scroll`
- `entries-infinite-scroll-grid`
- `entries-virtualization`
- `entries-virtualization-grid`
