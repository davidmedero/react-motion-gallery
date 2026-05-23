"use client";

import { useSearchParams } from "next/navigation";
import {
  Skeleton,
  type SkeletonNode,
} from "react-motion-gallery/skeleton/cache/base";
import styles from "./skeleton-force-overlay-demo.module.css";
import { skeletonForceOverlaySkeletonText } from "./skeleton-force-overlay.skeleton-text.generated";
import { demoSkeletonCache } from "../../skeleton-cache";

type SkeletonTextIds = {
  detail: string;
  title: string;
};

type SummaryTextIds = {
  label: string;
  value: string;
};

type GeneratedSkeletonTextState = {
  lines: number | Record<number, number>;
  barWidth?: string | string[] | Record<number, string | string[]>;
  lastBarWidth?: string | Record<number, string>;
  barHeight?: number | Record<number, number>;
  lineHeight?: number | Record<number, number>;
  responsiveBy?: "viewport" | "container";
};

type SummaryItem = {
  label: string;
  tone: string;
  value: string;
};

type TimelineItem = {
  detail: string;
  textIds: SkeletonTextIds;
  title: string;
};

const HEADER_TEXT_IDS = {
  title: "forceOverlayHeaderTitle",
  meta: "forceOverlayHeaderMeta",
} as const;

const SUMMARY_TEXT_IDS = [
  {
    label: "forceOverlaySummary01Label",
    value: "forceOverlaySummary01Value",
  },
  {
    label: "forceOverlaySummary02Label",
    value: "forceOverlaySummary02Value",
  },
  {
    label: "forceOverlaySummary03Label",
    value: "forceOverlaySummary03Value",
  },
] satisfies SummaryTextIds[];

const TIMELINE_TEXT_IDS: SkeletonTextIds[] = [
  {
    title: "forceOverlayTimeline01Title",
    detail: "forceOverlayTimeline01Detail",
  },
  {
    title: "forceOverlayTimeline02Title",
    detail: "forceOverlayTimeline02Detail",
  },
  {
    title: "forceOverlayTimeline03Title",
    detail: "forceOverlayTimeline03Detail",
  },
];

const HEADER_SKELETON_TEXT = {
  title: skeletonForceOverlaySkeletonText[HEADER_TEXT_IDS.title]!,
  meta: skeletonForceOverlaySkeletonText[HEADER_TEXT_IDS.meta]!,
};

const SUMMARY_SKELETON_TEXT: Array<{
  label: GeneratedSkeletonTextState;
  value: GeneratedSkeletonTextState;
}> = SUMMARY_TEXT_IDS.map((textIds) => ({
  label: skeletonForceOverlaySkeletonText[textIds.label]!,
  value: skeletonForceOverlaySkeletonText[textIds.value]!,
}));

const TIMELINE_SKELETON_TEXT: Array<{
  detail: GeneratedSkeletonTextState;
  title: GeneratedSkeletonTextState;
}> = TIMELINE_TEXT_IDS.map((textIds) => ({
  detail: skeletonForceOverlaySkeletonText[textIds.detail]!,
  title: skeletonForceOverlaySkeletonText[textIds.title]!,
}));

const SUMMARY_ITEMS: SummaryItem[] = [
  {
    label: "Lorem",
    tone: "rgba(var(--rmg-logo-cyan-rgb), 0.24)",
    value: "84",
  },
  {
    label: "Ipsum",
    tone: "rgba(var(--rmg-logo-lavender-rgb), 0.2)",
    value: "32",
  },
  {
    label: "Dolor",
    tone: "rgba(var(--rmg-logo-magenta-rgb), 0.18)",
    value: "18",
  },
];

const TIMELINE_ITEMS: TimelineItem[] = [
  {
    detail:
      "Dolor sit amet consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    textIds: TIMELINE_TEXT_IDS[0]!,
    title: "Lorem ipsum dolor sit amet consectetur",
  },
  {
    detail:
      "Consectetur elit sed do eiusmod tempor incididunt ut labore, dolore magna aliqua, and ullamco laboris nisi.",
    textIds: TIMELINE_TEXT_IDS[1]!,
    title: "Sed eiusmod tempor incididunt labore",
  },
  {
    detail:
      "Tempor incididunt ut labore et dolore magna aliqua, ut enim ad minim veniam quis nostrud exercitation.",
    textIds: TIMELINE_TEXT_IDS[2]!,
    title: "Magna aliqua minim veniam quis nostrud",
  },
];

const FORCE_OVERLAY_LAYOUT: SkeletonNode = {
  kind: "col",
  style: {
    gap: 16,
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    border: "1px solid rgba(15, 23, 42, 0.08)",
    boxShadow: "0 18px 42px rgba(15, 23, 42, 0.08)",
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
            gap: 8,
            flex: "1 1 220px",
            minWidth: 0,
          },
          children: [
            {
              kind: "text",
              barHeight: 20,
              lineHeight: 1.2,
              ...HEADER_SKELETON_TEXT.title,
            },
            {
              kind: "text",
              barHeight: 12,
              lineHeight: 1.35,
              ...HEADER_SKELETON_TEXT.meta,
            },
          ],
        },
        {
          kind: "row",
          style: {
            gap: 8,
            flexShrink: 0,
          },
          children: [
            {
              kind: "rect",
              style: {
                width: 72,
                height: 30,
                borderRadius: 999,
              },
            },
            {
              kind: "rect",
              style: {
                width: 44,
                height: 30,
                borderRadius: 999,
              },
            },
          ],
        },
      ],
    },
    {
      kind: "row",
      style: {
        gap: 12,
        flexWrap: "wrap",
      },
      children: SUMMARY_ITEMS.map((item, index) => {
        const skeletonText =
          SUMMARY_SKELETON_TEXT[index] ?? SUMMARY_SKELETON_TEXT[0]!;

        return {
          kind: "col" as const,
          style: {
            flex: "1 1 150px",
            minWidth: 0,
            minHeight: 92,
            gap: 10,
            justifyContent: "space-between",
            padding: 14,
            borderRadius: 14,
            backgroundColor: item.tone,
          },
          children: [
            {
              kind: "text" as const,
              barHeight: 12,
              lineHeight: 1.2,
              ...skeletonText.label,
            },
            {
              kind: "text" as const,
              barHeight: 34,
              lineHeight: 1,
              ...skeletonText.value,
            },
          ],
        };
      }),
    },
    {
      kind: "col",
      style: {
        gap: 10,
      },
      children: TIMELINE_ITEMS.map((_, index) => {
        const skeletonText =
          TIMELINE_SKELETON_TEXT[index] ?? TIMELINE_SKELETON_TEXT[0]!;

        return {
          kind: "row" as const,
          style: {
            gap: 12,
            alignItems: "center",
            padding: 12,
            borderRadius: 14,
            backgroundColor: "#f8fafc",
          },
          children: [
            {
              kind: "circle" as const,
              style: {
                width: 34,
                height: 34,
                flexShrink: 0,
              },
            },
            {
              kind: "col" as const,
              style: {
                flex: "1 1 auto",
                minWidth: 0,
                gap: 4,
              },
              children: [
                {
                  kind: "text" as const,
                  barHeight: 13,
                  lineHeight: 1.2,
                  ...skeletonText.title,
                },
                {
                  kind: "text" as const,
                  barHeight: 12,
                  lineHeight: 1.2,
                  ...skeletonText.detail,
                },
              ],
            },
          ],
        };
      }),
    },
  ],
};

export function SkeletonForceOverlayDemo() {
  const searchParams = useSearchParams();
  const showMeasuredContent = searchParams.get("skeletonMeasure") === "content";

  return (
    <div className={styles.shell}>
      <Skeleton
        cache={demoSkeletonCache("skeleton-force-overlay")}
        layout={FORCE_OVERLAY_LAYOUT}
        ready={true}
        enabled={!showMeasuredContent}
        force={
          showMeasuredContent
            ? undefined
            : {
                showContent: true,
                skeletonOpacity: 0.5,
              }
        }
        shellClassName={styles.stage}
        className={styles.skeleton}
        backgroundColor="rgba(var(--rmg-logo-blue-rgb), 0.24)"
        radius={12}
        disableShimmer
      >
        <section className={styles.panel}>
          <header className={styles.panelHeader}>
            <div className={styles.headerCopy}>
              <h2 data-skeleton-text-id={HEADER_TEXT_IDS.title}>
                Lorem ipsum status
              </h2>
              <p data-skeleton-text-id={HEADER_TEXT_IDS.meta}>
                Consectetur adipiscing elit sed do eiusmod
              </p>
            </div>
            <div className={styles.headerActions}>
              <button type="button">Lorem</button>
              <button type="button" aria-label="Dolor sit" />
            </div>
          </header>
          <div className={styles.summaryGrid}>
            {SUMMARY_ITEMS.map((item, index) => {
              const textIds = SUMMARY_TEXT_IDS[index] ?? SUMMARY_TEXT_IDS[0]!;

              return (
                <article
                  className={styles.summaryCard}
                  style={{ backgroundColor: item.tone }}
                  key={item.label}
                >
                  <span data-skeleton-text-id={textIds.label}>
                    {item.label}
                  </span>
                  <strong data-skeleton-text-id={textIds.value}>
                    {item.value}
                  </strong>
                </article>
              );
            })}
          </div>
          <div className={styles.timeline}>
            {TIMELINE_ITEMS.map((item) => (
              <article className={styles.timelineRow} key={item.title}>
                <span className={styles.timelineIcon} />
                <p>
                  <strong data-skeleton-text-id={item.textIds.title}>
                    {item.title}
                  </strong>
                  <span data-skeleton-text-id={item.textIds.detail}>
                    {item.detail}
                  </span>
                </p>
              </article>
            ))}
          </div>
        </section>
      </Skeleton>
    </div>
  );
}
