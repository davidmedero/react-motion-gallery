export const source = String.raw`"use client";

import "react-motion-gallery/styles.css";
import {
  GalleryCore,
  Masonry,
  Video,
  type MediaItem,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";
import styles from "./masonry-video-vimeo-demo.module.css";

const ITEMS = [
  {
    kind: "video",
    src: "https://vimeo.com/145140004",
    poster: "https://i.vimeocdn.com/video/543161898-50fd66e034508b21a3ad7e668577709bb20b0d339e394dff325c24bd6155a37a-d_640?region=us",
    title: "Atlas Walkthrough",
    body: "Vimeo embeds can live in tall pins instead of a repeated gallery row.",
    ratio: "4 / 5",
  },
  {
    kind: "video",
    src: "https://vimeo.com/113314928",
    poster: "https://i.vimeocdn.com/video/498587339-a98d3fe72280beb7d17e8d2294e78c129ae40003fcf295384731134b214d1503-d_640?region=us",
    title: "Signal Grade",
    body: "A slightly taller tile keeps the stack visually staggered.",
    ratio: "3 / 4",
  },
  {
    kind: "video",
    src: "https://vimeo.com/172833424",
    poster: "https://i.vimeocdn.com/video/578815638-72b8689b81268e096ab8ad7746b90b89beb60a5e86b0664d2a10ce77f7eceb8c-d_640?region=us",
    title: "Night Transit",
    body: "A square-ish frame keeps the wall from looking like a set of identical cards.",
    ratio: "1 / 1",
  },
  {
    kind: "video",
    src: "https://vimeo.com/130632032",
    poster: "https://i.vimeocdn.com/video/522566445-9f80dcf05e5eef5d6364db7f75ab735eecd3ebbd33eacdd7e1cc0dc0002b9b00-d_640?region=us",
    title: "Quiet Surface",
    body: "Fullscreen continues to use a local Vimeo source builder.",
    ratio: "5 / 4",
  },
];

const VIMEO_SKELETON = {
  heightsPx: [360, 404, 320, 388],
  radius: 18,
};

function buildMasonryVimeoSource(src: string, poster?: string) {
  return {
    type: "video",
    poster,
    sources: [{ src, provider: "vimeo" }],
  };
}

const MASONRY_VIMEO_OPTIONS = {
  controls: [] as string[],
  vimeo: {
    byline: false,
    portrait: false,
    title: false,
    speed: true,
    transparent: false,
    customControls: false,
  },
};

function buildMasonryVimeoFullscreenSource(item: MediaItem) {
  if (item.kind !== "video") {
    return buildMasonryVimeoSource("");
  }

  return buildMasonryVimeoSource(item.src, item.poster);
}

function MasonryVimeoCard(props: {
  src: string;
  poster?: string;
  title: string;
  body: string;
  ratio: string;
}) {
  const { src, poster, title, body, ratio } = props;

  return (
    <article className={styles.masonryVimeoCard}>
      <div className={styles.masonryVimeoFrame} style={{ aspectRatio: ratio }}>
        <Video
          src={src}
          poster={poster}
          source={buildMasonryVimeoSource(src, poster)}
          options={MASONRY_VIMEO_OPTIONS}
          className={styles.masonryVimeoVideo}
          style={{ height: "100%" }}
          alt={title}
        />
      </div>
      <div className={styles.masonryVimeoMeta}>
        <strong className={styles.masonryVimeoTitle}>{title}</strong>
        <p className={styles.masonryVimeoBody}>{body}</p>
      </div>
    </article>
  );
}

function MasonryVimeoFullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
    fullscreen: {
      enabled: true,
      video: {
        source: buildMasonryVimeoFullscreenSource,
        options: MASONRY_VIMEO_OPTIONS,
      },
    },
  });

  return <>{fullscreenNode}</>;
}

export function MasonryVideoVimeoDemo() {
  const media = toMediaItems(ITEMS);

  return (
    <GalleryCore layout="masonry" fullscreenItems={media}>
      <Masonry
        columns={{ 0: 1, 900: 2, 1260: 3 }}
        gap={{ 0: 12, 1260: 18 }}
        estimatedItemHeight={340}
        loading={{
          enabled: true,
          skeleton: VIMEO_SKELETON,
        }}
      >
        {ITEMS.map((item) => (
          <MasonryVimeoCard
            key={item.src}
            src={item.src}
            poster={item.poster}
            title={item.title}
            body={item.body}
            ratio={item.ratio}
          />
        ))}
      </Masonry>
      <MasonryVimeoFullscreenAddon />
    </GalleryCore>
  );
}`;
