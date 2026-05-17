export const source = `'use client';

import * as React from "react";
import {
  Skeleton,
  type SkeletonNode,
} from "react-motion-gallery/skeleton/base";
import styles from "./skeleton-app-shell-demo.module.css";
import { demoSkeletonCache } from "../../skeleton-cache";

type NavItem = {
  color?: string;
  label: string;
  width: string;
};

type Metric = {
  label: string;
  labelWidth: string;
  value: string;
  valueHeight: number;
  valueTone?: string;
};

type Activity = {
  detail: string;
  lineWidth: string;
  title: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Lorem ipsum", width: "82%" },
  {
    color: "rgba(var(--rmg-logo-cyan-rgb), 0.28)",
    label: "Dolor sit",
    width: "64%",
  },
  { label: "Amet elit", width: "64%" },
  { label: "Consectetur", width: "82%" },
  { label: "Adipiscing", width: "64%" },
  { label: "Eiusmod", width: "64%" },
  { label: "Tempor amet", width: "82%" },
];

const METRICS: Metric[] = [
  { label: "Lorem", labelWidth: "36%", value: "Ipsum", valueHeight: 34 },
  { label: "Dolor", labelWidth: "48%", value: "Amet", valueHeight: 34 },
  {
    label: "Elit",
    labelWidth: "48%",
    value: "Magna",
    valueHeight: 34,
    valueTone: "rgba(var(--rmg-logo-magenta-rgb), 0.16)",
  },
  { label: "Tempor", labelWidth: "48%", value: "Sed", valueHeight: 34 },
];

const ACTIVITY: Activity[] = [
  { detail: "Dolor sit", lineWidth: "68%", title: "Lorem ipsum" },
  { detail: "Amet elit", lineWidth: "52%", title: "Consectetur" },
  { detail: "Adipiscing", lineWidth: "68%", title: "Sed eiusmod" },
  { detail: "Tempor amet", lineWidth: "52%", title: "Magna aliqua" },
  { detail: "Ut enim", lineWidth: "68%", title: "Minim veniam" },
];

const SIDEBAR_ITEMS: SkeletonNode = {
  kind: "col",
  style: {
    gap: 10,
  },
  children: NAV_ITEMS.map((item) => ({
    kind: "row" as const,
    style: {
      gap: 10,
      alignItems: "center",
    },
    children: [
      {
        kind: "circle" as const,
        style: {
          width: 28,
          height: 28,
          flexShrink: 0,
          backgroundColor: item.color,
        },
      },
      {
        kind: "text" as const,
        barHeight: 12,
        lineHeight: 1.3,
        barWidth: item.width,
        style: {
          flex: "1 1 auto",
        },
      },
    ],
  })),
};

const APP_SHELL_LAYOUT: SkeletonNode = {
  kind: "col",
  style: {
    minHeight: 520,
    overflow: "hidden",
    borderRadius: 22,
    backgroundColor: "#f8fafc",
    border: "1px solid rgba(15, 23, 42, 0.1)",
  },
  children: [
    {
      kind: "row",
      style: {
        gap: 16,
        padding: "18px 20px",
        alignItems: "center",
        justifyContent: "space-between",
        border: "0 solid rgba(15, 23, 42, 0.08)",
        backgroundColor: "#ffffff",
      },
      children: [
        {
          kind: "row",
          style: {
            gap: 12,
            alignItems: "center",
            flex: "1 1 auto",
          },
          children: [
            {
              kind: "circle",
              style: {
                width: 40,
                height: 40,
                flexShrink: 0,
                backgroundColor: "rgba(var(--rmg-logo-cyan-rgb), 0.26)",
              },
            },
            {
              kind: "col",
              style: {
                gap: 7,
                flex: "1 1 auto",
                maxWidth: 260,
              },
              children: [
                {
                  kind: "text",
                  barHeight: 14,
                  lineHeight: 1.25,
                  barWidth: "74%",
                },
                {
                  kind: "text",
                  barHeight: 11,
                  lineHeight: 1.25,
                  barWidth: "46%",
                },
              ],
            },
          ],
        },
        {
          kind: "media",
          count: 3,
          direction: "row",
          style: {
            gap: 8,
            flexShrink: 0,
          },
          tile: {
            shape: "circle",
            style: {
              width: 34,
              height: 34,
            },
          },
        },
      ],
    },
    {
      kind: "row",
      style: {
        alignItems: "stretch",
        flex: "1 1 auto",
        minHeight: 0,
        flexWrap: "wrap",
      },
      children: [
        {
          kind: "col",
          style: {
            flex: "0 0 220px",
            minWidth: 190,
            padding: 18,
            gap: 18,
            backgroundColor: "#f1f5f9",
            border: "0 solid rgba(15, 23, 42, 0.08)",
          },
          children: [
            {
              kind: "text",
              barHeight: 12,
              lineHeight: 1.35,
              barWidth: "42%",
            },
            SIDEBAR_ITEMS,
          ],
        },
        {
          kind: "col",
          style: {
            flex: "1 1 420px",
            minWidth: 0,
            padding: 18,
            gap: 16,
          },
          children: [
            {
              kind: "row",
              style: {
                flexWrap: "wrap",
                gap: 12,
              },
              children: METRICS.map((metric) => ({
                kind: "col" as const,
                style: {
                  flex: "1 1 150px",
                  minWidth: 0,
                  padding: 14,
                  gap: 11,
                  borderRadius: 16,
                  backgroundColor: "#ffffff",
                  border: "1px solid rgba(15, 23, 42, 0.08)",
                },
                children: [
                  {
                    kind: "text" as const,
                    barHeight: 11,
                    lineHeight: 1.2,
                    barWidth: metric.labelWidth,
                  },
                  {
                    kind: "rect" as const,
                    style: {
                      height: metric.valueHeight,
                      borderRadius: 12,
                      backgroundColor: metric.valueTone,
                    },
                  },
                ],
              })),
            },
            {
              kind: "row",
              style: {
                flexWrap: "wrap",
                gap: 16,
                alignItems: "stretch",
              },
              children: [
                {
                  kind: "col",
                  style: {
                    flex: "2 1 330px",
                    minWidth: 0,
                    padding: 16,
                    gap: 14,
                    borderRadius: 18,
                    backgroundColor: "#ffffff",
                    border: "1px solid rgba(15, 23, 42, 0.08)",
                  },
                  children: [
                    {
                      kind: "row",
                      style: {
                        justifyContent: "space-between",
                        gap: 16,
                        alignItems: "center",
                      },
                      children: [
                        {
                          kind: "text",
                          barHeight: 14,
                          lineHeight: 1.2,
                          barWidth: "42%",
                          style: {
                            flex: "1 1 auto",
                          },
                        },
                        {
                          kind: "rect",
                          style: {
                            width: 86,
                            height: 28,
                            borderRadius: 999,
                            flexShrink: 0,
                          },
                        },
                      ],
                    },
                    {
                      kind: "row",
                      style: {
                        height: 210,
                        gap: 10,
                        alignItems: "flex-end",
                        padding: 16,
                        borderRadius: 16,
                        backgroundColor: "rgba(var(--rmg-logo-cyan-rgb), 0.14)",
                      },
                      children: [44, 62, 48, 78, 58].map((height) => ({
                        kind: "rect" as const,
                        style: {
                          flex: "1 1 0",
                          height: \`\${height}%\`,
                          borderRadius: "999px 999px 8px 8px",
                          backgroundColor:
                            "rgba(var(--rmg-logo-magenta-rgb), 0.36)",
                        },
                      })),
                    },
                  ],
                },
                {
                  kind: "col",
                  style: {
                    flex: "1 1 220px",
                    minWidth: 0,
                    padding: 16,
                    gap: 12,
                    borderRadius: 18,
                    backgroundColor: "#ffffff",
                    border: "1px solid rgba(15, 23, 42, 0.08)",
                  },
                  children: ACTIVITY.map((item) => ({
                    kind: "row" as const,
                    style: {
                      gap: 10,
                      alignItems: "center",
                    },
                    children: [
                      {
                        kind: "rect" as const,
                        style: {
                          width: 42,
                          height: 42,
                          borderRadius: 12,
                          flexShrink: 0,
                        },
                      },
                      {
                        kind: "text" as const,
                        barHeight: 12,
                        lineHeight: 1.38,
                        lines: 2,
                        barWidth: ["100%", item.lineWidth],
                        style: {
                          flex: "1 1 auto",
                        },
                      },
                    ],
                  })),
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

function useMockDashboardData() {
  const [dashboardReady, setDashboardReady] = React.useState(false);

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDashboardReady(true);
    }, 1050);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  return dashboardReady;
}

export function SkeletonAppShellDemo() {
  const dashboardReady = useMockDashboardData();

  return (
    <div className={styles.shell}>
      <Skeleton
        cache={demoSkeletonCache("skeleton-app-shell")}
        layout={APP_SHELL_LAYOUT}
        ready={dashboardReady}
        shellClassName={styles.stage}
        className={styles.skeleton}
        backgroundColor="rgba(var(--rmg-logo-blue-rgb), 0.24)"
        radius={12}
        timing={{ exitMs: 520 }}
        ariaLabel={dashboardReady ? undefined : "Loading lorem ipsum shell"}
      >
        <section className={styles.appFrame}>
          <header className={styles.appHeader}>
            <div className={styles.brandCluster}>
              <div className={styles.brandMark}>LI</div>
              <div className={styles.brandCopy}>
                <strong>Lorem Ipsum</strong>
                <span>Dolor sit</span>
              </div>
            </div>
            <div className={styles.avatarGroup} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </header>
          <div className={styles.appBody}>
            <aside className={styles.sidebar}>
              <p className={styles.sidebarLabel}>Lorem</p>
              <nav className={styles.navList} aria-label="Lorem ipsum">
                {NAV_ITEMS.map((item) => (
                  <span className={styles.navItem} key={item.label}>
                    <span
                      className={styles.navIcon}
                      style={{ backgroundColor: item.color }}
                    />
                    <span
                      className={styles.navText}
                      style={
                        {
                          "--nav-width": item.width,
                        } as React.CSSProperties
                      }
                    >
                      {item.label}
                    </span>
                  </span>
                ))}
              </nav>
            </aside>
            <main className={styles.mainPanel}>
              <div className={styles.metricGrid}>
                {METRICS.map((metric) => (
                  <article className={styles.metricCard} key={metric.label}>
                    <span
                      className={styles.metricLabel}
                      style={
                        {
                          "--label-width": metric.labelWidth,
                        } as React.CSSProperties
                      }
                    >
                      {metric.label}
                    </span>
                    <strong
                      className={styles.metricValue}
                      style={{
                        backgroundColor: metric.valueTone,
                        height: metric.valueHeight,
                      }}
                    >
                      {metric.value}
                    </strong>
                  </article>
                ))}
              </div>
              <div className={styles.detailGrid}>
                <article className={styles.chartCard}>
                  <div className={styles.chartHeader}>
                    <h3>Lorem ipsum</h3>
                    <span>Dolor</span>
                  </div>
                  <div className={styles.chartPanel} aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                </article>
                <article className={styles.activityCard}>
                  {ACTIVITY.map((item) => (
                    <div className={styles.activityRow} key={item.title}>
                      <span className={styles.activityIcon} />
                      <p className={styles.activityCopy}>
                        <span>{item.title}</span>
                        <span
                          style={
                            {
                              "--activity-line-width": item.lineWidth,
                            } as React.CSSProperties
                          }
                        >
                          {item.detail}
                        </span>
                      </p>
                    </div>
                  ))}
                </article>
              </div>
            </main>
          </div>
        </section>
      </Skeleton>
    </div>
  );
}`;
