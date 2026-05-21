export const source = `/* eslint-disable @next/next/no-img-element */
'use client';

import { GalleryCore } from "react-motion-gallery/core";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import {
  Entries,
  createEntriesMasonryMedia,
  flattenEntries,
  type EntryCardRenderArgs,
  type EntryMediaRenderArgs,
  type EntryOverlayRenderArgs,
} from "react-motion-gallery/entries/cache";
import styles from "./entries-masonry-demo.module.css";
import { entriesMasonrySkeletonText } from "./entries-masonry.skeleton-text.generated";
import { demoSkeletonCache } from "../../skeleton-cache";

type DemoEntry = {
  id: string;
  section: string;
  title: string;
  body: string;
  media: Array<{
    kind: "image";
    src: string;
    alt: string;
    description: string;
  }>;
};

type EntryMasonryTextIds = {
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

type GeneratedEntryMasonrySkeletonText = {
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
    const match = value.match(/^(-?\\d+(?:\\.\\d+)?)px$/);
    return match ? \`\${Number(match[1]) + amount}px\` : value;
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

const ENTRIES: DemoEntry[] = [
  {
    id: "entry-1",
    section: "Lorem",
    title: "Lorem ipsum dolor sit amet",
    body: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    media: [
      {
        kind: "image",
        src: "https://picsum.photos/id/701/1400/900",
        alt: "Lorem ipsum image 1",
        description: "Blue wildflowers fill the foreground beneath a soft cloudy sky.",
      },
      {
        kind: "image",
        src: "https://picsum.photos/id/702/1200/1200",
        alt: "Lorem ipsum image 2",
        description: "Steep green cliffs drop into a pale beach and turquoise surf.",
      },
      {
        kind: "image",
        src: "https://picsum.photos/id/704/1300/1600",
        alt: "Lorem ipsum image 3",
        description: "Bamboo trunks rise in tight verticals toward a leafy canopy.",
      },
      {
        kind: "image",
        src: "https://picsum.photos/id/715/1000/1350",
        alt: "Lorem ipsum image 4",
        description: "Pink and orange sunset clouds spread over a calm ocean horizon.",
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
        kind: "image",
        src: "https://picsum.photos/id/717/1100/800",
        alt: "Lorem ipsum image 5",
        description: "Wild coastal grasses and yellow flowers overlook deep blue water.",
      },
      {
        kind: "image",
        src: "https://picsum.photos/id/723/1200/1000",
        alt: "Lorem ipsum image 6",
        description: "Soft clouds drift across a starry night sky.",
      },
      {
        kind: "image",
        src: "https://picsum.photos/id/732/900/1300",
        alt: "Lorem ipsum image 7",
        description: "Dark coastal rocks sit below a misty horizon and pale open sky.",
      },
      {
        kind: "image",
        src: "https://picsum.photos/id/733/1400/850",
        alt: "Lorem ipsum image 8",
        description: "Snowy peaks break through a bright layer of clouds.",
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
        src: "https://picsum.photos/id/741/1000/1500",
        alt: "Lorem ipsum image 9",
        description: "Towering cumulus clouds glow warmly against a deep blue sky.",
      },
      {
        kind: "image",
        src: "https://picsum.photos/id/744/1400/1100",
        alt: "Lorem ipsum image 10",
        description: "The Golden Gate spans fog and blue water with a sailboat below.",
      },
      {
        kind: "image",
        src: "https://picsum.photos/id/756/1100/900",
        alt: "Lorem ipsum image 11",
        description: "Foamy surf reaches the beach below the Golden Gate Bridge.",
      },
      {
        kind: "image",
        src: "https://picsum.photos/id/767/1500/1300",
        alt: "Lorem ipsum image 12",
        description: "A straight road runs between tall pine rows toward a distant vanishing point.",
      },
    ],
  },
];

const FULLSCREEN_MEDIA = flattenEntries(ENTRIES).flattenedMedia;
const ENTRY_MASONRY_MEDIA = createEntriesMasonryMedia({
  masonryObject: {
    columns: { 0: 2, 920: 3 },
    gap: 12,
  },
  masonryLoading: {
    enabled: false,
  },
});

const ENTRY_MASONRY_TEXT_IDS: EntryMasonryTextIds[] = [
  {
    section: "entriesMasonryEntry01Section",
    title: "entriesMasonryEntry01Title",
    count: "entriesMasonryEntry01Count",
    body: "entriesMasonryEntry01Body",
  },
  {
    section: "entriesMasonryEntry02Section",
    title: "entriesMasonryEntry02Title",
    count: "entriesMasonryEntry02Count",
    body: "entriesMasonryEntry02Body",
  },
  {
    section: "entriesMasonryEntry03Section",
    title: "entriesMasonryEntry03Title",
    count: "entriesMasonryEntry03Count",
    body: "entriesMasonryEntry03Body",
  },
];

const ENTRY_MASONRY_SKELETON_TEXT: GeneratedEntryMasonrySkeletonText[] =
  ENTRY_MASONRY_TEXT_IDS.map((textIds) => ({
    section: entriesMasonrySkeletonText[textIds.section]!,
    title: entriesMasonrySkeletonText[textIds.title]!,
    count: entriesMasonrySkeletonText[textIds.count]!,
    body: entriesMasonrySkeletonText[textIds.body]!,
  }));

const ENTRY_MASONRY_MEDIA_ASPECT_RATIOS = [
  ["1400 / 900", "1200 / 1200", "1300 / 1600", "1000 / 1350"],
  ["1100 / 800", "1200 / 1000", "900 / 1300", "1400 / 850"],
  ["1000 / 1500", "1400 / 1100", "1100 / 900", "1500 / 1300"],
];

const ENTRY_MASONRY_MEDIA_COLUMN_ORDERS = [
  {
    two: [[0, 2], [1, 3]],
    three: [[0, 3], [1], [2]],
  },
  {
    two: [[0, 2], [1, 3]],
    three: [[0, 3], [1], [2]],
  },
  {
    two: [[0, 3], [1, 2]],
    three: [[0], [1, 3], [2]],
  },
];

function renderEntryCard({ entry, entryIndex, media }: EntryCardRenderArgs) {
  const item = entry as DemoEntry;
  const textIds =
    ENTRY_MASONRY_TEXT_IDS[entryIndex] ?? ENTRY_MASONRY_TEXT_IDS[0]!;

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
          {item.media.length} tiles
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
  if (media.kind !== "image") return null;

  return (
    <img
      src={media.src}
      alt={media.alt ?? ""}
      className={styles.entryMasonryImage}
    />
  );
}

function renderEntryOverlay({ entry, media, mediaIndex }: EntryOverlayRenderArgs) {
  const item = entry as DemoEntry;
  const slide = media as DemoEntry["media"][number] | null;

  return (
    <div className={styles.entryOverlay}>
      <span className={styles.entryOverlayKicker}>{item.section}</span>
      <strong className={styles.entryOverlayTitle}>{item.title}</strong>
      <p className={styles.entryOverlayBody}>{item.body}</p>
      <span className={styles.entryOverlayMeta}>Tile {String((mediaIndex ?? 0) + 1)}</span>
      {slide?.description ? (
        <p className={styles.entryOverlayDescription}>{slide.description}</p>
      ) : null}
    </div>
  );
}

function FullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
    plugins: [fullscreenSlider(), fullscreenZoomPan()],
    fullscreen: {
      enabled: true,
    },
  });

  return <>{fullscreenNode}</>;
}

function createMasonryMediaSkeletonGroup(args: {
  aspectRatios: string[];
  columns: number[][];
  columnWidth: string;
  style: Record<string, unknown>;
}) {
  return {
    kind: "row" as const,
    style: {
      gap: 12,
      width: "100%",
      align: "flex-start",
      overflow: "hidden",
      ...args.style,
    },
    children: args.columns.map((indexes) => ({
      kind: "col" as const,
      style: {
        gap: 12,
        width: args.columnWidth,
      },
      children: indexes.map((index) => ({
        kind: "rect" as const,
        style: {
          width: "100%",
          aspectRatio: args.aspectRatios[index] ?? "4 / 3",
          borderRadius: "16px",
        },
      })),
    })),
  };
}

function createEntryMasonrySkeleton(args: {
  entry: DemoEntry | undefined;
  entryIndex: number;
}) {
  const skeletonText =
    ENTRY_MASONRY_SKELETON_TEXT[args.entryIndex] ??
    ENTRY_MASONRY_SKELETON_TEXT[0]!;
  const sectionSkeletonText = createBadgeSkeletonText(skeletonText.section);
  const titleSkeletonText = withTextMetrics(skeletonText.title, 17.28, 1.2);
  const countSkeletonText = withTextMetrics(skeletonText.count, 12.48, 1.5);
  const bodySkeletonText = withTextMetrics(skeletonText.body, 15.2, 1.65);
  const countTextWidth = firstBarWidthValue(countSkeletonText.barWidth, "70px");
  const aspectRatios =
    ENTRY_MASONRY_MEDIA_ASPECT_RATIOS[args.entryIndex] ??
    ENTRY_MASONRY_MEDIA_ASPECT_RATIOS[0]!;
  const mediaColumns =
    ENTRY_MASONRY_MEDIA_COLUMN_ORDERS[args.entryIndex] ??
    ENTRY_MASONRY_MEDIA_COLUMN_ORDERS[0]!;

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
                width: \`calc(100% - \${countTextWidth} - 16px)\`,
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
                    marginBottom: "6px",
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
            marginBottom: "12px",
          },
        },
        createMasonryMediaSkeletonGroup({
          aspectRatios,
          columns: mediaColumns.two,
          columnWidth: "calc((100% - 12px) / 2)",
          style: {
            display: "flex",
            920: {
              display: "none",
            },
          },
        }),
        createMasonryMediaSkeletonGroup({
          aspectRatios,
          columns: mediaColumns.three,
          columnWidth: "calc((100% - 24px) / 3)",
          style: {
            display: "none",
            920: {
              display: "flex",
            },
          },
        }),
      ],
    },
  };
}

export function EntriesMasonryDemo() {
  return (
    <div className={styles.shell}>
      <GalleryCore layout="entries" fullscreenItems={FULLSCREEN_MEDIA}>
        <Entries
          entries={{
            items: ENTRIES,
            mediaLayout: "masonry",
            overlay: {
              overlayCrossfadeTarget: "content",
            },
            render: {
              card: renderEntryCard,
              media: renderEntryMedia,
              overlay: renderEntryOverlay,
            },
            loading: {
              cache: demoSkeletonCache("entries-masonry"),
              // force: {
              //   showContent: true,
              //   skeletonOpacity: 0.5,
              // },
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
                createEntryMasonrySkeleton({
                  entry: entry as DemoEntry,
                  entryIndex,
                }),
            },
          }}
          fullscreen={{ enabled: true }}
          renderMediaContainer={ENTRY_MASONRY_MEDIA}
        />
        <FullscreenAddon />
      </GalleryCore>
    </div>
  );
}`;
