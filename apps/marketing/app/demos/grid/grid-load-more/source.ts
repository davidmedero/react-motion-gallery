export const source = String.raw`/* eslint-disable @next/next/no-img-element */
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
  type GridPlugin,
} from "react-motion-gallery/grid";
import { gridFullscreen } from "react-motion-gallery/grid/fullscreen";
import { gridLoadMore } from "react-motion-gallery/grid/load-more";
import { RatingStars } from "react-motion-gallery/rating-stars";
import styles from "./grid-load-more-demo.module.css";

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

const PAGE_SIZE = 6;
const INITIAL_PRODUCT_SLOT_PREFIX = "product-initial-slot";
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
function getInitialProductSlotKey(index: number) {
  return INITIAL_PRODUCT_SLOT_PREFIX + "-" + String(index);
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
function GridGallery({
  products,
  loadingOptions,
  plugins,
}: {
  products: Product[];
  loadingOptions: GridLoadingOptions;
  plugins: GridPlugin[];
}) {
  return (
    <GalleryCore layout="grid" fullscreenItems={fullscreenItems(products)}>
      <Grid
        columns={{ 0: 1, 640: 2, 1060: 3 }}
        gap={{ 0: 12, 900: 18 }}
        plugins={plugins}
        rootClassName={styles.productRoot}
        loading={loadingOptions}
        reveal={revealOptions}
      >
        {products.map((product, index) => {
          const key = productKey(product, index);
          const placeholder = isPlaceholderProduct(product);
          return (
            <Grid.Item
              key={key}
              revealKey={productRevealKey(product)}
            >
              {placeholder ? (
                <ProductSkeleton ariaHidden index={index} />
              ) : (
                <ProductCard product={product} index={index} />
              )}
            </Grid.Item>
          );
        })}
      </Grid>
      <FullscreenAddon />
    </GalleryCore>
  );
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
        <ProductSkeleton
          key={"pending-product-skeleton-" + String(startIndex + index)}
          ariaHidden
          index={startIndex + index}
        />
      ))}
    </div>
  );
}

export function GridLoadMoreDemo() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [useInitialSlots] = useState(() => loading && products.length === 0);
  const requestRef = useRef<AbortController | null>(null);
  const lengthRef = useRef(0);
  useEffect(() => {
    lengthRef.current = products.length;
  }, [products.length]);
  const isInitialBusy = loading && products.length === 0;
  const loadingOptions = useMemo<GridLoadingOptions>(
    () => ({
      active: isInitialBusy,
      count: PAGE_SIZE,
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
  const loadNext = useCallback(
    (mode: "replace" | "append" = "append") => {
      if (requestRef.current) {
        if (mode === "append") return;
        requestRef.current.abort();
      }
      const skip = mode === "replace" ? 0 : lengthRef.current;
      if (mode === "append" && total > 0 && skip >= total) return;
      const ac = new AbortController();
      requestRef.current = ac;
      setLoading(true);
      setError(null);
      setPendingCount(
        mode === "append" && skip > 0
          ? Math.max(
              0,
              Math.min(PAGE_SIZE, total > 0 ? total - skip : PAGE_SIZE),
            )
          : 0,
      );
      fetchProducts({ limit: PAGE_SIZE, skip, signal: ac.signal })
        .then((page) => {
          if (ac.signal.aborted || requestRef.current !== ac) return;
          setTotal(page.total);
          setPendingCount(0);
          setProducts((current) =>
            mode === "replace" ? page.products : [...current, ...page.products],
          );
        })
        .catch((reason) => {
          if (ac.signal.aborted || requestRef.current !== ac) return;
          setPendingCount(0);
          setError(
            reason instanceof Error
              ? reason.message
              : "Unable to load products",
          );
        })
        .finally(() => {
          if (!ac.signal.aborted && requestRef.current === ac) {
            setLoading(false);
            requestRef.current = null;
          }
        });
    },
    [total],
  );
  useEffect(() => {
    const timeout = window.setTimeout(() => loadNext("replace"), 0);
    return () => {
      window.clearTimeout(timeout);
      requestRef.current?.abort();
    };
  }, [loadNext]);
  const hasMore = total === 0 || products.length < total;
  const plugin = useMemo(
    () =>
      gridLoadMore({
        mode: "server",
        visibleCount: products.length,
        total,
        loading,
      }),
    [loading, products.length, total],
  );
  const plugins = useMemo(() => [plugin, gridFullscreen()], [plugin]);
  const retry = useCallback(
    () => loadNext(products.length === 0 ? "replace" : "append"),
    [loadNext, products.length],
  );
  const displayProducts = useMemo(() => {
    if (isInitialBusy) {
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
  }, [isInitialBusy, products, useInitialSlots]);
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
      {error ? <p className={styles.error}>{error}</p> : null}
      {error && products.length === 0 ? null : (
        <GridGallery
          products={displayProducts}
          loadingOptions={loadingOptions}
          plugins={plugins}
        />
      )}
      <PendingSkeletonGrid count={pendingCount} startIndex={products.length} />
      <div className={styles.footer}>
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
      </div>
    </section>
  );
}
`;
