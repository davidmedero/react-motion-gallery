/* eslint-disable @next/next/no-img-element */
"use client";

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { GalleryCore } from "react-motion-gallery/core";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import {
  Masonry,
  type MasonryLoadingOptions,
} from "react-motion-gallery/masonry";
import { masonryFullscreen } from "react-motion-gallery/masonry/fullscreen";
import {
  MasonryPaginationControls,
  useMasonryPagination,
} from "react-motion-gallery/masonry/pagination";
import { RatingStars } from "react-motion-gallery/rating-stars";
import {
  Skeleton,
  type SkeletonBaseStyle,
  type SkeletonNode,
} from "react-motion-gallery/skeleton/base";
import styles from "./masonry-pagination-demo.module.css";

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
const ITEMS_PER_PAGE_OPTIONS = [6, 9, 12];
function paginationCacheKey(pageSize: number, pageIndex: number) {
  return String(pageSize) + ":" + String(pageIndex);
}
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
const cachedRevealOptions = {
  ...revealOptions,
  staggerMs: 80,
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
function createPlaceholderProducts(count: number, startIndex = 0): Product[] {
  return Array.from({ length: count }, (_, index) => {
    const slotIndex = startIndex + index;
    return {
      key: getProductSlotKey(slotIndex),
      id: "product-placeholder-" + String(slotIndex),
      section: "Loading",
      title: "Loading product",
      body: "Loading product details.",
      brand: "Loading",
      price: 0,
      rating: 0,
      stock: 0,
      reviewCount: 0,
      revealKey: getProductSlotKey(slotIndex),
      images: [],
    };
  });
}
function isPlaceholderProduct(product: Product) {
  return product.id.startsWith("product-placeholder-");
}
function withPageSizePlaceholders(products: Product[], pageSize: number) {
  const visibleProducts = products.slice(0, pageSize);
  const missingCount = Math.max(0, pageSize - visibleProducts.length);
  if (missingCount === 0) return visibleProducts;

  return [
    ...visibleProducts,
    ...createPlaceholderProducts(missingCount, visibleProducts.length),
  ];
}
function withRevealVersion(products: Product[], revealVersion: number) {
  return products.map((product) =>
    isPlaceholderProduct(product)
      ? product
      : {
          ...product,
          revealKey:
            (product.revealKey ?? product.id) + ":" + String(revealVersion),
        },
  );
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
function skeletonBlockStyle(args: {
  width?: string;
  height: string;
  borderRadius: string | number;
  flex?: string;
}): SkeletonBaseStyle {
  return {
    width: args.width,
    height: args.height,
    borderRadius: args.borderRadius,
    backgroundColor: "#e4e9ec",
    flex: args.flex,
  };
}
function createProductSkeletonNode(index: number): SkeletonNode {
  const categoryWidth =
    PRODUCT_SKELETON_CATEGORY_WIDTHS[
      index % PRODUCT_SKELETON_CATEGORY_WIDTHS.length
    ];
  const titleWidth =
    PRODUCT_SKELETON_TITLE_WIDTHS[
      index % PRODUCT_SKELETON_TITLE_WIDTHS.length
    ];
  const stockWidth =
    PRODUCT_SKELETON_STOCK_WIDTHS[
      index % PRODUCT_SKELETON_STOCK_WIDTHS.length
    ];

  return {
    kind: "col",
    style: {
      width: "100%",
      height: "100%",
      minHeight: "100%",
      flex: "1 1 auto",
    },
    children: [
      {
        kind: "rect",
        style: {
          width: "100%",
          aspectRatio: "var(--product-image-aspect-ratio)",
          flex: "0 0 auto",
          overflow: "hidden",
          backgroundColor: "#e4e9ec",
          borderRadius: 0,
        },
      },
      {
        kind: "col",
        style: {
          flex: "0 0 auto",
          alignItems: "flex-start",
          gap: 8,
          minWidth: 0,
          minHeight: 194,
          padding: "14px 14px 22px",
          width: "100%",
        },
        children: [
          {
            kind: "rect",
            style: skeletonBlockStyle({
              width: categoryWidth,
              height: "calc(0.72rem * 1.2)",
              borderRadius: 999,
            }),
          },
          {
            kind: "rect",
            style: skeletonBlockStyle({
              width: titleWidth,
              height: "calc(1rem * 1.25)",
              borderRadius: 999,
            }),
          },
          {
            kind: "row",
            style: {
              alignItems: "center",
              gap: 8,
              minHeight: "calc(0.88rem * 1.2)",
            },
            children: [
              {
                kind: "rect",
                style: skeletonBlockStyle({
                  width: "86px",
                  height: "1rem",
                  borderRadius: 6,
                }),
              },
              {
                kind: "rect",
                style: skeletonBlockStyle({
                  width: "92px",
                  height: "calc(0.88rem * 1.2)",
                  borderRadius: 6,
                }),
              },
            ],
          },
          {
            kind: "rect",
            style: skeletonBlockStyle({
              width: "64px",
              height: "calc(1.14rem * 1.1)",
              borderRadius: 7,
            }),
          },
          {
            kind: "row",
            style: {
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              minHeight: 26,
              maxWidth: "100%",
              boxSizing: "border-box",
              padding: "0 9px",
              border: "1px solid var(--product-demo-line)",
              borderRadius: 999,
              backgroundColor: "rgba(var(--rmg-logo-cyan-rgb), 0.08)",
            },
            children: [
              {
                kind: "circle",
                style: {
                  width: 6,
                  height: 6,
                  flex: "0 0 auto",
                  backgroundColor: "rgba(var(--rmg-logo-blue-rgb), 0.22)",
                },
              },
              {
                kind: "rect",
                style: skeletonBlockStyle({
                  width: stockWidth,
                  height: "calc(0.74rem * 1)",
                  borderRadius: 999,
                }),
              },
            ],
          },
        ],
      },
      {
        kind: "row",
        style: {
          width: "calc(100% - 28px)",
          minHeight: 40,
          margin: "auto 14px 14px",
          border: "1px solid rgba(var(--rmg-logo-blue-rgb), 0.18)",
          borderRadius: 8,
          backgroundColor: "#e4e9ec",
        },
        children: [],
      },
    ],
  };
}

function ProductSkeleton({
  index,
  shimmer = true,
}: {
  index: number;
  shimmer?: boolean;
}) {
  return (
    <Skeleton
      className={[
        styles.skeletonCard,
        styles.skeletonMasonryCard,
        shimmer ? "" : styles.skeletonSpacerCard,
      ]
        .filter(Boolean)
        .join(" ")}
      style={skeletonImageStyle(index)}
      layout={createProductSkeletonNode(index)}
      disableShimmer
    />
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
function MasonryGallery({
  products,
  loadingOptions,
  plugins,
  reveal = revealOptions,
}: {
  products: Product[];
  loadingOptions: MasonryLoadingOptions;
  plugins: unknown[];
  reveal?: typeof revealOptions;
}) {
  return (
    <GalleryCore layout="masonry" fullscreenItems={fullscreenItems(products)}>
      <Masonry
        columns={{ 0: 1, 640: 2, 1024: 3 }}
        gap={{ 0: 12, 900: 18 }}
        placement="balanced"
        plugins={plugins as never}
        classNames={{ root: styles.masonryRoot, item: styles.masonryItem }}
        loading={loadingOptions}
        reveal={reveal}
      >
        {products.map((product, index) => {
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
                <ProductSkeleton index={index} shimmer={false} />
              ) : (
                <ProductCard product={product} index={index} />
              )}
            </Masonry.Item>
          );
        })}
      </Masonry>
      <FullscreenAddon />
    </GalleryCore>
  );
}

export function MasonryPaginationDemo() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [usingCachedPage, setUsingCachedPage] = useState(false);
  const [retainingPageSizeContent, setRetainingPageSizeContent] =
    useState(false);
  const [pageRevealVersion, setPageRevealVersion] = useState(0);
  const pageCacheRef = useRef(new Map<string, ProductPage>());
  const retainingPageSizeContentRef = useRef(retainingPageSizeContent);
  useEffect(() => {
    retainingPageSizeContentRef.current = retainingPageSizeContent;
  }, [retainingPageSizeContent]);
  const pagination = useMasonryPagination({
    mode: "server",
    initialPageSize: PAGE_SIZE,
    total,
    loading,
    urlSync: { param: "masonryPage" },
  });
  const loadingOptions = useMemo<MasonryLoadingOptions>(
    () => ({
      enabled: !retainingPageSizeContent,
      active: loading && products.length > 0 && !retainingPageSizeContent,
      count: 0,
      force:
        loading && products.length > 0 && !retainingPageSizeContent
          ? { enabled: true, showContent: true, skeletonOpacity: 1 }
          : undefined,
      animate: true,
      waitForMedia: true,
      rootMargin: "0px",
      threshold: 0,
      timing: { enterMs: 360, minVisibleMs: 0 },
      keepSkeletonMounted: !retainingPageSizeContent,
      rememberRevealed: true,
      skeleton: retainingPageSizeContent
        ? undefined
        : ({ index }) => <ProductSkeleton index={index} />,
    }),
    [loading, products.length, retainingPageSizeContent],
  );
  useEffect(() => {
    const cacheKey = paginationCacheKey(
      pagination.pageSize,
      pagination.pageIndex,
    );
    const cachedPage = pageCacheRef.current.get(cacheKey);
    const retainingForRequest = retainingPageSizeContentRef.current;

    if (cachedPage) {
      setProducts(slotProducts(cachedPage.products));
      setTotal(cachedPage.total);
      setUsingCachedPage(true);
      setError(null);
      setLoading(false);
      setRetainingPageSizeContent(false);
      if (!retainingForRequest) setPageRevealVersion((version) => version + 1);
      return;
    }

    setUsingCachedPage(false);

    const ac = new AbortController();
    const timeout = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      fetchProducts({
        limit: pagination.pageSize,
        skip: pagination.offset,
        signal: ac.signal,
      })
        .then((page) => {
          if (ac.signal.aborted) return;
          pageCacheRef.current.set(cacheKey, page);
          setProducts(slotProducts(page.products));
          setTotal(page.total);
          setUsingCachedPage(false);
          setRetainingPageSizeContent(false);
          if (!retainingForRequest) {
            setPageRevealVersion((version) => version + 1);
          }
          setLoading(false);
        })
        .catch((reason) => {
          if (ac.signal.aborted) return;
          setRetainingPageSizeContent(false);
          setError(
            reason instanceof Error
              ? reason.message
              : "Unable to load products",
          );
          setLoading(false);
        });
    });
    return () => {
      window.clearTimeout(timeout);
      ac.abort();
    };
  }, [pagination.offset, pagination.pageIndex, pagination.pageSize, retryKey]);
  const displayProducts = useMemo(() => {
    if (loading && products.length === 0) {
      return createPlaceholderProducts(pagination.pageSize);
    }

    if (retainingPageSizeContent) {
      return withRevealVersion(
        withPageSizePlaceholders(products, pagination.pageSize),
        pageRevealVersion,
      );
    }

    return withRevealVersion(products, pageRevealVersion);
  }, [
    loading,
    pageRevealVersion,
    pagination.pageSize,
    products,
    retainingPageSizeContent,
  ]);
  const setPage = useCallback(
    (nextPageIndex: number) => {
      if (nextPageIndex === pagination.pageIndex) return;
      const cacheKey = paginationCacheKey(pagination.pageSize, nextPageIndex);
      const hasCachedPage = pageCacheRef.current.has(cacheKey);
      setUsingCachedPage(hasCachedPage);
      setRetainingPageSizeContent(false);
      setLoading(!hasCachedPage);
      setError(null);
      pagination.setPageIndex(nextPageIndex);
    },
    [pagination],
  );
  const setItemsPerPage = useCallback(
    (nextPageSize: number) => {
      if (nextPageSize === pagination.pageSize) return;
      setUsingCachedPage(false);
      setRetainingPageSizeContent(
        products.length > 0 && pagination.pageIndex === 0,
      );
      setLoading(true);
      setError(null);
      pagination.setPageSize(nextPageSize);
    },
    [pagination, products.length],
  );
  const retry = useCallback(() => {
    pageCacheRef.current.delete(
      paginationCacheKey(pagination.pageSize, pagination.pageIndex),
    );
    setUsingCachedPage(false);
    setRetainingPageSizeContent(false);
    setLoading(true);
    setError(null);
    setRetryKey((v) => v + 1);
  }, [pagination.pageIndex, pagination.pageSize]);
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
        <MasonryPaginationControls
          pageIndex={pagination.pageIndex}
          pageCount={pagination.pageCount}
          pageSize={pagination.pageSize}
          itemsPerPageOptions={ITEMS_PER_PAGE_OPTIONS}
          onItemsPerPageChange={setItemsPerPage}
          onPageChange={setPage}
          className={styles.pageButtons}
          getPageHref={pagination.getPageHref}
          disabled={loading}
          pageRangeDisplayed={3}
          marginPagesDisplayed={1}
        />
      </div>
      {error ? <p className={styles.error}>{error}</p> : null}
      {error && products.length === 0 ? null : (
        <MasonryGallery
          products={displayProducts}
          loadingOptions={loadingOptions}
          plugins={[pagination.plugin, masonryFullscreen()] as never}
          reveal={usingCachedPage ? cachedRevealOptions : revealOptions}
        />
      )}
    </section>
  );
}
