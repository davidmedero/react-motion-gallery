/* eslint-disable @next/next/no-img-element */
'use client';

import {
  GalleryCore,
  useFullscreenController,
} from "../../../../../../packages/react-motion-gallery/src";
import {
  Entries,
  createEntriesMasonryMedia,
  flattenEntries,
  type EntryCardRenderArgs,
  type EntryMediaRenderArgs,
  type EntryOverlayRenderArgs,
} from "../../../../../../packages/react-motion-gallery/src/entries";
import styles from "./entries-masonry-demo.module.css";

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
    section: "Residence",
    title: "Stone Courtyard",
    body: "Mixed aspect ratios keep the entry feeling more editorial than uniform.",
    media: [
      { kind: "image", src: "https://picsum.photos/seed/e1-1/1400/900", alt: "Stone courtyard in sunlight" },
      { kind: "image", src: "https://picsum.photos/seed/e1-2/1200/1200", alt: "Square courtyard detail" },
      { kind: "image", src: "https://picsum.photos/seed/e1-3/1300/1600", alt: "Tall entryway photograph" },
    ],
  },
  {
    id: "entry-2",
    section: "Product",
    title: "Leather Notes",
    body: "A smaller group still benefits from the looser masonry rhythm.",
    media: [
      { kind: "image", src: "https://picsum.photos/seed/e2-1/1100/800", alt: "Leather notebook on a desk" },
      { kind: "image", src: "https://picsum.photos/seed/e2-2/1200/1000", alt: "Product close-up with warm light" },
    ],
  },
  {
    id: "entry-3",
    section: "Travel",
    title: "Cliff Walk",
    body: "The final entry stacks four frames so the masonry version gets the tallest spread.",
    media: [
      { kind: "image", src: "https://picsum.photos/seed/e3-1/1000/1500", alt: "Tall cliffside footpath" },
      { kind: "image", src: "https://picsum.photos/seed/e3-2/1400/1100", alt: "Coastal path in daylight" },
      { kind: "image", src: "https://picsum.photos/seed/e3-3/1100/900", alt: "Stone wall and sea view" },
      { kind: "image", src: "https://picsum.photos/seed/e3-4/1500/1300", alt: "Wide cliff horizon" },
    ],
  },
];

const FULLSCREEN_MEDIA = flattenEntries(ENTRIES).flattenedMedia;
const ENTRY_MASONRY_MEDIA = createEntriesMasonryMedia({
  masonryObject: {
    columns: { 0: 2, 920: 3 },
    gap: 12,
  },
});

function renderEntryCard({ entry, media }: EntryCardRenderArgs) {
  const item = entry as DemoEntry;

  return (
    <article className={styles.entryCard}>
      <div className={styles.entryMeta}>
        <div>
          <span className={styles.entryKicker}>{item.section}</span>
          <h3 className={styles.entryTitle}>{item.title}</h3>
        </div>
        <span className={styles.entryCount}>{item.media.length} pins</span>
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
      className={styles.entryMasonryImage}
    />
  );
}

function renderEntryOverlay({ entry, mediaIndex }: EntryOverlayRenderArgs) {
  const item = entry as DemoEntry;

  return (
    <div className={styles.entryOverlay}>
      <span className={styles.entryOverlayKicker}>{item.section}</span>
      <strong className={styles.entryOverlayTitle}>{item.title}</strong>
      <span className={styles.entryOverlayMeta}>Pin {String((mediaIndex ?? 0) + 1)}</span>
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

export function EntriesMasonryDemo() {
  return (
    <div className={styles.shell}>
      <GalleryCore layout="entries" fullscreenItems={FULLSCREEN_MEDIA}>
        <Entries
          entries={{
            items: ENTRIES,
            mediaLayout: "masonry",
            render: {
              card: renderEntryCard,
              media: renderEntryMedia,
              overlay: renderEntryOverlay,
            },
          }}
          fullscreen={{ enabled: true }}
          renderMediaContainer={ENTRY_MASONRY_MEDIA}
        />
        <FullscreenAddon />
      </GalleryCore>
    </div>
  );
}
