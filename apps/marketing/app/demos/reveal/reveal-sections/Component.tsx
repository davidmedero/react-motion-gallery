'use client';

import { RotateCcw, Sparkles } from "lucide-react";
import { useState } from "react";
import { Reveal } from "react-motion-gallery/reveal";
import styles from "./reveal-sections-demo.module.css";

const SUMMARY_CARDS = [
  {
    label: "Editorial launch",
    value: "18 sections",
    detail: "Sequential story blocks with a measured cadence.",
    tone: "cyan",
  },
  {
    label: "Dashboard refresh",
    value: "42 panels",
    detail: "Dense UI entering without layout shifts.",
    tone: "green",
  },
  {
    label: "Product gallery",
    value: "9 surfaces",
    detail: "Cards, media, and calls to action sharing one rhythm.",
    tone: "magenta",
  },
] as const;

const TIMELINE = [
  "SSR content paints in its final layout.",
  "The client takes ownership after hydration.",
  "Visible sections reveal once their observer enters view.",
] as const;

export function RevealSectionsDemo() {
  const [runId, setRunId] = useState(0);

  return (
    <section className={styles.shell} aria-labelledby="reveal-sections-title">
      <div className={styles.toolbar}>
        <span className={styles.badge}>
          <Sparkles size={15} strokeWidth={2.2} aria-hidden />
          Reveal
        </span>
        <button
          type="button"
          className={styles.resetButton}
          onClick={() => setRunId((value) => value + 1)}
        >
          <RotateCcw size={15} strokeWidth={2.2} aria-hidden />
          Replay
        </button>
      </div>

      <div className={styles.stage} key={runId}>
        <Reveal
          as="header"
          className={styles.header}
          transform={{ y: 18, scale: 0.98 }}
          opacityDurationMs={260}
          transformDurationMs={760}
        >
          <span>Standalone primitive</span>
          <h2 id="reveal-sections-title">Reveal sections without implying loading.</h2>
          <p>
            Fade-only and transform reveals keep ordinary application content visible,
            accessible, ready for SSR, and tuned with separate opacity and transform timing.
          </p>
        </Reveal>

        <div className={styles.summaryGrid}>
          {SUMMARY_CARDS.map((card, index) => (
            <Reveal
              as="article"
              className={styles.summaryCard}
              data-tone={card.tone}
              key={card.label}
              staggerIndex={index}
              opacityDurationMs={220}
              transformDurationMs={680}
              transform={{
                y: 20,
                rotate: index === 1 ? 0 : index === 0 ? -1.4 : 1.4,
                scale: 0.96,
              }}
            >
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <p>{card.detail}</p>
            </Reveal>
          ))}
        </div>

        <div className={styles.timeline} role="list">
          {TIMELINE.map((item, index) => (
            <Reveal
              as="div"
              className={styles.timelineItem}
              key={item}
              role="listitem"
              variant={index === 0 ? "fade" : "transform"}
              staggerIndex={index}
              rootMargin="0px"
              opacityDurationMs={index === 0 ? 300 : 220}
              transformDurationMs={620}
              transform={{ x: -18 }}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{item}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
