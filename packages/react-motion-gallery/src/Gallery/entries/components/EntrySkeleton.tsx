import * as React from "react";
import styles from "../../index.module.css";

export function EntrySkeletonCard() {
  return (
    <article className={styles.entrySkeletonCard}>
      <div className={styles.entrySkeletonHeader}>
        <div className={`${styles.entrySkeletonAvatar} ${styles.entrySkeletonShimmer}`} />
        <div className={styles.entrySkeletonLines}>
          <div className={`${styles.entrySkeletonLineShort} ${styles.entrySkeletonShimmer}`} />
          <div className={`${styles.entrySkeletonLineLong} ${styles.entrySkeletonShimmer}`} />
        </div>
      </div>

      <div className={styles.entrySkeletonBody}>
        <div className={`${styles.entrySkeletonLineLong} ${styles.entrySkeletonShimmer}`} />
        <div className={`${styles.entrySkeletonLineMedium} ${styles.entrySkeletonShimmer}`} />
      </div>

      <div className={`${styles.entrySkeletonMedia} ${styles.entrySkeletonShimmer}`} />
    </article>
  );
}