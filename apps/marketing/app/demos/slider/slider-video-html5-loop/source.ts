export const source = String.raw`"use client";

import "react-motion-gallery/styles.css";
import {
  GalleryCore,
  Slider,
  Video,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";
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
      fullscreen: {
        enabled: true,
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
            root: {
              style: {
                bottom: "0px"
              }
            }
          }
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
                    aspectRatio: '16 / 9',
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
              },
            }
          }
        }}
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
      <FullscreenAddon />
    </GalleryCore>
  );
}`;
