"use client";

import { RotateCcw, ScanSearch } from "lucide-react";
import { useState } from "react";
import { useImageDecodeReady } from "react-motion-gallery/media/ready";
import { useReveal } from "react-motion-gallery/reveal";
import styles from "./reveal-image-ready-demo.module.css";

const IMAGES = [
  {
    src: "https://picsum.photos/id/1067/1400/980",
    alt: "A mountain ridge above a lake at dusk.",
    label: "Alpine study",
    detail: "Decode the image first, then let the figure enter.",
  },
  {
    src: "https://picsum.photos/id/1039/1400/980",
    alt: "A winding road through a forest.",
    label: "Route frame",
    detail: "The reveal waits for the off-DOM image decode gate.",
  },
  {
    src: "https://picsum.photos/id/1043/1400/980",
    alt: "A coastline with cliffs and open water.",
    label: "Coast pass",
    detail: "The figure owns the hook output without an extra wrapper.",
  },
] as const;

const REVEAL_EASING = {
  opacity: "ease-out",
  transform: "cubic-bezier(0.2, 0.7, 0.2, 1)",
} as const;

function ImageReadyStage(props: { runId: number }) {
  const image = IMAGES[props.runId % IMAGES.length]!;
  const src = image.src + "?revealRun=" + props.runId;
  const decoded = useImageDecodeReady({ src, timeoutMs: 7000 });
  const reveal = useReveal<HTMLElement>({
    ready: decoded.ready,
    transform: { y: 18, scale: 0.97 },
    durationMs: { opacity: 900, transform: 720 },
    easing: REVEAL_EASING,
  });

  return (
    <div className={styles.stage}>
      <span className={styles.status} data-ready={decoded.ready ? "true" : "false"}>
        {decoded.ready ? "Decoded" : "Preparing image"}
      </span>
      <figure
        {...reveal.revealProps}
        ref={reveal.ref}
        className={`${reveal.revealProps.className} ${styles.figure}`}
        style={reveal.revealProps.style}
      >
        <img src={src} alt={image.alt} loading="eager" decoding="async" />
        <figcaption>
          <span>{image.label}</span>
          <strong>{image.detail}</strong>
        </figcaption>
      </figure>
    </div>
  );
}

export function RevealImageReadyDemo() {
  const [runId, setRunId] = useState(0);

  return (
    <section className={styles.shell} aria-labelledby="reveal-image-ready-title">
      <div className={styles.toolbar}>
        <span className={styles.badge}>
          <ScanSearch size={15} strokeWidth={2.2} aria-hidden />
          useReveal
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

      <header className={styles.header}>
        <span>Decoded media gate</span>
        <h2 id="reveal-image-ready-title">Own the figure, gate the reveal.</h2>
        <p>
          useReveal returns the ref, state, and props for custom markup while
          useImageDecodeReady supplies the ready flag.
        </p>
      </header>

      <ImageReadyStage key={runId} runId={runId} />
    </section>
  );
}
