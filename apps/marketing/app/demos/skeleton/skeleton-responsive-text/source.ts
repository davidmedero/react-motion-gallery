export const source = `"use client";

import { useSearchParams } from "next/navigation";
import * as React from "react";
import { Video } from "react-motion-gallery/video";
import {
  Skeleton,
  type SkeletonNode,
} from "react-motion-gallery/skeleton/cache/base";
import styles from "./skeleton-responsive-text-demo.module.css";
import { skeletonResponsiveTextSkeletonText } from "./skeleton-responsive-text.skeleton-text.generated";
import { demoSkeletonCache } from "../../skeleton-cache";

type SkeletonTextIds = {
  label: string;
  title: string;
  body: string;
};

type GeneratedSkeletonTextState = {
  lines: number | Record<number, number>;
  barWidth?: string | string[] | Record<number, string | string[]>;
  lastBarWidth?: string | Record<number, string>;
  barHeight?: number | Record<number, number>;
  lineHeight?: number | Record<number, number>;
  responsiveBy?: "viewport" | "container";
};

type GeneratedArticleSkeletonText = {
  label: GeneratedSkeletonTextState;
  title: GeneratedSkeletonTextState;
  body: GeneratedSkeletonTextState;
};

type ArticleCard = {
  accent: string;
  body: string;
  label: string;
  poster: string;
  src: string;
  title: string;
  width: string;
};

const VIDEO_ASSETS = [
  {
    src: "https://cdn.react-motion-gallery.com/slider-html/12354535_1920_1080_30fps.mp4",
    poster:
      "https://cdn.react-motion-gallery.com/slider-html-loop/12354535_1920_1080_30fps-0.jpg",
  },
  {
    src: "https://cdn.react-motion-gallery.com/slider-html/4151824-uhd_3840_2160_25fps.mp4",
    poster:
      "https://cdn.react-motion-gallery.com/slider-html-loop/4151824-uhd_3840_2160_25fps-0.jpg",
  },
  {
    src: "https://cdn.react-motion-gallery.com/slider-html/7677511-hd_1920_1080_25fps.mp4",
    poster:
      "https://cdn.react-motion-gallery.com/slider-html-loop/7677511-hd_1920_1080_25fps-0.jpg",
  },
] as const;

const ARTICLE_VIDEO_OPTIONS = {
  controls: ["play-large"],
  muted: true,
  playsinline: true,
};

const HEADER_TEXT_IDS = {
  title: "responsiveTextHeaderTitle",
  meta: "responsiveTextHeaderMeta",
} as const;

const RESPONSIVE_TEXT_IDS: SkeletonTextIds[] = [
  {
    label: "responsiveTextItem01Label",
    title: "responsiveTextItem01Title",
    body: "responsiveTextItem01Body",
  },
  {
    label: "responsiveTextItem02Label",
    title: "responsiveTextItem02Title",
    body: "responsiveTextItem02Body",
  },
  {
    label: "responsiveTextItem03Label",
    title: "responsiveTextItem03Title",
    body: "responsiveTextItem03Body",
  },
];

const HEADER_SKELETON_TEXT = {
  title: skeletonResponsiveTextSkeletonText[HEADER_TEXT_IDS.title]!,
  meta: skeletonResponsiveTextSkeletonText[HEADER_TEXT_IDS.meta]!,
};

const RESPONSIVE_TEXT_SKELETON_TEXT: GeneratedArticleSkeletonText[] =
  RESPONSIVE_TEXT_IDS.map((textIds) => ({
    label: skeletonResponsiveTextSkeletonText[textIds.label]!,
    title: skeletonResponsiveTextSkeletonText[textIds.title]!,
    body: skeletonResponsiveTextSkeletonText[textIds.body]!,
  }));

const ARTICLES: ArticleCard[] = [
  {
    accent: "rgba(var(--rmg-logo-cyan-rgb), 0.24)",
    body: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    label: "Lorem",
    poster: VIDEO_ASSETS[0].poster,
    src: VIDEO_ASSETS[0].src,
    title: "Lorem ipsum dolor sit amet",
    width: "340px",
  },
  {
    accent: "rgba(var(--rmg-logo-lavender-rgb), 0.2)",
    body: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.",
    label: "Ipsum",
    poster: VIDEO_ASSETS[1].poster,
    src: VIDEO_ASSETS[1].src,
    title: "Sed do eiusmod tempor incididunt",
    width: "260px",
  },
  {
    accent: "rgba(var(--rmg-logo-magenta-rgb), 0.18)",
    body: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    label: "Dolor",
    poster: VIDEO_ASSETS[2].poster,
    src: VIDEO_ASSETS[2].src,
    title: "Excepteur sint occaecat cupidatat",
    width: "220px",
  },
];

function articleColumn(article: ArticleCard, index: number): SkeletonNode {
  const skeletonText =
    RESPONSIVE_TEXT_SKELETON_TEXT[index] ?? RESPONSIVE_TEXT_SKELETON_TEXT[0]!;

  return {
    kind: "col",
    style: {
      flex: \`1 1 \${article.width}\`,
      minWidth: 0,
      padding: 18,
      gap: 14,
      backgroundColor: "#ffffff",
      borderRadius: 18,
      border: "1px solid rgba(15, 23, 42, 0.08)",
    },
    children: [
      {
        kind: "col",
        style: {
          width: "100%",
          aspectRatio: "16 / 8",
          borderRadius: 14,
          backgroundColor: article.accent,
          justifyContent: "flex-end",
          alignItems: "flex-start",
          padding: 12,
        },
        children: [
          {
            kind: "col",
            style: {
              minWidth: 0,
              padding: "6px 9px",
              borderRadius: 999,
              backgroundColor: "rgba(255, 255, 255, 0.66)",
            },
            children: [
              {
                kind: "text",
                barHeight: 11,
                lineHeight: 1,
                ...skeletonText.label,
              },
            ],
          },
        ],
      },
      {
        kind: "text",
        barHeight: 18,
        lineHeight: 1.2,
        ...skeletonText.title,
      },
      {
        kind: "text",
        barHeight: 13,
        lineHeight: 1.62,
        style: {
          width: "100%",
        },
        ...skeletonText.body,
      },
    ],
  };
}

const RESPONSIVE_TEXT_LAYOUT: SkeletonNode = {
  kind: "col",
  style: {
    gap: 18,
  },
  children: [
    {
      kind: "row",
      style: {
        gap: 14,
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
      },
      children: [
        {
          kind: "col",
          style: {
            flex: "1 1 260px",
            minWidth: 0,
            gap: 8,
          },
          children: [
            {
              kind: "text",
              barHeight: 22,
              lineHeight: 1.18,
              ...HEADER_SKELETON_TEXT.title,
            },
            {
              kind: "text",
              barHeight: 13,
              lineHeight: 1.35,
              ...HEADER_SKELETON_TEXT.meta,
            },
          ],
        },
        {
          kind: "row",
          style: {
            flex: "0 1 260px",
            gap: 9,
            justifyContent: "flex-end",
          },
          children: Array.from({ length: 3 }, (_, index) => ({
            kind: "rect" as const,
            style: {
              width: index === 0 ? 74 : 52,
              height: 30,
              borderRadius: 999,
              flexShrink: 0,
            },
          })),
        },
      ],
    },
    {
      kind: "row",
      style: {
        flexWrap: "wrap",
        gap: 16,
        alignItems: "stretch",
      },
      children: ARTICLES.map(articleColumn),
    },
  ],
};

function getVideoMedia(api: unknown): HTMLMediaElement | null {
  const plyr = (api as { plyr?: unknown } | null)?.plyr ?? api;
  const media = (plyr as { media?: unknown } | null)?.media;

  return media instanceof HTMLMediaElement ? media : null;
}

function isVideoMediaReady(media: HTMLMediaElement) {
  const video = media as HTMLVideoElement;

  return (
    media.readyState >= 1 || (video.videoWidth > 0 && video.videoHeight > 0)
  );
}

function useVideoReadiness(count: number) {
  const cleanupByIndexRef = React.useRef<Array<(() => void) | null>>([]);
  const [readyVideos, setReadyVideos] = React.useState<boolean[]>(() =>
    Array.from({ length: count }, () => false),
  );

  React.useEffect(() => {
    setReadyVideos((current) =>
      current.length === count
        ? current
        : Array.from({ length: count }, () => false),
    );
  }, [count]);

  const markVideoReady = React.useCallback((index: number) => {
    setReadyVideos((current) => {
      if (current[index]) return current;

      const next = current.slice();
      next[index] = true;
      return next;
    });
  }, []);

  const handleVideoApi = React.useCallback(
    (index: number, api: unknown) => {
      cleanupByIndexRef.current[index]?.();
      cleanupByIndexRef.current[index] = null;

      const media = getVideoMedia(api);
      if (!media) return;

      const markIfReady = () => {
        if (!isVideoMediaReady(media)) return false;

        markVideoReady(index);
        return true;
      };

      if (markIfReady()) return;

      const onReady = () => {
        markVideoReady(index);
      };

      media.addEventListener("loadedmetadata", onReady);
      media.addEventListener("loadeddata", onReady);
      media.addEventListener("canplay", onReady);

      cleanupByIndexRef.current[index] = () => {
        media.removeEventListener("loadedmetadata", onReady);
        media.removeEventListener("loadeddata", onReady);
        media.removeEventListener("canplay", onReady);
      };
    },
    [markVideoReady],
  );

  React.useEffect(() => {
    return () => {
      cleanupByIndexRef.current.forEach((cleanup) => cleanup?.());
      cleanupByIndexRef.current = [];
    };
  }, []);

  return {
    allVideosReady: readyVideos.length === count && readyVideos.every(Boolean),
    handleVideoApi,
  };
}

export function SkeletonResponsiveTextDemo() {
  const searchParams = useSearchParams();
  const showMeasuredContent = searchParams.get("skeletonMeasure") === "content";
  const { allVideosReady, handleVideoApi } = useVideoReadiness(ARTICLES.length);
  const isLoaded = showMeasuredContent || allVideosReady;

  return (
    <div className={styles.shell}>
      <Skeleton
        cache={demoSkeletonCache("skeleton-responsive-text")}
        layout={RESPONSIVE_TEXT_LAYOUT}
        ready={isLoaded}
        enabled={!showMeasuredContent}
        shellClassName={styles.stage}
        className={styles.skeleton}
        backgroundColor="rgba(var(--rmg-logo-blue-rgb), 0.24)"
        radius={12}
        timing={{ exitMs: 520 }}
        shimmer={{
          durationMs: 1400,
          angleDeg: 100,
          opacity: 0.92,
        }}
        ariaLabel={
          isLoaded ? undefined : "Loading responsive lorem ipsum cards"
        }
      >
        <section className={styles.textDemo}>
          <header className={styles.headerRow}>
            <div className={styles.headerCopy}>
              <h2
                className={styles.headerTitle}
                data-skeleton-text-id={HEADER_TEXT_IDS.title}
              >
                Lorem ipsum dolor sit amet
              </h2>
              <p
                className={styles.headerMeta}
                data-skeleton-text-id={HEADER_TEXT_IDS.meta}
              >
                Consectetur adipiscing elit sed do eiusmod
              </p>
            </div>
            <div className={styles.filterRow} aria-label="Lorem ipsum filters">
              <button type="button">Lorem</button>
              <button type="button">Ipsum</button>
              <button type="button">Dolor</button>
            </div>
          </header>
          <div className={styles.articleGrid}>
            {ARTICLES.map((article, index) => {
              const textIds =
                RESPONSIVE_TEXT_IDS[index] ?? RESPONSIVE_TEXT_IDS[0]!;

              return (
                <article className={styles.articleCard} key={article.title}>
                  <div
                    className={styles.articleImage}
                    style={{ backgroundColor: article.accent }}
                  >
                    <Video
                      src={article.src}
                      poster={article.poster}
                      alt={article.title}
                      className={styles.articleVideo}
                      options={ARTICLE_VIDEO_OPTIONS}
                      onApi={(api) => handleVideoApi(index, api)}
                    />
                    <span data-skeleton-text-id={textIds.label}>
                      {article.label}
                    </span>
                  </div>
                  <h3
                    className={styles.articleTitle}
                    data-skeleton-text-id={textIds.title}
                  >
                    {article.title}
                  </h3>
                  <p
                    className={styles.articleBody}
                    data-skeleton-text-id={textIds.body}
                  >
                    {article.body}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      </Skeleton>
    </div>
  );
}
`;
