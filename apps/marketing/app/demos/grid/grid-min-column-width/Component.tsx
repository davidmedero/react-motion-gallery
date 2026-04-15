/* eslint-disable @next/next/no-img-element */
'use client';

import {
  GalleryCore,
  Grid,
  toMediaItems,
  useFullscreenController,
} from "../../../../../../packages/react-motion-gallery/src";
import type { GridSkeletonSpec } from "../../../../../../packages/react-motion-gallery/src/Gallery/grid/GridSkeleton";
import styles from "./grid-min-column-width-demo.module.css";

const ITEMS = [
  {
    imageSrc: "https://picsum.photos/id/1046/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/1046/2400/3000",
    badge: "Lookbook",
    title: "Dune Light Study",
    body: "Auto-fit columns let the layout breathe without hand-managed spans.",
  },
  {
    imageSrc: "https://picsum.photos/id/1047/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/1047/2400/3000",
    badge: "Studio",
    title: "Glassline Apartment",
    body: "Cards stay consistent while the grid decides how many tracks fit.",
  },
  {
    imageSrc: "https://picsum.photos/id/1048/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/1048/2400/3000",
    badge: "Travel",
    title: "Harbor Morning",
    body: "A single min width creates a more fluid layout than explicit breakpoints.",
  },
  {
    imageSrc: "https://picsum.photos/id/1049/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/1049/2400/3000",
    badge: "Editorial",
    title: "Terrace Supper",
    body: "The layout tightens naturally on smaller screens without custom spans.",
  },
  {
    imageSrc: "https://picsum.photos/id/1050/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/1050/2400/3000",
    badge: "Interiors",
    title: "Reading Corner",
    body: "The gallery still keeps fullscreen and loading behavior with less config.",
  },
  {
    imageSrc: "https://picsum.photos/id/1051/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/1051/2400/3000",
    badge: "Product",
    title: "Weekend Carry",
    body: "A good fit when you want a grid that can expand or collapse gracefully.",
  },
];

function GridCard(props: {
  imageSrc: string;
  badge: string;
  title: string;
  body: string;
}) {
  const { imageSrc, badge, title, body } = props;

  return (
    <article className={styles.gridCard}>
      <img src={imageSrc} alt={title} className={styles.gridImage} />
      <div className={styles.gridCopy}>
        <span className={styles.gridBadge}>{badge}</span>
        <strong className={styles.gridTitle}>{title}</strong>
        <p className={styles.gridBody}>{body}</p>
      </div>
    </article>
  );
}

const CARD_SKELETON: GridSkeletonSpec = {
  radius: 12,
  layout: {
    kind: "grid",
    item: {
      kind: "col",
      style: {
        gap: 12,
      },
      children: [
        {
          kind: "rect",
          style: {
            width: "100%",
            aspectRatio: "4 / 5",
            borderRadius: 12,
          },
        },
        {
          kind: "text",
          fontSize: 12,
          lineHeight: 1.2,
          style: {
            width: "50%",
          },
        },
        {
          kind: "text",
          fontSize: 16,
          lineHeight: 1.2,
          style: {
            width: "92%",
          },
        },
        {
          kind: "text",
          fontSize: 14,
          lineHeight: 1.45,
          lines: 2,
          lineWidth: "50%",
          style: {
            width: "100%",
          },
        },
      ],
    },
  },
};

function FullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
    fullscreen: {
      enabled: true,
    },
  });

  return <>{fullscreenNode}</>;
}

export function GridMinColumnWidthDemo() {
  const fullscreenMedia = toMediaItems(ITEMS.map((item) => item.fullscreenSrc));

  return (
    <GalleryCore layout="grid" fullscreenItems={fullscreenMedia}>
      <Grid
        minColumnWidth={220}
        gap={{ 0: 12, 900: 18 }}
        fullscreenTrigger="item"
        loading={{
          enabled: true,
          skeleton: CARD_SKELETON,
        }}
      >
        {ITEMS.map((item) => (
          <GridCard
            key={item.imageSrc}
            imageSrc={item.imageSrc}
            badge={item.badge}
            title={item.title}
            body={item.body}
          />
        ))}
      </Grid>
      <FullscreenAddon />
    </GalleryCore>
  );
}
