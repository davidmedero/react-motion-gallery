export const source = String.raw`"use client";

import "react-motion-gallery/styles.css";
import {
  GalleryCore,
  Grid,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";
import styles from "./grid-columns-demo.module.css";

const ITEMS = [
  {
    imageSrc: "https://picsum.photos/id/1046/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/1046/2400/3000",
    badge: "Lookbook",
    title: "Dune Light Study",
    body: "Soft neutrals, stacked stone, and a low-sun portrait.",
  },
  {
    imageSrc: "https://picsum.photos/id/1047/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/1047/2400/3000",
    badge: "Studio",
    title: "Glassline Apartment",
    body: "Clean lines, brushed oak, and warm reflected skylight.",
  },
  {
    imageSrc: "https://picsum.photos/id/1048/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/1048/2400/3000",
    badge: "Travel",
    title: "Harbor Morning",
    body: "Layered blues and crisp jackets on a quiet dock.",
  },
  {
    imageSrc: "https://picsum.photos/id/1049/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/1049/2400/3000",
    badge: "Editorial",
    title: "Terrace Supper",
    body: "Candles, citrus, and a table set for late golden hour.",
  },
  {
    imageSrc: "https://picsum.photos/id/1050/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/1050/2400/3000",
    badge: "Interiors",
    title: "Reading Corner",
    body: "Textured linen, paperbacks, and a soft shadow wall.",
  },
  {
    imageSrc: "https://picsum.photos/id/1051/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/1051/2400/3000",
    badge: "Product",
    title: "Weekend Carry",
    body: "Canvas texture, metal clips, and everyday field notes.",
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
      <img
        src={imageSrc}
        alt={title}
        className={styles.gridImage}
      />
      <div className={styles.gridCopy}>
        <span className={styles.gridBadge}>{badge}</span>
        <strong className={styles.gridTitle}>{title}</strong>
        <p className={styles.gridBody}>{body}</p>
      </div>
    </article>
  );
}

const CARD_SKELETON = {
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

export function GridColumnsDemo() {
  const fullscreenMedia = toMediaItems(ITEMS.map((item) => item.fullscreenSrc));

  return (
    <GalleryCore layout="grid" fullscreenItems={fullscreenMedia}>
      <Grid
        columns={12}
        gap={{ 0: 12, 1080: 18 }}
        loading={{
          enabled: true,
          skeleton: CARD_SKELETON,
        }}
      >
        {ITEMS.map((item, index) => {
          const span =
            index === 0
              ? { 0: "full", 900: 12, 1200: 6 }
              : { 0: "full", 900: 6, 1200: 3 };

          return (
            <Grid.Item
              key={item.imageSrc}
              span={span}
            >
              <GridCard
                imageSrc={item.imageSrc}
                badge={item.badge}
                title={item.title}
                body={item.body}
              />
            </Grid.Item>
          );
        })}
      </Grid>
      <FullscreenAddon />
    </GalleryCore>
  );
}`;
