/* eslint-disable @next/next/no-img-element */
'use client';

import { GalleryCore } from "react-motion-gallery/core";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import {
  Entries,
  createEntriesGridMedia,
  flattenEntries,
  type EntryCardRenderArgs,
  type EntryMediaRenderArgs,
  type EntryOverlayRenderArgs,
} from "react-motion-gallery/entries";
import styles from "./entries-grid-demo.module.css";
import { entriesGridSkeletonText } from "./entries-grid.skeleton-text.generated";

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

type EntryGridTextIds = {
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

type GeneratedEntryGridSkeletonText = {
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

const ENTRIES: DemoEntry[] = [
  {
    id: "entry-1",
    section: "Lorem",
    title: "Lorem ipsum dolor sit amet",
    body: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    media: [
      {
        kind: "image",
        src: "https://picsum.photos/id/667/1400/1100",
        alt: "Lorem ipsum image 1",
        description: "A lone runner follows a hillside road into warm sunset light.",
      },
      {
        kind: "image",
        src: "https://picsum.photos/id/675/1400/1100",
        alt: "Lorem ipsum image 2",
        description: "Windblown surf breaks under a dark sky and low coastal sun.",
      },
      {
        kind: "image",
        src: "https://picsum.photos/id/676/1400/1100",
        alt: "Lorem ipsum image 3",
        description: "Snowy ridges tower above dense evergreen slopes.",
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
        src: "https://picsum.photos/id/677/1400/1100",
        alt: "Lorem ipsum image 4",
        description: "Concrete towers frame a clean rectangle of pale sky.",
      },
      {
        kind: "image",
        src: "https://picsum.photos/id/678/1400/1100",
        alt: "Lorem ipsum image 5",
        description: "Two hikers pause below massive alpine walls and autumn trees.",
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
        src: "https://picsum.photos/id/681/1400/1100",
        alt: "Lorem ipsum image 6",
        description: "A dense field of stars hangs above dark tree silhouettes.",
      },
      {
        kind: "image",
        src: "https://picsum.photos/id/683/1400/1100",
        alt: "Lorem ipsum image 7",
        description: "Long star trails sweep over a shadowed mountain horizon.",
      },
      {
        kind: "image",
        src: "https://picsum.photos/id/684/1400/1100",
        alt: "Lorem ipsum image 8",
        description: "Trekkers cross snow beneath sharp peaks and a dark sky.",
      },
      {
        kind: "image",
        src: "https://picsum.photos/id/693/1400/1100",
        alt: "Lorem ipsum image 9",
        description: "The Golden Gate Bridge disappears into rolling fog over the bay.",
      },
    ],
  },
];

const FULLSCREEN_MEDIA = flattenEntries(ENTRIES).flattenedMedia;
const ENTRY_GRID_MEDIA = createEntriesGridMedia({
  gridObject: {
    columns: { 0: 1, 640: 2, 960: 3 },
    gap: 12,
  },
  gridLoading: {
    enabled: false,
  },
});

const ENTRY_GRID_TEXT_IDS: EntryGridTextIds[] = [
  {
    section: "entriesGridEntry01Section",
    title: "entriesGridEntry01Title",
    count: "entriesGridEntry01Count",
    body: "entriesGridEntry01Body",
  },
  {
    section: "entriesGridEntry02Section",
    title: "entriesGridEntry02Title",
    count: "entriesGridEntry02Count",
    body: "entriesGridEntry02Body",
  },
  {
    section: "entriesGridEntry03Section",
    title: "entriesGridEntry03Title",
    count: "entriesGridEntry03Count",
    body: "entriesGridEntry03Body",
  },
];

const ENTRY_GRID_SKELETON_TEXT: GeneratedEntryGridSkeletonText[] =
  ENTRY_GRID_TEXT_IDS.map((textIds) => ({
    section: entriesGridSkeletonText[textIds.section]!,
    title: entriesGridSkeletonText[textIds.title]!,
    count: entriesGridSkeletonText[textIds.count]!,
    body: entriesGridSkeletonText[textIds.body]!,
  }));

function renderEntryCard({ entry, entryIndex, media }: EntryCardRenderArgs) {
  const item = entry as DemoEntry;
  const textIds =
    ENTRY_GRID_TEXT_IDS[entryIndex] ?? ENTRY_GRID_TEXT_IDS[0]!;

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
      className={styles.entryGridImage}
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

function createEntryGridSkeleton(args: {
  entry: DemoEntry | undefined;
  entryIndex: number;
}) {
  const skeletonText =
    ENTRY_GRID_SKELETON_TEXT[args.entryIndex] ??
    ENTRY_GRID_SKELETON_TEXT[0]!;
  const sectionSkeletonText = createBadgeSkeletonText(skeletonText.section);
  const titleSkeletonText = withTextMetrics(skeletonText.title, 17.28, 1.2);
  const countSkeletonText = withTextMetrics(skeletonText.count, 12.48, 1.5);
  const bodySkeletonText = withTextMetrics(skeletonText.body, 15.2, 1.65);
  const countTextWidth = firstBarWidthValue(countSkeletonText.barWidth, "70px");
  const mediaCount = args.entry?.media?.length ?? 2;

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
        {
          kind: "media" as const,
          count: mediaCount,
          direction: "row" as const,
          style: {
            gap: 12,
            wrap: true,
            overflow: "hidden",
          },
          tile: {
            shape: "rect" as const,
            style: {
              0: {
                width: "100%",
                aspectRatio: "4 / 3",
                borderRadius: "16px",
              },
              640: {
                width: "calc((100% - 12px) / 2)",
              },
              960: {
                width: "calc((100% - 24px) / 3)",
              },
            },
          },
        },
      ],
    },
  };
}

export function EntriesGridDemo() {
  return (
    <div className={styles.shell}>
      <GalleryCore layout="entries" fullscreenItems={FULLSCREEN_MEDIA}>
        <Entries
          entries={{
            items: ENTRIES,
            mediaLayout: "grid",
            overlay: {
              overlayCrossfadeTarget: "content",
            },
            render: {
              card: renderEntryCard,
              media: renderEntryMedia,
              overlay: renderEntryOverlay,
            },
            loading: {
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
                createEntryGridSkeleton({
                  entry: entry as DemoEntry,
                  entryIndex,
                }),
            },
          }}
          fullscreen={{ enabled: true }}
          renderMediaContainer={ENTRY_GRID_MEDIA}
        />
        <FullscreenAddon />
      </GalleryCore>
    </div>
  );
}
