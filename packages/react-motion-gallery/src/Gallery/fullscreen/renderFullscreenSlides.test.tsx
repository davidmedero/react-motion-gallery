import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";

import type { VideoSnapshotStore } from "../video/videoSnapshotStore";
import {
  buildFullscreenCaptionZoomMotion,
  resolveFullscreenCaptionZoomSettings,
} from "./captionZoomMotion";
import {
  renderFullscreenSlides,
  renderFullscreenCrossfadeSlides,
  shouldUseFsStaticVideoPreview,
} from "./renderFullscreenSlides";

function createEmptyVideoSnapshotStore(): VideoSnapshotStore {
  return {
    registerOriginal: () => undefined,
    unregisterOriginal: () => undefined,
    getSnapshot: () => null,
    subscribe: () => () => undefined,
    reset: () => undefined,
    destroy: () => undefined,
  };
}

describe("fullscreen crossfade slide rendering", () => {
  test("marks crossfade slide layers as inert fullscreen slides", () => {
    const slides = renderFullscreenCrossfadeSlides({
      items: [{ kind: "image", src: "https://example.com/alpha.jpg", alt: "Alpha" } as any],
      plyrList: [],
      getTransform: () => "translateX(0%)",
      imageRefs: { current: [React.createRef<HTMLDivElement>()] },
      playerRefs: { current: [] },
      cells: { current: [] },
      isZoomed: false,
      showFullscreenSlider: true,
      defaultPlayerStyle: {},
      onPanPointerDown: () => undefined,
      onSuppressNextClickCapture: () => undefined,
      resolveFsCaptionPlacement: () => null,
      styles: {
        imgMargin: "imgMargin",
        fullscreenImages: "fullscreenImages",
      },
      fsDecodedImagesRef: { current: new Set() },
      fsCustomDecodedImagesRef: { current: new Set() },
      fsCustomResolvedSrcByKeyRef: { current: new Map() },
      fsPreparedVideosRef: { current: new Set() },
      getMediaKey: (item) => String((item as any).src ?? ""),
    });

    const markup = renderToStaticMarkup(<>{slides}</>);

    expect(markup).toContain('data-rmg-fs-render-mode="crossfade"');
    expect(markup).toContain('data-rmg-clone="false"');
  });

  test("uses static video previews for crossfade slides instead of live players", () => {
    expect(
      shouldUseFsStaticVideoPreview({
        isClone: false,
        renderMode: "crossfade",
      })
    ).toBe(true);

    const slides = renderFullscreenCrossfadeSlides({
      items: [{ kind: "video", src: "https://example.com/alpha.mp4" } as any],
      plyrList: [
        {
          source: {
            type: "video",
            sources: [{ src: "https://example.com/alpha.mp4", type: "video/mp4" }],
          },
          options: {},
        } as any,
      ],
      getTransform: () => "translateX(0%)",
      imageRefs: { current: [React.createRef<HTMLDivElement>()] },
      playerRefs: { current: [] },
      cells: { current: [] },
      isZoomed: false,
      showFullscreenSlider: true,
      defaultPlayerStyle: {},
      onPanPointerDown: () => undefined,
      onSuppressNextClickCapture: () => undefined,
      resolveFsCaptionPlacement: () => null,
      styles: {
        imgMargin: "imgMargin",
        fullscreenImages: "fullscreenImages",
      },
      fsDecodedImagesRef: { current: new Set() },
      fsCustomDecodedImagesRef: { current: new Set() },
      fsCustomResolvedSrcByKeyRef: { current: new Map() },
      fsPreparedVideosRef: { current: new Set() },
      videoSnapshotStore: createEmptyVideoSnapshotStore(),
      getMediaKey: (item) => String((item as any).src ?? ""),
    });

    const markup = renderToStaticMarkup(<>{slides}</>);

    expect(markup).toContain('data-rmg-fs-render-mode="crossfade"');
    expect(markup).toContain('data-rmg-video-snapshot="true"');
  });

  test("applies caption zoom fade styles to slide captions", () => {
    const renderCaption = vi.fn(({ index, isZoomed }: { index: number; isZoomed: boolean }) => (
      <span>{`${index}-${String(isZoomed)}`}</span>
    ));
    const captionZoomMotion = buildFullscreenCaptionZoomMotion({
      phase: "hiding",
      isZoomed: true,
      settings: resolveFullscreenCaptionZoomSettings({
        zoomInTransform: "translateY(14px)",
      }),
    });

    const slides = renderFullscreenSlides({
      items: [{ kind: "image", src: "https://example.com/alpha.jpg", alt: "Alpha" } as any],
      plyrList: [],
      getTransform: () => "translateX(0%)",
      imageRefs: { current: [React.createRef<HTMLDivElement>()] },
      playerRefs: { current: [] },
      cells: { current: [] },
      isZoomed: true,
      showFullscreenSlider: true,
      defaultPlayerStyle: {},
      onPanPointerDown: () => undefined,
      onSuppressNextClickCapture: () => undefined,
      renderCaption,
      captionZoomMotion,
      fsCaptionLayout: "slide",
      resolveFsCaptionPlacement: () => "bottom",
      styles: {
        imgMargin: "imgMargin",
        fullscreenImages: "fullscreenImages",
      },
      fsDecodedImagesRef: { current: new Set() },
      fsCustomDecodedImagesRef: { current: new Set() },
      fsCustomResolvedSrcByKeyRef: { current: new Map() },
      fsPreparedVideosRef: { current: new Set() },
      getMediaKey: (item) => String((item as any).src ?? ""),
    });

    const markup = renderToStaticMarkup(<>{slides}</>);

    expect(renderCaption).toHaveBeenCalledWith(
      expect.objectContaining({
        index: 0,
        isZoomed: true,
      })
    );
    expect(markup).toContain('data-rmg-fs-caption="true"');
    expect(markup).toContain('data-rmg-fs-caption-content="true"');
    expect(markup).toContain("opacity:0");
    expect(markup).toContain("translateY(14px)");
    expect(markup).toContain("pointer-events:none");
  });

  test("resolves viewport-relative caption widths for slide layouts", () => {
    const slides = renderFullscreenSlides({
      items: [{ kind: "image", src: "https://example.com/alpha.jpg", alt: "Alpha" } as any],
      plyrList: [],
      getTransform: () => "translateX(0%)",
      imageRefs: { current: [React.createRef<HTMLDivElement>()] },
      playerRefs: { current: [] },
      cells: { current: [] },
      isZoomed: false,
      showFullscreenSlider: true,
      defaultPlayerStyle: {},
      onPanPointerDown: () => undefined,
      onSuppressNextClickCapture: () => undefined,
      renderCaption: () => <span>Caption</span>,
      fsCaptionLayout: "slide",
      fsCaptionWidth: "50%",
      viewportWidth: 1440,
      viewportHeight: 900,
      resolveFsCaptionPlacement: () => "right",
      styles: {
        imgMargin: "imgMargin",
        fullscreenImages: "fullscreenImages",
      },
      fsDecodedImagesRef: { current: new Set() },
      fsCustomDecodedImagesRef: { current: new Set() },
      fsCustomResolvedSrcByKeyRef: { current: new Map() },
      fsPreparedVideosRef: { current: new Set() },
      getMediaKey: (item) => String((item as any).src ?? ""),
    });

    const markup = renderToStaticMarkup(<>{slides}</>);

    expect(markup).toContain('data-rmg-fs-media-viewport="true"');
    expect(markup).toContain("flex:0 0 720px");
    expect(markup).toContain("width:720px");
    expect(markup).toContain("width:calc(100% - 720px)");
  });

  test("resolves viewport-relative caption heights for slide layouts", () => {
    const slides = renderFullscreenSlides({
      items: [{ kind: "image", src: "https://example.com/alpha.jpg", alt: "Alpha" } as any],
      plyrList: [],
      getTransform: () => "translateX(0%)",
      imageRefs: { current: [React.createRef<HTMLDivElement>()] },
      playerRefs: { current: [] },
      cells: { current: [] },
      isZoomed: false,
      showFullscreenSlider: true,
      defaultPlayerStyle: {},
      onPanPointerDown: () => undefined,
      onSuppressNextClickCapture: () => undefined,
      renderCaption: () => <span>Caption</span>,
      fsCaptionLayout: "slide",
      fsCaptionHeight: "25%",
      viewportWidth: 1440,
      viewportHeight: 900,
      resolveFsCaptionPlacement: () => "bottom",
      styles: {
        imgMargin: "imgMargin",
        fullscreenImages: "fullscreenImages",
      },
      fsDecodedImagesRef: { current: new Set() },
      fsCustomDecodedImagesRef: { current: new Set() },
      fsCustomResolvedSrcByKeyRef: { current: new Map() },
      fsPreparedVideosRef: { current: new Set() },
      getMediaKey: (item) => String((item as any).src ?? ""),
    });

    const markup = renderToStaticMarkup(<>{slides}</>);

    expect(markup).toContain('data-rmg-fs-media-viewport="true"');
    expect(markup).toContain("height:225px");
    expect(markup).toContain("height:calc(100% - 225px)");
  });

  test("reserves media width for entries overlays with explicit side widths", () => {
    const slides = renderFullscreenSlides({
      items: [{ kind: "image", src: "https://example.com/alpha.jpg", alt: "Alpha" } as any],
      plyrList: [],
      getTransform: () => "translateX(0%)",
      imageRefs: { current: [React.createRef<HTMLDivElement>()] },
      playerRefs: { current: [] },
      cells: { current: [] },
      isZoomed: false,
      showFullscreenSlider: true,
      defaultPlayerStyle: {},
      onPanPointerDown: () => undefined,
      onSuppressNextClickCapture: () => undefined,
      fsViewportOverlayPlacement: "right",
      fsViewportOverlayWidth: "50%",
      viewportWidth: 1440,
      viewportHeight: 900,
      resolveFsCaptionPlacement: () => "right",
      styles: {
        imgMargin: "imgMargin",
        fullscreenImages: "fullscreenImages",
      },
      fsDecodedImagesRef: { current: new Set() },
      fsCustomDecodedImagesRef: { current: new Set() },
      fsCustomResolvedSrcByKeyRef: { current: new Map() },
      fsPreparedVideosRef: { current: new Set() },
      getMediaKey: (item) => String((item as any).src ?? ""),
    });

    const markup = renderToStaticMarkup(<>{slides}</>);

    expect(markup).toContain('data-rmg-fs-media-viewport="true"');
    expect(markup).toContain("flex-direction:row");
    expect(markup).toContain("flex:0 0 720px");
    expect(markup).toContain("width:calc(100% - 720px)");
  });

  test("reserves media height for entries overlays with explicit top and bottom heights", () => {
    const slides = renderFullscreenSlides({
      items: [{ kind: "image", src: "https://example.com/alpha.jpg", alt: "Alpha" } as any],
      plyrList: [],
      getTransform: () => "translateX(0%)",
      imageRefs: { current: [React.createRef<HTMLDivElement>()] },
      playerRefs: { current: [] },
      cells: { current: [] },
      isZoomed: false,
      showFullscreenSlider: true,
      defaultPlayerStyle: {},
      onPanPointerDown: () => undefined,
      onSuppressNextClickCapture: () => undefined,
      fsViewportOverlayPlacement: "bottom",
      fsViewportOverlayHeight: "25%",
      viewportWidth: 1440,
      viewportHeight: 900,
      resolveFsCaptionPlacement: () => "bottom",
      styles: {
        imgMargin: "imgMargin",
        fullscreenImages: "fullscreenImages",
      },
      fsDecodedImagesRef: { current: new Set() },
      fsCustomDecodedImagesRef: { current: new Set() },
      fsCustomResolvedSrcByKeyRef: { current: new Map() },
      fsPreparedVideosRef: { current: new Set() },
      getMediaKey: (item) => String((item as any).src ?? ""),
    });

    const markup = renderToStaticMarkup(<>{slides}</>);

    expect(markup).toContain('data-rmg-fs-media-viewport="true"');
    expect(markup).toContain("flex-direction:column");
    expect(markup).toContain("height:calc(100% - 225px)");
  });
});
