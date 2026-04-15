/* eslint-disable @next/next/no-img-element */
'use client';

import type { CSSProperties } from "react";
import {
  GalleryCore,
  Grid,
  toMediaItems,
  useFullscreenController,
} from "../../../../../../packages/react-motion-gallery/src";
import type { GridSkeletonSpec } from "../../../../../../packages/react-motion-gallery/src/Gallery/grid/GridSkeleton";
import styles from "./grid-template-columns-demo.module.css";

const ITEMS = [
  {
    imageSrc: "https://picsum.photos/id/1060/1600/1200",
    fullscreenSrc: "https://picsum.photos/id/1060/2400/1800",
    badge: "Campaign",
    meta: "Hero Spread",
    eyebrow: "Feature",
    title: "Spring materials story",
    body:
      "Lead with a wider editorial card, then let the supporting notes settle into the remaining tracks.",
    chips: ["Stone", "Oak", "Daylight"],
    stats: [
      { label: "Shots", value: "24" },
      { label: "Rooms", value: "6" },
    ],
    variant: "feature",
    accent: "#155e75",
    accentSoft: "rgba(21, 94, 117, 0.14)",
    span: { 0: "full" as const, 1200: 2 },
  },
  {
    imageSrc: "https://picsum.photos/id/1062/1400/1100",
    fullscreenSrc: "https://picsum.photos/id/1062/2400/1885",
    badge: "Editorial",
    meta: "Desk Notes",
    eyebrow: "Research",
    title: "Layered references",
    body:
      "A note-heavy card can sit in the narrow column without losing hierarchy or breathing room.",
    chips: ["Moodboard", "Props"],
    notes: [
      "Pin detail crops close to the lead story.",
      "Keep layout notes in the narrow rail.",
    ],
    variant: "note",
    accent: "#7c2d12",
    accentSoft: "rgba(124, 45, 18, 0.16)",
    span: { 0: "full" as const, 1200: 1 },
  },
  {
    imageSrc: "https://picsum.photos/id/1064/1500/1100",
    fullscreenSrc: "https://picsum.photos/id/1064/2400/1760",
    badge: "Lookbook",
    meta: "Wide Card",
    eyebrow: "Layout",
    title: "Room-set follow up",
    body:
      "The second row can still feel cinematic by flipping the media and copy arrangement for contrast.",
    chips: ["Dining", "Neutral", "Shadow"],
    stats: [
      { label: "Angles", value: "11" },
      { label: "Assets", value: "42" },
    ],
    variant: "wide",
    accent: "#92400e",
    accentSoft: "rgba(146, 64, 14, 0.14)",
    span: { 0: "full" as const, 1200: 2 },
  },
  {
    imageSrc: "https://picsum.photos/id/1065/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/1065/2400/3000",
    badge: "Casting",
    meta: "Compact",
    eyebrow: "Faces",
    title: "Quiet portrait",
    body: "Compact cards keep the last column from feeling like leftover space.",
    chips: ["Wardrobe", "Natural"],
    variant: "compact",
    accent: "#1d4ed8",
    accentSoft: "rgba(29, 78, 216, 0.12)",
    span: { 0: "full" as const, 1200: 1 },
  },
  {
    imageSrc: "https://picsum.photos/id/1067/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/1067/2400/3000",
    badge: "Palette",
    meta: "Compact",
    eyebrow: "Color",
    title: "Finish study",
    body: "A second compact tile rounds out the grid without flattening the column rhythm.",
    chips: ["Warm Grey", "Plaster"],
    variant: "compact",
    accent: "#047857",
    accentSoft: "rgba(4, 120, 87, 0.12)",
    span: { 0: "full" as const, 1200: 1 },
  },
];

const VARIANT_CLASS_NAMES: Record<(typeof ITEMS)[number]["variant"], string> = {
  feature: styles.cardFeature,
  wide: styles.cardWide,
  note: styles.cardNote,
  compact: styles.cardCompact,
};

const TEMPLATE_COLUMNS = {
  0: "minmax(0, 1fr)",
  820: "minmax(0, 1.2fr) minmax(240px, 0.8fr)",
  1200: "minmax(0, 1.55fr) minmax(0, 0.95fr) minmax(220px, 0.72fr)",
};

const GRID_TEMPLATE_COLUMNS_SKELETON: GridSkeletonSpec = {
  radius: 20,
  layout: {
    kind: "grid",
    item: {
      kind: "col",
      style: {
        gap: 14,
      },
      children: [
        {
          kind: "rect",
          style: {
            width: "100%",
            aspectRatio: "4 / 5",
            borderRadius: 20,
          },
        },
        {
          kind: "text",
          fontSize: 12,
          lineHeight: 1.2,
          style: {
            width: "38%",
          },
        },
        {
          kind: "text",
          fontSize: 18,
          lineHeight: 1.1,
          lines: 2,
          lineWidth: "64%",
          style: {
            width: "92%",
          },
        },
        {
          kind: "text",
          fontSize: 14,
          lineHeight: 1.6,
          lines: 3,
          lineWidth: "58%",
          style: {
            width: "100%",
          },
        },
      ],
    },
  },
};

function TemplateColumnsCard(props: {
  item: (typeof ITEMS)[number];
  index: number;
}) {
  const { item, index } = props;
  const cardStyle = {
    "--grid-template-accent": item.accent,
    "--grid-template-accent-soft": item.accentSoft,
  } as CSSProperties;

  return (
    <article
      className={[styles.card, VARIANT_CLASS_NAMES[item.variant]].join(" ")}
      style={cardStyle}
    >
      <div className={styles.mediaWrap}>
        <img src={item.imageSrc} alt={item.title} className={styles.media} />
        <div className={styles.mediaShade} />
        <span className={styles.mediaEyebrow}>{item.eyebrow}</span>
        <span className={styles.mediaIndex}>
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.badge}>{item.badge}</span>
          <span className={styles.meta}>{item.meta}</span>
        </div>

        <strong className={styles.title}>{item.title}</strong>
        <p className={styles.body}>{item.body}</p>

        {item.stats ? (
          <dl className={styles.stats}>
            {item.stats.map((stat) => (
              <div key={stat.label} className={styles.stat}>
                <dt className={styles.statLabel}>{stat.label}</dt>
                <dd className={styles.statValue}>{stat.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {item.notes ? (
          <ul className={styles.notes}>
            {item.notes.map((note) => (
              <li key={note} className={styles.note}>
                <span className={styles.noteIndex}>Note</span>
                <span className={styles.noteText}>{note}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <div className={styles.chips}>
          {item.chips.map((chip) => (
            <span key={chip} className={styles.chip}>
              {chip}
            </span>
          ))}
        </div>
      </div>
    </article>
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

export function GridTemplateColumnsDemo() {
  const fullscreenMedia = toMediaItems(ITEMS.map((item) => item.fullscreenSrc));

  return (
    <GalleryCore layout="grid" fullscreenItems={fullscreenMedia}>
      <Grid
        templateColumns={TEMPLATE_COLUMNS}
        gap={{ 0: 12, 820: 14, 1200: 18 }}
        loading={{
          enabled: true,
          skeleton: GRID_TEMPLATE_COLUMNS_SKELETON,
        }}
      >
        {ITEMS.map((item, index) => (
          <Grid.Item key={item.imageSrc} span={item.span}>
            <TemplateColumnsCard item={item} index={index} />
          </Grid.Item>
        ))}
      </Grid>
      <FullscreenAddon />
    </GalleryCore>
  );
}
