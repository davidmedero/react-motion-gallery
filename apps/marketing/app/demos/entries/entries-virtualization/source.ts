export const source = `/* eslint-disable @next/next/no-img-element */
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from "react";
import { GalleryCore } from "react-motion-gallery/core";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import {
  Entries,
  createEntriesSliderMedia,
  flattenEntries,
  type EntriesHandle,
  type EntriesPlugin,
  type EntryCardRenderArgs,
  type EntryItem,
  type EntryMediaRenderArgs,
  type EntryOverlayRenderArgs,
} from "react-motion-gallery/entries";
import { entriesVirtualization } from "react-motion-gallery/entries/virtualization";
import { useEntriesReady } from "react-motion-gallery/entries/ready";
import { RatingStars } from "react-motion-gallery/rating-stars";
import { sliderArrows } from "react-motion-gallery/slider/arrows";
import { sliderDots } from "react-motion-gallery/slider/dots";
import { sliderRipple } from "react-motion-gallery/slider/ripple";
import styles from "./entries-virtualization-demo.module.css";

type ProductEntry = EntryItem & {
  id: string;
  section: string;
  title: string;
  body: string;
  brand: string;
  price: number;
  rating: number;
  stock: number;
  reviewCount: number;
};

type DummyProduct = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  stock: number;
  reviews?: unknown[];
  brand?: string;
  thumbnail?: string;
  images?: string[];
};

type DummyProductsResponse = {
  products: DummyProduct[];
  total: number;
  skip: number;
  limit: number;
};

type ProductEntryPage = {
  entries: ProductEntry[];
  total: number;
  skip: number;
  limit: number;
};

const PRODUCT_SELECT =
  "id,title,description,category,price,rating,stock,reviews,brand,thumbnail,images";
// The first few DummyJSON products currently have duplicate gallery photos.
const PRODUCT_DATA_OFFSET = 5;
const ENTRY_MEDIA_SLIDER_PLUGINS = [
  sliderRipple(),
  sliderArrows(),
  sliderDots(),
];

function productImages(product: DummyProduct) {
  const urls = [
    ...(product.images ?? []),
    ...(product.thumbnail ? [product.thumbnail] : []),
  ].filter(Boolean);

  return Array.from(new Set(urls)).slice(0, 4);
}

function productReviewCount(product: DummyProduct) {
  const listedReviews = product.reviews?.length ?? 0;
  const estimatedCount = Math.round(
    product.rating * 100 + product.stock * 7 + product.id * 17,
  );

  return Math.max(listedReviews, estimatedCount);
}

function mapProductToEntry(product: DummyProduct): ProductEntry {
  const images = productImages(product);

  return {
    id: \`product-\${product.id}\`,
    section: product.category.replaceAll("-", " "),
    title: product.title,
    body: product.description,
    brand: product.brand ?? "Unbranded",
    price: product.price,
    rating: product.rating,
    stock: product.stock,
    reviewCount: productReviewCount(product),
    media: images.map((src, index) => ({
      kind: "image" as const,
      src,
      alt: \`\${product.title} image \${index + 1}\`,
      width: 900,
      height: 900,
    })),
  };
}

async function fetchEntriesProductPage(args: {
  limit: number;
  skip: number;
  signal?: AbortSignal;
}): Promise<ProductEntryPage> {
  const url = new URL("https://dummyjson.com/products");
  url.searchParams.set("limit", String(args.limit));
  url.searchParams.set("skip", String(args.skip + PRODUCT_DATA_OFFSET));
  url.searchParams.set("delay", "650");
  url.searchParams.set("select", PRODUCT_SELECT);

  const response = await fetch(url, { signal: args.signal });

  if (!response.ok) {
    throw new Error(\`DummyJSON request failed with \${response.status}\`);
  }

  const data = (await response.json()) as DummyProductsResponse;

  return {
    entries: data.products.map(mapProductToEntry),
    total: Math.max(0, data.total - PRODUCT_DATA_OFFSET),
    skip: Math.max(0, data.skip - PRODUCT_DATA_OFFSET),
    limit: data.limit,
  };
}

type EntriesProductsViewProps = {
  entries: ProductEntry[];
  plugins?: EntriesPlugin[];
  entriesRef?: Ref<EntriesHandle>;
  busy?: boolean;
  ready?: boolean;
  total?: number;
  status?: ReactNode;
  controls?: ReactNode;
  footer?: ReactNode;
  placeholderCount?: number;
  pendingAppendCount?: number;
};

const INITIAL_ENTRY_SLOT_PREFIX = "product-initial-slot";

function getInitialEntrySlotKey(index: number) {
  return \`\${INITIAL_ENTRY_SLOT_PREFIX}-\${index}\`;
}

function createProductPlaceholderEntries(count: number): ProductEntry[] {
  return Array.from({ length: count }, (_, index) => ({
    key: getInitialEntrySlotKey(index),
    id: \`product-placeholder-\${index}\`,
    section: "Loading",
    title: "Loading product",
    body: "Loading product details.",
    brand: "Loading",
    price: 0,
    rating: 0,
    stock: 0,
    reviewCount: 0,
    revealKey: \`product-placeholder-\${index}\`,
    media: [],
  }));
}

function isProductPlaceholderEntry(entry: ProductEntry) {
  return entry.id.startsWith("product-placeholder-");
}

function ProductSkeletonCard({ entryIndex }: { entryIndex: number }) {
  const titleWidths = ["96%", "94%", "62%"];
  const bodyWidths = [
    ["96%", "92%", "94%", "88%", "72%"],
    ["92%", "88%", "86%", "84%", "58%"],
    ["96%", "92%", "90%", "84%", "64%"],
  ];
  const titleWidth = titleWidths[entryIndex % titleWidths.length]!;
  const body = bodyWidths[entryIndex % bodyWidths.length]!;

  return (
    <article className={styles.skeletonCard}>
      <div className={styles.skeletonMedia} />

      <div className={styles.skeletonCopy}>
        <div className={styles.skeletonCopyMain}>
          <span
            className={[styles.skeletonBlock, styles.skeletonTitle].join(" ")}
            style={
              { "--product-skeleton-title-width": titleWidth } as CSSProperties
            }
          />
          <div className={styles.skeletonRatingRow}>
            <span
              className={[styles.skeletonBlock, styles.skeletonStars].join(" ")}
            />
            <span
              className={[
                styles.skeletonBlock,
                styles.skeletonRatingLabel,
              ].join(" ")}
            />
          </div>
          <span
            className={[styles.skeletonBlock, styles.skeletonPrice].join(" ")}
          />
          <div className={styles.skeletonBody}>
            {body.map((width, index) => (
              <span
                key={index}
                className={[styles.skeletonBlock, styles.skeletonBodyLine].join(
                  " ",
                )}
                style={
                  { "--product-skeleton-line-width": width } as CSSProperties
                }
              />
            ))}
          </div>
        </div>

        <div className={styles.skeletonInventory}>
          {["category", "brand", "stock"].map((label) => (
            <span key={label} className={styles.skeletonInventoryItem}>
              <span
                className={[
                  styles.skeletonBlock,
                  styles.skeletonInventoryLabel,
                ].join(" ")}
              />
              <span
                className={[
                  styles.skeletonBlock,
                  styles.skeletonInventoryValue,
                ].join(" ")}
              />
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function ProductCard({ entry, media }: EntryCardRenderArgs) {
  const product = entry as ProductEntry;
  if (isProductPlaceholderEntry(product)) return null;

  return (
    <article className={styles.card}>
      <div className={styles.media}>{media}</div>
      <div className={styles.copy}>
        <div className={styles.copyMain}>
          <h3 title={product.title}>{product.title}</h3>
          <RatingStars
            value={product.rating}
            reviewCount={product.reviewCount}
            className={styles.rating}
            starsClassName={styles.ratingStars}
            starClassName={styles.ratingStar}
            labelClassName={styles.ratingLabel}
          />
          <strong className={styles.price}>\${product.price.toFixed(2)}</strong>
          <p>{product.body}</p>
        </div>
        <dl className={styles.inventory}>
          <div>
            <dt>Category</dt>
            <dd>{product.section}</dd>
          </div>
          <div>
            <dt>Brand</dt>
            <dd>{product.brand}</dd>
          </div>
          <div>
            <dt>Stock</dt>
            <dd>{product.stock} left</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

function ProductMedia({ media }: EntryMediaRenderArgs) {
  if (media.kind !== "image") return null;

  return (
    <img
      src={media.src}
      alt={media.alt ?? ""}
      width={media.width}
      height={media.height}
      className={styles.productImage}
      decoding="async"
    />
  );
}

function ProductOverlay({ entry, mediaIndex }: EntryOverlayRenderArgs) {
  const product = entry as ProductEntry;

  return (
    <div className={styles.overlay}>
      <span className={styles.overlayKicker}>{product.section}</span>
      <strong className={styles.overlayTitle}>{product.title}</strong>
      <p className={styles.overlayBody}>{product.body}</p>
      <span className={styles.overlayMeta}>
        Image {String((mediaIndex ?? 0) + 1)}
      </span>
      <p className={styles.overlayDescription}>
        {product.brand} - \${product.price.toFixed(2)} -{" "}
        {product.rating.toFixed(1)} rating - {product.stock} left
      </p>
    </div>
  );
}

function FullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
    plugins: [fullscreenSlider(), fullscreenZoomPan()],
    fullscreen: {
      enabled: true,
      closeScroll: true,
    },
  });

  return <>{fullscreenNode}</>;
}

function EntriesProductsView({
  entries,
  plugins,
  entriesRef,
  busy,
  ready,
  total,
  status,
  controls,
  footer,
  placeholderCount = 6,
  pendingAppendCount = 0,
}: EntriesProductsViewProps) {
  const [useInitialSlots] = useState(() => !!busy && entries.length === 0);
  const isInitialBusy = busy && entries.length === 0;
  const displayEntries = useMemo(() => {
    if (isInitialBusy) return createProductPlaceholderEntries(placeholderCount);

    if (!useInitialSlots) return entries;

    return entries.map((entry, index) =>
      index < placeholderCount
        ? { ...entry, key: getInitialEntrySlotKey(index), revealKey: entry.id }
        : entry,
    );
  }, [entries, isInitialBusy, placeholderCount, useInitialSlots]);

  const fullscreenMedia = useMemo(
    () => flattenEntries(displayEntries).flattenedMedia,
    [displayEntries],
  );
  const renderMediaContainer = useMemo(
    () =>
      createEntriesSliderMedia({
        sliderObject: {
          plugins: ENTRY_MEDIA_SLIDER_PLUGINS,
        },
      }),
    [],
  );

  return (
    <section className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.statusGroup}>
          {total != null ? (
            <span>
              {entries.length} / {total}
            </span>
          ) : null}
          <span data-ready={ready ? "true" : "false"}>
            {ready ? "Ready" : busy ? "Loading" : "Settling"}
          </span>
        </div>
      </header>

      {controls ? <div className={styles.controls}>{controls}</div> : null}
      {status ? <div className={styles.notice}>{status}</div> : null}

      <GalleryCore layout="entries" fullscreenItems={fullscreenMedia}>
        <Entries
          ref={entriesRef}
          entries={{
            items: displayEntries,
            mediaLayout: "slider",
            plugins,
            overlay: {
              overlayCrossfadeTarget: "content",
            },
            loading: {
              enabled: true,
              waitForDecode: true,
              force: isInitialBusy ? true : undefined,
              skeletonWrap: {
                className: styles.skeletonWrap,
              },
              minHeight: "var(--entries-data-row-height)",
            },
            render: {
              card: ProductCard,
              media: ProductMedia,
              overlay: ProductOverlay,
              skeleton: ({ entryIndex }) => (
                <ProductSkeletonCard entryIndex={entryIndex} />
              ),
            },
            entryList: {
              className: styles.entryList,
            },
          }}
          fullscreen={{ enabled: true }}
          renderMediaContainer={renderMediaContainer}
        />
        {pendingAppendCount > 0 ? (
          <div className={styles.pendingSkeletonList} aria-hidden="true">
            {Array.from({ length: pendingAppendCount }, (_, index) => (
              <div key={index} className={styles.pendingSkeletonRow}>
                <div
                  className={[
                    styles.skeletonWrap,
                    styles.pendingSkeletonWrap,
                  ].join(" ")}
                >
                  <ProductSkeletonCard entryIndex={entries.length + index} />
                </div>
              </div>
            ))}
          </div>
        ) : null}
        <FullscreenAddon />
      </GalleryCore>

      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </section>
  );
}

const PRODUCT_COUNT = 60;

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

type ProductEntriesState = {
  entries: ProductEntry[];
  total: number;
  error: string | null;
  requestKey: number | null;
};

type VirtualWindowMetrics = {
  firstRow: number | null;
  lastRow: number | null;
  mountedCount: number;
  topSpacer: number;
  bottomSpacer: number;
};

const emptyVirtualMetrics: VirtualWindowMetrics = {
  firstRow: null,
  lastRow: null,
  mountedCount: 0,
  topSpacer: 0,
  bottomSpacer: 0,
};

function readSpacerHeight(root: HTMLElement, placement: "top" | "bottom") {
  const spacer = root.querySelector<HTMLElement>(
    \`[data-rmg-entry-virtual-spacer="\${placement}"]\`,
  );

  return spacer ? Math.round(spacer.getBoundingClientRect().height) : 0;
}

function readVirtualWindowMetrics(root: HTMLElement): VirtualWindowMetrics {
  const rowIndexes: number[] = [];
  const rows = Array.from(
    root.querySelectorAll<HTMLElement>("[data-rmg-entry-owner]"),
  );

  rows.forEach((row) => {
    const value = Number(row.getAttribute("data-rmg-entry-owner"));
    if (Number.isFinite(value)) rowIndexes.push(value);
  });

  rowIndexes.sort((a, b) => a - b);

  return {
    firstRow: rowIndexes[0] ?? null,
    lastRow: rowIndexes[rowIndexes.length - 1] ?? null,
    mountedCount: rows.length,
    topSpacer: readSpacerHeight(root, "top"),
    bottomSpacer: readSpacerHeight(root, "bottom"),
  };
}

function useVirtualWindowMetrics(handle: EntriesHandle | null) {
  const [metrics, setMetrics] =
    useState<VirtualWindowMetrics>(emptyVirtualMetrics);

  useEffect(() => {
    const root = handle?.getRootNode();

    if (!root) {
      const timeout = window.setTimeout(() => {
        setMetrics(emptyVirtualMetrics);
      }, 0);

      return () => window.clearTimeout(timeout);
    }

    let frame = 0;

    const read = () => {
      frame = 0;
      setMetrics(readVirtualWindowMetrics(root));
    };

    const schedule = () => {
      if (frame) return;

      frame = window.requestAnimationFrame(read);
    };

    schedule();

    const observer = new MutationObserver(schedule);
    observer.observe(root, {
      attributes: true,
      attributeFilter: [
        "data-rmg-entry-owner",
        "data-rmg-entry-virtual-spacer",
        "style",
      ],
      childList: true,
      subtree: true,
    });

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [handle]);

  return metrics;
}

function formatRowRange(metrics: VirtualWindowMetrics) {
  if (
    metrics.firstRow == null ||
    metrics.lastRow == null ||
    metrics.mountedCount === 0
  ) {
    return "no rows";
  }

  const firstRow = metrics.firstRow + 1;
  const lastRow = metrics.lastRow + 1;

  if (firstRow === lastRow) return \`row \${firstRow}\`;

  return \`rows \${firstRow}-\${lastRow}\`;
}

function VirtualizationMeter({
  metrics,
  loadedCount,
}: {
  metrics: VirtualWindowMetrics;
  loadedCount: number;
}) {
  return (
    <div className={styles.virtualizationMeter}>
      <span className={styles.virtualizationMeterPrimary}>
        Mounted now {formatRowRange(metrics)} · {metrics.mountedCount} DOM rows
        · {loadedCount} loaded
      </span>
      <span className={styles.virtualizationMeterSecondary}>
        Spacers {numberFormatter.format(metrics.topSpacer)}px top ·{" "}
        {numberFormatter.format(metrics.bottomSpacer)}px bottom
      </span>
    </div>
  );
}

export function EntriesVirtualizationDemo() {
  const [retryKey, setRetryKey] = useState(0);
  const [entriesHandle, setEntriesHandle] = useState<EntriesHandle | null>(
    null,
  );
  const [productState, setProductState] = useState<ProductEntriesState>({
    entries: [],
    total: 0,
    error: null,
    requestKey: null,
  });
  const loading = productState.requestKey !== retryKey;
  const error = loading ? null : productState.error;
  const entriesReady = useEntriesReady({ dataReady: !loading && !error });
  const entriesReadyRef = entriesReady.ref;
  const virtualMetrics = useVirtualWindowMetrics(entriesHandle);

  useEffect(() => {
    const ac = new AbortController();

    fetchEntriesProductPage({
      limit: PRODUCT_COUNT,
      skip: 0,
      signal: ac.signal,
    })
      .then((page) => {
        setProductState({
          entries: page.entries,
          total: page.total,
          error: null,
          requestKey: retryKey,
        });
      })
      .catch((reason) => {
        if (ac.signal.aborted) return;
        setProductState((prev) => ({
          ...prev,
          error:
            reason instanceof Error
              ? reason.message
              : "Unable to load products",
          requestKey: retryKey,
        }));
      });

    return () => ac.abort();
  }, [retryKey]);

  const retry = useCallback(() => setRetryKey((value) => value + 1), []);
  const setEntriesRef = useCallback(
    (handle: EntriesHandle | null) => {
      entriesReadyRef(handle);
      setEntriesHandle(handle);
    },
    [entriesReadyRef],
  );

  return (
    <EntriesProductsView
      entries={productState.entries}
      entriesRef={setEntriesRef}
      plugins={[
        entriesVirtualization({
          estimateSize: 440,
          gap: 24,
          overscan: 1,
        }),
      ]}
      busy={loading}
      ready={entriesReady.ready}
      total={productState.total || PRODUCT_COUNT}
      controls={
        <VirtualizationMeter
          metrics={virtualMetrics}
          loadedCount={productState.entries.length}
        />
      }
      status={
        error ? (
          <>
            <span>{error}</span>
            <button type="button" onClick={retry}>
              Retry
            </button>
          </>
        ) : null
      }
    />
  );
}
`;
