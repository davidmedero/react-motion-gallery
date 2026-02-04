import * as React from "react";
import styles from "../../styles.module.css";

export type EntrySkeletonSpec = {
  header?: {
    showAvatar?: boolean;
    lines?: Array<"short" | "medium" | "long">;
  };
  body?: {
    lines?: Array<"short" | "medium" | "long">;
  };
  media?: {
    // number of media placeholders
    count?: number;

    // layout
    columns?: number;
    gapPx?: number;

    // ✅ fixed, SSR-known height (recommended for Entries)
    heightPx?: number;
  };
};

function Line({ kind }: { kind: "short" | "medium" | "long" }) {
  const cls =
    kind === "short"
      ? styles.entrySkeletonLineShort
      : kind === "medium"
      ? styles.entrySkeletonLineMedium
      : styles.entrySkeletonLineLong;

  return <div className={`${cls} ${styles.entrySkeletonShimmer}`} />;
}

export function EntrySkeletonCard({ spec }: { spec?: EntrySkeletonSpec }) {
  const s: EntrySkeletonSpec = spec ?? {
    header: { showAvatar: true, lines: ["short", "long"] },
    body: { lines: ["long", "medium"] },
    media: {
      count: 1,
      columns: 1,
      gapPx: 10,
      heightPx: 260, // ✅ sensible default for Entries rows
    },
  };

  const headerLines = s.header?.lines ?? [];
  const bodyLines = s.body?.lines ?? [];

  const mediaCount = Math.max(0, s.media?.count ?? 0);
  const cols = Math.max(1, s.media?.columns ?? 1);
  const gap = s.media?.gapPx ?? 10;
  const heightPx = s.media?.heightPx ?? 260;

  // distribute items across columns
  const columns: number[][] = Array.from({ length: cols }, () => []);
  for (let i = 0; i < mediaCount; i++) {
    columns[i % cols].push(i);
  }

  return (
    <article className={styles.entrySkeletonCard}>
      {(s.header?.showAvatar || headerLines.length) && (
        <div className={styles.entrySkeletonHeader}>
          {s.header?.showAvatar ? (
            <div className={`${styles.entrySkeletonAvatar} ${styles.entrySkeletonShimmer}`} />
          ) : null}

          {headerLines.length ? (
            <div className={styles.entrySkeletonLines}>
              {headerLines.map((k, idx) => (
                <Line key={idx} kind={k} />
              ))}
            </div>
          ) : null}
        </div>
      )}

      {bodyLines.length ? (
        <div className={styles.entrySkeletonBody}>
          {bodyLines.map((k, idx) => (
            <Line key={idx} kind={k} />
          ))}
        </div>
      ) : null}

      {mediaCount > 0 ? (
        <div
          className={styles.entrySkeletonMediaGrid}
          style={{ display: "flex", columnGap: gap }}
        >
          {columns.map((colItems, colIdx) => (
            <div
              key={colIdx}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                rowGap: gap,
              }}
            >
              {colItems.map((i) => (
                <div
                  key={i}
                  className={`${styles.entrySkeletonMedia} ${styles.entrySkeletonShimmer}`}
                  style={{ height: heightPx }}
                />
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}