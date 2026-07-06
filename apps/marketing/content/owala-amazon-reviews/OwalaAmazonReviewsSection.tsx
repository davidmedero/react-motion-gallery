/* eslint-disable @next/next/no-img-element */
"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { GalleryCore, useGalleryCore } from "react-motion-gallery/core";
import {
  useFullscreenController,
  type FullscreenPlugin,
  type FullscreenOptions,
} from "react-motion-gallery/fullscreen";
import { fullscreenLazyLoad } from "react-motion-gallery/fullscreen/lazy-load";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenThumbnails } from "react-motion-gallery/fullscreen/thumbnails";
import { fullscreenVideo } from "react-motion-gallery/fullscreen/video";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import { FullscreenThumbnailSlider } from "react-motion-gallery/fullscreenThumbnails";
import {
  Entries,
  flattenEntries,
  type EntriesMediaContainerRender,
  type EntriesLoadingOptions,
  type EntryCardRenderArgs,
  type EntryItem,
  type EntryMediaRenderArgs,
  type EntryOverlayStyle,
  type EntryOverlayRenderArgs,
} from "react-motion-gallery/entries";
import { useEntriesInfiniteScroll } from "react-motion-gallery/entries/infinite-scroll";
import {
  entriesLoadMore,
  useEntriesLoadMore,
} from "react-motion-gallery/entries/load-more";
import { createEntriesSliderMedia } from "react-motion-gallery/entries/media/slider";
import { entriesVirtualization } from "react-motion-gallery/entries/virtualization";
import { sliderArrows } from "react-motion-gallery/slider/arrows";
import { sliderLazyLoad } from "react-motion-gallery/slider/lazy-load";
import { sliderRipple } from "react-motion-gallery/slider/ripple";
import {
  OWALA_REVIEW_MEDIA,
  OWALA_REVIEWS,
  OWALA_TOTAL_REVIEWS,
  type OwalaReview,
  type ReviewMedia,
  type ReviewVideoMedia,
} from "./owalaAmazonReviewsData";
import styles from "./owala-amazon-reviews.module.css";

type ReviewMediaEntry = EntryItem & {
  id: string;
  media: ReviewMedia[];
};

type CustomerMediaFilter = "all" | "photos" | "videos";

type CustomerMediaEntry = EntryItem & {
  id: string;
  originalIndex: number;
  media: [ReviewMedia];
};

type CustomerMediaDialogState = {
  filter: CustomerMediaFilter;
  visibleCount: number;
  scrollTop: number;
};

type ReviewStyleVars = CSSProperties & {
  "--review-photo-tone": string;
  "--review-photo-surface": string;
};

type TopRailSkeletonStyleVars = CSSProperties & {
  "--owala-top-rail-skeleton-slide-width-xs": string;
  "--owala-top-rail-skeleton-slide-width-sm": string;
  "--owala-top-rail-skeleton-slide-width-md": string;
  "--owala-top-rail-skeleton-slide-width-lg": string;
  "--owala-top-rail-skeleton-rounded-slide-width-xs": string;
  "--owala-top-rail-skeleton-rounded-slide-width-sm": string;
  "--owala-top-rail-skeleton-rounded-slide-width-md": string;
  "--owala-top-rail-skeleton-rounded-slide-width-lg": string;
};

type ReviewRevealLayout = {
  needed: boolean;
  active: boolean;
  expandedHeight: number;
  offset: number;
};

type ReviewRevealStyleVars = CSSProperties & {
  "--owala-review-body-expanded-height"?: string;
};

type EntrySkeletonValue = NonNullable<EntriesLoadingOptions["skeleton"]>;
type EntrySkeletonResolver = Extract<
  EntrySkeletonValue,
  (...args: never[]) => unknown
>;
type EntrySkeletonSpec = Exclude<EntrySkeletonValue, EntrySkeletonResolver>;
type EntrySkeletonLayout = NonNullable<EntrySkeletonSpec["layout"]>;
type OwalaSkeletonRectStyle = Extract<
  EntrySkeletonLayout,
  { kind: "rect" | "square" | "circle" }
>["style"];

const CUSTOMER_MEDIA_PAGE_SIZE = 24;
const TOP_REVIEWS_PAGE_SIZE = 12;
const OWALA_CUSTOMER_MEDIA_PREWARM_DELAY_MS = 440;
const TOP_REVIEWS_VIRTUALIZATION = entriesVirtualization({
  estimateSize: 444,
  gap: 30,
  overscan: 2,
});
const OWALA_TOP_RAIL_GAP = 10;
const OWALA_TOP_RAIL_CELLS_PER_SLIDE = {
  xs: 1.6,
  sm: 2.7,
  md: 3.7,
  lg: 5.15,
} as const;
const OWALA_TOP_RAIL_SLIDER_VIRTUALIZATION = {
  enabled: true,
  overscan: 1,
  threshold: 18,
} as const;
const REVIEW_COUNT_FORMATTER = new Intl.NumberFormat("en-US");
const OWALA_ENTRY_REVEAL = {
  // durationMs: 700,
  // easing: "cubic-bezier(.2,.65,.2,1)",
};
const DEFAULT_REVIEW_REVEAL_LAYOUT: ReviewRevealLayout = {
  needed: false,
  active: false,
  expandedHeight: 0,
  offset: 0,
};

const CUSTOMER_MEDIA_FILTERS: Array<{
  id: CustomerMediaFilter;
  label: string;
}> = [
  { id: "all", label: "All" },
  { id: "photos", label: "Photos" },
  { id: "videos", label: "Videos" },
];

const DEFAULT_CUSTOMER_MEDIA_DIALOG_STATE: CustomerMediaDialogState = {
  filter: "all",
  visibleCount: CUSTOMER_MEDIA_PAGE_SIZE,
  scrollTop: 0,
};

const CUSTOMER_MEDIA_PREWARM_INERT_PROPS = {
  inert: true,
} as ComponentPropsWithoutRef<"div">;

function formatReviewCount(value: number) {
  return REVIEW_COUNT_FORMATTER.format(value);
}

function sameReviewRevealLayout(
  a: ReviewRevealLayout,
  b: ReviewRevealLayout,
) {
  return (
    a.needed === b.needed &&
    a.active === b.active &&
    a.expandedHeight === b.expandedHeight &&
    a.offset === b.offset
  );
}

function readPixelCustomProperty(element: HTMLElement, property: string) {
  const value = window.getComputedStyle(element).getPropertyValue(property);
  const parsed = Number.parseFloat(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function measureExpandedReviewBodyHeight(body: HTMLParagraphElement) {
  const parent = body.parentElement;
  const width = body.getBoundingClientRect().width;

  if (!parent || width <= 0) return Math.ceil(body.scrollHeight);

  const clone = body.cloneNode(true) as HTMLParagraphElement;
  clone.setAttribute("data-owala-review-body-expanded", "1");
  clone.style.position = "absolute";
  clone.style.inset = "auto auto auto 0";
  clone.style.width = `${width}px`;
  clone.style.height = "auto";
  clone.style.maxHeight = "none";
  clone.style.visibility = "hidden";
  clone.style.pointerEvents = "none";
  clone.style.transition = "none";

  parent.appendChild(clone);
  const height = Math.ceil(clone.getBoundingClientRect().height);
  clone.remove();

  return height;
}

function topRailSlideMainSize(cellsPerSlide: number, trackSize = "100%") {
  const resolvedCellsPerSlide = Math.max(1, cellsPerSlide | 0);
  const visibleGap =
    Math.round(
      OWALA_TOP_RAIL_GAP * Math.max(0, resolvedCellsPerSlide - 1) * 1000,
    ) / 1000;
  return `calc((${trackSize} - ${visibleGap}px) / ${resolvedCellsPerSlide})`;
}

const TOP_RAIL_SKELETON_STYLE_VARS: TopRailSkeletonStyleVars = {
  "--owala-top-rail-skeleton-slide-width-xs": topRailSlideMainSize(
    OWALA_TOP_RAIL_CELLS_PER_SLIDE.xs,
  ),
  "--owala-top-rail-skeleton-slide-width-sm": topRailSlideMainSize(
    OWALA_TOP_RAIL_CELLS_PER_SLIDE.sm,
  ),
  "--owala-top-rail-skeleton-slide-width-md": topRailSlideMainSize(
    OWALA_TOP_RAIL_CELLS_PER_SLIDE.md,
  ),
  "--owala-top-rail-skeleton-slide-width-lg": topRailSlideMainSize(
    OWALA_TOP_RAIL_CELLS_PER_SLIDE.lg,
  ),
  "--owala-top-rail-skeleton-rounded-slide-width-xs": topRailSlideMainSize(
    OWALA_TOP_RAIL_CELLS_PER_SLIDE.xs,
    "round(nearest, 100%, 1px)",
  ),
  "--owala-top-rail-skeleton-rounded-slide-width-sm": topRailSlideMainSize(
    OWALA_TOP_RAIL_CELLS_PER_SLIDE.sm,
    "round(nearest, 100%, 1px)",
  ),
  "--owala-top-rail-skeleton-rounded-slide-width-md": topRailSlideMainSize(
    OWALA_TOP_RAIL_CELLS_PER_SLIDE.md,
    "round(nearest, 100%, 1px)",
  ),
  "--owala-top-rail-skeleton-rounded-slide-width-lg": topRailSlideMainSize(
    OWALA_TOP_RAIL_CELLS_PER_SLIDE.lg,
    "round(nearest, 100%, 1px)",
  ),
};

const REVIEW_BY_ID = new Map(
  OWALA_REVIEWS.filter((review) => review.media.length > 0).map((review) => [
    review.id,
    review,
  ]),
);

const IMAGE_STRIP_ENTRIES: ReviewMediaEntry[] = [
  {
    id: "owala-review-media-strip",
    media: OWALA_REVIEW_MEDIA,
  },
];

const IMAGE_STRIP_FLATTENED = flattenEntries(IMAGE_STRIP_ENTRIES);
const TOP_RAIL_FULLSCREEN_MEDIA = IMAGE_STRIP_FLATTENED.flattenedMedia;

const CUSTOMER_MEDIA_ENTRIES: CustomerMediaEntry[] =
  OWALA_REVIEW_MEDIA.map((media, index) => ({
    id: `owala-customer-media-${index}`,
    originalIndex: index,
    media: [media],
  }));
const CUSTOMER_MEDIA_DIALOG_FULLSCREEN_ITEMS = OWALA_REVIEW_MEDIA.slice(0, 1);

const OWALA_FULLSCREEN_THUMBNAIL_ITEMS = OWALA_REVIEW_MEDIA.map((media) => ({
  thumbSrc: media.kind === "video" ? media.poster : media.thumbSrc,
  alt: media.alt,
}));

const OWALA_ENTRY_LOADING_BASE = {
  enabled: true,
  waitForMedia: true,
  enterMs: 0,
  exitMs: 120,
  decodeTimeoutMs: 1600,
  skeletonWrap: {
    className: styles.entrySkeletonWrap,
  },
} satisfies EntriesLoadingOptions;

const topRailMedia = createEntriesSliderMedia({
  sliderObject: {
    layout: {
      gap: OWALA_TOP_RAIL_GAP,
      cellsPerSlide: OWALA_TOP_RAIL_CELLS_PER_SLIDE,
    },
    scroll: {
      loop: true,
      freeScroll: false,
      groupCells: true,
      skipSnaps: true,
      containScroll: true,
    },
    virtualization: OWALA_TOP_RAIL_SLIDER_VIRTUALIZATION,
    elements: {
      viewport: {
        className: styles.photoRailViewport,
      },
      container: {
        className: styles.photoRailContainer,
      },
    },
    plugins: [
      sliderLazyLoad({
        spinner: false,
      }),
      sliderRipple({ className: styles.sliderRipple }),
      sliderArrows({
        arrow: {
          className: styles.railArrow,
        },
        prev: {
          className: styles.railArrowPrev,
        },
        next: {
          className: styles.railArrowNext,
        },
      }),
    ],
  },
});

const reviewMediaSlider = createEntriesSliderMedia({
  sliderObject: {
    layout: {
      gap: 8,
      underflowAlign: "start",
      cellsPerSlide: {
        xs: 3,
        md: 4,
      },
    },
    scroll: {
      loop: false,
      freeScroll: false,
      groupCells: true,
      skipSnaps: false,
      containScroll: true,
    },
    virtualization: {
      enabled: true,
      threshold: 4,
      overscan: 2,
    },
    elements: {
      viewport: {
        className: styles.reviewMediaViewport,
      },
      container: {
        className: styles.reviewMediaContainer,
      },
    },
    plugins: [
      sliderLazyLoad({
        spinner: false,
      }),
      sliderRipple({ className: styles.sliderRipple }),
      sliderArrows(),
    ],
  },
});

const fullscreenOptions: FullscreenOptions = {
  enabled: true,
  mountStrategy: "open",
  overlaysAboveIntroMedia: false,
  effects: {
    introDuration: {
      transform: 360,
      fade: 360,
    },
    // introEasing: "cubic-bezier(.2,.65,.2,1)",
  },
  dialog: {
    className: styles.fullscreenDialog,
    opacityDuration: 360,
    switchOpacityDuration: 620,
    // opacityEasing: "cubic-bezier(.2,.65,.2,1)",
    style: {
      width: "min(calc(100vw - 48px), 1460px)",
      height: "min(calc(100dvh - 120px), 900px)",
    },
    media: {
      className: styles.fullscreenDialogMedia,
    },
    caption: {
      className: styles.fullscreenDialogCaption,
    },
  },
  closeScroll: true,
  lazyLoad: {
    images: {
      enabled: true,
    },
    videos: {
      enabled: true,
    },
  },
  video: {
    playOnOpen: true,
    playOnTransition: true,
    source: (item) => ({
      type: "video",
      poster: (item as ReviewVideoMedia).poster,
      sources: [
        {
          src: (item as ReviewVideoMedia).src,
          type: "video/mp4",
        },
      ],
    }),
  },
  slider: {
    gap: {
      xs: 10,
      md: 24,
    },
  },
  controls: {
    close: {
      className: styles.fullscreenClose,
      render: () => <X aria-hidden="true" />,
    },
    counter: {
      enabled: false,
    },
    arrows: {
      arrow: {
        className: styles.fullscreenArrow,
      },
      prev: {
        className: styles.fullscreenArrowPrev,
      },
      next: {
        className: styles.fullscreenArrowNext,
      },
    },
  },
};

const OWALA_FULLSCREEN_PLUGINS: FullscreenPlugin[] = [
  fullscreenSlider({
    virtualization: OWALA_TOP_RAIL_SLIDER_VIRTUALIZATION,
  }),
  fullscreenThumbnails(),
  fullscreenLazyLoad(),
  fullscreenVideo(),
  fullscreenZoomPan(),
];

const CUSTOMER_MEDIA_FULLSCREEN_PLUGINS: FullscreenPlugin[] = [
  fullscreenSlider(),
];

const entryOverlayOptions = {
  className: styles.fsOverlayShell,
  placement: {
    xs: "bottom",
    md: "right",
  } as const,
  width: {
    xs: "100%",
    md: "360px",
    lg: "420px",
  },
  height: {
    xs: "auto",
    md: "100%",
  },
  style: {
    background: "#fff",
    color: "#0f1111",
    padding: 0,
  },
  overlayCrossfadeTarget: "content" as const,
  overlayCrossfadeDurationMs: 300,
  overlayCrossfadeEasing: "cubic-bezier(.2,.65,.2,1)",
  zoomFade: false,
} satisfies EntryOverlayStyle;

function mediaThumbSrc(media: ReviewMedia) {
  return media.kind === "video" ? media.poster : media.thumbSrc;
}

function mediaStyleVars(media: ReviewMedia): ReviewStyleVars {
  return {
    "--review-photo-tone": media.tone,
    "--review-photo-surface": media.surface,
  };
}

function Stars({ value }: { value: number }) {
  return (
    <span className={styles.stars} aria-label={`${value} out of 5 stars`}>
      {"★".repeat(value)}
      {value < 5 ? <span className={styles.emptyStars}>{"★".repeat(5 - value)}</span> : null}
    </span>
  );
}

function Avatar({ review }: { review: OwalaReview }) {
  return <span className={styles.avatar}>{review.avatar ?? ""}</span>;
}

function PurchaseMeta({ review }: { review: OwalaReview }) {
  return (
    <p className={styles.purchaseMeta}>
      <span className={styles.purchaseMetaText}>Color: {review.color}</span>
      <span className={styles.purchaseMetaSeparator} aria-hidden="true" />
      <span className={styles.purchaseMetaText}>Size: {review.size}</span>
      {review.verified ? (
        <>
          <span className={styles.purchaseMetaSeparator} aria-hidden="true" />
          <strong>Verified Purchase</strong>
        </>
      ) : null}
    </p>
  );
}

function ReviewMediaTile({
  media,
  mediaIndex,
  variant,
  imageLoading = "lazy",
  imageDecoding = "async",
  imageFetchPriority = "low",
  className,
  onClick,
  onKeyDown,
  role,
  tabIndex,
  style,
  ...figureProps
}: Omit<ComponentPropsWithoutRef<"figure">, "children"> & {
  media: ReviewMedia;
  mediaIndex: number;
  variant: "rail" | "review" | "modal";
  imageLoading?: "eager" | "lazy";
  imageDecoding?: "async" | "sync" | "auto";
  imageFetchPriority?: "high" | "low" | "auto";
}) {
  const isVideo = media.kind === "video";
  const interactive = typeof onClick === "function";
  const review = REVIEW_BY_ID.get(media.reviewId);
  const tileClassName = className
    ? `${styles.photoTile} ${className}`
    : styles.photoTile;

  const handleKeyDown: ComponentPropsWithoutRef<"figure">["onKeyDown"] = (
    event,
  ) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || !interactive) return;
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    event.currentTarget.click();
  };

  return (
    <figure
      {...figureProps}
      className={tileClassName}
      data-owala-media-tile="true"
      data-media-kind={media.kind}
      data-variant={variant}
      role={role ?? (interactive ? "button" : undefined)}
      tabIndex={tabIndex ?? (interactive ? 0 : undefined)}
      style={{ ...mediaStyleVars(media), ...style }}
      onClick={onClick}
      onKeyDown={onKeyDown || interactive ? handleKeyDown : undefined}
    >
      <span className={styles.photoTileImageWrap}>
        <img
          className={styles.photoTileImage}
          src={mediaThumbSrc(media)}
          alt={media.alt}
          loading={imageLoading}
          decoding={imageDecoding}
          fetchPriority={imageFetchPriority}
          draggable={false}
        />
      </span>
      {isVideo ? (
        <span className={styles.playBadge} aria-label="Video">
          <span aria-hidden="true" />
        </span>
      ) : null}
      {variant === "modal" ? (
        <figcaption className={styles.customerMediaTileOverlay}>
          <Stars value={review?.rating ?? 5} />
          {isVideo ? (
            <span className={styles.customerMediaDuration}>
              {(media as ReviewVideoMedia).duration}
            </span>
          ) : null}
        </figcaption>
      ) : (
        <figcaption className={styles.photoTileCaption}>
          {isVideo ? "Video" : "Photo"} {mediaIndex + 1}
        </figcaption>
      )}
    </figure>
  );
}

function renderReviewMediaTile(
  { media, mediaIndex }: EntryMediaRenderArgs,
  variant: "rail" | "review",
) {
  const reviewMedia = media as ReviewMedia;
  const eagerRailImage = variant === "rail" && mediaIndex === 0;

  return (
    <ReviewMediaTile
      media={reviewMedia}
      mediaIndex={mediaIndex}
      variant={variant}
      imageLoading={eagerRailImage ? "eager" : "lazy"}
      imageFetchPriority={eagerRailImage ? "high" : "low"}
    />
  );
}

const customerMediaContainer: EntriesMediaContainerRender = ({ mediaNodes }) =>
  mediaNodes[0] ?? null;

function customerMediaMatchesFilter(
  entry: CustomerMediaEntry,
  filter: CustomerMediaFilter,
) {
  const media = entry.media[0];
  if (filter === "photos") return media.kind === "image";
  if (filter === "videos") return media.kind === "video";
  return true;
}

function CustomerMediaFullscreenTile({
  entry,
  media,
  onOpenMedia,
}: EntryMediaRenderArgs & {
  onOpenMedia: (index: number, event: Event) => void;
}) {
  const customerEntry = entry as CustomerMediaEntry;
  const reviewMedia = media as ReviewMedia;
  const mediaKindLabel = reviewMedia.kind === "video" ? "video" : "photo";

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onOpenMedia(customerEntry.originalIndex, event.nativeEvent);
  };

  return (
    <ReviewMediaTile
      media={reviewMedia}
      mediaIndex={customerEntry.originalIndex}
      variant="modal"
      aria-label={`Open customer ${mediaKindLabel} ${customerEntry.originalIndex + 1}`}
      onClick={handleClick}
    />
  );
}

function renderCustomerMediaTile(
  args: EntryMediaRenderArgs,
  onOpenMedia: (index: number, event: Event) => void,
) {
  return <CustomerMediaFullscreenTile {...args} onOpenMedia={onOpenMedia} />;
}

function CustomerMediaCard({ media }: EntryCardRenderArgs) {
  return <div className={styles.customerMediaCard}>{media}</div>;
}

function CustomerMediaModalContent({
  state,
  onStateChange,
  onOpenMedia,
  commitOnUnmount = true,
  warmInitialContent = false,
}: {
  state: CustomerMediaDialogState;
  onStateChange: (state: CustomerMediaDialogState) => void;
  onOpenMedia: (index: number, event: Event) => void;
  commitOnUnmount?: boolean;
  warmInitialContent?: boolean;
}) {
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [bodyNode, setBodyNode] = useState<HTMLDivElement | null>(null);
  const [scrollLoadingEnabled, setScrollLoadingEnabled] = useState(
    () => !warmInitialContent,
  );
  const scrollTopRef = useRef(state.scrollTop);
  const latestStateRef = useRef({
    filter: state.filter,
    visibleCount: state.visibleCount,
  });
  const filter = state.filter;
  const visibleCount = state.visibleCount;

  const filteredEntries = useMemo(
    () =>
      CUSTOMER_MEDIA_ENTRIES.filter((entry) =>
        customerMediaMatchesFilter(entry, filter),
      ),
    [filter],
  );
  const effectiveVisibleCount = Math.min(visibleCount, filteredEntries.length);
  const hasMore = effectiveVisibleCount < filteredEntries.length;

  useEffect(() => {
    latestStateRef.current = {
      filter,
      visibleCount: effectiveVisibleCount,
    };
  }, [effectiveVisibleCount, filter]);

  const loadMorePlugin = useMemo(
    () =>
      entriesLoadMore({
        mode: "client",
        visibleCount: effectiveVisibleCount,
        total: filteredEntries.length,
      }),
    [effectiveVisibleCount, filteredEntries.length],
  );

  const virtualizationPlugin = useMemo(
    () =>
      entriesVirtualization({
        layout: "grid",
        estimateSize: 300,
        gap: 14,
        overscan: 3,
        scrollRoot: bodyNode,
      }),
    [bodyNode],
  );

  const setBodyElement = useCallback((node: HTMLDivElement | null) => {
    bodyRef.current = node;
    setBodyNode(node);
  }, []);

  const commitState = useCallback(
    (next: Partial<CustomerMediaDialogState> = {}) => {
      const latest = latestStateRef.current;
      const nextState = {
        filter: latest.filter,
        visibleCount: latest.visibleCount,
        scrollTop: bodyRef.current?.scrollTop ?? scrollTopRef.current,
        ...next,
      };

      scrollTopRef.current = nextState.scrollTop;
    onStateChange({
      ...nextState,
    });
  },
    [onStateChange],
  );

  const customerMediaLoading = scrollLoadingEnabled
    ? CUSTOMER_MEDIA_LOADING
    : CUSTOMER_MEDIA_WARM_LOADING;

  const handleScroll = useCallback(() => {
    scrollTopRef.current = bodyRef.current?.scrollTop ?? scrollTopRef.current;
  }, []);

  const handleOpenMedia = useCallback(
    (index: number, event: Event) => {
      commitState();
      onOpenMedia(index, event);
    },
    [commitState, onOpenMedia],
  );

  const infiniteScroll = useEntriesInfiniteScroll({
    hasMore,
    loading: false,
    rootMargin: "360px 0px",
    scrollRoot: bodyNode,
    onLoadMore: () => {
      setScrollLoadingEnabled(true);
      commitState({
        visibleCount: Math.min(
          effectiveVisibleCount + CUSTOMER_MEDIA_PAGE_SIZE,
          filteredEntries.length,
        ),
      });
    },
    sentinel: (
      <span className={styles.customerMediaSentinel}>
        {hasMore ? "Loading more" : "All media loaded"}
      </span>
    ),
  });

  useEffect(() => {
    if (!commitOnUnmount) return;
    return () => commitState();
  }, [commitOnUnmount, commitState]);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;

    const nextScrollTop = scrollTopRef.current;
    const frame = window.requestAnimationFrame(() => {
      body.scrollTop = nextScrollTop;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [filter]);

  const entriesPlugins = useMemo(
    () => [loadMorePlugin, infiniteScroll, virtualizationPlugin],
    [infiniteScroll, loadMorePlugin, virtualizationPlugin],
  );

  return (
    <section
      className={styles.customerMediaDialogContent}
      aria-labelledby="owala-customer-media-title"
    >
      <header className={styles.customerMediaHeader}>
        <h2 id="owala-customer-media-title">Customer photos and videos</h2>
      </header>
      <div
        ref={setBodyElement}
        className={styles.customerMediaBody}
        onScroll={handleScroll}
      >
        <div className={styles.customerMediaTabs} role="tablist">
          {CUSTOMER_MEDIA_FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={filter === item.id}
              data-selected={filter === item.id ? "true" : undefined}
              onClick={() => {
                if (bodyRef.current) bodyRef.current.scrollTop = 0;
                commitState({
                  filter: item.id,
                  visibleCount: CUSTOMER_MEDIA_PAGE_SIZE,
                  scrollTop: 0,
                });
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <Entries
          entries={{
            layout: "grid",
            items: filteredEntries,
            mediaLayout: "grid",
            plugins: entriesPlugins,
            render: {
              card: CustomerMediaCard,
              media: (args) => renderCustomerMediaTile(args, handleOpenMedia),
              overlay: ReviewOverlay,
            },
            overlay: entryOverlayOptions,
            loading: customerMediaLoading,
            reveal: OWALA_ENTRY_REVEAL,
            entryList: {
              className: styles.customerMediaGrid,
            },
            entryRow: {
              className: styles.customerMediaEntryRow,
            },
          }}
          fullscreen={{
            enabled: false,
          }}
          renderMediaContainer={customerMediaContainer}
        />
      </div>
    </section>
  );
}

function CustomerMediaModalController({
  active = true,
  state,
  onStateChange,
  onOpenMedia,
  onClose,
}: {
  active?: boolean;
  state: CustomerMediaDialogState;
  onStateChange: (state: CustomerMediaDialogState) => void;
  onOpenMedia: (index: number, event: Event) => void;
  onClose: () => void;
}) {
  const core = useGalleryCore();
  const hasRequestedOpenRef = useRef(false);
  const hasOpenedRef = useRef(false);
  const hasNotifiedCloseRef = useRef(false);
  const transitionToMediaRef = useRef<null | ((index: number, event: Event) => void)>(
    null,
  );
  const fullscreen = useMemo<FullscreenOptions>(
    () => ({
      enabled: true,
      mountStrategy: "open",
      overlaysAboveIntroMedia: false,
      effects: {
        introFade: true,
        introDuration: {
          transform: 360,
          fade: 360,
        },
      },
      dialog: {
        className: styles.customerMediaFullscreenDialog,
        opacityDuration: 360,
        switchOpacityDuration: 420,
        style: {
          width: "min(calc(100vw - 48px), 1480px)",
          height: "min(calc(100dvh - 48px), 940px)",
        },
        header: {
          className: styles.customerMediaFullscreenHeader,
          style: {
            position: "absolute",
            inset: "0 0 auto 0",
            minHeight: 0,
            padding: 0,
          },
        },
        media: {
          className: styles.customerMediaFullscreenMedia,
          style: {
            display: "none",
          },
        },
        caption: {
          className: styles.customerMediaFullscreenCaption,
        },
      },
      caption: {
        layout: "overlay",
        placement: "bottom",
        height: "100%",
        className: styles.customerMediaFullscreenOverlay,
        style: {
          width: "100%",
          height: "100%",
          padding: 0,
          background: "#fff",
          color: "#0f1111",
          pointerEvents: "auto",
        },
        overlayCrossfadeTarget: "overlay",
        render: () => (
          <CustomerMediaModalContent
            state={state}
            onStateChange={onStateChange}
            onOpenMedia={(index, event) =>
              transitionToMediaRef.current?.(index, event)
            }
            warmInitialContent
          />
        ),
      },
      controls: {
        close: {
          className: styles.customerMediaFullscreenClose,
          render: () => <X aria-hidden="true" />,
        },
        counter: {
          enabled: false,
        },
        arrows: {
          enabled: false,
        },
      },
      slider: {
        gap: 0,
      },
    }),
    [onStateChange, state],
  );
  const {
    fullscreenNode,
    showFullscreenModal,
    closingModal,
    transitionDialogTo,
  } =
    useFullscreenController({
      plugins: CUSTOMER_MEDIA_FULLSCREEN_PLUGINS,
      fullscreen,
    });

  useEffect(() => {
    transitionToMediaRef.current = (index, event) => {
      void transitionDialogTo(() => onOpenMedia(index, event));
    };

    return () => {
      transitionToMediaRef.current = null;
    };
  }, [onOpenMedia, transitionDialogTo]);

  useEffect(() => {
    if (!active) return;
    if (hasRequestedOpenRef.current) return;
    hasRequestedOpenRef.current = true;

    core.openFullscreenAt({
      index: 0,
      method: "fade",
    });
  }, [active, core]);

  useEffect(() => {
    if (active || showFullscreenModal) return;

    hasRequestedOpenRef.current = false;
    hasOpenedRef.current = false;
    hasNotifiedCloseRef.current = false;
  }, [active, showFullscreenModal]);

  useEffect(() => {
    if (showFullscreenModal) {
      hasOpenedRef.current = true;
      return;
    }

    if (
      !hasOpenedRef.current ||
      closingModal ||
      hasNotifiedCloseRef.current
    ) {
      return;
    }

    hasNotifiedCloseRef.current = true;
    onClose();
  }, [closingModal, onClose, showFullscreenModal]);

  return <>{fullscreenNode}</>;
}

function CustomerMediaModal({
  active = true,
  state,
  onStateChange,
  onOpenMedia,
  onClose,
}: {
  active?: boolean;
  state: CustomerMediaDialogState;
  onStateChange: (state: CustomerMediaDialogState) => void;
  onOpenMedia: (index: number, event: Event) => void;
  onClose: () => void;
}) {
  const ignorePrewarmStateChange = useCallback(() => {}, []);
  const ignorePrewarmOpenMedia = useCallback(() => {}, []);

  return (
    <GalleryCore fullscreenItems={CUSTOMER_MEDIA_DIALOG_FULLSCREEN_ITEMS}>
      {!active ? (
        <div
          className={styles.customerMediaPrewarm}
          aria-hidden="true"
          {...CUSTOMER_MEDIA_PREWARM_INERT_PROPS}
        >
          <CustomerMediaModalContent
            state={state}
            onStateChange={ignorePrewarmStateChange}
            onOpenMedia={ignorePrewarmOpenMedia}
            commitOnUnmount={false}
            warmInitialContent
          />
        </div>
      ) : null}
      <CustomerMediaModalController
        active={active}
        state={state}
        onStateChange={onStateChange}
        onOpenMedia={onOpenMedia}
        onClose={onClose}
      />
    </GalleryCore>
  );
}

function PhotoStripCard({ media }: EntryCardRenderArgs) {
  return <div className={styles.photoStripCard}>{media}</div>;
}

function ReviewArticleCard({ entry, media }: EntryCardRenderArgs) {
  return <ReviewArticle review={entry as OwalaReview} media={media} />;
}

function ReviewOverlay({ media }: EntryOverlayRenderArgs) {
  const reviewMedia = media as ReviewMedia | null;
  const review = reviewMedia ? REVIEW_BY_ID.get(reviewMedia.reviewId) : null;

  if (!review || !reviewMedia) return null;

  return (
    <aside className={styles.fullscreenReviewPanel}>
      <div className={styles.overlayAuthorLine}>
        <Avatar review={review} />
        <div>
          <h3>{review.author}</h3>
          <p>{reviewMedia.caption}</p>
        </div>
      </div>
      <div className={styles.overlayStarsLine}>
        <Stars value={review.rating} />
        {review.verified ? <strong>Verified Purchase</strong> : null}
      </div>
      <h4>{review.title}</h4>
      <p>{reviewMedia.description}</p>
      <dl className={styles.overlayMetaList}>
        <div>
          <dt>Color</dt>
          <dd>{review.color}</dd>
        </div>
        <div>
          <dt>Size</dt>
          <dd>{review.size}</dd>
        </div>
        <div>
          <dt>Reviewed on</dt>
          <dd>{review.date}</dd>
        </div>
      </dl>
    </aside>
  );
}

function OwalaFullscreenAddon({
  thumbnailItems,
  onOpenCustomerMedia,
  onPrepareCustomerMedia,
}: {
  thumbnailItems: Array<{ thumbSrc: string; alt?: string }>;
  onOpenCustomerMedia?: () => void;
  onPrepareCustomerMedia?: () => void;
}) {
  const [fullscreenHeaderElement, setFullscreenHeaderElement] =
    useState<HTMLElement | null>(null);
  const {
    fullscreenNode,
    fullscreenThumbnailBridge,
    showFullscreenModal,
    showFullscreenSlider,
    closingModal,
    closeButtonRef,
    transitionDialogTo,
  } = useFullscreenController({
    plugins: OWALA_FULLSCREEN_PLUGINS,
    fullscreen: fullscreenOptions,
  });
  const handleOpenCustomerMedia = useCallback(() => {
    void transitionDialogTo(() => {
      onOpenCustomerMedia?.();
    });
  }, [onOpenCustomerMedia, transitionDialogTo]);

  useEffect(() => {
    if (!showFullscreenModal || !showFullscreenSlider || closingModal) return;
    if (!onPrepareCustomerMedia) return;

    let cancelled = false;
    let delayId = 0;
    let idleId: number | null = null;

    const run = () => {
      if (cancelled) return;
      onPrepareCustomerMedia();
    };

    delayId = window.setTimeout(() => {
      if (cancelled) return;

      const requestIdle = (
        window as typeof window & {
          requestIdleCallback?: (
            callback: () => void,
            options?: { timeout?: number },
          ) => number;
        }
      ).requestIdleCallback;

      if (typeof requestIdle === "function") {
        idleId = requestIdle(run, { timeout: 360 });
        return;
      }

      run();
    }, OWALA_CUSTOMER_MEDIA_PREWARM_DELAY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(delayId);
      if (idleId != null) {
        const cancelIdle = (
          window as typeof window & {
            cancelIdleCallback?: (id: number) => void;
          }
        ).cancelIdleCallback;
        cancelIdle?.(idleId);
      }
    };
  }, [
    closingModal,
    onPrepareCustomerMedia,
    showFullscreenModal,
    showFullscreenSlider,
  ]);

  useEffect(() => {
    if (!onOpenCustomerMedia || !showFullscreenModal || closingModal) {
      return;
    }

    let animationFrame = 0;

    const resolveHeaderElement = () => {
      const headerElement = closeButtonRef.current?.closest(
        '[data-rmg-fs-dialog-header="true"]',
      ) as HTMLElement | null;

      setFullscreenHeaderElement(headerElement);

      if (!headerElement) {
        animationFrame = window.requestAnimationFrame(resolveHeaderElement);
      }
    };

    animationFrame = window.requestAnimationFrame(resolveHeaderElement);

    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [closeButtonRef, closingModal, onOpenCustomerMedia, showFullscreenModal]);

  return (
    <>
      {fullscreenNode}
      {onOpenCustomerMedia &&
      showFullscreenModal &&
      !closingModal &&
      fullscreenHeaderElement
        ? createPortal(
            <button
              className={styles.fullscreenAllMediaButton}
              type="button"
              onClick={handleOpenCustomerMedia}
            >
              <ChevronLeft aria-hidden="true" />
              <span>Customer photos and videos</span>
            </button>,
            fullscreenHeaderElement,
          )
        : null}
      <FullscreenThumbnailSlider
        bridge={fullscreenThumbnailBridge}
        items={thumbnailItems}
        position="bottom"
        thumbnailsCenter
        thumbnailWidth={68}
        thumbnailHeight={68}
        containerClassName={styles.fullscreenThumbs}
        containerStyle={{
          width: "100dvw",
          height: "clamp(88px, 8vw, 96px)",
        }}
        thumbnailItemClassName={styles.fullscreenThumbItem}
        gap={8}
        centerActiveThumb
        fadeOnSync={{ enabled: true, minDistance: 3, durationMs: 500 }}
        loop
        thumbnailCrossfade={{
          enabled: true,
          minDistance: 3,
          durationMs: 500,
        }}
        virtualization={OWALA_TOP_RAIL_SLIDER_VIRTUALIZATION}
      />
    </>
  );
}

const OWALA_ENTRY_SKELETON_DEFAULTS: EntrySkeletonSpec["defaults"] = {
  backgroundColor: "#e5ebeb",
  radius: 6,
  shimmer: {
    durationMs: 980,
    opacity: 0.7,
    c1: "rgba(255, 255, 255, 0.2)",
    c2: "rgba(255, 255, 255, 0.72)",
    c3: "rgba(255, 255, 255, 0.2)",
  },
};

const TOP_RAIL_SKELETON_TILE_STYLE = {
  aspectRatio: "1.04 / 1",
  borderRadius: 10,
  overflow: "hidden",
} satisfies OwalaSkeletonRectStyle;

function owalaSkeletonRect(style: OwalaSkeletonRectStyle): EntrySkeletonLayout {
  return {
    kind: "rect",
    style: {
      backgroundColor: "#e5ebeb",
      borderRadius: 6,
      overflow: "hidden",
      ...style,
    },
  };
}

const REVIEWS_WITH_IMAGES_SKELETON = {
  minHeight: 0,
  defaults: OWALA_ENTRY_SKELETON_DEFAULTS,
  layout: {
    kind: "media",
    count: 6,
    direction: "row",
    style: {
      width: "100%",
      gap: 10,
      overflow: "hidden",
    },
    tile: {
      shape: "rect",
      style: TOP_RAIL_SKELETON_TILE_STYLE,
    },
  },
} satisfies EntrySkeletonSpec;

const REVIEW_SKELETON_TITLE_WIDTHS = ["48%", "62%", "38%"];
const REVIEW_SKELETON_BODY_WIDTHS = [
  ["100%", "94%"],
  ["96%", "82%"],
  ["98%", "72%"],
];

const CUSTOMER_MEDIA_SKELETON = {
  minHeight: "var(--owala-customer-media-tile-height)",
  defaults: OWALA_ENTRY_SKELETON_DEFAULTS,
  layout: owalaSkeletonRect({
    width: "100%",
    height: "var(--owala-customer-media-tile-height)",
    borderRadius: 8,
  }),
} satisfies EntrySkeletonSpec;

const PHOTO_STRIP_LOADING = {
  ...OWALA_ENTRY_LOADING_BASE,
  minHeight: 0,
  skeletonWrap: {
    ...OWALA_ENTRY_LOADING_BASE.skeletonWrap,
    style: TOP_RAIL_SKELETON_STYLE_VARS,
  },
  skeleton: REVIEWS_WITH_IMAGES_SKELETON,
} satisfies EntriesLoadingOptions;

const TOP_REVIEWS_LOADING = {
  ...OWALA_ENTRY_LOADING_BASE,
  // force: {
  //   showContent: true
  // },
  minHeight: "var(--owala-review-entry-height)",
} satisfies EntriesLoadingOptions;

const CUSTOMER_MEDIA_LOADING = {
  ...OWALA_ENTRY_LOADING_BASE,
  minHeight: "var(--owala-customer-media-tile-height)",
  skeleton: CUSTOMER_MEDIA_SKELETON,
} satisfies EntriesLoadingOptions;

const CUSTOMER_MEDIA_WARM_LOADING = {
  ...CUSTOMER_MEDIA_LOADING,
  enabled: false,
} satisfies EntriesLoadingOptions;

type ReviewsWithImagesInnerProps = {
  customerMediaOpen: boolean;
  customerMediaPrepared: boolean;
  customerMediaState: CustomerMediaDialogState;
  onCustomerMediaStateChange: (state: CustomerMediaDialogState) => void;
  onOpenCustomerMedia: () => void;
  onPrepareCustomerMedia: () => void;
  onCloseCustomerMedia: () => void;
};

function ReviewsWithImagesInner({
  customerMediaOpen,
  customerMediaPrepared,
  customerMediaState,
  onCustomerMediaStateChange,
  onOpenCustomerMedia,
  onPrepareCustomerMedia,
  onCloseCustomerMedia,
}: ReviewsWithImagesInnerProps) {
  const core = useGalleryCore();
  const handleOpenCustomerMediaItem = useCallback(
    (index: number, event: Event) => {
      core.openFullscreenAt({
        index,
        method: "fade",
        event,
      });
    },
    [core],
  );

  return (
    <>
      <section
        className={styles.photosSection}
        aria-labelledby="reviews-with-images"
      >
        <div className={styles.preparedContent}>
          <header className={styles.photosHeader}>
            <h2 id="reviews-with-images">Reviews with images</h2>
            <button
              className={styles.seePhotosButton}
              type="button"
              onClick={onOpenCustomerMedia}
            >
              See all photos <ChevronRight aria-hidden="true" />
            </button>
          </header>
          <Entries
            entries={{
              layout: "list",
              items: IMAGE_STRIP_ENTRIES,
              mediaLayout: "slider",
              render: {
                card: PhotoStripCard,
                media: (args) => renderReviewMediaTile(args, "rail"),
                overlay: ReviewOverlay,
              },
              overlay: entryOverlayOptions,
              loading: PHOTO_STRIP_LOADING,
              reveal: OWALA_ENTRY_REVEAL,
              entryRow: {
                className: styles.photoStripEntryRow,
              },
            }}
            fullscreen={{
              enabled: true,
            }}
            renderMediaContainer={topRailMedia}
          />
        </div>
      </section>
      {customerMediaOpen || customerMediaPrepared ? (
        <CustomerMediaModal
          active={customerMediaOpen}
          state={customerMediaState}
          onStateChange={onCustomerMediaStateChange}
          onOpenMedia={handleOpenCustomerMediaItem}
          onClose={onCloseCustomerMedia}
        />
      ) : null}
      <OwalaFullscreenAddon
        thumbnailItems={OWALA_FULLSCREEN_THUMBNAIL_ITEMS}
        onOpenCustomerMedia={onOpenCustomerMedia}
        onPrepareCustomerMedia={onPrepareCustomerMedia}
      />
    </>
  );
}

function ReviewsWithImagesGallery(props: ReviewsWithImagesInnerProps) {
  return (
    <div className={styles.gallery}>
      <GalleryCore layout="entries" fullscreenItems={TOP_RAIL_FULLSCREEN_MEDIA}>
        <ReviewsWithImagesInner {...props} />
      </GalleryCore>
    </div>
  );
}

type TopReviewsInnerProps = {
  reviews: OwalaReview[];
  thumbnailItems: Array<{ thumbSrc: string; alt?: string }>;
  visibleCount: number;
  canLoadMore: boolean;
  onLoadMore: () => void;
  loadMorePlugin: ReturnType<typeof useEntriesLoadMore>["plugin"];
  onOpenCustomerMedia: () => void;
};

function ReviewSkeletonBar({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={[styles.reviewSkeletonBar, className]
        .filter(Boolean)
        .join(" ")}
      style={style}
    />
  );
}

function ReviewArticleSkeleton({
  review,
  entryIndex,
}: {
  review: OwalaReview;
  entryIndex: number;
}) {
  const titleWidth =
    REVIEW_SKELETON_TITLE_WIDTHS[
      entryIndex % REVIEW_SKELETON_TITLE_WIDTHS.length
    ]!;
  const bodyWidths =
    REVIEW_SKELETON_BODY_WIDTHS[
      entryIndex % REVIEW_SKELETON_BODY_WIDTHS.length
    ]!;
  const mediaCount = Math.min(4, Math.max(1, review.media.length));

  return (
    <article
      className={[styles.reviewArticle, styles.reviewArticleSkeleton].join(" ")}
    >
      <div className={styles.authorLine}>
        <ReviewSkeletonBar className={styles.reviewSkeletonAvatar} />
        <ReviewSkeletonBar className={styles.reviewSkeletonAuthor} />
      </div>
      <div className={styles.titleLine}>
        <ReviewSkeletonBar className={styles.reviewSkeletonStars} />
        <ReviewSkeletonBar
          className={styles.reviewSkeletonTitle}
          style={{ width: titleWidth }}
        />
      </div>
      <ReviewSkeletonBar className={styles.reviewSkeletonDate} />
      <p className={[styles.purchaseMeta, styles.reviewMetaSkeleton].join(" ")}>
        <ReviewSkeletonBar className={styles.reviewSkeletonColorMeta} />
        <span className={styles.purchaseMetaSeparator} aria-hidden="true" />
        <ReviewSkeletonBar className={styles.reviewSkeletonSizeMeta} />
        {review.verified ? (
          <>
            <span
              className={styles.purchaseMetaSeparator}
              aria-hidden="true"
            />
            <ReviewSkeletonBar className={styles.reviewSkeletonVerifiedMeta} />
          </>
        ) : null}
      </p>
      <div className={styles.reviewBodySkeleton}>
        {bodyWidths.map((width, index) => (
          <ReviewSkeletonBar
            key={index}
            className={styles.reviewSkeletonBodyLine}
            style={{ width }}
          />
        ))}
      </div>
      <div
        className={[
          styles.reviewMediaGallery,
          styles.reviewMediaSkeletonGallery,
        ].join(" ")}
      >
        {Array.from({ length: mediaCount }).map((_, index) => (
          <ReviewSkeletonBar
            key={index}
            className={styles.reviewMediaSkeletonTile}
          />
        ))}
      </div>
      <ReviewSkeletonBar className={styles.reviewSkeletonHelpful} />
      <div className={styles.reviewActions}>
        <ReviewSkeletonBar className={styles.reviewSkeletonHelpfulButton} />
        <span aria-hidden="true" />
        <ReviewSkeletonBar className={styles.reviewSkeletonReportAction} />
      </div>
    </article>
  );
}

function TopReviewsInner({
  reviews,
  thumbnailItems,
  visibleCount,
  canLoadMore,
  onLoadMore,
  loadMorePlugin,
  onOpenCustomerMedia,
}: TopReviewsInnerProps) {
  return (
    <>
      <section
        className={styles.topReviewsSection}
        aria-labelledby="top-reviews"
      >
        <div className={styles.preparedContent}>
          <div className={styles.topReviewsHeader}>
            <h2 id="top-reviews">Top reviews from the United States</h2>
            <p className={styles.reviewListCount}>
              Showing {formatReviewCount(visibleCount)} of{" "}
              {formatReviewCount(OWALA_TOTAL_REVIEWS)} reviews
            </p>
          </div>
          <Entries
            entries={{
              layout: "list",
              items: reviews,
              mediaLayout: "slider",
              plugins: [loadMorePlugin, TOP_REVIEWS_VIRTUALIZATION],
              entryList: {
                className: styles.reviewList,
              },
              render: {
                card: ReviewArticleCard,
                media: (args) => renderReviewMediaTile(args, "review"),
                overlay: ReviewOverlay,
                skeleton: ({ entry, entryIndex }) => (
                  <ReviewArticleSkeleton
                    review={entry as OwalaReview}
                    entryIndex={entryIndex}
                  />
                ),
              },
              overlay: entryOverlayOptions,
              loading: TOP_REVIEWS_LOADING,
              reveal: OWALA_ENTRY_REVEAL,
              entryRow: {
                className: styles.reviewEntryRow,
              },
            }}
            fullscreen={{
              enabled: true,
            }}
            renderMediaContainer={reviewMediaSlider}
          />
          <div className={styles.reviewsLoadMoreFooter}>
            <button
              className={styles.reviewsLoadMoreButton}
              type="button"
              onClick={onLoadMore}
              disabled={!canLoadMore}
            >
              {canLoadMore ? "Load more reviews" : "All reviews loaded"}
            </button>
          </div>
        </div>
      </section>
      <OwalaFullscreenAddon
        thumbnailItems={thumbnailItems}
        onOpenCustomerMedia={onOpenCustomerMedia}
      />
    </>
  );
}

function TopReviewsGallery({
  onOpenCustomerMedia,
}: {
  onOpenCustomerMedia: () => void;
}) {
  const loadMore = useEntriesLoadMore({
    mode: "server",
    initialVisibleCount: TOP_REVIEWS_PAGE_SIZE,
    pageSize: TOP_REVIEWS_PAGE_SIZE,
    total: OWALA_TOTAL_REVIEWS,
  });
  const visibleReviews = useMemo(
    () => OWALA_REVIEWS.slice(0, loadMore.visibleCount),
    [loadMore.visibleCount],
  );
  const visibleReviewMedia = useMemo(
    () => flattenEntries(visibleReviews).flattenedMedia as ReviewMedia[],
    [visibleReviews],
  );
  const visibleReviewThumbnailItems = useMemo(
    () =>
      visibleReviewMedia.map((media) => ({
        thumbSrc: mediaThumbSrc(media),
        alt: media.alt,
      })),
    [visibleReviewMedia],
  );

  return (
    <div className={styles.gallery}>
      <GalleryCore layout="entries" fullscreenItems={visibleReviewMedia}>
        <TopReviewsInner
          reviews={visibleReviews}
          thumbnailItems={visibleReviewThumbnailItems}
          visibleCount={visibleReviews.length}
          canLoadMore={loadMore.canLoadMore}
          onLoadMore={loadMore.loadMore}
          loadMorePlugin={loadMore.plugin}
          onOpenCustomerMedia={onOpenCustomerMedia}
        />
      </GalleryCore>
    </div>
  );
}

function ReviewArticle({
  review,
  media,
}: {
  review: OwalaReview;
  media: ReactNode;
}) {
  const articleRef = useRef<HTMLElement | null>(null);
  const bodyRef = useRef<HTMLParagraphElement | null>(null);
  const [revealLayout, setRevealLayout] = useState<ReviewRevealLayout>(
    DEFAULT_REVIEW_REVEAL_LAYOUT,
  );

  useEffect(() => {
    const article = articleRef.current;
    const body = bodyRef.current;
    const row = article?.closest(
      "[data-rmg-entry-owner]",
    ) as HTMLElement | null;

    if (!article || !body || !row) return;

    let frame = 0;
    let latestWidth = 0;

    const applyRowLayout = (layout: ReviewRevealLayout) => {
      row.style.setProperty(
        "--owala-review-reveal-offset",
        `${layout.offset}px`,
      );

      if (layout.needed) {
        row.setAttribute("data-owala-review-reveal-needed", "1");
      } else {
        row.removeAttribute("data-owala-review-reveal-needed");
      }

      if (layout.active) {
        row.setAttribute("data-owala-review-reveal-active", "1");
      } else {
        row.removeAttribute("data-owala-review-reveal-active");
      }
    };

    const measure = () => {
      frame = 0;

      const collapsedHeight = Math.ceil(
        readPixelCustomProperty(article, "--owala-review-body-track") ||
          body.getBoundingClientRect().height,
      );
      const expandedHeight = measureExpandedReviewBodyHeight(body);
      const offset = Math.max(0, expandedHeight - collapsedHeight);
      const needed = offset > 2;
      const active =
        needed && row.getAttribute("data-rmg-entry-reveal-settled") === "1";
      const nextLayout: ReviewRevealLayout = {
        needed,
        active,
        expandedHeight,
        offset: needed ? offset : 0,
      };

      applyRowLayout(nextLayout);
      setRevealLayout((current) =>
        sameReviewRevealLayout(current, nextLayout) ? current : nextLayout,
      );
    };

    const scheduleMeasure = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(measure);
    };

    const mutationObserver = new MutationObserver(scheduleMeasure);
    mutationObserver.observe(row, {
      attributes: true,
      attributeFilter: ["data-rmg-entry-reveal-settled"],
    });

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver((entries) => {
            const nextWidth = Math.round(entries[0]?.contentRect.width ?? 0);

            if (nextWidth === latestWidth) return;
            latestWidth = nextWidth;
            scheduleMeasure();
          });

    resizeObserver?.observe(article);
    window.addEventListener("resize", scheduleMeasure);
    scheduleMeasure();

    const fonts = document.fonts;
    fonts?.ready.then(scheduleMeasure).catch(() => undefined);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      mutationObserver.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
      row.style.removeProperty("--owala-review-reveal-offset");
      row.removeAttribute("data-owala-review-reveal-needed");
      row.removeAttribute("data-owala-review-reveal-active");
    };
  }, [review.body]);

  const reviewRevealStyle: ReviewRevealStyleVars = revealLayout.needed
    ? {
        "--owala-review-body-expanded-height": `${revealLayout.expandedHeight}px`,
      }
    : {};

  return (
    <article
      ref={articleRef}
      className={styles.reviewArticle}
      data-owala-review-reveal-needed={revealLayout.needed ? "1" : undefined}
      data-owala-review-reveal-active={revealLayout.active ? "1" : undefined}
      style={reviewRevealStyle}
    >
      <div className={styles.authorLine}>
        <Avatar review={review} />
        <span className={styles.authorName}>{review.author}</span>
      </div>
      <div className={styles.titleLine}>
        <Stars value={review.rating} />
        <h3>{review.title}</h3>
      </div>
      <p className={styles.reviewDate}>Reviewed in the United States on {review.date}</p>
      <PurchaseMeta review={review} />
      <div className={styles.reviewBodyReveal}>
        <p
          ref={bodyRef}
          className={styles.reviewBody}
          data-owala-review-body-expanded={
            revealLayout.active ? "1" : undefined
          }
        >
          {review.body}
        </p>
      </div>
      <div className={styles.reviewMediaGallery}>{media}</div>
      <p className={styles.helpfulText}>{review.helpful} people found this helpful</p>
      <div className={styles.reviewActions}>
        <button type="button">Helpful</button>
        <span aria-hidden="true" />
        <button type="button">Report</button>
      </div>
    </article>
  );
}

export function OwalaAmazonReviewsSection() {
  const [customerMediaOpen, setCustomerMediaOpen] = useState(false);
  const [customerMediaPrepared, setCustomerMediaPrepared] = useState(false);
  const [customerMediaState, setCustomerMediaState] =
    useState<CustomerMediaDialogState>(DEFAULT_CUSTOMER_MEDIA_DIALOG_STATE);

  return (
    <main className={styles.page}>
      <div className={styles.amazonShell}>
        <ReviewsWithImagesGallery
          customerMediaOpen={customerMediaOpen}
          customerMediaPrepared={customerMediaPrepared}
          customerMediaState={customerMediaState}
          onCustomerMediaStateChange={setCustomerMediaState}
          onOpenCustomerMedia={() => setCustomerMediaOpen(true)}
          onPrepareCustomerMedia={() => setCustomerMediaPrepared(true)}
          onCloseCustomerMedia={() => setCustomerMediaOpen(false)}
        />
        <TopReviewsGallery onOpenCustomerMedia={() => setCustomerMediaOpen(true)} />
      </div>
    </main>
  );
}
