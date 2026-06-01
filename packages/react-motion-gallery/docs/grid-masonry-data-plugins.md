# Grid And Masonry Data Plugins

Grid and Masonry data plugins mirror the Entries data plugin API for child-layout surfaces. Your app still owns fetching, caching, URL state, and append behavior; the plugins describe how the current child list should be windowed, observed, or virtualized.

For Grid per-item skeleton reveals, use `Grid.loading`. `loading.timing.exitMs` controls the skeleton opacity fade-out duration; the default is `220`. Use `keepSkeletonMounted` when a settled skeleton layer should remain mounted at opacity 0 and fade back in during a later loading transition, such as server pagination. Pair it with `rememberRevealed: false` when items that leave the current data window should animate again if they return.

## Imports

```tsx
import { Grid } from "react-motion-gallery/grid";
import {
  GridPaginationControls,
  gridPagination,
  useGridPagination,
} from "react-motion-gallery/grid/pagination";
import {
  gridLoadMore,
  useGridLoadMore,
} from "react-motion-gallery/grid/load-more";
import {
  gridInfiniteScroll,
  useGridInfiniteScroll,
} from "react-motion-gallery/grid/infinite-scroll";
import {
  gridVirtualization,
  useGridVirtualizer,
} from "react-motion-gallery/grid/virtualization";

import { Masonry } from "react-motion-gallery/masonry";
import {
  MasonryPaginationControls,
  masonryPagination,
  useMasonryPagination,
} from "react-motion-gallery/masonry/pagination";
import {
  masonryLoadMore,
  useMasonryLoadMore,
} from "react-motion-gallery/masonry/load-more";
import {
  masonryInfiniteScroll,
  useMasonryInfiniteScroll,
} from "react-motion-gallery/masonry/infinite-scroll";
import {
  masonryVirtualization,
  useMasonryVirtualizer,
} from "react-motion-gallery/masonry/virtualization";
```

| Surface | Pagination                                | Load more                                | Infinite scroll                                | Virtualization                                |
| ------- | ----------------------------------------- | ---------------------------------------- | ---------------------------------------------- | --------------------------------------------- |
| Grid    | `react-motion-gallery/grid/pagination`    | `react-motion-gallery/grid/load-more`    | `react-motion-gallery/grid/infinite-scroll`    | `react-motion-gallery/grid/virtualization`    |
| Masonry | `react-motion-gallery/masonry/pagination` | `react-motion-gallery/masonry/load-more` | `react-motion-gallery/masonry/infinite-scroll` | `react-motion-gallery/masonry/virtualization` |

The Masonry factories are cross-surface plugins. The same `masonryPagination()`, `masonryLoadMore()`, `masonryInfiniteScroll()`, and `masonryVirtualization()` plugin can be passed to either default dimensioned Masonry or measured Masonry.

## Minimal Examples

```tsx
const pagination = useGridPagination({ pageSize: 12, total: items.length });
<Grid plugins={[pagination.plugin]}>{items.map(renderCard)}</Grid>;

const loadMore = useGridLoadMore({
  initialVisibleCount: 12,
  pageSize: 12,
  total: items.length,
});
<Grid plugins={[loadMore.plugin]}>{items.map(renderCard)}</Grid>;

const infinite = useGridInfiniteScroll({ hasMore, loading, onLoadMore });
<Grid plugins={[infinite]}>{items.map(renderCard)}</Grid>;

<Grid plugins={[gridVirtualization({ estimateSize: 360, gap: 16 })]}>
  {items.map(renderCard)}
</Grid>;
```

```tsx
const pagination = useMasonryPagination({ pageSize: 12, total: items.length });
<Masonry plugins={[pagination.plugin]}>{items.map(renderItem)}</Masonry>;

const loadMore = useMasonryLoadMore({
  initialVisibleCount: 12,
  pageSize: 12,
  total: items.length,
});
<Masonry plugins={[loadMore.plugin]}>{items.map(renderItem)}</Masonry>;

const infinite = useMasonryInfiniteScroll({ hasMore, loading, onLoadMore });
<Masonry plugins={[infinite]}>{items.map(renderItem)}</Masonry>;

<Masonry plugins={[masonryVirtualization({ estimateSize: 420, gap: 18 })]}>
  {items.map(renderItem)}
</Masonry>;
```

## Data Windowing

`gridPagination()` and `masonryPagination()` accept:

| Option      | Type                   | Default             | Notes                                                                        |
| ----------- | ---------------------- | ------------------- | ---------------------------------------------------------------------------- |
| `enabled`   | `boolean`              | `true`              | Disables the plugin when false.                                              |
| `mode`      | `"client" \| "server"` | `"client"`          | Client mode slices children. Server mode leaves supplied children unchanged. |
| `pageIndex` | `number`               | required            | Zero-based current page.                                                     |
| `pageSize`  | `number`               | required            | Number of children per page.                                                 |
| `total`     | `number`               | current child count | Used by hooks and controls.                                                  |
| `loading`   | `boolean`              | `false`             | Marks the layout busy while external data is loading.                        |

`gridLoadMore()` and `masonryLoadMore()` accept:

| Option         | Type                   | Default             | Notes                                                 |
| -------------- | ---------------------- | ------------------- | ----------------------------------------------------- |
| `enabled`      | `boolean`              | `true`              | Disables the plugin when false.                       |
| `mode`         | `"client" \| "server"` | `"client"`          | Client mode slices children by visible count.         |
| `visibleCount` | `number`               | required            | Number of children to render.                         |
| `total`        | `number`               | current child count | Used by hooks to compute `canLoadMore`.               |
| `loading`      | `boolean`              | `false`             | Marks the layout busy while external data is loading. |

In client mode, pagination and load-more run before layout work, so hidden children do not reserve grid tracks or masonry positions. The visible window preserves original item indices through `data-rmg-idx`, fullscreen registration, and visibility metadata. In server mode, the supplied children and `fullscreenItems` are treated as the current server window.

`useGridPagination()` and `useMasonryPagination()` accept the same hook options as Entries pagination:

| Option             | Type                                                                         | Default           | Notes                                                                                          |
| ------------------ | ---------------------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------- |
| `pageSize`         | `number`                                                                     | `initialPageSize` | Controlled items per page.                                                                     |
| `initialPageSize`  | `number`                                                                     | `1`               | Uncontrolled initial items per page when `pageSize` is omitted.                                |
| `onPageSizeChange` | `(pageSize: number) => void`                                                 | `—`               | Called from `setPageSize`, including when stored page size is restored into a controlled hook. |
| `total`            | `number`                                                                     | `0`               | Used to derive `pageCount`.                                                                    |
| `initialPageIndex` | `number`                                                                     | `0`               | Initial zero-based page when URL sync or session storage does not provide one.                 |
| `mode`             | `"client" \| "server"`                                                       | `"client"`        | Passed through to the plugin.                                                                  |
| `loading`          | `boolean`                                                                    | `—`               | Passed through to the plugin.                                                                  |
| `enabled`          | `boolean`                                                                    | `true`            | Passed through to the plugin.                                                                  |
| `urlSync`          | `boolean \| GridPaginationUrlSyncOptions \| MasonryPaginationUrlSyncOptions` | `false`           | Reads and writes a one-based page query param.                                                 |
| `sessionStorage`   | `boolean \| { enabled?: boolean; key?: string }`                             | `false`           | Restores and writes `pageIndex` and `pageSize` in `window.sessionStorage`.                     |

The controller returns `pageIndex`, `pageSize`, `pageCount`, `offset`, `canPrevPage`, `canNextPage`, `setPageIndex`, `setPageSize`, `nextPage`, `prevPage`, `plugin`, and optional `getPageHref`. Calling `setPageSize` resets the current page to zero.

`sessionStorage: true` uses a default key based on the current path and page query param; pass `{ key: "products-pagination" }` when a page has multiple paginated surfaces. If URL sync is also enabled, the URL page wins and storage fills in when the query param is absent. Session storage is client-only persistence for pagination state; it does not fetch or cache records.

`GridPaginationControls` and `MasonryPaginationControls` render click-position ripples on page, previous, and next buttons by default. Pass `pageSize`, `itemsPerPageOptions`, and `onItemsPerPageChange` to render an items-per-page listbox selector. The selector and page buttons render as separate groups (`data-rmg-items-per-page` and `data-rmg-page-items`) so they can align or wrap independently. Pass `ripple={false}` to disable the effect, or pass `ripple={{ color, duration, easing, opacity, className }}` to tune the feedback. `duration` accepts milliseconds as a number or a CSS duration string such as `"420ms"`.

## Infinite Scroll

`gridInfiniteScroll()` and `masonryInfiniteScroll()` accept:

| Option       | Type              | Default       | Notes                                |
| ------------ | ----------------- | ------------- | ------------------------------------ |
| `enabled`    | `boolean`         | `true`        | Disables the sentinel when false.    |
| `hasMore`    | `boolean`         | `true`        | Removes the sentinel when false.     |
| `loading`    | `boolean`         | `false`       | Prevents new load calls while busy.  |
| `rootMargin` | `string`          | `"600px 0px"` | IntersectionObserver root margin.    |
| `threshold`  | `number`          | `0`           | IntersectionObserver threshold.      |
| `onLoadMore` | `() => void`      | `undefined`   | Called when the sentinel intersects. |
| `sentinel`   | `React.ReactNode` | `undefined`   | Optional rendered sentinel content.  |

The sentinel renders after the layout root. That keeps it out of CSS grid placement and out of masonry absolute positioning.

## Virtualization

`gridVirtualization()` and `masonryVirtualization()` accept:

| Option         | Type      | Default | Notes                                            |
| -------------- | --------- | ------- | ------------------------------------------------ |
| `enabled`      | `boolean` | `true`  | Disables virtualization when false.              |
| `estimateSize` | `number`  | `420`   | Initial row or item height estimate.             |
| `gap`          | `number`  | `24`    | Vertical gap used for virtual range math.        |
| `overscan`     | `number`  | `3`     | Extra rows or items mounted around the viewport. |

Virtualization runs after pagination and load-more. Grid virtualizes by rows and uses top and bottom spacers. Default Masonry uses known item positions. Measured Masonry starts from estimated or seeded heights, then refines its virtual range as items are measured with `ResizeObserver`.
