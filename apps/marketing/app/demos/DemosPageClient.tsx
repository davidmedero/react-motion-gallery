/* eslint-disable @next/next/no-img-element */
'use client';

import { CodeBlock } from "@/components/ui/code-block";
import { ChevronDown } from "lucide-react";
import SimpleBar from "simplebar-react";
import type SimpleBarCore from "simplebar-core";
import {
  memo,
  useEffect,
  useLayoutEffect,
  useRef,
  startTransition,
  useState,
  useSyncExternalStore,
  type ReactElement,
  type ReactNode,
} from "react";
import type { JSX } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import styles from "./demos.module.css";
import {
  createSliderIndexChannel,
  FullscreenThumbnailSlider,
  GalleryCore,
  type MediaItem,
  Slider,
  ThumbnailSlider,
  toMediaItems,
  useFullscreenController,
  Video,
} from "../../../../packages/react-motion-gallery/src";

type DemoComponent = () => ReactElement | null;
type DemoCategoryId = "slider" | "grid" | "masonry" | "entries" | "fullscreen";

type DemoNavItem =
  | {
      type: "demo";
      demoId: string;
    }
  | {
      type: "group";
      id: string;
      label: string;
      demoIds: string[];
    };

type DemoCategory = {
  id: DemoCategoryId;
  label: string;
  description: string;
  items: DemoNavItem[];
};

type DemoDefinition = {
  id: string;
  title: string;
  eyebrow: string;
  tags: string[];
  categoryId: DemoCategoryId;
  Component: DemoComponent;
  source?: string;
  css?: string;
};

type SidebarExpansionState = {
  expandedCategories: DemoCategoryId[];
  syncedDemoId: string;
};

type DemoCanvasTab = "preview" | "code";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function toPascalCase(value: string) {
  return value
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("");
}

const STARTER_IMPORTS_BY_CATEGORY: Record<DemoCategoryId, string> = {
  slider: 'import { GalleryCore, Slider } from "react-motion-gallery";',
  grid: 'import { GalleryCore, Grid } from "react-motion-gallery";',
  masonry: 'import { GalleryCore, Masonry } from "react-motion-gallery";',
  entries: 'import { GalleryCore, Entries } from "react-motion-gallery";',
  fullscreen:
    'import { GalleryCore, Slider, useFullscreenController } from "react-motion-gallery";',
};

function resolveExpandedCategories(
  sidebarExpansion: SidebarExpansionState,
  selectedDemoId: string,
  selectedCategoryId: DemoCategoryId
) {
  if (
    sidebarExpansion.syncedDemoId === selectedDemoId ||
    sidebarExpansion.expandedCategories.includes(selectedCategoryId)
  ) {
    return sidebarExpansion.expandedCategories;
  }

  return [...sidebarExpansion.expandedCategories, selectedCategoryId];
}

const SLIDER_DEFAULT_SOURCE = String.raw`"use client";

import "react-motion-gallery/styles.css";
import {
  GalleryCore,
  Slider,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";
import styles from "./slider-default-demo.module.css";

const URLS = [
  "https://picsum.photos/id/995/1600/900",
  "https://picsum.photos/id/996/1600/900",
  "https://picsum.photos/id/997/1600/900",
  "https://picsum.photos/id/998/1600/900",
  "https://picsum.photos/id/999/1600/900",
  "https://picsum.photos/id/1000/1600/900",
];

const FS_URLS = [
  "https://picsum.photos/id/995/2400/1350",
  "https://picsum.photos/id/996/2400/1350",
  "https://picsum.photos/id/997/2400/1350",
  "https://picsum.photos/id/998/2400/1350",
  "https://picsum.photos/id/999/2400/1350",
  "https://picsum.photos/id/1000/2400/1350",
];

function Slide({ src, i }: { src: string; i: number }) {
  return (
    <img
      src={src}
      alt={\`Slide \${i + 1}\`}
      className={styles.slide}
    />
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

export function SliderDefaultDemo() {
  const media = toMediaItems(URLS);
  const fullscreenMedia = toMediaItems(FS_URLS);

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <Slider
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
              },
            },
          },
        }}
      >
        {media.map((item, i) => (
          <Slide
            key={\`img-\${item.kind === "image" ? item.src : ""}-\${i}\`}
            src={item.kind === "image" ? item.src : ""}
            i={i}
          />
        ))}
      </Slider>
      <FullscreenAddon />
    </GalleryCore>
  );
}`;

const SLIDER_LAZY_LOAD_SOURCE = String.raw`"use client";

import "react-motion-gallery/styles.css";
import {
  GalleryCore,
  Slider,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";
import styles from "./slider-lazy-load-demo.module.css";

const URLS = [
  "https://picsum.photos/id/1048/1600/900",
  "https://picsum.photos/id/1049/1600/900",
  "https://picsum.photos/id/1050/1600/900",
  "https://picsum.photos/id/1051/1600/900",
  "https://picsum.photos/id/1052/1600/900",
  "https://picsum.photos/id/1053/1600/900",
];

const FS_URLS = [
  "https://picsum.photos/id/1048/2400/1350",
  "https://picsum.photos/id/1049/2400/1350",
  "https://picsum.photos/id/1050/2400/1350",
  "https://picsum.photos/id/1051/2400/1350",
  "https://picsum.photos/id/1052/2400/1350",
  "https://picsum.photos/id/1053/2400/1350",
];

function Slide({ src, i }: { src: string; i: number }) {
  return (
    <img
      src={src}
      alt={\`Slide \${i + 1}\`}
      className={styles.slide}
    />
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

export function SliderLazyLoadDemo() {
  const media = toMediaItems(URLS);
  const fullscreenMedia = toMediaItems(FS_URLS);

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <Slider
        lazyLoad={{
          enabled: true,
          spinner: true,
          spinnerClassName: styles.spinner,
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
              },
            },
          },
        }}
      >
        {media.map((item, i) => (
          <Slide
            key={\`img-\${item.kind === "image" ? item.src : ""}-\${i}\`}
            src={item.kind === "image" ? item.src : ""}
            i={i}
          />
        ))}
      </Slider>
      <FullscreenAddon />
    </GalleryCore>
  );
}`;

const SLIDER_AUTO_SCROLL_SOURCE = String.raw`"use client";

import "react-motion-gallery/styles.css";
import {
  GalleryCore,
  Slider,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";
import styles from "./slider-auto-scroll-demo.module.css";

const SLIDES = [
  {
    src: "https://picsum.photos/id/1055/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/1055/2400/2400",
  },
  {
    src: "https://picsum.photos/id/1056/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/1056/2400/2400",
  },
  {
    src: "https://picsum.photos/id/1057/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/1057/2400/2400",
  },
  {
    src: "https://picsum.photos/id/1058/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/1058/2400/2400",
  },
  {
    src: "https://picsum.photos/id/1059/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/1059/2400/2400",
  },
  {
    src: "https://picsum.photos/id/1060/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/1060/2400/2400",
  },
  {
    src: "https://picsum.photos/id/1061/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/1061/2400/2400",
  },
  {
    src: "https://picsum.photos/id/1062/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/1062/2400/2400",
  },
];

function Slide({ src, i }: { src: string; i: number }) {
  return (
    <img
      src={src}
      alt={\`Slide \${i + 1}\`}
      className={styles.slide}
    />
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

export function SliderAutoScrollDemo() {
  const media = toMediaItems(SLIDES.map((slide) => slide.src));
  const fullscreenMedia = toMediaItems(SLIDES.map((slide) => slide.fullscreenSrc));

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <Slider
        align="center"
        scroll={{
          loop: true,
        }}
        auto={{
          scroll: {
            enabled: true,
          },
        }}
        controls={{
          dots: {
            enabled: false,
          },
        }}
        transitions={{
          loading: {
            skeletonCount: 4,
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
                    width: "100%",
                    height: "100%",
                    borderRadius: 12,
                  },
                },
                itemWrapStyle: {
                  width: "100cqw",
                  maxWidth: "320px",
                  aspectRatio: "4 / 5",
                },
              },
            },
          },
        }}
      >
        {media.map((item, i) => (
          <Slide
            key={\`img-\${item.kind === "image" ? item.src : ""}-\${i}\`}
            src={item.kind === "image" ? item.src : ""}
            i={i}
          />
        ))}
      </Slider>
      <FullscreenAddon />
    </GalleryCore>
  );
}`;

const SLIDER_AUTO_PLAY_SOURCE = String.raw`"use client";

import "react-motion-gallery/styles.css";
import {
  GalleryCore,
  Slider,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";
import styles from "./slider-auto-play-demo.module.css";

const SLIDES = [
  {
    src: "https://picsum.photos/id/1055/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/1055/2400/2400",
  },
  {
    src: "https://picsum.photos/id/1056/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/1056/2400/2400",
  },
  {
    src: "https://picsum.photos/id/1057/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/1057/2400/2400",
  },
  {
    src: "https://picsum.photos/id/1058/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/1058/2400/2400",
  },
  {
    src: "https://picsum.photos/id/1059/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/1059/2400/2400",
  },
  {
    src: "https://picsum.photos/id/1060/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/1060/2400/2400",
  },
  {
    src: "https://picsum.photos/id/1061/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/1061/2400/2400",
  },
  {
    src: "https://picsum.photos/id/1062/1200/1200",
    fullscreenSrc: "https://picsum.photos/id/1062/2400/2400",
  },
];

function Slide({ src, i }: { src: string; i: number }) {
  return (
    <img
      src={src}
      alt={\`Slide \${i + 1}\`}
      className={styles.slide}
    />
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

export function SliderAutoPlayDemo() {
  const media = toMediaItems(SLIDES.map((slide) => slide.src));
  const fullscreenMedia = toMediaItems(SLIDES.map((slide) => slide.fullscreenSrc));

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <Slider
        align="center"
        scroll={{
          loop: true,
          groupCells: true
        }}
        auto={{
          play: {
            enabled: true,
            speedMs: 2200,
          },
        }}
        transitions={{
          loading: {
            skeletonCount: 4,
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
                    width: "100%",
                    height: "100%",
                    borderRadius: 12,
                  },
                },
                itemWrapStyle: {
                  width: "100cqw",
                  maxWidth: "550px",
                  aspectRatio: "16 / 9",
                },
              },
            },
          },
        }}
      >
        {media.map((item, i) => (
          <Slide
            key={\`img-\${item.kind === "image" ? item.src : ""}-\${i}\`}
            src={item.kind === "image" ? item.src : ""}
            i={i}
          />
        ))}
      </Slider>
      <FullscreenAddon />
    </GalleryCore>
  );
}`;

const SLIDER_SKIP_SNAPS_SOURCE = String.raw`"use client";

import "react-motion-gallery/styles.css";
import {
  GalleryCore,
  Slider,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";
import styles from "./slider-skip-snaps-demo.module.css";

const URLS = [
  "https://picsum.photos/id/1001/1600/900",
  "https://picsum.photos/id/1002/1600/900",
  "https://picsum.photos/id/1003/1600/900",
  "https://picsum.photos/id/1004/1600/900",
  "https://picsum.photos/id/1005/1600/900",
  "https://picsum.photos/id/1006/1600/900",
];

const FS_URLS = [
  "https://picsum.photos/id/1001/2400/1350",
  "https://picsum.photos/id/1002/2400/1350",
  "https://picsum.photos/id/1003/2400/1350",
  "https://picsum.photos/id/1004/2400/1350",
  "https://picsum.photos/id/1005/2400/1350",
  "https://picsum.photos/id/1006/2400/1350",
];

function Slide({ src, i }: { src: string; i: number }) {
  return (
    <img
      src={src}
      alt={\`Slide \${i + 1}\`}
      className={styles.slide}
    />
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

export function SliderSkipSnapsDemo() {
  const media = toMediaItems(URLS);
  const fullscreenMedia = toMediaItems(FS_URLS);

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <Slider
        scroll={{
          skipSnaps: true,
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
              },
            },
          },
        }}
      >
        {media.map((item, i) => (
          <Slide
            key={\`img-\${item.kind === "image" ? item.src : ""}-\${i}\`}
            src={item.kind === "image" ? item.src : ""}
            i={i}
          />
        ))}
      </Slider>
      <FullscreenAddon />
    </GalleryCore>
  );
}`;

const SLIDER_CENTER_ALIGN_SOURCE = String.raw`"use client";

import "react-motion-gallery/styles.css";
import {
  GalleryCore,
  Slider,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";
import styles from "./slider-center-align-demo.module.css";

const URLS = [
  "https://picsum.photos/id/107/1600/900",
  "https://picsum.photos/id/1008/1600/900",
  "https://picsum.photos/id/1009/1600/900",
  "https://picsum.photos/id/1010/1600/900",
  "https://picsum.photos/id/1011/1600/900",
  "https://picsum.photos/id/1012/1600/900",
];

const FS_URLS = [
  "https://picsum.photos/id/107/2400/1350",
  "https://picsum.photos/id/1008/2400/1350",
  "https://picsum.photos/id/1009/2400/1350",
  "https://picsum.photos/id/1010/2400/1350",
  "https://picsum.photos/id/1011/2400/1350",
  "https://picsum.photos/id/1012/2400/1350",
];

function Slide({ src, i }: { src: string; i: number }) {
  return (
    <img
      src={src}
      alt={\`Slide \${i + 1}\`}
      className={styles.slide}
    />
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

export function SliderCenterAlignDemo() {
  const media = toMediaItems(URLS);
  const fullscreenMedia = toMediaItems(FS_URLS);

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <Slider
        align="center"
        transitions={{
          loading: {
            skeletonCount: 3,
            skeleton: {
              mode: "peek",
              centering: "first",
              style: {
                overflow: "hidden",
              },
              layout: {
                kind: "slider",
                direction: "row",
                style: {
                  gap: 20,
                },
                item: {
                  kind: "rect",
                  style: {
                    width: "100%",
                    height: "100%",
                    borderRadius: 12,
                  },
                },
                itemWrapStyle: {
                  width: "100cqw",
                  maxWidth: "550px",
                  aspectRatio: "16 / 9",
                },
              },
            },
          },
        }}
      >
        {media.map((item, i) => (
          <Slide
            key={\`img-\${item.kind === "image" ? item.src : ""}-\${i}\`}
            src={item.kind === "image" ? item.src : ""}
            i={i}
          />
        ))}
      </Slider>
      <FullscreenAddon />
    </GalleryCore>
  );
}`;

const SLIDER_VARIABLE_WIDTHS_SOURCE = String.raw`"use client";

import "react-motion-gallery/styles.css";
import {
  GalleryCore,
  Slider,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";
import styles from "./slider-variable-widths-demo.module.css";

const SLIDES = [
  {
    src: "https://picsum.photos/id/1013/1200/900",
    fullscreenSrc: "https://picsum.photos/id/1013/2400/1800",
    width: 220,
    height: 320,
  },
  {
    src: "https://picsum.photos/id/1014/1020/630",
    fullscreenSrc: "https://picsum.photos/id/1014/2040/1260",
    width: 420,
    height: 320,
  },
  {
    src: "https://picsum.photos/id/1015/780/1340",
    fullscreenSrc: "https://picsum.photos/id/1015/1560/2680",
    width: 260,
    height: 320,
  },
  {
    src: "https://picsum.photos/id/1016/1280/720",
    fullscreenSrc: "https://picsum.photos/id/1016/2560/1440",
    width: 360,
    height: 320,
  },
  {
    src: "https://picsum.photos/id/101/1200/900",
    fullscreenSrc: "https://picsum.photos/id/101/2400/1800",
    width: 200,
    height: 320,
  },
  {
    src: "https://picsum.photos/id/1018/900/570",
    fullscreenSrc: "https://picsum.photos/id/1018/1800/1140",
    width: 300,
    height: 320,
  },
  {
    src: "https://picsum.photos/id/18/900/570",
    fullscreenSrc: "https://picsum.photos/id/18/1800/1140",
    width: 500,
    height: 320,
  },
  {
    src: "https://picsum.photos/id/19/900/570",
    fullscreenSrc: "https://picsum.photos/id/19/1800/1140",
    width: 250,
    height: 320,
  },
];

function Slide(props: { src: string; width: number; height: number; i: number }) {
  const { src, width, height, i } = props;

  return (
    <img
      src={src}
      alt={\`Slide \${i + 1}\`}
      className={styles.variableWidthSlide}
      style={{ width, height }}
    />
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

export function SliderVariableWidthsDemo() {
  const media = toMediaItems(SLIDES.map((slide) => slide.src));
  const fullscreenMedia = toMediaItems(SLIDES.map((slide) => slide.fullscreenSrc));

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <Slider
        align="center"
        transitions={{
          loading: {
            skeletonCount: 2,
            skeleton: {
              mode: "peek",
              centering: "first",
              layout: {
                kind: "slider",
                direction: "row",
                style: {
                  gap: 20,
                },
                item: {
                  kind: "rect",
                  style: {
                    width: "100%",
                    height: "100%",
                    borderRadius: 12,
                  },
                },
                slots: SLIDES.map((slide) => ({
                  itemWrapStyle: {
                    width: slide.width,
                    height: slide.height,
                  },
                })),
              },
            },
          },
        }}
      >
        {media.map((item, i) => {
          const slide = SLIDES[i];

          return (
            <Slide
              key={\`img-\${item.kind === "image" ? item.src : ""}-\${i}\`}
              src={item.kind === "image" ? item.src : ""}
              width={slide.width}
              height={slide.height}
              i={i}
            />
          );
        })}
      </Slider>
      <FullscreenAddon />
    </GalleryCore>
  );
}`;

const SLIDER_Y_AXIS_SOURCE = String.raw`"use client";

import "react-motion-gallery/styles.css";
import {
  GalleryCore,
  Slider,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";
import styles from "./slider-y-axis-demo.module.css";

const URLS = [
  "https://picsum.photos/id/1019/1600/900",
  "https://picsum.photos/id/1020/1600/900",
  "https://picsum.photos/id/1021/1600/900",
  "https://picsum.photos/id/1022/1600/900",
  "https://picsum.photos/id/1023/1600/900",
  "https://picsum.photos/id/1024/1600/900",
];

const FS_URLS = [
  "https://picsum.photos/id/1019/2400/1350",
  "https://picsum.photos/id/1020/2400/1350",
  "https://picsum.photos/id/1021/2400/1350",
  "https://picsum.photos/id/1022/2400/1350",
  "https://picsum.photos/id/1023/2400/1350",
  "https://picsum.photos/id/1024/2400/1350",
];

function Slide({ src, i }: { src: string; i: number }) {
  return (
    <img
      src={src}
      alt={\`Slide \${i + 1}\`}
      className={styles.slide}
    />
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

function SliderYAxisGallery() {
  const media = toMediaItems(URLS);
  const fullscreenMedia = toMediaItems(FS_URLS);

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <Slider
        direction={{
          axis: "y",
        }}
        elements={{
          viewport: {
            style: {
              height: "100cqh",
              maxHeight: "530px",
            },
          },
        }}
        transitions={{
          loading: {
            skeletonCount: 3,
            skeleton: {
              mode: "peek",
              layout: {
                kind: "slider",
                direction: "col",
                style: {
                  gap: 20,
                },
                item: {
                  kind: "rect",
                  style: {
                    width: "100%",
                    height: "100%",
                    borderRadius: 12,
                  },
                },
                itemWrapStyle: {
                  width: "100cqw",
                  aspectRatio: "16 / 7",
                },
              },
            },
          },
        }}
      >
        {media.map((item, i) => (
          <Slide
            key={\`img-\${item.kind === "image" ? item.src : ""}-\${i}\`}
            src={item.kind === "image" ? item.src : ""}
            i={i}
          />
        ))}
      </Slider>
      <FullscreenAddon />
    </GalleryCore>
  );
}

export function SliderYAxisDemo() {
  return (
    <div className={styles.demoCanvasSliderYAxis}>
      <SliderYAxisGallery />
    </div>
  );
}`;

const SLIDER_CELLS_PER_SLIDE_SOURCE = String.raw`"use client";

import "react-motion-gallery/styles.css";
import {
  GalleryCore,
  Slider,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";
import styles from "./slider-cells-per-slide-demo.module.css";

const URLS = [
  "https://picsum.photos/id/1025/1200/1200",
  "https://picsum.photos/id/1026/1200/1200",
  "https://picsum.photos/id/1027/1200/1200",
  "https://picsum.photos/id/1028/1200/1200",
  "https://picsum.photos/id/1029/1200/1200",
  "https://picsum.photos/id/103/1200/1200",
  "https://picsum.photos/id/1031/1200/1200",
  "https://picsum.photos/id/1032/1200/1200",
  "https://picsum.photos/id/1033/1200/1200",
  "https://picsum.photos/id/104/1200/1200",
  "https://picsum.photos/id/1035/1200/1200",
  "https://picsum.photos/id/1036/1200/1200",
];

const FS_URLS = [
  "https://picsum.photos/id/1025/2400/2400",
  "https://picsum.photos/id/1026/2400/2400",
  "https://picsum.photos/id/1027/2400/2400",
  "https://picsum.photos/id/1028/2400/2400",
  "https://picsum.photos/id/1029/2400/2400",
  "https://picsum.photos/id/103/2400/2400",
  "https://picsum.photos/id/1031/2400/2400",
  "https://picsum.photos/id/1032/2400/2400",
  "https://picsum.photos/id/1033/2400/2400",
  "https://picsum.photos/id/104/2400/2400",
  "https://picsum.photos/id/1035/2400/2400",
  "https://picsum.photos/id/1036/2400/2400",
];

const CELLS_PER_SLIDE = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4,
};

function Slide({ src, i }: { src: string; i: number }) {
  return (
    <img
      src={src}
      alt={\`Slide \${i + 1}\`}
      className={styles.slide}
    />
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

export function SliderCellsPerSlideDemo() {
  const media = toMediaItems(URLS);
  const fullscreenMedia = toMediaItems(FS_URLS);

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <Slider
        layout={{
          cellsPerSlide: CELLS_PER_SLIDE,
        }}
        scroll={{
          groupCells: true,
        }}
        transitions={{
          loading: {
            skeletonCount: CELLS_PER_SLIDE,
            skeleton: {
              mode: "fit",
              layout: {
                kind: "slider",
                direction: "row",
                style: {
                  gap: 20,
                },
                item: {
                  kind: "rect",
                  style: {
                    width: "100%",
                    aspectRatio: "2 / 3",
                    borderRadius: 12,
                  },
                },
              },
            },
          },
        }}
      >
        {media.map((item, i) => (
          <Slide
            key={\`img-\${item.kind === "image" ? item.src : ""}-\${i}\`}
            src={item.kind === "image" ? item.src : ""}
            i={i}
          />
        ))}
      </Slider>
      <FullscreenAddon />
    </GalleryCore>
  );
}`;

const SLIDER_THUMBNAILS_SOURCE = String.raw`"use client";

import { useState, useSyncExternalStore } from "react";
import "react-motion-gallery/styles.css";
import {
  FullscreenThumbnailSlider,
  GalleryCore,
  Slider,
  ThumbnailSlider,
  createSliderIndexChannel,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";
import styles from "./slider-thumbnails-demo.module.css";

const SLIDES = [
  {
    slideSrc: "https://picsum.photos/id/1037/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1037/2400/1350",
    thumbSrc: "https://picsum.photos/id/1037/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/1038/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1038/2400/1350",
    thumbSrc: "https://picsum.photos/id/1038/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/1039/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1039/2400/1350",
    thumbSrc: "https://picsum.photos/id/1039/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/1040/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1040/2400/1350",
    thumbSrc: "https://picsum.photos/id/1040/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/1041/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1041/2400/1350",
    thumbSrc: "https://picsum.photos/id/1041/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/1042/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1042/2400/1350",
    thumbSrc: "https://picsum.photos/id/1042/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/1043/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1043/2400/1350",
    thumbSrc: "https://picsum.photos/id/1043/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/1044/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1044/2400/1350",
    thumbSrc: "https://picsum.photos/id/1044/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/1045/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1045/2400/1350",
    thumbSrc: "https://picsum.photos/id/1045/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/1047/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1047/2400/1350",
    thumbSrc: "https://picsum.photos/id/1047/320/200",
  },
];

function Slide({ src, i }: { src: string; i: number }) {
  return (
    <img
      src={src}
      alt={\`Slide \${i + 1}\`}
      className={styles.slide}
    />
  );
}

function Thumb({ src, i }: { src: string; i: number }) {
  return (
    <img
      src={src}
      alt={\`Thumbnail \${i + 1}\`}
      className={styles.thumbnailImage}
    />
  );
}

function useDocumentClientWidth() {
  return useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("resize", onStoreChange);
      window.visualViewport?.addEventListener("resize", onStoreChange);

      return () => {
        window.removeEventListener("resize", onStoreChange);
        window.visualViewport?.removeEventListener("resize", onStoreChange);
      };
    },
    () => document.documentElement.clientWidth,
    () => 0
  );
}

function FullscreenAddon() {
  const viewportWidth = useDocumentClientWidth();
  const { fullscreenNode, fullscreenThumbnailBridge } = useFullscreenController({
    fullscreen: {
      enabled: true,
    },
  });

  return (
    <>
      {fullscreenNode}
      <FullscreenThumbnailSlider
        bridge={fullscreenThumbnailBridge}
        items={SLIDES.map((slide, i) => ({
          thumbSrc: slide.thumbSrc,
          alt: \`Thumbnail \${i + 1}\`,
        }))}
        position="bottom"
        thumbnailsCenter
        thumbnailWidth={96}
        thumbnailHeight={60}
        containerStyle={{
          width: viewportWidth || undefined,
          padding: "8px 12px",
          overflow: "visible",
        }}
        thumbnailItemClassName={styles.fullscreenThumbnailThumb}
        gap={12}
        centerActiveThumb
        showArrows
      />
    </>
  );
}

export function SliderThumbnailsDemo() {
  const [indexChannel] = useState(() => createSliderIndexChannel());
  const media = toMediaItems(SLIDES.map((slide) => slide.slideSrc));
  const fullscreenMedia = toMediaItems(
    SLIDES.map((slide) => slide.fullscreenSrc)
  );

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <Slider
        indexChannel={indexChannel}
        controls={{
          dots: {
            enabled: false,
          },
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
              },
            },
          },
        }}
      >
        {media.map((item, i) => (
          <Slide
            key={\`img-\${item.kind === "image" ? item.src : ""}-\${i}\`}
            src={SLIDES[i]?.slideSrc ?? ""}
            i={i}
          />
        ))}
      </Slider>

      <ThumbnailSlider
        indexChannel={indexChannel}
        options={{
          layout: {
            position: "bottom",
            gap: 12,
            thumbnail: {
              width: 96,
              height: 60,
            },
          },
          scroll: {
            centerActiveThumb: true,
          },
          controls: {
            enabled: true,
          },
          elements: {
            container: {
              style: {
                marginTop: 14,
              },
            },
            thumbnail: {
              className: styles.thumbnailThumb,
            },
          },
          transitions: {
            loading: {
              skeletonCount: 9,
              elements: {
                container: {
                  className: styles.thumbnailSkeletonContainer,
                },
                thumbnail: {
                  className: styles.thumbnailSkeletonThumb,
                },
              },
            },
          },
        }}
      >
        {SLIDES.map((slide, i) => (
          <Thumb
            key={\`thumb-\${slide.thumbSrc}\`}
            src={slide.thumbSrc}
            i={i}
          />
        ))}
      </ThumbnailSlider>

      <FullscreenAddon />
    </GalleryCore>
  );
}`;

const FULLSCREEN_THUMBNAILS_SOURCE = String.raw`"use client";

import "react-motion-gallery/styles.css";
import {
  FullscreenThumbnailSlider,
  GalleryCore,
  Slider,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";
import styles from "./fullscreen-thumbnails-demo.module.css";

const SLIDES = [
  {
    slideSrc: "https://picsum.photos/id/1043/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1043/2400/1350",
    thumbSrc: "https://picsum.photos/id/1043/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/1044/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1044/2400/1350",
    thumbSrc: "https://picsum.photos/id/1044/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/1045/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1045/2400/1350",
    thumbSrc: "https://picsum.photos/id/1045/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/1046/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1046/2400/1350",
    thumbSrc: "https://picsum.photos/id/1046/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/1047/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1047/2400/1350",
    thumbSrc: "https://picsum.photos/id/1047/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/1048/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1048/2400/1350",
    thumbSrc: "https://picsum.photos/id/1048/320/200",
  },
];

function Slide({ src, i }: { src: string; i: number }) {
  return (
    <img
      src={src}
      alt={\`Slide \${i + 1}\`}
      className={styles.slide}
    />
  );
}

function FullscreenThumbnailsAddon() {
  const { fullscreenNode, fullscreenThumbnailBridge } = useFullscreenController({
    fullscreen: {
      enabled: true,
    },
  });

  return (
    <>
      {fullscreenNode}
      <FullscreenThumbnailSlider
        bridge={fullscreenThumbnailBridge}
        items={SLIDES.map((slide, i) => ({
          thumbSrc: slide.thumbSrc,
          alt: \`Thumbnail \${i + 1}\`,
        }))}
        position="bottom"
        thumbnailsCenter
        thumbnailWidth={96}
        thumbnailHeight={60}
        containerStyle={{
          width: "100dvw",
          padding: "8px 12px",
          overflow: "visible",
        }}
        thumbnailItemClassName={styles.fullscreenThumbnailThumb}
        gap={12}
        centerActiveThumb
        showArrows
      />
    </>
  );
}

export function FullscreenThumbnailsDemo() {
  const media = toMediaItems(SLIDES.map((slide) => slide.slideSrc));
  const fullscreenMedia = toMediaItems(
    SLIDES.map((slide) => slide.fullscreenSrc)
  );

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <Slider
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
              },
            },
          },
        }}
      >
        {media.map((item, i) => (
          <Slide
            key={\`img-\${item.kind === "image" ? item.src : ""}-\${i}\`}
            src={SLIDES[i]?.slideSrc ?? ""}
            i={i}
          />
        ))}
      </Slider>
      <FullscreenThumbnailsAddon />
    </GalleryCore>
  );
}`;

const SLIDER_RIGHT_TO_LEFT_SOURCE = String.raw`"use client";

import "react-motion-gallery/styles.css";
import {
  GalleryCore,
  Slider,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";
import styles from "./slider-right-to-left-demo.module.css";

const URLS = [
  "https://picsum.photos/id/1049/1600/900",
  "https://picsum.photos/id/1050/1600/900",
  "https://picsum.photos/id/1051/1600/900",
  "https://picsum.photos/id/1052/1600/900",
  "https://picsum.photos/id/1053/1600/900",
  "https://picsum.photos/id/1054/1600/900",
];

const FS_URLS = [
  "https://picsum.photos/id/1049/2400/1350",
  "https://picsum.photos/id/1050/2400/1350",
  "https://picsum.photos/id/1051/2400/1350",
  "https://picsum.photos/id/1052/2400/1350",
  "https://picsum.photos/id/1053/2400/1350",
  "https://picsum.photos/id/1054/2400/1350",
];

function Slide({ src, i }: { src: string; i: number }) {
  return (
    <img
      src={src}
      alt={\`Slide \${i + 1}\`}
      className={styles.slide}
    />
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

export function SliderRightToLeftDemo() {
  const media = toMediaItems(URLS);
  const fullscreenMedia = toMediaItems(FS_URLS);

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <Slider
        direction={{
          dir: "rtl",
        }}
        transitions={{
          loading: {
            skeletonCount: 2,
            skeleton: {
              mode: "peek",
              style: {
                direction: "rtl",
              },
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
              },
            },
          },
        }}
      >
        {media.map((item, i) => (
          <Slide
            key={\`img-\${item.kind === "image" ? item.src : ""}-\${i}\`}
            src={item.kind === "image" ? item.src : ""}
            i={i}
          />
        ))}
      </Slider>
      <FullscreenAddon />
    </GalleryCore>
  );
}`;

const SLIDER_GROUP_CELLS_SOURCE = String.raw`"use client";

import "react-motion-gallery/styles.css";
import {
  GalleryCore,
  Slider,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";
import styles from "./slider-group-cells-demo.module.css";

const URLS = [
  "https://picsum.photos/id/1055/1200/1200",
  "https://picsum.photos/id/1056/1200/1200",
  "https://picsum.photos/id/1057/1200/1200",
  "https://picsum.photos/id/1058/1200/1200",
  "https://picsum.photos/id/1059/1200/1200",
  "https://picsum.photos/id/1060/1200/1200",
  "https://picsum.photos/id/1061/1200/1200",
  "https://picsum.photos/id/1062/1200/1200",
  "https://picsum.photos/id/1063/1200/1200",
  "https://picsum.photos/id/1064/1200/1200",
  "https://picsum.photos/id/1065/1200/1200",
  "https://picsum.photos/id/1066/1200/1200",
];

const FS_URLS = [
  "https://picsum.photos/id/1055/2400/2400",
  "https://picsum.photos/id/1056/2400/2400",
  "https://picsum.photos/id/1057/2400/2400",
  "https://picsum.photos/id/1058/2400/2400",
  "https://picsum.photos/id/1059/2400/2400",
  "https://picsum.photos/id/1060/2400/2400",
  "https://picsum.photos/id/1061/2400/2400",
  "https://picsum.photos/id/1062/2400/2400",
  "https://picsum.photos/id/1063/2400/2400",
  "https://picsum.photos/id/1064/2400/2400",
  "https://picsum.photos/id/1065/2400/2400",
  "https://picsum.photos/id/1066/2400/2400",
];

function Slide({ src, i }: { src: string; i: number }) {
  return (
    <img
      src={src}
      alt={\`Slide \${i + 1}\`}
      className={styles.slide}
    />
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

export function SliderGroupCellsDemo() {
  const media = toMediaItems(URLS);
  const fullscreenMedia = toMediaItems(FS_URLS);

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <Slider
        scroll={{
          groupCells: true,
        }}
        transitions={{
          loading: {
            skeletonCount: 4,
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
                    maxWidth: "280px",
                    aspectRatio: "2 / 3",
                    borderRadius: 12,
                  },
                },
              },
            },
          },
        }}
      >
        {media.map((item, i) => (
          <Slide
            key={\`img-\${item.kind === "image" ? item.src : ""}-\${i}\`}
            src={item.kind === "image" ? item.src : ""}
            i={i}
          />
        ))}
      </Slider>
      <FullscreenAddon />
    </GalleryCore>
  );
}`;

const SLIDER_FREE_SCROLL_SOURCE = String.raw`"use client";

import "react-motion-gallery/styles.css";
import {
  GalleryCore,
  Slider,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";
import styles from "./slider-free-scroll-demo.module.css";

const URLS = [
  "https://picsum.photos/id/1067/1200/1200",
  "https://picsum.photos/id/1068/1200/1200",
  "https://picsum.photos/id/1069/1200/1200",
  "https://picsum.photos/id/1070/1200/1200",
  "https://picsum.photos/id/1071/1200/1200",
  "https://picsum.photos/id/1072/1200/1200",
  "https://picsum.photos/id/1073/1200/1200",
  "https://picsum.photos/id/1074/1200/1200",
  "https://picsum.photos/id/1075/1200/1200",
  "https://picsum.photos/id/1076/1200/1200",
  "https://picsum.photos/id/1077/1200/1200",
  "https://picsum.photos/id/1078/1200/1200",
];

const FS_URLS = [
  "https://picsum.photos/id/1067/2400/2400",
  "https://picsum.photos/id/1068/2400/2400",
  "https://picsum.photos/id/1069/2400/2400",
  "https://picsum.photos/id/1070/2400/2400",
  "https://picsum.photos/id/1071/2400/2400",
  "https://picsum.photos/id/1072/2400/2400",
  "https://picsum.photos/id/1073/2400/2400",
  "https://picsum.photos/id/1074/2400/2400",
  "https://picsum.photos/id/1075/2400/2400",
  "https://picsum.photos/id/1076/2400/2400",
  "https://picsum.photos/id/1077/2400/2400",
  "https://picsum.photos/id/1078/2400/2400",
];

function Slide({ src, i }: { src: string; i: number }) {
  return (
    <img
      src={src}
      alt={\`Slide \${i + 1}\`}
      className={styles.slide}
    />
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

export function SliderFreeScrollDemo() {
  const media = toMediaItems(URLS);
  const fullscreenMedia = toMediaItems(FS_URLS);

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <Slider
        scroll={{
          freeScroll: true,
          groupCells: true
        }}
        transitions={{
          loading: {
            skeletonCount: 4,
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
                    maxWidth: "280px",
                    aspectRatio: "2 / 3",
                    borderRadius: 12,
                  },
                },
              },
            },
          },
        }}
      >
        {media.map((item, i) => (
          <Slide
            key={\`img-\${item.kind === "image" ? item.src : ""}-\${i}\`}
            src={item.kind === "image" ? item.src : ""}
            i={i}
          />
        ))}
      </Slider>
      <FullscreenAddon />
    </GalleryCore>
  );
}`;

const SLIDER_LOOP_SOURCE = String.raw`"use client";

import "react-motion-gallery/styles.css";
import {
  GalleryCore,
  Slider,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";

const URLS = [
  "https://picsum.photos/id/1079/1600/900",
  "https://picsum.photos/id/1080/1600/900",
  "https://picsum.photos/id/1081/1600/900",
  "https://picsum.photos/id/1082/1600/900",
  "https://picsum.photos/id/1083/1600/900",
  "https://picsum.photos/id/1084/1600/900",
];

const FS_URLS = [
  "https://picsum.photos/id/1079/2400/1350",
  "https://picsum.photos/id/1080/2400/1350",
  "https://picsum.photos/id/1081/2400/1350",
  "https://picsum.photos/id/1082/2400/1350",
  "https://picsum.photos/id/1083/2400/1350",
  "https://picsum.photos/id/1084/2400/1350",
];

function Slide({ src, i }: { src: string; i: number }) {
  return (
    <img
      src={src}
      alt={\`Slide \${i + 1}\`}
      className={styles.slide}
    />
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

export function SliderDefaultDemo() {
  const media = toMediaItems(URLS);
  const fullscreenMedia = toMediaItems(FS_URLS);

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <Slider
        scroll={{
          loop: true
        }}
        align="center"
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
              },
            },
          },
        }}
      >
        {media.map((item, i) => (
          <Slide
            key={\`img-\${item.kind === "image" ? item.src : ""}-\${i}\`}
            src={item.kind === "image" ? item.src : ""}
            i={i}
          />
        ))}
      </Slider>
      <FullscreenAddon />
    </GalleryCore>
  );
}`;

const SLIDER_HTML5_SOURCE = String.raw`"use client";

import "react-motion-gallery/styles.css";
import {
  GalleryCore,
  Slider,
  Video,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";
import styles from "./slider-video-html5-demo.module.css";

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
        controls={{
          dots: {
            root: {
              style: {
                bottom: "-52px"
              }
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

const SLIDER_HTML5_LOOP_SOURCE = String.raw`"use client";

import "react-motion-gallery/styles.css";
import {
  GalleryCore,
  Slider,
  Video,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";
import styles from "./slider-video-html5-loop-demo.module.css";

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
        controls={{
          dots: {
            root: {
              style: {
                bottom: "-52px"
              }
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

const SLIDER_YOUTUBE_SOURCE = String.raw`"use client";

import "react-motion-gallery/styles.css";
import {
  GalleryCore,
  Slider,
  Video,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";
import styles from "./slider-video-youtube-demo.module.css";

const URLS = [
  { 
    kind: "video",
    src: "zT5RMvM0gaI",
    poster: "https://i.ytimg.com/vi/zT5RMvM0gaI/hqdefault.jpg" 
  },
  { 
    kind: "video",
    src: "c2h1T06-3vQ",
    poster: "https://i.ytimg.com/vi/c2h1T06-3vQ/hqdefault.jpg" 
  },
  { 
    kind: "video",
    src: "mTM7F-5999Q",
    poster: "https://i.ytimg.com/vi/mTM7F-5999Q/hqdefault.jpg"
  },
  { 
    kind: "video",
    src: "cJLL_gNpBb8",
    poster: "https://i.ytimg.com/vi/cJLL_gNpBb8/hqdefault.jpg"
  },
  { 
    kind: "video",
    src: "IxF55qB4CuQ",
    poster: "https://i.ytimg.com/vi/IxF55qB4CuQ/hqdefault.jpg"
  },
  { 
    kind: "video",
    src: "IGOaJnvQdng",
    poster: "https://i.ytimg.com/vi/IGOaJnvQdng/hqdefault.jpg" 
  },
];

function buildYoutubeSource(src: string, poster?: string) {
  return {
    type: "video",
    poster,
    sources: [{ src, provider: "youtube" }],
  };
}

const YOUTUBE_OPTIONS = {
  ratio: "16:9",
  controls: [],
  youtube: {
    customControls: false,
  },
};

function buildYoutubeFullscreenSource(item) {
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
      controls={{
        dots: {
          enabled: false,
        },
        scrollbar: {
          enabled: true,
          root: {
            style: {
              bottom: "-52px"
            }
          }
        },
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

const SLIDER_YOUTUBE_LOOP_SOURCE = String.raw`"use client";

import "react-motion-gallery/styles.css";
import {
  GalleryCore,
  Slider,
  Video,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";
import styles from "./slider-video-youtube-loop-demo.module.css";

const URLS = [
  { 
    kind: "video",
    src: "zT5RMvM0gaI",
    poster: "https://i.ytimg.com/vi/zT5RMvM0gaI/hqdefault.jpg" 
  },
  { 
    kind: "video",
    src: "c2h1T06-3vQ",
    poster: "https://i.ytimg.com/vi/c2h1T06-3vQ/hqdefault.jpg" 
  },
  { 
    kind: "video",
    src: "mTM7F-5999Q",
    poster: "https://i.ytimg.com/vi/mTM7F-5999Q/hqdefault.jpg"
  },
  { 
    kind: "video",
    src: "cJLL_gNpBb8",
    poster: "https://i.ytimg.com/vi/cJLL_gNpBb8/hqdefault.jpg"
  },
  { 
    kind: "video",
    src: "IxF55qB4CuQ",
    poster: "https://i.ytimg.com/vi/IxF55qB4CuQ/hqdefault.jpg"
  },
  { 
    kind: "video",
    src: "IGOaJnvQdng",
    poster: "https://i.ytimg.com/vi/IGOaJnvQdng/hqdefault.jpg" 
  },
];

function buildYoutubeSource(src: string, poster?: string) {
  return {
    type: "video",
    poster,
    sources: [{ src, provider: "youtube" }],
  };
}

const YOUTUBE_OPTIONS = {
  ratio: "16:9",
  controls: [],
  youtube: {
    customControls: false,
  },
};

function buildYoutubeFullscreenSource(item) {
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
              bottom: "-52px"
            }
          }
        },
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

const SLIDER_VIMEO_SOURCE = String.raw`"use client";

import "react-motion-gallery/styles.css";
import {
  GalleryCore,
  Slider,
  Video,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";
import styles from "./slider-video-vimeo-demo.module.css";

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
              bottom: "-52px"
            }
          }
        },
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

const SLIDER_VIMEO_LOOP_SOURCE = String.raw`"use client";

import "react-motion-gallery/styles.css";
import {
  GalleryCore,
  Slider,
  Video,
  toMediaItems,
  useFullscreenController,
} from "react-motion-gallery";
import styles from "./slider-video-vimeo-loop-demo.module.css";

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
              bottom: "-52px"
            }
          }
        },
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

const SLIDER_YOUTUBE_VIDEO_IDS = [
  "zT5RMvM0gaI",
  "c2h1T06-3vQ",
  "mTM7F-5999Q",
  "cJLL_gNpBb8",
  "IxF55qB4CuQ",
  "IGOaJnvQdng",
];

const SLIDER_YOUTUBE_URLS = SLIDER_YOUTUBE_VIDEO_IDS.map((src) => ({
  kind: "video" as const,
  src,
  poster: `https://i.ytimg.com/vi/${src}/hqdefault.jpg`,
}));

const SLIDER_YOUTUBE_MEDIA = toMediaItems(SLIDER_YOUTUBE_URLS);

function buildYoutubePlyrSource(src: string, poster?: string) {
  return {
    type: "video" as const,
    poster,
    sources: [{ 
      src,
      provider: "youtube" as const,
    }],
  };
}

const YOUTUBE_PLYR_OPTIONS = {
  ratio: "16:9",
  controls: [] as string[],
  youtube: {
    customControls: false,
  },
};

function buildYoutubeFullscreenSource(item: MediaItem, _index: number) {
  if (item.kind !== "video") {
    return buildYoutubePlyrSource("");
  }

  return buildYoutubePlyrSource(item.src, item.poster);
}

const SLIDER_VIMEO_URLS = [
  {
    kind: "video" as const,
    src: "https://vimeo.com/145140004",
    poster:
      "https://i.vimeocdn.com/video/543161898-50fd66e034508b21a3ad7e668577709bb20b0d339e394dff325c24bd6155a37a-d_640?region=us",
  },
  {
    kind: "video" as const,
    src: "https://vimeo.com/113314928",
    poster:
      "https://i.vimeocdn.com/video/498587339-a98d3fe72280beb7d17e8d2294e78c129ae40003fcf295384731134b214d1503-d_640?region=us",
  },
  {
    kind: "video" as const,
    src: "https://vimeo.com/172833424",
    poster:
      "https://i.vimeocdn.com/video/578815638-72b8689b81268e096ab8ad7746b90b89beb60a5e86b0664d2a10ce77f7eceb8c-d_640?region=us",
  },
  {
    kind: "video" as const,
    src: "https://vimeo.com/130632032",
    poster:
      "https://i.vimeocdn.com/video/522566445-9f80dcf05e5eef5d6364db7f75ab735eecd3ebbd33eacdd7e1cc0dc0002b9b00-d_640?region=us",
  },
  {
    kind: "video" as const,
    src: "https://vimeo.com/29216771",
    poster:
      "https://i.vimeocdn.com/video/195526505-0b6e473889f312924ae8715001157ffd464349eb7d4cef78136668cae68a0ce8-d_640?region=us",
  },
  {
    kind: "video" as const,
    src: "https://vimeo.com/127223734",
    poster:
      "https://i.vimeocdn.com/video/517933160-cfa1bfb51adafa1ea32b3e1c67b79abcfdfd848f35fff141b41c24860fd1e22c-d_640?region=us",
  },
];

const SLIDER_VIMEO_MEDIA = toMediaItems(SLIDER_VIMEO_URLS);

function buildVimeoPlyrSource(src: string, poster?: string) {
  return {
    type: "video" as const,
    poster,
    sources: [
      {
        src,
        provider: "vimeo" as const,
      },
    ],
  };
}

const VIMEO_PLYR_OPTIONS = {
  ratio: "16:9",
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

function buildVimeoFullscreenSource(item: MediaItem, _index: number) {
  if (item.kind !== "video") {
    return buildVimeoPlyrSource("");
  }

  return buildVimeoPlyrSource(item.src, item.poster);
}

function toDemoFunctionName(demoId: string) {
  return `${toPascalCase(demoId)}Demo`;
}

function toDemoCanvasClassName(demoId: string) {
  return `demoCanvas${toPascalCase(demoId)}`;
}

function createPlaceholderDemoSource(demo: DemoDefinition) {
  return [
    '"use client";',
    "",
    'import "react-motion-gallery/styles.css";',
    STARTER_IMPORTS_BY_CATEGORY[demo.categoryId],
    "",
    `export function ${toDemoFunctionName(demo.id)}() {`,
    "  return null;",
    "}",
  ].join("\n");
}

const DEFAULT_DEMO_CSS = String.raw`/* app/globals.css or Demo.module.css */

.slide {
  width: 100cqw;
  max-width: 550px;
  display: block;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 12px;
}`;

const VIDEO_FRAME_DEMO_CSS = String.raw`/* app/globals.css or Demo.module.css */

.videoFrame {
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 12px;
  background: #0f172a;
}

.videoFrame > * {
  width: 100%;
  height: 100%;
}`;

const GRID_DEMO_CSS = String.raw`/* app/globals.css or Demo.module.css */

.gridCard {
  display: grid;
  gap: 12px;
}

.gridCard img {
  width: 100%;
  display: block;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  border-radius: 12px;
}`;

const MASONRY_DEMO_CSS = String.raw`/* app/globals.css or Demo.module.css */

.masonryCard {
  display: grid;
  gap: 10px;
}

.masonryCard img {
  width: 100%;
  display: block;
  object-fit: cover;
  border-radius: 12px;
}`;

const ENTRIES_DEMO_CSS = String.raw`/* app/globals.css or Demo.module.css */

.entryCard {
  display: grid;
  gap: 14px;
  padding: 18px;
  border-radius: 12px;
  border: 1px solid rgba(11, 18, 32, 0.12);
  background: rgba(255, 255, 255, 0.78);
}

.entryMedia img {
  width: 100%;
  display: block;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 12px;
}`;

const FULLSCREEN_DEMO_CSS = String.raw`/* app/globals.css or Demo.module.css */

.fullscreenCaption {
  max-width: 280px;
  display: grid;
  gap: 8px;
}

.fullscreenCaptionTitle {
  font-size: 1.5rem;
  letter-spacing: -0.03em;
  line-height: 1.05;
}

.fullscreenCaptionCopy {
  margin: 0;
  color: rgba(11, 18, 32, 0.72);
  line-height: 1.7;
}`;

const SLIDER_CARDS_CSS = String.raw`/* app/globals.css or Demo.module.css */

.cardSlide {
  display: grid;
  gap: 12px;
  max-width: 420px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(11, 18, 32, 0.12);
  background: rgba(255, 255, 255, 0.82);
}

.cardSlide img {
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  border-radius: 12px;
}`;

const SLIDER_DEFAULT_CSS = String.raw`.slide {
  width: 100cqw;
  max-width: 550px;
  display: block;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
}`;
const SLIDER_LOOP_CSS = String.raw`.slide {
  width: 100cqw;
  max-width: 550px;
  display: block;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
}`;
const SLIDER_VIDEO_HTML5_CSS = String.raw`.slide_wrapper {
  position: relative;
  width: 100cqw;
  max-width: 550px;
}

.open_fullscreen_icon {
  position: absolute;
  top: 12;
  right: 12;
  z-index: 9999;
  cursor: pointer;
}

.slide {
  width: 100%;
  display: block;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
}`;
const SLIDER_VIDEO_HTML5_LOOP_CSS = String.raw`.slide_wrapper {
  position: relative;
  width: 100cqw;
  max-width: 550px;
}

.open_fullscreen_icon {
  position: absolute;
  top: 12;
  right: 12;
  z-index: 9999;
  cursor: pointer;
}

.slide {
  width: 100%;
  display: block;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
}`;
const SLIDER_VIDEO_YOUTUBE_CSS = String.raw`.slide_wrapper {
  position: relative;
  width: 100cqw;
  max-width: 550px;
}

.open_fullscreen_icon {
  position: absolute;
  top: 12;
  right: 12;
  z-index: 9999;
  cursor: pointer;
}

.slide {
  width: 100%;
  display: block;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
}`;
const SLIDER_VIDEO_YOUTUBE_LOOP_CSS = String.raw`.slide_wrapper {
  position: relative;
  width: 100cqw;
  max-width: 550px;
}

.open_fullscreen_icon {
  position: absolute;
  top: 12;
  right: 12;
  z-index: 9999;
  cursor: pointer;
}

.slide {
  width: 100%;
  display: block;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
}`;
const SLIDER_VIDEO_VIMEO_CSS = String.raw`.slide_wrapper {
  position: relative;
  width: 100cqw;
  max-width: 550px;
}

.open_fullscreen_icon {
  position: absolute;
  top: 12;
  left: 12;
  z-index: 9999;
  cursor: pointer;
}

.slide {
  width: 100%;
  display: block;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
}`;
const SLIDER_VIDEO_VIMEO_LOOP_CSS = String.raw`.slide_wrapper {
  position: relative;
  width: 100cqw;
  max-width: 550px;
}

.open_fullscreen_icon {
  position: absolute;
  top: 12;
  left: 12;
  z-index: 9999;
  cursor: pointer;
}

.slide {
  width: 100%;
  display: block;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
}`;
const SLIDER_RIGHT_TO_LEFT_CSS = SLIDER_DEFAULT_CSS;
const SLIDER_GROUP_CELLS_CSS = String.raw`.slide {
  width: 100cqw;
  max-width: 280px;
  display: block;
  aspect-ratio: 2 / 3;
  border-radius: 12px;
}`;
const SLIDER_FREE_SCROLL_CSS = SLIDER_GROUP_CELLS_CSS;
const SLIDER_SKIP_SNAPS_CSS = SLIDER_DEFAULT_CSS;
const SLIDER_CENTER_ALIGN_CSS = SLIDER_DEFAULT_CSS;
const SLIDER_VARIABLE_WIDTHS_CSS = String.raw`.variableWidthSlide {
  display: block;
  object-fit: cover;
  border-radius: 12px;
}`;
const SLIDER_Y_AXIS_CSS = String.raw`.demoCanvasSliderYAxis {
  height: min(560px, calc(100dvh - 345px));
  min-height: 320px;
  container-type: size;
}

.slide {
  width: 100cqw;
  display: block;
  aspect-ratio: 16 / 7;
  object-fit: cover;
  border-radius: 12px;
}

@media (max-width: 640px) {
  .demoCanvasSliderYAxis {
    min-height: 280px;
  }
}`;
const SLIDER_CELLS_PER_SLIDE_CSS = String.raw`.slide {
  width: 100%;
  display: block;
  aspect-ratio: 2 / 3;
  object-fit: cover;
  border-radius: 12px;
}`;
const SLIDER_THUMBNAILS_CSS = String.raw`.slide {
  width: 100cqw;
  max-width: 550px;
  display: block;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 12px;
}

.thumbnailThumb {
  overflow: hidden;
  border-radius: 10px;
}

.thumbnailSkeletonContainer {
  padding: 4px;
}

.thumbnailSkeletonThumb {
  border-radius: 12px;
  box-shadow: inset 0 0 0 1px rgba(11, 18, 32, 0.08);
}

.fullscreenThumbnailThumb {
  overflow: hidden;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.12);
}

.thumbnailImage {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}`;
const SLIDER_LAZY_LOAD_CSS = String.raw`.slide {
  width: 100cqw;
  max-width: 550px;
  display: block;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 12px;
  background: rgba(125, 211, 252, 0.14);
}

.spinner {
  width: 52px;
  height: 52px;
  background: conic-gradient(
    from 180deg,
    #cffafe,
    #67bee5,
    #0ea5e9,
    #0284c7,
    #0369a1,
    #cffafe
  );
  filter: drop-shadow(0 10px 24px rgba(3, 105, 161, 0.28));
}`;
const SLIDER_AUTO_SCROLL_CSS = String.raw`.slide {
  width: 100cqw;
  max-width: 320px;
  display: block;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  border-radius: 12px;
}`;
const SLIDER_AUTO_PLAY_CSS = String.raw`.slide {
  width: 100cqw;
  max-width: 550px;
  display: block;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 12px;
}`;
const SLIDER_PROGRESS_CSS = DEFAULT_DEMO_CSS;
const SLIDER_PARALLAX_CSS = DEFAULT_DEMO_CSS;
const SLIDER_SCALE_CSS = DEFAULT_DEMO_CSS;
const SLIDER_FADE_CSS = DEFAULT_DEMO_CSS;
const GRID_COLUMNS_CSS = GRID_DEMO_CSS;
const GRID_MIN_COLUMN_WIDTH_CSS = GRID_DEMO_CSS;
const GRID_LAZY_LOAD_CSS = GRID_DEMO_CSS;
const GRID_VIDEO_HTML5_CSS = GRID_DEMO_CSS;
const GRID_VIDEO_YOUTUBE_CSS = GRID_DEMO_CSS;
const GRID_VIDEO_VIMEO_CSS = GRID_DEMO_CSS;
const MASONRY_BALANCED_CSS = MASONRY_DEMO_CSS;
const MASONRY_ROUND_ROBIN_CSS = MASONRY_DEMO_CSS;
const MASONRY_LAZY_LOAD_CSS = MASONRY_DEMO_CSS;
const MASONRY_VIDEO_HTML5_CSS = MASONRY_DEMO_CSS;
const MASONRY_VIDEO_YOUTUBE_CSS = MASONRY_DEMO_CSS;
const MASONRY_VIDEO_VIMEO_CSS = MASONRY_DEMO_CSS;
const ENTRIES_SLIDER_CSS = ENTRIES_DEMO_CSS;
const ENTRIES_GRID_CSS = ENTRIES_DEMO_CSS;
const ENTRIES_MASONRY_CSS = ENTRIES_DEMO_CSS;
const FULLSCREEN_CAPTIONS_CSS = FULLSCREEN_DEMO_CSS;
const FULLSCREEN_THUMBNAILS_CSS = String.raw`.slide {
  width: 100cqw;
  max-width: 550px;
  display: block;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 12px;
}

.fullscreenThumbnailThumb {
  overflow: hidden;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.12);
}`;
const FULLSCREEN_OVERLAY_CSS = FULLSCREEN_DEMO_CSS;
const FULLSCREEN_LAZY_LOAD_CSS = FULLSCREEN_DEMO_CSS;

function normalizeDemoSource(code: string) {
  return code.replaceAll("\\`", "`").replaceAll("\\${", "${");
}

function DemoCodeBlock(props: {
  demo: DemoDefinition;
  typescriptCode: string;
}): JSX.Element {
  const { demo, typescriptCode } = props;
  const normalizedTypescriptCode = normalizeDemoSource(typescriptCode);
  const normalizedCssCode = normalizeDemoSource(demo.css ?? DEFAULT_DEMO_CSS);

  return (
    <CodeBlock
      className={styles.codeBlock}
      code={normalizedTypescriptCode}
      tabs={[
        {
          id: "typescript",
          label: "TypeScript",
          code: normalizedTypescriptCode,
          filename: `${demo.title}.tsx`,
          language: "tsx",
        },
        {
          id: "css",
          label: "CSS",
          code: normalizedCssCode,
          filename: `${demo.title}.css`,
          language: "css",
        },
      ]}
      defaultTabId="typescript"
      aria-label={`${demo.title} code example`}
    />
  );
}

const SelectedDemoPane = memo(function SelectedDemoPane(props: {
  selectedCategoryLabel: string;
  selectedDemo: DemoDefinition;
  selectedDemoCanvasClassName: string;
  selectedDemoSource: string;
}): JSX.Element {
  const {
    selectedCategoryLabel,
    selectedDemo,
    selectedDemoCanvasClassName,
    selectedDemoSource,
  } = props;
  const [activeTab, setActiveTab] = useState<DemoCanvasTab>("preview");
  const SelectedDemoComponent = selectedDemo.Component;
  const isPreviewTab = activeTab === "preview";

  return (
    <section className={styles.demoCard}>
      <div className={styles.demoHeader}>
        <span className={styles.demoCategory}>{selectedCategoryLabel}</span>
        <h2 className={styles.demoTitle}>{selectedDemo.title}</h2>
        <div className={styles.tagRow}>
          Add-ons: <span></span>
          {selectedDemo.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.demoCanvasTabs}>
        <div
          className={styles.demoCanvasTabList}
          aria-label={`${selectedDemo.title} demo view`}
          data-active-tab={activeTab}
        >
          <span
            aria-hidden="true"
            className={styles.demoCanvasTabIndicator}
          />
          <button
            type="button"
            className={cx(
              styles.demoCanvasTab,
              isPreviewTab && styles.demoCanvasTabActive
            )}
            aria-pressed={isPreviewTab}
            onClick={() => setActiveTab("preview")}
          >
            Preview
          </button>
          <button
            type="button"
            className={cx(
              styles.demoCanvasTab,
              !isPreviewTab && styles.demoCanvasTabActive
            )}
            aria-pressed={!isPreviewTab}
            onClick={() => setActiveTab("code")}
          >
            Code
          </button>
        </div>

        <div className={styles.demoCanvasPanel}>
          {isPreviewTab ? (
            <div
              className={`${cx(styles.demoCanvas, selectedDemoCanvasClassName)} shadow-sm border border-slate-200`}
            >
              <SelectedDemoComponent />
            </div>
          ) : (
            <DemoCodeBlock
              key={selectedDemo.id}
              demo={selectedDemo}
              typescriptCode={selectedDemoSource}
            />
          )}
        </div>
      </div>
    </section>
  );
});

function FullscreenAddon() {

  const { fullscreenNode } = useFullscreenController({
    fullscreen: {
      enabled: true,
    },
  });

  return <>{fullscreenNode}</>;
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(query);

    function handleChange(event: MediaQueryListEvent) {
      setMatches(event.matches);
    }

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}

function subscribeToHydration(): () => void {
  return () => {};
}

function useHasMounted(): boolean {
  return useSyncExternalStore(subscribeToHydration, () => true, () => false);
}

function useDocumentClientWidth(): number {
  return useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("resize", onStoreChange);
      window.visualViewport?.addEventListener("resize", onStoreChange);

      return () => {
        window.removeEventListener("resize", onStoreChange);
        window.visualViewport?.removeEventListener("resize", onStoreChange);
      };
    },
    () => document.documentElement.clientWidth,
    () => 0
  );
}

function AnimatedCategoryPanel(props: {
  id: string;
  isOpen: boolean;
  children: ReactNode;
}): JSX.Element {
  const { id, isOpen, children } = props;
  const panelRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const isFirstRenderRef = useRef(true);
  const isOpenRef = useRef(isOpen);
  const initialInlineStyle =
    typeof window === "undefined"
      ? { height: isOpen ? "auto" : "0px" }
      : undefined;

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const content = contentRef.current;

    if (!panel || !content) {
      return;
    }

    isOpenRef.current = isOpen;

    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    const currentHeight = panel.getBoundingClientRect().height;
    const nextHeight = content.getBoundingClientRect().height;
    panel.style.setProperty(
      "--category-panel-duration",
      isOpen ? "260ms" : "260ms"
    );
    panel.style.setProperty(
      "--category-panel-easing",
      isOpen ? "cubic-bezier(0.4, 0, 0.2, 1)" : "cubic-bezier(0.22, 1, 0.36, 1)"
    );

    if (isFirstRenderRef.current) {
      panel.style.height = isOpen ? "auto" : "0px";
      isFirstRenderRef.current = false;
      return;
    }

    if (Math.abs(currentHeight - nextHeight) < 1 && isOpen) {
      panel.style.height = "auto";
      return;
    }

    panel.style.height = `${currentHeight}px`;
    void panel.offsetHeight;

    frameRef.current = window.requestAnimationFrame(() => {
      panel.style.height = isOpen ? `${nextHeight}px` : "0px";
    });

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [isOpen]);

  return (
    <div
      id={id}
      ref={panelRef}
      className={styles.categoryPanel}
      style={initialInlineStyle}
      aria-hidden={!isOpen}
      inert={!isOpen}
      onTransitionEnd={(event) => {
        if (event.target !== event.currentTarget || event.propertyName !== "height") {
          return;
        }

        event.currentTarget.style.height = isOpenRef.current ? "auto" : "0px";
      }}
    >
      <div ref={contentRef} className={styles.categoryPanelContent}>
        {children}
      </div>
    </div>
  );
}

function SliderDefaultDemo() {
  const URLS = [
    "https://picsum.photos/id/995/1600/900",
    "https://picsum.photos/id/996/1600/900",
    "https://picsum.photos/id/997/1600/900",
    "https://picsum.photos/id/998/1600/900",
    "https://picsum.photos/id/999/1600/900",
    "https://picsum.photos/id/1000/1600/900",
  ];

  const FS_URLS = [
    "https://picsum.photos/id/995/2400/1350",
    "https://picsum.photos/id/996/2400/1350",
    "https://picsum.photos/id/997/2400/1350",
    "https://picsum.photos/id/998/2400/1350",
    "https://picsum.photos/id/999/2400/1350",
    "https://picsum.photos/id/1000/2400/1350",
  ];

  function Slide({ src, i }: { src: string; i: number }) {
    return (
      <img
        src={src}
        alt={`Slide ${i + 1}`}
        style={{
          width: "100cqw",
          maxWidth: "550px",
          aspectRatio: '16 / 9',
          objectFit: "cover",
          display: "block",
          borderRadius: 12,
        }}
      />
    );
  }

  const MEDIA = toMediaItems(URLS);

  const FS_MEDIA = toMediaItems(FS_URLS);

  return (
    <GalleryCore layout="slider" fullscreenItems={FS_MEDIA}>
      <Slider
        transitions={{
          loading: {
            skeletonCount: 2,
            skeleton: {
              mode: "peek",
              style: {
                overflow: "hidden"
              },
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
              },
            }
          }
        }}
      >
        {MEDIA.map((m, i) => {
          return (
            <Slide 
              key={`img-${m.kind === 'image' ? m.src : ''}-${i}`}
              src={m.kind === 'image' ? m.src : ''} 
              i={i} 
            />
          );
        })}
      </Slider>
      <FullscreenAddon />
    </GalleryCore>
  );
}

function SliderLoopDemo() {
  const URLS = [
    "https://picsum.photos/id/1079/1600/900",
    "https://picsum.photos/id/1080/1600/900",
    "https://picsum.photos/id/1081/1600/900",
    "https://picsum.photos/id/1082/1600/900",
    "https://picsum.photos/id/1083/1600/900",
    "https://picsum.photos/id/1084/1600/900",
  ];

  const FS_URLS = [
    "https://picsum.photos/id/1079/2400/1350",
    "https://picsum.photos/id/1080/2400/1350",
    "https://picsum.photos/id/1081/2400/1350",
    "https://picsum.photos/id/1082/2400/1350",
    "https://picsum.photos/id/1083/2400/1350",
    "https://picsum.photos/id/1084/2400/1350",
  ];

  function Slide({ src, i }: { src: string; i: number }) {
    return (
      <img
        src={src}
        alt={`Slide ${i + 1}`}
        style={{
          width: "100cqw",
          maxWidth: "550px",
          aspectRatio: '16 / 9',
          objectFit: "cover",
          display: "block",
          borderRadius: 12,
        }}
      />
    );
  }

  const MEDIA = toMediaItems(URLS);

  const FS_MEDIA = toMediaItems(FS_URLS);

  return (
    <GalleryCore layout="slider" fullscreenItems={FS_MEDIA}>
      <Slider
        scroll={{
          loop: true
        }}
        align="center"
        transitions={{
          loading: {
            skeletonCount: 3,
            skeleton: {
              mode: "peek",
              style: {
                overflow: "hidden"
              },
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
                    aspectRatio: '16 / 9',
                    borderRadius: 12,
                  },
                },
              },
            }
          }
        }}
      >
        {MEDIA.map((m, i) => {
          return (
            <Slide 
              key={`img-${m.kind === 'image' ? m.src : ''}-${i}`}
              src={m.kind === 'image' ? m.src : ''}
              i={i} 
            />
          );
        })}
      </Slider>
      <FullscreenAddon />
    </GalleryCore>
  );
}

function SliderVideoHtml5Demo() {
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

  function SlideVideoCell({
    src,
    poster,
    i,
  }: {
    src: string;
    poster?: string;
    i: number;
  }) {
    return (
      <div
        style={{
          position: "relative",
          width: "100cqw",
          maxWidth: "550px",
        }}
      >
        <img
          src="/open-fullscreen.png"
          alt="Open fullscreen"
          width="24"
          height="24"
          className={styles.open_fs_video}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 9999,
            cursor: "pointer",
          }}
        />

        <Video
          src={src}
          poster={poster}
          alt={`Video ${i + 1}`}
          style={{
            width: "100%",
            aspectRatio: "16 / 9",
            display: "block",
            borderRadius: 12,
          }}
        />
      </div>
    );
  }

  const MEDIA = toMediaItems(URLS);

  return (
    <GalleryCore layout="slider" fullscreenItems={MEDIA}>
      <Slider
        controls={{
          dots: {
            root: {
              style: {
                bottom: "-52px"
              }
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
            <SlideVideoCell 
              key={`video-${m.kind === 'video' ? m.src : ''}-${i}`} 
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
}

function SliderVideoHtml5LoopDemo() {
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

  function SlideVideoCell({
    src,
    poster,
    i,
  }: {
    src: string;
    poster?: string;
    i: number;
  }) {
    return (
      <div
        style={{
          position: "relative",
          width: "100cqw",
          maxWidth: "550px",
        }}
      >
        <img
          src="/open-fullscreen.png"
          alt="Open fullscreen"
          width="24"
          height="24"
          className={styles.open_fs_video}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 9999,
            cursor: "pointer",
          }}
        />

        <Video
          src={src}
          poster={poster}
          alt={`Video ${i + 1}`}
          style={{
            width: "100%",
            aspectRatio: "16 / 9",
            display: "block",
            borderRadius: 12,
          }}
        />
      </div>
    );
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
                bottom: "-52px"
              }
            }
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
            <SlideVideoCell 
              key={`video-${m.kind === 'video' ? m.src : ''}-${i}`}
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
}

function SliderVideoYoutubeDemo() {
  function SlideVideoCell({
    src,
    poster,
    i,
  }: {
    src: string;
    poster?: string;
    i: number;
  }) {
    return (
      <div
        style={{
          position: "relative",
          width: "100cqw",
          maxWidth: "550px",
        }}
      >
        <img
          src="/open-fullscreen.png"
          alt="Open fullscreen"
          width="24"
          height="24"
          className={styles.open_fs_video}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 9999,
            cursor: "pointer",
          }}
        />

        <Video
          src={src}
          poster={poster}
          source={buildYoutubePlyrSource(src, poster)}
          options={YOUTUBE_PLYR_OPTIONS}
          alt={`Video ${i + 1}`}
          style={{
            width: "100%",
            aspectRatio: "16 / 9",
            display: "block",
            borderRadius: 12,
          }}
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
          options: YOUTUBE_PLYR_OPTIONS,
        },
      },
    });

    return <>{fullscreenNode}</>;
  }

  const MEDIA = SLIDER_YOUTUBE_MEDIA;

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
                bottom: "-52px"
              }
            }
          },
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
                      width: "100cqw",
                      maxWidth: "52%",
                      height: 24,
                      borderRadius: 999,
                      alignSelf: "center",
                      marginTop: "28px",
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
            <SlideVideoCell
              key={`video-${m.kind === 'video' ? m.src : ''}-${i}`}
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
}

function SliderVideoYoutubeLoopDemo() {
  function SlideVideoCell({
    src,
    poster,
    i,
  }: {
    src: string;
    poster?: string;
    i: number;
  }) {
    return (
      <div
        style={{
          position: "relative",
          width: "100cqw",
          maxWidth: "550px",
        }}
      >
        <img
          src="/open-fullscreen.png"
          alt="Open fullscreen"
          width="24"
          height="24"
          className={styles.open_fs_video}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 9999,
            cursor: "pointer",
          }}
        />

        <Video
          src={src}
          poster={poster}
          source={buildYoutubePlyrSource(src, poster)}
          options={YOUTUBE_PLYR_OPTIONS}
          alt={`Video ${i + 1}`}
          style={{
            width: "100%",
            aspectRatio: "16 / 9",
            display: "block",
            borderRadius: 12,
          }}
        />
      </div>
    );
  }

  function FullscreenAddon(props: {
    fullscreenEnabled?: boolean;
  }) {
    const { fullscreenEnabled = true } = props;

    const { fullscreenNode } = useFullscreenController({
      fullscreen: {
        enabled: fullscreenEnabled,
        video: {
          source: buildYoutubeFullscreenSource,
          options: YOUTUBE_PLYR_OPTIONS,
        },
      },
    });

    return <>{fullscreenNode}</>;
  }

  const MEDIA = SLIDER_YOUTUBE_MEDIA;

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
                bottom: "-52px"
              }
            }
          },
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
                    aspectRatio: '16 / 9',
                    borderRadius: 12,
                  },
                },
                children: [
                  {
                    kind: "rect",
                    style: {
                      width: "100cqw",
                      maxWidth: "52%",
                      height: 24,
                      borderRadius: 999,
                      alignSelf: "center",
                      marginTop: "28px",
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
            <SlideVideoCell
              key={`video-${m.kind === 'video' ? m.src : ''}-${i}`}
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
}

function SliderVideoVimeoDemo() {
  function SlideVideoCell({
    src,
    poster,
    i,
  }: {
    src: string;
    poster?: string;
    i: number;
  }) {
    return (
      <div
        style={{
          position: "relative",
          width: "100cqw",
          maxWidth: "550px",
        }}
      >
        <img
          src="/open-fullscreen.png"
          alt="Open fullscreen"
          width="24"
          height="24"
          className={styles.open_fs_video}
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            zIndex: 9999,
            cursor: "pointer",
          }}
        />

        <Video
          src={src}
          poster={poster}
          source={buildVimeoPlyrSource(src, poster)}
          options={VIMEO_PLYR_OPTIONS}
          alt={`Video ${i + 1}`}
          style={{
            width: "100%",
            aspectRatio: "16 / 9",
            display: "block",
            borderRadius: 12,
          }}
        />
      </div>
    );
  }

  function FullscreenAddon(props: {
    fullscreenEnabled?: boolean;
  }) {
    const { fullscreenEnabled = true } = props;

    const { fullscreenNode } = useFullscreenController({
      fullscreen: {
        enabled: fullscreenEnabled,
        video: {
          source: buildVimeoFullscreenSource,
          options: VIMEO_PLYR_OPTIONS,
        },
      },
    });

    return <>{fullscreenNode}</>;
  }

  const MEDIA = SLIDER_VIMEO_MEDIA;

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
                bottom: "-52px"
              }
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
                      width: "100cqw",
                      maxWidth: "52%",
                      height: 24,
                      borderRadius: 999,
                      alignSelf: "center",
                      marginTop: "28px",
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
            <SlideVideoCell
              key={`video-${m.kind === 'video' ? m.src : ''}-${i}`}
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
}

function SliderVideoVimeoLoopDemo() {
  function SlideVideoCell({
    src,
    poster,
    i,
  }: {
    src: string;
    poster?: string;
    i: number;
  }) {
    return (
      <div
        style={{
          position: "relative",
          width: "100cqw",
          maxWidth: "550px",
        }}
      >
        <img
          src="/open-fullscreen.png"
          alt="Open fullscreen"
          width="24"
          height="24"
          className={styles.open_fs_video}
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            zIndex: 9999,
            cursor: "pointer",
          }}
        />

        <Video
          src={src}
          poster={poster}
          source={buildVimeoPlyrSource(src, poster)}
          options={VIMEO_PLYR_OPTIONS}
          alt={`Video ${i + 1}`}
          style={{
            width: "100%",
            aspectRatio: "16 / 9",
            display: "block",
            borderRadius: 12,
          }}
        />
      </div>
    );
  }

  function FullscreenAddon(props: {
    fullscreenEnabled?: boolean;
  }) {
    const { fullscreenEnabled = true } = props;

    const { fullscreenNode } = useFullscreenController({
      fullscreen: {
        enabled: fullscreenEnabled,
        video: {
          source: buildVimeoFullscreenSource,
          options: VIMEO_PLYR_OPTIONS,
        },
      },
    });

    return <>{fullscreenNode}</>;
  }

  const MEDIA = SLIDER_VIMEO_MEDIA;

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
                bottom: "-52px"
              }
            }
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
                    aspectRatio: '16 / 9',
                    borderRadius: 12,
                  },
                },
                children: [
                  {
                    kind: "rect",
                    style: {
                      width: "100cqw",
                      maxWidth: "52%",
                      height: 24,
                      borderRadius: 999,
                      alignSelf: "center",
                      marginTop: "28px",
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
            <SlideVideoCell
              key={`video-${m.kind === 'video' ? m.src : ''}-${i}`}
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
}

function SliderRightToLeftDemo() {
  const URLS = [
    "https://picsum.photos/id/1049/1600/900",
    "https://picsum.photos/id/1050/1600/900",
    "https://picsum.photos/id/1051/1600/900",
    "https://picsum.photos/id/1052/1600/900",
    "https://picsum.photos/id/1053/1600/900",
    "https://picsum.photos/id/1054/1600/900",
  ];

  const FS_URLS = [
    "https://picsum.photos/id/1049/2400/1350",
    "https://picsum.photos/id/1050/2400/1350",
    "https://picsum.photos/id/1051/2400/1350",
    "https://picsum.photos/id/1052/2400/1350",
    "https://picsum.photos/id/1053/2400/1350",
    "https://picsum.photos/id/1054/2400/1350",
  ];

  function Slide({ src, i }: { src: string; i: number }) {
    return (
      <img
        src={src}
        alt={`Slide ${i + 1}`}
        style={{
          width: "100cqw",
          maxWidth: "550px",
          aspectRatio: '16 / 9',
          objectFit: "cover",
          display: "block",
          borderRadius: 12,
        }}
      />
    );
  }

  const MEDIA = toMediaItems(URLS);

  const FS_MEDIA = toMediaItems(FS_URLS);

  return (
    <GalleryCore layout="slider" fullscreenItems={FS_MEDIA}>
      <Slider
        direction={{
          dir: "rtl",
        }}
        transitions={{
          loading: {
            skeletonCount: 2,
            skeleton: {
              mode: "peek",
              style: {
                overflow: "hidden",
                direction: "rtl",
              },
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
              },
            }
          }
        }}
      >
        {MEDIA.map((m, i) => {
          return (
            <Slide
              key={`img-${m.kind === 'image' ? m.src : ''}-${i}`}
              src={m.kind === 'image' ? m.src : ''}
              i={i}
            />
          );
        })}
      </Slider>
      <FullscreenAddon />
    </GalleryCore>
  );
}

function SliderGroupCellsDemo() {
  const URLS = [
    "https://picsum.photos/id/1055/1200/1200",
    "https://picsum.photos/id/1056/1200/1200",
    "https://picsum.photos/id/1057/1200/1200",
    "https://picsum.photos/id/1058/1200/1200",
    "https://picsum.photos/id/1059/1200/1200",
    "https://picsum.photos/id/1060/1200/1200",
    "https://picsum.photos/id/1061/1200/1200",
    "https://picsum.photos/id/1062/1200/1200",
    "https://picsum.photos/id/1063/1200/1200",
    "https://picsum.photos/id/1064/1200/1200",
    "https://picsum.photos/id/1065/1200/1200",
    "https://picsum.photos/id/1066/1200/1200",
  ];

  const FS_URLS = [
    "https://picsum.photos/id/1055/2400/2400",
    "https://picsum.photos/id/1056/2400/2400",
    "https://picsum.photos/id/1057/2400/2400",
    "https://picsum.photos/id/1058/2400/2400",
    "https://picsum.photos/id/1059/2400/2400",
    "https://picsum.photos/id/1060/2400/2400",
    "https://picsum.photos/id/1061/2400/2400",
    "https://picsum.photos/id/1062/2400/2400",
    "https://picsum.photos/id/1063/2400/2400",
    "https://picsum.photos/id/1064/2400/2400",
    "https://picsum.photos/id/1065/2400/2400",
    "https://picsum.photos/id/1066/2400/2400",
  ];

  function Slide({ src, i }: { src: string; i: number }) {
    return (
      <img
        src={src}
        alt={`Slide ${i + 1}`}
        style={{
          width: "100cqw",
          maxWidth: "280px",
          aspectRatio: '2 /3',
          objectFit: "cover",
          display: "block",
          borderRadius: 12,
        }}
      />
    );
  }

  const MEDIA = toMediaItems(URLS);

  const FS_MEDIA = toMediaItems(FS_URLS);

  return (
    <GalleryCore layout="slider" fullscreenItems={FS_MEDIA}>
      <Slider
        scroll={{
          groupCells: true
        }}
        transitions={{
          loading: {
            skeletonCount: 4,
            skeleton: {
              mode: "peek",
              style: {
                overflow: "hidden"
              },
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
                    maxWidth: "280px",
                    aspectRatio: '2 / 3',
                    borderRadius: 12,
                  },
                },
              },
            }
          }
        }}
      >
        {MEDIA.map((m, i) => {
          return (
            <Slide
              key={`img-${m.kind === 'image' ? m.src : ''}-${i}`}
              src={m.kind === 'image' ? m.src : ''}
              i={i}
            />
          );
        })}
      </Slider>
      <FullscreenAddon />
    </GalleryCore>
  );
}

function SliderFreeScrollDemo() {
  const URLS = [
    "https://picsum.photos/id/1067/1200/1200",
    "https://picsum.photos/id/1068/1200/1200",
    "https://picsum.photos/id/1069/1200/1200",
    "https://picsum.photos/id/1070/1200/1200",
    "https://picsum.photos/id/1071/1200/1200",
    "https://picsum.photos/id/1072/1200/1200",
    "https://picsum.photos/id/1073/1200/1200",
    "https://picsum.photos/id/1074/1200/1200",
    "https://picsum.photos/id/1075/1200/1200",
    "https://picsum.photos/id/1076/1200/1200",
    "https://picsum.photos/id/1077/1200/1200",
    "https://picsum.photos/id/1078/1200/1200",
  ];

  const FS_URLS = [
    "https://picsum.photos/id/1067/2400/2400",
    "https://picsum.photos/id/1068/2400/2400",
    "https://picsum.photos/id/1069/2400/2400",
    "https://picsum.photos/id/1070/2400/2400",
    "https://picsum.photos/id/1071/2400/2400",
    "https://picsum.photos/id/1072/2400/2400",
    "https://picsum.photos/id/1073/2400/2400",
    "https://picsum.photos/id/1074/2400/2400",
    "https://picsum.photos/id/1075/2400/2400",
    "https://picsum.photos/id/1076/2400/2400",
    "https://picsum.photos/id/1077/2400/2400",
    "https://picsum.photos/id/1078/2400/2400",
  ];

  function Slide({ src, i }: { src: string; i: number }) {
    return (
      <img
        src={src}
        alt={`Slide ${i + 1}`}
        style={{
          width: "100cqw",
          maxWidth: "280px",
          aspectRatio: '2 /3',
          objectFit: "cover",
          display: "block",
          borderRadius: 12,
        }}
      />
    );
  }

  const MEDIA = toMediaItems(URLS);

  const FS_MEDIA = toMediaItems(FS_URLS);

  return (
    <GalleryCore layout="slider" fullscreenItems={FS_MEDIA}>
      <Slider
        scroll={{
          freeScroll: true,
          groupCells: true
        }}
        transitions={{
          loading: {
            skeletonCount: 4,
            skeleton: {
              mode: "peek",
              style: {
                overflow: "hidden"
              },
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
                    maxWidth: "280px",
                    aspectRatio: '2 / 3',
                    borderRadius: 12,
                  },
                },
              },
            }
          }
        }}
      >
        {MEDIA.map((m, i) => {
          return (
            <Slide
              key={`img-${m.kind === 'image' ? m.src : ''}-${i}`}
              src={m.kind === 'image' ? m.src : ''}
              i={i}
            />
          );
        })}
      </Slider>
      <FullscreenAddon />
    </GalleryCore>
  );
}

function SliderSkipSnapsDemo() {
  const URLS = [
    "https://picsum.photos/id/1001/1600/900",
    "https://picsum.photos/id/1002/1600/900",
    "https://picsum.photos/id/1003/1600/900",
    "https://picsum.photos/id/1004/1600/900",
    "https://picsum.photos/id/1005/1600/900",
    "https://picsum.photos/id/1006/1600/900",
  ];

  const FS_URLS = [
    "https://picsum.photos/id/1001/2400/1350",
    "https://picsum.photos/id/1002/2400/1350",
    "https://picsum.photos/id/1003/2400/1350",
    "https://picsum.photos/id/1004/2400/1350",
    "https://picsum.photos/id/1005/2400/1350",
    "https://picsum.photos/id/1006/2400/1350",
  ];

  function Slide({ src, i }: { src: string; i: number }) {
    return (
      <img
        src={src}
        alt={`Slide ${i + 1}`}
        style={{
          width: "100cqw",
          maxWidth: "550px",
          aspectRatio: '16 / 9',
          objectFit: "cover",
          display: "block",
          borderRadius: 12,
        }}
      />
    );
  }

  const MEDIA = toMediaItems(URLS);

  const FS_MEDIA = toMediaItems(FS_URLS);

  return (
    <GalleryCore layout="slider" fullscreenItems={FS_MEDIA}>
      <Slider
        scroll={{
          skipSnaps: true,
        }}
        transitions={{
          loading: {
            skeletonCount: 2,
            skeleton: {
              mode: "peek",
              style: {
                overflow: "hidden"
              },
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
              },
            }
          }
        }}
      >
        {MEDIA.map((m, i) => {
          return (
            <Slide
              key={`img-${m.kind === 'image' ? m.src : ''}-${i}`}
              src={m.kind === 'image' ? m.src : ''}
              i={i}
            />
          );
        })}
      </Slider>
      <FullscreenAddon />
    </GalleryCore>
  );
}

function SliderCenterAlignDemo() {
  const URLS = [
    "https://picsum.photos/id/107/1600/900",
    "https://picsum.photos/id/1008/1600/900",
    "https://picsum.photos/id/1009/1600/900",
    "https://picsum.photos/id/1010/1600/900",
    "https://picsum.photos/id/1011/1600/900",
    "https://picsum.photos/id/1012/1600/900",
  ];

  const FS_URLS = [
    "https://picsum.photos/id/107/2400/1350",
    "https://picsum.photos/id/1008/2400/1350",
    "https://picsum.photos/id/1009/2400/1350",
    "https://picsum.photos/id/1010/2400/1350",
    "https://picsum.photos/id/1011/2400/1350",
    "https://picsum.photos/id/1012/2400/1350",
  ];

  function Slide({ src, i }: { src: string; i: number }) {
    return (
      <img
        src={src}
        alt={`Slide ${i + 1}`}
        style={{
          width: "100cqw",
          maxWidth: "550px",
          aspectRatio: "16 / 9",
          objectFit: "cover",
          display: "block",
          borderRadius: 12,
        }}
      />
    );
  }

  const MEDIA = toMediaItems(URLS);

  const FS_MEDIA = toMediaItems(FS_URLS);

  return (
    <GalleryCore layout="slider" fullscreenItems={FS_MEDIA}>
      <Slider
        align="center"
        transitions={{
          loading: {
            skeletonCount: 3,
            skeleton: {
              mode: "peek",
              centering: "first",
              style: {
                overflow: "hidden",
              },
              layout: {
                kind: "slider",
                direction: "row",
                style: {
                  gap: 20,
                },
                item: {
                  kind: "rect",
                  style: {
                    width: "100%",
                    height: "100%",
                    borderRadius: 12,
                  },
                },
                itemWrapStyle: {
                  width: "100cqw",
                  maxWidth: "550px",
                  aspectRatio: "16 / 9",
                },
              },
            },
          }
        }}
      >
        {MEDIA.map((m, i) => {
          return (
            <Slide
              key={`img-${m.kind === 'image' ? m.src : ''}-${i}`}
              src={m.kind === 'image' ? m.src : ''}
              i={i}
            />
          );
        })}
      </Slider>
      <FullscreenAddon />
    </GalleryCore>
  );
}

function SliderVariableWidthsDemo() {
  const SLIDES = [
    {
      src: "https://picsum.photos/id/1013/1200/900",
      fullscreenSrc: "https://picsum.photos/id/1013/2400/1800",
      width: 220,
      height: 320,
    },
    {
      src: "https://picsum.photos/id/1014/1020/630",
      fullscreenSrc: "https://picsum.photos/id/1014/2040/1260",
      width: 420,
      height: 320,
    },
    {
      src: "https://picsum.photos/id/1015/780/1340",
      fullscreenSrc: "https://picsum.photos/id/1015/1560/2680",
      width: 260,
      height: 320,
    },
    {
      src: "https://picsum.photos/id/1016/1280/720",
      fullscreenSrc: "https://picsum.photos/id/1016/2560/1440",
      width: 360,
      height: 320,
    },
    {
      src: "https://picsum.photos/id/101/1200/900",
      fullscreenSrc: "https://picsum.photos/id/101/2400/1800",
      width: 200,
      height: 320,
    },
    {
      src: "https://picsum.photos/id/1018/900/570",
      fullscreenSrc: "https://picsum.photos/id/1018/1800/1140",
      width: 300,
      height: 320,
    },
    {
      src: "https://picsum.photos/id/18/900/570",
      fullscreenSrc: "https://picsum.photos/id/18/1800/1140",
      width: 500,
      height: 320,
    },
    {
      src: "https://picsum.photos/id/19/900/570",
      fullscreenSrc: "https://picsum.photos/id/19/1800/1140",
      width: 250,
      height: 320,
    },
  ];

  const SKELETON_GAP = 20;
  const SKELETON_VISIBLE_SLIDES = 2;

  function Slide(props: { src: string; width: number; height: number; i: number }) {
    const { src, width, height, i } = props;

    return (
      <img
        src={src}
        alt={`Slide ${i + 1}`}
        className={styles.variableWidthSlide}
        style={{ width, height }}
      />
    );
  }

  const MEDIA = toMediaItems(SLIDES.map((slide) => slide.src));
  const FS_MEDIA = toMediaItems(SLIDES.map((slide) => slide.fullscreenSrc));

  return (
    <GalleryCore layout="slider" fullscreenItems={FS_MEDIA}>
      <Slider
        align="center"
        transitions={{
          loading: {
            skeletonCount: SKELETON_VISIBLE_SLIDES,
            skeleton: {
              mode: "peek",
              centering: "first",
              layout: {
                kind: "slider",
                direction: "row",
                style: {
                  gap: SKELETON_GAP,
                },
                item: {
                  kind: "rect",
                  style: {
                    width: "100%",
                    height: "100%",
                    borderRadius: 12,
                  },
                },
                slots: SLIDES.map((slide) => ({
                  itemWrapStyle: {
                    width: slide.width,
                    height: slide.height,
                  },
                })),
              },
            },
          },
        }}
      >
        {MEDIA.map((m, i) => {
          const slide = SLIDES[i];

          return (
            <Slide
              key={`img-${m.kind === 'image' ? m.src : ''}-${i}`}
              src={m.kind === 'image' ? m.src : ''}
              width={slide.width}
              height={slide.height}
              i={i}
            />
          );
        })}
      </Slider>
      <FullscreenAddon />
    </GalleryCore>
  );
}

function SliderYAxisDemo() {
  const URLS = [
    "https://picsum.photos/id/1019/1600/900",
    "https://picsum.photos/id/1020/1600/900",
    "https://picsum.photos/id/1021/1600/900",
    "https://picsum.photos/id/1022/1600/900",
    "https://picsum.photos/id/1023/1600/900",
    "https://picsum.photos/id/1024/1600/900",
  ];

  const FS_URLS = [
    "https://picsum.photos/id/1019/2400/1350",
    "https://picsum.photos/id/1020/2400/1350",
    "https://picsum.photos/id/1021/2400/1350",
    "https://picsum.photos/id/1022/2400/1350",
    "https://picsum.photos/id/1023/2400/1350",
    "https://picsum.photos/id/1024/2400/1350",
  ];

  function Slide({ src, i }: { src: string; i: number }) {
    return (
      <img
        src={src}
        alt={`Slide ${i + 1}`}
        style={{
          width: "100cqw",
          aspectRatio: "16 / 7",
          objectFit: "cover",
          display: "block",
          borderRadius: 12,
        }}
      />
    );
  }

  const MEDIA = toMediaItems(URLS);
  const FS_MEDIA = toMediaItems(FS_URLS);

  return (
    <GalleryCore layout="slider" fullscreenItems={FS_MEDIA}>
      <Slider
        direction={{
          axis: "y",
        }}
        elements={{
          viewport: {
            style: {
              height: "100cqh",
              maxHeight: "530px",
            },
          },
        }}
        transitions={{
          loading: {
            skeletonCount: 3,
            skeleton: {
              mode: "peek",
              layout: {
                kind: "slider",
                direction: "col",
                style: {
                  gap: 20,
                },
                item: {
                  kind: "rect",
                  style: {
                    width: "100%",
                    height: "100%",
                    borderRadius: 12,
                  },
                },
                itemWrapStyle: {
                  width: "100cqw",
                  aspectRatio: "16 / 7",
                },
              },
            },
          },
        }}
      >
        {MEDIA.map((m, i) => {
          return (
            <Slide
              key={`img-${m.kind === 'image' ? m.src : ''}-${i}`}
              src={m.kind === 'image' ? m.src : ''}
              i={i}
            />
          );
        })}
      </Slider>
      <FullscreenAddon />
    </GalleryCore>
  );
}

function SliderCellsPerSlideDemo() {
  const URLS = [
    "https://picsum.photos/id/1025/1200/1200",
    "https://picsum.photos/id/1026/1200/1200",
    "https://picsum.photos/id/1027/1200/1200",
    "https://picsum.photos/id/1028/1200/1200",
    "https://picsum.photos/id/1029/1200/1200",
    "https://picsum.photos/id/103/1200/1200",
    "https://picsum.photos/id/1031/1200/1200",
    "https://picsum.photos/id/1032/1200/1200",
    "https://picsum.photos/id/1033/1200/1200",
    "https://picsum.photos/id/104/1200/1200",
    "https://picsum.photos/id/1035/1200/1200",
    "https://picsum.photos/id/1036/1200/1200",
  ];

  const FS_URLS = [
    "https://picsum.photos/id/1025/2400/2400",
    "https://picsum.photos/id/1026/2400/2400",
    "https://picsum.photos/id/1027/2400/2400",
    "https://picsum.photos/id/1028/2400/2400",
    "https://picsum.photos/id/1029/2400/2400",
    "https://picsum.photos/id/103/2400/2400",
    "https://picsum.photos/id/1031/2400/2400",
    "https://picsum.photos/id/1032/2400/2400",
    "https://picsum.photos/id/1033/2400/2400",
    "https://picsum.photos/id/104/2400/2400",
    "https://picsum.photos/id/1035/2400/2400",
    "https://picsum.photos/id/1036/2400/2400",
  ];

  const CELLS_PER_SLIDE = {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
  };

  function Slide({ src, i }: { src: string; i: number }) {
    return (
      <img
        src={src}
        alt={`Slide ${i + 1}`}
        style={{
          width: "100%",
          aspectRatio: "2 / 3",
          objectFit: "cover",
          display: "block",
          borderRadius: 12,
        }}
      />
    );
  }

  const MEDIA = toMediaItems(URLS);
  const FS_MEDIA = toMediaItems(FS_URLS);

  return (
    <GalleryCore layout="slider" fullscreenItems={FS_MEDIA}>
      <Slider
        layout={{
          cellsPerSlide: CELLS_PER_SLIDE,
        }}
        scroll={{
          groupCells: true
        }}
        transitions={{
          loading: {
            skeletonCount: CELLS_PER_SLIDE,
            skeleton: {
              mode: "fit",
              layout: {
                kind: "slider",
                direction: "row",
                style: {
                  gap: 20,
                },
                item: {
                  kind: "rect",
                  style: {
                    width: "100%",
                    aspectRatio: "2 / 3",
                    borderRadius: 12,
                  },
                },
              },
            },
          },
        }}
      >
        {MEDIA.map((m, i) => {
          return (
            <Slide
              key={`img-${m.kind === 'image' ? m.src : ''}-${i}`}
              src={m.kind === 'image' ? m.src : ''}
              i={i}
            />
          );
        })}
      </Slider>
      <FullscreenAddon />
    </GalleryCore>
  );
}

const THUMBNAIL_DEMO_SLIDES = [
  {
    slideSrc: "https://picsum.photos/id/1037/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1037/2400/1350",
    thumbSrc: "https://picsum.photos/id/1037/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/1038/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1038/2400/1350",
    thumbSrc: "https://picsum.photos/id/1038/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/1039/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1039/2400/1350",
    thumbSrc: "https://picsum.photos/id/1039/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/1040/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1040/2400/1350",
    thumbSrc: "https://picsum.photos/id/1040/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/1041/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1041/2400/1350",
    thumbSrc: "https://picsum.photos/id/1041/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/1042/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1042/2400/1350",
    thumbSrc: "https://picsum.photos/id/1042/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/1043/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1043/2400/1350",
    thumbSrc: "https://picsum.photos/id/1043/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/1044/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1044/2400/1350",
    thumbSrc: "https://picsum.photos/id/1044/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/1045/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1045/2400/1350",
    thumbSrc: "https://picsum.photos/id/1045/320/200",
  },
  {
    slideSrc: "https://picsum.photos/id/1047/1600/900",
    fullscreenSrc: "https://picsum.photos/id/1047/2400/1350",
    thumbSrc: "https://picsum.photos/id/1047/320/200",
  },
];

function ThumbnailDemoSlide(props: { src: string; i: number }) {
  const { src, i } = props;

  return (
    <img
      src={src}
      alt={`Slide ${i + 1}`}
      style={{
        width: "100cqw",
        maxWidth: "550px",
        aspectRatio: "16 / 9",
        objectFit: "cover",
        display: "block",
        borderRadius: 12,
      }}
    />
  );
}

function ThumbnailDemoThumb(props: { src: string; i: number }) {
  const { src, i } = props;

  return (
    <img
      src={src}
      alt={`Thumbnail ${i + 1}`}
      className={styles.thumbnailImage}
    />
  );
}

function SliderThumbnailsDemo() {
  const [indexChannel] = useState(() => createSliderIndexChannel());
  const media = toMediaItems(
    THUMBNAIL_DEMO_SLIDES.map((slide) => slide.slideSrc)
  );
  const fullscreenMedia = toMediaItems(
    THUMBNAIL_DEMO_SLIDES.map((slide) => slide.fullscreenSrc)
  );

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <Slider
        indexChannel={indexChannel}
        controls={{
          dots: {
            enabled: false
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
              },
            },
          },
        }}
      >
        {media.map((item, i) => (
          <ThumbnailDemoSlide
            key={`img-${item.kind === "image" ? item.src : ""}-${i}`}
            src={THUMBNAIL_DEMO_SLIDES[i]?.slideSrc ?? ""}
            i={i}
          />
        ))}
      </Slider>

      <ThumbnailSlider
        indexChannel={indexChannel}
        options={{
          layout: {
            position: "bottom",
            gap: 12,
            thumbnail: {
              width: 96,
              height: 60,
            },
          },
          scroll: {
            centerActiveThumb: true,
          },
          controls: {
            enabled: true,
          },
          elements: {
            container: {
              style: {
                marginTop: 14,
              },
            },
            thumbnail: {
              className: styles.thumbnailThumb,
            },
          },
          transitions: {
            loading: {
              skeletonCount: 9,
              elements: {
                thumbnail: {
                  style: {
                    borderRadius: 10,
                  },
                },
              },
            }
          }
        }}
      >
        {THUMBNAIL_DEMO_SLIDES.map((slide, i) => (
          <ThumbnailDemoThumb
            key={`thumb-${slide.thumbSrc}`}
            src={slide.thumbSrc}
            i={i}
          />
        ))}
      </ThumbnailSlider>

      <FullscreenThumbnailRailAddon />
    </GalleryCore>
  );
}

function SliderLazyLoadDemo() {
  const URLS = [
    "https://picsum.photos/id/1048/1600/900",
    "https://picsum.photos/id/1049/1600/900",
    "https://picsum.photos/id/1050/1600/900",
    "https://picsum.photos/id/1051/1600/900",
    "https://picsum.photos/id/1052/1600/900",
    "https://picsum.photos/id/1053/1600/900",
  ];

  const FS_URLS = [
    "https://picsum.photos/id/1048/2400/1350",
    "https://picsum.photos/id/1049/2400/1350",
    "https://picsum.photos/id/1050/2400/1350",
    "https://picsum.photos/id/1051/2400/1350",
    "https://picsum.photos/id/1052/2400/1350",
    "https://picsum.photos/id/1053/2400/1350",
  ];

  const MEDIA = toMediaItems(URLS);
  const FS_MEDIA = toMediaItems(FS_URLS);

  return (
    <GalleryCore layout="slider" fullscreenItems={FS_MEDIA}>
      <Slider
        lazyLoad={{
          enabled: true,
          spinner: true,
          spinnerClassName: styles.spinner,
        }}
        transitions={{
          loading: {
            skeletonCount: 2,
            skeleton: {
              mode: "peek",
              style: {
                overflow: "hidden",
              },
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
              },
            },
          },
        }}
      >
        {MEDIA.map((item, i) => (
          <img
            key={`img-${item.kind === "image" ? item.src : ""}-${i}`}
            src={item.kind === "image" ? item.src : ""}
            alt={`Slide ${i + 1}`}
            className={styles.slide}
          />
        ))}
      </Slider>
      <FullscreenAddon />
    </GalleryCore>
  );
}

function SliderAutoScrollDemo() {
  const SLIDES = [
    {
      src: "https://picsum.photos/id/1055/1200/1200",
      fullscreenSrc: "https://picsum.photos/id/1055/2400/2400",
    },
    {
      src: "https://picsum.photos/id/1056/1200/1200",
      fullscreenSrc: "https://picsum.photos/id/1056/2400/2400",
    },
    {
      src: "https://picsum.photos/id/1057/1200/1200",
      fullscreenSrc: "https://picsum.photos/id/1057/2400/2400",
    },
    {
      src: "https://picsum.photos/id/1058/1200/1200",
      fullscreenSrc: "https://picsum.photos/id/1058/2400/2400",
    },
    {
      src: "https://picsum.photos/id/1059/1200/1200",
      fullscreenSrc: "https://picsum.photos/id/1059/2400/2400",
    },
    {
      src: "https://picsum.photos/id/1060/1200/1200",
      fullscreenSrc: "https://picsum.photos/id/1060/2400/2400",
    },
    {
      src: "https://picsum.photos/id/1061/1200/1200",
      fullscreenSrc: "https://picsum.photos/id/1061/2400/2400",
    },
    {
      src: "https://picsum.photos/id/1062/1200/1200",
      fullscreenSrc: "https://picsum.photos/id/1062/2400/2400",
    },
  ];

  const MEDIA = toMediaItems(SLIDES.map((slide) => slide.src));
  const FS_MEDIA = toMediaItems(SLIDES.map((slide) => slide.fullscreenSrc));

  return (
    <GalleryCore layout="slider" fullscreenItems={FS_MEDIA}>
      <Slider
        align="center"
        scroll={{
          loop: true,
        }}
        auto={{
          scroll: {
            enabled: true,
          },
        }}
        controls={{
          dots: {
            enabled: false,
          },
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
                    width: "100%",
                    height: "100%",
                    borderRadius: 12,
                  },
                },
                itemWrapStyle: {
                  width: "100cqw",
                  maxWidth: "320px",
                  aspectRatio: "4 / 5",
                },
              },
            },
          },
        }}
      >
        {MEDIA.map((item, i) => (
          <img
            key={`img-${item.kind === "image" ? item.src : ""}-${i}`}
            src={item.kind === "image" ? item.src : ""}
            alt={`Slide ${i + 1}`}
            style={{
              width: "100cqw",
              maxWidth: "320px",
              aspectRatio: "4 / 5",
              objectFit: "cover",
              display: "block",
              borderRadius: 12,
            }}
          />
        ))}
      </Slider>
      <FullscreenAddon />
    </GalleryCore>
  );
}

function SliderAutoPlayDemo() {
  const SLIDES = [
    {
      src: "https://picsum.photos/id/1055/1200/1200",
      fullscreenSrc: "https://picsum.photos/id/1055/2400/2400",
    },
    {
      src: "https://picsum.photos/id/1056/1200/1200",
      fullscreenSrc: "https://picsum.photos/id/1056/2400/2400",
    },
    {
      src: "https://picsum.photos/id/1057/1200/1200",
      fullscreenSrc: "https://picsum.photos/id/1057/2400/2400",
    },
    {
      src: "https://picsum.photos/id/1058/1200/1200",
      fullscreenSrc: "https://picsum.photos/id/1058/2400/2400",
    },
    {
      src: "https://picsum.photos/id/1059/1200/1200",
      fullscreenSrc: "https://picsum.photos/id/1059/2400/2400",
    },
    {
      src: "https://picsum.photos/id/1060/1200/1200",
      fullscreenSrc: "https://picsum.photos/id/1060/2400/2400",
    },
    {
      src: "https://picsum.photos/id/1061/1200/1200",
      fullscreenSrc: "https://picsum.photos/id/1061/2400/2400",
    },
    {
      src: "https://picsum.photos/id/1062/1200/1200",
      fullscreenSrc: "https://picsum.photos/id/1062/2400/2400",
    },
  ];

  const MEDIA = toMediaItems(SLIDES.map((slide) => slide.src));
  const FS_MEDIA = toMediaItems(SLIDES.map((slide) => slide.fullscreenSrc));

  return (
    <GalleryCore layout="slider" fullscreenItems={FS_MEDIA}>
      <Slider
        align="center"
        scroll={{
          loop: true,
          groupCells: true
        }}
        auto={{
          play: {
            enabled: true,
            speedMs: 2200,
          },
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
                    width: "100%",
                    height: "100%",
                    borderRadius: 12,
                  },
                },
                itemWrapStyle: {
                  width: "100cqw",
                  maxWidth: "550px",
                  aspectRatio: "16 / 9",
                },
              },
            },
          },
        }}
      >
        {MEDIA.map((item, i) => (
          <img
            key={`img-${item.kind === "image" ? item.src : ""}-${i}`}
            src={item.kind === "image" ? item.src : ""}
            alt={`Slide ${i + 1}`}
            style={{
              width: "100cqw",
              maxWidth: "550px",
              aspectRatio: "16 / 9",
              objectFit: "cover",
              display: "block",
              borderRadius: 12,
            }}
          />
        ))}
      </Slider>
      <FullscreenAddon />
    </GalleryCore>
  );
}

function SliderProgressDemo() {
  return null;
}

function SliderParallaxDemo() {
  return null;
}

function SliderScaleDemo() {
  return null;
}

function SliderFadeDemo() {
  return null;
}

function SliderCardsDemo() {
  return null;
}

function GridColumnsDemo() {
  return null;
}

function GridMinColumnWidthDemo() {
  return null;
}

function GridLazyLoadDemo() {
  return null;
}

function GridVideoHtml5Demo() {
  return null;
}

function GridVideoYoutubeDemo() {
  return null;
}

function GridVideoVimeoDemo() {
  return null;
}

function MasonryBalancedDemo() {
  return null;
}

function MasonryRoundRobinDemo() {
  return null;
}

function MasonryLazyLoadDemo() {
  return null;
}

function MasonryVideoHtml5Demo() {
  return null;
}

function MasonryVideoYoutubeDemo() {
  return null;
}

function MasonryVideoVimeoDemo() {
  return null;
}

function EntriesSliderDemo() {
  return null;
}

function EntriesGridDemo() {
  return null;
}

function EntriesMasonryDemo() {
  return null;
}

function FullscreenCaptionsDemo() {
  return null;
}

function FullscreenThumbnailRailAddon() {
  const viewportWidth = useDocumentClientWidth();
  const { fullscreenNode, fullscreenThumbnailBridge } = useFullscreenController({
    fullscreen: {
      enabled: true,
    },
  });

  return (
    <>
      {fullscreenNode}
      <FullscreenThumbnailSlider
        bridge={fullscreenThumbnailBridge}
        items={THUMBNAIL_DEMO_SLIDES.map((slide, i) => ({
          thumbSrc: slide.thumbSrc,
          alt: `Thumbnail ${i + 1}`,
        }))}
        position="bottom"
        thumbnailsCenter
        thumbnailWidth={96}
        thumbnailHeight={60}
        containerStyle={{
          width: viewportWidth || undefined,
          padding: "8px 12px",
          overflow: "visible",
        }}
        thumbnailItemClassName={styles.fullscreenThumbnailThumb}
        gap={12}
        centerActiveThumb
        showArrows
      />
    </>
  );
}

function FullscreenThumbnailsDemo() {
  const media = toMediaItems(
    THUMBNAIL_DEMO_SLIDES.map((slide) => slide.slideSrc)
  );
  const fullscreenMedia = toMediaItems(
    THUMBNAIL_DEMO_SLIDES.map((slide) => slide.fullscreenSrc)
  );

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <Slider
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
              },
            },
          },
        }}
      >
        {media.map((item, i) => (
          <ThumbnailDemoSlide
            key={`img-${item.kind === "image" ? item.src : ""}-${i}`}
            src={THUMBNAIL_DEMO_SLIDES[i]?.slideSrc ?? ""}
            i={i}
          />
        ))}
      </Slider>
      <FullscreenThumbnailRailAddon />
    </GalleryCore>
  );
}

function FullscreenOverlayDemo() {
  return null;
}

function FullscreenLazyLoadDemo() {
  return null;
}

const SLIDER_DEMOS: DemoDefinition[] = [
  {
    id: "slider-default",
    title: "Default",
    eyebrow: "Slider",
    tags: ["fullscreen", "skeleton"],
    categoryId: "slider",
    Component: SliderDefaultDemo,
    source: SLIDER_DEFAULT_SOURCE,
    css: SLIDER_DEFAULT_CSS,
  },
  {
    id: "slider-loop",
    title: "Loop",
    eyebrow: "Slider",
    tags: ["center", "fullscreen", "skeleton"],
    categoryId: "slider",
    Component: SliderLoopDemo,
    source: SLIDER_LOOP_SOURCE,
    css: SLIDER_LOOP_CSS,
  },
  {
    id: "slider-video-html5",
    title: "HTML5",
    eyebrow: "Slider Video",
    tags: ["fullscreen", "skeleton"],
    categoryId: "slider",
    Component: SliderVideoHtml5Demo,
    source: SLIDER_HTML5_SOURCE,
    css: SLIDER_VIDEO_HTML5_CSS,
  },
  {
    id: "slider-video-html5-loop",
    title: "HTML5 + Loop",
    eyebrow: "Slider Video",
    tags: ["center", "fullscreen", "skeleton"],
    categoryId: "slider",
    Component: SliderVideoHtml5LoopDemo,
    source: SLIDER_HTML5_LOOP_SOURCE,
    css: SLIDER_VIDEO_HTML5_LOOP_CSS,
  },
  {
    id: "slider-video-youtube",
    title: "Youtube",
    eyebrow: "Slider Video",
    tags: ["fullscreen", "skeleton"],
    categoryId: "slider",
    Component: SliderVideoYoutubeDemo,
    source: SLIDER_YOUTUBE_SOURCE,
    css: SLIDER_VIDEO_YOUTUBE_CSS,
  },
  {
    id: "slider-video-youtube-loop",
    title: "Youtube + Loop",
    eyebrow: "Slider Video",
    tags: ["center", "fullscreen", "skeleton"],
    categoryId: "slider",
    Component: SliderVideoYoutubeLoopDemo,
    source: SLIDER_YOUTUBE_LOOP_SOURCE,
    css: SLIDER_VIDEO_YOUTUBE_LOOP_CSS,
  },
  {
    id: "slider-video-vimeo",
    title: "Vimeo",
    eyebrow: "Slider Video",
    tags: ["fulscreen", "skeleton"],
    categoryId: "slider",
    Component: SliderVideoVimeoDemo,
    source: SLIDER_VIMEO_SOURCE,
    css: SLIDER_VIDEO_VIMEO_CSS,
  },
  {
    id: "slider-video-vimeo-loop",
    title: "Vimeo + Loop",
    eyebrow: "Slider Video",
    tags: ["center", "fullscreen", "skeleton"],
    categoryId: "slider",
    Component: SliderVideoVimeoLoopDemo,
    source: SLIDER_VIMEO_LOOP_SOURCE,
    css: SLIDER_VIDEO_VIMEO_LOOP_CSS,
  },
  {
    id: "slider-right-to-left",
    title: "Right To Left",
    eyebrow: "Slider",
    tags: ["fullscreen", "skeleton"],
    categoryId: "slider",
    Component: SliderRightToLeftDemo,
    source: SLIDER_RIGHT_TO_LEFT_SOURCE,
    css: SLIDER_RIGHT_TO_LEFT_CSS,
  },
  {
    id: "slider-group-cells",
    title: "Group Cells",
    eyebrow: "Slider",
    tags: ["fullscreen", "skeleton"],
    categoryId: "slider",
    Component: SliderGroupCellsDemo,
    source: SLIDER_GROUP_CELLS_SOURCE,
    css: SLIDER_GROUP_CELLS_CSS,
  },
  {
    id: "slider-free-scroll",
    title: "Free Scroll",
    eyebrow: "Slider",
    tags: ["group-cells", "fullscreen", "skeleton"],
    categoryId: "slider",
    Component: SliderFreeScrollDemo,
    source: SLIDER_FREE_SCROLL_SOURCE,
    css: SLIDER_FREE_SCROLL_CSS,
  },
  {
    id: "slider-skip-snaps",
    title: "Skip Snaps",
    eyebrow: "Slider",
    tags: ["fullscreen", "skeleton"],
    categoryId: "slider",
    Component: SliderSkipSnapsDemo,
    source: SLIDER_SKIP_SNAPS_SOURCE,
    css: SLIDER_SKIP_SNAPS_CSS,
  },
  {
    id: "slider-center-align",
    title: "Center Align",
    eyebrow: "Slider",
    tags: ["fullscreen", "skeleton"],
    categoryId: "slider",
    Component: SliderCenterAlignDemo,
    source: SLIDER_CENTER_ALIGN_SOURCE,
    css: SLIDER_CENTER_ALIGN_CSS,
  },
  {
    id: "slider-variable-widths",
    title: "Variable Widths",
    eyebrow: "Slider",
    tags: ["center", "fullscreen", "skeleton"],
    categoryId: "slider",
    Component: SliderVariableWidthsDemo,
    source: SLIDER_VARIABLE_WIDTHS_SOURCE,
    css: SLIDER_VARIABLE_WIDTHS_CSS,
  },
  {
    id: "slider-y-axis",
    title: "Y Axis",
    eyebrow: "Slider",
    tags: ["fullscreen", "skeleton"],
    categoryId: "slider",
    Component: SliderYAxisDemo,
    source: SLIDER_Y_AXIS_SOURCE,
    css: SLIDER_Y_AXIS_CSS,
  },
  {
    id: "slider-cells-per-slide",
    title: "Cells Per Slide",
    eyebrow: "Slider",
    tags: ["group-cells", "fullscreen", "skeleton"],
    categoryId: "slider",
    Component: SliderCellsPerSlideDemo,
    source: SLIDER_CELLS_PER_SLIDE_SOURCE,
    css: SLIDER_CELLS_PER_SLIDE_CSS,
  },
  {
    id: "slider-thumbnails",
    title: "Thumbnails",
    eyebrow: "Slider",
    tags: ["thumbnails", "fullscreen", "skeleton", "fullscreen-thumbnails"],
    categoryId: "slider",
    Component: SliderThumbnailsDemo,
    source: SLIDER_THUMBNAILS_SOURCE,
    css: SLIDER_THUMBNAILS_CSS,
  },
  {
    id: "slider-lazy-load",
    title: "Lazy Load",
    eyebrow: "Slider",
    tags: ["fullscreen", "skeleton"],
    categoryId: "slider",
    Component: SliderLazyLoadDemo,
    source: SLIDER_LAZY_LOAD_SOURCE,
    css: SLIDER_LAZY_LOAD_CSS,
  },
  {
    id: "slider-auto-scroll",
    title: "Auto Scroll",
    eyebrow: "Slider",
    tags: ["center", "loop", "fullscreen", "skeleton"],
    categoryId: "slider",
    Component: SliderAutoScrollDemo,
    source: SLIDER_AUTO_SCROLL_SOURCE,
    css: SLIDER_AUTO_SCROLL_CSS,
  },
  {
    id: "slider-auto-play",
    title: "Auto Play",
    eyebrow: "Slider",
    tags: ["center", "loop", "fullscreen", "skeleton"],
    categoryId: "slider",
    Component: SliderAutoPlayDemo,
    source: SLIDER_AUTO_PLAY_SOURCE,
    css: SLIDER_AUTO_PLAY_CSS,
  },
  {
    id: "slider-progress",
    title: "Progress",
    eyebrow: "Slider",
    tags: ["progress", "controls"],
    categoryId: "slider",
    Component: SliderProgressDemo,
    css: SLIDER_PROGRESS_CSS,
  },
  {
    id: "slider-parallax",
    title: "Parallax",
    eyebrow: "Slider",
    tags: ["parallax", "effects"],
    categoryId: "slider",
    Component: SliderParallaxDemo,
    css: SLIDER_PARALLAX_CSS,
  },
  {
    id: "slider-scale",
    title: "Scale",
    eyebrow: "Slider",
    tags: ["scale", "effects"],
    categoryId: "slider",
    Component: SliderScaleDemo,
    css: SLIDER_SCALE_CSS,
  },
  {
    id: "slider-fade",
    title: "Fade",
    eyebrow: "Slider",
    tags: ["fade", "effects"],
    categoryId: "slider",
    Component: SliderFadeDemo,
    css: SLIDER_FADE_CSS,
  },
  {
    id: "slider-cards",
    title: "Cards",
    eyebrow: "Slider",
    tags: ["cards", "editorial"],
    categoryId: "slider",
    Component: SliderCardsDemo,
    css: SLIDER_CARDS_CSS,
  },
];

const GRID_DEMOS: DemoDefinition[] = [
  {
    id: "grid-columns",
    title: "Columns",
    eyebrow: "Grid",
    tags: ["columns", "fullscreen"],
    categoryId: "grid",
    Component: GridColumnsDemo,
    css: GRID_COLUMNS_CSS,
  },
  {
    id: "grid-min-column-width",
    title: "Min Column Width",
    eyebrow: "Grid",
    tags: ["min-column-width", "responsive"],
    categoryId: "grid",
    Component: GridMinColumnWidthDemo,
    css: GRID_MIN_COLUMN_WIDTH_CSS,
  },
  {
    id: "grid-lazy-load",
    title: "Lazy Load",
    eyebrow: "Grid",
    tags: ["lazy-load", "media"],
    categoryId: "grid",
    Component: GridLazyLoadDemo,
    css: GRID_LAZY_LOAD_CSS,
  },
  {
    id: "grid-video-html5",
    title: "HTML5",
    eyebrow: "Grid Video",
    tags: ["video", "html5"],
    categoryId: "grid",
    Component: GridVideoHtml5Demo,
    css: GRID_VIDEO_HTML5_CSS,
  },
  {
    id: "grid-video-youtube",
    title: "Youtube",
    eyebrow: "Grid Video",
    tags: ["video", "youtube"],
    categoryId: "grid",
    Component: GridVideoYoutubeDemo,
    css: GRID_VIDEO_YOUTUBE_CSS,
  },
  {
    id: "grid-video-vimeo",
    title: "Vimeo",
    eyebrow: "Grid Video",
    tags: ["video", "vimeo"],
    categoryId: "grid",
    Component: GridVideoVimeoDemo,
    css: GRID_VIDEO_VIMEO_CSS,
  },
];

const MASONRY_DEMOS: DemoDefinition[] = [
  {
    id: "masonry-balanced",
    title: "Balanced",
    eyebrow: "Masonry",
    tags: ["balanced", "fullscreen"],
    categoryId: "masonry",
    Component: MasonryBalancedDemo,
    css: MASONRY_BALANCED_CSS,
  },
  {
    id: "masonry-round-robin",
    title: "Round Robin",
    eyebrow: "Masonry",
    tags: ["round-robin", "distribution"],
    categoryId: "masonry",
    Component: MasonryRoundRobinDemo,
    css: MASONRY_ROUND_ROBIN_CSS,
  },
  {
    id: "masonry-lazy-load",
    title: "Lazy Load",
    eyebrow: "Masonry",
    tags: ["lazy-load", "media"],
    categoryId: "masonry",
    Component: MasonryLazyLoadDemo,
    css: MASONRY_LAZY_LOAD_CSS,
  },
  {
    id: "masonry-video-html5",
    title: "HTML5",
    eyebrow: "Masonry Video",
    tags: ["video", "html5"],
    categoryId: "masonry",
    Component: MasonryVideoHtml5Demo,
    css: MASONRY_VIDEO_HTML5_CSS,
  },
  {
    id: "masonry-video-youtube",
    title: "Youtube",
    eyebrow: "Masonry Video",
    tags: ["video", "youtube"],
    categoryId: "masonry",
    Component: MasonryVideoYoutubeDemo,
    css: MASONRY_VIDEO_YOUTUBE_CSS,
  },
  {
    id: "masonry-video-vimeo",
    title: "Vimeo",
    eyebrow: "Masonry Video",
    tags: ["video", "vimeo"],
    categoryId: "masonry",
    Component: MasonryVideoVimeoDemo,
    css: MASONRY_VIDEO_VIMEO_CSS,
  },
];

const ENTRIES_DEMOS: DemoDefinition[] = [
  {
    id: "entries-slider",
    title: "Slider",
    eyebrow: "Entries",
    tags: ["slider", "fullscreen"],
    categoryId: "entries",
    Component: EntriesSliderDemo,
    css: ENTRIES_SLIDER_CSS,
  },
  {
    id: "entries-grid",
    title: "Grid",
    eyebrow: "Entries",
    tags: ["grid", "fullscreen"],
    categoryId: "entries",
    Component: EntriesGridDemo,
    css: ENTRIES_GRID_CSS,
  },
  {
    id: "entries-masonry",
    title: "Masonry",
    eyebrow: "Entries",
    tags: ["masonry", "fullscreen"],
    categoryId: "entries",
    Component: EntriesMasonryDemo,
    css: ENTRIES_MASONRY_CSS,
  },
];

const FULLSCREEN_DEMOS: DemoDefinition[] = [
  {
    id: "fullscreen-captions",
    title: "Captions",
    eyebrow: "Fullscreen",
    tags: ["captions", "overlay"],
    categoryId: "fullscreen",
    Component: FullscreenCaptionsDemo,
    css: FULLSCREEN_CAPTIONS_CSS,
  },
  {
    id: "fullscreen-thumbnails",
    title: "Thumbnails",
    eyebrow: "Fullscreen",
    tags: ["thumbnails", "navigation", "sync"],
    categoryId: "fullscreen",
    Component: FullscreenThumbnailsDemo,
    source: FULLSCREEN_THUMBNAILS_SOURCE,
    css: FULLSCREEN_THUMBNAILS_CSS,
  },
  {
    id: "fullscreen-overlay",
    title: "Overlay",
    eyebrow: "Fullscreen",
    tags: ["overlay", "captions"],
    categoryId: "fullscreen",
    Component: FullscreenOverlayDemo,
    css: FULLSCREEN_OVERLAY_CSS,
  },
  {
    id: "fullscreen-lazy-load",
    title: "LazyLoad",
    eyebrow: "Fullscreen",
    tags: ["lazy-load", "media"],
    categoryId: "fullscreen",
    Component: FullscreenLazyLoadDemo,
    css: FULLSCREEN_LAZY_LOAD_CSS,
  },
];

const DEMOS: DemoDefinition[] = [
  ...SLIDER_DEMOS,
  ...GRID_DEMOS,
  ...MASONRY_DEMOS,
  ...ENTRIES_DEMOS,
  ...FULLSCREEN_DEMOS,
];

const DEMO_BY_ID = new Map(DEMOS.map((demo) => [demo.id, demo]));

const DEMO_CATEGORIES: DemoCategory[] = [
  {
    id: "slider",
    label: "Slider",
    description: "Base carousel variants covering motion, direction, grouping, media, and navigation layers.",
    items: [
      { type: "demo", demoId: "slider-default" },
      { type: "demo", demoId: "slider-loop" },
      {
        type: "group",
        id: "slider-video",
        label: "Video",
        demoIds: [
          "slider-video-html5",
          "slider-video-html5-loop",
          "slider-video-youtube",
          "slider-video-youtube-loop",
          "slider-video-vimeo",
          "slider-video-vimeo-loop",
        ],
      },
      { type: "demo", demoId: "slider-right-to-left" },
      { type: "demo", demoId: "slider-group-cells" },
      { type: "demo", demoId: "slider-free-scroll" },
      { type: "demo", demoId: "slider-skip-snaps" },
      { type: "demo", demoId: "slider-center-align" },
      { type: "demo", demoId: "slider-variable-widths" },
      { type: "demo", demoId: "slider-y-axis" },
      { type: "demo", demoId: "slider-cells-per-slide" },
      { type: "demo", demoId: "slider-thumbnails" },
      { type: "demo", demoId: "slider-lazy-load" },
      { type: "demo", demoId: "slider-auto-scroll" },
      { type: "demo", demoId: "slider-auto-play" },
      { type: "demo", demoId: "slider-progress" },
      { type: "demo", demoId: "slider-parallax" },
      { type: "demo", demoId: "slider-scale" },
      { type: "demo", demoId: "slider-fade" },
      { type: "demo", demoId: "slider-cards" },
    ],
  },
  {
    id: "grid",
    label: "Grid",
    description: "Row-based gallery surfaces for explicit columns, auto-fit sizing, lazy media, and video cards.",
    items: [
      { type: "demo", demoId: "grid-columns" },
      { type: "demo", demoId: "grid-min-column-width" },
      { type: "demo", demoId: "grid-lazy-load" },
      {
        type: "group",
        id: "grid-video",
        label: "Video",
        demoIds: ["grid-video-html5", "grid-video-youtube", "grid-video-vimeo"],
      },
    ],
  },
  {
    id: "masonry",
    label: "Masonry",
    description: "Waterfall layouts for uneven heights, alternative placement rules, and mixed video walls.",
    items: [
      { type: "demo", demoId: "masonry-balanced" },
      { type: "demo", demoId: "masonry-round-robin" },
      { type: "demo", demoId: "masonry-lazy-load" },
      {
        type: "group",
        id: "masonry-video",
        label: "Video",
        demoIds: [
          "masonry-video-html5",
          "masonry-video-youtube",
          "masonry-video-vimeo",
        ],
      },
    ],
  },
  {
    id: "entries",
    label: "Entries",
    description: "Structured editorial rows whose internal media blocks can be sliders, grids, or masonry collections.",
    items: [
      { type: "demo", demoId: "entries-slider" },
      { type: "demo", demoId: "entries-grid" },
      { type: "demo", demoId: "entries-masonry" },
    ],
  },
  {
    id: "fullscreen",
    label: "Fullscreen",
    description: "Overlay-specific demos for captions, thumbnail rails, compact overlays, and lazy media loading.",
    items: [
      { type: "demo", demoId: "fullscreen-captions" },
      { type: "demo", demoId: "fullscreen-thumbnails" },
      { type: "demo", demoId: "fullscreen-overlay" },
      { type: "demo", demoId: "fullscreen-lazy-load" },
    ],
  },
];

const DEFAULT_DEMO_ID = DEMOS[0]?.id ?? "";

export default function DemosPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasMounted = useHasMounted();
  const fallbackDemo = DEMOS[0];
  const fallbackCategory = DEMO_CATEGORIES[0];
  const requestedDemoId = searchParams.get("demo");
  const selectedDemo = DEMO_BY_ID.get(requestedDemoId ?? "") ?? fallbackDemo;
  const selectedCategory =
    DEMO_CATEGORIES.find((category) => category.id === selectedDemo?.categoryId) ??
    fallbackCategory;
  const [sidebarExpansion, setSidebarExpansion] = useState<SidebarExpansionState>(() => ({
    expandedCategories: selectedCategory ? [selectedCategory.id] : [],
    syncedDemoId: selectedDemo?.id ?? "",
  }));
  const simpleBarRef = useRef<SimpleBarCore | null>(null);
  const isCompactSidebar = useMediaQuery("(max-width: 767px)");
  const shouldUseSimpleBar = hasMounted && !isCompactSidebar;

  useLayoutEffect(() => {
    if (!shouldUseSimpleBar) {
      return;
    }

    if (simpleBarRef.current === null) {
      return;
    }

    const simpleBarInstance = simpleBarRef.current!;

    let frameId: number | null = null;

    function recalculate() {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      frameId = window.requestAnimationFrame(() => {
        simpleBarInstance.recalculate();
      });
    }

    function handleResize() {
      recalculate();
    }

    window.addEventListener("resize", handleResize);
    recalculate();

    return () => {
      window.removeEventListener("resize", handleResize);

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [shouldUseSimpleBar]);

  if (!fallbackDemo || !fallbackCategory || !selectedDemo || !selectedCategory) {
    return null;
  }

  const expandedCategories = resolveExpandedCategories(
    sidebarExpansion,
    selectedDemo.id,
    selectedCategory.id
  );
  const selectedDemoCanvasClassName = styles[toDemoCanvasClassName(selectedDemo.id)];
  const selectedDemoSource = selectedDemo.source ?? createPlaceholderDemoSource(selectedDemo);

  function toggleCategory(categoryId: DemoCategoryId) {
    setSidebarExpansion((current) => {
      const currentExpandedCategories = resolveExpandedCategories(
        current,
        selectedDemo.id,
        selectedCategory.id
      );

      return {
        syncedDemoId: selectedDemo.id,
        expandedCategories: currentExpandedCategories.includes(categoryId)
          ? currentExpandedCategories.filter((id) => id !== categoryId)
          : [...currentExpandedCategories, categoryId],
      };
    });
  }

  function selectDemo(demo: DemoDefinition) {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (demo.id === DEFAULT_DEMO_ID) {
      nextParams.delete("demo");
    } else {
      nextParams.set("demo", demo.id);
    }

    const query = nextParams.toString();

    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  }

  const sidebarNavigation = (
    <nav className={styles.sidebarNav} aria-label="Demo navigation">
      {DEMO_CATEGORIES.map((category) => {
        const isOpen = expandedCategories.includes(category.id);
        const categoryPanelId = `demo-category-panel-${category.id}`;

        return (
          <section key={category.id} className={styles.category}>
            <button
              type="button"
              className={styles.categoryToggle}
              onClick={() => toggleCategory(category.id)}
              aria-expanded={isOpen}
              aria-controls={categoryPanelId}
            >
              <span className={styles.categoryToggleCopy}>
                <strong className={styles.categoryLabel}>{category.label}</strong>
              </span>
              <ChevronDown
                className={cx(
                  styles.categoryChevron,
                  isOpen && styles.categoryChevronOpen
                )}
                strokeWidth={1.7}
              />
            </button>

            <AnimatedCategoryPanel id={categoryPanelId} isOpen={isOpen}>
              <div className={styles.demoList}>
                {category.items.map((item) => {
                  if (item.type === "demo") {
                    const demo = DEMO_BY_ID.get(item.demoId);

                    if (!demo) {
                      return null;
                    }

                    const isActive = demo.id === selectedDemo.id;

                    return (
                      <button
                        key={demo.id}
                        type="button"
                        className={cx(
                          styles.demoLink,
                          isActive && styles.demoLinkActive
                        )}
                        onClick={() => selectDemo(demo)}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <strong className={styles.demoLinkTitle}>
                          {demo.title}
                        </strong>
                      </button>
                    );
                  }

                  return (
                    <div key={item.id} className={styles.demoGroup}>
                      <span className={styles.demoGroupLabel}>{item.label}</span>
                      <div className={styles.demoGroupList}>
                        {item.demoIds.map((demoId) => {
                          const demo = DEMO_BY_ID.get(demoId);

                          if (!demo) {
                            return null;
                          }

                          const isActive = demo.id === selectedDemo.id;

                          return (
                            <button
                              key={demo.id}
                              type="button"
                              className={cx(
                                styles.demoLink,
                                isActive && styles.demoLinkActive
                              )}
                              onClick={() => selectDemo(demo)}
                              aria-current={isActive ? "page" : undefined}
                            >
                              <strong className={styles.demoLinkTitle}>
                                {demo.title}
                              </strong>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </AnimatedCategoryPanel>
          </section>
        );
      })}
    </nav>
  );

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarInner}>
              <div className={styles.sidebarIntro}>
                <span className={styles.sidebarKicker}>Browse</span>
                <strong className={styles.sidebarTitle}>{DEMOS.length} demos</strong>
                <p className={styles.sidebarCopy}>
                  All demos come with pre-made code blocks so you can get started instantly
                </p>
              </div>

              {shouldUseSimpleBar ? (
                <SimpleBar
                  ref={simpleBarRef}
                  className={styles.sidebarNavScrollArea}
                  autoHide={false}
                  forceVisible="y"
                >
                  {sidebarNavigation}
                </SimpleBar>
              ) : (
                <div
                  className={cx(
                    styles.sidebarNavScrollArea,
                    styles.sidebarNavScrollAreaNative
                  )}
                >
                  {sidebarNavigation}
                </div>
              )}
            </div>
          </aside>

          <main className={styles.main}>
            <SelectedDemoPane
              key={selectedDemo.id}
              selectedCategoryLabel={selectedCategory.label}
              selectedDemo={selectedDemo}
              selectedDemoCanvasClassName={selectedDemoCanvasClassName}
              selectedDemoSource={selectedDemoSource}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
