/* eslint-disable @next/next/no-img-element */
'use client';

import {
  GalleryCore,
  Grid,
  toMediaItems,
  useFullscreenController,
} from "../../../../../../packages/react-motion-gallery/src";
import type { GridSkeletonSpec } from "../../../../../../packages/react-motion-gallery/src/Gallery/grid/GridSkeleton";
import styles from "./grid-lazy-load-demo.module.css";

const ITEMS = [
  {
    imageSrc: "https://picsum.photos/id/1070/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/1070/2400/3000",
    badge: "Retail",
    title: "Shelf Study",
    body: "Grid items fade in independently while the layout stays stable.",
  },
  {
    imageSrc: "https://picsum.photos/id/1071/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/1071/2400/3000",
    badge: "Residence",
    title: "Quiet Entry",
    body: "Lazy image loading works with the same card structure as the base grid demos.",
  },
  {
    imageSrc: "https://picsum.photos/id/1072/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/1072/2400/3000",
    badge: "Archive",
    title: "Marker Notes",
    body: "The grid can reveal content progressively without reshuffling the columns.",
  },
  {
    imageSrc: "https://picsum.photos/id/1073/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/1073/2400/3000",
    badge: "Travel",
    title: "Harbor Walk",
    body: "Fullscreen can lazy load its own media separately from the grid surface.",
  },
  {
    imageSrc: "https://picsum.photos/id/1074/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/1074/2400/3000",
    badge: "Studio",
    title: "Fabric Rail",
    body: "Each card keeps its own loading timing while the gallery stays responsive.",
  },
  {
    imageSrc: "https://picsum.photos/id/1075/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/1075/2400/3000",
    badge: "Product",
    title: "Copper Tools",
    body: "Spinner support is shared by the grid internals, not by the demo component.",
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
      lazyLoad: {
        images: {
          enabled: true,
        },
      },
    },
  });

  return <>{fullscreenNode}</>;
}

export function GridLazyLoadDemo() {
  const fullscreenMedia = toMediaItems(ITEMS.map((item) => item.fullscreenSrc));

  return (
    <GalleryCore layout="grid" fullscreenItems={fullscreenMedia}>
      <Grid
        minColumnWidth={220}
        gap={{ 0: 12, 900: 18 }}
        fullscreenTrigger="item"
        lazyLoad={{
          enabled: true,
          spinner: true,
          spinnerClassName: styles.spinner,
        }}
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
