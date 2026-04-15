/* eslint-disable @next/next/no-img-element */
'use client';

import {
  GalleryCore,
  Slider,
  Video,
  type MediaItem,
  toMediaItems,
  useFullscreenController,
} from "../../../../../../packages/react-motion-gallery/src";
import styles from "./slider-video-youtube-loop-demo.module.css";

export function SliderVideoYoutubeLoopDemo() {
const URLS = [
  {
    kind: "video" as const,
    src: "zT5RMvM0gaI",
    poster: "https://i.ytimg.com/vi/zT5RMvM0gaI/hqdefault.jpg"
  },
  {
    kind: "video" as const,
    src: "c2h1T06-3vQ",
    poster: "https://i.ytimg.com/vi/c2h1T06-3vQ/hqdefault.jpg"
  },
  {
    kind: "video" as const,
    src: "mTM7F-5999Q",
    poster: "https://i.ytimg.com/vi/mTM7F-5999Q/hqdefault.jpg"
  },
  {
    kind: "video" as const,
    src: "cJLL_gNpBb8",
    poster: "https://i.ytimg.com/vi/cJLL_gNpBb8/hqdefault.jpg"
  },
  {
    kind: "video" as const,
    src: "IxF55qB4CuQ",
    poster: "https://i.ytimg.com/vi/IxF55qB4CuQ/hqdefault.jpg"
  },
  {
    kind: "video" as const,
    src: "IGOaJnvQdng",
    poster: "https://i.ytimg.com/vi/IGOaJnvQdng/hqdefault.jpg"
  },
];

function buildYoutubeSource(src: string, poster?: string) {
  return {
    type: "video" as const,
    poster,
    sources: [{ src, provider: "youtube" as const }],
  };
}

const YOUTUBE_OPTIONS = {
  ratio: "16:9",
  controls: [],
  youtube: {
    customControls: false,
  },
};

function buildYoutubeFullscreenSource(item: MediaItem) {
  if (item.kind !== "video") {
    return buildYoutubeSource("");
  }

  return buildYoutubeSource(item.src, item.poster);
}

function Slide({
  src,
  poster,
  i,
}: {
  src: string;
  poster?: string;
  i: number;
}) {
  return (
    <div className={styles.slide_wrapper}>
      <img
        src="/open-fullscreen.png"
        alt="Open fullscreen"
        width="24"
        height="24"
        className={styles.open_fullscreen_icon}
      />
      <Video
        src={src}
        poster={poster}
        source={buildYoutubeSource(src, poster)}
        options={YOUTUBE_OPTIONS}
        alt={`Video ${i + 1}`}
        className={styles.slide}
      />
    </div>
  );
}

function FullscreenAddon() {

  const { fullscreenNode } = useFullscreenController({
    fullscreen: {
      enabled: true,
      video: {
        source: buildYoutubeFullscreenSource,
        options: YOUTUBE_OPTIONS,
      },
    },
  });

  return <>{fullscreenNode}</>;
}

const MEDIA = toMediaItems(URLS);

return (
  <GalleryCore layout="slider" fullscreenItems={MEDIA}>
    <Slider
      scroll={{
        loop: true
      }}
      align="center"
      controls={{
        dots: {
          enabled: false,
        },
        scrollbar: {
          enabled: true,
          root: {
            style: {
              bottom: "0px"
            }
          }
        },
      }}
      elements={{
        viewport: {
          className: styles.slider_viewport
        }
      }}
      transitions={{
        loading: {
          skeletonCount: 3,
          skeleton: {
            mode: "peek",
            layout: {
              kind: "slider",
              direction: "row",
              style: {
                gap: 20,
                justify: "center"
              },
              item: {
                kind: "rect",
                style: {
                  width: "100cqw",
                  maxWidth: "550px",
                  aspectRatio: "16 / 9",
                  borderRadius: 12,
                },
              },
              children: [
                {
                  kind: "col",
                  style: {
                    0: {
                      width: "100%",
                      padding: "14px 0 0",
                    },
                    768: {
                      width: "100%",
                      padding: "20px 0 0",
                    },
                  },
                  children: [
                    {
                      kind: "rect",
                      style: {
                        width: "min(60%, 28rem)",
                        height: 16,
                        borderRadius: 999,
                        alignSelf: "center",
                        marginTop: "16px"
                      },
                    },
                  ],
                },
              ],
            }
          }
        }
      }}
    >
      {MEDIA.map((m, i) => {
        return (
          <Slide
            key={`video-${m.kind === "video" ? m.src : ""}-${i}`}
            src={m.kind === "video" ? m.src : ""}
            poster={m.kind === "video" ? m.poster : ""}
            i={i}
          />
        );
      })}
    </Slider>
    <FullscreenAddon />
  </GalleryCore>
);
}
