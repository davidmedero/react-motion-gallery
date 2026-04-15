export const source = String.raw`"use client";

import * as React from "react";
import {
  GalleryCore,
  Video,
  toMediaItems,
  useFullscreenController,
  useGalleryCore,
} from "react-motion-gallery";
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
  alt: "Forest canopies moving in the wind",
};

const INLINE_VIDEO: VideoAsset = {
  src: "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html/4151824-uhd_3840_2160_25fps.mp4",
  poster:
    "https://pub-139e4c18b4ce45638dd0349fdde9389c.r2.dev/slider-html-loop/4151824-uhd_3840_2160_25fps-0.jpg",
  alt: "Ocean water moving across a rocky shoreline",
};

const INLINE_VIDEO_OPTIONS = {
  ratio: "16:9",
  controls: ["play-large", "play", "progress", "current-time", "mute", "volume", "fullscreen"],
};

const SCENARIOS: Scenario[] = [
  {
    kind: "article",
    eyebrow: "Article Root",
    title: "Editorial card opens from the outer article",
    body: "The whole article is the trigger, but the fullscreen intro still scales from the image.",
    previewSrc: "https://picsum.photos/id/1025/1200/900",
  },
  {
    kind: "figure",
    eyebrow: "Figure + CTA",
    title: "Image-level triggers can open fullscreen directly",
    body: "The caption CTA still works, but the media now carries its own fullscreen trigger so the launch point stays obvious.",
    previewSrc: "https://picsum.photos/id/1035/1200/900",
  },
  {
    kind: "posterVideo",
    eyebrow: "Poster Surface",
    title: "A poster card can open a fullscreen Plyr video",
    body: "This tile stays a static image with a CSS play affordance, while fullscreen swaps to the live player.",
    previewSrc: POSTER_VIDEO.poster,
    video: POSTER_VIDEO,
  },
  {
    kind: "videoCard",
    eyebrow: "Video Component",
    title: "The base card can render our Video component inline",
    body: "The surface uses the real player in-place and a separate trigger can lift the same source into fullscreen.",
    previewSrc: INLINE_VIDEO.poster,
    video: INLINE_VIDEO,
  },
];

const FULLSCREEN_MEDIA = toMediaItems([
  {
    src: "https://picsum.photos/id/1025/2400/1800",
    alt: "Editorial image of a dog looking over the water",
  },
  {
    src: "https://picsum.photos/id/1035/2400/1800",
    alt: "Landscape image with mountains and sky",
  },
  POSTER_VIDEO,
  INLINE_VIDEO,
]);

type FullscreenTargetEvent =
  | React.MouseEvent<HTMLElement>
  | React.KeyboardEvent<HTMLElement>;

function FullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
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
          <span className={styles.videoBadge}>Fullscreen Plyr</span>
        </span>
        <span className={styles.surfaceCopy}>
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
          <span className={styles.eyebrow}>{scenario.eyebrow}</span>
          <strong className={styles.title}>{scenario.title}</strong>
          <p className={styles.body}>{scenario.body}</p>
        </div>
      </section>
    );
  }

  if (scenario.kind === "figure") {
    return (
      <figure className={styles.figureTile}>
        <div className={styles.mediaFrame}>
          <img src={scenario.previewSrc} alt={scenario.title} className={styles.media} />
          <MediaFullscreenTrigger
            label={\`Open \${scenario.title} in fullscreen\`}
            onClick={open}
          />
        </div>
        <figcaption className={styles.surfaceCopy}>
          <span className={styles.eyebrow}>{scenario.eyebrow}</span>
          <strong className={styles.title}>{scenario.title}</strong>
          <span className={styles.body}>{scenario.body}</span>
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
      <img src={scenario.previewSrc} alt={scenario.title} className={styles.media} />
      <div className={styles.surfaceCopy}>
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
      <div className={styles.intro}>
        <span className={styles.kicker}>No Layout Prop</span>
        <h2 className={styles.heading}>GalleryCore can now drive fullscreen around arbitrary HTML.</h2>
        <p className={styles.lede}>
          Every tile below opens via <code>openFullscreenAt</code>. The wrapper elements and media
          types differ on purpose, but the launch and close paths still stay anchored to the
          matching surface.
        </p>
      </div>

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
}`;
