/* eslint-disable @next/next/no-img-element */
'use client';

import { useSearchParams } from "next/navigation";
import { GalleryCore } from "react-motion-gallery/core";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { Video } from "react-motion-gallery/video";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import { fullscreenVideo } from "react-motion-gallery/fullscreen/video";
import {
  Entries,
  createEntriesSliderMedia,
  flattenEntries,
  type EntryCardRenderArgs,
  type EntryMediaRenderArgs,
  type EntryOverlayRenderArgs,
} from "react-motion-gallery/entries";
import styles from "./entries-slider-html5-demo.module.css";
import { entriesSliderHtml5SkeletonText } from "./entries-slider-html5.skeleton-text.generated";

type DemoMedia = {
  description: string;
} & (
  | {
      kind: "image";
      src: string;
      alt: string;
      width: number;
      height: number;
    }
  | {
      kind: "video";
      src: string;
      poster: string;
      alt: string;
    }
);

type DemoEntry = {
  id: string;
  section: string;
  title: string;
  body: string;
  media: DemoMedia[];
};

type EntrySliderHtml5TextIds = {
  section: string;
  title: string;
  count: string;
  body: string;
};

type GeneratedSkeletonTextState = {
  lines: number | Record<number, number>;
  barWidth?: string | string[] | Record<number, string | string[]>;
  lastBarWidth?: string | Record<number, string>;
  barHeight?: number | Record<number, number>;
  lineHeight?: number | Record<number, number>;
  responsiveBy?: "viewport" | "container";
};

type GeneratedEntrySliderHtml5SkeletonText = {
  section: GeneratedSkeletonTextState;
  title: GeneratedSkeletonTextState;
  count: GeneratedSkeletonTextState;
  body: GeneratedSkeletonTextState;
};

type ResolvedSkeletonTextState = GeneratedSkeletonTextState & {
  barHeight: number | Record<number, number>;
  lineHeight: number | Record<number, number>;
};

function addPxToBarWidth(
  value: GeneratedSkeletonTextState["barWidth"],
  amount: number
): GeneratedSkeletonTextState["barWidth"] {
  if (typeof value === "string") {
    const match = value.match(/^(-?\d+(?:\.\d+)?)px$/);
    return match ? `${Number(match[1]) + amount}px` : value;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => addPxToBarWidth(entry, amount) as string);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([breakpoint, entry]) => [
        breakpoint,
        addPxToBarWidth(entry, amount),
      ])
    ) as Record<number, string | string[]>;
  }

  return value;
}

function firstBarWidthValue(
  value: GeneratedSkeletonTextState["barWidth"],
  fallback: string
): string {
  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    return firstBarWidthValue(value[0], fallback);
  }

  if (value && typeof value === "object") {
    const firstBreakpoint = Object.keys(value)
      .map(Number)
      .filter(Number.isFinite)
      .sort((a, b) => a - b)[0];

    return firstBreakpoint == null
      ? fallback
      : firstBarWidthValue(value[firstBreakpoint], fallback);
  }

  return fallback;
}

function withTextMetrics(
  text: GeneratedSkeletonTextState,
  fallbackBarHeight: number,
  fallbackLineHeight: number
): ResolvedSkeletonTextState {
  return {
    ...text,
    barHeight: text.barHeight ?? fallbackBarHeight,
    lineHeight: text.lineHeight ?? fallbackLineHeight,
  };
}

function createBadgeSkeletonText(
  text: GeneratedSkeletonTextState
): ResolvedSkeletonTextState {
  return {
    ...text,
    barWidth: addPxToBarWidth(text.barWidth, 20),
    barHeight: 29,
    lineHeight: 1,
  };
}

const VIDEO_MEDIA = {
  waves: {
    src: "https://cdn.react-motion-gallery.com/slider-html/12354535_1920_1080_30fps.mp4",
    poster:
      "https://cdn.react-motion-gallery.com/slider-html-loop/12354535_1920_1080_30fps-0.jpg",
  },
  ridge: {
    src: "https://cdn.react-motion-gallery.com/slider-html/4151824-uhd_3840_2160_25fps.mp4",
    poster:
      "https://cdn.react-motion-gallery.com/slider-html-loop/4151824-uhd_3840_2160_25fps-0.jpg",
  },
  forest: {
    src: "https://cdn.react-motion-gallery.com/slider-html/7677511-hd_1920_1080_25fps.mp4",
    poster:
      "https://cdn.react-motion-gallery.com/slider-html-loop/7677511-hd_1920_1080_25fps-0.jpg",
  },
  night: {
    src: "https://cdn.react-motion-gallery.com/slider-html/9150545-hd_1920_1080_24fps.mp4",
    poster:
      "https://cdn.react-motion-gallery.com/slider-html-loop/9150545-hd_1920_1080_24fps-0.jpg",
  },
};

const ENTRIES: DemoEntry[] = [
  {
    id: "entry-1",
    section: "Lorem",
    title: "Lorem ipsum dolor sit amet",
    body: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    media: [
      {
        kind: "image",
        src: "https://picsum.photos/id/1018/1600/900",
        alt: "Lorem ipsum image 1",
        width: 1600,
        height: 900,
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      },
      {
        kind: "video",
        ...VIDEO_MEDIA.waves,
        alt: "Lorem ipsum video 1",
        description: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      },
      {
        kind: "image",
        src: "https://picsum.photos/id/1015/1600/900",
        alt: "Lorem ipsum image 2",
        width: 1600,
        height: 900,
        description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco.",
      },
    ],
  },
  {
    id: "entry-2",
    section: "Ipsum",
    title: "Ut enim ad minim veniam",
    body: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    media: [
      {
        kind: "video",
        ...VIDEO_MEDIA.ridge,
        alt: "Lorem ipsum video 2",
        description: "Duis aute irure dolor in reprehenderit in voluptate velit esse.",
      },
      {
        kind: "image",
        src: "https://picsum.photos/id/1039/1600/900",
        alt: "Lorem ipsum image 3",
        width: 1600,
        height: 900,
        description: "Cillum dolore eu fugiat nulla pariatur excepteur sint occaecat.",
      },
      {
        kind: "video",
        ...VIDEO_MEDIA.forest,
        alt: "Lorem ipsum video 3",
        description: "Cupidatat non proident sunt in culpa qui officia deserunt.",
      },
    ],
  },
  {
    id: "entry-3",
    section: "Dolor",
    title: "Duis aute irure dolor",
    body: "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    media: [
      {
        kind: "image",
        src: "https://picsum.photos/id/1043/1600/900",
        alt: "Lorem ipsum image 4",
        width: 1600,
        height: 900,
        description: "Mollit anim id est laborum lorem ipsum dolor sit amet.",
      },
      {
        kind: "video",
        ...VIDEO_MEDIA.night,
        alt: "Lorem ipsum video 4",
        description: "Consectetur adipiscing elit sed do eiusmod tempor incididunt.",
      },
    ],
  },
];

const ENTRY_SLIDER_HTML5_TEXT_IDS: EntrySliderHtml5TextIds[] = [
  {
    section: "entriesSliderHtml5Entry01Section",
    title: "entriesSliderHtml5Entry01Title",
    count: "entriesSliderHtml5Entry01Count",
    body: "entriesSliderHtml5Entry01Body",
  },
  {
    section: "entriesSliderHtml5Entry02Section",
    title: "entriesSliderHtml5Entry02Title",
    count: "entriesSliderHtml5Entry02Count",
    body: "entriesSliderHtml5Entry02Body",
  },
  {
    section: "entriesSliderHtml5Entry03Section",
    title: "entriesSliderHtml5Entry03Title",
    count: "entriesSliderHtml5Entry03Count",
    body: "entriesSliderHtml5Entry03Body",
  },
];

const ENTRY_SLIDER_HTML5_SKELETON_TEXT: GeneratedEntrySliderHtml5SkeletonText[] =
  ENTRY_SLIDER_HTML5_TEXT_IDS.map((textIds) => ({
    section: entriesSliderHtml5SkeletonText[textIds.section]!,
    title: entriesSliderHtml5SkeletonText[textIds.title]!,
    count: entriesSliderHtml5SkeletonText[textIds.count]!,
    body: entriesSliderHtml5SkeletonText[textIds.body]!,
  }));

const FULLSCREEN_MEDIA = flattenEntries(ENTRIES).flattenedMedia;
const ENTRY_SLIDER_MEDIA = createEntriesSliderMedia();

function renderEntryCard({ entry, entryIndex, media }: EntryCardRenderArgs) {
  const item = entry as DemoEntry;
  const textIds =
    ENTRY_SLIDER_HTML5_TEXT_IDS[entryIndex] ?? ENTRY_SLIDER_HTML5_TEXT_IDS[0]!;

  return (
    <article className={styles.entryCard}>
      <div className={styles.entryMeta}>
        <div>
          <span
            className={styles.entryKicker}
            data-skeleton-text-id={textIds.section}
          >
            {item.section}
          </span>
          <h3
            className={styles.entryTitle}
            data-skeleton-text-id={textIds.title}
          >
            {item.title}
          </h3>
        </div>
        <span
          className={styles.entryCount}
          data-skeleton-text-id={textIds.count}
        >
          {item.media.length} slides
        </span>
      </div>
      <p className={styles.entryBody} data-skeleton-text-id={textIds.body}>
        {item.body}
      </p>
      <div className={styles.entryMedia}>{media}</div>
    </article>
  );
}

function renderEntryMedia({ media }: EntryMediaRenderArgs) {
  if (media.kind === "video") {
    return (
      <div className={[styles.entrySliderMedia, styles.entrySliderVideoFrame].join(" ")}>
        <div
          className={styles.entrySliderVideoGuard}
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <Video
            src={media.src}
            poster={media.poster}
            alt={media.alt ?? ""}
            className={styles.entrySliderVideo}
          />
        </div>
      </div>
    );
  }

  if (media.kind === "image") {
    return (
      <img
        src={media.src}
        alt={media.alt ?? ""}
        width={media.width}
        height={media.height}
        className={[styles.entrySliderMedia, styles.entrySliderImage].join(" ")}
      />
    );
  }

  return null;
}

function renderEntryOverlay({ entry, media, mediaIndex }: EntryOverlayRenderArgs) {
  const item = entry as DemoEntry;
  const slide = media as DemoMedia | null;

  return (
    <div className={styles.entryOverlay}>
      <span className={styles.entryOverlayKicker}>{item.section}</span>
      <strong className={styles.entryOverlayTitle}>{item.title}</strong>
      <p className={styles.entryOverlayBody}>{item.body}</p>
      <span className={styles.entryOverlayMeta}>Slide {String((mediaIndex ?? 0) + 1)}</span>
      {slide?.description ? (
        <p className={styles.entryOverlayDescription}>{slide.description}</p>
      ) : null}
    </div>
  );
}

function FullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
    plugins: [fullscreenSlider(), fullscreenVideo(), fullscreenZoomPan()],
    fullscreen: {
      enabled: true,
      video: {
        playOnOpen: true,
      },
    },
  });

  return <>{fullscreenNode}</>;
}

function createEntrySliderSkeleton(args: {
  entry: DemoEntry | undefined;
  entryIndex: number;
}) {
  const skeletonText =
    ENTRY_SLIDER_HTML5_SKELETON_TEXT[args.entryIndex] ??
    ENTRY_SLIDER_HTML5_SKELETON_TEXT[0]!;
  const sectionSkeletonText = createBadgeSkeletonText(skeletonText.section);
  const titleSkeletonText = withTextMetrics(skeletonText.title, 17.28, 1.2);
  const countSkeletonText = withTextMetrics(skeletonText.count, 12.48, 1.5);
  const bodySkeletonText = withTextMetrics(skeletonText.body, 15.2, 1.65);
  const countTextWidth = firstBarWidthValue(countSkeletonText.barWidth, "70px");
  const mediaCount = Math.min(3, args.entry?.media?.length ?? 2);

  return {
    layout: {
      kind: "stack" as const,
      style: { padding: 18, gap: 0 },
      children: [
        {
          kind: "row" as const,
          style: {
            justify: "space-between",
            align: "flex-start",
            width: "100%",
            gap: 16,
          },
          children: [
            {
              kind: "col" as const,
              style: {
                gap: 12,
                width: `calc(100% - ${countTextWidth} - 16px)`,
              },
              children: [
                {
                  kind: "text" as const,
                  ...sectionSkeletonText,
                  style: {
                    borderRadius: 999,
                  },
                },
                {
                  kind: "text" as const,
                  ...titleSkeletonText,
                  style: {
                    width: "100%",
                    marginBottom: "6px"
                  },
                },
              ],
            },
            {
              kind: "text" as const,
              ...countSkeletonText,
              style: {
                width: countTextWidth,
                marginTop: 2,
              },
            },
          ],
        },
        {
          kind: "text" as const,
          ...bodySkeletonText,
          style: {
            width: "100%",
            marginBottom: "3px"
          },
        },
        {
          kind: "media" as const,
          count: mediaCount,
          direction: "row" as const,
          style: {
            0: {
              gap: 20,
              justify: "",
              padding: "10px 0 0 0",
              overflow: "hidden",
            },
            1237: {
              justify: `${args.entry?.media?.length === 2 ? "center" : ""}`,
              align: "center",
            },
          },
          tile: {
            shape: "rect" as const,
            style: {
              width: "100%",
              maxWidth: 407,
              aspectRatio: "16 / 9",
              borderRadius: "16px",
            },
          },
        },
      ],
    },
  };
}

export function EntriesSliderHtml5Demo() {
  const searchParams = useSearchParams();
  const showMeasuredContent = searchParams.get("skeletonMeasure") === "content";

  return (
    <GalleryCore layout="entries" fullscreenItems={FULLSCREEN_MEDIA}>
      <Entries
        entries={{
          items: ENTRIES,
          mediaLayout: "slider",
          overlay: {
            overlayCrossfadeTarget: "content",
            placement: {
              xs: "bottom",
              lg: "right",
            },
            width: {
              lg: "32%",
              xl: "28%",
            },
            style: {
              padding: "0",
            },
          },
          render: {
            card: renderEntryCard,
            media: renderEntryMedia,
            overlay: renderEntryOverlay,
          },
          intro: showMeasuredContent
            ? {
                durationMs: 0,
                staggerMs: 0,
              }
            : undefined,
          loading: {
            // force: {
            //   showContent: true
            // },
            waitForDecode: showMeasuredContent ? false : undefined,
            skeletonWrap: {
              style: {
                background: "#fff",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                borderRadius: "16px",
                height: "100%",
                boxShadow: "0 20px 42px rgba(15, 23, 42, 0.08)",
              },
            },
            skeleton: ({ entry, entryIndex }) =>
              createEntrySliderSkeleton({
                entry: entry as DemoEntry,
                entryIndex,
              }),
          },
        }}
        fullscreen={{ enabled: true }}
        renderMediaContainer={ENTRY_SLIDER_MEDIA}
      />
      <FullscreenAddon />
    </GalleryCore>
  );
}
