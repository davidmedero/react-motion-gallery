export const source = String.raw`"use client";

import "react-motion-gallery/styles.css";
import {
  GalleryCore,
  Slider,
  Video,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";
import styles from "./slider-video-vimeo-demo.module.css";

export function SliderVideoVimeoDemo() {
const URLS = [
  {
    kind: "video",
    src: "https://vimeo.com/145140004",
    poster: "https://i.vimeocdn.com/video/543161898-50fd66e034508b21a3ad7e668577709bb20b0d339e394dff325c24bd6155a37a-d_640?region=us",
  },
  {
    kind: "video",
    src: "https://vimeo.com/113314928",
    poster: "https://i.vimeocdn.com/video/498587339-a98d3fe72280beb7d17e8d2294e78c129ae40003fcf295384731134b214d1503-d_640?region=us",
  },
  {
    kind: "video",
    src: "https://vimeo.com/172833424",
    poster: "https://i.vimeocdn.com/video/578815638-72b8689b81268e096ab8ad7746b90b89beb60a5e86b0664d2a10ce77f7eceb8c-d_640?region=us",
  },
  {
    kind: "video",
    src: "https://vimeo.com/130632032",
    poster: "https://i.vimeocdn.com/video/522566445-9f80dcf05e5eef5d6364db7f75ab735eecd3ebbd33eacdd7e1cc0dc0002b9b00-d_640?region=us",
  },
  {
    kind: "video",
    src: "https://vimeo.com/29216771",
    poster: "https://i.vimeocdn.com/video/195526505-0b6e473889f312924ae8715001157ffd464349eb7d4cef78136668cae68a0ce8-d_640?region=us",
  },
  {
    kind: "video",
    src: "https://vimeo.com/127223734",
    poster: "https://i.vimeocdn.com/video/517933160-cfa1bfb51adafa1ea32b3e1c67b79abcfdfd848f35fff141b41c24860fd1e22c-d_640?region=us",
  },
];

function buildVimeoSource(src: string, poster?: string) {
  return {
    type: "video",
    poster,
    sources: [{ src, provider: "vimeo" }],
  };
}

const VIMEO_OPTIONS = {
  ratio: "16:9",
  controls: [],
  vimeo: {
    byline: false,
    portrait: false,
    title: false,
    speed: true,
    transparent: false,
    customControls: false,
  },
};

function buildVimeoFullscreenSource(item) {
  return buildVimeoSource(item.src, item.poster);
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
        source={buildVimeoSource(src, poster)}
        options={VIMEO_OPTIONS}
        alt={\`Video \${i + 1}\`}
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
        source: buildVimeoFullscreenSource,
        options: VIMEO_OPTIONS,
      },
    },
  });

  return <>{fullscreenNode}</>;
}

const MEDIA = toMediaItems(URLS);

return (
  <GalleryCore layout="slider" fullscreenItems={MEDIA}>
    <Slider
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
          style: {
            paddingBottom: "52px"
          }
        }
      }}
      transitions={{
        loading: {
          skeletonCount: 2,
          skeleton: {
            mode: "peek",
            layout: {
              kind: "slider",
              direction: "row",
              style: {
                gap: 20,
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
                  kind: "rect",
                  style: {
                    width: 162,
                    height: 32,
                    borderRadius: 999,
                    alignSelf: "center",
                    marginTop: "20px",
                  },
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
            key={\`video-\${m.kind === "video" ? m.src : ""}-\${i}\`}
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
}`;
