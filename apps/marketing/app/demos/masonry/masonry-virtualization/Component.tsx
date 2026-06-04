/* eslint-disable @next/next/no-img-element */
"use client";

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { GalleryCore } from "react-motion-gallery/core";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import {
  Masonry,
  type MasonryLoadingOptions,
  type MasonryHandle,
} from "react-motion-gallery/masonry";
import { masonryFullscreen } from "react-motion-gallery/masonry/fullscreen";
import { masonryVirtualization } from "react-motion-gallery/masonry/virtualization";
import { RatingStars } from "react-motion-gallery/rating-stars";
import styles from "./masonry-virtualization-demo.module.css";

type ProductImage = { src: string; alt: string; width: number; height: number };
type Product = {
  key?: string;
  revealKey?: string;
  id: string;
  section: string;
  title: string;
  body: string;
  brand: string;
  price: number;
  rating: number;
  stock: number;
  reviewCount: number;
  images: ProductImage[];
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
type ProductPage = {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
};
const PRODUCT_SELECT =
  "id,title,description,category,price,rating,stock,reviews,brand,thumbnail,images";
const PRODUCT_DATA_OFFSET = 5;
function productImages(product: DummyProduct): ProductImage[] {
  const urls = [
    ...(product.images ?? []),
    ...(product.thumbnail ? [product.thumbnail] : []),
  ].filter(Boolean);
  return Array.from(new Set(urls))
    .slice(0, 4)
    .map((src, index) => ({
      src,
      alt: product.title + " image " + String(index + 1),
      width: 900,
      height: 900,
    }));
}
function productReviewCount(product: DummyProduct) {
  const listedReviews = product.reviews?.length ?? 0;
  const estimatedCount = Math.round(
    product.rating * 100 + product.stock * 7 + product.id * 17,
  );
  return Math.max(listedReviews, estimatedCount);
}
function mapProduct(product: DummyProduct): Product {
  return {
    id: "product-" + String(product.id),
    section: product.category.replaceAll("-", " "),
    title: product.title,
    body: product.description,
    brand: product.brand ?? "Unbranded",
    price: product.price,
    rating: product.rating,
    stock: product.stock,
    reviewCount: productReviewCount(product),
    images: productImages(product),
  };
}
async function fetchProducts(args: {
  limit: number;
  skip: number;
  signal?: AbortSignal;
}): Promise<ProductPage> {
  const url = new URL("https://dummyjson.com/products");
  url.searchParams.set("limit", String(args.limit));
  url.searchParams.set("skip", String(args.skip + PRODUCT_DATA_OFFSET));
  url.searchParams.set("delay", "650");
  url.searchParams.set("select", PRODUCT_SELECT);
  const response = await fetch(url, { signal: args.signal });
  if (!response.ok)
    throw new Error("DummyJSON request failed with " + String(response.status));
  const payload = (await response.json()) as DummyProductsResponse;
  return {
    products: payload.products.map(mapProduct),
    total: Math.max(0, payload.total - PRODUCT_DATA_OFFSET),
    skip: Math.max(0, payload.skip - PRODUCT_DATA_OFFSET),
    limit: payload.limit,
  };
}

const PAGE_SIZE = 60;
const INITIAL_PRODUCT_SLOT_PREFIX = "product-initial-slot";
const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});
const PRODUCT_SKELETON_CATEGORY_WIDTHS = [
  "68%",
  "62%",
  "54%",
  "70%",
  "58%",
  "64%",
];
const PRODUCT_SKELETON_TITLE_WIDTHS = [
  "74%",
  "86%",
  "48%",
  "72%",
  "70%",
  "78%",
];
const PRODUCT_SKELETON_STOCK_WIDTHS = [
  "74px",
  "70px",
  "88px",
  "68px",
  "88px",
  "88px",
];
const revealOptions = {
  durationMs: 700,
  easing: "cubic-bezier(.2,.7,.2,1)",
  staggerMs: 200,
  staggerLimit: 6,
};
function stockLabel(stock: number) {
  if (stock <= 24) return "Only " + String(stock) + " left";
  if (stock <= 72) return String(stock) + " in stock";
  return "Ready to ship";
}
function stockClassName(stock: number) {
  if (stock <= 24) return styles.stockLow;
  if (stock <= 72) return styles.stockMedium;
  return styles.stockHigh;
}
function FullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
    plugins: [fullscreenSlider(), fullscreenZoomPan()],
    fullscreen: { enabled: true, closeScroll: true },
  });
  return <>{fullscreenNode}</>;
}

const GENERATED_IMAGE_SIZES = [
  { width: 900, height: 1220, color: "d7e4f2" },
  { width: 900, height: 760, color: "e7d8ef" },
  { width: 900, height: 1380, color: "d7eee7" },
  { width: 900, height: 980, color: "f0e4cc" },
  { width: 900, height: 1520, color: "d8edf4" },
  { width: 900, height: 1120, color: "eadfe0" },
] as const;
const CARD_CHROME_HEIGHT = 250;
function stableProductNumber(product: Product) {
  const match = product.id.match(/\d+/);
  if (match) return Number(match[0]);
  return Array.from(product.id).reduce(
    (total, char) => total + char.charCodeAt(0),
    0,
  );
}
function generatedImageSpec(index: number) {
  return GENERATED_IMAGE_SIZES[Math.abs(index) % GENERATED_IMAGE_SIZES.length]!;
}
function productImage(product: Product) {
  const spec = generatedImageSpec(stableProductNumber(product));
  return {
    src:
      "https://dummyjson.com/image/" +
      String(spec.width) +
      "x" +
      String(spec.height) +
      "/" +
      spec.color +
      "/" +
      spec.color +
      "?type=webp&text=",
    alt: product.title,
    width: spec.width,
    height: spec.height,
  };
}
function productImageStyle(image: { width: number; height: number }) {
  return {
    "--product-image-aspect-ratio":
      String(image.width) + " / " + String(image.height),
  } as CSSProperties;
}
function skeletonImageStyle(index: number) {
  return productImageStyle(generatedImageSpec(index));
}
function getInitialProductSlotKey(index: number) {
  return INITIAL_PRODUCT_SLOT_PREFIX + "-" + String(index);
}
function getProductSlotKey(index: number) {
  return "product-slot-" + String(index);
}
function slotProducts(products: Product[]) {
  return products.map((product, index) => ({
    ...product,
    key: getProductSlotKey(index),
    revealKey: product.id,
  }));
}
function createPlaceholderProducts(
  count: number,
  startIndex = 0,
  keyForSlot?: (slotIndex: number) => string,
): Product[] {
  return Array.from({ length: count }, (_, index) => {
    const slotIndex = startIndex + index;
    const slotKey =
      keyForSlot?.(slotIndex) ?? "product-placeholder-slot-" + String(slotIndex);
    return {
      key: slotKey,
      id: "product-placeholder-" + String(slotIndex),
      section: "Loading",
      title: "Loading product",
      body: "Loading product details.",
      brand: "Loading",
      price: 0,
      rating: 0,
      stock: 0,
      reviewCount: 0,
      revealKey: slotKey,
      images: [],
    };
  });
}
function isPlaceholderProduct(product: Product) {
  return product.id.startsWith("product-placeholder-");
}
function ProductCard({ product, index }: { product: Product; index: number }) {
  const image = productImage(product);
  return (
    <article
      className={[styles.card, styles.masonryCard].join(" ")}
      style={productImageStyle(image)}
    >
      <div className={styles.imageFrame}>
        <img
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className={styles.image}
          loading={index < 8 ? "eager" : "lazy"}
          decoding="async"
        />
      </div>
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
        <strong className={styles.price}>
          {"$" + product.price.toFixed(2)}
        </strong>
        <span
          className={[styles.stockBadge, stockClassName(product.stock)].join(
            " ",
          )}
          aria-label={String(product.stock) + " units in stock"}
        >
          <span className={styles.stockDot} aria-hidden="true" />
          {stockLabel(product.stock)}
        </span>
      </div>
      <button
        type="button"
        className={styles.actionButton}
        data-rmg-fullscreen-trigger
      >
        View Item
      </button>
    </article>
  );
}
function ProductSkeleton({
  index,
  ariaHidden,
  shimmer = true,
}: {
  index: number;
  ariaHidden?: boolean;
  shimmer?: boolean;
}) {
  return (
    <article
      aria-hidden={ariaHidden ? true : undefined}
      className={[
        styles.skeletonCard,
        styles.skeletonMasonryCard,
        shimmer ? "" : styles.skeletonSpacerCard,
      ]
        .filter(Boolean)
        .join(" ")}
      style={skeletonImageStyle(index)}
    >
      <div className={styles.skeletonImage} />
      <div className={styles.skeletonCopy}>
        <span
          className={[styles.skeletonBlock, styles.skeletonCategory].join(" ")}
          style={{
            width:
              PRODUCT_SKELETON_CATEGORY_WIDTHS[
                index % PRODUCT_SKELETON_CATEGORY_WIDTHS.length
              ],
          }}
        />
        <span
          className={[styles.skeletonBlock, styles.skeletonTitle].join(" ")}
          style={{
            width:
              PRODUCT_SKELETON_TITLE_WIDTHS[
                index % PRODUCT_SKELETON_TITLE_WIDTHS.length
              ],
          }}
        />
        <span className={styles.skeletonRating}>
          <span
            className={[styles.skeletonBlock, styles.skeletonStars].join(" ")}
          />
          <span
            className={[styles.skeletonBlock, styles.skeletonRatingLabel].join(
              " ",
            )}
          />
        </span>
        <span
          className={[styles.skeletonBlock, styles.skeletonPrice].join(" ")}
        />
        <span className={styles.skeletonStockBadge}>
          <span className={styles.skeletonStockDot} aria-hidden="true" />
          <span
            className={[styles.skeletonBlock, styles.skeletonStockLabel].join(
              " ",
            )}
            style={{
              width:
                PRODUCT_SKELETON_STOCK_WIDTHS[
                  index % PRODUCT_SKELETON_STOCK_WIDTHS.length
                ],
            }}
          />
        </span>
      </div>
      <span
        className={[styles.skeletonBlock, styles.skeletonAction].join(" ")}
      />
    </article>
  );
}
function productKey(product: Product, index: number) {
  return product.key ?? product.id ?? "product-" + String(index);
}
function productRevealKey(product: Product) {
  return product.revealKey ?? product.id;
}
function fullscreenItems(products: Product[]) {
  return products
    .filter((product) => !isPlaceholderProduct(product))
    .map((product) => {
      const image = productImage(product);
      return {
        kind: "image" as const,
        src: image.src,
        alt: image.alt,
        caption: product.title,
        width: 1200,
        height: 1200,
      };
    });
}
function Status({
  loading,
  error,
  count,
  total,
  onRetry,
}: {
  loading: boolean;
  error: string | null;
  count: number;
  total?: number;
  onRetry: () => void;
}) {
  return (
    <div className={styles.status}>
      {error ? (
        <button type="button" onClick={onRetry}>
          Retry
        </button>
      ) : (
        <span>
          {loading ? "Loading" : "Ready"} / {count}
          {total && total > 0 ? " of " + String(total) : ""} items
        </span>
      )}
    </div>
  );
}
type VirtualWindowMetrics = {
  firstItem: number | null;
  lastItem: number | null;
  mountedCount: number;
  hiddenTop: number;
  hiddenBottom: number;
  canvasHeight: number;
};
const emptyVirtualMetrics: VirtualWindowMetrics = {
  firstItem: null,
  lastItem: null,
  mountedCount: 0,
  hiddenTop: 0,
  hiddenBottom: 0,
  canvasHeight: 0,
};
function readVirtualWindowMetrics(root: HTMLElement): VirtualWindowMetrics {
  const rootRect = root.getBoundingClientRect();
  const itemIndexes: number[] = [];
  let mountedTop = Number.POSITIVE_INFINITY;
  let mountedBottom = Number.NEGATIVE_INFINITY;
  const items = Array.from(root.children).filter(
    (item): item is HTMLElement =>
      item instanceof HTMLElement && item.hasAttribute("data-rmg-idx"),
  );
  items.forEach((item) => {
    const value = Number(item.getAttribute("data-rmg-idx"));
    if (Number.isFinite(value)) itemIndexes.push(value);
    const itemRect = item.getBoundingClientRect();
    mountedTop = Math.min(mountedTop, itemRect.top - rootRect.top);
    mountedBottom = Math.max(mountedBottom, itemRect.bottom - rootRect.top);
  });
  itemIndexes.sort((a, b) => a - b);
  const canvasHeight = Math.round(rootRect.height);
  const hasMountedItems = items.length > 0;
  return {
    firstItem: itemIndexes[0] ?? null,
    lastItem: itemIndexes[itemIndexes.length - 1] ?? null,
    mountedCount: items.length,
    hiddenTop: hasMountedItems ? Math.max(0, Math.round(mountedTop)) : 0,
    hiddenBottom: hasMountedItems
      ? Math.max(0, Math.round(canvasHeight - mountedBottom))
      : 0,
    canvasHeight,
  };
}
function useVirtualWindowMetrics(handle: MasonryHandle | null) {
  const [metrics, setMetrics] =
    useState<VirtualWindowMetrics>(emptyVirtualMetrics);
  useEffect(() => {
    const root = handle?.getRootNode();
    if (!root) {
      const timeout = window.setTimeout(
        () => setMetrics(emptyVirtualMetrics),
        0,
      );
      return () => window.clearTimeout(timeout);
    }
    let frame = 0;
    const read = () => {
      frame = 0;
      setMetrics(readVirtualWindowMetrics(root));
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(read);
    };
    const timeout = window.setTimeout(schedule, 0);
    const observer = new MutationObserver(schedule);
    observer.observe(root, {
      attributes: true,
      childList: true,
      subtree: true,
    });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.clearTimeout(timeout);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [handle]);
  return metrics;
}
function itemRange(metrics: VirtualWindowMetrics) {
  if (
    metrics.firstItem == null ||
    metrics.lastItem == null ||
    metrics.mountedCount === 0
  )
    return "no cards";
  const first = metrics.firstItem + 1;
  const last = metrics.lastItem + 1;
  return first === last
    ? "card " + String(first)
    : "cards " + String(first) + "-" + String(last);
}
function VirtualizationMeter({
  handle,
  loadedCount,
}: {
  handle: MasonryHandle | null;
  loadedCount: number;
}) {
  const metrics = useVirtualWindowMetrics(handle);
  return (
    <div className={styles.virtualizationMeter}>
      <span className={styles.virtualizationMeterPrimary}>
        Mounted now {itemRange(metrics)} · {metrics.mountedCount} DOM cards ·{" "}
        {loadedCount} loaded
      </span>
      <span className={styles.virtualizationMeterSecondary}>
        Canvas {numberFormatter.format(metrics.canvasHeight)}px · Hidden{" "}
        {numberFormatter.format(metrics.hiddenTop)}px top ·{" "}
        {numberFormatter.format(metrics.hiddenBottom)}px bottom
      </span>
    </div>
  );
}
export function MasonryVirtualizationDemo() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [handle, setHandle] = useState<MasonryHandle | null>(null);
  const [useInitialSlots] = useState(() => loading && products.length === 0);
  const loadingOptions = useMemo<MasonryLoadingOptions>(
    () => ({
      active: false,
      count: 0,
      animate: true,
      waitForMedia: true,
      rootMargin: "0px",
      threshold: 0,
      timing: { minVisibleMs: 0 },
      keepSkeletonMounted: true,
      rememberRevealed: true,
      skeleton: ({ index }) => <ProductSkeleton index={index} />,
    }),
    [],
  );
  const plugin = useMemo(
    () => masonryVirtualization({ estimateSize: 920, gap: 18, overscan: 1 }),
    [],
  );
  useEffect(() => {
    const ac = new AbortController();
    const timeout = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      fetchProducts({ limit: PAGE_SIZE, skip: 0, signal: ac.signal })
        .then((page) => {
          setProducts(slotProducts(page.products));
          setTotal(page.total);
        })
        .catch((reason) => {
          if (ac.signal.aborted) return;
          setError(
            reason instanceof Error
              ? reason.message
              : "Unable to load products",
          );
        })
        .finally(() => {
          if (!ac.signal.aborted) setLoading(false);
        });
    });
    return () => {
      window.clearTimeout(timeout);
      ac.abort();
    };
  }, [retryKey]);
  const displayProducts = useMemo(() => {
    if (loading && products.length === 0) {
      return createPlaceholderProducts(PAGE_SIZE, 0, getInitialProductSlotKey);
    }

    if (!useInitialSlots) return products;

    return products.map((product, index) =>
      index < PAGE_SIZE
        ? {
            ...product,
            key: getInitialProductSlotKey(index),
            revealKey: product.id,
          }
        : product,
    );
  }, [loading, products, useInitialSlots]);
  const retry = useCallback(() => setRetryKey((v) => v + 1), []);
  return (
    <section className={styles.shell}>
      <header className={styles.toolbar}>
        <Status
          loading={loading}
          error={error}
          count={products.length}
          total={total}
          onRetry={retry}
        />
      </header>
      <div className={styles.controls}>
        <VirtualizationMeter handle={handle} loadedCount={products.length} />
      </div>
      {error ? <p className={styles.error}>{error}</p> : null}
      {error && products.length === 0 ? null : (
        <GalleryCore
          layout="masonry"
          fullscreenItems={fullscreenItems(products)}
        >
          <Masonry
            ref={setHandle}
            columns={{ 0: 1, 640: 2, 1024: 3 }}
            gap={{ 0: 12, 900: 18 }}
            placement="balanced"
            plugins={[plugin, masonryFullscreen()] as never}
            classNames={{ root: styles.masonryRoot, item: styles.masonryItem }}
            loading={loadingOptions}
            reveal={revealOptions}
          >
            {displayProducts.map((product, index) => {
              const placeholder = isPlaceholderProduct(product);
              const image = productImage(product);
              return (
                <Masonry.Item
                  key={productKey(product, index)}
                  width={image.width}
                  height={image.height}
                  heightOffsetPx={CARD_CHROME_HEIGHT}
                  revealKey={productRevealKey(product)}
                  placeholder={placeholder}
                  className={placeholder ? styles.placeholderItem : undefined}
                >
                  {placeholder ? (
                    <ProductSkeleton ariaHidden index={index} shimmer={false} />
                  ) : (
                    <ProductCard product={product} index={index} />
                  )}
                </Masonry.Item>
              );
            })}
          </Masonry>
          <FullscreenAddon />
        </GalleryCore>
      )}
    </section>
  );
}
