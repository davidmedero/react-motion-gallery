export const source = `/* eslint-disable @next/next/no-img-element */
"use client";

import { GalleryCore } from "react-motion-gallery/core";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import {
  Entries,
  createEntriesSliderMedia,
  flattenEntries,
  type EntryCardRenderArgs,
  type EntryMediaRenderArgs,
  type EntryOverlayRenderArgs,
} from "react-motion-gallery/entries/cache";
import styles from "./entries-slider-demo.module.css";
import { entriesSliderSkeletonText } from "./entries-slider.skeleton-text.generated";
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

type EntrySliderTextIds = {
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

type GeneratedEntrySliderSkeletonText = {
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
  amount: number,
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
      ]),
    ) as Record<number, string | string[]>;
  }

  return value;
}

function firstBarWidthValue(
  value: GeneratedSkeletonTextState["barWidth"],
  fallback: string,
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
  fallbackLineHeight: number,
): ResolvedSkeletonTextState {
  return {
    ...text,
    barHeight: text.barHeight ?? fallbackBarHeight,
    lineHeight: text.lineHeight ?? fallbackLineHeight,
  };
}

function createBadgeSkeletonText(
  text: GeneratedSkeletonTextState,
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
        src: "https://picsum.photos/id/640/1400/1100",
        alt: "Lorem ipsum image 1",
        description:
          "Foamy turquoise waves roll diagonally across a wide sandy beach.",
      },
      {
        kind: "image",
        src: "https://picsum.photos/id/643/1400/1100",
        alt: "Lorem ipsum image 2",
        description:
          "A surfboard rests on wet sand as sunset flares over the shoreline.",
      },
      {
        kind: "image",
        src: "https://picsum.photos/id/645/1400/1100",
        alt: "Lorem ipsum image 3",
        description:
          "Palm crowns lean into a soft tropical sky lit by late-day sun.",
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
        src: "https://picsum.photos/id/649/1400/1100",
        alt: "Lorem ipsum image 4",
        description:
          "Dry golden grass catches light in a shallow-focus woodland clearing.",
      },
      {
        kind: "image",
        src: "https://picsum.photos/id/651/1400/1100",
        alt: "Lorem ipsum image 5",
        description:
          "Waterfalls cut through rocky highlands beneath a low bank of cloud.",
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
        src: "https://picsum.photos/id/653/1400/1100",
        alt: "Lorem ipsum image 6",
        description:
          "Silhouettes sit on a glowing beach as surf wraps around distant headlands.",
      },
      {
        kind: "image",
        src: "https://picsum.photos/id/658/1400/1100",
        alt: "Lorem ipsum image 7",
        description:
          "Storm clouds gather over pale cliffs and dark, sheltered water.",
      },
      {
        kind: "image",
        src: "https://picsum.photos/id/664/1400/1100",
        alt: "Lorem ipsum image 8",
        description:
          "Snowy alpine peaks rise above a shadowed valley at blue hour.",
      },
      {
        kind: "image",
        src: "https://picsum.photos/id/666/1400/1100",
        alt: "Lorem ipsum image 9",
        description: "Tall bamboo stems frame a bright green canopy overhead.",
      },
    ],
  },
];

const ENTRY_SLIDER_TEXT_IDS: EntrySliderTextIds[] = [
  {
    section: "entriesSliderEntry01Section",
    title: "entriesSliderEntry01Title",
    count: "entriesSliderEntry01Count",
    body: "entriesSliderEntry01Body",
  },
  {
    section: "entriesSliderEntry02Section",
    title: "entriesSliderEntry02Title",
    count: "entriesSliderEntry02Count",
    body: "entriesSliderEntry02Body",
  },
  {
    section: "entriesSliderEntry03Section",
    title: "entriesSliderEntry03Title",
    count: "entriesSliderEntry03Count",
    body: "entriesSliderEntry03Body",
  },
];

const ENTRY_SLIDER_SKELETON_TEXT: GeneratedEntrySliderSkeletonText[] =
  ENTRY_SLIDER_TEXT_IDS.map((textIds) => ({
    section: entriesSliderSkeletonText[textIds.section]!,
    title: entriesSliderSkeletonText[textIds.title]!,
    count: entriesSliderSkeletonText[textIds.count]!,
    body: entriesSliderSkeletonText[textIds.body]!,
  }));

const FULLSCREEN_MEDIA = flattenEntries(ENTRIES).flattenedMedia;
const ENTRY_SLIDER_MEDIA = createEntriesSliderMedia();

function renderEntryCard({ entry, entryIndex, media }: EntryCardRenderArgs) {
  const item = entry as DemoEntry;
  const textIds =
    ENTRY_SLIDER_TEXT_IDS[entryIndex] ?? ENTRY_SLIDER_TEXT_IDS[0]!;

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
  if (media.kind !== "image") return null;

  return (
    <img
      src={media.src}
      alt={media.alt ?? ""}
      className={styles.entrySliderImage}
    />
  );
}

function renderEntryOverlay({
  entry,
  media,
  mediaIndex,
}: EntryOverlayRenderArgs) {
  const item = entry as DemoEntry;
  const slide = media as DemoEntry["media"][number] | null;

  return (
    <div className={styles.entryOverlay}>
      <span className={styles.entryOverlayKicker}>{item.section}</span>
      <strong className={styles.entryOverlayTitle}>{item.title}</strong>
      <p className={styles.entryOverlayBody}>{item.body}</p>
      <span className={styles.entryOverlayMeta}>
        Slide {String((mediaIndex ?? 0) + 1)}
      </span>
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

function createEntrySliderSkeleton(args: {
  entry: DemoEntry | undefined;
  entryIndex: number;
}) {
  const skeletonText =
    ENTRY_SLIDER_SKELETON_TEXT[args.entryIndex] ??
    ENTRY_SLIDER_SKELETON_TEXT[0]!;
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
            marginBottom: "3px",
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
              justify: \`\${args.entry?.media?.length === 2 ? "center" : ""}\`,
              align: "center",
            },
          },
          tile: {
            shape: "rect" as const,
            style: {
              width: "100%",
              maxWidth: 407,
              aspectRatio: "407 / 320",
              borderRadius: "16px",
            },
          },
        },
      ],
    },
  };
}

export function EntriesSliderDemo() {
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
          loading: {
            cache: demoSkeletonCache("entries-slider"),
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
`;
