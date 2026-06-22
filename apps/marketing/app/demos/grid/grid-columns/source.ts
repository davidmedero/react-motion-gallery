export const source = `/* eslint-disable @next/next/no-img-element */
"use client";

import { GalleryCore } from "react-motion-gallery/core";
import { toMediaItems } from "react-motion-gallery/media";
import {
  Grid,
  type ResponsiveGridSpan,
} from "react-motion-gallery/grid";
import { gridFullscreen } from "react-motion-gallery/grid/fullscreen";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import type { GridSkeletonSpec } from "react-motion-gallery/skeleton/grid";
import styles from "./grid-columns-demo.module.css";
import {
  closingPanoramaBody,
  closingPanoramaTitle,
  leadSpanBody,
  leadSpanTitle,
  narrowPortraitBody,
  narrowPortraitTitle,
  portraitOneBody,
  portraitOneTitle,
  portraitThreeBody,
  portraitThreeTitle,
  portraitTwoBody,
  portraitTwoTitle,
  tightTileBody,
  tightTileTitle,
  wideTileBody,
  wideTileTitle,
} from "./grid-columns.skeleton-text.generated";

type DemoItem = {
  imageSrc: string;
  fullscreenSrc: string;
  title: string;
  body: string;
  ratio: string;
  span: ResponsiveGridSpan;
  titleLineHeight?: DemoLineHeight;
  bodyLineHeight?: DemoLineHeight;
};

type DemoLineHeight = number | Record<string, number>;
type GeneratedSkeletonTextState = {
  lines: number | Record<number, number>;
  barWidth?: string | string[] | Record<number, string | string[]>;
  lastBarWidth?: string | Record<number, string>;
};
type GeneratedSkeletonTextEntry = {
  title: GeneratedSkeletonTextState;
  body: GeneratedSkeletonTextState;
};

type SkeletonTextIds = {
  title: string;
  body: string;
};

const ITEMS: DemoItem[] = [
  {
    imageSrc: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1800&h=1125&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=2400&h=1500&q=80",
    title: "Lorem ipsum dolor sit amet",
    body: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    ratio: "4 / 1",
    span: "full",
  },
  {
    imageSrc: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1500&h=1125&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=2400&h=1800&q=80",
    title: "Ut enim ad minim veniam",
    body: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    ratio: "2 / 1",
    span: { 0: "full", 900: 7 },
  },
  {
    imageSrc: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1200&h=1200&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=2400&h=2400&q=80",
    title: "Duis aute irure dolor",
    body: "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    ratio: "2 / 1",
    span: { 0: "full", 900: 5 },
  },
  {
    imageSrc: "https://images.unsplash.com/photo-1498855926480-d98e83099315?auto=format&fit=crop&w=1200&h=1500&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1498855926480-d98e83099315?auto=format&fit=crop&w=2400&h=3000&q=80",
    title: "Excepteur sint occaecat",
    body: "Cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    ratio: "4 / 5",
    span: { 0: "full", 700: 6, 1200: 4 },
  },
  {
    imageSrc: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=1200&h=1500&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=2400&h=3000&q=80",
    title: "Sed ut perspiciatis unde",
    body: "Omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam.",
    ratio: "4 / 5",
    span: { 0: "full", 700: 6, 1200: 4 },
  },
  {
    imageSrc: "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&w=1200&h=1500&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&w=2400&h=3000&q=80",
    title: "Nemo enim ipsam voluptatem",
    body: "Quia voluptas sit aspernatur aut odit aut fugit sed quia consequuntur magni dolores.",
    ratio: "4 / 5",
    span: { 0: "full", 700: 6, 1200: 4 },
  },
  {
    imageSrc: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&h=1440&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2400&h=2880&q=80",
    title: "Neque porro quisquam est magni",
    body: "Qui dolorem ipsum quia dolor sit amet consectetur adipisci velit sed quia non numquam.",
    ratio: "5 / 6",
    span: { 0: "full", 700: 6, 1200: 3 },
  },
  {
    imageSrc: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1800&h=1125&q=80",
    fullscreenSrc: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=2400&h=1500&q=80",
    title: "Temporibus autem quibusdam",
    body: "Et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae.",
    ratio: "16 / 10",
    span: { 0: "full", 700: 6, 1200: 9 },
  },
];

const GRID_COLUMNS = 12;
const GRID_GAP = { 0: 12, 1080: 18 };

const GRID_COLUMNS_SKELETON_TEXT: GeneratedSkeletonTextEntry[] = [
  {
    title: leadSpanTitle,
    body: leadSpanBody,
  },
  {
    title: wideTileTitle,
    body: wideTileBody,
  },
  {
    title: tightTileTitle,
    body: tightTileBody,
  },
  {
    title: portraitOneTitle,
    body: portraitOneBody,
  },
  {
    title: portraitTwoTitle,
    body: portraitTwoBody,
  },
  {
    title: portraitThreeTitle,
    body: portraitThreeBody,
  },
  {
    title: narrowPortraitTitle,
    body: narrowPortraitBody,
  },
  {
    title: closingPanoramaTitle,
    body: closingPanoramaBody,
  },
];

const GRID_COLUMNS_TEXT_IDS: SkeletonTextIds[] = [
  {
    title: "leadSpanTitle",
    body: "leadSpanBody",
  },
  {
    title: "wideTileTitle",
    body: "wideTileBody",
  },
  {
    title: "tightTileTitle",
    body: "tightTileBody",
  },
  {
    title: "portraitOneTitle",
    body: "portraitOneBody",
  },
  {
    title: "portraitTwoTitle",
    body: "portraitTwoBody",
  },
  {
    title: "portraitThreeTitle",
    body: "portraitThreeBody",
  },
  {
    title: "narrowPortraitTitle",
    body: "narrowPortraitBody",
  },
  {
    title: "closingPanoramaTitle",
    body: "closingPanoramaBody",
  },
];

function createSpanSkeletonItem(item: DemoItem, index: number) {
  const skeletonText =
    GRID_COLUMNS_SKELETON_TEXT[index] ?? GRID_COLUMNS_SKELETON_TEXT[0]!;

  return {
    kind: "col" as const,
    style: {
      gap: 14,
    },
    children: [
      {
        kind: "rect" as const,
        style: {
          width: "100%",
          aspectRatio: item.ratio,
          borderRadius: 16,
        },
      },
      {
        kind: "col" as const,
        style: {
          gap: 8,
        },
        children: [
          {
            kind: "text" as const,
            barHeight: 16,
            lineHeight: 1.2,
            ...skeletonText.title,
          },
          {
            kind: "text" as const,
            barHeight: 14,
            lineHeight: 1.62,
            ...skeletonText.body,
          },
        ],
      },
    ],
  };
}

const GRID_SPANS_SKELETON: GridSkeletonSpec = {
  radius: 22,
  layout: {
    kind: "grid",
    itemWrapStyle: {
      padding: 14,
      borderRadius: 22,
      border: "1px solid rgba(15, 23, 42, 0.08)",
      backgroundColor: "rgba(255, 255, 255, 0.96)",
      boxShadow: "0 16px 36px rgba(15, 23, 42, 0.08)",
      height: "100%",
    },
    item: createSpanSkeletonItem(ITEMS[0]!, 0),
    slots: ITEMS.map((item, index) => ({
      span: item.span,
      item: createSpanSkeletonItem(item, index),
    })),
  },
};

function GridSpanTile(props: { item: DemoItem; index: number }) {
  const { item } = props;
  const textIds = GRID_COLUMNS_TEXT_IDS[props.index]!;

  return (
    <article className={styles.gridTile}>
      <div className={styles.gridTileMedia} style={{ aspectRatio: item.ratio }}>
        <img
          src={item.imageSrc}
          alt={item.title}
          className={styles.gridTileImage}
        />
      </div>
      <div className={styles.gridTileCopy}>
        <strong
          className={styles.gridTileTitle}
          data-skeleton-text-id={textIds.title}
        >
          {item.title}
        </strong>
        <p className={styles.gridTileBody} data-skeleton-text-id={textIds.body}>
          {item.body}
        </p>
      </div>
    </article>
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

export function GridColumnsDemo() {
  const fullscreenMedia = toMediaItems(ITEMS.map((item) => item.fullscreenSrc));

  return (
    <GalleryCore layout="grid" fullscreenItems={fullscreenMedia}>
      <Grid
        columns={GRID_COLUMNS}
        gap={GRID_GAP}
        fullscreenTrigger="item"
        loading={{
          skeleton: GRID_SPANS_SKELETON,
          timing: { exitMs: 1000 },
        }}
        plugins={[gridFullscreen()]}
      >
        {ITEMS.map((item, index) => (
          <Grid.Item key={item.imageSrc} span={item.span}>
            <GridSpanTile item={item} index={index} />
          </Grid.Item>
        ))}
      </Grid>
      <FullscreenAddon />
    </GalleryCore>
  );
}
`;
