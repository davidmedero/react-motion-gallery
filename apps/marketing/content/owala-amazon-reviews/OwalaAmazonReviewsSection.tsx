/* eslint-disable @next/next/no-img-element */
"use client";

import { ChevronRight, X } from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import { GalleryCore, useGalleryCore } from "react-motion-gallery/core";
import {
  useFullscreenController,
  type FullscreenOptions,
} from "react-motion-gallery/fullscreen";
import { fullscreenLazyLoad } from "react-motion-gallery/fullscreen/lazy-load";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
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
import { useEntriesLoadMore } from "react-motion-gallery/entries/load-more";
import { createEntriesSliderMedia } from "react-motion-gallery/entries/media/slider";
import type { SkeletonNode } from "react-motion-gallery/skeleton/base";
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

type ReviewStyleVars = CSSProperties & {
  "--review-photo-tone": string;
  "--review-photo-surface": string;
};

type EntrySkeletonValue = NonNullable<EntriesLoadingOptions["skeleton"]>;
type EntrySkeletonResolver = Extract<
  EntrySkeletonValue,
  (...args: never[]) => unknown
>;
type EntrySkeletonSpec = Exclude<EntrySkeletonValue, EntrySkeletonResolver>;

type SkeletonShapeStyle = Extract<
  SkeletonNode,
  { kind: "rect" | "square" | "circle" }
>["style"];

const CUSTOMER_MEDIA_PAGE_SIZE = 12;
const TOP_REVIEWS_PAGE_SIZE = 12;
const REVIEW_COUNT_FORMATTER = new Intl.NumberFormat("en-US");

const CUSTOMER_MEDIA_FILTERS: Array<{
  id: CustomerMediaFilter;
  label: string;
}> = [
  { id: "all", label: "All" },
  { id: "photos", label: "Photos" },
  { id: "videos", label: "Videos" },
];

function formatReviewCount(value: number) {
  return REVIEW_COUNT_FORMATTER.format(value);
}

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

const topRailMedia = createEntriesSliderMedia({
  sliderObject: {
    layout: {
      gap: 10,
      cellsPerSlide: {
        xs: 1.6,
        sm: 2.7,
        md: 3.7,
        lg: 5.15,
      },
    },
    scroll: {
      loop: true,
      freeScroll: false,
      groupCells: true,
      skipSnaps: true,
      containScroll: true,
    },
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
  virtualization: {
    overscan: 4,
    minItems: 8,
  },
});

const reviewMediaSlider = createEntriesSliderMedia({
  sliderObject: {
    layout: {
      gap: 8,
      preserveCellSize: true,
      cellsPerSlide: {
        xs: 3,
        md: 4,
      },
      centerInsufficientSlides: {
        xs: false,
        md: false,
      },
    },
    scroll: {
      loop: false,
      freeScroll: false,
      groupCells: false,
      skipSnaps: false,
      containScroll: true,
    },
    elements: {
      viewport: {
        className: styles.reviewMediaViewport,
      },
      container: {
        className: styles.reviewMediaContainer,
      },
    },
    plugins: [sliderRipple({ className: styles.sliderRipple })],
  },
});

const fullscreenOptions: FullscreenOptions = {
  enabled: true,
  effects: {
    transitionDuration: {
      transform: 360,
      fade: 360,
    },
    transitionEasing: "cubic-bezier(.2,.65,.2,1)",
  },
  dialog: {
    className: styles.fullscreenDialog,
    opacityDuration: 360,
    opacityEasing: "cubic-bezier(.2,.65,.2,1)",
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
    },
  },
};

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
  overlayCrossfadeDurationMs: 240,
  overlayCrossfadeEasing: "cubic-bezier(.2,.65,.2,1)",
  zoomFade: true,
} satisfies EntryOverlayStyle;

function mediaThumbSrc(media: ReviewMedia) {
  return media.kind === "video" ? media.poster : media.thumbSrc;
}

function fullscreenThumbItems(items: ReviewMedia[]) {
  return items.map((media) => ({
    thumbSrc: mediaThumbSrc(media),
    alt: media.alt,
  }));
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
  {
    media,
    mediaIndex,
    mediaLoading,
    mediaDecoding,
    mediaFetchPriority,
  }: EntryMediaRenderArgs,
  variant: "rail" | "review",
) {
  const reviewMedia = media as ReviewMedia;

  return (
    <ReviewMediaTile
      media={reviewMedia}
      mediaIndex={mediaIndex}
      variant={variant}
      imageLoading={mediaLoading}
      imageDecoding={mediaDecoding}
      imageFetchPriority={mediaFetchPriority}
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
  entryIndex,
  mediaLoading,
  mediaDecoding,
  mediaFetchPriority,
}: EntryMediaRenderArgs) {
  const core = useGalleryCore();
  const customerEntry = entry as CustomerMediaEntry;
  const reviewMedia = media as ReviewMedia;
  const mediaKindLabel = reviewMedia.kind === "video" ? "video" : "photo";

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    core.openFullscreenAt({
      index: entryIndex,
      event: event.nativeEvent,
    });
  };

  return (
    <ReviewMediaTile
      media={reviewMedia}
      mediaIndex={customerEntry.originalIndex}
      variant="modal"
      imageLoading={mediaLoading}
      imageDecoding={mediaDecoding}
      imageFetchPriority={mediaFetchPriority}
      aria-label={`Open customer ${mediaKindLabel} ${customerEntry.originalIndex + 1}`}
      onClick={handleClick}
    />
  );
}

function renderCustomerMediaTile(args: EntryMediaRenderArgs) {
  return <CustomerMediaFullscreenTile {...args} />;
}

function CustomerMediaCard({ media }: EntryCardRenderArgs) {
  return <div className={styles.customerMediaCard}>{media}</div>;
}

function CustomerMediaModal({ onClose }: { onClose: () => void }) {
  const [filter, setFilter] = useState<CustomerMediaFilter>("all");
  const [visibleCount, setVisibleCount] = useState(CUSTOMER_MEDIA_PAGE_SIZE);

  const filteredEntries = useMemo(
    () =>
      CUSTOMER_MEDIA_ENTRIES.filter((entry) =>
        customerMediaMatchesFilter(entry, filter),
      ),
    [filter],
  );
  const visibleEntries = useMemo(
    () => filteredEntries.slice(0, visibleCount),
    [filteredEntries, visibleCount],
  );
  const visibleMedia = useMemo(
    () => visibleEntries.map((entry) => entry.media[0]),
    [visibleEntries],
  );
  const hasMore = visibleCount < filteredEntries.length;
  const infiniteScroll = useEntriesInfiniteScroll({
    hasMore,
    loading: false,
    rootMargin: "360px 0px",
    onLoadMore: () => {
      setVisibleCount((current) =>
        Math.min(current + CUSTOMER_MEDIA_PAGE_SIZE, filteredEntries.length),
      );
    },
    sentinel: (
      <span className={styles.customerMediaSentinel}>
        {hasMore ? "Loading more" : "All media loaded"}
      </span>
    ),
  });

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className={styles.customerMediaModalBackdrop} onClick={onClose}>
      <section
        className={styles.customerMediaDialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="owala-customer-media-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.customerMediaHeader}>
          <h2 id="owala-customer-media-title">Customer photos and videos</h2>
          <button
            className={styles.customerMediaClose}
            type="button"
            aria-label="Close customer media"
            onClick={onClose}
          >
            <X aria-hidden="true" />
          </button>
        </header>
        <div className={styles.customerMediaBody}>
          <div className={styles.customerMediaTabs} role="tablist">
            {CUSTOMER_MEDIA_FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={filter === item.id}
                data-selected={filter === item.id ? "true" : undefined}
                onClick={() => {
                  setFilter(item.id);
                  setVisibleCount(CUSTOMER_MEDIA_PAGE_SIZE);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
          <GalleryCore layout="entries" fullscreenItems={visibleMedia}>
            <Entries
              entries={{
                layout: "grid",
                items: visibleEntries,
                mediaLayout: "grid",
                plugins: [infiniteScroll],
                render: {
                  card: CustomerMediaCard,
                  media: renderCustomerMediaTile,
                  overlay: ReviewOverlay,
                },
                overlay: entryOverlayOptions,
                loading: {
                  enabled: false,
                  minHeight: "var(--owala-customer-media-tile-height)",
                },
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
            <OwalaFullscreenAddon media={visibleMedia} />
          </GalleryCore>
        </div>
      </section>
    </div>
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
      <button className={styles.moreButton} type="button">
        More
      </button>
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

function FullscreenThumbStrip({
  bridge,
  media,
}: {
  bridge: ReturnType<typeof useFullscreenController>["fullscreenThumbnailBridge"];
  media: ReviewMedia[];
}) {
  const items = useMemo(() => fullscreenThumbItems(media), [media]);

  return (
    <FullscreenThumbnailSlider
      bridge={bridge}
      items={items}
      position="bottom"
      containerClassName={styles.fullscreenThumbs}
      containerStyle={{ width: "100vw", height: 96 }}
      thumbnailsContainerWidth="100vw"
      thumbnailsContainerHeight={96}
      thumbnailWidth={74}
      thumbnailHeight={74}
      thumbnailItemClassName={styles.fullscreenThumbItem}
      gap={10}
      freeScroll
      centerActiveThumb
      rippleEnabled
      rippleClassName={styles.sliderRipple}
    />
  );
}

function OwalaFullscreenAddon({ media }: { media: ReviewMedia[] }) {
  const { fullscreenNode, fullscreenThumbnailBridge } = useFullscreenController({
    plugins: [
      fullscreenSlider(),
      fullscreenLazyLoad(),
      fullscreenVideo(),
      fullscreenZoomPan(),
    ],
    fullscreen: fullscreenOptions,
  });

  return (
    <>
      {fullscreenNode}
      <FullscreenThumbStrip bridge={fullscreenThumbnailBridge} media={media} />
    </>
  );
}

const OWALA_ENTRY_SKELETON_DEFAULTS: EntrySkeletonSpec["defaults"] = {
  backgroundColor: "#edf0f0",
  radius: 6,
  shimmer: {
    durationMs: 1180,
    opacity: 0.82,
    c1: "rgba(255, 255, 255, 0.28)",
    c2: "rgba(255, 255, 255, 0.78)",
    c3: "rgba(255, 255, 255, 0.28)",
  },
};

function skeletonRect(style: SkeletonShapeStyle): SkeletonNode {
  return {
    kind: "rect",
    style,
  };
}

function skeletonCircle(style: SkeletonShapeStyle): SkeletonNode {
  return {
    kind: "circle",
    style,
  };
}

function createReviewsWithImagesSkeleton(): EntrySkeletonSpec {
  return {
    minHeight: "100%",
    defaults: OWALA_ENTRY_SKELETON_DEFAULTS,
    layout: {
      kind: "media",
      count: 5,
      direction: "row",
      style: {
        gap: 12,
        overflow: "hidden",
      },
      tile: {
        shape: "rect",
        style: {
          0: {
            width: "calc((100% - 12px) / 1.6)",
            aspectRatio: "1.04 / 1",
            borderRadius: 10,
          },
          701: {
            width: "calc((100% - 24px) / 2.7)",
            aspectRatio: "1.04 / 1",
            borderRadius: 10,
          },
          1024: {
            width: "calc((100% - 48px) / 5)",
            aspectRatio: "1.04 / 1",
            borderRadius: 10,
          },
        },
      },
    },
  };
}

function createTopReviewsSkeleton(entry?: EntryItem): EntrySkeletonSpec {
  const review = entry as OwalaReview | undefined;
  const mediaCount = Math.min(4, Math.max(1, review?.media.length ?? 4));

  return {
    minHeight: "100%",
    defaults: OWALA_ENTRY_SKELETON_DEFAULTS,
    layout: {
      kind: "stack",
      style: {
        gap: 8,
        overflow: "hidden",
      },
      children: [
        {
          kind: "row",
          style: {
            align: "center",
            gap: 14,
            width: "100%",
          },
          children: [
            skeletonCircle({
              width: 44,
              height: 44,
            }),
            skeletonRect({
              width: 118,
              height: 18,
            }),
          ],
        },
        skeletonRect({
          0: {
            width: "min(330px, 86vw)",
            height: 20,
            marginBottom: 30,
          },
          701: {
            width: "min(460px, 78vw)",
            height: 20,
            marginBottom: 6,
          },
        }),
        skeletonRect({
          width: "min(390px, 72vw)",
          height: 16,
          marginBottom: 3,
        }),
        skeletonRect({
          0: {
            width: "min(320px, 62vw)",
            height: 16,
            marginBottom: 6,
          },
          701: {
            width: "min(320px, 62vw)",
            height: 16,
            marginBottom: 4,
          },
        }),
        {
          kind: "stack",
          style: {
            gap: 8,
            maxWidth: 1020,
            overflow: "hidden",
          },
          children: [
            skeletonRect({
              width: "100%",
              height: 17,
            }),
            skeletonRect({
              0: {
                width: "100%",
                height: 17,
                marginBottom: 6,
              },
              701: {
                width: "100%",
                height: 17,
                marginBottom: 10,
              },
            }),
          ],
        },
        {
          kind: "media",
          count: mediaCount,
          direction: "row",
          style: {
            0: {
              gap: 8,
              width: "min(100%, 328px)",
              overflow: "hidden",
            },
            701: {
              gap: 8,
              width: "min(100%, 472px)",
              overflow: "hidden",
            },
          },
          tile: {
            shape: "rect",
            style: {
              width: "var(--review-media-slider-height)",
              height: "var(--review-media-slider-height)",
              borderRadius: 6,
            },
          },
        },
        skeletonRect({
          width: 220,
          height: 16,
          marginBottom: 4,
        }),
        {
          kind: "row",
          style: {
            align: "center",
            gap: 14,
            width: "100%",
            overflow: "hidden",
          },
          children: [
            skeletonRect({
              width: 134,
              height: 36,
              borderRadius: 999,
            }),
            skeletonRect({
              width: 56,
              height: 16,
            }),
          ],
        },
      ],
    },
  };
}

const REVIEWS_WITH_IMAGES_SKELETON = createReviewsWithImagesSkeleton();

function ReviewsWithImagesInner() {
  const [customerMediaOpen, setCustomerMediaOpen] = useState(false);

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
              onClick={() => setCustomerMediaOpen(true)}
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
              loading: {
                minHeight: "var(--owala-photo-strip-entry-height)",
                skeleton: REVIEWS_WITH_IMAGES_SKELETON,
                skeletonWrap: {
                  className: styles.entrySkeletonWrap,
                },
              },
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
      {customerMediaOpen ? (
        <CustomerMediaModal onClose={() => setCustomerMediaOpen(false)} />
      ) : null}
      <OwalaFullscreenAddon media={TOP_RAIL_FULLSCREEN_MEDIA as ReviewMedia[]} />
    </>
  );
}

function ReviewsWithImagesGallery() {
  return (
    <div className={styles.gallery}>
      <GalleryCore layout="entries" fullscreenItems={TOP_RAIL_FULLSCREEN_MEDIA}>
        <ReviewsWithImagesInner />
      </GalleryCore>
    </div>
  );
}

type TopReviewsInnerProps = {
  reviews: OwalaReview[];
  reviewMedia: ReviewMedia[];
  visibleCount: number;
  canLoadMore: boolean;
  onLoadMore: () => void;
  loadMorePlugin: ReturnType<typeof useEntriesLoadMore>["plugin"];
};

function TopReviewsInner({
  reviews,
  reviewMedia,
  visibleCount,
  canLoadMore,
  onLoadMore,
  loadMorePlugin,
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
              plugins: [loadMorePlugin],
              entryList: {
                className: styles.reviewList,
              },
              render: {
                card: ReviewArticleCard,
                media: (args) => renderReviewMediaTile(args, "review"),
                overlay: ReviewOverlay,
              },
              overlay: entryOverlayOptions,
              loading: {
                minHeight: "var(--owala-review-entry-height)",
                // exitMs: 80,
                skeleton: ({ entry }) => createTopReviewsSkeleton(entry),
                skeletonWrap: {
                  className: styles.entrySkeletonWrap,
                },
              },
              reveal: {
                // durationMs: 120,
                staggerMs: 0,
              },
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
      <OwalaFullscreenAddon media={reviewMedia} />
    </>
  );
}

function TopReviewsGallery() {
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

  return (
    <div className={styles.gallery}>
      <GalleryCore layout="entries" fullscreenItems={visibleReviewMedia}>
        <TopReviewsInner
          reviews={visibleReviews}
          reviewMedia={visibleReviewMedia}
          visibleCount={visibleReviews.length}
          canLoadMore={loadMore.canLoadMore}
          onLoadMore={loadMore.loadMore}
          loadMorePlugin={loadMore.plugin}
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
  const [showFullReview, setShowFullReview] = useState(false);
  const fullReviewId = `${review.id}-full-copy`;

  return (
    <article className={styles.reviewArticle}>
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
      <p className={styles.reviewBody}>{review.body}</p>
      <div className={styles.reviewMediaGallery}>{media}</div>
      <p className={styles.helpfulText}>{review.helpful} people found this helpful</p>
      <div className={styles.reviewActions}>
        <button type="button">Helpful</button>
        <span aria-hidden="true" />
        <button type="button">Report</button>
        <span aria-hidden="true" />
        <button
          className={styles.reviewMoreButton}
          type="button"
          aria-expanded={showFullReview}
          aria-controls={fullReviewId}
          onClick={() => setShowFullReview((value) => !value)}
        >
          More
        </button>
      </div>
      {showFullReview ? (
        <div
          id={fullReviewId}
          className={styles.reviewFullCopyPanel}
          role="region"
          aria-label={`Full review from ${review.author}`}
        >
          <button
            className={styles.reviewFullCopyClose}
            type="button"
            aria-label="Hide full review"
            onClick={() => setShowFullReview(false)}
          >
            <X aria-hidden="true" />
          </button>
          <p>{review.body}</p>
        </div>
      ) : null}
    </article>
  );
}

export function OwalaAmazonReviewsSection() {
  return (
    <main className={styles.page}>
      <div className={styles.amazonShell}>
        <ReviewsWithImagesGallery />
        <TopReviewsGallery />
      </div>
    </main>
  );
}
