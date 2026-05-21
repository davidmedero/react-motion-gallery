export const source = `/* eslint-disable @next/next/no-img-element */
'use client';

import { GalleryCore } from "react-motion-gallery/core";
import { type MediaItem, toMediaItems } from "react-motion-gallery/media";
import { Slider } from "react-motion-gallery/slider";
import { useSliderReady } from "react-motion-gallery/slider/ready";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { Video } from "react-motion-gallery/video";
import { SliderSkeleton } from "react-motion-gallery/skeleton/cache/slider";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import { fullscreenVideo } from "react-motion-gallery/fullscreen/video";
import { sliderScrollbar } from "react-motion-gallery/slider/scrollbar";
import { sliderFullscreen } from "react-motion-gallery/slider/fullscreen";
import { sliderArrows } from "react-motion-gallery/slider/arrows";
import { sliderRipple } from "react-motion-gallery/slider/ripple";
import styles from "./slider-video-vimeo-loop-demo.module.css";
import { demoSkeletonCache } from "../../skeleton-cache";

export function SliderVideoVimeoLoopDemo() {
const URLS = [
  {
    kind: "video" as const,
    src: "https://vimeo.com/145140004",
    poster: "https://i.vimeocdn.com/video/543161898-50fd66e034508b21a3ad7e668577709bb20b0d339e394dff325c24bd6155a37a-d_640?region=us",
  },
  {
    kind: "video" as const,
    src: "https://vimeo.com/113314928",
    poster: "https://i.vimeocdn.com/video/498587339-a98d3fe72280beb7d17e8d2294e78c129ae40003fcf295384731134b214d1503-d_640?region=us",
  },
  {
    kind: "video" as const,
    src: "https://vimeo.com/172833424",
    poster: "https://i.vimeocdn.com/video/578815638-72b8689b81268e096ab8ad7746b90b89beb60a5e86b0664d2a10ce77f7eceb8c-d_640?region=us",
  },
  {
    kind: "video" as const,
    src: "https://vimeo.com/130632032",
    poster: "https://i.vimeocdn.com/video/522566445-9f80dcf05e5eef5d6364db7f75ab735eecd3ebbd33eacdd7e1cc0dc0002b9b00-d_640?region=us",
  },
  {
    kind: "video" as const,
    src: "https://vimeo.com/29216771",
    poster: "https://i.vimeocdn.com/video/195526505-0b6e473889f312924ae8715001157ffd464349eb7d4cef78136668cae68a0ce8-d_640?region=us",
  },
  {
    kind: "video" as const,
    src: "https://vimeo.com/127223734",
    poster: "https://i.vimeocdn.com/video/517933160-cfa1bfb51adafa1ea32b3e1c67b79abcfdfd848f35fff141b41c24860fd1e22c-d_640?region=us",
  },
];

function buildVimeoSource(src: string, poster?: string) {
  return {
    type: "video" as const,
    poster,
    sources: [{ src, provider: "vimeo" as const }],
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

function buildVimeoFullscreenSource(item: MediaItem) {
  if (item.kind !== "video") {
    return buildVimeoSource("");
  }

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
        data-rmg-fullscreen-trigger
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
    plugins: [fullscreenSlider(), fullscreenVideo(), fullscreenZoomPan()],
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

const { ref: sliderRef, ready: sliderReady } = useSliderReady();

  return (
  <GalleryCore layout="slider" fullscreenItems={MEDIA}>
    <SliderSkeleton
      cache={demoSkeletonCache("slider-video-vimeo-loop")}
        layout={{
              visibleCount: 3,
            mode: "peek",
            layout: {
              kind: "slider",
              direction: "row",
              style: {
                gap: 20,
                justify: "center"
              },
              itemStretch: false,
              item: {
                kind: "rect",
                style: {
                  width: "100cqw",
                  maxWidth: "550px",
                  aspectRatio: "16 / 9",
                  borderRadius: 12,
                },
              },
              rowHeightCompensation: {
                0: 46,
                768: 52,
              },
              overlays: [
                {
                  kind: "stack",
                  style: {
                    position: "absolute",
                    left: "50%",
                    bottom: 0,
                    transform: "translateX(-50%)",
                    width: "min(60%, 28rem)",
                    height: 16,
                    zIndex: 3,
                  },
                  children: [
                    {
                      kind: "row",
                      style: {
                        position: "absolute",
                        left: 0,
                        top: 5,
                        width: "100%",
                        height: 6,
                        borderRadius: 999,
                        backgroundColor: "rgba(15, 23, 42, 0.16)",
                      },
                      children: [],
                    },
                    {
                      kind: "row",
                      style: {
                        position: "absolute",
                        left: 0,
                        top: 5,
                        width: 0,
                        height: 6,
                        borderRadius: 999,
                        backgroundColor: "rgba(80, 163, 255, 0.28)",
                      },
                      children: [],
                    },
                    {
                      kind: "row",
                      style: {
                        position: "absolute",
                        left: 0,
                        top: 0,
                        width: 16,
                        height: 16,
                        borderRadius: 999,
                        backgroundColor: "rgb(80, 163, 255)",
                        boxShadow: "0 4px 14px rgba(80, 163, 255, 0.28)",
                      },
                      children: [],
                    },
                  ],
                },
              ],
            },
          }}
        ready={sliderReady}
      >
      <Slider
        ref={sliderRef}
      scroll={{
        loop: true
      }}
      align="center"

      elements={{
        viewport: {
          className: styles.slider_viewport
        }
      }}
        plugins={[
          sliderFullscreen(),
          sliderRipple(),
          sliderArrows({
            arrow: {
              style: {
                top: "43%"
              }
            }
          }),
          sliderScrollbar({
          enabled: true,
          root: {
            style: {
              bottom: "0px"
            }
          }
        }),
        ]}
      >
      {MEDIA.map((m, i) => {
        return (
          <Slide
            key={\`video-\${m.kind === "video" ? m.src : ""}-\${i}\`}
            src={m.kind === "video" ? m.src : ""}
            poster={m.kind === "video" ? m.poster : ""}
            i={i}
          />
        )
      ;
      })}
    </Slider>
      </SliderSkeleton>
    <FullscreenAddon />
  </GalleryCore>
);
}`;
