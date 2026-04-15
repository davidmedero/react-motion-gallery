/* eslint-disable @next/next/no-img-element */
'use client';

import {
  GalleryCore,
  useFullscreenController,
} from "../../../../../../packages/react-motion-gallery/src";
import {
  Entries,
  createEntriesSliderMedia,
  flattenEntries,
  type EntryCardRenderArgs,
  type EntryMediaRenderArgs,
  type EntryOverlayRenderArgs,
} from "../../../../../../packages/react-motion-gallery/src/entries";
import styles from "./entries-slider-demo.module.css";

type DemoEntry = {
  id: string;
  section: string;
  title: string;
  body: string;
  media: Array<{
    kind: "image";
    src: string;
    alt: string;
  }>;
};

const ENTRIES: DemoEntry[] = [
  {
    id: "entry-1",
    section: "Field Notes",
    title: "Canyon Drive",
    body: "A short sequence of warm rock, washed sky, and a narrow road line.",
    media: [
      { kind: "image", src: "https://picsum.photos/seed/e1-1/1400/1100", alt: "Desert canyon road" },
      { kind: "image", src: "https://picsum.photos/seed/e1-2/1400/1100", alt: "Desert ridge at sunset" },
      { kind: "image", src: "https://picsum.photos/seed/e1-3/1400/1100", alt: "Canyon overlook" },
    ],
  },
  {
    id: "entry-2",
    section: "Residence",
    title: "Studio Table",
    body: "Wood grain, stacked paper, and a soft side-light across the room.",
    media: [
      { kind: "image", src: "https://picsum.photos/seed/e2-1/1400/1100", alt: "Desk with books and lamp" },
      { kind: "image", src: "https://picsum.photos/seed/e2-2/1400/1100", alt: "Detail of tabletop objects" },
    ],
  },
  {
    id: "entry-3",
    section: "Travel",
    title: "Dawn Harbor",
    body: "A fuller edit with repeating blues, dock texture, and early morning haze.",
    media: [
      { kind: "image", src: "https://picsum.photos/seed/e3-1/1400/1100", alt: "Boats in a harbor" },
      { kind: "image", src: "https://picsum.photos/seed/e3-2/1400/1100", alt: "Harbor pilings and water" },
      { kind: "image", src: "https://picsum.photos/seed/e3-3/1400/1100", alt: "Harbor deck at sunrise" },
      { kind: "image", src: "https://picsum.photos/seed/e3-4/1400/1100", alt: "Waterfront morning sky" },
    ],
  },
];

const FULLSCREEN_MEDIA = flattenEntries(ENTRIES).flattenedMedia;
const ENTRY_SLIDER_MEDIA = createEntriesSliderMedia();

function renderEntryCard({ entry, media }: EntryCardRenderArgs) {
  const item = entry as DemoEntry;

  return (
    <article className={styles.entryCard}>
      <div className={styles.entryMeta}>
        <div>
          <span className={styles.entryKicker}>{item.section}</span>
          <h3 className={styles.entryTitle}>{item.title}</h3>
        </div>
        <span className={styles.entryCount}>{item.media.length} slides</span>
      </div>
      <p className={styles.entryBody}>{item.body}</p>
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

function renderEntryOverlay({ entry, mediaIndex }: EntryOverlayRenderArgs) {
  const item = entry as DemoEntry;

  return (
    <div className={styles.entryOverlay}>
      <span className={styles.entryOverlayKicker}>{item.section}</span>
      <strong className={styles.entryOverlayTitle}>{item.title}</strong>
      <span className={styles.entryOverlayMeta}>Slide {String((mediaIndex ?? 0) + 1)}</span>
    </div>
  );
}

function FullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
    fullscreen: {
      enabled: true,
    },
  });

  return <>{fullscreenNode}</>;
}

export function EntriesSliderDemo() {
  return (
    <GalleryCore layout="entries" fullscreenItems={FULLSCREEN_MEDIA}>
      <Entries
        entries={{
          items: ENTRIES,
          mediaLayout: "slider",
          overlay: {
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
            // force: true,
            skeletonWrap: {
              style: {
                background: "#fff",
                borderRadius: "22px",
                minHeight: 473,
                height: "100%",
                boxShadow: "0 20px 42px rgba(15, 23, 42, 0.08)",
              },
            },
            skeleton: ({ entry }) => ({
              layout: {
                kind: "stack",
                style: { padding: 18, gap: 16 },
                children: [
                  {
                    kind: "row",
                    style: { justify: "space-between", align: "flex-start", width: "100%", gap: 16 },
                    children: [
                      {
                        kind: "col",
                        style: { gap: 11 },
                        children: [
                          { kind: "rect", style: { height: 30, width: 88, borderRadius: 999 } },
                          { kind: "rect", style: { height: 13, width: 140 } },
                        ],
                      },
                      { kind: "rect", style: { height: 10, width: 52, marginTop: 7 } },
                    ],
                  },
                  {
                    kind: "text",
                    fontSize: 12,
                    lineHeight: 2.2,
                    lines: {
                      0: 2,
                      909: 1
                    },
                    style: {
                      marginTop: 8
                    }
                  },
                  {
                      kind: "media",
                      count: Math.min(3, entry?.media?.length ?? 2),
                      direction: "row",
                      style: {
                        0: { gap: 20, justify: "", padding: '0 0 0 0', overflow: "hidden" },
                        925: { justify: `${entry?.media?.length === 2 ? 'center' : ''}`, align: "center" },
                      },
                      tile: { shape: "rect", style: { width: 407, height: 320 } },
                    },
                ],
              },
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
