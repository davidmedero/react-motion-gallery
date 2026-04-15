export const source = String.raw`"use client";

import "react-motion-gallery/styles.css";
import {
  GalleryCore,
  Masonry,
  Video,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";
import styles from "./masonry-lazy-load-demo.module.css";

const ITEMS = [
  {
    kind: "image",
    src: "https://picsum.photos/id/1081/1200/1680",
    fullscreenSrc: "https://picsum.photos/id/1081/2400/3360",
    label: "Materials",
    title: "Linen Fold",
    body: "Lazy image decoding keeps the waterfall stable while assets stream in.",
    ratio: "4 / 5",
  },
  {
    kind: "video",
    src: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html/12354535_1920_1080_30fps.mp4",
    poster: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html-loop/12354535_1920_1080_30fps-0.jpg",
    label: "Loop",
    title: "Forest Motion",
    body: "Video pins lazy mount with their own spinner while the image tiles keep masonry stable.",
    ratio: "4 / 5",
  },
  {
    kind: "image",
    src: "https://picsum.photos/id/1083/1200/1920",
    fullscreenSrc: "https://picsum.photos/id/1083/2400/3840",
    label: "Archive",
    title: "Marker Notes",
    body: "Fullscreen can lazy load its own media payloads separately.",
    ratio: "2 / 3",
  },
  {
    kind: "image",
    src: "https://picsum.photos/id/1084/1200/1500",
    fullscreenSrc: "https://picsum.photos/id/1084/2400/3000",
    label: "Residence",
    title: "Quiet Entry",
    body: "Each card keeps its own reveal timing and fade-in.",
    ratio: "5 / 4",
  },
  {
    kind: "video",
    src: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html/4151824-uhd_3840_2160_25fps.mp4",
    poster: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html-loop/4151824-uhd_3840_2160_25fps-0.jpg",
    label: "Loop",
    title: "Tide Study",
    body: "Masonry still feels like a pinboard instead of a row-based grid.",
    ratio: "3 / 4",
  },
  {
    kind: "image",
    src: "https://picsum.photos/id/1087/1200/1380",
    fullscreenSrc: "https://picsum.photos/id/1087/2400/2760",
    label: "Retail",
    title: "Shelf Study",
    body: "The shared lazyLoad API works here the same way it does in Grid and Slider.",
    ratio: "4 / 5",
  },
];

const LAZY_SKELETON = {
  ratios: [124, 120, 148, 102, 132, 118],
  radius: 18,
};

const LAZY_LOOP_VIDEO_OPTIONS = {
  autoplay: true,
  preload: "auto",
  muted: true,
  playsinline: true,
  controls: [] as string[],
  loop: {
    active: true,
  },
};

function MasonryLazyCard(props: { item: (typeof ITEMS)[number] }) {
  const { item } = props;

  return (
    <article className={styles.masonryLazyCard}>
      <div
        className={styles.masonryLazyMedia}
        style={{ aspectRatio: item.ratio }}
      >
        {item.kind === "image" ? (
          <img
            src={item.src}
            alt={item.title}
            className={styles.masonryLazyImage}
          />
        ) : (
          <Video
            src={item.src}
            poster={item.poster}
            className={styles.masonryLazyVideo}
            style={{ height: "100%" }}
            options={LAZY_LOOP_VIDEO_OPTIONS}
            lazyLoad={{
              enabled: true,
              spinner: true,
              spinnerClassName: styles.masonryLazyVideoSpinner,
            }}
            alt={item.title}
          />
        )}
      </div>
      <div className={styles.masonryLazyMeta}>
        <span className={styles.masonryLazyBadge}>{item.label}</span>
        <strong className={styles.masonryLazyTitle}>{item.title}</strong>
        <p className={styles.masonryLazyBody}>{item.body}</p>
      </div>
    </article>
  );
}

function MasonryLazyFullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
    fullscreen: {
      enabled: true,
      lazyLoad: {
        images: {
          enabled: true,
        },
        videos: {
          enabled: true,
        },
      },
    },
  });

  return <>{fullscreenNode}</>;
}

export function MasonryLazyLoadDemo() {
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
        lazyLoad={{
          enabled: true,
          spinner: true,
          spinnerClassName: styles.masonryLazySpinner,
        }}
        loading={{
          enabled: true,
          skeleton: LAZY_SKELETON,
        }}
      >
        {ITEMS.map((item) => (
          <MasonryLazyCard
            key={item.kind === "image" ? item.src : item.poster}
            item={item}
          />
        ))}
      </Masonry>
      <MasonryLazyFullscreenAddon />
    </GalleryCore>
  );
}`;
