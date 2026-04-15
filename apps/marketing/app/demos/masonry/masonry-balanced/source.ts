export const source = String.raw`"use client";

import "react-motion-gallery/styles.css";
import {
  GalleryCore,
  Masonry,
  Video,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";
import styles from "./masonry-balanced-demo.module.css";

const ITEMS = [
  {
    kind: "image",
    src: "https://picsum.photos/id/1061/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/1061/2400/3000",
    label: "Residence",
    title: "Warm Oak Kitchen",
    body: "Stone veining, pale oak, and a soft noon highlight.",
    ratio: "4 / 5",
  },
  {
    kind: "video",
    src: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html/12354535_1920_1080_30fps.mp4",
    poster: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html-loop/12354535_1920_1080_30fps-0.jpg",
    label: "Loop",
    title: "Forest Motion",
    body: "Autoplaying clips keep the wall feeling alive instead of static.",
    ratio: "4 / 5",
  },
  {
    kind: "image",
    src: "https://picsum.photos/id/1063/1200/1440",
    fullscreenSrc: "https://picsum.photos/id/1063/2400/2880",
    label: "Travel",
    title: "Cliffside Path",
    body: "Dry grass, chalk stone, and a narrow blue band of sea.",
    ratio: "5 / 4",
  },
  {
    kind: "image",
    src: "https://picsum.photos/id/1064/1200/1800",
    fullscreenSrc: "https://picsum.photos/id/1064/2400/3600",
    label: "Editorial",
    title: "Gallery Stair",
    body: "Plaster curves, sharp shadows, and a quiet turn in the afternoon.",
    ratio: "2 / 3",
  },
  {
    kind: "video",
    src: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html/4151824-uhd_3840_2160_25fps.mp4",
    poster: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html-loop/4151824-uhd_3840_2160_25fps-0.jpg",
    label: "Loop",
    title: "Tide Study",
    body: "Muted motion makes the pinboard feel closer to Pinterest than a gallery wall.",
    ratio: "3 / 4",
  },
  {
    kind: "image",
    src: "https://picsum.photos/id/1066/1200/1560",
    fullscreenSrc: "https://picsum.photos/id/1066/2400/3120",
    label: "Outdoor",
    title: "Pool Terrace",
    body: "Sun-bleached paving and a washed-out horizon line.",
    ratio: "4 / 5",
  },
];

function createBalancedSkeletonItem(args: {
  mediaRatio: string;
  badgeWidth: string;
  titleWidth: string;
  titleLines?: number | { 0: number; 900: number };
  titleLineWidth?: string;
  bodyWidth: string;
  bodyLines?: number | { 0: number; 900: number };
  bodyLineWidth?: string;
}) {
  return {
    kind: "col" as const,
    style: {
      gap: 12,
      padding: 14,
    },
    children: [
      {
        kind: "rect" as const,
        style: {
          width: "100%",
          aspectRatio: args.mediaRatio,
          borderRadius: 16,
        },
      },
      {
        kind: "text" as const,
        fontSize: 11,
        lineHeight: 1.4,
        lines: 1,
        lineWidth: "40%",
        style: {
          width: args.badgeWidth,
          borderRadius: 999,
        },
      },
      {
        kind: "text" as const,
        fontSize: 18,
        lineHeight: 1.35,
        lines: args.titleLines ?? { 0: 2, 900: 1 },
        lineWidth: args.titleLineWidth ?? "66%",
        style: {
          width: args.titleWidth,
        },
      },
      {
        kind: "text" as const,
        fontSize: 14,
        lineHeight: 1.55,
        lines: args.bodyLines ?? 2,
        lineWidth: args.bodyLineWidth ?? "76%",
        style: {
          width: args.bodyWidth,
        },
      },
    ],
  };
}

const BALANCED_SKELETON_SLOTS = [
  {
    item: createBalancedSkeletonItem({
      mediaRatio: "4 / 5",
      badgeWidth: "32%",
      titleWidth: "74%",
      titleLines: 1,
      bodyWidth: "94%",
      bodyLines: 2,
    }),
  },
  {
    item: createBalancedSkeletonItem({
      mediaRatio: "3 / 5",
      badgeWidth: "26%",
      titleWidth: "68%",
      titleLines: 1,
      bodyWidth: "100%",
      bodyLines: 2,
      bodyLineWidth: "82%",
    }),
  },
  {
    item: createBalancedSkeletonItem({
      mediaRatio: "5 / 4",
      badgeWidth: "30%",
      titleWidth: "78%",
      titleLines: 1,
      bodyWidth: "88%",
      bodyLines: 2,
      bodyLineWidth: "72%",
    }),
  },
  {
    item: createBalancedSkeletonItem({
      mediaRatio: "2 / 3",
      badgeWidth: "34%",
      titleWidth: "82%",
      titleLines: { 0: 2, 900: 1 },
      bodyWidth: "96%",
      bodyLines: 2,
    }),
  },
  {
    item: createBalancedSkeletonItem({
      mediaRatio: "3 / 4",
      badgeWidth: "28%",
      titleWidth: "72%",
      titleLines: 1,
      bodyWidth: "100%",
      bodyLines: 3,
      bodyLineWidth: "74%",
    }),
  },
  {
    item: createBalancedSkeletonItem({
      mediaRatio: "4 / 5",
      badgeWidth: "32%",
      titleWidth: "70%",
      titleLines: 1,
      bodyWidth: "94%",
      bodyLines: 2,
      bodyLineWidth: "78%",
    }),
  },
];

const BALANCED_SKELETON = {
  radius: 18,
  layout: {
    kind: "masonry",
    itemWrapStyle: {
      padding: 14,
      borderRadius: 22,
      boxShadow: "0 18px 36px rgba(15, 23, 42, 0.08)",
    },
    item: createBalancedSkeletonItem({
      mediaRatio: "4 / 5",
      badgeWidth: "32%",
      titleWidth: "74%",
      titleLines: 1,
      bodyWidth: "94%",
      bodyLines: 2,
    }),
    slots: BALANCED_SKELETON_SLOTS,
  },
};

const BALANCED_VIDEO_OPTIONS = {
  autoplay: true,
  preload: "auto",
  muted: true,
  playsinline: true,
  controls: [] as string[],
  loop: {
    active: true,
  },
};

const BALANCED_ITEM_WRAP_STYLE = {
  padding: "6px",
  borderRadius: "30px",
  background: "#fff",
};

function MasonryBalancedCard(props: { item: (typeof ITEMS)[number] }) {
  const { item } = props;

  return (
    <article className={styles.masonryBalancedCard}>
      <div
        className={styles.masonryBalancedMedia}
        style={{ aspectRatio: item.ratio }}
      >
        {item.kind === "image" ? (
          <img
            src={item.src}
            alt={item.title}
            className={styles.masonryBalancedImage}
          />
        ) : (
          <Video
            src={item.src}
            poster={item.poster}
            className={styles.masonryBalancedVideo}
            style={{ height: "100%" }}
            options={BALANCED_VIDEO_OPTIONS}
            alt={item.title}
          />
        )}
      </div>
      <div className={styles.masonryBalancedMeta}>
        <span className={styles.masonryBalancedBadge}>{item.label}</span>
        <strong className={styles.masonryBalancedTitle}>{item.title}</strong>
        <p className={styles.masonryBalancedBody}>{item.body}</p>
      </div>
    </article>
  );
}

function MasonryBalancedFullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
    fullscreen: {
      enabled: true,
    },
  });

  return <>{fullscreenNode}</>;
}

export function MasonryBalancedDemo() {
  const fullscreenMedia = toMediaItems(
    ITEMS.map((item) =>
      item.kind === "image"
        ? item.fullscreenSrc
        : {
            kind: "video",
            src: item.src,
            poster: item.poster,
          }
    )
  );

  return (
    <GalleryCore layout="masonry" fullscreenItems={fullscreenMedia}>
      <Masonry
        columns={{ 0: 1, 720: 2, 1140: 3 }}
        gap={{ 0: 12, 1140: 18 }}
        estimatedItemHeight={340}
        itemWrapStyle={BALANCED_ITEM_WRAP_STYLE}
        loading={{
          enabled: true,
          skeleton: BALANCED_SKELETON,
        }}
      >
        {ITEMS.map((item) => (
          <MasonryBalancedCard
            key={item.kind === "image" ? item.src : item.poster}
            item={item}
          />
        ))}
      </Masonry>
      <MasonryBalancedFullscreenAddon />
    </GalleryCore>
  );
}`;
