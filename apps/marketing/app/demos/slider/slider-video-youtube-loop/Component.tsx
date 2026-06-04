/* eslint-disable @next/next/no-img-element */
"use client";

import { GalleryCore } from "react-motion-gallery/core";
import { type MediaItem, toMediaItems } from "react-motion-gallery/media";
import { Slider } from "react-motion-gallery/slider";
import { useSliderReady } from "react-motion-gallery/slider/ready";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { Video } from "react-motion-gallery/video";
import { SliderSkeleton } from "react-motion-gallery/skeleton/slider";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import { fullscreenVideo } from "react-motion-gallery/fullscreen/video";
import { sliderScrollbar } from "react-motion-gallery/slider/scrollbar";
import { sliderFullscreen } from "react-motion-gallery/slider/fullscreen";
import { sliderArrows } from "react-motion-gallery/slider/arrows";
import { sliderRipple } from "react-motion-gallery/slider/ripple";
import styles from "./slider-video-youtube-loop-demo.module.css";

export function SliderVideoYoutubeLoopDemo() {
  const URLS = [
    {
      kind: "video" as const,
      src: "zT5RMvM0gaI",
      poster: "https://i.ytimg.com/vi/zT5RMvM0gaI/hqdefault.jpg",
    },
    {
      kind: "video" as const,
      src: "c2h1T06-3vQ",
      poster: "https://i.ytimg.com/vi/c2h1T06-3vQ/hqdefault.jpg",
    },
    {
      kind: "video" as const,
      src: "mTM7F-5999Q",
      poster: "https://i.ytimg.com/vi/mTM7F-5999Q/hqdefault.jpg",
    },
    {
      kind: "video" as const,
      src: "cJLL_gNpBb8",
      poster: "https://i.ytimg.com/vi/cJLL_gNpBb8/hqdefault.jpg",
    },
    {
      kind: "video" as const,
      src: "IxF55qB4CuQ",
      poster: "https://i.ytimg.com/vi/IxF55qB4CuQ/hqdefault.jpg",
    },
    {
      kind: "video" as const,
      src: "IGOaJnvQdng",
      poster: "https://i.ytimg.com/vi/IGOaJnvQdng/hqdefault.jpg",
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
          data-rmg-fullscreen-trigger
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
      plugins: [fullscreenSlider(), fullscreenVideo(), fullscreenZoomPan()],
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

  const { ref: sliderRef, ready: sliderReady } = useSliderReady();

  return (
    <GalleryCore layout="slider" fullscreenItems={MEDIA}>
      <SliderSkeleton
        layout={{
          visibleCount: 3,
          mode: "peek",
          layout: {
            kind: "slider",
            direction: "row",
            style: {
              gap: 20,
              justify: "center",
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
            loop: true,
          }}
          align="center"
          elements={{
            viewport: {
              className: styles.slider_viewport,
            },
          }}
          plugins={[
            sliderFullscreen(),
            sliderRipple(),
            sliderArrows({
              arrow: {
                style: {
                  top: "43%",
                },
              },
            }),
            sliderScrollbar({
              enabled: true,
              root: {
                style: {
                  bottom: "0px",
                },
              },
            }),
          ]}
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
      </SliderSkeleton>
      <FullscreenAddon />
    </GalleryCore>
  );
}
