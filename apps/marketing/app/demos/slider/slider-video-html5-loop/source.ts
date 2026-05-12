export const source = String.raw`/* eslint-disable @next/next/no-img-element */
'use client';

import {
  GalleryCore,
  Slider,
  useSliderReady,
  Video,
  toMediaItems,
  useFullscreenController,
} from "../../../../../../packages/react-motion-gallery/src";
import { SliderSkeleton } from "../../../../../../packages/react-motion-gallery/src/skeleton-slider";
import { fullscreenSlider } from "../../../../../../packages/react-motion-gallery/src/fullscreen-slider";
import { fullscreenZoomPan } from "../../../../../../packages/react-motion-gallery/src/fullscreen-zoom-pan";
import { fullscreenVideo } from "../../../../../../packages/react-motion-gallery/src/fullscreen-video";
import { sliderDots } from "../../../../../../packages/react-motion-gallery/src/slider-dots";
import { sliderArrows } from "../../../../../../packages/react-motion-gallery/src/slider-arrows";
import { sliderFullscreen } from "../../../../../../packages/react-motion-gallery/src/slider-fullscreen";
import { sliderRipple } from "../../../../../../packages/react-motion-gallery/src/slider-ripple";
import styles from "./slider-video-html5-loop-demo.module.css";

export function SliderVideoHtml5LoopDemo() {
  const URLS = [
    {
      src: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html/12354535_1920_1080_30fps.mp4",
      poster: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html-loop/12354535_1920_1080_30fps-0.jpg"
    },
    {
      src: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html/4151824-uhd_3840_2160_25fps.mp4",
      poster: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html-loop/4151824-uhd_3840_2160_25fps-0.jpg"
    },
    {
      src: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html/7677511-hd_1920_1080_25fps.mp4",
      poster: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html/7677511-hd_1920_1080_25fps-0.jpg"
    },
    {
      src: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html/7677513-hd_1920_1080_25fps.mp4",
      poster: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html/7677513-hd_1920_1080_25fps-0.jpg"
    },
    {
      src: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html/9150545-hd_1920_1080_24fps.mp4",
      poster: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html/9150545-hd_1920_1080_24fps-0.jpg"
    },
    {
      src: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html/9694226-hd_1920_1080_25fps.mp4",
      poster: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html-loop/9694226-hd_1920_1080_25fps-0.jpg"
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
