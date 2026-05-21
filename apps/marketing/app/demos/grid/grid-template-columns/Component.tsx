/* eslint-disable @next/next/no-img-element */
'use client';

import { useSearchParams } from "next/navigation";
import { GalleryCore } from "react-motion-gallery/core";
import { toMediaItems } from "react-motion-gallery/media";
import { Grid, type ResponsiveGridSpan } from "react-motion-gallery/grid";
import { useGridReady } from "react-motion-gallery/grid/ready";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { GridSkeleton } from "react-motion-gallery/skeleton/cache/grid";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import type {
  GridSkeletonSpec,
  SkeletonNode,
} from "react-motion-gallery/skeleton/cache/grid";
import styles from "./grid-template-columns-demo.module.css";
import {
  bridgeSpanBody,
  bridgeSpanTitle,
  counterweightBody,
  counterweightTitle,
  edgeSlotBody,
  edgeSlotTitle,
  finalRailBody,
  finalRailTitle,
  leadTrackBody,
  leadTrackTitle,
  narrowRailBody,
  narrowRailTitle,
} from "./grid-template-columns.skeleton-text.generated";
import { demoSkeletonCache } from "../../skeleton-cache";

type DemoItem = {
  imageSrc: string;
  fullscreenSrc: string;
  title: string;
  body: string;
  ratio: string;
  span: ResponsiveGridSpan;
};

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
    imageSrc: "https://picsum.photos/id/502/1800/1240",
    fullscreenSrc: "https://picsum.photos/id/502/2400/1653",
    title: "Lorem ipsum dolor sit amet",
    body:
      "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    ratio: "16 / 11",
    span: { 0: "full", 820: 2, 1200: 2 },
  },
  {
    imageSrc: "https://picsum.photos/id/503/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/503/2400/3000",
    title: "Ut enim ad minim veniam",
    body:
      "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    ratio: "4 / 5",
    span: { 0: "full", 820: 1, 1200: 1 },
  },
  {
    imageSrc: "https://picsum.photos/id/506/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/506/2400/3000",
    title: "Duis aute irure dolor",
    body:
      "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    ratio: "4 / 5",
    span: { 0: "full", 820: 1, 1200: 1 },
  },
  {
    imageSrc: "https://picsum.photos/id/507/1800/1125",
    fullscreenSrc: "https://picsum.photos/id/507/2400/1500",
    title: "Excepteur sint occaecat",
    body:
      "Cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    ratio: "16 / 10",
    span: { 0: "full", 820: 2, 1200: 2 },
  },
  {
    imageSrc: "https://picsum.photos/id/508/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/508/2400/3000",
    title: "Sed ut perspiciatis unde",
    body:
      "Omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam.",
    ratio: "5 / 6",
    span: { 0: "full", 820: 1, 1200: 1 },
  },
  {
    imageSrc: "https://picsum.photos/id/509/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/509/2400/3000",
    title: "Nemo enim ipsam voluptatem",
    body:
      "Quia voluptas sit aspernatur aut odit aut fugit sed quia consequuntur magni dolores.",
    ratio: "4 / 5",
    span: { 0: "full", 820: 1, 1200: 1 },
  },
];

// The slim second and fourth tracks create deliberate side rails that
// uniform `columns` + `span` values cannot represent.
const TEMPLATE_COLUMNS = {
  0: "minmax(0, 1fr)",
  820: "minmax(0, 1.18fr) minmax(220px, 0.82fr)",
  1200:
    "minmax(0, 1.42fr) minmax(148px, 0.48fr) minmax(0, 1.08fr) minmax(180px, 0.42fr)",
};

const GRID_TEMPLATE_COLUMNS_SKELETON_TEXT: GeneratedSkeletonTextEntry[] = [
  {
    title: leadTrackTitle,
    body: leadTrackBody,
  },
  {
    title: narrowRailTitle,
    body: narrowRailBody,
  },
  {
    title: edgeSlotTitle,
    body: edgeSlotBody,
  },
  {
    title: bridgeSpanTitle,
    body: bridgeSpanBody,
  },
  {
    title: counterweightTitle,
    body: counterweightBody,
  },
  {
    title: finalRailTitle,
    body: finalRailBody,
  },
];

const GRID_TEMPLATE_COLUMNS_TEXT_IDS: SkeletonTextIds[] = [
  {
    title: "leadTrackTitle",
    body: "leadTrackBody",
  },
  {
    title: "narrowRailTitle",
    body: "narrowRailBody",
  },
  {
    title: "edgeSlotTitle",
    body: "edgeSlotBody",
  },
  {
    title: "bridgeSpanTitle",
    body: "bridgeSpanBody",
  },
  {
    title: "counterweightTitle",
    body: "counterweightBody",
  },
  {
    title: "finalRailTitle",
    body: "finalRailBody",
  },
];

function createTemplateSkeletonItem(item: DemoItem, index: number): SkeletonNode {
  const skeletonText = GRID_TEMPLATE_COLUMNS_SKELETON_TEXT[index]!;

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
          borderRadius: 18,
        },
      },
      {
        kind: "col" as const,
        style: {
          gap: 8,
          padding: "0 2px 2px",
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

const GRID_TEMPLATE_COLUMNS_SKELETON: GridSkeletonSpec = {
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
    item: createTemplateSkeletonItem(ITEMS[0]!, 0),
    slots: ITEMS.map((item, index) => ({
      span: item.span,
      item: createTemplateSkeletonItem(item, index),
    })),
  },
};

function TemplateColumnsTile(props: {
  item: DemoItem;
  index: number;
}) {
  const { item } = props;
  const textIds = GRID_TEMPLATE_COLUMNS_TEXT_IDS[props.index]!;

  return (
    <article className={styles.tile}>
      <div className={styles.tileMedia} style={{ aspectRatio: item.ratio }}>
        <img src={item.imageSrc} alt={item.title} className={styles.tileImage} />
      </div>

      <div className={styles.tileCopy}>
        <strong
          className={styles.tileTitle}
          data-skeleton-text-id={textIds.title}
        >
          {item.title}
        </strong>
        <p className={styles.tileBody} data-skeleton-text-id={textIds.body}>
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

export function GridTemplateColumnsDemo() {
  const fullscreenMedia = toMediaItems(ITEMS.map((item) => item.fullscreenSrc));
  const { ref: gridRef, ready: gridReady } = useGridReady();

  return (
    <GalleryCore layout="grid" fullscreenItems={fullscreenMedia}>
      <GridSkeleton
        cache={demoSkeletonCache("grid-template-columns")}
        layout={GRID_TEMPLATE_COLUMNS_SKELETON}
        ready={gridReady}
        timing={{ exitMs: 1200 }}
        grid={{
          count: ITEMS.length,
          templateColumns: TEMPLATE_COLUMNS,
          gap: { 0: 12, 820: 16, 1200: 18 },
          allowItemSpans: true,
        }}
      >
        <Grid
          ref={gridRef}
          templateColumns={TEMPLATE_COLUMNS}
          gap={{ 0: 12, 820: 16, 1200: 18 }}
          fullscreenTrigger="item"
        >
          {ITEMS.map((item, index) => (
            <Grid.Item key={item.imageSrc} span={item.span}>
              <TemplateColumnsTile item={item} index={index} />
            </Grid.Item>
          ))}
        </Grid>
      </GridSkeleton>
      <FullscreenAddon />
    </GalleryCore>
  );
}
