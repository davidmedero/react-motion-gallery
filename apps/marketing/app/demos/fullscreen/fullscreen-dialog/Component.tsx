/* eslint-disable @next/next/no-img-element */
"use client";

import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { GalleryCore, useGalleryCore } from "react-motion-gallery/core";
import { toMediaItems } from "react-motion-gallery/media";
import { Slider } from "react-motion-gallery/slider";
import { sliderArrows } from "react-motion-gallery/slider/arrows";
import { sliderFullscreen } from "react-motion-gallery/slider/fullscreen";
import { sliderRipple } from "react-motion-gallery/slider/ripple";
import { useSliderReady } from "react-motion-gallery/slider/ready";
import {
  useFullscreenController,
  type FullscreenOptions,
} from "react-motion-gallery/fullscreen";
import { fullscreenCaptions } from "react-motion-gallery/fullscreen/captions";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenVideo } from "react-motion-gallery/fullscreen/video";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import { FullscreenThumbnailSlider } from "react-motion-gallery/fullscreenThumbnails";
import { SliderSkeleton } from "react-motion-gallery/skeleton/slider";
import styles from "./fullscreen-dialog-demo.module.css";

type DialogSlide =
  | {
      kind: "image";
      src: string;
      fullscreenSrc: string;
      thumbSrc: string;
      title: string;
      location: string;
      description: string;
    }
  | {
      kind: "video";
      src: string;
      fullscreenSrc: string;
      thumbSrc: string;
      title: string;
      location: string;
      description: string;
    };

const SLIDES: DialogSlide[] = [
  {
    kind: "image",
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=640&h=480&q=80",
    fullscreenSrc:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2200&h=1650&q=80",
    thumbSrc:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=220&h=160&q=80",
    title: "Lorem ipsum dolor sit",
    location: "Dolor sit",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Maecenas faucibus mollis interdum, sed posuere consectetur est at lobortis. Donec id elit non mi porta gravida at eget metus, and the shoreline keeps unfolding in quiet bands of color. Cras mattis consectetur purus sit amet fermentum, while soft paths, weathered railings, and late-afternoon shadows add more context around the frame. Vestibulum id ligula porta felis euismod semper, with enough detail to let the image breathe beyond a single sentence.",
  },
  {
    kind: "video",
    src: "https://cdn.react-motion-gallery.com/slider-html-loop/12354535_1920_1080_30fps-0.jpg",
    fullscreenSrc:
      "https://cdn.react-motion-gallery.com/slider-html/12354535_1920_1080_30fps.mp4",
    thumbSrc:
      "https://cdn.react-motion-gallery.com/slider-html-loop/12354535_1920_1080_30fps-0.jpg",
    title: "Integer posuere erat",
    location: "Video lorem",
    description:
      "Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vestibulum id ligula porta felis euismod semper.",
  },
  {
    kind: "image",
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=640&h=480&q=80",
    fullscreenSrc:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2200&h=1650&q=80",
    thumbSrc:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=220&h=160&q=80",
    title: "Consectetur adipiscing",
    location: "Amet tellus",
    description:
      "Sed posuere consectetur est at lobortis. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.",
  },
  {
    kind: "image",
    src: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=640&h=480&q=80",
    fullscreenSrc:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2200&h=1650&q=80",
    thumbSrc:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=220&h=160&q=80",
    title: "Vivamus sagittis lacus",
    location: "Ligula porta",
    description:
      "Aenean lacinia bibendum nulla sed consectetur. Donec ullamcorper nulla non metus auctor fringilla.",
  },
  {
    kind: "video",
    src: "https://cdn.react-motion-gallery.com/slider-html-loop/4151824-uhd_3840_2160_25fps-0.jpg",
    fullscreenSrc:
      "https://cdn.react-motion-gallery.com/slider-html/4151824-uhd_3840_2160_25fps.mp4",
    thumbSrc:
      "https://cdn.react-motion-gallery.com/slider-html-loop/4151824-uhd_3840_2160_25fps-0.jpg",
    title: "Curabitur blandit tempus",
    location: "Video porta",
    description:
      "Nullam quis risus eget urna mollis ornare vel eu leo. Donec ullamcorper nulla non metus auctor fringilla. Vestibulum id ligula porta felis euismod semper, while the camera lingers on the slower details between each movement. Etiam porta sem malesuada magna mollis euismod, with reflections, footsteps, and changing light carrying the scene from one moment into the next. Aenean lacinia bibendum nulla sed consectetur, and the final frames hold onto the quieter parts of the route before the motion gives way.",
  },
  {
    kind: "image",
    src: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=640&h=480&q=80",
    fullscreenSrc:
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=2200&h=1650&q=80",
    thumbSrc:
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=220&h=160&q=80",
    title: "Maecenas sed diam",
    location: "Nullam id",
    description:
      "Cras mattis consectetur purus sit amet fermentum. Etiam porta sem malesuada magna mollis euismod.",
  },
  {
    kind: "image",
    src: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=640&h=480&q=80",
    fullscreenSrc:
      "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=2200&h=1650&q=80",
    thumbSrc:
      "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=220&h=160&q=80",
    title: "Aenean eu leo quam",
    location: "Pellentesque",
    description:
      "Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Curabitur blandit tempus porttitor.",
  },
  {
    kind: "video",
    src: "https://cdn.react-motion-gallery.com/slider-html-loop/7677511-hd_1920_1080_25fps-0.jpg",
    fullscreenSrc:
      "https://cdn.react-motion-gallery.com/slider-html/7677511-hd_1920_1080_25fps.mp4",
    thumbSrc:
      "https://cdn.react-motion-gallery.com/slider-html-loop/7677511-hd_1920_1080_25fps-0.jpg",
    title: "Fusce dapibus tellus",
    location: "Video cras",
    description:
      "Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Maecenas faucibus mollis interdum. Sed posuere consectetur est at lobortis, and the frame picks up small changes in light as the scene moves. Praesent commodo cursus magna, vel scelerisque nisl consectetur et, framing a longer field note about texture, distance, and the small shifts that make the clip feel alive. Integer posuere erat a ante venenatis dapibus posuere velit aliquet, with the closing view settling into a calmer pace.",
  },
  {
    kind: "image",
    src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=640&h=480&q=80",
    fullscreenSrc:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=2200&h=1650&q=80",
    thumbSrc:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=220&h=160&q=80",
    title: "Donec sed odio dui",
    location: "Cras justo",
    description:
      "Vestibulum id ligula porta felis euismod semper. Fusce dapibus, tellus ac cursus commodo, tortor mauris.",
  },
];

function createFullscreenItem(slide: DialogSlide) {
  if (slide.kind === "video") {
    return {
      kind: "video" as const,
      src: slide.fullscreenSrc,
      poster: slide.src,
      alt: slide.title,
    };
  }

  return {
    kind: "image" as const,
    src: slide.fullscreenSrc,
    alt: slide.title,
  };
}

function SlidePreview({ slide }: { slide: DialogSlide }) {
  return (
    <div className={styles.railMediaFrame}>
      <img src={slide.src} alt={slide.title} />
      {slide.kind === "video" ? (
        <span className={styles.videoBadge}>
          <Play aria-hidden="true" />
          Video
        </span>
      ) : null}
    </div>
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
    () => 0,
  );
}

function DialogFullscreenAddon({ onOpenAll }: { onOpenAll: () => void }) {
  const [headerElement, setHeaderElement] = useState<HTMLElement | null>(null);
  const viewportWidth = useDocumentClientWidth();
  const fullscreenOptions = useMemo<FullscreenOptions>(
    () => ({
      enabled: true,
      mountStrategy: "open",
      overlaysAboveIntroMedia: false,
      effects: {
        introDuration: {
          transform: 360,
          fade: 360,
        },
      },
      dialog: {
        className: styles.fullscreenDialog,
        opacityDuration: 320,
        switchOpacityDuration: 420,
        style: {
          width: "min(calc(100vw - 48px), 1460px)",
          height: "min(calc(100dvh - 120px), 900px)",
        },
        header: {
          className: styles.fullscreenDialogHeader,
        },
        media: {
          className: styles.fullscreenDialogMedia,
        },
        caption: {
          className: styles.fullscreenDialogCaption,
        },
      },
      caption: {
        layout: "overlay",
        overlayCrossfadeTarget: "content",
        placement: {
          xs: "bottom",
          lg: "right",
        },
        width: {
          lg: "34%",
          xl: "30%",
        },
        height: {
          xs: 178,
          md: 196,
        },
        className: styles.fullscreenCaptionRoot,
        style: {
          padding: 0,
          background: "#fff",
          color: "#0f1111",
        },
        render: ({ index }) => {
          const slide = SLIDES[index];
          if (!slide) return null;

          return (
            <div className={styles.fullscreenCaption}>
              <span className={styles.fullscreenCaptionEyebrow}>
                {slide.location}
              </span>
              <strong className={styles.fullscreenCaptionTitle}>
                {slide.title}
              </strong>
              <p className={styles.fullscreenCaptionCopy}>
                {slide.description}
              </p>
            </div>
          );
        },
      },
      slider: {
        gap: {
          xs: 10,
          md: 18,
        },
      },
      video: {
        playOnOpen: true,
        playOnTransition: true,
        options: {
          crossorigin: false,
          playsinline: true,
          preload: "auto",
        },
        source: (item) => ({
          type: "video",
          poster: item.kind === "video" ? item.poster : undefined,
          sources: [
            {
              src: item.kind === "video" ? item.src : "",
              type: "video/mp4",
            },
          ],
        }),
      },
      controls: {
        close: {
          className: styles.fullscreenClose,
          render: () => <X aria-hidden="true" />,
        },
        counter: {
          enabled: false,
        },
        arrows: {
          arrow: {
            className: styles.fullscreenArrow,
          },
          prev: {
            className: styles.fullscreenArrowPrev,
          },
          next: {
            className: styles.fullscreenArrowNext,
          },
        },
      },
      closeScroll: true,
    }),
    [],
  );
  const {
    fullscreenNode,
    fullscreenThumbnailBridge,
    showFullscreenModal,
    closingModal,
    closeButtonRef,
    transitionDialogTo,
  } = useFullscreenController({
    plugins: [
      fullscreenSlider(),
      fullscreenCaptions(),
      fullscreenVideo(),
      fullscreenZoomPan({ panBounds: "media" }),
    ],
    fullscreen: fullscreenOptions,
  });
  const handleOpenAll = useCallback(() => {
    void transitionDialogTo(() => onOpenAll());
  }, [onOpenAll, transitionDialogTo]);

  useEffect(() => {
    if (!showFullscreenModal || closingModal) {
      return;
    }

    let animationFrame = 0;

    const resolveHeaderElement = () => {
      const nextHeaderElement = closeButtonRef.current?.closest(
        '[data-rmg-fs-dialog-header="true"]',
      ) as HTMLElement | null;

      setHeaderElement(nextHeaderElement);

      if (!nextHeaderElement) {
        animationFrame = window.requestAnimationFrame(resolveHeaderElement);
      }
    };

    animationFrame = window.requestAnimationFrame(resolveHeaderElement);

    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [closeButtonRef, closingModal, showFullscreenModal]);

  return (
    <>
      {fullscreenNode}
      {showFullscreenModal && !closingModal && headerElement
        ? createPortal(
            <button
              className={styles.fullscreenAllButton}
              type="button"
              onClick={handleOpenAll}
            >
              <ChevronLeft aria-hidden="true" />
              <span>See all images and videos</span>
            </button>,
            headerElement,
          )
        : null}
      <FullscreenThumbnailSlider
        bridge={fullscreenThumbnailBridge}
        items={SLIDES.map((slide, i) => ({
          thumbSrc: slide.thumbSrc,
          alt: `Thumbnail ${i + 1}`,
        }))}
        position="bottom"
        thumbnailsCenter
        thumbnailWidth={82}
        thumbnailHeight={58}
        containerClassName={styles.fullscreenThumbs}
        containerStyle={{
          width: viewportWidth || "100dvw",
          height: 88,
        }}
        thumbnailItemClassName={styles.fullscreenThumbItem}
        gap={8}
        centerActiveThumb
        showArrows
      />
    </>
  );
}

function AllImagesDialogContent({
  onOpenMedia,
}: {
  onOpenMedia: (index: number, event: Event) => void;
}) {
  return (
    <section
      className={styles.allDialogContent}
      aria-labelledby="fullscreen-dialog-all-title"
    >
      <header className={styles.allDialogHeader}>
        <div>
          <span className={styles.allDialogEyebrow}>Dialog transition</span>
          <h2 id="fullscreen-dialog-all-title">All images and videos</h2>
        </div>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec id
          elit non mi porta gravida at eget metus.
        </p>
      </header>
      <div className={styles.allDialogGrid}>
        {SLIDES.map((slide, index) => (
          <button
            key={slide.fullscreenSrc}
            className={styles.allDialogTile}
            type="button"
            onClick={(event: MouseEvent<HTMLButtonElement>) =>
              onOpenMedia(index, event.nativeEvent)
            }
          >
            <div className={styles.allDialogMediaFrame}>
              <img src={slide.src} alt={slide.title} />
              {slide.kind === "video" ? (
                <span className={styles.videoBadge}>
                  <Play aria-hidden="true" />
                  Video
                </span>
              ) : null}
            </div>
            <span className={styles.allDialogTileText}>
              <strong>{slide.title}</strong>
              <small>{slide.location}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function AllImagesDialogController({
  onOpenMedia,
  onClose,
}: {
  onOpenMedia: (index: number, event: Event) => void;
  onClose: () => void;
}) {
  const core = useGalleryCore();
  const hasRequestedOpenRef = useRef(false);
  const hasOpenedRef = useRef(false);
  const hasNotifiedCloseRef = useRef(false);
  const transitionToMediaRef =
    useRef<null | ((index: number, event: Event) => void)>(null);
  const fullscreen = useMemo<FullscreenOptions>(
    () => ({
      enabled: true,
      mountStrategy: "open",
      overlaysAboveIntroMedia: false,
      effects: {
        introFade: true,
        introDuration: {
          transform: 360,
          fade: 360,
        },
      },
      dialog: {
        className: styles.allDialog,
        opacityDuration: 320,
        switchOpacityDuration: 420,
        style: {
          width: "min(calc(100vw - 40px), 1040px)",
          height: "min(calc(100dvh - 48px), 780px)",
        },
        header: {
          className: styles.allDialogChrome,
          style: {
            position: "absolute",
            inset: "0 0 auto 0",
            minHeight: 0,
          },
        },
        media: {
          className: styles.allDialogMedia,
          style: {
            display: "none",
          },
        },
        caption: {
          className: styles.allDialogCaption,
        },
      },
      caption: {
        layout: "overlay",
        placement: "bottom",
        height: "100%",
        className: styles.allDialogOverlay,
        style: {
          width: "100%",
          height: "100%",
          padding: 0,
          background: "#fff",
          color: "#0f1111",
          pointerEvents: "auto",
        },
        overlayCrossfadeTarget: "overlay",
        render: () => (
          <AllImagesDialogContent
            onOpenMedia={(index, event) =>
              transitionToMediaRef.current?.(index, event)
            }
          />
        ),
      },
      controls: {
        close: {
          className: styles.allDialogClose,
          render: () => <X aria-hidden="true" />,
        },
        counter: {
          enabled: false,
        },
        arrows: {
          enabled: false,
        },
      },
      slider: {
        gap: 0,
      },
    }),
    [],
  );
  const {
    fullscreenNode,
    showFullscreenModal,
    closingModal,
    transitionDialogTo,
  } = useFullscreenController({
    plugins: [fullscreenSlider(), fullscreenCaptions()],
    fullscreen,
  });

  useEffect(() => {
    transitionToMediaRef.current = (index, event) => {
      void transitionDialogTo(() => onOpenMedia(index, event));
    };

    return () => {
      transitionToMediaRef.current = null;
    };
  }, [onOpenMedia, transitionDialogTo]);

  useEffect(() => {
    if (hasRequestedOpenRef.current) return;
    hasRequestedOpenRef.current = true;

    core.openFullscreenAt({
      index: 0,
      method: "fade",
    });
  }, [core]);

  useEffect(() => {
    if (showFullscreenModal) {
      hasOpenedRef.current = true;
      return;
    }

    if (
      !hasOpenedRef.current ||
      closingModal ||
      hasNotifiedCloseRef.current
    ) {
      return;
    }

    hasNotifiedCloseRef.current = true;
    onClose();
  }, [closingModal, onClose, showFullscreenModal]);

  return <>{fullscreenNode}</>;
}

function AllImagesDialog({
  onOpenMedia,
  onClose,
}: {
  onOpenMedia: (index: number, event: Event) => void;
  onClose: () => void;
}) {
  const dialogItems = useMemo(
    () => toMediaItems([createFullscreenItem(SLIDES[0]!)]),
    [],
  );

  return (
    <GalleryCore fullscreenItems={dialogItems}>
      <AllImagesDialogController
        onOpenMedia={onOpenMedia}
        onClose={onClose}
      />
    </GalleryCore>
  );
}

function DialogDemoInner({
  allDialogOpen,
  onOpenAll,
  onCloseAll,
}: {
  allDialogOpen: boolean;
  onOpenAll: () => void;
  onCloseAll: () => void;
}) {
  const core = useGalleryCore();
  const media = useMemo(() => SLIDES, []);
  const { ref: sliderRef, ready: sliderReady } = useSliderReady();
  const handleOpenMedia = useCallback(
    (index: number, event: Event) => {
      core.openFullscreenAt({
        index,
        method: "fade",
        event,
      });
    },
    [core],
  );

  return (
    <div className={styles.demoShell}>
      <header className={styles.railHeader}>
        <button className={styles.seeAllButton} type="button" onClick={onOpenAll}>
          See all <ChevronRight aria-hidden="true" />
        </button>
      </header>
      <SliderSkeleton
        layout={{
          visibleCount: {
            xs: 1,
            sm: 2,
            lg: 3,
          },
          mode: "fit",
          layout: {
            kind: "slider",
            direction: "row",
            style: {
              gap: 14,
            },
            item: {
              kind: "stack",
              style: {
                width: "100%",
                overflow: "hidden",
                border: "1px solid #d5d9d9",
                borderRadius: 10,
                backgroundColor: "#f7f8f8",
              },
              children: [
                {
                  kind: "rect",
                  style: {
                    width: "100%",
                    aspectRatio: "4 / 3",
                    borderRadius: 0,
                    backgroundColor: "#e7ecec",
                  },
                },
                {
                  kind: "stack",
                  style: {
                    gap: 9,
                    width: "100%",
                    padding: "11px 12px 13px 12px",
                    backgroundColor: "#fff",
                  },
                  children: [
                    {
                      kind: "rect",
                      style: {
                        width: "36%",
                        height: 10,
                        borderRadius: 5,
                        marginTop: "3px",
                        backgroundColor: "#e3e6e6",
                      },
                    },
                    {
                      kind: "rect",
                      style: {
                        width: "72%",
                        height: 16,
                        borderRadius: 6,
                        backgroundColor: "#dfe4e4",
                      },
                    },
                  ],
                },
              ],
            },
          },
        }}
        ready={sliderReady}
      >
        <Slider
          ref={sliderRef}
          layout={{
            gap: 14,
            cellsPerSlide: {
              xs: 1.2,
              sm: 2.2,
              lg: 3.2,
            },
          }}
          scroll={{
            loop: false,
            groupCells: true,
            containScroll: true,
          }}
          elements={{
            viewport: {
              className: styles.railViewport,
            },
          }}
          plugins={[
            sliderFullscreen(),
            sliderRipple({ className: styles.sliderRipple }),
            sliderArrows({
              arrow: {
                className: styles.railArrow,
              },
            }),
          ]}
        >
          {media.map((item, index) => {
            const slide = SLIDES[index]!;

            return (
              <figure
                key={item.fullscreenSrc}
                className={styles.railCard}
              >
                <SlidePreview slide={slide} />
                <figcaption>
                  <span>{slide.location}</span>
                  <strong>{slide.title}</strong>
                </figcaption>
              </figure>
            );
          })}
        </Slider>
      </SliderSkeleton>
      {allDialogOpen ? (
        <AllImagesDialog onOpenMedia={handleOpenMedia} onClose={onCloseAll} />
      ) : null}
      <DialogFullscreenAddon onOpenAll={onOpenAll} />
    </div>
  );
}

export function FullscreenDialogDemo() {
  const [allDialogOpen, setAllDialogOpen] = useState(false);
  const fullscreenMedia = useMemo(
    () => toMediaItems(SLIDES.map(createFullscreenItem)),
    [],
  );

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <DialogDemoInner
        allDialogOpen={allDialogOpen}
        onOpenAll={() => setAllDialogOpen(true)}
        onCloseAll={() => setAllDialogOpen(false)}
      />
    </GalleryCore>
  );
}
