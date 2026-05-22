export const source = `/* eslint-disable @next/next/no-img-element */
'use client';

import { GalleryCore } from "react-motion-gallery/core";
import { toMediaItems } from "react-motion-gallery/media";
import { Slider } from "react-motion-gallery/slider";
import { useSliderReady } from "react-motion-gallery/slider/ready";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { Video } from "react-motion-gallery/video";
import { SliderSkeleton } from "react-motion-gallery/skeleton/cache/slider";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import { fullscreenVideo } from "react-motion-gallery/fullscreen/video";
import { sliderDots } from "react-motion-gallery/slider/dots";
import { sliderArrows } from "react-motion-gallery/slider/arrows";
import { sliderFullscreen } from "react-motion-gallery/slider/fullscreen";
import { sliderRipple } from "react-motion-gallery/slider/ripple";
import styles from "./slider-video-html5-demo.module.css";
import { demoSkeletonCache } from "../../skeleton-cache";

export function SliderVideoHtml5Demo() {
  const URLS = [
    {
      src: "https://cdn.react-motion-gallery.com/slider-html/12354535_1920_1080_30fps.mp4",
      poster: "https://cdn.react-motion-gallery.com/slider-html-loop/12354535_1920_1080_30fps-0.jpg"
    },
    {
      src: "https://cdn.react-motion-gallery.com/slider-html/4151824-uhd_3840_2160_25fps.mp4",
      poster: "https://cdn.react-motion-gallery.com/slider-html-loop/4151824-uhd_3840_2160_25fps-0.jpg"
    },
    {
      src: "https://cdn.react-motion-gallery.com/slider-html/7677511-hd_1920_1080_25fps.mp4",
      poster: "https://cdn.react-motion-gallery.com/slider-html-loop/7677511-hd_1920_1080_25fps-0.jpg"
    },
    {
      src: "https://cdn.react-motion-gallery.com/slider-html/7677513-hd_1920_1080_25fps.mp4",
      poster: "https://cdn.react-motion-gallery.com/slider-html-loop/7677513-hd_1920_1080_25fps-0.jpg"
    },
    {
      src: "https://cdn.react-motion-gallery.com/slider-html/9150545-hd_1920_1080_24fps.mp4",
      poster: "https://cdn.react-motion-gallery.com/slider-html-loop/9150545-hd_1920_1080_24fps-0.jpg"
    },
    {
      src: "https://cdn.react-motion-gallery.com/slider-html/9694226-hd_1920_1080_25fps.mp4",
      poster: "https://cdn.react-motion-gallery.com/slider-html-loop/9694226-hd_1920_1080_25fps-0.jpg"
    },
  ];

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
          playOnOpen: true,
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
        cache={demoSkeletonCache("slider-video-html5")}
        layout={{
              visibleCount: 2,
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
                    aspectRatio: '16 / 9',
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
                        kind: "sliderDots",
                        count: MEDIA.length,
                        style: {
                          width: "max-content",
                          padding: "4px 8px",
                          borderRadius: 9999,
                          backgroundColor: "rgba(0, 0, 0, 0.5)",
                          alignSelf: "center",
                        },
                        dotStyle: {
                          width: 14,
                          height: 14,
                          margin: 5,
                          borderRadius: 999,
                        },
                        activeStyle: {
                          backgroundColor: "rgb(80, 163, 255)",
                        },
                        inactiveStyle: {
                          backgroundColor: "lightgray",
                        },
                        shimmer: {
                          enabled: false,
                        },
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
          sliderDots({
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
              key={\`video-\${m.kind === 'video' ? m.src : ''}-\${i}\`}
              src={m.kind === 'video' ? m.src : ''}
              poster={m.kind === 'video' ? m.poster : ''}
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
`;
