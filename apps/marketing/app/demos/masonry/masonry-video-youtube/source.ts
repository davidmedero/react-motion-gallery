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
import styles from "./masonry-video-youtube-demo.module.css";

const ITEMS = [
  {
    kind: "video",
    src: "zT5RMvM0gaI",
    poster: "https://i.ytimg.com/vi/zT5RMvM0gaI/hqdefault.jpg",
    title: "Pattern Study",
    body: "The player sits inside a taller pin instead of a repeated 16:9 row.",
    ratio: "4 / 5",
  },
  {
    kind: "video",
    src: "c2h1T06-3vQ",
    poster: "https://i.ytimg.com/vi/c2h1T06-3vQ/hqdefault.jpg",
    title: "Street Layers",
    body: "Each video pin keeps its own source builder and fullscreen handoff.",
    ratio: "3 / 4",
  },
  {
    kind: "video",
    src: "mTM7F-5999Q",
    poster: "https://i.ytimg.com/vi/mTM7F-5999Q/hqdefault.jpg",
    title: "River Light",
    body: "A squarer tile helps break the rhythm so the wall does not feel grid locked.",
    ratio: "1 / 1",
  },
  {
    kind: "video",
    src: "cJLL_gNpBb8",
    poster: "https://i.ytimg.com/vi/cJLL_gNpBb8/hqdefault.jpg",
    title: "Cloud Motion",
    body: "Provider-specific options stay local to this demo.",
    ratio: "5 / 4",
  },
];

const YOUTUBE_SKELETON = {
  heightsPx: [360, 404, 312, 388],
  radius: 18,
};

function buildMasonryYoutubeSource(src: string, poster?: string) {
  return {
    type: "video",
    poster,
    sources: [{ src, provider: "youtube" }],
  };
}

const MASONRY_YOUTUBE_OPTIONS = {
  controls: [] as string[],
  youtube: {
    customControls: false,
  },
};

function buildMasonryYoutubeFullscreenSource(item: MediaItem) {
  if (item.kind !== "video") {
    return buildMasonryYoutubeSource("");
  }

  return buildMasonryYoutubeSource(item.src, item.poster);
}

function MasonryYoutubeCard(props: {
  src: string;
  poster?: string;
  title: string;
  body: string;
  ratio: string;
}) {
  const { src, poster, title, body, ratio } = props;

  return (
    <article className={styles.masonryYoutubeCard}>
      <div className={styles.masonryYoutubeFrame} style={{ aspectRatio: ratio }}>
        <Video
          src={src}
          poster={poster}
          source={buildMasonryYoutubeSource(src, poster)}
          options={MASONRY_YOUTUBE_OPTIONS}
          className={styles.masonryYoutubeVideo}
          style={{ height: "100%" }}
          alt={title}
        />
      </div>
      <div className={styles.masonryYoutubeMeta}>
        <strong className={styles.masonryYoutubeTitle}>{title}</strong>
        <p className={styles.masonryYoutubeBody}>{body}</p>
      </div>
    </article>
  );
}

function MasonryYoutubeFullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
    fullscreen: {
      enabled: true,
      video: {
        source: buildMasonryYoutubeFullscreenSource,
        options: MASONRY_YOUTUBE_OPTIONS,
      },
    },
  });

  return <>{fullscreenNode}</>;
}

export function MasonryVideoYoutubeDemo() {
  const media = toMediaItems(ITEMS);

  return (
    <GalleryCore layout="masonry" fullscreenItems={media}>
      <Masonry
        columns={{ 0: 1, 900: 2, 1260: 3 }}
        gap={{ 0: 12, 1260: 18 }}
        estimatedItemHeight={340}
        loading={{
          enabled: true,
          skeleton: YOUTUBE_SKELETON,
        }}
      >
        {ITEMS.map((item) => (
          <MasonryYoutubeCard
            key={item.src}
            src={item.src}
            poster={item.poster}
            title={item.title}
            body={item.body}
            ratio={item.ratio}
          />
        ))}
      </Masonry>
      <MasonryYoutubeFullscreenAddon />
    </GalleryCore>
  );
}`;
