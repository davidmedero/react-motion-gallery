export const source = String.raw`/* eslint-disable @next/next/no-img-element */
'use client';

import * as React from "react";
import {
  GalleryCore,
  Video,
  toMediaItems,
  useFullscreenController,
  useGalleryCore,
} from "../../../../../../packages/react-motion-gallery/src";
import { fullscreenSlider } from "../../../../../../packages/react-motion-gallery/src/fullscreen-slider";
import { fullscreenZoomPan } from "../../../../../../packages/react-motion-gallery/src/fullscreen-zoom-pan";
import { fullscreenVideo } from "../../../../../../packages/react-motion-gallery/src/fullscreen-video";
import styles from "./fullscreen-layout-agnostic-demo.module.css";

type ScenarioKind = "article" | "figure" | "posterVideo" | "videoCard";

type VideoAsset = {
  src: string;
  poster: string;
  alt: string;
};

type Scenario = {
  kind: ScenarioKind;
  eyebrow: string;
  title: string;
  body: string;
  previewSrc: string;
  video?: VideoAsset;
};

const POSTER_VIDEO: VideoAsset = {
  src: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html/12354535_1920_1080_30fps.mp4",
  poster:
    "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html-loop/12354535_1920_1080_30fps-0.jpg",
  alt: "Sed ut perspiciatis unde",
};

const INLINE_VIDEO: VideoAsset = {
  src: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html/4151824-uhd_3840_2160_25fps.mp4",
  poster:
    "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html-loop/4151824-uhd_3840_2160_25fps-0.jpg",
  alt: "Nemo enim ipsam voluptatem",
};

const INLINE_VIDEO_OPTIONS = {
  ratio: "16:9",
  controls: ["play-large", "play", "progress", "current-time", "mute", "volume", "fullscreen"],
};

const SCENARIOS: Scenario[] = [
  {
    kind: "article",
    eyebrow: "Lorem",
    title: "Lorem ipsum dolor sit amet",
    body: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    previewSrc: "https://picsum.photos/id/938/1200/900",
  },
  {
    kind: "figure",
    eyebrow: "Ipsum",
    title: "Ut enim ad minim veniam",
    body: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    previewSrc: "https://picsum.photos/id/944/1200/900",
  },
  {
    kind: "posterVideo",
    eyebrow: "Dolor",
    title: "Duis aute irure dolor",
    body: "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    previewSrc: POSTER_VIDEO.poster,
    video: POSTER_VIDEO,
  },
  {
    kind: "videoCard",
    eyebrow: "Amet",
    title: "Excepteur sint occaecat",
    body: "Cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    previewSrc: INLINE_VIDEO.poster,
    video: INLINE_VIDEO,
  },
];

const FULLSCREEN_MEDIA = toMediaItems([
  {
    src: "https://picsum.photos/id/938/2400/1800",
    alt: "Lorem ipsum dolor sit amet",
  },
  {
    src: "https://picsum.photos/id/944/2400/1800",
    alt: "Ut enim ad minim veniam",
  },
  POSTER_VIDEO,
  INLINE_VIDEO,
]);

type FullscreenTargetEvent =
  | React.MouseEvent<HTMLElement>
  | React.KeyboardEvent<HTMLElement>;

function FullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
    plugins: [fullscreenSlider(), fullscreenVideo(), fullscreenZoomPan()],
    fullscreen: {
      enabled: true,
    },
  });

  return <>{fullscreenNode}</>;
}

function useApiOpen(index: number) {
  const core = useGalleryCore();

  return React.useCallback(
    (event: FullscreenTargetEvent) => {
      core.openFullscreenAt({
        index,
        event: event.nativeEvent as Event,
      });
    },
    [core, index]
  );
}

function createKeyHandler(open: (event: FullscreenTargetEvent) => void) {
  return (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    open(event);
  };
}

function MediaFullscreenTrigger(props: {
  label: string;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
}) {
  const { label, onClick } = props;

  return (
    <button
      type="button"
      className={styles.mediaTrigger}
      onClick={onClick}
      aria-label={label}
    >
      <img
        src="/open-fullscreen.png"
        alt=""
        width="24"
        height="24"
        className={styles.mediaTriggerIcon}
      />
    </button>
  );
}

function ScenarioTile(props: {
  scenario: Scenario;
  index: number;
}) {
  const { scenario, index } = props;
  const open = useApiOpen(index);
  const onKeyDown = createKeyHandler(open);

  if (scenario.kind === "posterVideo") {
    return (
      <button type="button" className={styles.posterVideoTile} onClick={open}>
        <span className={styles.mediaFrame}>
          <img src={scenario.previewSrc} alt={scenario.title} className={styles.media} />
          <span className={styles.playButton} aria-hidden="true">
            <span className={styles.playGlyph} />
          </span>
        </span>
        <span className={styles.copy}>
          <span className={styles.eyebrow}>{scenario.eyebrow}</span>
          <strong className={styles.title}>{scenario.title}</strong>
          <span className={styles.body}>{scenario.body}</span>
        </span>
      </button>
    );
  }

  if (scenario.kind === "videoCard" && scenario.video) {
    return (
      <section className={styles.videoCardTile}>
        <div className={styles.mediaFrame}>
          <Video
            src={scenario.video.src}
            poster={scenario.video.poster}
            alt={scenario.video.alt}
            className={styles.inlineVideo}
            options={INLINE_VIDEO_OPTIONS}
          />
          <MediaFullscreenTrigger
            label={\`Open \${scenario.title} in fullscreen\`}
            onClick={open}
          />
        </div>
        <div className={styles.surfaceCopy}>
          <div className={styles.copyContainer}>
            <span className={styles.eyebrow}>{scenario.eyebrow}</span>
            <strong className={styles.title}>{scenario.title}</strong>
            <p className={styles.body}>{scenario.body}</p>
          </div>
          <button type="button" className={styles.inlineAction} onClick={open}>
            Open fullscreen
          </button>
        </div>
      </section>
    );
  }

  if (scenario.kind === "figure") {
    return (
      <figure className={styles.figureTile}>
        <div className={styles.mediaFrame}>
          <img src={scenario.previewSrc} alt={scenario.title} className={styles.media} onClick={open} />
        </div>
        <figcaption className={styles.surfaceCopy}>
          <div className={styles.copyContainer}>
            <span className={styles.eyebrow}>{scenario.eyebrow}</span>
            <strong className={styles.title}>{scenario.title}</strong>
            <span className={styles.body}>{scenario.body}</span>
          </div>
          <button type="button" className={styles.inlineAction} onClick={open}>
            Open fullscreen
          </button>
        </figcaption>
      </figure>
    );
  }

  return (
    <article
      className={styles.articleTile}
      onClick={open}
      onKeyDown={onKeyDown}
      role="button"
      tabIndex={0}
      aria-label={\`Open \${scenario.title} in fullscreen\`}
    >
      <div className={styles.mediaWrapper}>
        <img src={scenario.previewSrc} alt={scenario.title} className={styles.media} />
      </div>
      <div className={styles.copy}>
        <span className={styles.eyebrow}>{scenario.eyebrow}</span>
        <strong className={styles.title}>{scenario.title}</strong>
        <p className={styles.body}>{scenario.body}</p>
      </div>
    </article>
  );
}

export function FullscreenLayoutAgnosticDemo() {
  return (
    <div className={styles.shell}>
      <GalleryCore fullscreenItems={FULLSCREEN_MEDIA}>
        <div className={styles.grid}>
          {SCENARIOS.map((scenario, index) => (
            <ScenarioTile key={scenario.title} scenario={scenario} index={index} />
          ))}
        </div>
        <FullscreenAddon />
      </GalleryCore>
    </div>
  );
}
`;
