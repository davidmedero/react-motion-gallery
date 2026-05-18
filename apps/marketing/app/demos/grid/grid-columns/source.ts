export const source = `/* eslint-disable @next/next/no-img-element */
'use client';

import { GalleryCore } from "react-motion-gallery/core";
import { toMediaItems } from "react-motion-gallery/media";
import { Grid, type ResponsiveGridSpan } from "react-motion-gallery/grid";
import { useGridReady } from "react-motion-gallery/grid/ready";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { GridSkeleton } from "react-motion-gallery/skeleton/grid";
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
import { demoSkeletonCache } from "../../skeleton-cache";

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
    imageSrc: "https://picsum.photos/id/484/1800/1125",
    fullscreenSrc: "https://picsum.photos/id/484/2400/1500",
    title: "Lorem ipsum dolor sit amet",
    body: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    ratio: "4 / 1",
    span: "full"
  },
  {
    imageSrc: "https://picsum.photos/id/485/1500/1125",
    fullscreenSrc: "https://picsum.photos/id/485/2400/1800",
    title: "Ut enim ad minim veniam",
    body: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    ratio: "2 / 1",
    span: { 0: "full", 900: 7 }
  },
  {
    imageSrc: "https://picsum.photos/id/487/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/487/2400/2400",
    title: "Duis aute irure dolor",
    body: "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    ratio: "2 / 1",
    span: { 0: "full", 900: 5 }
  },
  {
    imageSrc: "https://picsum.photos/id/492/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/492/2400/3000",
    title: "Excepteur sint occaecat",
    body: "Cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    ratio: "4 / 5",
    span: { 0: "full", 700: 6, 1200: 4 }
  },
  {
    imageSrc: "https://picsum.photos/id/496/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/496/2400/3000",
    title: "Sed ut perspiciatis unde",
    body: "Omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam.",
    ratio: "4 / 5",
    span: { 0: "full", 700: 6, 1200: 4 }
  },
  {
    imageSrc: "https://picsum.photos/id/498/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/498/2400/3000",
    title: "Nemo enim ipsam voluptatem",
    body: "Quia voluptas sit aspernatur aut odit aut fugit sed quia consequuntur magni dolores.",
    ratio: "4 / 5",
    span: { 0: "full", 700: 6, 1200: 4 }
  },
  {
    imageSrc: "https://picsum.photos/id/499/1200/1440",
    fullscreenSrc: "https://picsum.photos/id/499/2400/2880",
    title: "Neque porro quisquam est magni",
    body: "Qui dolorem ipsum quia dolor sit amet consectetur adipisci velit sed quia non numquam.",
    ratio: "5 / 6",
    span: { 0: "full", 700: 6, 1200: 3 }
  },
  {
    imageSrc: "https://picsum.photos/id/500/1800/1125",
    fullscreenSrc: "https://picsum.photos/id/500/2400/1500",
    title: "Temporibus autem quibusdam",
    body: "Et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae.",
    ratio: "16 / 10",
    span: { 0: "full", 700: 6, 1200: 9 }
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
      height: "100%"
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
      effects: {
        introDuration: { fade: 500 },
      },
    },
  });

  return <>{fullscreenNode}</>;
}

export function GridColumnsDemo() {
  const fullscreenMedia = toMediaItems(ITEMS.map((item) => item.fullscreenSrc));
  const { ref: gridRef, ready: gridReady } = useGridReady();

  return (
    <GalleryCore layout="grid" fullscreenItems={fullscreenMedia}>
      <GridSkeleton
        cache={demoSkeletonCache("grid-columns")}
        layout={GRID_SPANS_SKELETON}
        ready={gridReady}
        timing={{ exitMs: 1000 }}
        grid={{
          count: ITEMS.length,
          columns: GRID_COLUMNS,
          gap: GRID_GAP,
          allowItemSpans: true,
        }}
        // force={{
        //   enabled: true,
        //   showContent: true
        // }}
      >
        <Grid
          ref={gridRef}
          columns={GRID_COLUMNS}
          gap={GRID_GAP}
          fullscreenTrigger="item"
        >
          {ITEMS.map((item, index) => (
            <Grid.Item key={item.imageSrc} span={item.span}>
              <GridSpanTile item={item} index={index} />
            </Grid.Item>
          ))}
        </Grid>
      </GridSkeleton>
      <FullscreenAddon />
    </GalleryCore>
  );
}`;
