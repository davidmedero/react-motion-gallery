"use client";

import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { GalleryCore } from "../../../packages/react-motion-gallery/src/Gallery/core";
import { useFullscreenController } from "../../../packages/react-motion-gallery/src/Gallery/fullscreen";
import { Slider } from "../../../packages/react-motion-gallery/src/Gallery/slider";
import type { MediaItem } from "../../../packages/react-motion-gallery/src/Gallery/shared/types/media";

const PICSUM_IDS = [1015, 1018, 1024, 1035, 1043, 1057];
const BASE_SLIDES = PICSUM_IDS.map((id) => `https://picsum.photos/id/${id}/1200/900`);
const FULLSCREEN_ITEMS: MediaItem[] = PICSUM_IDS.map((id, index) => ({
  kind: "image",
  src: `https://picsum.photos/id/${id}/3200/2400`,
  alt: `Fullscreen slide ${index + 1}`,
  width: 3200,
  height: 2400,
}));

function createSvgDataUri(width: number, height: number, label: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f3f7fb" />
      <stop offset="100%" stop-color="#b7d8f0" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)" />
  <rect x="${width * 0.12}" y="${height * 0.14}" width="${width * 0.76}" height="${height * 0.72}" rx="${Math.max(
    24,
    Math.round(width * 0.025)
  )}" fill="#ffffff" fill-opacity="0.88" />
  <text x="50%" y="47%" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.round(
    width * 0.06
  )}" fill="#0f2740">${label}</text>
  <text x="50%" y="58%" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.round(
    width * 0.028
  )}" fill="#40627f">${width} x ${height}</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const LAZY_SLIDES = Array.from({ length: 6 }, (_, index) => ({
  base: createSvgDataUri(1200, 900, `Lazy Base ${index + 1}`),
  fullscreen: createSvgDataUri(3200, 2400, `Lazy Fullscreen ${index + 1}`),
}));
const LAZY_BASE_SLIDES = LAZY_SLIDES.map((slide) => slide.base);
const LAZY_FULLSCREEN_ITEMS: MediaItem[] = LAZY_SLIDES.map((slide, index) => ({
  kind: "image",
  src: slide.fullscreen,
  alt: `Lazy fullscreen slide ${index + 1}`,
  width: 3200,
  height: 2400,
}));

type WrappedImageProps = {
  src: string;
  alt: string;
  className: string;
  style: React.CSSProperties;
  frameTestId: string;
  imgTestId: string;
};

function WrappedImage(props: WrappedImageProps) {
  const { src, alt, className, style, frameTestId, imgTestId } = props;

  return (
    <div
      data-testid={frameTestId}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        data-testid={imgTestId}
        src={src}
        alt={alt}
        className={className}
        draggable="false"
        style={{
          ...style,
          position: "static",
          width: "auto",
          height: "auto",
          display: "block",
        }}
      />
    </div>
  );
}

type DelayedWrappedImageProps = WrappedImageProps & {
  delayMs?: number;
};

function DelayedWrappedImage(props: DelayedWrappedImageProps) {
  const { delayMs = 150, ...rest } = props;
  const [showImage, setShowImage] = React.useState(false);

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setShowImage(true);
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [delayMs, rest.src]);

  return (
    <div
      data-testid={rest.frameTestId}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {showImage ? (
        <img
          data-testid={rest.imgTestId}
          src={rest.src}
          alt={rest.alt}
          className={rest.className}
          draggable="false"
          style={{
            ...rest.style,
            position: "static",
            width: "auto",
            height: "auto",
            display: "block",
          }}
        />
      ) : (
        <div
          data-testid={`${rest.imgTestId}-placeholder`}
          style={{
            width: "min(62vw, 540px)",
            aspectRatio: "4 / 3",
            borderRadius: 12,
            background:
              "linear-gradient(135deg, rgba(243,247,251,0.75), rgba(183,216,240,0.55))",
          }}
        />
      )}
    </div>
  );
}

type SliderConfig = {
  align: "center";
  direction: { dir: "ltr" };
};

type ImageRenderArgs = {
  item: Extract<MediaItem, { kind: "image" }>;
  className: string;
  baseStyle: React.CSSProperties;
};

function FullscreenAddon(props: {
  sliderObject: SliderConfig;
  cellsStateLength: number;
  lazyEnabled?: boolean;
  renderImage: (args: ImageRenderArgs) => React.ReactNode;
}) {
  const { sliderObject, cellsStateLength, lazyEnabled = false, renderImage } = props;

  const { fullscreenNode } = useFullscreenController({
    fullscreen: {
      enabled: true,
      lazyLoad: lazyEnabled
        ? {
            images: {
              enabled: true,
            },
          }
        : undefined,
      renderImage: ({ item, className, baseStyle }) =>
        renderImage({ item, className, baseStyle }),
    },
    slider: undefined,
    sliderObject,
    cellsStateLength,
  });

  return <>{fullscreenNode}</>;
}

function WrappedDemo() {
  const sliderObject = React.useMemo<SliderConfig>(
    () => ({
      align: "center",
      direction: { dir: "ltr" },
    }),
    []
  );

  return (
    <div style={{ padding: 24 }}>
      <h3 style={{ margin: "0 0 12px" }}>Wrapped fullscreen renderImage</h3>
      <p style={{ margin: "0 0 16px", opacity: 0.8 }}>
        Open fullscreen, click the wrapped image to zoom, then pan with the wheel and close.
      </p>

      <GalleryCore layout="slider" fullscreenItems={FULLSCREEN_ITEMS}>
        <Slider>
          {BASE_SLIDES.map((src, index) => (
            <img
              key={src}
              src={src}
              alt={`Base slide ${index + 1}`}
              style={{
                width: "min(70vw, 760px)",
                aspectRatio: "4 / 3",
                objectFit: "cover",
                display: "block",
                borderRadius: 12,
              }}
            />
          ))}
        </Slider>

        <FullscreenAddon
          sliderObject={sliderObject}
          cellsStateLength={FULLSCREEN_ITEMS.length}
          renderImage={({ item, className, baseStyle }) => (
            <WrappedImage
              src={item.src}
              alt={item.alt ?? ""}
              className={className}
              style={baseStyle}
              frameTestId="mock-next-image-frame"
              imgTestId="mock-next-image-img"
            />
          )}
        />
      </GalleryCore>
    </div>
  );
}

function LazyWrappedDemo(props: { delayMs?: number }) {
  const { delayMs = 150 } = props;
  const sliderObject = React.useMemo<SliderConfig>(
    () => ({
      align: "center",
      direction: { dir: "ltr" },
    }),
    []
  );

  return (
    <div style={{ padding: 24 }}>
      <h3 style={{ margin: "0 0 12px" }}>Lazy wrapped fullscreen renderImage</h3>
      <p style={{ margin: "0 0 16px", opacity: 0.8 }}>
        Open fullscreen to verify the built-in spinner waits for a delayed wrapped image.
      </p>

      <GalleryCore layout="slider" fullscreenItems={LAZY_FULLSCREEN_ITEMS}>
        <Slider>
          {LAZY_BASE_SLIDES.map((src, index) => (
            <img
              key={src}
              src={src}
              alt={`Lazy base slide ${index + 1}`}
              style={{
                width: "min(70vw, 760px)",
                aspectRatio: "4 / 3",
                objectFit: "cover",
                display: "block",
                borderRadius: 12,
              }}
            />
          ))}
        </Slider>

        <FullscreenAddon
          sliderObject={sliderObject}
          cellsStateLength={LAZY_FULLSCREEN_ITEMS.length}
          lazyEnabled
          renderImage={({ item, className, baseStyle }) => (
            <DelayedWrappedImage
              src={item.src}
              alt={item.alt ?? ""}
              className={className}
              style={baseStyle}
              frameTestId="delayed-next-image-frame"
              imgTestId="delayed-next-image-img"
              delayMs={delayMs}
            />
          )}
        />
      </GalleryCore>
    </div>
  );
}

const meta: Meta<typeof WrappedDemo> = {
  title: "RMG/Tests/Fullscreen renderImage wrapped img",
  component: WrappedDemo,
  parameters: { layout: "fullscreen" },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const WrappedImgStillZoomsPansAndCloses: Story = {
  render: () => <WrappedDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const doc = canvasElement.ownerDocument;

    await userEvent.click(await canvas.findByRole("img", { name: "Base slide 1" }));

    let frame: HTMLDivElement | null = null;
    let wrappedImg: HTMLImageElement | null = null;
    await waitFor(() => {
      frame = doc.body.querySelector<HTMLDivElement>('[data-testid="mock-next-image-frame"]');
      wrappedImg = doc.body.querySelector<HTMLImageElement>('[data-testid="mock-next-image-img"]');
      expect(frame).not.toBeNull();
      expect(wrappedImg).not.toBeNull();
      expect(doc.body.querySelector('[data-rmg-image-spinner]')).toBeNull();
    });

    const liveFrame = frame!;
    const liveImg = wrappedImg!;
    expect(liveImg.getAttribute("data-index")).toBeNull();
    expect(liveFrame.style.transform).toBe("");

    const initialTransform = liveImg.style.transform;
    await userEvent.click(liveImg);

    let zoomTransform = initialTransform;
    await waitFor(() => {
      const zoomedImg = doc.body.querySelector<HTMLImageElement>('[data-testid="mock-next-image-img"]');
      expect(zoomedImg).not.toBeNull();
      zoomTransform = zoomedImg!.style.transform;
      expect(zoomTransform).not.toBe(initialTransform);
      expect(liveFrame.style.transform).toBe("");
    });

    liveImg.dispatchEvent(
      new WheelEvent("wheel", {
        bubbles: true,
        cancelable: true,
        deltaX: -80,
        deltaY: 48,
      })
    );

    await waitFor(() => {
      const pannedImg = doc.body.querySelector<HTMLImageElement>('[data-testid="mock-next-image-img"]');
      expect(pannedImg).not.toBeNull();
      expect(pannedImg!.style.transform).not.toBe(zoomTransform);
      expect(liveFrame.style.transform).toBe("");
    });

    await userEvent.click(
      await within(doc.body).findByRole("button", { name: "Close" })
    );

    await waitFor(() => {
      expect(
        doc.body.querySelector('[data-testid="mock-next-image-img"]')
      ).toBeNull();
      expect(doc.body.querySelector('[data-rmg-fs-slide="true"]')).toBeNull();
    });
  },
};

export const WrappedImgLazyShowsSpinnerThenZoomsAndCloses: Story = {
  render: () => <LazyWrappedDemo delayMs={150} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const doc = canvasElement.ownerDocument;

    await userEvent.click(await canvas.findByRole("img", { name: "Lazy base slide 1" }));

    let frame: HTMLDivElement | null = null;
    let spinner: HTMLDivElement | null = null;
    await waitFor(() => {
      frame = doc.body.querySelector<HTMLDivElement>('[data-testid="delayed-next-image-frame"]');
      spinner = doc.body.querySelector<HTMLDivElement>('[data-rmg-image-spinner]');
      expect(frame).not.toBeNull();
      expect(spinner).not.toBeNull();
      expect(spinner!.style.visibility).toBe("visible");
    });

    expect(
      doc.body.querySelector('[data-testid="delayed-next-image-img"]')
    ).toBeNull();

    let wrappedImg: HTMLImageElement | null = null;
    await waitFor(() => {
      wrappedImg = doc.body.querySelector<HTMLImageElement>('[data-testid="delayed-next-image-img"]');
      expect(wrappedImg).not.toBeNull();
      expect(spinner!.style.visibility).toBe("hidden");
    });

    const liveFrame = frame!;
    const liveImg = wrappedImg!;
    expect(liveImg.getAttribute("data-index")).toBeNull();
    expect(liveFrame.style.transform).toBe("");

    const initialTransform = liveImg.style.transform;
    await userEvent.click(liveImg);

    let zoomTransform = initialTransform;
    await waitFor(() => {
      const zoomedImg = doc.body.querySelector<HTMLImageElement>('[data-testid="delayed-next-image-img"]');
      expect(zoomedImg).not.toBeNull();
      zoomTransform = zoomedImg!.style.transform;
      expect(zoomTransform).not.toBe(initialTransform);
      expect(liveFrame.style.transform).toBe("");
    });

    await userEvent.click(
      await within(doc.body).findByRole("button", { name: "Close" })
    );

    await waitFor(() => {
      expect(
        doc.body.querySelector('[data-testid="delayed-next-image-img"]')
      ).toBeNull();
      expect(doc.body.querySelector('[data-rmg-fs-slide="true"]')).toBeNull();
    });
  },
};

export const WrappedImgLazyClosesBeforeReveal: Story = {
  render: () => <LazyWrappedDemo delayMs={800} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const doc = canvasElement.ownerDocument;

    await userEvent.click(await canvas.findByRole("img", { name: "Lazy base slide 1" }));

    let spinner: HTMLDivElement | null = null;
    await waitFor(() => {
      spinner = doc.body.querySelector<HTMLDivElement>('[data-rmg-image-spinner]');
      expect(spinner).not.toBeNull();
      expect(spinner!.style.visibility).toBe("visible");
    });

    await userEvent.click(
      await within(doc.body).findByRole("button", { name: "Close" })
    );

    await waitFor(() => {
      expect(
        doc.body.querySelector('[data-testid="delayed-next-image-img"]')
      ).toBeNull();
      expect(
        doc.body.querySelector('[data-testid="delayed-next-image-frame"]')
      ).toBeNull();
      expect(doc.body.querySelector('[data-rmg-fs-slide="true"]')).toBeNull();
    });
  },
};
