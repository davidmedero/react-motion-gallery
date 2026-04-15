/* eslint-disable @next/next/no-img-element */
'use client';

import {
  GalleryCore,
  Masonry,
  Video,
  toMediaItems,
  useFullscreenController,
} from "../../../../../../packages/react-motion-gallery/src";
import styles from "./masonry-video-html5-demo.module.css";

const ITEMS = [
  {
    kind: "video" as const,
    src: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html/12354535_1920_1080_30fps.mp4",
    poster: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html-loop/12354535_1920_1080_30fps-0.jpg",
    title: "Forest Run",
    body: "Autoplay loops can sit inside tall pins instead of fixed 16:9 cards.",
    ratio: "4 / 5",
  },
  {
    kind: "video" as const,
    src: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html/4151824-uhd_3840_2160_25fps.mp4",
    poster: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html-loop/4151824-uhd_3840_2160_25fps-0.jpg",
    title: "Tide Study",
    body: "Different media ratios stop the layout from reading like a row grid.",
    ratio: "3 / 4",
  },
  {
    kind: "video" as const,
    src: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html/7677511-hd_1920_1080_25fps.mp4",
    poster: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html/7677511-hd_1920_1080_25fps-0.jpg",
    title: "Studio Glass",
    body: "Shorter copy and a squarer frame help the wall feel more like Pinterest.",
    ratio: "1 / 1",
  },
  {
    kind: "video" as const,
    src: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html/7677513-hd_1920_1080_25fps.mp4",
    poster: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html/7677513-hd_1920_1080_25fps-0.jpg",
    title: "Desert Road",
    body: "Fullscreen still flows through GalleryCore from each video tile.",
    ratio: "5 / 4",
  },
];

const HTML5_SKELETON = {
  heightsPx: [360, 420, 320, 390],
  radius: 18,
};

const HTML5_LOOP_OPTIONS = {
  autoplay: true,
  preload: "auto",
  muted: true,
  playsinline: true,
  controls: [] as string[],
  loop: {
    active: true,
  },
};

function MasonryHtml5Card(props: {
  src: string;
  poster?: string;
  title: string;
  body: string;
  ratio: string;
}) {
  const { src, poster, title, body, ratio } = props;

  return (
    <article className={styles.masonryHtml5Card}>
      <div className={styles.masonryHtml5Frame} style={{ aspectRatio: ratio }}>
        <Video
          src={src}
          poster={poster}
          className={styles.masonryHtml5Video}
          style={{ height: "100%" }}
          options={HTML5_LOOP_OPTIONS}
          alt={title}
        />
      </div>
      <div className={styles.masonryHtml5Meta}>
        <strong className={styles.masonryHtml5Title}>{title}</strong>
        <p className={styles.masonryHtml5Body}>{body}</p>
      </div>
    </article>
  );
}

function MasonryHtml5FullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
    fullscreen: {
      enabled: true,
    },
  });

  return <>{fullscreenNode}</>;
}

export function MasonryVideoHtml5Demo() {
  const media = toMediaItems(ITEMS);

  return (
    <GalleryCore layout="masonry" fullscreenItems={media}>
      <Masonry
        columns={{ 0: 1, 900: 2, 1260: 3 }}
        gap={{ 0: 12, 1260: 18 }}
        estimatedItemHeight={340}
        loading={{
          enabled: true,
          skeleton: HTML5_SKELETON,
        }}
      >
        {ITEMS.map((item) => (
          <MasonryHtml5Card
            key={item.src}
            src={item.src}
            poster={item.poster}
            title={item.title}
            body={item.body}
            ratio={item.ratio}
          />
        ))}
      </Masonry>
      <MasonryHtml5FullscreenAddon />
    </GalleryCore>
  );
}
