/* eslint-disable @next/next/no-img-element */
'use client';

import {
  GalleryCore,
  Masonry,
  Video,
  toMediaItems,
  useFullscreenController,
} from "../../../../../../packages/react-motion-gallery/src";
import styles from "./masonry-round-robin-demo.module.css";

const ITEMS = [
  {
    kind: "image" as const,
    src: "https://picsum.photos/id/1071/1200/1440",
    fullscreenSrc: "https://picsum.photos/id/1071/2400/2880",
    label: "North Wing",
    title: "Stone Passage",
    body: "A grounded opener keeps the first lane short and clear.",
    ratio: "5 / 4",
  },
  {
    kind: "video" as const,
    src: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html/7677511-hd_1920_1080_25fps.mp4",
    poster: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html/7677511-hd_1920_1080_25fps-0.jpg",
    label: "Atrium",
    title: "Studio Motion",
    body: "Round robin keeps the visual order predictable even with looping clips inside the mix.",
    ratio: "4 / 5",
  },
  {
    kind: "image" as const,
    src: "https://picsum.photos/id/1073/1200/1620",
    fullscreenSrc: "https://picsum.photos/id/1073/2400/3240",
    label: "Archive",
    title: "Paper Stack",
    body: "Balanced is not always the right call when the scan order matters more.",
    ratio: "3 / 4",
  },
  {
    kind: "image" as const,
    src: "https://picsum.photos/id/1074/1200/1320",
    fullscreenSrc: "https://picsum.photos/id/1074/2400/2640",
    label: "Studio",
    title: "Fabric Rail",
    body: "Compact cards still inherit fullscreen through GalleryCore.",
    ratio: "1 / 1",
  },
  {
    kind: "video" as const,
    src: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html/7677513-hd_1920_1080_25fps.mp4",
    poster: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html/7677513-hd_1920_1080_25fps-0.jpg",
    label: "Harbor",
    title: "Road Loop",
    body: "Longer copy can stretch just one lane without the rest of the order getting reshuffled.",
    ratio: "3 / 4",
  },
  {
    kind: "image" as const,
    src: "https://picsum.photos/id/1076/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/1076/2400/3000",
    label: "Workshop",
    title: "Copper Bench",
    body: "The column rhythm still reads cleanly from top to bottom.",
    ratio: "4 / 5",
  },
];

const ROUND_ROBIN_SKELETON = {
  ratios: [98, 120, 110, 96, 124, 116],
  radius: 18,
};

const ROUND_ROBIN_VIDEO_OPTIONS = {
  autoplay: true,
  preload: "auto",
  muted: true,
  playsinline: true,
  controls: [] as string[],
  loop: {
    active: true,
  },
};

function MasonryRoundRobinCard(props: { item: (typeof ITEMS)[number] }) {
  const { item } = props;

  return (
    <article className={styles.masonryRoundRobinCard}>
      <div
        className={styles.masonryRoundRobinMedia}
        style={{ aspectRatio: item.ratio }}
      >
        {item.kind === "image" ? (
          <img
            src={item.src}
            alt={item.title}
            className={styles.masonryRoundRobinImage}
          />
        ) : (
          <Video
            src={item.src}
            poster={item.poster}
            className={styles.masonryRoundRobinVideo}
            style={{ height: "100%" }}
            options={ROUND_ROBIN_VIDEO_OPTIONS}
            alt={item.title}
          />
        )}
      </div>
      <div className={styles.masonryRoundRobinMeta}>
        <span className={styles.masonryRoundRobinBadge}>{item.label}</span>
        <strong className={styles.masonryRoundRobinTitle}>{item.title}</strong>
        <p className={styles.masonryRoundRobinBody}>{item.body}</p>
      </div>
    </article>
  );
}

function MasonryRoundRobinFullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
    fullscreen: {
      enabled: true,
    },
  });

  return <>{fullscreenNode}</>;
}

export function MasonryRoundRobinDemo() {
  const fullscreenMedia = toMediaItems(
    ITEMS.map((item) =>
      item.kind === "image"
        ? item.fullscreenSrc
        : {
            kind: "video" as const,
            src: item.src,
            poster: item.poster,
          }
    )
  );

  return (
    <GalleryCore layout="masonry" fullscreenItems={fullscreenMedia}>
      <Masonry
        columns={{ 0: 1, 760: 2, 1160: 3 }}
        gap={{ 0: 12, 1160: 18 }}
        placement="roundRobin"
        estimatedItemHeight={330}
        loading={{
          enabled: true,
          skeleton: ROUND_ROBIN_SKELETON,
        }}
      >
        {ITEMS.map((item) => (
          <MasonryRoundRobinCard
            key={item.kind === "image" ? item.src : item.poster}
            item={item}
          />
        ))}
      </Masonry>
      <MasonryRoundRobinFullscreenAddon />
    </GalleryCore>
  );
}
