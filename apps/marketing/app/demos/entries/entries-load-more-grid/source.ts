export const source = String.raw`/* eslint-disable @next/next/no-img-element */
"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
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
  flattenEntries,
  type EntriesHandle,
  type EntriesPlugin,
  type EntryCardRenderArgs,
  type EntryItem,
  type EntryMediaRenderArgs,
  type EntryOverlayRenderArgs,
} from "react-motion-gallery/entries";
import { createEntriesSliderMedia } from "react-motion-gallery/entries/media/slider";
import { RatingStars } from "react-motion-gallery/rating-stars";
import { Skeleton, type SkeletonNode } from "react-motion-gallery/skeleton/base";
import { sliderArrows } from "react-motion-gallery/slider/arrows";
import { sliderDots } from "react-motion-gallery/slider/dots";
import { sliderRipple } from "react-motion-gallery/slider/ripple";
import { entriesLoadMore } from "react-motion-gallery/entries/load-more";
import { entriesVirtualization } from "react-motion-gallery/entries/virtualization";
import { useEntriesReady } from "react-motion-gallery/entries/ready";
import styles from "./entries-load-more-grid-demo.module.css";

export type ProductEntry = EntryItem & {
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

export type ProductEntryPage = {
  entries: ProductEntry[];
  total: number;
  skip: number;
  limit: number;
};

export type ProductEntriesGridViewProps = {
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

const PRODUCT_SELECT =
  "id,title,description,category,price,rating,stock,reviews,brand,thumbnail,images";
const PRODUCT_DATA_OFFSET = 5;
const INITIAL_ENTRY_SLOT_PREFIX = "product-grid-initial-slot";
const ENTRY_MEDIA_SLIDER_PLUGINS = [
  sliderRipple(),
  sliderArrows(),
  sliderDots(),
];
const FULLSCREEN_SLIDER_VIRTUALIZATION = {
  enabled: true,
  overscan: 3,
  threshold: 12,
};
const ENTRIES_VIRTUALIZATION = {
  layout: "grid" as const,
  estimateSize: 540,
  gap: 18,
  overscan: 1,
};
const PRODUCT_SKELETON_SHIMMER_MS = 1200;
const productSkeletonShimmerEpoch =
  typeof performance === "undefined" ? 0 : performance.now();
const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export const PAGE_SIZE = 6;
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

export async function fetchEntriesProductPage(args: {
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

function getInitialEntrySlotKey(index: number) {
  return \`\${INITIAL_ENTRY_SLOT_PREFIX}-\${index}\`;
}

function createProductPlaceholderEntries(count: number): ProductEntry[] {
  return Array.from({ length: count }, (_, index) => ({
    key: getInitialEntrySlotKey(index),
    id: \`product-grid-placeholder-\${index}\`,
    section: "Loading",
    title: "Loading product",
    body: "Loading product details.",
    brand: "Loading",
    price: 0,
    rating: 0,
    stock: 0,
    reviewCount: 0,
    revealKey: \`product-grid-placeholder-\${index}\`,
    media: [],
  }));
}

function isProductPlaceholderEntry(entry: ProductEntry) {
  return entry.id.startsWith("product-grid-placeholder-");
}

const PRODUCT_GRID_SKELETON_CATEGORY_WIDTHS = ["64px", "74px", "58px", "82px"];
const PRODUCT_GRID_SKELETON_TITLE_WIDTHS = ["82%", "92%", "68%", "76%"];
const PRODUCT_GRID_SKELETON_STOCK_WIDTHS = ["76px", "88px", "94px", "82px"];
type ProductSkeletonRectStyle = Extract<
  SkeletonNode,
  { kind: "rect" | "square" | "circle" }
>["style"];

function productSkeletonRect(
  style: ProductSkeletonRectStyle = {},
): SkeletonNode {
  return {
    kind: "rect",
    style: {
      flex: "0 0 auto",
      backgroundColor: "#dde7ee",
      borderRadius: 999,
      overflow: "hidden",
      ...style,
    },
  };
}

function createProductGridSkeletonLayout(entryIndex: number): SkeletonNode {
  const categoryWidth =
    PRODUCT_GRID_SKELETON_CATEGORY_WIDTHS[
      entryIndex % PRODUCT_GRID_SKELETON_CATEGORY_WIDTHS.length
    ]!;
  const titleWidth =
    PRODUCT_GRID_SKELETON_TITLE_WIDTHS[
      entryIndex % PRODUCT_GRID_SKELETON_TITLE_WIDTHS.length
    ]!;
  const stockWidth =
    PRODUCT_GRID_SKELETON_STOCK_WIDTHS[
      entryIndex % PRODUCT_GRID_SKELETON_STOCK_WIDTHS.length
    ]!;

  return {
    kind: "col",
    style: {
      width: "100%",
      height: "100%",
      minHeight: "100%",
    },
    children: [
      productSkeletonRect({
        width: "100%",
        height: "auto",
        aspectRatio: "var(--product-image-aspect-ratio)",
        backgroundColor: "#edf3f7",
        borderRadius: 0,
      }),
      {
        kind: "col",
        style: {
          flex: "1 1 auto",
          width: "100%",
          alignItems: "flex-start",
          gap: 10,
          minHeight: "var(--entries-data-grid-copy-min-height)",
          padding: 14,
          boxSizing: "border-box",
        },
        children: [
          productSkeletonRect({ width: categoryWidth, height: 12 }),
          productSkeletonRect({ width: titleWidth, height: 18 }),
          {
            kind: "row",
            style: { alignItems: "center", gap: 8 },
            children: [
              productSkeletonRect({ width: 82, height: 12 }),
              productSkeletonRect({ width: 62, height: 12 }),
            ],
          },
          productSkeletonRect({ width: 72, height: 16 }),
          {
            kind: "row",
            style: {
              alignItems: "center",
              gap: 6,
              minHeight: 28,
              marginTop: "auto",
              padding: "0 9px",
              borderRadius: 999,
              backgroundColor: "#eef5f8",
            },
            children: [
              productSkeletonRect({
                width: 7,
                height: 7,
                backgroundColor: "#bdd0dc",
              }),
              productSkeletonRect({ width: stockWidth, height: 10 }),
            ],
          },
        ],
      },
    ],
  };
}

function ProductSkeletonCard({ entryIndex }: { entryIndex: number }) {
  const skeletonRef = useRef<HTMLElement | null>(null);
  const layout = createProductGridSkeletonLayout(entryIndex);

  useIsoLayoutEffect(() => {
    const node = skeletonRef.current;
    if (!node || typeof performance === "undefined") return;

    const elapsed = performance.now() - productSkeletonShimmerEpoch;
    const phase = elapsed % PRODUCT_SKELETON_SHIMMER_MS;
    node.style.setProperty(
      "--product-skeleton-animation-delay",
      \`-\${phase}ms\`,
    );
  }, []);

  return (
    <article ref={skeletonRef} className={styles.skeletonCard}>
      <Skeleton
        className={styles.skeletonLayout}
        layout={layout}
        disableShimmer
      />
    </article>
  );
}
function stockLabel(stock: number) {
  if (stock <= 24) return \`Only \${stock} left\`;
  if (stock <= 72) return \`\${stock} in stock\`;
  return "Ready to ship";
}

function stockClassName(stock: number) {
  if (stock <= 24) return styles.stockLow;
  if (stock <= 72) return styles.stockMedium;
  return styles.stockHigh;
}

function productImageStyle(product: ProductEntry) {
  const image = product.media?.find((item) => item.kind === "image");

  if (!image || image.kind !== "image" || !image.width || !image.height) {
    return undefined;
  }

  return {
    "--product-image-aspect-ratio":
      String(image.width) + " / " + String(image.height),
  } as CSSProperties;
}

function ProductCard({ entry, media }: EntryCardRenderArgs) {
  const product = entry as ProductEntry;
  if (isProductPlaceholderEntry(product)) return null;

  return (
    <article className={styles.card} style={productImageStyle(product)}>
      <div className={styles.media}>{media}</div>
      <div className={styles.copy}>
        <span className={styles.category}>{product.section}</span>
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
        <span
          className={[styles.stockBadge, stockClassName(product.stock)].join(
            " ",
          )}
        >
          <span className={styles.stockDot} aria-hidden="true" />
          {stockLabel(product.stock)}
        </span>
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
    plugins: [
      fullscreenSlider({ virtualization: FULLSCREEN_SLIDER_VIRTUALIZATION }),
      fullscreenZoomPan(),
    ],
    fullscreen: {
      enabled: true,
      closeScroll: true,
    },
  });

  return <>{fullscreenNode}</>;
}

function PendingSkeletonGrid({
  count,
  startIndex,
}: {
  count: number;
  startIndex: number;
}) {
  if (count <= 0) return null;

  return (
    <div className={styles.pendingSkeletonGrid} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={\`pending-entry-grid-skeleton-\${startIndex + index}\`}
          className={styles.pendingSkeletonItem}
        >
          <ProductSkeletonCard entryIndex={startIndex + index} />
        </div>
      ))}
    </div>
  );
}

export function ProductEntriesGridView({
  entries,
  plugins,
  entriesRef,
  busy,
  ready,
  total,
  status,
  controls,
  footer,
  placeholderCount = PAGE_SIZE,
  pendingAppendCount = 0,
}: ProductEntriesGridViewProps) {
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
            layout: "grid",
            items: displayEntries,
            mediaLayout: "slider",
            plugins,
            overlay: {
              overlayCrossfadeTarget: "content",
            },
            loading: {
              enabled: true,
              waitForMedia: true,
              force: isInitialBusy ? true : undefined,
              skeletonWrap: {
                className: styles.skeletonWrap,
              },
              minHeight: "var(--entries-data-grid-row-min-height)",
            },
            render: {
              card: ProductCard,
              media: ProductMedia,
              overlay: ProductOverlay,
              skeleton: ({ entryIndex }) => (
                <ProductSkeletonCard entryIndex={entryIndex} />
              ),
            },
            entryRow: {
              className: styles.entryGridRow,
            },
          }}
          fullscreen={{ enabled: true }}
          renderMediaContainer={renderMediaContainer}
        />
        <PendingSkeletonGrid
          count={pendingAppendCount}
          startIndex={entries.length}
        />
        <FullscreenAddon />
      </GalleryCore>

      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </section>
  );
}

export function EntriesLoadMoreGridDemo() {
  const [entries, setEntries] = useState<ProductEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingAppendCount, setPendingAppendCount] = useState(0);
  const requestRef = useRef<AbortController | null>(null);
  const entriesReady = useEntriesReady({ dataReady: !loading && !error });

  const loadNext = useCallback(
    (mode: "replace" | "append" = "append") => {
      if (requestRef.current) requestRef.current.abort();

      const ac = new AbortController();
      requestRef.current = ac;
      setLoading(true);
      setError(null);

      const skip = mode === "replace" ? 0 : entries.length;
      setPendingAppendCount(
        mode === "append" && entries.length > 0
          ? total > 0
            ? Math.min(PAGE_SIZE, Math.max(0, total - skip))
            : PAGE_SIZE
          : 0,
      );

      fetchEntriesProductPage({ limit: PAGE_SIZE, skip, signal: ac.signal })
        .then((page) => {
          setTotal(page.total);
          setPendingAppendCount(0);
          setEntries((prev) =>
            mode === "replace" ? page.entries : [...prev, ...page.entries],
          );
        })
        .catch((reason) => {
          if (ac.signal.aborted) return;
          setPendingAppendCount(0);
          setError(
            reason instanceof Error
              ? reason.message
              : "Unable to load products",
          );
        })
        .finally(() => {
          if (!ac.signal.aborted) {
            setLoading(false);
            requestRef.current = null;
          }
        });
    },
    [entries.length, total],
  );

  useEffect(() => {
    loadNext("replace");
    return () => requestRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasMore = total === 0 || entries.length < total;

  return (
    <ProductEntriesGridView
      entries={entries}
      entriesRef={entriesReady.ref}
      plugins={[
        entriesLoadMore({
          mode: "server",
          visibleCount: entries.length,
          total,
          loading,
        }),
        entriesVirtualization(ENTRIES_VIRTUALIZATION),
      ]}
      busy={loading}
      ready={entriesReady.ready}
      total={total}
      pendingAppendCount={pendingAppendCount}
      status={
        error ? (
          <>
            <span>{error}</span>
            <button
              type="button"
              onClick={() =>
                loadNext(entries.length === 0 ? "replace" : "append")
              }
            >
              Retry
            </button>
          </>
        ) : null
      }
      footer={
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => loadNext("append")}
          disabled={loading || !hasMore}
          aria-label={loading ? "Loading products" : undefined}
        >
          {loading ? (
            <span className={styles.buttonSpinner} aria-hidden="true" />
          ) : hasMore ? (
            "Load more"
          ) : (
            "All loaded"
          )}
        </button>
      }
    />
  );
}
`;
