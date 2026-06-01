/* eslint-disable @next/next/no-img-element */
"use client";

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { GalleryCore } from "react-motion-gallery/core";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import {
  Grid,
  type GridLoadingOptions,
  type GridHandle,
} from "react-motion-gallery/grid";
import { gridFullscreen } from "react-motion-gallery/grid/fullscreen";
import { gridVirtualization } from "react-motion-gallery/grid/virtualization";
import { RatingStars } from "react-motion-gallery/rating-stars";
import styles from "./grid-virtualization-demo.module.css";

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

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});
const PRODUCT_COUNT = 60;
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
const PRODUCT_SKELETON_SHIMMER_MS = 1200;
const productSkeletonShimmerEpoch =
  typeof performance === "undefined" ? 0 : performance.now();
const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;
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

function productImage(product: Product) {
  return (
    product.images[0] ?? {
      src: "",
      alt: product.title,
      width: 900,
      height: 900,
    }
  );
}
function productImageStyle(image: ProductImage) {
  return {
    "--product-image-aspect-ratio":
      String(image.width) + " / " + String(image.height),
  } as CSSProperties;
}
function createPlaceholderProducts(count: number, startIndex = 0): Product[] {
  return Array.from({ length: count }, (_, index) => {
    const slotIndex = startIndex + index;
    return {
      key: "product-placeholder-slot-" + String(slotIndex),
      id: "product-placeholder-" + String(slotIndex),
      section: "Loading",
      title: "Loading product",
      body: "Loading product details.",
      brand: "Loading",
      price: 0,
      rating: 0,
      stock: 0,
      reviewCount: 0,
      revealKey: "product-placeholder-" + String(slotIndex),
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
      className={[styles.card, styles.gridCard].join(" ")}
      style={productImageStyle(image)}
    >
      <div className={styles.imageFrame}>
        {image.src ? (
          <img
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            className={styles.image}
            loading={index < 8 ? "eager" : "lazy"}
            decoding="async"
          />
        ) : null}
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
}: {
  index: number;
  ariaHidden?: boolean;
}) {
  const skeletonRef = useRef<HTMLElement | null>(null);
  useIsoLayoutEffect(() => {
    const node = skeletonRef.current;
    if (!node || typeof performance === "undefined") return;

    const elapsed = performance.now() - productSkeletonShimmerEpoch;
    const phase = elapsed % PRODUCT_SKELETON_SHIMMER_MS;
    node.style.setProperty(
      "--product-skeleton-animation-delay",
      "-" + String(phase) + "ms",
    );
  }, []);

  return (
    <article
      ref={skeletonRef}
      aria-hidden={ariaHidden ? true : undefined}
      className={[styles.skeletonCard, styles.skeletonGridCard].join(" ")}
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
    '[data-rmg-grid-virtual-spacer="' + placement + '"]',
  );
  return spacer ? Math.round(spacer.getBoundingClientRect().height) : 0;
}
function columnCount(root: HTMLElement) {
  const template = window.getComputedStyle(root).gridTemplateColumns.trim();
  if (!template || template === "none") return 1;
  return Math.max(1, template.split(/\s+/).filter(Boolean).length);
}
function readVirtualWindowMetrics(root: HTMLElement): VirtualWindowMetrics {
  const columns = columnCount(root);
  const rowIndexes: number[] = [];
  const items = Array.from(
    root.querySelectorAll<HTMLElement>("[data-rmg-idx]"),
  );
  items.forEach((item) => {
    const value = Number(item.getAttribute("data-rmg-idx"));
    if (Number.isFinite(value)) rowIndexes.push(Math.floor(value / columns));
  });
  rowIndexes.sort((a, b) => a - b);
  return {
    firstRow: rowIndexes[0] ?? null,
    lastRow: rowIndexes[rowIndexes.length - 1] ?? null,
    mountedCount: items.length,
    topSpacer: readSpacerHeight(root, "top"),
    bottomSpacer: readSpacerHeight(root, "bottom"),
  };
}
function useVirtualWindowMetrics(handle: GridHandle | null) {
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
function rowRange(metrics: VirtualWindowMetrics) {
  if (
    metrics.firstRow == null ||
    metrics.lastRow == null ||
    metrics.mountedCount === 0
  )
    return "no rows";
  const first = metrics.firstRow + 1;
  const last = metrics.lastRow + 1;
  return first === last
    ? "row " + String(first)
    : "rows " + String(first) + "-" + String(last);
}
function VirtualizationMeter({
  handle,
  loadedCount,
}: {
  handle: GridHandle | null;
  loadedCount: number;
}) {
  const metrics = useVirtualWindowMetrics(handle);
  return (
    <div className={styles.virtualizationMeter}>
      <span className={styles.virtualizationMeterPrimary}>
        Mounted now {rowRange(metrics)} · {metrics.mountedCount} DOM cards ·{" "}
        {loadedCount} loaded
      </span>
      <span className={styles.virtualizationMeterSecondary}>
        Spacers {numberFormatter.format(metrics.topSpacer)}px top ·{" "}
        {numberFormatter.format(metrics.bottomSpacer)}px bottom
      </span>
    </div>
  );
}
export function GridVirtualizationDemo() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [handle, setHandle] = useState<GridHandle | null>(null);
  const isInitialBusy = loading && products.length === 0;
  const loadingOptions = useMemo<GridLoadingOptions>(
    () => ({
      active: isInitialBusy,
      count: PRODUCT_COUNT,
      animate: true,
      waitForMedia: true,
      force: isInitialBusy ? true : undefined,
      rootMargin: "0px",
      threshold: 0,
      timing: { enterMs: 360 },
      keepSkeletonMounted: true,
      rememberRevealed: true,
      skeleton: ({ index }) => <ProductSkeleton index={index} />,
    }),
    [isInitialBusy],
  );
  const plugin = useMemo(
    () => gridVirtualization({ estimateSize: 600, gap: 18, overscan: 2 }),
    [],
  );
  useEffect(() => {
    const ac = new AbortController();
    const timeout = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      fetchProducts({ limit: PRODUCT_COUNT, skip: 0, signal: ac.signal })
        .then((page) => {
          setProducts(page.products);
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
  const displayProducts = isInitialBusy
    ? createPlaceholderProducts(PRODUCT_COUNT)
    : products;
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
        <GalleryCore layout="grid" fullscreenItems={fullscreenItems(products)}>
          <Grid
            ref={setHandle}
            columns={{ 0: 1, 640: 2, 1060: 3 }}
            gap={{ 0: 12, 900: 18 }}
            plugins={[plugin, gridFullscreen()]}
            rootClassName={styles.productRoot}
            loading={loadingOptions}
            reveal={revealOptions}
          >
            {displayProducts.map((product, index) => (
              <Grid.Item
                key={productKey(product, index)}
                revealKey={productRevealKey(product)}
              >
                {isPlaceholderProduct(product) ? (
                  <ProductSkeleton ariaHidden index={index} />
                ) : (
                  <ProductCard product={product} index={index} />
                )}
              </Grid.Item>
            ))}
          </Grid>
          <FullscreenAddon />
        </GalleryCore>
      )}
    </section>
  );
}
